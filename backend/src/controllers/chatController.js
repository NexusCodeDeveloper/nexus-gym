import User from '../models/User.js';
import Routine from '../models/Routine.js';
import ChatMemory from '../models/ChatMemory.js';
import buildSystemPrompt from '../config/chatPrompt.js';
import chatTools, { filterToolsByRole } from '../config/chatTools.js';
import { executeTool } from './toolExecutor.js';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const sanitize = (text) => text.replace(/<function=[^>]*>[\s\S]*?<\/function>/g, '');

const streamAndCollect = async (res, groqRes) => {
  const reader = groqRes.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      res.write('data: [DONE]\n\n');
      res.end();
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        res.write('data: [DONE]\n\n');
        continue;
      }
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content: sanitize(content) })}\n\n`);
        }
      } catch (e) {
        continue;
      }
    }
  }

  return fullContent;
};

const MAX_HISTORY = 10;

const loadHistory = async (userId) => {
  const memory = await ChatMemory.findOne({ userId }).lean();
  if (!memory?.messages?.length) return [];
  return memory.messages.slice(-MAX_HISTORY).map(({ role, content }) => ({ role, content }));
};

const saveMessage = async (userId, role, content) => {
  await ChatMemory.findOneAndUpdate(
    { userId },
    { $push: { messages: { role, content, timestamp: new Date() } } },
    { upsert: true }
  );
};

const deleteLastUserMessage = async (userId) => {
  try {
    const memory = await ChatMemory.findOne({ userId });
    if (!memory?.messages?.length) return;
    const idx = [...memory.messages].reverse().findIndex(m => m.role === 'user');
    if (idx === -1) return;
    const realIdx = memory.messages.length - 1 - idx;
    memory.messages.splice(realIdx, 1);
    await memory.save();
  } catch (error) {
    console.error('Error deleting last user message:', error);
  }
};

export const history = async (req, res) => {
  try {
    const memory = await ChatMemory.findOne({ userId: req.user.id }).lean();
    const messages = memory?.messages?.slice(-MAX_HISTORY) || [];
    res.json({ messages });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Error al cargar el historial' });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await ChatMemory.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Historial eliminado' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ message: 'Error al limpiar el historial' });
  }
};

export const chatStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role createdBy');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const gymId = user.role === 'admin' ? user._id : user.createdBy;
    let enabled = true;
    if (gymId) {
      const gymAdmin = await User.findById(gymId).select('chatbotEnabled');
      enabled = gymAdmin ? gymAdmin.chatbotEnabled !== false : true;
    }
    res.json({ enabled });
  } catch (error) {
    console.error('Chat status error:', error);
    res.status(500).json({ message: 'Error al obtener estado del chat' });
  }
};

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ message: 'El asistente no está configurado aún. Contactá al administrador.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el chatbot está habilitado para el gimnasio
    const gymId = user.role === 'admin' ? user._id : user.createdBy;
    if (gymId) {
      const gymAdmin = await User.findById(gymId).select('chatbotEnabled');
      if (gymAdmin && !gymAdmin.chatbotEnabled) {
        return res.status(403).json({ message: 'El chatbot está deshabilitado para tu gimnasio. Consultá con tu administrador.' });
      }
    }

    const routines = user.role === 'alumno'
      ? await Routine.find({ studentId: user._id }).select('title days.dayName')
      : await Routine.find({ gymId: user._id || user.createdBy }).select('title');

    const studentsCount = user.role !== 'alumno'
      ? await User.countDocuments({ createdBy: user._id, role: 'alumno' })
      : 0;

    const allowedTools = filterToolsByRole(user.role);
    const systemPrompt = buildSystemPrompt(user, routines, studentsCount);
    const dbHistory = await loadHistory(req.user.id);

    // ── Support flow: detect error, ask detail, show wsp ──
    const isErrorMsg = /error|problema|falla|no (funciona|carga|anda|abre|entra|anda|marcha)|tira.*error|bug|soporte|reporte/i.test(message);
    const isResolvedMsg = /ya (lo )?(solucione|arregle|resolvi)|no hay (más )?(error|problema)|ya (anda|funciona)|gracias.*(ayuda|solucion)/i.test(message);
    const lastBotMsg = dbHistory.filter(m => m.role === 'assistant').slice(-1).map(m => m.content).join(' ');
    const askedError = /qué error|describime/i.test(lastBotMsg);
    const userGaveError = /error.*:|código.*:|me aparece|dice.*error|\d{3,4}/i.test(message);

    if (isErrorMsg && !isResolvedMsg) {
      let reply = '';
      if (!askedError) {
        reply = '¿Qué error te aparece? Describime exactamente lo que ves en pantalla.';
      } else if (!userGaveError) {
        reply = '¿Qué error te aparece? Describime exactamente lo que ves en pantalla.';
      } else {
        const errorDetail = message.trim();
        const gymName = user.name;
        reply = `📝 *Detalle del error:* ${errorDetail}\n🏪 *Gimnasio:* ${gymName}`;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      await saveMessage(req.user.id, 'user', message);
      res.write(`data: ${JSON.stringify({ content: reply })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      await saveMessage(req.user.id, 'assistant', reply);
      return;
    }

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...dbHistory,
      { role: 'user', content: message },
    ];

    // ── Phase 1: non-streaming, check for tool calls ──
    const phase1Res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: groqMessages,
        tools: allowedTools,
        tool_choice: 'auto',
        stream: false,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!phase1Res.ok) {
      const errText = await phase1Res.text();
      console.error('Groq API error:', phase1Res.status, errText.slice(0, 500));
      const isRateLimit = phase1Res.status === 429;

      // Groq sometimes rejects model-invented tool calls; fallback to the text
      let fallbackContent = null;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.failed_generation) {
          fallbackContent = errJson.error.failed_generation;
        }
      } catch (e) { /* ignore */ }

      if (fallbackContent) {
        let cleaned = sanitize(fallbackContent);

        // If fallback only contains function tags, extract the JSON inside
        if (!cleaned) {
          const match = fallbackContent.match(/<function=\w+>([\s\S]*?)<\/function>/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1].trim());
              cleaned = `📝 Descripción: ${parsed.descripcion || parsed.Descripción || ''}\n📋 Pasos: ${parsed.pasos || parsed.Pasos || ''}`;
            } catch (e) {
              cleaned = 'Se va a comunicar con usted por WhatsApp para asistirlo.';
            }
          } else {
            cleaned = 'Se va a comunicar con usted por WhatsApp para asistirlo.';
          }
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        await saveMessage(req.user.id, 'user', message);
        res.write(`data: ${JSON.stringify({ content: cleaned })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        await saveMessage(req.user.id, 'assistant', cleaned);
        return;
      }

      return res.status(502).json({
        message: isRateLimit
          ? 'El asistente está sin crédito temporalmente. Esperá un rato o upgradéá el plan en https://console.groq.com/settings/billing'
          : 'Error al comunicarse con el asistente.',
      });
    }

    const phase1Data = await phase1Res.json();
    const choice = phase1Data.choices?.[0];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // ── Save user message only after Phase 1 succeeds ──
    await saveMessage(req.user.id, 'user', message);

    if (choice?.finish_reason === 'tool_calls') {
      res.write(`data: ${JSON.stringify({ type: 'thinking' })}\n\n`);

      groqMessages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        const fnName = toolCall.function.name;
        let args = {};
        try { args = JSON.parse(toolCall.function.arguments); } catch (e) { args = {}; }

        try {
          const result = await executeTool(fnName, args, user.role);
          groqMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          });
        } catch (err) {
          console.error(`Error executing tool ${fnName}:`, err);
          groqMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
          });
        }
      }

      const phase2Res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: groqMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!phase2Res.ok) {
        const errText = await phase2Res.text();
        console.error('Groq Phase2 error:', phase2Res.status, errText);
        await deleteLastUserMessage(req.user.id);
        const isRateLimit = phase2Res.status === 429;
        res.write(`data: ${JSON.stringify({ content: isRateLimit ? 'El asistente está sin crédito temporalmente. Esperá un rato o upgradéá el plan.' : 'Error al obtener la respuesta.' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      const fullContent = await streamAndCollect(res, phase2Res);
      if (fullContent) {
        await saveMessage(req.user.id, 'assistant', fullContent);
      }
      return;
    }

    // ── No tool calls ──
    const content = sanitize(choice?.message?.content || '');
    res.write(`data: ${JSON.stringify({ content })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

    if (content) {
      await saveMessage(req.user.id, 'assistant', content);
    }
  } catch (error) {
    console.error('Chat error:', error);
    await deleteLastUserMessage(req.user.id);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    try {
      res.write(`data: ${JSON.stringify({ error: 'Error interno' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      // Connection may already be closed
    }
  }
};
