import { collegeAdminRagVaultService } from '../src/modules/college-admin/collegeAdminRagVault.service';
import { createVaultDocumentSchema } from '../src/schemas/collegeAdminRagVault.schema';

describe('College Admin RAG Vault Service Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Vector Generation & Geometry', () => {
    it('generates a 128-dimensional normalized unit vector', () => {
      const text = 'Mandatory campus dress code and RFID identity card rules.';
      const vec = collegeAdminRagVaultService.generateVector(text, 128);

      expect(vec).toHaveLength(128);

      // Verify unit norm (sum of squares ≈ 1.0)
      const normSquared = vec.reduce((acc, val) => acc + val * val, 0);
      expect(Math.abs(normSquared - 1.0)).toBeLessThan(0.01);
    });

    it('generates deterministic embeddings for identical text', () => {
      const text = 'Students must maintain minimum 75% attendance in each semester.';
      const vec1 = collegeAdminRagVaultService.generateVector(text, 128);
      const vec2 = collegeAdminRagVaultService.generateVector(text, 128);

      expect(vec1).toEqual(vec2);
    });

    it('produces higher similarity for related regulatory texts than unrelated ones', () => {
      const textA = 'Campus dress code formal shirts trousers footwear';
      const textB = 'Student uniform dress code formal attire guidelines';
      const textC = 'Quantum mechanics linear algebra eigenvalue problems';

      const vecA = collegeAdminRagVaultService.generateVector(textA, 128);
      const vecB = collegeAdminRagVaultService.generateVector(textB, 128);
      const vecC = collegeAdminRagVaultService.generateVector(textC, 128);

      // Dot product for unit vectors = Cosine similarity
      const simAB = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
      const simAC = vecA.reduce((sum, v, i) => sum + v * vecC[i], 0);

      expect(simAB).toBeGreaterThan(simAC);
    });
  });

  describe('Validation Schema (createVaultDocumentSchema)', () => {
    it('validates correct policy document input', () => {
      const input = {
        title: 'Campus Timings and Late Coming Rules',
        category: 'policy',
        audience: 'ALL',
        content: 'College starts at 8:30 AM and ends at 4:30 PM. Gates close at 8:35 AM.',
        source: 'Office of the Principal',
      };

      const parsed = createVaultDocumentSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });

    it('validates dress code category', () => {
      const input = {
        title: 'Institutional Dress Code',
        category: 'dress_code',
        audience: 'STUDENT',
        content: 'Formal wear required on all working days. Lab coats in science labs.',
      };

      const parsed = createVaultDocumentSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid category with descriptive error', () => {
      const input = {
        title: 'Invalid Category Policy',
        category: 'random_category',
        audience: 'ALL',
        content: 'Testing invalid categories.',
      };

      const parsed = createVaultDocumentSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });

    it('rejects content that is too short', () => {
      const input = {
        title: 'Short',
        category: 'policy',
        audience: 'ALL',
        content: 'Tiny',
      };

      const parsed = createVaultDocumentSchema.safeParse(input);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Upload & Management Workflow Mocking', () => {
    it('uploads a document to Qdrant Cloud when API responds with success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { status: 'acknowledged' } }),
      });
      global.fetch = mockFetch;

      const result = await collegeAdminRagVaultService.uploadDocument(
        'college-test-01',
        'admin-user-01',
        {
          title: 'Campus Mobile Device Directives',
          category: 'discipline',
          audience: 'STUDENT',
          content: 'Mobile devices must remain in silent mode inside lecture halls.',
          source: 'IT Board',
        },
      );

      expect(result).toBeDefined();
      expect(result.collegeId).toBe('college-test-01');
      expect(result.title).toBe('Campus Mobile Device Directives');
      expect(result.category).toBe('discipline');
      expect(result.collectionTargets).toContain('student_knowledge_base');
    });

    it('lists documents for a college with multi-tenant isolation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            points: [
              {
                id: 'point-123',
                payload: {
                  document_id: 'doc-001',
                  title: 'Dress Code Regulation',
                  category: 'dress_code',
                  audience: 'ALL',
                  snippet: 'Formal shirts and shoes required.',
                  content: 'Formal shirts and shoes required across campus.',
                  college_id: 'college-test-01',
                  source: 'Student Welfare',
                  created_at: '2026-10-11T10:00:00.000Z',
                  updated_at: '2026-10-11T10:00:00.000Z',
                },
              },
            ],
          },
        }),
      });
      global.fetch = mockFetch;

      const docs = await collegeAdminRagVaultService.listDocuments('college-test-01');
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].title).toBe('Dress Code Regulation');
      expect(docs[0].category).toBe('dress_code');
    });
  });
});
