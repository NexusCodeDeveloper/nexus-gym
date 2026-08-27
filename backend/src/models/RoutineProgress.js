import mongoose from 'mongoose';

const dayProgressSchema = new mongoose.Schema({
  dayIndex: { type: Number, required: true },
  completedExercises: [{ type: Number }]
}, { _id: false });

const routineProgressSchema = new mongoose.Schema({
  routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  days: [dayProgressSchema]
}, { timestamps: true });

routineProgressSchema.index({ routineId: 1, studentId: 1 }, { unique: true });
routineProgressSchema.index({ gymId: 1 });

export default mongoose.model('RoutineProgress', routineProgressSchema);
