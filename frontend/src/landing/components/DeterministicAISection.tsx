import React, { useState } from 'react';

export const DeterministicAISection: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(3);

  const stageData = [
    {
      stage: 1,
      badge: 'Stage 01',
      title: 'User Context',
      subtitle: 'HOD / Faculty / Student',
      icon: 'group',
      description: 'The incoming user session carries cryptographically signed role identifiers and campus department claims.',
      samplePayload: `{
  "userId": "usr_9941a",
  "role": "faculty",
  "department": "Computer Science",
  "query": "Review syllabus prerequisites for CS-482 Autonomous Systems against academic policy 2026."
}`
    },
    {
      stage: 2,
      badge: 'Stage 02',
      title: 'LMS Interface',
      subtitle: 'Role-Filtered Session',
      icon: 'web',
      description: 'The interface sanitizes user input, attaches current course state tokens, and verifies role authorization bounds.',
      samplePayload: `{
  "contextFilter": "DEPT_CS_COURSES",
  "academicSession": "Fall 2026",
  "sanitizedQuery": "query_clean_tokenized",
  "tokenQuota": "ALLOW_DEPT_READ"
}`
    },
    {
      stage: 3,
      badge: 'Stage 03',
      title: 'AI Orchestrator',
      subtitle: 'Intent Resolution Engine',
      icon: 'memory',
      description: 'Determines whether the request requires institutional document vector lookup, deterministic tool execution, or direct structured response.',
      samplePayload: `{
  "resolvedIntent": "POLICY_AND_PREREQUISITE_VERIFICATION",
  "confidenceScore": 0.998,
  "routePlan": [
    "VECTOR_SEARCH: academic_code_ch_4",
    "TOOL_INVOCATION: get_course_prereqs('CS-482')"
  ]
}`
    },
    {
      stage: 4,
      badge: 'Stage 04',
      title: 'RAG & Tool Calling',
      subtitle: 'Verified Documentation',
      icon: 'cable',
      description: 'Retrieval embeddings search official institutional handbooks while typed JSON tools query the live course database.',
      samplePayload: `{
  "ragChunks": [
    "Handbook Section 4.2.1: Prerequisite chains must be certified by Department Council.",
    "Catalog 2026: CS-482 requires CS-204 and MATH-220."
  ],
  "toolResult": { "course": "CS-482", "registeredPrereqs": ["CS-204", "MATH-220"], "status": "Compliant" }
}`
    },
    {
      stage: 5,
      badge: 'Stage 05',
      title: 'Verified Output',
      subtitle: 'Deterministic Output',
      icon: 'verified',
      description: 'Output is validated against strict JSON schemas with attached document source hashes, guaranteeing zero hallucination.',
      samplePayload: `{
  "verdict": "COMPLIANT_WITH_AMENDMENT",
  "auditHash": "sha256:8f3c9e2b10a471...",
  "citations": ["Academic Code 2026 §4.2.1", "CS Council Resolution #88"],
  "hallucinationGuard": "PASSED"
}`
    }
  ];

  const currentStageInfo = stageData[selectedStage - 1];

  return (
    <section className="w-full py-20 sm:py-28 bg-[#eff4ff] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] mb-2">
            Deterministic AI Framework
          </span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight mb-3">
            An LMS Built for Intelligent Assistance
          </h2>
          <p className="font-['Inter'] text-base sm:text-lg text-[#434655]">
            Grounding modern language intelligence in verified institutional knowledge and deterministic tools.
          </p>
        </div>

        {/* 5-Stage Pipeline Visual */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white shadow-md border border-[#c3c6d7]/50 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
            {stageData.map((stg) => {
              const isSelected = selectedStage === stg.stage;
              const isHighlight = stg.stage === 3;
              return (
                <button
                  key={stg.stage}
                  onClick={() => setSelectedStage(stg.stage)}
                  className={`flex flex-col items-center text-center p-4 rounded-xl transition-all cursor-pointer border text-left ${
                    isSelected
                      ? 'bg-[#2563eb] text-white shadow-md border-[#2563eb] scale-105'
                      : isHighlight
                      ? 'bg-[#eff4ff] border-[#004ac6]/40 text-[#0b1c30] hover:border-[#004ac6]'
                      : 'bg-[#eff4ff] border-[#dce9ff] text-[#0b1c30] hover:bg-white hover:border-[#c3c6d7]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isHighlight
                        ? 'bg-[#e5eeff] text-[#004ac6]'
                        : 'bg-[#e5eeff] text-[#004ac6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{stg.icon}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-white/80' : 'text-[#565e74]'
                    }`}
                  >
                    {stg.badge}
                  </span>
                  <span
                    className={`font-['Plus_Jakarta_Sans'] text-xs font-bold mt-1 ${
                      isSelected ? 'text-white' : 'text-[#0b1c30]'
                    }`}
                  >
                    {stg.title}
                  </span>
                  <span
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isSelected ? 'text-white/90' : 'text-[#434655]'
                    }`}
                  >
                    {stg.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Pipeline Stage Inspector */}
          <div className="mt-8 pt-6 border-t border-[#eff4ff] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#004ac6]">
                Stage Execution Inspector
              </span>
              <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30] mt-1 mb-2">
                {currentStageInfo.badge}: {currentStageInfo.title}
              </h4>
              <p className="text-sm text-[#434655] leading-relaxed mb-4">
                {currentStageInfo.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#565e74]">Step Verification:</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Zero-Hallucination Guardrail
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0b1c30] rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto border border-[#213145] shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#213145] text-slate-400 text-[10px]">
                <span>STREAM_TRACE_ID: trace_882914</span>
                <span className="text-emerald-400">STATUS: CONVERGED</span>
              </div>
              <pre className="text-slate-200">{currentStageInfo.samplePayload}</pre>
            </div>
          </div>
        </div>

        {/* Node Explanatory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50">
            <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
              <span className="material-symbols-outlined text-2xl">travel_explore</span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                Vector Context Retrieval
              </h3>
            </div>
            <p className="text-sm text-[#434655] leading-relaxed">
              Retrieval-Augmented Generation parses official academic handbooks and syllabus documentation, eliminating hallucinations by anchoring responses directly to institutional text.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50">
            <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
              <span className="material-symbols-outlined text-2xl">terminal</span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                Tool Execution
              </h3>
            </div>
            <p className="text-sm text-[#434655] leading-relaxed">
              The orchestration model safely invokes deterministic internal API tools, enabling automated course registry queries, timetable indexing, and academic schedule checks.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-xl bg-white shadow-xs border border-[#c3c6d7]/50">
            <div className="flex items-center gap-3 mb-2 text-[#004ac6]">
              <span className="material-symbols-outlined text-2xl">shield</span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-semibold text-[#0b1c30]">
                Guardrails &amp; Provenance
              </h3>
            </div>
            <p className="text-sm text-[#434655] leading-relaxed">
              Every AI interaction outputs reference source hashes linking back to specific regulatory codes, course guidelines, or administrative circulars within the LMS repository.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
