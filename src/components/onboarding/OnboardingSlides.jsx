import React, { useState, useEffect, useRef } from 'react';

// Slide data
const SLIDES = [
  {
    id: 0,
    bg: 'radial-gradient(130% 110% at 12% 0%, #F3FFF8 0%, #E8F6EE 48%, #DFEFE5 100%)',
    accent: '#7A9E87',
    accentRgb: '122,158,135',
    buttonStart: '#B9DCC8',
    buttonEnd: '#7A9E87',
    buttonText: '#244A35',
    textPrimary: '#1A3024',
    textSecondary: 'rgba(26,48,36,0.62)',
    cardBg: 'rgba(122,158,135,0.11)',
    cardBorder: 'rgba(122,158,135,0.26)',
    navBg: 'linear-gradient(to top, #EAF3EC 0%, rgba(234,243,236,0) 100%)',
    badge: 'Your Mind. Transformed.',
    title: 'Rewire How\nYou Think & Feel',
    body: 'Mindscript uses science-backed breathing and mindfulness scripts to reprogram your mental patterns quietly, deeply, daily.',
    visual: (
      <svg width="180" height="155" viewBox="0 0 180 155" fill="none">
        <circle cx="90" cy="78" r="68" fill="rgba(122,158,135,0.13)" />
        <circle cx="90" cy="78" r="48" fill="rgba(122,158,135,0.18)" />
        <circle cx="90" cy="78" r="30" fill="rgba(122,158,135,0.24)" />
        <path d="M22 78 Q42 56 62 78 Q82 100 102 78 Q122 56 158 78" stroke="#7A9E87" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M14 92 Q34 70 54 92 Q74 114 94 92 Q114 70 166 92" stroke="rgba(122,158,135,0.35)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M18 64 Q38 42 58 64 Q78 86 98 64 Q118 42 162 64" stroke="rgba(122,158,135,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="62" cy="78" r="4.5" fill="#7A9E87" />
        <circle cx="102" cy="78" r="4.5" fill="#7A9E87" />
        <circle cx="90" cy="49" r="3" fill="rgba(122,158,135,0.7)" />
        <circle cx="52" cy="106" r="2.5" fill="rgba(122,158,135,0.5)" />
        <circle cx="130" cy="102" r="2.5" fill="rgba(122,158,135,0.5)" />
      </svg>
    ),
    features: [
      { icon: '🧠', title: 'Reprograms mental patterns', desc: 'Break old habits and build new neural pathways' },
      { icon: '🌿', title: 'Evidence-based techniques', desc: 'Grounded in neuroscience and psychology' },
      { icon: '⚡', title: 'Results in as little as 3 days', desc: 'Feel the shift from your very first session' },
    ],
  },
  {
    id: 1,
    bg: 'radial-gradient(130% 115% at 10% 0%, #FFF8E9 0%, #FDF3DF 50%, #F5EBD5 100%)',
    accent: '#C4A882',
    accentRgb: '196,168,130',
    buttonStart: '#F4DFC0',
    buttonEnd: '#C4A882',
    buttonText: '#5A421F',
    textPrimary: '#2A2210',
    textSecondary: 'rgba(42,34,16,0.62)',
    cardBg: 'rgba(196,168,130,0.13)',
    cardBorder: 'rgba(196,168,130,0.30)',
    navBg: 'linear-gradient(to top, #FAF4E5 0%, rgba(250,244,229,0) 100%)',
    badge: 'Simple Daily Practice',
    title: '3 Short Sessions\nChange Everything',
    body: 'Each day has three focused sessions - morning, midday, and evening. Just 10 minutes each. No experience needed.',
    visual: (
      <svg width="180" height="155" viewBox="0 0 180 155" fill="none">
        <circle cx="90" cy="78" r="65" fill="rgba(196,168,130,0.14)" />
        {/* Morning - sun with rays */}
        <circle cx="90" cy="33" r="24" fill="rgba(255,200,80,0.10)" stroke="#C4A882" strokeWidth="1.5"/>
        <circle cx="90" cy="33" r="9" fill="#C4A882" opacity="0.55"/>
        <line x1="90" y1="16" x2="90" y2="22" stroke="#C4A882" strokeWidth="2" strokeLinecap="round"/>
        <line x1="90" y1="44" x2="90" y2="50" stroke="#C4A882" strokeWidth="2" strokeLinecap="round"/>
        <line x1="73" y1="33" x2="79" y2="33" stroke="#C4A882" strokeWidth="2" strokeLinecap="round"/>
        <line x1="101" y1="33" x2="107" y2="33" stroke="#C4A882" strokeWidth="2" strokeLinecap="round"/>
        <text x="90" y="62" textAnchor="middle" fontSize="8" fill="#C4A882" fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.08em">MORNING</text>
        {/* Midday - full bright circle */}
        <circle cx="148" cy="104" r="24" fill="rgba(196,168,130,0.12)" stroke="#C4A882" strokeWidth="1.5"/>
        <circle cx="148" cy="104" r="13" fill="#C4A882" opacity="0.65"/>
        <text x="148" y="133" textAnchor="middle" fontSize="8" fill="#C4A882" fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.08em">MIDDAY</text>
        {/* Evening - crescent */}
        <circle cx="32" cy="104" r="24" fill="rgba(196,168,130,0.10)" stroke="#C4A882" strokeWidth="1.5"/>
        <path d="M26 93 Q18 104 26 115 Q36 110 38 104 Q36 98 26 93 Z" fill="#C4A882" opacity="0.55"/>
        <text x="32" y="133" textAnchor="middle" fontSize="8" fill="#C4A882" fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.08em">EVENING</text>
        {/* Connectors */}
        <path d="M106 49 L133 83" stroke="rgba(196,168,130,0.28)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <path d="M74 49 L47 83" stroke="rgba(196,168,130,0.28)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <path d="M56 112 L124 112" stroke="rgba(196,168,130,0.28)" strokeWidth="1.5" strokeDasharray="4 3"/>
      </svg>
    ),
    features: [
      { icon: '🌅', title: 'Morning intention', desc: 'Start the day with purpose and clarity' },
      { icon: '☀️', title: 'Midday reset', desc: 'Recalibrate your focus when energy dips' },
      { icon: '🌙', title: 'Evening reflection', desc: 'Release tension and drift into peace' },
    ],
  },
  {
    id: 2,
    bg: 'radial-gradient(130% 112% at 10% 0%, #F3EDFF 0%, #EFE8F8 48%, #E7E0F2 100%)',
    accent: '#B09FD8',
    accentRgb: '176,159,216',
    buttonStart: '#DED4F3',
    buttonEnd: '#B09FD8',
    buttonText: '#3B2D63',
    textPrimary: '#1E1540',
    textSecondary: 'rgba(30,21,64,0.62)',
    cardBg: 'rgba(176,159,216,0.14)',
    cardBorder: 'rgba(176,159,216,0.32)',
    navBg: 'linear-gradient(to top, #EEE8F8 0%, rgba(238,232,248,0) 100%)',
    badge: '7 Transformation Journeys',
    title: 'Find the Program\nBuilt for You',
    body: "From calming anxiety to building confidence - Mindscript has a dedicated program for every goal you're ready to achieve.",
    visual: (
      <svg width="180" height="155" viewBox="0 0 180 155" fill="none">
        <circle cx="90" cy="78" r="65" fill="rgba(176,159,216,0.15)" />
        {[0,1,2,3,4,5,6].map(i => {
          const a = (i * Math.PI * 2) / 7 - Math.PI / 2;
          const r = 50;
          const x = 90 + r * Math.cos(a);
          const y = 78 + r * Math.sin(a);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="15" fill="rgba(176,159,216,0.22)" stroke="rgba(176,159,216,0.48)" strokeWidth="1.2"/>
              <circle cx={x} cy={y} r="5" fill="#B09FD8" opacity="0.85"/>
            </g>
          );
        })}
        <circle cx="90" cy="78" r="20" fill="rgba(176,159,216,0.28)" stroke="#B09FD8" strokeWidth="1.5"/>
        <path d="M90 68 L92.5 75 L100 75 L94 79.5 L96.5 86.5 L90 82.5 L83.5 86.5 L86 79.5 L80 75 L87.5 75 Z" fill="#B09FD8" opacity="0.85"/>
      </svg>
    ),
    features: [
      { icon: '🕊️', title: 'Calm & Anxiety Relief', desc: 'Quiet the noise, steady the mind' },
      { icon: '🎯', title: 'Focus & Mental Clarity', desc: 'Sharpen attention, eliminate distraction' },
      { icon: '💪', title: 'Confidence & Self-Worth', desc: 'Rewire limiting beliefs from within' },
      { icon: '🌱', title: 'Healing & Inner Peace', desc: 'Recover, restore, and gently rebuild' },
    ],
  },
  {
    id: 3,
    bg: 'radial-gradient(130% 112% at 10% 0%, #E8FBFB 0%, #E2F4F4 48%, #DCEDED 100%)',
    accent: '#5BBFBE',
    accentRgb: '91,191,190',
    buttonStart: '#C2ECEA',
    buttonEnd: '#5BBFBE',
    buttonText: '#174F50',
    textPrimary: '#0D2626',
    textSecondary: 'rgba(13,38,38,0.62)',
    cardBg: 'rgba(91,191,190,0.12)',
    cardBorder: 'rgba(91,191,190,0.28)',
    navBg: 'linear-gradient(to top, #E4F3F3 0%, rgba(228,243,243,0) 100%)',
    badge: 'Built on Neuroscience',
    title: 'Your Brain Is\nWired to Change',
    body: 'Neuroplasticity means your brain forms new pathways with every repeated thought. Mindscript activates this natural ability intentionally.',
    visual: (
      <svg width="180" height="155" viewBox="0 0 180 155" fill="none">
        <circle cx="90" cy="78" r="65" fill="rgba(91,191,190,0.15)" />
        {[0,1,2,3,4,5,6,7].map(i => {
          const a = (i * Math.PI * 2) / 8;
          const r1 = 30, r2 = 46;
          const x1 = 90 + r1 * Math.cos(a), y1 = 78 + r1 * Math.sin(a);
          const x2 = 90 + r2 * Math.cos(a), y2 = 78 + r2 * Math.sin(a);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5BBFBE" strokeWidth="1.5" strokeOpacity="0.75"/>
              <circle cx={x2} cy={y2} r="5" fill="rgba(91,191,190,0.32)" stroke="#5BBFBE" strokeWidth="1" strokeOpacity="1"/>
            </g>
          );
        })}
        {[0,1,2,3,4,5,6,7].map(i => {
          const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
          const r = 62;
          const x = 90 + r * Math.cos(a), y = 78 + r * Math.sin(a);
          return <circle key={i} cx={x} cy={y} r="3" fill="rgba(91,191,190,0.58)"/>;
        })}
        <circle cx="90" cy="78" r="20" fill="rgba(91,191,190,0.25)" stroke="#5BBFBE" strokeWidth="1.5"/>
        <circle cx="90" cy="78" r="8" fill="#5BBFBE" opacity="0.90"/>
        <circle cx="90" cy="78" r="3" fill="rgba(255,255,255,0.8)"/>
      </svg>
    ),
    features: [
      { icon: '🔬', title: 'Grounded in neuroscience', desc: 'Based on decades of brain research' },
      { icon: '🔁', title: 'Repetition builds real change', desc: 'New pathways form within days of practice' },
      { icon: '🧘', title: 'Breathwork activates calm', desc: 'Regulate your nervous system in minutes' },
    ],
  },
  {
    id: 4,
    bg: 'radial-gradient(130% 112% at 10% 0%, #EDF4FF 0%, #E6EDF9 48%, #DEE5F2 100%)',
    accent: '#8E9EC4',
    accentRgb: '142,158,196',
    buttonStart: '#D4DDF2',
    buttonEnd: '#8E9EC4',
    buttonText: '#304166',
    textPrimary: '#111E3A',
    textSecondary: 'rgba(17,30,58,0.62)',
    cardBg: 'rgba(142,158,196,0.13)',
    cardBorder: 'rgba(142,158,196,0.28)',
    navBg: 'linear-gradient(to top, #E8EEF8 0%, rgba(232,238,248,0) 100%)',
    badge: '100% Free to Start',
    title: 'Your Transformation\nStarts Today',
    body: 'Everything you need is completely free. No credit card, no hidden fees. Just you and the intention to change.',
    visual: (
      <svg width="180" height="155" viewBox="0 0 180 155" fill="none">
        <circle cx="90" cy="78" r="65" fill="rgba(142,158,196,0.14)" />
        <circle cx="90" cy="78" r="42" fill="rgba(142,158,196,0.18)" stroke="rgba(142,158,196,0.36)" strokeWidth="1"/>
        {/* Star polygon */}
        <path d="M90 32 L95 62 L124 78 L95 94 L90 124 L85 94 L56 78 L85 62 Z" fill="rgba(142,158,196,0.24)" stroke="#8E9EC4" strokeWidth="1.5"/>
        <circle cx="90" cy="78" r="16" fill="rgba(142,158,196,0.38)" stroke="#8E9EC4" strokeWidth="1"/>
        {/* Inner sparkle */}
        <path d="M90 70 L91.5 76 L98 78 L91.5 80 L90 86 L88.5 80 L82 78 L88.5 76 Z" fill="#8E9EC4" opacity="0.8"/>
        {/* Orbiting dots */}
        <circle cx="90" cy="26" r="4.5" fill="#8E9EC4" opacity="0.9"/>
        <circle cx="136" cy="52" r="3.5" fill="#8E9EC4" opacity="0.65"/>
        <circle cx="148" cy="98" r="3.5" fill="#8E9EC4" opacity="0.6"/>
        <circle cx="118" cy="136" r="3" fill="#8E9EC4" opacity="0.55"/>
        <circle cx="62" cy="136" r="3" fill="#8E9EC4" opacity="0.55"/>
        <circle cx="32" cy="98" r="3.5" fill="#8E9EC4" opacity="0.6"/>
        <circle cx="44" cy="52" r="3.5" fill="#8E9EC4" opacity="0.65"/>
      </svg>
    ),
    features: [
      { icon: '🆓', title: 'Always free to start', desc: 'No credit card, no hidden charges ever' },
      { icon: '📱', title: '7 complete programs', desc: 'From 5-day sprints to 21-day journeys' },
      { icon: '📈', title: 'Track your daily progress', desc: 'Watch your streak and growth stack up' },
      { icon: '🚀', title: 'See results from day 1', desc: 'Something shifts after your very first session' },
    ],
    isFinal: true,
  },
];

