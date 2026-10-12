import type { HODContext } from '../middleware/authMiddleware';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { hodToolRegistry } from '../ai/toolRegistry';
import type {
  HodSearchKnowledgeInput,
  HodSearchKnowledgeOutput,
  HodGetKnowledgeContextInput,
  HodGetKnowledgeContextOutput,
  KnowledgeSearchResultItem,
} from '../ai/hodAi.types';
import {
  hodSearchKnowledgeOutputSchema,
  hodGetKnowledgeContextOutputSchema,
} from '../ai/hodAi.validation';

/**
 * Institutional Knowledge Document Interface for HOD RAG Service
 */
export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'policy' | 'curriculum' | 'handbook' | 'general';
  content: string;
  snippet: string;
  citations: string[];
  sourceUrl?: string;
  keywords: string[];
  sections?: Record<string, string>;
  collegeId?: string | null;     // null = universal institutional document; string = restricted to specific tenant college
  departmentId?: string | null;  // null = college-wide; string = department-specific document
  lastUpdated: string;
}

/**
 * Production-Grade Canonical Institutional Knowledge Corpus
 * Covers:
 * 1. Attendance & Medical Condonation Directives (75% rule, 65% condonation threshold, HOD endorsement)
 * 2. Continuous Internal Assessment (CIA) & Evaluation Framework (40% CIA, 20 IAT marks)
 * 3. University End-Semester Examination Bylaws & Passing Criteria (45% end-sem min, 50% aggregate)
 * 4. Choice Based Credit System (CBCS) & Degree Regulations (160 credits, Core & Electives)
 * 5. HOD Academic Governance & Department Stewardship Handbook (Surveillance, class committee, mark locks)
 * 6. Faculty Workload Norms, Teaching Assignments & Sabbatical Regulations (16 hrs/wk, 1:20 ratio)
 * 7. Student On-Duty (OD), Leave of Absence & Health Verification Policy (Reason explanation, class incharge approval)
 * 8. Student Grievance Redressal, Anti-Ragging & Disciplinary Regulations (HOD grievance cell)
 * 9. Computer Science & Engineering Specialized Lab Computing Directives (Dept-specific: CSE)
 * 10. Confidential Examination Directives for Foreign University (Tenant isolation test doc)
 * 11. Mechanical Engineering Machinery & Foundry Safety Regulations (Dept-specific: Mech)
 */
