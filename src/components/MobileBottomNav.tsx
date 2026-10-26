import React from 'react';
import { ActiveTab } from '../types';
import { Smartphone, Clock, BarChart3, User, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingCount: number;
  userRole: 'admin' | 'agent';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  userRole,
}) => {
  const isQueueActive = activeTab === 'QUEUE' || activeTab === 'ADMIN APPROVALS';

  return (
    <div className="bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg shrink-0 z-30">
      {/* Tab 1: Recharge */}
      <button
        onClick={() => {
          soundManager.playClick();
          onTabChange('RECHARGE');
        }}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all cursor-pointer ${
          activeTab === 'RECHARGE' ? 'text-[#5B2384]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'RECHARGE' ? 'bg-purple-100' : ''
          }`}
        >
          <Smartphone className="w-5 h-5" />
        </div>
        <span>Recharge</span>
      </button>

      {/* Tab 2: Queue */}
      <button
        onClick={() => {
          soundManager.playClick();
          onTabChange('QUEUE');
        }}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all relative cursor-pointer ${
          isQueueActive ? 'text-[#5B2384]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all relative ${
            isQueueActive ? 'bg-purple-100' : ''
          }`}
        >
          <Clock className="w-5 h-5" />
          {pendingCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white ${
                userRole === 'admin' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </div>
        <span>{userRole === 'admin' ? 'Approvals' : 'Queue'}</span>
      </button>

      {/* Tab 3: Reports */}
      <button
        onClick={() => {
          soundManager.playClick();
          onTabChange('REPORTS');
        }}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all cursor-pointer ${
          activeTab === 'REPORTS' ? 'text-[#5B2384]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'REPORTS' ? 'bg-purple-100' : ''
          }`}
        >
          <BarChart3 className="w-5 h-5" />
        </div>
        <span>Reports</span>
      </button>

      {/* Tab 4: My Profile */}
      <button
        onClick={() => {
          soundManager.playClick();
          onTabChange('PROFILE');
        }}
        className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-all cursor-pointer ${
          activeTab === 'PROFILE' ? 'text-[#5B2384]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div
          className={`p-1 rounded-xl transition-all ${
            activeTab === 'PROFILE' ? 'bg-purple-100' : ''
          }`}
        >
          <User className="w-5 h-5" />
        </div>
        <span>My Profile</span>
      </button>
    </div>
  );
};
