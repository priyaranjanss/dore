import { Chat } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}: SidebarProps) => {
  const { user, logout } = useAuth();

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await api.chats.delete(chatId);
      onDeleteChat(chatId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="sidebar-logo-text">Dore</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>

        <div className="sidebar-chats">
          {chats.length === 0 ? (
            <p className="sidebar-empty">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`sidebar-chat-item ${activeChatId === chat._id ? 'sidebar-chat-item--active' : ''}`}
                onClick={() => { onSelectChat(chat._id); onClose(); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sidebar-chat-icon">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="sidebar-chat-title">{chat.title}</span>
                <button
                  className="sidebar-chat-delete"
                  onClick={(e) => handleDelete(e, chat._id)}
                  title="Delete chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span className="sidebar-user-name">{user?.name}</span>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </aside>
    </>
  );
};
