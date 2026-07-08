import User from "../models/User.js";
import bcrypt from "bcryptjs";

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

// Crear nuevo Cliente Admin
export const createAdmin = async (req, res) => {
  try {
    const { name, dni, licenseStartDate, licenseEndDate } = req.body;
    const existingUser = await User.findOne({ dni });
    if (existingUser) {
      return res.status(400).json({ message: "El DNI ya se encuentra registrado" });
    }

    // ENCRIPTAMOS EL DNI PARA QUE DEJE LOGUEARSE DESPUÉS
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dni, salt);

    const newAdmin = new User({
      name,
      dni,
      password: hashedPassword, 
      role: "admin", 
      isActive: true, 
      licenseStartDate,
      licenseEndDate,
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json(savedAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: error.message || "Error creating client" });
  }
};

// Renovar Licencia
export const renewAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Client not found" });

    const today = new Date();
    const currentEndDate = new Date(admin.licenseEndDate);
    
    const baseDate = currentEndDate > today ? currentEndDate : today;
    baseDate.setMonth(baseDate.getMonth() + 1);

    admin.licenseEndDate = baseDate;
    admin.isActive = true; 
    
    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    console.error("Error renewing:", error);
    res.status(500).json({ message: "Error renewing client" });
  }
};

// Alternar chatbot (habilitar/deshabilitar)
export const toggleChatbot = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Gimnasio no encontrado' });
    }
    admin.chatbotEnabled = !admin.chatbotEnabled;
    await admin.save();
    res.status(200).json({
      message: admin.chatbotEnabled ? 'Chatbot habilitado' : 'Chatbot deshabilitado',
      chatbotEnabled: admin.chatbotEnabled,
    });
  } catch (error) {
    console.error('Error toggling chatbot:', error);
    res.status(500).json({ message: 'Error al actualizar el chatbot' });
  }
};

// Eliminar Cliente
export const deleteAdmin = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};

// Editar datos
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