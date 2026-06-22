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
    }
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("User", userSchema);