import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`>>> MongoDB Conectado: ${conn.connection.host} <<<`);
  } catch (error) {
    console.error(`⨷ Error al conectar a MongoDB: ${error.message}`);
    // Detener la aplicación si la base de datos falla
    process.exit(1);
  }
};
