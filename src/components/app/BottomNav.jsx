import React from 'react';

const BottomNav = ({ active, onChange }) => {
  const tabs = [
    { id: "home", icon: "⌂", label: "Home", pastel: "#E6F3EC", tone: "#4C8D6F", glow: "#A6D7BF" },
    { id: "programs", icon: "◧", label: "Programs", pastel: "#F3EDE1", tone: "#A17849", glow: "#E3BD85" },
    { id: "progress", icon: "◫", label: "Progress", pastel: "#E7ECF8", tone: "#5C75A6", glow: "#A9BEEA" },
    { id: "profile", icon: "◯", label: "Profile", pastel: "#F3E7F6", tone: "#85609D", glow: "#C7A2DE" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: "100%",
        maxWidth: 480,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,244,240,0.98) 100%)",
        borderTop: "1px solid rgba(122,158,135,0.2)",
        boxShadow: "0 -12px 30px rgba(44,53,48,0.08)",
        display: "flex",
        alignItems: "stretch",
        padding: "6px 8px calc(8px + env(safe-area-inset-bottom, 0px))",
        gap: "6px",
        zIndex: 50,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 58,
            padding: "8px 6px 7px",
            background: active === t.id
              ? `linear-gradient(160deg, rgba(255,255,255,0.95) 0%, ${t.pastel} 100%)`
              : `linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.56) 100%)`,
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3px",
            color: active === t.id ? t.tone : "#9BA8A0",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            transition: "color .2s, transform .2s, box-shadow .25s",
            borderRadius: "14px",
            boxShadow: active === t.id
              ? `0 8px 16px ${t.tone}2a, 0 0 16px ${t.glow}4a, inset 0 0 0 1px ${t.tone}30`
              : "0 4px 10px rgba(44,53,48,0.06), inset 0 0 0 1px rgba(122,158,135,0.12)",
            position: "relative",
            overflow: "hidden",
            transform: active === t.id ? "translateY(-1px)" : "translateY(0)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-22%",
              borderRadius: "20px",
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 220deg, ${t.glow}cc 284deg, transparent 360deg)`,
              opacity: active === t.id ? 0.88 : 0.34,
              animation: "navNeonOrbit 4.5s linear infinite",
              pointerEvents: "none",
              filter: "blur(0.2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 1,
              borderRadius: "13px",
              background: active === t.id
                ? `linear-gradient(160deg, rgba(255,255,255,0.88) 0%, ${t.pastel}f0 100%)`
                : "linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(250,250,248,0.72) 100%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: "15px",
              lineHeight: 1,
              width: 24,
              height: 24,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: active === t.id ? t.pastel : "transparent",
              border: active === t.id ? `1px solid ${t.tone}33` : "1px solid transparent",
              zIndex: 1,
            }}
          >
            {t.icon}
          </span>
          <span style={{ fontSize: "10px", fontWeight: active === t.id ? 700 : 500, letterSpacing: "0.04em", textTransform: "uppercase", zIndex: 1 }}>{t.label}</span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: t.tone, boxShadow: `0 0 10px ${t.glow}`, zIndex: 1 }} />}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
