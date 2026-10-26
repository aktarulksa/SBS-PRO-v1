import React, { useState } from 'react';
import { Transaction, UserProfile, UserRole } from '../types';
import { soundManager } from '../utils/sound';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Check,
  X,
  Printer,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Phone,
  ArrowRight,
  TrendingUp,
  Ban,
  CheckCheck,
} from 'lucide-react';

interface TransactionsQueueViewProps {
  transactions: Transaction[];
  currentUser: UserProfile;
  onApproveTransaction: (txId: string) => void;
  onRejectTransaction: (txId: string, reason?: string) => void;
  onBatchApprove: (txIds: string[]) => void;
  onSelectReceipt: (tx: Transaction) => void;
  onCancelPendingOrder?: (txId: string) => void;
  onCreateTestOrder?: () => void;
}

export const TransactionsQueueView: React.FC<TransactionsQueueViewProps> = ({
  transactions,
  currentUser,
  onApproveTransaction,
  onRejectTransaction,
  onBatchApprove,
  onSelectReceipt,
  onCancelPendingOrder,
  onCreateTestOrder,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'success' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [customRejectReason, setCustomRejectReason] = useState('Operator clearance failed');

  // Filter list: If user is an AGENT, STRICTLY show only their own transactions!
  const visibleTransactions = transactions.filter((tx) => {
    if (!isAdmin) {
      // Agent only sees their own transactions
      return tx.agentId === currentUser.username || tx.agentName === currentUser.name;
    }
    return true; // Admin can see all
  });

  const filteredTransactions = visibleTransactions.filter((tx) => {
    // Status filter
    if (activeFilter === 'pending' && tx.status !== 'Pending') return false;
    if (activeFilter === 'success' && tx.status !== 'Success') return false;
    if (activeFilter === 'rejected' && tx.status !== 'Rejected' && tx.status !== 'Failed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.accountOrPhone.toLowerCase().includes(q) ||
        tx.trxId.toLowerCase().includes(q) ||
        tx.serviceName.toLowerCase().includes(q) ||
        (tx.agentName && tx.agentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingList = visibleTransactions.filter((tx) => tx.status === 'Pending');
  const pendingCount = pendingList.length;

  const handleQuickApprove = (txId: string) => {
    soundManager.playSuccess();
    onApproveTransaction(txId);
  };

  const handleConfirmReject = (txId: string) => {
    soundManager.playError();
    onRejectTransaction(txId, customRejectReason);
    setRejectingTxId(null);
  };

  const handleBatchApproveAll = () => {
    if (pendingList.length === 0) return;
    soundManager.playSuccess();
    const ids = pendingList.map((tx) => tx.id);
    onBatchApprove(ids);
  };

  return (
    <div className="p-3 sm:p-5 max-w-3xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4 text-purple-800" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {isAdmin ? 'Transaction Approvals Queue' : 'My Orders & Queue Status'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isAdmin
                    ? 'Verify and clear pending agent recharges & financial transfers'
                    : 'Real-time status of your orders awaiting or cleared by Admin'}
                </p>
              </div>
            </div>
          </div>

          {/* Pending pill & Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {pendingCount > 0 ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{pendingCount} Pending Clearance</span>
              </span>
            ) : (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Orders Cleared</span>
              </span>
            )}

            {/* Admin Bulk Approve Button */}
            {isAdmin && pendingCount > 0 && (
              <button
                onClick={handleBatchApproveAll}
                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                title="Approve all pending orders at once"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Approve All ({pendingCount})</span>
              </button>
            )}

            {/* Admin Generate Test Order Button */}
            {isAdmin && onCreateTestOrder && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onCreateTestOrder();
                }}
                className="py-1 px-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title="Simulate incoming agent order to test approval"
              >
                <Sparkles className="w-3 h-3 text-purple-700" />
                <span className="hidden sm:inline">Add Test Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveFilter('pending');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="bg-slate-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveFilter('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({visibleTransactions.length})
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveFilter('success');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'success'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveFilter('rejected');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'rejected'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, TrxID..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal dialog when Admin clicks Reject */}
      {rejectingTxId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Decline Transaction</span>
              </h3>
              <button
                onClick={() => setRejectingTxId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              The order or balance request will be marked as Rejected with the specified note.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Reason for Rejection:
              </label>
              <div className="space-y-1.5">
                {[
                  'Invalid TrxID / Payment Not Found',
                  'Payment Not Received in Admin Account',
                  'Incorrect Amount Deposited',
                  'Operator Gateway Clearance Failed',
                  'Incorrect MSISDN / Number Not Reachable',
                  'Insufficient Gateway Limit',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCustomRejectReason(reason)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors border ${
                      customRejectReason === reason
                        ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectingTxId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReject(rejectingTxId)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-transform active:scale-95 cursor-pointer"
              >
                Confirm Reject &amp; Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Transactions in this Queue</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeFilter === 'pending'
                ? 'All orders have been cleared! New agent recharge requests will appear here.'
                : 'No transactions match the selected filter or search keyword.'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isPending = tx.status === 'Pending';
            const isSuccess = tx.status === 'Success';
            const isRejected = tx.status === 'Rejected' || tx.status === 'Failed';

            return (
              <div
                key={tx.id}
                className={`bg-white rounded-2xl border transition-all p-3.5 sm:p-4 shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : isRejected
                    ? 'border-red-200 bg-red-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Avatar & Order Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: tx.operatorColor || '#5B2384' }}
                    >
                      {tx.operatorShortCode || tx.serviceName.slice(0, 3).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tx.type === 'balance_request' && (
                          <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Add Money Request
                          </span>
                        )}
                        <span className="font-extrabold text-slate-900 text-sm tracking-tight font-mono">
                          {tx.accountOrPhone}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          ({tx.serviceName})
                        </span>
                        <span className="text-[10px] text-slate-400">· {tx.type === 'balance_request' ? 'Balance Deposit' : (tx.accountType || 'Prepaid')}</span>
                      </div>

                      {/* Status indicator line */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                        {isPending && (
                          <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>Awaiting Admin Approval</span>
                          </span>
                        )}

                        {isSuccess && (
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{tx.type === 'balance_request' ? 'Balance Credited & Approved' : 'Cleared & Approved'}</span>
                          </span>
                        )}

                        {isRejected && (
                          <span className="font-extrabold text-red-800 bg-red-100 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Declined</span>
                          </span>
                        )}

                        <span className="font-mono text-slate-400 text-[10px]">{tx.trxId}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 text-[10px]">{tx.timestamp}</span>
                      </div>

                      {/* Note or Reason */}
                      {tx.note && (
                        <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                          {tx.note}
                        </p>
                      )}

                      {/* Agent details if Admin */}
                      {isAdmin && tx.agentName && (
                        <p className="text-[10px] text-purple-700 font-bold mt-1">
                          Retailer Terminal: {tx.agentName} ({tx.agentId})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex flex-col items-end shrink-0 gap-2">
                    <div className="text-right">
                      <span className="font-black text-slate-900 font-mono text-base block">
                        ৳ {tx.amount.toFixed(2)}
                      </span>
                      {tx.type === 'balance_request' ? (
                        <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          Wallet Deposit
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold">
                          +৳{tx.commission.toFixed(2)} commission
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Admin Clearance Action Buttons */}
                      {isAdmin && isPending ? (
                        <>
                          <button
                            onClick={() => handleQuickApprove(tx.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-transform"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>{tx.type === 'balance_request' ? 'Approve & Credit Balance' : 'Approve'}</span>
                          </button>

                          <button
                            onClick={() => setRejectingTxId(tx.id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : null}

                      {/* Agent Cancel Action if still Pending */}
                      {!isAdmin && isPending && onCancelPendingOrder && (
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onCancelPendingOrder(tx.id);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                          title="Cancel before admin clearance"
                        >
                          {tx.type === 'balance_request' ? 'Cancel Request' : 'Cancel Order'}
                        </button>
                      )}

                      {/* Receipt Button */}
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onSelectReceipt(tx);
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
                        title="View / Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
