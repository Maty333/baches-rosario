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


