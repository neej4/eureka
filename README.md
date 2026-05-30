# Eureka Breakthrough Engine

Monorepo untuk implementasi (code) proyek.

## Folder ownership (anti-conflict)

- O1: `backend/` + `shared/`
- O2: `frontend/` + `docs/`

## Branching

- `main`
- `feat/backend`
- `feat/frontend`

## Docs

Spesifikasi/brief ada di repo docs terpisah: <DOCS_REPO_URL>

## One command dev

Di Windows PowerShell:

```powershell
cd D:\PROJECT\trae_project\repo_gh
.\run-dev.ps1
```

Opsional:

```powershell
.\run-dev.ps1 -NoBackend
.\run-dev.ps1 -NoFrontend
.\run-dev.ps1 -BackendPort 8000 -FrontendPort 5173
```
