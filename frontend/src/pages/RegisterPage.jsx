import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../utils/swal";

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
      showSuccessToast("¡Usuario registrado con éxito!");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
      showErrorToast(error.response?.data?.message || "Ocurrió un error al registrar");
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Luces radiales de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up z-10">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight">Crear Cuenta</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium tracking-wide">Únete a la plataforma Nexus</p>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-md shadow-2xl shadow-black/50">
          {/* handleSubmit recibe nuestra función onSubmit y la envuelve con validaciones */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <input
                type="text"
                {...register("name", { required: "El nombre es requerido" })}
                className={`w-full py-3 px-4 bg-[#080c14]/50 border rounded-xl text-white placeholder-slate-500 transition-all duration-300 focus:outline-none focus:bg-white/[0.03] ${errors.name ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
                placeholder="Nombre completo"
              />
              {errors.name && (
                <span className="text-red-400 text-xs mt-2 block">{errors.name.message}</span>
              )}
            </div>

            <div>
              <input
                type="email"
                {...register("email", { required: "El email es requerido" })}
                className={`w-full py-3 px-4 bg-[#080c14]/50 border rounded-xl text-white placeholder-slate-500 transition-all duration-300 focus:outline-none focus:bg-white/[0.03] ${errors.email ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
                placeholder="Correo electrónico"
              />
              {errors.email && (
                <span className="text-red-400 text-xs mt-2 block">{errors.email.message}</span>
              )}
            </div>

            <div>
              <input
                type="password"
                {...register("password", { required: "La contraseña es requerida" })}
                className={`w-full py-3 px-4 bg-[#080c14]/50 border rounded-xl text-white placeholder-slate-500 transition-all duration-300 focus:outline-none focus:bg-white/[0.03] ${errors.password ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:border-blue-500/50'}`}
                placeholder="Contraseña"
              />
              {errors.password && (
                <span className="text-red-400 text-xs mt-2 block">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl mt-2 transition-colors"
            >
              Registrarse
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-slate-400 text-sm">
          ¿Ya tienes una cuenta? <Link to="/" className="text-blue-400 font-medium hover:underline">Ingresa aquí</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
