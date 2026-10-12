import { DEFAULT_HOD_KNOWLEDGE_CORPUS } from '../modules/hod_temp/services/hodRagToolService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const QDRANT_URL = process.env.QDRANT_URL?.replace(/\/+$/, '') || 'https://6d6bd7d5-d85a-4287-ad3d-8b767cb2776c.us-east-1-1.aws.cloud.qdrant.io';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6NGExMTlmNTgtNWI1ZC00YmMyLThiODktZDE0ZjU5YmM3YjQyIn0.Zip7PTB6fuPQ_K8OG5a9IMGlr-n89nuYp1rf2pGkBdE';
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'hod_knowledge_base';

/**
 * Generate a 128-dimensional pseudo-dense semantic hash vector
 * normalized to unit length for Cosine similarity in Qdrant.
 */
function generateTextVector(text: string, dim = 128): number[] {
  const vec = new Array(dim).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 31 + word.charCodeAt(j)) >>> 0;
    }
    const idx = hash % dim;
    vec[idx] += 1.0;

    // Bi-gram hash for context
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let bHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bHash = (bHash * 37 + bigram.charCodeAt(j)) >>> 0;
      }
      vec[bHash % dim] += 1.5;
    }
  }

  // Normalize vector to unit length
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

export async function seedQdrant() {
  console.log(`[Qdrant Seeder] Connecting to ${QDRANT_URL}...`);
  console.log(`[Qdrant Seeder] Collection: ${COLLECTION_NAME}`);

  // 1. Ensure collection exists
  const checkRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: { 'api-key': QDRANT_API_KEY },
  });

  if (!checkRes.ok) {
    console.log(`[Qdrant Seeder] Creating collection ${COLLECTION_NAME}...`);
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
    console.log(`[Qdrant Seeder] Collection created:`, await createRes.json());
  } else {
    console.log(`[Qdrant Seeder] Collection ${COLLECTION_NAME} exists.`);
  }

  // 2. Build points payload from DEFAULT_HOD_KNOWLEDGE_CORPUS
  const points = DEFAULT_HOD_KNOWLEDGE_CORPUS.map((doc, index) => {
    const combinedText = `${doc.title} ${doc.snippet} ${doc.content} ${doc.keywords.join(' ')}`;
    const vector = generateTextVector(combinedText, 128);

    return {
      id: index + 1,
      vector,
      payload: {
        document_id: doc.id,
        title: doc.title,
        category: doc.category,
        snippet: doc.snippet,
        content: doc.content,
        citations: doc.citations,
        source_url: doc.sourceUrl || null,
        keywords: doc.keywords,
        sections: doc.sections || {},
        college_id: doc.collegeId || null,
        department_id: doc.departmentId || null,
        last_updated: doc.lastUpdated,
      },
    };
  });

  // 3. Upsert points into Qdrant
  console.log(`[Qdrant Seeder] Upserting ${points.length} institutional documents into Qdrant...`);
  const upsertRes = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ points }),
  });

  const upsertData = await upsertRes.json();
  console.log(`[Qdrant Seeder] Upsert result:`, upsertData);
  console.log(`[Qdrant Seeder] Successfully seeded ${points.length} documents into Qdrant collection "${COLLECTION_NAME}".`);
}

if (require.main === module) {
  seedQdrant().catch((err) => {
    console.error(`[Qdrant Seeder] Failed:`, err);
    process.exit(1);
  });
}
