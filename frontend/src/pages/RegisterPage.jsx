import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  // Extraemos las herramientas que nos da react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  // Esta función se ejecuta solo si el formulario pasa las validaciones (no está vacío)
  const onSubmit = async (data) => {
    try {
      // Hacemos la petición POST al backend con axios
      const response = await axios.post(
        "http://localhost:4000/api/auth/register",
        {
          ...data,
          role: "user", // Forzamos el rol "user" por seguridad
        },
      );
      console.log("Respuesta del servidor:", response.data);
      alert("¡Usuario registrado con éxito!");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Ocurrió un error");
    }
  };

  return (
    <div className="bg-zinc-800 max-w-md w-full p-10 rounded-md shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h1>

      {/* handleSubmit recibe nuestra función onSubmit y la envuelve con validaciones */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          type="text"
          {...register("name", { required: true })}
          className="w-full bg-zinc-700 text-white px-4 py-2 rounded-md"
          placeholder="Nombre completo"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">El nombre es requerido</span>
        )}

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
          className="bg-blue-500 hover:bg-blue-600 font-bold py-2 px-4 rounded-md mt-4 transition-colors"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
