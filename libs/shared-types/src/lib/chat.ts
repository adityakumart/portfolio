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
