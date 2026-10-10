import React, { useState } from 'react';
import {
  Bot,
  User,
  Wrench,
  AlertCircle,
  Check,
  Copy,
  RotateCcw,
} from 'lucide-react';
import type { FacultyChatMessage } from '../../types/facultyAi.types';
import { StructuredToolView } from './StructuredToolView';

interface FacultyChatMessageItemProps {
  message: FacultyChatMessage;
  onRetry?: (text: string) => void;
}

export const FacultyChatMessageItem: React.FC<FacultyChatMessageItemProps> = ({
  message,
  onRetry,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Lightweight Markdown Formatter for Assistant Messages
   * Converts markdown headers, bold, bullet points, blockquotes, and code blocks
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 2
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-sm font-black text-slate-900 mt-2 mb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Blockquote
      if (line.startsWith('>')) {
        return (
          <blockquote
            key={idx}
            className="my-1.5 pl-3 border-l-2 border-indigo-500 italic text-slate-700 bg-indigo-50/40 py-1 rounded-r text-xs leading-relaxed"
          >
            {line.replace(/^>\s*/, '')}
          </blockquote>
        );
      }
      // Bullet list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const text = line.trim().replace(/^[-•]\s*/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-slate-700 my-0.5">
            {renderInlineMarkdown(text)}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s*/, '');
        return (
          <div key={idx} className="ml-2 text-xs leading-relaxed text-slate-700 my-0.5 flex items-start gap-1.5">
            <span className="font-semibold text-indigo-700 text-[11px] min-w-[14px]">
              {line.trim().match(/^\d+\./)?.[0]}
            </span>
            <span>{renderInlineMarkdown(text)}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Regular line
      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-800 my-0.5">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  /**
   * Helper to format inline bold, italic, and code tags
   */
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 text-[11px] font-mono rounded border border-slate-200/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
          isUser
            ? 'bg-slate-800 text-white'
            : 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-2xl shadow-xs transition-all ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : message.error
              ? 'bg-rose-50 border border-rose-200 text-rose-900 rounded-tl-xs'
              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
          }`}
        >
          {/* User Message */}
          {isUser ? (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div>
              {/* Formatted Assistant Text */}
              <div className="space-y-0.5">{renderFormattedContent(message.content)}</div>

              {/* Tool Execution Summary Badges & Cards */}
              {message.toolsExecuted && message.toolsExecuted.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-indigo-500" />
                      Tools Executed:
                    </span>
                    {message.toolsExecuted.map((tool, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          tool.status === 'success'
                            ? 'bg-slate-50 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tool.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {tool.toolName}
                        {tool.executionDurationMs !== undefined && (
                          <span className="text-[9px] text-slate-400">
                            ({tool.executionDurationMs}ms)
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Render Specialized Structured Views for Each Tool */}
                  {message.toolsExecuted.map((tool, idx) => (
                    <StructuredToolView key={idx} tool={tool} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Notice */}
          {message.error && (
            <div className="mt-2 pt-2 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Execution failed
              </span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message.content)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-200 font-medium text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message Footer Actions */}
        <div
          className={`flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="hover:text-slate-600 transition-colors flex items-center gap-0.5"
              title="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-emerald-600 text-[10px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
