import React, { useState } from 'react';
import ds from '@/styles/designSystem';


const plans = [
  {
    name: 'Basic',
    price: 'Free',
    features: [
      'Access to limited sessions',
      'Basic progress tracking',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$9.99/mo',
    features: [
      'Unlimited sessions',
      'Advanced progress analytics',
      'Personalized programs',
      'Priority support',
    ],
    cta: 'Upgrade Now',
    disabled: false,
  },
];

const Payments = ({ onClose, user, onUnlock }) => {
  const [success, setSuccess] = useState(false);
  // Simulate first 100 users logic (replace with real logic in production)
  const isBeta = true;

  // Simulate user info (replace with real user prop or context)
  const userInfo = user || { name: 'Test User', email: 'test@email.com' };

  const handleBetaSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSuccess(true);
      if (onUnlock) onUnlock();
    }, 900);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(44,53,48,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: ds.colors.sagePale,
          borderRadius: ds.radius.xl,
          padding: '2.5rem 1.5rem 2rem 1.5rem',
          minWidth: 320,
          maxWidth: 420,
          width: '95vw',
          boxShadow: ds.shadow.lg,
          position: 'relative',
          border: `1.5px solid ${ds.colors.sageLight}`,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: ds.colors.muted,
            cursor: 'pointer',
            fontFamily: ds.font.sans,
          }}
          aria-label="Close"
        >
          ×
        </button>
        {!success && (
          <>
            <h2
              style={{
                fontFamily: ds.font.serif,
                fontSize: 28,
                fontWeight: 500,
                color: ds.colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Early Beta Access
            </h2>
            <p
              style={{
                fontFamily: ds.font.sans,
                fontSize: 15,
                color: ds.colors.textSoft,
                marginBottom: 18,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              Congratulations! As one of the first 100 users, you get <b>free lifetime access</b> to all premium features.<br />
              You’ll help us shape the future of Mindscript as a beta tester.
            </p>
            <form onSubmit={handleBetaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
              <input
                type="text"
                value={userInfo.name}
                disabled
                style={{
                  fontFamily: ds.font.sans,
                  fontSize: 15,
                  padding: '12px 14px',
                  borderRadius: ds.radius.md,
                  border: `1.5px solid ${ds.colors.sageLight}`,
                  background: ds.colors.surfaceAlt,
                  color: ds.colors.textSoft,
                  opacity: 0.85,
                }}
              />
              <input
                type="email"
                value={userInfo.email}
                disabled
                style={{
                  fontFamily: ds.font.sans,
                  fontSize: 15,
                  padding: '12px 14px',
                  borderRadius: ds.radius.md,
                  border: `1.5px solid ${ds.colors.sageLight}`,
                  background: ds.colors.surfaceAlt,
                  color: ds.colors.textSoft,
                  opacity: 0.85,
                }}
              />
              <button
                type="submit"
                style={{
                  marginTop: 8,
                  padding: '12px 0',
                  border: 'none',
                  borderRadius: ds.radius.full,
                  background: ds.colors.sage,
                  color: '#fff',
                  fontWeight: 600,
                  fontFamily: ds.font.sans,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: ds.shadow.sm,
                  transition: 'background 0.2s',
                }}
              >
                Unlock Free Beta Access
              </button>
            </form>
            <p style={{ fontSize: 12, color: ds.colors.muted, marginTop: 18, textAlign: 'center' }}>
              <b>Note:</b> Payment integration for iOS/Android coming soon.<br />
              You’ll be notified when public plans launch.
            </p>
          </>
        )}
        {success && (
          <div style={{ textAlign: 'center', padding: '40px 0 30px 0' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: ds.colors.sage,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: ds.shadow.sm,
            }}>
              <span style={{ fontSize: 32, color: '#fff' }}>✓</span>
            </div>
            <h3 style={{ fontFamily: ds.font.serif, fontSize: 24, fontWeight: 500, color: ds.colors.text, marginBottom: 10 }}>Access Unlocked!</h3>
            <p style={{ fontSize: 15, color: ds.colors.textSoft, marginBottom: 18 }}>You now have free access to all premium features as a beta tester.</p>
            <button
              style={{
                padding: '12px 32px',
                border: 'none',
                borderRadius: ds.radius.full,
                background: ds.colors.sage,
                color: '#fff',
                fontWeight: 600,
                fontFamily: ds.font.sans,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: ds.shadow.sm,
                marginTop: 10,
              }}
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
