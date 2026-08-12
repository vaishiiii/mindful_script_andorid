import React, { useState, useEffect, useRef } from 'react';
import { Btn, Tag } from '@/components/ui';
import { BREATH_PATTERNS } from '@/data/sessions';
import { PROG_COLORS } from '@/styles/designSystem';
import BreathWave from './BreathWave';

const BreathEngine = ({ program, sessionType, onComplete, devMode = false, onActiveChange }) => {
  // Get time-of-day specific breath pattern: BREATH_PATTERNS[program][sessionType]
  const programPatterns = BREATH_PATTERNS[program] || BREATH_PATTERNS.calm;
  const pat = programPatterns[sessionType] || programPatterns.morning;
  const times = pat.times;
  const totalCycles = sessionType === "morning" ? 4 : sessionType === "midday" ? 3 : 5;

  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [sec, setSec] = useState(times[0]);
  const [started, setStarted] = useState(false);
  const [beginShield, setBeginShield] = useState(false);
  const [done, setDone] = useState(false);
  const [doneReveal, setDoneReveal] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!started || done) return;
    if (sec > 0) {
      ref.current = setTimeout(() => setSec((s) => s - 1), 1000);
    } else {
      const np = (phase + 1) % pat.phases.length;
      if (np === 0) {
        const nc = cycle + 1;
        if (nc >= totalCycles) {
          setDone(true);
          return;
        }
        setCycle(nc);
      }
      setPhase(np);
      setSec(times[np]);
    }
    return () => clearTimeout(ref.current);
  }, [started, done, sec, phase, cycle, totalCycles, pat.phases.length, times]);

  useEffect(() => {
    if (typeof onActiveChange !== 'function') return;
    onActiveChange(started && !done);
  }, [started, done, onActiveChange]);

  useEffect(() => {
    if (!done) {
      setDoneReveal(false);
      return;
    }

    const revealId = setTimeout(() => setDoneReveal(true), 1500);
    return () => clearTimeout(revealId);
  }, [done]);

  const c = PROG_COLORS[program] || "#7A9E87";
  const currentPhase = pat.phases[phase];
  const immersiveActive = !done;

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

  const phaseA = currentPhase === "Inhale"
    ? mix(c, '#52E3C2', 0.62)
    : currentPhase === "Hold"
      ? mix(c, '#FFD166', 0.58)
      : mix(c, '#FF8AA7', 0.56);
  const phaseB = currentPhase === "Inhale"
    ? mix(c, '#66A6FF', 0.5)
    : currentPhase === "Hold"
      ? mix(c, '#F4A261', 0.52)
      : mix(c, '#A78BFA', 0.45);
  const phaseC = mix(phaseA, '#152619', 0.74);
  const baseA = mix(c, '#9FD8C4', 0.24);
  const baseB = mix(c, '#0F1D18', 0.62);

  const handleBegin = () => {
    if (started || done) return;

    setBeginShield(true);
    // Double-rAF ensures the next visual state is committed before heavy animations kick in.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStarted(true);
      });
    });

    setTimeout(() => setBeginShield(false), 220);
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: immersiveActive ? "18px 14px 20px" : "8px 0",
        margin: immersiveActive ? "-4px 0 10px" : 0,
        borderRadius: immersiveActive ? "30px" : 0,
        minHeight: immersiveActive ? "calc(100vh - 18px)" : 0,
        position: "relative",
        overflow: "hidden",
        background: immersiveActive
          ? `radial-gradient(120% 100% at 50% 0%, ${toRgba(baseA, 0.3)} 0%, ${toRgba(baseB, 0.84)} 100%)`
          : "transparent",
        boxShadow: immersiveActive
          ? `inset 0 0 0 1px ${toRgba(baseA, 0.2)}, 0 14px 24px ${toRgba('#0F1D18', 0.24)}`
          : "none",
        transition: "background 420ms ease, box-shadow 420ms ease",
        willChange: "background, box-shadow",
      }}
    >
      {immersiveActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", textAlign: "left" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 700, color: c, letterSpacing: "0.08em", textTransform: "uppercase" }}>{pat.label}</p>
          <p style={{ fontSize: "12px", color: "#9BA8A0", marginTop: "2px", lineHeight: 1.5, maxWidth: 230 }}>{pat.desc}</p>
        </div>
        <Tag label={`${totalCycles} cycles`} color={c} />
      </div>

      {/* Wave animation */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", position: "relative" }}>
        {done ? (
          <div
            className="fade-in"
            style={{
              width: 232,
              height: 232,
              maxWidth: "78vw",
              maxHeight: "78vw",
              minWidth: 190,
              minHeight: 190,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 22%, ${c}44 0%, ${c}22 54%, ${c}10 100%)`,
              border: `1.5px solid ${c}55`,
              boxShadow: `0 0 0 1px ${c}33 inset, 0 0 34px ${c}44, 0 0 80px ${c}28`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 0,
                background: `linear-gradient(180deg, ${c}55 0%, ${c}88 30%, ${c}BB 72%, ${c}D6 100%)`,
                animation: "breathDoneFill 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
                boxShadow: `0 -14px 30px ${c}52 inset, 0 -24px 34px rgba(210,255,243,0.3), 0 0 28px ${c}55`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(240,255,249,0.5) 48%, rgba(255,255,255,0) 100%)",
                  animation: "breathDoneShimmer 1.8s ease-in-out infinite",
                }}
              />

              <svg
                width="300"
                height="34"
                viewBox="0 0 300 34"
                preserveAspectRatio="none"
                style={{ position: "absolute", top: -16, left: -34, animation: "breathWaveShift 2.6s linear infinite" }}
              >
                <path
                  d="M0,18 Q28,6 56,18 Q84,30 112,18 Q140,6 168,18 Q196,30 224,18 Q252,6 280,18 Q290,22 300,18"
                  fill="none"
                  stroke="rgba(234, 253, 247, 0.92)"
                  strokeWidth="2.3"
                />
              </svg>

              <svg
                width="340"
                height="30"
                viewBox="0 0 340 30"
                preserveAspectRatio="none"
                style={{ position: "absolute", top: -12, left: -46, opacity: 0.72, animation: "breathDoneWaveDrift 3.2s linear infinite" }}
              >
                <path
                  d="M0,16 Q20,5 40,16 Q60,27 80,16 Q100,5 120,16 Q140,27 160,16 Q180,5 200,16 Q220,27 240,16 Q260,5 280,16 Q300,27 320,16 Q330,12 340,16"
                  fill="none"
                  stroke="rgba(208, 255, 239, 0.72)"
                  strokeWidth="1.6"
                />
              </svg>

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: -8,
                  height: 14,
                  background: "radial-gradient(70% 120% at 50% 50%, rgba(224,255,246,0.75) 0%, rgba(224,255,246,0.34) 50%, rgba(224,255,246,0) 100%)",
                  filter: "blur(2px)",
                  animation: "breathDoneWaveGlow 1.4s ease-in-out infinite",
                }}
              />

              {Array.from({ length: 12 }).map((_, idx) => {
                const left = `${8 + idx * 7.4}%`;
                const size = 4 + (idx % 3);
                const delay = `${idx * 0.16}s`;
                const duration = `${1.5 + (idx % 4) * 0.35}s`;
                return (
                  <span
                    key={`done-spark-${idx}`}
                    style={{
                      position: "absolute",
                      left,
                      bottom: 6,
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      background: "rgba(236,255,249,0.95)",
                      boxShadow: "0 0 10px rgba(220,255,244,0.95), 0 0 22px rgba(195,255,233,0.52)",
                      opacity: 0,
                      animation: `breathDoneSparkleRise ${duration} ease-in-out ${delay} infinite`,
                    }}
                  />
                );
              })}
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                opacity: doneReveal ? 1 : 0,
                transform: doneReveal ? "translateY(0)" : "translateY(8px)",
                transition: "all .45s ease",
                textAlign: "center",
                textShadow: "0 0 20px rgba(255,255,255,0.35)",
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "8px", display: "block" }}>◎</span>
              <p style={{ fontSize: "12px", color: "#F3FFFB", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Complete</p>
            </div>

            {!doneReveal && (
              <p style={{ position: "relative", zIndex: 2, marginTop: "118px", fontSize: "11px", color: "#D3ECE3", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Settling...
              </p>
            )}
          </div>
        ) : (
          <BreathWave phase={phase} phaseName={currentPhase} timeTotal={times[phase]} timeLeft={sec} color={c} active={started} />
        )}
        {!done && beginShield && (
          <div
            style={{
              position: "absolute",
              inset: "8% 10%",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${toRgba(phaseA, 0.32)} 0%, ${toRgba(phaseB, 0.2)} 56%, rgba(255,255,255,0) 100%)`,
              backdropFilter: "blur(2px)",
              opacity: 1,
              pointerEvents: "none",
              animation: "breathBeginShieldFade 220ms ease-out forwards",
              zIndex: 8,
            }}
          />
        )}
      </div>

      {/* Phase pills */}
      {!done && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
          {pat.phases.map((p, i) => (
            <div
              key={i}
              style={{
                padding: "4px 12px",
                borderRadius: "9999px",
                background: started && phase === i ? `linear-gradient(120deg, ${c}, ${c}CC)` : `${c}18`,
                color: started && phase === i ? "#fff" : "#9BA8A0",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                transition: "background .42s ease, color .42s ease, box-shadow .42s ease",
                boxShadow: started && phase === i ? `0 0 16px ${c}55` : "none",
              }}
            >
              {p} {times[i]}s
            </div>
          ))}
        </div>
      )}

      {/* Cycle dots */}
      {started && !done && !beginShield && (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginBottom: "20px" }}>
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: i < cycle ? c : `${c}30`,
                transition: "background .3s",
              }}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {done ? (
        <div className="fade-in">
          {doneReveal ? (
            <>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "17px", color: "#2C3530", marginBottom: "18px" }}>
                Breathwork complete. Well done.
              </p>
              <Btn onClick={onComplete}>Continue to Task →</Btn>
            </>
          ) : (
            <p style={{ fontSize: "12px", color: "#9BA8A0", letterSpacing: "0.03em" }}>One mindful moment...</p>
          )}
        </div>
      ) : !started ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Btn
            onClick={handleBegin}
            style={{ boxShadow: `0 0 20px ${toRgba(phaseA, 0.24)}` }}
          >
            Begin Breathwork
          </Btn>
          {devMode && (
            <Btn onClick={onComplete} variant="ghost" style={{ fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>
              ⚡ Skip (dev)
            </Btn>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <p style={{ fontSize: "12px", color: "#9BA8A0" }}>Keep following the breath rhythm until complete.</p>
          {devMode && (
            <Btn onClick={onComplete} variant="ghost" style={{ fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>
              ⚡ Skip (dev)
            </Btn>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default BreathEngine;
