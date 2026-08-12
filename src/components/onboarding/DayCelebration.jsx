import React, { useEffect, useRef } from 'react';
import { Btn, Tag, CheckIcon } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';

const DayCelebration = ({ day, program, onContinue, totalDays = 3 }) => {
  const prog = PROGRAMS.find((p) => p.id === program);
  const audioCtxRef = useRef(null);
  const confettiPcs = Array.from({ length: 12 }, (_, i) => ({
    x: 10 + i * 7.5,
    color: [prog?.color, "#7A9E87", "#B5956A", "#7B9CB3"][i % 4],
    delay: i * 0.08,
  }));
  const sparklePcs = Array.from({ length: 10 }, (_, i) => ({
    x: 8 + i * 9,
    y: 12 + (i % 3) * 18,
    delay: i * 0.12,
  }));

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      return ctx;
    } catch {
      return null;
    }
  };

  const playVictorySound = () => {
    const ctx = getAudioContext();
    if (!ctx) {
      if (navigator?.vibrate) navigator.vibrate([90, 80, 90, 80, 120]);
      return;
    }

    try {
      const now = ctx.currentTime;
      const burst = (start, freqStart, freqEnd, gainVal, duration, type = 'triangle') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, start);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.01);
      };

      burst(now, 520, 760, 0.095, 0.22, 'sine');
      burst(now + 0.18, 760, 980, 0.1, 0.2, 'triangle');
      burst(now + 0.36, 980, 1260, 0.11, 0.24, 'triangle');
      burst(now + 0.58, 680, 1120, 0.09, 0.28, 'sine');

      if (navigator?.vibrate) {
        navigator.vibrate([90, 80, 90, 80, 120]);
      }
    } catch {
      if (navigator?.vibrate) navigator.vibrate([90, 80, 90, 80, 120]);
    }
  };

  useEffect(() => {
    playVictorySound();
  }, []);

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        inset: 0,
        background: "#F7F6F2",
        zIndex: 150,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        textAlign: "center",
      }}
    >
      {/* Confetti particles */}
      <div style={{ position: "absolute", top: 80, left: 0, right: 0, height: 120, overflow: "hidden", pointerEvents: "none" }}>
        {confettiPcs.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: 0,
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color,
              animation: `confetti 1.2s ease-out ${p.delay}s forwards`,
            }}
          />
        ))}
      </div>

      {/* Party poppers */}
      <div style={{ position: "absolute", top: 116, left: "10%", fontSize: "28px", animation: "partyPop 0.9s ease-out 0s forwards", pointerEvents: "none" }}>🎉</div>
      <div style={{ position: "absolute", top: 116, right: "10%", fontSize: "28px", animation: "partyPop 0.9s ease-out 0.1s forwards", pointerEvents: "none" }}>🎉</div>

      {/* Sparkles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {sparklePcs.map((s, i) => (
          <div
            key={`sparkle-${i}`}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              fontSize: "18px",
              opacity: 0,
              animation: `sparkleTwinkle 1.2s ease-out ${s.delay}s forwards`,
            }}
          >
            ✨
          </div>
        ))}
      </div>

      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#7A9E87",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          animation: "celebrate .6s ease-out",
          boxShadow: "0 8px 32px rgba(122,158,135,0.35)",
        }}
      >
        <CheckIcon size={36} />
      </div>
      <Tag label={`Day ${day} Complete`} color={prog?.color || "#7A9E87"} />
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "34px",
          fontWeight: 500,
          color: "#2C3530",
          margin: "16px 0 12px",
          lineHeight: 1.25,
        }}
      >
        {day >= totalDays ? "You did it." : "One more down."}
      </h2>
      <p style={{ fontSize: "15px", color: "#5E6B64", lineHeight: 1.7, maxWidth: 300, marginBottom: "36px" }}>
        {day === 1
          ? "The hardest session is always the first one. You showed up. That's what matters."
          : day === 2
          ? "Two days of deliberate practice. You're building something real."
          : `${totalDays} days complete. Your pattern report is ready.`}
      </p>
      {day < totalDays && (
        <div style={{ padding: "16px 20px", background: "#E8F0EB", borderRadius: "16px", marginBottom: "28px", textAlign: "left", maxWidth: 300, width: "100%" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#7A9E87", marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Up Next</p>
          <p style={{ fontSize: "14px", color: "#5E6B64" }}>Day {day + 1} — same structure, new tasks. Sessions unlock on your schedule.</p>
        </div>
      )}
      <Btn onClick={onContinue} style={{ width: "100%", maxWidth: 300, padding: "16px" }}>
        {day >= totalDays ? "View My Report →" : `Start Day ${day + 1} →`}
      </Btn>
    </div>
  );
};

export default DayCelebration;
