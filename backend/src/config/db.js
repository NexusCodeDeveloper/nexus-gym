import mongoose from "mongoose";

import { seedTestUser } from "./seed.js";
import { ensureSuperAdmin } from "./bootstrap.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`>>> MongoDB Conectado: ${conn.connection.host} <<<`);

    if (process.env.NODE_ENV !== 'production') {
      await seedTestUser();
    }

    await ensureSuperAdmin();

  } catch (error) {
    console.error(`⨷ Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};