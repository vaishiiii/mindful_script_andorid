import React from 'react';

export const Btn = ({ children, onClick, variant = "primary", style = {}, disabled, className = "" }) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 28px",
    minHeight: "44px",
    borderRadius: "9999px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "15px",
    letterSpacing: "0.01em",
    transition: "all .22s ease",
    opacity: disabled ? 0.5 : 1,
    position: "relative",
    overflow: "hidden",
    backgroundSize: "200% 200%",
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, var(--ms-accent-deep, #567965) 0%, var(--ms-accent, #7A9E87) 54%, var(--ms-accent-glow, #9EC2AD) 100%)",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.24)",
      boxShadow: "0 10px 20px rgba(44,53,48,0.18), 0 0 16px rgba(122,158,135,0.38)",
      animation: "btnGlowFlow 6.5s ease-in-out infinite, btnNeonPulse 3.4s ease-in-out infinite",
    },
    ghost: {
      background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, var(--ms-accent-bg, #E8F0EB) 100%)",
      color: "var(--ms-accent-contrast, #5A7A67)",
      border: "1.5px solid var(--ms-accent-soft, #C4D8CB)",
      boxShadow: "0 6px 14px rgba(44,53,48,0.1), 0 0 12px rgba(122,158,135,0.2), inset 0 0 0 1px rgba(255,255,255,0.4)",
      animation: "btnNeonPulse 3.8s ease-in-out infinite",
    },
    soft: {
      background: "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, var(--ms-accent-bg, #E8F0EB) 100%)",
      color: "var(--ms-accent-contrast, #5A7A67)",
      border: "1px solid rgba(122,158,135,0.18)",
      boxShadow: "0 6px 14px rgba(44,53,48,0.09), 0 0 10px rgba(122,158,135,0.16)",
      animation: "btnNeonPulse 4.2s ease-in-out infinite",
    },
    danger: { background: "transparent", color: "#A67B7B", border: "1.5px solid rgba(166,123,123,0.3)" },
    text: { background: "transparent", color: "#9BA8A0", padding: "10px 16px" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`ms-btn ms-btn--${variant} ${className}`.trim()}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, style = {}, onClick, selected }) => (
  <div
    onClick={onClick}
    style={{
      background: "#fff",
      borderRadius: "28px",
      padding: "18px",
      boxShadow: selected
        ? "0 10px 24px rgba(44,53,48,0.08)"
        : "0 10px 24px rgba(44,53,48,0.08), 0 2px 8px rgba(44,53,48,0.04)",
      border: `1.5px solid ${selected ? "var(--ms-accent, #7A9E87)" : "transparent"}`,
      outline: selected ? "3px solid var(--ms-accent-bg, #E8F0EB)" : "none",
      cursor: onClick ? "pointer" : "default",
      transition: "all .22s ease",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tag = ({ label, color = "#7A9E87" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "9999px",
      background: `${color}22`,
      color,
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}
  >
    {label}
  </span>
);

export const ProgressBar = ({ step, total }) => (
  <div style={{ display: "flex", gap: "5px", marginBottom: "26px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: "3px",
          borderRadius: "2px",
          background: i < step ? "var(--ms-accent, #7A9E87)" : "var(--ms-accent-soft, #C4D8CB)",
          transition: "background .35s",
        }}
      />
    ))}
  </div>
);

export default { Btn, Card, Tag, ProgressBar };
