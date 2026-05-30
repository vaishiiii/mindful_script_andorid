# Mindscript

Rewire your mind. One mindful script at a time.

Mindscript is a React + Capacitor app for mindfulness and behavior change, with guided daily rituals, progress tracking, Firebase authentication, and Android support.

## Current Features

- 7 core programs: Calm, Focus, Confidence, Healing, Discipline, Purpose, Habit Building
- Free and paid program paths (including multi-day paid tracks)
- Personalized onboarding: goals, questionnaire, schedule setup
- Daily sessions: morning, midday, night
- Program-specific breathwork and action tasks
- Reflection flow and end-of-program behavioral report
- Progress persistence via local storage plus user-scoped restoration after login
- Firebase Authentication: email/password and Google sign-in
- Android build and sync through Capacitor

## Tech Stack

- React 18
- Vite 5
- Capacitor 8 (Android)
- Firebase (Auth, Firestore, Analytics)

## Prerequisites

- Node.js 18+
- npm
- Android Studio (for Android builds)

## Quick Start (Web)

```bash
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Build and Android Commands

```bash
# Web production build
npm run build

# Build web and sync to Android project
npm run android:sync

# Open Android Studio project
npm run android:open

# Build, sync, and open Android project
npm run android:run
```

## Firebase Setup

Firebase is required for authentication flows.

1. Configure web credentials in `src/config/firebase.js`.
2. Ensure `android/app/google-services.json` matches your Firebase Android app (`com.mindscript.app`).
3. Enable Email/Password and Google auth in Firebase Console.

Detailed guide: `FIREBASE_SETUP.md`

## White Screen Troubleshooting

If the app shows a blank white screen:

1. Open browser devtools and check Console for runtime errors.
2. Rebuild and resync assets:

```bash
npm run build
npx cap sync android
```

3. Re-run from Android Studio after Gradle sync.

Recent fix included in this project:
- Resolved a startup crash in `src/App.jsx` caused by `screen` being referenced before initialization (`ReferenceError: Cannot access 'screen' before initialization`).

## Project Structure

```text
mindscript/
├── src/
│   ├── components/
│   │   ├── onboarding/
│   │   ├── app/
│   │   ├── session/
│   │   └── ui/
│   ├── config/            # Firebase config
│   ├── data/              # Program content and questions
│   ├── styles/
│   ├── utils/             # Auth, storage, notifications, helpers
│   ├── App.jsx
│   └── main.jsx
├── android/               # Capacitor Android project
├── capacitor.config.json
├── FIREBASE_SETUP.md
├── README_ANDROID.md
└── package.json
```

## Helpful Docs

- `README_ANDROID.md`
- `ANDROID_BUILD_GUIDE.md`
- `QUICK_START_ANDROID.md`
- `FIREBASE_SETUP.md`

## License

MIT
