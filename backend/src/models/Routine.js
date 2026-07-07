import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: String },
  reps: { type: String },
  rest: { type: String },
  videoUrl: { type: String }
});

const daySchema = new mongoose.Schema({
  dayName: { type: String, required: true },
  exercises: [exerciseSchema]
});

const routineSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    level: { 
      type: String, 
      default: "Principiante" 
    },
    days: [daySchema],
    
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },

    gymId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Routine", routineSchema);