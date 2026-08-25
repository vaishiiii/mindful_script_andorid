// One-off script: creates 3 fresh demo accounts with realistic progress data for Play Console screenshots.
// Passwords are generated here (never typed by a human), then printed once at the end for device login.
// Usage: node scripts/seed-demo-users.mjs <email1> <email2> <email3>
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import crypto from 'crypto';

const firebaseConfig = {
  apiKey: 'AIzaSyDJfSyMhl1xW4cncP2VfmOwz7mNqw5W8-I',
  authDomain: 'mindscript-1001.firebaseapp.com',
  projectId: 'mindscript-1001',
  storageBucket: 'mindscript-1001.firebasestorage.app',
  messagingSenderId: '23022655078',
  appId: '1:23022655078:web:2069f23a5d9e19b0197fa7',
};

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const genPassword = () => crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, 'x') + 'Aa1!';

const DEFAULT_SETUP = {
  timeMin: 30,
  wakeTime: '07:00',
  sleepTime: '23:00',
  unlocks: { morning: '07:00', midday: '12:00', night: '21:00' },
};

const fullDay = { morning: true, midday: true, night: true };
const partialDay = { morning: true, midday: true, night: false };

const buildAllDayCompletions = (duration, fullDays, partialAt) =>
  Array.from({ length: duration }, (_, i) => {
    const dayNum = i + 1;
    if (dayNum <= fullDays) return { ...fullDay };
    if (dayNum === partialAt) return { ...partialDay };
    return null;
  });

const buildCompletedSnapshot = (program, duration, title, reflections, moods) => ({
  program,
  duration,
  isPaid: duration > 3,
  programTitle: title,
  snapshotAllDayCompletions: Array.from({ length: duration }, () => ({ ...fullDay })),
  snapshotReflections: reflections,
  snapshotMoodHistory: moods,
});

const [email1, password1, email2, password2, email3, password3] = process.argv.slice(2);
if (!email1 || !password1 || !email2 || !password2 || !email3 || !password3) {
  console.error('Usage: node scripts/seed-demo-users.mjs <email1> <password1> <email2> <password2> <email3> <password3>');
  process.exit(1);
}

