import React from 'react';
import { Country, Operator } from '../types';
import { BANGLADESH_OPERATORS, INDIA_OPERATORS } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface OperatorGridProps {
  country: Country;
  onSelectOperator: (operator: Operator) => void;
  onBack: () => void;
}

export const OperatorGrid: React.FC<OperatorGridProps> = ({
  country,
  onSelectOperator,
  onBack,
}) => {
  const operators = country.id === 'bd' ? BANGLADESH_OPERATORS : INDIA_OPERATORS;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Header bar matching Screenshot 4: "Bangladesh > Choose Operator:" */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2.5 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <h2 className="text-xs font-bold text-slate-700 tracking-wide">
          {country.name} &gt; Choose Operator:
        </h2>

        <div className="w-10" />
      </div>

      {/* 3-Column Operator Icon Grid (Exact layout from Screenshot 4) */}
      <div className="p-5 sm:p-7 grid grid-cols-3 gap-y-7 gap-x-2 sm:gap-x-6">
        {operators.map((op) => (
          <button
            key={op.id}
            onClick={() => {
              soundManager.playClick();
              onSelectOperator(op);
            }}
            className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
          >
            {/* Bright Orange Circle with ShortCode (GRA, ROB, BAN, TEL, AIR) matching Screenshot 4 */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF5500] border-2 border-emerald-600/80 p-0.5 flex items-center justify-center text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
              <span className="font-extrabold text-base sm:text-lg tracking-tight italic select-none drop-shadow-xs">
                {op.shortCode}
              </span>
            </div>

            {/* Operator Label in Orange/Brown matching Screenshot 4 */}
            <span className="mt-2 text-xs font-bold text-[#E65100] text-center tracking-tight group-hover:text-purple-900">
              {op.name}
            </span>
          </button>
        ))}
      </div>

      {/* Quick notice bar */}
      <div className="bg-orange-50/60 border-t border-orange-100 px-4 py-2.5 text-center text-[11px] text-orange-800 font-medium">
        ⚡ Instant auto-load to {country.name} numbers within 2-5 seconds
      </div>
    </div>
  );
};
