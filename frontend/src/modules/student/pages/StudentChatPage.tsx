import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Trash2,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  ShieldCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import type { StudentChatMessage } from '../types/studentAi.types';
import { studentApi } from '../api/studentApi';
import { StudentChatMessageItem } from '../components/StudentChat/StudentChatMessageItem';
import { StudentChatInput } from '../components/StudentChat/StudentChatInput';

const INITIAL_GREETING: StudentChatMessage = {
  id: 'msg-welcome-student',
  role: 'assistant',
  content:
    '### Welcome to your Student AI Academic Assistant! 🎓\n\n' +
    'I provide authoritative, live academic facts from your official enrollment and grounded institutional regulations:\n\n' +
    '- 📊 **Attendance Surveillance:** Check your real-time attendance percentage, exam eligibility, and safe bunk margin.\n' +
    '- 📅 **Timetable & Daily Classes:** View your scheduled class periods, classroom venues, and faculty.\n' +
    '- 👨‍🏫 **Class Mentorship:** Get your assigned Class Incharge and academic advisor contact details.\n' +
    '- 📖 **Regulations & Bylaws (RAG):** Search attendance condonation (75% rule), CIA 40-mark evaluation, exam pass criteria, and CBCS credit norms.\n\n' +
    'Type a question below or click any of the shortcut topics on the left.',
  timestamp: new Date().toISOString(),
};

const TOPIC_PRESETS = [
  {
    category: 'Live Academic Records (Data Tools)',
    items: [
      {
        title: 'Attendance & Safe Margin',
        prompt: 'What is my current attendance percentage and safe margin?',
        icon: TrendingUp,
      },
      {
        title: 'Weekly Class Timetable',
        prompt: 'Show me my class timetable and periods for today',
        icon: Calendar,
      },
      {
        title: 'Assigned Class Incharge',
        prompt: 'Who is my assigned Class Incharge and what is their contact email?',
        icon: GraduationCap,
      },
      {
        title: 'My Enrolled Subjects',
        prompt: 'Show all prescribed subjects and credits for my current semester',
        icon: BookOpen,
      },
      {
        title: 'Academic Status Overview',
        prompt: 'Give me a complete summary of my academic dashboard and enrollment',
        icon: Clock,
      },
    ],
  },
  {
    category: 'Institutional Regulations (RAG)',
    items: [
      {
        title: 'Attendance & Medical Condonation',
        prompt: 'What are the official rules and thresholds for attendance condonation?',
        icon: BookOpen,
      },
      {
        title: 'CIA 40-Mark Evaluation Framework',
        prompt: 'Explain the Continuous Internal Assessment (CIA) 40 marks evaluation distribution',
        icon: Award,
      },
      {
        title: 'End-Sem Exam Passing Criteria',
        prompt: 'What are the passing criteria and arrear regulations for end-semester exams?',
        icon: ShieldCheck,
      },
      {
        title: 'CBCS 160 Credit Degree Rules',
        prompt: 'Explain the Choice Based Credit System (CBCS) credit requirements for my degree',
        icon: BookOpen,
      },
      {
        title: 'Anti-Ragging & Student Grievances',
        prompt: 'What is the institutional policy and helpline for student grievances and anti-ragging?',
        icon: ShieldCheck,
      },
    ],
  },
];

export const StudentChatPage: React.FC = () => {
  const [messages, setMessages] = useState<StudentChatMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setErrorBanner(null);
    const userMsg: StudentChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build conversation history excluding initial greeting
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const res = await studentApi.sendChatMessage({
        message: text,
        conversationHistory: history,
        toolChoice: 'auto',
      });

      const assistantMsg: StudentChatMessage = {
        id: res.messageId,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        toolsExecuted: res.toolsExecuted,
        confidence: res.confidence,
        provider: res.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[Student Chat Error]:', err);
      const errorMessage =
        err?.message || 'Failed to reach the Student AI Orchestrator. Please try again.';
      setErrorBanner(errorMessage);

      const errorMsg: StudentChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Service Notice:** ${errorMessage}\n\nPlease verify your connection or click **Retry** below.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([INITIAL_GREETING]);
      setErrorBanner(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* ─── SIDEBAR SHORTCUTS (DESKTOP) ─── */}
      <aside className="hidden xl:flex w-80 flex-col border-r border-slate-200 bg-white select-none">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 leading-tight">Academic Topics</h2>
              <p className="text-[10px] text-slate-500">Quick-query shortcuts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {TOPIC_PRESETS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                {group.category}
              </span>
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={iIdx}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5 transition-colors" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-[11px] group-hover:text-indigo-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
                          {item.prompt}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Engine Security Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-[10px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Zero-trust token binding. Scope locked to authenticated student context.</span>
        </div>
      </aside>

      {/* ─── MAIN CHAT CONTAINER ─── */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative">
        {/* Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                  Student AI Academic Assistant
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Deterministic live facts + Grounded Qdrant Vector & Groq AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearChat}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </header>

        {/* Error Banner if any */}
        {errorBanner && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="font-bold hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          <div className="max-w-4xl mx-auto space-y-3">
            {messages.map((msg) => (
              <StudentChatMessageItem
                key={msg.id}
                message={msg}
                onRetry={(text) => handleSendMessage(text)}
              />
            ))}

            {/* Pulsing Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3 my-2 text-xs text-slate-500">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-xs animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span className="font-medium text-slate-700 text-xs">
                    Executing backend tool & synthesizing verified answer...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input */}
        <div className="shrink-0 max-w-4xl w-full mx-auto">
          <StudentChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        </div>
      </main>
    </div>
  );
};
