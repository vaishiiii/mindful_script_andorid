import React, { useState } from 'react';
import { Btn, Card, TimePicker, ConfirmDialog } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';
import { computeUnlocks } from '@/utils/helpers';

const ProfileTab = ({ program, setup, onUpdateSetup, onReset, user, onLogout }) => {
  const prog = PROGRAMS.find((p) => p.id === program);
  const [wake, setWake] = useState(setup.wakeTime);
  const [slp, setSlp] = useState(setup.sleepTime);
  const [notifs, setNotifs] = useState(true);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const save = () => {
    onUpdateSetup({ ...setup, wakeTime: wake, sleepTime: slp, unlocks: computeUnlocks(wake, slp) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "32px 22px", maxWidth: 480, margin: "0 auto" }}>
      {confirm && (
        <ConfirmDialog
          title="Reset your program?"
          body="This will clear all progress and restart from Day 1. Your goal and preferences will be kept."
          confirmLabel="Reset"
          danger
          onConfirm={() => {
            setConfirm(false);
            onReset();
          }}
          onCancel={() => setConfirm(false)}
        />
      )}
      
      {confirmLogout && (
        <ConfirmDialog
          title="Log out?"
          body="You'll be logged out and returned to the login screen. Your progress is saved and will be restored when you log back in."
          confirmLabel="Log Out"
          onConfirm={() => {
            setConfirmLogout(false);
            onLogout();
          }}
          onCancel={() => setConfirmLogout(false)}
        />
      )}

      <p style={{ fontSize: "12px", fontWeight: 700, color: "#7A9E87", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Profile</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: 500, marginBottom: "22px" }}>Your settings</h2>

      {/* User Info */}
      {user && (
        <Card style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Account</p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%" }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#7A9E87", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600 }}>
                {(user.displayName || user.email)?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 600, fontSize: "15px", color: "#2C3530" }}>
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p style={{ fontSize: "12px", color: "#9BA8A0" }}>{user.email}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Goal */}
      <Card style={{ marginBottom: "14px", background: prog?.bg, border: "none" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: prog?.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Current Goal</p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>{prog?.icon}</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: "15px", color: "#2C3530" }}>{prog?.label}</p>
            <p style={{ fontSize: "12px", color: "#5E6B64" }}>{prog?.desc}</p>
          </div>
        </div>
      </Card>

      {/* Time commitment */}
      <Card style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Daily Commitment</p>
        <p style={{ fontWeight: 600, fontSize: "15px", color: "#2C3530" }}>{setup.timeMin} minutes / day</p>
      </Card>

      {/* Time pickers */}
      <Card style={{ marginBottom: "14px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#9BA8A0", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>Session Timing</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TimePicker value={wake} onChange={setWake} label="Wake up time" />
          <TimePicker value={slp} onChange={setSlp} label="Sleep time" />
        </div>
        <Btn onClick={save} variant="soft" style={{ width: "100%", marginTop: "14px" }}>
          {saved ? "✓ Saved" : "Save Changes"}
        </Btn>
      </Card>

      {/* Notifications */}
      <Card style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: "14px", color: "#2C3530" }}>Notifications</p>
            <p style={{ fontSize: "12px", color: "#9BA8A0", marginTop: "2px" }}>Session reminders & streak nudges</p>
          </div>
          <div
            onClick={() => setNotifs((n) => !n)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: notifs ? "#7A9E87" : "#C4D8CB",
              position: "relative",
              cursor: "pointer",
              transition: "background .25s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 3,
                left: notifs ? 23 : 3,
                transition: "left .25s",
                boxShadow: "0 1px 4px rgba(44,53,48,0.12)",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Reset */}
      <Card style={{ marginBottom: "14px" }}>
        <p style={{ fontWeight: 600, fontSize: "14px", color: "#2C3530", marginBottom: "4px" }}>Reset Program</p>
        <p style={{ fontSize: "12px", color: "#9BA8A0", marginBottom: "14px" }}>Clears all progress and restarts from Day 1. Your goal and time settings stay.</p>
        <Btn onClick={() => setConfirm(true)} variant="danger" style={{ width: "100%", fontSize: "13px", padding: "11px" }}>
          Reset Program
        </Btn>
      </Card>
      
      {/* Logout */}
      {onLogout && (
        <Card>
          <p style={{ fontWeight: 600, fontSize: "14px", color: "#2C3530", marginBottom: "4px" }}>Log Out</p>
          <p style={{ fontSize: "12px", color: "#9BA8A0", marginBottom: "14px" }}>Sign out of your account. Your progress is saved.</p>
          <Btn onClick={() => setConfirmLogout(true)} variant="soft" style={{ width: "100%", fontSize: "13px", padding: "11px" }}>
            Log Out
          </Btn>
        </Card>
      )}
    </div>
  );
};

export default ProfileTab;
