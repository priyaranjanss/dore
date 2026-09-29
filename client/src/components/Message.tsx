import { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';

interface MessageProps {
  message: Message;
}

export const MessageComponent = ({ message }: MessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      <div className="message-inner">
        <div className="message-content">
          <div className="message-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeHighlight, rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};
