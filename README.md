# 🛣️ Baches Rosario — Plataforma de Reporte Ciudadano

🌐 **Demo en vivo:** Próximamente desplegado en producción.

Aplicación web full-stack para el reporte, gestión y priorización de baches en la ciudad de Rosario, Argentina.  
Permite a ciudadanos informar incidencias en la vía pública y a administradores gestionarlas en tiempo real.

Proyecto enfocado en arquitectura moderna, interacción con mapas, tiempo real y gestión de usuarios.

---

## 🏗️ Arquitectura del Proyecto

baches-rosario/
├── backend/ # API REST + WebSockets
└── frontend/ # SPA React



**Arquitectura:**  
SPA (React) + API REST (Node/Express) + MongoDB + WebSockets (Socket.io)

---

## ⚙️ Stack Tecnológico

### 🔙 Backend
- Node.js  
- Express  
- MongoDB + Mongoose  
- JWT Authentication  
- Multer (subida de imágenes)  
- Socket.io (eventos en tiempo real)

---

### 🔜 Frontend
- React 19 + Vite  
- React Router  
- Leaflet (mapas interactivos)  
- React Hook Form  
- Axios  
- Socket.io Client  

---

## 🚀 Funcionalidades Principales

### 👤 Usuarios
- Registro e inicio de sesión con JWT  
- Perfil de usuario  
- Historial de reportes  

### 🕳️ Reporte de Baches
- Selección de ubicación en mapa interactivo  
- Subida de múltiples imágenes  
- Descripción del problema  
- Sistema de votos para priorización  

### 💬 Interacción
- Comentarios en cada bache  
- Notificaciones en tiempo real  

### 🛠️ Panel de Administración
- Moderación de reportes  
- Gestión de usuarios  
- Cambio de estados (también los autores pueden modificar sus propios baches con pruebas) (admins y autores con pruebas fotográficas)  
- Estadísticas del sistema  
- Tiempo promedio de resolución  

---

## 📌 Estados de los Baches

| Estado       | Descripción                     |
|-------------|---------------------------------|
| Reportado   | Incidencia recién informada     |
| En Proceso  | En reparación                   |
| Solucionado | Problema resuelto               |

---

## 🔔 Tiempo Real

El sistema utiliza WebSockets para:
- Actualización de nuevos reportes  
- Cambios de estado  
- Interacciones en vivo  

---

## 🧠 Conceptos Aplicados
- Arquitectura cliente-servidor  
- Autenticación y autorización  
- CRUD completo  
- Manejo de archivos  
- Geolocalización  
- Estados de negocio  
- Panel administrativo  
- Paginación y filtros  
- Comunicación en tiempo real  

---

## 🔐 Variables de Entorno

Copiá `backend/.env.example` a `backend/.env` y ajustá valores. El **puerto por defecto del API es 3001** (alineado con el frontend).

Variables principales del backend:

PORT=3001
MONGODB_URI=mongodb://localhost:27017/baches-rosario
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

Opcional: `frontend/.env.example` → `frontend/.env` si querés sobreescribir `VITE_API_URL` / `VITE_SOCKET_URL`.


---

## 🛠️ Instalación Local

### Backend

cd backend
npm install
npm run dev

---

### Frontend

cd frontend
npm install
npm run dev


---

## 🔮 Mejoras Futuras
- Pulir OAuth Google (flujo ya integrado en código)  
- Notificaciones push  
- Aplicación móvil  
- Moderación automática con IA  
- Dashboard con gráficos avanzados  

---

## 📄 Propósito del Proyecto

Proyecto full-stack desarrollado para simular un sistema real de gestión de incidencias urbanas, aplicando arquitectura moderna y buenas prácticas de ingeniería.

---

## 🧪 Estado del Proyecto

Proyecto en desarrollo. Algunas funcionalidades pueden estar en mejora continua.

