import React, { useState } from 'react';
import { Transaction, UserProfile, WalletState } from '../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Users,
  Search,
  CheckCheck,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  DollarSign,
  PlusCircle,
  FileText
} from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AdminApprovalsViewProps {
  transactions: Transaction[];
  currentUser: UserProfile;
  users: UserProfile[];
  wallet: WalletState;
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string, reason?: string) => void;
  onBatchApprove: (txIds: string[]) => void;
  onAddAgentCredit: (agentId: string, amount: number) => void;
  onCreateUser: (newUser: Omit<UserProfile, 'id' | 'joinedDate'>) => void;
  approvalPolicy: 'all' | 'high_value' | 'drive_mfs';
  onChangeApprovalPolicy: (policy: 'all' | 'high_value' | 'drive_mfs') => void;
  onCreateTestOrder?: () => void;
}

export const AdminApprovalsView: React.FC<AdminApprovalsViewProps> = ({
  transactions,
  currentUser,
  users,
  wallet,
  onApproveTransaction,
  onRejectTransaction,
  onBatchApprove,
  onAddAgentCredit,
  onCreateUser,
  approvalPolicy,
  onChangeApprovalPolicy,
  onCreateTestOrder,
}) => {
  const [subTab, setSubTab] = useState<'pending' | 'all' | 'agents' | 'settings'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalTx, setRejectModalTx] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Operator Gateway Timeout');
  const [showAddCreditModal, setShowAddCreditModal] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState('5000');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'agent' | 'admin'>('agent');
  const [newPin, setNewPin] = useState('1234');
  const [newPhone, setNewPhone] = useState('01712-000000');
  const [newBalance, setNewBalance] = useState('10000');
  const [formError, setFormError] = useState('');

  // Pending queue
  const pendingTransactions = transactions.filter((tx) => tx.status === 'Pending');
  const approvedCount = transactions.filter((tx) => tx.status === 'Success').length;
  const rejectedCount = transactions.filter((tx) => tx.status === 'Rejected' || tx.status === 'Failed').length;
  const totalPendingAmount = pendingTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  const filteredTransactions = transactions.filter((tx) => {
    if (subTab === 'pending') {
      return tx.status === 'Pending';
    }
    const matchesSearch =
      tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.accountOrPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.agentName && tx.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.agentId && tx.agentId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      setFormError('Username and Name are required');
      soundManager.playError();
      return;
    }
    if (newPin.length !== 4) {
      setFormError('PIN must be 4 digits');
      soundManager.playError();
      return;
    }
    const numBal = parseFloat(newBalance) || 0;
    onCreateUser({
      username: newUsername.trim(),
      name: newName.trim(),
      role: newRole,
      pin: newPin,
      phone: newPhone,
      email: `${newUsername.toLowerCase()}@sbs-pro.net`,
      balance: numBal,
      status: 'active',
    });
    soundManager.playSuccess();
    setShowCreateUserModal(false);
    setNewUsername('');
    setNewName('');
    setFormError('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3">
      {/* Admin Authority Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-amber-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight">Admin Approval Authority</h2>
              <span className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Transaction clearance hub · Only authorized Admin can approve agent orders
            </p>
          </div>
        </div>

        {/* Batch Approve All pending button */}
        {pendingTransactions.length > 0 && (
          <button
            onClick={() => {
              soundManager.playSuccess();
              onBatchApprove(pendingTransactions.map((t) => t.id));
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Approve All ({pendingTransactions.length})</span>
          </button>
        )}
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending Clearance</span>
          <span className="text-lg font-black text-amber-600 font-mono flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" /> {pendingTransactions.length}
          </span>
          <span className="text-[10px] text-slate-400">৳ {totalPendingAmount.toLocaleString()} total</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Approved Orders</span>
          <span className="text-lg font-black text-emerald-700 font-mono">
            {approvedCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-credited</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Rejected / Refunded</span>
          <span className="text-lg font-black text-red-600 font-mono">
            {rejectedCount}
          </span>
          <span className="text-[10px] text-slate-400">Agent balance restored</span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Registered Agents</span>
          <span className="text-lg font-black text-purple-900 font-mono">
            {users.filter((u) => u.role === 'agent').length}
          </span>
          <span className="text-[10px] text-purple-700 font-medium">Network Retailers</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-3 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => {
            soundManager.playClick();
            setSubTab('pending');
          }}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            subTab === 'pending'
              ? 'border-purple-800 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingTransactions.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setSubTab('all');
          }}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            subTab === 'all'
              ? 'border-purple-800 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Transaction Ledger
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setSubTab('agents');
          }}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            subTab === 'agents'
              ? 'border-purple-800 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Agent Accounts</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setSubTab('settings');
          }}
          className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
            subTab === 'settings'
              ? 'border-purple-800 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approval Policy
        </button>
      </div>

      {/* SUB-TAB: PENDING APPROVALS */}
      {subTab === 'pending' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Pending Transactions Queue ({pendingTransactions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Transactions initiated by agents requiring Admin signature before gateway execution
              </p>
            </div>

            {onCreateTestOrder && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onCreateTestOrder();
                }}
                className="py-1.5 px-3 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto border border-purple-300"
              >
                <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
                <span>+ Simulate Agent Order</span>
              </button>
            )}
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">
                There are no pending transactions awaiting admin approval. New transactions submitted by agents will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white border-2 border-amber-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {tx.trxId}
                      </span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting Admin Approval
                      </span>
                      <span className="text-[11px] text-slate-400">{tx.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="font-black text-slate-900 text-sm">{tx.serviceName}</span>
                      <span className="text-xs text-slate-600 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        {tx.accountOrPhone}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">({tx.category})</span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      <span>
                        Agent: <strong className="text-slate-800">{tx.agentName || 'Retailer'}</strong> ({tx.agentId || 'AGT'})
                      </span>
                      {tx.note && <span>Note: <em className="text-slate-600">{tx.note}</em></span>}
                    </div>
                  </div>

                  {/* Right: Amounts & Admin Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount</span>
                      <span className="text-lg font-black text-purple-950 font-mono">
                        ৳ {tx.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold block">
                        Commission: +৳{tx.commission.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundManager.playError();
                          setRejectModalTx(tx);
                        }}
                        className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Reject and refund agent"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => {
                          soundManager.playSuccess();
                          onApproveTransaction(tx.id);
                        }}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title="Approve transaction and dispatch to operator gateway"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: ALL TRANSACTIONS */}
      {subTab === 'all' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search phone, TRX, agent..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3">TRX &amp; Time</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Service &amp; Recipient</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-50/30">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{tx.trxId}</div>
                      <div className="text-[10px] text-slate-400">{tx.timestamp}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{tx.agentName || 'Retailer'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.agentId || '01712489312'}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{tx.serviceName}</div>
                      <div className="font-mono text-[11px] text-slate-600">{tx.accountOrPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ৳ {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                        tx.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {tx.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              soundManager.playSuccess();
                              onApproveTransaction(tx.id);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white rounded font-bold text-[10px] hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playError();
                              setRejectModalTx(tx);
                            }}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-[10px] hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {tx.approvedBy ? `Approved by ${tx.approvedBy}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: AGENT ACCOUNTS */}
      {subTab === 'agents' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Retailer &amp; Agent Network</h3>
              <p className="text-xs text-slate-500">Manage agent credit balances and create user accounts</p>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowCreateUserModal(true);
              }}
              className="py-1.5 px-3 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border ${
                    isAdmin
                      ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-300'
                      : 'bg-white border-slate-200'
                  } shadow-xs space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        isAdmin ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isAdmin ? 'ADMINISTRATOR' : 'AGENT / RETAILER'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{u.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{u.username}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold capitalize">
                      {u.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Wallet Balance</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ৳ {u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          setShowAddCreditModal(u);
                        }}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Balance</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: APPROVAL POLICY SETTINGS */}
      {subTab === 'settings' && (
        <div className="p-4 sm:p-5 space-y-4 max-w-xl">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Transaction Approval Policy</h3>
            <p className="text-xs text-slate-500">Configure how and when agent orders require admin clearance</p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'all',
                title: 'Strict Approval (All Transactions)',
                desc: 'Every mobile recharge, drive pack, and bill payment must be reviewed and approved by an Admin before dispatching.',
                badge: 'Recommended',
              },
              {
                id: 'high_value',
                title: 'High-Value Orders (> ৳ 500)',
                desc: 'Micro top-ups (< ৳ 500) execute automatically. Large recharges and cash-ins require Admin signature.',
              },
              {
                id: 'drive_mfs',
                title: 'Drive Packs & Financial Services Only',
                desc: 'Regular operator recharges execute instantly, while bKash/Rocket and heavy discount Drive Packs require Admin approval.',
              },
            ].map((policy) => {
              const isSelected = approvalPolicy === policy.id;
              return (
                <div
                  key={policy.id}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeApprovalPolicy(policy.id as typeof approvalPolicy);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-800 bg-purple-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{policy.title}</span>
                    {policy.badge && (
                      <span className="text-[10px] bg-purple-900 text-white font-bold px-2 py-0.5 rounded-full">
                        {policy.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{policy.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Reject Transaction</h3>
            </div>
            <p className="text-xs text-slate-600">
              Rejecting order <strong className="font-mono">{rejectModalTx.trxId}</strong> for ৳{rejectModalTx.amount}. Cost will be refunded to {rejectModalTx.agentName || 'agent'}.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Rejection Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50"
              >
                <option value="Operator Gateway Timeout">Operator Gateway Timeout</option>
                <option value="Incorrect Recipient Number">Incorrect Recipient Number</option>
                <option value="Insufficient Agent Credit">Insufficient Agent Credit</option>
                <option value="Duplicate Order Detected">Duplicate Order Detected</option>
                <option value="Drive Pack Quota Filled">Drive Pack Quota Filled</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalTx(null)}
                className="w-1/2 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playError();
                  onRejectTransaction(rejectModalTx.id, rejectionReason);
                  setRejectModalTx(null);
                }}
                className="w-1/2 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENT BALANCE MODAL */}
      {showAddCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Transfer Balance to Agent</h3>
            <p className="text-xs text-slate-600">
              Top-up balance for <strong>{showAddCreditModal.name}</strong> ({showAddCreditModal.username})
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Credit Amount (BDT)</label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="w-full py-2 px-3 text-base font-bold font-mono border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCreditModal(null)}
                className="w-1/2 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = parseFloat(creditAmount);
                  if (num > 0) {
                    soundManager.playSuccess();
                    onAddAgentCredit(showAddCreditModal.id, num);
                    setShowAddCreditModal(null);
                  }
                }}
                className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Transfer Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW ACCOUNT MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateUserSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create New Account</h3>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && <p className="text-xs font-bold text-red-500">{formError}</p>}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('agent')}
                    className={`py-2 text-center rounded-lg border font-bold ${
                      newRole === 'agent' ? 'bg-purple-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Retailer Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`py-2 text-center rounded-lg border font-bold ${
                      newRole === 'admin' ? 'bg-purple-900 text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Username / Terminal ID (Mobile Number)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Full Name / Organization</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. New City Telecom"
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full py-2 px-3 font-mono tracking-widest text-center border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Initial Balance (৳)</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full py-2 px-3 font-mono border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="w-1/2 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-950 rounded-lg shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
