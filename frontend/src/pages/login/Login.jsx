import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import { verifyDni } from '../../service/authService'; 
import SwipeButton from '../../components/SwipeButton/SwipeButton'; 
import { z } from 'zod';

const loginSchema = z.object({
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe contener entre 7 y 8 números.")
});

const Login = () => {
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signin } = useAuth();

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setDni(value);
      setError('');
    }
  };

  const handleLoginAction = async () => {
    const result = loginSchema.safeParse({ dni });
    
    if (!result.success) {
      setError(result.error.format().dni._errors[0]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyDni(dni);
      
      if (response.success) {
        signin(response.user);
        localStorage.setItem('nexus_token', response.token);

        // Redirigir siempre a la página de inicio después del login
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ocurrió un error al intentar ingresar.');
    } finally {
      setIsLoading(false);
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
        
        {/* Cabecera / Marca */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40 relative z-10">
              <svg className="w-8 h-8 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4M7 12h10" />
              </svg>
            </div>
            {/* Anillo de luz con efecto de respiración (pulse) */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500/30 scale-110 opacity-70 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-125" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">NEXUS SYSTEM</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium tracking-wide">Terminal de Acceso para gimansios</p>
        </div>

        {/* Tarjeta Glassmorphism refinada */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-md shadow-2xl shadow-black/50">
          <div className="space-y-7">
            
            {/* Sección del Input */}
            <div>
              <label htmlFor="dni" className="block text-sm font-semibold text-slate-300 mb-2">
                Ingresa tu DNI
              </label>
              
              <div className="relative group">
                {/* Ícono absoluto dentro del input */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                  </svg>
                </div>

                <input
                  id="dni"
                  name="dni"
                  type="text"
                  inputMode="numeric"
                  required
                  disabled={isLoading}
                  value={dni}
                  onChange={handleInputChange} 
                  placeholder="12345678"
                  autoComplete="username"
                  autoFocus
                  className={`
                    w-full py-4 pl-12 pr-5 bg-[#080c14]/50 border rounded-2xl text-white placeholder-slate-600 
                    text-lg font-mono tracking-[0.15em] transition-all duration-300
                    focus:outline-none focus:bg-white/[0.03]
                    ${error 
                      ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                      : 'border-white/10 hover:border-white/20 focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)]'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                />
              </div>
              
              {/* Mensaje de Error minimalista */}
              {error && (
                <p className="text-red-400 text-xs mt-3 font-medium animate-pulse flex items-center gap-1.5 bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  {error}
                </p>
              )}
            </div>

            {/* Contenedor del SwipeButton */}
            <div className="pt-2">
              <SwipeButton 
                onSwipe={handleLoginAction} 
                isLoading={isLoading} 
                disabled={!dni || isLoading || !!error} 
                text="Deslizar para ingresar"
              />
            </div>

          </div>
        </div>

        {/* Footer Minimalista */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-1 rounded-full bg-white/10 mb-2"></div>
          <p className="text-slate-500 text-[11px] font-medium tracking-widest uppercase">
            Sistema de Gestión Privado
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;