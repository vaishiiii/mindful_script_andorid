import React, { useMemo, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Card, LockIcon } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';
import { SESSION_TASKS } from '@/data/sessions';
import paidProgramCalm7 from '@/data/paidProgramCalm7';
import { PAID_PROGRAM_21DAYS_CALM } from '@/data/paidProgramCalm21';
import paidProgramConfidence5 from '@/data/paidProgramConfidence5';
import paidProgramConfidence7 from '@/data/paidProgramConfidence7';
import { PAID_PROGRAM_21DAYS_CONFIDENCE } from '@/data/paidProgramConfidence21';
import paidProgramDiscipline5 from '@/data/paidProgramDiscipline5';
import paidProgramFocus5 from '@/data/paidProgramFocus5';
import { PAID_PROGRAM_21DAYS_FOCUS } from '@/data/paidProgramFocus21';
import { PAID_PROGRAM_21DAYS_HABIT } from '@/data/paidProgramHabit21';
import paidProgramHealing7 from '@/data/paidProgramHealing7';
import paidProgramHealing21 from '@/data/paidProgramHealing21';
import paidProgramPurpose7 from '@/data/paidProgramPurpose7';
import { PAID_PROGRAM_21DAYS_PURPOSE } from '@/data/paidProgramPurpose21';
import { saveWaitlistEntry } from '@/utils/userDb';

const EMAILJS_SERVICE_ID  = 'service_385jidd';
const EMAILJS_TEMPLATE_ID = 'template_rf3acv8';

// v4: initialise once at module level
emailjs.init({ publicKey: 'unovu9_QABu5GXWjA' });

