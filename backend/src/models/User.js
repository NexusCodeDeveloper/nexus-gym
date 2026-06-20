import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dni: {
      type: String,
      required: true,
      unique: true,
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
  ref: 'User', // Referencia al ID del gimnasio (admin) que lo creó
  default: null
}
  },
  
  {
    timestamps: true, 
  }
);

export default mongoose.model("User", userSchema);