
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  sources?: string[];
}
