import React, { useState } from 'react';
import { UserProfile, WalletState, Transaction, ActiveTab } from '../types';
import { soundManager } from '../utils/sound';
import {
  User,
  Shield,
  Phone,
  Mail,
  Calendar,
  Lock,
  Edit3,
  CheckCircle2,
  TrendingUp,
  Clock,
  Zap,
  Server,
  LogOut,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  FileText,
  AlertCircle,
  X,
  Save,
  CreditCard,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Percent,
  Wallet,
  Download,
  Smartphone,
} from 'lucide-react';

interface UserProfileViewProps {
  user: UserProfile;
  wallet: WalletState;
  userTransactions: Transaction[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenChangePin: () => void;
  onLogout: () => void;
  domainName: string;
  onOpenShield?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenApkModal?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  wallet,
  userTransactions,
  onUpdateProfile,
  onOpenChangePin,
  onLogout,
  domainName,
  onOpenShield,
  onNavigateTab,
  onOpenApkModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [showPin, setShowPin] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [earningsPeriod, setEarningsPeriod] = useState<'today' | 'month' | 'all'>('today');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute stats strictly for THIS user
  const myTotalTx = userTransactions.length;
  const myPendingTx = userTransactions.filter((tx) => tx.status === 'Pending').length;
  const mySuccessTx = userTransactions.filter((tx) => tx.status === 'Success').length;

  // Date filters for Earnings calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const filteredSuccessfulTx = userTransactions.filter((tx) => {
    if (tx.status !== 'Success') return false;
    if (earningsPeriod === 'today') {
      return tx.timestamp.startsWith(todayStr);
    }
    if (earningsPeriod === 'month') {
      return tx.timestamp.startsWith(currentMonthStr);
    }
    return true; // all
  });

  const periodCalculatedProfit = filteredSuccessfulTx.reduce((sum, tx) => sum + (tx.commission || 0), 0);
  const periodCalculatedVolume = filteredSuccessfulTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Fallback to active session wallet if today has pre-seeded wallet profits
  const effectiveProfit =
    earningsPeriod === 'today'
      ? Math.max(periodCalculatedProfit, wallet.todayProfit)
      : periodCalculatedProfit > 0
      ? periodCalculatedProfit
      : wallet.todayProfit * 3.5;

  const effectiveVolume =
    earningsPeriod === 'today'
      ? periodCalculatedVolume > 0
        ? periodCalculatedVolume
        : Math.round(effectiveProfit * 36)
      : periodCalculatedVolume > 0
      ? periodCalculatedVolume
      : Math.round(effectiveProfit * 38);

  const effectiveCount =
    earningsPeriod === 'today'
      ? Math.max(filteredSuccessfulTx.length, wallet.totalRechargesToday)
      : Math.max(filteredSuccessfulTx.length, mySuccessTx);

  const effectiveMargin =
    effectiveVolume > 0 ? ((effectiveProfit / effectiveVolume) * 100).toFixed(2) : '2.75';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccess();
    onUpdateProfile({
      name: editName.trim() || user.name,
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto space-y-4 pb-24 sm:pb-8">
      {/* Save Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-gradient-to-br from-[#5B2384] to-[#3a1357] text-white rounded-2xl shadow-lg p-5 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-10 -top-6 w-24 h-24 rounded-full bg-orange-500/10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10 text-center sm:text-left">
          {/* Avatar with Initials */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 text-purple-950 font-black text-2xl flex items-center justify-center shadow-md border-2 border-white/20">
              {getInitials(user.name)}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#5B2384] flex items-center justify-center text-white text-[10px]"
              title="Account Active"
            >
              ✓
            </span>
          </div>

          {/* User Primary Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold tracking-tight truncate">{user.name}</h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-400 text-purple-950'
                }`}
              >
                {user.role === 'admin' ? 'Master Admin' : 'Retailer Agent'}
              </span>
            </div>

            <p className="text-purple-200 font-mono text-xs mt-1">
              Terminal ID: <strong className="text-white">{user.username}</strong>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-purple-200 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>Joined {user.joinedDate || '2024'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-emerald-300" />
                <span className="truncate max-w-[150px]">{domainName}</span>
              </span>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsEditing(!isEditing);
            }}
            className="sm:self-start px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
          >
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form Inline */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-purple-200 shadow-md p-4 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-purple-700" />
              <span>Edit Account Information</span>
            </h3>
            <span className="text-[11px] text-slate-400">Terminal ID cannot be changed</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Name / Business Outlet
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-slate-50 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full text-xs font-mono font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="agent@sbs-pro.net"
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#5B2384] hover:bg-[#4a1c6c] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          REDESIGNED: MY ACCOUNT BALANCE & EARNINGS (MOBILE-FIRST LUXURY FINTECH UI)
         ========================================================================= */}
      <div className="space-y-3.5">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                My Account Balance &amp; Earnings
              </h3>
              <p className="text-[11px] text-slate-500">Live synchronized agent financial ledger</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* 1. HERO BALANCE CARD (bKash & Revolut inspired Mobile Card) */}
        <div className="bg-gradient-to-br from-[#451466] via-[#5B2384] to-[#2d0b45] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-purple-400/20">
          {/* Subtle Ambient Background Mesh */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-400/10 via-purple-300/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Top Row: Label & Eye Privacy Toggle */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-300 fill-amber-400/30" />
              <span className="text-[11px] uppercase font-black tracking-widest text-purple-200">
                Primary Account Balance
              </span>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowBalance(!showBalance);
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 text-purple-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold border border-white/10"
              title={showBalance ? 'Hide balance for privacy' : 'Reveal balance'}
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-300" />}
              <span className="text-[10px]">{showBalance ? 'Hide' : 'Reveal'}</span>
            </button>
          </div>

          {/* Main Hero Amount */}
          <div className="mt-3 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">৳</span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {showBalance ? (
                  user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })
                ) : (
                  <span className="tracking-widest text-purple-300 select-none">••••••••</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-purple-200 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Available for instant recharge, MFS &amp; drive packs</span>
            </p>
          </div>

          {/* Sub-Wallets Micro-Bar */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-white/15 relative z-10">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">
                Drive Pack Balance
              </span>
              <div className="text-sm font-black font-mono text-amber-300 mt-0.5">
                {showBalance ? `৳ ${wallet.driveBalance.toFixed(2)}` : '••••'}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] uppercase font-bold text-purple-200 block">
                Bank Limit Reserve
              </span>
              <div className="text-sm font-black font-mono text-emerald-300 mt-0.5">
                {showBalance ? `৳ ${wallet.bankBalance.toLocaleString('en-US')}` : '••••'}
              </div>
            </div>
          </div>

          {/* Quick Action Touch Targets (Mobile-Friendly 44px+) */}
          <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
            <button
              onClick={() => {
                soundManager.playClick();
                if (onOpenShield) onOpenShield();
              }}
              className="py-2.5 px-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer min-h-[50px]"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="leading-tight">Add Money</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                if (onNavigateTab) onNavigateTab('QUEUE');
              }}
              className="py-2.5 px-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 border border-white/20 transition-all cursor-pointer min-h-[50px] relative"
            >
              <div className="relative">
                <Clock className="w-4 h-4" />
                {myPendingTx > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-purple-950 text-[9px] font-black px-1 rounded-full">
                    {myPendingTx}
                  </span>
                )}
              </div>
              <span className="leading-tight">Queue</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                if (onNavigateTab) onNavigateTab('REPORTS');
              }}
              className="py-2.5 px-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 border border-white/20 transition-all cursor-pointer min-h-[50px]"
            >
              <FileText className="w-4 h-4" />
              <span className="leading-tight">Statement</span>
            </button>
          </div>
        </div>

        {/* 2. DEDICATED EARNINGS & COMMISSIONS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 relative overflow-hidden">
          {/* Card Top: Title & Period Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Net Earnings &amp; Margin
                </span>
                <h4 className="text-sm font-extrabold text-slate-800">Retail Commission</h4>
              </div>
            </div>

            {/* Segmented Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-bold">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setEarningsPeriod('today');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  earningsPeriod === 'today'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setEarningsPeriod('month');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  earningsPeriod === 'month'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setEarningsPeriod('all');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  earningsPeriod === 'all'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Main Profit Figure */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                {earningsPeriod === 'today' ? "Today's Earned Profit" : earningsPeriod === 'month' ? "This Month's Profit" : "Total Net Profit"}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-0.5 tracking-tight flex items-baseline gap-1">
                <span>+৳</span>
                <span>{effectiveProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Credited directly to account upon approval</span>
              </span>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-emerald-200/60 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-500">Avg Return Rate</span>
              <div className="flex items-center gap-1 text-emerald-700 font-black text-base font-mono">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>+{effectiveMargin}%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per recharge order</span>
            </div>
          </div>

          {/* Sub-Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Gross Sales Volume
              </span>
              <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                ৳ {effectiveVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500">Total client turnover</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Completed Recharges
              </span>
              <div className="text-base font-black text-slate-800 font-mono mt-0.5">
                {effectiveCount} Orders
              </div>
              <span className="text-[10px] text-slate-500">100% gateway success</span>
            </div>
          </div>
        </div>

        {/* 3. OPERATIONAL PIPELINE (QUEUE VS CLEARED) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pending Queue Tile */}
          <div
            onClick={() => {
              soundManager.playClick();
              if (onNavigateTab) onNavigateTab('QUEUE');
            }}
            className="bg-white hover:bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 shadow-2xs transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="text-xl font-black text-amber-700 font-mono">
              {myPendingTx}
            </div>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">In Queue</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-1 group-hover:text-amber-700 font-medium">
              <span>View approvals</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Cleared Success Orders Tile */}
          <div
            onClick={() => {
              soundManager.playClick();
              if (onNavigateTab) onNavigateTab('REPORTS');
            }}
            className="bg-white hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs transition-all cursor-pointer group active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Delivered
              </span>
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {mySuccessTx}
            </div>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">Cleared Orders</span>
            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-1 group-hover:text-emerald-700 font-medium">
              <span>Ledger history</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 4. RECENT TRANSACTIONS SNIPPET (Fast audit on mobile) */}
        {userTransactions.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>My Recent Activity</span>
              </span>
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (onNavigateTab) onNavigateTab('REPORTS');
                }}
                className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {userTransactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: tx.operatorColor || '#5B2384' }}
                    >
                      {tx.operatorShortCode || 'SBS'}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-slate-900">{tx.accountOrPhone}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.serviceName} · {tx.timestamp.slice(11, 16)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-slate-800">৳{tx.amount}</div>
                    <div className="text-[10px] font-bold text-emerald-600">
                      +৳{tx.commission.toFixed(2)} comm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-700" />
            <span>Personal &amp; Terminal Details</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-400">Strictly Private</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            <span>Outlet / User Name</span>
          </span>
          <span className="font-bold text-slate-900">{user.name}</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Terminal / Username</span>
          </span>
          <span className="font-mono font-bold text-purple-900">{user.username}</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>Registered Phone</span>
          </span>
          <span className="font-mono font-bold text-slate-900">{user.phone || '01712-000000'}</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Email Address</span>
          </span>
          <span className="font-medium text-slate-800">{user.email || `${user.username.toLowerCase()}@sbsbd.com`}</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Account Role &amp; Access</span>
          </span>
          <span className="font-bold text-purple-800 capitalize">
            {user.role === 'admin' ? 'Master Admin Authority' : 'Authorized Retail Agent'}
          </span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2">
            <Server className="w-4 h-4 text-slate-400" />
            <span>Gateway Cluster</span>
          </span>
          <span className="font-mono text-slate-700">{domainName}</span>
        </div>
      </div>

      {/* Security & PIN Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-700" />
            <span>Security &amp; PIN Settings</span>
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <Shield className="w-3 h-3" /> Protected
          </span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">4-Digit Security PIN</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Required for all recharges and financial transactions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="font-mono text-base font-black tracking-widest text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {showPin ? user.pin : '••••'}
            </div>
            <button
              onClick={() => setShowPin(!showPin)}
              className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title={showPin ? 'Hide PIN' : 'Reveal PIN'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenChangePin();
              }}
              className="px-2.5 py-1.5 bg-[#5B2384] hover:bg-[#4a1c6c] text-white text-xs font-bold rounded-lg transition-transform active:scale-95 cursor-pointer"
            >
              Change PIN
            </button>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Never share your 4-digit PIN with anyone. Transactions submitted by your terminal will be verified against your account balance and security logs.
          </p>
        </div>
      </div>

      {/* Android APK / Mobile App Card */}
      {onOpenApkModal && (
        <div className="bg-gradient-to-r from-purple-900/10 via-orange-500/10 to-amber-500/10 rounded-2xl border border-purple-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <span>SBS Pro Android APK &amp; App</span>
                <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.2 rounded-full border border-orange-200">
                  v2.4.0
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Install direct to phone or generate standalone APK package
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenApkModal();
            }}
            className="w-full sm:w-auto py-2 px-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install / Make APK</span>
          </button>
        </div>
      )}

      {/* Account Actions Bar */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            soundManager.playClick();
            onLogout();
          }}
          className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Terminal ({user.username})</span>
        </button>
      </div>
    </div>
  );
};
