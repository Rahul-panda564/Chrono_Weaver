param(
    [string]$InputFile = "assets/demo_source.mp4",
    [string]$OutputFile = "assets/mobile_demo.webp",
    [int]$Fps = 15,
    [int]$Width = 960
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg is not installed or not available in PATH."
    exit 1
}

if (-not (Test-Path -Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

$vf = "fps=$Fps,scale=$Width`:-1`:flags=lanczos"

$ffmpegArgs = @(
    '-y'
    '-i'
    $InputFile
    '-vf'
    $vf
    '-loop'
    '0'
    '-an'
    $OutputFile
)

& ffmpeg @ffmpegArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed while creating $OutputFile"
    exit $LASTEXITCODE
}

Write-Host "Created $OutputFile from $InputFile"
