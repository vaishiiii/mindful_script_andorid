import React from 'react';

export const Btn = ({ children, onClick, variant = "primary", style = {}, disabled }) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 28px",
    borderRadius: "9999px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    fontSize: "15px",
    letterSpacing: "0.01em",
    transition: "all .22s ease",
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: { background: "var(--ms-accent)", color: "#fff", boxShadow: "0 4px 16px rgba(44,53,48,0.08)" },
    ghost: { background: "transparent", color: "var(--ms-accent)", border: "1.5px solid var(--ms-accent-border)" },
    soft: { background: "var(--ms-accent-soft)", color: "var(--ms-accent)" },
    danger: { background: "transparent", color: "#A67B7B", border: "1.5px solid rgba(166,123,123,0.3)" },
    text: { background: "transparent", color: "#9BA8A0", padding: "10px 16px" },
  };

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
};

export const Card = ({ children, style = {}, onClick, selected }) => (
  <div
    onClick={onClick}
    style={{
      background: "#fff",
      borderRadius: "24px",
      padding: "18px",
      boxShadow: selected ? "none" : "0 1px 4px rgba(44,53,48,0.06)",
      border: `1.5px solid ${selected ? "var(--ms-accent)" : "transparent"}`,
      outline: selected ? "3px solid var(--ms-accent-soft)" : "none",
      cursor: onClick ? "pointer" : "default",
      transition: "all .22s ease",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tag = ({ label, color = "var(--ms-accent)" }) => (
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

export const ProgressBar = ({ step, total, accentColor }) => (
  <div style={{ display: "flex", gap: "5px", marginBottom: "26px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          flex: 1,
          height: "3px",
          borderRadius: "2px",
          background: i < step ? (accentColor || "var(--ms-accent)") : "var(--ms-accent-border)",
          transition: "background .35s",
        }}
      />
    ))}
  </div>
);

export default { Btn, Card, Tag, ProgressBar };
