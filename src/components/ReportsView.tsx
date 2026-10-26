import React from 'react';
import { History, MessageSquare, CreditCard, Receipt, ArrowDownLeft, ArrowUpRight, BarChart3, Users, Calendar } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type ReportCategoryKey =
  | 'history_all'
  | 'history_sms'
  | 'history_prepaid'
  | 'history_billpay'
  | 'history_receive'
  | 'history_payment'
  | 'history_drive'
  | 'report_profit_loss'
  | 'report_daily'
  | 'report_30days'
  | 'report_this_month'
  | 'report_last_month'
  | 'report_3month'
  | 'report_custom'
  | 'report_annual'
  | 'report_resellers';

interface ReportsViewProps {
  onSelectCategory: (key: ReportCategoryKey, label: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onSelectCategory }) => {
  // Exact layout from Screenshot 3: History section
  const historyItems = [
    {
      id: 'history_all',
      label: 'History',
      bg: 'bg-[#1E88E5]',
      textColor: 'text-[#1E88E5]',
      icon: <History className="w-8 h-8 text-white" />
    },
    {
      id: 'history_sms',
      label: 'SMS',
      bg: 'bg-[#E91E63]',
      textColor: 'text-[#E91E63]',
      icon: <MessageSquare className="w-8 h-8 text-white" />
    },
    {
      id: 'history_prepaid',
      label: 'Prepaid',
      bg: 'bg-[#FF9800]',
      textColor: 'text-[#FF9800]',
      icon: <CreditCard className="w-8 h-8 text-white" />
    },
    {
      id: 'history_billpay',
      label: 'BillPay',
      bg: 'bg-[#795548]',
      textColor: 'text-[#795548]',
      icon: <Receipt className="w-8 h-8 text-white" />
    },
    {
      id: 'history_receive',
      label: 'Receive',
      bg: 'bg-[#00BCD4]',
      textColor: 'text-[#00BCD4]',
      icon: <ArrowDownLeft className="w-8 h-8 text-white" />
    },
    {
      id: 'history_payment',
      label: 'Payment',
      bg: 'bg-[#2E7D32]',
      textColor: 'text-[#2E7D32]',
      icon: <ArrowUpRight className="w-8 h-8 text-white" />
    },
    {
      id: 'history_drive',
      label: 'Drive Offers',
      bg: 'bg-[#9C27B0]',
      textColor: 'text-[#9C27B0]',
      icon: <History className="w-8 h-8 text-white" />
    },
  ];

  // Exact layout from Screenshot 3: Report section
  const reportItems = [
    {
      id: 'report_profit_loss',
      label: 'Profit Loss',
      bg: 'bg-[#E91E63]',
      textColor: 'text-[#E91E63]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_daily',
      label: 'Daily Report',
      bg: 'bg-[#1976D2]',
      textColor: 'text-[#1976D2]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_30days',
      label: '30 Days',
      bg: 'bg-[#9E9E9E]',
      textColor: 'text-[#9E9E9E]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_this_month',
      label: 'This Month',
      bg: 'bg-[#7E57C2]',
      textColor: 'text-[#7E57C2]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_last_month',
      label: 'Last Month',
      bg: 'bg-[#5E35B1]',
      textColor: 'text-[#5E35B1]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_3month',
      label: '3 Month',
      bg: 'bg-[#311B92]',
      textColor: 'text-[#311B92]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_custom',
      label: 'Custom Range',
      bg: 'bg-[#43A047]',
      textColor: 'text-[#43A047]',
      icon: <Calendar className="w-8 h-8 text-white" />
    },
    {
      id: 'report_annual',
      label: 'Annual Ledger',
      bg: 'bg-[#8E24AA]',
      textColor: 'text-[#8E24AA]',
      icon: <BarChart3 className="w-8 h-8 text-white" />
    },
    {
      id: 'report_resellers',
      label: 'Resellers',
      bg: 'bg-[#6D4C41]',
      textColor: 'text-[#6D4C41]',
      icon: <Users className="w-8 h-8 text-white" />
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden m-3 p-4 sm:p-6 space-y-7">
      
      {/* SECTION 1: HISTORY (Matching Screenshot 3) */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 rotate-0 sm:-rotate-90 sm:absolute sm:-left-6 sm:top-8 sm:w-16">
            History
          </span>
          <h2 className="text-sm font-extrabold text-slate-800 tracking-tight sm:pl-6">
            Transaction &amp; Gateway Logs
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-y-5 gap-x-2 sm:gap-x-4 sm:pl-6">
          {historyItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onSelectCategory(item.id as ReportCategoryKey, item.label);
              }}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              {/* Colorful Square Card matching Screenshot 3 */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.bg} rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all`}>
                {item.icon}
              </div>

              {/* Colorful Text Label underneath matching Screenshot 3 */}
              <span className={`mt-1.5 text-xs font-bold text-center tracking-tight ${item.textColor} group-hover:underline`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 my-4" />

      {/* SECTION 2: REPORT (Matching Screenshot 3) */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 rotate-0 sm:-rotate-90 sm:absolute sm:-left-6 sm:top-8 sm:w-16">
            Report
          </span>
          <h2 className="text-sm font-extrabold text-slate-800 tracking-tight sm:pl-6">
            Analytical Statements &amp; Profit Ledger
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-y-5 gap-x-2 sm:gap-x-4 sm:pl-6">
          {reportItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onSelectCategory(item.id as ReportCategoryKey, item.label);
              }}
              className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
            >
              {/* Colorful Square Card matching Screenshot 3 */}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 ${item.bg} rounded-lg flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all`}>
                {item.icon}
              </div>

              {/* Colorful Text Label underneath */}
              <span className={`mt-1.5 text-xs font-bold text-center tracking-tight ${item.textColor} group-hover:underline`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
