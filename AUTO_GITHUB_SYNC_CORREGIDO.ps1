param(
  [int]$IntervalSeconds = 5,
  [int]$DebounceSeconds = 8
)

$ErrorActionPreference = "Stop"

function Write-Info {
  param([string]$Message)

  $time = Get-Date -Format "HH:mm:ss"
  Write-Host ("[" + $time + "] " + $Message)
}

function Ensure-GitRepo {
  git rev-parse --is-inside-work-tree 2>$null | Out-Null

  if ($LASTEXITCODE -ne 0) {
    throw "Esta carpeta no es un repositorio Git."
  }
}

function Ensure-Origin {
  $origin = git remote get-url origin 2>$null

  if (
    $LASTEXITCODE -ne 0 -or
    [string]::IsNullOrWhiteSpace($origin)
  ) {
    throw "No existe el remoto origin."
  }

  return $origin.Trim()
}

function Ensure-MainBranch {
  $branch = (git branch --show-current).Trim()

  if ($branch -ne "main") {
    Write-Info ("Rama actual: " + $branch + ". Cambiando a main...")

    git checkout main

    if ($LASTEXITCODE -ne 0) {
      throw "No se pudo cambiar a la rama main."
    }
  }
}

function Has-Changes {
  $status = git status --porcelain
  return -not [string]::IsNullOrWhiteSpace(($status -join "`n"))
}

function Find-Sensitive-UnignoredFile {
  $patterns = @(
    '(^|/)\.env($|/|\.)',
    '(^|/)sri-backend(/|$)',
    '(^|/)secrets(/|$)',
    'firebase-admin\.json$',
    'service-account',
    '\.p12$',
    '\.pfx$',
    '\.pem$',
    '\.key$'
  )

  $files = git ls-files --others --exclude-standard

  foreach ($file in $files) {
    foreach ($pattern in $patterns) {
      if ($file -match $pattern) {
        return $file
      }
    }
  }

  return $null
}

function Sync-Changes {
  $sensitive = Find-Sensitive-UnignoredFile

  if ($null -ne $sensitive) {
    Write-Host ""
    Write-Host "BLOQUEADO: archivo sensible no ignorado:" -ForegroundColor Red
    Write-Host ("  " + $sensitive) -ForegroundColor Red
    Write-Host "Corrige .gitignore antes de continuar." -ForegroundColor Red
    Write-Host ""
    return
  }

  if (-not (Has-Changes)) {
    return
  }

  Write-Info ("Cambio detectado. Esperando " + $DebounceSeconds + " segundos...")
  Start-Sleep -Seconds $DebounceSeconds

  if (-not (Has-Changes)) {
    return
  }

  git add -A

  if ($LASTEXITCODE -ne 0) {
    Write-Info "ERROR en git add."
    return
  }

  $staged = git diff --cached --name-only

  if ([string]::IsNullOrWhiteSpace(($staged -join "`n"))) {
    return
  }

  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $message = "Auto sync SIXTEEN - " + $stamp

  git commit -m $message

  if ($LASTEXITCODE -ne 0) {
    Write-Info "No se pudo crear el commit."
    return
  }

  git push origin main

  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK: GitHub actualizado automaticamente." -ForegroundColor Green
    Write-Host ""
  }
  else {
    Write-Host ""
    Write-Host "ERROR: GitHub no pudo actualizarse." -ForegroundColor Red
    Write-Host "El commit quedo guardado localmente." -ForegroundColor Yellow
    Write-Host ""
  }
}

try {
  Ensure-GitRepo
  $origin = Ensure-Origin
  Ensure-MainBranch

  Write-Host ""
  Write-Host "==================================================" -ForegroundColor DarkYellow
  Write-Host " SIXTEEN - AUTO SYNC GITHUB" -ForegroundColor Yellow
  Write-Host "==================================================" -ForegroundColor DarkYellow
  Write-Host ("Repositorio: " + $origin)
  Write-Host "Rama: main"
  Write-Host ("Revision cada: " + $IntervalSeconds + " segundos")
  Write-Host ("Espera tras cambios: " + $DebounceSeconds + " segundos")
  Write-Host ""
  Write-Host "Cada vez que guardes cambios:" -ForegroundColor Cyan
  Write-Host "  1. Detecta los archivos modificados"
  Write-Host "  2. Respeta .gitignore"
  Write-Host "  3. Crea un commit automatico"
  Write-Host "  4. Hace push a GitHub"
  Write-Host ""
  Write-Host "Para detenerlo: Ctrl + C" -ForegroundColor Gray
  Write-Host ""

  while ($true) {
    try {
      Sync-Changes
    }
    catch {
      Write-Host ("Error temporal: " + $_.Exception.Message) -ForegroundColor Red
    }

    Start-Sleep -Seconds $IntervalSeconds
  }
}
catch {
  Write-Host ""
  Write-Host "No se pudo iniciar AUTO SYNC." -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 1
}
