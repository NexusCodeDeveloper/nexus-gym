import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWidget from '../../components/chatWidget/ChatWidget.jsx';

const ChatPage = () => {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/chat/status', { withCredentials: true });
        setEnabled(res.data.enabled);
      } catch {
        setEnabled(true);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-zinc-900 items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="h-screen flex flex-col bg-zinc-900 items-center justify-center px-6">
        <div className="bg-zinc-800 rounded-3xl p-8 max-w-sm text-center">
          <svg className="w-12 h-12 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">Chat deshabilitado</h2>
          <p className="text-sm text-zinc-500">El chatbot fue deshabilitado para tu gimnasio. Consultá con tu administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-900">
      <ChatWidget />
    </div>
  );
};

export default ChatPage;
