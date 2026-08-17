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
  checkOut: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ['profesor', 'alumno'],
    required: true,
  },
  source: {
    type: String,
    enum: ['manual', 'qr', 'nfc', 'api'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ gymId: 1, date: -1 });
attendanceSchema.index({ gymId: 1, role: 1, date: -1 });

export default mongoose.model('Attendance', attendanceSchema);
