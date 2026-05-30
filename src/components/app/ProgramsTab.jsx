import React, { useState } from 'react';
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

const ProgramsTab = ({ program, onSelectPaidProgram, programHistory = [], activePaidProgram, programCompleted, currentDay, activeProgramDuration }) => {
  const [showPayments, setShowPayments] = useState(false);
  const [paidUnlocked, setPaidUnlocked] = useState(true); // Default to unlocked
  const [activePaidIndex, setActivePaidIndex] = useState(null);
  const [showEnrollmentWarning, setShowEnrollmentWarning] = useState(false);
  
  const prog = PROGRAMS.find((p) => p.id === program);
  const paid = PAID_PROGRAMS[program] || [];

  // Check if the 3-day free program has been completed
  const hasCompletedFreeTrial = programHistory.some(
    p => p.duration === 3 && p.isPaid === false
  );

  // Check if user is currently enrolled in a program (not completed yet)
  // User is enrolled if:
  // 1. They have an active paid program AND not completed, OR
  // 2. They're in the free trial (no paid program) AND not on last day or not completed
  const isEnrolledInProgram = 
    (activePaidProgram !== null && !programCompleted) || 
    (activePaidProgram === null && !hasCompletedFreeTrial && currentDay <= activeProgramDuration);
  
  // Get enrolled program name for display
  const enrolledProgramName = activePaidProgram 
    ? `${activePaidProgram.program} ${activePaidProgram.duration}-Day Program`
    : !hasCompletedFreeTrial 
      ? `${program} 3-Day Free Program`
      : null;

  // Handler for unlocking paid plans
  const handleUnlockPaid = () => {
    setShowPayments(false);
    setPaidUnlocked(true);
  };

  // Handle paid program selection
  const handleAccessPaidProgram = (index) => {
    // Check if free trial completed
    if (!hasCompletedFreeTrial) {
      setShowEnrollmentWarning(true);
      return;
    }

    // Check if user is already enrolled in a program
    if (isEnrolledInProgram && !programCompleted) {
      setShowEnrollmentWarning(true);
      return;
    }

    const paidInfo = paid[index];
    if (paidInfo && onSelectPaidProgram) {
      // Extract duration as a number
      const durationMatch = paidInfo.dur.match(/(\d+)/);
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : 7;
      
      // Fetch the program data
      const programData = PROGRAM_DATA_MAP[program];
      let data = [];
      if (programData && programData[paidInfo.dur]) {
        data = programData[paidInfo.dur];
      }
      
      onSelectPaidProgram({
        program,
        paidIndex: index,
        duration,
        title: paidInfo.title,
        programId: `${program}-${paidInfo.dur}`,
        data, // Include the actual program data
      });
      
      // Close modal
      setActivePaidIndex(null);
    }
  };

  return (
    <div style={{ padding: "32px 22px", maxWidth: 480, margin: "0 auto" }}>
      <p style={{ fontSize: "12px", fontWeight: 700, color: "#7A9E87", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Programs</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, marginBottom: "6px" }}>Continue your journey</h2>
      <p style={{ fontSize: "14px", color: "#9BA8A0", marginBottom: "22px", lineHeight: 1.6 }}>
        Personalized to your <strong>{prog?.label}</strong> goal. {!hasCompletedFreeTrial && "Complete 3-day trial to unlock paid programs."}
      </p>

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
          background: "linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)", 
          border: "1.5px solid #7A9E87",
          marginBottom: "18px" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <Tag label="Currently Enrolled" color="#4A7C59" />
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
              background: "#7A9E87",
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
        </Card>
      )}

      <p style={{ fontSize: "11px", fontWeight: 700, color: "#9BA8A0", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "11px" }}>Paid Programs</p>
      {paid.map((p, i) => {
        const isLocked = !hasCompletedFreeTrial;
        const isDisabled = isLocked || (isEnrolledInProgram && !programCompleted);
        
        return (
          <Card key={i} style={{ 
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
                <Tag label={p.dur} color="#9BA8A0" />
                <p style={{ fontSize: "12px", color: "#5E6B64", marginTop: "8px", lineHeight: 1.55 }}>{p.desc}</p>
              </div>
              {!isLocked && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#7A9E87",
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
              onClick={() => !isDisabled && handleAccessPaidProgram(i)}
            >
              {isLocked ? "🔒 Complete Free Trial First" : isDisabled ? "Complete Current Program First" : "Access Program"}
            </Btn>
          </Card>
        );
      })}

      {showPayments && <Payments onClose={() => setShowPayments(false)} user={null} onUnlock={handleUnlockPaid} />}

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
                {hasCompletedFreeTrial ? "Complete Current Program First" : "Complete Free Trial First"}
              </h3>
              <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.6 }}>
                {hasCompletedFreeTrial 
                  ? `You're currently enrolled in ${enrolledProgramName}. Complete it before starting a new program to maintain focus and commitment.`
                  : "Complete the 3-day free trial program first to unlock all paid programs. This ensures you're ready for deeper work."
                }
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
