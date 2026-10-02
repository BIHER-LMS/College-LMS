import React, { useState } from 'react';
import { CAPABILITIES } from '../data/mockData';
import { CapabilityItem } from '../types';

interface CapabilitiesSectionProps {
  onInspectCapability: (capability: CapabilityItem) => void;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ onInspectCapability }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCapabilities = CAPABILITIES.filter((cap) => {
    const matchesCat = activeCategory === 'all' || cap.category === activeCategory;
    const matchesSearch =
      cap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cap.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <section id="capabilities-section" className="w-full py-20 sm:py-28 bg-[#f8f9ff]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Exhaustive Architecture
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            Platform Capabilities
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            Engineered specifically for academic institutions requiring precision and dependability.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#eff4ff] border border-[#d3e4fe]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              All (11)
            </button>
            <button
              onClick={() => setActiveCategory('governance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'governance'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Governance
            </button>
            <button
              onClick={() => setActiveCategory('instruction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'instruction'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Instruction
            </button>
            <button
              onClick={() => setActiveCategory('security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'security'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveCategory('ai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'ai'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              AI Intelligence
            </button>
            <button
              onClick={() => setActiveCategory('infrastructure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'infrastructure'
                  ? 'bg-white text-[#004ac6] shadow-xs'
                  : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Infrastructure
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search capabilities..."
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#c3c6d7] bg-white text-[#0b1c30] placeholder-gray-400 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6]"
            />
          </div>
        </div>

        {/* 11 Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapabilities.map((cap) => (
            <div
              key={cap.id}
              onClick={() => onInspectCapability(cap)}
              className="p-6 rounded-xl bg-white shadow-xs hover:shadow-md transition-all border border-[#c3c6d7]/50 flex flex-col justify-between cursor-pointer group hover:border-[#004ac6]/60"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6] group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{cap.icon}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold text-[#565e74] bg-[#eff4ff]">
                    {cap.category}
                  </span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30] mb-2 group-hover:text-[#004ac6] transition-colors">
                  {cap.title}
                </h3>
                <p className="text-sm text-[#434655] leading-relaxed mb-4">
                  {cap.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#eff4ff] flex items-center justify-between text-xs text-[#004ac6] font-medium">
                <span>View Architecture Spec</span>
                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
