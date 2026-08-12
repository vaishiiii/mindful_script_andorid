import React, { useEffect, useRef, useState } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import { QUESTIONS } from '@/data/questions';

const QuestionnaireScreen = ({ onNext }) => {
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState({});
  const [key, setKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const pick = (opt) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    const a = { ...ans, [idx]: opt };
    setAns(a);
    transitionTimeoutRef.current = setTimeout(() => {
      if (idx < QUESTIONS.length - 1) {
        setIdx((i) => i + 1);
        setKey((k) => k + 1);
        setIsTransitioning(false);
      } else {
        onNext(a);
      }
    }, 260);
  };

  const goBack = () => {
    if (isTransitioning) return;

    if (idx > 0) {
      setIdx((i) => i - 1);
      setKey((k) => k + 1);
    }
  };

  const q = QUESTIONS[idx];
  const pct = Math.round((idx / QUESTIONS.length) * 100);

  return (
    <div style={{ minHeight: "100vh", padding: "48px 22px 32px", maxWidth: 480, margin: "0 auto" }}>
      <ProgressBar step={2} total={4} />
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#7A9E87", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
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
              disabled={isTransitioning}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#F0EFE9",
                border: "none",
                cursor: isTransitioning ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isTransitioning ? 0.7 : 1,
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
              background: "#E8F0EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "#7A9E87",
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
              background: i < idx ? "#7A9E87" : i === idx ? "rgba(122,158,135,0.55)" : "#C4D8CB",
              transition: "all .3s",
            }}
          />
        ))}
      </div>

      {/* Question card */}
      <div key={key} className="slide-up">
        <Card style={{ marginBottom: "20px", background: "#E8F0EB", border: "none", padding: "20px" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 500, lineHeight: 1.5, color: "#2C3530" }}>
            {q.q}
          </p>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {q.opts.map((opt) => (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={isTransitioning}
              style={{
                background: ans[idx] === opt ? "#7A9E87" : "#fff",
                color: ans[idx] === opt ? "#fff" : "#2C3530",
                border: `1.5px solid ${ans[idx] === opt ? "#7A9E87" : "#C4D8CB"}`,
                borderRadius: "16px",
                padding: "13px 18px",
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "14px",
                cursor: isTransitioning ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all .18s",
                opacity: isTransitioning ? 0.82 : 1,
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
