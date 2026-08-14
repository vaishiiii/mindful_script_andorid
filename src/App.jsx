import React, { useState, useEffect, useRef } from 'react';
import { LoginScreen, GoalScreen, QuestionnaireScreen, SetupScreen, IdentityScreen, DayCelebration, OnboardingSlides } from '@/components/onboarding';
import { HomeTab, ProgramsTab, ProgressTab, ProfileTab, ReportScreen, BottomNav } from '@/components/app';
import { saveToStorage, loadFromStorage, isDevMode, toggleDevMode, isTesterReviewUser } from '@/utils/helpers';
import paidProgramCalm7 from '@/data/paidProgramCalm7';
import { PROGRAMS } from '@/data/programs';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { onAuthChange, handleGoogleRedirectResult } from '@/utils/auth';
import { getUserProfile, saveUserProgress } from '@/utils/userDb';

const APP_THEMES = {
  calm: { top: '#D7F2F4', mid: '#EAF9FA', glow: '#8EC7CF', contrast: '#3D6A71' },
  focus: { top: '#DCE4FF', mid: '#EEF2FF', glow: '#8F9AD8', contrast: '#414E8A' },
  confidence: { top: '#F8E3C8', mid: '#FFF3E4', glow: '#D5A466', contrast: '#7D5A2B' },
  healing: { top: '#E0F0DA', mid: '#F0F8ED', glow: '#9DC48E', contrast: '#48663F' },
  discipline: { top: '#DCE9F5', mid: '#EFF5FB', glow: '#7F9FBE', contrast: '#365675' },
  purpose: { top: '#E8DDF8', mid: '#F6F0FF', glow: '#B191D7', contrast: '#64448C' },
  habit: { top: '#DDF0E0', mid: '#EFF9F0', glow: '#88BE8E', contrast: '#3F6C43' },
};

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'mindscript_state',
};

const INTRO_KEY = 'ms_intro_seen_v2';

const DEFAULT_SETUP = {
  timeMin: 30,
  wakeTime: '07:00',
  sleepTime: '23:00',
  unlocks: { morning: '07:00', midday: '12:00', night: '21:00' },
};

const DEFAULT_COMPLETIONS = { morning: false, midday: false, night: false };

const LAUNCH_PROGRAM_PROMPTS = [
  {
    tag: 'Keep Your Momentum',
    title: 'You have already proved you can do this.',
    body: 'Do not let this progress fade. Choose your next guided program now and lock in what you have started.',
    cta: 'Choose Next Program →',
  },
  {
    tag: 'Your Growth Is Real',
    title: 'The old version of you is already behind you.',
    body: 'You completed the first step. Keep that emotional edge alive by starting the next program before momentum cools down.',
    cta: 'Continue The Journey →',
  },
  {
    tag: 'Build The Streak',
    title: 'Small daily wins become a new identity.',
    body: 'You are closer than you think. Pick your next program today and turn this short success into long-term change.',
    cta: 'Start Next Program →',
  },
];

const getUserStateKey = (userId) => `${STORAGE_KEYS.APP_STATE}_${userId}`;

const withTimeout = (promise, ms, fallbackValue) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms)),
  ]);

const hasMeaningfulState = (state) => {
  if (!state || typeof state !== 'object') {
    return false;
  }

  const hasProgram = Boolean(state.program || state.activePaidProgram);
  const hasHistory =
    (Array.isArray(state.programHistory) && state.programHistory.length > 0) ||
    (Array.isArray(state.goalHistory) && state.goalHistory.length > 0);
  const hasCompletions =
    Array.isArray(state.allDayCompletions) &&
    state.allDayCompletions.some((entry) => entry && (entry.morning || entry.midday || entry.night));

  return hasProgram || hasHistory || hasCompletions;
};

