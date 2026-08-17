import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    dni: {
      type: String,
      required: false,
      trim: true,
    },
    role: {
      type: String,
      enum: ['superAdmin', 'admin', 'profesor', 'alumno'], 
      default: 'alumno', 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    chatbotEnabled: {
      type: Boolean,
      default: true,
    },
    licenseStartDate: {
      type: Date,
    },
    licenseEndDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    metrics: {
      height: { type: Number, default: 0 },
      weightHistory: [{
        date: { type: Date, default: Date.now },
        weight: { type: Number, required: true }
      }],
      prsHistory: [{
        date: { type: Date, default: Date.now },
        squat: { type: Number, default: 0 },
        benchPress: { type: Number, default: 0 },
        deadlift: { type: Number, default: 0 }
      }]
    }
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("User", userSchema);