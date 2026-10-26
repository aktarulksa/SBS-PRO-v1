/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Country, Operator, Transaction, WalletState, ActiveTab, UserProfile, UserRole } from './types';
import {
  COUNTRIES,
  BANGLADESH_OPERATORS,
  FINANCIAL_SERVICES,
  INITIAL_WALLET,
  INITIAL_TRANSACTIONS,
  DEFAULT_USERS,
} from './data/mockData';
import { Header } from './components/Header';
import { ServiceRibbon, ServiceMode } from './components/ServiceRibbon';
import { CountryGrid } from './components/CountryGrid';
import { OperatorGrid } from './components/OperatorGrid';
import { RechargeForm } from './components/RechargeForm';
import { MfsForm } from './components/MfsForm';
import { BillPayForm } from './components/BillPayForm';
import { ReportsView, ReportCategoryKey } from './components/ReportsView';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BalanceShieldModal } from './components/BalanceShieldModal';
import { ChangePinModal } from './components/ChangePinModal';
import { DomainLoginModal } from './components/DomainLoginModal';
import { OriginalScreenshotsModal } from './components/OriginalScreenshotsModal';
import { AdminApprovalsView } from './components/AdminApprovalsView';
import { UserProfileView } from './components/UserProfileView';
import { TransactionsQueueView } from './components/TransactionsQueueView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ApkInstallModal } from './components/ApkInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { soundManager } from './utils/sound';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  Printer,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Zap,
  AlertTriangle,
  UserCheck,
  Users,
  User,
  LogIn,
  Download,
} from 'lucide-react';

