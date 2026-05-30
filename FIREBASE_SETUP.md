# Firebase Authentication Setup Guide

## Overview
Your app now includes Firebase Authentication with support for:
- ✅ Email/Password authentication (with auto sign-up)
- ✅ Google Sign-In
- ✅ Session management
- ✅ Error handling

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Enable **Google** authentication
   - You'll need to add your app's OAuth client IDs (already configured in Capacitor)

### 3. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app and copy the Firebase configuration object

### 4. Update Firebase Config File

Open `src/config/firebase.js` and replace the placeholder values with your actual Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // Your API Key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 5. Configure Google Sign-In for Android

Your Android app is already configured with:
- Client ID: `23022655078-t6oufp6jf1fidf20d67545d786sf8qe0.apps.googleusercontent.com`
- `google-services.json` in `android/app/`

**Important:** Make sure this matches your Firebase project's Android app configuration.

1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", find your Android app
3. Verify the package name matches: `com.mindscript.app`
4. Download `google-services.json` if you need to update it

### 6. Test Authentication

#### Email Authentication
1. Start your app: `npm run dev`
2. Click "Sign in with email"
3. Enter any email and password (min 6 characters)
4. If the account doesn't exist, it will be created automatically
5. Check Firebase Console → Authentication → Users to see the new user

#### Google Authentication
1. Click "Continue with Google"
2. Select your Google account
3. The app will authenticate and create a Firebase user
4. Check Firebase Console → Authentication → Users

## Files Created/Modified

### New Files
- `src/config/firebase.js` - Firebase initialization
- `src/utils/auth.js` - Authentication functions
- `FIREBASE_SETUP.md` - This guide

### Modified Files
- `src/App.jsx` - Added Google Auth initialization
- `src/components/onboarding/LoginScreen.jsx` - Integrated authentication
- `package.json` - Added Firebase dependency

## Authentication API Reference

The following functions are available in `src/utils/auth.js`:

### `authenticateWithEmail(email, password)`
Automatically signs in or creates a new account
```javascript
const result = await authenticateWithEmail('user@example.com', 'password123');
if (result.success) {
  console.log('User:', result.user);
} else {
  console.error('Error:', result.error);
}
```

### `signInWithGoogle()`
Signs in with Google account
```javascript
const result = await signInWithGoogle();
if (result.success) {
  console.log('User:', result.user);
}
```

### `logOut()`
Signs out the current user
```javascript
await logOut();
```

### `onAuthChange(callback)`
Listen to authentication state changes
```javascript
const unsubscribe = onAuthChange((user) => {
  if (user) {
    console.log('User is signed in:', user);
  } else {
    console.log('User is signed out');
  }
});

// Later, unsubscribe
unsubscribe();
```

### `getCurrentUser()`
Get the currently authenticated user
```javascript
const user = getCurrentUser();
```

## Security Rules

In Firebase Console → Firestore Database or Realtime Database → Rules, you can configure who can access your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Troubleshooting

### "Authentication Error"
- Verify Firebase config in `src/config/firebase.js`
- Check that authentication methods are enabled in Firebase Console

### "Google Sign-In Failed"
- Verify `google-services.json` is in `android/app/`
- Check that the OAuth client ID matches your Firebase project
- Run `npm run android:sync` to sync Capacitor

### "Network Request Failed"
- Check your internet connection
- Verify Firebase project is active

## Next Steps

- Add email verification: Use `sendEmailVerification(user)` from Firebase
- Add password reset: Use `sendPasswordResetEmail(auth, email)`
- Add profile management: Allow users to update their profile
- Add social providers: Add Apple, Facebook, or Twitter authentication
- Implement proper session persistence using `onAuthChange` in App.jsx

## Support

For more information:
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
