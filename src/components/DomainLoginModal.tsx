import React, { useState } from 'react';
import { SbsLogo } from './SbsLogo';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  User,
  Server,
  UserPlus,
  LogIn,
  CheckCircle2,
  Phone,
  Mail,
  DollarSign,
  X
} from 'lucide-react';
import { soundManager } from '../utils/sound';
import { DEMO_DOMAINS } from '../data/mockData';
import { UserProfile, UserRole } from '../types';

interface DomainLoginModalProps {
  onSuccess: (domain: string, username: string, role: 'admin' | 'agent') => void;
  initialDomain?: string;
  users?: UserProfile[];
  onRegisterUser?: (newUser: Omit<UserProfile, 'id' | 'joinedDate'>) => void;
  onClose?: () => void;
  initialTab?: 'login' | 'register' | 'domain';
}

export const DomainLoginModal: React.FC<DomainLoginModalProps> = ({
  onSuccess,
  initialDomain = 'server.sbsbd.com',
  users = [],
  onRegisterUser,
  onClose,
  initialTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'domain'>(initialTab);
  const [domain, setDomain] = useState(initialDomain);

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('01700000001');
  const [loginPin, setLoginPin] = useState('9999');
  const [loginRole, setLoginRole] = useState<'admin' | 'agent'>('admin');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('agent');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [regBalance, setRegBalance] = useState('10000');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Domain Submit
  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setLoginError('Please enter your server domain name');
      soundManager.playError();
      return;
    }
    soundManager.playClick();
    setActiveTab('login');
  };

  // Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = loginUsername.trim();
    if (!inputVal) {
      setLoginError('Please enter your Mobile Number or Terminal ID');
      soundManager.playError();
      return;
    }
    if (!loginPin || loginPin.length < 4) {
      setLoginError('Please enter your 4-digit security PIN');
      soundManager.playError();
      return;
    }

    const cleanDigits = inputVal.replace(/\D/g, '');
    const isDirectAdmin = inputVal.toLowerCase() === 'admin';

    // Find user by username, phone number, or admin alias
    const existing = users.find((u) => {
      const uUsernameDigits = u.username.replace(/\D/g, '');
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');

      if (isDirectAdmin && u.role === 'admin') return true;
      if (u.username.toLowerCase() === inputVal.toLowerCase()) return true;
      if (cleanDigits && (uUsernameDigits === cleanDigits || uPhoneDigits === cleanDigits)) return true;
      return false;
    });

    if (existing) {
      if (existing.pin !== loginPin && loginPin !== '1234' && loginPin !== '9999') {
        setLoginError(`Incorrect PIN for ${existing.name} (${existing.username}). Try: ${existing.pin}`);
        soundManager.playError();
        return;
      }
      setLoginError('');
      soundManager.playSuccess();
      onSuccess(domain, existing.username, existing.role);
      return;
    }

    // Default dynamic login
    const detectedRole: 'admin' | 'agent' = inputVal.toLowerCase().includes('admin')
      ? 'admin'
      : loginRole;

    setLoginError('');
    soundManager.playSuccess();
    onSuccess(domain, inputVal, detectedRole);
  };

  // Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = (regPhone || regUsername).replace(/\D/g, '');
    const finalMobile = cleanDigits || regUsername.trim();

    if (!regName.trim() || !finalMobile) {
      setRegError('Full Name and Mobile Number are required');
      soundManager.playError();
      return;
    }
    if (finalMobile.length < 10) {
      setRegError('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX)');
      soundManager.playError();
      return;
    }
    if (regPin.length !== 4) {
      setRegError('Security PIN must be exactly 4 digits');
      soundManager.playError();
      return;
    }
    if (regPin !== regConfirmPin) {
      setRegError('PIN and Confirm PIN do not match');
      soundManager.playError();
      return;
    }

    if (users.some((u) => u.username.replace(/\D/g, '') === finalMobile)) {
      setRegError(`Mobile Number '${finalMobile}' is already registered as a Terminal ID. Please sign in.`);
      soundManager.playError();
      return;
    }

    const startingBalance = parseFloat(regBalance) || 5000;
    const formattedPhone = finalMobile.length === 11 
      ? `${finalMobile.slice(0, 5)}-${finalMobile.slice(5)}` 
      : finalMobile;

    const newUser: Omit<UserProfile, 'id' | 'joinedDate'> = {
      name: regName.trim(),
      username: finalMobile, // Username / Terminal ID set to Mobile Number!
      role: regRole,
      pin: regPin,
      phone: formattedPhone,
      email: regEmail.trim() || `${finalMobile}@sbs-pro.net`,
      balance: startingBalance,
      status: 'active',
    };

    setRegError('');
    soundManager.playSuccess();

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }

    setRegSuccess(`Account for ${finalMobile} registered successfully! Signing in...`);

    setTimeout(() => {
      onSuccess(domain, finalMobile, regRole);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto">
        
        {/* Subtle Telecom Watermark Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden select-none flex flex-wrap gap-8 p-6 text-slate-900 font-bold text-lg rotate-[-12deg]">
          <span>bKash</span>
          <span>Rocket</span>
          <span>Nagad</span>
          <span>FlexiLoad</span>
          <span>SMS</span>
          <span>BillPay</span>
          <span>Grameenphone</span>
          <span>Robi</span>
          <span>Banglalink</span>
          <span>TeleTalk</span>
          <span>Airtel</span>
        </div>

        {/* Top Accent Gradient Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-purple-700 to-orange-500" />

        {/* Modal Close Button (if dismissible) */}
        {onClose && (
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Branding & Logo Showcase */}
        <div className="pt-6 px-6 pb-2 text-center relative z-10 flex flex-col items-center">
          <SbsLogo size="lg" showText={false} />
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1.5">
            SBS <span className="text-orange-500">Pro</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Telecom Recharge &amp; Financial Services Gateway
          </p>

          {/* Nav Tabs: Sign In / Register / Server Domain */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mt-4 w-full">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('login');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('register');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New User</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('domain');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'domain'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domain</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN / SIGN IN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 pt-2 space-y-4 relative z-10">
            {/* Quick Demo Credentials Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setLoginRole('admin');
                  setLoginUsername('01700000001');
                  setLoginPin('9999');
                  setLoginError('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  loginUsername === '01700000001' || loginUsername.toLowerCase() === 'admin'
                    ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setLoginRole('agent');
                  setLoginUsername('01712489312');
                  setLoginPin('1234');
                  setLoginError('');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  loginUsername === '01712489312'
                    ? 'bg-purple-50 text-purple-900 border-purple-300 ring-1 ring-purple-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5 text-purple-700" />
                <span>Retailer (01712...)</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Mobile Number / Terminal ID
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-purple-600">
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="e.g. 01712489312 or admin"
                    className="w-full text-sm font-semibold font-mono text-slate-900 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Security PIN (4-digit)
                </label>
                <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-purple-600">
                  <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="password"
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => {
                      setLoginPin(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="••••"
                    className="w-full text-base tracking-widest font-mono text-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Demo Admin PIN: 9999 · Agent PIN: 1234</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPin(loginUsername.toLowerCase() === 'admin' ? '9999' : '1234');
                    }}
                    className="text-purple-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              </div>
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-red-500 text-center bg-red-50 py-1.5 rounded border border-red-200">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#5B2384] hover:bg-[#4d1c70] active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Terminal</span>
            </button>

            {/* Quick Switch to Register */}
            <div className="text-center pt-1 text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('register');
                }}
                className="text-purple-800 font-extrabold hover:underline"
              >
                Register New User
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER / SIGN UP NEW USER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 pt-2 space-y-3 relative z-10 max-h-[75vh] overflow-y-auto">
            <div className="text-center mb-1">
              <h3 className="text-sm font-bold text-slate-800">Create New Account</h3>
              <p className="text-[11px] text-slate-400">Join SBS Pro Retail &amp; Billing Network</p>
            </div>

            {regSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                {regError}
              </div>
            )}

            {/* Select Role */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setRegRole('agent');
                    if (!regUsername || regUsername.startsWith('ADM')) {
                      setRegUsername(`AGT-${Math.floor(10000 + Math.random() * 90000)}`);
                    }
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                    regRole === 'agent'
                      ? 'bg-purple-900 border-purple-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Retailer Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setRegRole('admin');
                    if (!regUsername || regUsername.startsWith('AGT')) {
                      setRegUsername(`ADM-${Math.floor(100 + Math.random() * 900)}`);
                    }
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer ${
                    regRole === 'admin'
                      ? 'bg-red-700 border-red-700 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>

            {/* Full Name & Shop */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Full Name / Shop Name
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  setRegError('');
                }}
                placeholder="e.g. Mizan Telecom &amp; Flexiload"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600"
                required
              />
            </div>

            {/* Mobile Number / Terminal ID */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mobile Number / Terminal ID
              </label>
              <div className="flex items-center border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-purple-600">
                <Phone className="w-4 h-4 text-purple-700 mr-2 shrink-0" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRegPhone(val);
                    setRegUsername(val.replace(/\s+/g, ''));
                    setRegError('');
                  }}
                  placeholder="017XXXXXXXX"
                  className="w-full text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-purple-700 font-medium mt-1">
                ✓ Your 11-digit Mobile Number serves as your unique Terminal ID for login &amp; balance requests.
              </p>
            </div>

            {/* Starting Balance */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Starting Balance (৳)</label>
              <input
                type="number"
                value={regBalance}
                onChange={(e) => setRegBalance(e.target.value)}
                placeholder="10000"
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            {/* 4-Digit Security PIN */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => {
                    setRegPin(e.target.value);
                    setRegError('');
                  }}
                  placeholder="••••"
                  className="w-full py-2 px-2.5 text-center text-sm font-mono tracking-widest border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={regConfirmPin}
                  onChange={(e) => {
                    setRegConfirmPin(e.target.value);
                    setRegError('');
                  }}
                  placeholder="••••"
                  className="w-full py-2 px-2.5 text-center text-sm font-mono tracking-widest border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account &amp; Sign In</span>
            </button>

            <div className="text-center pt-1 text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('login');
                }}
                className="text-purple-800 font-extrabold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: DOMAIN SETUP */}
        {activeTab === 'domain' && (
          <form onSubmit={handleDomainSubmit} className="p-6 pt-2 space-y-4 relative z-10">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700">Billing Server Domain</p>
              <p className="text-[11px] text-slate-400">Connect terminal to your core operator gateway</p>
            </div>

            <div className="relative">
              <div className="flex items-center border-b-2 border-purple-700 bg-slate-50 px-3 py-2.5 rounded-t-lg">
                <Globe className="w-5 h-5 text-purple-700 shrink-0 mr-2" />
                <span className="text-sm font-semibold text-slate-500 mr-1">http://</span>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/^https?:\/\//, ''))}
                  placeholder="Domain"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                Active Cluster Domains
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_DOMAINS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDomain(d);
                      soundManager.playClick();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      domain === d
                        ? 'bg-purple-100 border-purple-300 text-purple-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#5B2384] hover:bg-[#4d1c70] text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Save &amp; Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info strip */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected to: {domain}</span>
          </span>
          <span>SSL 256-Bit</span>
        </div>

      </div>
    </div>
  );
};
