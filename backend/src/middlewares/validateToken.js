import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../libs/jwt.js";

export const validateToken = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token, autorización denegada" });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, user) => (err ? reject(err) : resolve(user)));
    });

    const dbUser = await User.findById(decoded.id).select('role isActive');
    if (!dbUser) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    if (!dbUser.isActive) {
      res.clearCookie("token");
      return res.status(403).json({ message: "Cuenta suspendida" });
    }

    req.user = { id: dbUser._id.toString(), role: dbUser.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
};