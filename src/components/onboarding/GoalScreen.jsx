import React, { useState } from 'react';
import { Btn, Card, ProgressBar } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';

const hexToRgba = (hex, alpha) => {
  const cleanHex = hex.replace('#', '');
  const bigint = Number.parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const darkenHex = (hex, amount = 0.14) => {
  const cleanHex = hex.replace('#', '');
  const bigint = Number.parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const darken = (value) => Math.max(0, Math.round(value * (1 - amount)));
  const toHex = (value) => value.toString(16).padStart(2, '0');

  return `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
};

const getGoalPalette = (program) => {
  const selectedAccent = darkenHex(program.color, 0.14);
  return {
    bg: program.bg,
    tint: hexToRgba(program.color, 0.08),
    accent: program.color,
    selectedAccent,
    text: "#2C3530",
  };
};

const GoalScreen = ({ onNext, onBack }) => {
  const [sel, setSel] = useState(null);

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
      <ProgressBar step={1} total={4} />
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#7A9E87",
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
        {PROGRAMS.map((p) => {
          const isSelected = sel === p.id;
          const palette = getGoalPalette(p);

          return (
            <Card
              key={p.id}
              onClick={() => setSel(p.id)}
              style={{
                background: `linear-gradient(165deg, ${palette.bg} 0%, ${hexToRgba(p.color, 0.12)} 100%)`,
                border: `1.5px solid ${isSelected ? palette.selectedAccent : hexToRgba(palette.accent, 0.38)}`,
                boxShadow: isSelected
                  ? `inset 0 0 0 1px ${hexToRgba(palette.selectedAccent, 0.2)}, 0 10px 26px ${hexToRgba(palette.selectedAccent, 0.3)}`
                  : `0 1px 4px ${hexToRgba(palette.accent, 0.12)}`,
                transform: isSelected ? "translateY(-1px)" : "none",
                cursor: "pointer",
                padding: "15px",
                overflow: "hidden",
              }}
            >
              <div style={{ fontSize: "19px", marginBottom: "7px", color: isSelected ? palette.selectedAccent : palette.accent }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: palette.text, marginBottom: "3px" }}>{p.label}</div>
              <div style={{ fontSize: "11px", color: hexToRgba("#2C3530", 0.72), lineHeight: 1.4 }}>{p.desc}</div>
            </Card>
          );
        })}
      </div>
      <Btn onClick={() => sel && onNext(sel)} disabled={!sel} style={{ width: "100%" }}>
        Continue →
      </Btn>
    </div>
  );
};

export default GoalScreen;
