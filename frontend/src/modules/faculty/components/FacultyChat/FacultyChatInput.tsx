import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';

interface FacultyChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const QUICK_SUGGESTIONS = [
  {
    label: 'Attendance Condonation Policy',
    prompt: 'What are the official rules and thresholds for attendance condonation?',
    icon: BookOpen,
  },
  {
    label: 'CIA Internal Marks 40 Scheme',
    prompt: 'Explain the Continuous Internal Assessment (CIA) 40 marks evaluation distribution',
    icon: Award,
  },
  {
    label: 'Assigned Classes',
    prompt: 'Show all classes assigned to me and their current student counts',
    icon: GraduationCap,
  },
  {
    label: 'Class Attendance Stats',
    prompt: 'Check attendance statistics and defaulter list for CSE-3A',
    icon: Sparkles,
  },
  {
    label: 'My Teaching Schedule',
    prompt: 'What is my teaching timetable for today?',
    icon: Clock,
  },
  {
    label: 'Pending Reminders',
    prompt: 'Show my pending academic reminders and tasks',
    icon: Clock,
  },
];

export const FacultyChatInput: React.FC<FacultyChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    if (isLoading || disabled) return;
    onSendMessage(prompt);
  };

  return (
    <div className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xs p-3 sm:p-4 rounded-b-2xl">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0 pl-0.5">
          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
          Quick Ask:
        </span>
        {QUICK_SUGGESTIONS.map((sug, i) => {
          const Icon = sug.icon;
          return (
            <button
              key={i}
              type="button"
              disabled={isLoading || disabled}
              onClick={() => handleSelectSuggestion(sug.prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent transition-all flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-indigo-600" />
              <span>{sug.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box and Action Controls */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || disabled}
            placeholder="Ask about academic policies, classes, attendance, timetable, or student records..."
            className="w-full resize-none rounded-xl border border-slate-300/90 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all max-h-[140px]"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isLoading || disabled}
          className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:hover:bg-indigo-600"
          title="Send message (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
        <span>Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500">Shift+Enter</kbd> for new line</span>
        <span>{text.length}/2000</span>
      </div>
    </div>
  );
};
