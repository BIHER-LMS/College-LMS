import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface StudentChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

const QUICK_PROMPTS = [
  { label: '📊 Attendance & Margin', prompt: 'What is my current attendance percentage and safe margin?' },
  { label: '📅 Today’s Timetable', prompt: 'Show me my class timetable and periods for today' },
  { label: '👨‍🏫 Class Incharge', prompt: 'Who is my assigned Class Incharge and what is their contact email?' },
  { label: '📖 Condonation Policy', prompt: 'What are the rules and thresholds for attendance condonation?' },
  { label: '📝 CIA 40-Mark Rules', prompt: 'Explain the Continuous Internal Assessment (CIA) 40 marks evaluation distribution' },
  { label: '🎓 160-Credit Degree', prompt: 'Explain the CBCS credit requirements and grading system for my degree' },
];

export const StudentChatInput: React.FC<StudentChatInputProps> = ({
  onSendMessage,
  isLoading,
  onSelectPrompt,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    } else {
      setInput(prompt);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 px-4 py-3 flex flex-col gap-2.5">
      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-wider pl-1 mr-1">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          Quick Ask:
        </span>
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handlePromptClick(item.prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition-colors font-medium disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your attendance, timetable, faculty incharge, or exam policies..."
          disabled={isLoading}
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden disabled:opacity-50 max-h-28"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shrink-0 shadow-xs flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          title="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
      <div className="text-[10px] text-slate-400 text-center">
        Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
      </div>
    </div>
  );
};
