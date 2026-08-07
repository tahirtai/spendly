# PowerShell script to download Stitch design screens
# Usage:
#   $env:STITCH_API_KEY="YOUR_API_KEY"
#   .\scripts\download_stitch_screens.ps1

param (
    [string]$apiKey = $env:STITCH_API_KEY,
    [string]$projectId = '6208039965587158829'
)

if (-not $apiKey) {
    Write-Error "Please set the STITCH_API_KEY environment variable or pass -apiKey 'YOUR_KEY'"
    exit 1
}

$headers = @{ 'X-Goog-Api-Key' = $apiKey }
$outDir = Join-Path $PSScriptRoot "..\design\stitch_designs"

if (-not (Test-Path $outDir)) { 
    New-Item -ItemType Directory -Path $outDir | Out-Null 
}

Write-Host "Fetching screen list for project $projectId..."
$screensList = (Invoke-RestMethod -Uri "https://stitch.googleapis.com/v1/projects/$projectId/screens" -Headers $headers).screens

$count = 1
$manifest = @()

foreach ($sSummary in $screensList) {
    $screenId = $sSummary.name.Split('/')[-1]
    $fullScreen = Invoke-RestMethod -Uri "https://stitch.googleapis.com/v1/projects/$projectId/screens/$screenId" -Headers $headers
    
    $title = $fullScreen.title
    $safeTitle = ($title -replace '[^a-zA-Z0-9]', '_') -replace '_+', '_'
    $numPrefix = "{0:D2}" -f $count
    $fileName = "${numPrefix}_${safeTitle}.html"
    $filePath = Join-Path $outDir $fileName

    if ($fullScreen.htmlCode -and $fullScreen.htmlCode.downloadUrl) {
        Write-Host "Downloading HTML for '$title' -> $fileName..."
        Invoke-WebRequest -Uri $fullScreen.htmlCode.downloadUrl -OutFile $filePath
    }

    $manifest += [PSCustomObject]@{
        index       = $count
        id          = $screenId
        title       = $title
        file        = "design/stitch_designs/$fileName"
        prompt      = $fullScreen.prompt
        deviceType  = $fullScreen.deviceType
        width       = $fullScreen.width
        height      = $fullScreen.height
    }
    $count++
}

$manifestJsonPath = Join-Path $outDir 'screens_manifest.json'
$manifest | ConvertTo-Json -Depth 5 | Out-File $manifestJsonPath -Encoding utf8
Write-Host "DOWNLOADED $($manifest.Count) SCREENS SUCCESSFULLY TO $outDir."
