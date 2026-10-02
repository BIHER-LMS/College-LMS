import React from 'react';

export const TechStackSection: React.FC = () => {
  return (
    <section id="technology-section" className="w-full py-20 sm:py-28 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Production Grade Stack
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            Engineered with Enterprise Technology
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            Built on an open, reliable, and high-performance stack.
          </p>
        </div>

        {/* 4 Tech Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Layer 1: Frontend */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] mb-4">
                <span className="material-symbols-outlined">laptop_mac</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Layer 01
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30] mt-1 mb-2">
                Frontend Layer
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed mb-6">
                Client-side state hydration, responsive rendering, sub-second route transitions.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#eff4ff]">
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                React.js
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Redux
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Tailwind CSS
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Vite
              </span>
            </div>
          </div>

          {/* Layer 2: Backend */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] mb-4">
                <span className="material-symbols-outlined">dns</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Layer 02
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30] mt-1 mb-2">
                Backend Layer
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed mb-6">
                Strongly-typed API gateways, asynchronous job scheduling, event-driven pipelines.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#eff4ff]">
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Node.js
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Express.js
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                TypeScript
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                REST APIs
              </span>
            </div>
          </div>

          {/* Layer 3: Database & ORM */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] mb-4">
                <span className="material-symbols-outlined">database</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Layer 03
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30] mt-1 mb-2">
                Database &amp; ORM
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed mb-6">
                Relational academic modeling, transactional integrity, row-level access security.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#eff4ff]">
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Supabase
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                PostgreSQL
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Prisma
              </span>
            </div>
          </div>

          {/* Layer 4: AI & Intelligent Layer */}
          <div className="p-6 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] mb-4">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565e74]">
                Layer 04
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30] mt-1 mb-2">
                Intelligent Layer
              </h3>
              <p className="text-xs text-[#434655] leading-relaxed mb-6">
                Grounded contextual retrieval, structured JSON tool execution, policy-governed inference.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#eff4ff]">
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                RAG Pipeline
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                Tool Calling
              </span>
              <span className="px-2.5 py-1 rounded bg-[#eff4ff] text-xs font-medium text-[#0b1c30]">
                AI Services
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
