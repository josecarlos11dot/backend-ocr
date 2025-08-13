# Backend OCR — Vercel Serverless (Listo)

Tu `server.js` fue adaptado automáticamente a **Vercel Functions**:
- Archivo principal ahora en `api/server.js`
- Se eliminó `app.listen(...)`
- Se exporta `module.exports = serverless(app)`

## Despliegue rápido
1. `npm i -g vercel` (si no lo tienes)
2. `vercel`  → primer deploy (elige este folder como raíz)
3. `vercel --prod`

o vía Git:
1. Sube esta carpeta a GitHub
2. Vercel → New Project → Importa este repo → Deploy

## Endpoints
- `GET  /api/health`
- `GET  /api/pendientes`
- `POST /api/pendientes`
- `DELETE /api/pendientes/:id`
- `POST /api/stream`

Asegúrate de actualizar los **dominios permitidos en CORS** en `api/server.js` si cambian tus dominios del front/OCR.
