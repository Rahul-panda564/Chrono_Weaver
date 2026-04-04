param(
    [string]$InputFile = "assets/demo_source.mp4",
    [string]$OutputFile = "assets/mobile_demo.webp",
    [int]$Fps = 15,
    [int]$Width = 960
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ffmpegCommand = Get-Command ffmpeg -ErrorAction SilentlyContinue
$ffmpegExe = $null

if ($ffmpegCommand) {
    $ffmpegExe = $ffmpegCommand.Source
} else {
    $wingetPackagesDir = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'
    if (Test-Path -Path $wingetPackagesDir) {
        $candidate = Get-ChildItem -Path $wingetPackagesDir -Directory -Filter 'Gyan.FFmpeg*' -ErrorAction SilentlyContinue |
            ForEach-Object {
                Get-ChildItem -Path $_.FullName -Recurse -Filter 'ffmpeg.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1
            } |
            Select-Object -First 1

        if ($candidate) {
            $ffmpegExe = $candidate.FullName
        }
    }
}

if (-not $ffmpegExe) {
    Write-Error 'ffmpeg is not installed or not available in PATH.'
    exit 1
}

if (-not (Test-Path -Path $InputFile)) {
    Write-Error ('Input file not found {0}' -f $InputFile)
    exit 1
}

$colon = [char]58
$vf = ('fps={0},scale={1}{2}-1{2}flags=lanczos' -f $Fps, $Width, $colon)

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

& $ffmpegExe @ffmpegArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error ('ffmpeg failed while creating {0}' -f $OutputFile)
    exit $LASTEXITCODE
}

Write-Host ('Created {0} from {1}' -f $OutputFile, $InputFile)
