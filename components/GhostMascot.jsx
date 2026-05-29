'use client';

export default function GhostMascot({ size = 40, className = '' }) {
  return (
    <svg
      className={`ghost-mascot ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="ghostBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <path
        d="M32 8c-12 0-20 10-20 22v18c0 2 1 4 3 4 2 0 3-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2c2 0 3-2 3-4V30c0-12-8-22-20-22z"
        fill="url(#ghostBody)"
        stroke="#1B1B3A"
        strokeWidth="2"
      />
      <ellipse cx="24" cy="28" rx="5" ry="6" fill="#1B1B3A" />
      <ellipse cx="40" cy="28" rx="5" ry="6" fill="#1B1B3A" />
      <circle cx="26" cy="26" r="1.5" fill="#fff" />
      <circle cx="42" cy="26" r="1.5" fill="#fff" />
      <path d="M44 18 L52 14 L50 22 Z" fill="#1B1B3A" />
      <ellipse cx="50" cy="18" rx="4" ry="3" fill="none" stroke="#1B1B3A" strokeWidth="1.5" />
    </svg>
  );
}
