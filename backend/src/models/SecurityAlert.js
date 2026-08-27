import mongoose from "mongoose";

const securityAlertSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['screenshot'],
      default: 'screenshot',
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

securityAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });
securityAlertSchema.index({ gymId: 1, createdAt: -1 });

export default mongoose.model('SecurityAlert', securityAlertSchema);