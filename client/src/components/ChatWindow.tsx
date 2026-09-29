import { useState, useCallback, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { api } from '../services/api';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  chatId: string | null;
  onChatCreated: (chatId: string) => void;
}

export const ChatWindow = ({ chatId, onChatCreated }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNewChat = useRef(false);

  useEffect(() => {
    if (!isNewChat.current) {
      setMessages([]);
      setLoading(false);
      setSending(false);
    }
  }, [chatId]);

  const loadMessages = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await api.chats.getMessages(id);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to load messages.');
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatId && !isNewChat.current) {
      loadMessages(chatId);
    }
    isNewChat.current = false;
  }, [chatId, loadMessages]);

  const handleSend = async (content: string) => {
    setError(null);
    setSending(true);

    if (!chatId) {
      isNewChat.current = true;
      try {
        const res = await api.chats.create();
        const newChat = await res.json();
        if (!res.ok) throw new Error(newChat.message || 'Unable to create a chat.');
        onChatCreated(newChat._id);
        await sendToChat(newChat._id, content);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unable to create a chat.');
        setSending(false);
      }
      return;
    }

    await sendToChat(chatId, content);
  };

  const sendToChat = async (id: string, content: string) => {
    setSending(true);
    try {
      const userMessage: Message = { _id: '', chatId: id, role: 'user', content, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, userMessage]);

      const res = await api.chats.sendMessage(id, content);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('The response stream was unavailable. Please try again.');

      const decoder = new TextDecoder();
      let fullResponse = '';
      let buffer = '';

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const data = JSON.parse(line.slice(6));
        if (data.error) throw new Error(data.error);
        if (typeof data.chunk === 'string' && data.chunk) {
          fullResponse += data.chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: fullResponse }];
            }
            return [
              ...prev,
              { _id: '', chatId: id, role: 'assistant', content: fullResponse, createdAt: new Date().toISOString() },
            ];
          });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';
        for (const line of lines) processLine(line);
        if (done) {
          if (buffer) processLine(buffer);
          break;
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Unable to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      <MessageList messages={messages} loading={loading} />
      {error && <div className="chat-error" role="alert">{error}</div>}
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
};
