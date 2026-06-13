import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import { verifyDni } from '../../service/authService'; 
import SwipeButton from '../../components/SwipeButton/SwipeButton'; 

const Login = () => {
  // 1. Estados
  const [dni, setDni] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Hooks de navegación y contexto
  const navigate = useNavigate();
  const { signin } = useAuth();

  // 3. Funciones de validación y manejo de inputs
  const isValidDniFormat = (value) => {
    const dniRegex = /^\d{7,8}$/;
    return dniRegex.test(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setDni(value);
      setError(''); 
    }
  };

  const handleLoginAction = async () => {
    if (!isValidDniFormat(dni)) {
      setError('El DNI debe contener entre 7 y 8 números.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyDni(dni);
      
      if (response.success) {
        // Guardamos los datos en el contexto
        signin(response.user); 
        localStorage.setItem('nexus_token', response.token);
        
        // --- LA MAGIA DE LA REDIRECCIÓN INTELIGENTE ---
        // Verificamos de forma segura (?.) el rol del usuario
        if (response.user?.role === 'super_adm') {
          navigate('/staff'); // Vos vas directo a tu panel
        } else {
          navigate('/'); // Los alumnos y profesores van al Home
        }
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al intentar ingresar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            NEXUS GYM
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Bienvenidos
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-zinc-700 mb-2">
             Ingrese su DNI para acceder
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              disabled={isLoading}
              value={dni}
              onChange={handleInputChange} 
              placeholder="Ej: 12345678"
              className={`
                block w-full px-4 py-3 text-zinc-900 bg-zinc-50 border rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors duration-200 
                ${error ? 'border-red-300 focus:ring-red-400 focus:border-red-400' : 'border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900'} 
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 font-medium animate-pulse">
                {error}
              </p>
            )}
          </div>

          <SwipeButton 
            onSwipe={handleLoginAction} 
            isLoading={isLoading} 
            disabled={!dni || isLoading || !!error} 
            text="Desliza para ingresar"
          />
        </div>

      </div>
    </div>
  );
};

export default Login;