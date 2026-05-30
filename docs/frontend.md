# Frontend (O2) — EUREKA Dashboard

## Menjalankan (dev)

1. Masuk ke folder:
   - `repo_gh/frontend`
2. Install dependencies:
   - `npm install`
3. Jalankan dev server:
   - `npm run dev`

Default Vite biasanya di `http://localhost:5173` (atau port lain jika sudah terpakai).

## Mock-first vs Real backend

Frontend defaultnya berjalan dengan mock stream/data (biar UI bisa demo tanpa backend).

Untuk pakai backend FastAPI yang berjalan di `http://localhost:8000`, set:

- `VITE_USE_MOCK=false`

Anda bisa taruh env ini di file `.env.local` di folder `frontend/`:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
```

## Override API URL (tanpa edit env)

Di tab **Settings**, field **API base URL** menyimpan override ke `localStorage`:
- key: `eureka_api_url`

Priority base URL yang dipakai:
1) `localStorage.eureka_api_url`
2) `VITE_API_URL`
3) fallback `http://localhost:8000`

## Endpoint yang dipakai frontend

Frontend hanya wiring ke endpoint yang sudah ada di backend:
- `POST /api/pipeline/start` (body `{ topic: string }`)
- `GET /api/pipeline/{id}/stream` (SSE)
- `GET /api/pipeline/{id}/status`
- `GET /api/pipeline/{id}/result`
- `POST /api/ideas/{id}/override`
- `GET /api/cache/stats`
- `POST /api/cache/reset`

## Build (cek TypeScript + bundling)

- `npm run build`

