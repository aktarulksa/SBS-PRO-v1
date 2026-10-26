import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { SbsLogo } from './SbsLogo';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
  onTriggerInstall: () => Promise<boolean>;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({
  isOpen,
  onClose,
  canInstall,
  isInstalled,
  isAndroid,
  onTriggerInstall,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'install' | 'package' | 'guide'>('install');
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await onTriggerInstall();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  const bubblewrapCode = `# Generate standard signed Android APK with Google Bubblewrap:
npm install -g @bubblewrap/cli
bubblewrap init --manifest="${window.location.origin}/manifest.webmanifest"
bubblewrap build
# The generated app-release-signed.apk will be in the output folder!`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bubblewrapCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadManifestPackage = () => {
    const packageConfig = {
      name: "SBS Pro - Mobile Recharge & Financial Services Portal",
      short_name: "SBS Pro",
      package_id: "com.sbspro.recharge",
      version: "2.4.0",
      version_code: 24,
      theme_color: "#5B2384",
      background_color: "#0f172a",
      start_url: window.location.origin + "/",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        { src: "/pwa-maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ],
      features: [
        "Multi-Operator Flexiload (GP, Robi, BL, Airtel, Teletalk)",
        "MFS Cash-In & Send Money (bKash, Nagad, Rocket, Upay)",
        "Special Drive Packs & Cashbacks",
        "Terminal Mobile ID Security"
      ],
      instructions: "Upload this manifest to https://www.pwabuilder.com or run with Bubblewrap CLI to generate an Android APK."
    };

    const blob = new Blob([JSON.stringify(packageConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sbs-pro-android-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with App Banner */}
        <div className="bg-gradient-to-r from-[#5B2384] via-[#481a69] to-[#361150] px-5 py-4 text-white flex items-center justify-between border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1.5 flex items-center justify-center shadow-inner border border-white/20">
              <SbsLogo size="sm" showText={false} inverted={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight text-white">SBS Pro Android App</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                  APK / PWA
                </span>
              </div>
              <p className="text-xs text-purple-200/90 font-mono mt-0.5">Package: com.sbspro.recharge • v2.4.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-800/80 border-b border-slate-700 text-xs font-semibold px-3 pt-2 gap-2">
          <button
            onClick={() => setActiveSubTab('install')}
            className={`px-3 py-2 border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeSubTab === 'install'
                ? 'border-orange-500 text-orange-400 bg-slate-700/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Direct Install (APK)
          </button>
          <button
            onClick={() => setActiveSubTab('package')}
            className={`px-3 py-2 border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeSubTab === 'package'
                ? 'border-orange-500 text-orange-400 bg-slate-700/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            APK Package &amp; Build
          </button>
          <button
            onClick={() => setActiveSubTab('guide')}
            className={`px-3 py-2 border-b-2 rounded-t transition-all flex items-center gap-1.5 ${
              activeSubTab === 'guide'
                ? 'border-orange-500 text-orange-400 bg-slate-700/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Android Guide
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {activeSubTab === 'install' && (
            <div className="space-y-4">
              {isInstalled ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-200 text-base">SBS Pro is Already Installed!</h4>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      You are using the standalone Android application version of SBS Pro with full offline capabilities and instant terminal access.
                    </p>
                  </div>
                </div>
              ) : installSuccess ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-emerald-300 text-base">Installation Initiated!</h4>
                  <p className="text-xs text-slate-300">
                    The SBS Pro App is being added to your Android home screen and app drawer.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-purple-900/30 to-slate-800/80 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold mb-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      Instant Android App (WebAPK / PWA)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Install directly onto your Android smartphone without downloading from Google Play. Runs in full-screen standalone mode with native performance and instant push alerts.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-purple-500/20 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>100% Virus Free &amp; Secure</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <span>Size: ~4.2 MB</span>
                      </div>
                    </div>
                  </div>

                  {canInstall ? (
                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Download className="w-5 h-5" />
                      <span>Install SBS Pro App on Android</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleInstallClick}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#5B2384] to-purple-700 hover:from-[#481a69] hover:to-purple-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        <Smartphone className="w-5 h-5" />
                        <span>Add App to Android Home Screen</span>
                      </button>
                      <p className="text-[11px] text-center text-slate-400">
                        {isAndroid 
                          ? 'Tap Chrome menu (⋮) at top-right and select "Install app" or "Add to Home screen"'
                          : 'On desktop/iOS, use browser share menu to Install or Add to Home Screen'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Feature Highlights */}
              <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Android App Capabilities</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Real-time Sound Chimes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Offline Cash Receipt Cache</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Auto-update without re-install</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Full-screen Mobile Experience</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'package' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Turn into Standalone .APK File
                  </h4>
                  <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                    PWABuilder / TWA
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You can convert this PWA into an installable signed <code className="text-orange-400 font-mono">.apk</code> / <code className="text-orange-400 font-mono">.aab</code> package for Google Play Store or direct sideloading.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(window.location.origin)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Generate APK on PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={handleDownloadManifestPackage}
                    className="py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-600 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download App Config</span>
                  </button>
                </div>
              </div>

              {/* Bubblewrap CLI command */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">Terminal Command (CLI APK Generation):</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 font-mono text-[11px]"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {bubblewrapCode}
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'guide' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">How to Install on Android in 3 Steps:</h4>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">Open in Chrome or Samsung Internet</p>
                    <p className="text-slate-400 mt-0.5">Visit this portal using Google Chrome on your Android smartphone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">Tap Browser Menu (⋮)</p>
                    <p className="text-slate-400 mt-0.5">Click the 3 vertical dots at the top right of your browser screen.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-orange-600/30 text-orange-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">Tap "Install App" or "Add to Home screen"</p>
                    <p className="text-slate-400 mt-0.5">The SBS Pro app icon will instantly appear on your home screen like any Android APK.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/60 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Service Worker Cached &amp; Offline Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
