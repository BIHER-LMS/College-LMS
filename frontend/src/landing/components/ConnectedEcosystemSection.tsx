import React, { useState } from 'react';
import { ECOSYSTEM_NODES } from '../data/mockData';
import type { EcosystemNodeInfo } from '../types';

interface ConnectedEcosystemSectionProps {
  onSelectRole: (role: 'hod' | 'faculty' | 'student') => void;
}

export const ConnectedEcosystemSection: React.FC<ConnectedEcosystemSectionProps> = ({ onSelectRole }) => {
  const [selectedNodeKey, setSelectedNodeKey] = useState<'hod' | 'faculty' | 'student'>('hod');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedEvents, setSimulatedEvents] = useState<string[]>([
    'Event: HOD approved CS-482 curriculum revision → Bus broadcasted to Faculty & Student registries in 0.9ms',
    'Event: Faculty posted Grade Rubric for CS-301 → Student portal synchronized with verified SHA-256 hash'
  ]);

  const activeNode: EcosystemNodeInfo = ECOSYSTEM_NODES[selectedNodeKey];

  const handleSimulate = () => {
    setIsSimulating(true);
    const newEvent = `Event: Real-time policy change emitted from ${activeNode.name} → Propagated across all 3 nodes at ${new Date().toLocaleTimeString()} (0.4ms latency)`;
    setSimulatedEvents(prev => [newEvent, ...prev.slice(0, 3)]);
    setTimeout(() => setIsSimulating(false), 1200);
  };

  return (
    <section id="ecosystem-section" className="w-full py-20 sm:py-28 bg-[#f8f9ff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Bidirectional Connectivity
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            The Connected Ecosystem
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            All academic domains communicate bidirectionally through the central LMS core.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Ecosystem Canvas (Col 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative bg-white rounded-2xl p-6 sm:p-10 shadow-md border border-[#c3c6d7]/50 min-h-[460px] flex items-center justify-center overflow-hidden">
              {/* Dynamic SVG Connection lines with animated SVG particles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 600 460">
                {/* Connecting Paths */}
                <path
                  id="path-hod-core"
                  d="M 300,90 L 300,230"
                  stroke={selectedNodeKey === 'hod' ? '#004ac6' : '#2563eb'}
                  strokeDasharray="4 4"
                  strokeWidth={selectedNodeKey === 'hod' ? '3' : '2'}
                  strokeOpacity={selectedNodeKey === 'hod' ? '0.9' : '0.4'}
                />
                <path
                  id="path-fac-core"
                  d="M 160,330 L 300,230"
                  stroke={selectedNodeKey === 'faculty' ? '#004ac6' : '#2563eb'}
                  strokeDasharray="4 4"
                  strokeWidth={selectedNodeKey === 'faculty' ? '3' : '2'}
                  strokeOpacity={selectedNodeKey === 'faculty' ? '0.9' : '0.4'}
                />
                <path
                  id="path-stu-core"
                  d="M 440,330 L 300,230"
                  stroke={selectedNodeKey === 'student' ? '#004ac6' : '#2563eb'}
                  strokeDasharray="4 4"
                  strokeWidth={selectedNodeKey === 'student' ? '3' : '2'}
                  strokeOpacity={selectedNodeKey === 'student' ? '0.9' : '0.4'}
                />

                {/* Direct Module-to-Module Peripheral Lines */}
                <path
                  id="path-fac-stu"
                  d="M 170,350 C 300,410 430,350 430,350"
                  stroke="#c3c6d7"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />

                {/* Animated Flow Particles */}
                <circle fill="#2563eb" r={isSimulating ? 6 : 4}>
                  <animateMotion dur={isSimulating ? '1.2s' : '3s'} repeatCount="indefinite" path="M 300,90 L 300,230 L 300,90" />
                </circle>
                <circle fill="#2563eb" r={isSimulating ? 6 : 4}>
                  <animateMotion dur={isSimulating ? '1.4s' : '3.5s'} repeatCount="indefinite" path="M 160,330 L 300,230 L 160,330" />
                </circle>
                <circle fill="#2563eb" r={isSimulating ? 6 : 4}>
                  <animateMotion dur={isSimulating ? '1.5s' : '3.8s'} repeatCount="indefinite" path="M 440,330 L 300,230 L 440,330" />
                </circle>
              </svg>

              {/* Central Core Node */}
              <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#2563eb] text-white text-center p-3 shadow-xl transition-all transform hover:scale-105 border-4 border-white ring-4 ring-[#2563eb]/20">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined text-xl">hub</span>
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-white/80">
                  Aura Academia
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-base sm:text-lg font-bold leading-tight">
                  LMS Core
                </span>
                <span className="text-xs text-white/90 mt-0.5">
                  Bus Engine
                </span>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                  0.3ms P99
                </span>
              </div>

              {/* Top Node: HOD Module */}
              <button
                type="button"
                onClick={() => setSelectedNodeKey('hod')}
                className={`absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white shadow-md transition-all text-left border cursor-pointer ${
                  selectedNodeKey === 'hod'
                    ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20 scale-105'
                    : 'border-[#c3c6d7]/60 hover:shadow-lg'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                  <span className="material-symbols-outlined text-base">corporate_fare</span>
                </span>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#565e74]">
                    Node 01
                  </span>
                  <span className="block text-xs font-semibold text-[#0b1c30]">
                    HOD Module
                  </span>
                </div>
              </button>

              {/* Bottom Left Node: Faculty Module */}
              <button
                type="button"
                onClick={() => setSelectedNodeKey('faculty')}
                className={`absolute bottom-6 left-6 sm:left-14 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white shadow-md transition-all text-left border cursor-pointer ${
                  selectedNodeKey === 'faculty'
                    ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20 scale-105'
                    : 'border-[#c3c6d7]/60 hover:shadow-lg'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                  <span className="material-symbols-outlined text-base">school</span>
                </span>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#565e74]">
                    Node 02
                  </span>
                  <span className="block text-xs font-semibold text-[#0b1c30]">
                    Faculty Module
                  </span>
                </div>
              </button>

              {/* Bottom Right Node: Student Module */}
              <button
                type="button"
                onClick={() => setSelectedNodeKey('student')}
                className={`absolute bottom-6 right-6 sm:right-14 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white shadow-md transition-all text-left border cursor-pointer ${
                  selectedNodeKey === 'student'
                    ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20 scale-105'
                    : 'border-[#c3c6d7]/60 hover:shadow-lg'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center text-[#004ac6]">
                  <span className="material-symbols-outlined text-base">local_library</span>
                </span>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#565e74]">
                    Node 03
                  </span>
                  <span className="block text-xs font-semibold text-[#0b1c30]">
                    Student Module
                  </span>
                </div>
              </button>
            </div>

            {/* Active Node Telemetry Card */}
            <div className="p-5 rounded-xl bg-white border border-[#c3c6d7]/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
                  <span className="material-symbols-outlined">
                    {selectedNodeKey === 'hod' ? 'corporate_fare' : selectedNodeKey === 'faculty' ? 'school' : 'local_library'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0b1c30]">{activeNode.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#eff4ff] text-[#004ac6] font-semibold">
                      {activeNode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#434655] max-w-lg mt-0.5">{activeNode.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="block text-[10px] text-[#565e74] uppercase">Latency</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">{activeNode.latency}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-[#565e74] uppercase">Throughput</span>
                  <span className="text-xs font-mono font-bold text-[#004ac6]">{activeNode.throughput}</span>
                </div>
                <button
                  onClick={() => onSelectRole(selectedNodeKey)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] transition-colors"
                >
                  Inspect Screen
                </button>
              </div>
            </div>

            {/* Live event log simulator */}
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold text-[#0b1c30]">Universal Event Bus Stream</span>
                </div>
                <button
                  onClick={handleSimulate}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded bg-white border border-[#c3c6d7] text-[11px] font-semibold text-[#004ac6] hover:bg-[#dce9ff] transition-colors cursor-pointer"
                >
                  {isSimulating ? 'Emitting State...' : 'Trigger State Pulse'}
                </button>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-[#434655]">
                {simulatedEvents.map((evt, idx) => (
                  <div key={idx} className="truncate">
                    {evt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ecosystem Architecture Guarantee Panel (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="p-6 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/80 shadow-xs">
              <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
                <span className="material-symbols-outlined text-2xl">speed</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#0b1c30]">
                  Zero Sourced Latency
                </h3>
              </div>
              <p className="text-sm text-[#434655] leading-relaxed">
                Centralized memory buffers guarantee synchronization across administrative approvals and instructional releases without batch delay.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/80 shadow-xs">
              <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
                <span className="material-symbols-outlined text-2xl">call_split</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#0b1c30]">
                  Event-Driven Routing
                </h3>
              </div>
              <p className="text-sm text-[#434655] leading-relaxed">
                System events emit state modifications universally. A curriculum amendment executed by an HOD instantly propagates to syllabus registries.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#eff4ff] border border-[#dce9ff]/80 shadow-xs">
              <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
                <span className="material-symbols-outlined text-2xl">swap_horizontal_circle</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-semibold text-[#0b1c30]">
                  Bidirectional Data Flow
                </h3>
              </div>
              <p className="text-sm text-[#434655] leading-relaxed">
                No isolated databases. Course units, evaluation rubrics, and policy frameworks flow in closed feedback loops between faculty and students.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#c3c6d7]/60 shadow-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                Active Protocol
              </span>
              <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30] mt-1 mb-2">
                Distributed Bus Topology
              </h4>
              <p className="text-xs text-[#565e74] leading-relaxed mb-4">
                Sub-millisecond pub/sub protocol guaranteeing state convergence across 100,000+ concurrent campus sessions.
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[#eff4ff] text-xs">
                <span className="text-[#565e74]">Consistency Mode:</span>
                <span className="font-semibold text-emerald-600">Strict Serializable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
