import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  const { token } = req.cookies; 

  if (!token) {
    return res.status(401).json({ message: "No token, autorización denegada" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "clave_secreta_temporal", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = user;
    next();
  });
};  