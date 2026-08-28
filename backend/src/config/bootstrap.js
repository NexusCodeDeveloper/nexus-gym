import User from "../models/User.js";

export const ensureSuperAdmin = async () => {
  try {
    const dni = process.env.SUPER_ADMIN_DNI;
    if (!dni) return;

    const exists = await User.findOne({ role: 'superAdmin', dni });
    if (exists) return;

    await User.create({
      name: 'Super Admin',
      dni,
      role: 'superAdmin',
      isActive: true,
    });

    console.log(`[BOOTSTRAP] Super admin creado desde .env con DNI ${dni}`);
  } catch (error) {
    console.error('[BOOTSTRAP] Error al asegurar el super admin:', error.message);
  }
};