import { auth } from '../../../config/firebase';
import type {
  HodChatRequest,
  HodChatResponseData,
  ToolMetadata,
  ToolExecutionResult,
  HodToolName,
} from '../types/hodAi.types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

/**
 * Retrieves a verified, fresh Firebase ID token.
 * Never reads auth tokens from localStorage.
 */
async function getAuthToken(): Promise<string> {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authentication required. Please sign in to access HOD AI services.');
  }
  return user.getIdToken();
}

/**
 * Typed HTTP request helper with automatic Firebase Bearer authentication
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({
    success: false,
    message: `Server returned HTTP ${response.status}`,
  }));

  if (!response.ok || json.success === false) {
    const errorMsg =
      json.error?.message ||
      json.message ||
      `Request failed with HTTP status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).code = json.error?.code || (response.status === 403 ? 'FORBIDDEN' : 'API_ERROR');
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}

export const hodAiApi = {
  /**
   * Main HOD Chatbot Endpoint
   * Consumes POST /api/hod/ai/chat
   * Note: Client never passes uid, role, collegeId, or departmentId.
   */
  sendMessage: async (payload: HodChatRequest): Promise<HodChatResponseData> => {
    return request<HodChatResponseData>('/hod/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Canonical HOD Tool Catalog
   * Consumes GET /api/hod/ai/tools
   */
  getTools: async (): Promise<ToolMetadata[]> => {
    return request<ToolMetadata[]>('/hod/ai/tools', {
      method: 'GET',
    });
  },

  /**
   * Controlled Direct Tool Execution
   * Consumes POST /api/hod/ai/tools/execute
   */
  executeTool: async (
    toolName: HodToolName,
    args: Record<string, any> = {},
  ): Promise<ToolExecutionResult> => {
    return request<ToolExecutionResult>('/hod/ai/tools/execute', {
      method: 'POST',
      body: JSON.stringify({
        toolName,
        arguments: args,
      }),
    });
  },
};
