import mongoose from 'mongoose';

const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
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

workoutSessionSchema.index({ userId: 1, endTime: 1 });
workoutSessionSchema.index({ userId: 1, startTime: -1 });
workoutSessionSchema.index({ gymId: 1 });

export default mongoose.model('WorkoutSession', workoutSessionSchema);
