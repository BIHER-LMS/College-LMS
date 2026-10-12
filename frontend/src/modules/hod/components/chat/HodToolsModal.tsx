import React, { useEffect, useState } from 'react';
import { X, Wrench, Shield, Loader2, AlertCircle } from 'lucide-react';
import { hodAiApi } from '../../api/hodAiApi';
import type { ToolMetadata } from '../../types/hodAi.types';

interface HodToolsModalProps {
  onClose: () => void;
}

export const HodToolsModal: React.FC<HodToolsModalProps> = ({ onClose }) => {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTools = async () => {
      try {
        const res = await hodAiApi.getTools();
        if (isMounted) setTools(res);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load canonical tools catalog');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTools();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Canonical Architecture Specification
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                HOD AI Registered Tool Catalog
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading registered tools...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                All 7 tools operate strictly under verified HOD tenant isolation, bound
                deterministically to the HOD&apos;s department and college.
              </div>
              <div className="space-y-2.5">
                {tools.map((t) => (
                  <div
                    key={t.name}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {t.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Owner: {t.owner}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        Role: {t.requiredRole}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono">
                      Params: {t.parameterDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
