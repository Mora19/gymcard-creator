[CmdletBinding()]
param(
    [string] $StagingUrl,
    [string] $StagingPublishableKey
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$configured = [bool] ($StagingUrl -or $StagingPublishableKey)
$projectRef = 'recardnize-preview'

if ($configured) {
    if ($StagingUrl -notmatch '^https://([a-z0-9]+)\.supabase\.co/?$') {
        throw 'Gib die Project URL eines separaten Supabase-Testprojekts an.'
    }
    $projectRef = $Matches[1]
    $StagingUrl = $StagingUrl.TrimEnd('/')
    if ($StagingPublishableKey -cnotmatch '^sb_publishable_[a-zA-Z0-9_-]+$') {
        throw 'Das Testprojekt benötigt hier seinen sb_publishable_-Schlüssel.'
    }

    foreach ($line in Get-Content -LiteralPath (Join-Path $repo '.env')) {
        if ($line -match '^\s*(?:VITE_)?SUPABASE_URL\s*=\s*[''\"]?([^''\"#\s]+)') {
            if ($Matches[1].TrimEnd('/') -eq $StagingUrl) {
                throw 'Die URL gehört zum Supabase-Projekt aus der vorhandenen .env. Lege ein separates Testprojekt an.'
            }
        }
    }
} else {
    $StagingUrl = 'https://recardnize-preview.invalid'
    $StagingPublishableKey = 'sb_publishable_local_preview_only'
}

$buildEnvironment = @{
    VITE_SUPABASE_URL = $StagingUrl
    VITE_SUPABASE_PUBLISHABLE_KEY = $StagingPublishableKey
    VITE_SUPABASE_PROJECT_ID = $projectRef
    NITRO_PRESET = 'cloudflare-module'
}
$previousEnvironment = @{}
Push-Location -LiteralPath $repo
try {
    foreach ($name in $buildEnvironment.Keys) {
        $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name)
        [Environment]::SetEnvironmentVariable($name, $buildEnvironment[$name])
    }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw "Der Website-Build ist fehlgeschlagen (Exitcode $LASTEXITCODE)."
    }
} finally {
    foreach ($name in $previousEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($name, $previousEnvironment[$name])
    }
    Pop-Location
}

$server = Join-Path $repo '.output/server'
$generatedConfig = Join-Path $server 'wrangler.json'
$previewConfig = Join-Path $server 'wrangler.preview.json'
$config = Get-Content -LiteralPath $generatedConfig -Raw | ConvertFrom-Json
$config.name = 'recardnize-staging'
$config.assets.directory = '../public'
$config | Add-Member -Force NoteProperty workers_dev $configured
$config | Add-Member -Force NoteProperty preview_urls $false
$config | Add-Member -Force NoteProperty vars @{
    SUPABASE_URL = $StagingUrl
    SUPABASE_PUBLISHABLE_KEY = $StagingPublishableKey
}
[IO.File]::WriteAllText($previewConfig, ($config | ConvertTo-Json -Depth 20))

Push-Location -LiteralPath $repo
try {
    & npx.cmd --prefer-offline --yes wrangler@4.164.0 deploy --dry-run --config .output/server/wrangler.preview.json
    if ($LASTEXITCODE -ne 0) {
        throw "Der Wrangler-Dry-run ist fehlgeschlagen (Exitcode $LASTEXITCODE)."
    }
} finally {
    Pop-Location
}

if ($configured) {
    Write-Host 'Die Staging-Vorschau ist gebaut. Die Freigabeschritte stehen in HOSTING.md.'
} else {
    Write-Host 'Lokaler Build ohne Verbindung zu Supabase. Nur mit einem separaten Testprojekt veröffentlichen.'
}
