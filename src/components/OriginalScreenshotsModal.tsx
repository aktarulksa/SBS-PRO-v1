import React, { useState } from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface OriginalScreenshotsModalProps {
  onClose: () => void;
}

export const OriginalScreenshotsModal: React.FC<OriginalScreenshotsModalProps> = ({ onClose }) => {
  const screenshots = [
    {
      id: 'login',
      title: '1. Domain & Login Screen',
      subtitle: 'SBS Pro splash screen with domain entry & MFS watermark',
      path: '/assets/aistudio/2_c84bb0cb.jpg',
    },
    {
      id: 'country',
      title: '2. Recharge & Choose Country',
      subtitle: 'Header, tabs, service icons (Recharge, bKash, Rocket, Bill Pay), and country grid',
      path: '/assets/aistudio/11_0b2ea41c.jpg',
    },
    {
      id: 'operator',
      title: '3. Bangladesh > Choose Operator',
      subtitle: 'Grameenphone (GRA), Robi (ROB), Banglalink (BAN), TeleTalk (TEL), Airtel (AIR)',
      path: '/assets/aistudio/4_2101d08b.jpg',
    },
    {
      id: 'reports',
      title: '4. Reports & History Grid',
      subtitle: 'Colorful square cards for History (SMS, Prepaid, BillPay) and Reports (Profit Loss, Daily, 30 Days)',
      path: '/assets/aistudio/3_ff8eb753.jpg',
    },
  ];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#5B2384] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">Original SBS Pro App Screenshots</h2>
              <p className="text-[11px] text-purple-200">Source design reference uploaded by user</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screenshot Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-semibold">
          {screenshots.map((s, index) => (
            <button
              key={s.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(index);
              }}
              className={`px-4 py-2.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === index
                  ? 'border-purple-800 text-purple-900 bg-white font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-white p-3 rounded-2xl shadow-lg border border-slate-200 text-center">
            <h3 className="text-sm font-bold text-slate-800 mb-1">{screenshots[activeTab].title}</h3>
            <p className="text-xs text-slate-500 mb-3">{screenshots[activeTab].subtitle}</p>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex justify-center items-center max-h-[60vh]">
              <img
                src={screenshots[activeTab].path}
                alt={screenshots[activeTab].title}
                className="max-h-[58vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>All 4 screens implemented as full interactive web applications</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-purple-900 hover:bg-purple-950 text-white font-bold rounded-lg cursor-pointer"
          >
            Back to App
          </button>
        </div>

      </div>
    </div>
  );
};
