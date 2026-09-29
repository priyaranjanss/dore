import { useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { MessageComponent } from './Message';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export const MessageList = ({ messages, loading }: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2>How can I help you?</h2>
        <p>Start a conversation by typing a message below.</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg) => (
        <MessageComponent key={msg._id} message={msg} />
      ))}
      {loading && (
        <div className="message message--assistant">
          <div className="message-inner">
            <div className="message-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="message-content">
              <div className="message-role">Dore</div>
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
