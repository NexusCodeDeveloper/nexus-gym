import mongoose from 'mongoose';

const exerciseMediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  videoUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('ExerciseMedia', exerciseMediaSchema);
