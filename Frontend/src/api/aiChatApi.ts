import apiClient from '../services/apiClient';

export interface AIChatRequest {
  question: string;
  context: string;
}

export interface ServiceLink {
  id: string;
  name: string;
  serviceType: string;
  provinceName: string | null;
  rating: number;
  averagePrice: number;
  thumbnailUrl: string;
  url: string;
}

export interface AIChatResponse {
  answer: string;
  serviceLinks?: ServiceLink[];
  blogLinks?: any[];
}

export const aiChatApi = {
  ask: async (request: AIChatRequest): Promise<AIChatResponse> => {
    try {
      const response: any = await apiClient.post<any>('/api/ai-chat/ask', request);
      const raw = typeof response === 'string' ? { answer: response } : response;
      return {
        answer: raw.answer || raw.data || JSON.stringify(raw),
        serviceLinks: raw.serviceLinks ?? [],
        blogLinks: raw.blogLinks ?? [],
      };
    } catch (error) {
      console.error('Error in AI Chat API:', error);
      throw error;
    }
  }
};
