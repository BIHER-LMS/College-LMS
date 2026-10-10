import type {
  FacultyContext,
  FacultySearchKnowledgeInput,
  FacultySearchKnowledgeOutput,
  FacultyGetKnowledgeContextInput,
  FacultyGetKnowledgeContextOutput,
} from '../ai/facultyAi.types';
import {
  facultySearchKnowledgeOutputSchema,
  facultyGetKnowledgeContextOutputSchema,
} from '../ai/facultyAi.validation';
import { facultyToolRegistry } from '../ai/toolRegistry';

/**
 * Institutional Knowledge Document Interface
 */
export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'ACADEMIC_POLICY' | 'EXAM_REGULATION' | 'SYLLABUS' | 'INSTITUTIONAL';
  content: string;
  snippet: string;
  citations: string[];
  sourceUrl?: string;
  keywords: string[];
  collegeId?: string | null;     // null = universal institutional document; string = restricted to specific tenant college
  departmentId?: string | null;  // null = college-wide; string = department-specific document
  lastUpdated: string;
}

/**
 * Canonical Institutional Knowledge Base Corpus (Production-Grade High-Fidelity Dummy Data)
 * Covers University Academic Regulations, Examination Bylaws, CBCS Curricula,
 * Faculty Code of Conduct, Laboratory Protocols, and Department-Specific Directives.
 */
