param(
  [Parameter(Mandatory = $true)]
  [string]$RepositoryUrl,

  [switch]$ConfirmRewrite
)

$ErrorActionPreference = "Stop"

if (-not $ConfirmRewrite) {
  throw "History rewriting requires -ConfirmRewrite. Read docs/security/history-purge.md first."
}

if (-not (Get-Command git-filter-repo -ErrorAction SilentlyContinue)) {
  throw "Install git-filter-repo from its official package before continuing."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$mirrorPath = Join-Path ([IO.Path]::GetTempPath()) "vidhya-vedha-history-$stamp.git"

Write-Host "Creating disposable mirror at $mirrorPath"
git clone --mirror $RepositoryUrl $mirrorPath
if ($LASTEXITCODE -ne 0) { throw "Mirror clone failed." }

Push-Location $mirrorPath
try {
  git filter-repo --path Backend/.env --path-glob "Backend/node_modules/**" --invert-paths --force
  if ($LASTEXITCODE -ne 0) { throw "History rewrite failed." }

  if (git log --all -- Backend/.env) {
    throw "Verification failed: Backend/.env is still present in history."
  }
  if (git log --all -- Backend/node_modules) {
    throw "Verification failed: Backend/node_modules is still present in history."
  }

  Write-Host "Rewrite verified locally. Review the mirror before running:"
  Write-Host "  git push --force --mirror $RepositoryUrl"
  Write-Host "The script intentionally does not force-push."
}
finally {
  Pop-Location
}
