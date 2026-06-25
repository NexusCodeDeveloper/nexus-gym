import mongoose from "mongoose";

import { seedTestUser } from "./seed.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`>>> MongoDB Conectado: ${conn.connection.host} <<<`);
    
    await seedTestUser();

  } catch (error) {
    console.error(`⨷ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};