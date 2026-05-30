import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save user's program progress
 */
export const saveUserProgress = async (userId, progressData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      progress: progressData,
      lastUpdated: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving progress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save user's completed session
 */
export const saveCompletedSession = async (userId, sessionData) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const sessionDoc = doc(sessionsRef);
    
    await setDoc(sessionDoc, {
      ...sessionData,
      completedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's session history
 */
export const getUserSessions = async (userId, limit = 10) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const snapshot = await getDocs(sessionsRef);
    
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by completedAt descending
    sessions.sort((a, b) => b.completedAt - a.completedAt);
    
    return { success: true, data: sessions.slice(0, limit) };
  } catch (error) {
    console.error('Error getting sessions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save a waitlist / feature-interest submission
 */
export const saveWaitlistEntry = async ({ interest, email }) => {
  try {
    const entriesRef = collection(db, 'waitlist');
    const newDoc = doc(entriesRef);
    await setDoc(newDoc, {
      interest,
      email: email.trim() || null,
      submittedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.warn('[waitlist] Firestore save failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save user preferences
 */
export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      lastUpdated: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
};
