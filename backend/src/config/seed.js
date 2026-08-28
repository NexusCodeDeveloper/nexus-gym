import User from "../models/User.js";

export const seedTestUser = async () => {
  try {
    const testUsers = [
      {
        name: "Cuenta Admin",
        dni: "00000000",
        role: "admin",
        isActive: true,
      },
      {
        name: "Cuenta Empleado",
        dni: "11111111",
        role: "profesor",
        isActive: true,
      },
      {
        name: "Cuenta alumno",
        dni: "22222222",
        role: "alumno",
        isActive: true,
      }
    ];

    console.log("[SEED] Iniciando inyección de usuarios de prueba...");

    for (const userData of testUsers) {
      const userExists = await User.findOne({ dni: userData.dni });

      if (!userExists) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`[SEED] Creado: ${userData.name} | Rol: ${userData.role} | DNI: ${userData.dni}`);
      } else {
        console.log(`[SEED] User OK: ${userData.name} (${userData.role})`);
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