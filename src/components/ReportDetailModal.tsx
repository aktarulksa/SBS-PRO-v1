import React, { useState } from 'react';
import { Transaction } from '../types';
import { ReportCategoryKey } from './ReportsView';
import { X, Search, Download, Printer, Filter, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ReportDetailModalProps {
  categoryKey: ReportCategoryKey;
  categoryLabel: string;
  transactions: Transaction[];
  onClose: () => void;
  onSelectReceipt: (tx: Transaction) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  categoryKey,
  categoryLabel,
  transactions,
  onClose,
  onSelectReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Pending' | 'Failed'>('All');

  // Filter transactions based on categoryKey
  const categoryFiltered = transactions.filter((tx) => {
    if (categoryKey === 'history_all' || categoryKey === 'report_daily' || categoryKey === 'report_30days' || categoryKey === 'report_this_month' || categoryKey === 'report_last_month' || categoryKey === 'report_3month' || categoryKey === 'report_custom' || categoryKey === 'report_annual') {
      return true;
    }
    if (categoryKey === 'history_sms') {
      return tx.type === 'recharge' || tx.type === 'bill_pay';
    }
    if (categoryKey === 'history_prepaid') {
      return tx.type === 'recharge' && tx.accountType === 'Prepaid';
    }
    if (categoryKey === 'history_billpay') {
      return tx.type === 'bill_pay';
    }
    if (categoryKey === 'history_receive' || categoryKey === 'history_payment') {
      return tx.type === 'mfs';
    }
    if (categoryKey === 'history_drive') {
      return tx.type === 'drive';
    }
    if (categoryKey === 'report_profit_loss') {
      return true;
    }
    return true;
  });

  // Apply search and status filters
  const filteredList = categoryFiltered.filter((tx) => {
    const matchesSearch =
      tx.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.accountOrPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate aggregates
  const totalVolume = filteredList.reduce((sum, tx) => sum + tx.amount, 0);
  const totalCommission = filteredList.reduce((sum, tx) => sum + tx.commission, 0);
  const totalCost = filteredList.reduce((sum, tx) => sum + tx.cost, 0);

  const handleDownloadCSV = () => {
    soundManager.playClick();
    const headers = ['TRX ID', 'Timestamp', 'Service', 'Account/Phone', 'Type', 'Amount (BDT)', 'Cost', 'Commission', 'Status'];
    const rows = filteredList.map(tx => [
      tx.trxId,
      tx.timestamp,
      tx.serviceName,
      tx.accountOrPhone,
      tx.category,
      tx.amount,
      tx.cost,
      tx.commission,
      tx.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SBS_Pro_${categoryKey}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#5B2384] text-white px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <span>{categoryLabel}</span>
              <span className="text-xs bg-purple-700/80 px-2 py-0.5 rounded-full font-mono">
                {filteredList.length} Records
              </span>
            </h2>
            <p className="text-xs text-purple-200 mt-0.5">Real-time ledger and transaction breakdown</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Total Volume</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
              ৳ {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Net Retailer Cost</span>
            <span className="text-base sm:text-lg font-bold text-purple-900 font-mono">
              ৳ {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">Commission Earned</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
              + ৳ {totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-80 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone, TRXID, service..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Status:</span>
            {(['All', 'Success', 'Pending', 'Failed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  soundManager.playClick();
                  setStatusFilter(s);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-purple-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No transactions found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">TRX ID &amp; Time</th>
                    <th className="py-2.5 px-3">Service / Operator</th>
                    <th className="py-2.5 px-3">Account / Mobile</th>
                    <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                    <th className="py-2.5 px-3 text-right">Commission</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">{tx.trxId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{tx.timestamp}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {tx.operatorColor && (
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: tx.operatorColor }}
                            />
                          )}
                          <span>{tx.serviceName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{tx.category}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {tx.accountOrPhone}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ৳ {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        + ৳ {tx.commission.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {tx.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                          {tx.status === 'Failed' && <AlertCircle className="w-3 h-3 text-red-600" />}
                          <span>{tx.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            soundManager.playClick();
                            onSelectReceipt(tx);
                          }}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline px-2 py-1 rounded bg-purple-50 cursor-pointer"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>SBS Pro Financial Auditing Core</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
