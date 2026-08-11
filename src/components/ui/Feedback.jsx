import React, { useEffect } from 'react';
import { Btn } from './Buttons';

export const Toast = ({ msg, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="slide-down"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 200,
        maxWidth: 420,
        width: "calc(100% - 32px)",
        background: "#2C3530",
        borderRadius: "16px",
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(44,53,48,0.25)",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--ms-accent)",
          flexShrink: 0,
          marginTop: "5px",
        }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "2px" }}>{msg.title}</p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{msg.body}</p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.4)",
          fontSize: "16px",
          lineHeight: 1,
          padding: "0 0 0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
};

export const ConfirmDialog = ({ title, body, confirmLabel = "Confirm", onConfirm, onCancel, danger }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(44,53,48,0.55)",
      zIndex: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      backdropFilter: "blur(4px)",
    }}
  >
    <div
      className="pop"
      style={{
        background: "#fff",
        borderRadius: "24px",
        padding: "28px 24px",
        maxWidth: 360,
        width: "100%",
        boxShadow: "0 8px 32px rgba(44,53,48,0.12)",
      }}
    >
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "22px",
          fontWeight: 500,
          color: "#2C3530",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#5E6B64", lineHeight: 1.65, marginBottom: "24px" }}>{body}</p>
      <div style={{ display: "flex", gap: "10px" }}>
        <Btn onClick={onCancel} variant="ghost" style={{ flex: 1 }}>
          Cancel
        </Btn>
        <Btn onClick={onConfirm} variant={danger ? "danger" : "primary"} style={{ flex: 1 }}>
          {confirmLabel}
        </Btn>
      </div>
    </div>
  </div>
);

export default { Toast, ConfirmDialog };
