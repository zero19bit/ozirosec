$ErrorActionPreference = 'Stop'

$patterns = @(
  'APP_KEY=base64:',
  'HACKPATH_ADMIN_PASSWORD=.+',
  'DB_PASSWORD=.+',
  'MAIL_PASSWORD=.+',
  'AWS_SECRET_ACCESS_KEY=.+',
  'HACKPATH_FLAG_SECRET=.+',
  'HACKPATH_LAB_[A-Z0-9_]+_DIGEST=.+',
  '-----BEGIN [A-Z ]*PRIVATE KEY-----',
  'sk-[A-Za-z0-9_-]{16,}',
  'ghp_[A-Za-z0-9_]{20,}',
  'xox[baprs]-[A-Za-z0-9-]{10,}'
)

$exclude = @(
  ':!frontend/node_modules',
  ':!backend/vendor',
  ':!backend/storage',
  ':!backend/bootstrap/cache',
  ':!SECURITY_ROTATION.md',
  ':!scripts/secret-scan.ps1'
)

$failed = $false

foreach ($pattern in $patterns) {
  $matches = & git grep -l -I -E -e $pattern -- . @exclude 2>$null

  if ($LASTEXITCODE -eq 0 -and $matches) {
    $failed = $true
    Write-Output "Potential secret pattern matched in:"
    $matches | Sort-Object -Unique | ForEach-Object { Write-Output " - $_" }
  }
}

if ($failed) {
  Write-Error 'Potential secrets were found. Inspect paths locally without sharing values.'
}

Write-Output 'Secret scan completed without value disclosure.'
