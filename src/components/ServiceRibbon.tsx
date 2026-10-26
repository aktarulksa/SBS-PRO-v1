import React from 'react';
import { Globe, Zap, Receipt, Landmark } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type ServiceMode = 'all_recharge' | 'bkash' | 'rocket' | 'nagad' | 'billpay_1' | 'billpay_2' | 'drive';

interface ServiceRibbonProps {
  activeService: ServiceMode;
  onSelectService: (service: ServiceMode) => void;
}

export const ServiceRibbon: React.FC<ServiceRibbonProps> = ({ activeService, onSelectService }) => {
  const services: { id: ServiceMode; label: string; icon: React.ReactNode; color: string; badgeText?: string }[] = [
    {
      id: 'all_recharge',
      label: 'Recharge',
      icon: (
        <div className="w-11 h-11 rounded-full border-2 border-emerald-600 flex items-center justify-center bg-white shadow-sm">
          <Globe className="w-6 h-6 text-emerald-600" />
        </div>
      ),
      color: 'text-emerald-700'
    },
    {
      id: 'bkash',
      label: 'bKash',
      icon: (
        <div className="w-11 h-11 rounded-full border-2 border-[#E2136E] flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
          {/* bKash origami bird SVG replica */}
          <svg viewBox="0 0 100 100" className="w-7 h-7 text-[#E2136E]" fill="currentColor">
            <polygon points="50,15 90,45 65,55 50,30" />
            <polygon points="50,30 65,55 35,55" fill="#C2105E" />
            <polygon points="35,55 10,45 50,15" />
            <polygon points="35,55 50,85 65,55" />
          </svg>
        </div>
      ),
      color: 'text-[#E2136E]'
    },
    {
      id: 'rocket',
      label: 'Rocket',
      icon: (
        <div className="w-11 h-11 rounded-full border-2 border-purple-700 flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
          {/* Rocket rainbow circle replica */}
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center border border-purple-300">
            <span className="text-[10px] font-black text-purple-700 tracking-tighter">DBBL</span>
          </div>
        </div>
      ),
      color: 'text-purple-700'
    },
    {
      id: 'nagad',
      label: 'Nagad',
      icon: (
        <div className="w-11 h-11 rounded-full border-2 border-orange-500 flex items-center justify-center bg-white shadow-sm overflow-hidden p-1">
          <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-[11px] font-bold">
            নগদ
          </div>
        </div>
      ),
      color: 'text-orange-600'
    },
    {
      id: 'billpay_1',
      label: 'Bill Pay 1',
      icon: (
        <div className="w-11 h-11 rounded-full bg-[#0088B4] text-white flex items-center justify-center font-black italic tracking-tighter shadow-sm text-sm border-2 border-[#007096]">
          BIL
        </div>
      ),
      color: 'text-[#0088B4]'
    },
    {
      id: 'billpay_2',
      label: 'Bill Pay 2',
      icon: (
        <div className="w-11 h-11 rounded-full bg-[#0088B4] text-white flex items-center justify-center font-black italic tracking-tighter shadow-sm text-sm border-2 border-[#007096]">
          BIL
        </div>
      ),
      color: 'text-[#0088B4]'
    },
    {
      id: 'drive',
      label: 'Drive Packs',
      icon: (
        <div className="w-11 h-11 rounded-full border-2 border-amber-500 bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
          <Zap className="w-6 h-6 fill-amber-500" />
        </div>
      ),
      color: 'text-amber-600'
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-3 overflow-x-auto scrollbar-none shadow-xs">
      <div className="flex items-center justify-between min-w-max gap-4 sm:gap-6 px-1 mx-auto max-w-xl">
        {services.map((s) => {
          const isSelected = activeService === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                soundManager.playClick();
                onSelectService(s.id);
              }}
              className={`flex flex-col items-center gap-1 group transition-transform active:scale-95 cursor-pointer ${
                isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className={`relative transition-all duration-150 ${isSelected ? 'ring-2 ring-purple-600 ring-offset-2 rounded-full' : ''}`}>
                {s.icon}
              </div>
              <span className={`text-[11px] font-semibold text-center whitespace-nowrap ${isSelected ? 'text-purple-900 font-bold underline decoration-purple-600 underline-offset-4' : 'text-slate-600'}`}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
