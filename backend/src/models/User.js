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
      // Lo dejamos opcional por si algunos usuarios entran solo con DNI
    },
    password: {
      type: String,
    },
    dni: {
      type: String,
      required: false, // Cambiado a false para que no explote el registro por email
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