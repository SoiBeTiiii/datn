import baseAxios from './baseAxios';
import Message, { ServerChat } from '../app/interface/chatbot';

interface ChatAiResponse {
  data?: {
    answer?: string;
    time?: string;
  };
}

interface ChatHistoryResponse {
  data?: ServerChat[];
}

export default async function chatbot(message: string): Promise<{ answer: string; time?: string }> {
  try {
    const res = await baseAxios.post<ChatAiResponse>('/chat-ai', { message });
    return {
      answer: res.data?.data?.answer || 'Không có phản hồi.',
      time: res.data?.data?.time
    };
  } catch (err) {
    console.error('Lỗi gửi câu hỏi:', err);
    throw new Error('Không thể kết nối.');
  }
}

export async function fetchChatHistory(): Promise<Message[]> {
  try {
    const res = await baseAxios.get<ChatHistoryResponse>('/chat-ai/history');
    const data: ServerChat[] = res.data?.data || [];

    // Convert sang Message[]
    const messages: Message[] = [];

    data.forEach(item => {
      messages.push({ sender: 'user', text: item.question });
      messages.push({ sender: 'bot', text: item.answer, timeText: item.time });
    });

    return messages;
  } catch (error) {
    console.error('Lỗi lấy lịch sử:', error);
    return [];
  }
}
