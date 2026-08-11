import React, { useState } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import { QUESTIONS } from '@/data/questions';
import { PROGRAMS } from '@/data/programs';

const QuestionnaireScreen = ({ onNext, program }) => {
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState({});
  const [key, setKey] = useState(0);
  const prog = PROGRAMS.find((p) => p.id === program);
  const accent = prog?.color || 'var(--ms-accent)';
  const accentSoft = prog?.bg || 'var(--ms-accent-soft)';
  const accentMid = prog?.color ? `${prog.color}8C` : 'rgba(var(--ms-accent-rgb), 0.55)';
  const accentBorder = `1.5px solid ${prog?.color || 'var(--ms-accent)'}`;

  const pick = (opt) => {
    const a = { ...ans, [idx]: opt };
    setAns(a);
    setTimeout(() => {
      if (idx < QUESTIONS.length - 1) {
        setIdx((i) => i + 1);
        setKey((k) => k + 1);
      } else {
        onNext(a);
      }
    }, 260);
  };

  const goBack = () => {
    if (idx > 0) {
      setIdx((i) => i - 1);
      setKey((k) => k + 1);
    }
  };

  const q = QUESTIONS[idx];
  const pct = Math.round((idx / QUESTIONS.length) * 100);

  return (
    <div style={{ minHeight: "100vh", padding: "48px 22px 32px", maxWidth: 480, margin: "0 auto" }}>
      <ProgressBar step={2} total={4} accentColor={prog?.color} />
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
            Step 2 of 4
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "24px", fontWeight: 500 }}>
            {idx + 1} / {QUESTIONS.length}
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {idx > 0 && (
            <button
              onClick={goBack}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#F0EFE9",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="#9BA8A0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: accentSoft,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: accent,
            }}
          >
            {pct}%
          </div>
        </div>
      </div>

      {/* Dot progress */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "22px" }}>
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < idx ? accent : i === idx ? accentMid : 'var(--ms-accent-border)',
              transition: "all .3s",
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div key={key} className="slide-up">
        <Card style={{ marginBottom: "20px", background: accentSoft, border: "none", padding: "20px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 500, lineHeight: 1.5, color: "#2C3530" }}>
            {q.q}
          </p>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {q.opts.map((opt) => (
            <button
              key={opt}
              onClick={() => pick(opt)}
              style={{
                background: ans[idx] === opt ? accent : "#fff",
                color: ans[idx] === opt ? "#fff" : "#2C3530",
                border: ans[idx] === opt ? accentBorder : "1.5px solid var(--ms-accent-border)",
                borderRadius: "16px",
                padding: "13px 18px",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all .18s",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireScreen;