// Splash Screen
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2100);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="premium-splash" style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(148% 122% at 50% 8%, #1B4A3D 0%, #113025 52%, #0A1813 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: phase === 2 ? 0 : 1,
      transition: 'opacity 0.7s ease',
      overflow: 'hidden',
    }}>
      <div className="premium-splash__particles" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((particle) => (
          <span key={particle} style={{ '--particle-index': particle }} />
        ))}
      </div>
      <div className="premium-splash__logo" style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(120% 95% at 50% -18%, rgba(122,255,209,0.24) 0%, rgba(122,255,209,0.02) 44%, rgba(0,0,0,0) 100%)',
        animation: 'premiumSplashShift 12s ease-in-out infinite',
      }} />
      <div className="premium-splash__content" style={{
        position: 'absolute', width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(84,242,183,0.28) 0%, rgba(84,242,183,0) 72%)',
        top: -160, left: -120, filter: 'blur(6px)', animation: 'heroGlowDrift 9.5s ease-in-out infinite',
      }} />
      <div className="premium-splash__dots" style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(105,176,255,0.22) 0%, rgba(105,176,255,0) 74%)',
        right: -110, bottom: -120, filter: 'blur(4px)', animation: 'premiumPulse 8.8s ease-in-out infinite',
      }} />
      <div className="premium-splash__halo" style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(122,255,209,0.16) 0%, transparent 72%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -60%)', animation: 'premiumPulse 6.8s ease-in-out infinite',
      }} />
      <div className="premium-splash__mark" style={{
        width: 124, height: 124, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 22, position: 'relative', animation: 'float 3s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'conic-gradient(from 30deg, rgba(144,255,214,0.18) 0deg, rgba(144,255,214,0.72) 82deg, rgba(98,173,255,0.62) 170deg, rgba(144,255,214,0.18) 360deg)',
          animation: 'premiumHaloSpin 8.8s linear infinite', boxShadow: '0 0 26px rgba(104,220,184,0.44)',
        }} />
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,52,41,0.98) 0%, rgba(16,39,31,0.95) 100%)',
          border: '1.5px solid rgba(175,255,225,0.36)',
          boxShadow: 'inset 0 0 20px rgba(83,206,165,0.25), 0 10px 26px rgba(0,0,0,0.34)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {/* Leaf SVG icon */}
        <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
          <path d="M23 6 C30 10 40 15 37 25 C34 35 20 40 13 31 C6 22 13 10 23 6 Z" fill="rgba(228,255,245,0.95)"/>
          <path d="M23 6 C21 16 19 26 23 42" stroke="rgba(165,246,218,0.65)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </svg>
        </div>
      </div>
      <div className="premium-splash__copy" style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 40, fontWeight: 500, color: '#EFFFF7',
          letterSpacing: '0.04em', margin: 0, lineHeight: 1,
          textShadow: '0 0 14px rgba(126,255,212,0.28), 0 0 28px rgba(126,255,212,0.16)',
          animation: 'premiumTextGlow 3.2s ease-in-out infinite',
        }}>Mindscript</h1>
        <p style={{
          fontSize: 12, color: 'rgba(220,247,235,0.88)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>Rewire Your Mind</p>
      </div>
      <div className="premium-splash__loader" style={{
        display: 'flex', gap: 7, marginTop: 44,
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.4s ease 0.3s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#D9FFF2',
            boxShadow: '0 0 12px rgba(130,255,214,0.72)',
            animation: `splashDot 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
        <span className="premium-splash__loader-ring" />
      </div>
    </div>
  );
};

// Individual Slide
const Slide = ({ slide, active, direction, onNext, onSkip, current, total }) => {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (active) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      const t = setTimeout(() => setMounted(true), 40);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [active]);

  const isFinal = !!slide.isFinal;

  return (
    <div className={`onboarding-slide ${active ? 'is-active' : 'is-inactive'} ${direction > 0 ? 'is-forward' : 'is-backward'}`} style={{
      position: 'absolute', inset: 0,
      background: slide.bg,
      '--slide-accent': slide.accent,
      '--slide-accent-rgb': slide.accentRgb,
      '--button-start': slide.buttonStart,
      '--button-end': slide.buttonEnd,
      '--button-text': slide.buttonText,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div className="onboarding-slide__wash" aria-hidden="true" />
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', width: 370, height: 370, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${slide.accentRgb},0.3) 0%, transparent 70%)`,
        top: -130, right: -110, pointerEvents: 'none', zIndex: 0,
        filter: 'blur(1px)', animation: 'heroGlowDrift 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${slide.accentRgb},0.18) 0%, transparent 70%)`,
        bottom: 170, left: -80, pointerEvents: 'none', zIndex: 0,
        animation: 'premiumPulse 8.8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 24%, rgba(255,255,255,0) 100%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative', zIndex: 1,
          padding: '48px 20px 12px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Badge */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s',
          marginBottom: 16,
        }}>
          <span style={{
            display: 'inline-block',
            background: `linear-gradient(120deg, rgba(${slide.accentRgb},0.2), rgba(255,255,255,0.4))`,
            border: `1px solid rgba(${slide.accentRgb},0.38)`,
            color: slide.accent,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: 20,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            boxShadow: `0 6px 16px rgba(${slide.accentRgb},0.18), inset 0 0 0 1px rgba(255,255,255,0.42)`,
          }}>{slide.badge}</span>
        </div>

        {/* Visual */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 16,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(16px)',
          transition: 'opacity 0.5s ease 0.12s, transform 0.5s cubic-bezier(0.34,1.2,0.64,1) 0.12s',
          background: `linear-gradient(160deg, rgba(255,255,255,0.44) 0%, rgba(${slide.accentRgb},0.13) 100%)`,
          border: `1px solid rgba(${slide.accentRgb},0.24)`,
          borderRadius: 24,
          boxShadow: `0 12px 28px rgba(${slide.accentRgb},0.16), inset 0 0 0 1px rgba(255,255,255,0.28)`,
          backdropFilter: 'blur(8px)',
          padding: '8px 8px 4px',
        }}>
          {slide.visual}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 36, fontWeight: 500, color: slide.textPrimary,
          lineHeight: 1.2, margin: '0 0 10px',
          whiteSpace: 'pre-line',
          letterSpacing: '0.01em',
          textShadow: `0 8px 24px rgba(${slide.accentRgb},0.15)`,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease 0.22s, transform 0.4s ease 0.22s',
        }}>{slide.title}</h2>

        {/* Body */}
        <p style={{
          fontSize: 15, color: slide.textSecondary,
          lineHeight: 1.65, margin: '0 0 14px',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.4s ease 0.32s, transform 0.4s ease 0.32s',
        }}>{slide.body}</p>

        {/* Feature cards */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.4s ease 0.42s, transform 0.4s ease 0.42s',
        }}>
          {slide.features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              background: `linear-gradient(155deg, rgba(255,255,255,0.62) 0%, ${slide.cardBg} 100%)`,
              border: `1px solid ${slide.cardBorder}`,
              borderRadius: 14, padding: '10px 14px',
              boxShadow: `0 8px 20px rgba(${slide.accentRgb},0.14), inset 0 0 0 1px rgba(255,255,255,0.24)`,
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ fontSize: 21, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 600, color: slide.textPrimary,
                  fontFamily: "'DM Sans', system-ui, sans-serif", marginBottom: 2,
                }}>{f.title}</div>
                <div style={{
                  fontSize: 13, color: slide.textSecondary,
                  fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.5,
                }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* Fixed bottom navigation */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '10px 20px 28px',
        background: slide.navBg,
      }}>
        {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === current ? 26 : 6,
              background: i === current ? slide.accent : `rgba(${slide.accentRgb},0.28)`,
              transition: 'width 0.3s ease, background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Next / Get Started */}
        <button className="premium-cta"
          onClick={onNext}
          style={{
            width: '100%', padding: '12px 20px',
            borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${slide.buttonStart} 0%, ${slide.buttonEnd} 100%)`,
            color: slide.buttonText, fontSize: 15, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '-0.01em',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            boxShadow: `0 10px 26px rgba(${slide.accentRgb},0.42), 0 0 20px rgba(${slide.accentRgb},0.26)`,
            transition: 'transform .18s ease, box-shadow .2s ease, filter .2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.012)';
            e.currentTarget.style.filter = 'brightness(1.04) saturate(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.filter = 'none';
          }}
        >
          {isFinal ? "Get Started - It's Free" : 'Next'}
        </button>

        {!isFinal && (
          <button className="premium-skip"
            onClick={onSkip}
            style={{
              display: 'block', margin: '8px auto 0',
              background: 'none', border: 'none', cursor: 'pointer',
              color: slide.textSecondary, fontSize: 13,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              padding: '3px 20px',
            }}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

// Main Component
const OnboardingSlides = ({ onDone, showIntroSplash = true }) => {
  const [showSplash, setShowSplash] = useState(showIntroSplash);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      localStorage.setItem('ms_onboarding_done', '1');
      onDone();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('ms_onboarding_done', '1');
    onDone();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 55) {
      dx > 0 ? handleNext() : goTo(current - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <div className="onboarding-entry"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', touchAction: 'pan-y', perspective: '1200px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {SLIDES.map((s, i) => (
        <Slide
          key={s.id}
          slide={s}
          active={i === current}
          direction={i > current ? 1 : -1}
          onNext={handleNext}
          onSkip={handleSkip}
          current={current}
          total={SLIDES.length}
        />
      ))}
    </div>
  );
};

export default OnboardingSlides;
