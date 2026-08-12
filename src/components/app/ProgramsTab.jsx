import React, { useEffect, useRef, useState } from 'react';
import { Btn, Card, Tag, LockIcon } from '@/components/ui';
import { PROGRAMS, PAID_PROGRAMS } from '@/data/programs';
import Payments from './Payments';
import PaidProgramModal from './PaidProgramModal';
import { default as paidProgramFocus5 } from '@/data/paidProgramFocus5';
import { default as paidProgramConfidence5 } from '@/data/paidProgramConfidence5';
import { default as paidProgramConfidence7 } from '@/data/paidProgramConfidence7';
import { default as paidProgramPurpose7 } from '@/data/paidProgramPurpose7';
import { default as paidProgramDiscipline5 } from '@/data/paidProgramDiscipline5';
import paidProgramHealing7 from '@/data/paidProgramHealing7';
import paidProgramHealing21 from '@/data/paidProgramHealing21';
import paidProgramCalm7 from '@/data/paidProgramCalm7';
import { PAID_PROGRAM_21DAYS_FOCUS } from '@/data/paidProgramFocus21';
import { PAID_PROGRAM_21DAYS_CALM } from '@/data/paidProgramCalm21';
import { PAID_PROGRAM_21DAYS_CONFIDENCE } from '@/data/paidProgramConfidence21';
import { PAID_PROGRAM_21DAYS_PURPOSE } from '@/data/paidProgramPurpose21';
import { PAID_PROGRAM_21DAYS_HABIT } from '@/data/paidProgramHabit21';
import { isTesterReviewUser } from '@/utils/helpers';

const PROGRAM_DATA_MAP = {
  focus: {
    '5 Days': paidProgramFocus5,
    '21 Days': PAID_PROGRAM_21DAYS_FOCUS,
  },
  calm: {
    '7 Days': paidProgramCalm7,
    '21 Days': PAID_PROGRAM_21DAYS_CALM,
  },
  confidence: {
    '5 Days': paidProgramConfidence5,
    '7 Days': paidProgramConfidence7,
    '21 Days': PAID_PROGRAM_21DAYS_CONFIDENCE,
  },
  healing: {
    '7 Days': paidProgramHealing7,
    '21 Days': paidProgramHealing21,
  },
  discipline: {
    '5 Days': paidProgramDiscipline5,
  },
  purpose: {
    '7 Days': paidProgramPurpose7,
    '21 Days': PAID_PROGRAM_21DAYS_PURPOSE,
  },
  habit: {
    '21 Days': PAID_PROGRAM_21DAYS_HABIT,
  },
};

