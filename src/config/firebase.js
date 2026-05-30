import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJfSyMhl1xW4cncP2VfmOwz7mNqw5W8-I",
  authDomain: "mindscript-1001.firebaseapp.com",
  projectId: "mindscript-1001",
  storageBucket: "mindscript-1001.firebasestorage.app",
  messagingSenderId: "23022655078",
  appId: "1:23022655078:web:2069f23a5d9e19b0197fa7",
  measurementId: "G-23PZBQ7TC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics (optional — may not be available in WebView/native contexts)
export const analytics = (() => {
  try {
    if (typeof window !== 'undefined') {
      return getAnalytics(app);
    }
  } catch (e) {
    console.warn('[Firebase] Analytics unavailable:', e.message);
  }
  return null;
})();

export default app;
