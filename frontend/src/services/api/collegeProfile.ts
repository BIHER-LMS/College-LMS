import { auth } from '../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error('Not authenticated');
  }
  const token = await auth.currentUser.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

async function parseResponse(response: Response) {
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
    throw new Error(`Server returned error (${response.status}): ${rawText.slice(0, 150) || response.statusText}`);
  }

  return data?.data ?? data;
}

export async function getCollegeProfile() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/college-admin/college/profile`, {
    headers
  });
  
  return parseResponse(response);
}

export async function updateCollegeProfile(profileData: any) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/college-admin/college/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(profileData)
  });
  
  return parseResponse(response);
}
