import React from 'react';

const BottomNav = ({ active, onChange }) => {
  const tabs = [
    { id: "home", icon: "⌂", label: "Home" },
    { id: "programs", icon: "◧", label: "Programs" },
    { id: "progress", icon: "◫", label: "Progress" },
    { id: "profile", icon: "◯", label: "Profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        background: "#fff",
        borderTop: "1px solid #C4D8CB",
        display: "flex",
        zIndex: 50,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: "11px 0 9px",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
            color: active === t.id ? "#7A9E87" : "#9BA8A0",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            transition: "color .2s",
          }}
        >
          <span style={{ fontSize: "19px", lineHeight: 1 }}>{t.icon}</span>
          <span style={{ fontSize: "10px", fontWeight: active === t.id ? 700 : 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.label}</span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#7A9E87" }} />}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
