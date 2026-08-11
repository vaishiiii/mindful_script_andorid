import React, { useState } from 'react';
import { Btn, Card, ProgressBar } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';

const GoalScreen = ({ onNext, onBack }) => {
  const [sel, setSel] = useState(null);
  const selectedProgram = PROGRAMS.find((p) => p.id === sel);
  const accent = selectedProgram?.color || "var(--ms-accent)";

  return (
    <div className="slide-up" style={{ minHeight: "100vh", padding: "48px 22px 32px", maxWidth: 480, margin: "0 auto" }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#9BA8A0",
            fontSize: "14px",
            marginBottom: "20px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="#9BA8A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      )}
      <ProgressBar step={1} total={4} accentColor={selectedProgram?.color} />
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: accent,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Step 1 of 4
      </p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "30px", fontWeight: 500, marginBottom: "6px" }}>
        What brings you here?
      </h2>
      <p style={{ fontSize: "14px", color: "#9BA8A0", marginBottom: "26px", lineHeight: 1.6 }}>
        Choose one focus. Your entire program will be built around it.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
        {PROGRAMS.map((p) => (
          <Card
            key={p.id}
            onClick={() => setSel(p.id)}
            selected={sel === p.id}
            style={{
              background: sel === p.id ? p.bg : "#fff",
              border: sel === p.id ? `1.5px solid ${p.color}` : "1.5px solid transparent",
              outline: sel === p.id ? `3px solid ${p.bg}` : "none",
              cursor: "pointer",
              padding: "15px",
            }}
          >
            <div style={{ fontSize: "19px", marginBottom: "7px" }}>{p.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "13px", color: "#2C3530", marginBottom: "3px" }}>{p.label}</div>
            <div style={{ fontSize: "11px", color: "#5E6B64", lineHeight: 1.4 }}>{p.desc}</div>
          </Card>
        ))}
      </div>
      <Btn onClick={() => sel && onNext(sel)} disabled={!sel} style={{ width: "100%" }}>
        Continue →
      </Btn>
    </div>
  );
};

export default GoalScreen;
