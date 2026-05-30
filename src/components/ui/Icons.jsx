import React from 'react';

export const LockIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <rect x="2" y="6" width="10" height="7" rx="2" stroke="#9BA8A0" strokeWidth="1.3" fill="none" />
    <path d="M4.5 6V4a2.5 2.5 0 015 0v2" stroke="#9BA8A0" strokeWidth="1.3" strokeLinecap="round" fill="none" />
  </svg>
);

export const CheckIcon = ({ color = "#fff", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BackArrow = ({ color = "#9BA8A0", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const DownArrow = ({ color = "#9BA8A0" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3L8 13M8 13L4 9M8 13L12 9" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#2C3530">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.19 1.28-2.17 3.83.03 3.02 2.65 4.03 2.68 4.04l-.06.25zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export const MindscriptLogo = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <ellipse cx="17" cy="14" rx="8" ry="10" stroke="white" strokeWidth="1.8" fill="none" />
    <line x1="17" y1="24" x2="17" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="13.5" y1="28" x2="20.5" y2="28" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default {
  LockIcon,
  CheckIcon,
  BackArrow,
  DownArrow,
  GoogleIcon,
  AppleIcon,
  MindscriptLogo,
};
