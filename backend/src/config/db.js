import mongoose from "mongoose";

// --- INICIO CÓDIGO TEMPORAL: SEMILLA DE PRUEBA (BORRAR LUEGO) ---
import { seedTestUser } from "./seed.js";
// --- FIN CÓDIGO TEMPORAL ---

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`>>> MongoDB Conectado: ${conn.connection.host} <<<`);
    
    // --- INICIO CÓDIGO TEMPORAL: SEMILLA DE PRUEBA (BORRAR LUEGO) ---
    // Ejecutamos la función para crear el usuario hardcodeado automáticamente
    await seedTestUser();
    // --- FIN CÓDIGO TEMPORAL ---

  } catch (error) {
    console.error(`⨷ Error al conectar a MongoDB: ${error.message}`);
    // Detener la aplicación si la base de datos falla
    process.exit(1);
  }
};