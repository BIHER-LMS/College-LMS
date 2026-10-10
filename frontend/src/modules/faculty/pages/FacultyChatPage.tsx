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
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { FacultyChatMessage } from '../types/facultyAi.types';
import { facultyApi } from '../api/facultyApi';
import { FacultyChatMessageItem } from '../components/FacultyChat/FacultyChatMessageItem';
import { FacultyChatInput } from '../components/FacultyChat/FacultyChatInput';
import { useFaculty } from '../hooks/useFaculty';

const INITIAL_GREETING: FacultyChatMessage = {
  id: 'msg-welcome-page',
  role: 'assistant',
  content:
    '### Welcome to the Faculty & Class Incharge AI Assistant\n\n' +
    'I provide authoritative institutional answers and deterministic academic surveillance for your courses and classes:\n\n' +
    '- 📖 **Regulations & Bylaws:** Search attendance condonation (75% rule), exam pass criteria, and CBCS credit norms.\n' +
    '- 🏫 **Class Incharge Ops:** View assigned class rosters, student registration numbers, and representative info.\n' +
    '- 📊 **Attendance Tracking:** Inspect class-wise aggregate statistics, total sessions, and low-attendance defaulters.\n' +
    '- 📅 **Schedule & Reminders:** Review your teaching timetable slots and pending evaluation tasks.\n\n' +
    'Type a question below or click any of the topic shortcuts on the left.',
  timestamp: new Date().toISOString(),
};

const TOPIC_PRESETS = [
  {
    category: 'Institutional Policy (RAG)',
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
        prompt: 'Explain the Choice Based Credit System (CBCS) credit requirements for B.Tech degree',
        icon: BookOpen,
      },
    ],
  },
  {
    category: 'Class Incharge Surveillance',
    items: [
      {
        title: 'My Assigned Classes',
        prompt: 'Show all classes assigned to me and their current student counts',
        icon: GraduationCap,
      },
      {
        title: 'Class Attendance Stats (CSE-3A)',
        prompt: 'Check attendance statistics and defaulter list for CSE-3A',
        icon: TrendingUp,
      },
      {
        title: 'Student Roster for CSE-3A',
        prompt: 'Show student roster with register numbers and attendance for class cls-cse-3a',
        icon: GraduationCap,
      },
    ],
  },
  {
    category: 'Teaching Schedules & Tasks',
    items: [
      {
        title: 'Today’s Teaching Timetable',
        prompt: 'What is my teaching timetable for today?',
        icon: Clock,
      },
      {
        title: 'Pending Reminders & Deadlines',
        prompt: 'Show my pending academic reminders and tasks',
        icon: Clock,
      },
      {
        title: 'Class Master Timetable',
        prompt: 'Show the period timetable for class cls-cse-3a',
        icon: Clock,
      },
    ],
  },
];

export const FacultyChatPage: React.FC = () => {
  const { dashboard } = useFaculty();
  const [messages, setMessages] = useState<FacultyChatMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const facultyName = dashboard?.faculty?.name || 'Professor';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        'Unable to complete request. Please verify your connection or try again.';

      setErrorBanner(errorMsg);

      const errorMessage: FacultyChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error:** ${errorMsg}`,
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

  const handleExportChat = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${new Date(m.timestamp).toLocaleString()}] ${
            m.role === 'user' ? 'USER' : 'ASSISTANT'
          }:\n${m.content}\n\n`,
      )
      .join('---\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faculty-ai-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-slate-50 overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200/90 px-4 py-3 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Faculty & Class Incharge AI Assistant
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Orchestrator
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Logged in as <span className="font-semibold text-slate-700">{facultyName}</span> • Multi-Tenant Scoped
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            title="Download chat conversation"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Body Area: Sidebar (Desktop) + Conversation Thread */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Topic Shortcuts Sidebar (Desktop only) */}
        <div className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200/90 p-4 overflow-y-auto space-y-5 flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Academic Capabilities
            </span>
            <div className="p-3 bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100/80 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-indigo-900 block mb-1">
                Institutional RAG Active
              </span>
              Search academic regulations, exam bylaws, syllabus rules, and class incharge records using natural language.
            </div>
          </div>

          {TOPIC_PRESETS.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                {group.category}
              </span>
              <div className="space-y-1">
                {group.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      disabled={isLoading}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="w-full text-left p-2 rounded-lg hover:bg-indigo-50/70 hover:text-indigo-900 text-slate-700 text-xs font-medium transition-all flex items-start gap-2 border border-transparent hover:border-indigo-100 disabled:opacity-50"
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Answers grounded in verified regulations</span>
          </div>
        </div>

        {/* Chat Thread and Input Area */}
        <div className="flex-1 flex flex-col bg-slate-50/70 overflow-hidden">
          {/* Error Banner */}
          {errorBanner && (
            <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between px-6 flex-shrink-0">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorBanner}</span>
              </span>
              <button
                onClick={() => setErrorBanner(null)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 max-w-4xl w-full mx-auto">
            {messages.map((message) => (
              <FacultyChatMessageItem
                key={message.id}
                message={message}
                onRetry={(text) => handleSendMessage(text)}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                  <span className="text-[11px] ml-1 text-slate-400">
                    Retrieving authorized institutional records & policy chunks...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Component */}
          <div className="max-w-4xl w-full mx-auto p-2 sm:px-6 sm:pb-4 flex-shrink-0">
            <FacultyChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
