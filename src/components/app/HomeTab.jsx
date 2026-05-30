import React, { useState, useEffect, useRef } from 'react';
import { Btn, Card, Tag, Toast, LockIcon, CheckIcon } from '@/components/ui';
import { SessionModal } from '@/components/session';
import { PROGRAMS } from '@/data/programs';
import { NOTIF_MSGS } from '@/data/sessions';
import { timeGreeting, todayQuote, parseT, toMin, fmtAMPM, nowMin, isDevMode, toggleDevMode, isAdminUser } from '@/utils/helpers';

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
    <div style={{ paddingBottom: "32px" }}>
      {toast && <Toast msg={toast} onDismiss={() => setToast(null)} />}

      {/* Quote banner */}
      <div style={{ background: prog?.bg || "#E8F0EB", padding: "36px 22px 24px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: prog?.color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
            Today's Insight
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontSize: "18px", lineHeight: 1.65, color: "#2C3530" }}>
            "{todayQuote(program)}"
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 22px 0" }}>
        {/* Greeting + streak */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, color: "#2C3530" }}>
              {userName ? `Hi, ${userName}` : timeGreeting()}.
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px", flexWrap: "wrap" }}>
              {/* Day navigation */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => setViewingDay(v => Math.max(1, v - 1))}
                  disabled={viewingDay <= 1}
                  style={{
                    width: 24, height: 24, borderRadius: "50%", border: "none",
                    background: viewingDay > 1 ? (prog?.color || "#7A9E87") : "#E0E0E0",
                    color: "#fff", fontSize: "14px", fontWeight: 700,
                    cursor: viewingDay > 1 ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, lineHeight: 1, flexShrink: 0,
                  }}
                  aria-label="Previous day"
                >‹</button>
                <Tag label={`Day ${viewingDay} of ${programDuration}`} color={isPastDay ? "#9BA8A0" : (prog?.color || "#7A9E87")} />
                <button
                  onClick={() => setViewingDay(v => Math.min(day, v + 1))}
                  disabled={viewingDay >= day}
                  style={{
                    width: 24, height: 24, borderRadius: "50%", border: "none",
                    background: viewingDay < day ? (prog?.color || "#7A9E87") : "#E0E0E0",
                    color: "#fff", fontSize: "14px", fontWeight: 700,
                    cursor: viewingDay < day ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, lineHeight: 1, flexShrink: 0,
                  }}
                  aria-label="Next day"
                >›</button>
              </div>
              <span style={{ fontSize: "13px", color: "#9BA8A0" }}>{sessCount}/3 sessions{isPastDay ? "" : " today"}</span>
              {isPastDay && (
                <span style={{ fontSize: "11px", color: "#B5956A", fontStyle: "italic", fontWeight: 500 }}>reviewing past day</span>
              )}
              {isAdmin && (
              <button
                onClick={handleToggleDev}
                title="Toggle dev mode"
                style={{
                  marginLeft: "4px",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  border: `1px solid ${devMode ? "#E8941A" : "#D0D0D0"}`,
                  background: devMode ? "#FFF3E0" : "transparent",
                  color: devMode ? "#E8941A" : "#C0C0C0",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >🛠 DEV</button>
              )}
            </div>
          </div>
          {streak > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fff",
                borderRadius: "14px",
                padding: "8px 12px",
                boxShadow: "0 1px 4px rgba(44,53,48,0.06)",
              }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>🔥</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#B5956A", marginTop: "3px" }}>{streak}d</span>
              <span style={{ fontSize: "9px", color: "#9BA8A0", fontWeight: 500 }}>streak</span>
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

        {/* Session track */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "18px" }}>
          {sessions.map((s) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: viewedCompletions[s.id] ? "#7A9E87" : (!isPastDay && isTimeOk(s.id)) ? "rgba(122,158,135,0.35)" : "#C4D8CB",
                transition: "background .4s",
              }}
            />
          ))}
        </div>

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
                border: comp ? "1.5px solid #7A9E87" : "1.5px solid transparent",
                transition: "all 0.2s"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "14px",
                      flexShrink: 0,
                      background: comp ? "#7A9E87" : locked ? "#F0EFE9" : prog?.bg || "#E8F0EB",
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
                      <p style={{ fontWeight: 600, fontSize: "14px", color: comp ? "#7A9E87" : "#2C3530" }}>{s.label}</p>
                      {comp && <Tag label="Completed" color="#7A9E87" />}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                      {s.sub.map((t, i) => (
                        <span key={i} style={{ fontSize: "11px", color: "#9BA8A0" }}>
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
                  <Btn onClick={(e) => { e.stopPropagation(); setActiveS(s.id); }} variant="ghost" style={{ width: "100%", marginTop: "12px", padding: "10px", borderColor: "#7A9E87", color: "#7A9E87" }}>
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
