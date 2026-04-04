param(
    [string]$InputFile = "assets/demo_source.mp4",
    [string]$OutputFile = "assets/mobile_demo.webp",
    [int]$Fps = 15,
    [int]$Width = 960
)

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg is not installed or not available in PATH."
    exit 1
}

if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

$vf = "fps=$Fps,scale=$Width:-1:flags=lanczos"

ffmpeg -y -i $InputFile -vf $vf -loop 0 -an $OutputFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed while creating $OutputFile"
    exit $LASTEXITCODE
}

Write-Host "Created $OutputFile from $InputFile"
