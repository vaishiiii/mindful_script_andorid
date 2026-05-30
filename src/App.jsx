import React, { useState, useEffect, useRef } from 'react';
import { LoginScreen, GoalScreen, QuestionnaireScreen, SetupScreen, IdentityScreen, DayCelebration, OnboardingSlides } from '@/components/onboarding';
import { HomeTab, ProgramsTab, ProgressTab, ProfileTab, ReportScreen, BottomNav } from '@/components/app';
import { saveToStorage, loadFromStorage } from '@/utils/helpers';
import paidProgramCalm7 from '@/data/paidProgramCalm7';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { onAuthChange, handleGoogleRedirectResult } from '@/utils/auth';
import { getUserProfile, saveUserProgress } from '@/utils/userDb';

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'mindscript_state',
};

const DEFAULT_SETUP = {
  timeMin: 30,
  wakeTime: '07:00',
  sleepTime: '23:00',
  unlocks: { morning: '07:00', midday: '12:00', night: '21:00' },
};

const DEFAULT_COMPLETIONS = { morning: false, midday: false, night: false };

const getUserStateKey = (userId) => `${STORAGE_KEYS.APP_STATE}_${userId}`;

function App() {
  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  // Prevents mount-effect from racing with auth listener on initial load
  const [authInitialized, setAuthInitialized] = useState(false);

  // Screen and tab must be declared before useEffects that reference them
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");

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
          console.log('[App Auth] User logged in:', user.email, user.displayName);

          // 1. If onboarding was interrupted by login, finish restoring it
          const onboardingData = loadFromStorage('mindscript_onboarding_data', null);
          if (onboardingData) {
            console.log('[App Auth] ✅ Restoring onboarding data');
            setProgram(onboardingData.program);
            setQuestionnaireAnswers(onboardingData.questionnaireAnswers || {});
            setSetup(onboardingData.setup || DEFAULT_SETUP);
            setTab('home');
            localStorage.removeItem('mindscript_onboarding_data');
            setAuthInitialized(true);
            setScreen('app');
            return;
          }

          // 2. Try user-scoped local state first, then anonymous snapshot
          const userStateKey = getUserStateKey(user.uid);
          const savedState =
            loadFromStorage(userStateKey, null) ||
            loadFromStorage(STORAGE_KEYS.APP_STATE, null);

          if (savedState) {
            saveToStorage(userStateKey, savedState);
            // Restore all non-screen state so it's available when we set the screen
            setProgram(savedState.program || null);
            setSetup(savedState.setup || DEFAULT_SETUP);
            setTab('home');
            setDay(savedState.day || 1);
            setCompletions(savedState.completions || DEFAULT_COMPLETIONS);
            setTotalMinutes(savedState.totalMinutes || 0);
            setStreak(savedState.streak || 0);
            setProgramCompleted(savedState.programCompleted || false);
            setQuestionnaireAnswers(savedState.questionnaireAnswers || {});
            setReflectionData(savedState.reflectionData || []);
            setProgramHistory(savedState.programHistory || []);

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
              setActivePaidProgram(null);
              const duration = savedState.activeProgramDuration || 3;
              setActiveProgramDuration(duration);
              const saved = savedState.allDayCompletions || [];
              setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
            }

            // Always route to 'app' if a program exists — never restore a mid-onboarding screen
            setAuthInitialized(true);
            setScreen(savedState.program ? 'app' : 'goal');
            return;
          }

          // 3. Try Firestore
          const profileResult = await getUserProfile(user.uid);
          if (profileResult.success && profileResult.data?.progress) {
            console.log('[App Auth] Restoring state from Firestore');
            const progress = profileResult.data.progress;
            saveToStorage(userStateKey, progress);
            setProgram(progress.program || null);
            setSetup(progress.setup || DEFAULT_SETUP);
            setTab('home');
            setDay(progress.day || 1);
            setCompletions(progress.completions || DEFAULT_COMPLETIONS);
            setTotalMinutes(progress.totalMinutes || 0);
            setStreak(progress.streak || 0);
            setProgramCompleted(progress.programCompleted || false);
            setQuestionnaireAnswers(progress.questionnaireAnswers || {});
            setReflectionData(progress.reflectionData || []);
            setProgramHistory(progress.programHistory || []);
            const savedPaidProgram = progress.activePaidProgram;
            if (savedPaidProgram?.duration) {
              const duration = savedPaidProgram.duration;
              setActiveProgramDuration(duration);
              if (savedPaidProgram.program === 'calm' && duration === 7) {
                setActivePaidProgram({ ...savedPaidProgram, data: paidProgramCalm7 });
              } else {
                setActivePaidProgram(savedPaidProgram);
              }
              const saved = progress.allDayCompletions || [];
              setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
            } else {
              setActivePaidProgram(null);
              const duration = progress.activeProgramDuration || 3;
              setActiveProgramDuration(duration);
              const saved = progress.allDayCompletions || [];
              setAllDayCompletions(Array(duration).fill(null).map((_, i) => saved[i] || null));
            }
            setAuthInitialized(true);
            setScreen(progress.program ? 'app' : 'goal');
            return;
          }

          // 4. Brand-new user — start onboarding
          console.log('[App Auth] New user, starting onboarding');
          setAuthInitialized(true);
          setScreen('goal');
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
  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // Android hardware back button handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
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

  // Show onboarding slides on very first launch
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('ms_onboarding_done')
  );

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
  }, [screen, program, setup, tab, day, completions, allDayCompletions, totalMinutes, streak, programCompleted, questionnaireAnswers, reflectionData, activePaidProgram, activeProgramDuration, programHistory, currentUser]);

  const handleSessionComplete = (type) => {
    const updated = { ...completions, [type]: true };
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

      setProgramHistory(prev => [...prev, {
        program: activePaidProgram ? activePaidProgram.program : program,
        duration: activeProgramDuration,
        completedAt: new Date().toISOString(),
        totalSessions: sessionsCompleted,
        isPaid: activePaidProgram !== null,
        programTitle: activePaidProgram ? activePaidProgram.title : `${program} 3-Day Free Program`,
        snapshotAllDayCompletions: [...allDayCompletions],
        snapshotReflections,
      }]);
      
      setProgramCompleted(true);
      
      // Clear active paid program so user can select a new one
      setActivePaidProgram(null);
      
      setScreen("report");
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
    setScreen("goal");
  };

  const handleReflectionComplete = (reflections) => {
    setReflectionData(prev => [...prev, { day, ...reflections }]);
  };

  const handleReflectionSave = (reflection) => {
    // Save detailed journal reflection with full context
    setReflectionData(prev => [...prev, reflection]);
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

  const isCurrentContextPaid = activePaidProgram !== null || activeProgramDuration > 3;
  const currentProgramReflections = reflectionData.filter((entry) => {
    const sameProgram = entry?.program === program;
    const samePaidState = Boolean(entry?.isPaidProgram) === isCurrentContextPaid;
    const entryDuration = entry?.programDuration || 3;
    const sameDuration = entryDuration === activeProgramDuration;
    return sameProgram && samePaidState && sameDuration;
  });

  const inApp = screen === "app";

  // Show a blank splash while Firebase resolves auth — prevents login flash for returning users
  if (!authInitialized) {
    return <div style={{ minHeight: '100vh', background: '#1a2e22' }} />;
  }

  // First-ever launch: show animated onboarding slides
  if (showOnboarding) {
    return <OnboardingSlides onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: "#F7F6F2", position: "relative" }}>
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
          onNext={() => setScreen("app")}
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
      {screen === "celebrate" && <DayCelebration day={day} program={program} onContinue={handleCelebrationContinue} />}

      {/* MAIN APP */}
      {inApp && (
        <div style={{ paddingBottom: 68 }}>
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
            />
          )}
          {tab === "programs" && (
            <ProgramsTab 
              program={program} 
              onSelectPaidProgram={handleSelectPaidProgram}
              programHistory={programHistory}
              activePaidProgram={activePaidProgram}
              programCompleted={programCompleted}
              currentDay={day}
              activeProgramDuration={activeProgramDuration}
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
              user={currentUser}
              onViewReport={(entry) => {
                setViewingHistoryReport(entry);
                setScreen('report');
              }}
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
                    // Clear only the anonymous session snapshot; keep user-scoped progress for next login
                    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
                  });
                });
              }}
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
            activeProgramDuration={viewingHistoryReport ? viewingHistoryReport.duration : activeProgramDuration}
            programTitle={viewingHistoryReport
              ? viewingHistoryReport.programTitle
              : (programHistory.length > 0 ? programHistory[programHistory.length - 1].programTitle : undefined)
            }
            onNavigateToPrograms={() => {
              setViewingHistoryReport(null);
              setTab('programs');
              setScreen('app');
            }}
          />
          <BottomNav
            active="progress"
            onChange={(t) => {
              setViewingHistoryReport(null);
              setTab(t);
              setScreen("app");
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
