import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import { toArgDate, isDateExpired } from "../utils/date.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

const clearTokenCookie = (res) => {
  res.cookie("token", "", { ...cookieOptions, expires: new Date(0) });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, dni, createdBy, licenseStartDate, licenseEndDate } = req.validatedBody;

    const finalCreatedBy = req.user.role === 'admin' ? req.user.id : (createdBy || null);

    if (finalCreatedBy) {
      const gym = await User.findOne({ _id: finalCreatedBy, role: 'admin' });
      if (!gym) {
        return res.status(400).json({ message: "El gimnasio indicado no existe" });
      }

      const existingDni = await User.findOne({ dni, createdBy: finalCreatedBy });
      if (existingDni) {
        return res.status(400).json({ message: "El DNI ya se encuentra registrado en tu gimnasio" });
      }
    } else {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "El usuario ya existe con ese email" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "alumno",
      dni,
      createdBy: finalCreatedBy,
      licenseStartDate: toArgDate(licenseStartDate),
      licenseEndDate: toArgDate(licenseEndDate),
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente", data: { id: newUser._id } });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const logout = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);

    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (userFound.role !== 'superAdmin') {
      if (!userFound.isActive) {
        clearTokenCookie(res);
        return res.status(403).json({ message: "Cuenta suspendida" });
      }

      if (isDateExpired(userFound.licenseEndDate)) {
        clearTokenCookie(res);
        return res.status(403).json({ message: "Licencia vencida" });
      }
    }

    return res.json({
      message: "Perfil obtenido correctamente",
      data: {
        id: userFound._id,
        name: userFound.name,
        dni: userFound.dni,
        email: userFound.email,
        role: userFound.role,
        isActive: userFound.isActive,
        licenseStartDate: userFound.licenseStartDate,
        licenseEndDate: userFound.licenseEndDate,
        metrics: userFound.metrics,
      },
    });
  } catch (error) {
    console.error("Error in profile:", error.message);
    res.status(500).json({
      message: "Error interno del servidor, intenta nuevamente en unos minutos",
    });
  }
};

export const getGyms = async (req, res) => {
  try {
    const gyms = await User.find({ role: 'admin', isActive: true })
      .select('name dni _id')
      .sort({ name: 1 });

    res.status(200).json({ message: "Gimnasios obtenidos correctamente", data: gyms });
  } catch (error) {
    console.error("Error fetching gyms:", error);
    res.status(500).json({ message: "Error al obtener los gimnasios" });
  }
};

export const verifyDni = async (req, res) => {
  try {
    const { dni, gymId } = req.validatedBody;

    const query = gymId
      ? { dni, $or: [{ createdBy: gymId }, { _id: gymId }] }
      : { dni, createdBy: null };
    const userFound = await User.findOne(query);

    if (!userFound) {
      return res.status(404).json({ message: "El DNI ingresado no tiene acceso. Consulte en recepcion" });
    }

    if (userFound.role !== 'superAdmin') {
      if (!userFound.isActive) {
        return res.status(403).json({ message: "Tu cuenta ha sido suspendida. Comunicate con el administrador." });
      }

      if (isDateExpired(userFound.licenseEndDate)) {
        return res.status(403).json({ message: "Tu licencia ha vencido. Comunicate con el administrador para renovarla." });
      }
    }

    const exactRole = userFound.role;

    const token = await createAccessToken({
      id: userFound._id,
      role: exactRole,
    });

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      message: "Acceso concedido",
      data: {
        user: {
          id: userFound._id,
          name: userFound.name,
          dni: userFound.dni,
          role: exactRole,
          isActive: userFound.isActive,
          licenseStartDate: userFound.licenseStartDate,
          licenseEndDate: userFound.licenseEndDate,
          metrics: userFound.metrics,
        },
      },
    });
  } catch (error) {
    console.error("Error in verifyDni:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getAlumnos = async (req, res) => {
  try {
    const requester = await User.findById(req.user.id);

    if (!requester) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let gymId;
    if (requester.role === 'superAdmin') {
      const filter = { role: "alumno" };
      if (req.validatedQuery?.gymId) {
        filter.createdBy = req.validatedQuery.gymId;
      }
      const allAlumnos = await User.find(filter).select("name email _id licenseStartDate licenseEndDate isActive");
      return res.status(200).json({ message: "Alumnos obtenidos correctamente", data: allAlumnos });
    }

    gymId = requester.role === "admin" ? requester._id : requester.createdBy;
    if (!gymId) {
      return res.status(400).json({ message: "No se encontró el gimnasio asociado al usuario" });
    }

    const alumnos = await User.find({ role: "alumno", createdBy: gymId }).select("name email _id licenseStartDate licenseEndDate isActive");

    res.status(200).json({ message: "Alumnos obtenidos correctamente", data: alumnos });
  } catch (error) {
    console.error("Error fetching alumnos:", error);
    res.status(500).json({ message: "Error al obtener la lista de alumnos" });
  }
};