import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedTestUser = async () => {
  try {
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
        console.log(`[SEED] Creado: ${userData.name} | Rol: ${userData.role} | DNI: ${userData.dni}`);
      } else {
        if (!userExists.password) {
          userExists.password = userData.password;
          await userExists.save();
          console.log(`[SEED] Password asignado: ${userData.name}`);
        } else {
          console.log(`[SEED] User OK: ${userData.name} (${userData.role})`);
        }
      }
    }
    
    console.log("[SEED] Proceso finalizado.");

    await linkSeedUsersToAdmin();

  } catch (error) {
    console.error("[SEED] ❌ Error al insertar usuarios de prueba:", error.message);
  }
};

const linkSeedUsersToAdmin = async () => {
  try {
    const admin = await User.findOne({ dni: '00000000', role: 'admin' });
    if (!admin) return;

    const usersToLink = await User.find({ dni: { $in: ['11111111', '22222222'] }, createdBy: null });
    if (usersToLink.length === 0) return;

    await Promise.all(usersToLink.map(async (user) => {
      user.createdBy = admin._id;
      await user.save();
      console.log(`[SEED] 🔗 Vinculado ${user.name} al gimnasio de prueba`);
    }));
  } catch (error) {
    console.error("[SEED] ❌ Error al vincular usuarios al gimnasio:", error.message);
  }
};