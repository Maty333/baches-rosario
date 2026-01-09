# Baches Rosario - Aplicación de Reporte de Baches

Aplicación web para reportar y gestionar baches en la ciudad de Rosario, Argentina.

## Estructura del Proyecto

```
baches-rosario/
├── backend/          # API Node.js + Express
└── frontend/         # Aplicación React + Vite
```

## Tecnologías

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (notificaciones en tiempo real)
- JWT (autenticación)
- Multer (subida de archivos)

### Frontend
- React 19
- Vite
- React Router
- Leaflet (mapas)
- Socket.io Client
- React Hook Form
- Axios

## Instalación

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/baches-rosario
JWT_SECRET=tu_secret_key_super_segura_aqui
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Asegurarse de que MongoDB esté corriendo

5. Iniciar el servidor:
```bash
npm run dev
```

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Funcionalidades

- ✅ Registro e inicio de sesión de usuarios
- ✅ Reporte de baches con ubicación en mapa
- ✅ Subida de múltiples imágenes por bache
- ✅ Visualización de baches en mapa interactivo
- ✅ Sistema de votos para priorizar baches
- ✅ Comentarios en cada bache
- ✅ Panel de administración
- ✅ Notificaciones en tiempo real (Socket.io)
- ✅ Filtros por estado de bache
- ✅ Seguimiento de tiempo de solución

## Estados de Bache

- **Reportado**: Bache recién reportado
- **En Proceso**: Bache siendo trabajado
- **Solucionado**: Bache reparado

## Usuarios Administradores

Para crear un usuario administrador, puedes hacerlo directamente en MongoDB o agregar un script de inicialización.

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Baches
- `GET /api/baches` - Listar baches
- `GET /api/baches/:id` - Detalle de bache
- `POST /api/baches` - Crear bache (requiere auth)
- `PUT /api/baches/:id` - Actualizar bache
- `PATCH /api/baches/:id/estado` - Cambiar estado (admin)
- `POST /api/baches/:id/votar` - Votar bache

### Comentarios
- `GET /api/baches/:id/comments` - Comentarios de un bache
- `POST /api/baches/:id/comments` - Agregar comentario

### Admin
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/baches` - Todos los baches con filtros

## Notas

- Las imágenes se guardan en `backend/uploads/`
- El mapa usa OpenStreetMap (gratuito)
- Las notificaciones se envían en tiempo real cuando un bache cambia de estado

