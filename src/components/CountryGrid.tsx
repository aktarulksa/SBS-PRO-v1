import React from 'react';
import { COUNTRIES } from '../data/mockData';
import { Country } from '../types';
import { soundManager } from '../utils/sound';

interface CountryGridProps {
  onSelectCountry: (country: Country) => void;
}

export const CountryGrid: React.FC<CountryGridProps> = ({ onSelectCountry }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Header bar matching Screenshot 11: "Choose Country:" */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-center">
        <h2 className="text-xs font-bold text-slate-700 tracking-wide">
          Choose Country:
        </h2>
      </div>

      {/* 3-Column Circular Icons Grid (Exact layout from Screenshot 11) */}
      <div className="p-4 sm:p-6 grid grid-cols-3 gap-y-6 gap-x-2 sm:gap-x-6">
        {COUNTRIES.map((country) => (
          <button
            key={country.id}
            onClick={() => {
              soundManager.playClick();
              onSelectCountry(country);
            }}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Circular Border with Flag Art matching screenshot 11 */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-orange-500/80 p-0.5 flex items-center justify-center bg-white group-hover:border-purple-600 group-hover:shadow-md transition-all">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-50">
                {renderCountryGraphic(country.id, country.flagEmoji)}
              </div>
            </div>

            {/* Label in Green matching Screenshot 11 */}
            <span className="mt-2 text-xs font-semibold text-emerald-800 text-center tracking-tight group-hover:text-purple-900 line-clamp-1">
              {country.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Custom SVG graphic renderer for crisp circular country icons
function renderCountryGraphic(id: string, fallbackEmoji: string) {
  switch (id) {
    case 'bd':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#006A4E" />
          <circle cx="45" cy="50" r="22" fill="#F42A41" />
        </svg>
      );
    case 'in':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect y="0" width="100" height="33.3" fill="#FF9933" />
          <rect y="33.3" width="100" height="33.3" fill="#FFFFFF" />
          <rect y="66.6" width="100" height="33.4" fill="#138808" />
          <circle cx="50" cy="50" r="10" stroke="#000080" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'in-dth':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 bg-slate-50">
          <circle cx="50" cy="50" r="48" fill="#F1F5F9" />
          <path d="M30 65 L45 50 L55 58 L70 35" stroke="#1E40AF" strokeWidth="5" strokeLinecap="round" />
          <path d="M40 75 Q60 55 70 30" stroke="#DC2626" strokeWidth="4" fill="none" />
          <circle cx="70" cy="30" r="5" fill="#DC2626" />
          {/* Radio Waves */}
          <path d="M72 20 A 15 15 0 0 1 82 30" stroke="#DC2626" strokeWidth="3" fill="none" />
          <path d="M75 13 A 25 25 0 0 1 90 28" stroke="#DC2626" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'pk':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#01411C" />
          <rect x="0" y="0" width="28" height="100" fill="#FFFFFF" />
          <path d="M58 35 A 18 18 0 1 0 72 65 A 15 15 0 1 1 58 35 Z" fill="#FFFFFF" />
          <polygon points="68,46 72,40 76,46 70,42 78,42" fill="#FFFFFF" />
        </svg>
      );
    case 'np':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-white">
          <circle cx="50" cy="50" r="50" fill="#FFFFFF" />
          <path d="M30 20 L65 48 L45 48 L75 80 L30 80 Z" fill="#DC143C" stroke="#003893" strokeWidth="4" />
        </svg>
      );
    case 'mm':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect y="0" width="100" height="33.3" fill="#FECB00" />
          <rect y="33.3" width="100" height="33.3" fill="#34B233" />
          <rect y="66.6" width="100" height="33.4" fill="#EA2839" />
          <polygon points="50,30 55,44 70,44 58,53 62,68 50,59 38,68 42,53 30,44 45,44" fill="#FFFFFF" />
        </svg>
      );
    case 'sg':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect y="0" width="100" height="50" fill="#ED2939" />
          <rect y="50" width="100" height="50" fill="#FFFFFF" />
          <circle cx="28" cy="25" r="14" fill="#FFFFFF" />
          <circle cx="32" cy="25" r="14" fill="#ED2939" />
        </svg>
      );
    case 'my':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} y={i * 14.28} width="100" height="7.14" fill="#CC0000" />
          ))}
          <rect x="0" y="0" width="50" height="50" fill="#000066" />
          <circle cx="25" cy="25" r="14" fill="#FFCC00" />
          <circle cx="29" cy="25" r="12" fill="#000066" />
        </svg>
      );
    default:
      return (
        <div className="w-full h-full flex items-center justify-center text-3xl">
          {fallbackEmoji}
        </div>
      );
  }
}
