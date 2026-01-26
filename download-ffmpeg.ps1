# Auto download and install ffmpeg

Write-Host "=== ffmpeg Auto Download Tool ===" -ForegroundColor Green
Write-Host ""

$ffmpegDir = "$PSScriptRoot\ffmpeg"
$ffmpegZip = "$PSScriptRoot\ffmpeg.zip"
$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

# Check if already downloaded
if (Test-Path "$ffmpegDir\bin\ffmpeg.exe") {
    Write-Host "OK ffmpeg already exists" -ForegroundColor Green
    Write-Host "Path: $ffmpegDir\bin\ffmpeg.exe" -ForegroundColor Cyan
    exit 0
}

Write-Host "Downloading ffmpeg..." -ForegroundColor Yellow
Write-Host "URL: $ffmpegUrl" -ForegroundColor Cyan
Write-Host "This may take a few minutes, please wait..." -ForegroundColor Yellow
Write-Host ""

try {
    # Download
    Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip -UseBasicParsing
    Write-Host "OK Download complete" -ForegroundColor Green
    
    # Extract
    Write-Host "Extracting..." -ForegroundColor Yellow
    Expand-Archive -Path $ffmpegZip -DestinationPath $PSScriptRoot -Force
    
    # Find extracted directory
    $extractedDir = Get-ChildItem -Path $PSScriptRoot -Directory | Where-Object { $_.Name -like "ffmpeg-*-essentials_build" } | Select-Object -First 1
    
    if ($extractedDir) {
        # Rename to ffmpeg
        Rename-Item -Path $extractedDir.FullName -NewName "ffmpeg" -Force
        Write-Host "OK Extract complete" -ForegroundColor Green
    } else {
        Write-Host "ERROR Cannot find extracted directory" -ForegroundColor Red
        exit 1
    }
    
    # Delete zip file
    Remove-Item $ffmpegZip -Force
    
    Write-Host ""
    Write-Host "OK ffmpeg installed successfully!" -ForegroundColor Green
    Write-Host "Path: $ffmpegDir\bin\ffmpeg.exe" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now you can run the fix script:" -ForegroundColor Yellow
    Write-Host "  .\fix-video.ps1" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "ERROR Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Cyan
    Write-Host "2. Download: ffmpeg-release-essentials.zip" -ForegroundColor Cyan
    Write-Host "3. Extract to: $PSScriptRoot\ffmpeg" -ForegroundColor Cyan
    exit 1
}