export const DEFAULT_HOD_KNOWLEDGE_CORPUS: KnowledgeDocument[] = [
  {
    id: 'doc-hod-att-01',
    title: 'Institutional Attendance Policy & Medical Condonation Directives',
    category: 'policy',
    snippet:
      'Students require a minimum of 75% aggregate attendance in each registered course to be eligible for university end-semester examinations. Condonation of attendance shortage between 65.0% and 74.9% may only be granted on valid medical or official deputation grounds upon recommendation by the Class Incharge, endorsement by the HOD, and approval by the Dean. Students below 65% are strictly detained.',
    content:
      'Official Academic Regulations Section 4.1-4.4: Every registered student is required to maintain a minimum aggregate attendance of 75% in each enrolled theory and laboratory course to qualify for University End-Semester Examinations. ' +
      'Students with aggregate attendance between 65.0% and 74.9% may apply for Condonation of Attendance on valid medical grounds (supported by medical certificates from an authorized hospital medical officer) or official college deputation for sports, cultural, or technical competitions. ' +
      'Condonation applications must be verified by the designated Class Incharge, formally endorsed by the Head of Department (HOD), and sanctioned by the Dean of Academics upon payment of the prescribed condonation fee. ' +
      'Students whose aggregate attendance falls below 65.0% under any circumstances are strictly not eligible for condonation and are categorized as Detained (Redo), mandating course re-registration in subsequent academic years.',
    citations: [
      'Academic Regulations Handbook 2026-2027, Section 4.1 (Mandatory Attendance Requirement)',
      'Academic Regulations Handbook 2026-2027, Section 4.3 (Medical Condonation Procedure & HOD Endorsement)',
      'University Examination Eligibility Directives, Clause 12.2',
    ],
    sourceUrl: '/docs/handbook#attendance-condonation',
    keywords: [
      'attendance',
      'condonation',
      '75%',
      '65%',
      'medical',
      'shortage',
      'detained',
      'eligibility',
      'hod approval',
      'class incharge',
      'redo',
      'rules',
      'minimum attendance',
      'defaulter',
    ],
    sections: {
      '4.1 Attendance Minimum':
        'Every candidate must secure not less than 75% of attendance in each course for appearing in the End-Semester Examination.',
      '4.2 Condonation Grounds':
        'Shortage of attendance between 65% and 74.9% may be condoned by the Dean on recommendation of the HOD on genuine medical grounds with certified hospital documentation.',
      '4.3 Detention Category':
        'Candidates who secure less than 65% attendance shall not be permitted to write the semester examination and must repeat the course during the next academic cycle.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'doc-hod-cia-02',
    title: 'Continuous Internal Assessment (CIA) & Evaluation Framework',
    category: 'policy',
    snippet:
      'Continuous Internal Assessment accounts for 40% of the overall course grade: 20 marks from Internal Assessment Tests (IAT), 10 marks from assignments/case studies, and 10 marks from attendance and active tutorial participation. End-Semester exams carry 60%. Faculty must enter and lock CIA marks on LMS within 7 calendar days.',
    content:
      'Examination Regulations Section 6.2: Continuous Internal Assessment (CIA) forms 40% of the aggregate course grade in all theory courses, with the University End-Semester Examination contributing 60%. ' +
      'The 40 CIA marks are allocated as follows: ' +
      '(1) Internal Assessment Tests (IAT-1 and IAT-2): 20 marks total (computed from the average of two centralized tests); ' +
      '(2) Course Assignments, Case Studies, and Mini-Projects: 10 marks; ' +
      '(3) Class Attendance, Quizzes, and Active Tutorial Participation: 10 marks (10 marks for >=90% attendance, 8 marks for 80-89%, 6 marks for 75-79%). ' +
      'Faculty members must enter and verify CIA marks on the College LMS within 7 calendar days of test completion. HODs must conduct a departmental review before final mark lock.',
    citations: [
      'Examination Regulations Handbook 2026, Section 6.2 (Internal Assessment Weightage)',
      'Academic Evaluation Guidelines 2026, Article 8 (Continuous Monitoring & HOD Mark Lock)',
    ],
    sourceUrl: '/docs/handbook#internal-assessment',
    keywords: [
      'cia',
      'internal assessment',
      'iat',
      'internal marks',
      '40 marks',
      '60 marks',
      'evaluation',
      'weightage',
      'tests',
      'assignments',
      'quizzes',
      'mark entry',
    ],
    sections: {
      '6.2 Weightage Distribution':
        'Continuous Internal Assessment (CIA) carries 40 marks and End-Semester University Examination carries 60 marks.',
      '6.3 IAT Test Scheduling':
        'Two centralized IAT tests shall be conducted per semester. Retests require HOD approval based on official leave or medical emergency.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'doc-hod-exam-03',
    title: 'University End-Semester Examination Bylaws & Passing Criteria',
    category: 'policy',
    snippet:
      'To secure a pass in an undergraduate course, a student must obtain a minimum of 45% in the End-Semester Examination (27/60 marks) and at least 50% in aggregate (CIA + End-Semester). Unsuccessful candidates receive an RA (Re-Appear) grade and may register for supplementary exams.',
    content:
      'University Examination Bylaws Section 8.1-8.5: End-Semester Examinations carry 60% weightage. ' +
      'A candidate is declared to have passed a course only if they achieve: ' +
      '(a) A minimum of 45% marks in the University End-Semester Examination (27 out of 60 marks); and ' +
      '(b) An overall aggregate minimum of 50% combining CIA and End-Semester Examination marks (50 out of 100 marks). ' +
      'Students failing to meet either threshold are awarded an RA (Re-Appear) grade. Candidates with RA grades are eligible to appear in supplementary examinations in subsequent terms. ' +
      'Malpractice during examinations, including carrying unauthorized electronic devices or copying, results in immediate confiscation of materials, disciplinary hearing, and debarment for up to two semesters.',
    citations: [
      'University Examination Bylaws 2026, Section 8.1 (Passing Minimum Criteria)',
      'University Examination Bylaws 2026, Section 8.4 (Supplementary Exams & Arrears)',
      'Disciplinary Code for Examinations, Regulation 15 (Malpractice Inquiries)',
    ],
    sourceUrl: '/docs/handbook#examination-rules',
    keywords: [
      'exam',
      'passing marks',
      'passing criteria',
      '45%',
      '50%',
      'aggregate',
      'ra grade',
      'arrear',
      'supplementary',
      'malpractice',
      'hall ticket',
      'end-semester',
    ],
    sections: {
      '8.1 Passing Minimum':
        'A student must obtain a minimum of 45% in the End-Semester Examination and at least 50% in the aggregate of CIA and End-Semester Examination.',
      '8.4 Supplementary Exams':
        'Students receiving RA grades may register for supplementary examinations during the subsequent odd or even semester examination windows.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'doc-hod-cbcs-04',
    title: 'Choice Based Credit System (CBCS) & Degree Award Regulations',
    category: 'curriculum',
    snippet:
      'Under the Choice Based Credit System (CBCS), undergraduate B.Tech candidates must earn a minimum of 160 credits across 8 semesters. The curriculum features Basic Sciences (24), Program Core (64), Professional Electives (18), Open Electives (12), and Capstone Projects (10). Students with CGPA >= 8.5 qualify for Honors.',
    content:
      'Curriculum Regulations Section 3.1-3.6: All academic degree programs adhere to the Choice Based Credit System (CBCS). ' +
      'For the award of B.Tech degree, a student must successfully earn a minimum of 160 credits across eight semesters. ' +
      'Credits are distributed as: Basic Sciences & Mathematics (24 credits), Engineering Sciences (20 credits), Program Core (64 credits), Professional Electives (18 credits), Open Electives (12 credits), Humanities & Social Sciences (12 credits), and Capstone Project & Internships (10 credits). ' +
      'Students with CGPA >= 8.5 without any history of arrears may enroll for B.Tech Honors or Minor degrees by completing an additional 18-20 credits.',
    citations: [
      'Academic Curriculum Framework CBCS 2026, Regulation 3.1 (Credit Requirements)',
      'AICTE Model Curriculum Norms 2024, Section 2 (Undergraduate Engineering Structure)',
    ],
    sourceUrl: '/docs/handbook#cbcs-regulations',
    keywords: [
      'cbcs',
      'curriculum',
      'credits',
      '160 credits',
      'electives',
      'core',
      'honors',
      'minor',
      'degree',
      'graduation',
      'syllabus',
    ],
    sections: {
      '3.1 Credit Breakdown':
        'Total minimum credits required for B.Tech degree: 160 credits across 8 semesters.',
      '3.4 Honors & Minors':
        'Students maintaining CGPA >= 8.5 without arrears may register for 18 additional credits for B.Tech with Honors.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-07-25T00:00:00.000Z',
  },
  {
    id: 'doc-hod-gov-05',
    title: 'HOD Academic Governance, Class Incharge Supervision & Operational Handbook',
    category: 'handbook',
    snippet:
      'Official guidelines for Heads of Department regarding departmental academic governance: fortnightly attendance surveillance, monthly Class Committee meetings, CIA mark lock endorsement, faculty allocation, syllabus completion monitoring, and academic audit compliance.',
    content:
      'HOD Governance Manual Section 1.1-1.8: As the chief academic and administrative executive of the department, the Head of Department (HOD) is responsible for the overall operational integrity of academic programs. ' +
      'Key HOD responsibilities include: ' +
      '(1) Conducting fortnightly attendance reviews with Class Incharges and issuing formal warning notices to parents of students below 75%; ' +
      '(2) Convening monthly Class Committee Meetings with student representatives to resolve curriculum delivery and facility concerns; ' +
      '(3) Reviewing and approving course allocations, ensuring adherence to AICTE faculty workload norms; ' +
      '(4) Endorsing CIA mark lock on LMS following transparency verification with students; ' +
      '(5) Supervising remedial coaching classes for slow learners identified after IAT-1; ' +
      '(6) Recommending valid condonation applications to the Dean of Academics.',
    citations: [
      'HOD Governance Manual 2026, Section 1.1 (Administrative Duties & Supervisory Powers)',
      'LMS Operational Protocol for Department Heads, Article 4 (Mark Lock & Surveillance)',
    ],
    sourceUrl: '/docs/handbook#hod-governance',
    keywords: [
      'hod duties',
      'governance',
      'handbook',
      'class incharge supervision',
      'mark lock',
      'class committee',
      'surveillance',
      'attendance review',
      'syllabus monitoring',
      'remedial',
      'powers',
    ],
    sections: {
      '1.2 Attendance Surveillance':
        'HODs must review departmental attendance every two weeks and review defaulter lists submitted by Class Incharges.',
      '1.4 Mark Lock Verification':
        'HODs must verify that all CIA marks are displayed to students before authorizing the final system lock on the LMS.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-18T00:00:00.000Z',
  },
  {
    id: 'doc-hod-fac-workload-06',
    title: 'Faculty Workload Norms, Teaching Assignments & Sabbatical Regulations',
    category: 'handbook',
    snippet:
      'AICTE and university workload norms: Assistant Professors are assigned 16 teaching hours per week, Associate Professors 14 hours, and Professors/HODs 12 hours. Student-to-faculty ratio must be maintained at 1:20. Faculty research allowance and sabbatical rules.',
    content:
      'Faculty Code of Governance Section 5.1-5.6: Teaching and research allocations for all departmental faculty members adhere strictly to AICTE and institutional norms. ' +
      'Weekly direct teaching workload allocations are: ' +
      '(a) Assistant Professors: 16 teaching hours/week (theory + laboratory); ' +
      '(b) Associate Professors: 14 teaching hours/week; ' +
      '(c) Professors & Heads of Department: 12 teaching hours/week (permitting administrative leadership and research supervision). ' +
      'The department must maintain an overall student-to-faculty ratio (SFR) of 1:20. Course allocations must be finalized by the HOD at least two weeks prior to semester commencement, ensuring faculty teach no more than two unique theory preparations per semester.',
    citations: [
      'Faculty Code of Governance 2026, Section 5.1 (Workload Distribution)',
      'AICTE Regulations on Pay Scales & Qualifications 2024, Appendix B',
    ],
    sourceUrl: '/docs/handbook#faculty-workload',
    keywords: [
      'faculty workload',
      'teaching hours',
      '16 hours',
      '14 hours',
      '12 hours',
      'student faculty ratio',
      'sfr',
      'allocation',
      'sabbatical',
      'teaching load',
      'norms',
    ],
    sections: {
      '5.1 Direct Teaching Hours':
        'Weekly teaching load: Assistant Professor (16 hours), Associate Professor (14 hours), Professor/HOD (12 hours).',
      '5.3 Student-Faculty Ratio':
        'The department student-to-faculty ratio shall be maintained at 1:20 as mandated by national accreditation boards.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-12T00:00:00.000Z',
  },
  {
    id: 'doc-hod-od-leave-07',
    title: 'Student On-Duty (OD), Leave of Absence & Health Verification Policy',
    category: 'policy',
    snippet:
      'Policy governing student Leave of Absence and On-Duty (OD) applications. Students must provide detailed written explanation for health conditions or other reasons. Only Class Incharge can approve or reject leave, but all assigned subject faculties view the student with "Approved", "Pending", or "Rejected" status tag.',
    content:
      'Student Welfare & Leave Regulations Section 7.1-7.5: Students applying for leave of absence must submit applications through the College LMS. ' +
      'For health conditions, the student must provide a concise medical explanation and upload authorized clinical documentation. For non-medical leaves, an explicit personal reason must be specified. ' +
      'Workflow & Authorization Matrix: ' +
      '(1) Application Routing: Leave is submitted directly to the designated Class Incharge; ' +
      '(2) Sole Approval Authority: Only the Class Incharge has the administrative authority to approve or reject student leave; ' +
      '(3) Multi-Faculty Visibility: When approved, students absent on that date are flagged on the attendance register for all assigned subject faculties with the tag [Reason: Approved Leave]; ' +
      '(4) Pending Transparency: If leave remains pending, subject faculties see the application marked with [Reason: Pending]; ' +
      '(5) On-Duty (OD) Sanction: Official college deputation (sports, hackathons, symposiums) requires Class Incharge verification and HOD counter-sanction.',
    citations: [
      'Student Welfare & Leave Regulations 2026, Section 7.1 (Application Procedures)',
      'LMS Leave & On-Duty Automation Guidelines 2026, Article 3 (Class Incharge Roles)',
    ],
    sourceUrl: '/docs/handbook#student-leave-od',
    keywords: [
      'leave',
      'apply for leave',
      'od',
      'on duty',
      'health condition',
      'medical leave',
      'class incharge approval',
      'reason for leave',
      'approved',
      'pending',
      'rejected',
      'subject faculty view',
      'attendance tag',
    ],
    sections: {
      '7.1 Leave Categories':
        'Students may apply for Medical Leave (with clinical explanation) or General Leave (with detailed personal reason).',
      '7.2 Approval & Visibility':
        'Only Class Incharge can approve or reject leave. All assigned subject faculties can view the student leave status with Approved, Pending, or Rejected tags.',
      '7.4 On-Duty Rules':
        'On-Duty (OD) attendance credit requires recommendation of Class Incharge and sanction of HOD.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'doc-hod-grievance-08',
    title: 'Student Grievance Redressal, Anti-Ragging & Disciplinary Regulations',
    category: 'general',
    snippet:
      'The university enforces zero tolerance for ragging, harassment, and academic malpractice. Student evaluation disputes and attendance discrepancies are resolved by the Departmental Grievance Redressal Cell headed by the HOD within 5 working days.',
    content:
      'Institutional Ethics Code Section 12: The institution maintains zero tolerance towards ragging, harassment, and discrimination in accordance with Supreme Court directives and UGC Regulations. ' +
      'Any confirmed incident of ragging results in immediate suspension, formal police FIR lodging, and permanent expulsion from the university. ' +
      'For academic grievances (including valuation disputes, CIA entry errors, or attendance discrepancies), students may submit a formal petition to the Departmental Grievance Redressal Cell headed by the HOD. ' +
      'The grievance cell must examine the claim, inspect the course instructor logs, and issue a written resolution within 5 working days.',
    citations: [
      'Institutional Ethics and Discipline Code 2026, Section 12 (Anti-Ragging Directives)',
      'UGC Grievance Redressal Regulations 2023, Gazetted Notification',
    ],
    sourceUrl: '/docs/handbook#grievance-antiragging',
    keywords: [
      'grievance',
      'anti-ragging',
      'ragging',
      'discipline',
      'harassment',
      'complaint',
      'appeal',
      'redressal',
      'disciplinary',
      'hod cell',
    ],
    sections: {
      '12.1 Anti-Ragging Mandate':
        'Zero tolerance policy. Immediate suspension, police FIR, and debarment for any confirmed ragging.',
      '12.4 Academic Grievance Cell':
        'Departmental Grievance Cell chaired by HOD meets within 5 days of petition to review valuation and attendance disputes.',
    },
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'doc-dept-cse-spec-09',
    title: 'Department of Computer Science & Engineering: Specialized Laboratory & Computing Directives',
    category: 'curriculum',
    snippet:
      'CSE department guidelines for Advanced Computing, Cloud, and AI/ML laboratories. All assignments must be executed in isolated container environments. HPC cluster access requires faculty sponsorship. Crypto-mining is strictly banned.',
    content:
      'CSE Departmental Operating Manual Section 3.2: The Department of Computer Science and Engineering enforces specific protocols for its Advanced Computing, Cloud, and AI/ML laboratories. ' +
      'All students must execute programming assignments in isolated container environments provided via the LMS. ' +
      'High-Performance Computing (HPC) cluster access for senior design projects requires formal faculty sponsorship. ' +
      'Using department computing resources for unauthorized vulnerability scanning, packet sniffing, or crypto-mining is strictly prohibited and results in immediate lab suspension for the remainder of the academic semester.',
    citations: [
      'CSE Departmental Operating Manual 2026, Section 3.2 (Computing Infrastructure Directives)',
      'Department of Computer Science Lab Code of Practice 2026',
    ],
    sourceUrl: '/docs/departments/cse#computing-rules',
    keywords: [
      'cse lab',
      'computing lab',
      'hpc cluster',
      'programming lab',
      'computer science',
      'container',
      'coding',
      'crypto-mining',
      'network safety',
    ],
    sections: {
      '3.2 Lab Protocol':
        'All student code execution must occur within sandboxed containers. Root access is strictly prohibited.',
    },
    collegeId: null,
    departmentId: 'dept-cse-101',
    lastUpdated: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'doc-foreign-tenant-10',
    title: 'Confidential Examination Protocol for Foreign University (Tenant Isolation Test Document)',
    category: 'policy',
    snippet:
      'Confidential examination security directives specific to Foreign University tenant (col-foreign-99). Strictly isolated from other institutions.',
    content:
      'Confidential Examination Directives: This document contains restricted internal exam protocols applicable solely to Foreign University (col-foreign-99). ' +
      'Access by faculty, HODs, or students from other institutions is strictly prevented by multitenant database filters.',
    citations: ['Foreign University Internal Directives 2026'],
    sourceUrl: '/docs/foreign#confidential',
    keywords: ['foreign', 'confidential', 'restricted', 'external university', 'col-foreign-99'],
    sections: {
      '1.1 Restricted': 'Confidential foreign university exam directives.',
    },
    collegeId: 'col-foreign-99',
    departmentId: null,
    lastUpdated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'doc-dept-mech-spec-11',
    title: 'Mechanical Engineering Heavy Machinery & Foundry Safety Regulations',
    category: 'handbook',
    snippet:
      'Specialized workshop safety protocols for Heavy Machinery, Foundry, and Lathe workshops. Restricted to Mechanical Engineering faculty and students.',
    content:
      'Mechanical Workshop Safety Manual Section 1.1: Specialized safety protocols for Heavy Machinery, Foundry, and Lathe Workshops in Mechanical Engineering. ' +
      'All personnel and students must wear safety boots and goggles. Operating machinery without an authorized workshop supervisor present is grounds for disciplinary action.',
    citations: ['Mechanical Workshop Safety Code 2026, Section 1.1'],
    sourceUrl: '/docs/departments/mech#safety',
    keywords: ['mechanical', 'heavy machinery', 'foundry', 'workshop', 'lathe', 'safety'],
    sections: {
      '1.1 Foundry Safety': 'Safety boots, goggles, and supervisor presence mandatory.',
    },
    collegeId: null,
    departmentId: 'dept-mech-999',
    lastUpdated: '2026-02-01T00:00:00.000Z',
  },
];

/**
 * Prompt Injection and Jailbreak Screening Regex Patterns
 */
const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?previous\s+instructions/i,
  /reveal\s+(?:the\s+)?system\s+prompt/i,
  /system\s+instructions/i,
  /bypass\s+(?:all\s+)?filter/i,
  /jailbreak/i,
  /dan\s+mode/i,
  /developer\s+mode\s+enabled/i,
  /as\s+an\s+unrestricted\s+ai/i,
  /<script\b[^>]*>/i,
  /drop\s+table/i,
  /union\s+select/i,
];

/**
 * ============================================================================
 * HodRagToolService
 * ============================================================================
 * Implements authoritative institutional knowledge retrieval and semantic RAG
 * for Heads of Department matching the canonical tool contract:
 * - Tool 6: hod.searchKnowledge
 * - Tool 7: hod.getKnowledgeContext
 * 
 * Supports:
 * - Production-ready Qdrant vector retrieval when QDRANT_URL and QDRANT_API_KEY are configured
 * - Groq AI model synthesis when GROQ_API_KEY is configured
 * - High-fidelity local semantic fallback corpus ensuring 100% test and offline reliability
 * - Strict multi-tenant college and department isolation
 * - Defenses against prompt injection and cross-tenant leakage
 * 
 * Author: Harini (Step 3)
 * Branch: feature/hod-rag
 * ============================================================================
 */
export class HodRagToolService {
  private corpus: KnowledgeDocument[];

  constructor(corpus: KnowledgeDocument[] = DEFAULT_HOD_KNOWLEDGE_CORPUS) {
    this.corpus = corpus;
  }

  /**
   * Central security and context guard: verifies caller is authenticated HOD or authorized admin.
   */
  public assertContext(context: HODContext): void {
    if (!context || !context.uid) {
      throw new ForbiddenError('Unauthorized: Valid Firebase UID required in HODContext.');
    }

    const authorizedRoles = ['HOD', 'ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];
    if (!context.role || !authorizedRoles.includes(context.role.toUpperCase())) {
      throw new ForbiddenError(
        `Forbidden: Access restricted to HOD and authorized staff. Caller role: ${context.role || 'UNKNOWN'}.`,
      );
    }

    if (!context.collegeId) {
      throw new ForbiddenError('Forbidden: College tenant boundary is required.');
    }

    if (!context.departmentId) {
      throw new ForbiddenError('Forbidden: Departmental boundary is required in HODContext.');
    }
  }

  /**
   * Detect potential prompt injection or jailbreak attempts.
   */
  public detectInjection(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
  }

  /**
   * Filter corpus to documents strictly accessible by the authenticated HOD.
   * Multi-tenant security guarantee:
   * - Documents with collegeId must match context.collegeId (universal documents with null collegeId are allowed).
   * - Documents with departmentId must match context.departmentId (college-wide documents with null departmentId are allowed).
   */
  public getAuthorizedCorpus(context: HODContext): KnowledgeDocument[] {
    return this.corpus.filter((doc) => {
      // 1. College Tenant Scoping
      if (doc.collegeId && doc.collegeId !== context.collegeId) {
        return false;
      }

      // 2. Department Scoping
      if (doc.departmentId && doc.departmentId !== context.departmentId) {
        return false;
      }

      return true;
    });
  }

  /**
   * Checks if external Qdrant vector database is configured via environment variables.
   */
  public isQdrantConfigured(): boolean {
    return Boolean(process.env.QDRANT_URL && process.env.QDRANT_API_KEY);
  }

  /**
   * Checks if Groq AI provider is configured via environment variables.
   */
  public isGroqConfigured(): boolean {
    return Boolean(process.env.GROQ_API_KEY);
  }

  /**
   * Optional Qdrant Search Integration
   * When credentials are provided by the user, queries the Qdrant REST API with payload tenant filter.
   * Gracefully falls back to local corpus if Qdrant fails or returns empty.
   */
  public async searchQdrant(
    query: string,
    category: string | undefined,
    limit: number,
    context: HODContext,
  ): Promise<KnowledgeSearchResultItem[] | null> {
    if (!this.isQdrantConfigured()) {
      return null;
    }

    const qdrantUrl = process.env.QDRANT_URL?.replace(/\/+$/, '');
    const apiKey = process.env.QDRANT_API_KEY;
    const collectionName = process.env.QDRANT_COLLECTION_NAME || 'hod_knowledge_base';

    try {
      // Build tenant isolation filter for Qdrant payload
      const filterMust: any[] = [
        {
          should: [
            { key: 'college_id', match: { value: context.collegeId } },
            { is_null: { key: 'college_id' } },
          ],
        },
        {
          should: [
            { key: 'department_id', match: { value: context.departmentId } },
            { is_null: { key: 'department_id' } },
          ],
        },
      ];

      if (category && category !== 'general') {
        filterMust.push({
          key: 'category',
          match: {
            value: category,
          },
        });
      }

      // Generate 128-dim query vector matching Qdrant collection geometry
      const queryVector = this.generateQueryVector(query);

      // Query Qdrant points search
      const response = await fetch(`${qdrantUrl}/collections/${collectionName}/points/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey!,
        },
        body: JSON.stringify({
          vector: queryVector,
          filter: { must: filterMust },
          limit,
          with_payload: true,
        }),
      });

      if (!response.ok) {
        console.warn(`[HOD RAG] Qdrant search returned HTTP ${response.status}. Falling back to local corpus.`);
        return null;
      }

      const data = (await response.json()) as any;
      if (!data.result || !Array.isArray(data.result)) {
        return null;
      }

      // Filter by tenant bounds to guarantee zero cross-tenant leakage
      const authorizedPoints = data.result.filter((point: any) => {
        const pCol = point.payload?.college_id;
        if (pCol && pCol !== context.collegeId) return false;
        const pDept = point.payload?.department_id;
        if (pDept && pDept !== context.departmentId) return false;
        return true;
      });

      return authorizedPoints.map((point: any) => ({
        documentId: point.payload?.document_id || String(point.id),
        title: point.payload?.title || 'Untitled Document',
        category: point.payload?.category || category || 'general',
        snippet: point.payload?.snippet || point.payload?.content?.slice(0, 200) || '',
        score: Math.min(
          Math.max(
            point.score != null
              ? Math.min(Math.round(point.score * 2.5 * 100) / 100, 0.99)
              : 0.85,
            0.1,
          ),
          0.99,
        ),
        url: point.payload?.url || point.payload?.source_url,
      }));
    } catch (err: any) {
      console.warn(`[HOD RAG] Qdrant connection error: ${err.message}. Falling back to local corpus.`);
      return null;
    }
  }

  /**
   * Generate a 128-dimensional normalized query vector matching Qdrant collection geometry.
   */
  public generateQueryVector(text: string, dim = 128): number[] {
    const vec = new Array(dim).fill(0);
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j)) >>> 0;
      }
      vec[hash % dim] += 1.0;

      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        let bHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          bHash = (bHash * 37 + bigram.charCodeAt(j)) >>> 0;
        }
        vec[bHash % dim] += 1.5;
      }
    }

    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return norm > 0 ? vec.map((v) => Number((v / norm).toFixed(6))) : vec;
  }

  /**
   * Optional Groq AI Completion Integration
   * When GROQ_API_KEY is provided, uses Groq to synthesize an answer or re-rank context.
   */
  public async generateGroqCompletion(prompt: string, systemPrompt?: string): Promise<string | null> {
    if (!this.isGroqConfigured()) {
      return null;
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                systemPrompt ||
                'You are an authoritative institutional academic compliance advisor. Provide strictly grounded answers based on institutional regulations. Do not hallucinate.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        console.warn(`[HOD RAG] Groq API returned HTTP ${response.status}.`);
        return null;
      }

      const data = (await response.json()) as any;
      return data.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      console.warn(`[HOD RAG] Groq API error: ${err.message}.`);
      return null;
    }
  }

  /**
   * Tool 6: hod.searchKnowledge
   * Semantic and keyword RAG search over academic regulations, university policies,
   * curriculum bylaws, and departmental administrative handbooks.
   */
  public async searchKnowledge(
    input: HodSearchKnowledgeInput,
    context: HODContext,
  ): Promise<HodSearchKnowledgeOutput> {
    this.assertContext(context);

    // 1. Guard against prompt injection
    if (this.detectInjection(input.query)) {
      return hodSearchKnowledgeOutputSchema.parse({
        query: input.query,
        resultsCount: 0,
        results: [],
        _isStub: false,
      });
    }

    const query = input.query.trim();
    if (!query) {
      return hodSearchKnowledgeOutputSchema.parse({
        query: input.query,
        resultsCount: 0,
        results: [],
        _isStub: false,
      });
    }

    const limit = Math.min(Math.max(input.limit || 5, 1), 20);
    const categoryFilter = input.category;

    // 2. Try Qdrant if credentials are provided in environment
    if (this.isQdrantConfigured()) {
      const qdrantResults = await this.searchQdrant(query, categoryFilter, limit, context);
      if (qdrantResults && qdrantResults.length > 0) {
        // Verify at least one query token exists in matched document to prevent semantic false positives on gibberish
        const queryTokens = this.tokenize(query);
        const verifiedResults = qdrantResults.filter((r) => {
          const lowerTitle = r.title.toLowerCase();
          const lowerSnippet = r.snippet.toLowerCase();
          return queryTokens.some((t) => lowerTitle.includes(t) || lowerSnippet.includes(t));
        });

        if (verifiedResults.length > 0) {
          return hodSearchKnowledgeOutputSchema.parse({
            query: input.query,
            resultsCount: verifiedResults.length,
            results: verifiedResults,
            _isStub: false,
          });
        }
      }
    }

    // 3. Authorized corpus filtered by caller's college and department boundaries
    const authorizedDocs = this.getAuthorizedCorpus(context);

    // 4. Category filtering
    const candidateDocs = authorizedDocs.filter((doc) => {
      if (!categoryFilter) return true;
      return doc.category === categoryFilter;
    });

    // 5. Tokenize query
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return hodSearchKnowledgeOutputSchema.parse({
        query: input.query,
        resultsCount: 0,
        results: [],
        _isStub: false,
      });
    }

    // 6. Score and rank candidates
    const scoredDocs: Array<{ doc: KnowledgeDocument; score: number }> = [];

    for (const doc of candidateDocs) {
      const score = this.calculateRelevance(doc, query, queryTokens);
      if (score >= 0.15) {
        scoredDocs.push({ doc, score });
      }
    }

    // Sort by descending relevance score
    scoredDocs.sort((a, b) => b.score - a.score);

    const topResults: KnowledgeSearchResultItem[] = scoredDocs.slice(0, limit).map(({ doc, score }) => ({
      documentId: doc.id,
      title: doc.title,
      category: doc.category,
      snippet: doc.snippet,
      score: Math.min(Math.round(score * 100) / 100, 0.99),
      url: doc.sourceUrl,
    }));

    const output: HodSearchKnowledgeOutput = {
      query: input.query,
      resultsCount: topResults.length,
      results: topResults,
      _isStub: false,
    };

    return hodSearchKnowledgeOutputSchema.parse(output);
  }

  /**
   * Tool 7: hod.getKnowledgeContext
   * Retrieve grounded document content or specific regulatory clauses.
   * Strictly enforces tenant isolation: cross-college or cross-department access throws ForbiddenError.
   */
  public async getKnowledgeContext(
    input: HodGetKnowledgeContextInput,
    context: HODContext,
  ): Promise<HodGetKnowledgeContextOutput> {
    this.assertContext(context);

    // 1. Guard against prompt injection
    if (this.detectInjection(input.documentId) || (input.section && this.detectInjection(input.section))) {
      return hodGetKnowledgeContextOutputSchema.parse({
        documentId: input.documentId,
        title: 'Security Alert: Prompt Injection Detected',
        section: input.section || null,
        content:
          'Security Notice: The requested document query contained unauthorized directives or jailbreak patterns. ' +
          'Access to institutional regulatory excerpts has been restricted under University Information Security Policy Section 9.',
        lastUpdated: new Date().toISOString(),
        metadata: {
          securityFlag: true,
          classification: 'RESTRICTED',
        },
        _isStub: false,
      });
    }

    const docId = input.documentId.trim();

    // 2. Find document in raw corpus to inspect tenant bounds
    const rawDoc = this.corpus.find((d) => d.id === docId);
    if (!rawDoc) {
      throw new NotFoundError(`Knowledge document not found: ${docId}`);
    }

    // 3. Multi-Tenant Isolation Enforcement
    if (rawDoc.collegeId && rawDoc.collegeId !== context.collegeId) {
      throw new ForbiddenError(
        `Tenant isolation violation: document ${docId} belongs to another institution (${rawDoc.collegeId}).`,
      );
    }

    if (rawDoc.departmentId && rawDoc.departmentId !== context.departmentId) {
      throw new ForbiddenError(
        `Department isolation violation: document ${docId} is restricted to department ${rawDoc.departmentId}.`,
      );
    }

    // 4. Section Extraction
    let extractedSectionName: string | null = null;
    let extractedContent = rawDoc.content;

    if (input.section && input.section.trim()) {
      const sectionQuery = input.section.trim();
      extractedSectionName = sectionQuery;

      // Check explicit section dictionary
      if (rawDoc.sections) {
        const matchingKey = Object.keys(rawDoc.sections).find(
          (k) => k.toLowerCase().includes(sectionQuery.toLowerCase()) || sectionQuery.toLowerCase().includes(k.toLowerCase()),
        );

        if (matchingKey) {
          extractedSectionName = matchingKey;
          extractedContent = rawDoc.sections[matchingKey];
        } else {
          // Attempt keyword-based clause extraction from content
          const clauseMatch = this.extractClause(rawDoc.content, sectionQuery);
          if (clauseMatch) {
            extractedContent = clauseMatch;
          }
        }
      }
    }

    const output: HodGetKnowledgeContextOutput = {
      documentId: rawDoc.id,
      title: rawDoc.title,
      section: extractedSectionName,
      content: extractedContent,
      lastUpdated: rawDoc.lastUpdated,
      metadata: {
        category: rawDoc.category,
        citations: rawDoc.citations,
        sourceUrl: rawDoc.sourceUrl || null,
        collegeScoped: Boolean(rawDoc.collegeId),
        departmentScoped: Boolean(rawDoc.departmentId),
        lastModified: rawDoc.lastUpdated,
      },
      _isStub: false,
    };

    return hodGetKnowledgeContextOutputSchema.parse(output);
  }

  /**
   * Helper: Tokenize text into lower-case keywords excluding common stop words.
   */
  private tokenize(text: string): string[] {
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'to', 'with', 'about', 'by', 'as', 'what', 'how', 'tell', 'me', 'give', 'show', 'please', 'can', 'you',
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s%-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w));
  }

  /**
   * Helper: Calculate similarity/relevance score between a document and query.
   */
  private calculateRelevance(
    doc: KnowledgeDocument,
    rawQuery: string,
    tokens: string[],
  ): number {
    const lowerQuery = rawQuery.toLowerCase();
    const docTitleLower = doc.title.toLowerCase();
    const docContentLower = doc.content.toLowerCase();
    const docSnippetLower = doc.snippet.toLowerCase();

    let score = 0;

    // Exact phrase match in title (high signal)
    if (docTitleLower.includes(lowerQuery)) {
      score += 0.55;
    }

    // Exact phrase match in content or snippet
    if (docSnippetLower.includes(lowerQuery) || docContentLower.includes(lowerQuery)) {
      score += 0.35;
    }

    // Keyword matching
    for (const token of tokens) {
      if (doc.keywords.some((kw) => kw.toLowerCase().includes(token))) {
        score += 0.2;
      }
      if (docTitleLower.includes(token)) {
        score += 0.15;
      }
      if (docSnippetLower.includes(token)) {
        score += 0.08;
      }
      if (docContentLower.includes(token)) {
        score += 0.04;
      }
    }

    return Math.min(score, 0.98);
  }

  /**
   * Helper: Extract a relevant clause from document content matching section keywords.
   */
  private extractClause(content: string, sectionQuery: string): string | null {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const queryTokens = this.tokenize(sectionQuery);
    const matchingSentences = sentences.filter((s) => {
      const lower = s.toLowerCase();
      return queryTokens.some((t) => lower.includes(t));
    });

    if (matchingSentences.length > 0) {
      return matchingSentences.join(' ');
    }
    return null;
  }
}

// Singleton instance
export const hodRagToolService = new HodRagToolService();

/**
 * Register all HOD RAG tool handlers (Tools 6 & 7) into Abhinav's Canonical Tool Registry.
 */
export function registerRagToolHandlers(): void {
  hodToolRegistry.registerToolHandler(
    'hod.searchKnowledge',
    (input: any, ctx: HODContext) => hodRagToolService.searchKnowledge(input, ctx),
  );
  hodToolRegistry.registerToolHandler(
    'hod.getKnowledgeContext',
    (input: any, ctx: HODContext) => hodRagToolService.getKnowledgeContext(input, ctx),
  );
}

// Auto-register upon module load
registerRagToolHandlers();
