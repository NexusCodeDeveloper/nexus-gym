import RoutineProgress from '../models/RoutineProgress.js';
import mongoose from 'mongoose';

export const getProgress = async (req, res) => {
  try {
    const { routineId } = req.params;
    const progress = await RoutineProgress.findOne({
      routineId,
      studentId: req.user.id
    });
    res.status(200).json({ message: 'Progreso obtenido correctamente', data: progress || { routineId, days: [] } });
  } catch (error) {
    console.error('Error loading progress:', error);
    res.status(500).json({ message: 'Error al cargar progreso' });
  }
};

export const updateDayProgress = async (req, res) => {
  try {
    const { routineId } = req.params;
    const { dayIndex, completedExercises } = req.validatedBody;
    const gymId = req.routine.gymId;

    const updated = await RoutineProgress.findOneAndUpdate(
      { routineId, studentId: req.user.id },
      [
        {
          $set: {
            gymId: new mongoose.Types.ObjectId(gymId.toString()),
            days: {
              $filter: {
                input: { $ifNull: ['$days', []] },
                cond: { $ne: ['$$this.dayIndex', dayIndex] },
              },
            },
          },
        },
        {
          $set: {
            days: {
              $concatArrays: ['$days', [{ dayIndex, completedExercises }]],
            },
          },
        },
      ],
      { upsert: true, returnDocument: 'after', updatePipeline: true }
    );

    res.status(200).json({ message: 'Progreso guardado correctamente', data: updated });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ message: 'Error al guardar progreso' });
  }
};