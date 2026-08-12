import React, { useState } from 'react';
import { Btn, InputField, GoogleIcon } from '@/components/ui';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/utils/auth';
import { PROG_COLORS } from '@/styles/designSystem';

const LoginScreen = ({ onNext }) => {
  const [emailMode, setEmailMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailAuthPending, setEmailAuthPending] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errorType, setErrorType] = useState("error"); // "error" or "info"
  const [resetSent, setResetSent] = useState(false);

  const toRgba = (hex, alpha) => {
    if (!hex || typeof hex !== 'string') return `rgba(122, 158, 135, ${alpha})`;
    const normalized = hex.replace('#', '').trim();
    const value = normalized.length === 3
      ? normalized.split('').map((ch) => ch + ch).join('')
      : normalized;
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return `rgba(122, 158, 135, ${alpha})`;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const pastelStops = [
    PROG_COLORS.calm,
    PROG_COLORS.focus,
    PROG_COLORS.confidence,
    PROG_COLORS.healing,
    PROG_COLORS.purpose,
    PROG_COLORS.habit,
    PROG_COLORS.discipline,
  ];

  const validate = () => {
    const e = {};
    if (!email.includes("@")) e.email = "Enter a valid email address";
    if (!password) {
      e.password = "Enter your password";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!email.includes('@')) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }
    setLoading(true);
    setGeneralError('');
    const result = await resetPassword(email);
    setLoading(false);
    if (result.success) {
      setResetSent(true);
    } else {
      setErrorType(result.isGoogleAccount ? 'info' : 'error');
      setGeneralError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGeneralError("");
    setErrorType("error");
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        return;
      } else {
        const errorMsg = result.error || 'Failed to sign in with Google';
        if (errorMsg.includes('cancelled') || errorMsg.includes('closed')) {
          setErrorType("info");
          setGeneralError(errorMsg);
          setTimeout(() => setGeneralError(""), 4000);
        } else {
          setErrorType("error");
          setGeneralError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      setErrorType("error");
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setEmailAuthPending(false);
    setGeneralError("");
    setErrors({});
    let authAccepted = false;
    try {
      const result = emailMode === 'signup'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (result.success) {
        // Keep a clear pending UI until the auth listener routes away from this screen.
        authAccepted = true;
        setEmailAuthPending(true);
        return;
      } else {
        setGeneralError(result.error);
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      setGeneralError('Authentication failed. Please try again.');
    } finally {
      if (!authAccepted) {
        setLoading(false);
      }
    }
  };

  const busy = loading || emailAuthPending;
  const linkBtnStyle = {
    background: 'none',
    border: 'none',
    cursor: busy ? 'not-allowed' : 'pointer',
    color: 'var(--ms-accent-contrast, #446558)',
    fontSize: '13px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    textDecoration: 'underline',
    opacity: busy ? 0.6 : 1,
  };

  return (
    <div
      className="fade-in"
      style={{
        '--ms-accent': '#7A9E87',
        '--ms-accent-deep': '#52735F',
        '--ms-accent-glow': '#A8D0B8',
        '--ms-accent-soft': '#BDD7C8',
        '--ms-accent-bg': '#EAF4EE',
        '--ms-accent-contrast': '#426854',
        '--auth-rainbow-a': toRgba(pastelStops[0], 0.22),
        '--auth-rainbow-b': toRgba(pastelStops[1], 0.2),
        '--auth-rainbow-c': toRgba(pastelStops[2], 0.2),
        '--auth-rainbow-d': toRgba(pastelStops[3], 0.2),
        '--auth-rainbow-e': toRgba(pastelStops[4], 0.2),
        '--auth-rainbow-f': toRgba(pastelStops[5], 0.2),
        '--auth-rainbow-g': toRgba(pastelStops[6], 0.2),
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, #FBFEFD 0%, #F2F9F6 48%, #EAF5F0 100%),
          linear-gradient(108deg,
            ${toRgba(pastelStops[0], 0.2)} 0%,
            ${toRgba(pastelStops[1], 0.18)} 16%,
            ${toRgba(pastelStops[2], 0.18)} 32%,
            ${toRgba(pastelStops[3], 0.18)} 48%,
            ${toRgba(pastelStops[4], 0.18)} 64%,
            ${toRgba(pastelStops[5], 0.18)} 80%,
            ${toRgba(pastelStops[6], 0.18)} 100%)`,
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-20%',
          right: '-20%',
          height: '52%',
          borderRadius: '48%',
          background: `linear-gradient(95deg,
            ${toRgba(pastelStops[0], 0.38)} 0%,
            ${toRgba(pastelStops[1], 0.36)} 18%,
            ${toRgba(pastelStops[2], 0.35)} 35%,
            ${toRgba(pastelStops[3], 0.35)} 52%,
            ${toRgba(pastelStops[4], 0.35)} 68%,
            ${toRgba(pastelStops[5], 0.35)} 84%,
            ${toRgba(pastelStops[6], 0.35)} 100%)`,
          transform: 'rotate(-7deg)',
          filter: 'blur(16px)',
          animation: 'authRainbowBreath 14s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-16%',
          left: '-16%',
          right: '-16%',
          height: '46%',
          borderRadius: '46%',
          background: `linear-gradient(92deg,
            ${toRgba(pastelStops[6], 0.3)} 0%,
            ${toRgba(pastelStops[5], 0.3)} 18%,
            ${toRgba(pastelStops[4], 0.3)} 36%,
            ${toRgba(pastelStops[3], 0.3)} 54%,
            ${toRgba(pastelStops[2], 0.3)} 72%,
            ${toRgba(pastelStops[1], 0.3)} 88%,
            ${toRgba(pastelStops[0], 0.3)} 100%)`,
          transform: 'rotate(6deg)',
          filter: 'blur(18px)',
          animation: 'authRainbowBreath 16s ease-in-out infinite reverse',
          opacity: 0.9,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-20% -16%',
          background: `radial-gradient(34% 32% at 14% 18%, ${toRgba(pastelStops[0], 0.22)} 0%, rgba(255,255,255,0) 72%),
            radial-gradient(30% 30% at 86% 12%, ${toRgba(pastelStops[1], 0.22)} 0%, rgba(255,255,255,0) 72%),
            radial-gradient(34% 32% at 18% 84%, ${toRgba(pastelStops[2], 0.2)} 0%, rgba(255,255,255,0) 72%),
            radial-gradient(32% 30% at 84% 82%, ${toRgba(pastelStops[4], 0.2)} 0%, rgba(255,255,255,0) 72%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${toRgba('#FFFFFF', 0.42)} 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '26px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '24px',
            background: 'linear-gradient(140deg, #7A9E87 0%, #5D846C 58%, #A8D0B8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 12px 34px rgba(90,129,105,0.4), 0 0 26px rgba(129,178,152,0.35)',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 46 46" fill="none">
            <path d="M23 6 C30 10 40 15 37 25 C34 35 20 40 13 31 C6 22 13 10 23 6 Z" fill="rgba(255,255,255,0.92)"/>
            <path d="M23 6 C21 16 19 26 23 42" stroke="rgba(255,255,255,0.55)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '30px',
            fontWeight: 500,
            color: '#2C3530',
            letterSpacing: '-0.01em',
            textShadow: '0 6px 18px rgba(122,158,135,0.14)',
          }}
        >
          Mindscript
        </h1>
        <p style={{ fontSize: '13px', color: '#4E6759', marginTop: '4px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          Rewire your mind. One mindful script at a time.
        </p>
      </div>

      {/* Sign-in card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: `linear-gradient(158deg, rgba(253,255,254,0.99) 0%, rgba(245,252,248,0.975) 50%, rgba(238,247,243,0.98) 100%) padding-box,
            linear-gradient(112deg,
              ${toRgba(pastelStops[0], 0.28)} 0%,
              ${toRgba(pastelStops[1], 0.24)} 16%,
              ${toRgba(pastelStops[2], 0.24)} 32%,
              ${toRgba(pastelStops[3], 0.24)} 48%,
              ${toRgba(pastelStops[4], 0.24)} 64%,
              ${toRgba(pastelStops[5], 0.24)} 82%,
              ${toRgba(pastelStops[6], 0.24)} 100%) border-box`,
          backgroundSize: '100% 100%, 180% 180%',
          animation: 'none',
          borderRadius: '26px',
          border: '1px solid transparent',
          padding: '30px 26px',
          boxShadow: '0 18px 44px rgba(30,43,36,0.11), 0 6px 15px rgba(62,98,82,0.08), 0 0 0 1px rgba(255,255,255,0.74) inset',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: '25px',
            background: `linear-gradient(180deg, rgba(255,255,255,0.54) 0%, rgba(255,255,255,0.18) 36%, rgba(255,255,255,0.02) 100%),
              linear-gradient(124deg, ${toRgba(pastelStops[0], 0.08)} 0%, ${toRgba(pastelStops[2], 0.06)} 34%, ${toRgba(pastelStops[4], 0.06)} 67%, ${toRgba(pastelStops[1], 0.06)} 100%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '26px',
            background: `radial-gradient(62% 42% at 12% 6%, ${toRgba(pastelStops[0], 0.14)} 0%, rgba(255,255,255,0) 72%),
              radial-gradient(56% 40% at 88% 94%, ${toRgba(pastelStops[4], 0.12)} 0%, rgba(255,255,255,0) 72%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            top: -96,
            right: -86,
            background: `radial-gradient(circle, ${toRgba(pastelStops[1], 0.12)} 0%, rgba(255,255,255,0) 74%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 170,
            height: 170,
            borderRadius: '50%',
            bottom: -102,
            left: -84,
            background: `radial-gradient(circle, ${toRgba(pastelStops[4], 0.11)} 0%, rgba(255,255,255,0) 74%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(92% 48% at 50% -10%, rgba(122,158,135,0.12) 0%, rgba(122,158,135,0) 100%)',
            animation: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '9999px',
              marginBottom: '10px',
              background: 'rgba(250,253,251,0.9)',
              border: '1px solid rgba(122,158,135,0.18)',
              color: '#4A6056',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {emailMode === 'signup' ? 'Sign Up' : emailMode === 'forgot' ? 'Password Reset' : 'Sign In'}
          </div>

        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 500,
            color: '#203129',
            marginBottom: '4px',
            textShadow: 'none',
          }}
        >
          {emailMode === "signup" ? "Create your account" : emailMode === "forgot" ? "Reset password" : "Welcome back"}
        </h2>
        <p style={{ fontSize: '13px', color: '#4F655B', marginBottom: '22px', fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500 }}>
          {emailMode === "signup"
            ? "Start your mindfulness journey today."
            : emailMode === "forgot"
            ? "Enter your email and we'll send a reset link."
            : "Sign in to continue your program."}
        </p>

        {/* Forgot password flow */}
        {emailMode === "forgot" && (
          <>
            {resetSent ? (
              <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>&#128236;</div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#2C3530', marginBottom: '8px' }}>Check your inbox</p>
                <p style={{ fontSize: '13px', color: '#5E6B64', lineHeight: 1.6, marginBottom: '20px' }}>
                  A reset link was sent to <strong>{email}</strong>. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => { setEmailMode('signin'); setResetSent(false); setGeneralError(''); }}
                  className="auth-link-btn"
                  style={{ ...linkBtnStyle, cursor: 'pointer', opacity: 1 }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {generalError && (
                  <div style={{ padding: '11px 14px', marginBottom: '16px', borderRadius: '10px', background: '#FFE8E8', color: '#C41E3A', fontSize: '13px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    {generalError}
                  </div>
                )}
                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  error={errors.email}
                  disabled={busy}
                  inputStyle={{ borderRadius: '16px' }}
                />
                <Btn
                  onClick={handleForgotPassword}
                  disabled={busy}
                  style={{ width: '100%', marginTop: '8px', opacity: busy ? 0.8 : 1 }}
                >
                  {busy ? 'Sending...' : 'Send Reset Email'}
                </Btn>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    onClick={() => { if (busy) return; setEmailMode('signin'); setGeneralError(''); setErrors({}); }}
                    className="auth-link-btn"
                    style={linkBtnStyle}
                  >
                    Back to sign in
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Normal sign-in / sign-up flow */}
        {emailMode !== "forgot" && (<>

          {/* Error banner */}
          {generalError && (
            <div
              style={{
                padding: "11px 14px", marginBottom: "16px", borderRadius: "10px",
                background: errorType === "info" ? "#FFF9E6" : "#FFE8E8",
                color: errorType === "info" ? "#8B6F00" : "#C41E3A",
                fontSize: "13px", fontFamily: "'DM Sans', system-ui, sans-serif",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              <span style={{ flex: 1 }}>{generalError}</span>
              <button
                onClick={() => setGeneralError("")}
                className="auth-link-btn"
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.7, fontSize: "18px", lineHeight: 1, padding: "2px" }}
              >
                x
              </button>
            </div>
          )}

          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
            disabled={busy}
            inputStyle={{ borderRadius: '16px' }}
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 characters"
            error={errors.password}
            disabled={busy}
            inputStyle={{ borderRadius: '16px' }}
          />

          {emailMode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '12px' }}>
              <button
                onClick={() => { if (busy) return; setEmailMode('forgot'); setGeneralError(''); setErrors({}); setResetSent(false); }}
                className="auth-link-btn"
                style={{
                  ...linkBtnStyle,
                  fontSize: '12px',
                  textDecoration: 'none',
                  color: '#6C8376',
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Btn
            onClick={handleEmailLogin}
            disabled={busy}
            style={{
              width: "100%",
              marginTop: "8px",
              opacity: busy ? 0.84 : 1,
              boxShadow: '0 12px 26px rgba(44,53,48,0.2), 0 0 20px rgba(122,158,135,0.4)',
            }}
          >
            {busy
              ? emailMode === "signup" ? "Creating account..." : "Signing in..."
              : emailMode === "signup" ? "Create Account" : "Sign In"}
          </Btn>

          {emailAuthPending && (
            <p style={{ fontSize: "12px", color: "#6E7F76", textAlign: "center", marginTop: "10px" }}>
              Signing you in, please wait...
            </p>
          )}

          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <button
              onClick={() => { if (busy) return; setEmailMode(m => m === "signup" ? "signin" : "signup"); setGeneralError(""); setErrors({}); }}
              className="auth-link-btn"
              style={linkBtnStyle}
            >
              {emailMode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(122,158,135,0.05), rgba(122,158,135,0.4), rgba(122,158,135,0.05))' }} />
            <span style={{ fontSize: "12px", color: "#6A7E73", fontWeight: 600 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(122,158,135,0.05), rgba(122,158,135,0.4), rgba(122,158,135,0.05))' }} />
          </div>

          {/* Google sign-in */}
          <Btn
            onClick={handleGoogleLogin}
            variant="ghost"
            disabled={busy}
            style={{
              width: '100%',
              fontSize: '14px',
              minHeight: '46px',
              opacity: busy ? 0.78 : 1,
            }}
          >
            <GoogleIcon />
            {busy ? "Redirecting to Google..." : "Continue with Google"}
          </Btn>

          <p style={{ fontSize: '11px', color: '#718679', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
            By continuing, you agree to Mindscript's Terms of Service and Privacy Policy.
          </p>
        </>)}
        </div>
      </div>

      {/* New user shortcut */}
      <div style={{ marginTop: '20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '12px', color: '#6E8377', marginBottom: '8px' }}>New here? No account needed to try it out.</p>
        <Btn
          onClick={() => { if (busy) return; onNext(); }}
          variant="soft"
          disabled={busy}
          style={{
            fontSize: '13px',
            minHeight: '42px',
            padding: '10px 24px',
          }}
        >
          Get Started - Free (no sign-in required)
        </Btn>
      </div>
    </div>
  );
};

export default LoginScreen;
