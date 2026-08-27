import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.TOKEN_SECRET || process.env.JWT_SECRET;

export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}