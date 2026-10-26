import React from 'react';

interface SbsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean;
  className?: string;
}

export const SbsLogo: React.FC<SbsLogoProps> = ({
  size = 'md',
  showText = true,
  inverted = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base font-bold' },
    md: { icon: 38, text: 'text-xl font-bold' },
    lg: { icon: 56, text: 'text-2xl font-black' },
    xl: { icon: 84, text: 'text-4xl font-black tracking-tight' },
  };

  const { icon: px, text: textClass } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SBS Iconic Dual-Color "S" Emblem */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
      >
        {/* Outer Circular Rim */}
        <circle cx="50" cy="50" r="48" fill={inverted ? '#FFFFFF' : '#F8FAFC'} stroke="#E2E8F0" strokeWidth="2" />
        
        {/* Purple Top Loop of "S" */}
        <path
          d="M 68 32 C 68 25 58 20 48 20 C 35 20 28 26 28 35 C 28 47 48 45 55 50 C 62 55 64 62 62 70 C 58 80 43 82 32 80"
          stroke="#5B2384"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Orange Bottom Loop of "S" (Overlapping dynamic stroke) */}
        <path
          d="M 32 68 C 32 75 42 80 52 80 C 65 80 72 74 72 65 C 72 53 52 55 45 50 C 38 45 36 38 38 30 C 42 20 57 18 68 20"
          stroke="#FF7A00"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle center dynamic curve */}
        <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`${textClass} ${inverted ? 'text-white' : 'text-slate-900'} tracking-tight`}>
            SBS <span className="text-orange-500 font-extrabold">Pro</span>
          </span>
          {size === 'xl' && (
            <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">
              Telecom &amp; Financial System
            </span>
          )}
        </div>
      )}
    </div>
  );
};
