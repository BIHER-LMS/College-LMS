import React, { useState } from 'react';
import {
  Bot,
  User,
  Wrench,
  Check,
  Copy,
  RotateCcw,
  BookOpen,
  Calendar,
  Sparkles,
  Eye,
  X,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import type { StudentChatMessage, ToolExecutionResult } from '../../types/studentAi.types';

interface StudentChatMessageItemProps {
  message: StudentChatMessage;
  onRetry?: (text: string) => void;
}

/**
 * Executive Class Incharge Profile Card
 */
const ClassInchargeCard: React.FC<{
  incharge: {
    name: string;
    designation?: string;
    department?: string;
    email?: string;
    phone?: string | null;
    photoUrl?: string | null;
  };
  onViewPhoto: (url: string, title: string) => void;
}> = ({ incharge, onViewPhoto }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyEmail = () => {
    if (incharge.email) {
      navigator.clipboard.writeText(incharge.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const initials =
    incharge.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || 'CI';

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/60 via-white to-white shadow-sm hover:shadow-md transition-all">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-200" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-100">
            Assigned Class Incharge
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs text-white">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Verified Faculty
        </span>
      </div>

      {/* Main Profile Info Row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with View Photo Action */}
          <div className="relative group shrink-0 flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-2xl ring-4 ring-indigo-100 overflow-hidden bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (incharge.photoUrl && !imgError) {
                  onViewPhoto(incharge.photoUrl, `${incharge.name} - Class Incharge`);
                }
              }}
            >
              {incharge.photoUrl && !imgError ? (
                <img
                  src={incharge.photoUrl}
                  alt={incharge.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-xl font-black text-white tracking-wider">
                  {initials}
                </span>
              )}
            </div>

            {/* View Photo Button */}
            {incharge.photoUrl && !imgError && (
              <button
                type="button"
                onClick={() => onViewPhoto(incharge.photoUrl!, `${incharge.name} - Class Incharge`)}
                className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2 py-1 rounded-lg transition-colors shadow-2xs"
                title="Click to view full photo"
              >
                <Eye className="w-3 h-3 text-indigo-600" />
                View Photo
              </button>
            )}
          </div>

          {/* Details & Highlighted Name */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
                <span className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-violet-900 bg-clip-text text-transparent">
                  {incharge.name}
                </span>
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              </h3>
            </div>

            {/* Designation & Department Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {incharge.designation || 'Class Incharge / Assistant Professor'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                {incharge.department || 'Department Faculty'}
              </span>
            </div>

            {/* Contact Details Grid */}
            <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Email Button with 1-Click Copy */}
              {incharge.email && (
                <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-200 transition-colors">
                  <a
                    href={`mailto:${incharge.email}`}
                    className="flex items-center gap-1.5 font-medium text-indigo-700 hover:text-indigo-800 truncate"
                    title={`Email ${incharge.name}`}
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate text-[11px] font-semibold">{incharge.email}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-white transition"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Phone Badge */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] font-medium truncate">
                  {incharge.phone || 'Phone not listed in portal'}
                </span>
              </div>
            </div>

            {/* Verification Note */}
            <div className="mt-2 text-[10px] text-slate-400 italic text-center sm:text-left">
              Official Class Incharge record retrieved directly from college database.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentChatMessageItem: React.FC<StudentChatMessageItemProps> = ({
  message,
  onRetry,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string } | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Inline Markdown Parser (Images, Links, Bold, Code, Italic)
   */
  const renderInlineMarkdown = (text: string) => {
    // Regex matching images, links, bold, code, and italic
    const parts = text.split(/(!\[.*?\]\(.*?\)|\(?\[.*?\]\(.*?\)|\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      // 1. Image: ![alt](url)
      const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const url = imgMatch[2];
        return (
          <span key={i} className="inline-flex items-center gap-1.5 my-1">
            <img
              src={url}
              alt={alt}
              className="w-10 h-10 rounded-lg object-cover border border-slate-200 cursor-pointer shadow-xs hover:ring-2 hover:ring-indigo-300 transition"
              onClick={() => setViewingPhoto({ url, title: alt || 'Photo Preview' })}
            />
            <button
              type="button"
              onClick={() => setViewingPhoto({ url, title: alt || 'Photo Preview' })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Eye className="w-2.5 h-2.5" /> View Photo
            </button>
          </span>
        );
      }

      // 2. Link: [text](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const label = linkMatch[1];
        const href = linkMatch[2];
        const isEmail = href.startsWith('mailto:');
        return (
          <a
            key={i}
            href={href}
            target={isEmail ? undefined : '_blank'}
            rel={isEmail ? undefined : 'noopener noreferrer'}
            className="text-indigo-600 hover:text-indigo-800 underline font-semibold inline-flex items-center gap-0.5"
          >
            {isEmail ? <Mail className="w-3 h-3 inline text-indigo-500" /> : null}
            {label}
          </a>
        );
      }

      // 3. Bold: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong
            key={i}
            className="font-extrabold text-slate-900 bg-indigo-50/70 px-1 py-0.5 rounded text-[11.5px]"
          >
            {inner}
          </strong>
        );
      }

      // 4. Code: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-indigo-700 border border-slate-200"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // 5. Italic: *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-600">
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  /**
   * Render table cell content with special photo / email handling
   */
  const renderCellContent = (cell: string) => {
    // Check if cell has an image markdown
    const imgMatch = cell.match(/!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const url = imgMatch[2];
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-11 h-11 rounded-xl ring-2 ring-indigo-200 overflow-hidden shadow-2xs shrink-0 cursor-pointer group relative"
            onClick={() => setViewingPhoto({ url, title: alt || 'Photo' })}
          >
            <img
              src={url}
              alt={alt}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setViewingPhoto({ url, title: alt || 'Photo' })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Eye className="w-3 h-3 text-indigo-600" />
            View Photo
          </button>
        </div>
      );
    }

    // Check if cell is an email address
    const emailMatch = cell.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && !cell.includes('[')) {
      const email = emailMatch[1];
      return (
        <a
          href={`mailto:${email}`}
          className="text-indigo-600 hover:text-indigo-800 underline font-semibold inline-flex items-center gap-1"
        >
          <Mail className="w-3 h-3 text-indigo-500" />
          {email}
        </a>
      );
    }

    return renderInlineMarkdown(cell);
  };

  /**
   * Block-based Markdown Parser & Renderer
   */
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Table Detection (lines starting and ending with |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

          const bodyLines = tableLines.slice(1).filter((l) => !/^[|\s-:]+$/.test(l));
          const rowData = bodyLines.map((l) =>
            l
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim()),
          );

          elements.push(
            <div
              key={`table-${i}`}
              className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs"
            >
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50/90">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700"
                      >
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rowData.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx % 2 === 0
                          ? 'bg-white hover:bg-slate-50/50 transition-colors'
                          : 'bg-slate-50/30 hover:bg-slate-50/70 transition-colors'
                      }
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 text-slate-700 align-middle">
                          {renderCellContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>,
          );
          continue;
        }
      }

      // 2. Standalone Image Line: ![alt](url)
      const standaloneImg = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      if (standaloneImg) {
        const alt = standaloneImg[1];
        const url = standaloneImg[2];
        elements.push(
          <div
            key={`img-${i}`}
            className="my-3 p-3 bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-3.5"
          >
            <div
              className="relative group w-24 h-24 rounded-2xl ring-4 ring-indigo-100 overflow-hidden shadow-md cursor-pointer shrink-0 bg-slate-100"
              onClick={() => setViewingPhoto({ url, title: alt || 'Profile Photo' })}
            >
              <img
                src={url}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                {alt || 'Verified Official Photo'}
              </div>
              <p className="text-[11px] text-slate-500">
                Official institution photo on record
              </p>
              <button
                type="button"
                onClick={() => setViewingPhoto({ url, title: alt || 'Profile Photo' })}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-2xs hover:scale-102"
              >
                <Eye className="w-3.5 h-3.5" />
                View Photo
              </button>
            </div>
          </div>,
        );
        i++;
        continue;
      }

      // 3. Headings
      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-sm font-extrabold text-slate-900 mt-3 mb-1.5 flex items-center gap-1.5 pb-1 border-b border-slate-100"
          >
            {renderInlineMarkdown(line.replace('## ', ''))}
          </h2>,
        );
        i++;
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-xs font-bold text-slate-900 mt-2.5 mb-1 flex items-center gap-1.5"
          >
            {renderInlineMarkdown(line.replace('### ', ''))}
          </h3>,
        );
        i++;
        continue;
      }

      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-xs font-semibold text-slate-800 mt-2 mb-0.5">
            {renderInlineMarkdown(line.replace('#### ', ''))}
          </h4>,
        );
        i++;
        continue;
      }

      // 4. Blockquotes
      if (line.startsWith('>')) {
        elements.push(
          <blockquote
            key={`quote-${i}`}
            className="my-2 pl-3 border-l-2 border-indigo-500 italic text-slate-700 bg-indigo-50/40 py-1.5 rounded-r text-xs leading-relaxed"
          >
            {renderInlineMarkdown(line.replace(/^>\s*/, ''))}
          </blockquote>,
        );
        i++;
        continue;
      }

      // 5. Bullet Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const text = line.trim().replace(/^[-•]\s*/, '');
        elements.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-xs leading-relaxed text-slate-700 my-0.5">
            {renderInlineMarkdown(text)}
          </li>,
        );
        i++;
        continue;
      }

      // 6. Numbered Lists
      if (/^\d+\.\s/.test(line.trim())) {
        const text = line.trim().replace(/^\d+\.\s*/, '');
        const num = line.trim().match(/^(\d+)\./)?.[1] || '';
        elements.push(
          <div
            key={`num-${i}`}
            className="ml-2 text-xs leading-relaxed text-slate-700 my-0.5 flex items-start gap-1.5"
          >
            <span className="font-semibold text-indigo-700 text-[11px] min-w-[14px]">
              {num}.
            </span>
            <span>{renderInlineMarkdown(text)}</span>
          </div>,
        );
        i++;
        continue;
      }

      // 7. Empty Spacer
      if (!line.trim()) {
        elements.push(<div key={`sp-${i}`} className="h-1" />);
        i++;
        continue;
      }

      // 8. Regular Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed text-slate-700 my-1">
          {renderInlineMarkdown(line)}
        </p>,
      );
      i++;
    }

    return elements;
  };

  /**
   * Render structured tool output preview
   */
  const renderToolPreview = (tool: ToolExecutionResult) => {
    return (
      <div
        key={tool.toolName}
        className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5"
      >
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
            {tool.toolName}
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              tool.status === 'success'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            {tool.status} ({tool.durationMs}ms)
          </span>
        </div>

        {/* Attendance Summary Mini-Card */}
        {tool.toolName === 'student.getAttendance' && tool.result?.summary && (
          <div className="mt-2 p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">
                Attendance: {tool.result.summary.percentage}%
              </div>
              <div className="text-[11px] text-slate-500">
                {tool.result.summary.attendedSessions} / {tool.result.summary.totalSessions} sessions
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                tool.result.summary.isEligible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {tool.result.summary.isEligible ? 'Exam Eligible' : 'Shortage Alert'}
            </div>
          </div>
        )}

        {/* Timetable Mini-Card */}
        {tool.toolName === 'student.getTimetable' && Array.isArray(tool.result) && (
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Retrieved {tool.result.length} timetable slot(s)</span>
          </div>
        )}

        {/* Class Incharge Mini-Card */}
        {tool.toolName === 'student.getClassIncharge' && tool.result?.name && (
          <div className="mt-2 p-2 bg-white rounded border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-100 ring-1 ring-indigo-200 shrink-0 flex items-center justify-center">
                {tool.result.photoUrl ? (
                  <img
                    src={tool.result.photoUrl}
                    alt={tool.result.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-xs">
                  {tool.result.name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {tool.result.designation || 'Class Incharge'}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Verified
            </span>
          </div>
        )}

        {/* Knowledge Search Mini-Card */}
        {tool.toolName === 'student.searchKnowledge' && tool.result?.results && (
          <div className="mt-2 text-[11px] text-slate-600 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Grounded from {tool.result.results.length} institutional document(s)</span>
          </div>
        )}
      </div>
    );
  };

  // Check if this message was triggered by a Class Incharge query
  const inchargeTool = message.toolsExecuted?.find(
    (t) => t.toolName === 'student.getClassIncharge' && t.status === 'success' && t.result?.name,
  );

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-xs border border-indigo-200">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[85%] lg:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative px-4 py-3 rounded-2xl text-xs leading-relaxed transition-all shadow-xs ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-slate-100/80'
          }`}
        >
          {/* Header Badge for Assistant */}
          {!isUser && message.provider && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1.5 pb-1 border-b border-slate-100">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Grounded via {message.provider === 'groq' ? 'Groq AI' : 'Deterministic Student Engine'}</span>
              {message.confidence && (
                <span className="ml-auto font-mono text-[9px] bg-slate-100 text-slate-600 px-1 rounded">
                  {Math.round(message.confidence * 100)}% match
                </span>
              )}
            </div>
          )}

          {/* Dedicated Class Incharge Executive Card */}
          {!isUser && inchargeTool?.result && (
            <ClassInchargeCard
              incharge={inchargeTool.result}
              onViewPhoto={(url, title) => setViewingPhoto({ url, title })}
            />
          )}

          {/* Message Content */}
          <div className={isUser ? 'whitespace-pre-wrap' : ''}>
            {isUser ? message.content : renderFormattedContent(message.content)}
          </div>

          {/* Tools Execution Section */}
          {!isUser && message.toolsExecuted && message.toolsExecuted.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Wrench className="w-3 h-3" />
                <span>
                  {toolsExpanded ? 'Hide' : 'View'} {message.toolsExecuted.length} executed backend tool
                  {message.toolsExecuted.length > 1 ? 's' : ''}
                </span>
              </button>

              {toolsExpanded && (
                <div className="mt-2 space-y-2">
                  {message.toolsExecuted.map((tool) => renderToolPreview(tool))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer timestamp and copy */}
        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-slate-600 transition-colors flex items-center gap-0.5"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
          {isUser && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(message.content)}
              className="hover:text-slate-600 transition-colors flex items-center gap-0.5"
              title="Resend message"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 shadow-xs border border-slate-600">
          <User className="w-4 h-4" />
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewingPhoto(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/90">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 truncate">
                  {viewingPhoto.title || 'Official Portal Photo'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Close Photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-slate-950/5">
              <img
                src={viewingPhoto.url}
                alt={viewingPhoto.title || 'Photo'}
                className="max-h-[65vh] w-auto max-w-full rounded-xl shadow-md object-contain"
              />
            </div>
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Official Database Photo</span>
              <a
                href={viewingPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                Open original <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
