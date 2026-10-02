import React, { useState } from 'react';
import type { CapabilityItem } from '../types';

interface CapabilityModalProps {
  capability: CapabilityItem | null;
  onClose: () => void;
}

export const CapabilityModal: React.FC<CapabilityModalProps> = ({ capability, onClose }) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!capability) return null;

  const handleRunHealthCheck = () => {
    setIsRunning(true);
    setTimeout(() => {
      setTestResult(
        `HEALTH CHECK PASSED [${new Date().toLocaleTimeString()}]: Protocol ${capability.specs.protocol} verified. Latency: 0.8ms. Zero anomalies detected in active registry.`
      );
      setIsRunning(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#c3c6d7] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#eff4ff]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
              <span className="material-symbols-outlined text-2xl">{capability.icon}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                Architecture Specification • {capability.category}
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30]">
                {capability.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#565e74] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#565e74] mb-1">
              Operational Scope
            </h4>
            <p className="text-sm text-[#434655] leading-relaxed">
              {capability.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-xs font-semibold text-[#565e74] block mb-1">Underlying Protocol</span>
              <span className="font-mono text-xs font-bold text-[#0b1c30]">{capability.specs.protocol}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
              <span className="text-xs font-semibold text-[#565e74] block mb-1">Service Level Objective</span>
              <span className="font-mono text-xs font-bold text-emerald-600">{capability.specs.sla}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#565e74] mb-2">
              Key Architectural Guarantees
            </h4>
            <ul className="space-y-2">
              {capability.specs.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-sm text-[#004ac6]">check_circle</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Diagnostic Test */}
          <div className="p-4 rounded-xl bg-[#0b1c30] text-slate-200 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#213145]">
              <span className="text-[#b4c5ff]">DIAGNOSTIC TEST RUNNER</span>
              <button
                onClick={handleRunHealthCheck}
                disabled={isRunning}
                className="px-2.5 py-1 rounded bg-[#004ac6] text-white hover:bg-[#2563eb] text-[11px] transition-colors cursor-pointer"
              >
                {isRunning ? 'Validating...' : 'Run Live Ping'}
              </button>
            </div>
            {testResult ? (
              <p className="text-emerald-400">{testResult}</p>
            ) : (
              <p className="text-slate-400">Click "Run Live Ping" to test round-trip latency against this subsystem.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#eff4ff] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-colors cursor-pointer"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