export const DEFAULT_KNOWLEDGE_CORPUS: KnowledgeDocument[] = [
  {
    id: 'doc-acad-att-01',
    title: 'Institutional Attendance Policy & Condonation Rules',
    category: 'ACADEMIC_POLICY',
    snippet:
      'Students require a minimum of 75% aggregate attendance in each course to be eligible for university end-semester examinations. Condonation of shortage (65%-74.9%) may be granted on valid medical grounds upon recommendation of the Class Incharge and approval by HOD. Students below 65% are strictly detained.',
    content:
      'Official Academic Regulations Section 4.1-4.4: Every registered student is required to maintain a minimum aggregate attendance of 75% in each enrolled theory and laboratory course to qualify for University End-Semester Examinations. ' +
      'Students with attendance between 65.0% and 74.9% may apply for Condonation of Attendance on valid medical grounds (supported by medical records from an authorized medical officer) or official college deputation for sports/cultural competitions. ' +
      'Condonation applications must be verified by the Class Incharge, recommended by the Head of Department (HOD), and sanctioned by the Dean of Academics upon payment of the prescribed condonation fee. ' +
      'Students whose aggregate attendance falls below 65.0% under any circumstances are strictly not eligible for condonation and are categorized as Detained (Redo), mandating course re-registration in subsequent semesters.',
    citations: [
      'Academic Regulations Handbook 2026-2027, Section 4.1 (Mandatory Attendance Requirement)',
      'Academic Regulations Handbook 2026-2027, Section 4.3 (Medical Condonation Procedure)',
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
      'class incharge',
      'redo',
      'rules',
      'minimum attendance',
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'doc-exam-cia-02',
    title: 'Continuous Internal Assessment (CIA) & Evaluation Framework',
    category: 'EXAM_REGULATION',
    snippet:
      'Continuous Internal Assessment accounts for 40% of the overall course grade: 20 marks from Internal Assessment Tests (IAT), 10 marks from assignments/case studies, and 10 marks from attendance and active seminar/quiz participation. End-Semester exams carry 60%.',
    content:
      'Examination Regulations Section 6.2: Continuous Internal Assessment (CIA) forms 40% of the aggregate course grade in all theory courses, with the University End-Semester Examination contributing 60%. ' +
      'The 40 CIA marks are allocated as follows: ' +
      '(1) Internal Assessment Tests (IAT-1 and IAT-2): 20 marks total (computed from the average of two centralized tests); ' +
      '(2) Course Assignments, Case Studies, and Mini-Projects: 10 marks; ' +
      '(3) Class Attendance, Quizzes, and Active Tutorial Participation: 10 marks (10 marks for >=90% attendance, 8 marks for 80-89%, 6 marks for 75-79%). ' +
      'Faculty members must enter and verify CIA marks on the College LMS within 7 calendar days of test completion and conduct transparency reviews with students before final lock.',
    citations: [
      'Examination Regulations Handbook 2026, Section 6.2 (Internal Assessment Weightage)',
      'Academic Evaluation Guidelines 2026, Article 8 (Continuous Monitoring)',
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
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'doc-exam-endsem-03',
    title: 'University End-Semester Examination Bylaws & Passing Criteria',
    category: 'EXAM_REGULATION',
    snippet:
      'To secure a pass in a course, a student must obtain a minimum of 45% in the End-Semester Examination and at least 50% in aggregate (CIA + End-Semester). Unsuccessful candidates receive an RA (Re-Appear) grade and may register for supplementary exams.',
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
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'doc-acad-cbcs-04',
    title: 'Choice Based Credit System (CBCS) & Degree Award Regulations',
    category: 'SYLLABUS',
    snippet:
      'Under the Choice Based Credit System (CBCS), undergraduate B.Tech candidates must earn a minimum of 160 credits across 8 semesters. The curriculum features Core Courses, Professional Electives, Open Electives, and Value-Added Non-Credit Courses.',
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
      'credits',
      '160 credits',
      'degree requirements',
      'curriculum',
      'electives',
      'open electives',
      'honors',
      'minor',
      'cgpa',
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-07-20T00:00:00.000Z',
  },
  {
    id: 'doc-acad-lab-05',
    title: 'Laboratory Course Conduct & Continuous Practical Evaluation Protocol',
    category: 'SYLLABUS',
    snippet:
      'Laboratory courses undergo 100% continuous evaluation: 60 marks for regular lab performance (observation, calculation, viva-voce) and 40 marks for the model/end-semester practical exam. 100% lab completion is mandatory for exam entry.',
    content:
      'Laboratory Operations Manual Section 2.4: Laboratory courses demand rigorous weekly continuous evaluation. ' +
      'Continuous practical evaluation carries 60 marks: Pre-lab preparation (10 marks), In-lab experiment execution and data acquisition (25 marks), Observation book and formal record submission (15 marks), and Weekly viva-voce (10 marks). ' +
      'The model practical examination conducted at term end carries 40 marks. ' +
      'Students must complete 100% of prescribed laboratory experiments to qualify for the practical exam. Missed lab sessions due to sanctioned leave must be completed during scheduled compensatory lab slots with prior approval of the Class Incharge.',
    citations: [
      'Laboratory Operations Manual 2026, Section 2.4 (Practical Assessment Rubrics)',
      'Curriculum Implementation Directives 2026, Clause 5.3',
    ],
    sourceUrl: '/docs/handbook#laboratory-guidelines',
    keywords: [
      'laboratory',
      'practicals',
      'lab evaluation',
      'viva voce',
      'record submission',
      'experiment',
      'compensatory lab',
      'practical exam',
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-07-25T00:00:00.000Z',
  },
  {
    id: 'doc-acad-proj-06',
    title: 'Capstone Project & Technical Dissertation Guidelines',
    category: 'ACADEMIC_POLICY',
    snippet:
      'Final year capstone projects span Phase 1 (Semester 7, 3 credits) and Phase 2 (Semester 8, 6 credits). Teams of 2-4 students are guided by a faculty mentor and evaluated through 3 departmental review milestones. Plagiarism must be below 15%.',
    content:
      'Project Work Handbook Section 5.1-5.3: The final year B.Tech Capstone Project is structured in two sequential phases: ' +
      'Phase 1 in Semester 7 (Problem formulation, literature survey, architectural design - 3 credits) and Phase 2 in Semester 8 (Implementation, testing, experimental benchmarking, and thesis defense - 6 credits). ' +
      'Projects are executed in student cohorts of 2 to 4 guided by a departmental faculty supervisor. ' +
      'Evaluation comprises three reviews: Review 0 (Idea approval), Review 1 (Mid-term progress - 30 marks), Review 2 (Final prototype - 30 marks), and External Viva-Voce (40 marks). ' +
      'All project reports must pass automated plagiarism screening with a similarity index strictly below 15% before final submission.',
    citations: [
      'Project Work Handbook 2026, Section 5.1 (Project Lifecycle & Evaluation)',
      'Academic Integrity Policy 2026, Section 3.2 (Plagiarism Thresholds)',
    ],
    sourceUrl: '/docs/handbook#project-guidelines',
    keywords: [
      'project',
      'capstone',
      'dissertation',
      'thesis',
      'plagiarism',
      'viva',
      'mentor',
      'reviews',
      'phase 1',
      'phase 2',
      'final year',
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-05T00:00:00.000Z',
  },
  {
    id: 'doc-inst-faculty-07',
    title: 'Faculty Academic Responsibilities & Class Incharge Code of Practice',
    category: 'INSTITUTIONAL',
    snippet:
      'Faculty members must upload attendance within 24 hours of lecture completion. Class Incharges must conduct fortnightly attendance audits, issue warning letters to students below 75%, organize monthly class committee meetings, and mentor slow learners.',
    content:
      'Faculty Code of Governance Article 9: Faculty members are expected to uphold the highest pedagogical standards. ' +
      'Key duties include: (1) Uploading session-wise student attendance to the College LMS within 24 hours of session completion; ' +
      '(2) Updating course coverage logs and learning materials weekly; ' +
      '(3) Completing CIA test valuation within 7 working days. ' +
      'Class Incharges have mandatory administrative stewardship: ' +
      '(a) Conducting fortnightly attendance reviews and issuing formal deficiency notices to parents of students below 75%; ' +
      '(b) Convening monthly Class Committee Meetings with designated student representatives; ' +
      '(c) Coordinating remedial coaching sessions for slow learners; ' +
      '(d) Recommending eligible students for condonation or scholarship endorsements.',
    citations: [
      'Faculty Code of Governance 2026, Article 9 (Faculty and Class Incharge Responsibilities)',
      'LMS Academic Operational Manual 2026, Section 1.3',
    ],
    sourceUrl: '/docs/handbook#class-incharge-duties',
    keywords: [
      'faculty duties',
      'class incharge',
      'attendance entry',
      '24 hours',
      'counseling',
      'mentor',
      'parent teacher meeting',
      'class committee',
      'remedial',
      'responsibilities',
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-12T00:00:00.000Z',
  },
  {
    id: 'doc-inst-grievance-08',
    title: 'Student Grievance Redressal & Anti-Ragging Institutional Regulations',
    category: 'INSTITUTIONAL',
    snippet:
      'The university strictly enforces zero tolerance for ragging and harassment. Student academic disputes regarding evaluation or attendance may be appealed to the Departmental Grievance Redressal Cell for resolution within 5 working days.',
    content:
      'Institutional Ethics Code Section 12: The institution maintains a zero-tolerance policy towards ragging, harassment, and discrimination in accordance with Supreme Court directives and UGC Regulations. ' +
      'Any confirmed incident of ragging results in immediate suspension, formal FIR lodging, and permanent expulsion. ' +
      'For academic grievances (including valuation disputes or attendance discrepancies), students may submit a formal petition to the Departmental Grievance Redressal Cell headed by the HOD. ' +
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
    ],
    collegeId: null,
    departmentId: null,
    lastUpdated: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'doc-dept-cse-09',
    title: 'Department of Computer Science & Engineering: Specialized Laboratory & Computing Directives',
    category: 'SYLLABUS',
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
    collegeId: null,
    departmentId: 'dept-cse-101',
    lastUpdated: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'doc-foreign-10',
    title: 'Confidential Examination Protocol for Foreign University (Tenant Isolation Test Document)',
    category: 'EXAM_REGULATION',
    snippet:
      'Confidential examination security directives specific to Foreign University tenant (col-foreign-99). Strictly isolated from other institutions.',
    content:
      'Confidential Examination Directives: This document contains restricted internal exam protocols applicable solely to Foreign University (col-foreign-99). ' +
      'Access by faculty or students from other institutions is strictly prevented by multitenant database filters.',
    citations: ['Foreign University Internal Directives 2026'],
    sourceUrl: '/docs/foreign#confidential',
    keywords: ['foreign', 'confidential', 'restricted', 'external university', 'col-foreign-99'],
    collegeId: 'col-foreign-99',
    departmentId: null,
    lastUpdated: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'doc-dept-mech-11',
    title: 'Mechanical Engineering Heavy Machinery & Foundry Safety Regulations',
    category: 'INSTITUTIONAL',
    snippet:
      'Specialized workshop safety protocols for Heavy Machinery, Foundry, and Lathe workshops. Restricted to Mechanical Engineering faculty and students.',
    content:
      'Mechanical Workshop Safety Manual Section 1.1: Specialized safety protocols for Heavy Machinery, Foundry, and Lathe Workshops in Mechanical Engineering. ' +
      'All personnel and students must wear safety boots and goggles. Operating machinery without an authorized workshop supervisor present is grounds for disciplinary action.',
    citations: ['Mechanical Workshop Safety Code 2026, Section 1.1'],
    sourceUrl: '/docs/departments/mech#safety',
    keywords: ['mechanical', 'heavy machinery', 'foundry', 'workshop', 'lathe', 'safety'],
    collegeId: null,
    departmentId: 'dept-mech-999',
    lastUpdated: '2026-02-01T00:00:00.000Z',
  },
];

/**
 * Prompt Injection and Jailbreak Screening Keywords
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
 * Faculty Knowledge & RAG Service (Step 3: Jeresh)
 * Provides authoritative institutional knowledge retrieval for Faculty and Class Incharges.
 * Strictly respects tenant college and department boundaries.
 */
export class FacultyKnowledgeService {
  private corpus: KnowledgeDocument[];

  constructor(corpus: KnowledgeDocument[] = DEFAULT_KNOWLEDGE_CORPUS) {
    this.corpus = corpus;
  }

  /**
   * Central security and context guard: verifies caller is authenticated faculty/incharge.
   */
  public assertContext(context: FacultyContext): void {
    if (!context || !context.uid) {
      const err = new Error('Unauthorized: Valid Firebase UID required in FacultyContext.');
      (err as any).statusCode = 401;
      throw err;
    }

    const authorizedRoles = ['FACULTY', 'HOD', 'ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];
    if (!context.role || !authorizedRoles.includes(context.role.toUpperCase())) {
      const err = new Error(
        `Forbidden: Access restricted to Faculty and authorized staff. Caller role: ${context.role || 'UNKNOWN'}.`,
      );
      (err as any).statusCode = 403;
      throw err;
    }

    if (!context.collegeId) {
      const err = new Error('Forbidden: College tenant boundary is required.');
      (err as any).statusCode = 403;
      throw err;
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
   * Filter corpus to documents accessible by the authenticated faculty member.
   * Multi-tenant security guarantee:
   * - Documents with collegeId must match context.collegeId (universal documents with null collegeId are allowed).
   * - Documents with departmentId must match context.departmentId (college-wide documents with null departmentId are allowed).
   */
  public getAuthorizedCorpus(context: FacultyContext): KnowledgeDocument[] {
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
   * Tool 18: faculty.searchKnowledge
   * Semantic and keyword RAG search over institutional regulations, attendance rules,
   * examination criteria, and departmental guidelines.
   */
  public async searchKnowledge(
    input: FacultySearchKnowledgeInput,
    context: FacultyContext,
  ): Promise<FacultySearchKnowledgeOutput> {
    this.assertContext(context);

    // 1. Check for prompt injection attempts
    if (this.detectInjection(input.query)) {
      return facultySearchKnowledgeOutputSchema.parse({
        query: input.query,
        results: [],
        totalMatches: 0,
        _isStub: true,
      });
    }

    const query = input.query.trim();
    if (!query) {
      return facultySearchKnowledgeOutputSchema.parse({
        query: input.query,
        results: [],
        totalMatches: 0,
        _isStub: true,
      });
    }

    const categoryFilter = input.category || 'ALL';
    const topK = Math.min(Math.max(input.topK || 5, 1), 10);

    // 2. Scope documents by caller's college and department
    const authorizedDocs = this.getAuthorizedCorpus(context);

    // 3. Category filtering
    const candidateDocs = authorizedDocs.filter((doc) => {
      if (categoryFilter === 'ALL') return true;
      return doc.category === categoryFilter;
    });

    // 4. Tokenize query
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return facultySearchKnowledgeOutputSchema.parse({
        query: input.query,
        results: [],
        totalMatches: 0,
        _isStub: true,
      });
    }

    // 5. Score and rank candidates
    const scoredDocs: Array<{ doc: KnowledgeDocument; score: number }> = [];

    for (const doc of candidateDocs) {
      const score = this.calculateRelevance(doc, query, queryTokens);
      if (score >= 0.15) {
        scoredDocs.push({ doc, score });
      }
    }

    // Sort by descending relevance score
    scoredDocs.sort((a, b) => b.score - a.score);

    const topResults = scoredDocs.slice(0, topK).map(({ doc, score }) => ({
      id: doc.id,
      title: doc.title,
      snippet: doc.snippet,
      score: Math.min(Math.round(score * 100) / 100, 0.99),
      category: doc.category,
      sourceUrl: doc.sourceUrl,
    }));

    const output: FacultySearchKnowledgeOutput = {
      query: input.query,
      results: topResults,
      totalMatches: topResults.length,
      _isStub: true,
    };

    return facultySearchKnowledgeOutputSchema.parse(output);
  }

  /**
   * Tool 19: faculty.getKnowledgeContext
   * Retrieve authoritative regulatory excerpt and citations for a specific academic topic.
   */
  public async getKnowledgeContext(
    input: FacultyGetKnowledgeContextInput,
    context: FacultyContext,
  ): Promise<FacultyGetKnowledgeContextOutput> {
    this.assertContext(context);

    // 1. Check for prompt injection attempts
    if (this.detectInjection(input.topic)) {
      return facultyGetKnowledgeContextOutputSchema.parse({
        topic: input.topic,
        contextText:
          'Security Notice: The requested topic contains unauthorized directives or prompt injection syntax. ' +
          'Access to institutional regulatory excerpts has been restricted under University Information Security Policy Section 9.',
        citations: ['College IT Governance & Security Policy 2026, Section 9'],
        lastUpdated: new Date().toISOString(),
        _isStub: true,
      });
    }

    const topic = input.topic.trim();
    const maxTokens = Math.min(Math.max(input.maxTokens || 500, 1), 2000);

    // 2. Scope documents by caller's college and department
    const authorizedDocs = this.getAuthorizedCorpus(context);
    const topicTokens = this.tokenize(topic);

    // 3. Find best matching document for the topic
    let bestDoc: KnowledgeDocument | null = null;
    let highestScore = 0;

    for (const doc of authorizedDocs) {
      const score = this.calculateRelevance(doc, topic, topicTokens);
      if (score > highestScore && score >= 0.15) {
        highestScore = score;
        bestDoc = doc;
      }
    }

    // 4. Grounded response: If match exists, return verbatim excerpt and citations
    if (bestDoc) {
      // Truncate to approximately maxTokens words if content is extensive
      const words = bestDoc.content.split(/\s+/);
      const truncatedContent =
        words.length > maxTokens
          ? words.slice(0, maxTokens).join(' ')
          : bestDoc.content;

      const output: FacultyGetKnowledgeContextOutput = {
        topic: input.topic,
        contextText: truncatedContent,
        citations: bestDoc.citations,
        lastUpdated: bestDoc.lastUpdated,
        _isStub: true,
      };

      return facultyGetKnowledgeContextOutputSchema.parse(output);
    }

    // 5. Grounded No-Result: Do NOT hallucinate policy
    const noResultOutput: FacultyGetKnowledgeContextOutput = {
      topic: input.topic,
      contextText:
        `No authoritative academic policy, examination regulation, or institutional document was found covering the topic "${input.topic}". ` +
        `Please consult your Head of Department or the Academic Dean's office for official clarification.`,
      citations: [],
      lastUpdated: new Date().toISOString(),
      _isStub: true,
    };

    return facultyGetKnowledgeContextOutputSchema.parse(noResultOutput);
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
}

// Singleton instance
export const facultyKnowledgeService = new FacultyKnowledgeService();

/**
 * Register Faculty RAG Tool Handlers (Tools 18 & 19) into Canonical Tool Registry
 */
export function registerFacultyRagHandlers(): void {
  facultyToolRegistry.registerToolHandler(
    'faculty.searchKnowledge',
    (input: any, ctx: FacultyContext) => facultyKnowledgeService.searchKnowledge(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getKnowledgeContext',
    (input: any, ctx: FacultyContext) => facultyKnowledgeService.getKnowledgeContext(input, ctx),
  );
}

// Auto-register upon module load
registerFacultyRagHandlers();