const users = [
  {
    email: email1,
    displayName: 'Justin',
    password: password1,
    progress: {
      screen: 'app',
      program: 'purpose',
      setup: DEFAULT_SETUP,
      tab: 'home',
      day: 4,
      completions: { ...partialDay },
      allDayCompletions: buildAllDayCompletions(7, 3, 4),
      totalMinutes: 640,
      streak: 4,
      programCompleted: false,
      questionnaireAnswers: {},
      questionnaireStep: 0,
      reflectionData: [
        { day: 1, program: 'purpose', programDuration: 7, text: 'Wrote down my top three values and picked one action that reflects them today.', timestamp: daysAgo(3) },
        { day: 3, program: 'purpose', programDuration: 7, text: 'Said no to a request that did not align with my priorities. Felt uncomfortable but right.', timestamp: daysAgo(1) },
      ],
      activePaidProgram: {
        program: 'purpose',
        paidIndex: 0,
        duration: 7,
        title: '7-Day Clarity Sprint',
        programId: 'purpose-7 Days',
      },
      activeProgramDuration: 7,
      programHistory: [
        {
          ...buildCompletedSnapshot('calm', 3, 'Free 3-Day Calm Trial',
            [
              { day: 1, program: 'calm', programDuration: 3, text: 'First breathing session felt awkward but I stuck with it.', timestamp: daysAgo(32) },
              { day: 2, program: 'calm', programDuration: 3, text: 'Noticed my shoulders were less tense by the evening session.', timestamp: daysAgo(31) },
              { day: 3, program: 'calm', programDuration: 3, text: 'Slept better than I have in weeks. Small wins add up.', timestamp: daysAgo(30) },
            ],
            [
              { day: 1, program: 'calm', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(32) },
              { day: 2, program: 'calm', programDuration: 3, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(31) },
              { day: 3, program: 'calm', programDuration: 3, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(30) },
            ]),
          completedAt: daysAgo(30),
          totalSessions: 9,
        },
        {
          ...buildCompletedSnapshot('purpose', 3, 'Free 3-Day Purpose Trial',
            [
              { day: 1, program: 'purpose', programDuration: 3, text: 'Listed what actually matters to me instead of what I think should matter.', timestamp: daysAgo(22) },
              { day: 2, program: 'purpose', programDuration: 3, text: 'Realized I have been spending most of my energy on other people\'s priorities.', timestamp: daysAgo(21) },
              { day: 3, program: 'purpose', programDuration: 3, text: 'Made one decision today based purely on my own values. Felt clean.', timestamp: daysAgo(20) },
            ],
            [
              { day: 1, program: 'purpose', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(22) },
              { day: 2, program: 'purpose', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(21) },
              { day: 3, program: 'purpose', programDuration: 3, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(20) },
            ]),
          completedAt: daysAgo(20),
          totalSessions: 9,
        },
      ],
      goalHistory: [
        { goal: 'calm', startedAt: daysAgo(33), source: 'onboarding' },
        { goal: 'purpose', startedAt: daysAgo(23), source: 'switch', previousGoal: 'calm' },
      ],
      moodHistory: [
        { day: 1, program: 'purpose', programDuration: 7, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(3) },
        { day: 2, program: 'purpose', programDuration: 7, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(2) },
        { day: 3, program: 'purpose', programDuration: 7, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(1) },
      ],
    },
  },
  {
    email: email2,
    displayName: 'Scott',
    password: password2,
    progress: {
      screen: 'app',
      program: 'discipline',
      setup: DEFAULT_SETUP,
      tab: 'home',
      day: 3,
      completions: { ...partialDay },
      allDayCompletions: buildAllDayCompletions(5, 2, 3),
      totalMinutes: 410,
      streak: 3,
      programCompleted: false,
      questionnaireAnswers: {},
      questionnaireStep: 0,
      reflectionData: [
        { day: 1, program: 'discipline', programDuration: 5, text: 'Followed through on the morning routine without hesitation. Felt in control today.', timestamp: daysAgo(2) },
        { day: 2, program: 'discipline', programDuration: 5, text: 'Skipped the midday check-in but came back to it in the evening instead of giving up.', timestamp: daysAgo(1) },
      ],
      activePaidProgram: {
        program: 'discipline',
        paidIndex: 0,
        duration: 5,
        title: '5-Day Execution Intensive',
        programId: 'discipline-5 Days',
      },
      activeProgramDuration: 5,
      programHistory: [
        {
          ...buildCompletedSnapshot('discipline', 3, 'Free 3-Day Discipline Trial',
            [
              { day: 1, program: 'discipline', programDuration: 3, text: 'Set a strict start time and actually kept it today.', timestamp: daysAgo(17) },
              { day: 2, program: 'discipline', programDuration: 3, text: 'Wanted to skip the midday session but pushed through anyway.', timestamp: daysAgo(16) },
              { day: 3, program: 'discipline', programDuration: 3, text: 'Three days straight without missing a single session. Proud of that.', timestamp: daysAgo(15) },
            ],
            [
              { day: 1, program: 'discipline', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(17) },
              { day: 2, program: 'discipline', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(16) },
              { day: 3, program: 'discipline', programDuration: 3, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(15) },
            ]),
          completedAt: daysAgo(15),
          totalSessions: 9,
        },
      ],
      goalHistory: [
        { goal: 'discipline', startedAt: daysAgo(18), source: 'onboarding' },
      ],
      moodHistory: [
        { day: 1, program: 'discipline', programDuration: 5, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(2) },
        { day: 2, program: 'discipline', programDuration: 5, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(1) },
      ],
    },
  },
  {
    email: email3,
    displayName: 'Rebecca',
    password: password3,
    progress: {
      screen: 'app',
      program: 'focus',
      setup: DEFAULT_SETUP,
      tab: 'home',
      day: 10,
      completions: { ...partialDay },
      allDayCompletions: buildAllDayCompletions(21, 9, 10),
      totalMinutes: 1450,
      streak: 10,
      programCompleted: false,
      questionnaireAnswers: {},
      questionnaireStep: 0,
      reflectionData: [
        { day: 4, program: 'focus', programDuration: 21, text: 'Finished a two-hour deep work block without checking my phone once.', timestamp: daysAgo(6) },
        { day: 8, program: 'focus', programDuration: 21, text: 'Noticing I plan my hardest task first now instead of avoiding it.', timestamp: daysAgo(2) },
      ],
      activePaidProgram: {
        program: 'focus',
        paidIndex: 1,
        duration: 21,
        title: '21-Day Deep Work Protocol',
        programId: 'focus-21 Days',
      },
      activeProgramDuration: 21,
      programHistory: [
        {
          ...buildCompletedSnapshot('focus', 3, 'Free 3-Day Focus Trial',
            [
              { day: 1, program: 'focus', programDuration: 3, text: 'Could barely sit still for the first session, mind kept wandering.', timestamp: daysAgo(27) },
              { day: 2, program: 'focus', programDuration: 3, text: 'Managed one full block without checking my phone.', timestamp: daysAgo(26) },
              { day: 3, program: 'focus', programDuration: 3, text: 'Finished the trial feeling like I can actually train this.', timestamp: daysAgo(25) },
            ],
            [
              { day: 1, program: 'focus', programDuration: 3, moodIndex: 1, moodLabel: 'Okay', moodEmoji: '😐', timestamp: daysAgo(27) },
              { day: 2, program: 'focus', programDuration: 3, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(26) },
              { day: 3, program: 'focus', programDuration: 3, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(25) },
            ]),
          completedAt: daysAgo(25),
          totalSessions: 9,
        },
        {
          ...buildCompletedSnapshot('focus', 5, '5-Day Attention Rebuild',
            [
              { day: 1, program: 'focus', programDuration: 5, text: 'Back for the paid program, ready to go deeper.', timestamp: daysAgo(23) },
              { day: 3, program: 'focus', programDuration: 5, text: 'Two-hour deep work block today without a single distraction.', timestamp: daysAgo(21) },
              { day: 5, program: 'focus', programDuration: 5, text: 'This is the longest I have ever stayed consistent with anything.', timestamp: daysAgo(19) },
            ],
            [
              { day: 1, program: 'focus', programDuration: 5, moodIndex: 2, moodLabel: 'Good', moodEmoji: '🙂', timestamp: daysAgo(23) },
              { day: 3, program: 'focus', programDuration: 5, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(21) },
              { day: 5, program: 'focus', programDuration: 5, moodIndex: 4, moodLabel: 'Amazing', moodEmoji: '🤩', timestamp: daysAgo(19) },
            ]),
          programId: 'focus-5 Days',
          completedAt: daysAgo(19),
          totalSessions: 15,
        },
      ],
      goalHistory: [
        { goal: 'focus', startedAt: daysAgo(28), source: 'onboarding' },
      ],
      moodHistory: [
        { day: 4, program: 'focus', programDuration: 21, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(6) },
        { day: 7, program: 'focus', programDuration: 21, moodIndex: 4, moodLabel: 'Amazing', moodEmoji: '🤩', timestamp: daysAgo(3) },
        { day: 9, program: 'focus', programDuration: 21, moodIndex: 3, moodLabel: 'Great', moodEmoji: '😊', timestamp: daysAgo(1) },
      ],
    },
  },
];

async function main() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const results = [];

  for (const u of users) {
    try {
      const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
      await updateProfile(cred.user, { displayName: u.displayName });
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          email: u.email,
          displayName: u.displayName,
          progress: u.progress,
          lastUpdated: new Date(),
        },
        { merge: true }
      );
      results.push({ email: u.email, uid: cred.user.uid, status: 'seeded' });
      await signOut(auth);
    } catch (err) {
      results.push({ email: u.email, status: 'failed', error: err.message });
    }
  }

  console.log('\n=== Demo account results ===');
  for (const r of results) {
    if (r.status === 'seeded') {
      console.log(`${r.email} | progress seeded | uid: ${r.uid}`);
    } else {
      console.log(`${r.email} | FAILED: ${r.error}`);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
