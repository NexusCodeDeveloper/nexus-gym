import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  const { token } = req.cookies; // Requiere instalar y usar 'cookie-parser' en tu index.js

  if (!token) {
    return res.status(401).json({ message: "No token, autorización denegada" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "clave_secreta_temporal", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    
    // Guardamos los datos decodificados en req.user para usarlos en el controlador 'profile'
    req.user = user; 
    next();
  });
};