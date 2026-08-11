import React, { useState, useEffect } from 'react';
import { Btn, CheckIcon } from '@/components/ui';
import { SESSION_TASKS } from '@/data/sessions';
import { REFLECTION_QS, NIGHT_REFLECTION_QUESTIONS } from '@/data/questions';
import { PROG_COLORS } from '@/styles/designSystem';
import BreathEngine from './BreathEngine';
import ActionTimer from './ActionTimer';
import { scheduleReminderForTomorrow, showTestNotification, scheduleMultipleReminders } from '@/utils/notifications';

const SessionModal = ({ type, program, day = 1, isPractice = false, onClose, onComplete, activePaidProgram, onReflectionSave, devMode = false }) => {
  const [step, setStep] = useState("breath");
  const [rIdx, setRIdx] = useState(0);
  const [rAns, setRAns] = useState({});
  const [journalText, setJournalText] = useState(""); // free-form journal text
  const [timerDone, setTimerDone] = useState(false);
  const [timerInsight, setTimerInsight] = useState(""); // capture thoughts right after a timed task
  const [reflectionText, setReflectionText] = useState("");
  const [showReflectionInput, setShowReflectionInput] = useState(false);
  const [useTimer, setUseTimer] = useState(null); // null = not chosen, true = using timer, false = skip timer
  const [customTimerSeconds, setCustomTimerSeconds] = useState(300); // default 5 minutes
  
  // State for interactive task inputs
  const [taskInputs, setTaskInputs] = useState({}); // { stepIndex: value }
  const [setReminder, setSetReminder] = useState(false);
  const [scheduledReminders, setScheduledReminders] = useState({}); // { morning: bool, midday: bool, night: bool }

  // Push a history entry so Android back button closes this modal instead of exiting the app
  useEffect(() => {
    window.history.pushState({ sessionModal: true }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
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

  c = PROG_COLORS[program] || "var(--ms-accent)";
  const programLabel = activePaidProgram ? activePaidProgram.title : '';
  
  const SESSION_LABEL = { 
    morning: isPractice ? `🌅 Practice — Day ${day} Morning` : (activePaidProgram ? `🌅 Day ${day} Morning` : "🌅 Morning Session"), 
    midday: isPractice ? `🌤 Practice — Day ${day} Midday` : (activePaidProgram ? `🌤 Day ${day} Midday` : "🌤 Midday Session"), 
    night: isPractice ? `🌙 Practice — Day ${day} Night` : (activePaidProgram ? `🌙 Day ${day} Night` : "🌙 Night Session") 
  };
  const STEPS = type === "night" && !isPractice && !activePaidProgram ? ["breath", "task", "reflect", "done"] : ["breath", "task", "journal", "done"];
  
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
      if (onReflectionSave) {
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

  const handleJournal = async () => {
    // Schedule reminder if checkbox was checked
    if (setReminder) {
      const programName = activePaidProgram ? activePaidProgram.title : program;
      const scheduled = await scheduleReminderForTomorrow(type, programName);
      if (scheduled) {
        // Show confirmation notification
        await showTestNotification();
      }
    }
    
    // Save journaling text along with previously saved task inputs
    if (onReflectionSave) {
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
      }
      if (setReminder) {
        reflectionData.setReminder = setReminder;
        reflectionData.reminderScheduled = true;
      }
      // Include journal entry if present
      if (journalText.trim()) {
        reflectionData.journalEntry = journalText;
      }
      
      // Only save if there's any data
      if (reflectionData.journalEntry || reflectionData.taskInputs || reflectionData.setReminder) {
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
    // Schedule reminder if checkbox was checked
    if (setReminder) {
      const programName = activePaidProgram ? activePaidProgram.title : program;
      const scheduled = await scheduleReminderForTomorrow(type, programName);
      if (scheduled) {
        // Show confirmation notification
        await showTestNotification();
      }
    }
    
    // Save task inputs, timer insight and reminder if any data was entered
    if (onReflectionSave && (Object.keys(taskInputs).length > 0 || setReminder || timerInsight.trim())) {
      onReflectionSave({
        taskInputs,
        setReminder,
        reminderScheduled: setReminder,
        ...(timerInsight.trim() ? { timerInsight: timerInsight.trim() } : {}),
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,53,48,0.58)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="slide-up"
        style={{
          background: "#F7F6F2",
          borderRadius: "28px 28px 0 0",
          width: "100%",
          maxWidth: 480,
          maxHeight: "94vh",
          overflowY: "auto",
          padding: "24px 22px 44px",
        }}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
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
                          background: STEPS.indexOf(step) > i ? c : STEPS.indexOf(step) === i ? c : "var(--ms-accent-border)",
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
                    {i < STEPS.filter((s) => s !== "done").length - 1 && <div style={{ width: 16, height: 1, background: "var(--ms-accent-border)" }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9BA8A0", lineHeight: 1, padding: "2px 8px" }}>
            ×
          </button>
        </div>

        {/* BREATH STEP */}
        {step === "breath" && <BreathEngine program={program} sessionType={type} onComplete={() => setStep("task")} devMode={devMode} />}

        {/* TASK STEP */}
        {step === "task" && task && (
          <div className="slide-up">
            <div style={{ padding: "16px 18px", borderRadius: "20px", background: `${c}12`, border: `1.5px solid ${c}28`, marginBottom: "18px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: c, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Today's Task</p>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "21px", fontWeight: 500, color: "#2C3530" }}>{task.title}</p>
            </div>
            {task.desc && (
              <div style={{ padding: "12px 14px", background: "#FFFAF4", borderRadius: "12px", marginBottom: "18px" }}>
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
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "var(--ms-accent-soft)",
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
                              background: "var(--ms-accent-soft)",
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
                        <textarea
                          value={taskInputs[i] || ''}
                          onChange={(e) => setTaskInputs(prev => ({ ...prev, [i]: e.target.value }))}
                          placeholder={placeholder || "Write your answer here..."}
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            border: "1.5px solid var(--ms-accent-border)",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            fontSize: "14px",
                            color: "#2C3530",
                            background: "#fff",
                            resize: "vertical",
                            marginLeft: "34px",
                          }}
                        />
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
                              background: "var(--ms-accent-soft)",
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
                                border: `1.5px solid ${taskInputs[i] === option ? c : 'var(--ms-accent-border)'}`,
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
                          <input
                            type="text"
                            value={taskInputs[`${i}_note`] || ''}
                            onChange={(e) => setTaskInputs(prev => ({ ...prev, [`${i}_note`]: e.target.value }))}
                            placeholder={note}
                            style={{
                              width: "100%",
                              marginTop: "8px",
                              marginLeft: "34px",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              border: "1.5px solid #E8E8E8",
                              fontFamily: "'DM Sans', system-ui, sans-serif",
                              fontSize: "13px",
                              color: "#5E6B64",
                              fontStyle: "italic",
                            }}
                          />
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

            {/* Set Reminder Checkbox */}
            <div style={{ 
              marginBottom: "18px", 
              padding: "14px 16px", 
              background: setReminder ? "#F0F8FF" : "#F9FAF9", 
              borderRadius: "14px", 
              border: setReminder ? `1.5px solid ${c}` : "1.5px solid #E1E8E4",
              transition: "all 0.2s ease"
            }}>
              <label style={{ display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={setReminder}
                  onChange={(e) => setSetReminder(e.target.checked)}
                  style={{
                    width: 20,
                    height: 20,
                    marginTop: "2px",
                    cursor: "pointer",
                    accentColor: c,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#2C3530", marginBottom: "4px" }}>
                    🔔 Set reminder for tomorrow
                  </div>
                  {setReminder && (
                    <div style={{ fontSize: "12px", color: "#5A8FBF", lineHeight: 1.5 }}>
                      {type === 'morning' && '✓ You\'ll get a notification tomorrow at 8:00 AM'}
                      {type === 'midday' && '✓ You\'ll get a notification tomorrow at 1:00 PM'}
                      {type === 'night' && '✓ You\'ll get a notification tomorrow at 8:00 PM'}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Notebook nudge — only when a timed task is coming and timer hasn't started yet */}
            {task.timer && !timerDone && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", background: "#FFFAF4", borderRadius: "14px", border: "1.5px solid #F5E5C8", marginBottom: "14px" }}>
                <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0, marginTop: "1px" }}>📓</span>
                <p style={{ fontSize: "13px", color: "#8C6B3E", lineHeight: 1.6 }}>
                  <strong>Grab a notebook.</strong> This task works best with pen and paper — jot your thoughts in real time while the timer runs.
                </p>
              </div>
            )}

            {/* Predefined timer or user-chosen timer */}
            {task.timer && !timerDone && (
              <div style={{ marginBottom: "18px" }}>
                <ActionTimer seconds={task.timer} onComplete={() => setTimerDone(true)} devMode={devMode} accentColor={c} />
              </div>
            )}
            {!task.timer && useTimer === null && !timerDone && (
              <div style={{ marginBottom: "18px" }}>
                <div style={{ padding: "16px 18px", background: "#F0F8FF", borderRadius: "16px", border: "1.5px solid #B8D4E8", marginBottom: "12px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#5A8FBF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                    ⏱️ Optional Timer
                  </p>
                  <p style={{ fontSize: "13px", color: "#3A5A7A", lineHeight: 1.6 }}>
                    Want to set a focus timer for this task? It helps maintain mindful presence.
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
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
                      }}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--ms-accent-border)",
                        background: "#fff",
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "13px",
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
                        e.target.style.borderColor = "var(--ms-accent-border)";
                        e.target.style.background = "#fff";
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setUseTimer(false)}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "14px",
                    border: "none",
                    background: "transparent",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#9BA8A0",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  No timer, continue without timing
                </button>
              </div>
            )}
            {!task.timer && useTimer === true && !timerDone && (
              <div style={{ marginBottom: "18px" }}>
                <ActionTimer seconds={customTimerSeconds} onComplete={() => setTimerDone(true)} devMode={devMode} accentColor={c} />
              </div>
            )}
            {/* Post-timer insight capture — appears only when a timer actually ran */}
            {((task.timer && timerDone) || (!task.timer && useTimer === true && timerDone)) && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>✍️</span>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530" }}>What came up for you?</p>
                  <span style={{ fontSize: "11px", color: "#9BA8A0", marginLeft: "auto" }}>optional</span>
                </div>
                <textarea
                  value={timerInsight}
                  onChange={(e) => setTimerInsight(e.target.value)}
                  placeholder="Capture a thought, realization, or feeling from the exercise..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "14px",
                    border: "1.5px solid var(--ms-accent-border)",
                    background: "#fff",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: "13px",
                    color: "#2C3530",
                    lineHeight: 1.6,
                    resize: "none",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = c; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--ms-accent-border)"; }}
                />
                {timerInsight.trim() && (
                  <p style={{ fontSize: "11px", color: c, marginTop: "6px" }}>✓ This will be saved to your insights &amp; report</p>
                )}
              </div>
            )}

            {((task.timer && timerDone) || (!task.timer && useTimer === false) || (!task.timer && useTimer === true && timerDone)) && (
              <Btn onClick={handleTaskContinue} style={{ width: "100%" }}>
                Continue to Journal →
              </Btn>
            )}
          </div>
        )}
        {step === "task" && !task && (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ color: "#9BA8A0" }}>Task data not available</p>
            <Btn onClick={handleJournalContinue} style={{ width: "100%", marginTop: "16px" }}>
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
                border: "1.5px solid var(--ms-accent-border)",
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
                e.target.style.borderColor = "var(--ms-accent-border)";
              }}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <Btn
                onClick={handleJournal}
                variant="ghost"
                style={{ flex: 1 }}
              >
                Skip →
              </Btn>
              <Btn
                onClick={handleJournal}
                style={{ flex: 2 }}
              >
                Continue →
              </Btn>
            </div>
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
                      background: rAns[currentQ.key] === opt ? "var(--ms-accent-soft)" : "#fff",
                      color: "#2C3530",
                      border: `1.5px solid ${rAns[currentQ.key] === opt ? c : "var(--ms-accent-border)"}`,
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
                        border: `2px solid ${rAns[currentQ.key] === opt ? c : "var(--ms-accent-border)"}`,
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
              {type === "night" ? "Day Complete." : "Session Complete."}
            </h3>
            <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65, marginBottom: "20px" }}>
              {type === "night" ? "Reflection recorded. Rest well — you've earned it." : "Well done. Your next session will unlock on schedule."}
            </p>

            {/* Quick Reminder Buttons */}
            <div style={{ marginBottom: "26px", padding: "18px", background: "#fff", borderRadius: "20px", border: "1.5px solid var(--ms-accent-soft)" }}>
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
                      border: `1.5px solid ${scheduledReminders[r.id] ? c : "var(--ms-accent-soft)"}`,
                      background: scheduledReminders[r.id] ? "#F0F7F3" : "#F9FAF9",
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

            <Btn
              onClick={() => {
                onComplete(type);
                onClose();
              }}
              style={{ width: "100%" }}
            >
              {type === "night" ? "Complete Day ✓" : "Done"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionModal;