const ProgramsTab = ({
  user,
  program,
  onSelectPaidProgram,
  onViewCompletedProgram,
  onExitActiveProgram,
  onSwitchGoal,
  programHistory = [],
  goalHistory = [],
  activePaidProgram,
  programCompleted,
  currentDay,
  activeProgramDuration,
  focusTarget = null,
  onFocusHandled,
  accent = '#7A9E87',
  theme = null,
}) => {
  const [showPayments, setShowPayments] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(true); // Default to unlocked
  const [activePaidIndex, setActivePaidIndex] = useState(null);
  const [showEnrollmentWarning, setShowEnrollmentWarning] = useState(false);
  const [warningReason, setWarningReason] = useState('trial');
  const [selectedSwitchGoalId, setSelectedSwitchGoalId] = useState('');
  const [showGoalSwitchConfirm, setShowGoalSwitchConfirm] = useState(false);
  const [showLuckyOfferPopup, setShowLuckyOfferPopup] = useState(false);
  const [switchGoalFocused, setSwitchGoalFocused] = useState(false);
  const switchGoalSectionRef = useRef(null);
  
  const prog = PROGRAMS.find((p) => p.id === program);
  const paid = PAID_PROGRAMS[program] || [];
  const activePaidProgramId = activePaidProgram?.programId || null;
  const reviewBypass = isTesterReviewUser(user?.email);

  const completedTrials = programHistory.filter((p) => p.duration === 3 && p.isPaid === false).length;
  const completedPaidPrograms = programHistory.filter((p) => p.isPaid).length;
  const completedPaidForCurrentGoal = programHistory.filter((p) => p.isPaid && p.program === program);
  const completedPaidProgramIds = new Set(
    completedPaidForCurrentGoal.map((entry) => `${entry.program}-${entry.duration} Days`)
  );
  const isCompletedWithinDays = (completedAt, days) => {
    if (!completedAt) return false;
    const completed = new Date(completedAt).getTime();
    if (Number.isNaN(completed)) return false;
    const ageMs = Date.now() - completed;
    return ageMs >= 0 && ageMs <= days * 24 * 60 * 60 * 1000;
  };
  const getCompletedDaysAgo = (completedAt) => {
    if (!completedAt) return null;
    const completed = new Date(completedAt).getTime();
    if (Number.isNaN(completed)) return null;
    const ageMs = Date.now() - completed;
    if (ageMs < 0) return 0;
    return Math.floor(ageMs / (24 * 60 * 60 * 1000));
  };
  const getLatestCompletedEntry = (duration) => {
    const matches = completedPaidForCurrentGoal
      .filter((entry) => Number(entry?.duration || 0) === Number(duration))
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    return matches[0] || null;
  };
  const visiblePaidPrograms = paid
    .map((plan, index) => ({
      ...plan,
      index,
      programId: `${program}-${plan.dur}`,
    }))
    .filter((plan) => plan.programId !== activePaidProgramId);
  const hasCompletedFreeTrial = completedTrials > 0;
  const hasCompletedFreeTrialForAccess = hasCompletedFreeTrial || reviewBypass;
  const completedFreeForCurrentGoal = programHistory.filter((p) => p.duration === 3 && p.isPaid === false && p.program === program).length;
  const completedPaidForCurrentGoalCount = programHistory.filter((p) => p.isPaid && p.program === program).length;
  const canSwitchGoals = reviewBypass || (completedFreeForCurrentGoal >= 1 && completedPaidForCurrentGoalCount >= 1);
  const goalsStarted = new Set([
    ...goalHistory.map((entry) => entry.goal),
    ...programHistory.map((entry) => entry.program),
    program,
  ].filter(Boolean)).size;

  // Check if user is currently enrolled in a program (not completed yet)
  // User is enrolled if:
  // 1. They have an active paid program AND not completed, OR
  // 2. They're in the free trial (no paid program) AND not on last day or not completed
  const isEnrolledInProgram = !programCompleted && !reviewBypass;
  
  // Get enrolled program name for display
  const enrolledProgramName = activePaidProgram 
    ? `${activePaidProgram.program} ${activePaidProgram.duration}-Day Program`
    : `${program} ${activeProgramDuration}-Day Program`;
  const latestCompletedForActive = activePaidProgram
    ? getLatestCompletedEntry(activePaidProgram.duration)
    : null;
  const canExitRecentlyCompletedActive =
    Boolean(activePaidProgram) &&
    !programCompleted &&
    isCompletedWithinDays(latestCompletedForActive?.completedAt, 45);

  // Handler for unlocking paid plans
  const handleUnlockPaid = () => {
    setShowPayments(false);
    setPaidUnlocked(true);
  };

  // Handle paid program selection
  const handleAccessPaidProgram = (paidInfo) => {
    // Check if free trial completed
    if (!hasCompletedFreeTrialForAccess) {
      setWarningReason('trial');
      setShowEnrollmentWarning(true);
      return;
    }

    const durationMatch = paidInfo.dur.match(/(\d+)/);
    const duration = durationMatch ? parseInt(durationMatch[1], 10) : 7;
    const latestCompletedEntry = getLatestCompletedEntry(duration);
    const isCompletedProgram = completedPaidProgramIds.has(paidInfo.programId);
    const isRecentlyCompleted = isCompletedWithinDays(latestCompletedEntry?.completedAt, 45);

    // If completed in last 45 days, open the existing report instead of starting a new enrollment.
    if (isCompletedProgram && isRecentlyCompleted && onViewCompletedProgram && latestCompletedEntry) {
      onViewCompletedProgram(latestCompletedEntry);
      return;
    }

    // Check if user is already enrolled in a program
    if (!reviewBypass && isEnrolledInProgram && !programCompleted && !isCompletedProgram) {
      setWarningReason('current');
      setShowEnrollmentWarning(true);
      return;
    }

    if (paidInfo && onSelectPaidProgram) {
      // Fetch the program data
      const programData = PROGRAM_DATA_MAP[program];
      let data = [];
      if (programData && programData[paidInfo.dur]) {
        data = programData[paidInfo.dur];
      }
      
      onSelectPaidProgram({
        program,
        paidIndex: paidInfo.index,
        duration,
        title: paidInfo.title,
        programId: paidInfo.programId,
        data, // Include the actual program data
      });
      
      // Close modal
      setActivePaidIndex(null);
    }
  };

  const handleGoalSwitchRequest = (goalId) => {
    if (!goalId || goalId === program) {
      return;
    }

    if (!canSwitchGoals) {
      return;
    }

    setShowGoalSwitchConfirm(true);
  };

  const otherGoals = PROGRAMS.filter((item) => item.id !== program);
  const selectedGoalId = selectedSwitchGoalId || otherGoals[0]?.id || '';
  const selectedGoal = otherGoals.find((item) => item.id === selectedGoalId) || otherGoals[0] || null;

  useEffect(() => {
    const userKey = user?.uid || user?.email || 'guest';
    const seenKey = `ms_lucky_offer_seen_${userKey}`;
    const alreadySeen = localStorage.getItem(seenKey) === 'true';
    if (alreadySeen) {
      return;
    }

    const popupTimer = setTimeout(() => {
      setShowLuckyOfferPopup(true);
    }, 450);

    return () => clearTimeout(popupTimer);
  }, [user?.uid, user?.email]);

  useEffect(() => {
    if (focusTarget !== 'switch-goal') {
      return;
    }

    const target = switchGoalSectionRef.current;
    if (!target) {
      onFocusHandled?.();
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setSwitchGoalFocused(true);
    const timer = setTimeout(() => setSwitchGoalFocused(false), 1600);
    onFocusHandled?.();

    return () => clearTimeout(timer);
  }, [focusTarget, onFocusHandled]);

  const closeLuckyOfferPopup = () => {
    const userKey = user?.uid || user?.email || 'guest';
    const seenKey = `ms_lucky_offer_seen_${userKey}`;
    localStorage.setItem(seenKey, 'true');
    setShowLuckyOfferPopup(false);
  };

  const tabTheme = theme || { top: '#DDF0E0', mid: '#EFF9F0', contrast: '#3F6C43' };

  return (
    <div style={{ padding: "32px 22px", maxWidth: 480, margin: "0 auto", background: `linear-gradient(180deg, ${tabTheme.mid} 0%, rgba(255,255,255,0.82) 26%, rgba(255,255,255,0.72) 100%)`, borderRadius: 20 }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Programs</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, marginBottom: "6px" }}>Continue your journey</h2>
      <p style={{ fontSize: "14px", color: "#9BA8A0", marginBottom: "22px", lineHeight: 1.6 }}>
        Personalized to your <strong>{prog?.label}</strong> goal. {!hasCompletedFreeTrialForAccess && "Complete 3-day trial to unlock paid programs."}
      </p>

      <Card style={{ marginBottom: "16px", background: "#FFFDF6", border: `1px solid ${accent}33` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontSize: "19px", lineHeight: 1 }}>💛</span>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#8F7A3C", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
              Founding Members
            </p>
            <p style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.65 }}>
              You are one of our first users, and your feedback matters most to us while we shape Mindscript. We are listening closely and improving the experience week by week.
            </p>
          </div>
        </div>
      </Card>

      {/* Enrollment Warning Banner */}
      {isEnrolledInProgram && !programCompleted && (
        <div style={{ 
          padding: "14px 16px", 
          background: "#FFF4E6", 
          border: "1.5px solid #FFD69E", 
          borderRadius: "14px", 
          marginBottom: "18px" 
        }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#C77700", marginBottom: "4px" }}>
            📚 Currently Enrolled
          </p>
          <p style={{ fontSize: "12px", color: "#8B5A00", lineHeight: 1.6 }}>
            You're enrolled in <strong>{enrolledProgramName}</strong>. Complete it first before starting a new program.
          </p>
        </div>
      )}

      {/* Active free program */}
      <Card style={{ background: prog?.bg, border: "none", marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <Tag label={hasCompletedFreeTrial ? "Completed" : "Active Now"} color={prog?.color} />
            <p style={{ fontWeight: 600, fontSize: "15px", color: "#2C3530", marginTop: "8px" }}>3-Day Free Program</p>
            <p style={{ fontSize: "12px", color: "#5E6B64", marginTop: "3px" }}>
                {hasCompletedFreeTrial 
                ? "All sessions completed ✓" 
                : activePaidProgram 
                  ? "Paused while in paid program"
                  : `Day ${currentDay} of 3 · In progress`
              }
            </p>
          </div>
          <span style={{ fontSize: "28px" }}>{prog?.icon}</span>
        </div>
      </Card>

      {/* Currently Enrolled Paid Program */}
      {activePaidProgram && !programCompleted && (
        <Card style={{ 
          background: `linear-gradient(135deg, ${tabTheme.mid} 0%, #F7FBF8 100%)`, 
          border: `1.5px solid ${accent}`,
          marginBottom: "18px" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Tag label="Currently Enrolled" color={tabTheme.contrast || accent} />
              <p style={{ fontWeight: 600, fontSize: "15px", color: "#2C3530", marginTop: "8px" }}>
                {activePaidProgram.title}
              </p>
              <p style={{ fontSize: "12px", color: "#5E6B64", marginTop: "3px" }}>
                Day {currentDay} of {activePaidProgram.duration} · In progress
              </p>
            </div>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              ⚡
            </div>
          </div>
          <div style={{
            marginTop: "12px",
            padding: "10px 14px",
            background: "rgba(122, 158, 135, 0.1)",
            borderRadius: "10px"
          }}>
            <p style={{ fontSize: "11px", color: "#5E6B64", lineHeight: 1.5 }}>
              Complete this program to unlock new program selection
            </p>
          </div>
          {canExitRecentlyCompletedActive && (
            <Btn
              variant="ghost"
              style={{ width: "100%", marginTop: "10px", borderColor: accent, color: tabTheme.contrast || accent }}
              onClick={() => onExitActiveProgram && onExitActiveProgram()}
            >
              Exit Program
            </Btn>
          )}
        </Card>
      )}



      <p style={{ fontSize: "11px", fontWeight: 700, color: "#9BA8A0", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "11px" }}>Paid Programs</p>
      {visiblePaidPrograms.map((p) => {
        const durationMatch = p.dur.match(/(\d+)/);
        const duration = durationMatch ? parseInt(durationMatch[1], 10) : 7;
        const latestCompletedEntry = getLatestCompletedEntry(duration);
        const isRecentlyCompleted = isCompletedWithinDays(latestCompletedEntry?.completedAt, 45);
        const completedDaysAgo = getCompletedDaysAgo(latestCompletedEntry?.completedAt);
        const isLocked = !hasCompletedFreeTrialForAccess;
        const isCompletedProgram = completedPaidProgramIds.has(p.programId);
        const isDisabled = isLocked || ((isEnrolledInProgram && !programCompleted) && !isCompletedProgram);
        
        return (
          <Card key={p.programId} style={{ 
            marginBottom: "10px",
            opacity: isDisabled ? 0.6 : 1,
            position: "relative"
          }}>
            {isLocked && (
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#E8E8E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1
              }}>
                <LockIcon size={16} color="#666" />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#2C3530", marginBottom: "5px" }}>{p.title}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <Tag label={p.dur} color="#9BA8A0" />
                  {isCompletedProgram && <Tag label="Completed" color="#4A7C59" />}
                </div>
                <p style={{ fontSize: "12px", color: "#5E6B64", marginTop: "8px", lineHeight: 1.55 }}>{p.desc}</p>
              </div>
              {!isLocked && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "10px",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 18, color: '#fff' }}>✓</span>
                </div>
              )}
            </div>
            <Btn 
              variant="primary" 
              style={{ 
                width: "100%", 
                marginTop: "12px", 
                fontSize: "13px", 
                padding: "10px",
                opacity: isDisabled ? 0.5 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer"
              }} 
              onClick={() => !isDisabled && handleAccessPaidProgram(p)}
            >
              {isLocked
                ? "🔒 Complete Free Trial First"
                : isDisabled
                ? "Complete Current Program First"
                : (isCompletedProgram && isRecentlyCompleted)
                ? "View Report"
                : "Access Program"}
            </Btn>
            {isCompletedProgram && isRecentlyCompleted && (
              <p style={{ fontSize: "11px", color: accent, marginTop: "8px", lineHeight: 1.5 }}>
                Completed {completedDaysAgo === 0 ? 'today' : `${completedDaysAgo} day${completedDaysAgo === 1 ? '' : 's'} ago`}. You can review this program without starting a new entry.
              </p>
            )}
          </Card>
        );
      })}

      {visiblePaidPrograms.length === 0 && (
        <Card style={{ marginBottom: "10px", background: "#F7F6F2", border: "1px solid #E8E4DC" }}>
          <p style={{ fontSize: "13px", color: "#5E6B64", lineHeight: 1.6 }}>
            No new paid programs are available right now for this goal. Complete your current track or switch goals to unlock more options.
          </p>
        </Card>
      )}

      <p style={{ fontSize: "11px", fontWeight: 700, color: "#9BA8A0", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "11px" }}>Switch Goal</p>
      <div ref={switchGoalSectionRef}>
      <Card
        style={{
          marginBottom: "20px",
          border: switchGoalFocused ? `1.5px solid ${accent}` : "1px solid #ECE8E1",
          boxShadow: switchGoalFocused ? `0 12px 24px ${accent}44, 0 0 0 3px ${accent}26` : "none",
          transition: "all .25s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#2C3530" }}>Goal Access</p>
          <span style={{ fontSize: "11px", color: accent, fontWeight: 700 }}>{goalsStarted} goals started</span>
        </div>
        <p style={{ fontSize: "12px", color: "#5E6B64", lineHeight: 1.6, marginBottom: "12px" }}>
          {canSwitchGoals
            ? "Unlocked: You can switch to any goal and start its journey."
            : "Locked: Complete one 3-day free program and one paid program to unlock goal switching."}
        </p>
        {selectedGoal ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>{selectedGoal.icon}</span>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#2C3530" }}>{selectedGoal.label}</p>
            </div>
            <p style={{ fontSize: "12px", color: "#7B857F", lineHeight: 1.6, marginBottom: "10px" }}>{selectedGoal.desc}</p>
            <select
              value={selectedGoalId}
              onChange={(e) => {
                setSelectedSwitchGoalId(e.target.value);
                setGoalSwitchNotice('');
              }}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "12px",
                border: "1px solid #D6DED8",
                background: "#fff",
                fontSize: "13px",
                color: "#2C3530",
                marginBottom: "10px",
              }}
            >
              {otherGoals.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <Btn
              style={{
                width: "100%",
                fontSize: "12px",
                padding: "9px",
                opacity: canSwitchGoals ? 1 : 0.6,
                cursor: canSwitchGoals ? "pointer" : "not-allowed",
              }}
              onClick={() => canSwitchGoals && handleGoalSwitchRequest(selectedGoalId)}
            >
              {canSwitchGoals ? `Switch to ${selectedGoal.label}` : 'Complete Free + Paid to Unlock'}
            </Btn>
          </>
        ) : (
          <p style={{ fontSize: "12px", color: "#7B857F" }}>No other goals available.</p>
        )}
      </Card>
      </div>

      {showPayments && <Payments onClose={() => setShowPayments(false)} user={null} onUnlock={handleUnlockPaid} />}

      {showLuckyOfferPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 28, 24, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={closeLuckyOfferPopup}
        >
          <div
            style={{
              background: "linear-gradient(165deg, #FFFDF5 0%, #F4F8EE 100%)",
              borderRadius: "24px",
              border: "1.5px solid #D8E5D8",
              width: "100%",
              maxWidth: "420px",
              padding: "22px 20px 18px",
              boxShadow: "0 20px 50px rgba(44, 53, 48, 0.25)",
              position: "relative",
              overflow: "hidden",
              animation: "luckyOfferPopIn 420ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLuckyOfferPopup}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: "none",
                background: "#EDF3EA",
                color: "#607065",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 700,
              }}
              aria-label="Close offer popup"
            >
              ×
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "26px", animation: "luckyOfferFloat 2.2s ease-in-out infinite" }}>🎉</span>
              <span style={{ fontSize: "26px", animation: "luckyOfferFloat 2.2s ease-in-out 260ms infinite" }}>✨</span>
              <span style={{ fontSize: "26px", animation: "luckyOfferFloat 2.2s ease-in-out 520ms infinite" }}>🥳</span>
            </div>

            <p style={{ fontSize: "11px", fontWeight: 700, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
              Lucky Access
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 600, lineHeight: 1.05, color: "#26322D", marginBottom: "10px" }}>
              You are one of our first 1000 users
            </h3>
            <p style={{ fontSize: "14px", color: "#52635A", lineHeight: 1.65, marginBottom: "12px" }}>
              All paid programs are free for early members. You are the lucky one, enjoy your full access experience.
            </p>

            <div style={{
              background: "#FFFFFF",
              border: "1px solid #DDE8DE",
              borderRadius: "14px",
              padding: "11px 12px",
              marginBottom: "14px",
            }}>
              <p style={{ fontSize: "12px", color: "#4E5F56", lineHeight: 1.6 }}>
                🚀 Explore every paid journey without payment limits while this early-access window is active.
              </p>
              <p style={{ fontSize: "12px", color: "#4E5F56", lineHeight: 1.6, marginTop: "6px" }}>
                🌿 We are also planning ad-free access for you, for a smoother and more peaceful experience.
              </p>
            </div>

            <Btn
              onClick={closeLuckyOfferPopup}
              style={{ width: "100%" }}
            >
              Awesome, Let us go
            </Btn>

            <style>{`
              @keyframes luckyOfferPopIn {
                0% { transform: translateY(26px) scale(0.96); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
              }
              @keyframes luckyOfferFloat {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-6px) rotate(4deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Goal Switch Confirmation Modal */}
      {showGoalSwitchConfirm && selectedGoal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setShowGoalSwitchConfirm(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#EAF3ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "28px"
                }}
              >
                {selectedGoal.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "22px",
                  fontWeight: 500,
                  color: "#2C3530",
                  marginBottom: "8px"
                }}
              >
                Switch to {selectedGoal.label}?
              </h3>
              <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.6 }}>
                You completed one free and one paid program for this goal, so switching is now unlocked.
              </p>
              <p style={{ fontSize: "12px", color: "#7B857F", marginTop: "8px", lineHeight: 1.6 }}>
                Your existing progress stays saved. The new goal starts with its own journey.
              </p>
            </div>
            <Btn
              onClick={() => {
                setShowGoalSwitchConfirm(false);
                onSwitchGoal?.(selectedGoalId);
              }}
              style={{ width: "100%" }}
            >
              Switch to {selectedGoal.label}
            </Btn>
          </div>
        </div>
      )}

      {/* Enrollment Warning Modal */}
      {showEnrollmentWarning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={() => setShowEnrollmentWarning(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: hasCompletedFreeTrial ? "#FFF4E6" : "#FFE5E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "28px"
              }}>
                {hasCompletedFreeTrial ? "📚" : "🔒"}
              </div>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "22px",
                fontWeight: 500,
                color: "#2C3530",
                marginBottom: "8px"
              }}>
                {warningReason === 'goal_unlock'
                  ? 'Goal Switching Locked'
                  : (warningReason === 'current' ? 'Complete Current Program First' : (hasCompletedFreeTrial ? "Complete Current Program First" : "Complete Free Trial First"))}
              </h3>
              <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.6 }}>
                {warningReason === 'goal_unlock'
                  ? 'Goal switching unlocks after you complete one 3-day free program and one paid program. Once those are finished, you can switch goals even if you later reopen a program you have already completed.'
                  : (warningReason === 'current'
                    ? `Finish ${enrolledProgramName} first. Goal switching is blocked during an active program to avoid random jumping.`
                    : (hasCompletedFreeTrial
                      ? `You're currently enrolled in ${enrolledProgramName}. Complete it before starting a new program to maintain focus and commitment.`
                      : "Complete the 3-day free trial program first to unlock all paid programs. This ensures you're ready for deeper work."))}
              </p>
            </div>
            <Btn
              onClick={() => setShowEnrollmentWarning(false)}
              style={{ width: "100%" }}
            >
              Got it
            </Btn>
          </div>
        </div>
      )}

      {/* Paid Program Modal */}
      {activePaidIndex !== null && (
        <PaidProgramModal 
          program={program} 
          paidIndex={activePaidIndex} 
          onClose={() => setActivePaidIndex(null)} 
        />
      )}
    </div>
  );
};

export default ProgramsTab;
