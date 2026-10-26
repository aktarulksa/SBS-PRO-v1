import React, { useState } from 'react';
import { WalletState, UserProfile } from '../types';
import {
  X,
  Shield,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Send,
  Smartphone,
  Building,
  CreditCard,
  AlertCircle,
  Sparkles,
  Clock,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface BalanceShieldModalProps {
  wallet: WalletState;
  currentUser?: UserProfile;
  onClose: () => void;
  onAddFunds: (amount: number, target: 'main' | 'drive' | 'bank') => void;
  onRequestAddMoney?: (request: {
    amount: number;
    method: string;
    senderPhone: string;
    trxId: string;
    targetWallet: 'main' | 'drive' | 'bank';
    note?: string;
  }) => void;
  onNavigateToQueue?: () => void;
  pendingRequestsCount?: number;
}

export const BalanceShieldModal: React.FC<BalanceShieldModalProps> = ({
  wallet,
  currentUser,
  onClose,
  onAddFunds,
  onRequestAddMoney,
  onNavigateToQueue,
  pendingRequestsCount = 0,
}) => {
  const isAgent = currentUser?.role === 'agent';
  const [activeTab, setActiveTab] = useState<'request' | 'wallets'>(isAgent ? 'request' : 'wallets');

  // Request Form State
  const [reqMethod, setReqMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cash'>('bKash');
  const [reqTargetWallet, setReqTargetWallet] = useState<'main' | 'drive' | 'bank'>('main');
  const [reqAmount, setReqAmount] = useState<string>('5000');
  const [senderPhone, setSenderPhone] = useState<string>(currentUser?.phone || currentUser?.username || '');
  const [trxId, setTrxId] = useState<string>('');
  const [reqNote, setReqNote] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Admin Direct Deposit Form State
  const [adminAddAmount, setAdminAddAmount] = useState('5000');
  const [adminTargetWallet, setAdminTargetWallet] = useState<'main' | 'drive' | 'bank'>('main');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin official receiving accounts
  const ADMIN_ACCOUNTS = {
    bKash: { number: '01700-000001', type: 'Merchant / Personal', color: '#E2136E' },
    Nagad: { number: '01700-000001', type: 'Personal', color: '#F7941D' },
    Rocket: { number: '01700-000001-8', type: 'Personal', color: '#8C3494' },
    Bank: { number: '105-120-998811', bank: 'City Bank / DBBL', name: 'SBS Telecom Solutions', type: 'Current A/C', color: '#0F766E' },
  };

  const handleCopy = (text: string, label: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text.replace(/-/g, ''));
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    soundManager.playClick();
    setTimeout(() => {
      setIsRefreshing(false);
      soundManager.playSuccess();
    }, 600);
  };

  // Agent submits Add Money Request to Admin
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(reqAmount);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid deposit amount');
      soundManager.playError();
      return;
    }
    if (!trxId.trim()) {
      setFormError('Transaction ID (TrxID) is required for Admin verification');
      soundManager.playError();
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    soundManager.playSuccess();

    setTimeout(() => {
      setIsSubmitting(false);
      if (onRequestAddMoney) {
        onRequestAddMoney({
          amount: num,
          method: reqMethod,
          senderPhone: senderPhone.trim() || currentUser?.username || 'Retailer',
          trxId: trxId.trim().toUpperCase(),
          targetWallet: reqTargetWallet,
          note: reqNote.trim(),
        });
      }
      setRequestSubmitted(true);
    }, 500);
  };

  // Admin Direct Deposit handler
  const handleAdminDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(adminAddAmount);
    if (!isNaN(num) && num > 0) {
      soundManager.playSuccess();
      onAddFunds(num, adminTargetWallet);
    }
  };

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#4d1672] via-[#5B2384] to-[#3a0f58] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-400 text-purple-950 shadow-xs">
              <Shield className="w-5 h-5 fill-purple-950 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {isAgent ? 'Add Money Request to Admin' : 'Agent Wallet & Admin Shield'}
              </h2>
              <p className="text-[11px] text-purple-200">
                {isAgent ? 'Submit payment details for instant balance credit' : 'Gateway multi-wallet management & ledger'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 text-purple-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 border-b border-slate-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('request');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'request'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>{isAgent ? 'Add Money Request' : 'Deposit Request'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('wallets');
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'wallets'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-700" />
            <span>Multi-Wallet Balances</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: ADD MONEY REQUEST TO ADMIN */}
          {activeTab === 'request' && (
            <>
              {requestSubmitted ? (
                <div className="text-center py-6 px-3 space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Add Money Request Submitted!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Your deposit request of <strong className="text-emerald-700 font-mono text-sm">৳ {parseFloat(reqAmount).toLocaleString()}</strong> via {reqMethod} (TrxID: <span className="font-mono font-bold text-slate-800">{trxId}</span>) has been queued for Admin Approval.
                  </p>
                  <p className="text-[11px] text-purple-700 font-semibold bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                    ⚡ Your Primary Account Balance will be automatically credited the moment Admin clears it.
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        onClose();
                        if (onNavigateToQueue) onNavigateToQueue();
                      }}
                      className="px-4 py-2 bg-[#5B2384] hover:bg-[#4a1c6c] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                    >
                      View in Queue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setRequestSubmitted(false);
                        setTrxId('');
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      New Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {/* Notice banner */}
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px]">Retailer Balance Add Process</p>
                      <p className="text-[10px] text-amber-800 mt-0.5 leading-relaxed">
                        1. Send money to any of Admin's official payment accounts below.<br />
                        2. Copy the Transaction ID (TrxID) and submit the form.<br />
                        3. Admin verifies and credits your Primary Account Balance!
                      </p>
                    </div>
                  </div>

                  {/* Admin Official Payment Accounts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Admin Payment Receiving Numbers
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold">Tap to copy</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* bKash */}
                      <div
                        onClick={() => handleCopy(ADMIN_ACCOUNTS.bKash.number, 'bKash')}
                        className="p-2.5 bg-slate-50 hover:bg-pink-50/50 rounded-xl border border-slate-200 hover:border-pink-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-pink-700 text-[11px]">bKash (Send/Cash-in)</span>
                          {copiedAccount === 'bKash' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-pink-600" />
                          )}
                        </div>
                        <div className="font-mono font-black text-slate-800 text-xs mt-0.5">
                          {ADMIN_ACCOUNTS.bKash.number}
                        </div>
                        <span className="text-[9px] text-slate-400">Personal/Agent</span>
                      </div>

                      {/* Nagad */}
                      <div
                        onClick={() => handleCopy(ADMIN_ACCOUNTS.Nagad.number, 'Nagad')}
                        className="p-2.5 bg-slate-50 hover:bg-orange-50/50 rounded-xl border border-slate-200 hover:border-orange-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-600 text-[11px]">Nagad</span>
                          {copiedAccount === 'Nagad' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-orange-600" />
                          )}
                        </div>
                        <div className="font-mono font-black text-slate-800 text-xs mt-0.5">
                          {ADMIN_ACCOUNTS.Nagad.number}
                        </div>
                        <span className="text-[9px] text-slate-400">Personal</span>
                      </div>

                      {/* Rocket */}
                      <div
                        onClick={() => handleCopy(ADMIN_ACCOUNTS.Rocket.number, 'Rocket')}
                        className="p-2.5 bg-slate-50 hover:bg-purple-50/50 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-700 text-[11px]">Rocket (DBBL)</span>
                          {copiedAccount === 'Rocket' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                          )}
                        </div>
                        <div className="font-mono font-black text-slate-800 text-xs mt-0.5">
                          {ADMIN_ACCOUNTS.Rocket.number}
                        </div>
                        <span className="text-[9px] text-slate-400">DBBL Mobile</span>
                      </div>

                      {/* Bank Transfer */}
                      <div
                        onClick={() => handleCopy(ADMIN_ACCOUNTS.Bank.number, 'Bank')}
                        className="p-2.5 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-teal-800 text-[11px]">Bank (City/DBBL)</span>
                          {copiedAccount === 'Bank' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-teal-600" />
                          )}
                        </div>
                        <div className="font-mono font-black text-slate-800 text-xs mt-0.5">
                          {ADMIN_ACCOUNTS.Bank.number}
                        </div>
                        <span className="text-[9px] text-slate-400">SBS Telecom Solutions</span>
                      </div>
                    </div>
                  </div>

                  {/* Form: Payment Method Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Selected Payment Method
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['bKash', 'Nagad', 'Rocket', 'Bank'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setReqMethod(method);
                          }}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            reqMethod === method
                              ? 'bg-[#5B2384] text-white border-[#5B2384] shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form: Target Wallet */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Credit Into Wallet
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {[
                        { id: 'main', label: 'Primary Main' },
                        { id: 'drive', label: 'Drive Pack' },
                        { id: 'bank', label: 'Bank Limit' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setReqTargetWallet(item.id as any);
                          }}
                          className={`py-1.5 px-2 font-bold rounded-xl border transition-all cursor-pointer ${
                            reqTargetWallet === item.id
                              ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form: Amount Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700">Deposit Amount (৳)</label>
                      <span className="text-[10px] text-slate-400">Min ৳100 · No Fee</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-base font-extrabold text-slate-400 font-mono">
                        ৳
                      </span>
                      <input
                        type="number"
                        value={reqAmount}
                        onChange={(e) => setReqAmount(e.target.value)}
                        placeholder="5000"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                        required
                      />
                    </div>

                    {/* Quick Amount Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setReqAmount(amt.toString());
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer ${
                            reqAmount === amt.toString()
                              ? 'bg-amber-400 border-amber-400 text-purple-950 shadow-2xs'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          +{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sender Phone & Transaction ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Sender Mobile / A/C
                      </label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Transaction ID (TrxID)
                      </label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="e.g. 9K72B8LA"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-purple-950 focus:outline-none focus:border-purple-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Note / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="e.g. Sent from retailer counter phone"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>

                  {formError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#5B2384] hover:bg-[#4a1c6c] active:scale-98 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Request...' : 'Submit Add Money Request to Admin'}</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* TAB 2: MULTI-WALLET OVERVIEW */}
          {activeTab === 'wallets' && (
            <div className="space-y-4">
              {/* Primary Balance Highlight */}
              <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-200 block">
                    {currentUser?.role === 'admin' ? 'Master Gateway Balance' : 'My Primary Account Balance'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300 mt-1">
                    ৳ {currentUser ? currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : wallet.mainBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-purple-200 mt-2 pt-2 border-t border-purple-800/80">
                    <span>Today's Profit: <strong className="text-emerald-400">+৳{wallet.todayProfit.toFixed(2)}</strong></span>
                    <span>{wallet.totalRechargesToday} Orders Today</span>
                  </div>
                </div>
              </div>

              {/* Sub-Wallets */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Drive Pack Balance</span>
                  <div className="text-base font-extrabold text-slate-800 font-mono mt-0.5">
                    ৳ {wallet.driveBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-orange-600 font-semibold mt-1 block">Pack Discounts</span>
                </div>

                <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Bank Balance</span>
                  <div className="text-base font-extrabold text-slate-800 font-mono mt-0.5">
                    ৳ {wallet.bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-purple-600 font-semibold mt-1 block">DBBL / City Bank</span>
                </div>
              </div>

              {/* Admin Direct Fund Adjustment */}
              {currentUser?.role === 'admin' && (
                <form onSubmit={handleAdminDeposit} className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                  <div className="text-xs font-bold text-purple-900 flex justify-between items-center">
                    <span>Admin Direct Balance Adjustment</span>
                    <span className="text-[10px] text-purple-600 font-medium">Instant Gateway Credit</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['main', 'drive', 'bank'] as const).map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setAdminTargetWallet(w)}
                        className={`py-1 text-center font-bold capitalize rounded-lg border ${
                          adminTargetWallet === w ? 'bg-purple-900 text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={adminAddAmount}
                      onChange={(e) => setAdminAddAmount(e.target.value)}
                      className="w-full py-1.5 px-2.5 bg-white border border-purple-300 rounded-lg text-xs font-bold font-mono"
                      placeholder="Amount"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer shrink-0"
                    >
                      Credit Fund
                    </button>
                  </div>
                </form>
              )}

              {/* Queue Shortcut if Admin */}
              {currentUser?.role === 'admin' && pendingRequestsCount > 0 && (
                <div
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                    if (onNavigateToQueue) onNavigateToQueue();
                  }}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-amber-900">
                      {pendingRequestsCount} Balance Request(s) Pending Review
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-700" />
                </div>
              )}

              {/* Hardware Protection Box */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-[11px]">Hardware &amp; Shield Protected</p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">
                    Terminal ID {currentUser?.username || '017XXXXXXXX'} · Server SSL 256-Bit
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-3 text-center shrink-0">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
