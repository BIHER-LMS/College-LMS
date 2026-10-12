import { StudentContext } from '../student.types';
import { studentToolRegistry } from '../ai/toolRegistry';

export interface StudentKnowledgeItem {
  documentId: string;
  title: string;
  category: 'policy' | 'regulation' | 'exam' | 'handbook' | 'general' | 'dress_code' | 'discipline';
  snippet: string;
  content?: string;
  score?: number;
  source?: string;
  audience?: 'STUDENT' | 'ALL';
  collegeId?: string | null;
}

export interface StudentKnowledgeSearchResult {
  query: string;
  category: string;
  results: Array<{
    documentId: string;
    title: string;
    category: string;
    snippet: string;
    score: number;
    source?: string;
  }>;
  totalMatches: number;
  retrievalSource: 'qdrant' | 'local_corpus';
}

export interface StudentKnowledgeContextResult {
  documentId: string;
  title: string;
  category: string;
  content: string;
  section?: string;
  retrievalSource: 'qdrant' | 'local_corpus';
}

/**
 * Authoritative Student Knowledge Base Corpus (High-Fidelity Offline / Grounding Baseline)
 */
export const DEFAULT_STUDENT_KNOWLEDGE_CORPUS: StudentKnowledgeItem[] = [
  {
    documentId: 'doc-student-att-policy',
    title: 'Attendance Requirements & Condonation Guidelines (Clause 4.2)',
    category: 'policy',
    snippet:
      'Students must maintain minimum 75% attendance in each semester course. Attendance between 65% and 74% may be condoned on genuine medical grounds upon submission of verified medical documentation and payment of prescribed condonation fee within 7 working days. Students below 65% are strictly detained and must repeat the semester course.',
    content: `### Institutional Attendance & Condonation Regulations (Academic Regulations Clause 4.2)

1. **Mandatory Attendance Rule:** Every candidate must secure a minimum aggregate attendance of 75% across all courses in a semester to be eligible for the semester-end examinations (SEE).
2. **Medical Condonation (65% - 74%):**
   - The Head of Institution may grant condonation of shortage of attendance between 65% and 74% on medical grounds or approved institutional deputation.
   - Genuine medical certificates issued by a registered medical practitioner must be submitted to the Class Incharge within 7 working days of absence.
   - Payment of the prescribed condonation fee per course applies.
3. **Detention (<65%):** Candidates securing less than 65% overall attendance shall NOT be permitted to write the end-semester examinations under any circumstances and are termed 'Detained for Want of Attendance'.
4. **On-Duty (OD) Leave:** Permitted up to 10% for verified participation in university sports, NCC, NSS, and approved academic hackathons.`,
    audience: 'ALL',
    source: 'Academic Regulations Bylaws Clause 4.2',
  },
  {
    documentId: 'doc-student-exam-evaluation',
    title: 'Continuous Internal Assessment (CIA) & Semester End Exam (SEE) Regulations',
    category: 'exam',
    snippet:
      'Assessment comprises 40% Continuous Internal Assessment (CIA) and 60% Semester End Examination (SEE). Passing minimum is 45% in SEE (27/60) and 50% overall aggregate (50/100) in each theory course.',
    content: `### Examination & Evaluation Scheme Framework

1. **Continuous Internal Assessment (CIA - 40 Marks):**
   - Internal Assessment Tests (IAT 1 & IAT 2): 20 marks.
   - Academic Assignments & Quizzes: 10 marks.
   - Attendance & Seminar Participation: 10 marks.
2. **Semester End Examination (SEE - 60 Marks):**
   - Comprehensive university written examination of 3 hours duration.
3. **Passing Minimum:**
   - A student must score a minimum of 45% in the SEE (27 out of 60 marks).
   - An overall aggregate of 50% (50 out of 100 marks combining CIA + SEE) is mandatory to earn course credits.
4. **Revaluation & Script Review:**
   - Applications for photocopy of evaluated answer scripts must be submitted within 5 days of results announcement.
   - Challenge revaluation applications are accepted within 10 days upon payment of prescribed fee.`,
    audience: 'ALL',
    source: 'University Examination Manual Chapter 5',
  },
  {
    documentId: 'doc-student-cbcs-grading',
    title: 'Choice Based Credit System (CBCS) & 10-Point Grading Scale',
    category: 'regulation',
    snippet:
      'B.Tech degrees require completion of 160 prescribed credits. Grading uses a 10-point UGC scale (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, U: 0 Reappear). Minimum CGPA for degree award is 5.0.',
    content: `### Choice Based Credit System (CBCS) & Degree Classification

1. **Total Credit Requirements:**
   - Regular 4-Year B.Tech Program: 160 credits.
   - Lateral Entry B.Tech Program: 120 credits.
2. **Letter Grades & Grade Points:**
   - **O (Outstanding):** 90-100 marks -> Grade Point 10.0
   - **A+ (Excellent):** 80-89 marks -> Grade Point 9.0
   - **A (Very Good):** 70-79 marks -> Grade Point 8.0
   - **B+ (Good):** 60-69 marks -> Grade Point 7.0
   - **B (Above Average):** 55-59 marks -> Grade Point 6.0
   - **C (Pass):** 50-54 marks -> Grade Point 5.0
   - **U (Reappear/Arrear):** < 50 marks -> Grade Point 0.0
3. **Classification of Degree:**
   - **First Class with Distinction:** CGPA >= 8.5 with no standing arrears and completed within 4 years.
   - **First Class:** CGPA >= 6.5 completed within 5 years.
   - **Second Class:** CGPA between 5.0 and 6.49.`,
    audience: 'ALL',
    source: 'CBCS Curriculum Regulation Handbook Clause 7',
  },
  {
    documentId: 'doc-student-grievance-conduct',
    title: 'Student Code of Conduct, Anti-Ragging & Grievance Redressal',
    category: 'handbook',
    snippet:
      'Zero-tolerance policy against ragging in accordance with UGC Regulations. 24x7 National Anti-Ragging Helpline 1800-180-5522. Institutional Internal Complaints Committee (ICC) handles grievances with strict confidentiality.',
    content: `### Student Code of Conduct & Anti-Ragging Directives

1. **Anti-Ragging Compliance:**
   - Ragging in any form (verbal, physical, psychological) is strictly prohibited on campus, hostels, and institutional transport.
   - Punishments include immediate suspension, rustication, and filing of formal police FIR under penal laws.
   - National Anti-Ragging Helpline: 1800-180-5522 (Toll Free).
2. **Grievance Redressal Portal:**
   - Students may submit academic, infrastructural, or hostel grievances through the LMS Student Portal.
   - All grievances are acknowledged within 24 hours and reviewed by the Student Welfare Committee within 5 working days.
3. **Campus Decorum:**
   - Wearing institutional identity cards is mandatory inside college premises.
   - Use of mobile phones is strictly prohibited during instructional lecture and lab sessions.`,
    audience: 'STUDENT',
    source: 'Student Welfare & Discipline Handbook Section 2',
  },
  {
    documentId: 'doc-student-fees-scholarships',
    title: 'Tuition Fee Deadlines, Arrears, & Merit Scholarships',
    category: 'policy',
    snippet:
      'Semester tuition fee must be cleared before course registration deadline. Merit scholarships available for students securing semester GPA >= 8.75 with zero disciplinary records.',
    content: `### Financial Guidelines & Student Scholarships

1. **Tuition Fee Deadlines:**
   - Odd Semester fee: Payable on or before July 15.
   - Even Semester fee: Payable on or before December 15.
   - Late fee fine of ₹100 per day applies after the grace period.
2. **Institutional Merit Scholarships:**
   - Top 5% students in each branch securing SGPA >= 9.0 receive a 50% tuition waiver.
   - Students securing SGPA between 8.75 and 8.99 receive a 25% tuition waiver.
3. **Government Post-Matric Scholarships:**
   - Eligible SC/ST/OBC/First Graduate candidates must submit digital certificates through the college scholarship desk before August 30.`,
    audience: 'STUDENT',
    source: 'Institutional Finance & Scholarship Office Notice 2025-26',
  },
  {
    documentId: 'doc-student-dress-code',
    title: 'Student & Faculty Campus Dress Code Directives',
    category: 'dress_code',
    snippet:
      'Students and faculty must strictly adhere to formal attire on campus during working hours. For students: formal shirts, trousers, and neat footwear. For faculty: formal wear (female faculty: formal saree). Casual wear, round-neck t-shirts, and improper footwear are strictly prohibited.',
    content: `### Institutional Campus Dress Code & Attire Directives

1. **Student Dress Code:**
   - All students are required to wear formal attire during college working hours, laboratory sessions, and institutional examinations.
   - Male students: Formal shirts neatly tucked into trousers with formal leather/canvas shoes.
   - Female students: Formal salwar kameez with dupatta or formal trousers with collared shirts.
   - Round-neck graphic T-shirts, ripped jeans, shorts, and flip-flops/sliders are strictly prohibited inside academic blocks.
2. **Faculty & Staff Attire:**
   - Faculty members must maintain exemplary professional standards.
   - Male faculty: Full-sleeve formal shirts and formal trousers with necktie (where designated).
   - Female faculty: Formal sarees as per university decorum.
3. **ID Cards:**
   - Identity cards with university lanyards must be visibly worn at all times while on campus premises.`,
    audience: 'ALL',
    source: 'Dean of Student Affairs & Campus Discipline Committee',
  },
];

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'for', 'us', 'our', 'are', 'a', 'an', 'to', 'in', 'on', 'of',
  'do', 'does', 'can', 'tell', 'me', 'about', 'and', 'with', 'from', 'have', 'any',
  'my', 'we', 'how', 'when', 'where', 'why', 'who', 'this', 'that', 'there',
]);

