import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Trash2,
  BookOpen,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Wrench,
  Users,
  GraduationCap,
  Layers,
  Award,
} from 'lucide-react';
import type {
  HodChatMessage,
  ToolChoiceOption,
  ChatMessagePayload,
} from '../types/hodAi.types';
import { hodAiApi } from '../api/hodAiApi';
import { HodChatMessageItem } from '../components/chat/HodChatMessageItem';
import { HodChatInput } from '../components/chat/HodChatInput';
import { HodKnowledgeDocumentModal } from '../components/chat/HodKnowledgeDocumentModal';
import { HodToolsModal } from '../components/chat/HodToolsModal';

const INITIAL_GREETING: HodChatMessage = {
  id: 'msg-hod-welcome',
  role: 'assistant',
  content:
    '### Welcome to the HOD Executive AI Assistant\n\n' +
    'I provide real-time departmental intelligence, attendance surveillance, and academic regulatory lookup for Heads of Department:\n\n' +
    '- 📊 **Department Attendance:** Inspect overall cohort averages, batch comparisons, and active class metrics.\n' +
    '- ⚠️ **Surveillance & Defaulters:** Identify at-risk students (<75% attendance) and analyze temporal deficit trends.\n' +
    '- 📖 **Institutional Regulations (RAG):** Search official university bylaws regarding attendance condonation, 40-mark CIA evaluation, passing criteria, and CBCS credit norms.\n' +
    '- 🏫 **Class Incharge Coordination:** Review class rosters and in-charge faculty performance.\n\n' +
    'Ask any question below or select one of the executive presets on the left.',
  timestamp: new Date().toISOString(),
};

interface TopicCategory {
  category: string;
  items: Array<{
    title: string;
    prompt: string;
    icon: any;
    toolChoice?: ToolChoiceOption;
  }>;
}

const EXECUTIVE_PRESETS: TopicCategory[] = [
  {
    category: 'Attendance Surveillance',
    items: [
      {
        title: 'Department Summary',
        prompt: 'What is the attendance summary for our department this semester?',
        icon: BarChart3,
        toolChoice: { type: 'tool', name: 'hod.getAttendanceSummary' },
      },
      {
        title: 'Defaulter Distribution',
        prompt: 'Show attendance analytics and defaulter distribution breakdown across our department',
        icon: TrendingUp,
        toolChoice: { type: 'tool', name: 'hod.getAttendanceAnalytics' },
      },
      {
        title: 'Department-Wide Classes',
        prompt: 'Compare attendance performance across all active classes in our department',
        icon: Layers,
        toolChoice: { type: 'tool', name: 'hod.getDepartmentAttendance' },
      },
    ],
  },
  {
    category: 'Institutional Regulations (RAG)',
    items: [
      {
        title: 'Attendance & Medical Condonation',
        prompt: 'What is the institutional attendance policy regarding medical condonation?',
        icon: BookOpen,
        toolChoice: { type: 'tool', name: 'hod.searchKnowledge' },
      },
      {
        title: 'CIA 40-Mark Evaluation',
        prompt: 'Explain the continuous internal assessment (CIA) 40 marks evaluation distribution',
        icon: Award,
        toolChoice: { type: 'tool', name: 'hod.searchKnowledge' },
      },
      {
        title: 'End-Sem Exam Passing Bylaws',
        prompt: 'What are the passing criteria and arrear regulations for end-semester exams?',
        icon: ShieldCheck,
        toolChoice: { type: 'tool', name: 'hod.searchKnowledge' },
      },
      {
        title: 'CBCS 160 Credit Degree Rules',
        prompt: 'Explain the Choice Based Credit System (CBCS) 160 credit requirements for degree completion',
        icon: BookOpen,
        toolChoice: { type: 'tool', name: 'hod.searchKnowledge' },
      },
    ],
  },
  {
    category: 'Student & Class Deep-Dive',
    items: [
      {
        title: 'Sample Class Surveillance (CSE-3A)',
        prompt: 'Show attendance statistics and defaulter list for class cls-cse-3a',
        icon: Users,
        toolChoice: { type: 'tool', name: 'hod.getClassAttendance' },
      },
      {
        title: 'Sample Student Lookup',
        prompt: 'Show attendance and subject breakdown for student stu-cse-001',
        icon: GraduationCap,
        toolChoice: { type: 'tool', name: 'hod.getStudentAttendance' },
      },
    ],
  },
];

export const HodChatPage: React.FC = () => {
  const [messages, setMessages] = useState<HodChatMessage[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (
    text: string,
    toolChoice: ToolChoiceOption = 'auto',
  ) => {
    if (!text.trim() || isLoading) return;

    const userMessage: HodChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    // Format previous messages into history payload
    const historyPayload: ChatMessagePayload[] = messages
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseData = await hodAiApi.sendMessage({
        message: text,
        history: historyPayload,
        toolChoice,
      });

      const assistantMessage: HodChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: responseData.message,
        timestamp: responseData.metadata?.timestamp || new Date().toISOString(),
        toolsExecuted: responseData.toolsExecuted,
        metadata: responseData.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const isForbidden =
        err?.status === 403 ||
        err?.code === 'FORBIDDEN' ||
        err?.message?.toLowerCase().includes('forbidden');

      const errorMessage: HodChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: isForbidden
          ? '### 🚫 Permission Denied\n\nYour account does not have sufficient Head of Department privileges or a verified department assignment to access this departmental intelligence resource.'
          : `### ⚠️ Request Failed\n\n${
              err?.message || 'An unexpected error occurred while communicating with the AI Orchestrator.'
            }`,
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: err?.message || 'Request execution failed',
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  const handleRetry = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto min-h-[calc(100vh-7rem)]">
      {/* ==================================================================== */}
      {/* Left Sidebar: Executive Shortcuts & Tools Catalog                   */}
      {/* ==================================================================== */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
        {/* Portal Info Card */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#0d1c32] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Department Intelligence
              </span>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                HOD AI Assistant
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deterministic surveillance linked to live institutional databases,
            academic bylaws, and 7 canonical tool endpoints.
          </p>

          <button
            onClick={() => setIsToolsModalOpen(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            Canonical Tools Catalog (7)
          </button>
        </div>

        {/* Executive Presets Accordion / List */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Executive Inquiry Presets
          </span>

          {EXECUTIVE_PRESETS.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-xs font-bold text-slate-800 block">
                {cat.category}
              </span>
              <div className="space-y-1">
                {cat.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt, item.toolChoice)}
                      disabled={isLoading}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all flex items-start gap-2.5 text-xs text-slate-700 disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Right Main Chat Window                                               */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden min-h-[550px]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                AI Orchestrator Session
              </h3>
              <span className="text-[10px] text-slate-400">
                Departmental Boundary Enforcement Active
              </span>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            title="Reset conversation"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <HodChatMessageItem
              key={msg.id}
              message={msg}
              onRetry={handleRetry}
              onViewDocument={(docId) => setViewingDocId(docId)}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-500 text-xs py-2 px-1">
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[11px] font-medium text-slate-600">
                  Executing HOD tools and synthesizing intelligence...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <HodChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Tools Catalog Modal */}
      {isToolsModalOpen && (
        <HodToolsModal onClose={() => setIsToolsModalOpen(false)} />
      )}

      {/* Full Document Viewer Modal */}
      {viewingDocId && (
        <HodKnowledgeDocumentModal
          documentId={viewingDocId}
          onClose={() => setViewingDocId(null)}
        />
      )}
    </div>
  );
};
