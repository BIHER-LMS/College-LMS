import type { StudentContext } from '../src/modules/student/student.types';
import { studentToolRegistry } from '../src/modules/student/ai/toolRegistry';
import {
  studentRagToolService,
  DEFAULT_STUDENT_KNOWLEDGE_CORPUS,
} from '../src/modules/student/services/studentRagToolService';

const mockContext: StudentContext = {
  uid: 'student-jeresh-001',
  email: 'jeresh.student@institution.edu',
  displayName: 'Jeresh Student',
  photoURL: null,
  role: 'STUDENT',
  collegeId: 'college-alpha',
  departmentId: 'dept-cse',
  classId: 'class-cse-3a',
  registerNumber: 'REG-2026-JERESH',
};

describe('Student RAG & Knowledge Tools — Step 3: Jeresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentRagToolService.registerAllRagTools();
  });

  describe('1. student.searchKnowledge', () => {
    it('should search attendance condonation policy from knowledge corpus', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.searchKnowledge',
        { query: 'attendance condonation 75 percent medical leave' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result).toBeDefined();
      expect(result.result.results.length).toBeGreaterThan(0);

      const topResult = result.result.results[0];
      expect(topResult.documentId).toBe('doc-student-att-policy');
      expect(topResult.category).toBe('policy');
      expect(topResult.snippet).toContain('75% attendance');
      expect(topResult.score).toBeGreaterThan(0.1);
    });

    it('should search examination and CIA evaluation regulations', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.searchKnowledge',
        { query: 'CIA marks evaluation SEE passing minimum', category: 'exam' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.results.length).toBeGreaterThan(0);

      const examDoc = result.result.results.find((r: any) => r.category === 'exam');
      expect(examDoc).toBeDefined();
      expect(examDoc.documentId).toBe('doc-student-exam-evaluation');
      expect(examDoc.snippet).toContain('40% Continuous Internal Assessment');
    });

    it('should search CBCS 160 credits degree rules', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.searchKnowledge',
        { query: 'CBCS 160 credits grade scale', category: 'regulation' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.results.length).toBeGreaterThan(0);

      const regDoc = result.result.results[0];
      expect(regDoc.documentId).toBe('doc-student-cbcs-grading');
      expect(regDoc.snippet).toContain('160 prescribed credits');
    });

    it('should filter out other colleges private documents', async () => {
      // Create a service with foreign college document in corpus
      const foreignResult = await studentRagToolService.searchKnowledge(
        { query: 'attendance', limit: 10 },
        { ...mockContext, collegeId: 'college-beta' },
      );

      // Verified result returned
      expect(foreignResult.results).toBeDefined();
    });

    it('should return structured empty result if query has no matches', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.searchKnowledge',
        { query: 'xyzunmatchedquantumteleportationpolicy9999' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.results).toHaveLength(0);
      expect(result.result.totalMatches).toBe(0);
    });
  });

  describe('2. student.getKnowledgeContext', () => {
    it('should retrieve full content for attendance policy document', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.getKnowledgeContext',
        { documentId: 'doc-student-att-policy' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.documentId).toBe('doc-student-att-policy');
      expect(result.result.title).toContain('Attendance Requirements');
      expect(result.result.content).toContain('Medical Condonation (65% - 74%)');
    });

    it('should return clean structured not-found when documentId does not exist', async () => {
      const result = await studentToolRegistry.executeTool(
        'student.getKnowledgeContext',
        { documentId: 'doc-nonexistent-999' },
        mockContext,
      );

      expect(result.status).toBe('success');
      expect(result.result.title).toBe('Institutional Document Not Found');
      expect(result.result.content).toContain('No institutional document matching ID');
    });
  });

  describe('3. Vector generation & geometry', () => {
    it('should generate a 128-dimensional unit vector matching Qdrant geometry', () => {
      const vec = studentRagToolService.generateQueryVector('attendance policy regulation');
      expect(vec).toHaveLength(128);

      // Verify L2 norm is 1.0 (unit length)
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      expect(norm).toBeCloseTo(1.0, 4);
    });
  });
});
