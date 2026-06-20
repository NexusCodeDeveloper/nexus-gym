import User from "../models/User.js";

// Obtener todos los clientes (gimnasios/admins)
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Error al obtener los administradores" });
  }
};

// Alternar el acceso a la plataforma (Activo/Suspendido)
export const toggleAdminAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);
    
    if (!admin) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    // Invertimos el estado actual (si era true pasa a false, y viceversa)
    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({ 
      message: "Estado de acceso actualizado", 
      isActive: admin.isActive 
    });
  } catch (error) {
    console.error("Error toggling access:", error);
    res.status(500).json({ message: "Error al actualizar el acceso" });
  }
};
export const createAdmin = async (req, res) => {
  try {
    const { name, dni, licenseStartDate, licenseEndDate } = req.body;
    const existingUser = await User.findOne({ dni });
    if (existingUser) {
      return res.status(400).json({ message: "DNI already registered" });
    }

    const newAdmin = new User({
      name,
      dni,
      password: dni, // 🔥 ACÁ ESTÁ LA MAGIA: Le pasamos el DNI como contraseña inicial
      role: "admin", 
      isActive: true, 
      licenseStartDate,
      licenseEndDate,
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json(savedAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    // Agregamos error.message para que si vuelve a fallar, el backend te diga EXACTAMENTE qué falta
    res.status(500).json({ message: error.message || "Error creating client" });
  }
};
// 1. RENOVAR (Suma 1 mes y reactiva automáticamente)
export const renewAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Client not found" });

    const today = new Date();
    const currentEndDate = new Date(admin.licenseEndDate);
    
    // Si ya está vencido cuenta desde hoy, si no, le suma al colchón que le queda
    const baseDate = currentEndDate > today ? currentEndDate : today;
    baseDate.setMonth(baseDate.getMonth() + 1);

    admin.licenseEndDate = baseDate;
    admin.isActive = true; // Lo reactiva por si estaba suspendido
    
    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error renewing:", error);
    res.status(500).json({ message: "Error renewing client" });
  }
};

// 2. ELIMINAR CLIENTE
export const deleteAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};

// 3. EDITAR DATOS (Nombre o Fechas)
export const updateAdmin = async (req, res) => {
  try {
    const { name, licenseStartDate, licenseEndDate } = req.body;
    const updatedAdmin = await User.findByIdAndUpdate(
      req.params.id,
      { name, licenseStartDate, licenseEndDate },
      { new: true }
    );
    res.status(200).json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ message: "Error updating client" });
  }
};