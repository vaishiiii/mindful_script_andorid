# Recovery Status (2026-08-11)

This workspace was aligned to the exact web payload inside the currently available release bundle:

- Source bundle: android/app/release/app-release.aab
- Extracted bundle JS: assets/index-B0GcWORO.js
- Extracted bundle CSS: assets/index-K9IH3hMT.css

## Actions Applied

1. Extracted AAB contents to temp/aab_extract.
2. Backed up previous Android web assets:
   - android/app/src/main/assets/public-backup-20260811-running-aab
3. Replaced active Android web assets with extracted AAB assets:
   - android/app/src/main/assets/public
4. Backed up previous dist (if present):
   - dist-backup-20260811-running-aab
5. Replaced dist with extracted AAB web payload.
6. Incremented Android versionCode from 3 to 4 in android/app/build.gradle.

## Notes

- This baseline matches the packaged test-user build payload.
- JS/CSS are production-minified artifacts; source-level edits should continue in src/ and then rebuilt.
- Keep temp/aab_extract and backup folders until you confirm parity on device.

## Fast Restore Command

Use this any time you want to switch active assets back to the exact running AAB payload:

```powershell
npm run recovery:restore-aab
```

Optional flags:

- `-NoBackup` to replace `dist` and Android `public` without creating backup folders.
- `-SkipDist` to restore only Android `public`.
- `-SkipAndroidPublic` to restore only `dist`.

Example:

```powershell
powershell -ExecutionPolicy Bypass -File .\restore-running-aab.ps1 -SkipDist
```

## Comparison Checklist

1. Run `npm run recovery:restore-aab`.
2. Confirm `dist/index.html` points to `/assets/index-B0GcWORO.js` and `/assets/index-K9IH3hMT.css`.
3. Confirm `android/app/src/main/assets/public/index.html` points to the same file hashes.
4. Build and sync with `npm run android:sync`.
5. Install/run and validate the same user flow that was previously verified in the test-user build.