function App() {
  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  // Prevents mount-effect from racing with auth listener on initial load
  const [authInitialized, setAuthInitialized] = useState(false);

  // Screen and tab must be declared before useEffects that reference them
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");
  const [reportReturnTab, setReportReturnTab] = useState("home");
  const [programsFocusTarget, setProgramsFocusTarget] = useState(null);
  const [showPreLoginSplash, setShowPreLoginSplash] = useState(false);
  const [hasShownPreLoginSplash, setHasShownPreLoginSplash] = useState(false);
  const isTesterReview = isTesterReviewUser(currentUser?.email);

  // Listen for authentication state changes
  useEffect(() => {
    localStorage.removeItem('mindscript_google_redirect_pending');

    // Handle Google redirect sign-in result (fires once on page load after redirect)
    handleGoogleRedirectResult().catch(err =>
      console.warn('[App] Could not process Google redirect result:', err)
    );

    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);

      if (user) {
        const restoreAuthenticatedState = async () => {
          try {
            console.log('[App Auth] User logged in:', user.email, user.displayName);
            setAuthInitialized(true);
            setShowOnboarding(false);

            if (isTesterReviewUser(user.email) && !isDevMode()) {
              // Keep tester account in dev mode by default for review/testing flows.
              toggleDevMode(user.email);
            }

            const applyProgressState = (state) => {
              setProgram(state.program || null);
              setSetup(state.setup || DEFAULT_SETUP);
              setTab('home');
              setDay(state.day || 1);
              setCompletions(state.completions || DEFAULT_COMPLETIONS);
              setTotalMinutes(state.totalMinutes || 0);
              setStreak(state.streak || 0);
              setProgramCompleted(state.programCompleted || false);
              setQuestionnaireAnswers(state.questionnaireAnswers || {});
              setReflectionData(state.reflectionData || []);
              setProgramHistory(state.programHistory || []);
              setGoalHistory(state.goalHistory || []);
              setMoodHistory(state.moodHistory || []);

              const savedPaidProgram = state.activePaidProgram;
              if (savedPaidProgram?.duration) {
                const duration = savedPaidProgram.duration;
                setActiveProgramDuration(duration);
                if (savedPaidProgram.program === 'calm' && duration === 7) {
                  setActivePaidProgram({ ...savedPaidProgram, data: paidProgramCalm7 });
                } else {
                  setActivePaidProgram(savedPaidProgram);
                }
                const saved = state.allDayCompletions || [];
                setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
              } else {
                setActivePaidProgram(null);
                const duration = state.activeProgramDuration || 3;
                setActiveProgramDuration(duration);
                const saved = state.allDayCompletions || [];
                setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
              }

              setScreen(state.program ? 'app' : 'goal');
            };

            // 1. If onboarding was interrupted by login, finish restoring it
            const onboardingData = loadFromStorage('mindscript_onboarding_data', null);
            if (onboardingData) {
              console.log('[App Auth] Restoring onboarding data');
              setProgram(onboardingData.program);
              setQuestionnaireAnswers(onboardingData.questionnaireAnswers || {});
              setSetup(onboardingData.setup || DEFAULT_SETUP);
              setTab('home');
              localStorage.removeItem('mindscript_onboarding_data');
              setScreen('app');
              return;
            }

            // 2. Try user-scoped local state first.
            const userStateKey = getUserStateKey(user.uid);
            const savedState = loadFromStorage(userStateKey, null);

            if (savedState) {
              saveToStorage(userStateKey, savedState);
              applyProgressState(savedState);
              return;
            }

            // 3. Try Firestore with timeout so login doesn't look stuck on slow network.
            const profileResult = await withTimeout(
              getUserProfile(user.uid),
              4000,
              { success: false, error: 'timeout' }
            );
            if (profileResult.success && profileResult.data?.progress) {
              console.log('[App Auth] Restoring state from Firestore');
              const progress = profileResult.data.progress;
              saveToStorage(userStateKey, progress);
              applyProgressState(progress);
              return;
            }

            // 4. Only after user-scoped and Firestore fail, fall back to anonymous snapshot.
            const anonymousState = loadFromStorage(STORAGE_KEYS.APP_STATE, null);
            if (hasMeaningfulState(anonymousState)) {
              console.log('[App Auth] Restoring fallback state from anonymous snapshot');
              saveToStorage(userStateKey, anonymousState);
              applyProgressState(anonymousState);
              return;
            }

            // 5. Brand-new user or timed out profile read.
            setScreen('goal');
          } catch (error) {
            console.warn('[App Auth] Failed to restore authenticated state, using safe fallback:', error);
            setAuthInitialized(true);
            setScreen('goal');
          }
        };

        restoreAuthenticatedState();
      } else {
        // Not authenticated
        console.log('[App Auth] Not authenticated');
        setAuthInitialized(true);
        setScreen('login');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Refs for back button handler to avoid stale closures
  const screenRef = useRef(screen);
  const tabRef = useRef(tab);
  const reportReturnTabRef = useRef(reportReturnTab);
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { reportReturnTabRef.current = reportReturnTab; }, [reportReturnTab]);

  const closeReport = () => {
    const currentProgramDuration = viewingHistoryReport?.duration || activeProgramDuration;
    const shouldPromptNextProgram = !viewingHistoryReport && Number(currentProgramDuration) === 3;
    setViewingHistoryReport(null);
    setTab(reportReturnTabRef.current || "home");
    setScreen("app");
    if (shouldPromptNextProgram) {
      setShowNextProgramPrompt(true);
    }
  };

  const openReport = (historyReport = null) => {
    setReportReturnTab(tabRef.current || "home");
    setViewingHistoryReport(historyReport);
    window.history.pushState({ mindscriptView: "report" }, "", window.location.href);
    setScreen("report");
  };

  // Android hardware back button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (screenRef.current === "report") {
        if (window.history.state?.mindscriptView === "report") {
          window.history.back();
        } else {
          closeReport();
        }
        return;
      }

      // If a session modal (or any overlay) pushed a history entry, go back in web history
      if (canGoBack) {
        window.history.back();
        return;
      }
      const currentScreen = screenRef.current;
      const currentTab = tabRef.current;
      if (currentScreen === 'app') {
        if (currentTab !== 'home') {
          setTab('home');
        } else {
          CapApp.minimizeApp();
        }
      } else if (currentScreen === 'login') {
        CapApp.minimizeApp();
      } else {
        // celebrate, report, onboarding screens — go back to app if possible
        setScreen('app');
      }
    });

    return () => {
      listenerPromise.then((h) => h.remove()).catch(() => {});
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (screenRef.current === "report") {
        closeReport();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Show onboarding slides on very first launch
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(INTRO_KEY)
  );

  // Show a brief splash before login on fresh app launch.
  useEffect(() => {
    if (!authInitialized || currentUser || screen !== 'login' || hasShownPreLoginSplash || showOnboarding) {
      return;
    }

    setShowPreLoginSplash(true);
    const timer = setTimeout(() => {
      setShowPreLoginSplash(false);
      setHasShownPreLoginSplash(true);
    }, 1400);

    return () => clearTimeout(timer);
  }, [authInitialized, currentUser, screen, hasShownPreLoginSplash, showOnboarding]);

  // Onboarding
  const [program, setProgram] = useState(null);
  const [setup, setSetup] = useState({
    timeMin: 30,
    wakeTime: "07:00",
    sleepTime: "23:00",
    unlocks: { morning: "07:00", midday: "12:00", night: "21:00" },
  });

  // App state
  const [day, setDay] = useState(1);
  const [completions, setCompletions] = useState({ morning: false, midday: false, night: false });
  const [allDayCompletions, setAllDayCompletions] = useState([null, null, null]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [programCompleted, setProgramCompleted] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});
  const [reflectionData, setReflectionData] = useState([]);
  
  // Paid program state
  const [activePaidProgram, setActivePaidProgram] = useState(null); // { program, paidIndex, duration, data }
  const [activeProgramDuration, setActiveProgramDuration] = useState(3); // default 3 days for free program
  
  // Program history - track all programs completed by the user
  const [programHistory, setProgramHistory] = useState([]); // Array of { program, duration, completedAt, totalSessions }
  const [goalHistory, setGoalHistory] = useState([]); // Array of { goal, startedAt, source, previousGoal }
  const [moodHistory, setMoodHistory] = useState([]); // Array of { day, program, programDuration, moodIndex, moodLabel, moodEmoji, timestamp }
  const [showNextProgramPrompt, setShowNextProgramPrompt] = useState(false);
  const [showLaunchProgramsPrompt, setShowLaunchProgramsPrompt] = useState(false);
  const [hasShownLaunchProgramsPrompt, setHasShownLaunchProgramsPrompt] = useState(false);
  const [launchProgramsPromptIndex, setLaunchProgramsPromptIndex] = useState(0);

  // When non-null, shows the report screen for a past completed program
  const [viewingHistoryReport, setViewingHistoryReport] = useState(null);

  const applySavedState = (savedState) => {
    if (!savedState) {
      return false;
    }

    console.log('[App] Applying saved state, screen:', savedState.screen);
    setScreen(savedState.screen || 'login');
    setProgram(savedState.program || null);
    setSetup(savedState.setup || DEFAULT_SETUP);
    setTab(savedState.tab || 'home');
    setDay(savedState.day || 1);
    setCompletions(savedState.completions || DEFAULT_COMPLETIONS);

    const savedPaidProgram = savedState.activePaidProgram;
    let actualDuration = savedState.activeProgramDuration || 3;

    if (savedPaidProgram && savedPaidProgram.duration) {
      actualDuration = savedPaidProgram.duration;
      console.log(`[App] Loading paid program: ${savedPaidProgram.program} ${actualDuration}-day`);

      if (savedPaidProgram.program === 'calm' && savedPaidProgram.duration === 7) {
        setActivePaidProgram({
          ...savedPaidProgram,
          data: paidProgramCalm7,
        });
      } else {
        setActivePaidProgram(savedPaidProgram);
      }
    } else {
      setActivePaidProgram(null);
    }

    setActiveProgramDuration(actualDuration);

    const savedCompletions = savedState.allDayCompletions || [];
    const properSizedCompletions = Array(actualDuration).fill(null).map((_, index) => savedCompletions[index] || null);
    setAllDayCompletions(properSizedCompletions);

    setTotalMinutes(savedState.totalMinutes || 0);
    setStreak(savedState.streak || 0);
    setProgramCompleted(savedState.programCompleted || false);
    setQuestionnaireAnswers(savedState.questionnaireAnswers || {});
    setReflectionData(savedState.reflectionData || []);
    setProgramHistory(savedState.programHistory || []);
    setGoalHistory(savedState.goalHistory || []);
    setMoodHistory(savedState.moodHistory || []);

    return true;
  };

  const buildAppState = () => ({
    screen,
    program,
    setup,
    tab,
    day,
    completions,
    allDayCompletions,
    totalMinutes,
    streak,
    programCompleted,
    questionnaireAnswers,
    reflectionData,
    activePaidProgram,
    activeProgramDuration,
    programHistory,
    goalHistory,
    moodHistory,
  });

  // Preload non-screen state on mount so it's available once auth fires
  // We deliberately do NOT set the screen here to avoid racing with the auth listener.
  useEffect(() => {
    const savedState = loadFromStorage(STORAGE_KEYS.APP_STATE, null);
    if (!savedState) return;
    console.log('[App Mount] Preloading saved state (screen will be set by auth listener)');
    setProgram(savedState.program || null);
    setSetup(savedState.setup || DEFAULT_SETUP);
    setTab(savedState.tab || 'home');
    setDay(savedState.day || 1);
    setCompletions(savedState.completions || DEFAULT_COMPLETIONS);
    setTotalMinutes(savedState.totalMinutes || 0);
    setStreak(savedState.streak || 0);
    setProgramCompleted(savedState.programCompleted || false);
    setQuestionnaireAnswers(savedState.questionnaireAnswers || {});
    setReflectionData(savedState.reflectionData || []);
    setProgramHistory(savedState.programHistory || []);
    setGoalHistory(savedState.goalHistory || []);
    setMoodHistory(savedState.moodHistory || []);
    const savedPaidProgram = savedState.activePaidProgram;
    if (savedPaidProgram?.duration) {
      const duration = savedPaidProgram.duration;
      setActiveProgramDuration(duration);
      if (savedPaidProgram.program === 'calm' && duration === 7) {
        setActivePaidProgram({ ...savedPaidProgram, data: paidProgramCalm7 });
      } else {
        setActivePaidProgram(savedPaidProgram);
      }
      const saved = savedState.allDayCompletions || [];
      setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
    } else {
      const duration = savedState.activeProgramDuration || 3;
      setActiveProgramDuration(duration);
      const saved = savedState.allDayCompletions || [];
      setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
    }
  }, []);

  useEffect(() => {
    if (!authInitialized || !currentUser || screen !== 'app' || hasShownLaunchProgramsPrompt || showNextProgramPrompt) {
      return;
    }

    const completedFreeProgram = programHistory.some((entry) => Number(entry?.duration || 0) === 3);
    if (!completedFreeProgram || activePaidProgram) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * LAUNCH_PROGRAM_PROMPTS.length);
    setLaunchProgramsPromptIndex(randomIndex);
    setShowLaunchProgramsPrompt(true);
    setHasShownLaunchProgramsPrompt(true);
  }, [authInitialized, currentUser, screen, hasShownLaunchProgramsPrompt, showNextProgramPrompt, programHistory, activePaidProgram]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (screen !== "login") {
      const stateToPersist = buildAppState();
      saveToStorage(STORAGE_KEYS.APP_STATE, stateToPersist);

      if (currentUser?.uid) {
        saveToStorage(getUserStateKey(currentUser.uid), stateToPersist);
        saveUserProgress(currentUser.uid, stateToPersist).catch((error) => {
          console.warn('[App] Failed to save progress to Firestore:', error);
        });
      }
    }
  }, [screen, program, setup, tab, day, completions, allDayCompletions, totalMinutes, streak, programCompleted, questionnaireAnswers, reflectionData, activePaidProgram, activeProgramDuration, programHistory, goalHistory, moodHistory, currentUser]);

  const handleMoodLog = ({ day: moodDay, program: moodProgram, programDuration, moodIndex, moodLabel, moodEmoji }) => {
    if (!moodProgram || typeof moodIndex !== 'number') {
      return;
    }

    setMoodHistory((prev) => {
      const entry = {
        day: Number(moodDay || day),
        program: moodProgram,
        programDuration: Number(programDuration || activeProgramDuration),
        moodIndex,
        moodLabel,
        moodEmoji,
        timestamp: new Date().toISOString(),
      };

      const lastIdx = [...prev].findLastIndex((item) => (
        Number(item?.day || 0) === entry.day &&
        item?.program === entry.program &&
        Number(item?.programDuration || 3) === entry.programDuration
      ));

      if (lastIdx < 0) {
        return [...prev, entry];
      }

      const existing = prev[lastIdx];
      if (existing?.moodIndex === entry.moodIndex) {
        return prev;
      }

      const next = [...prev];
      next[lastIdx] = entry;
      return next;
    });
  };

  const markGoalStarted = (goalId, source = 'switch') => {
    setGoalHistory((prev) => [
      ...prev,
      {
        goal: goalId,
        startedAt: new Date().toISOString(),
        source,
        previousGoal: program || null,
      },
    ]);
  };

  const handleSwitchGoal = (nextGoal) => {
    if (!nextGoal || nextGoal === program) {
      return;
    }

    const devModeEnabled = isDevMode();
    const completedTrials = programHistory.filter((entry) => entry.duration === 3 && !entry.isPaid).length;
    const completedPaidPrograms = programHistory.filter((entry) => entry.isPaid).length;
    const canSwitchGoals = completedTrials >= 1 && completedPaidPrograms >= 1;

    if (!devModeEnabled && !isTesterReview && !canSwitchGoals) {
      console.warn('[App] Goal switch blocked: requires completion of 1 free 3-day program and 1 paid program.');
      return;
    }

    if (!devModeEnabled && !isTesterReview && !programCompleted) {
      console.warn('[App] Goal switch blocked: current program must be completed first.');
      return;
    }

    markGoalStarted(nextGoal, 'switch');
    setProgram(nextGoal);
    setActivePaidProgram(null);
    setActiveProgramDuration(3);
    setDay(1);
    setCompletions({ morning: false, midday: false, night: false });
    setAllDayCompletions([null, null, null]);
    setProgramCompleted(false);
    setQuestionnaireAnswers({});
    setSetup(DEFAULT_SETUP);
    setTab('home');
    setScreen('questionnaire');
  };

  const handleSessionComplete = (type, options = {}) => {
    const shouldAutoCompleteDayOne =
      type === 'night' &&
      options?.lateStartNight === true &&
      day === 1 &&
      !completions.morning &&
      !completions.midday &&
      !completions.night;

    const updated = shouldAutoCompleteDayOne
      ? { morning: true, midday: true, night: true }
      : { ...completions, [type]: true };
    setCompletions(updated);
    setTotalMinutes((m) => m + Math.round(setup.timeMin / 3));

    if (type === "night") {
      const newAll = [...allDayCompletions];
      newAll[day - 1] = updated;
      setAllDayCompletions(newAll);
      setStreak((s) => s + 1);
      setTimeout(() => setScreen("celebrate"), 400);
    }
  };

  const handleDevSkipDay = () => {
    if (!isDevMode()) {
      return;
    }

    const completedDay = { morning: true, midday: true, night: true };
    setCompletions(completedDay);
    setAllDayCompletions((prev) => {
      const next = [...prev];
      next[day - 1] = completedDay;
      return next;
    });
    setTotalMinutes((m) => m + setup.timeMin);
    setStreak((s) => s + 1);
    setScreen("celebrate");
  };

  const handleCelebrationContinue = () => {
    if (day >= activeProgramDuration) {
      // Add to program history when program is completed
      const sessionsCompleted = allDayCompletions.reduce((s, d) => s + (d?.morning ? 1 : 0) + (d?.midday ? 1 : 0) + (d?.night ? 1 : 0), 0);
      
      // Snapshot the reflections that belong to this program cycle
      const isThisPaid = activePaidProgram !== null || activeProgramDuration > 3;
      const snapshotReflections = reflectionData.filter((entry) => {
        const sameProgram = entry?.program === (activePaidProgram ? activePaidProgram.program : program);
        const samePaidState = Boolean(entry?.isPaidProgram) === isThisPaid;
        const entryDuration = entry?.programDuration || 3;
        return sameProgram && samePaidState && (entryDuration === activeProgramDuration);
      });

      const snapshotMoodHistory = moodHistory.filter((entry) => {
        const sameProgram = entry?.program === (activePaidProgram ? activePaidProgram.program : program);
        const entryDuration = entry?.programDuration || 3;
        return sameProgram && (Number(entryDuration) === Number(activeProgramDuration));
      });

      setProgramHistory(prev => [...prev, {
        program: activePaidProgram ? activePaidProgram.program : program,
        duration: activeProgramDuration,
        completedAt: new Date().toISOString(),
        totalSessions: sessionsCompleted,
        isPaid: activePaidProgram !== null,
        programTitle: activePaidProgram ? activePaidProgram.title : `${program} 3-Day Free Program`,
        snapshotAllDayCompletions: [...allDayCompletions],
        snapshotReflections,
        snapshotMoodHistory,
      }]);
      
      setProgramCompleted(true);
      
      // Clear active paid program so user can select a new one
      setActivePaidProgram(null);
      
      openReport(null);
    } else {
      setDay((d) => d + 1);
      setCompletions({ morning: false, midday: false, night: false });
      setScreen("app");
    }
  };

  const handleReset = () => {
    setDay(1);
    setCompletions({ morning: false, midday: false, night: false });
    setAllDayCompletions([null, null, null]);
    setTotalMinutes(0);
    setStreak(0);
    setProgramCompleted(false);
    setQuestionnaireAnswers({});
    setReflectionData([]);
    setGoalHistory([]);
    setMoodHistory([]);
    setTab("home");
  };

  const handleReflectionComplete = (reflections) => {
    const baseEntry = {
      day,
      program,
      sessionType: reflections?.sessionType || null,
      isPaidProgram: Boolean(activePaidProgram !== null || activeProgramDuration > 3),
      programDuration: activeProgramDuration,
      timestamp: new Date().toISOString(),
      ...reflections,
    };

    setReflectionData((prev) => {
      const normalizedIncoming = {
        ...baseEntry,
        day: Number(baseEntry?.day || day),
        isPaidProgram: Boolean(baseEntry?.isPaidProgram),
        programDuration: Number(baseEntry?.programDuration || activeProgramDuration),
      };

      const targetIndex = [...prev].findLastIndex((entry) => {
        if (!entry?.sessionType || !normalizedIncoming?.sessionType) {
          return false;
        }
        return (
          entry.program === normalizedIncoming.program &&
          entry.sessionType === normalizedIncoming.sessionType &&
          Number(entry.day || 0) === Number(normalizedIncoming.day || 0) &&
          Boolean(entry.isPaidProgram) === Boolean(normalizedIncoming.isPaidProgram) &&
          Number(entry.programDuration || 3) === Number(normalizedIncoming.programDuration || 3)
        );
      });

      if (targetIndex < 0) {
        return [...prev, normalizedIncoming];
      }

      const existing = prev[targetIndex] || {};
      const merged = {
        ...existing,
        ...normalizedIncoming,
        taskInputs: { ...(existing.taskInputs || {}), ...(normalizedIncoming.taskInputs || {}) },
        taskPrompts: { ...(existing.taskPrompts || {}), ...(normalizedIncoming.taskPrompts || {}) },
        answers: { ...(existing.answers || {}), ...(normalizedIncoming.answers || {}) },
      };

      const next = [...prev];
      next[targetIndex] = merged;
      return next;
    });
  };

  const handleReflectionSave = (reflection) => {
    const normalizedIncoming = {
      ...reflection,
      day: Number(reflection?.day || day),
      program: reflection?.program || program,
      sessionType: reflection?.sessionType || null,
      isPaidProgram: Boolean(
        typeof reflection?.isPaidProgram === 'boolean'
          ? reflection.isPaidProgram
          : (activePaidProgram !== null || activeProgramDuration > 3)
      ),
      programDuration: Number(reflection?.programDuration || activeProgramDuration),
      timestamp: reflection?.timestamp || new Date().toISOString(),
    };

    setReflectionData((prev) => {
      const targetIndex = [...prev].findLastIndex((entry) => {
        if (!entry?.sessionType || !normalizedIncoming?.sessionType) {
          return false;
        }
        return (
          entry.program === normalizedIncoming.program &&
          entry.sessionType === normalizedIncoming.sessionType &&
          Number(entry.day || 0) === Number(normalizedIncoming.day || 0) &&
          Boolean(entry.isPaidProgram) === Boolean(normalizedIncoming.isPaidProgram) &&
          Number(entry.programDuration || 3) === Number(normalizedIncoming.programDuration || 3)
        );
      });

      if (targetIndex < 0) {
        return [...prev, normalizedIncoming];
      }

      const existing = prev[targetIndex] || {};
      const merged = {
        ...existing,
        ...normalizedIncoming,
        taskInputs: { ...(existing.taskInputs || {}), ...(normalizedIncoming.taskInputs || {}) },
        taskPrompts: { ...(existing.taskPrompts || {}), ...(normalizedIncoming.taskPrompts || {}) },
        answers: { ...(existing.answers || {}), ...(normalizedIncoming.answers || {}) },
      };

      const next = [...prev];
      next[targetIndex] = merged;
      return next;
    });
  };

  const handleSelectPaidProgram = (paidProgram) => {
    // paidProgram = { program, paidIndex, duration, data, programId }
    setActivePaidProgram(paidProgram);
    setActiveProgramDuration(paidProgram.duration);
    // Reset progress for new program
    setDay(1);
    setCompletions({ morning: false, midday: false, night: false });
    setAllDayCompletions(Array(paidProgram.duration).fill(null));
    setProgramCompleted(false); // Reset completion status
    // Stay on programs tab but can navigate back to home
    setTab("home");
  };

  const handleViewCompletedProgram = (historyEntry) => {
    if (!historyEntry) return;
    openReport(historyEntry);
  };

  const handleExitActiveProgram = () => {
    setActivePaidProgram(null);
    setActiveProgramDuration(3);
    setDay(1);
    setCompletions({ morning: false, midday: false, night: false });
    setAllDayCompletions([null, null, null]);
    // User has already completed at least one program cycle in this path.
    setProgramCompleted(true);
  };

  const isCurrentContextPaid = activePaidProgram !== null || activeProgramDuration > 3;
  const currentProgramReflections = reflectionData.filter((entry) => {
    const sameProgram = entry?.program === program;
    const samePaidState = Boolean(entry?.isPaidProgram) === isCurrentContextPaid;
    const entryDuration = entry?.programDuration || 3;
    const sameDuration = entryDuration === activeProgramDuration;
    return sameProgram && samePaidState && sameDuration;
  });

  const postTrialHomeMode = Boolean(
    programCompleted &&
    !activePaidProgram
  );

  const latestCompletedCycle = [...programHistory]
    .filter((entry) => entry?.program === program)
    .sort((a, b) => new Date(b?.completedAt || 0) - new Date(a?.completedAt || 0))[0];
  const postTrialCompletionKey = latestCompletedCycle?.completedAt || null;

  const inApp = screen === "app";
  const currentProgramMeta = PROGRAMS.find((p) => p.id === program) || null;
  const appAccent = currentProgramMeta?.color || '#7A9E87';
  const appTheme = APP_THEMES[program] || APP_THEMES.calm;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ms-accent', appAccent);
    root.style.setProperty('--ms-accent-soft', `${appAccent}55`);
    root.style.setProperty('--ms-accent-bg', currentProgramMeta?.bg || '#E8F0EB');
    root.style.setProperty('--ms-accent-contrast', appTheme.contrast);
  }, [appAccent, appTheme.contrast, currentProgramMeta]);

  // Show branded splash while Firebase resolves auth — prevents login flash and blank handoff.
  if (!authInitialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(150% 120% at 50% 8%, #194438 0%, #102920 52%, #0a1712 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          color: '#EAF3ED',
          textAlign: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(120% 95% at 50% -18%, rgba(122,255,209,0.24) 0%, rgba(122,255,209,0.02) 44%, rgba(0,0,0,0) 100%)',
            animation: 'premiumSplashShift 12s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(86,255,197,0.28) 0%, rgba(86,255,197,0) 72%)',
            top: -160,
            left: -120,
            filter: 'blur(6px)',
            animation: 'heroGlowDrift 9.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(105,176,255,0.24) 0%, rgba(105,176,255,0) 74%)',
            right: -120,
            bottom: -130,
            filter: 'blur(4px)',
            animation: 'premiumPulse 8.8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 22%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'conic-gradient(from 30deg, rgba(144,255,214,0.18) 0deg, rgba(144,255,214,0.72) 82deg, rgba(98,173,255,0.62) 170deg, rgba(144,255,214,0.18) 360deg)',
              animation: 'premiumHaloSpin 8.8s linear infinite',
              boxShadow: '0 0 26px rgba(104,220,184,0.44)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 10,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20,52,41,0.98) 0%, rgba(16,39,31,0.95) 100%)',
              border: '1.5px solid rgba(175,255,225,0.36)',
              boxShadow: 'inset 0 0 20px rgba(83,206,165,0.25), 0 10px 26px rgba(0,0,0,0.34)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
              <path d="M23 6 C30 10 40 15 37 25 C34 35 20 40 13 31 C6 22 13 10 23 6 Z" fill="rgba(228,255,245,0.95)"/>
              <path d="M23 6 C21 16 19 26 23 42" stroke="rgba(165,246,218,0.65)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '38px', fontWeight: 500, letterSpacing: '0.05em', color: '#EFFFF7', animation: 'premiumTextGlow 3.2s ease-in-out infinite' }}>
            Mindscript
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(220,247,235,0.9)', letterSpacing: '0.02em' }}>Rewire your mind. One mindful script at a time.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '2px', zIndex: 1 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0s infinite' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0.15s infinite' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0.3s infinite' }} />
        </div>
      </div>
    );
  }

  // First-ever launch: show animated onboarding slides
  if (showPreLoginSplash) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(150% 120% at 50% 8%, #194438 0%, #102920 52%, #0a1712 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          color: '#EAF3ED',
          textAlign: 'center',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(120% 95% at 50% -18%, rgba(122,255,209,0.24) 0%, rgba(122,255,209,0.02) 44%, rgba(0,0,0,0) 100%)',
            animation: 'premiumSplashShift 12s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(86,255,197,0.28) 0%, rgba(86,255,197,0) 72%)',
            top: -160,
            left: -120,
            filter: 'blur(6px)',
            animation: 'heroGlowDrift 9.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(105,176,255,0.24) 0%, rgba(105,176,255,0) 74%)',
            right: -120,
            bottom: -130,
            filter: 'blur(4px)',
            animation: 'premiumPulse 8.8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 22%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            width: 124,
            height: 124,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'conic-gradient(from 30deg, rgba(144,255,214,0.18) 0deg, rgba(144,255,214,0.72) 82deg, rgba(98,173,255,0.62) 170deg, rgba(144,255,214,0.18) 360deg)',
              animation: 'premiumHaloSpin 8.8s linear infinite',
              boxShadow: '0 0 26px rgba(104,220,184,0.44)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 10,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20,52,41,0.98) 0%, rgba(16,39,31,0.95) 100%)',
              border: '1.5px solid rgba(175,255,225,0.36)',
              boxShadow: 'inset 0 0 20px rgba(83,206,165,0.25), 0 10px 26px rgba(0,0,0,0.34)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
              <path d="M23 6 C30 10 40 15 37 25 C34 35 20 40 13 31 C6 22 13 10 23 6 Z" fill="rgba(228,255,245,0.95)"/>
              <path d="M23 6 C21 16 19 26 23 42" stroke="rgba(165,246,218,0.65)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '38px', fontWeight: 500, letterSpacing: '0.05em', color: '#EFFFF7', animation: 'premiumTextGlow 3.2s ease-in-out infinite' }}>
            Mindscript
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(220,247,235,0.9)', letterSpacing: '0.02em' }}>Preparing your daily ritual...</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '2px', zIndex: 1 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0s infinite' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0.15s infinite' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#D9FFF2', boxShadow: '0 0 12px rgba(130,255,214,0.72)', animation: 'splashDot 1.2s ease-in-out 0.3s infinite' }} />
        </div>
      </div>
    );
  }

  if (showOnboarding && !currentUser) {
    return (
      <OnboardingSlides
        showIntroSplash={false}
        onDone={() => {
          localStorage.setItem(INTRO_KEY, '1');
          localStorage.setItem('ms_onboarding_done', '1');
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${appTheme.top} 0%, ${appTheme.mid} 26%, #F7F6F2 60%, #F7F6F2 100%)`,
        position: "relative"
      }}
    >
      {showNextProgramPrompt && screen === "app" && (
        <div
          onClick={() => setShowNextProgramPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(31,41,36,0.34)',
            zIndex: 1600,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 'max(10px, env(safe-area-inset-top)) 14px 18px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 16,
              padding: '16px',
              background: 'linear-gradient(145deg, #ffffff 0%, #EEF7F1 100%)',
              border: '1px solid rgba(122,158,135,0.28)',
              boxShadow: '0 14px 28px rgba(31,41,36,0.2)',
            }}
          >
            <p style={{ fontSize: '11px', color: '#7A9E87', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Next Step
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, color: '#223029', fontWeight: 600, lineHeight: 1.2, marginBottom: 7 }}>
              Your report is done.
            </p>
            <p style={{ fontSize: 13, color: '#5E6B64', lineHeight: 1.6, marginBottom: 12 }}>
              To start another program, open the Programs tab and choose your next journey.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowNextProgramPrompt(false)}
                style={{
                  flex: 1,
                  border: '1px solid rgba(122,158,135,0.35)',
                  background: 'transparent',
                  color: '#5E6B64',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setShowNextProgramPrompt(false);
                  setTab('programs');
                }}
                style={{
                  flex: 1.2,
                  border: 'none',
                  background: `linear-gradient(90deg, ${appTheme.contrast} 0%, ${appAccent} 100%)`,
                  color: '#fff',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(72,102,63,0.28)',
                }}
              >
                Open Programs →
              </button>
            </div>
          </div>
        </div>
      )}

      {showLaunchProgramsPrompt && screen === "app" && !showNextProgramPrompt && (
        <div
          onClick={() => setShowLaunchProgramsPrompt(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(31,41,36,0.34)',
            zIndex: 1590,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 'max(10px, env(safe-area-inset-top)) 14px 18px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 16,
              padding: '16px',
              background: 'linear-gradient(145deg, #ffffff 0%, #EEF7F1 100%)',
              border: '1px solid rgba(122,158,135,0.28)',
              boxShadow: '0 14px 28px rgba(31,41,36,0.2)',
            }}
          >
            {(() => {
              const prompt = LAUNCH_PROGRAM_PROMPTS[launchProgramsPromptIndex] || LAUNCH_PROGRAM_PROMPTS[0];
              return (
                <>
                  <p style={{ fontSize: '11px', color: '#7A9E87', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {prompt.tag}
                  </p>
                  <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 23, color: '#223029', fontWeight: 600, lineHeight: 1.2, marginBottom: 7 }}>
                    {prompt.title}
                  </p>
                  <p style={{ fontSize: 13, color: '#5E6B64', lineHeight: 1.6, marginBottom: 12 }}>
                    {prompt.body}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setShowLaunchProgramsPrompt(false)}
                      style={{
                        flex: 1,
                        border: '1px solid rgba(122,158,135,0.35)',
                        background: 'transparent',
                        color: '#5E6B64',
                        borderRadius: 10,
                        padding: '10px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Later
                    </button>
                    <button
                      onClick={() => {
                        setShowLaunchProgramsPrompt(false);
                        setTab('programs');
                      }}
                      style={{
                        flex: 1.2,
                        border: 'none',
                        background: `linear-gradient(90deg, ${appTheme.contrast} 0%, ${appAccent} 100%)`,
                        color: '#fff',
                        borderRadius: 10,
                        padding: '10px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(72,102,63,0.28)',
                      }}
                    >
                      {prompt.cta}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ONBOARDING */}
      {screen === "login" && (
        <LoginScreen
          onNext={() => {
            // Called only by "Get Started — Free" and "Skip Login" buttons.
            // Auth events are handled entirely by the auth listener above — no onNext needed there.
            localStorage.removeItem('mindscript_onboarding_data');
            setScreen("goal");
          }}
        />
      )}
      {screen === "goal" && (
        <GoalScreen
          onNext={(p) => {
            // When switching programs, reset all program-specific state
            markGoalStarted(p, 'onboarding');
            setProgram(p);
            setActivePaidProgram(null);
            setActiveProgramDuration(3);
            setDay(1);
            setCompletions({ morning: false, midday: false, night: false });
            setAllDayCompletions([null, null, null]);
            setProgramCompleted(false);
            setScreen("questionnaire");
          }}
          onBack={() => setScreen("login")}
        />
      )}
      {screen === "questionnaire" && (
        <QuestionnaireScreen 
          onNext={(answers) => {
            setQuestionnaireAnswers(answers);
            setScreen("setup");
          }} 
        />
      )}
      {screen === "setup" && (
        <SetupScreen
          onNext={(s) => {
            setSetup(s);
            setScreen("identity");
          }}
        />
      )}
      {screen === "identity" && (
        <IdentityScreen 
          program={program} 
          user={currentUser}
          onNext={() => {
            setTab("home");
            setScreen("app");
          }}
          onRequireLogin={() => {
            // Save all onboarding data before redirecting to login
            const dataToSave = {
              program,
              questionnaireAnswers,
              setup,
              screen: 'app' // After login, go directly to app
            };
            console.log('[App] Saving onboarding data before login:', dataToSave);
            saveToStorage('mindscript_onboarding_data', dataToSave);
            console.log('[App] Navigating to login screen');
            setScreen("login");
          }} 
        />
      )}

      {/* CELEBRATION */}
      {screen === "celebrate" && (
        <DayCelebration
          day={day}
          program={program}
          totalDays={activeProgramDuration}
          onContinue={handleCelebrationContinue}
        />
      )}

      {/* MAIN APP */}
      {inApp && (
        <div style={{ paddingBottom: "calc(74px + env(safe-area-inset-bottom, 0px))" }}>
          {tab === "home" && (
            <HomeTab 
              program={program} 
              unlocks={setup.unlocks} 
              day={day} 
              completions={completions} 
              onSessionComplete={handleSessionComplete} 
              streak={streak}
              onDayChange={setDay}
              activePaidProgram={activePaidProgram}
              programDuration={activeProgramDuration}
              onReflectionSave={handleReflectionSave}
              user={currentUser}
              reflectionData={reflectionData}
              allDayCompletions={allDayCompletions}
              onCelebrationContinue={handleCelebrationContinue}
              onDevSkipDay={handleDevSkipDay}
              moodHistory={moodHistory}
              onMoodLog={handleMoodLog}
              postTrialHomeMode={postTrialHomeMode}
              postTrialCompletionKey={postTrialCompletionKey}
              onOpenReport={() => openReport(null)}
              onOpenPrograms={() => setTab('programs')}
              onOpenGoalSwitch={() => {
                setProgramsFocusTarget('switch-goal');
                setTab('programs');
              }}
            />
          )}
          {tab === "programs" && (
            <ProgramsTab 
              user={currentUser}
              program={program} 
              onSelectPaidProgram={handleSelectPaidProgram}
              onViewCompletedProgram={handleViewCompletedProgram}
              onExitActiveProgram={handleExitActiveProgram}
              onSwitchGoal={handleSwitchGoal}
              programHistory={programHistory}
              goalHistory={goalHistory}
              activePaidProgram={activePaidProgram}
              programCompleted={programCompleted}
              currentDay={day}
              activeProgramDuration={activeProgramDuration}
              focusTarget={programsFocusTarget}
              onFocusHandled={() => setProgramsFocusTarget(null)}
              accent={appAccent}
              theme={appTheme}
            />
          )}
          {tab === "progress" && (
            <ProgressTab 
              program={program} 
              day={day} 
              completions={completions} 
              allDayCompletions={allDayCompletions} 
              totalMinutes={totalMinutes} 
              streak={streak}
              questionnaireAnswers={questionnaireAnswers}
              reflectionData={currentProgramReflections}
              allReflectionData={reflectionData}
              programCompleted={programCompleted}
              activeProgramDuration={activeProgramDuration}
              programHistory={programHistory}
              goalHistory={goalHistory}
              moodHistory={moodHistory}
              user={currentUser}
              onViewReport={(entry) => {
                openReport(entry);
              }}
              accent={appAccent}
              theme={appTheme}
            />
          )}
          {tab === "profile" && (
            <ProfileTab 
              program={program} 
              setup={setup} 
              onUpdateSetup={setSetup} 
              onReset={handleReset}
              user={currentUser}
              onLogout={() => {
                // Import logOut at the top if not already
                import('@/utils/auth').then(({ logOut }) => {
                  logOut().then(() => {
                    // Clear all state and go back to login
                    setScreen("login");
                    setProgram(null);
                    setDay(1);
                    setCompletions({ morning: false, midday: false, night: false });
                    setAllDayCompletions([null, null, null]);
                    setTotalMinutes(0);
                    setStreak(0);
                    setProgramCompleted(false);
                    setQuestionnaireAnswers({});
                    setReflectionData([]);
                    setActivePaidProgram(null);
                    setProgramHistory([]);
                    setGoalHistory([]);
                    setMoodHistory([]);
                    // Clear only the anonymous session snapshot; keep user-scoped progress for next login
                    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
                  });
                });
              }}
              accent={appAccent}
              theme={appTheme}
            />
          )}
          <BottomNav active={tab} onChange={setTab} />
        </div>
      )}

      {/* REPORT */}
      {screen === "report" && (
        <div style={{ paddingBottom: 68 }}>
          <ReportScreen
            program={viewingHistoryReport ? viewingHistoryReport.program : program}
            allDayCompletions={viewingHistoryReport
              ? (viewingHistoryReport.snapshotAllDayCompletions || Array(viewingHistoryReport.duration || 3).fill(null))
              : allDayCompletions
            }
            reflectionData={viewingHistoryReport
              ? (viewingHistoryReport.snapshotReflections || [])
              : currentProgramReflections
            }
            moodHistory={viewingHistoryReport
              ? (viewingHistoryReport.snapshotMoodHistory || [])
              : moodHistory
            }
            activeProgramDuration={viewingHistoryReport ? viewingHistoryReport.duration : activeProgramDuration}
            programTitle={viewingHistoryReport
              ? viewingHistoryReport.programTitle
              : (programHistory.length > 0 ? programHistory[programHistory.length - 1].programTitle : undefined)
            }
            onNavigateToPrograms={closeReport}
          />
          <BottomNav
            active="progress"
            onChange={(t) => {
              closeReport();
              setTab(t);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
