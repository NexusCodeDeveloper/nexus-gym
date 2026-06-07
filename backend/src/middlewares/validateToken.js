import jwt from "jsonwebtoken";
export const validateToken = (req, res, next) => {
  // Aquí implementar la lógica para validar el token de autenticación
  // Por ejemplo, se puede verificar si el token está presente en las cookies o en los encabezados de la solicitud
  // Si el token es válido, llama a next() para continuar con la siguiente función middleware o ruta
  // Si el token no es válido, responde con un error de autenticación

  // 1. Lee las cookies del navegador para buscar el token
  const { token } = req.cookies; // Obtener el token de las cookies

  // 2. Si no hay token, respondemos con un error de autenticación
  if (!token) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }

  // 3. Si hay token, lo verificamos que sea real y que no haya vencido usando TOKEN_SECRET usando jwt.verify
  jwt.verify(token, process.env.TOKEN_SECRET, (error, user) => {
    //si el token es falso o expiró , mandamos un error
    if (error) {
      return res.status(403).json({ message: "Token expirado" });
    }
    // si todo esta bien guardamos la info del usuario en "req" para que el siguiente archivo (auth.controller.js) sepa quien es el que pide la info
    req.user = user;

    // next le dice a express: "Todo ok, pasá al siguiente paso"
    next();
  });
};
