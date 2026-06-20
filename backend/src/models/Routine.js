import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: String, required: true }, // Cambiado a String por si ponen "3-4" o "Al fallo"
  reps: { type: String, required: true },
});

const daySchema = new mongoose.Schema({
  dayName: { type: String, required: true },
  exercises: [exerciseSchema]
});

const routineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    level: { type: String, required: true },
    days: [daySchema], // Array de días con sus ejercicios
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Opcional para poder guardar plantillas
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Routine", routineSchema);