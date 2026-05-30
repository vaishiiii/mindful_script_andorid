import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  
  try {
    const snapshot = await getDoc(userRef);
    
    // If user doesn't exist, create profile
    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();
      
      await setDoc(userRef, {
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || null,
        createdAt,
        lastLogin: createdAt,
        ...additionalData
      });
      
      console.log('User profile created successfully');
    } else {
      // Update last login
      await setDoc(userRef, {
        lastLogin: serverTimestamp()
      }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Don't fail authentication if Firestore fails - just log the error
    console.warn('Firestore might not be enabled. Please enable Firestore Database in Firebase Console.');
    return { success: false, error: error.message };
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set display name from email prefix
    const displayName = email.split('@')[0];
    await updateProfile(userCredential.user, { displayName });
    
    // Create user profile in Firestore (non-blocking)
    createUserProfile(userCredential.user).catch(err => 
      console.warn('Failed to create Firestore profile, but authentication succeeded:', err)
    );
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: getErrorMessage(error.code), errorCode: error.code };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login (non-blocking)
    createUserProfile(userCredential.user).catch(err => 
      console.warn('Failed to update Firestore profile, but authentication succeeded:', err)
    );
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: getErrorMessage(error.code), errorCode: error.code };
  }
};

/**
 * Sign in or sign up with email (auto-detect)
 */
export const authenticateWithEmail = async (email, password) => {
  // Try to sign in first
  let result = await signInWithEmail(email, password);
  
  // If user doesn't exist or wrong password, create a new account
  if (!result.success && (result.errorCode === 'auth/user-not-found' || result.errorCode === 'auth/wrong-password' || result.errorCode === 'auth/invalid-credential')) {
    console.log('User not found, creating new account...');
    result = await signUpWithEmail(email, password);
  }
  
  return result;
};

/**
 * Sign in with Google using Firebase Popup (Web-friendly)
 */
export const signInWithGoogle = async () => {
  try {
    console.log('[Google Auth] Starting sign-in process...');
    console.log('[Google Auth] Platform:', Capacitor.getPlatform());
    
    // Use different methods for web vs native
    if (Capacitor.isNativePlatform()) {
      // Native platform - use Capacitor Google Auth
      try {
        await GoogleAuth.initialize();
      } catch (e) {
        console.warn('GoogleAuth already initialized or failed to init:', e);
      }
      
      console.log('[Google Auth] Calling GoogleAuth.signIn() on native platform...');
      const googleUser = await GoogleAuth.signIn();
      console.log('[Google Auth] Sign-in successful, user:', googleUser);
      
      if (!googleUser || !googleUser.authentication) {
        console.error('[Google Auth] No user or authentication data returned');
        throw new Error('Google sign-in cancelled');
      }
      
      console.log('[Google Auth] Creating Firebase credential...');
      const credential = GoogleAuthProvider.credential(
        googleUser.authentication.idToken,
        googleUser.authentication.accessToken
      );
      
      console.log('[Google Auth] Signing in with credential to Firebase...');
      const userCredential = await signInWithCredential(auth, credential);
      console.log('[Google Auth] Firebase sign-in successful:', userCredential.user.email);
      
      // Create/update user profile in Firestore (non-blocking)
      createUserProfile(userCredential.user, {
        provider: 'google',
        googleId: googleUser.id
      }).catch(err => 
        console.warn('Failed to create/update Firestore profile, but authentication succeeded:', err)
      );
      
      return { success: true, user: userCredential.user };
    } else {
      // Web platform - use Firebase Redirect (no popup, works like any standard website)
      console.log('[Google Auth] Using Firebase redirect for web platform...');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithRedirect(auth, provider);
      // Page navigates away — execution does not continue here.
      return { success: true };
    }
  } catch (error) {
    console.error('[Google Auth] Error occurred:', error);
    console.error('[Google Auth] Error type:', typeof error);
    console.error('[Google Auth] Error code:', error.code);
    console.error('[Google Auth] Error message:', error.message);
    
    // Handle specific Google Auth errors
    return { success: false, error: getGoogleErrorMessage(error) };
  }
};

/**
 * Sign out the current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    
    // Also sign out from Google if on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.initialize();
      } catch (e) {
        // already initialized or unavailable — safe to continue
      }
      await GoogleAuth.signOut();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Subscribe to authentication state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check for a pending Google redirect result (call once on app load).
 * Returns { success, user } or { success: false, error } or null if no redirect.
 */
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null; // no pending redirect
    console.log('[Google Auth] Redirect result received:', result.user.email);
    createUserProfile(result.user, { provider: 'google' }).catch(() => {});
    return { success: true, user: result.user };
  } catch (error) {
    console.error('[Google Auth] Redirect result error:', error);
    return { success: false, error: getGoogleErrorMessage(error) };
  }
};

/**
 * Send a password reset email
 */
export const resetPassword = async (email) => {
  try {
    // Check what sign-in methods this email has
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.length === 0) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!methods.includes('password')) {
      // Account exists but uses Google (or another provider) — no password to reset
      return {
        success: false,
        error: 'This account uses Google Sign-In. Please tap "Continue with Google" instead — there is no password to reset.',
        isGoogleAccount: true,
      };
    }

    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email already in use';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
};

const getGoogleErrorMessage = (error) => {
  let errorMessage = 'Failed to sign in with Google';

  if (error && typeof error === 'object') {
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in cancelled. Please try again.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized. Add localhost to Firebase Authentication authorized domains.';
    } else if (error.error === 'popup_closed_by_user' || error.message?.includes('popup_closed_by_user')) {
      errorMessage = 'Sign-in cancelled. Please try again.';
    } else if (error.error === 'popup_blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return errorMessage;
};
