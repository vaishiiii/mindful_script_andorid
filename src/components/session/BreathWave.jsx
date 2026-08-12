import React from 'react';

const BreathWave = ({ phase, phaseName, timeTotal, timeLeft, color, active = true }) => {
  const isInhale = phaseName === "Inhale";
  const isHold = phaseName === "Hold";
  const progress = (timeTotal - timeLeft) / timeTotal;

  const barH = isInhale ? progress * 100 : isHold ? 100 : (1 - progress) * 100;
  const pulseDuration = `${Math.max(timeTotal, 3)}s`;

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') return null;
    const normalized = hex.replace('#', '').trim();
    const value = normalized.length === 3
      ? normalized.split('').map((ch) => ch + ch).join('')
      : normalized;

    if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;

    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  };

  const toRgba = (hex, alpha) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(122, 158, 135, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const mix = (from, to, ratio) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    if (!a || !b) return from;
    const m = Math.max(0, Math.min(1, ratio));
    const r = Math.round(a.r + (b.r - a.r) * m);
    const g = Math.round(a.g + (b.g - a.g) * m);
    const bl = Math.round(a.b + (b.b - a.b) * m);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
  };

  const phasePrimary = isInhale
    ? mix(color, '#39D7C3', 0.6)
    : isHold
      ? mix(color, '#FFD166', 0.58)
      : mix(color, '#FF8A65', 0.6);

  const phaseSecondary = isInhale
    ? mix(color, '#6AA8FF', 0.45)
    : isHold
      ? mix(color, '#F48C06', 0.42)
      : mix(color, '#FF4D6D', 0.48);

  const deepTone = mix(phasePrimary, '#16221D', 0.72);
  const coreScale = active
    ? (isInhale ? 1 + progress * 0.18 : isHold ? 1.18 : 1.18 - progress * 0.18)
    : 1;
  const fillScale = Math.max(0, Math.min(1, barH / 100));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
      <div
        style={{
          width: 232,
          height: 232,
          maxWidth: "78vw",
          maxHeight: "78vw",
          minWidth: 190,
          minHeight: 190,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 22%, ${toRgba(phaseSecondary, 0.42)} 0%, ${toRgba(phasePrimary, 0.24)} 45%, ${toRgba(deepTone, 0.24)} 100%)`,
          border: `1px solid ${toRgba(phasePrimary, 0.32)}`,
          boxShadow: `0 0 0 1px ${toRgba(phaseSecondary, 0.22)} inset, 0 0 18px ${toRgba(phasePrimary, 0.24)}`,
          transition: "background 620ms cubic-bezier(0.22, 1, 0.36, 1), border-color 620ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 620ms cubic-bezier(0.22, 1, 0.36, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          willChange: "background, border-color, box-shadow",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-14%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${toRgba(phasePrimary, 0.28)} 0%, ${toRgba(phaseSecondary, 0.14)} 40%, rgba(255,255,255,0) 72%)`,
            filter: "blur(4px)",
            animation: "none",
            willChange: "transform, opacity",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "9%",
            borderRadius: "50%",
            border: `1px solid ${toRgba(phaseSecondary, 0.55)}`,
            animation: "none",
            opacity: 0.78,
            transition: "border-color 500ms ease",
            willChange: "transform, opacity",
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "3%",
            borderRadius: "50%",
            border: `1px solid ${toRgba(phasePrimary, 0.4)}`,
            animation: "none",
            opacity: 0.62,
            transition: "border-color 500ms ease",
            willChange: "transform, opacity",
            zIndex: 1,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(180deg, ${toRgba(phaseSecondary, 0.22)} 0%, ${toRgba(phasePrimary, 0.55)} 65%, ${toRgba(deepTone, 0.62)} 100%)`,
            transform: `scaleY(${fillScale})`,
            transformOrigin: "50% 100%",
            transition: active ? `transform ${isHold ? 0.16 : 1}s ${isInhale ? "ease-in" : isHold ? "linear" : "ease-out"}, background 500ms ease` : "none",
            boxShadow: `0 -8px 28px ${toRgba(phaseSecondary, 0.3)} inset`,
            willChange: "transform",
            zIndex: 2,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: `${barH}%`,
            left: -40,
            width: "calc(100% + 80px)",
            marginBottom: -13,
            animation: "none",
            transition: "bottom 650ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform, bottom",
            zIndex: 3,
          }}
        >
        <svg
          width="300"
          height="24"
          viewBox="0 0 300 24"
          preserveAspectRatio="none"
        >
          <path
            d="M0,12 Q25,2 50,12 Q75,22 100,12 Q125,2 150,12 Q175,22 200,12 Q225,2 250,12 Q275,22 300,12"
            fill="none"
            stroke={phaseSecondary}
            strokeWidth="2"
            strokeOpacity="0.72"
          />
        </svg>
        </div>

        <div
          style={{
            position: "absolute",
            inset: "19%",
            borderRadius: "50%",
            background: `radial-gradient(circle at 38% 24%, ${toRgba('#FFFFFF', 0.86)} 0%, ${toRgba(phasePrimary, 0.2)} 46%, ${toRgba(deepTone, 0.2)} 100%)`,
            transform: `scale(${coreScale})`,
            transition: active ? `transform ${isHold ? 0.2 : 1}s ${isInhale ? 'ease-in-out' : 'ease-out'}, background 520ms ease, box-shadow 520ms ease` : "none",
            boxShadow: `0 0 0 1px ${toRgba('#FFFFFF', 0.5)} inset, 0 10px 22px ${toRgba(deepTone, 0.24)}`,
            willChange: "transform",
            zIndex: 5,
          }}
        />

        <div style={{ position: "relative", zIndex: 6, textAlign: "center", textShadow: `0 0 20px ${toRgba(phasePrimary, 0.35)}` }}>
          <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "42px", fontWeight: 300, color: "#10211A", lineHeight: 1, marginBottom: "5px" }}>
            {timeLeft}
          </p>
          <p style={{ fontSize: "12px", color: toRgba(deepTone, 0.9), textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{phaseName}</p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          opacity: isHold ? 0.42 : 1,
          transition: "opacity .3s",
          padding: "6px 10px",
          borderRadius: "9999px",
          background: toRgba(phasePrimary, 0.13),
          border: `1px solid ${toRgba(phaseSecondary, 0.26)}`,
          boxShadow: `0 6px 14px ${toRgba(phaseSecondary, 0.1)}`,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ transform: isInhale ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .4s ease" }}
        >
          <path d="M8 3L8 13M8 13L4 9M8 13L12 9" stroke={phaseSecondary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: "12px", color: "#5E6B64", fontWeight: 600 }}>
          {isInhale ? "Breathing in" : isHold ? "Holding" : "Breathing out"}
        </span>
      </div>
    </div>
  );
};

export default BreathWave;
