# MindScript Android Build Script
# This script builds the web app and syncs it to Android

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   MindScript Android Build & Sync    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Set execution policy for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Step 1: Build web app
Write-Host "Step 1: Building web app..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Web app built successfully!`n" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed! Check errors above.`n" -ForegroundColor Red
    exit 1
}

# Step 2: Sync to Android
Write-Host "Step 2: Syncing to Android..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Synced to Android successfully!`n" -ForegroundColor Green
} else {
    Write-Host "✗ Sync failed! Check errors above.`n" -ForegroundColor Red
    exit 1
}

# Step 3: Open in Android Studio (optional)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "`nBuild complete! 🎉" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Open in Android Studio: npx cap open android" -ForegroundColor White
Write-Host "  2. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)" -ForegroundColor White
Write-Host "  3. Or run on device with the ▶️ button`n" -ForegroundColor White

$response = Read-Host "Open in Android Studio now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`nOpening Android Studio..." -ForegroundColor Yellow
    npx cap open android
}

Write-Host "`nDone! ✓`n" -ForegroundColor Green
