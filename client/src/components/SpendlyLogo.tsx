import React from 'react';

interface SpendlyLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  lightText?: boolean;
}

export const SpendlyLogo: React.FC<SpendlyLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  lightText = false,
}) => {
  const sizeClasses = {
    sm: variant === 'full' ? 'h-7 w-auto' : 'h-7 w-7',
    md: variant === 'full' ? 'h-9 w-auto' : 'h-9 w-9',
    lg: variant === 'full' ? 'h-12 w-auto' : 'h-12 w-12',
    xl: variant === 'full' ? 'h-16 w-auto' : 'h-16 w-16',
    custom: '',
  };

  const selectedSize = sizeClasses[size];

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${selectedSize} ${className} flex-shrink-0 select-none`}
      >
        <defs>
          <linearGradient id="spendlyIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4338ca" floodOpacity="0.35" />
          </filter>
        </defs>

        <rect x="5" y="5" width="90" height="90" rx="26" fill="url(#spendlyIconGrad)" filter="url(#shadow)" />
        <rect x="6" y="6" width="88" height="88" rx="25" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M50 20 C50 36.5 36.5 50 20 50 C36.5 50 50 63.5 50 80 C50 63.5 63.5 50 80 50 C63.5 50 50 36.5 50 20 Z" fill="url(#sparkleGrad)" />
        <path d="M68 24 C68 29.5 63.5 34 58 34 C63.5 34 68 38.5 68 44 C68 38.5 72.5 34 78 34 C72.5 34 68 29.5 68 24 Z" fill="#ffffff" opacity="0.85" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${selectedSize} ${className} select-none`}
    >
      <defs>
        <linearGradient id="spendlyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="logoSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4338ca" floodOpacity="0.3" />
        </filter>
      </defs>

      <g transform="translate(4, 4)">
        <rect x="0" y="0" width="72" height="72" rx="20" fill="url(#spendlyLogoGrad)" filter="url(#logoShadow)" />
        <rect x="1" y="1" width="70" height="70" rx="19" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
        <path d="M36 14 C36 26.2 26.2 36 14 36 C26.2 36 36 45.8 36 58 C36 45.8 45.8 36 58 36 C45.8 36 36 26.2 36 14 Z" fill="url(#logoSparkleGrad)" />
        <path d="M50 17 C50 21.1 46.6 24.5 42.5 24.5 C46.6 24.5 50 27.9 50 32 C50 27.9 53.4 24.5 57.5 24.5 C53.4 24.5 50 21.1 50 17 Z" fill="#ffffff" opacity="0.85" />
      </g>

      <text
        x="94"
        y="53"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="44"
        fontWeight="800"
        letterSpacing="-1"
        fill={lightText ? '#ffffff' : '#0b1c30'}
      >
        Spendly
      </text>

      <circle cx="288" cy="22" r="4.5" fill="#4f46e5" />
    </svg>
  );
};
