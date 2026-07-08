import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_PROMPTS = [
  'Mostrame mis rutinas',
  '¿Cómo creo una nueva rutina?',
  '¿Qué ejercicios tengo hoy?',
];

const greeting = { role: 'assistant', content: '¡Hola! Soy Nexi, el asistente de NexusGym. ¿En qué puedo ayudarte?', time: new Date() };

const SkeletonMessage = ({ align }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mt-3`}>
    <div className={`${align === 'right' ? 'w-48' : 'w-64'} h-10 rounded-[18px] bg-zinc-800/60 animate-pulse`} />
  </div>
);

const FeedbackButton = ({ type, active, onClick }) => (
  <button
    onClick={onClick}
    className={`p-1 rounded transition-colors ${
      active ? (type === 'like' ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-600 hover:text-zinc-400'
    }`}
  >
    {type === 'like' ? (
      <svg className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ) : (
      <svg className="w-3.5 h-3.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
      </svg>
    )}
  </button>
);

const ChatWidget = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const accRef = useRef('');

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
      } catch {
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
      setFeedback({});
    } catch {
      // ignore
    }
  };

  const sendMessage = async (textOverride) => {
    const text = (textOverride || input).trim();
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
          copy[copy.length - 1] = { role: 'assistant', content: `**Error:** ${errData.message || 'Sin conexión al asistente'}`, time: new Date() };
          return copy;
        });
        setIsStreaming(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      accRef.current = '';

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
              accRef.current += p.content;
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: accRef.current, time: new Date() };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: '**Error de conexión.** Intentalo de nuevo.', time: new Date() };
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

  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const buildWhatsAppUrl = (text) => {
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized
      .split(/(?=📝|📋)/)
      .map(l => l.trim())
      .filter(Boolean)
      .join('\n\n');
    const message = `🚨 *Reporte NexusGym*\n\n${lines}`;
    return `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '+5493813611025'}?text=${encodeURIComponent(message)}`;
  };

  const hasReportPattern = (content) =>
    /(?:Detalle del error|comunicar.*WhatsApp|reportar.*WhatsApp|📝.*🏪)/i.test(content);

  const renderContent = (content) => {
    if (!content) return null;
    const cleanContent = content.replace(/https:\/\/wa\.me\/[^\s)]+\)?/g, '').trim();

    if (!hasReportPattern(cleanContent)) {
      return (
        <div className="prose prose-invert prose-sm max-w-none [&_p]:leading-relaxed [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:my-0.5 [&_code]:bg-zinc-700 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
      );
    }

    return (
      <div>
        <div className="prose prose-invert prose-sm max-w-none [&_p]:leading-relaxed [&_code]:bg-zinc-700 [&_code]:px-1 [&_code]:rounded">
          <ReactMarkdown>{cleanContent}</ReactMarkdown>
        </div>
        <a href={buildWhatsAppUrl(cleanContent)} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all w-full justify-center">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Reportar por WhatsApp
        </a>
      </div>
    );
  };

  const getDateSeparator = (currentIdx) => {
    if (currentIdx === 0 && messages[0]?.role === 'assistant') return false;
    const current = messages[currentIdx]?.time;
    const prev = messages[currentIdx - 1]?.time;
    if (!current || !prev) return true;
    return current.toDateString() !== prev.toDateString();
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
          <div className="space-y-3 pt-4">
            <SkeletonMessage align="left" />
            <SkeletonMessage align="right" />
            <SkeletonMessage align="left" />
          </div>
        ) : messages.length === 1 && messages[0].role === 'assistant' && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-3xl mb-4">🤖</div>
            <p className="text-zinc-300 text-sm mb-6 max-w-xs">
              Soy Nexi, tu asistente inteligente. Puedo ayudarte con rutinas, ejercicios y más.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-xl transition-colors border border-zinc-700/50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <React.Fragment key={i}>
              {getDateSeparator(i) && (
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-zinc-500 bg-zinc-800/60 px-3 py-1 rounded-full">
                    {formatDateLabel(msg.time)}
                  </span>
                </div>
              )}
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${i > 0 && messages[i - 1].role === msg.role ? 'mt-0.5' : 'mt-3'}`}>
                <div className={`relative max-w-[80%] sm:max-w-[70%] px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-[18px] rounded-br-[4px]'
                    : 'bg-zinc-800 text-zinc-200 rounded-[18px] rounded-bl-[4px]'
                }`}>
                  {msg.role === 'assistant' ? (
                    <>
                      {renderContent(msg.content)}
                      {!isStreaming && msg.content && msg.content !== '🔍 Buscando información...' && (
                        <div className="flex items-center gap-1 mt-2 pt-1 border-t border-zinc-700/50">
                          <FeedbackButton
                            type="like"
                            active={feedback[i] === 'like'}
                            onClick={() => setFeedback(prev => ({ ...prev, [i]: prev[i] === 'like' ? null : 'like' }))}
                          />
                          <FeedbackButton
                            type="dislike"
                            active={feedback[i] === 'dislike'}
                            onClick={() => setFeedback(prev => ({ ...prev, [i]: prev[i] === 'dislike' ? null : 'dislike' }))}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                  )}
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
            </React.Fragment>
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
            inputMode="text"
            enterKeyHint="send"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 outline-none py-1"
          />
          <button
            onClick={() => sendMessage()}
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
