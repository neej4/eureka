# Deploy to Render

## Quick Deploy (Recommended)

1. Buka https://render.com
2. Login dengan GitHub
3. Klik **"New +"** → **"Blueprint"**
4. Connect repo `neej4/eureka`
5. Upload file `render.yaml` ini
6. Klik **"Apply"**

Render akan auto-detect dan deploy backend ke `https://eureka-backend.onrender.com`

## Manual Deploy

1. Buka https://render.com
2. Login dengan GitHub
3. Klik **"New +"** → **"Web Service"**
4. Connect repo `neej4/eureka`
5. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Klik **"Create Web Service"**

## API Endpoints (After Deploy)

Base URL: `https://eureka-backend.onrender.com`

- `GET /` - Health check
- `GET /health` - Health status
- `POST /api/pipeline/start` - Start pipeline
- `GET /api/pipeline/{id}/stream` - SSE stream
- `GET /api/pipeline/{id}/status` - Get status
- `GET /api/pipeline/{id}/result` - Get result
- `POST /api/ideas/{id}/override` - Human override
- `POST /api/cache/reset` - Reset cache
- `GET /api/cache/stats` - Cache stats

## Update Frontend API URL

Setelah backend deployed, update di frontend:

```typescript
// frontend/src/hooks/usePipeline.ts
const API_BASE = 'https://eureka-backend.onrender.com';
```
