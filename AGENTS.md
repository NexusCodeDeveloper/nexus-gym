# NexusSaas - SaaS de gestión gimnasios

## Stack
- **Backend:** Node.js, Express 5, Mongoose, MongoDB Atlas
- **Frontend:** React 19, Vite 8, Tailwind CSS, react-router-dom 7, Componentes UI genéricos (botones, inputs, modales, tarjetas de gimnasio) deben ser abstraídos en componentes reutilizables dentro de 'components/ui/' para mantener las vistas ('pages/') limpias de exceso de clases utility
- **Auth:** JWT en cookies HTTP-only, bcryptjs
- **Forms:** react-hook-form + Zod
- **Notificaciones:** SweetAlert2
- **Docker:** node:20-alpine, Docker Compose

## Roles
- `superAdmin` → gestiona admins (gimnasios)
- `admin` → dueño del gym, gestiona profesores y alumnos
- `profesor` → crea rutinas para alumnos
- `alumno` → ve rutinas y perfil

## Convenciones
- **Código en inglés**: variables, funciones, comentarios — todo en inglés. Código profesional y escalable como si lo hiciera un senior
- Tema oscuro en Tailwind
- ES Modules (`import`/`export`)
- camelCase para variables, funciones y archivos (ej: `authController.js`)
- Componentes React: `const MiComponente = () => {}` (arrow functions) con `export default`
- Componentes: carpeta con `index.jsx` (no archivo suelto)
- Rutas REST en `backend/src/routes/`, lógica en `controllers/`
- Modelos con Mongoose en `models/`
- Frontend: componentes en `components/`, páginas en `pages/`
- Variables de entorno en `.env` (no subir a git)
- Manejo de errores: try/catch en cada controller (sin middleware global)
- Respuesta API: `{ message, data }` (objeto con message y data)
- asincronía: async/await siempre, nunca .then()
- Fechas: Date nativo (sin librerías externas)
- Tailwind: solo clases utility, sin @apply
- Zod schemas en archivos separados (no inline)
- Alertas/modales: siempre SweetAlert2, nunca alert/confirm/prompt nativos
- Imports ordenados: librerías externas primero, luego componentes propios, luego estilos
- JSDoc solo en funciones clave (APIs, exports públicos), no en todo.
- La UI debe ser estrictamente moderna, minimalista y estética. Priorizar el uso de buen espaciado (whitespace), bordes sutiles, y una jerarquía visual clara dentro del tema oscuro. Evitar diseños sobrecargados o componentes visualmente pesados.
-El código y la arquitectura deben reflejar los estándares de un producto de NexusCode: limpio, modular y preparado para escalar a nivel comercial.
-Al manejar fechas con Date nativo, contemplar siempre que el sistema operará principalmente con la zona horaria GMT-3 (Argentina). Evitar desfasajes de días al guardar rutinas o turnos en la base de datos.

## Reglas importantes
1. No modificar `.env` ni archivos de configuración de Docker sin preguntar
2. El archivo .env usa `TOKEN_SECRET`, pero el código referencia `JWT_SECRET` (hay fallback)
3. No instalar nuevas dependencias sin preguntar
4. **Agregar validación Zod en los controladores del backend** (middlewares de validación con Zod usando `zod` que ya está instalado)
5. El login principal es por DNI, no por email
6. Las rutinas usan subdocumentos embebidos (exerciseSchema, daySchema)
7. No hay tests escritos aún
8. Cloudinary está instalado y se usará pronto para subir imágenes (no eliminarlo)
9. Prohibido el uso de TypeScript. Todo el desarrollo debe ser única y exclusivamente en JavaScript (.js, .jsx). No generar interfaces ni tipos bajo ninguna circunstancia.

## Git Flow
- `main` → **producción, sagrada**. No se toca directamente
- `dev` → integración. Se hace PR desde ramas hacia acá
- `feature/*` → nuevas funcionalidades
- `fix/*` → correcciones
- Sub-ramas dentro de `dev` según sea necesario
- Commits en inglés descriptivos (ej: "feat: add DNI login")

## Desarrollo
- Trabajo **solo con Docker** (`docker-compose up`). No usar npm directo
- MongoDB Atlas de uso individual (solo un dev)
- Sin deploy por ahora (desarrollo local)
