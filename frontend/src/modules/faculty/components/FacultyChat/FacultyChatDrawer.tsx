import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Trash2,
  Minimize2,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import type { FacultyChatMessage } from '../../types/facultyAi.types';
import { facultyApi } from '../../api/facultyApi';
import { FacultyChatMessageItem } from './FacultyChatMessageItem';
import { FacultyChatInput } from './FacultyChatInput';

interface FacultyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facultyName?: string;
}

const INITIAL_GREETING: FacultyChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content:
    'Hello Professor! I am your **Faculty & Class Incharge AI Assistant**.\n\n' +
    'I can answer questions regarding institutional policies and assist with academic surveillance:\n' +
    '- 📖 **Policy Lookups:** Inquire about the 75% attendance rule, condonation criteria, or CIA 40-mark evaluation.\n' +
    '- 🏫 **Class Management:** Inspect your assigned classes, students, and representative details.\n' +
    '- 📊 **Attendance Surveillance:** Review section attendance statistics, total sessions, and low-attendance defaulters.\n' +
    '- 📅 **Timetable & Reminders:** View today’s teaching schedule and manage academic deadlines.\n\n' +
    'How can I help you today?',
  timestamp: new Date().toISOString(),
};

export const FacultyChatDrawer: React.FC<FacultyChatDrawerProps> = ({
  isOpen,
  onClose,
  facultyName,
}) => {
  const [messages, setMessages] = useState<FacultyChatMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorBanner(null);
    const userMessage: FacultyChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history payload for contextual chat (last 10 messages)
      const history = messages
        .filter((m) => !m.error)
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const responseData = await facultyApi.sendChatMessage({
        message: text,
        history,
        toolChoice: 'auto',
      });

      const assistantMessage: FacultyChatMessage = {
        id: `msg-asst-${Date.now()}`,
        role: 'assistant',
        content: responseData.message,
        toolsExecuted: responseData.toolsExecuted,
        timestamp: responseData.metadata?.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to contact Faculty AI service. Please check your network or try again.';

      setErrorBanner(errorMsg);

      const errorMessage: FacultyChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notice:** ${errorMsg}`,
        error: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
    setErrorBanner(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div
        className={`relative z-10 w-full bg-slate-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out border-l border-slate-200/90 ${
          isExpanded ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-[#0a1122] text-white p-3.5 sm:px-4 sm:py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs tracking-tight">Faculty AI Assistant</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Online
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                {facultyName ? `For ${facultyName}` : 'Institutional Knowledge & Class Surveillance'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors hidden sm:block"
              title={isExpanded ? 'Collapse width' : 'Expand width'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ml-1"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="p-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between px-4">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorBanner}</span>
            </span>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/60">
          {messages.map((message) => (
            <FacultyChatMessageItem
              key={message.id}
              message={message}
              onRetry={(text) => handleSendMessage(text)}
            />
          ))}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                <span className="text-[11px] ml-1 text-slate-400">
                  Synthesizing answer & retrieving academic tools...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <FacultyChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
