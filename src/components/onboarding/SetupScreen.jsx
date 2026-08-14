import React, { useState } from 'react';
import { Btn, Card, ProgressBar, TimePicker } from '@/components/ui';
import { computeUnlocks, fmtAMPM, parseT } from '@/utils/helpers';
import { NOTIF_MSGS } from '@/data/sessions';

const SetupScreen = ({ onNext }) => {
  const [timeMin, setTimeMin] = useState(30);
  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const accent = 'var(--ms-accent, #7A9E87)';
  const accentBg = 'var(--ms-accent-bg, #E8F0EB)';
  const accentSoft = 'var(--ms-accent-soft, #C4D8CB)';
  const accentContrast = 'var(--ms-accent-contrast, #5A7A67)';

  const unlocks = computeUnlocks(wake, sleep);
  const toAMPM = (t) => {
    const { h, m } = parseT(t);
    return fmtAMPM(h, m);
  };

  const notifSchedule = [
    { icon: "🌅", label: "Morning session", time: toAMPM(unlocks.morning), msg: NOTIF_MSGS.morning.body },
    { icon: "🌤", label: "Midday session", time: toAMPM(unlocks.midday), msg: NOTIF_MSGS.midday.body },
    { icon: "🌙", label: "Night session", time: toAMPM(unlocks.night), msg: NOTIF_MSGS.night.body },
  ];

  return (
    <div className="slide-up" style={{ minHeight: "100vh", padding: "48px 22px 44px", maxWidth: 480, margin: "0 auto" }}>
      <ProgressBar step={3} total={4} />
      <p style={{ fontSize: "12px", fontWeight: 600, color: accentContrast, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
        Step 3 of 4
      </p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: 500, marginBottom: "6px" }}>
        Build your daily rhythm
      </h2>
      <p style={{ fontSize: "14px", color: "#9BA8A0", marginBottom: "26px", lineHeight: 1.6 }}>
        Sessions unlock automatically at the right time. You'll also receive a notification for each one.
      </p>

      {/* Time commitment */}
      <div style={{ marginBottom: "26px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#5E6B64", marginBottom: "10px" }}>Daily time commitment</p>
        <div style={{ display: "flex", gap: "9px" }}>
          {[15, 30, 45].map((t) => (
            <button
              key={t}
              onClick={() => setTimeMin(t)}
              style={{
                flex: 1,
                padding: "14px 0",
                borderRadius: "16px",
                cursor: "pointer",
                background: timeMin === t ? accent : "#fff",
                color: timeMin === t ? "#fff" : "#2C3530",
                border: `1.5px solid ${timeMin === t ? accent : accentSoft}`,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                transition: "all .2s",
              }}
            >
              {t}
              <span style={{ fontSize: "11px", fontWeight: 400 }}> min</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time pickers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "22px" }}>
        <TimePicker value={wake} onChange={setWake} label="Wake up time" />
        <TimePicker value={sleep} onChange={setSleep} label="Sleep time" />
      </div>

      {/* Notification schedule preview */}
      <Card style={{ background: accentBg, border: "none", marginBottom: "26px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: accentContrast, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "13px" }}>
          🔔 Your notification schedule
        </p>
        {notifSchedule.map((r) => (
          <div key={r.label} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#5E6B64" }}>
                {r.icon} {r.label}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#2C3530" }}>{r.time}</span>
            </div>
            <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "2px", fontStyle: "italic" }}>"{r.msg}"</p>
          </div>
        ))}
        <p style={{ fontSize: "11px", color: "#9BA8A0", marginTop: "10px", lineHeight: 1.5 }}>
          Sessions also lock sequentially — morning → midday → night.
        </p>
      </Card>

      <Btn onClick={() => onNext({ timeMin, wakeTime: wake, sleepTime: sleep, unlocks })} style={{ width: "100%" }}>
        Build My Program →
      </Btn>
    </div>
  );
};

export default SetupScreen;
