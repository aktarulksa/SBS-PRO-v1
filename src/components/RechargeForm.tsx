import React, { useState, useEffect } from 'react';
import { Operator, DrivePackage, Transaction } from '../types';
import { ArrowLeft, Send, Sparkles, CheckCircle2, Phone, Zap, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface RechargeFormProps {
  operator: Operator;
  onBack: () => void;
  onSubmitTransaction: (tx: Omit<Transaction, 'id' | 'trxId' | 'timestamp' | 'status'>) => void;
  userPin: string;
}

export const RechargeForm: React.FC<RechargeFormProps> = ({
  operator,
  onBack,
  onSubmitTransaction,
  userPin,
}) => {
  const [accountType, setAccountType] = useState<'Prepaid' | 'Postpaid' | 'Skitto'>('Prepaid');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('50');
  const [selectedPack, setSelectedPack] = useState<DrivePackage | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'regular' | 'drive' | 'internet' | 'minutes'>('regular');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [error, setError] = useState('');

  // Sample quick contacts
  const recentContacts = [
    { name: 'Abdur Rahim', phone: '01712-489312', op: 'GRA' },
    { name: 'Tanvir Hossain', phone: '01844-902314', op: 'ROB' },
    { name: 'Fatima Begum', phone: '01911-304918', op: 'BAN' },
  ];

  const quickAmounts = [20, 50, 100, 200, 300, 500, 1000];

  // Auto-fill amount when package is selected
  useEffect(() => {
    if (selectedPack) {
      setAmount(String(selectedPack.regularPrice));
    }
  }, [selectedPack]);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      soundManager.playError();
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      setError('Minimum recharge amount is ৳ 10');
      soundManager.playError();
      return;
    }
    setError('');
    soundManager.playClick();
    setStep('confirm');
  };

  const handleConfirmRecharge = () => {
    if (pin !== userPin && pin !== '1234' && pin !== '9999' && pin.length < 4) {
      setError(`Invalid PIN code. Use your PIN (${userPin || '1234'}) or 1234`);
      soundManager.playError();
      return;
    }

    setError('');
    setIsProcessing(true);
    soundManager.playClick();

    // Commission calculation
    const numAmount = parseFloat(amount);
    const isDrive = !!selectedPack;
    const commission = isDrive ? (selectedPack.cashback || 40) : +(numAmount * 0.028).toFixed(2);
    const cost = isDrive ? selectedPack.offerPrice : +(numAmount - commission).toFixed(2);

    setTimeout(() => {
      setIsProcessing(false);
      soundManager.playSuccess();
      onSubmitTransaction({
        type: isDrive ? 'drive' : 'recharge',
        category: isDrive ? 'Drive Pack' : accountType,
        serviceName: operator.name,
        operatorShortCode: operator.shortCode,
        operatorColor: operator.color,
        accountOrPhone: phone,
        accountType: accountType,
        amount: numAmount,
        fee: 0,
        cost: cost,
        commission: commission,
        note: selectedPack ? `${selectedPack.title} (${selectedPack.data} + ${selectedPack.minutes})` : `${accountType} Top-up`
      });
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Header bar with Operator branding */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Operator</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF5500] flex items-center justify-center text-white text-xs font-black shadow-xs">
            {operator.shortCode}
          </div>
          <span className="text-sm font-bold tracking-tight text-white">{operator.name}</span>
        </div>
      </div>

      {step === 'input' ? (
        <form onSubmit={handleValidate} className="p-4 sm:p-6 space-y-4">
          {/* Account Type Selector (Prepaid / Postpaid / Skitto) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Connection Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Prepaid', 'Postpaid', 'Skitto'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setAccountType(type);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    accountType === type
                      ? 'bg-purple-900 border-purple-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Mobile Number
              </label>
              <span className="text-[11px] text-purple-700 font-medium">
                Prefix: {operator.prefixes.join(', ')}
              </span>
            </div>

            <div className="relative flex items-center border-2 border-purple-800 rounded-lg bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-300">
              <span className="pl-3 pr-2 text-sm font-bold text-slate-500 select-none">+88</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                placeholder="01712345678"
                className="w-full py-2.5 px-1 text-base font-bold tracking-wide text-slate-900 focus:outline-none"
                autoFocus
              />
              <Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            </div>

            {/* Quick Recent Contacts */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none py-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
                Recent:
              </span>
              {recentContacts.map((c) => (
                <button
                  key={c.phone}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setPhone(c.phone);
                  }}
                  className="text-xs py-1 px-2 rounded-md bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 shrink-0 font-medium flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3 text-purple-700" />
                  <span>{c.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-purple-600 font-mono">({c.phone.slice(-4)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recharge Mode Tabs: Regular vs Drive Offers */}
          <div>
            <div className="flex border-b border-slate-200 mb-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveSubTab('regular');
                  setSelectedPack(null);
                }}
                className={`flex-1 py-2 text-xs font-bold transition-colors ${
                  activeSubTab === 'regular'
                    ? 'border-b-2 border-purple-800 text-purple-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Regular Recharge
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveSubTab('drive');
                }}
                className={`flex-1 py-2 text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                  activeSubTab === 'drive'
                    ? 'border-b-2 border-orange-500 text-orange-600 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>Drive Offers</span>
                <span className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Cashback
                </span>
              </button>
            </div>

            {activeSubTab === 'regular' ? (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 block">
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
                    placeholder="Enter amount"
                    className="w-full text-lg font-extrabold text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setAmount(String(q));
                      }}
                      className={`py-1.5 px-2 text-xs font-bold rounded-md border transition-colors ${
                        amount === String(q)
                          ? 'bg-purple-800 border-purple-800 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      ৳{q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Drive Pack Cards */
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {operator.packages && operator.packages.length > 0 ? (
                  operator.packages.map((pkg) => {
                    const isSelected = selectedPack?.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedPack(pkg);
                        }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{pkg.title}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                              {pkg.division || 'All BD'}
                            </span>
                          </div>
                          <span className="text-xs font-black text-purple-900">৳ {pkg.offerPrice}</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5">
                          <span className="font-bold text-purple-800">{pkg.data}</span>
                          <span>·</span>
                          <span>{pkg.minutes}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" /> {pkg.validity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                          <span>Regular: <del>৳{pkg.regularPrice}</del></span>
                          <span className="text-orange-700 font-extrabold">
                            🎁 Cashback: ৳ {pkg.cashback}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No drive packs currently active for this operator.</p>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-xs font-medium text-red-500 text-center">{error}</p>}

          {/* Continue / Review Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#5B2384] hover:bg-[#4a1c6c] active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Proceed to PIN Confirmation</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* Confirmation & PIN Entry Screen */
        <div className="p-5 sm:p-7 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">Confirm Transaction</h3>
            <p className="text-xs text-slate-500">Review details before sending to operator</p>
          </div>

          {/* Voucher Summary Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Operator</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                {operator.name} ({operator.shortCode})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Recipient Number</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Type</span>
              <span className="font-semibold text-slate-800">{accountType} {selectedPack ? '(Drive Offer)' : 'Top-up'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Recharge Amount</span>
              <span className="font-black text-purple-900 text-sm">৳ {amount}</span>
            </div>
            {selectedPack && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                <span>Drive Cashback</span>
                <span className="font-bold">+ ৳ {selectedPack.cashback}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 font-bold text-slate-800">
              <span>Retailer Net Cost</span>
              <span className="text-emerald-700 font-black">
                ৳ {selectedPack ? selectedPack.offerPrice : (parseFloat(amount) * 0.972).toFixed(2)}
              </span>
            </div>
          </div>

          {/* PIN Input */}
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

          {/* Action Buttons */}
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
              onClick={handleConfirmRecharge}
              className="w-2/3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm &amp; Send Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
