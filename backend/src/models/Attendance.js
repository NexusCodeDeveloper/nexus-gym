import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ['profesor', 'alumno'],
    required: true,
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
