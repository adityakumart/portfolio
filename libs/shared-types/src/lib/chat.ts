export interface SaveChatHistoryDto {
  userPrompt: string;
  aiResponse: string;
  modelUsed?: string;
}

export interface SaveChatHistoryResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    userId: string;
    userPrompt: string;
    aiResponse: string;
    modelUsed?: string;
    createdAt: string;
  };
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface IChat {
  id?: string;
  _id?: any;
  userId: string | any;
  title: string;
  createdAt: string | Date;
}

export interface IMessage {
  id?: string;
  _id?: any;
  chatId: string | any;
  role: 'user' | 'model' | 'assistant';
  text: string;
  createdAt: string | Date;
}


