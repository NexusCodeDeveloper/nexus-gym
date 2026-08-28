import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import routineRoutes from "./routes/routineRoutes.js"; 
import cookieParser from "cookie-parser";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import profileRoutes from "./routes/profileRoutes.js"; 
import exerciseMediaRoutes from "./routes/exerciseMediaRoutes.js";
import routineProgressRoutes from "./routes/routineProgressRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import workoutSessionRoutes from "./routes/workoutSessionRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true, 
  })
);
app.use(morgan("dev")); 
app.use(express.json()); 
app.use(cookieParser()); 

app.get("/", (req, res) => {
  res.send("¡Servidor backend funcionando!");
});

app.use("/api/auth", authRoutes);       
app.use("/api/routines", routineRoutes); 
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes); 
app.use("/api/exercise-media", exerciseMediaRoutes);
app.use("/api/routine-progress", routineProgressRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/workout", workoutSessionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/security", securityRoutes);

export default app;