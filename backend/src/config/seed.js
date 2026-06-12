import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedTestUser = async () => {
  try {
    // Definimos el DNI y los datos que queremos hardcodear para las pruebas
    const testDni = "43565079"; 

    // Verificamos si ya existe para no duplicarlo y evitar errores de 'unique key'
    const userExists = await User.findOne({ dni: testDni });

    if (!userExists) {
      console.log("[SEED] Creando usuario de prueba...");

      // Hasheamos una contraseña por defecto por si luego usas el login clásico
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      const testUser = new User({
        name: "Tomas Admin",
        email: "admin@nexus.com",
        password: hashedPassword,
        dni: testDni,
        role: "admin", // Lo creamos como administrador para tus pruebas del panel
      });

      await testUser.save();
      console.log(`[SEED] Usuario de prueba creado con éxito. DNI: ${testDni}`);
    } else {
      console.log("[SEED] El usuario de prueba ya existe en la base de datos.");
    }
  } catch (error) {
    console.error("[SEED] Error al insertar el usuario de prueba:", error.message);
  }
};