import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Es obligatorio
      trim: true, // Corta los espacios en blanco al inicio y al final
    },
    email: {
      type: String,
      required: true,
      unique: true, // No pueden haber dos usuarios con el mismo email
      trim: true,
      lowercase: true, // Siempre lo guarda en minúsculas por seguridad
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Solo permite estos dos valores
      default: "user", // Por defecto será un usuario normal
    },
  },
  {
    timestamps: true, // Crea automáticamente los campos 'createdAt' y 'updatedAt'
  },
);

const User = mongoose.model("User", userSchema); // Crea el modelo de usuario a partir del esquema
export default User; // Exporta el modelo para usarlo en otras partes de la aplicación
