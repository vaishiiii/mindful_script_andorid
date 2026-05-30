import React from 'react';
import ds from '@/styles/designSystem';

// Import all advanced paid programs
import { PAID_PROGRAM_21DAYS_FOCUS } from '@/data/paidProgramFocus21';
import { PAID_PROGRAM_21DAYS_CALM } from '@/data/paidProgramCalm21';
import paidProgramCalm7 from '@/data/paidProgramCalm7';
import { PAID_PROGRAM_21DAYS_CONFIDENCE } from '@/data/paidProgramConfidence21';
import paidProgramHealing21 from '@/data/paidProgramHealing21';
import paidProgramHealing7 from '@/data/paidProgramHealing7';
import { PAID_PROGRAM_21DAYS_PURPOSE } from '@/data/paidProgramPurpose21';
import { PAID_PROGRAM_21DAYS_HABIT } from '@/data/paidProgramHabit21';
import paidProgramFocus5 from '@/data/paidProgramFocus5';
import paidProgramConfidence5 from '@/data/paidProgramConfidence5';
import paidProgramConfidence7 from '@/data/paidProgramConfidence7';
import paidProgramPurpose7 from '@/data/paidProgramPurpose7';
import paidProgramDiscipline5 from '@/data/paidProgramDiscipline5';

const PROGRAM_MAP = {
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

import { PAID_PROGRAMS } from '@/data/programs';

const PaidProgramModal = ({ program, paidIndex, onClose }) => {
  try {
    // Get the selected paid program info
    const paidList = PAID_PROGRAMS[program] || [];
    const paidInfo = paidList[paidIndex];
    // Map program id to content array
    let daysArr = [];
    let numDays = 21;
    if (paidInfo && paidInfo.dur) {
      const match = paidInfo.dur.match(/(\d+)/);
      if (match) numDays = parseInt(match[1], 10);
    }
    
    // Get the program data based on program type and duration
    const programData = PROGRAM_MAP[program];
    if (programData) {
      if (paidInfo && paidInfo.dur) {
        // If program data is an object with duration keys, look up by duration
        if (typeof programData === 'object' && !Array.isArray(programData)) {
          daysArr = programData[paidInfo.dur] || [];
        } else {
          // If it's a direct array, use it
          daysArr = programData || [];
        }
      }
    }
    
    // Defensive logging for debugging
    // eslint-disable-next-line no-console
    console.log('[PaidProgramModal] program=', program, 'paidIndex=', paidIndex, 'paidInfo=', paidInfo, 'numDays=', numDays, 'daysArr_len=', daysArr?.length);

    // Add defensive logging to debug blank screen issue
    console.log('[PaidProgramModal] Rendered with props:', { program, paidIndex, paidInfo, daysArr });

    // If not enough content for selected duration, show fallback message
    const hasContent = daysArr.length >= numDays;
    daysArr = daysArr.slice(0, numDays);

    return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(44,53,48,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: ds.colors.sagePale,
        borderRadius: ds.radius.xl,
        padding: '2rem 1.5rem',
        minWidth: 320,
        maxWidth: 480,
        width: '95vw',
        boxShadow: ds.shadow.lg,
        position: 'relative',
        border: `1.5px solid ${ds.colors.sageLight}`,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: ds.colors.muted,
            cursor: 'pointer',
            fontFamily: ds.font.sans,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ fontFamily: ds.font.serif, fontSize: 26, fontWeight: 500, color: ds.colors.text, marginBottom: 12, textAlign: 'center' }}>
          {paidInfo ? paidInfo.title : 'Program Content'}
        </h2>
        <div>
          {!hasContent ? (
            <div style={{ color: ds.colors.error, textAlign: 'center', margin: '32px 0' }}>
              No content available for this program duration.<br />
              Please contact support or try a different plan.
            </div>
          ) : (
            daysArr.map((dayObj) => {
              const morning = dayObj.morning || {};
              const midday = dayObj.midday || {};
              const night = dayObj.night || {};

              // Support legacy fields (title/desc/guide) and new structured fields (activation/action/reflection/steps)
              const morningTitle = morning.title || (morning.activation && morning.activation.title) || '';
              const morningDesc = morning.desc || (morning.activation && morning.activation.instructions) || '';
              const morningGuide = morning.guide || (morning.activation && morning.activation.task) || (morning.steps && morning.steps.join(' • ')) || (morning.breath && (morning.breath.pattern || `${morning.breath.durationMin || ''} min`)) || '';

              const middayTitle = midday.title || (midday.action && midday.action.title) || '';
              const middayDesc = midday.desc || (midday.action && midday.action.instructions) || '';
              const middayGuide = midday.guide || (midday.action && (midday.action.timerMin ? `${midday.action.timerMin} min` : (midday.action.timerMinMin ? `${midday.action.timerMinMin}-${midday.action.timerMinMax} min` : ''))) || (midday.steps && midday.steps.join(' • ')) || (midday.timer && `${midday.timer / 60} min`) || (midday.breath && `${midday.breath.durationMin || ''} min`) || '';

              const nightTitle = night.title || (night.reflection && 'Reflection') || '';
              const nightDesc = night.desc || (night.reflection && '') || '';
              const nightGuide = night.guide || (night.reflection && (night.reflection.questions ? night.reflection.questions.join(' • ') : '')) || (night.steps && night.steps.join(' • ')) || (night.breath && `${night.breath.durationMin || ''} min`) || '';

              return (
                <div key={dayObj.day} style={{ marginBottom: 24, background: ds.colors.surface, borderRadius: ds.radius.md, boxShadow: ds.shadow.sm, padding: '16px 12px' }}>
                  <h3 style={{ fontFamily: ds.font.serif, fontSize: 18, color: ds.colors.sageDark, marginBottom: 8 }}>Day {dayObj.day}</h3>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Morning:</strong> <span style={{ color: ds.colors.text }}>{morningTitle}</span>
                    <div style={{ fontSize: 13, color: ds.colors.textSoft }}>{morningDesc}</div>
                    <div style={{ fontSize: 12, color: ds.colors.muted }}>{morningGuide}</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Midday:</strong> <span style={{ color: ds.colors.text }}>{middayTitle}</span>
                    <div style={{ fontSize: 13, color: ds.colors.textSoft }}>{middayDesc}</div>
                    <div style={{ fontSize: 12, color: ds.colors.muted }}>{middayGuide}</div>
                  </div>
                  <div>
                    <strong>Night:</strong> <span style={{ color: ds.colors.text }}>{nightTitle}</span>
                    <div style={{ fontSize: 13, color: ds.colors.textSoft }}>{nightDesc}</div>
                    <div style={{ fontSize: 12, color: ds.colors.muted }}>{nightGuide}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[PaidProgramModal] render error', err);
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 12, maxWidth: 560 }}>
          <h3 style={{ marginTop: 0 }}>An error occurred</h3>
          <p style={{ color: '#a33' }}>Unable to display program content. Check console for details.</p>
          <button onClick={onClose} style={{ marginTop: 12, padding: '8px 12px' }}>Close</button>
        </div>
      </div>
    );
  }
};

export default PaidProgramModal;