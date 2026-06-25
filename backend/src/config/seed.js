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
        name: "Cuenta super admin",
        dni: "10000000", 
        role: "superAdmin",
      },
      {
        name: "Cuenta Admin",
        dni: "00000000", 
        role: "admin",
      },
      {
        name: "Cuenta Empleado",
        dni: "11111111", 
        role: "profesor",
      },
      {
        name: "Cuenta alumno",
        dni: "22222222", 
        role: "alumno",
      }
    ];

    console.log("[SEED] Iniciando inyección de usuarios de prueba...");

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
          console.log(`[SEED] User hardcodeado OK: ${userData.name} (${userData.role})`);
        }
      }
    }
    
    console.log("[SEED] Proceso finalizado.");

  } catch (error) {
    console.error("[SEED] ❌ Error al insertar usuarios de prueba:", error.message);
  }
};