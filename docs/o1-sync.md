# O1 Sync Guide (Backend Owner) — EUREKA Monorepo Workflow

Dokumen ini ditulis dari sisi O2 (frontend/docs owner) untuk membantu O1 sinkron dan menghindari merge conflict.

## Aturan ownership folder (biar minim conflict)

- O1: `backend/` + `shared/`
- O2: `frontend/` + `docs/`

`shared/types.ts` adalah kontrak bersama: backend dan frontend harus mengikuti field/type yang sama. Kalau butuh perubahan kontrak, sepakati dulu sebelum edit.

## Branching yang dipakai

- `main`: branch integrasi.
- `feat/backend`: tempat kerja O1.
- `feat/frontend`: tempat kerja O2.

Flow yang aman:
1) O1 kerja di `feat/backend`, O2 kerja di `feat/frontend`
2) Sering rebase/merge dari `origin/main` untuk mengurangi konflik
3) Kalau sudah stabil, merge ke `main` lewat PR

## Cara update branch lokal dari GitHub

Di root repo `repo_gh/`:

1) Ambil update terbaru:
- `git fetch origin`

2) Pindah ke branch kerja:
- `git switch feat/backend`

3) Sinkronkan dengan `origin/main`:
- `git rebase origin/main`

Kalau ada conflict:
- Resolve file yang conflict
- `git add <file>`
- `git rebase --continue`

## Contract yang dipakai frontend (backend jangan “geser” tanpa info)

Frontend sudah wiring ke endpoint backend yang ada di `backend/app/main.py`:
- `POST /api/pipeline/start`
- `GET /api/pipeline/{id}/stream` (SSE)
- `GET /api/pipeline/{id}/status`
- `GET /api/pipeline/{id}/result`
- `POST /api/ideas/{id}/override`
- `GET /api/cache/stats`
- `POST /api/cache/reset`

SSE di-parse sebagai JSON dari field `data:` (EventSource `onmessage`).

## Catatan supaya integrasi mulus

- Jangan rename field di `shared/types.ts` tanpa koordinasi.
- Kalau backend menambah field baru di payload, frontend aman (TS akan tetap match selama field wajib tidak berubah).
- Kalau backend mengubah shape SSE event, kabari O2 karena hook pipeline frontend parse `type: "status" | "result" | "error"`.

