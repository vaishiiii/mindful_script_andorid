import React, { useState, useEffect, useRef } from 'react';
import { Btn } from '@/components/ui';

const ActionTimer = ({ seconds, onComplete, devMode = false, accentColor = "var(--ms-accent)" }) => {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [fin, setFin] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && left > 0) {
      ref.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    } else if (running && left === 0) {
      setRunning(false);
      setFin(true);
      // Auto-complete after a brief celebration pause
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
    return () => clearTimeout(ref.current);
  }, [running, left, onComplete]);

  const R = 36;
  const circ = 2 * Math.PI * R;
  const pct = 1 - left / seconds;
  const mm = Math.floor(left / 60);
  const ss = left % 60;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "var(--ms-accent-soft)", borderRadius: "16px" }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r={R} fill="none" stroke="var(--ms-accent-border)" strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: accentColor }}>
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {fin ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: accentColor, marginBottom: "4px" }}>✨ Complete!</p>
            <p style={{ fontSize: "12px", color: "#5A7A67" }}>Great focus. Moving to next step...</p>
          </div>
        ) : running ? (
          <>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#5A7A67" }}>Timer running…</p>
            <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "2px" }}>Stay with it. Don't switch tasks.</p>
            <Btn onClick={() => setRunning(false)} variant="ghost" style={{ marginTop: "8px", padding: "8px 14px", fontSize: "12px" }}>
              Pause
            </Btn>
            {devMode && (
              <Btn onClick={onComplete} variant="ghost" style={{ marginTop: "6px", padding: "8px 14px", fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>⚡ Skip (dev)</Btn>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530" }}>
              {left < seconds ? "Paused" : `${Math.floor(seconds / 60)} min focus timer`}
            </p>
            <Btn onClick={() => setRunning(true)} variant="soft" style={{ marginTop: "8px", padding: "10px 18px", fontSize: "13px" }}>
              {left < seconds ? "Resume" : "Start Timer"} →
            </Btn>
            {devMode && (
              <Btn onClick={onComplete} variant="ghost" style={{ marginTop: "6px", padding: "8px 14px", fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>⚡ Skip (dev)</Btn>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionTimer;
