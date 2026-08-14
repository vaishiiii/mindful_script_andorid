import React, { useState, useEffect, useRef } from 'react';
import { Btn, Card, Tag, Toast, CheckIcon } from '@/components/ui';
import { SessionModal } from '@/components/session';
import { PROGRAMS } from '@/data/programs';
import { NOTIF_MSGS } from '@/data/sessions';
import { timeGreeting, todayQuote, parseT, toMin, fmtAMPM, nowMin, isDevMode, toggleDevMode, isAdminUser } from '@/utils/helpers';

const toRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') {
    return `rgba(122, 158, 135, ${alpha})`;
  }

  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) {
    return `rgba(122, 158, 135, ${alpha})`;
  }

  const num = Number.parseInt(cleanHex, 16);
  if (Number.isNaN(num)) {
    return `rgba(122, 158, 135, ${alpha})`;
  }

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PROGRAM_THEMES = {
  calm: { top: '#D7F2F4', mid: '#EAF9FA', glow: '#8EC7CF', contrast: '#3D6A71' },
  focus: { top: '#DCE4FF', mid: '#EEF2FF', glow: '#8F9AD8', contrast: '#414E8A' },
  confidence: { top: '#F8E3C8', mid: '#FFF3E4', glow: '#D5A466', contrast: '#7D5A2B' },
  healing: { top: '#E0F0DA', mid: '#F0F8ED', glow: '#9DC48E', contrast: '#48663F' },
  discipline: { top: '#DCE9F5', mid: '#EFF5FB', glow: '#7F9FBE', contrast: '#365675' },
  purpose: { top: '#E8DDF8', mid: '#F6F0FF', glow: '#B191D7', contrast: '#64448C' },
  habit: { top: '#DDF0E0', mid: '#EFF9F0', glow: '#88BE8E', contrast: '#3F6C43' },
};

const HOME_MOODS = [
  { emoji: '😄', label: 'Happy', tone: '#4C9AB5', soft: '#D9ECF4' },
  { emoji: '😢', label: 'Sad', tone: '#6C88BE', soft: '#E1E9F8' },
  { emoji: '😟', label: 'Anxious', tone: '#C38C4E', soft: '#F8E8D3' },
  { emoji: '😠', label: 'Irritated', tone: '#D96A62', soft: '#F7DFDD' },
  { emoji: '😌', label: 'Calm', tone: '#6EA67A', soft: '#DFF1E4' },
];

const resolveMoodIndex = (history = [], currentDay, currentProgram, currentDuration) => {
  const latestMood = [...history]
    .filter((entry) => Number(entry?.day) === Number(currentDay) && entry?.program === currentProgram && Number(entry?.programDuration || 3) === Number(currentDuration))
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];

  if (!latestMood || typeof latestMood.moodIndex !== 'number') {
    return 4; // Calm default
  }

  const idx = Number(latestMood.moodIndex);
  if (Number.isNaN(idx) || idx < 0 || idx >= HOME_MOODS.length) {
    return 4;
  }

  return idx;
};

