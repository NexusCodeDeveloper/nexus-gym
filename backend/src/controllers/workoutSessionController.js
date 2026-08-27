import WorkoutSession from '../models/WorkoutSession.js';
import Routine from '../models/Routine.js';
import User from '../models/User.js';
import { getArgToday } from '../utils/date.js';

export const startSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { routineId } = req.validatedBody;

    const now = new Date();
    const today = getArgToday();

    let gymId = null;
    if (routineId) {
      const routine = await Routine.findById(routineId).select('gymId');
      if (!routine) {
        return res.status(404).json({ message: 'Rutina no encontrada' });
      }
      gymId = routine.gymId;
    } else {
      const user = await User.findById(userId).select('createdBy');
      gymId = user?.createdBy || null;
    }

    const existing = await WorkoutSession.findOne({ userId, endTime: null });
    if (existing) {
      return res.status(400).json({ message: 'Ya tenés una sesión en curso. Finalizala antes de empezar otra.' });
    }

    const session = await WorkoutSession.create({
      userId,
      gymId,
      routineId: routineId || null,
      startTime: now,
      date: today,
    });

    res.json({ message: 'Sesión iniciada', data: session });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Error al iniciar la sesión' });
  }
};

export const stopSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const session = await WorkoutSession.findOne({ userId, endTime: null });
    if (!session) {
      return res.status(400).json({ message: 'No tenés una sesión activa para finalizar.' });
    }

    const durationMs = now - new Date(session.startTime);
    const durationMin = Math.round(durationMs / 60000);

    session.endTime = now;
    session.duration = durationMin;
    await session.save();

    res.json({ message: 'Sesión finalizada', data: session });
  } catch (error) {
    console.error('Stop session error:', error);
    res.status(500).json({ message: 'Error al finalizar la sesión' });
  }
};

export const getActiveSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await WorkoutSession.findOne({ userId, endTime: null });
    res.json({ message: 'Sesión activa obtenida correctamente', data: session || null });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ message: 'Error al obtener sesión activa' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await WorkoutSession.find({ userId, endTime: { $ne: null } })
      .populate('routineId', 'title')
      .sort({ startTime: -1 })
      .limit(50);

    res.json({ message: 'Historial obtenido correctamente', data: sessions });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
};
