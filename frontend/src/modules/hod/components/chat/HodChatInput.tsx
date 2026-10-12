import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { ToolChoiceOption, HodToolName } from '../../types/hodAi.types';
import { HOD_TOOL_NAMES } from '../../types/hodAi.types';

interface HodChatInputProps {
  onSendMessage: (message: string, toolChoice?: ToolChoiceOption) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const HodChatInput: React.FC<HodChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('auto');
  const [showToolSelector, setShowToolSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140,
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;

    let toolChoice: ToolChoiceOption = 'auto';
    if (selectedTool === 'none') {
      toolChoice = 'none';
    } else if (selectedTool !== 'auto' && (HOD_TOOL_NAMES as readonly string[]).includes(selectedTool)) {
      toolChoice = { type: 'tool', name: selectedTool as HodToolName };
    }

    onSendMessage(trimmed, toolChoice);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_SUGGESTIONS = [
    { label: '📊 Dept Attendance Summary', prompt: 'What is the attendance summary for our department this semester?' },
    { label: '📖 Medical Condonation Bylaw', prompt: 'What is the institutional attendance policy regarding medical condonation?' },
    { label: '⚠️ Defaulter Distribution', prompt: 'Show attendance analytics and defaulter distribution breakdown' },
    { label: '🎯 CIA 40-Mark Evaluation', prompt: 'Explain the continuous internal assessment 40 mark evaluation framework' },
    { label: '🎓 End-Sem Exam Criteria', prompt: 'What are the passing criteria and arrear regulations for end-semester exams?' },
  ];

  return (
    <div className="border-t border-slate-200/80 bg-white p-3 sm:p-4">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
        <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
        </span>
        {QUICK_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(s.prompt);
              if (textareaRef.current) textareaRef.current.focus();
            }}
            disabled={isLoading || disabled}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-full transition-colors disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tool Choice Toggle & Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowToolSelector(!showToolSelector)}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
            <span>Target Tool:</span>
            <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
              {selectedTool}
            </span>
          </button>

          {showToolSelector && (
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-800 outline-none"
            >
              <option value="auto">Auto Intent (Recommended)</option>
              <option value="none">Direct Reasoning Only (None)</option>
              <optgroup label="Attendance Surveillance">
                <option value="hod.getAttendanceSummary">hod.getAttendanceSummary</option>
                <option value="hod.getStudentAttendance">hod.getStudentAttendance</option>
                <option value="hod.getClassAttendance">hod.getClassAttendance</option>
                <option value="hod.getDepartmentAttendance">hod.getDepartmentAttendance</option>
                <option value="hod.getAttendanceAnalytics">hod.getAttendanceAnalytics</option>
              </optgroup>
              <optgroup label="Regulatory RAG">
                <option value="hod.searchKnowledge">hod.searchKnowledge</option>
                <option value="hod.getKnowledgeContext">hod.getKnowledgeContext</option>
              </optgroup>
            </select>
          )}
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          {text.length}/2000
        </span>
      </div>

      {/* Input Box & Action Button */}
      <div className="relative flex items-end gap-2 border border-slate-200 rounded-xl bg-slate-50/50 p-1.5 focus-within:border-slate-900 focus-within:bg-white transition-all shadow-xs">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          onKeyDown={handleKeyDown}
          placeholder="Ask departmental queries, attendance surveillance, or institutional policies..."
          disabled={isLoading || disabled}
          rows={1}
          className="w-full resize-none bg-transparent px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none max-h-36 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading || disabled}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d1c32] text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex-shrink-0"
          title="Send Query (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
