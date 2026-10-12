export interface ToolExecutionResult {
  toolName: string;
  status: 'success' | 'error';
  args: Record<string, any>;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  durationMs: number;
}

export interface StudentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolsExecuted?: ToolExecutionResult[];
  confidence?: number;
  provider?: 'groq' | 'local';
}

export interface StudentChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  toolChoice?: 'auto' | 'none' | string;
  directToolArgs?: Record<string, any>;
}

export interface StudentChatResponseData {
  reply: string;
  messageId: string;
  toolsExecuted: ToolExecutionResult[];
  confidence: number;
  processingTimeMs: number;
  provider: 'groq' | 'local';
}

export interface CanonicalToolMeta {
  name: string;
  category: 'data' | 'rag';
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    enum?: string[];
  }>;
}