export default function App() {
  // PWA & Android APK Installation Hook
  const { canInstall, isInstalled, isAndroid, triggerInstall } = usePWAInstall();
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // User Accounts & Authentication State
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('sbs_users');
    if (saved) {
      try {
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored data contains old AGT- format, migrate to mobile numbers
          if (parsed.some((u) => u.username && u.username.startsWith('AGT-'))) {
            return DEFAULT_USERS;
          }
          return parsed;
        }
      } catch {}
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('sbs_current_user');
    if (savedUser) {
      try {
        const parsed: UserProfile = JSON.parse(savedUser);
        if (parsed.username && parsed.username.startsWith('AGT-')) {
          return DEFAULT_USERS[1];
        }
        return parsed;
      } catch {}
    }
    return DEFAULT_USERS[0]; // Super Admin by default
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sbs_auth') !== 'false';
  });
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'domain' | null>(null);

  const [domainName, setDomainName] = useState<string>(() => {
    return localStorage.getItem('sbs_domain') || 'server.sbsbd.com';
  });

  // Approval Policy: 'all' = All transactions require admin approval (User prompt: Transaction Approval only Admin)
  const [approvalPolicy, setApprovalPolicy] = useState<'all' | 'high_value' | 'drive_mfs'>(() => {
    const saved = localStorage.getItem('sbs_approval_policy');
    return (saved as 'all' | 'high_value' | 'drive_mfs') || 'all';
  });

  // Navigation & Service State
  const [activeTab, setActiveTab] = useState<ActiveTab>('RECHARGE');
  const [activeService, setActiveService] = useState<ServiceMode>('all_recharge');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  // Layout View Mode (Mobile view vs Wide Desktop Portal)
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Wallet & Transactions Ledger
  const [wallet, setWallet] = useState<WalletState>(() => {
    const saved = localStorage.getItem('sbs_wallet');
    return saved ? JSON.parse(saved) : INITIAL_WALLET;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sbs_tx');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Modals
  const [showShieldModal, setShowShieldModal] = useState<boolean>(false);
  const [showScreenshotsModal, setShowScreenshotsModal] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [activeReportCategory, setActiveReportCategory] = useState<{
    key: ReportCategoryKey;
    label: string;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sbs_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sbs_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sbs_approval_policy', approvalPolicy);
  }, [approvalPolicy]);

  useEffect(() => {
    localStorage.setItem('sbs_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('sbs_tx', JSON.stringify(transactions));
  }, [transactions]);

  // Auth Handler from Login Screen
  const handleDomainSuccess = (domain: string, username: string, role: 'admin' | 'agent') => {
    setDomainName(domain);
    let matchedUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!matchedUser) {
      // create and use
      matchedUser = {
        id: `usr-${Date.now()}`,
        username,
        name: role === 'admin' ? 'Admin Authority' : `Retailer (${username})`,
        role,
        pin: role === 'admin' ? '9999' : '1234',
        balance: role === 'admin' ? 250000 : 25000,
        status: 'active',
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      setUsers((prev) => [...prev, matchedUser!]);
    }
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    setAuthModalTab(null);
    localStorage.setItem('sbs_domain', domain);
    localStorage.setItem('sbs_auth', 'true');
    setWallet((prev) => ({
      ...prev,
      mainBalance: matchedUser!.balance,
    }));
    setActiveTab(matchedUser.role === 'admin' ? 'ADMIN APPROVALS' : 'RECHARGE');
  };

  const handleLogout = () => {
    soundManager.playClick();
    setIsAuthenticated(false);
    setAuthModalTab('login');
    localStorage.removeItem('sbs_auth');
  };

  // Quick 1-click switch between Admin and Agent Account
  const handleSwitchRole = () => {
    soundManager.playClick();
    if (currentUser.role === 'admin') {
      const agentUser = users.find((u) => u.role === 'agent') || DEFAULT_USERS[1];
      setCurrentUser(agentUser);
      setActiveTab('RECHARGE');
    } else {
      const adminUser = users.find((u) => u.role === 'admin') || DEFAULT_USERS[0];
      setCurrentUser(adminUser);
      setActiveTab('ADMIN APPROVALS');
    }
  };

  // Transaction submission (Follows Admin Approval Requirement)
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'trxId' | 'timestamp' | 'status'>) => {
    const randomTrxNum = Math.floor(1000000 + Math.random() * 9000000);
    const isAdmin = currentUser.role === 'admin';

    // Check if this transaction needs Admin Approval:
    // If strict policy 'all' is active, any transaction by an agent requires Admin Approval!
    let needsApproval = false;
    if (!isAdmin) {
      if (approvalPolicy === 'all') {
        needsApproval = true;
      } else if (approvalPolicy === 'high_value' && newTxData.amount > 500) {
        needsApproval = true;
      } else if (approvalPolicy === 'drive_mfs' && (newTxData.type === 'drive' || newTxData.type === 'mfs')) {
        needsApproval = true;
      }
    }

    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      trxId: `TRX-${randomTrxNum}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: needsApproval ? 'Pending' : 'Success',
      agentId: currentUser.username,
      agentName: currentUser.name,
      approvedBy: needsApproval ? undefined : isAdmin ? 'admin' : 'auto-gateway',
      approvedAt: needsApproval ? undefined : new Date().toISOString().replace('T', ' ').slice(0, 19),
      note: needsApproval
        ? `${newTxData.note || ''} · [Awaiting Admin Approval]`
        : newTxData.note,
    };

    // Prepend transaction
    setTransactions((prev) => [newTx, ...prev]);

    // Update wallet balance and profit
    setWallet((prev) => {
      const isDrive = newTx.type === 'drive';
      const newMain = isDrive ? prev.mainBalance : Math.max(0, prev.mainBalance - newTx.cost);
      const newDrive = isDrive ? Math.max(0, prev.driveBalance - newTx.cost) : prev.driveBalance;
      return {
        ...prev,
        mainBalance: +newMain.toFixed(2),
        driveBalance: +newDrive.toFixed(2),
        todayProfit: +(prev.todayProfit + (needsApproval ? 0 : newTx.commission)).toFixed(2),
        totalRechargesToday: prev.totalRechargesToday + 1,
      };
    });

    // Update current user balance
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, balance: Math.max(0, +(u.balance - newTx.cost).toFixed(2)) };
        }
        return u;
      })
    );

    // Automatically show receipt slip with pending or success stamp
    setSelectedReceipt(newTx);
  };

  // ADMIN APPROVAL ACTION
  const handleApproveTransaction = (txId: string) => {
    soundManager.playSuccess();
    const targetTx = transactions.find((t) => t.id === txId);

    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === txId) {
          return {
            ...tx,
            status: 'Success',
            approvedBy: currentUser.username || 'admin',
            approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            note: tx.note
              ? tx.note.replace(' · [Awaiting Admin Approval]', ' · [Approved by Admin]')
              : '[Approved by Admin]',
          };
        }
        return tx;
      })
    );

    if (targetTx) {
      if (targetTx.type === 'balance_request') {
        // Credit the retailer's balance immediately!
        setUsers((prev) =>
          prev.map((u) => {
            if (u.username === targetTx.agentId) {
              return { ...u, balance: +(u.balance + targetTx.amount).toFixed(2) };
            }
            return u;
          })
        );
        setCurrentUser((prev) => {
          if (prev.username === targetTx.agentId) {
            return { ...prev, balance: +(prev.balance + targetTx.amount).toFixed(2) };
          }
          return prev;
        });
        setWallet((prev) => ({
          ...prev,
          mainBalance: +(prev.mainBalance + targetTx.amount).toFixed(2),
        }));
      } else {
        // Credit retailer commission on approval
        setWallet((prev) => ({
          ...prev,
          todayProfit: +(prev.todayProfit + targetTx.commission).toFixed(2),
        }));
      }
    }
  };

  // ADMIN REJECT ACTION
  const handleRejectTransaction = (txId: string, reason?: string) => {
    soundManager.playError();
    const tx = transactions.find((t) => t.id === txId);
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            status: 'Rejected',
            rejectionReason: reason || 'Declined by Admin',
            note: `${t.note || ''} · [Rejected: ${reason || 'Admin Declined'}]`,
          };
        }
        return t;
      })
    );

    // Refund cost to agent/wallet ONLY if not a balance_request
    if (tx && tx.type !== 'balance_request') {
      setWallet((prev) => ({
        ...prev,
        mainBalance: +(prev.mainBalance + tx.cost).toFixed(2),
      }));
      setUsers((prev) =>
        prev.map((u) => {
          if (u.username === tx.agentId) {
            return { ...u, balance: +(u.balance + tx.cost).toFixed(2) };
          }
          return u;
        })
      );
    }
  };

  // BATCH APPROVE
  const handleBatchApprove = (txIds: string[]) => {
    soundManager.playSuccess();
    setTransactions((prev) =>
      prev.map((tx) => {
        if (txIds.includes(tx.id)) {
          return {
            ...tx,
            status: 'Success',
            approvedBy: currentUser.username || 'admin',
            approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            note: tx.note ? tx.note.replace(' · [Awaiting Admin Approval]', ' · [Approved by Admin]') : '[Approved by Admin]',
          };
        }
        return tx;
      })
    );

    // Process balance requests in batch
    txIds.forEach((id) => {
      const tx = transactions.find((t) => t.id === id);
      if (tx && tx.type === 'balance_request') {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.username === tx.agentId) {
              return { ...u, balance: +(u.balance + tx.amount).toFixed(2) };
            }
            return u;
          })
        );
        setCurrentUser((prev) => {
          if (prev.username === tx.agentId) {
            return { ...prev, balance: +(prev.balance + tx.amount).toFixed(2) };
          }
          return prev;
        });
        setWallet((prev) => ({
          ...prev,
          mainBalance: +(prev.mainBalance + tx.amount).toFixed(2),
        }));
      }
    });
  };

  // Retailer Add Money Request to Admin
  const handleRequestAddMoney = (request: {
    amount: number;
    method: string;
    senderPhone: string;
    trxId: string;
    targetWallet: 'main' | 'drive' | 'bank';
    note?: string;
  }) => {
    const randomTrxNum = Math.floor(1000000 + Math.random() * 9000000);
    const newTx: Transaction = {
      id: `tx-req-${Date.now()}`,
      trxId: request.trxId.trim() || `REQ-${randomTrxNum}`,
      type: 'balance_request',
      category: 'Add Balance',
      serviceName: `Add Money (${request.method})`,
      accountOrPhone: request.senderPhone || currentUser.username,
      accountType: 'Agent',
      amount: request.amount,
      fee: 0,
      cost: request.amount,
      commission: 0,
      status: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      agentId: currentUser.username,
      agentName: currentUser.name,
      note: `Deposit via ${request.method} · Target: ${request.targetWallet.toUpperCase()} · TrxID: ${request.trxId} ${
        request.note ? `· ${request.note}` : ''
      } · [Awaiting Admin Approval]`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    soundManager.playSuccess();
    setShowShieldModal(false);
    setSelectedReceipt(newTx);
  };

  // Fund Deposit Handler
  const handleAddFunds = (amount: number, target: 'main' | 'drive' | 'bank') => {
    setWallet((prev) => {
      if (target === 'main') return { ...prev, mainBalance: +(prev.mainBalance + amount).toFixed(2) };
      if (target === 'drive') return { ...prev, driveBalance: +(prev.driveBalance + amount).toFixed(2) };
      return { ...prev, bankBalance: +(prev.bankBalance + amount).toFixed(2) };
    });
  };

  // Add agent balance from admin panel
  const handleAddAgentCredit = (agentId: string, amount: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === agentId) {
          return { ...u, balance: +(u.balance + amount).toFixed(2) };
        }
        return u;
      })
    );
  };

  // Create new user profile from admin panel
  const handleCreateUser = (newUser: Omit<UserProfile, 'id' | 'joinedDate'>) => {
    const user: UserProfile = {
      ...newUser,
      id: `usr-${Date.now()}`,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setUsers((prev) => [...prev, user]);
  };

  // Update profile handler
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updated } : u))
    );
  };

  // Cancel order by agent before admin approval
  const handleCancelPendingOrder = (txId: string) => {
    soundManager.playError();
    const target = transactions.find((t) => t.id === txId);
    if (!target) return;

    // Refund cost
    setWallet((prev) => ({
      ...prev,
      mainBalance: +(prev.mainBalance + target.cost).toFixed(2),
    }));

    setCurrentUser((prev) => ({
      ...prev,
      balance: +(prev.balance + target.cost).toFixed(2),
    }));

    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, balance: +(u.balance + target.cost).toFixed(2) } : u))
    );

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'Rejected',
              rejectionReason: 'Cancelled by User',
              note: `${t.note || ''} · [Cancelled by User: Refunded]`,
            }
          : t
      )
    );
  };

  // Reset navigation to Home
  const handleResetHome = () => {
    setActiveTab('RECHARGE');
    setActiveService('all_recharge');
    setSelectedCountry(null);
    setSelectedOperator(null);
  };

  // Service Ribbon selection handler
  const handleSelectService = (service: ServiceMode) => {
    setActiveService(service);
    if (service === 'all_recharge') {
      setSelectedCountry(null);
      setSelectedOperator(null);
    } else if (service === 'drive') {
      const bd = COUNTRIES.find((c) => c.id === 'bd')!;
      setSelectedCountry(bd);
      setSelectedOperator(BANGLADESH_OPERATORS[0]);
    }
  };

  // Create sample pending order to test Admin Approval workflow
  const handleCreateSamplePendingOrder = () => {
    const randomTrxNum = Math.floor(1000000 + Math.random() * 9000000);
    const sampleAgents = [
      { id: '01712489312', name: 'Shakil Enterprise' },
      { id: '01844902314', name: 'Mayer Doa Telecom' },
      { id: '01911304918', name: 'Bhai Bhai Flexiload' },
    ];
    const randomAgent = sampleAgents[Math.floor(Math.random() * sampleAgents.length)];
    const sampleServices = [
      { name: 'GrameenPhone', short: 'GRA', color: '#FF6B00', type: 'recharge' as const, cat: 'Prepaid', amt: 500, phone: '01712-998877', note: 'Prepaid Flexiload' },
      { name: 'Robi', short: 'ROB', color: '#FF5500', type: 'drive' as const, cat: 'Drive Pack', amt: 799, phone: '01844-332211', note: '50 GB + 1000 Min Drive' },
      { name: 'bKash', short: 'BKS', color: '#E2136E', type: 'mfs' as const, cat: 'Cash In', amt: 3500, phone: '01799-554433', note: 'Customer Wallet Cash In' },
    ];
    const sample = sampleServices[Math.floor(Math.random() * sampleServices.length)];
    const commission = +(sample.amt * 0.028).toFixed(2);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      trxId: `TRX-${randomTrxNum}`,
      type: sample.type,
      category: sample.cat,
      serviceName: sample.name,
      operatorShortCode: sample.short,
      operatorColor: sample.color,
      accountOrPhone: sample.phone,
      accountType: 'Prepaid',
      amount: sample.amt,
      fee: 0,
      cost: +(sample.amt - commission).toFixed(2),
      commission: commission,
      status: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      agentId: randomAgent.id,
      agentName: randomAgent.name,
      note: `${sample.note} · [Awaiting Admin Approval]`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    soundManager.playSuccess();
  };

  const pendingApprovalsCount = transactions.filter((tx) => tx.status === 'Pending').length;

  // Main Dynamic Body Content
  const renderMainContent = () => {
    if (activeTab === 'PROFILE') {
      return (
        <UserProfileView
          user={currentUser}
          wallet={wallet}
          userTransactions={transactions.filter(
            (tx) => tx.agentId === currentUser.username || tx.agentName === currentUser.name
          )}
          onUpdateProfile={handleUpdateProfile}
          onOpenChangePin={() => setActiveTab('CHANGE PIN')}
          onLogout={handleLogout}
          domainName={domainName}
          onOpenShield={() => setShowShieldModal(true)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onOpenApkModal={() => setShowApkModal(true)}
        />
      );
    }

    if (activeTab === 'QUEUE' || activeTab === 'ADMIN APPROVALS') {
      return (
        <TransactionsQueueView
          transactions={transactions}
          currentUser={currentUser}
          onApproveTransaction={handleApproveTransaction}
          onRejectTransaction={handleRejectTransaction}
          onBatchApprove={handleBatchApprove}
          onSelectReceipt={(tx) => setSelectedReceipt(tx)}
          onCancelPendingOrder={handleCancelPendingOrder}
          onCreateTestOrder={handleCreateSamplePendingOrder}
        />
      );
    }

    if (activeTab === 'REPORTS') {
      return (
        <ReportsView
          onSelectCategory={(key, label) => {
            setActiveReportCategory({ key, label });
          }}
        />
      );
    }

    if (activeTab === 'CHANGE PIN') {
      return (
        <ChangePinModal
          currentPin={currentUser.pin}
          onUpdatePin={(newPin) => {
            setCurrentUser((prev) => ({ ...prev, pin: newPin }));
            setUsers((prev) =>
              prev.map((u) => (u.id === currentUser.id ? { ...u, pin: newPin } : u))
            );
          }}
        />
      );
    }

    // ActiveTab is 'RECHARGE'
    if (activeService === 'bkash' || activeService === 'rocket' || activeService === 'nagad') {
      const fs = FINANCIAL_SERVICES.find((f) => f.code === activeService) || FINANCIAL_SERVICES[0];
      return (
        <MfsForm
          service={fs}
          onBack={() => setActiveService('all_recharge')}
          onSubmitTransaction={handleAddTransaction}
          userPin={currentUser.pin}
        />
      );
    }

    if (activeService === 'billpay_1' || activeService === 'billpay_2') {
      return (
        <BillPayForm
          categoryType={activeService}
          onBack={() => setActiveService('all_recharge')}
          onSubmitTransaction={handleAddTransaction}
          userPin={currentUser.pin}
        />
      );
    }

    if (selectedOperator) {
      return (
        <RechargeForm
          operator={selectedOperator}
          onBack={() => setSelectedOperator(null)}
          onSubmitTransaction={handleAddTransaction}
          userPin={currentUser.pin}
        />
      );
    }

    if (selectedCountry) {
      return (
        <OperatorGrid
          country={selectedCountry}
          onSelectOperator={(op) => setSelectedOperator(op)}
          onBack={() => setSelectedCountry(null)}
        />
      );
    }

    return (
      <CountryGrid
        onSelectCountry={(country) => {
          setSelectedCountry(country);
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-purple-200">
      {/* Domain Authentication Modal */}
      {(!isAuthenticated || authModalTab !== null) && (
        <DomainLoginModal
          onSuccess={(domain, username, role) => {
            handleDomainSuccess(domain, username, role);
          }}
          initialDomain={domainName}
          users={users}
          onRegisterUser={handleCreateUser}
          onClose={isAuthenticated ? () => setAuthModalTab(null) : undefined}
          initialTab={authModalTab || 'login'}
        />
      )}

      {/* Top Application Ribbon for Desktop/Terminal Mode */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SBS Pro Terminal
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <button
            onClick={() => {
              soundManager.playClick();
              setAuthModalTab('domain');
            }}
            title="Configure Server Domain"
            className="text-slate-400 hover:text-white cursor-pointer transition-colors hidden sm:inline text-left"
          >
            Domain: <strong className="text-purple-300 underline underline-offset-2">{domainName}</strong>
          </button>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 flex items-center gap-1">
            Logged as: <strong className="text-amber-300">{currentUser.name}</strong>
            <span
              className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                currentUser.role === 'admin' ? 'bg-red-500 text-white' : 'bg-purple-800 text-purple-200'
              }`}
            >
              {currentUser.role}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pending Queue alert button */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('QUEUE');
              }}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingApprovalsCount} In Queue</span>
            </button>
          )}

          {/* Direct APK Install Button in Ribbon */}
          <button
            onClick={() => {
              soundManager.playClick();
              setShowApkModal(true);
            }}
            className="px-2.5 py-1 rounded bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
            title="Download APK / Install Android Application"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install APK</span>
          </button>

          {/* User's Profile Shortcut Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('PROFILE');
            }}
            className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="View My Profile & Details"
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>My Profile</span>
          </button>

          {/* Mobile / Desktop Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsMobileView(!isMobileView);
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isMobileView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Desktop View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Mobile View</span>
              </>
            )}
          </button>

          {/* Quick Sign In / Change User */}
          <button
            onClick={() => {
              soundManager.playClick();
              setAuthModalTab('login');
            }}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="Switch User / Sign In"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Sign In</span>
          </button>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            title="Log Out from Terminal"
            className="text-slate-400 hover:text-red-400 p-1 transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 flex justify-center items-start p-0 sm:p-4 md:p-6 lg:p-8">
        {isMobileView ? (
          /* MOBILE PHONE FRAME MODE */
          <div className="w-full max-w-md bg-white shadow-2xl rounded-none sm:rounded-3xl border border-slate-200 overflow-hidden flex flex-col min-h-[92vh]">
            <Header
              activeTab={activeTab}
              onTabChange={setActiveTab}
              wallet={wallet}
              userBalance={currentUser.balance}
              onOpenShield={() => setShowShieldModal(true)}
              onResetHome={handleResetHome}
              isMobileView={isMobileView}
              onToggleMobileView={() => setIsMobileView(false)}
              soundMuted={soundMuted}
              onToggleSound={() => {
                const muted = soundManager.toggleMute();
                setSoundMuted(muted);
              }}
              domainName={domainName}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              pendingApprovalsCount={pendingApprovalsCount}
              onOpenApkModal={() => setShowApkModal(true)}
            />

            {/* Horizontal Service Icons Ribbon (under header, only when recharge is active) */}
            {activeTab === 'RECHARGE' && (
              <ServiceRibbon
                activeService={activeService}
                onSelectService={handleSelectService}
              />
            )}

            {/* Main Interactive Screen */}
            <div className="flex-1 bg-slate-50/60 pb-3 overflow-y-auto">{renderMainContent()}</div>

            {/* Mobile Bottom Navigation Bar (Very User Friendly UX) */}
            <MobileBottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCount={pendingApprovalsCount}
              userRole={currentUser.role}
            />
          </div>
        ) : (
          /* DESKTOP / SHOP OWNER & ADMIN PORTAL MODE */
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Terminal / Phone Interface */}
            <div className="lg:col-span-5 bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
              <Header
                activeTab={activeTab}
                onTabChange={setActiveTab}
                wallet={wallet}
                userBalance={currentUser.balance}
                onOpenShield={() => setShowShieldModal(true)}
                onResetHome={handleResetHome}
                isMobileView={isMobileView}
                onToggleMobileView={() => setIsMobileView(true)}
                soundMuted={soundMuted}
                onToggleSound={() => {
                  const muted = soundManager.toggleMute();
                  setSoundMuted(muted);
                }}
                domainName={domainName}
                currentUserRole={currentUser.role}
                currentUserName={currentUser.name}
                pendingApprovalsCount={pendingApprovalsCount}
                onOpenApkModal={() => setShowApkModal(true)}
              />

              {activeTab === 'RECHARGE' && (
                <ServiceRibbon
                  activeService={activeService}
                  onSelectService={handleSelectService}
                />
              )}

              <div className="flex-1 bg-slate-50/60 p-1 overflow-y-auto">{renderMainContent()}</div>
            </div>

            {/* Right Column: Admin Approval Feed, Real-time Ledger & Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Pending Alert Banner */}
              {((currentUser.role === 'admin' && pendingApprovalsCount > 0) ||
                (currentUser.role === 'agent' &&
                  transactions.some(
                    (t) =>
                      (t.agentId === currentUser.username || t.agentName === currentUser.name) &&
                      t.status === 'Pending'
                  ))) && (
                <div className="bg-amber-500 text-slate-950 p-4 rounded-xl border border-amber-600 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-black">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">
                        {currentUser.role === 'admin'
                          ? `${pendingApprovalsCount} Transaction(s) Pending Admin Clearance!`
                          : `${
                              transactions.filter(
                                (t) =>
                                  (t.agentId === currentUser.username ||
                                    t.agentName === currentUser.name) &&
                                  t.status === 'Pending'
                              ).length
                            } Order(s) Awaiting Admin Clearance`}
                      </h4>
                      <p className="text-xs text-slate-900 font-medium">
                        {currentUser.role === 'admin'
                          ? 'Review and approve/reject agent transactions in real-time.'
                          : 'Your funds are secured while administrator clearance is processed.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTab('QUEUE');
                    }}
                    className="py-2 px-3.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    Open Queue &rarr;
                  </button>
                </div>
              )}

              {/* Financial Status Summary Strip */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    {currentUser.role === 'admin' ? 'Admin Reserve' : 'My Balance'}
                  </span>
                  <div className="text-xl font-black text-purple-950 font-mono mt-1">
                    ৳ {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-purple-700 font-medium mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Auto-synced
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Today's Profit
                  </span>
                  <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                    + ৳ {wallet.todayProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 2.8% Average Margin
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Account Status
                  </span>
                  <div className="text-sm font-black text-purple-900 uppercase mt-1">
                    {currentUser.role === 'admin' ? 'Super Admin' : 'Authorized Agent'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1">
                    Terminal: {currentUser.username}
                  </span>
                </div>
              </div>

              {/* Live Real-Time Transaction Ledger Feed */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {currentUser.role === 'admin' ? 'Live Transaction Feed' : 'My Recent Transactions'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentUser.role === 'admin'
                        ? 'All network customer top-ups & bills'
                        : 'Your recent recharge & bill-pay ledger'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        setActiveReportCategory({ key: 'history_all', label: 'All History' });
                      }}
                      className="text-xs text-purple-800 hover:underline font-bold cursor-pointer"
                    >
                      View Full Ledger &rarr;
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {(currentUser.role === 'admin'
                    ? transactions
                    : transactions.filter(
                        (tx) =>
                          tx.agentId === currentUser.username || tx.agentName === currentUser.name
                      )
                  )
                    .slice(0, 10)
                    .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0"
                          style={{ backgroundColor: tx.operatorColor || '#5B2384' }}
                        >
                          {tx.operatorShortCode || tx.serviceName.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{tx.accountOrPhone}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({tx.serviceName})</span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                                tx.status === 'Success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {tx.status === 'Pending' ? 'Awaiting Admin' : tx.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-mono">{tx.trxId}</span>
                            <span>·</span>
                            <span>{tx.agentName || 'Agent'}</span>
                            <span>·</span>
                            <span>{tx.timestamp.slice(11)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-black text-slate-900 font-mono text-sm block">
                            ৳ {tx.amount.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            +৳{tx.commission.toFixed(2)} profit
                          </span>
                        </div>

                        {/* Admin Inline Approval Action if Pending */}
                        {currentUser.role === 'admin' && tx.status === 'Pending' ? (
                          <button
                            onClick={() => handleApproveTransaction(tx.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedReceipt(tx);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Print / View Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {showShieldModal && (
        <BalanceShieldModal
          wallet={wallet}
          currentUser={currentUser}
          onClose={() => setShowShieldModal(false)}
          onAddFunds={handleAddFunds}
          onRequestAddMoney={handleRequestAddMoney}
          onNavigateToQueue={() => setActiveTab('QUEUE')}
          pendingRequestsCount={
            transactions.filter((t) => t.type === 'balance_request' && t.status === 'Pending').length
          }
        />
      )}

      {selectedReceipt && (
        <ReceiptModal
          transaction={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {activeReportCategory && (
        <ReportDetailModal
          categoryKey={activeReportCategory.key}
          categoryLabel={activeReportCategory.label}
          transactions={
            currentUser.role === 'admin'
              ? transactions
              : transactions.filter(
                  (tx) => tx.agentId === currentUser.username || tx.agentName === currentUser.name
                )
          }
          onClose={() => setActiveReportCategory(null)}
          onSelectReceipt={(tx) => {
            setActiveReportCategory(null);
            setSelectedReceipt(tx);
          }}
        />
      )}

      {showScreenshotsModal && (
        <OriginalScreenshotsModal onClose={() => setShowScreenshotsModal(false)} />
      )}

      {showApkModal && (
        <ApkInstallModal
          isOpen={showApkModal}
          onClose={() => setShowApkModal(false)}
          canInstall={canInstall}
          isInstalled={isInstalled}
          isAndroid={isAndroid}
          onTriggerInstall={triggerInstall}
        />
      )}
    </div>
  );
}
