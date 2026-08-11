import React from 'react';
import { Btn, Tag, CheckIcon } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';

const DayCelebration = ({ day, program, onContinue }) => {
  const prog = PROGRAMS.find((p) => p.id === program);
  const accent = prog?.color || "var(--ms-accent)";
  const accentShades = [
    accent,
    `${accent}CC`,
    `${accent}99`,
    `${accent}66`,
  ];
  const confettiPcs = Array.from({ length: 12 }, (_, i) => ({
    x: 10 + i * 7.5,
    color: accentShades[i % accentShades.length],
    delay: i * 0.08,
  }));

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: prog?.bg || "#F7F6F2",
        zIndex: 150,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        textAlign: "center",
      }}
    >
      {/* Confetti particles */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, height: 120, overflow: "hidden", pointerEvents: "none" }}>
        {confettiPcs.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: 0,
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color,
              animation: `confetti 1.2s ease-out ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          animation: "celebrate .6s ease-out",
          boxShadow: "0 8px 32px rgba(44,53,48,0.2)",
        }}
      >
        <CheckIcon size={36} />
      </div>
      <Tag label={`Day ${day} Complete`} color={accent} />
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "34px",
          fontWeight: 500,
          color: "#2C3530",
          margin: "16px 0 12px",
          lineHeight: 1.25,
        }}
      >
        {day === 3 ? "You did it." : "One more down."}
      </h2>
      <p style={{ fontSize: "15px", color: "#5E6B64", lineHeight: 1.7, maxWidth: 300, marginBottom: "36px" }}>
        {day === 1
          ? "The hardest session is always the first one. You showed up. That's what matters."
          : day === 2
          ? "Two days of deliberate practice. You're building something real."
          : "Three days complete. Your pattern report is ready."}
      </p>
      {day < 3 && (
        <div style={{ padding: "16px 20px", background: "var(--ms-accent-soft)", borderRadius: "16px", marginBottom: "28px", textAlign: "left", maxWidth: 300, width: "100%" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: accent, marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Up Next</p>
          <p style={{ fontSize: "14px", color: "#5E6B64" }}>Day {day + 1} — same structure, new tasks. Sessions unlock on your schedule.</p>
        </div>
      )}
      <Btn onClick={onContinue} style={{ width: "100%", maxWidth: 300, padding: "16px" }}>
        {day === 3 ? "View My Report →" : `Start Day ${day + 1} →`}
      </Btn>
    </div>
  );
};

export default DayCelebration;
