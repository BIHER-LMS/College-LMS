import { auth } from '../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface VaultDocument {
  id: string | number;
  documentId: string;
  title: string;
  category: 'policy' | 'dress_code' | 'handbook' | 'exam' | 'discipline' | 'general';
  audience: 'STUDENT' | 'FACULTY' | 'HOD' | 'ALL';
  snippet: string;
  content: string;
  source: string;
  collegeId: string;
  departmentId?: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  collectionTargets?: string[];
}

export interface CreateVaultDocumentPayload {
  title: string;
  category: 'policy' | 'dress_code' | 'handbook' | 'exam' | 'discipline' | 'general';
  audience: 'STUDENT' | 'FACULTY' | 'HOD' | 'ALL';
  content: string;
  departmentId?: string | null;
  source?: string | null;
}

export interface VaultStats {
  totalDocuments: number;
  vectorDimension: number;
  qdrantStatus: 'CONNECTED' | 'ERROR';
  collections: string[];
  categories: Record<string, number>;
}

async function getAuthHeaders() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error('Not authenticated with Firebase');
  }
  const token = await auth.currentUser.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (data?.error?.message) {
      throw new Error(data.error.message);
    }
    if (data?.message) {
      throw new Error(data.message);
    }
    const rawText = await response.text().catch(() => '');
    throw new Error(`Server error (${response.status}): ${rawText.slice(0, 150) || response.statusText}`);
  }

  return (data?.data ?? data) as T;
}

export async function getVaultStats(): Promise<VaultStats> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/college-admin/rag-vault/stats`, {
    headers,
  });
  return parseResponse<VaultStats>(response);
}

export async function getVaultDocuments(category?: string): Promise<VaultDocument[]> {
  const headers = await getAuthHeaders();
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const response = await fetch(`${API_BASE_URL}/college-admin/rag-vault/documents${query}`, {
    headers,
  });
  return parseResponse<VaultDocument[]>(response);
}

export async function uploadVaultDocument(payload: CreateVaultDocumentPayload): Promise<VaultDocument> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/college-admin/rag-vault/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseResponse<VaultDocument>(response);
}

export async function deleteVaultDocument(pointId: string | number): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/college-admin/rag-vault/documents/${pointId}`, {
    method: 'DELETE',
    headers,
  });
  await parseResponse(response);
}