const HomeMoodDial = ({ accent, glow, selectedIndex, onSelect }) => {
  const cx = 54;
  const cy = 73;
  const radius = 51;
  const startAngle = -92;
  const endAngle = 92;
  const step = (endAngle - startAngle) / (HOME_MOODS.length - 1);
  const selectedAngle = startAngle + selectedIndex * step;
  const pointerX = cx + Math.cos((selectedAngle * Math.PI) / 180) * (radius - 12);
  const pointerY = cy + Math.sin((selectedAngle * Math.PI) / 180) * (radius - 12);

  return (
    <div
      style={{
        width: 110,
        height: 146,
        position: 'relative',
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '45% 55% 52% 48% / 34% 34% 66% 66%',
          background: `radial-gradient(125% 100% at 45% 10%, rgba(255,255,255,0.94) 0%, ${toRgba(glow, 0.16)} 45%, ${toRgba(accent, 0.1)} 100%)`,
          border: `1px solid ${toRgba(accent, 0.14)}`,
          boxShadow: `0 8px 20px ${toRgba(accent, 0.12)}`,
          animation: 'eggFloat 5.2s ease-in-out infinite',
        }}
      />

      <svg width="110" height="146" viewBox="0 0 110 146" fill="none" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <path d="M54 20 A52 52 0 0 1 54 126" stroke={toRgba(accent, 0.2)} strokeWidth="7" strokeLinecap="round" />
        <path d="M54 24 A48 48 0 0 1 54 122" stroke={toRgba(glow, 0.34)} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
        <line x1={cx} y1={cy} x2={pointerX} y2={pointerY} stroke={toRgba(accent, 0.46)} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill={toRgba(accent, 0.45)} />
      </svg>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 76, textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#F7FFFE', fontWeight: 700, textShadow: `0 0 8px ${toRgba(glow, 0.76)}, 0 0 14px ${toRgba(accent, 0.48)}`, letterSpacing: '0.04em' }}>
          Mood
        </p>
        <p style={{ fontSize: '10px', color: HOME_MOODS[selectedIndex].tone, fontWeight: 700, marginTop: '1px' }}>
          {HOME_MOODS[selectedIndex].label}
        </p>
      </div>

      {HOME_MOODS.map((mood, index) => {
        const angle = startAngle + index * step;
        const btnRadius = radius;
        const x = cx + Math.cos((angle * Math.PI) / 180) * btnRadius;
        const y = cy + Math.sin((angle * Math.PI) / 180) * btnRadius;
        const selected = selectedIndex === index;

        return (
          <button
            key={mood.label}
            onClick={() => onSelect(index)}
            title={mood.label}
            aria-label={`Set mood ${mood.label}`}
            style={{
              position: 'absolute',
              left: x - 13,
              top: y - 13,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: selected ? `1.5px solid ${mood.tone}` : `1px solid ${toRgba(accent, 0.16)}`,
              background: selected ? `linear-gradient(160deg, #ffffff 0%, ${mood.soft} 100%)` : mood.soft,
              transform: selected ? 'scale(1.32)' : 'scale(1)',
              transition: 'all .18s ease',
              boxShadow: selected ? `0 8px 16px ${toRgba(accent, 0.26)}` : `0 2px 6px ${toRgba(accent, 0.08)}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              lineHeight: 1,
              padding: 0,
            }}
          >
            {mood.emoji}
          </button>
        );
      })}

    </div>
  );
};

const HomeTab = ({ program, unlocks, day, completions, onSessionComplete, onDevSkipDay, streak, onDayChange, activePaidProgram, programDuration = 3, onReflectionSave, user, reflectionData = [], allDayCompletions = [], onCelebrationContinue, moodHistory = [], onMoodLog, postTrialHomeMode = false, postTrialCompletionKey = null, onOpenReport, onOpenPrograms, onOpenGoalSwitch }) => {
  const [nowM, setNowM] = useState(nowMin());
  const [activeS, setActiveS] = useState(null);
  const [shakeS, setShakeS] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewingDay, setViewingDay] = useState(day);
  const [devMode, setDevMode] = useState(() => isDevMode());
  const [moodIndex, setMoodIndex] = useState(() => resolveMoodIndex(moodHistory, day, program, programDuration));
  const [moodReady, setMoodReady] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [expandedCompletedSession, setExpandedCompletedSession] = useState(null);
  const [showPostTrialDetails, setShowPostTrialDetails] = useState(false);
  const [notifications, setNotifications] = useState(() => ([
    {
      id: `welcome-${Date.now()}`,
      title: 'Welcome back',
      body: 'Your mindful journey continues. Check upcoming sessions.',
      time: new Date().toISOString(),
      unread: true,
    },
  ]));
  const prevNowM = useRef(nowMin());
  const prevCompletionsRef = useRef(completions);
  const unlockNoticeRef = useRef(new Set());
  const upcomingNoticeRef = useRef(new Set());

  // Sync viewingDay to current day when the user advances to a new day
  useEffect(() => {
    setViewingDay(day);
  }, [day]);

  useEffect(() => {
    if (postTrialHomeMode) {
      setViewingDay(programDuration);
    }
  }, [postTrialHomeMode, programDuration]);

  useEffect(() => {
    if (!postTrialHomeMode) {
      setShowPostTrialDetails(false);
      return;
    }

    if (!postTrialCompletionKey) {
      setShowPostTrialDetails(false);
      return;
    }

    const storageKey = `ms_posttrial_autopen_${program}_${postTrialCompletionKey}`;
    const alreadyShown = localStorage.getItem(storageKey);

    if (!alreadyShown) {
      setShowPostTrialDetails(true);
      localStorage.setItem(storageKey, '1');
      return;
    }

    setShowPostTrialDetails(false);
  }, [postTrialHomeMode, postTrialCompletionKey, program]);

  const isAdmin = isAdminUser(user?.email);
  const effectiveDevMode = devMode && isAdmin;

  const handleToggleDev = () => {
    if (!isAdmin) return;
    toggleDevMode(user?.email);
    setDevMode(isDevMode());
  };
  
  const addNotification = (title, body, key = null) => {
    if (key) {
      if (unlockNoticeRef.current.has(`notif-${key}`)) {
        return;
      }
      unlockNoticeRef.current.add(`notif-${key}`);
    }

    setNotifications((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        body,
        time: new Date().toISOString(),
        unread: true,
      },
      ...prev,
    ].slice(0, 24));
  };

  // Get user's first name or email prefix
  const getUserName = () => {
    if (!user) return '';
    
    if (user.displayName) {
      // Get first name from display name
      return user.displayName.split(' ')[0];
    }
    
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      const cleaned = emailPrefix.split(/[._\-0-9]+/).filter(Boolean)[0] || emailPrefix;
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return '';
  };
  
  const userName = getUserName();

  useEffect(() => {
    const resolved = resolveMoodIndex(moodHistory, day, program, programDuration);
    setMoodIndex(resolved);
    setMoodReady(true);
  }, [day, program, programDuration, moodHistory]);

  useEffect(() => {
    if (!moodReady || typeof onMoodLog !== 'function') {
      return;
    }

    onMoodLog({
      day,
      program,
      programDuration,
      moodIndex,
      moodLabel: HOME_MOODS[moodIndex].label,
      moodEmoji: HOME_MOODS[moodIndex].emoji,
    });
  }, [moodReady, moodIndex, day, program, programDuration, onMoodLog]);

  useEffect(() => {
    const id = setInterval(() => {
      const cur = nowMin();
      setNowM(cur);
      const prev = prevNowM.current;
      prevNowM.current = cur;

      const sessions = ["morning", "midday", "night"];
      sessions.forEach((s) => {
        const { h, m } = parseT(unlocks[s]);
        const t = toMin(h, m);
        if (prev < t && cur >= t && !completions[s]) {
          setToast(NOTIF_MSGS[s]);
          addNotification('Session unlocked', `${s[0].toUpperCase()}${s.slice(1)} session is ready now.`, `unlock-${day}-${s}`);
          setTimeout(() => setToast(null), 5000);
        }

        const until = t - cur;
        const upcomingKey = `${day}-${s}`;
        if (until > 0 && until <= 45 && !completions[s] && !upcomingNoticeRef.current.has(upcomingKey)) {
          upcomingNoticeRef.current.add(upcomingKey);
          addNotification('Upcoming session', `${s[0].toUpperCase()}${s.slice(1)} starts at ${fmtAMPM(h, m)}.`, `upcoming-${upcomingKey}`);
        }
      });
    }, 15000);
    return () => clearInterval(id);
  }, [unlocks, completions]);

  useEffect(() => {
    const prev = prevCompletionsRef.current;
    ['morning', 'midday', 'night'].forEach((s) => {
      if (!prev?.[s] && completions?.[s]) {
        addNotification('Session completed', `Nice work. ${s[0].toUpperCase()}${s.slice(1)} session marked complete.`);
      }
    });
    prevCompletionsRef.current = completions;
  }, [completions]);

  useEffect(() => {
    if (!notificationOpen) {
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, [notificationOpen]);

  const prog = PROGRAMS.find((p) => p.id === program);
  const accent = prog?.color || '#7A9E87';
  const theme = PROGRAM_THEMES[program] || PROGRAM_THEMES.calm;

  const isTimeOk = (s) => {
    if (effectiveDevMode) return true;
    const { h, m } = parseT(unlocks[s]);
    return nowM >= toMin(h, m);
  };

  // If Day 1 begins late at night, allow users to start from the night session.
  const canLateStartNight =
    day === 1 &&
    !completions.morning &&
    !completions.midday &&
    !completions.night &&
    isTimeOk('night');

  const canOpen = {
    morning: !completions.morning && isTimeOk("morning"),
    midday: !completions.midday && (effectiveDevMode ? true : (isTimeOk("midday") && completions.morning)),
    night: !completions.night && (effectiveDevMode ? true : (isTimeOk("night") && (completions.midday || canLateStartNight))),
  };

  const lockMsg = (s) => {
    if (completions[s]) return null;
    if (s === "midday" && !completions.morning) return "Complete morning session first";
    if (s === "night" && !completions.midday && !canLateStartNight) return "Complete midday session first";
    if (!isTimeOk(s)) {
      const { h, m } = parseT(unlocks[s]);
      return `Unlocks at ${fmtAMPM(h, m)}`;
    }
    return null;
  };

  const handleLockedTap = (s) => {
    setShakeS(s);
    setTimeout(() => setShakeS(null), 450);
  };

  const isPastDay = viewingDay < day;
  const isCurrentContextPaid = activePaidProgram !== null || programDuration > 3;

  // For past days use stored completions; for current day use live completions prop
  const viewedCompletions = isPastDay
    ? (allDayCompletions[viewingDay - 1] || {})
    : completions;

  const getSessionReviewData = (sessionType) => {
    const entries = reflectionData
      .filter((entry) => {
        const sameSession = entry?.sessionType === sessionType;
        const sameDay = Number(entry?.day) === Number(viewingDay);
        const sameProgram = entry?.program === program;
        const samePaidState = Boolean(entry?.isPaidProgram) === isCurrentContextPaid;
        const sameDuration = Number(entry?.programDuration || 3) === Number(programDuration);
        return sameSession && sameDay && sameProgram && samePaidState && sameDuration;
      })
      .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

    if (entries.length === 0) {
      return null;
    }

    return entries.reduce((acc, entry) => ({
      ...acc,
      ...entry,
      taskInputs: { ...(acc.taskInputs || {}), ...(entry.taskInputs || {}) },
      taskPrompts: { ...(acc.taskPrompts || {}), ...(entry.taskPrompts || {}) },
      answers: { ...(acc.answers || {}), ...(entry.answers || {}) },
      timerInsight: entry.timerInsight || acc.timerInsight || '',
      journalEntry: entry.journalEntry || acc.journalEntry || '',
    }), {});
  };

  const sessCount = [viewedCompletions.morning, viewedCompletions.midday, viewedCompletions.night].filter(Boolean).length;

  const getDayCompletionCount = (targetDay) => {
    const entry = allDayCompletions[targetDay - 1] || (Number(targetDay) === Number(day) ? completions : null);
    if (!entry) return 0;
    return [entry.morning, entry.midday, entry.night].filter(Boolean).length;
  };

  const selectedDayCompletionCount = getDayCompletionCount(viewingDay);

  const handleSelectRecapDay = (dayNo) => {
    setViewingDay(dayNo);
    setShowPostTrialDetails(true);
  };

  const sessions = [
    { id: "morning", icon: "🌅", label: "Morning Session", duration: "6-10 min", sub: ["Breathwork", "Morning activation task"] },
    { id: "midday", icon: "🌤", label: "Midday Session", duration: "8-14 min", sub: ["Breath reset", "Real-world action task", "Timed challenge"] },
    { id: "night", icon: "🌙", label: "Night Session", duration: "7-12 min", sub: ["Calming breathwork", "Nightly reflection"] },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;
  const goalPrompt = {
    calm: '🌊 Your calm goal is about softer reactions and steadier breathing.',
    focus: '🎯 Your focus goal is about deep attention and clean execution.',
    confidence: '🛡️ Your confidence goal is about self-trust through action.',
    healing: '🌷 Your healing goal is about emotional safety and release.',
    discipline: '⚙️ Your discipline goal is about consistency over intensity.',
    purpose: '🧭 Your purpose goal is about meaning-led daily choices.',
    habit: '🔁 Your habit goal is about building automatic healthy routines.',
  }[program] || '✨ Your journey is built around your chosen growth path.';

  const uniformCtaStyle = {
    width: '100%',
    minHeight: 44,
    padding: '0 14px',
    borderRadius: 999,
    fontSize: '12px',
    fontWeight: 700,
  };

  const recapPrimaryCtaStyle = {
    width: '100%',
    minHeight: 38,
    padding: '0 13px',
    borderRadius: 999,
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '0.01em',
  };

  const recapSecondaryCtaStyle = {
    minHeight: 35,
    padding: '0 11px',
    borderRadius: 999,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.01em',
  };

  return (
    <div
      style={{
        paddingBottom: "32px",
        background: `
          radial-gradient(120% 55% at 50% -8%, ${toRgba(theme.contrast, 0.2)} 0%, rgba(255,255,255,0) 70%),
          linear-gradient(180deg, ${toRgba(theme.contrast, 0.26)} 0%, ${theme.top} 16%, ${theme.mid} 38%, #F3F2EE 66%, #F7F6F2 100%)
        `,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(74% 36% at 50% 0%, ${toRgba(theme.glow, 0.26)} 0%, rgba(255,255,255,0) 100%)`,
          animation: 'dashboardNeonPulse 7.8s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(180deg, ${toRgba(theme.contrast, 0.12)} 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 72%, ${toRgba(accent, 0.06)} 100%)`,
          zIndex: 0,
        }}
      />

      {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}

      {/* Hero insight */}
      <div
        style={{
          background: `radial-gradient(128% 132% at 100% -10%, ${toRgba(theme.glow, 0.34)} 0%, ${toRgba(theme.contrast, 0.18)} 26%, ${theme.top} 52%, ${theme.mid} 76%, ${toRgba(theme.mid, 0.92)} 100%)`,
          padding: '18px 16px 12px',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
          boxShadow: `0 18px 36px ${toRgba(accent, 0.16)}, 0 0 26px ${toRgba(theme.glow, 0.2)}, inset 0 0 0 1px ${toRgba(accent, 0.14)}`,
        }}
      >
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', right: -110, top: -120, background: toRgba(theme.glow, 0.2), filter: 'blur(2px)', animation: 'heroGlowDrift 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 230, height: 230, borderRadius: '50%', left: -120, top: -100, background: toRgba(theme.contrast, 0.12), filter: 'blur(3px)' }} />
        <div style={{ position: 'absolute', width: 190, height: 190, borderRadius: '50%', left: -100, bottom: -130, background: toRgba(accent, 0.12) }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 22%, rgba(255,255,255,0) 100%)`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <Card
            style={{
              background: `linear-gradient(140deg, rgba(255,255,255,0.85) 0%, ${toRgba(theme.glow, 0.08)} 100%)`,
              border: `1px solid ${toRgba(accent, 0.14)}`,
              boxShadow: `0 14px 30px ${toRgba(accent, 0.14)}, 0 0 24px ${toRgba(theme.glow, 0.22)}`,
              backdropFilter: 'blur(12px)',
              borderRadius: 24,
              padding: '12px 12px 11px',
              position: 'relative',
              overflow: 'visible',
            }}
          >
            <div style={{ position: 'absolute', width: 118, height: 118, borderRadius: '50%', right: -38, top: -54, background: toRgba(theme.glow, 0.14) }} />
            {isAdmin && (
              <button
                onClick={handleToggleDev}
                title="Toggle dev mode"
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  padding: '4px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${effectiveDevMode ? '#E8941A' : toRgba(accent, 0.16)}`,
                  background: effectiveDevMode ? '#FFF3E0' : 'rgba(255,255,255,0.92)',
                  color: effectiveDevMode ? '#E8941A' : '#829288',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  zIndex: 2,
                }}
              >🛠 DEV</button>
            )}
            <button
              onClick={() => setNotificationOpen((v) => !v)}
              aria-label="Open notifications"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: `1px solid ${toRgba(accent, 0.22)}`,
                background: 'rgba(255,255,255,0.92)',
                color: '#5E6B64',
                fontSize: '15px',
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: '#D96A62',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {Math.min(9, unreadCount)}
                </span>
              )}
            </button>
            <div style={{ marginBottom: '4px', position: 'relative' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: theme.contrast, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Today's Insight
              </span>
            </div>

            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '22px', lineHeight: 1.28, color: '#1F2924', marginTop: '4px', marginBottom: '10px', position: 'relative' }}>
              "{todayQuote(program)}"
            </p>

            <div style={{ height: 1, background: `linear-gradient(90deg, ${toRgba(theme.glow, 0.32)} 0%, ${toRgba(accent, 0.05)} 100%)`, margin: '0 0 10px', position: 'relative' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '11px', position: 'relative' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '26px', fontWeight: 500, color: '#1F2C25', lineHeight: 1.04, marginBottom: '7px' }}>
                  {userName ? `Hi, ${userName} 🙂` : `${timeGreeting()} 🙂`}
                </h2>
                <span style={{ fontSize: '12px', color: '#6C7F75', display: 'block', lineHeight: 1.5, paddingRight: '4px' }}>
                  {goalPrompt}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '-14px' }}>
                <HomeMoodDial accent={accent} glow={theme.glow} selectedIndex={moodIndex} onSelect={setMoodIndex} />
              </div>
            </div>

            {notificationOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 8,
                  width: 250,
                  maxHeight: 220,
                  overflowY: 'auto',
                  borderRadius: 14,
                  border: `1px solid ${toRgba(accent, 0.16)}`,
                  background: 'rgba(255,255,255,0.96)',
                  boxShadow: `0 10px 24px ${toRgba(accent, 0.18)}`,
                  zIndex: 4,
                  padding: '8px 8px 6px',
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, color: '#6C7F75', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Notifications
                </p>
                {notifications.length === 0 && (
                  <p style={{ fontSize: 12, color: '#9BA8A0' }}>No notifications yet.</p>
                )}
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: '7px 7px', borderRadius: 10, background: n.unread ? toRgba(theme.glow, 0.12) : 'transparent', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#2C3530', marginBottom: 2 }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: '#6C7F75', lineHeight: 1.45 }}>{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {postTrialHomeMode && (
            <Card
              style={{
                marginTop: '8px',
                marginBottom: '10px',
                border: `1.5px solid ${toRgba(accent, 0.34)}`,
                background: `linear-gradient(150deg, rgba(255,255,255,0.96) 0%, ${toRgba(theme.glow, 0.22)} 58%, ${toRgba(accent, 0.2)} 100%)`,
                boxShadow: `0 12px 26px ${toRgba(accent, 0.2)}`,
                borderRadius: 24,
              }}
            >
              <p style={{ fontSize: '10px', color: theme.contrast, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: '6px' }}>
                {programDuration}-Day Recap
              </p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', color: '#24312B', fontWeight: 600, lineHeight: 1.15, marginBottom: '5px' }}>
                You completed this transformation cycle.
              </p>
              <p style={{ fontSize: '12px', color: '#5E6B64', lineHeight: 1.6, marginBottom: '10px' }}>
                Revisit your report, then either choose another program in this goal or switch to a new goal.
              </p>
              <Btn
                onClick={() => {
                  if (typeof onOpenReport === 'function') onOpenReport();
                }}
                style={{
                  ...recapPrimaryCtaStyle,
                  marginBottom: '6px',
                }}
              >
                View Your Report →
              </Btn>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    if (typeof onOpenPrograms === 'function') onOpenPrograms();
                  }}
                  style={{
                    ...recapSecondaryCtaStyle,
                    flex: 1,
                    borderColor: toRgba(accent, 0.42),
                    color: theme.contrast,
                    background: `linear-gradient(160deg, rgba(255,255,255,0.96) 0%, ${toRgba(theme.glow, 0.14)} 100%)`,
                    boxShadow: `0 5px 10px ${toRgba(accent, 0.13)}`,
                  }}
                >
                  Another Program
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    if (typeof onOpenGoalSwitch === 'function') onOpenGoalSwitch();
                  }}
                  style={{
                    ...recapSecondaryCtaStyle,
                    flex: 1,
                    borderColor: toRgba(accent, 0.3),
                    color: '#5E6B64',
                    background: `linear-gradient(160deg, rgba(255,255,255,0.94) 0%, ${toRgba(accent, 0.08)} 100%)`,
                    boxShadow: `0 4px 10px ${toRgba(accent, 0.1)}`,
                  }}
                >
                  Switch Goal
                </Btn>
              </div>
            </Card>
          )}

          {!postTrialHomeMode && (
          <div style={{ marginTop: '8px', padding: '8px clamp(7px, 2.4vw, 10px) 10px', borderRadius: '14px', background: `linear-gradient(160deg, rgba(255,255,255,0.68) 0%, ${toRgba(theme.glow, 0.08)} 100%)`, border: `1px solid ${toRgba(accent, 0.14)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'nowrap' }}>
            {/* Day navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
              <button
                onClick={() => {
                  if (postTrialHomeMode) return;
                  setViewingDay(v => Math.max(1, v - 1));
                }}
                disabled={postTrialHomeMode || viewingDay <= 1}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: 'none',
                  background: !postTrialHomeMode && viewingDay > 1 ? theme.contrast : '#E0E0E0',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: !postTrialHomeMode && viewingDay > 1 ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, lineHeight: 1, flexShrink: 0,
                }}
                aria-label="Previous day"
              >‹</button>
              <Tag label={postTrialHomeMode ? `Day ${programDuration}/${programDuration} Recap` : `Day ${viewingDay}/${programDuration}`} color={isPastDay ? '#9BA8A0' : accent} />
              <button
                onClick={() => {
                  if (postTrialHomeMode) return;
                  setViewingDay(v => Math.min(day, v + 1));
                }}
                disabled={postTrialHomeMode || viewingDay >= day}
                style={{
                  width: 22, height: 22, borderRadius: '50%', border: 'none',
                  background: !postTrialHomeMode && viewingDay < day ? theme.contrast : '#E0E0E0',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                  cursor: !postTrialHomeMode && viewingDay < day ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, lineHeight: 1, flexShrink: 0,
                }}
                aria-label="Next day"
              >›</button>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: '#63746C', fontWeight: 600, whiteSpace: 'nowrap' }}>{sessCount}/3 sessions{isPastDay ? '' : ' today'}</span>
              {streak > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '10px',
                    color: '#A47D47',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 999,
                    border: `1px solid ${toRgba('#D7B07B', 0.45)}`,
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(245,223,187,0.58) 100%)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '11px', lineHeight: 1 }}>🔥</span>
                  {streak}d
                </span>
              )}
            </div>
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "9px" }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 999,
                    background: viewedCompletions[s.id] ? `linear-gradient(90deg, ${theme.contrast} 0%, ${accent} 100%)` : (!isPastDay && isTimeOk(s.id)) ? toRgba(accent, 0.34) : '#D9E2DE',
                    transition: "background .4s",
                  }}
                />
              ))}
            </div>
            {isPastDay && (
              <span style={{ fontSize: '11px', color: '#B5956A', fontStyle: 'italic', fontWeight: 500, marginTop: '6px', display: 'inline-block' }}>reviewing past day</span>
            )}
          </div>
          )}

          {postTrialHomeMode && (
            <Card
              style={{
                marginTop: '8px',
                borderRadius: 18,
                border: `1px solid ${toRgba(accent, 0.26)}`,
                background: `linear-gradient(165deg, rgba(255,255,255,0.95) 0%, ${toRgba(theme.glow, 0.14)} 100%)`,
                boxShadow: `0 8px 18px ${toRgba(accent, 0.12)}`,
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <Tag label={`Day ${programDuration}/${programDuration} Recap`} color={accent} />
                <span style={{ fontSize: '11px', color: '#63746C', fontWeight: 700 }}>{selectedDayCompletionCount}/3 sessions</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '9px' }}>
                {Array.from({ length: programDuration }, (_, idx) => {
                  const dayNo = idx + 1;
                  const completeCount = getDayCompletionCount(dayNo);
                  const pct = Math.round((completeCount / 3) * 100);
                  const isSelected = Number(viewingDay) === dayNo;
                  return (
                    <button
                      key={`compact-day-${dayNo}`}
                      onClick={() => handleSelectRecapDay(dayNo)}
                      title={`Day ${dayNo}`}
                      style={{
                        flex: 1,
                        height: isSelected ? 11 : 9,
                        borderRadius: 999,
                        border: isSelected ? `1.5px solid ${toRgba(theme.contrast, 0.62)}` : `1px solid ${toRgba(accent, 0.18)}`,
                        background: completeCount > 0
                          ? isSelected
                            ? `linear-gradient(90deg, ${theme.contrast} 0%, ${accent} ${pct}%, #C8D5CF ${pct}%, #C8D5CF 100%)`
                            : `linear-gradient(90deg, ${theme.contrast} 0%, ${accent} ${pct}%, #D9E2DE ${pct}%, #D9E2DE 100%)`
                          : '#D9E2DE',
                        boxShadow: isSelected
                          ? `0 8px 16px ${toRgba(accent, 0.28)}, inset 0 1px 0 rgba(255,255,255,0.55)`
                          : 'none',
                        transform: isSelected ? 'translateY(-1px)' : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all .2s ease',
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '0 2px' }}>
                {Array.from({ length: programDuration }, (_, idx) => {
                  const dayNo = idx + 1;
                  const isSelected = Number(viewingDay) === dayNo;
                  return (
                    <span
                      key={`compact-day-label-${dayNo}`}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: isSelected ? '10px' : '9px',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? theme.contrast : '#8D9A93',
                        letterSpacing: isSelected ? '0.02em' : '0.01em',
                        lineHeight: 1.2,
                        textShadow: isSelected ? `0 0 6px ${toRgba(theme.glow, 0.5)}` : 'none',
                      }}
                    >
                      D{dayNo}
                    </span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <p style={{ fontSize: '11px', color: '#6D7D75', fontWeight: 600 }}>Completed Sessions (Day {viewingDay})</p>
                <button
                  onClick={() => setShowPostTrialDetails((v) => !v)}
                  style={{
                    border: `1px solid ${toRgba(accent, 0.3)}`,
                    background: `linear-gradient(160deg, rgba(255,255,255,0.96) 0%, ${toRgba(theme.glow, 0.16)} 100%)`,
                    color: theme.contrast,
                    borderRadius: 999,
                    padding: '3px 9px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: `0 4px 8px ${toRgba(accent, 0.14)}`,
                  }}
                >
                  {showPostTrialDetails ? 'Hide Details' : 'Review Details'}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          marginTop: '-10px',
          padding: "18px 22px 12px",
          position: 'relative',
          isolation: 'isolate',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: '-56px -6px -24px',
            pointerEvents: 'none',
            zIndex: 0,
            background: `
              radial-gradient(132% 64% at 8% -10%, ${toRgba(theme.glow, 0.24)} 0%, rgba(255,255,255,0) 64%),
              radial-gradient(110% 58% at 98% 22%, ${toRgba(accent, 0.18)} 0%, rgba(255,255,255,0) 68%),
              radial-gradient(150% 84% at 50% 108%, ${toRgba(accent, 0.2)} 0%, ${toRgba(theme.contrast, 0.14)} 40%, rgba(255,255,255,0) 80%),
              linear-gradient(180deg, rgba(255,255,255,0) 0%, ${toRgba(theme.contrast, 0.05)} 28%, ${toRgba(theme.mid, 0.24)} 50%, ${toRgba(accent, 0.18)} 74%, rgba(255,255,255,0) 100%)
            `,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -8,
            right: -8,
            top: -52,
            height: 120,
            pointerEvents: 'none',
            zIndex: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${toRgba(theme.mid, 0.18)} 46%, rgba(255,255,255,0) 100%)`,
            opacity: 0.9,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -26,
            right: -20,
            top: -34,
            height: 640,
            pointerEvents: 'none',
            zIndex: 0,
            background: `
              linear-gradient(180deg, rgba(255,255,255,0) 0%, ${toRgba(theme.glow, 0.07)} 34%, ${toRgba(theme.glow, 0.08)} 60%, rgba(255,255,255,0) 100%),
              repeating-linear-gradient(150deg, ${toRgba(theme.glow, 0.07)} 0 3px, rgba(255,255,255,0) 3px 18px)
            `,
            opacity: 0.2,
            filter: 'blur(0.35px)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: -14,
            right: -14,
            bottom: -22,
            height: 200,
            pointerEvents: 'none',
            zIndex: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${toRgba(theme.contrast, 0.11)} 42%, ${toRgba(accent, 0.2)} 100%)`,
            borderRadius: 36,
            opacity: 0.86,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Dev mode banner */}
        {effectiveDevMode && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#FFF3E0", borderRadius: "10px", border: "1px solid #FFB74D", marginBottom: "14px" }}>
            <span style={{ fontSize: "14px" }}>🛠</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#E8941A" }}>Dev Mode — time locks off, timers skippable</span>
            <Btn
              onClick={() => onDevSkipDay && onDevSkipDay()}
              variant="ghost"
              style={{ marginLeft: "auto", padding: "6px 10px", fontSize: "11px", color: "#E8941A", borderColor: "#E8941A" }}
            >
              Skip Day (dev)
            </Btn>
          </div>
        )}

        {/* Day complete banner — shown when all sessions are done but user hasn't continued past celebration yet */}
        {!postTrialHomeMode && !isPastDay && completions.morning && completions.midday && completions.night && onCelebrationContinue && (
          <Card
            style={{
              marginTop: '4px',
              marginBottom: '12px',
              border: `1.5px solid ${toRgba(accent, 0.32)}`,
              background: `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, ${toRgba(theme.glow, 0.22)} 55%, ${toRgba(accent, 0.18)} 100%)`,
              boxShadow: `0 12px 24px ${toRgba(accent, 0.2)}`,
              borderRadius: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(160deg, ${theme.contrast} 0%, ${accent} 100%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 8px 16px ${toRgba(accent, 0.32)}` }}>
                🎉
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '15px', color: '#24312B', marginBottom: '2px' }}>Day {day} Completed</p>
                <p style={{ fontSize: '12px', color: '#5E6B64' }}>
                  {day < programDuration ? 'All sessions done. Continue your streak.' : 'Program complete. Your report is ready.'}
                </p>
              </div>
            </div>
            <Btn
              onClick={onCelebrationContinue}
              style={{
                ...uniformCtaStyle,
                marginTop: '10px',
              }}
            >
              {day < programDuration ? `Continue to Day ${day + 1} →` : 'View Your Report →'}
            </Btn>
          </Card>
        )}

        {postTrialHomeMode && showPostTrialDetails && (
          <p style={{ fontSize: '10px', color: '#8B9992', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '2px 2px 10px' }}>
            Completed Sessions
          </p>
        )}

        {/* Session cards */}
        {(!postTrialHomeMode || showPostTrialDetails) && sessions.map((s) => {
          const comp = viewedCompletions[s.id];

          // For past days: completed = reviewable, not completed = missed (greyed, not clickable)
          // For current day: use existing time/ordering lock logic
          let open = false;
          let locked = false;
          let msg = null;

          if (isPastDay) {
            open = !!comp; // only "open" for review if completed
            locked = !comp; // missed sessions are locked/greyed
            msg = locked ? "Not completed" : null;
          } else {
            open = canOpen[s.id];
            locked = !open && !comp;
            msg = lockMsg(s.id);
          }

          const isShaking = shakeS === s.id;
          const lockedReadable = locked && !comp;

          return (
            <div
              key={s.id}
              className={isShaking ? "shake" : ""}
              style={{ marginBottom: "10px" }}
              onClick={() => {
                if (isPastDay) {
                  if (comp) setExpandedCompletedSession((prev) => prev === s.id ? null : s.id);
                  // missed past sessions: do nothing
                } else {
                  if (locked) handleLockedTap(s.id);
                  else if (comp) setExpandedCompletedSession((prev) => prev === s.id ? null : s.id);
                  else if (open) setActiveS(s.id);
                }
              }}
            >
              <Card style={{
                opacity: locked ? 0.86 : 1,
                cursor: (comp || (!isPastDay && open)) ? "pointer" : "default",
                position: 'relative',
                border: comp
                  ? `1.5px solid ${toRgba(accent, postTrialHomeMode ? 0.34 : 0.5)}`
                  : `1.5px solid ${locked ? toRgba(theme.contrast, 0.24) : toRgba(accent, 0.16)}`,
                background: comp
                  ? `linear-gradient(156deg, ${toRgba(theme.contrast, postTrialHomeMode ? 0.1 : 0.15)} 0%, ${toRgba(accent, postTrialHomeMode ? 0.12 : 0.18)} 38%, rgba(255,255,255,0.99) 78%)`
                  : locked
                  ? `linear-gradient(162deg, rgba(255,255,255,0.98) 0%, ${toRgba(theme.mid, 0.42)} 74%, ${toRgba(theme.contrast, 0.14)} 100%)`
                  : `linear-gradient(160deg, rgba(255,255,255,1) 0%, ${toRgba(accent, 0.08)} 100%)`,
                boxShadow: comp
                  ? `0 10px 22px ${toRgba(accent, postTrialHomeMode ? 0.14 : 0.22)}, 0 0 14px ${toRgba(accent, postTrialHomeMode ? 0.2 : 0.3)}, 0 0 22px ${toRgba(theme.glow, 0.24)}`
                  : locked
                  ? `0 6px 14px ${toRgba(theme.contrast, 0.1)}, inset 0 1px 0 rgba(255,255,255,0.62)`
                  : `0 9px 22px ${toRgba(accent, 0.14)}, 0 0 12px ${toRgba(theme.glow, 0.14)}`,
                borderRadius: 26,
                transition: "all 0.2s"
              }}>
                {comp && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: 30,
                      pointerEvents: 'none',
                      background: `radial-gradient(92% 76% at 50% 8%, ${toRgba(accent, 0.34)} 0%, ${toRgba(theme.glow, 0.18)} 42%, rgba(255,255,255,0) 100%)`,
                      filter: 'blur(8px)',
                      opacity: postTrialHomeMode ? 0.36 : 0.5,
                      zIndex: 0,
                    }}
                  />
                )}
                {comp && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 1,
                      borderRadius: 24,
                      pointerEvents: 'none',
                      background: `linear-gradient(120deg, ${toRgba(theme.glow, 0)} 0%, ${toRgba(theme.glow, 0.34)} 35%, ${toRgba(accent, 0.52)} 50%, ${toRgba(theme.glow, 0.34)} 65%, ${toRgba(theme.glow, 0)} 100%)`,
                      backgroundSize: '220% 220%',
                      mixBlendMode: 'screen',
                      opacity: postTrialHomeMode ? 0.24 : 0.34,
                      animation: 'btnGlowFlow 4.2s ease-in-out infinite',
                      zIndex: 1,
                    }}
                  />
                )}
                {!locked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 26,
                      pointerEvents: 'none',
                      border: `1px solid ${toRgba(theme.glow, comp ? 0.44 : 0.2)}`,
                      boxShadow: `inset 0 0 0 1px ${toRgba(theme.glow, comp ? 0.18 : 0.09)}`,
                      opacity: comp ? 1 : 0.72,
                    }}
                  />
                )}
                {locked && !comp && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 9,
                      right: 9,
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `1px solid ${toRgba(theme.contrast, 0.34)}`,
                      background: `linear-gradient(155deg, ${toRgba(theme.contrast, 0.78)} 0%, ${toRgba(accent, 0.78)} 62%, ${toRgba(theme.glow, 0.82)} 100%)`,
                      boxShadow: `0 6px 14px ${toRgba(accent, 0.3)}, 0 0 10px ${toRgba(theme.glow, 0.24)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <rect x="2" y="6" width="10" height="7" rx="2" stroke="#FFFFFF" strokeWidth="1.5" fill="rgba(255,255,255,0.06)" />
                      <path d="M4.5 6V4a2.5 2.5 0 0 1 5 0v2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "13px", position: 'relative', zIndex: 2 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "14px",
                      flexShrink: 0,
                      background: comp ? `linear-gradient(170deg, ${theme.contrast} 0%, ${accent} 100%)` : locked ? "#F0EFE9" : `linear-gradient(170deg, ${toRgba(theme.glow, 0.32)} 0%, ${toRgba(accent, 0.2)} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background .3s",
                      boxShadow: comp ? `0 8px 16px ${toRgba(accent, 0.28)}` : 'none',
                    }}
                  >
                    {comp ? <CheckIcon /> : <span style={{ fontSize: "18px" }}>{s.icon}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: locked && !comp ? '26px' : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: comp ? theme.contrast : (lockedReadable ? '#2A3631' : '#2C3530') }}>{s.label}</p>
                      {comp && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: '#fff',
                            border: `1px solid ${toRgba(theme.glow, 0.55)}`,
                            background: `linear-gradient(135deg, ${theme.contrast} 0%, ${accent} 58%, ${theme.glow} 100%)`,
                            boxShadow: `0 0 8px ${toRgba(accent, 0.34)}, 0 4px 10px ${toRgba(accent, 0.2)}`,
                          }}
                        >
                          Completed
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '10px', color: lockedReadable ? '#55665D' : '#7F8D85', fontWeight: 700, letterSpacing: '0.02em', marginTop: '2px' }}>{s.duration}</p>
                    {comp ? (
                      <p style={{ fontSize: '11px', color: theme.contrast, marginTop: '6px', fontWeight: 600 }}>
                        {s.label} completed. Tap to review.
                      </p>
                    ) : (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                        {s.sub.map((t, i) => (
                          <span key={i} style={{ fontSize: "11px", color: lockedReadable ? '#63746C' : '#9BA8A0' }}>
                            {t}
                            {i < s.sub.length - 1 ? " ·" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                    {comp && expandedCompletedSession === s.id && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: '8px' }}>
                          {s.sub.map((t, i) => (
                            <span key={i} style={{ fontSize: "11px", color: "#9BA8A0" }}>
                              {t}
                              {i < s.sub.length - 1 ? " ·" : ""}
                            </span>
                          ))}
                        </div>
                        <Btn onClick={(e) => { e.stopPropagation(); setActiveS(s.id); }} variant="ghost" style={{ ...uniformCtaStyle, borderColor: accent, color: accent }}>
                          Review Session
                        </Btn>
                      </div>
                    )}
                    {msg && <p style={{ fontSize: "11px", color: lockedReadable ? '#5D6D65' : '#9BA8A0', marginTop: "6px", fontStyle: "italic", fontWeight: lockedReadable ? 600 : 400 }}>{msg}</p>}
                  </div>
                </div>
                {/* Session button */}
                {!comp && open && !isPastDay && (
                  <Btn onClick={(e) => { e.stopPropagation(); setActiveS(s.id); }} style={{ ...uniformCtaStyle, marginTop: "12px" }}>
                    Begin {s.id === "morning" ? "Morning" : s.id === "midday" ? "Midday" : "Night"} →
                  </Btn>
                )}
              </Card>
            </div>
          );
        })}
        </div>
      </div>

      {activeS && (
        <SessionModal
          type={activeS}
          program={program}
          day={viewingDay}
          isPractice={false}
          onClose={() => setActiveS(null)}
          onComplete={(t) => {
            const reviewMode = isPastDay || Boolean(viewedCompletions[activeS]);
            if (!reviewMode) {
              onSessionComplete(t, {
                lateStartNight: t === 'night' && canLateStartNight,
              });
            }
            setActiveS(null);
          }}
          activePaidProgram={activePaidProgram}
          onReflectionSave={onReflectionSave}
          initialReflection={getSessionReviewData(activeS)}
          reviewMode={isPastDay || Boolean(viewedCompletions[activeS])}
          devMode={effectiveDevMode}
        />
      )}
    </div>
  );
};

export default HomeTab;
