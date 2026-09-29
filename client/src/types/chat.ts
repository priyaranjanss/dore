export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface Chat {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
