import { validationResult } from 'express-validator'
import Bache from '../models/Bache.js'

export const getBaches = async (req, res) => {
  try {
    const { estado, lat, lng, radio } = req.query
    let query = {}

    // Solo mostrar baches aprobados (o sin campo por compatibilidad con datos existentes)
    query.$or = [
      { estadoModeracion: 'aprobado' },
      { estadoModeracion: { $exists: false } }
    ]

    // Filtro por estado
    if (estado) {
      query.estado = estado
    }

    // Filtro geográfico (radio en km)
    if (lat && lng && radio) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)
      const radioNum = parseFloat(radio)

      // Búsqueda aproximada por rango (simplificada)
      query['ubicacion.lat'] = {
        $gte: latNum - radioNum / 111,
        $lte: latNum + radioNum / 111
      }
      query['ubicacion.lng'] = {
        $gte: lngNum - radioNum / 111,
        $lte: lngNum + radioNum / 111
      }
    }

    const baches = await Bache.find(query)
      .populate('reportadoPor', 'nombre email')
      .sort({ fechaReporte: -1 })

    res.json(baches)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBacheById = async (req, res) => {
  try {
    const bache = await Bache.findById(req.params.id)
      .populate('reportadoPor', 'nombre email')
      .populate('votos.usuario', 'nombre')

    if (!bache) {
      return res.status(404).json({ message: 'Bache no encontrado' })
    }

    // Si no está aprobado, solo el autor o un admin puede verlo
    const estaAprobado =
      bache.estadoModeracion === 'aprobado' || bache.estadoModeracion == null
    if (!estaAprobado) {
      const reportadoPorId =
        bache.reportadoPor?._id?.toString() || bache.reportadoPor?.toString()
      const esAutor = req.user && reportadoPorId === req.user.id
      const esAdmin = req.user?.rol === 'admin'
      if (!esAutor && !esAdmin) {
        return res.status(404).json({ message: 'Bache no encontrado' })
      }
    }

    res.json(bache)
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (
      error.name === 'CastError' ||
      error.message.includes('Cast to ObjectId')
    ) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const createBache = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { titulo, descripcion, ubicacion, posicion } = req.body

    const imagenes = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : []

    if (imagenes.length < 2) {
      return res.status(400).json({ message: 'Se requieren mínimo 2 imágenes' })
    }

    const bache = new Bache({
      titulo,
      descripcion,
      ubicacion: {
        lat: parseFloat(ubicacion.lat),
        lng: parseFloat(ubicacion.lng),
        direccion: ubicacion.direccion
      },
      imagenes,
      posicion,
      estadoModeracion: 'pendiente',
      reportadoPor: req.user.id
    })

    await bache.save()
    await bache.populate('reportadoPor', 'nombre email')

    // No emitir a público hasta que un admin apruebe
    // req.io.emit("nuevoBache", bache);

    res.status(201).json(bache)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBache = async (req, res) => {
  try {
    const bache = await Bache.findById(req.params.id)

    if (!bache) {
      return res.status(404).json({ message: 'Bache no encontrado' })
    }

    // Solo el autor o admin puede actualizar
    if (
      bache.reportadoPor.toString() !== req.user.id &&
      req.user.rol !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para actualizar este bache' })
    }

    const { titulo, descripcion, ubicacion } = req.body

    if (titulo) bache.titulo = titulo
    if (descripcion) bache.descripcion = descripcion
    if (ubicacion) {
      bache.ubicacion = {
        lat: parseFloat(ubicacion.lat),
        lng: parseFloat(ubicacion.lng),
        direccion: ubicacion.direccion
      }
    }

    // Agregar nuevas imágenes si hay
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(file => `/uploads/${file.filename}`)
      bache.imagenes = [...bache.imagenes, ...nuevasImagenes]
    }

    await bache.save()
    await bache.populate('reportadoPor', 'nombre email')

    res.json(bache)
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (
      error.name === 'CastError' ||
      error.message.includes('Cast to ObjectId')
    ) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body
    const bache = await Bache.findById(req.params.id)

    if (!bache) {
      return res.status(404).json({ message: 'Bache no encontrado' })
    }

    const esAdmin = req.user.rol === 'admin'
    const esAutor = bache.reportadoPor.toString() === req.user.id

    // permisos: admin siempre, autor sólo si adjunta imágenes como prueba
    if (!esAdmin) {
      if (!esAutor) {
        return res
          .status(403)
          .json({ message: 'No tienes permiso para cambiar el estado' })
      }
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({
            message: 'Se requieren imágenes de prueba para cambiar el estado'
          })
      }
    }

    // si se envían archivos (sea admin o autor) los agregamos al arreglo de imágenes
    if (req.files && req.files.length > 0) {
      const nuevas = req.files.map(file => `/uploads/${file.filename}`)
      bache.imagenes = [...bache.imagenes, ...nuevas]
    }

    const estadoAnterior = bache.estado
    bache.estado = estado

    // Si se marca como solucionado, calcular tiempo de solución
    if (estado === 'solucionado' && estadoAnterior !== 'solucionado') {
      bache.fechaSolucion = new Date()
      const tiempoMs = bache.fechaSolucion - bache.fechaReporte
      bache.tiempoSolucion = Math.ceil(tiempoMs / (1000 * 60 * 60 * 24)) // días
    }

    await bache.save()
    await bache.populate('reportadoPor', 'nombre email')

    // Emitir notificación
    req.io.emit('bacheActualizado', {
      id: bache._id,
      estado: bache.estado,
      tiempoSolucion: bache.tiempoSolucion
    })

    res.json(bache)
  } catch (error) {
    // Manejar errores de ObjectId inválido
    if (
      error.name === 'CastError' ||
      error.message.includes('Cast to ObjectId')
    ) {
      return res.status(400).json({ message: 'ID inválido' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const votarBache = async (req, res) => {
  try {
    const bache = await Bache.findById(req.params.id)

    if (!bache) {
      return res.status(404).json({ message: 'Bache no encontrado' })
    }

    // Verificar si ya votó
    const yaVoto = bache.votos.some(
      voto => voto.usuario.toString() === req.user.id
    )

    if (yaVoto) {
      // Quitar voto
      bache.votos = bache.votos.filter(
        voto => voto.usuario.toString() !== req.user.id
      )
    } else {
      // Agregar voto
      bache.votos.push({
        usuario: req.user.id,
        fecha: new Date()
      })
    }

    await bache.save()

    res.json({
      votado: !yaVoto,
      totalVotos: bache.votos.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
