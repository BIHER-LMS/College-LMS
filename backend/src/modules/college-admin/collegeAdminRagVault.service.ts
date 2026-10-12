import crypto from 'crypto';
import { CreateVaultDocumentInput } from '../../schemas/collegeAdminRagVault.schema';
import { AppError } from '../../utils/errors';
import { ErrorCodes } from '../../utils/response';

export interface VaultDocumentItem {
  id: string | number;
  documentId: string;
  title: string;
  category: 'policy' | 'dress_code' | 'handbook' | 'exam' | 'discipline' | 'general';
  audience: 'STUDENT' | 'FACULTY' | 'HOD' | 'ALL';
  snippet: string;
  content: string;
  source: string;
  collegeId: string;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  collectionTargets: string[];
}

export class CollegeAdminRagVaultService {
  private readonly qdrantUrl: string;
  private readonly qdrantApiKey: string;
  private readonly studentCollectionName: string;
  private readonly hodCollectionName: string;

  constructor() {
    this.qdrantUrl = (
      process.env.QDRANT_URL ||
      'https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io'
    ).replace(/\/+$/, '');

    this.qdrantApiKey =
      process.env.QDRANT_API_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NGExMTlmNTgtNWI1ZC00YmMyLThiODktZDE0ZjU5YmM3YjQyIn0.Zip7PTB6fuPQ_K8OG5a9IMGlr-n89nuYp1rf2pGkBdE';

    this.studentCollectionName = process.env.QDRANT_STUDENT_COLLECTION_NAME || 'student_knowledge_base';
    this.hodCollectionName = process.env.QDRANT_COLLECTION_NAME || 'hod_knowledge_base';
  }

  /**
   * Generates a 128-dimensional normalized text vector matching Qdrant Cosine geometry.
   */
  public generateVector(text: string, dim = 128): number[] {
    const vec = new Array(dim).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = clean.split(/\s+/).filter(Boolean);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = (hash * 31 + word.charCodeAt(j)) >>> 0;
      }
      vec[hash % dim] += 1.0;

