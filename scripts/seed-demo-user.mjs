// One-off script: seeds realistic demo progress for a screenshot/demo account.
// Usage: node scripts/seed-demo-user.mjs <email>
// Password is entered interactively (masked) — never pass it as an argument.
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import readline from 'readline';

const firebaseConfig = {
  apiKey: 'AIzaSyDJfSyMhl1xW4cncP2VfmOwz7mNqw5W8-I',
  authDomain: 'mindscript-1001.firebaseapp.com',
  projectId: 'mindscript-1001',
  storageBucket: 'mindscript-1001.firebasestorage.app',
  messagingSenderId: '23022655078',
  appId: '1:23022655078:web:2069f23a5d9e19b0197fa7',
};

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/seed-demo-user.mjs <email>');
  process.exit(1);
}

function askHidden(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const stdin = process.stdin;
    let value = '';
    process.stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (char) => {
      char = char.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        rl.close();
        resolve(value);
      } else if (char === '\u0003') {
        process.exit(1);
      } else if (char === '\u007f') {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    stdin.on('data', onData);
  });
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

// Realistic history: two completed goals (Focus, Confidence), currently mid-way through Discipline.
const programHistory = [
  { program: 'focus', duration: 3, isPaid: false, completedAt: daysAgo(24), totalSessions: 9 },
  { program: 'focus', duration: 5, isPaid: true, programId: 'focus-5 Days', title: '5-Day Attention Rebuild', completedAt: daysAgo(18), totalSessions: 15 },
  { program: 'confidence', duration: 3, isPaid: false, completedAt: daysAgo(13), totalSessions: 9 },
  { program: 'confidence', duration: 7, isPaid: true, programId: 'confidence-7 Days', title: '7-Day Inner Authority', completedAt: daysAgo(4), totalSessions: 21 },
];

const goalHistory = [
  { goal: 'focus', startedAt: daysAgo(27), source: 'onboarding' },
  { goal: 'confidence', startedAt: daysAgo(16), source: 'switch', previousGoal: 'focus' },
  { goal: 'discipline', startedAt: daysAgo(3), source: 'switch', previousGoal: 'confidence' },
];

const moodEmojis = ['😔', '😐', '🙂', '😊', '🤩'];
const moodLabels = ['Low', 'Okay', 'Good', 'Great', 'Amazing'];
const moodHistory = [];
for (let d = 1; d <= 2; d++) {
  const idx = 2 + (d % 3);
  moodHistory.push({
    day: d,
    program: 'discipline',
    programDuration: 5,
    moodIndex: idx,
    moodLabel: moodLabels[idx],
    moodEmoji: moodEmojis[idx],
    timestamp: daysAgo(3 - d),
  });
}

const reflectionData = [
  { day: 1, program: 'discipline', programDuration: 5, text: 'Followed through on the morning routine without hesitation. Felt in control today.', timestamp: daysAgo(2) },
  { day: 2, program: 'discipline', programDuration: 5, text: 'Skipped the midday check-in but caught myself and came back to it in the evening.', timestamp: daysAgo(1) },
];

const allDayCompletions = [
  { morning: true, midday: true, night: true },
  { morning: true, midday: true, night: true },
  { morning: true, midday: true, night: false },
  null,
  null,
];

const progress = {
  screen: 'app',
  program: 'discipline',
  setup: {
    timeMin: 30,
    wakeTime: '07:00',
    sleepTime: '23:00',
    unlocks: { morning: '07:00', midday: '12:00', night: '21:00' },
  },
  tab: 'home',
  day: 3,
  completions: { morning: true, midday: true, night: false },
  allDayCompletions,
  totalMinutes: 645,
  streak: 3,
  programCompleted: false,
  questionnaireAnswers: {},
  questionnaireStep: 0,
  reflectionData,
  activePaidProgram: {
    program: 'discipline',
    paidIndex: 0,
    duration: 5,
    title: '5-Day Execution Intensive',
    programId: 'discipline-5 Days',
  },
  activeProgramDuration: 5,
  programHistory,
  goalHistory,
  moodHistory,
};

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const password = await askHidden(`Password for ${email}: `);

  console.log('Signing in...');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  console.log('Signed in as', user.email, user.uid);

  if (!user.displayName || user.displayName === email.split('@')[0]) {
    await updateProfile(user, { displayName: 'Justin' });
  }

  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: 'Justin',
      progress,
      lastUpdated: new Date(),
    },
    { merge: true }
  );

  console.log('Demo data written to Firestore for', email);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
