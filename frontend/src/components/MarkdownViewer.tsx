import React, { useEffect, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import mermaid from 'mermaid';
import './MarkdownViewer.css';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

// Initialize Mermaid once globally with clean modern styling
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  themeVariables: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    primaryColor: '#e0e7ff',
    primaryTextColor: '#1e1b4b',
    primaryBorderColor: '#6366f1',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#f8fafc',
  },
});

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  // Configure marked custom renderer
  useEffect(() => {
    if (!content || !content.trim()) {
      setRenderedHtml('<p class="text-slate-400 italic">No content provided.</p>');
      return;
    }

    const renderer = new marked.Renderer();

    // Custom code block renderer to identify and isolate mermaid blocks
    renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
      const trimmedLang = (lang || '').trim().toLowerCase();
      const trimmedText = text.trim();

      const isMermaid =
        trimmedLang === 'mermaid' ||
        trimmedText.startsWith('graph ') ||
        trimmedText.startsWith('flowchart ') ||
        trimmedText.startsWith('sequenceDiagram') ||
        trimmedText.startsWith('classDiagram') ||
        trimmedText.startsWith('stateDiagram') ||
        trimmedText.startsWith('erDiagram') ||
        trimmedText.startsWith('pie') ||
        trimmedText.startsWith('gantt') ||
        trimmedText.startsWith('gitGraph');

      if (isMermaid) {
        const diagramId = `mermaid-${Math.random().toString(36).substring(2, 10)}`;
        return `<div class="mermaid-diagram-placeholder" id="${diagramId}" data-diagram-id="${diagramId}" data-code="${encodeURIComponent(
          trimmedText
        )}">
          <div class="mermaid-card my-4">
            <div class="mermaid-header text-slate-500 font-medium">
              <span class="flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Rendering Mermaid Diagram...
              </span>
            </div>
            <div class="mermaid-canvas text-slate-400 text-xs">
              <pre class="bg-transparent text-slate-500 border-0 p-0 text-xs font-mono">${escapeHtml(trimmedText)}</pre>
            </div>
          </div>
        </div>`;
      }

      // Code blocks with syntax copy container
      return `<div class="code-block-card my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
        <div class="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span class="uppercase font-semibold tracking-wider text-[11px] text-indigo-400">${escapeHtml(
            trimmedLang || 'code'
          )}</span>
          <button type="button" class="copy-code-btn hover:text-white transition flex items-center gap-1 text-[11px]" data-copy="${encodeURIComponent(
            text
          )}">
            <span>Copy</span>
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-xs font-mono text-slate-100 leading-relaxed"><code class="language-${escapeHtml(
          trimmedLang || 'text'
        )}">${escapeHtml(text)}</code></pre>
      </div>`;
    };

    // Custom table renderer to ensure horizontal scroll responsiveness
    const defaultTable = renderer.table.bind(renderer);
    renderer.table = function (token: any) {
      return `<div class="table-wrapper">${defaultTable(token)}</div>`;
    };

    // Parse markdown into HTML
    try {
      const parsed = marked.parse(content, {
        renderer,
        gfm: true,
        breaks: true,
        async: false,
      }) as string;

      // Sanitize with DOMPurify while keeping custom data attributes
      const sanitized = DOMPurify.sanitize(parsed, {
        ADD_TAGS: ['div', 'span', 'button', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'svg', 'path'],
        ADD_ATTR: ['class', 'data-diagram-id', 'data-code', 'data-copy', 'type', 'viewbox', 'fill', 'd'],
      });

      setRenderedHtml(sanitized);
    } catch (err) {
      console.error('Failed to parse markdown:', err);
      setRenderedHtml(`<pre class="text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-200">${escapeHtml(content)}</pre>`);
    }
  }, [content]);

  // Render Mermaid diagrams whenever renderedHtml updates
  useEffect(() => {
    if (!containerRef.current) return;

    let isSubscribed = true;

    const renderMermaidDiagrams = async () => {
      const placeholders = containerRef.current?.querySelectorAll<HTMLDivElement>('.mermaid-diagram-placeholder');
      if (!placeholders || placeholders.length === 0) return;

      for (let i = 0; i < placeholders.length; i++) {
        if (!isSubscribed) return;
        const el = placeholders[i];
        const rawEncoded = el.getAttribute('data-code');
        const diagramId = el.getAttribute('data-diagram-id') || `mermaid-el-${i}`;
        if (!rawEncoded) continue;

        const code = decodeURIComponent(rawEncoded);
        const svgContainerId = `svg-container-${diagramId}-${i}`;

        try {
          // Render Mermaid SVG
          const { svg } = await mermaid.render(`mermaid-render-${Date.now()}-${i}`, code);
          if (!isSubscribed) return;

          el.innerHTML = `
            <div class="mermaid-card my-6">
              <div class="mermaid-header">
                <span class="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                  <svg class="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="6" y1="3" x2="6" y2="15"></line>
                    <circle cx="18" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M18 9a9 9 0 0 1-9 9"></path>
                  </svg>
                  Mermaid Diagram
                </span>
                <button type="button" class="copy-mermaid-btn text-xs font-medium text-slate-500 hover:text-indigo-600 transition flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs hover:bg-slate-50" data-mermaid="${encodeURIComponent(
                  code
                )}">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copy Diagram
                </button>
              </div>
              <div class="mermaid-canvas" id="${svgContainerId}">
                ${svg}
              </div>
            </div>
          `;
        } catch (err: any) {
          console.warn('Mermaid render error for block:', err);
          if (!isSubscribed) return;

          el.innerHTML = `
            <div class="mermaid-card my-4 border-amber-200 bg-amber-50/40">
              <div class="mermaid-header bg-amber-100/60 border-amber-200 text-amber-800">
                <span class="flex items-center gap-1.5 text-xs font-semibold">
                  <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Diagram Preview (Source)
                </span>
                <button type="button" class="copy-mermaid-btn text-xs font-medium text-amber-900 hover:text-amber-700 bg-white/80 border border-amber-300 px-2 py-0.5 rounded shadow-2xs" data-mermaid="${encodeURIComponent(
                  code
                )}">
                  Copy
                </button>
              </div>
              <div class="p-4 overflow-x-auto text-xs font-mono text-slate-700 bg-white">
                <pre class="m-0 p-0 bg-transparent border-0 text-xs text-slate-800">${escapeHtml(code)}</pre>
              </div>
            </div>
          `;
        }
      }

      // Attach click listeners to copy buttons
      attachCopyListeners();
    };

    const attachCopyListeners = () => {
      if (!containerRef.current) return;

      const copyButtons = containerRef.current.querySelectorAll<HTMLButtonElement>('.copy-code-btn, .copy-mermaid-btn');
      copyButtons.forEach((btn) => {
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const toCopy = btn.getAttribute('data-copy') || btn.getAttribute('data-mermaid');
          if (toCopy) {
            const text = decodeURIComponent(toCopy);
            navigator.clipboard.writeText(text).then(() => {
              const originalHtml = btn.innerHTML;
              btn.innerHTML = `<span class="text-emerald-500 font-bold flex items-center gap-1">Copied!</span>`;
              setTimeout(() => {
                btn.innerHTML = originalHtml;
              }, 2000);
            });
          }
        };
      });
    };

    renderMermaidDiagrams();

    return () => {
      isSubscribed = false;
    };
  }, [renderedHtml]);

  return (
    <div
      ref={containerRef}
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
