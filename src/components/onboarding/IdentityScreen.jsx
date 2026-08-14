import React from 'react';
import { Btn, Tag, CheckIcon } from '@/components/ui';
import { PROGRAMS } from '@/data/programs';

const IdentityScreen = ({ program, onNext, user, onRequireLogin }) => {
  const prog = PROGRAMS.find((p) => p.id === program);
  
  const handleStartProgram = () => {
    // Check if user is authenticated
    if (!user) {
      // User not authenticated - require login first
      if (onRequireLogin) {
        onRequireLogin();
      }
      return;
    }
    
    // User is authenticated, proceed to app
    onNext();
  };

  return (
    <div className="fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: prog?.bg || "#E8F0EB" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "52px 26px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ animation: "float 4.5s ease-in-out infinite", marginBottom: "20px" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${prog?.color}28`,
              border: `2px solid ${prog?.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "34px",
            }}
          >
            {prog?.icon}
          </div>
        </div>
        <Tag label="Your Profile Type" color={prog?.color} />
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "34px",
            fontWeight: 500,
            color: "#2C3530",
            margin: "16px 0 14px",
            lineHeight: 1.25,
          }}
        >
          You are a<br />
          <em>{prog?.identity}.</em>
        </h1>
        <p style={{ fontSize: "15px", color: "#5E6B64", lineHeight: 1.75, maxWidth: 330 }}>{prog?.identityDesc}</p>
      </div>
      <div style={{ background: "#fff", borderRadius: "28px 28px 0 0", padding: "26px 22px 44px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--ms-accent-contrast, #5A7A67)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
          Your Free 3-Day Program Includes
        </p>
        {[
          "Goal-specific breathwork embedded in every session",
          "Structured morning, midday & night rituals",
          "Real-world behavioral action tasks",
          "Selection-based nightly reflection",
          "Session timing matched to your schedule",
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "11px" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: `${prog?.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon color={prog?.color} size={12} />
            </div>
            <span style={{ fontSize: "13px", color: "#5E6B64" }}>{f}</span>
          </div>
        ))}
        <Btn onClick={handleStartProgram} style={{ width: "100%", marginTop: "20px", fontSize: "16px", padding: "16px" }}>
          {!user ? "Sign In to Start →" : "Start My 3-Day Plan →"}
        </Btn>
      </div>
    </div>
  );
};

export default IdentityScreen;
