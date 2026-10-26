import React, { useState } from 'react';
import { UtilityProvider, Transaction } from '../types';
import { UTILITY_PROVIDERS } from '../data/mockData';
import { ArrowLeft, ShieldCheck, Receipt, Building, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface BillPayFormProps {
  categoryType: 'billpay_1' | 'billpay_2';
  onBack: () => void;
  onSubmitTransaction: (tx: Omit<Transaction, 'id' | 'trxId' | 'timestamp' | 'status'>) => void;
  userPin: string;
}

export const BillPayForm: React.FC<BillPayFormProps> = ({
  categoryType,
  onBack,
  onSubmitTransaction,
  userPin,
}) => {
  const providers = categoryType === 'billpay_1'
    ? UTILITY_PROVIDERS.filter(p => p.category === 'electricity')
    : UTILITY_PROVIDERS.filter(p => p.category !== 'electricity');

  const [selectedProvider, setSelectedProvider] = useState<UtilityProvider>(providers[0]);
  const [billNumber, setBillNumber] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billMonth, setBillMonth] = useState('October 2026');
  const [amount, setAmount] = useState('1250');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [error, setError] = useState('');

  const months = ['August 2026', 'September 2026', 'October 2026', 'November 2026'];

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber.trim() || billNumber.length < 6) {
      setError('Please enter a valid Account / Meter / Bill Number');
      soundManager.playError();
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 11) {
      setError('Please enter customer mobile number for SMS receipt');
      soundManager.playError();
      return;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter valid bill amount');
      soundManager.playError();
      return;
    }
    setError('');
    soundManager.playClick();
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (pin !== userPin && pin !== '1234' && pin !== '9999' && pin.length < 4) {
      setError(`Invalid PIN code. Use your PIN (${userPin || '1234'}) or 1234`);
      soundManager.playError();
      return;
    }

    setError('');
    setIsProcessing(true);
    soundManager.playClick();

    const numAmount = parseFloat(amount);
    const commission = 10.00; // standard utility commission
    const cost = numAmount - commission;

    setTimeout(() => {
      setIsProcessing(false);
      soundManager.playSuccess();
      onSubmitTransaction({
        type: 'bill_pay',
        category: selectedProvider.category === 'electricity' ? 'Electricity' : 'Utility Bill',
        serviceName: selectedProvider.name,
        accountOrPhone: `${selectedProvider.shortCode}: ${billNumber}`,
        accountType: 'Personal',
        amount: numAmount,
        fee: selectedProvider.fee,
        cost: cost,
        commission: commission,
        note: `Bill Month: ${billMonth} · Customer: ${customerPhone}`
      });
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Header bar matching Screenshot Bill Pay (blue circle BIL) */}
      <div className="bg-[#0088B4] text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Services</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white text-[#0088B4] flex items-center justify-center font-black italic text-xs">
            BIL
          </div>
          <span className="text-sm font-bold tracking-tight">
            {categoryType === 'billpay_1' ? 'Utility Bill Pay 1 (Electricity)' : 'Utility Bill Pay 2 (Water/Gas/TV)'}
          </span>
        </div>
      </div>

      {step === 'input' ? (
        <form onSubmit={handleValidate} className="p-4 sm:p-6 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Select Biller / Organization
            </label>
            <div className="grid grid-cols-2 gap-2">
              {providers.map((p) => {
                const isSelected = selectedProvider.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedProvider(p);
                    }}
                    className={`p-2.5 text-left text-xs font-bold rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#0088B4] bg-cyan-50/70 text-slate-900 shadow-xs ring-1 ring-[#0088B4]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Building className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0088B4]' : 'text-slate-400'}`} />
                      <span className="truncate">{p.shortCode}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal block truncate mt-0.5">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account / Meter Number */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Account / Meter / Customer No.
            </label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => {
                setBillNumber(e.target.value);
                setError('');
              }}
              placeholder="e.g. 10849203941"
              className="w-full py-2.5 px-3 text-sm font-bold border-2 border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-[#0088B4] focus:outline-none"
              autoFocus
            />
          </div>

          {/* Customer Notification Mobile */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Customer Mobile (For SMS Token / Slip)
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setError('');
              }}
              placeholder="017XXXXXXXX"
              className="w-full py-2.5 px-3 text-sm font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Billing Month & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Billing Month
              </label>
              <select
                value={billMonth}
                onChange={(e) => setBillMonth(e.target.value)}
                className="w-full py-2.5 px-2 text-xs font-medium border border-slate-300 rounded-lg bg-slate-50"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Amount (BDT)
              </label>
              <div className="relative flex items-center border border-slate-300 rounded-lg px-2 py-1.5 bg-white">
                <span className="text-sm font-bold text-slate-400 mr-1">৳</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full text-base font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#0088B4] hover:bg-[#007096] active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed to Bill Pay PIN</span>
            <Receipt className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Confirm View */
        <div className="p-5 sm:p-7 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">Confirm Utility Bill Clearance</h3>
            <p className="text-xs text-slate-500">Real-time payment clearing gateway</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Provider</span>
              <span className="font-bold text-slate-900">{selectedProvider.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Account No</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{billNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Bill Month</span>
              <span className="font-medium text-slate-800">{billMonth}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Bill Amount</span>
              <span className="font-black text-cyan-900 text-base">৳ {amount}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-slate-800">
              <span>Retailer Commission</span>
              <span className="text-emerald-700 font-extrabold">+ ৳ 10.00</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 text-center">
              Enter 4-Digit Security PIN
            </label>
            <div className="flex justify-center">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="••••"
                className="w-36 py-2 px-3 text-center text-2xl font-mono tracking-widest border-2 border-cyan-800 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setPin('1234');
                  setError('');
                }}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 hover:bg-cyan-200 cursor-pointer"
              >
                Auto-fill 1234
              </button>
              {userPin && userPin !== '1234' && (
                <button
                  type="button"
                  onClick={() => {
                    setPin(userPin);
                    setError('');
                  }}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer"
                >
                  Auto-fill {userPin}
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                soundManager.playClick();
                setStep('input');
              }}
              className="w-1/3 py-2.5 px-3 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isProcessing || pin.length < 4}
              onClick={handleConfirm}
              className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Clearing Bill...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pay Bill Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
