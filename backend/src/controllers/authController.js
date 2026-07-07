import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, dni, createdBy, licenseStartDate, licenseEndDate } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El usuario ya existe con ese email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "alumno",
      dni,
      createdBy: createdBy || null,
      licenseStartDate,
      licenseEndDate
    });

    await newUser.save();

    res.status(200).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error en registerUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", { expires: new Date(0) });
  return res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email o contraseña incorrectos" });
    }

    if (userFound.role !== 'superAdmin') {
      if (!userFound.isActive) {
        return res.status(403).json({ message: "Tu cuenta ha sido suspendida. Comunicate con el administrador." });
      }

      if (userFound.licenseEndDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(userFound.licenseEndDate);
        end.setHours(0, 0, 0, 0);
        if (end < today) {
          return res.status(403).json({ message: "Tu licencia ha vencido. Comunicate con el administrador para renovarla." });
        }
      }
    }

    const exactRole = userFound.role;

    const token = await createAccessToken({
      id: userFound._id,
      role: exactRole,
    });

    res.cookie("token", token);

    res.status(200).json({
      message: "Login exitoso",
      token: token,
      user: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
        role: exactRole,
        isActive: userFound.isActive,
        licenseStartDate: userFound.licenseStartDate,
        licenseEndDate: userFound.licenseEndDate,
        metrics: userFound.metrics, // 🔥 SOLUCIÓN: Agregamos metrics
      },
    });
  } catch (error) {
    console.error("Error en LoginUser", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);

    if (!userFound) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (userFound.role !== 'superAdmin') {
      if (!userFound.isActive) {
        res.cookie("token", "", { expires: new Date(0) });
        return res.status(403).json({ message: "Cuenta suspendida" });
      }

      if (userFound.licenseEndDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(userFound.licenseEndDate);
        end.setHours(0, 0, 0, 0);
        if (end < today) {
          res.cookie("token", "", { expires: new Date(0) });
          return res.status(403).json({ message: "Licencia vencida" });
        }
      }
    }

    return res.json({
      id: userFound._id,
      name: userFound.name,
      dni: userFound.dni,
      email: userFound.email,
      role: userFound.role,
      isActive: userFound.isActive,
      licenseStartDate: userFound.licenseStartDate,
      licenseEndDate: userFound.licenseEndDate,
      metrics: userFound.metrics,
    });
  } catch (error) {
    console.error("Error en profile", error.message);
    res.status(500).json({
      message: "Error interno del servidor, intenta nuevamente en unos minutos",
    });
  }
};

export const verifyDni = async (req, res) => {
  try {
    const { dni } = req.body;

    const userFound = await User.findOne({ dni });
    
    if (!userFound) {
      return res.status(404).json({ message: "El DNI ingresado no tiene acceso. Consulte en recepcion" });
    }

    if (userFound.role !== 'superAdmin') {
      if (!userFound.isActive) {
        return res.status(403).json({ message: "Tu cuenta ha sido suspendida. Comunicate con el administrador." });
      }

      if (userFound.licenseEndDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(userFound.licenseEndDate);
        end.setHours(0, 0, 0, 0);
        if (end < today) {
          return res.status(403).json({ message: "Tu licencia ha vencido. Comunicate con el administrador para renovarla." });
        }
      }
    }

    const exactRole = userFound.role;

    const token = await createAccessToken({
      id: userFound._id,
      role: exactRole,
    });

    res.cookie("token", token);
    res.status(200).json({
      success: true,
      message: "Acceso concedido",
      token: token,
      user: {
        id: userFound._id,
        name: userFound.name,
        dni: userFound.dni,
        role: exactRole,
        isActive: userFound.isActive,
        licenseStartDate: userFound.licenseStartDate,
        licenseEndDate: userFound.licenseEndDate,
        metrics: userFound.metrics, // 🔥 SOLUCIÓN: Agregamos metrics
      },
    });
  } catch (error) {
    console.error("Error en verifyDni:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getAlumnos = async (req, res) => {
  try {

    const requester = await User.findById(req.user.id);

    if (!requester) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const gymId = requester.role === "admin" ? requester._id : requester.createdBy;

   const alumnos = await User.find({ role: "alumno", createdBy: gymId }).select("name email _id licenseStartDate licenseEndDate isActive");;

    res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error obteniendo alumnos:", error);
    res.status(500).json({ message: "Error al obtener la lista de alumnos" });
  }
};