export class StudentRagToolService {
  private readonly qdrantUrl: string;
  private readonly qdrantApiKey: string;
  private readonly qdrantCollectionName: string;
  private readonly groqApiKey: string;
  private readonly groqModel: string;

  constructor() {
    this.qdrantUrl = (process.env.QDRANT_URL || 'https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io').replace(/\/+$/, '');
    this.qdrantApiKey = process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NGExMTlmNTgtNWI1ZC00YmMyLThiODktZDE0ZjU5YmM3YjQyIn0.Zip7PTB6fuPQ_K8OG5a9IMGlr-n89nuYp1rf2pGkBdE';
    this.qdrantCollectionName = process.env.QDRANT_STUDENT_COLLECTION_NAME || 'student_knowledge_base';
    this.groqApiKey = process.env.GROQ_API_KEY || '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';
    this.groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  }

  /**
   * Generates a 128-dimensional normalized pseudo-dense vector matching Qdrant collection geometry.
   */
  public generateQueryVector(text: string, dim = 128): number[] {
    const vec = new Array(dim).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const allWords = clean.split(/\s+/).filter(Boolean);
    const meaningfulWords = allWords.filter((w) => !STOP_WORDS.has(w));
    const words = meaningfulWords.length > 0 ? meaningfulWords : allWords;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j)) >>> 0;
      }
      vec[hash % dim] += 1.0;

      // Bi-gram hash for semantic context
      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        let bHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          bHash = (bHash * 37 + bigram.charCodeAt(j)) >>> 0;
        }
        vec[bHash % dim] += 1.5;
      }
    }

    // L2 Normalization for Cosine similarity
    let norm = 0;
    for (let i = 0; i < dim; i++) {
      norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < dim; i++) {
        vec[i] = Number((vec[i] / norm).toFixed(6));
      }
    }

    return vec;
  }

  /**
   * Tool 13: student.searchKnowledge
   * Searches institutional regulations using Qdrant vector database with local corpus fallback.
   */
  async searchKnowledge(
    args: { query: string; category?: string; limit?: number },
    context: StudentContext,
  ): Promise<StudentKnowledgeSearchResult> {
    const query = args.query.trim();
    const category = args.category || 'general';
    const limit = Math.min(Math.max(args.limit || 5, 1), 20);

    // 1. Attempt live Qdrant search
    let qdrantResults = await this.searchQdrant(query, category, limit, context);
    if ((!qdrantResults || qdrantResults.length === 0) && category && category !== 'general') {
      qdrantResults = await this.searchQdrant(query, undefined, limit, context);
    }

    if (qdrantResults && qdrantResults.length > 0) {
      return {
        query,
        category: category || 'general',
        results: qdrantResults,
        totalMatches: qdrantResults.length,
        retrievalSource: 'qdrant',
      };
    }

    // 2. High-Fidelity Local Regulatory Corpus Fallback
    const localResults = this.searchLocalCorpus(query, category || 'general', limit, context);
    if (localResults && localResults.length > 0) {
      return {
        query,
        category: category || 'general',
        results: localResults,
        totalMatches: localResults.length,
        retrievalSource: 'local_corpus',
      };
    }

    // Return clean empty result if no matching documents exist in Qdrant or local corpus
    return {
      query,
      category: category || 'general',
      results: [],
      totalMatches: 0,
      retrievalSource: 'qdrant',
    };
  }

  /**
   * Tool 14: student.getKnowledgeContext
   * Retrieves full document text or section for an institutional policy.
   */
  async getKnowledgeContext(
    args: { documentId: string; section?: string },
    context: StudentContext,
  ): Promise<StudentKnowledgeContextResult> {
    const docId = args.documentId.trim();

    // 1. Check local corpus first for immediate precision
    const localMatch = DEFAULT_STUDENT_KNOWLEDGE_CORPUS.find(
      (doc) => doc.documentId.toLowerCase() === docId.toLowerCase(),
    );

    if (localMatch) {
      // Validate tenant / audience boundary
      if (localMatch.collegeId && localMatch.collegeId !== context.collegeId) {
        return {
          documentId: docId,
          title: 'Access Restricted',
          category: localMatch.category,
          content: 'This document belongs to another affiliated college and is restricted.',
          retrievalSource: 'local_corpus',
        };
      }

      return {
        documentId: localMatch.documentId,
        title: localMatch.title,
        category: localMatch.category,
        content: localMatch.content || localMatch.snippet,
        section: args.section,
        retrievalSource: 'local_corpus',
      };
    }

    // 2. Search Qdrant by documentId if not in static array
    const qdrantDoc = await this.getDocFromQdrant(docId, context);
    if (qdrantDoc) {
      return qdrantDoc;
    }

    // 3. Fallback: Friendly not found state (Never fabricate)
    return {
      documentId: docId,
      title: 'Institutional Document Not Found',
      category: 'general',
      content: `No institutional document matching ID '${docId}' was found in the student knowledge registry.`,
      retrievalSource: 'local_corpus',
    };
  }

  /**
   * Queries Qdrant Cloud collection with Cosine similarity and tenant filtering.
   */
  private async searchQdrant(
    query: string,
    category: string | undefined,
    limit: number,
    context: StudentContext,
  ): Promise<Array<any> | null> {
    if (!this.qdrantUrl || !this.qdrantApiKey) {
      return null;
    }

    const collectionsToTry = [this.qdrantCollectionName, 'hod_knowledge_base'];

    for (const collName of collectionsToTry) {
      try {
        const queryVector = this.generateQueryVector(query);

        // Student-safe filter: match authenticated college and allowed categories
        const filterMust: any[] = [];
        if (category && category !== 'general') {
          filterMust.push({ key: 'category', match: { value: category } });
        }

        const filterPayload: any = {
          must: filterMust,
          must_not: [
            { key: 'audience', match: { value: 'HOD_ONLY' } },
            { key: 'audience', match: { value: 'FACULTY_ONLY' } },
          ],
        };

        if (context.collegeId) {
          filterPayload.should = [
            { key: 'college_id', match: { value: context.collegeId } },
            { is_empty: { key: 'college_id' } },
            { is_null: { key: 'college_id' } },
          ];
        }

        const response = await fetch(`${this.qdrantUrl}/collections/${collName}/points/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.qdrantApiKey,
          },
          body: JSON.stringify({
            vector: queryVector,
            filter: filterPayload,
            limit,
            with_payload: true,
          }),
        });

        if (!response.ok) {
          continue;
        }

        const data = (await response.json()) as any;
        if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
          continue;
        }

        // Filter out cross-tenant documents and low relevance noise
        const verifiedPoints = data.result.filter((p: any) => {
          const minScore = 0.18;
          if (p.score != null && p.score < minScore) return false;
          const colId = p.payload?.college_id;
          if (colId && colId !== context.collegeId) return false;
          const aud = p.payload?.audience;
          if (aud === 'HOD_ONLY' || aud === 'FACULTY_ONLY') return false;
          return true;
        });

        if (verifiedPoints.length === 0) continue;

        return verifiedPoints.map((point: any) => ({
          documentId: point.payload?.document_id || String(point.id),
          title: point.payload?.title || 'Academic Policy Document',
          category: point.payload?.category || category || 'policy',
          snippet: point.payload?.snippet || point.payload?.content?.slice(0, 300) || '',
          content: point.payload?.content || point.payload?.snippet || '',
          score: Math.min(
            Math.max(
              point.score != null
                ? Math.min(Math.round(point.score * 2.5 * 100) / 100, 0.99)
                : 0.85,
              0.1,
            ),
            0.99,
          ),
          source: point.payload?.source || 'Institutional Handbook',
        }));
      } catch (err: any) {
        // Continue to fallback
      }
    }

    return null;
  }

  /**
   * Retrieves specific document from Qdrant by document_id payload key across all relevant collections.
   */
  private async getDocFromQdrant(
    documentId: string,
    context: StudentContext,
  ): Promise<StudentKnowledgeContextResult | null> {
    if (!this.qdrantUrl || !this.qdrantApiKey) return null;
    const collections = [this.qdrantCollectionName, 'hod_knowledge_base'];

    for (const collName of collections) {
      try {
        const response = await fetch(`${this.qdrantUrl}/collections/${collName}/points/scroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.qdrantApiKey,
          },
          body: JSON.stringify({
            filter: {
              must: [{ key: 'document_id', match: { value: documentId } }],
            },
            limit: 1,
            with_payload: true,
          }),
        });

        if (!response.ok) continue;
        const data = (await response.json()) as any;
        const point = data?.result?.points?.[0];
        if (!point) continue;

        const pCol = point.payload?.college_id;
        if (pCol && pCol !== context.collegeId) continue;

        return {
          documentId: point.payload?.document_id || String(point.id),
          title: point.payload?.title || 'Academic Policy Document',
          category: point.payload?.category || 'policy',
          content: point.payload?.content || point.payload?.snippet || '',
          retrievalSource: 'qdrant',
        };
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Semantic and keyword search across local high-fidelity student corpus.
   */
  private searchLocalCorpus(
    query: string,
    category: string,
    limit: number,
    context: StudentContext,
  ): Array<any> {
    const qLower = query.toLowerCase();
    const allTokens = qLower.split(/\s+/).filter((t) => t.length > 2);
    const meaningfulTokens = allTokens.filter((t) => !STOP_WORDS.has(t));
    const queryTokens = meaningfulTokens.length > 0 ? meaningfulTokens : allTokens;

    const scored = DEFAULT_STUDENT_KNOWLEDGE_CORPUS.filter((item) => {
      // Tenant filtering
      if (item.collegeId && item.collegeId !== context.collegeId) return false;
      // Category filtering
      if (category && category !== 'general' && item.category !== category) return false;
      return true;
    }).map((item) => {
      const textToSearch = `${item.title} ${item.snippet} ${item.content || ''}`.toLowerCase();
      let matchCount = 0;

      queryTokens.forEach((tok) => {
        if (textToSearch.includes(tok)) matchCount += 1;
      });

      // Boost for direct phrase match
      if (textToSearch.includes(qLower)) matchCount += 3;

      const score = queryTokens.length > 0 ? Math.min(Number((0.6 + (matchCount / (queryTokens.length + 3)) * 0.35).toFixed(2)), 0.98) : 0.75;
      return { item, matchCount, score };
    }).filter(({ matchCount }) => matchCount > 0);

    scored.sort((a, b) => b.matchCount - a.matchCount || b.score - a.score);

    return scored.slice(0, limit).map(({ item, score }) => ({
      documentId: item.documentId,
      title: item.title,
      category: item.category,
      snippet: item.snippet,
      content: item.content || item.snippet,
      score,
      source: item.source,
    }));
  }

  /**
   * Registers Tools 13 & 14 in studentToolRegistry.
   */
  public registerAllRagTools(): void {
    // 13. student.searchKnowledge
    studentToolRegistry.registerTool({
      name: 'student.searchKnowledge',
      category: 'rag',
      description: "Search institutional academic regulations, exam bylaws, attendance condonation, and student policies.",
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'The semantic question or keywords to search in institutional knowledge.',
          required: true,
        },
        {
          name: 'category',
          type: 'string',
          description: 'Category filter: policy, regulation, exam, handbook, general, dress_code, or discipline.',
          required: false,
          enum: ['policy', 'regulation', 'exam', 'handbook', 'general', 'dress_code', 'discipline'],
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Maximum number of relevant knowledge passages to retrieve (1-20).',
          required: false,
          default: 5,
        },
      ],
      handler: async (args, ctx) => this.searchKnowledge(args, ctx),
    });

    // 14. student.getKnowledgeContext
    studentToolRegistry.registerTool({
      name: 'student.getKnowledgeContext',
      category: 'rag',
      description: "Retrieve full document text or specific section for a referenced institutional guideline.",
      parameters: [
        {
          name: 'documentId',
          type: 'string',
          description: 'The unique ID of the institutional guideline or handbook document.',
          required: true,
        },
        {
          name: 'section',
          type: 'string',
          description: 'Optional specific section or clause identifier.',
          required: false,
        },
      ],
      handler: async (args, ctx) => this.getKnowledgeContext(args, ctx),
    });

    // Ensure payload index asynchronously on startup
    this.ensureQdrantIndices().catch(() => {});
  }

  private async ensureQdrantIndices(): Promise<void> {
    if (!this.qdrantUrl || !this.qdrantApiKey) return;
    const collections = [this.qdrantCollectionName, 'hod_knowledge_base'];
    const fields = ['college_id', 'category', 'audience', 'document_id'];
    for (const coll of collections) {
      for (const field of fields) {
        try {
          await fetch(`${this.qdrantUrl}/collections/${coll}/index`, {
            method: 'PUT',
            headers: {
              'api-key': this.qdrantApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              field_name: field,
              field_schema: 'keyword',
            }),
          });
        } catch {
          // ignore
        }
      }
    }
  }
}

export const studentRagToolService = new StudentRagToolService();
// Automatically wire the 2 RAG tools into the registry in non-test runtime
if (process.env.NODE_ENV !== 'test') {
  studentRagToolService.registerAllRagTools();
}
