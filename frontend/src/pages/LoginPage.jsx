import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Traemos la herramienta para redireccionar
  const navigate = useNavigate();

  // Traemos nuestra función signin desde la "nube" global
  const { signin } = useAuth();

  const onSubmit = async (data) => {
    //data son los datos que pone el usuario en el input del formulario ! que luego viajan al backend mediante axios
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        data,
        {
          withCredentials: true, // IMPORTANTE PARA QUE EL NAVEGADOR GUARDE LA COOKIE!
        },
      );
      // cuando el backend responde axios devuelve la respuesta y la pone dentro de la "response.data"
      console.log("Login exitoso:", response.data);

      // ¡AQUÍ ES DONDE LANZAMOS EL USUARIO AL CONTEXTO!
      signin(response.data.user);

      alert("¡Login exitoso! Bienvenido " + response.data.user.name);

      // Redirigimos automáticamente a la página de perfil
      navigate("/profile");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(
        error.response?.data?.message || "Ocurrió un error al iniciar sesión",
      );
    }
  };

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="email"
          {...register("email", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
          placeholder="Correo electrónico"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">El email es requerido</span>
        )}

        <input
          type="password"
          {...register("password", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
          placeholder="Contraseña"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            La contraseña es requerida
          </span>
        )}

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 font-bold py-2 px-4 rounded-md mt-4 transition-colors"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
