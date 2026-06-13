import User from "../models/User.js";

export const seedTestUser = async () => {
  try {
    try {
      await User.collection.dropIndexes();
    } catch (e) {
      console.log("[SEED] Colección limpia, sin índices viejos.");
    }

    const testUsers = [
      {
        name: "Tomas Admin",
        dni: "43565079", 
        role: "super_adm",
      },
      {
        name: "Pablo Empleado",
        dni: "11111111", 
        role: "profesor",
      },
      {
        name: "Milanesa Alumno",
        dni: "22222222", 
        role: "alumno",
      }
    ];

    console.log("[SEED] Iniciando inyección de usuarios de prueba...");

    // Recorremos el array y comprobamos uno por uno
    for (const userData of testUsers) {
      let userExists = await User.findOne({ dni: userData.dni });

      if (!userExists) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`[SEED] ✅ Creado: ${userData.name} | Rol: ${userData.role} | DNI: ${userData.dni}`);
      } else {
        if (userExists.role !== userData.role) {
          userExists.role = userData.role;
          await userExists.save();
          console.log(`[SEED] 🔄 Actualizado rol de: ${userData.name} a ${userData.role}`);
        } else {
          console.log(`[SEED] ⚡ Ya listo: ${userData.name} (${userData.role})`);
        }
      }
    }
    
    console.log("[SEED] Proceso finalizado.");

  } catch (error) {
    console.error("[SEED] ❌ Error al insertar usuarios de prueba:", error.message);
  }
};