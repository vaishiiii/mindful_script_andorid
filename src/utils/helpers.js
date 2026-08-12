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

const QUOTE_ROTATION_KEY = 'ms_quote_rotation_v1';

const todayKey = () => new Date().toISOString().slice(0, 10);

const hashStr = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildIndexPool = (length, except = null) => {
  const pool = [];
  for (let i = 0; i < length; i += 1) {
    if (i !== except) pool.push(i);
  }
  return pool;
};

const QUOTE_TONE_BY_WEEKDAY = {
  0: 'reflective',
  1: 'action',
  2: 'intense',
  3: 'action',
  4: 'intense',
  5: 'gentle',
  6: 'reflective',
};

const quoteToneRules = {
  action: [
    /\baction\b/i,
    /\bstart\b/i,
    /\bbegin\b/i,
    /\bmove\b/i,
    /\bdo\b/i,
    /\bdecision/i,
    /\bexecute/i,
    /\bshow up\b/i,
    /\bnext step\b/i,
    /\bmomentum\b/i,
  ],
  intense: [
    /\bdiscipline\b/i,
    /\bcourage\b/i,
    /\bstrong|strength\b/i,
    /\bhard\b/i,
    /\bstrict\b/i,
    /\bstandard/i,
    /\bprotect\b/i,
    /\bfocus\b/i,
    /\bforged\b/i,
    /\bconsistency\b/i,
  ],
  gentle: [
    /\bcalm\b/i,
    /\bgentle\b/i,
    /\brest\b/i,
    /\bsoft\b/i,
    /\bslow\b/i,
    /\bquiet\b/i,
    /\bhealing|heal\b/i,
    /\bpeace\b/i,
    /\bbreath\b/i,
    /\bsafe\b/i,
  ],
  reflective: [
    /\bmeaning\b/i,
    /\bpurpose\b/i,
    /\bvalues\b/i,
    /\bwhy\b/i,
    /\bdirection\b/i,
    /\bbecoming\b/i,
    /\byourself\b/i,
    /\bawareness\b/i,
  ],
};

const classifyQuoteTone = (quote) => {
  for (const tone of ['action', 'intense', 'gentle', 'reflective']) {
    const rules = quoteToneRules[tone] || [];
    if (rules.some((rule) => rule.test(quote))) {
      return tone;
    }
  }
  return 'reflective';
};

const getToneForToday = (date = new Date()) => QUOTE_TONE_BY_WEEKDAY[date.getDay()] || 'reflective';

const intersect = (a = [], b = []) => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

const readQuoteRotationStore = () => {
  try {
    const raw = localStorage.getItem(QUOTE_ROTATION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeQuoteRotationStore = (store) => {
  try {
    localStorage.setItem(QUOTE_ROTATION_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage write failures in restricted environments.
  }
};

export const todayQuote = (program) => {
  const pool = QUOTES[program] || QUOTES.calm;

  if (!Array.isArray(pool) || pool.length === 0) {
    return 'Small daily steps create lasting change.';
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const tone = getToneForToday(now);
  const store = readQuoteRotationStore();
  const current = store[program] || {};

  if (current.day === day && Number.isInteger(current.index) && current.index >= 0 && current.index < pool.length) {
    return pool[current.index];
  }

  const allIndices = buildIndexPool(pool.length);
  const toneIndices = allIndices.filter((idx) => classifyQuoteTone(pool[idx]) === tone);

  let remaining = Array.isArray(current.remaining)
    ? current.remaining.filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < pool.length)
    : [];

  if (remaining.length === 0) {
    remaining = buildIndexPool(pool.length, Number.isInteger(current.index) ? current.index : null);
  }

  if (remaining.length === 0) {
    remaining = [0];
  }

  let selectable = intersect(remaining, toneIndices);
  if (selectable.length === 0) selectable = remaining;
  if (selectable.length === 0) selectable = allIndices;

  const pickPos = hashStr(`${program}|${day}|${tone}`) % selectable.length;
  const quoteIndex = selectable[pickPos];

  const removeAt = remaining.indexOf(quoteIndex);
  if (removeAt >= 0) remaining.splice(removeAt, 1);

  store[program] = {
    day,
    index: quoteIndex,
    remaining,
    tone,
  };
  writeQuoteRotationStore(store);

  return pool[quoteIndex] || pool[0];
};

// Compute session unlock times based on wake/sleep schedule
export const computeUnlocks = (wake, sleep) => {
  const wrapDayMin = (minutes) => ((minutes % 1440) + 1440) % 1440;
  const { h: wh, m: wm } = parseT(wake);
  const { h: sh, m: sm } = parseT(sleep);
  const wakeMin = toMin(wh, wm);
  const sleepMin = toMin(sh, sm);
  const morning = wrapDayMin(wakeMin);
  const mid = wrapDayMin(wakeMin + 300); // 5 hours after wake
  const night = wrapDayMin(sleepMin - 120); // 2 hours before sleep
  return {
    morning: fmtT(Math.floor(morning / 60), morning % 60),
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

export const isTesterReviewUser = (email) => {
  if (!email) return false;
  return email.toLowerCase().trim() === 'tester1@mindscript.app';
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
