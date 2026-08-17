import mongoose from 'mongoose';

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('WorkoutSession', workoutSessionSchema);
