import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedTestUser = async () => {
  try {
    try {
      await User.collection.dropIndexes();
    } catch (e) {
      console.log("[SEED] Colección limpia, sin índices viejos.");
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("123456", salt);

    const testUsers = [
      {
        name: "Cuenta super admin",
        dni: "10000000",
        email: "10000000@nexusgym.com",
        password: defaultPassword,
        role: "superAdmin",
        isActive: true,
      },
      {
        name: "Cuenta Admin",
        dni: "00000000",
        email: "00000000@nexusgym.com",
        password: defaultPassword,
        role: "admin",
        isActive: true,
      },
      {
        name: "Cuenta Empleado",
        dni: "11111111",
        email: "11111111@nexusgym.com",
        password: defaultPassword,
        role: "profesor",
        isActive: true,
      },
      {
        name: "Cuenta alumno",
        dni: "22222222",
        email: "22222222@nexusgym.com",
        password: defaultPassword,
        role: "alumno",
        isActive: true,
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
        if (userExists.role !== userData.role || !userExists.password || !userExists.email) {
          userExists.role = userData.role;
          userExists.password = userData.password;
          userExists.email = userData.email;
          await userExists.save();
          console.log(`[SEED] 🔄 Actualizado: ${userData.name} (password/email/role)`);
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