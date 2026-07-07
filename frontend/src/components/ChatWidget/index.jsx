import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const greeting = { role: 'assistant', content: '¡Hola! Soy el asistente de NexusGym. ¿En qué puedo ayudarte?', time: new Date() };

const ChatWidget = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/chat/history', { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.messages?.length) {
            const withTime = json.messages.map(m => ({ ...m, time: new Date(m.timestamp) }));
            setMessages(withTime);
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) inputRef.current?.focus();
  }, [isStreaming]);

  const clearChat = async () => {
    try {
      await fetch('http://localhost:4000/api/chat/history', {
        method: 'DELETE',
        credentials: 'include',
      });
      setMessages([greeting]);
    } catch (e) {
      // ignore
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const now = new Date();
    setMessages(prev => [...prev, { role: 'user', content: text, time: now }]);
    setInput('');
    setIsStreaming(true);
    setMessages(prev => [...prev, { role: 'assistant', content: '', time: new Date() }]);

    try {
      const response = await fetch('http://localhost:4000/api/chat/message', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: `Error: ${errData.message || 'sin conexión al asistente'}`, time: new Date() };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const t = line.trim();
          if (!t.startsWith('data: ')) continue;
          const d = t.slice(6);
          if (d === '[DONE]') continue;
          try {
            const p = JSON.parse(d);
            if (p.type === 'thinking') {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: '🔍 Buscando información...', time: new Date() };
                return copy;
              });
            }
            if (p.content) {
              acc += p.content;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: acc, time: new Date() };
                return copy;
              });
            }
          } catch (e) { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: 'Error de conexión. Intentalo de nuevo.', time: new Date() };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const buildWhatsAppUrl = (text) => {
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized
      .split(/(?=📝|📋)/)
      .map(l => l.trim())
      .filter(Boolean)
      .join('\n\n');
    const message = `🚨 *Reporte NexusGym*\n\n${lines}`;
    return `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '+54938113611025'}?text=${encodeURIComponent(message)}`;
  };

  const hasReportPattern = (content) =>
    /(?:Detalle del error|comunicar.*WhatsApp|reportar.*WhatsApp|📝.*🏪)/i.test(content);

  const renderContent = (content) => {
    const cleanContent = content.replace(/https:\/\/wa\.me\/[^\s)]+\)?/g, '').trim();

    if (!hasReportPattern(cleanContent)) {
      return <span className="whitespace-pre-wrap break-words">{cleanContent}</span>;
    }

    return (
      <div>
        <span className="whitespace-pre-wrap break-words">{cleanContent}</span>
        <a href={buildWhatsAppUrl(cleanContent)} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all w-full justify-center">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Reportar por WhatsApp
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/80 shrink-0 border-b border-zinc-700/50">
        <button onClick={() => navigate('/')} className="text-zinc-300 hover:text-white transition-colors p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-base shrink-0">🤖</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Nexi</p>
          <p className="text-[11px] text-zinc-400">en línea</p>
        </div>
        <button
          onClick={clearChat}
          disabled={isStreaming}
          className="text-zinc-400 hover:text-red-400 transition-colors p-1.5 disabled:opacity-30"
          title="Limpiar conversación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${i > 0 && messages[i-1].role === msg.role ? 'mt-0.5' : 'mt-3'}`}>
              <div className={`relative max-w-[80%] sm:max-w-[70%] px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-[18px] rounded-br-[4px]'
                  : 'bg-zinc-800 text-zinc-200 rounded-[18px] rounded-bl-[4px]'
              }`}>
                {msg.role === 'assistant' ? renderContent(msg.content) : <span className="whitespace-pre-wrap break-words">{msg.content}</span>}
                <div className={`flex items-center gap-1 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] ${msg.role === 'user' ? 'text-blue-200' : 'text-zinc-500'}`}>
                    {msg.time ? formatTime(msg.time) : ''}
                  </span>
                  {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse" style={{ borderRadius: '1px' }} />
                  )}
                  {msg.role === 'user' && !isStreaming && (
                    <svg className="w-3.5 h-3.5 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 bg-zinc-800/80 px-3 py-2 border-t border-zinc-700/50">
        <div className="flex items-center gap-2 bg-zinc-700/50 rounded-full px-4 py-1.5">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí un mensaje..."
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none py-1"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="shrink-0 w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 disabled:text-zinc-400 text-white rounded-full transition-all text-lg"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
