import dotenv from 'dotenv';
import path from 'path';
import {
  DEFAULT_STUDENT_KNOWLEDGE_CORPUS,
  StudentRagToolService,
} from '../modules/student/services/studentRagToolService';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const QDRANT_URL = (
  process.env.QDRANT_URL ||
  'https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io'
).replace(/\/+$/, '');

const QDRANT_API_KEY =
  process.env.QDRANT_API_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NGExMTlmNTgtNWI1ZC00YmMyLThiODktZDE0ZjU5YmM3YjQyIn0.Zip7PTB6fuPQ_K8OG5a9IMGlr-n89nuYp1rf2pGkBdE';

const COLLECTION_NAME =
  process.env.QDRANT_STUDENT_COLLECTION_NAME || 'student_knowledge_base';

export async function seedStudentQdrant() {
  console.log(`[Student Qdrant Seeder] Connecting to ${QDRANT_URL}...`);
  console.log(`[Student Qdrant Seeder] Collection: ${COLLECTION_NAME}`);

  const ragService = new StudentRagToolService();

  // 1. Ensure collection exists
  const checkRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: { 'api-key': QDRANT_API_KEY },
  });

  if (!checkRes.ok) {
    console.log(`[Student Qdrant Seeder] Creating collection ${COLLECTION_NAME}...`);
    const createRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'PUT',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: {
          size: 128,
          distance: 'Cosine',
        },
      }),
    });
    console.log(`[Student Qdrant Seeder] Collection created:`, await createRes.json());
  } else {
    console.log(`[Student Qdrant Seeder] Collection ${COLLECTION_NAME} already exists.`);
  }

  // 2. Build points payload
  const points = DEFAULT_STUDENT_KNOWLEDGE_CORPUS.map((doc, idx) => {
    const combined = `${doc.title} ${doc.snippet} ${doc.content || ''}`;
    const vector = ragService.generateQueryVector(combined, 128);

    return {
      id: idx + 100, // IDs 100+ for student docs
      vector,
      payload: {
        document_id: doc.documentId,
        title: doc.title,
        category: doc.category,
        snippet: doc.snippet,
        content: doc.content,
        audience: doc.audience || 'ALL',
        source: doc.source || 'Student Handbook',
        college_id: doc.collegeId || null,
      },
    };
  });

  // 3. Upsert into Qdrant
  console.log(`[Student Qdrant Seeder] Upserting ${points.length} points...`);
  const upsertRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ points }),
  });

  const upsertData = await upsertRes.json();
  console.log(`[Student Qdrant Seeder] Upsert result:`, upsertData);
  console.log(`[Student Qdrant Seeder] Successfully seeded ${points.length} student policy documents into Qdrant!`);
}

if (require.main === module) {
  seedStudentQdrant().catch((err) => {
    console.error(`[Student Qdrant Seeder] Error:`, err);
    process.exit(1);
  });
}
