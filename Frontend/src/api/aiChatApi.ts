import apiClient from '../services/apiClient';

export interface AIChatRequest {
  question: string;
  context: string;
}

export interface AIChatResponse {
  answer: string;
}

export const aiChatApi = {
  ask: async (request: AIChatRequest): Promise<AIChatResponse> => {
    try {
      const response = await apiClient.post<any>('/api/ai-chat/ask', request);
      // Backend returns string or object with answer
      return {
        answer: typeof response === 'string' ? response : (response.answer || response.data || JSON.stringify(response))
      };
    } catch (error) {
      console.error('Error in AI Chat API:', error);
      throw error;
    }
  }
};