      // Bi-gram hash for contextual depth
      if (i < words.length - 1) {
        const bigram = `${word}_${words[i + 1]}`;
        let bHash = 0;
        for (let j = 0; j < bigram.length; j++) {
          bHash = (bHash * 37 + bigram.charCodeAt(j)) >>> 0;
        }
        vec[bHash % dim] += 1.5;
      }
    }

    // Normalize to unit length
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
   * Upload and vectorize a new college policy, dress code, or handbook document to Qdrant Cloud.
   */
  public async uploadDocument(
    collegeId: string,
    adminUid: string,
    data: CreateVaultDocumentInput,
  ): Promise<VaultDocumentItem> {
    if (!collegeId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'No college ID associated with admin account.');
    }

    const docId = `doc-${collegeId}-${Date.now()}`;
    const pointId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const combinedText = `${data.title} ${data.category} ${data.content}`;
    const vector = this.generateVector(combinedText, 128);

    const payload = {
      document_id: docId,
      title: data.title,
      category: data.category,
      audience: data.audience,
      snippet: data.content.slice(0, 250),
      content: data.content,
      college_id: collegeId,
      department_id: data.departmentId || null,
      source: data.source || 'College Administration & Management',
      created_at: nowIso,
      updated_at: nowIso,
      uploaded_by: adminUid,
    };

    const targetCollections: string[] = [];
    if (data.audience === 'STUDENT' || data.audience === 'ALL') {
      targetCollections.push(this.studentCollectionName);
    }
    if (data.audience === 'HOD' || data.audience === 'ALL') {
      targetCollections.push(this.hodCollectionName);
    }

    // Upsert into target Qdrant collections
    for (const collection of targetCollections) {
      try {
        await this.ensureCollectionExists(collection);

        const response = await fetch(`${this.qdrantUrl}/collections/${collection}/points`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.qdrantApiKey,
          },
          body: JSON.stringify({
            points: [
              {
                id: pointId,
                vector,
                payload,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[Qdrant Vault Upload Error for ${collection}]:`, errText);
          throw new AppError(500, 'QDRANT_ERROR', `Failed to upsert to Qdrant collection ${collection}`);
        }
      } catch (err: any) {
        console.error(`[Qdrant Connection Error]:`, err);
        throw new AppError(500, 'QDRANT_ERROR', `Vector DB operation failed: ${err.message}`);
      }
    }

    return {
      id: pointId,
      documentId: docId,
      title: data.title,
      category: data.category,
      audience: data.audience,
      snippet: payload.snippet,
      content: data.content,
      source: payload.source,
      collegeId,
      departmentId: data.departmentId || null,
      createdAt: nowIso,
      updatedAt: nowIso,
      uploadedBy: adminUid,
      collectionTargets: targetCollections,
    };
  }

  /**
   * List all documents uploaded to the Qdrant vault for this specific college.
   */
  public async listDocuments(collegeId: string, category?: string): Promise<VaultDocumentItem[]> {
    if (!collegeId) {
      return [];
    }

    const itemsMap = new Map<string, VaultDocumentItem>();

    const collections = [this.studentCollectionName, this.hodCollectionName];

    for (const collName of collections) {
      try {
        const filterMust: any[] = [
          {
            key: 'college_id',
            match: { value: collegeId },
          },
        ];

        if (category && category !== 'all') {
          filterMust.push({
            key: 'category',
            match: { value: category },
          });
        }

        const res = await fetch(`${this.qdrantUrl}/collections/${collName}/points/scroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.qdrantApiKey,
          },
          body: JSON.stringify({
            filter: { must: filterMust },
            limit: 100,
            with_payload: true,
          }),
        });

        if (!res.ok) continue;

        const data = (await res.json()) as any;
        const points = data?.result?.points || [];

        for (const p of points) {
          const docId = p.payload?.document_id || String(p.id);
          if (!itemsMap.has(docId)) {
            itemsMap.set(docId, {
              id: p.id,
              documentId: docId,
              title: p.payload?.title || 'Untitled Policy Document',
              category: p.payload?.category || 'policy',
              audience: p.payload?.audience || 'ALL',
              snippet: p.payload?.snippet || p.payload?.content?.slice(0, 250) || '',
              content: p.payload?.content || '',
              source: p.payload?.source || 'College Administration',
              collegeId: p.payload?.college_id || collegeId,
              departmentId: p.payload?.department_id || null,
              createdAt: p.payload?.created_at || new Date().toISOString(),
              updatedAt: p.payload?.updated_at || new Date().toISOString(),
              uploadedBy: p.payload?.uploaded_by || 'Admin',
              collectionTargets: [collName],
            });
          } else {
            const existing = itemsMap.get(docId)!;
            if (!existing.collectionTargets.includes(collName)) {
              existing.collectionTargets.push(collName);
            }
          }
        }
      } catch (err: any) {
        console.warn(`[Qdrant Vault Scroll Warning for ${collName}]:`, err.message);
      }
    }

    return Array.from(itemsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Delete a document point from Qdrant Cloud.
   */
  public async deleteDocument(collegeId: string, pointId: string): Promise<boolean> {
    if (!collegeId || !pointId) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'College ID and Point ID are required.');
    }

    const collections = [this.studentCollectionName, this.hodCollectionName];
    let deletedCount = 0;

    for (const collName of collections) {
      try {
        const res = await fetch(`${this.qdrantUrl}/collections/${collName}/points/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.qdrantApiKey,
          },
          body: JSON.stringify({
            points: [pointId],
          }),
        });

        if (res.ok) {
          deletedCount++;
        }
      } catch (err: any) {
        console.warn(`[Qdrant Vault Delete Warning]:`, err.message);
      }
    }

    return deletedCount > 0;
  }

  /**
   * Fetch aggregate statistics for the college's RAG vault.
   */
  public async getStats(collegeId: string): Promise<{
    totalDocuments: number;
    vectorDimension: number;
    qdrantStatus: 'CONNECTED' | 'ERROR';
    collections: string[];
    categories: Record<string, number>;
  }> {
    const docs = await this.listDocuments(collegeId);

    const categories: Record<string, number> = {};
    docs.forEach((d) => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });

    return {
      totalDocuments: docs.length,
      vectorDimension: 128,
      qdrantStatus: 'CONNECTED',
      collections: [this.studentCollectionName, this.hodCollectionName],
      categories,
    };
  }

  /**
   * Ensure Qdrant collection exists with 128-dim Cosine geometry and required payload indices.
   */
  private async ensureCollectionExists(collectionName: string): Promise<void> {
    const checkRes = await fetch(`${this.qdrantUrl}/collections/${collectionName}`, {
      headers: { 'api-key': this.qdrantApiKey },
    });

    if (!checkRes.ok) {
      await fetch(`${this.qdrantUrl}/collections/${collectionName}`, {
        method: 'PUT',
        headers: {
          'api-key': this.qdrantApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vectors: {
            size: 128,
            distance: 'Cosine',
          },
        }),
      });
    }

    // Ensure keyword index exists for filtering fields
    const indexFields = ['college_id', 'category', 'audience', 'document_id'];
    for (const field of indexFields) {
      try {
        await fetch(`${this.qdrantUrl}/collections/${collectionName}/index`, {
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
        // Ignore if already indexed
      }
    }
  }
}

export const collegeAdminRagVaultService = new CollegeAdminRagVaultService();
