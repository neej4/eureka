param(
  [switch]$NoBackend,
  [switch]$NoFrontend,
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$RepoRoot = $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"

Write-Host "EUREKA dev launcher" -ForegroundColor Cyan
Write-Host "Repo: $RepoRoot"

if (-not $NoBackend) {
  if (-not (Test-Path $BackendDir)) {
    throw "Backend folder not found: $BackendDir"
  }
  $activate = Join-Path $BackendDir ".venv\Scripts\Activate.ps1"
  if (-not (Test-Path $activate)) {
    Write-Host "Backend venv not found. Creating .venv..." -ForegroundColor Yellow
    Push-Location $BackendDir
    python -m venv .venv
    Pop-Location
  }

  Write-Host "Starting backend on :$BackendPort" -ForegroundColor Green
  $backendCmd = @"
cd "$BackendDir"
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port $BackendPort
"@
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null
}

if (-not $NoFrontend) {
  if (-not (Test-Path $FrontendDir)) {
    throw "Frontend folder not found: $FrontendDir"
  }
  Write-Host "Starting frontend on :$FrontendPort" -ForegroundColor Green
  $frontendCmd = @"
cd "$FrontendDir"
npm install
npm run dev -- --host=0.0.0.0 --port=$FrontendPort
"@
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd | Out-Null
}

Write-Host ""
Write-Host "If ports are busy, Vite will auto-pick another port (e.g. 5174)." -ForegroundColor DarkGray
Write-Host "Frontend: http://localhost:$FrontendPort/" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:$BackendPort/health" -ForegroundColor Cyan
