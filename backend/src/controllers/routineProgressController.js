import RoutineProgress from '../models/RoutineProgress.js';

export const getProgress = async (req, res) => {
  try {
    const { routineId } = req.params;
    const progress = await RoutineProgress.findOne({
      routineId,
      studentId: req.user.id
    });
    res.status(200).json(progress || { routineId, days: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar progreso' });
  }
};

export const updateDayProgress = async (req, res) => {
  try {
    const { routineId } = req.params;
    const { dayIndex, completedExercises } = req.body;

    const progress = await RoutineProgress.findOneAndUpdate(
      { routineId, studentId: req.user.id },
      { $pull: { days: { dayIndex } } },
      { new: true }
    );

    const updated = await RoutineProgress.findOneAndUpdate(
      { routineId, studentId: req.user.id },
      {
        $push: { days: { dayIndex, completedExercises } }
      },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar progreso' });
  }
};
