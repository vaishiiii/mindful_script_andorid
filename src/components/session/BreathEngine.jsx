import React, { useState, useEffect, useRef } from 'react';
import { Btn, Tag } from '@/components/ui';
import { BREATH_PATTERNS } from '@/data/sessions';
import { PROG_COLORS } from '@/styles/designSystem';
import BreathWave from './BreathWave';

const BreathEngine = ({ program, sessionType, onComplete, devMode = false }) => {
  // Get time-of-day specific breath pattern: BREATH_PATTERNS[program][sessionType]
  const programPatterns = BREATH_PATTERNS[program] || BREATH_PATTERNS.calm;
  const pat = programPatterns[sessionType] || programPatterns.morning;
  const times = pat.times;
  const totalCycles = sessionType === "morning" ? 4 : sessionType === "midday" ? 3 : 5;

  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [sec, setSec] = useState(times[0]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    if (sec > 0) {
      ref.current = setTimeout(() => setSec((s) => s - 1), 1000);
    } else {
      const np = (phase + 1) % pat.phases.length;
      if (np === 0) {
        const nc = cycle + 1;
        if (nc >= totalCycles) {
          setDone(true);
          return;
        }
        setCycle(nc);
      }
      setPhase(np);
      setSec(times[np]);
    }
    return () => clearTimeout(ref.current);
  }, [started, done, sec, phase, cycle, totalCycles, pat.phases.length, times]);

  const c = PROG_COLORS[program] || "#7A9E87";
  const currentPhase = pat.phases[phase];

  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", textAlign: "left" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: c, letterSpacing: "0.08em", textTransform: "uppercase" }}>{pat.label}</p>
          <p style={{ fontSize: "12px", color: "#9BA8A0", marginTop: "2px", lineHeight: 1.5, maxWidth: 230 }}>{pat.desc}</p>
        </div>
        <Tag label={`${totalCycles} cycles`} color={c} />
      </div>

      {/* Wave animation */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        {done ? (
          <div
            className="fade-in"
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `${c}15`,
              border: `1.5px solid ${c}40`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "32px", marginBottom: "8px" }}>◎</span>
            <p style={{ fontSize: "12px", color: "#9BA8A0", textTransform: "uppercase", letterSpacing: "0.08em" }}>Complete</p>
          </div>
        ) : started ? (
          <BreathWave phase={phase} phaseName={currentPhase} timeTotal={times[phase]} timeLeft={sec} color={c} />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: `${c}0D`,
              border: `1.5px dashed ${c}40`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#9BA8A0" }}>Ready when you are</p>
          </div>
        )}
      </div>

      {/* Phase pills */}
      {!done && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
          {pat.phases.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                background: started && phase === i ? c : `${c}18`,
                color: started && phase === i ? "#fff" : "#9BA8A0",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                transition: "all .3s",
              }}
            >
              {p} {times[i]}s
            </div>
          ))}
        </div>
      )}

      {/* Cycle dots */}
      {started && !done && (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "20px" }}>
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i < cycle ? c : `${c}30`,
                transition: "background .3s",
              }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {done ? (
        <div className="fade-in">
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "17px", color: "#2C3530", marginBottom: "18px" }}>
            Breathwork complete. Well done.
          </p>
          <Btn onClick={onComplete}>Continue to Task →</Btn>
        </div>
      ) : !started ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Btn onClick={() => setStarted(true)}>Begin Breathwork</Btn>
          {devMode && (
            <Btn onClick={onComplete} variant="ghost" style={{ fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>⚡ Skip (dev) →</Btn>
          )}
        </div>
      ) : (
        <Btn onClick={() => setDone(true)} variant="ghost" style={{ fontSize: "13px" }}>
          Skip →
        </Btn>
      )}
    </div>
  );
};

export default BreathEngine;
