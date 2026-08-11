import React from 'react';
import { parseT, fmtT, fmtAMPM } from '@/utils/helpers';

export const InputField = ({ label, type = "text", value, onChange, placeholder, error }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 600,
        color: "#5E6B64",
        marginBottom: "7px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "13px 16px",
        borderRadius: "14px",
        border: `1.5px solid ${error ? "#A67B7B" : "var(--ms-accent-border)"}`,
        background: "#fff",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: "15px",
        color: "#2C3530",
        transition: "border-color .2s",
      }}
    />
    {error && <p style={{ fontSize: "12px", color: "#A67B7B", marginTop: "5px" }}>{error}</p>}
  </div>
);

export const TimePicker = ({ value, onChange, label }) => {
  const { h, m } = parseT(value);
  const selStyle = {
    background: "#F0EFE9",
    border: "1.5px solid var(--ms-accent-border)",
    borderRadius: "14px",
    padding: "12px 36px 12px 14px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "16px",
    fontWeight: 600,
    color: "#2C3530",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239BA8A0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "calc(100% - 12px) center",
    width: "100%",
  };

  return (
    <div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#5E6B64", marginBottom: "8px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <select value={h} onChange={(e) => onChange(fmtT(+e.target.value, m))} style={selStyle}>
          {Array.from({ length: 24 }, (_, i) => i).map((hr) => (
            <option key={hr} value={hr}>
              {hr.toString().padStart(2, "0")} {hr < 12 ? "AM" : "PM"}
            </option>
          ))}
        </select>
        <span style={{ color: "#9BA8A0", fontWeight: 700, fontSize: "20px", flexShrink: 0 }}>:</span>
        <select value={m} onChange={(e) => onChange(fmtT(h, +e.target.value))} style={selStyle}>
          {[0, 15, 30, 45].map((mn) => (
            <option key={mn} value={mn}>
              {mn.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "6px" }}>{fmtAMPM(h, m)}</p>
    </div>
  );
};

export default { InputField, TimePicker };
