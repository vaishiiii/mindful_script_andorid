import React, { useState, useEffect, useRef } from 'react';
import { Btn, Card, Tag, Toast, LockIcon, CheckIcon } from '@/components/ui';
import { SessionModal } from '@/components/session';
import { PROGRAMS } from '@/data/programs';
import { NOTIF_MSGS } from '@/data/sessions';
import { timeGreeting, todayQuote, parseT, toMin, fmtAMPM, nowMin, isDevMode, toggleDevMode, isAdminUser } from '@/utils/helpers';

const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string') return `rgba(122, 114, 184, ${alpha})`;
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => `${c}${c}`).join('')
    : cleaned;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const HomeTab = ({ program, unlocks, day, completions, onSessionComplete, streak, onDayChange, activePaidProgram, programDuration = 3, onReflectionSave, user, allDayCompletions = [], onCelebrationContinue }) => {
  const [nowM, setNowM] = useState(nowMin());
  const [activeS, setActiveS] = useState(null);
  const [shakeS, setShakeS] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewingDay, setViewingDay] = useState(day);
  const [devMode, setDevMode] = useState(() => isDevMode());
  const prevNowM = useRef(nowMin());

  // Sync viewingDay to current day when the user advances to a new day
  useEffect(() => {
    setViewingDay(day);
  }, [day]);

  const isAdmin = isAdminUser(user?.email);

  const handleToggleDev = () => {
    if (!isAdmin) return;
    toggleDevMode(user?.email);
    setDevMode(isDevMode());
  };
  
  // Get user's first name or email prefix
  const getUserName = () => {
    if (!user) return '';
    
    if (user.displayName) {
      // Get first name from display name
      return user.displayName.split(' ')[0];
    }
    
    if (user.email) {
      // Get email prefix before @
      return user.email.split('@')[0];
    }
    
    return '';
  };
  
  const userName = getUserName();

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
          setTimeout(() => setToast(null), 5000);
        }
      });
    }, 15000);
    return () => clearInterval(id);
  }, [unlocks, completions]);

  const prog = PROGRAMS.find((p) => p.id === program);
  const accent = prog?.color || '#8B7CC8';
  const accentSoft = prog?.bg || '#E9E2FB';

  const completionCount = [completions.morning, completions.midday, completions.night].filter(Boolean).length;
  const moodStates = [
    { label: 'Reflective', emoji: '😶', tone: '#7B75A7', x: 28, y: 73 },
    { label: 'Calm', emoji: '😌', tone: '#6E8DBE', x: 67, y: 82 },
    { label: 'Steady', emoji: '🙂', tone: '#759A88', x: 80, y: 60 },
    { label: 'Curious', emoji: '🤔', tone: '#9D83B9', x: 77, y: 37 },
    { label: 'Light', emoji: '😊', tone: '#A88763', x: 56, y: 18 },
  ];
  const defaultMoodIndex = Math.min(completionCount, moodStates.length - 1);
  const [selectedMood, setSelectedMood] = useState(defaultMoodIndex);
  const mood = moodStates[selectedMood] || moodStates[0];

  useEffect(() => {
    setSelectedMood(defaultMoodIndex);
  }, [defaultMoodIndex, day]);

  const isTimeOk = (s) => {
    if (devMode) return true;
    const { h, m } = parseT(unlocks[s]);
    return nowM >= toMin(h, m);
  };

  const canOpen = {
    morning: !completions.morning && isTimeOk("morning"),
    midday: !completions.midday && (devMode ? true : (isTimeOk("midday") && completions.morning)),
    night: !completions.night && (devMode ? true : (isTimeOk("night") && completions.midday)),
  };

  const lockMsg = (s) => {
    if (completions[s]) return null;
    if (s === "midday" && !completions.morning) return "Complete morning session first";
    if (s === "night" && !completions.midday) return "Complete midday session first";
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

  // For past days use stored completions; for current day use live completions prop
  const viewedCompletions = isPastDay
    ? (allDayCompletions[viewingDay - 1] || {})
    : completions;

  const sessCount = [viewedCompletions.morning, viewedCompletions.midday, viewedCompletions.night].filter(Boolean).length;

  const sessions = [
    { id: "morning", icon: "🌅", label: "Morning Session", sub: ["Breathwork", "Morning activation task"] },
    { id: "midday", icon: "🌤", label: "Midday Session", sub: ["Breath reset", "Real-world action task", "Timed challenge"] },
    { id: "night", icon: "🌙", label: "Night Session", sub: ["Calming breathwork", "Nightly reflection"] },
  ];

  return (
    <div
      style={{
        paddingBottom: '32px',
        minHeight: '100%',
        background: `
          radial-gradient(circle at 8% -12%, ${hexToRgba(accent, 0.22)} 0%, rgba(255,255,255,0) 46%),
          radial-gradient(circle at 95% 12%, rgba(183, 169, 233, 0.28) 0%, rgba(255,255,255,0) 42%),
          linear-gradient(180deg, #F6F2FF 0%, #F7F5FB 38%, #F9F8FC 100%)
        `,
      }}
    >
      {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 14px 0' }}>
        <div
          style={{
            background: 'linear-gradient(155deg, rgba(255,255,255,0.94) 0%, rgba(247,243,255,0.92) 100%)',
            border: `1px solid ${hexToRgba(accent, 0.22)}`,
            borderRadius: '26px',
            boxShadow: '0 16px 44px rgba(88, 78, 140, 0.13)',
            backdropFilter: 'blur(6px)',
            padding: '14px 14px 12px',
          }}
        >
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#8D81B7', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Today's Insight
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '18px', lineHeight: 1.45, color: '#2E2A3D' }}>
            "{todayQuote(program)}"
          </p>

          <div style={{ height: 1, background: 'rgba(142, 131, 187, 0.18)', margin: '12px 0 10px' }} />

          <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '41px', fontWeight: 500, color: '#2F2A40', lineHeight: 1.02 }}>
                {userName ? `Hi, ${userName} ${mood.emoji}` : `${timeGreeting()} ${mood.emoji}`}
              </h2>
              <p style={{ fontSize: '14px', color: '#706A86', lineHeight: 1.45, marginTop: '6px' }}>
                Your purpose goal is about meaningful daily choices.
              </p>
            </div>

            <div
              style={{
                width: 136,
                borderRadius: 24,
                background: `radial-gradient(circle at 28% 18%, rgba(255,255,255,0.95), ${hexToRgba(accent, 0.14)})`,
                border: `1px solid ${hexToRgba(accent, 0.25)}`,
                position: 'relative',
                padding: '8px 6px 8px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#8A84A6', fontWeight: 600 }}>Mood</span>
                <p style={{ fontSize: '11px', color: mood.tone, fontWeight: 700, marginTop: '2px', lineHeight: 1.1 }}>{mood.label}</p>
              </div>

              <div
                style={{
                  height: 112,
                  marginTop: '4px',
                  borderRadius: '60px / 54px',
                  background: `radial-gradient(circle at 26% 22%, rgba(255,255,255,0.95), ${hexToRgba(accent, 0.12)})`,
                  border: `1px solid ${hexToRgba(accent, 0.22)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '14px 18px',
                    borderRadius: '50%',
                    border: `1px dashed ${hexToRgba(accent, 0.25)}`,
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    left: `${mood.x}%`,
                    top: `${mood.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 39,
                    height: 39,
                    borderRadius: '50%',
                    border: `2px solid ${mood.tone}`,
                    background: '#fff',
                    boxShadow: `0 6px 16px ${hexToRgba(accent, 0.24)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'left .32s cubic-bezier(0.22, 1, 0.36, 1), top .32s cubic-bezier(0.22, 1, 0.36, 1), border-color .2s ease',
                    zIndex: 3,
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{mood.emoji}</span>
                </div>

                {moodStates.map((m, idx) => (
                  <button
                    key={m.label}
                    onClick={() => setSelectedMood(idx)}
                    aria-label={`Set mood ${m.label}`}
                    style={{
                      position: 'absolute',
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 23,
                      height: 23,
                      borderRadius: '50%',
                      border: idx === selectedMood ? `1px solid ${hexToRgba(m.tone, 0.65)}` : '1px solid transparent',
                      background: idx === selectedMood ? hexToRgba(m.tone, 0.2) : 'rgba(255,255,255,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all .2s ease',
                      zIndex: 2,
                      padding: 0,
                    }}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>{m.emoji}</span>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '10px', color: '#8F89A8', marginTop: '5px' }}>tap a mood</p>
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              borderRadius: '14px',
              background: 'rgba(250, 248, 255, 0.92)',
              border: `1px solid ${hexToRgba(accent, 0.16)}`,
              padding: '8px 10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <button
                  onClick={() => setViewingDay(v => Math.max(1, v - 1))}
                  disabled={viewingDay <= 1}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: viewingDay > 1 ? hexToRgba(accent, 0.28) : 'rgba(182, 177, 201, 0.4)',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: viewingDay > 1 ? 'pointer' : 'default',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Previous day"
                >
                  ‹
                </button>
                <Tag label={`Day ${viewingDay}/${programDuration}`} color={isPastDay ? '#9B97AE' : accent} />
                <button
                  onClick={() => setViewingDay(v => Math.min(day, v + 1))}
                  disabled={viewingDay >= day}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: viewingDay < day ? hexToRgba(accent, 0.28) : 'rgba(182, 177, 201, 0.4)',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: viewingDay < day ? 'pointer' : 'default',
                    lineHeight: 1,
                    padding: 0,
                  }}
                  aria-label="Next day"
                >
                  ›
                </button>
              </div>
              <span style={{ fontSize: '13px', color: '#7D768F', fontWeight: 500 }}>{sessCount}/3 sessions{isPastDay ? '' : ' today'}</span>
            </div>

            <div style={{ display: 'flex', gap: '5px' }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 999,
                    background: viewedCompletions[s.id] ? '#6E65A6' : (!isPastDay && isTimeOk(s.id)) ? 'rgba(141, 129, 187, 0.36)' : '#D8D3E7',
                    transition: 'background .4s',
                  }}
                />
              ))}
            </div>

            {isPastDay && (
              <span style={{ display: 'inline-block', marginTop: '7px', fontSize: '11px', color: '#A18461', fontStyle: 'italic', fontWeight: 500 }}>
                reviewing past day
              </span>
            )}

            {isAdmin && (
              <button
                onClick={handleToggleDev}
                title="Toggle dev mode"
                style={{
                  marginTop: '8px',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  border: `1px solid ${devMode ? '#E8941A' : '#D0D0D0'}`,
                  background: devMode ? '#FFF3E0' : 'transparent',
                  color: devMode ? '#E8941A' : '#C0C0C0',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                🛠 DEV
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '12px 14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px' }}>
          {streak > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.88)',
                borderRadius: '14px',
                border: `1px solid ${hexToRgba(accent, 0.18)}`,
                padding: '8px 12px',
                boxShadow: '0 6px 18px rgba(103, 88, 158, 0.12)',
              }}
            >
              <span style={{ fontSize: '20px', lineHeight: 1 }}>🔥</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#A98057', marginTop: '3px' }}>{streak}d</span>
              <span style={{ fontSize: '9px', color: '#8F89A8', fontWeight: 500 }}>streak</span>
            </div>
          )}
        </div>

        {/* Dev mode banner */}
        {devMode && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#FFF3E0", borderRadius: "10px", border: "1px solid #FFB74D", marginBottom: "14px" }}>
            <span style={{ fontSize: "14px" }}>🛠</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#E8941A" }}>Dev Mode — time locks off, timers skippable</span>
          </div>
        )}

        {/* Day complete banner — shown when all sessions are done but user hasn't continued past celebration yet */}
        {!isPastDay && completions.morning && completions.midday && completions.night && onCelebrationContinue && (
          <Card style={{ marginTop: '4px', marginBottom: '10px', background: '#E8F0EB', border: '1.5px solid #7A9E87' }}>
            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <p style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</p>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#2C3530', marginBottom: '4px' }}>Day {day} Complete!</p>
              <p style={{ fontSize: '13px', color: '#5E6B64', marginBottom: '14px' }}>
                {day < programDuration ? 'All sessions done. Ready for the next day?' : 'You finished the full program!'}
              </p>
              <Btn onClick={onCelebrationContinue} style={{ width: '100%' }}>
                {day < programDuration ? `Continue to Day ${day + 1} →` : 'View Your Report →'}
              </Btn>
            </div>
          </Card>
        )}

        {/* Session cards */}
        {sessions.map((s) => {
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

          return (
            <div
              key={s.id}
              className={isShaking ? "shake" : ""}
              style={{ marginBottom: "10px" }}
              onClick={() => {
                if (isPastDay) {
                  if (comp) setActiveS(s.id);
                  // missed past sessions: do nothing
                } else {
                  if (locked) handleLockedTap(s.id);
                  else if (comp || open) setActiveS(s.id);
                }
              }}
            >
              <Card style={{
                opacity: locked ? 0.6 : 1,
                cursor: (comp || (!isPastDay && open)) ? "pointer" : "default",
                border: comp ? `1.5px solid ${hexToRgba(accent, 0.56)}` : `1.5px solid ${hexToRgba(accent, 0.16)}`,
                background: `linear-gradient(135deg, rgba(255,255,255,0.96) 0%, ${hexToRgba(accentSoft, 0.46)} 100%)`,
                boxShadow: '0 8px 22px rgba(99, 89, 147, 0.10)',
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "14px",
                      flexShrink: 0,
                      background: comp ? accent : locked ? 'rgba(206, 200, 228, 0.68)' : hexToRgba(accent, 0.14),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background .3s",
                    }}
                  >
                    {comp ? <CheckIcon /> : (locked && !isPastDay) ? <LockIcon /> : <span style={{ fontSize: "18px" }}>{s.icon}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 600, fontSize: "14px", color: comp ? accent : '#2C3530' }}>{s.label}</p>
                      {comp && <Tag label="Completed" color={accent} />}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {s.sub.map((t, i) => (
                        <span key={i} style={{ fontSize: "11px", color: '#88829D' }}>
                          {t}
                          {i < s.sub.length - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                    {msg && <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "6px", fontStyle: "italic" }}>{msg}</p>}
                  </div>
                </div>
                {/* Session button */}
                {!comp && open && !isPastDay && (
                  <Btn onClick={(e) => { e.stopPropagation(); setActiveS(s.id); }} style={{ width: "100%", marginTop: "12px", padding: "12px" }}>
                    Begin {s.id === "morning" ? "Morning" : s.id === "midday" ? "Midday" : "Night"} →
                  </Btn>
                )}
                {comp && (
                  <Btn onClick={(e) => { e.stopPropagation(); setActiveS(s.id); }} variant="ghost" style={{ width: "100%", marginTop: "12px", padding: "10px", borderColor: accent, color: accent }}>
                    Review Session
                  </Btn>
                )}
              </Card>
            </div>
          );
        })}
      </div>

      {activeS && (
        <SessionModal
          type={activeS}
          program={program}
          day={viewingDay}
          isPractice={false}
          onClose={() => setActiveS(null)}
          onComplete={(t) => {
            if (!isPastDay) {
              onSessionComplete(t);
            }
            setActiveS(null);
          }}
          activePaidProgram={activePaidProgram}
          onReflectionSave={onReflectionSave}
          devMode={devMode}
        />
      )}
    </div>
  );
};

export default HomeTab;
