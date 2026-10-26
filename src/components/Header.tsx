import React, { useState } from 'react';
import { ActiveTab, WalletState } from '../types';
import { Home, Shield, Volume2, VolumeX, Smartphone, Monitor, User, Clock, FileText, ChevronRight, Download } from 'lucide-react';
import { SbsLogo } from './SbsLogo';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  wallet: WalletState;
  userBalance?: number;
  onOpenShield: () => void;
  onResetHome: () => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  domainName: string;
  currentUserRole: 'admin' | 'agent';
  currentUserName: string;
  pendingApprovalsCount: number;
  onOpenApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  wallet,
  userBalance,
  onOpenShield,
  onResetHome,
  isMobileView,
  onToggleMobileView,
  soundMuted,
  onToggleSound,
  domainName,
  currentUserRole,
  currentUserName,
  pendingApprovalsCount,
  onOpenApkModal,
}) => {
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const displayBalance = userBalance !== undefined ? userBalance : wallet.mainBalance;

  const toggleBalanceReveal = () => {
    soundManager.playClick();
    setBalanceRevealed(!balanceRevealed);
  };

  return (
    <header className="sticky top-0 z-40 select-none shadow-md">
      {/* Top Mobile Status Bar (Simulated Android Status Bar from Screenshot) */}
      <div className="bg-[#481a69] text-purple-200 text-[11px] px-4 py-1 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span>2:59 PM</span>
          <span className="hidden sm:inline text-purple-300">45.8K/s</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] hidden sm:inline uppercase">robi axiata 4G</span>
          <span className="text-emerald-300">📶 100%</span>
          <span>🔋 85%</span>
        </div>
      </div>

      {/* Main Purple Header Bar */}
      <div className="bg-[#5B2384] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Home Button with Red Roof Home Icon */}
        <button
          onClick={() => {
            soundManager.playClick();
            onResetHome();
          }}
          title="Return to Home Screen"
          className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer shrink-0"
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Home className="w-5 h-5 text-amber-200 stroke-[2.2]" />
          </div>
        </button>

        {/* Center: SBS Pro Branding & Logo */}
        <div
          onClick={() => {
            soundManager.playClick();
            onResetHome();
          }}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <SbsLogo size="sm" showText={false} inverted />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
            SBS <span className="text-amber-400">Pro</span>
          </span>
          <span
            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
              currentUserRole === 'admin'
                ? 'bg-red-500 text-white'
                : 'bg-purple-800 text-purple-200'
            }`}
          >
            {currentUserRole === 'admin' ? 'ADMIN' : 'AGENT'}
          </span>
        </div>

        {/* Center-Right: Interactive "Tap for Balance" pill for fast mobile access */}
        <button
          onClick={toggleBalanceReveal}
          title="Tap to reveal or hide balance"
          className="hidden xs:flex items-center gap-1.5 bg-white/15 hover:bg-white/20 active:scale-95 text-xs font-bold text-amber-300 px-3 py-1 rounded-full border border-white/15 transition-all cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-mono">
            {balanceRevealed ? `৳ ${displayBalance.toFixed(2)}` : 'Tap for Balance'}
          </span>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">

          {/* APK App / Android Install Button */}
          {onOpenApkModal && (
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenApkModal();
              }}
              title="Download APK / Install Android App"
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm border border-amber-300/40 transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span className="font-mono">APK</span>
            </button>
          )}

          {/* User Profile Shortcut Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('PROFILE');
            }}
            title="View My Profile & Details"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
              activeTab === 'PROFILE'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'hover:bg-white/10 text-amber-300 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline font-mono">{currentUserName.slice(0, 10)}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick();
            }}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Mobile / Desktop Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleMobileView();
            }}
            title={isMobileView ? 'Switch to Desktop Portal' : 'Switch to Mobile App View'}
            className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/10 text-purple-200 hover:text-white transition-colors items-center gap-1 text-xs cursor-pointer"
          >
            {isMobileView ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar (User friendly, responsive) */}
      <nav className="bg-slate-50 border-b border-slate-200">
        <div className="flex text-center font-bold text-xs sm:text-sm">
          {/* Recharge Tab */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('RECHARGE');
            }}
            className={`flex-1 py-2.5 sm:py-3 px-2 uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'RECHARGE'
                ? 'text-purple-900 bg-white font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>RECHARGE</span>
            {activeTab === 'RECHARGE' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-purple-700 shadow-sm" />
            )}
          </button>

          {/* Queue Tab (For Agent: MY QUEUE, For Admin: APPROVALS) */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('QUEUE');
            }}
            className={`flex-1 py-2.5 sm:py-3 px-2 uppercase tracking-wider transition-colors relative cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'QUEUE' || activeTab === 'ADMIN APPROVALS'
                ? 'text-purple-900 bg-white font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{currentUserRole === 'admin' ? 'APPROVALS' : 'MY QUEUE'}</span>
            {pendingApprovalsCount > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse ${
                  currentUserRole === 'admin' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {pendingApprovalsCount}
              </span>
            )}
            {(activeTab === 'QUEUE' || activeTab === 'ADMIN APPROVALS') && (
              <span
                className={`absolute bottom-0 left-0 right-0 h-1 shadow-sm ${
                  currentUserRole === 'admin' ? 'bg-red-600' : 'bg-purple-700'
                }`}
              />
            )}
          </button>

          {/* Reports Tab */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('REPORTS');
            }}
            className={`flex-1 py-2.5 sm:py-3 px-2 uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'REPORTS'
                ? 'text-purple-900 bg-white font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>REPORTS</span>
            {activeTab === 'REPORTS' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-purple-700 shadow-sm" />
            )}
          </button>

          {/* User Profile Tab */}
          <button
            onClick={() => {
              soundManager.playClick();
              onTabChange('PROFILE');
            }}
            className={`flex-1 py-2.5 sm:py-3 px-2 uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'text-purple-900 bg-white font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>MY PROFILE</span>
            {activeTab === 'PROFILE' && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-purple-700 shadow-sm" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};
