param(
    [string]$RecoveredRelativePath = "recovered/running-aab-public-20260811"
)

$ErrorActionPreference = "Stop"

function Get-AssetRefsFromIndex {
    param([string]$IndexPath)

    if (-not (Test-Path -LiteralPath $IndexPath)) {
        throw "Index file not found: $IndexPath"
    }

    $content = Get-Content -LiteralPath $IndexPath -Raw

    $scriptMatch = [regex]::Match($content, 'src="/assets/([^\"]+\.js)"')
    $cssMatch = [regex]::Match($content, 'href="/assets/([^\"]+\.css)"')

    if (-not $scriptMatch.Success -or -not $cssMatch.Success) {
        throw "Unable to parse JS/CSS asset references from $IndexPath"
    }

    return @{
        Js = $scriptMatch.Groups[1].Value
        Css = $cssMatch.Groups[1].Value
    }
}

function Assert-FileHashEqual {
    param(
        [string]$ExpectedPath,
        [string]$ActualPath,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $ExpectedPath)) {
        throw "Expected file missing for ${Label}: $ExpectedPath"
    }

    if (-not (Test-Path -LiteralPath $ActualPath)) {
        throw "Actual file missing for ${Label}: $ActualPath"
    }

    $expectedHash = (Get-FileHash -LiteralPath $ExpectedPath -Algorithm SHA256).Hash
    $actualHash = (Get-FileHash -LiteralPath $ActualPath -Algorithm SHA256).Hash

    if ($expectedHash -ne $actualHash) {
        throw "Hash mismatch for $Label. Expected $expectedHash but got $actualHash"
    }
}

$repoRoot = $PSScriptRoot
$recoveredRoot = Join-Path $repoRoot $RecoveredRelativePath

if (-not (Test-Path -LiteralPath $recoveredRoot)) {
    throw "Recovered folder not found: $recoveredRoot"
}

$recoveredIndex = Join-Path $recoveredRoot "index.html"
$recoveredRefs = Get-AssetRefsFromIndex -IndexPath $recoveredIndex

$targets = @(
    @{ Name = "dist"; Path = Join-Path $repoRoot "dist" },
    @{ Name = "android"; Path = Join-Path $repoRoot "android/app/src/main/assets/public" },
    @{ Name = "android-studio-ready"; Path = Join-Path $repoRoot "android-studio-ready/app/src/main/assets/public" }
)

foreach ($target in $targets) {
    $targetIndex = Join-Path $target.Path "index.html"
    $targetRefs = Get-AssetRefsFromIndex -IndexPath $targetIndex

    if ($targetRefs.Js -ne $recoveredRefs.Js -or $targetRefs.Css -ne $recoveredRefs.Css) {
        throw "Asset reference mismatch in $($target.Name). Expected JS/CSS $($recoveredRefs.Js), $($recoveredRefs.Css) but found $($targetRefs.Js), $($targetRefs.Css)"
    }

    Assert-FileHashEqual -ExpectedPath (Join-Path $recoveredRoot ("assets/" + $recoveredRefs.Js)) -ActualPath (Join-Path $target.Path ("assets/" + $targetRefs.Js)) -Label "$($target.Name) JS"
    Assert-FileHashEqual -ExpectedPath (Join-Path $recoveredRoot ("assets/" + $recoveredRefs.Css)) -ActualPath (Join-Path $target.Path ("assets/" + $targetRefs.Css)) -Label "$($target.Name) CSS"
}

Write-Host "[freeze-verify] PASS: dist, android, and android-studio-ready are pinned to recovered AAB assets ($($recoveredRefs.Js), $($recoveredRefs.Css))."
