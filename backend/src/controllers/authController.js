import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    // 1. Extraer datos del cuerpo de la solicitud (frontend o postman)
    const { name, email, password, role } = req.body;

    // 2. Verificar si el usuario ya existe en la base de datos lo hacemos con el email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "El usuario ya existe con ese email" });
    }

    // 3. Encriptar (hashear) la contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10); // 10 saltos
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Crear el nuevo usuario usando el modelo de Mongoose
    const newUser = new User({
      name,
      email,
      password: hashedPassword, //guarda la encriptada , no la original
      role,
    });

    // 5. Guardar el usuario nuevo en MongoDB
    await newUser.save();

    // 6. Responer mensaje de exito para que el frontend lo utilice
    res.status(200).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("Error en registerUser:", error); // mensaje en consola para debugging
    res.status(500).json({ message: "Error interno del servidor" }); // Mensaje para el frontend, el usuario nunca va a saber que error tiene el sistema
  }
};

// Logout de usuario
export const logout = (req, res) => {
  // Sobrescribimos la cookie "token" con un texto vacío y fecha de expiración en 0 (pasado)
  res.cookie("token", "", { expires: new Date(0) });
  return res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

// Login de usuario
export const loginUser = async (req, res) => {
  try {
    // 1. Extraer email y password del cuerpo de la solicitud
    const { email, password } = req.body;

    //2. Verificar si el usuario existe en la base de datos
    const userFound = await User.findOne({ email });
    if (!userFound) {
      console.error("Error en userFound");
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });
    }

    // 3. Si el usuario existe tenemos que comparar la contraseña que ingresa con la que esta guardada en la base de datos
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      console.error("Error en el match entre contraseñas");
      return res
        .status(400)
        .json({ message: "Email o contraseña incorrectos" });
    }

    // 4. Si el usuario existe, le creamos un token de acceso pasandole los datos que necesitamos
    const token = await createAccessToken({
      id: userFound._id,
      role: userFound.role,
    });

    // 5. aca dejamos el lugar para enviar la cookie mas adelante
    res.cookie("token", token);

    // 6. Respondemos con el token de acceso en la respuesta json con 3 objetos distinto , 1 mensaje de exito, el token y los datos del usuario (sin la contraseña) para que el frontend pueda usarlo y mostrarlo en la interfaz
    res.status(200).json({
      message: "Login exitoso",
      token: token,
      user: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role,
      },
    });
  } catch (error) {
    console.error("Error en LoginUser", error.message);
    res.status(500).json({ messaje: "Error interno del servidor" });
  }
};

// Perfil de usuario, para comprobar que funcione el token y la cookie
export const profile = async (req, res) => {
  try {
    // 1. buscar el usuario en la base de datos usando el ID que guardamos en req.user.id (que viene del token)
    const userFound = await User.findById(req.user.id);

    // 2. Si no existe mandamos un error
    if (!userFound) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // 3. si existe, devolvemos los datos completos en formado json sin la contraseña
    return res.json({
      id: userFound._id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
    });
  } catch (error) {
    console.error("Error en profile", error.message);
    res.status(500).json({
      message:
        "Error interno del servidor, intenta nuevamente en unos minutos ",
    });
  }
};
