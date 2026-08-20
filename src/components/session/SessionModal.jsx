import React, { useState, useEffect, useRef } from 'react';
import { Btn, CheckIcon } from '@/components/ui';
import { SESSION_TASKS } from '@/data/sessions';
import { REFLECTION_QS, NIGHT_REFLECTION_QUESTIONS } from '@/data/questions';
import { PROG_COLORS } from '@/styles/designSystem';
import BreathEngine from './BreathEngine';
import ActionTimer from './ActionTimer';
import { scheduleReminderForTomorrow, showTestNotification } from '@/utils/notifications';

const ADAPTIVE_TIMER_KEY = 'ms_timer_adaptive_v1';

const readAdaptiveTimerStore = () => {
  try {
    const raw = localStorage.getItem(ADAPTIVE_TIMER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeAdaptiveTimerStore = (store) => {
  try {
    localStorage.setItem(ADAPTIVE_TIMER_KEY, JSON.stringify(store));
  } catch {
    // no-op
  }
};

const SessionModal = ({ type, program, day = 1, isPractice = false, onClose, onComplete, activePaidProgram, onReflectionSave, initialReflection = null, reviewMode = false, devMode = false }) => {
  const [step, setStep] = useState(reviewMode ? "task" : "breath");
  const [rIdx, setRIdx] = useState(0);
  const [rAns, setRAns] = useState(initialReflection?.answers || {});
  const [journalText, setJournalText] = useState(initialReflection?.journalEntry || ""); // free-form journal text
  const [timerDone, setTimerDone] = useState(reviewMode);
  const [timerInsight, setTimerInsight] = useState(initialReflection?.timerInsight || ""); // capture thoughts right after a timed task
  const [reflectionText, setReflectionText] = useState("");
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [useTimer, setUseTimer] = useState(reviewMode ? true : null); // null = not chosen, true = using timer
  const [customTimerSeconds, setCustomTimerSeconds] = useState(300); // default 5 minutes
  const [adaptiveSuggestedSeconds, setAdaptiveSuggestedSeconds] = useState(null);
  const [timerRunMeta, setTimerRunMeta] = useState(null);
  const [taskFinishedEarly, setTaskFinishedEarly] = useState(false);
  const [earlyFinishRemainingSeconds, setEarlyFinishRemainingSeconds] = useState(null);
  const [reflectionPopupOpen, setReflectionPopupOpen] = useState(false);
  const [reflectionTimeLeft, setReflectionTimeLeft] = useState(null);
  const [timerSummaryConfirmed, setTimerSummaryConfirmed] = useState(Boolean(initialReflection?.timerSummaryConfirmed));
  const [guidedReflection, setGuidedReflection] = useState(initialReflection?.timerReflection || {
    worked: '',
    hard: '',
    next: '',
  });
  const [timerPopupReady, setTimerPopupReady] = useState(false);
  const [optionalTimerPopupDismissed, setOptionalTimerPopupDismissed] = useState(false);
  const [requiredTimerInline, setRequiredTimerInline] = useState(false);
  const [optionalInlineAutoStart, setOptionalInlineAutoStart] = useState(false);
  const [breathSceneReady, setBreathSceneReady] = useState(reviewMode);
  const timerPopupAudioCtxRef = useRef(null);
  const sessionVictoryAudioCtxRef = useRef(null);
  const playedDoneSoundRef = useRef(false);
  const wasTimerPopupVisibleRef = useRef(false);
  const wakeLockRef = useRef(null);
  
  // State for interactive task inputs
  const [taskInputs, setTaskInputs] = useState(initialReflection?.taskInputs || {}); // { stepIndex: value }
  const [scheduledReminders, setScheduledReminders] = useState({}); // { morning: bool, midday: bool, night: bool }

  const fmtDur = (seconds) => {
    const safe = Math.max(0, Number(seconds || 0));
    const mm = Math.floor(safe / 60);
    const ss = safe % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setStep(reviewMode ? "task" : "breath");
    setRIdx(0);
    setRAns(initialReflection?.answers || {});
    setJournalText(initialReflection?.journalEntry || "");
    setTimerInsight(initialReflection?.timerInsight || "");
    setTaskInputs(initialReflection?.taskInputs || {});
    setGuidedReflection(initialReflection?.timerReflection || { worked: '', hard: '', next: '' });
    setTimerSummaryConfirmed(Boolean(initialReflection?.timerSummaryConfirmed));
    setTimerRunMeta(null);
    setTaskFinishedEarly(false);
    setEarlyFinishRemainingSeconds(null);
    setReflectionPopupOpen(false);
    setReflectionTimeLeft(null);
    setUseTimer(reviewMode ? true : null);
    setTimerDone(reviewMode);
    setAdaptiveSuggestedSeconds(null);
    setCustomTimerSeconds(300);
    setTimerPopupReady(false);
    setOptionalTimerPopupDismissed(false);
    setRequiredTimerInline(false);
    setOptionalInlineAutoStart(false);
    setBreathSceneReady(reviewMode);
    playedDoneSoundRef.current = false;
  }, [reviewMode, type, day, program]);

  useEffect(() => {
    if (step !== 'breath') {
      return undefined;
    }

    let secondFrameId;
    let revealTimeoutId;
    const firstFrameId = requestAnimationFrame(() => {
      secondFrameId = requestAnimationFrame(() => {
        revealTimeoutId = setTimeout(() => setBreathSceneReady(true), 180);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrameId);
      if (secondFrameId) cancelAnimationFrame(secondFrameId);
      if (revealTimeoutId) clearTimeout(revealTimeoutId);
    };
  }, [step]);

  const getSessionVictoryAudioContext = () => {
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!sessionVictoryAudioCtxRef.current) {
        sessionVictoryAudioCtxRef.current = new AudioCtx();
      }

      const ctx = sessionVictoryAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      return ctx;
    } catch {
      return null;
    }
  };

  const playSessionVictorySound = () => {
    const ctx = getSessionVictoryAudioContext();
    if (!ctx) {
      if (navigator?.vibrate) navigator.vibrate([70, 60, 90]);
      return;
    }

    try {
      const now = ctx.currentTime;
      const burst = (start, freqStart, freqEnd, gainVal, duration, type = 'triangle') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, start);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.01);
      };

      burst(now, 560, 780, 0.08, 0.18, 'sine');
      burst(now + 0.14, 780, 1020, 0.09, 0.2, 'triangle');
      burst(now + 0.3, 1020, 1280, 0.095, 0.22, 'triangle');

      if (navigator?.vibrate) {
        navigator.vibrate([70, 60, 90]);
      }
    } catch {
      if (navigator?.vibrate) navigator.vibrate([70, 60, 90]);
    }
  };

  const getTimerPopupAudioContext = () => {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!timerPopupAudioCtxRef.current) {
        timerPopupAudioCtxRef.current = new AudioCtx();
      }

      const ctx = timerPopupAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      return ctx;
    } catch {
      return null;
    }
  };

  const playTimerPopupSound = () => {
    const ctx = getTimerPopupAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.11, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // no-op
    }
  };

  // Push a history entry so Android back button closes this modal instead of exiting the app
  useEffect(() => {
    window.history.pushState({ sessionModal: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Keep the device awake while a session modal is active to avoid screen timeout distractions.
  useEffect(() => {
    let cancelled = false;

    const requestWakeLock = async () => {
      if (cancelled || typeof navigator === 'undefined' || !navigator.wakeLock?.request) {
        return;
      }

      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // Some browsers/webviews may reject wake lock; fail silently.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // no-op
        });
        wakeLockRef.current = null;
      }
    };
  }, []);

  const handleQuickReminder = async (remType) => {
    const programName = activePaidProgram ? activePaidProgram.title : program;
    const scheduled = await scheduleReminderForTomorrow(remType, programName);
    if (scheduled) {
      setScheduledReminders(prev => ({ ...prev, [remType]: true }));
      await showTestNotification();
    }
  };

  // Get day-specific tasks
  let task = null;
  let c = null;

  if (activePaidProgram && activePaidProgram.data && Array.isArray(activePaidProgram.data)) {
    // Using paid program data
    const dayObj = activePaidProgram.data[day - 1];
    if (dayObj) {
      const sessionData = dayObj[type]; // morning, midday, or night
      if (sessionData) {
        // Convert paid program format to expected task format
        task = {
          title: sessionData.title || "",
          desc: sessionData.desc || "",
          steps: sessionData.steps || [],
          timer: sessionData.timer,
        };
      }
    }
  } else {
    // Using standard 3-day SESSION_TASKS
    const programTasks = SESSION_TASKS[program] || SESSION_TASKS.calm;
    const dayKey = `day${day}`;
    const dayTasks = programTasks[dayKey] || programTasks.day1;
    task = dayTasks[type];
  }

  c = PROG_COLORS[program] || "#7A9E87";
  const accentBg = 'var(--ms-accent-bg, #E8F0EB)';
  const accentSoft = 'var(--ms-accent-soft, #C4D8CB)';
  const accentContrast = 'var(--ms-accent-contrast, #5A7A67)';
  const programLabel = activePaidProgram ? activePaidProgram.title : '';
  
  const SESSION_LABEL = { 
    morning: isPractice ? `🌅 Practice — Day ${day} Morning` : (activePaidProgram ? `🌅 Day ${day} Morning` : "🌅 Morning Session"), 
    midday: isPractice ? `🌤 Practice — Day ${day} Midday` : (activePaidProgram ? `🌤 Day ${day} Midday` : "🌤 Midday Session"), 
    night: isPractice ? `🌙 Practice — Day ${day} Night` : (activePaidProgram ? `🌙 Day ${day} Night` : "🌙 Night Session") 
  };
  const STEPS = type === "night" && !isPractice && !activePaidProgram ? ["breath", "task", "reflect", "done"] : ["breath", "task", "journal", "done"];
  const currentStepIndex = STEPS.indexOf(step);
  const taskSignature = `${activePaidProgram?.programId || `${program}-free`}|${type}|${task?.title || 'task'}`;

  const guidedReflectionEntries = [
    guidedReflection.worked?.trim() || '',
    guidedReflection.hard?.trim() || '',
    guidedReflection.next?.trim() || '',
  ].filter(Boolean);

  const hasStrongGuidedReflection = guidedReflectionEntries.some((entry) => entry.length >= 24);
  const hasLongInsight = timerInsight.trim().length >= 60;
  const hasCommitment = (guidedReflection.next?.trim() || '').length >= 10;
  const reflectionQualityMet = hasCommitment && (hasStrongGuidedReflection || hasLongInsight);

  const timerSummaryLines = (() => {
    const lines = [];
    if (guidedReflection.worked?.trim()) {
      lines.push(`Win: ${guidedReflection.worked.trim()}`);
    }
    if (guidedReflection.hard?.trim()) {
      lines.push(`Challenge: ${guidedReflection.hard.trim()}`);
    }
    if (guidedReflection.next?.trim()) {
      lines.push(`Next action: ${guidedReflection.next.trim()}`);
    }
    if (timerInsight.trim()) {
      const insightLine = timerInsight.trim().split(/[.!?\n]/).find((part) => part.trim().length > 12);
      if (insightLine) {
        lines.push(`Insight: ${insightLine.trim()}`);
      }
    }
    return lines.slice(0, 2);
  })();
  useEffect(() => {
    if (timerSummaryConfirmed && timerSummaryLines.length === 0) {
      setTimerSummaryConfirmed(false);
    }
  }, [timerSummaryConfirmed, timerSummaryLines.length]);
  
  // Get night reflection questions for the program (for the reflect step)
  const nightReflectionQuestions = type === "night" ? NIGHT_REFLECTION_QUESTIONS[program] || NIGHT_REFLECTION_QUESTIONS.calm : [];

  const handleReflect = (opt) => {
    const q = nightReflectionQuestions[rIdx] || REFLECTION_QS[rIdx];
    const a = { ...rAns, [q.key]: opt };
    setRAns(a);
    const totalQuestions = nightReflectionQuestions.length > 0 ? nightReflectionQuestions.length : REFLECTION_QS.length;
    if (rIdx < totalQuestions - 1) {
      setRIdx((i) => i + 1);
    } else {
      // Save reflection answers
      if (!reviewMode && onReflectionSave) {
        onReflectionSave({
          answers: a,
          sessionType: type,
          day,
          program,
          timestamp: new Date().toISOString(),
          isPaidProgram: !!activePaidProgram,
          programDuration: activePaidProgram?.duration || 3,
        });
      }
      setStep("done");
    }
  };

  const buildTaskPrompts = () => {
    if (!task?.steps || typeof task !== 'object') {
      return {};
    }

    return Object.keys(taskInputs).reduce((acc, key) => {
      const baseKey = key.endsWith('_note') ? key.replace('_note', '') : key;
      const stepIndex = Number(baseKey);
      if (Number.isNaN(stepIndex)) {
        return acc;
      }

      const step = task.steps[stepIndex];
      let prompt = '';
      if (typeof step === 'string') {
        prompt = step;
      } else if (step && typeof step === 'object') {
        if (key.endsWith('_note') && step.note) {
          prompt = `${step.text || `Prompt ${stepIndex + 1}`} - ${step.note}`;
        } else {
          prompt = step.text || `Prompt ${stepIndex + 1}`;
        }
      }

      if (prompt) {
        acc[key] = prompt;
      }
      return acc;
    }, {});
  };

  const handleJournal = async () => {
    // Save journaling text along with previously saved task inputs
    if (!reviewMode && onReflectionSave) {
      const reflectionData = {
        sessionType: type,
        day,
        program,
        timestamp: new Date().toISOString(),
        isPaidProgram: !!activePaidProgram,
        programDuration: activePaidProgram?.duration || 3,
      };
      
      // Include task inputs and reminder if they exist
      if (Object.keys(taskInputs).length > 0) {
        reflectionData.taskInputs = taskInputs;
        reflectionData.taskPrompts = buildTaskPrompts();
      }
      // Include journal entry if present
      if (journalText.trim()) {
        reflectionData.journalEntry = journalText;
      }
      
      // Only save if there's any data
      if (reflectionData.journalEntry || reflectionData.taskInputs) {
        onReflectionSave(reflectionData);
      }
    }
    
    // For night sessions in old programs, continue to reflect step
    if (type === "night" && !isPractice && !activePaidProgram) {
      setStep("reflect");
    } else {
      setStep("done");
    }
  };

  const handleTaskContinue = async () => {
    // Save task inputs and timer insight if any data was entered
    if (!reviewMode && onReflectionSave && (Object.keys(taskInputs).length > 0 || timerInsight.trim() || guidedReflectionEntries.length > 0)) {
      onReflectionSave({
        taskInputs,
        ...(Object.keys(taskInputs).length > 0 ? { taskPrompts: buildTaskPrompts() } : {}),
        ...(timerInsight.trim() ? { timerInsight: timerInsight.trim() } : {}),
        ...(guidedReflectionEntries.length > 0 ? { timerReflection: guidedReflection } : {}),
        ...(timerRunMeta ? { timerMeta: timerRunMeta } : {}),
        ...(taskFinishedEarly
          ? {
              finishedTaskEarly: true,
              earlyFinishRemainingSeconds,
              timerSummaryConfirmed,
            }
          : {}),
        sessionType: type,
        day,
        program,
        timestamp: new Date().toISOString(),
        isPaidProgram: !!activePaidProgram,
        programDuration: activePaidProgram?.duration || 3,
      });
    }
    
    // Show journal prompt for all sessions (optional)
    if (!isPractice) {
      setStep("journal");
    } else {
      setStep("done");
    }
  };

  const goToPreviousStep = () => {
    if (step === "task") {
      setStep("breath");
      return;
    }

    if (step === "journal") {
      setStep("task");
      return;
    }

    if (step === "reflect") {
      if (rIdx > 0) {
        setRIdx((index) => index - 1);
      } else {
        setStep("journal");
      }
      return;
    }

    if (step === "done") {
      setStep(type === "night" && !isPractice && !activePaidProgram ? "reflect" : "journal");
    }
  };

  const showRequiredTimerPopup = step === "task" && !!task?.timer && !timerDone && !requiredTimerInline;
  const showRequiredInlineTimer = step === "task" && !!task?.timer && !timerDone && requiredTimerInline;
  const showOptionalTimerChoicePopup = !reviewMode && step === "task" && !task?.timer && useTimer === null && !timerDone;
  const showOptionalInlineTimer = !reviewMode && step === "task" && !task?.timer && useTimer === true && !timerDone;
  const showAnyOptionalTimerPopup = showOptionalTimerChoicePopup;
  const showTimerPopup = showRequiredTimerPopup || (showAnyOptionalTimerPopup && !optionalTimerPopupDismissed);

  useEffect(() => {
    if (step !== "task" || !showOptionalTimerChoicePopup) {
      setOptionalTimerPopupDismissed(false);
    }
  }, [step, showOptionalTimerChoicePopup]);

  useEffect(() => {
    if (!showOptionalInlineTimer) {
      setOptionalInlineAutoStart(false);
    }
  }, [showOptionalInlineTimer]);

  useEffect(() => {
    if (step !== 'task' || reviewMode) {
      return;
    }

    const store = readAdaptiveTimerStore();
    const suggested = Number(store?.[taskSignature]?.suggestedSeconds || 0);
    if (Number.isFinite(suggested) && suggested >= 120) {
      setAdaptiveSuggestedSeconds(suggested);
      if (!task?.timer && useTimer === null) {
        setCustomTimerSeconds(suggested);
      }
      return;
    }

    setAdaptiveSuggestedSeconds(null);
  }, [step, reviewMode, taskSignature, task?.timer, useTimer]);

  const handleTimerFinishedEarly = ({ remainingSeconds }) => {
    setTaskFinishedEarly(true);
    setEarlyFinishRemainingSeconds(remainingSeconds);
    setReflectionTimeLeft(remainingSeconds);
    setReflectionPopupOpen(true);
  };

  const handleTimerTick = ({ leftSeconds }) => {
    if (!taskFinishedEarly) {
      return;
    }
    setReflectionTimeLeft(leftSeconds);
  };

  const handleTimerCompleted = (meta = null) => {
    setTimerDone(true);
    setReflectionTimeLeft(0);
    if (meta && typeof meta === 'object') {
      setTimerRunMeta(meta);

      if (Number.isFinite(meta.taskDoneElapsedSeconds)) {
        const store = readAdaptiveTimerStore();
        const previous = store?.[taskSignature] || {};
        const samples = Math.max(0, Number(previous.samples || 0));
        const prevAvg = Number(previous.avgDoneSeconds || 0);
        const nextSamples = samples + 1;
        const nextAvg = samples > 0
          ? Math.round(((prevAvg * samples) + meta.taskDoneElapsedSeconds) / nextSamples)
          : Math.round(meta.taskDoneElapsedSeconds);

        const boundedSuggested = Math.max(120, Math.min(7200, Math.round(nextAvg / 60) * 60));
        store[taskSignature] = {
          avgDoneSeconds: nextAvg,
          suggestedSeconds: boundedSuggested,
          samples: nextSamples,
          updatedAt: new Date().toISOString(),
        };
        writeAdaptiveTimerStore(store);
        setAdaptiveSuggestedSeconds(boundedSuggested);
      }
    }
  };

  useEffect(() => {
    if (step !== 'done') {
      playedDoneSoundRef.current = false;
      return;
    }

    if (!playedDoneSoundRef.current) {
      playedDoneSoundRef.current = true;
      playSessionVictorySound();
    }
  }, [step]);

  useEffect(() => {
    if (step !== "task") {
      setTimerPopupReady(false);
      wasTimerPopupVisibleRef.current = false;
      return;
    }

    if (showTimerPopup) {
      setTimerPopupReady(true);
      if (!wasTimerPopupVisibleRef.current) {
        playTimerPopupSound();
      }
    }

    wasTimerPopupVisibleRef.current = showTimerPopup;
  }, [step, showTimerPopup]);

  const immersiveMode = step === "breath";
  const requiresTimedReflectionGate = !reviewMode && Boolean(task?.timer || useTimer === true);
  const timedReflectionGateMet = !taskFinishedEarly || (reflectionQualityMet && timerSummaryConfirmed);
  const taskStepReadyByTimer = reviewMode
    || (task?.timer ? timerDone : (useTimer === false || (useTimer === true && timerDone)));
  const canContinueTaskStep = taskStepReadyByTimer && (!requiresTimedReflectionGate || timedReflectionGateMet);
  const showContinueAction = reviewMode || Boolean(task?.timer) || useTimer !== null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: immersiveMode
          ? "radial-gradient(120% 120% at 50% 6%, rgba(52,86,74,0.78) 0%, rgba(29,46,39,0.88) 62%, rgba(18,29,24,0.94) 100%)"
          : "rgba(44,53,48,0.58)",
        zIndex: 100,
        display: "flex",
        alignItems: immersiveMode ? "stretch" : "flex-end",
        justifyContent: "center",
        backdropFilter: immersiveMode ? "none" : "blur(6px)",
        transition: "background .4s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={immersiveMode ? undefined : "slide-up"}
        style={{
          background: immersiveMode
            ? "linear-gradient(180deg, rgba(16,30,24,0.95) 0%, rgba(20,36,30,0.94) 100%)"
            : "#F7F6F2",
          borderRadius: immersiveMode ? "26px 26px 0 0" : "28px 28px 0 0",
          width: "100%",
          maxWidth: immersiveMode ? "100%" : 480,
          maxHeight: immersiveMode ? "100vh" : "94vh",
          minHeight: immersiveMode ? "100vh" : 0,
          overflowY: immersiveMode ? "hidden" : "auto",
          overflowX: "hidden",
          overscrollBehavior: immersiveMode ? "none" : "auto",
          padding: immersiveMode ? "16px 10px 0" : "24px 22px 44px",
          position: "relative",
          boxShadow: immersiveMode
            ? "0 -10px 36px rgba(11,22,18,0.42), inset 0 0 0 1px rgba(188,226,212,0.12)"
            : "none",
          transition: "background .35s ease, border-radius .35s ease, box-shadow .35s ease",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: immersiveMode ? "0" : "18px", padding: immersiveMode ? "0 12px" : 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
            {!immersiveMode && currentStepIndex > 0 && step !== "done" && (
              <button
                onClick={goToPreviousStep}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                  color: "#9BA8A0",
                  lineHeight: 1,
                  padding: 0,
                  marginTop: "1px",
                  flexShrink: 0,
                }}
              >
                ‹
              </button>
            )}
            {!immersiveMode && (
              <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: c, letterSpacing: "0.1em", textTransform: "uppercase" }}>{SESSION_LABEL[type]}</p>
              {/* Step breadcrumb */}
              {step !== "done" && (
                <div style={{ display: "flex", gap: "6px", marginTop: "8px", alignItems: "center" }}>
                  {STEPS.filter((s) => s !== "done").map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: STEPS.indexOf(step) > i ? c : STEPS.indexOf(step) === i ? c : accentSoft,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background .3s",
                          }}
                        >
                          {STEPS.indexOf(step) > i ? (
                            <CheckIcon size={10} />
                          ) : (
                            <span style={{ fontSize: "9px", fontWeight: 700, color: STEPS.indexOf(step) === i ? "#fff" : "#9BA8A0" }}>{i + 1}</span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: STEPS.indexOf(step) === i ? "#2C3530" : "#9BA8A0",
                            fontWeight: STEPS.indexOf(step) === i ? 600 : 400,
                            textTransform: "capitalize",
                          }}
                        >
                          {s === "breath" ? "Breathe" : s === "journal" ? "Journal" : s === "reflect" ? "Reflect" : "Task"}
                        </span>
                      </div>
                      {i < STEPS.filter((s) => s !== "done").length - 1 && <div style={{ width: 16, height: 1, background: accentSoft }} />}
                    </div>
                  ))}
                </div>
              )}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: immersiveMode ? "#BBD4CB" : "#9BA8A0", lineHeight: 1, padding: "2px 8px" }}>
            ×
          </button>
        </div>

        {/* BREATH STEP */}
        {step === "breath" && (
          <div>
            <BreathEngine
              program={program}
              sessionType={type}
              onComplete={() => {
                setStep("task");
              }}
              devMode={devMode}
            />
          </div>
        )}
        {step === "breath" && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "radial-gradient(120% 100% at 50% 0%, rgba(77, 124, 105, 0.5) 0%, rgba(16, 30, 24, 0.98) 64%, rgba(11, 21, 17, 1) 100%)",
              opacity: breathSceneReady ? 0 : 1,
              visibility: breathSceneReady ? "hidden" : "visible",
              pointerEvents: "none",
              transition: "opacity 180ms ease, visibility 0ms linear 180ms",
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: "50%", border: `2px solid ${c}55`, borderTopColor: c, animation: "spin 900ms linear infinite" }} />
            <p style={{ fontSize: "11px", color: "#D6EEE5", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Preparing breathwork</p>
          </div>
        )}

        {/* TASK STEP */}
        {step === "task" && task && (
          <div className="slide-up">
            <div style={{ padding: "16px 18px", borderRadius: "20px", background: `${c}12`, border: `1.5px solid ${c}28`, marginBottom: "18px", boxShadow: "0 8px 20px rgba(44,53,48,0.06)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: c, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Today's Task</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "21px", fontWeight: 500, color: "#2C3530" }}>{task.title}</p>
            </div>
            {task.desc && (
              <div style={{ padding: "12px 14px", background: "#FFFAF4", borderRadius: "12px", marginBottom: "18px", border: "1px solid #F5E5C8" }}>
                <p style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.6 }}>{task.desc}</p>
              </div>
            )}
            <div style={{ marginBottom: "18px" }}>
              {task.steps && task.steps.map((s, i) => {
                // Support both string format (legacy) and object format (new interactive)
                const stepData = typeof s === 'string' ? { type: 'action', text: s } : s;
                const { type: stepType = 'action', text, placeholder, options, note } = stepData;
                
                return (
                  <div key={i} style={{ marginBottom: stepType === 'text' || stepType === 'multiChoice' ? "18px" : "13px" }}>
                    {/* Regular Action Step */}
                    {stepType === 'action' && (
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "11px 12px", borderRadius: "12px", background: "#FFFFFF", border: "1px solid #E8EEE9" }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: accentBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "1px",
                          }}
                        >
                          <span style={{ fontSize: "10px", fontWeight: 700, color: c }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65 }}>{text}</p>
                      </div>
                    )}
                    
                    {/* Text Input Step */}
                    {stepType === 'text' && (
                      <div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: accentBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "1px",
                            }}
                          >
                            <span style={{ fontSize: "10px", fontWeight: 700, color: c }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65 }}>{text}</p>
                        </div>
                        <div style={{ marginLeft: "34px" }}>
                          <textarea
                            value={taskInputs[i] || ''}
                            onChange={(e) => setTaskInputs(prev => ({ ...prev, [i]: e.target.value }))}
                            placeholder={placeholder || "Write your answer here..."}
                            style={{
                              width: "100%",
                              minHeight: "80px",
                              padding: "12px 14px",
                              borderRadius: "12px",
                              border: `1.5px solid ${accentSoft}`,
                              fontFamily: "'DM Sans', system-ui, sans-serif",
                              fontSize: "14px",
                              color: "#2C3530",
                              background: "#fff",
                              resize: "vertical",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Multiple Choice Step */}
                    {stepType === 'multiChoice' && (
                      <div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: accentBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "1px",
                            }}
                          >
                            <span style={{ fontSize: "10px", fontWeight: 700, color: c }}>{i + 1}</span>
                          </div>
                          <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65 }}>{text}</p>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginLeft: "34px", flexWrap: "wrap" }}>
                          {options && options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setTaskInputs(prev => ({ ...prev, [i]: option }))}
                              style={{
                                padding: "10px 18px",
                                borderRadius: "12px",
                                border: `1.5px solid ${taskInputs[i] === option ? c : accentSoft}`,
                                background: taskInputs[i] === option ? `${c}12` : '#fff',
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: taskInputs[i] === option ? c : '#5E6B64',
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {note && taskInputs[i] && (
                          <div style={{ marginLeft: "34px", marginTop: "8px" }}>
                            <input
                              type="text"
                              value={taskInputs[`${i}_note`] || ''}
                              onChange={(e) => setTaskInputs(prev => ({ ...prev, [`${i}_note`]: e.target.value }))}
                              placeholder={note}
                              style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: "1.5px solid #E8E8E8",
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                fontSize: "13px",
                                color: "#5E6B64",
                                fontStyle: "italic",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Checkbox Step */}
                    {stepType === 'checkbox' && (
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer", width: "100%" }}>
                          <input
                            type="checkbox"
                            checked={taskInputs[i] || false}
                            onChange={(e) => setTaskInputs(prev => ({ ...prev, [i]: e.target.checked }))}
                            style={{
                              width: 20,
                              height: 20,
                              marginTop: "2px",
                              cursor: "pointer",
                              accentColor: c,
                            }}
                          />
                          <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65 }}>{text}</p>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Activity notes in-app (optional) */}
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                <span style={{ fontSize: "16px" }}>✍️</span>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530" }}>Activity thoughts</p>
                <span style={{ fontSize: "10px", color: "#9BA8A0", marginLeft: "auto" }}>optional</span>
              </div>
              <p style={{ fontSize: "11px", color: "#6E7A74", marginBottom: "8px", lineHeight: 1.45 }}>
                You can write here while doing the task, or use a notebook and copy key points later.
              </p>
              <textarea
                value={timerInsight}
                onChange={(e) => setTimerInsight(e.target.value)}
                placeholder="Write your answers, feelings, or quick notes while following today's pointers..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: `1.5px solid ${accentSoft}`,
                  background: "#fff",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  color: "#2C3530",
                  lineHeight: 1.6,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = c; }}
                onBlur={(e) => { e.target.style.borderColor = accentSoft; }}
              />
            </div>

            {/* Notebook nudge — only when a timed task is coming and timer hasn't started yet */}
            {task.timer && !timerDone && (
              <details style={{ marginBottom: "8px", background: "#FFFAF4", borderRadius: "11px", border: "1px solid #F5E5C8", padding: "6px 10px" }}>
                <summary style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11px", color: "#8C6B3E", fontWeight: 600, listStyle: "none" }}>
                  <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>📓</span>
                  Notebook tip
                </summary>
                <p style={{ fontSize: "11px", color: "#8C6B3E", lineHeight: 1.45, marginTop: "6px" }}>
                  Prefer pen-paper? Write during the task, then keep only your key reflection in-app.
                </p>
              </details>
            )}

            {adaptiveSuggestedSeconds && (
              <div style={{ marginBottom: "10px", padding: "10px 12px", borderRadius: "12px", background: `linear-gradient(155deg, rgba(255,255,255,0.94) 0%, ${c}1F 100%)`, border: `1px solid ${c}40` }}>
                <p style={{ fontSize: "10px", color: c, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>
                  Smart Timer Insight
                </p>
                <p style={{ fontSize: "12px", color: "#4F6158", lineHeight: 1.5 }}>
                  You usually complete similar tasks around {Math.max(2, Math.round(adaptiveSuggestedSeconds / 60))} min.
                </p>
              </div>
            )}

            {timerInsight.trim() && (
              <p style={{ fontSize: "10px", color: c, marginBottom: "10px" }}>✓ Your activity notes will be saved in your reflections</p>
            )}

            {showOptionalTimerChoicePopup && optionalTimerPopupDismissed && (
              <Btn
                onClick={() => setOptionalTimerPopupDismissed(false)}
                variant="ghost"
                style={{ width: "100%", marginBottom: "10px", borderColor: c, color: accentContrast }}
              >
                Open Timer Options
              </Btn>
            )}

            {showOptionalInlineTimer && (
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 340 }}>
                  <ActionTimer
                    seconds={customTimerSeconds}
                    onComplete={handleTimerCompleted}
                    devMode={devMode}
                    accentColor={c}
                    autoStart={optionalInlineAutoStart}
                    centerContent
                    allowFinishEarly
                    onFinishEarly={handleTimerFinishedEarly}
                    onTick={handleTimerTick}
                  />
                </div>
              </div>
            )}

            {showRequiredInlineTimer && (
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 340 }}>
                  <ActionTimer
                    seconds={task.timer}
                    onComplete={handleTimerCompleted}
                    devMode={devMode}
                    accentColor={c}
                    centerContent
                    autoStart
                    allowFinishEarly
                    onFinishEarly={handleTimerFinishedEarly}
                    onTick={handleTimerTick}
                  />
                </div>
              </div>
            )}

            {showContinueAction && (
              <>
                {taskFinishedEarly && (
                  <div style={{ marginBottom: "12px", padding: "12px", borderRadius: "14px", background: `linear-gradient(150deg, rgba(255,255,255,0.98) 0%, ${c}24 100%)`, border: `1px solid ${c}47`, boxShadow: "0 8px 18px rgba(44,53,48,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: c, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Reflection Progress
                      </p>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: timerDone ? accentContrast : "#6B7A72", background: timerDone ? `${c}2E` : "rgba(110,122,116,0.12)", border: `1px solid ${timerDone ? `${c}59` : "rgba(110,122,116,0.25)"}`, borderRadius: 999, padding: "3px 8px" }}>
                        {timerDone ? "Timer Complete" : `Time Left ${fmtDur(reflectionTimeLeft)}`}
                      </span>
                    </div>

                    <p style={{ fontSize: "11px", color: "#4F6158", lineHeight: 1.5, marginBottom: "8px" }}>
                      Keep your reflection in one place. You can open, edit, and confirm from here.
                    </p>

                    <Btn
                      onClick={() => setReflectionPopupOpen(true)}
                      variant="subtle"
                      style={{ width: "100%", marginBottom: timerDone ? "10px" : 0 }}
                    >
                      {reflectionPopupOpen ? "Reflection Sprint Open" : (timerDone ? "Open Reflection Sprint" : "Continue Reflection Sprint")}
                    </Btn>

                    {timerDone && (
                      <>
                        {timerSummaryLines.length > 0 ? (
                          <div style={{ marginBottom: "8px" }}>
                            {timerSummaryLines.map((line) => (
                              <p key={line} style={{ fontSize: "12px", color: "#4F6158", lineHeight: 1.55, marginBottom: "4px" }}>• {line}</p>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: "12px", color: "#6E7A74", lineHeight: 1.55, marginBottom: "8px" }}>
                            Add a short reflection so we can save your key insight.
                          </p>
                        )}

                        {!timerSummaryConfirmed ? (
                          <Btn
                            onClick={() => setTimerSummaryConfirmed(true)}
                            style={{ width: "100%", marginTop: "4px" }}
                            variant="subtle"
                            disabled={timerSummaryLines.length === 0}
                          >
                            Confirm Reflection Summary
                          </Btn>
                        ) : (
                          <div style={{ width: "100%", marginTop: "4px", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", fontWeight: 700, color: accentContrast, background: `${c}2B`, border: `1px solid ${c}59`, textAlign: "center" }}>
                            Confirmed ✓
                          </div>
                        )}

                        {!timedReflectionGateMet && (
                          <div style={{ marginTop: "10px", borderTop: `1px solid ${c}33`, paddingTop: "8px", display: "grid", gap: "4px" }}>
                            <p style={{ fontSize: "10px", color: "#6E7A74", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                              Before continuing
                            </p>
                            <p style={{ fontSize: "11px", color: reflectionQualityMet ? "#2E5B46" : "#A67B7B" }}>
                              {reflectionQualityMet ? "✓" : "○"} Add a short commitment for tomorrow.
                            </p>
                            <p style={{ fontSize: "11px", color: timerSummaryConfirmed ? "#2E5B46" : "#A67B7B" }}>
                              {timerSummaryConfirmed ? "✓" : "○"} Confirm your reflection summary.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <Btn onClick={handleTaskContinue} style={{ width: "100%" }} disabled={!canContinueTaskStep}>
                  {reviewMode ? "Continue" : "Continue to Journal →"}
                </Btn>
              </>
            )}
          </div>
        )}

        {showTimerPopup && timerPopupReady && (
          <div
            className="fade-in"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 140,
              background: "rgba(44,53,48,0.34)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              className="pop"
              style={{
                width: "100%",
                maxWidth: 420,
                background: "#F7F6F2",
                borderRadius: "20px",
                border: "1px solid #E0E8E2",
                boxShadow: "0 24px 54px rgba(44,53,48,0.20)",
                padding: "14px",
                position: "relative",
              }}
            >
              {showAnyOptionalTimerPopup && (
                <button
                  onClick={() => setOptionalTimerPopupDismissed(true)}
                  aria-label="Minimize optional timer"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "1px solid #D5E5DD",
                    background: "#fff",
                    color: "#5E6B64",
                    cursor: "pointer",
                    fontSize: "18px",
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  −
                </button>
              )}

              {showRequiredTimerPopup && (
                <ActionTimer
                  seconds={task.timer}
                  onComplete={handleTimerCompleted}
                  devMode={devMode}
                  accentColor={c}
                  centerContent
                  onStart={() => setRequiredTimerInline(true)}
                  allowFinishEarly
                  onFinishEarly={handleTimerFinishedEarly}
                  onTick={handleTimerTick}
                />
              )}

              {showOptionalTimerChoicePopup && (
                <div>
                  <details style={{ marginBottom: "8px", background: "#F0F8FF", borderRadius: "11px", border: "1px solid #B8D4E8", padding: "6px 10px" }}>
                    <summary style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11px", color: "#3A5A7A", fontWeight: 600, listStyle: "none" }}>
                      <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>⏱️</span>
                      Optional timer
                    </summary>
                    <p style={{ fontSize: "11px", color: "#3A5A7A", lineHeight: 1.45, marginTop: "6px" }}>
                      Set a timer if you want structured focus. You can also skip timing and continue naturally.
                    </p>
                  </details>
                  <details style={{ marginBottom: "8px", background: "#FFFAF4", borderRadius: "11px", border: "1px solid #F5E5C8", padding: "6px 10px" }}>
                    <summary style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11px", color: "#8C6B3E", fontWeight: 600, listStyle: "none" }}>
                      <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>📓</span>
                      Notebook option
                    </summary>
                    <p style={{ fontSize: "11px", color: "#8C6B3E", lineHeight: 1.45, marginTop: "6px" }}>
                      You can complete the exercise on paper and write only a short summary here.
                    </p>
                  </details>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "7px", marginBottom: "8px" }}>
                    {adaptiveSuggestedSeconds && ![180, 300, 600].includes(adaptiveSuggestedSeconds) && (
                      <button
                        onClick={() => {
                          setCustomTimerSeconds(adaptiveSuggestedSeconds);
                          setUseTimer(true);
                          setOptionalTimerPopupDismissed(true);
                          setOptionalInlineAutoStart(true);
                        }}
                        style={{
                          gridColumn: "1 / -1",
                          padding: "9px 8px",
                          borderRadius: "10px",
                          border: `1px solid ${c}`,
                          background: `${c}10`,
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: c,
                          cursor: "pointer",
                        }}
                      >
                        Suggested: {Math.max(2, Math.round(adaptiveSuggestedSeconds / 60))} min
                      </button>
                    )}
                    {[
                      { label: "3 min", seconds: 180 },
                      { label: "5 min", seconds: 300 },
                      { label: "10 min", seconds: 600 },
                    ].map((option) => (
                      <button
                        key={option.seconds}
                        onClick={() => {
                          setCustomTimerSeconds(option.seconds);
                          setUseTimer(true);
                          setOptionalTimerPopupDismissed(true);
                          setOptionalInlineAutoStart(true);
                        }}
                        style={{
                          padding: "9px 8px",
                          borderRadius: "10px",
                          border: `1px solid ${accentSoft}`,
                          background: "#fff",
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#2C3530",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = c;
                          e.target.style.background = `${c}08`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = accentSoft;
                          e.target.style.background = "#fff";
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <Btn
                    onClick={() => {
                      setUseTimer(false);
                      setOptionalTimerPopupDismissed(true);
                    }}
                    style={{ width: "100%" }}
                  >
                    Skip Timer
                  </Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {reflectionPopupOpen && taskFinishedEarly && (
          <div
            className="fade-in"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 155,
              background: "rgba(44,53,48,0.46)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              backdropFilter: "blur(3px)",
            }}
          >
            <div
              className="pop"
              style={{
                width: "100%",
                maxWidth: 430,
                maxHeight: "90vh",
                overflowY: "auto",
                borderRadius: 20,
                background: "linear-gradient(170deg, #fff 0%, #f3faf5 100%)",
                border: `1px solid ${c}47`,
                boxShadow: "0 24px 48px rgba(28,36,32,0.24)",
                padding: "16px 14px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ fontSize: "11px", fontWeight: 800, color: c, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Reflection Sprint
                </p>
                <div style={{ padding: "4px 10px", borderRadius: 999, background: `${c}2E`, border: `1px solid ${c}59`, fontSize: "12px", fontWeight: 700, color: accentContrast }}>
                  {timerDone ? "Timer complete" : `Time left ${fmtDur(reflectionTimeLeft)}`}
                </div>
              </div>

              <p style={{ fontSize: "13px", color: "#4F6158", lineHeight: 1.5, marginBottom: "10px" }}>
                Great pace. Use the remaining time to lock in what actually worked so tomorrow starts easier.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#5E6B64", fontWeight: 600, marginBottom: "4px" }}>What worked well?</p>
                  <textarea
                    autoFocus
                    value={guidedReflection.worked}
                    onChange={(e) => setGuidedReflection((prev) => ({ ...prev, worked: e.target.value }))}
                    rows={2}
                    placeholder="One clear win from this task..."
                    style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: `1px solid ${accentSoft}`, padding: "8px 10px", fontSize: "12px", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff" }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#5E6B64", fontWeight: 600, marginBottom: "4px" }}>What felt hard?</p>
                  <textarea
                    value={guidedReflection.hard}
                    onChange={(e) => setGuidedReflection((prev) => ({ ...prev, hard: e.target.value }))}
                    rows={2}
                    placeholder="Where did resistance show up?"
                    style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: `1px solid ${accentSoft}`, padding: "8px 10px", fontSize: "12px", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff" }}
                  />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#5E6B64", fontWeight: 600, marginBottom: "4px" }}>What will you repeat tomorrow?</p>
                  <textarea
                    value={guidedReflection.next}
                    onChange={(e) => setGuidedReflection((prev) => ({ ...prev, next: e.target.value }))}
                    rows={2}
                    placeholder="Your next repeatable action..."
                    style={{ width: "100%", boxSizing: "border-box", borderRadius: "10px", border: `1px solid ${accentSoft}`, padding: "8px 10px", fontSize: "12px", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                <Btn onClick={() => setReflectionPopupOpen(false)} style={{ width: "100%" }}>
                  {timerDone ? "Save Reflection" : "Save And Return To Task"}
                </Btn>
                <Btn onClick={() => setReflectionPopupOpen(false)} variant="ghost" style={{ width: "100%" }}>
                  {timerDone ? "Return To Task" : "Keep This Open Later"}
                </Btn>
              </div>
            </div>
          </div>
        )}
        {step === "task" && !task && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#9BA8A0" }}>Task data not available</p>
            <Btn onClick={handleTaskContinue} style={{ width: "100%", marginTop: "16px" }}>
              Continue
            </Btn>
          </div>
        )}

        {/* JOURNAL STEP - Free-form Journaling */}
        {step === "journal" && (
          <div className="slide-up">
            <div style={{ padding: "16px 18px", borderRadius: "20px", background: "#FFFAF4", border: "1.5px solid #F5E5C8", marginBottom: "18px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#C4A882", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
                ✍️ Journal
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "19px", fontWeight: 500, color: "#2C3530", lineHeight: 1.45, marginBottom: "6px" }}>
                How are you feeling? What's on your mind?
              </p>
              <p style={{ fontSize: "12px", color: "#9BA8A0" }}>
                Optional — Reflect on your experience
              </p>
            </div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write your thoughts, feelings, or anything you'd like to remember about this session..."
              style={{
                width: "100%",
                minHeight: "180px",
                padding: "16px 18px",
                borderRadius: "16px",
                border: `1.5px solid ${accentSoft}`,
                background: "#fff",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                color: "#2C3530",
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = c;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = accentSoft;
              }}
            />
            <Btn
              onClick={handleJournal}
              style={{ width: "100%", marginTop: "16px" }}
            >
              Continue →
            </Btn>
            <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "14px", textAlign: "center" }}>
              💡 Journaling helps process your experience and track your journey
            </p>
          </div>
        )}

        {/* REFLECT STEP - Night Reflection */}
        {step === "reflect" && (
          <div className="slide-up">
            <div style={{ padding: "16px 18px", borderRadius: "20px", background: "#FFFAF4", border: "1.5px solid #F5E5C8", marginBottom: "18px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#C4A882", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
                🌙 Night Reflection
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "19px", fontWeight: 500, color: "#2C3530", lineHeight: 1.45, marginBottom: "6px" }}>
                {nightReflectionQuestions.length > 0 ? nightReflectionQuestions[rIdx].q : REFLECTION_QS[rIdx].q}
              </p>
              <p style={{ fontSize: "12px", color: "#9BA8A0" }}>
                Question {rIdx + 1} of {nightReflectionQuestions.length > 0 ? nightReflectionQuestions.length : REFLECTION_QS.length} · Tap to answer
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {(nightReflectionQuestions.length > 0 ? nightReflectionQuestions[rIdx].opts : REFLECTION_QS[rIdx].opts).map((opt) => {
                const currentQ = nightReflectionQuestions.length > 0 ? nightReflectionQuestions[rIdx] : REFLECTION_QS[rIdx];
                return (
                  <button
                    key={opt}
                    onClick={() => handleReflect(opt)}
                    style={{
                      background: rAns[currentQ.key] === opt ? accentBg : "#fff",
                      color: "#2C3530",
                      border: `1.5px solid ${rAns[currentQ.key] === opt ? c : accentSoft}`,
                      borderRadius: "16px",
                      padding: "14px 18px",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "14px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all .18s",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${rAns[currentQ.key] === opt ? c : accentSoft}`,
                        background: rAns[currentQ.key] === opt ? c : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all .18s",
                      }}
                    >
                      {rAns[currentQ.key] === opt && <CheckIcon size={10} />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "14px", textAlign: "center" }}>
              💡 Reflecting on your day helps build awareness and track your progress
            </p>
          </div>
        )}

        {/* DONE STEP */}
        {step === "done" && (
          <div className="fade-in" style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: c,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                animation: "celebrate .5s ease-out",
              }}
            >
              <CheckIcon size={26} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, marginBottom: "10px" }}>
              {reviewMode ? "Session Review" : (type === "night" ? "Day Complete." : "Session Complete.")}
            </h3>
            <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65, marginBottom: "20px" }}>
              {reviewMode
                ? "Loaded from your saved session notes, pointer answers, and journal entries."
                : (type === "night" ? "Reflection recorded. Rest well — you've earned it." : "Well done. Your next session will unlock on schedule.")}
            </p>

            {/* Quick Reminder Buttons */}
            {!reviewMode && (
            <div style={{ marginBottom: "26px", padding: "18px", background: "#fff", borderRadius: "20px", border: `1.5px solid ${accentBg}` }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: c, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                🔔 Remind me for tomorrow
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { id: 'morning', label: 'Morning', icon: '🌅' },
                  { id: 'midday', label: 'Midday', icon: '☀️' },
                  { id: 'night', label: 'Night', icon: '🌙' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleQuickReminder(r.id)}
                    disabled={scheduledReminders[r.id]}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      padding: "12px 4px",
                      borderRadius: "14px",
                      border: `1.5px solid ${scheduledReminders[r.id] ? c : accentBg}`,
                      background: scheduledReminders[r.id] ? `${c}18` : "#F9FAF9",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{scheduledReminders[r.id] ? '✅' : r.icon}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: scheduledReminders[r.id] ? c : "#5E6B64" }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
            )}

            <Btn
              onClick={() => {
                if (!reviewMode) {
                  onComplete(type);
                }
                onClose();
              }}
              style={{ width: "100%" }}
            >
              {reviewMode ? "Close Review" : (type === "night" ? "Complete Day ✓" : "Done")}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionModal;
