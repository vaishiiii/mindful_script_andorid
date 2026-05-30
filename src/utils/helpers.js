import { QUOTES } from '@/data/sessions';

// Time conversion utilities
export const toMin = (h, m) => h * 60 + m;

export const parseT = (str) => {
  const [h, m] = str.split(":").map(Number);
  return { h, m };
};

export const fmtT = (h, m) => `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

export const fmtAMPM = (h, m) => {
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ap}`;
};

export const nowMin = () => {
  const n = new Date();
  return toMin(n.getHours(), n.getMinutes());
};

export const timeGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

export const todayQuote = (program) => {
  const a = QUOTES[program] || QUOTES.calm;
  return a[new Date().getDate() % a.length];
};

// Compute session unlock times based on wake/sleep schedule
export const computeUnlocks = (wake, sleep) => {
  const { h: wh, m: wm } = parseT(wake);
  const { h: sh, m: sm } = parseT(sleep);
  const wakeMin = toMin(wh, wm);
  const sleepMin = toMin(sh, sm);
  const mid = wakeMin + 300; // 5 hours after wake
  const night = sleepMin - 120; // 2 hours before sleep
  return {
    morning: fmtT(wh, wm),
    midday: fmtT(Math.floor(mid / 60), mid % 60),
    night: fmtT(Math.floor(night / 60), night % 60),
  };
};

// Check if a session time is unlocked
export const isTimeUnlockedNow = (unlockStr) => {
  const { h, m } = parseT(unlockStr);
  return nowMin() >= toMin(h, m);
};

// Local storage helpers
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
};

export const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Could not load from localStorage:', e);
    return defaultValue;
  }
};

export const clearStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
};

// Dev mode helpers — toggle with the 🛠 button in the app header
// Only admin accounts can activate dev mode.
const DEV_KEY = 'ms_dev';

// Authorised admin emails — only these accounts see/use the DEV toggle
export const ADMIN_EMAILS = [
  'admin@mindscript.app',
  'dev@mindscript.app',
  'tester1@mindscript.app',
  'tester2@mindscript.app',
  'vaish@mindscript.app',
];

export const isAdminUser = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export const isDevMode = () => {
  try { return localStorage.getItem(DEV_KEY) === '1'; } catch { return false; }
};
export const toggleDevMode = (email) => {
  try {
    if (!isAdminUser(email)) return; // non-admins cannot activate
    if (isDevMode()) localStorage.removeItem(DEV_KEY);
    else localStorage.setItem(DEV_KEY, '1');
  } catch { /* ignore */ }
};
