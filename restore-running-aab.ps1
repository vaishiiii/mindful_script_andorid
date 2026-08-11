param(
    [string]$RecoveredRelativePath = "recovered/running-aab-public-20260811",
    [switch]$NoBackup,
    [switch]$SkipDist,
    [switch]$SkipAndroidPublic,
    [switch]$SkipAndroidStudioReadyPublic
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[restore-aab] $Message"
}

function Backup-And-Replace {
    param(
        [string]$SourcePath,
        [string]$TargetPath,
        [string]$Label,
        [switch]$DisableBackup
    )

    if (-not (Test-Path -LiteralPath $SourcePath)) {
        throw "Source path not found for ${Label}: $SourcePath"
    }

    if ((Test-Path -LiteralPath $TargetPath) -and (-not $DisableBackup)) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = "${TargetPath}-backup-${timestamp}"
        Write-Step "Creating backup for $Label at $backupPath"
        Move-Item -LiteralPath $TargetPath -Destination $backupPath -Force
    }
    elseif (Test-Path -LiteralPath $TargetPath) {
        Write-Step "Removing existing target for $Label"
        Remove-Item -LiteralPath $TargetPath -Recurse -Force
    }

    Write-Step "Restoring $Label"
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    Copy-Item -Path (Join-Path $SourcePath "*") -Destination $TargetPath -Recurse -Force
}

$repoRoot = $PSScriptRoot
$recoveredRoot = Join-Path $repoRoot $RecoveredRelativePath

if (-not (Test-Path -LiteralPath $recoveredRoot)) {
    throw "Recovered payload folder not found: $recoveredRoot"
}

$expectedBundle = Join-Path $recoveredRoot "assets/index-B0GcWORO.js"
if (-not (Test-Path -LiteralPath $expectedBundle)) {
    throw "Recovered folder does not contain expected running AAB bundle: $expectedBundle"
}

if (-not $SkipDist) {
    $distPath = Join-Path $repoRoot "dist"
    Backup-And-Replace -SourcePath $recoveredRoot -TargetPath $distPath -Label "dist" -DisableBackup:$NoBackup
}

if (-not $SkipAndroidPublic) {
    $androidPublicPath = Join-Path $repoRoot "android/app/src/main/assets/public"
    Backup-And-Replace -SourcePath $recoveredRoot -TargetPath $androidPublicPath -Label "android public assets" -DisableBackup:$NoBackup
}

if (-not $SkipAndroidStudioReadyPublic) {
    $androidStudioReadyPublicPath = Join-Path $repoRoot "android-studio-ready/app/src/main/assets/public"
    Backup-And-Replace -SourcePath $recoveredRoot -TargetPath $androidStudioReadyPublicPath -Label "android-studio-ready public assets" -DisableBackup:$NoBackup
}

Write-Step "Done. Active web payload now points to the recovered running AAB assets."
