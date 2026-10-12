import React, { useEffect, useState } from 'react';
import { X, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { hodAiApi } from '../../api/hodAiApi';
import type { HodGetKnowledgeContextOutput } from '../../types/hodAi.types';

interface HodKnowledgeDocumentModalProps {
  documentId: string;
  section?: string;
  onClose: () => void;
}

export const HodKnowledgeDocumentModal: React.FC<HodKnowledgeDocumentModalProps> = ({
  documentId,
  section,
  onClose,
}) => {
  const [data, setData] = useState<HodGetKnowledgeContextOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hodAiApi.executeTool('hod.getKnowledgeContext', {
          documentId,
          section,
        });

        if (isMounted) {
          if (res.status === 'success' && res.result) {
            setData(res.result as HodGetKnowledgeContextOutput);
          } else {
            setError(res.error?.message || 'Failed to load document content');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred fetching regulatory document');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDoc();
    return () => {
      isMounted = false;
    };
  }, [documentId, section]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Official Institutional Bylaws & Regulations
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {data?.title || 'Loading Regulation...'}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs">Fetching grounded document context...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {data.section && (
                <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-900">
                  Section / Clause: {data.section}
                </div>
              )}

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                {data.content}
              </div>

              {data.metadata?.citations && data.metadata.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Statutory Citations
                  </span>
                  <ul className="space-y-1">
                    {data.metadata.citations.map((c: string, idx: number) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-600 flex items-start gap-1.5"
                      >
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Last Updated:{' '}
                  {data.lastUpdated
                    ? new Date(data.lastUpdated).toLocaleDateString()
                    : 'N/A'}
                </span>
                {data.metadata?.sourceUrl && (
                  <span className="font-mono text-[10px]">
                    Ref: {data.metadata.sourceUrl}
                  </span>
                )}
              </div>
            </>
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
