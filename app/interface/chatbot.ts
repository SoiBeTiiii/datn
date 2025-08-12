export default interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;  // local time (chỉ cần khi dùng localStorage)
  timeText?: string;   // thời gian từ server (dùng cho cả user login)
}

export interface ServerChat {
  question: string;
  answer: string;
  time: string;
}