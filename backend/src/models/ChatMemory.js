import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  messages: {
    type: [chatMessageSchema],
    validate: {
      validator: (msgs) => msgs.length <= 100,
      message: 'El historial no puede superar los 100 mensajes.',
    },
  },
}, {
  timestamps: true,
});

chatMemorySchema.index({ userId: 1, updatedAt: 1 });
chatMemorySchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export default mongoose.model('ChatMemory', chatMemorySchema);
