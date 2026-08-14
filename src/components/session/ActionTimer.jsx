import React, { useState, useEffect, useRef } from 'react';
import { Btn } from '@/components/ui';

const ActionTimer = ({
  seconds,
  onComplete,
  devMode = false,
  accentColor = 'var(--ms-accent, #7A9E87)',
  onStart,
  centerContent = false,
  autoStart = false,
  allowFinishEarly = false,
  minFinishEarlyRatio = 0.4,
  onFinishEarly,
  onTick,
}) => {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const [fin, setFin] = useState(false);
  const [finishedEarly, setFinishedEarly] = useState(false);
  const [finishedEarlyAtLeft, setFinishedEarlyAtLeft] = useState(null);
  const [tickMuted, setTickMuted] = useState(() => {
    try {
      return localStorage.getItem('ms_timer_tick_muted') === '1';
    } catch {
      return false;
    }
  });
  const ref = useRef(null);
  const audioCtxRef = useRef(null);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    // Reset timer state when a different duration is mounted.
    setLeft(seconds);
    setRunning(false);
    setFin(false);
    setFinishedEarly(false);
    setFinishedEarlyAtLeft(null);
    autoStartedRef.current = false;
  }, [seconds]);

  useEffect(() => {
    try {
      localStorage.setItem('ms_timer_tick_muted', tickMuted ? '1' : '0');
    } catch {
      // no-op
    }
  }, [tickMuted]);

  const getAudioContext = () => {
    if (typeof window === "undefined") return null;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      return ctx;
    } catch {
      return null;
    }
  };

  const playTick = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(1320, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // no-op
    }
  };

  const playCompletionBeeps = () => {
    const ctx = getAudioContext();
    if (!ctx) {
      if (navigator?.vibrate) navigator.vibrate([120, 120, 120, 120, 120]);
      return;
    }

    try {
      const now = ctx.currentTime;
      const burst = (start, freq, gainVal, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(gainVal, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.01);
      };

      burst(now, 840, 0.085, 0.14);
      burst(now + 0.24, 920, 0.085, 0.14);
      burst(now + 0.48, 1000, 0.09, 0.16);

      if (navigator?.vibrate) {
        navigator.vibrate([120, 120, 120, 120, 120]);
      }
    } catch {
      if (navigator?.vibrate) navigator.vibrate([120, 120, 120, 120, 120]);
    }
  };

  useEffect(() => {
    if (typeof onTick === 'function') {
      onTick({
        leftSeconds: left,
        totalSeconds: seconds,
        elapsedSeconds: Math.max(0, seconds - left),
        running,
        finishedEarly,
      });
    }
  }, [left, seconds, running, finishedEarly, onTick]);

  useEffect(() => {
    if (running && left > 0) {
      if (!tickMuted) {
        playTick();
      }
      ref.current = setTimeout(() => setLeft((l) => l - 1), 1000);
    } else if (running && left === 0) {
      setRunning(false);
      setFin(true);
      playCompletionBeeps();
      // Auto-complete after a brief celebration pause
      setTimeout(() => {
        onComplete({
          totalSeconds: seconds,
          elapsedSeconds: seconds,
          finishedEarly,
          finishedEarlyAtLeft,
          taskDoneElapsedSeconds:
            finishedEarly && Number.isFinite(finishedEarlyAtLeft)
              ? Math.max(0, seconds - finishedEarlyAtLeft)
              : seconds,
        });
      }, 1500);
    }
    return () => clearTimeout(ref.current);
  }, [running, left, onComplete, tickMuted, seconds, finishedEarly, finishedEarlyAtLeft]);

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || running || fin || left !== seconds) {
      return;
    }

    autoStartedRef.current = true;
    getAudioContext();
    setRunning(true);
  }, [autoStart, running, fin, left, seconds]);

  const R = 36;
  const circ = 2 * Math.PI * R;
  const pct = 1 - left / seconds;
  const elapsed = Math.max(0, seconds - left);
  const minEarlyMarkSeconds = Math.ceil(seconds * minFinishEarlyRatio);
  const canMarkFinishedEarly = allowFinishEarly && running && !fin && !finishedEarly && elapsed >= minEarlyMarkSeconds && left > 0;
  const mm = Math.floor(left / 60);
  const ss = left % 60;
  const titleSize = centerContent ? "15px" : "13px";
  const bodySize = centerContent ? "12px" : "11px";
  const accentBg = 'var(--ms-accent-bg, #E8F0EB)';
  const accentSoft = 'var(--ms-accent-soft, #C4D8CB)';
  const accentContrast = 'var(--ms-accent-contrast, #5A7A67)';

  const handleMarkFinishedEarly = () => {
    if (!canMarkFinishedEarly) {
      return;
    }

    setFinishedEarly(true);
    setFinishedEarlyAtLeft(left);
    if (typeof onFinishEarly === 'function') {
      onFinishEarly({
        totalSeconds: seconds,
        elapsedSeconds: elapsed,
        remainingSeconds: left,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: centerContent ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        textAlign: centerContent ? "center" : "left",
        gap: centerContent ? "10px" : "14px",
        flexWrap: "wrap",
        padding: centerContent ? "18px 16px" : "14px 16px",
        background: accentBg,
        borderRadius: "16px",
        border: `1px solid ${accentSoft}`,
        position: "relative",
      }}
    >
      {!fin && (
        <button
          onClick={() => setTickMuted((value) => !value)}
          aria-label={tickMuted ? "Unmute tick sound" : "Mute tick sound"}
          title={tickMuted ? "Unmute tick sound" : "Mute tick sound"}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            border: `1px solid ${accentSoft}`,
            background: "#F7FCF9",
            color: accentContrast,
            fontSize: "13px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {tickMuted ? "🔇" : "🔊"}
        </button>
      )}

      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r={R} fill="none" stroke={accentSoft} strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke={accentColor}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <span style={{ fontSize: centerContent ? "14px" : "12px", fontWeight: 700, color: accentColor }}>
            {mm}:{ss.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
      <div style={{ flex: centerContent ? "0 1 auto" : 1, minWidth: centerContent ? 0 : 170, width: centerContent ? "100%" : "auto", display: "flex", flexDirection: "column", alignItems: centerContent ? "center" : "flex-start" }}>
        {fin ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: centerContent ? "18px" : "16px", fontWeight: 700, color: accentColor, marginBottom: "4px" }}>✨ Complete!</p>
            <p style={{ fontSize: bodySize, color: accentContrast }}>Great focus. Moving to next step...</p>
          </div>
        ) : running ? (
          <>
            <p style={{ fontSize: titleSize, fontWeight: 700, color: accentContrast }}>
              {finishedEarly ? "Reflection mode active" : "Timer running…"}
            </p>
            <p style={{ fontSize: bodySize, color: "#7E8D85", marginTop: "2px" }}>
              {finishedEarly
                ? "Use the remaining time to capture your insights."
                : "Stay with it. Don't switch tasks."}
            </p>
            {canMarkFinishedEarly && (
              <Btn onClick={handleMarkFinishedEarly} variant="soft" style={{ marginTop: "8px", padding: "8px 14px", fontSize: "12px" }}>
                Finished Task → Reflect
              </Btn>
            )}
            {finishedEarly && (
              <p style={{ fontSize: "11px", color: accentContrast, marginTop: "8px", fontWeight: 600 }}>
                Task marked complete early. Timer continues for reflection.
              </p>
            )}
            <Btn onClick={() => setRunning(false)} variant="ghost" style={{ marginTop: "8px", padding: "8px 14px", fontSize: "12px" }}>
              Pause
            </Btn>
            {devMode && (
              <Btn onClick={onComplete} variant="ghost" style={{ marginTop: "6px", padding: "8px 14px", fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>⚡ Skip (dev)</Btn>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize: titleSize, fontWeight: 700, color: "#2C3530" }}>
              {left < seconds ? "Paused" : `${Math.floor(seconds / 60)} min focus timer`}
            </p>
            <Btn
              onClick={() => {
                getAudioContext();
                if (!running && typeof onStart === "function") {
                  onStart();
                }
                setRunning(true);
              }}
              variant="soft"
              style={{ marginTop: "8px", padding: "10px 18px", fontSize: "13px" }}
            >
              {left < seconds ? "Resume" : "Start Timer"} →
            </Btn>
            {devMode && (
              <Btn onClick={onComplete} variant="ghost" style={{ marginTop: "6px", padding: "8px 14px", fontSize: "12px", color: "#E8941A", borderColor: "#E8941A" }}>⚡ Skip (dev)</Btn>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionTimer;
