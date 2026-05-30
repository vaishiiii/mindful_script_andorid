import React, { useState } from 'react';
import { Btn, InputField, MindscriptLogo, GoogleIcon } from '@/components/ui';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/utils/auth';

const LoginScreen = ({ onNext }) => {
  const [emailMode, setEmailMode] = useState("signin"); // "signin" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errorType, setErrorType] = useState("error"); // "error" or "info"
  const [resetSent, setResetSent] = useState(false);

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
    setGeneralError("");
    setErrors({});
    try {
      const result = emailMode === 'signup'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);
      if (result.success) {
        return;
      } else {
        setGeneralError(result.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Email Auth Error:', error);
      setGeneralError('Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(155deg, #EAF3EC 0%, #F2F8F4 55%, #ECF5EE 100%)",
        padding: "40px 24px",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: "22px",
            background: "linear-gradient(135deg, #7A9E87, #4d7a61)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            boxShadow: "0 10px 32px rgba(122,158,135,0.42)",
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
            fontSize: "28px", fontWeight: 500, color: "#2C3530",
            letterSpacing: "-0.01em",
          }}
        >
          Mindscript
        </h1>
        <p style={{ fontSize: "13px", color: "#5E6B64", marginTop: "4px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          Rewire your mind. One mindful script at a time.
        </p>
      </div>

      {/* Sign-in card */}
      <div
        style={{
          width: "100%", maxWidth: 400,
          background: "#fff", borderRadius: "18px",
          padding: "32px 28px",
          boxShadow: "0 2px 24px rgba(44,53,48,0.08)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "24px", fontWeight: 500, color: "#2C3530", marginBottom: "4px",
          }}
        >
          {emailMode === "signup" ? "Create your account" : emailMode === "forgot" ? "Reset password" : "Welcome back"}
        </h2>
        <p style={{ fontSize: "13px", color: "#9BA8A0", marginBottom: "24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A9E87', fontSize: '13px', textDecoration: 'underline', fontFamily: "'DM Sans', system-ui, sans-serif" }}
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
                />
                <Btn
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Btn>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    onClick={() => { setEmailMode('signin'); setGeneralError(''); setErrors({}); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A9E87', fontSize: '13px', textDecoration: 'underline', fontFamily: "'DM Sans', system-ui, sans-serif" }}
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
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Min. 6 characters"
            error={errors.password}
          />

          {emailMode === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '12px' }}>
              <button
                onClick={() => { setEmailMode('forgot'); setGeneralError(''); setErrors({}); setResetSent(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BA8A0', fontSize: '12px', fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Btn
            onClick={handleEmailLogin}
            disabled={loading}
            style={{ width: "100%", marginTop: "8px", opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? emailMode === "signup" ? "Creating account..." : "Signing in..."
              : emailMode === "signup" ? "Create Account" : "Sign In"}
          </Btn>

          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <button
              onClick={() => { setEmailMode(m => m === "signup" ? "signin" : "signup"); setGeneralError(""); setErrors({}); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7A9E87", fontSize: "13px", textDecoration: "underline", fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {emailMode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#E8EDE9" }} />
            <span style={{ fontSize: "12px", color: "#9BA8A0", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#E8EDE9" }} />
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%", padding: "12px 18px", borderRadius: "9999px",
              background: "#fff", border: "1.5px solid #C4D8CB",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "14px", fontWeight: 500, color: "#2C3530",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <GoogleIcon />
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          <p style={{ fontSize: "11px", color: "#9BA8A0", textAlign: "center", marginTop: "16px", lineHeight: 1.6 }}>
            By continuing, you agree to Mindscript's Terms of Service and Privacy Policy.
          </p>
        </>)}
      </div>

      {/* New user shortcut */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9BA8A0", marginBottom: "8px" }}>New here? No account needed to try it out.</p>
        <button
          onClick={onNext}
          style={{
            background: "none", border: "1.5px solid #C4D8CB",
            borderRadius: "9999px", cursor: "pointer",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "13px", fontWeight: 500, color: "#7A9E87",
            padding: "10px 24px",
          }}
        >
          Get Started - Free (no sign-in required)
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
