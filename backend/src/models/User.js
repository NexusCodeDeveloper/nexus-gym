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
      enum: ['super_adm', 'profesor', 'alumno'], // Solo acepta estos 3 valores exactos
      default: 'alumno', // por defecto es alumno
    },
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("User", userSchema);