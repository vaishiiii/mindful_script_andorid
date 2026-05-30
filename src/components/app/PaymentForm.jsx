import React, { useState } from 'react';
import ds from '@/styles/designSystem';

const PaymentForm = ({ onBack, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [mode, setMode] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setError('');
      onSuccess();
    }, 1200);
  };

  return (
    <div style={{ padding: '0 2px' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: ds.colors.muted,
          fontSize: 22,
          cursor: 'pointer',
          marginBottom: 10,
        }}
        aria-label="Back"
      >
        ←
      </button>
      <h2 style={{ fontFamily: ds.font.serif, fontSize: 24, fontWeight: 500, color: ds.colors.text, marginBottom: 8 }}>Payment Details</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{
            fontFamily: ds.font.sans,
            fontSize: 15,
            padding: '12px 14px',
            borderRadius: ds.radius.md,
            border: `1.5px solid ${ds.colors.sageLight}`,
            outline: 'none',
            background: ds.colors.surface,
          }}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            fontFamily: ds.font.sans,
            fontSize: 15,
            padding: '12px 14px',
            borderRadius: ds.radius.md,
            border: `1.5px solid ${ds.colors.sageLight}`,
            outline: 'none',
            background: ds.colors.surface,
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => setMode('card')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: ds.radius.md,
              border: mode === 'card' ? `2px solid ${ds.colors.sage}` : `1.5px solid ${ds.colors.sageLight}`,
              background: mode === 'card' ? ds.colors.sagePale : ds.colors.surface,
              color: ds.colors.text,
              fontWeight: 600,
              fontFamily: ds.font.sans,
              cursor: 'pointer',
            }}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setMode('upi')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: ds.radius.md,
              border: mode === 'upi' ? `2px solid ${ds.colors.sage}` : `1.5px solid ${ds.colors.sageLight}`,
              background: mode === 'upi' ? ds.colors.sagePale : ds.colors.surface,
              color: ds.colors.text,
              fontWeight: 600,
              fontFamily: ds.font.sans,
              cursor: 'pointer',
            }}
          >
            UPI
          </button>
        </div>
        {mode === 'card' ? (
          <>
            <input
              type="text"
              placeholder="Card Number"
              value={card}
              onChange={e => setCard(e.target.value)}
              required
              maxLength={19}
              style={{
                fontFamily: ds.font.sans,
                fontSize: 15,
                padding: '12px 14px',
                borderRadius: ds.radius.md,
                border: `1.5px solid ${ds.colors.sageLight}`,
                outline: 'none',
                background: ds.colors.surface,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                required
                maxLength={5}
                style={{
                  flex: 1,
                  fontFamily: ds.font.sans,
                  fontSize: 15,
                  padding: '12px 14px',
                  borderRadius: ds.radius.md,
                  border: `1.5px solid ${ds.colors.sageLight}`,
                  outline: 'none',
                  background: ds.colors.surface,
                }}
              />
              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                required
                maxLength={4}
                style={{
                  flex: 1,
                  fontFamily: ds.font.sans,
                  fontSize: 15,
                  padding: '12px 14px',
                  borderRadius: ds.radius.md,
                  border: `1.5px solid ${ds.colors.sageLight}`,
                  outline: 'none',
                  background: ds.colors.surface,
                }}
              />
            </div>
          </>
        ) : (
          <input
            type="text"
            placeholder="UPI ID (e.g. name@bank)"
            required
            style={{
              fontFamily: ds.font.sans,
              fontSize: 15,
              padding: '12px 14px',
              borderRadius: ds.radius.md,
              border: `1.5px solid ${ds.colors.sageLight}`,
              outline: 'none',
              background: ds.colors.surface,
            }}
          />
        )}
        {error && <div style={{ color: ds.colors.error, fontSize: 13 }}>{error}</div>}
        <button
          type="submit"
          disabled={processing}
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
            cursor: processing ? 'not-allowed' : 'pointer',
            boxShadow: ds.shadow.sm,
            transition: 'background 0.2s',
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? 'Processing...' : 'Pay & Upgrade'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
