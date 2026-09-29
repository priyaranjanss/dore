import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Chat } from '../types/chat';
import { useMobileSidebar } from '../hooks/useMobileSidebar';
import { useParams, useNavigate } from 'react-router-dom';

export const ChatPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const { chatId: chatIdParam } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, setSidebarOpen: setMobileSidebar } = useMobileSidebar();

  const loadChats = useCallback(async () => {
    try {
      const res = await api.chats.getAll();
      const data = await res.json();
      setChats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) loadChats();
  }, [user, loadChats]);

  const handleChatCreated = (newChatId: string) => {
    navigate(`/conversation/${newChatId}`);
    loadChats();
  };

  const handleNewChat = async () => {
    navigate('/');
    if (isMobile) setMobileSidebar(false);
  };

  const handleDeleteChat = (deletedId: string) => {
    setChats((prev) => prev.filter((c) => c._id !== deletedId));
    if (chatIdParam === deletedId) navigate('/');
  };

  const handleSelectChat = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <Sidebar
        chats={chats}
        activeChatId={chatIdParam || null}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setMobileSidebar(false)}
      />
      <ChatWindow
        chatId={chatIdParam || null}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};
