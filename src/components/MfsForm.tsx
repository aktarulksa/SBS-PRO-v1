import React, { useState } from 'react';
import { FinancialService, Transaction } from '../types';
import { ArrowLeft, ShieldCheck, Send, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MfsFormProps {
  service: FinancialService;
  onBack: () => void;
  onSubmitTransaction: (tx: Omit<Transaction, 'id' | 'trxId' | 'timestamp' | 'status'>) => void;
  userPin: string;
}

export const MfsForm: React.FC<MfsFormProps> = ({
  service,
  onBack,
  onSubmitTransaction,
  userPin,
}) => {
  const [operation, setOperation] = useState<'cash_in' | 'cash_out' | 'send_money'>('cash_in');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<'Personal' | 'Agent'>('Personal');
  const [amount, setAmount] = useState('1000');
  const [pin, setPin] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [error, setError] = useState('');

  const quickAmounts = [500, 1000, 2000, 3000, 5000, 10000];

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = accountNumber.replace(/\D/g, '');
    if (clean.length < 11) {
      setError('Please enter an 11-digit mobile wallet number');
      soundManager.playError();
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      setError('Minimum transaction amount is ৳ 50');
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
    // Retailer commission for MFS cash in ~4.1 per 1000
    const commission = +(numAmount * 0.0041).toFixed(2);
    const cost = +(numAmount - commission).toFixed(2);

    setTimeout(() => {
      setIsProcessing(false);
      soundManager.playSuccess();
      onSubmitTransaction({
        type: 'mfs',
        category: operation === 'cash_in' ? 'Cash In' : operation === 'cash_out' ? 'Cash Out' : 'Send Money',
        serviceName: service.name,
        accountOrPhone: accountNumber,
        accountType: accountType,
        amount: numAmount,
        fee: 0,
        cost: cost,
        commission: commission,
        note: `${service.name} ${operation.replace('_', ' ')} ${reference ? `Ref: ${reference}` : ''}`
      });
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Header bar matching MFS branding */}
      <div
        className="px-4 py-3 text-white flex items-center justify-between"
        style={{ backgroundColor: service.accentColor }}
      >
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
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-black tracking-tight">{service.name} Banking</span>
        </div>
      </div>

      {step === 'input' ? (
        <form onSubmit={handleValidate} className="p-4 sm:p-6 space-y-4">
          {/* Operation Tabs (Cash In, Cash Out, Send Money) */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash_in', label: 'Cash In', icon: ArrowDownRight },
              { id: 'cash_out', label: 'Cash Out', icon: ArrowUpRight },
              { id: 'send_money', label: 'Send Money', icon: Send },
            ].map((op) => {
              const Icon = op.icon;
              const isSelected = operation === op.id;
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setOperation(op.id as typeof operation);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-purple-900 border-purple-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{op.label}</span>
                </button>
              );
            })}
          </div>

          {/* Account Number */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600">
                {service.name} Wallet Number
              </label>
              <div className="flex gap-2 text-xs">
                {(['Personal', 'Agent'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${accountType === t ? 'bg-purple-100 text-purple-900' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex items-center border-2 border-purple-800 rounded-lg bg-slate-50 focus-within:bg-white">
              <input
                type="tel"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setError('');
                }}
                placeholder="01XXXXXXXXX"
                className="w-full py-2.5 px-3 text-base font-bold text-slate-900 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Amount (BDT)
            </label>
            <div className="relative flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-white focus-within:border-purple-700">
              <span className="text-lg font-bold text-slate-400 mr-2">৳</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="1000"
                className="w-full text-lg font-black text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setAmount(String(q));
                  }}
                  className={`py-1 px-2 text-xs font-bold rounded border ${
                    amount === String(q)
                      ? 'bg-purple-800 border-purple-800 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  ৳{q}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Reference */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Reference (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Shop order #452"
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#5B2384] hover:bg-[#4d1c70] active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed with {service.name}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Confirm View */
        <div className="p-5 sm:p-7 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">Confirm {service.name} Transfer</h3>
            <p className="text-xs text-slate-500">Authorized Agent Gateway</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Service</span>
              <span className="font-bold text-slate-900">{service.name} ({operation.toUpperCase().replace('_', ' ')})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Wallet Number</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{accountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Amount</span>
              <span className="font-black text-purple-900 text-base">৳ {amount}</span>
            </div>
            <div className="flex justify-between pt-1 font-bold text-slate-800">
              <span>Commission Earned</span>
              <span className="text-emerald-700 font-extrabold">+ ৳ {(parseFloat(amount) * 0.0041).toFixed(2)}</span>
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
                className="w-36 py-2 px-3 text-center text-2xl font-mono tracking-widest border-2 border-purple-800 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
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
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 hover:bg-purple-200 cursor-pointer"
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
                  <span>Connecting MFS...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm &amp; Transfer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
