import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Trash2,
  Key,
  ShieldCheck,
  HardDrive,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    apiKey,
    setApiKey,
    resetToSampleData,
    clearAllData,
    isSampleData,
    transactions,
  } = useApp();

  const [inputKey, setInputKey] = useState(apiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    resetToSampleData();
    setIsSettingsOpen(false);
  };

  const handleClearData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearAllData();
    setConfirmClear(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-midnight-850 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Settings & Privacy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage demo data, configure AI keys, and view storage privacy.
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Section 1: AI Integration Settings */}
          <div className="p-4 rounded-xl bg-midnight-900 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-brand-teal" />
              <h3 className="text-sm font-bold text-white">Google Gemini API Key (Optional)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SpendSense includes an <strong>Automated Financial Intelligence Engine</strong> that works 100% locally with zero external API calls. You can optionally connect a Gemini API key for advanced natural language reasoning.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3 pt-1">
              <div className="relative">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full px-3.5 py-2 bg-midnight-950 border border-white/10 focus:border-brand-teal rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-teal hover:underline"
                >
                  Get free Gemini API key <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-2">
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputKey('');
                        setApiKey('');
                      }}
                      className="text-xs text-slate-400 hover:text-rose-400 transition"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-teal text-midnight-950 hover:bg-teal-400 transition"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Saved
                      </>
                    ) : (
                      'Save Key'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Section 2: Demo Data & Reset Controls */}
          <div className="p-4 rounded-xl bg-midnight-900 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-brand-emerald" />
              <h3 className="text-sm font-bold text-white">Dataset Management</h3>
            </div>
            <p className="text-xs text-slate-400">
              Current transactions count: <strong>{transactions.length}</strong> {isSampleData ? '(Sample dataset active)' : '(User entered data)'}.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetDemo}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-midnight-800 hover:bg-midnight-750 text-brand-emerald border border-brand-emerald/30 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Sample Data</span>
              </button>

              <button
                type="button"
                onClick={handleClearData}
                className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  confirmClear
                    ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                    : 'bg-midnight-800 hover:bg-rose-500/10 text-rose-400 border-white/5 hover:border-rose-500/30'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmClear ? 'Click again to confirm' : 'Clear All Data'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Privacy & Security Disclosure */}
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 text-brand-teal text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Data & Privacy Guarantee</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
              <li>All expense transactions are stored locally in your browser’s localStorage.</li>
              <li>SpendSense never requests or collects UPI PINs, bank passwords, or debit/credit card numbers.</li>
              <li>Local storage does not synchronize across different devices or browsers.</li>
              <li>All financial totals and analytics are computed client-side in deterministic JavaScript.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-midnight-800 hover:bg-midnight-750 text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