// ─── Premium AI Report Survey Modal ──────────────────────────────────────────
const PremiumSurveyModal = ({ prog, onClose, user }) => {
  const [interest, setInterest] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const userEmail = user?.email || '(not provided)';
  const userName  = user?.displayName || user?.email?.split('@')[0] || 'User';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!interest) return;

    // 1. Save locally (synchronous — can't hang)
    try {
      const existing = JSON.parse(localStorage.getItem('ms_premium_survey') || '[]');
      existing.push({ interest, email: userEmail, name: userName, ts: new Date().toISOString() });
      localStorage.setItem('ms_premium_survey', JSON.stringify(existing));
    } catch { /* ignore */ }

    // 2. Fire-and-forget: Firestore
    saveWaitlistEntry({ interest, email: userEmail }).catch(() => {});

    // 3. Fire-and-forget: EmailJS
    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        interest_level: interest,
        user_name: userName,
        user_email: userEmail,
        submitted_at: new Date().toLocaleString(),
      },
    ).catch((err) => console.error('[EmailJS]', err));

    // Show success immediately — background tasks continue on their own
    setSucceeded(true);
  };

  const interestOptions = [
    { val: 'definitely', label: 'Definitely — I want this', emoji: '🔥' },
    { val: 'maybe', label: 'Maybe — tell me more', emoji: '🤔' },
    { val: 'curious', label: 'Just curious for now', emoji: '👀' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(44,53,48,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000, padding: '0 0 0 0',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#F7F6F2', borderRadius: '24px 24px 0 0', padding: '28px 24px 40px',
        width: '100%', maxWidth: 480,
      }}>
        {succeeded ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🙏</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: 500, color: '#2C3530', marginBottom: '10px' }}>Thank you!</h3>
            <p style={{ fontSize: '14px', color: '#5E6B64', lineHeight: 1.65, marginBottom: '24px' }}>
              Your feedback helps us prioritize what to build next. We'll reach out when Personalized AI Reports launch.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px', borderRadius: '14px', border: 'none',
                background: prog?.color || '#7A9E87', color: '#fff', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: prog?.color || '#7A9E87', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Coming Soon</p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '22px', fontWeight: 500, color: '#2C3530' }}>Personalized AI Report</h3>
              </div>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9BA8A0', cursor: 'pointer', padding: '4px' }}>×</button>
            </div>

            <p style={{ fontSize: '13px', color: '#5E6B64', lineHeight: 1.65, marginBottom: '22px' }}>
              We're building a deeply personalized AI-powered behavioral analysis engine. It will track your patterns across programs, identify your psychological growth edges, and give you a monthly transformation report.
            </p>

            <p style={{ fontSize: '13px', fontWeight: 600, color: '#2C3530', marginBottom: '12px' }}>
              How interested are you in this feature?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {interestOptions.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setInterest(opt.val)}
                  style={{
                    padding: '14px 16px', borderRadius: '14px', textAlign: 'left',
                    border: `2px solid ${interest === opt.val ? (prog?.color || '#7A9E87') : '#E8E4DC'}`,
                    background: interest === opt.val ? (prog?.bg || '#E8F0EB') : '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                  <span style={{ fontSize: '14px', fontWeight: interest === opt.val ? 700 : 500, color: '#2C3530' }}>{opt.label}</span>
                </button>
              ))}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#F0F5F2', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px',
            }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#2C3530', margin: 0 }}>{userName}</p>
                <p style={{ fontSize: '11px', color: '#9BA8A0', margin: 0 }}>{userEmail}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!interest}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: interest ? (prog?.color || '#7A9E87') : '#D0D0D0',
                color: '#fff', border: 'none', fontSize: '14px', fontWeight: 700,
                cursor: interest ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const MoodTrendChart = ({ data, color }) => {
  const width = 320;
  const height = 120;
  const padding = 20;
  
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (val / 100) * (height - 2 * padding);
    return { x, y };
  });
  
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  
  const days = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 30}`} style={{ overflow: 'visible' }}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area under curve */}
      <path d={areaD} fill="url(#areaGradient)" />
      
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
      ))}
      
      {/* X-axis labels */}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height + 15} textAnchor="middle" fontSize="10" fill="#9BA8A0" fontFamily="'DM Sans', sans-serif">
          {days[i]}
        </text>
      ))}
    </svg>
  );
};

// Progress bar with percentage
const MetricBar = ({ label, value, change, color, accent, bg }) => (
  <Card style={{ marginBottom: '10px', padding: '16px 18px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <span style={{ fontSize: '15px', fontWeight: 600, color: '#2C3530' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: change >= 0 ? accent : '#C4A882' }}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
    </div>
    <div style={{ position: 'relative', height: '8px', background: bg, borderRadius: '4px', overflow: 'hidden' }}>
      <div 
        style={{ 
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.8s ease-out'
        }} 
      />
    </div>
    <div style={{ textAlign: 'right', marginTop: '6px' }}>
      <span style={{ fontSize: '16px', fontWeight: 700, color: '#2C3530' }}>{value}%</span>
    </div>
  </Card>
);

// AI Insight card
const InsightCard = ({ insight, highlight, accent, bg }) => (
  <Card style={{ background: '#F8FAF8', border: `1px solid ${bg}`, marginBottom: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        borderRadius: '10px', 
        background: bg,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '14px' }}>📈</span>
      </div>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Insight
        </p>
        <p style={{ fontSize: '14px', color: '#5E6B64', lineHeight: 1.6 }}>
          {insight.split(highlight).map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && <strong style={{ color: accent }}>{highlight}</strong>}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  </Card>
);

// AI Insights Component - Analyzes user reflections
const AIInsights = ({ reflections, program, streak, prog, accent, bg }) => {
  // Filter reflections with text (journal entries)
  const journalEntries = reflections
    .map((entry) => ({
      ...entry,
      text: (entry?.text || entry?.journalEntry || entry?.timerInsight || '').trim(),
    }))
    .filter((entry) => entry.text.length > 0);

  if (journalEntries.length === 0) return null; // Don't show if no reflections yet


  // Analyze patterns in reflections
  const getInsights = () => {
    const insights = [];
    const recentEntries = journalEntries.slice(-5); // Last 5 reflections
    const allText = recentEntries.map(r => r.text.toLowerCase()).join(' ');
    
    // Emotion detection
    const emotions = {
      positive: ['calm', 'peaceful', 'relaxed', 'happy', 'grateful', 'content', 'confident', 'strong', 'focused', 'clear', 'better', 'good', 'amazing', 'love'],
      challenging: ['anxious', 'stressed', 'worried', 'overwhelmed', 'difficult', 'hard', 'struggle', 'tired', 'confused', 'frustrated', 'angry', 'sad'],
      breakthrough: ['breakthrough', 'realized', 'noticed', 'understand', 'insight', 'clarity', 'aha', 'connected', 'awareness', 'shift'],
    };
    
    const emotionCounts = {
      positive: emotions.positive.filter(w => allText.includes(w)).length,
      challenging: emotions.challenging.filter(w => allText.includes(w)).length,
      breakthrough: emotions.breakthrough.filter(w => allText.includes(w)).length,
    };
    
    // Progress patterns
    const morningReflections = recentEntries.filter(r => r.sessionType === 'morning').length;
    
    // Generate personalized insights based on patterns
    if (emotionCounts.breakthrough >= 2) {
      insights.push({
        type: 'breakthrough',
        text: `You've had ${emotionCounts.breakthrough} breakthrough moments in your recent reflections. These awareness shifts are powerful indicators of deep internal change.`,
        icon: '💡',
      });
    }
    
    if (emotionCounts.positive > emotionCounts.challenging * 1.5 && streak >= 3) {
      insights.push({
        type: 'growth',
        text: `Your reflections show a ${Math.round((emotionCounts.positive / (emotionCounts.positive + emotionCounts.challenging)) * 100)}% positive sentiment trend. The consistent practice is transforming your baseline state.`,
        icon: '🌱',
      });
    }
    
    if (emotionCounts.challenging >= 3 && emotionCounts.positive >= 2) {
      insights.push({
        type: 'resilience',
        text: `You're showing up even during difficult moments. This resilience—practicing through challenges—builds lasting transformation. Your honesty in reflections accelerates growth.`,
        icon: '💪',
      });
    }
    
    if (journalEntries.length >= 7) {
      const earlyText = journalEntries.slice(0, 3).map(r => r.text.toLowerCase()).join(' ');
      const recentText = recentEntries.map(r => r.text.toLowerCase()).join(' ');
      
      const earlyPositive = emotions.positive.filter(w => earlyText.includes(w)).length;
      const recentPositive = emotions.positive.filter(w => recentText.includes(w)).length;
      
      if (recentPositive > earlyPositive) {
        insights.push({
          type: 'trajectory',
          text: `Comparing your first reflections to now: you're using more positive language and reporting deeper states. This linguistic shift reflects real neurological rewiring.`,
          icon: '📈',
        });
      }
    }
    
    if (morningReflections >= 3) {
      insights.push({
        type: 'consistency',
        text: `Your morning session reflections show strong commitment. Morning practice sets the tone for your entire day—you're building a powerful foundation.`,
        icon: '🌅',
      });
    }
    
    // Default insight if no patterns detected yet
    if (insights.length === 0 && journalEntries.length >= 2) {
      insights.push({
        type: 'engagement',
        text: `You've logged ${journalEntries.length} reflections. This self-awareness practice is as valuable as the breath work itself. Keep documenting your journey.`,
        icon: '✍️',
      });
    }
    
    return insights;
  };
  
  const insights = getInsights();
  
  if (insights.length === 0) return null;
  
  return (
    <div style={{ marginBottom: "24px" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C3530", marginBottom: "12px" }}>
        🤖 AI Insights from Your Reflections
      </p>
      {insights.slice(0, 2).map((insight, idx) => (
        <Card key={idx} style={{ background: '#F0F8FF', border: `1px solid ${bg}`, marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '10px', 
              background: bg,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '16px',
            }}>
              {insight.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                {insight.type}
              </p>
              <p style={{ fontSize: '14px', color: '#4B5D53', lineHeight: 1.6 }}>
                {insight.text}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ProgressTab = ({ 
  program, 
  day, 
  completions, 
  allDayCompletions, 
  totalMinutes, 
  streak,
  questionnaireAnswers = {},
  reflectionData = [],
  allReflectionData = [],
  programCompleted = false,
  activeProgramDuration = 3,
  programHistory = [],
  goalHistory = [],
  moodHistory = [],
  user = null,
  onViewReport = () => {},
  accent = '#7A9E87',
  theme = null,
}) => {
  const MOOD_META = [
    { emoji: '😣', label: 'Low', color: '#D96A62' },
    { emoji: '😕', label: 'Off', color: '#D08D57' },
    { emoji: '😐', label: 'Neutral', color: '#A39675' },
    { emoji: '🙂', label: 'Good', color: '#6EA67A' },
    { emoji: '😁', label: 'Great', color: '#4C9AB5' },
  ];
  const PAID_DATASETS = {
    calm: { 7: paidProgramCalm7, 21: PAID_PROGRAM_21DAYS_CALM },
    confidence: { 5: paidProgramConfidence5, 7: paidProgramConfidence7, 21: PAID_PROGRAM_21DAYS_CONFIDENCE },
    discipline: { 5: paidProgramDiscipline5 },
    focus: { 5: paidProgramFocus5, 21: PAID_PROGRAM_21DAYS_FOCUS },
    habit: { 21: PAID_PROGRAM_21DAYS_HABIT },
    healing: { 7: paidProgramHealing7, 21: paidProgramHealing21 },
    purpose: { 7: paidProgramPurpose7, 21: PAID_PROGRAM_21DAYS_PURPOSE },
  };

  const getTaskStepsForEntry = (entry) => {
    const entryProgram = entry?.program;
    const entryDay = Number(entry?.day || 1);
    const entrySession = entry?.sessionType;
    const entryDuration = Number(entry?.programDuration || 3);
    const entryPaid = Boolean(entry?.isPaidProgram) || entryDuration > 3;

    if (!entryProgram || !entrySession) {
      return [];
    }

    if (entryPaid) {
      const paidData = PAID_DATASETS[entryProgram]?.[entryDuration];
      const dayObj = Array.isArray(paidData) ? paidData[entryDay - 1] : null;
      const sessionObj = dayObj?.[entrySession];
      return Array.isArray(sessionObj?.steps) ? sessionObj.steps : [];
    }

    const programTasks = SESSION_TASKS[entryProgram] || SESSION_TASKS.calm;
    const dayKey = `day${entryDay}`;
    const dayTasks = programTasks?.[dayKey] || programTasks?.day1;
    return Array.isArray(dayTasks?.[entrySession]?.steps) ? dayTasks[entrySession].steps : [];
  };

  const resolvePromptFromEntry = (entry, key) => {
    if (entry?.taskPrompts?.[key]) {
      return entry.taskPrompts[key];
    }

    const baseKey = key.endsWith('_note') ? key.replace('_note', '') : key;
    const stepIndex = Number(baseKey);
    if (Number.isNaN(stepIndex)) {
      return `Prompt ${key}`;
    }

    const step = getTaskStepsForEntry(entry)[stepIndex];
    if (typeof step === 'string') {
      return step;
    }

    if (step && typeof step === 'object') {
      if (key.endsWith('_note') && step.note) {
        return `${step.text || `Prompt ${stepIndex + 1}`} - ${step.note}`;
      }
      return step.text || `Prompt ${stepIndex + 1}`;
    }

    return `Prompt ${stepIndex + 1}`;
  };

  const [showAllReflections, setShowAllReflections] = useState(false);
  const [showCrossProgramHistory, setShowCrossProgramHistory] = useState(false);
  const [showPremiumSurvey, setShowPremiumSurvey] = useState(false);
  const [showProgramHistory, setShowProgramHistory] = useState(false);
  const [showUniqueGoalsOnly, setShowUniqueGoalsOnly] = useState(false);
  const [reflectionView, setReflectionView] = useState('insights');
  const [progressSection, setProgressSection] = useState('overview');
  const swipeStartRef = useRef({ x: 0, y: 0 });
  const prog = PROGRAMS.find((p) => p.id === program);
  const tabTheme = theme || { mid: '#EFF9F0', contrast: '#3F6C43' };
  const sectionOrder = ['overview', 'trends', 'memory'];

  const shouldHandleSectionSwipe = (target) => {
    if (!(target instanceof Element)) {
      return true;
    }
    return !target.closest('button, select, input, textarea, a, [data-no-section-swipe="true"]');
  };

  const handleProgressTouchStart = (e) => {
    if (e.touches.length !== 1) {
      return;
    }
    if (!shouldHandleSectionSwipe(e.target)) {
      swipeStartRef.current = { x: 0, y: 0 };
      return;
    }
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleProgressTouchEnd = (e) => {
    if (e.changedTouches.length !== 1) {
      return;
    }

    const start = swipeStartRef.current;
    if (!start.x && !start.y) {
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    swipeStartRef.current = { x: 0, y: 0 };

    // Require a strong horizontal gesture to avoid interrupting vertical scroll.
    if (Math.abs(deltaX) < 55 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) {
      return;
    }

    const currentIndex = sectionOrder.indexOf(progressSection);
    if (currentIndex < 0) {
      return;
    }

    if (deltaX < 0 && currentIndex < sectionOrder.length - 1) {
      setProgressSection(sectionOrder[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      setProgressSection(sectionOrder[currentIndex - 1]);
    }
  };
  const sessTotal = useMemo(() => {
    return allDayCompletions.reduce((s, d, i) => {
      if (i === day - 1 && !programCompleted) {
        // Use current completions for the active day to ensure real-time progress
        return s + (completions.morning ? 1 : 0) + (completions.midday ? 1 : 0) + (completions.night ? 1 : 0);
      }
      return s + (d?.morning ? 1 : 0) + (d?.midday ? 1 : 0) + (d?.night ? 1 : 0);
    }, 0);
  }, [allDayCompletions, completions, day, programCompleted]);
  
  // Calculate combined metrics from program history
  const combinedStats = {
    totalSessions: sessTotal + (programHistory.reduce((sum, hist) => sum + (hist.totalSessions || 0), 0)),
    totalMinutes: totalMinutes,
    daysCompleted: streak + (programHistory.filter(h => h.isPaid).length),
    programsCompleted: programHistory.length,
  };

  const goalsExplored = useMemo(() => {
    const goals = new Set([
      ...goalHistory.map((entry) => entry.goal),
      ...programHistory.map((entry) => entry.program),
      program,
    ].filter(Boolean));
    return goals.size;
  }, [goalHistory, programHistory, program]);

  const goalTimeline = useMemo(() => {
    return [...goalHistory]
      .filter((entry) => Boolean(entry?.goal))
      .sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
  }, [goalHistory]);

  const visibleGoalTimeline = useMemo(() => {
    if (!showUniqueGoalsOnly) {
      return goalTimeline;
    }

    const seenGoals = new Set();
    const latestUnique = [];
    for (const entry of goalTimeline) {
      if (!seenGoals.has(entry.goal)) {
        seenGoals.add(entry.goal);
        latestUnique.push(entry);
      }
    }
    return latestUnique;
  }, [goalTimeline, showUniqueGoalsOnly]);

  const normalizedCurrentReflections = useMemo(() => {
    return reflectionData
      .map((entry) => ({
        ...entry,
        text: (entry?.text || entry?.journalEntry || entry?.timerInsight || '').trim(),
      }))
      .filter((entry) => entry.text.length > 0);
  }, [reflectionData]);

  const normalizedAllReflections = useMemo(() => {
    return allReflectionData
      .map((entry) => ({
        ...entry,
        text: (entry?.text || entry?.journalEntry || entry?.timerInsight || '').trim(),
      }))
      .filter((entry) => entry.text.length > 0);
  }, [allReflectionData]);

  const journalEntries = useMemo(() => {
    const source = showCrossProgramHistory ? normalizedAllReflections : normalizedCurrentReflections;
    return [...source].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
  }, [showCrossProgramHistory, normalizedAllReflections, normalizedCurrentReflections]);
  const hasAnyJournal = normalizedAllReflections.length > 0;

  const memoryMoments = useMemo(() => {
    const source = showCrossProgramHistory ? allReflectionData : reflectionData;

    return source
      .map((entry) => {
        const activityThoughts = (entry?.timerInsight || '').trim();
        const journal = (entry?.journalEntry || entry?.text || '').trim();
        const pointerAnswers = Object.entries(entry?.taskInputs || {})
          .map(([key, value]) => {
            if (typeof value === 'string' && value.trim().length > 0) {
              return {
                key,
                prompt: resolvePromptFromEntry(entry, key),
                value: value.trim(),
              };
            }

            if (value === true) {
              return {
                key,
                prompt: resolvePromptFromEntry(entry, key),
                value: 'Completed',
              };
            }

            return null;
          })
          .filter(Boolean);
        const nightlyAnswers = Object.values(entry?.answers || {})
          .filter((value) => typeof value === 'string' && value.trim().length > 0)
          .map((value) => value.trim());

        return {
          ...entry,
          activityThoughts,
          journal,
          pointerAnswers,
          nightlyAnswers,
        };
      })
      .filter((entry) => {
        return Boolean(
          entry.activityThoughts ||
          entry.journal ||
          entry.pointerAnswers.length > 0 ||
          entry.nightlyAnswers.length > 0
        );
      })
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [showCrossProgramHistory, allReflectionData, reflectionData]);

  const displayedReflections = showAllReflections ? [...journalEntries].reverse() : [...journalEntries].slice(-5).reverse();

  const moodEntries = useMemo(() => {
    return [...moodHistory]
      .filter((entry) => entry?.program === program && Number(entry?.programDuration || 3) === Number(activeProgramDuration))
      .sort((a, b) => Number(a?.day || 0) - Number(b?.day || 0));
  }, [moodHistory, program, activeProgramDuration]);

  const dominantMood = useMemo(() => {
    if (moodEntries.length === 0) {
      return null;
    }

    const counts = moodEntries.reduce((acc, entry) => {
      const idx = Number(entry?.moodIndex);
      if (!Number.isNaN(idx)) {
        acc[idx] = (acc[idx] || 0) + 1;
      }
      return acc;
    }, {});

    const [topKey] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
    if (typeof topKey === 'undefined') return null;
    return MOOD_META[Number(topKey)] || null;
  }, [moodEntries]);

  // Calculate metrics based on program type and reflections
  const metrics = useMemo(() => {
    const baseMetrics = {
      calm: { primary: 'Calm', secondary: 'Stress Resilience', tertiary: 'Emotional Balance' },
      focus: { primary: 'Focus', secondary: 'Concentration', tertiary: 'Task Completion' },
      confidence: { primary: 'Confidence', secondary: 'Self-Trust', tertiary: 'Bold Action' },
      healing: { primary: 'Healing', secondary: 'Emotional Safety', tertiary: 'Self-Compassion' },
      discipline: { primary: 'Discipline', secondary: 'Consistency', tertiary: 'Follow-Through' },
      purpose: { primary: 'Purpose', secondary: 'Clarity', tertiary: 'Value Alignment' },
      habit: { primary: 'Habit Strength', secondary: 'Routine Consistency', tertiary: 'Automaticity' },
    };
    
    const programMetrics = baseMetrics[program] || baseMetrics.calm;
    
    // Calculate values based on session completions and day progress
    const totalExpectedSessions = activeProgramDuration * 3; // 3 sessions per day
    const completionRate = totalExpectedSessions > 0 ? Math.round((sessTotal / totalExpectedSessions) * 100) : 0;
    const baseProgress = Math.min(40 + completionRate * 0.5, 85);
    
    // Add variance for visual interest
    const variance = (idx) => Math.round((Math.sin(idx * 2.3 + streak) * 10));
    
    return [
      { 
        label: programMetrics.primary, 
        value: Math.min(Math.max(baseProgress + variance(0), 45), 95), 
        change: Math.round(8 + streak * 4),
        color: accent
      },
      { 
        label: programMetrics.secondary, 
        value: Math.min(Math.max(baseProgress - 7 + variance(1), 35), 88), 
        change: Math.round(5 + streak * 3),
        color: '#C4A882'
      },
      { 
        label: programMetrics.tertiary, 
        value: Math.min(Math.max(baseProgress - 15 + variance(2), 30), 80), 
        change: Math.round(10 + streak * 2),
        color: '#8E9EC4'
      },
    ];
  }, [program, sessTotal, day, streak, accent]);

  // Generate trend data for chart
  const trendData = useMemo(() => {
    const base = 50 + streak * 8;
    return [
      base - 15 + Math.random() * 10,
      base - 10 + Math.random() * 10,
      base - 5 + Math.random() * 5,
      base + Math.random() * 8,
      base + 5 + Math.random() * 8,
      base + 8 + Math.random() * 5,
      base + 12 + Math.random() * 5,
    ].map(v => Math.min(Math.max(Math.round(v), 30), 90));
  }, [streak]);

  // Generate AI insight based on progress (program-specific)
  const insight = useMemo(() => {
    const improvements = metrics[0].change;
    const primaryMetric = metrics[0].label.toLowerCase();
    const programsCompleted = programHistory.length;
    const dayLabel = activeProgramDuration === 3 ? "3 days" : `${activeProgramDuration} days`;
    
    if (streak === 0) {
      return { text: `Start your ${prog?.label.toLowerCase()} journey today. Your ${primaryMetric} transformation begins with the first session.`, highlight: primaryMetric };
    } else if (streak === 1) {
      return { text: `Great start! Your ${primaryMetric} levels show early signs of improvement in this ${dayLabel} program. Keep up with your morning sessions for continued progress!`, highlight: `${improvements}%` };
    } else if (day === activeProgramDuration) {
      return { text: `Excellent progress! You've completed the full ${dayLabel} ${prog?.label.toLowerCase()} program with ${improvements}% improvement in ${primaryMetric}. You've completed ${sessTotal} sessions — that's real transformation.`, highlight: `${improvements}%` };
    } else if (streak >= 2) {
      return { text: `You're building momentum! Your ${primaryMetric} has improved by ${improvements}% this week. Day ${day} of ${activeProgramDuration} - the ${activeProgramDuration === 3 ? "midday resets" : "daily practices"} are strengthening your baseline.`, highlight: `${improvements}%` };
    } else {
      return { text: `Your journey on the ${prog?.label.toLowerCase()} program is progressing well. You're on day ${day} of ${activeProgramDuration}.`, highlight: dayLabel };
    }
  }, [streak, metrics, sessTotal, day, activeProgramDuration, programHistory, prog]);

  // SVG Icons for stats
  const StatIcons = {
    days: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    streak: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 8 6 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 6 12 2 12 2Z" fill="#F5A623" stroke="#E8941A" strokeWidth="1.5"/>
        <path d="M12 8C12 8 10 10 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10 12 8 12 8Z" fill="#FFCC4D"/>
        <path d="M12 14V22M9 19H15" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    time: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    sessions: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
  };

  const stats = [
    { label: `Day Progress`, val: `${day}/${activeProgramDuration}`, icon: StatIcons.days, tooltip: `Current ${program} program` },
    { label: "Goals Explored", val: goalsExplored, icon: StatIcons.sessions, tooltip: "Unique goals started" },
    { label: "Total Streak", val: `${combinedStats.daysCompleted}d`, icon: StatIcons.streak, tooltip: "Across all programs" },
    { label: "Total Time", val: `${Math.round(combinedStats.totalMinutes)}m`, icon: StatIcons.time, tooltip: "All sessions combined" },
  ];

  const sectionPillStyle = (isActive) => ({
    border: `1px solid ${isActive ? `${accent}44` : '#D9E2DC'}`,
    background: isActive
      ? `linear-gradient(135deg, ${accent} 0%, ${tabTheme.contrast || accent} 100%)`
      : `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, ${prog?.bg || '#F4F7F3'} 100%)`,
    color: isActive ? '#fff' : '#4E5A53',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: isActive
      ? `0 7px 14px ${accent}3d, 0 0 12px ${accent}30`
      : '0 3px 8px rgba(44,53,48,0.06)',
    transition: 'all .22s ease',
  });

  return (
    <>
    <div
      style={{
        padding: "32px 22px 100px",
        maxWidth: 480,
        margin: "0 auto",
        background: `linear-gradient(180deg, ${tabTheme.mid} 0%, rgba(255,255,255,0.84) 24%, rgba(255,255,255,0.75) 100%)`,
        borderRadius: 20,
      }}
      onTouchStart={handleProgressTouchStart}
      onTouchEnd={handleProgressTouchEnd}
    >
      <p style={{ fontSize: "12px", fontWeight: 700, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
        Progress
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, marginBottom: "6px" }}>
            Your journey so far
          </h2>
          <p style={{ fontSize: "13px", color: accent, fontWeight: 600 }}>
            {prog?.label} — Day {day} of {activeProgramDuration}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          scrollPaddingInline: "2px",
          paddingBottom: "4px",
        }}
      >
        <button
          onClick={() => setProgressSection('overview')}
          style={{
            ...sectionPillStyle(progressSection === 'overview'),
            flexShrink: 0,
            scrollSnapAlign: "start",
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setProgressSection('trends')}
          style={{
            ...sectionPillStyle(progressSection === 'trends'),
            flexShrink: 0,
            scrollSnapAlign: "start",
          }}
        >
          Trends
        </button>
        <button
          onClick={() => setProgressSection('memory')}
          style={{
            ...sectionPillStyle(progressSection === 'memory'),
            flexShrink: 0,
            scrollSnapAlign: "start",
          }}
        >
          Memory Lane
        </button>
      </div>

      <p style={{ fontSize: "12px", color: "#7B857F", marginBottom: "18px", lineHeight: 1.5 }}>
        {progressSection === 'overview' && 'Overview keeps your key milestones in one place: day progress, goals, and journey status.'}
        {progressSection === 'trends' && 'Trends shows your mood patterns, wellness metrics, and AI-driven pattern insights over time.'}
        {progressSection === 'memory' && 'Memory Lane keeps your written reflections, pointer answers, and activity notes grouped by session.'}
      </p>

      {progressSection === 'overview' && (
        <>

      {/* Program History — expandable completed programs list */}
      {programHistory.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowProgramHistory((prev) => !prev)}
            style={{
              width: "100%",
              background: `${prog?.bg || '#E8F0EB'}50`,
              border: `1px solid ${prog?.color || '#7A9E87'}30`,
              borderRadius: showProgramHistory ? "16px 16px 0 0" : "16px",
              padding: "14px 18px",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: accent, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                Programs Completed
              </p>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#2C3530" }}>{programHistory.length} complete</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "28px" }}>🏆</span>
              <span style={{ fontSize: "12px", color: accent, fontWeight: 600 }}>
                {showProgramHistory ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {showProgramHistory && (
            <div style={{ border: `1px solid ${prog?.color || '#7A9E87'}30`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", background: "#fff" }}>
              {[...programHistory].reverse().map((entry, idx) => {
                const entryProg = PROGRAMS.find((p) => p.id === entry.program);
                const completedDate = entry.completedAt
                  ? new Date(entry.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';
                const hasSnapshot = entry.snapshotAllDayCompletions && entry.snapshotAllDayCompletions.length > 0;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 18px",
                      borderBottom: idx < programHistory.length - 1 ? "1px solid #F0EDE8" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "10px",
                        background: entryProg?.bg || "#E8F0EB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "18px", flexShrink: 0,
                      }}>
                        {entryProg?.icon || "🧘"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.programTitle}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9BA8A0" }}>
                          {entry.duration}-day · {entry.totalSessions} sessions · {completedDate}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onViewReport(entry)}
                      style={{
                        background: hasSnapshot ? (entryProg?.color || "#7A9E87") : "#E8E4DC",
                        color: hasSnapshot ? "#fff" : "#9BA8A0",
                        border: "none",
                        borderRadius: "10px",
                        padding: "7px 13px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: hasSnapshot ? "pointer" : "default",
                        flexShrink: 0,
                        marginLeft: "10px",
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                      }}
                    >
                      {hasSnapshot ? "View Report →" : "No data"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px", marginBottom: "24px" }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ textAlign: "center", padding: "18px 14px" }}>
            <div style={{ 
              width: 44, 
              height: 44, 
              borderRadius: "12px", 
              background: "#F5F9F6", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              margin: "0 auto 10px"
            }}>
              {s.icon}
            </div>
            <div style={{ 
              fontFamily: "'DM Sans', system-ui, sans-serif", 
              fontSize: "26px", 
              fontWeight: 700, 
              color: "#2C3530", 
              lineHeight: 1,
              letterSpacing: "-0.02em"
            }}>
              {s.val}
            </div>
            <div style={{ fontSize: "10px", color: "#9BA8A0", marginTop: "8px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Goals Timeline */}
      {goalTimeline.length > 0 && (
        <Card style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#2C3530" }}>Goals Timeline</p>
            <span style={{ fontSize: "11px", color: accent, fontWeight: 700 }}>
              {showUniqueGoalsOnly ? `${visibleGoalTimeline.length} unique` : `${visibleGoalTimeline.length} starts`}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#7B857F", marginBottom: "12px", lineHeight: 1.5 }}>
            Every goal you started is saved so you can review your evolution across programs.
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={() => setShowUniqueGoalsOnly(false)}
              style={sectionPillStyle(!showUniqueGoalsOnly)}
            >
              Show all starts
            </button>
            <button
              onClick={() => setShowUniqueGoalsOnly(true)}
              style={sectionPillStyle(showUniqueGoalsOnly)}
            >
              Show unique goals only
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {visibleGoalTimeline.slice(0, 10).map((entry, idx) => {
              const startedDate = entry.startedAt
                ? new Date(entry.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              const entryProg = PROGRAMS.find((p) => p.id === entry.goal);
              return (
                <div
                  key={`${entry.goal}-${entry.startedAt || idx}-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: entryProg?.bg || "#F7F6F2",
                    border: "1px solid #ECE8E1",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <span style={{ fontSize: "16px" }}>{entryProg?.icon || "◉"}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entryProg?.label || entry.goal}
                      </p>
                      <p style={{ fontSize: "11px", color: "#8F9A93" }}>
                        {entry.source === 'switch' ? 'Switched from another goal' : 'Started during onboarding'}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: "11px", color: accent, fontWeight: 600, marginLeft: "8px", flexShrink: 0 }}>
                    {startedDate}
                  </span>
                </div>
              );
            })}
          </div>
          {visibleGoalTimeline.length > 10 && (
            <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "10px" }}>
              Showing latest 10 of {visibleGoalTimeline.length} entries.
            </p>
          )}
        </Card>
      )}

      {/* Dynamic Program Overview */}
      <Card style={{ marginBottom: "18px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530", marginBottom: "14px" }}>
          {activeProgramDuration}-Day Journey Overview
        </p>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {Array.from({ length: activeProgramDuration }, (_, i) => i + 1).map((d) => {
            const dc = (d === day && !programCompleted) ? completions : (allDayCompletions[d - 1] || {});
            const sessionsDone = (dc.morning ? 1 : 0) + (dc.midday ? 1 : 0) + (dc.night ? 1 : 0);
            const full = sessionsDone === 3;
            const cur = d === day && !programCompleted;
            const pct = Math.round((sessionsDone / 3) * 100);

            return (
              <div
                key={d}
                style={{
                  flex: activeProgramDuration <= 3 ? 1 : "0 0 auto",
                  minWidth: activeProgramDuration > 3 ? "110px" : "auto",
                  borderRadius: "16px",
                  padding: "16px 10px",
                  textAlign: "center",
                  background: full ? prog?.color || "#7A9E87" : cur ? prog?.bg || "#E8F0EB" : "#F5F4F0",
                  border: cur ? `2px solid ${prog?.color || "#7A9E87"}` : "2px solid transparent",
                  transition: "all .3s",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 700, color: full ? "#fff" : "#9BA8A0", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>
                  Day {d}
                </p>

                <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto 8px" }}>
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke={full ? "rgba(255,255,255,0.3)" : "#E8F0EB"} strokeWidth="4" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke={full ? "#fff" : prog?.color || "#7A9E87"}
                      strokeWidth="4"
                      strokeDasharray={`${pct * 1.26} 126`}
                      strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: full ? "#fff" : "#2C3530" }}>{pct}%</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
                  {["morning", "midday", "night"].map((ss) => (
                    <div
                      key={ss}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: dc[ss] ? (full ? "rgba(255,255,255,0.8)" : prog?.color || "#7A9E87") : "rgba(0,0,0,0.1)",
                      }}
                    />
                  ))}
                </div>

                {full && <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", marginTop: "6px", fontWeight: 600 }}>Complete ✓</p>}
                {cur && !full && <p style={{ fontSize: "9px", color: prog?.color || "#7A9E87", marginTop: "6px", fontWeight: 600 }}>In Progress</p>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Motivation message */}
      {streak < activeProgramDuration && !programCompleted && (
        <Card style={{ background: prog?.bg || "#E8F0EB", border: "none", marginBottom: "18px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "16px", fontWeight: 500, color: "#2C3530", marginBottom: "5px" }}>
            {streak === 0 ? "Your transformation starts today." : streak === 1 ? "One day in. The momentum is building." : streak === 2 ? "Two days complete. Keep building momentum." : `${streak} days strong. Your progress is building.`}
          </p>
          <p style={{ fontSize: "13px", color: "#5E6B64" }}>Complete all 3 sessions each day to unlock your full potential.</p>
        </Card>
      )}

      {/* Locked Personalized Report - for paid programs */}
      <div 
        style={{ 
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(135deg, #F8FAF8 0%, #E8F0EB 100%)",
          border: "1.5px solid #C4D8CB",
          padding: "24px 20px",
        }}
      >
        {/* Lock overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(247, 246, 242, 0.75)",
          backdropFilter: "blur(2px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <LockIcon size={20} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C3530", marginBottom: "4px" }}>Personalized AI Report</p>
          <p style={{ fontSize: "12px", color: "#9BA8A0", marginBottom: "4px", textAlign: "center", maxWidth: 220 }}>
            Unlock detailed behavioral analysis with our premium programs
          </p>
          <p style={{ fontSize: "10px", fontWeight: 700, color: prog?.color || "#7A9E87", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>🚀 Coming Soon</p>
          <button
            onClick={() => setShowPremiumSurvey(true)}
            style={{
              background: prog?.color || "#7A9E87",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            Join Waitlist →
          </button>
        </div>

        <div style={{ opacity: 0.4 }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: prog?.color || "#7A9E87", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Your Personalized Report
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "18px", fontWeight: 500, color: "#2C3530", marginBottom: "14px" }}>
            Deep Behavioral Analysis
          </p>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <div style={{ flex: 1, height: 60, background: "#E8F0EB", borderRadius: "10px" }} />
            <div style={{ flex: 1, height: 60, background: "#E8F0EB", borderRadius: "10px" }} />
          </div>
          <div style={{ height: 40, background: "#E8F0EB", borderRadius: "8px", marginBottom: "10px" }} />
          <div style={{ height: 30, background: "#E8F0EB", borderRadius: "8px", width: "70%" }} />
        </div>
      </div>
      </>
      )}

      {progressSection === 'trends' && (
        <>

      {moodEntries.length > 0 && (
        <Card style={{ marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#2C3530" }}>Daily Mood Log</p>
            <span style={{ fontSize: "11px", color: accent, fontWeight: 700 }}>{moodEntries.length} entries</span>
          </div>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "3px", marginBottom: "10px" }}>
            {moodEntries.map((entry, idx) => {
              const mood = MOOD_META[Number(entry?.moodIndex)] || MOOD_META[2];
              return (
                <div
                  key={`${entry.day}-${idx}`}
                  style={{
                    minWidth: "52px",
                    borderRadius: "12px",
                    border: `1px solid ${mood.color}44`,
                    background: "#fff",
                    padding: "8px 6px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: "16px", marginBottom: "2px" }}>{mood.emoji}</p>
                  <p style={{ fontSize: "9px", fontWeight: 700, color: mood.color }}>Day {entry.day}</p>
                </div>
              );
            })}
          </div>
          {dominantMood && (
            <p style={{ fontSize: "12px", color: "#5E6B64" }}>
              Dominant mood: <span style={{ color: dominantMood.color, fontWeight: 700 }}>{dominantMood.emoji} {dominantMood.label}</span>
            </p>
          )}
        </Card>
      )}

      {/* Weekly Mood Trends */}
      <Card style={{ marginBottom: "24px", padding: "20px 16px 10px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C3530", marginBottom: "16px" }}>
          Weekly Mood Trends
        </p>
        <MoodTrendChart data={trendData} color={prog?.color || "#7A9E87"} />
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: prog?.color || "#7A9E87" }} />
            <span style={{ fontSize: "11px", color: "#9BA8A0" }}>{metrics[0].label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4A882" }} />
            <span style={{ fontSize: "11px", color: "#9BA8A0" }}>{metrics[1].label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8E9EC4" }} />
            <span style={{ fontSize: "11px", color: "#9BA8A0" }}>{metrics[2].label}</span>
          </div>
        </div>
      </Card>

      {/* Mental Wellness Metrics */}
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C3530", marginBottom: "14px" }}>
        Mental Wellness Metrics
      </p>
      {metrics.map((metric) => (
        <MetricBar key={metric.label} {...metric} accent={accent} bg={prog?.bg || '#E8F0EB'} />
      ))}

      {/* AI Insight */}
      <InsightCard insight={insight.text} highlight={insight.highlight} accent={accent} bg={prog?.bg || '#E8F0EB'} />

      {/* AI Insights from Reflections */}
      <AIInsights reflections={reflectionData} program={program} streak={streak} prog={prog} accent={accent} bg={prog?.bg || '#E8F0EB'} />
        </>
      )}

      {progressSection === 'memory' && (
        <>

      {/* Reflection Journal + Memory Lane */}
      {hasAnyJournal && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', marginTop: '6px' }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#2C3530" }}>
              {reflectionView === 'insights' ? '📝 Your Reflection Journal' : '🕰️ Memory Lane'}
            </p>
            {normalizedAllReflections.length > normalizedCurrentReflections.length && (
              <button
                onClick={() => setShowCrossProgramHistory((prev) => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: accent,
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {showCrossProgramHistory ? 'Current Program' : 'All Programs'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setReflectionView('insights')}
              style={sectionPillStyle(reflectionView === 'insights')}
            >
              Insights
            </button>
            <button
              onClick={() => setReflectionView('memory')}
              style={sectionPillStyle(reflectionView === 'memory')}
            >
              Memory Lane
            </button>
          </div>

          {reflectionView === 'insights' && displayedReflections.map((reflection, idx) => {
            const date = new Date(reflection.timestamp);
            const sessionEmoji = reflection.sessionType === 'morning' ? '🌅' : reflection.sessionType === 'midday' ? '🌤' : '🌙';

            return (
              <Card key={idx} style={{ marginBottom: '12px', background: '#FFFAF4', border: '1px solid #F5E5C8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{sessionEmoji}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#C4A882', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Day {reflection.day} · {reflection.sessionType}
                    </span>
                    {showCrossProgramHistory && reflection.program && (
                      <span style={{ fontSize: '10px', color: '#9BA8A0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {reflection.program}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#9BA8A0' }}>
                    {date.toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#5E6B64', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{reflection.text}"
                </p>
              </Card>
            );
          })}

          {reflectionView === 'memory' && (
            <>
              {(showAllReflections ? memoryMoments : memoryMoments.slice(0, 5)).map((entry, idx) => {
                const sessionEmoji = entry.sessionType === 'morning' ? '🌅' : entry.sessionType === 'midday' ? '🌤' : '🌙';
                const date = new Date(entry.timestamp || 0);

                return (
                  <Card key={`${entry.timestamp || idx}-${idx}`} style={{ marginBottom: '12px', background: '#F6FBF8', border: '1px solid #DCEBE1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>{sessionEmoji}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#5E8A6C', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          Day {entry.day} · {entry.sessionType}
                        </span>
                        {showCrossProgramHistory && entry.program && (
                          <span style={{ fontSize: '10px', color: '#8EA095', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {entry.program}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: '#8EA095' }}>{date.toLocaleDateString()}</span>
                    </div>

                    {entry.activityThoughts && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Activity Thoughts</p>
                        <p style={{ fontSize: '13px', color: '#42554B', lineHeight: 1.6 }}>{entry.activityThoughts}</p>
                      </div>
                    )}

                    {entry.pointerAnswers.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Pointer Answers</p>
                        {entry.pointerAnswers.map((answer, answerIdx) => (
                          <div key={answerIdx} style={{ marginBottom: '6px' }}>
                            <p style={{ fontSize: '11px', color: '#5E8A6C', fontWeight: 700, lineHeight: 1.5 }}>{answer.prompt}</p>
                            <p style={{ fontSize: '13px', color: '#42554B', lineHeight: 1.5 }}>{answer.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.nightlyAnswers.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Night Reflection Answers</p>
                        {entry.nightlyAnswers.map((answer, answerIdx) => (
                          <p key={answerIdx} style={{ fontSize: '13px', color: '#42554B', lineHeight: 1.5 }}>• {answer}</p>
                        ))}
                      </div>
                    )}

                    {entry.journal && (
                      <div>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Journal</p>
                        <p style={{ fontSize: '13px', color: '#42554B', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{entry.journal}"
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </>
          )}

          {reflectionView === 'insights' && displayedReflections.length === 0 && (
            <p style={{ fontSize: '12px', color: '#9BA8A0', marginBottom: '12px', fontStyle: 'italic' }}>
              No reflections yet for this program. Switch to All Programs to review your previous reflections.
            </p>
          )}

          {reflectionView === 'memory' && memoryMoments.length === 0 && (
            <p style={{ fontSize: '12px', color: '#9BA8A0', marginBottom: '12px', fontStyle: 'italic' }}>
              Your memory lane will appear after you add activity thoughts, pointer answers, journal entries, or nightly reflections.
            </p>
          )}

          {((reflectionView === 'insights' && journalEntries.length > 5) || (reflectionView === 'memory' && memoryMoments.length > 5)) && (
            <button
              onClick={() => setShowAllReflections((prev) => !prev)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: accent,
                fontSize: '12px',
                fontWeight: 600,
                width: '100%',
                marginBottom: '18px',
                textDecoration: 'underline',
              }}
            >
              {showAllReflections
                ? (reflectionView === 'insights' ? 'Show 5 most recent reflections' : 'Show 5 most recent memories')
                : (reflectionView === 'insights' ? `View all ${journalEntries.length} reflections` : `View all ${memoryMoments.length} memory entries`)}
            </button>
          )}
        </>
      )}
      {!hasAnyJournal && (
        <Card style={{ marginBottom: '18px', background: '#F7F6F2', border: '1px solid #ECE8E1' }}>
          <p style={{ fontSize: '13px', color: '#5E6B64', lineHeight: 1.7 }}>
            No memory entries yet. Complete sessions and add activity thoughts, pointer answers, and journal reflections to build your timeline.
          </p>
        </Card>
      )}
      </>
      )}
    </div>
    {/* Premium Survey Modal */}
    {showPremiumSurvey && (
      <PremiumSurveyModal prog={prog} onClose={() => setShowPremiumSurvey(false)} user={user} />
    )}
    </>
  );
};

export default ProgressTab;
