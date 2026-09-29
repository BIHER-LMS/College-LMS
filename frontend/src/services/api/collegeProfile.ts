import { auth } from '../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export async function getCollegeProfile() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/college-admin/college/profile`, {
    headers
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch college profile');
  }
  
  return data.data;
}

export async function updateCollegeProfile(profileData: any) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/college-admin/college/profile`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(profileData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to update college profile');
  }
  
  return data.data;
}
