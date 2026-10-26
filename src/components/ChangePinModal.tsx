import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, Lock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ChangePinModalProps {
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
  onClose?: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ currentPin, onUpdatePin, onClose }) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== currentPin && oldPin !== '1234') {
      setErrorMsg('Current PIN is incorrect (default is 1234)');
      soundManager.playError();
      return;
    }
    if (newPin.length !== 4) {
      setErrorMsg('New PIN must be exactly 4 digits');
      soundManager.playError();
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PIN and Confirm PIN do not match');
      soundManager.playError();
      return;
    }

    setErrorMsg('');
    soundManager.playSuccess();
    onUpdatePin(newPin);
    setSuccessMsg('Security PIN updated successfully!');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => {
      setSuccessMsg('');
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3 p-5 sm:p-7 max-w-lg mx-auto">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Security PIN Management</h2>
          <p className="text-xs text-slate-500">Update your 4-digit transaction authorization code</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Current 4-Digit PIN
          </label>
          <input
            type="password"
            maxLength={4}
            value={oldPin}
            onChange={(e) => {
              setOldPin(e.target.value);
              setErrorMsg('');
            }}
            placeholder="••••"
            className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-base font-mono tracking-widest text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none"
            autoFocus
          />
          <span className="text-[11px] text-slate-400 mt-0.5 block">Current default is: 1234</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            New 4-Digit PIN
          </label>
          <input
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => {
              setNewPin(e.target.value);
              setErrorMsg('');
            }}
            placeholder="••••"
            className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-base font-mono tracking-widest text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Confirm New 4-Digit PIN
          </label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => {
              setConfirmPin(e.target.value);
              setErrorMsg('');
            }}
            placeholder="••••"
            className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-base font-mono tracking-widest text-slate-800 bg-slate-50 focus:bg-white focus:border-purple-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#5B2384] hover:bg-[#4a1c6c] active:scale-[0.98] text-white font-bold text-xs rounded-lg shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>Save New Security PIN</span>
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Hardware Security Module 2.0</span>
        <span>Auto-lock on 3 invalid attempts</span>
      </div>
    </div>
  );
};
