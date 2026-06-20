$ErrorActionPreference = 'Stop'

$forbiddenPatterns = @(
    '(^|/)(vendor|node_modules)(/|$)',
    '(^|/)dist(/|$)',
    '(^|/)build(/|$)',
    '(^|/)coverage(/|$)',
    '(^|/)database/database\.sqlite$',
    '\.sqlite$',
    '\.sqlite3$',
    '\.sqlite-journal$',
    '\.db$',
    '\.db-',
    '(^|/)bootstrap/cache/.+\.php$',
    '(^|/)storage/logs/.+',
    '(^|/)storage/framework/(cache|sessions|testing|views)/.+',
    '(^|/)storage/app/(private|public)/.+',
    '(^|/)\.phpunit\.cache(/|$)',
    '(^|/)\.phpunit\.result\.cache$',
    '\.log$',
    '(^|/)\.env($|\.)',
    '(^|/)\.DS_Store$',
    '(^|/)Thumbs\.db$'
)

$allowedPatterns = @(
    '(^|/)\.env\.example$',
    '(^|/)storage/(app/(private|public)|framework/(cache(/data)?|sessions|testing|views)|logs)/\.gitignore$'
)

$trackedFiles = git ls-files
$forbiddenFiles = foreach ($file in $trackedFiles) {
    $normalized = $file -replace '\\', '/'
    $isForbidden = $false

    foreach ($pattern in $forbiddenPatterns) {
        if ($normalized -match $pattern) {
            $isForbidden = $true
            break
        }
    }

    if (-not $isForbidden) {
        continue
    }

    $isAllowed = $false
    foreach ($pattern in $allowedPatterns) {
        if ($normalized -match $pattern) {
            $isAllowed = $true
            break
        }
    }

    if (-not $isAllowed) {
        $file
    }
}

if ($forbiddenFiles) {
    Write-Error "Forbidden generated/runtime artifacts are tracked:`n$($forbiddenFiles -join "`n")"
}

Write-Output 'No forbidden generated/runtime artifacts are tracked.'
