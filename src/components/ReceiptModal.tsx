import React, { useState } from 'react';
import { Transaction } from '../types';
import { X, Printer, Copy, Check, Share2, CheckCircle2 } from 'lucide-react';
import { SbsLogo } from './SbsLogo';
import { soundManager } from '../utils/sound';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(
      `SBS Pro Receipt\nTRX: ${transaction.trxId}\nService: ${transaction.serviceName}\nPhone: ${transaction.accountOrPhone}\nAmount: ৳ ${transaction.amount}\nStatus: ${transaction.status}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Top Actions */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Transaction Receipt</span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="Print POS Voucher"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Slip */}
        <div id="printable-receipt" className="p-6 bg-amber-50/20 font-mono text-slate-800 text-xs space-y-4">
          {/* Slip Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
            <div className="flex justify-center mb-1">
              <SbsLogo size="sm" />
            </div>
            <p className="text-[10px] text-slate-500 font-sans">SMART BILLING SYSTEM PRO</p>
            <p className="text-[10px] text-slate-400">Authorized Retailer Terminal</p>
            {transaction.status === 'Pending' ? (
              <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>PENDING ADMIN APPROVAL</span>
              </div>
            ) : transaction.status === 'Rejected' ? (
              <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">
                <span>ORDER REJECTED &amp; REFUNDED</span>
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>TRANSACTION SUCCESSFUL</span>
              </div>
            )}
          </div>

          {/* Slip Body Details */}
          <div className="space-y-1.5 py-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">TRX ID:</span>
              <span className="font-bold text-slate-900">{transaction.trxId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date &amp; Time:</span>
              <span className="text-slate-700">{transaction.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="font-bold text-slate-900">{transaction.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account / Phone:</span>
              <span className="font-bold text-slate-900">{transaction.accountOrPhone}</span>
            </div>
            {transaction.accountType && (
              <div className="flex justify-between">
                <span className="text-slate-500">Account Type:</span>
                <span className="text-slate-700">{transaction.accountType}</span>
              </div>
            )}
            {transaction.agentName && (
              <div className="flex justify-between">
                <span className="text-slate-500">Agent:</span>
                <span className="text-slate-800 font-bold">{transaction.agentName} ({transaction.agentId})</span>
              </div>
            )}
            {transaction.approvedBy && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Approved By:</span>
                <span>{transaction.approvedBy}</span>
              </div>
            )}
            {transaction.rejectionReason && (
              <div className="flex justify-between text-red-700">
                <span>Reject Reason:</span>
                <span>{transaction.rejectionReason}</span>
              </div>
            )}
            {transaction.note && (
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Details:</span>
                <span className="text-right truncate max-w-[180px]">{transaction.note}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="border-t-2 border-b-2 border-dashed border-slate-300 py-3 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-sans">Total Paid</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ৳ {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            {transaction.fee > 0 && (
              <span className="text-[10px] text-slate-500 block mt-0.5">Incl. ৳{transaction.fee} service fee</span>
            )}
          </div>

          {/* Simulated Barcode */}
          <div className="pt-2 flex flex-col items-center">
            <div className="h-8 w-44 bg-repeating-linear-stripes flex items-center justify-center">
              {/* SVG barcode visualization */}
              <svg viewBox="0 0 160 30" className="w-full h-full">
                {[2, 5, 8, 14, 18, 22, 28, 35, 40, 48, 52, 58, 64, 70, 78, 85, 90, 98, 105, 112, 120, 128, 134, 140, 148, 154].map((x, i) => (
                  <rect key={i} x={x} y="0" width={i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1} height="30" fill="#1e293b" />
                ))}
              </svg>
            </div>
            <span className="text-[9px] text-slate-400 tracking-widest mt-1 font-mono">
              *{transaction.trxId.replace(/-/g, '')}*
            </span>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 font-sans pt-2 border-t border-slate-200">
            Thank you for using SBS Pro Retail Network.<br />Keep this receipt for your customer records.
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 bg-purple-900 hover:bg-purple-950 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
