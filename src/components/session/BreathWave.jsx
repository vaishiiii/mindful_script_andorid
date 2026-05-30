import React from 'react';

const BreathWave = ({ phase, phaseName, timeTotal, timeLeft, color }) => {
  const isInhale = phaseName === "Inhale";
  const isHold = phaseName === "Hold";
  const progress = (timeTotal - timeLeft) / timeTotal;

  const barH = isInhale ? progress * 100 : isHold ? 100 : (1 - progress) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      {/* Wave container */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `${color}0D`,
          border: `1.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Rising/falling fill */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${barH}%`,
            background: `${color}18`,
            transition: `height ${isHold ? 0.1 : 1}s ${isInhale ? "ease-in" : isHold ? "linear" : "ease-out"}`,
          }}
        />
        {/* Subtle wave line */}
        <svg
          style={{ position: "absolute", bottom: `${barH}%`, left: 0, right: 0, marginBottom: -12 }}
          width="200"
          height="24"
          viewBox="0 0 200 24"
          preserveAspectRatio="none"
        >
          <path
            d="M0,12 Q25,2 50,12 Q75,22 100,12 Q125,2 150,12 Q175,22 200,12"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
        {/* Center text */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "40px", fontWeight: 300, color, lineHeight: 1, marginBottom: "4px" }}>
            {timeLeft}
          </p>
          <p style={{ fontSize: "13px", color: "#9BA8A0", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{phaseName}</p>
        </div>
      </div>
      {/* Arrow indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: isHold ? 0.3 : 1, transition: "opacity .3s" }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ transform: isInhale ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .4s ease" }}
        >
          <path d="M8 3L8 13M8 13L4 9M8 13L12 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: "12px", color: "#9BA8A0", fontWeight: 500 }}>
          {isInhale ? "Breathing in" : isHold ? "Holding" : "Breathing out"}
        </span>
      </div>
    </div>
  );
};

export default BreathWave;
