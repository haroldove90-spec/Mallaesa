import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, setActiveRole } = useMallaesa();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Por favor ingresa tu nombre de usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await login(username, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      setErrorMessage('Error al intentar iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9F8] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 selection:bg-black selection:text-white">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* LOGO OFICIAL MALLAESA */}
        <div className="flex flex-col items-center text-center mb-8">
          <img
            src="https://appdesignproyectos.com/mallaesalogo.png"
            alt="MALLAESA Seguridad Perimetral"
            className="h-20 sm:h-24 w-auto object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-102"
          />
          <div className="w-16 h-0.5 bg-[#898A82] mt-4 mb-2 rounded-full" />
          <h2 className="text-xl font-bold text-black tracking-tight">
            Acceso al Sistema
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            MALLAESA Seguridad Perimetral & Gestión Operativa
          </p>
        </div>

        {/* TARJETA DEL FORMULARIO DE ACCESO */}
        <div className="bg-white border border-[#D8D9D5] rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-black" />

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo 1: Nombre de usuario */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Nombre de usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Ingresa tu nombre de usuario"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-hidden focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition"
                />
              </div>
            </div>

            {/* Campo 2: Contraseña con Ícono del Ojito */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-black placeholder:text-stone-400 focus:outline-hidden focus:border-black focus:bg-white focus:ring-1 focus:ring-black transition"
                />
                {/* ÍCONO DEL OJITO PARA VER/OCULTAR CONTRASEÑA */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 p-1.5 text-stone-400 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-black" />
                  ) : (
                    <Eye className="w-5 h-5 text-stone-400 hover:text-black" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de Iniciar Sesión */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-black hover:bg-stone-800 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ACCESO DIRECTO AL SITIO WEB PÚBLICO O COTIZADOR ABIERTO */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-500">
            ¿Deseas consultar el catálogo o cotizar sin iniciar sesión?
          </p>
          <div className="mt-1 flex items-center justify-center gap-3 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveRole('pagina_web')}
              className="text-[#898A82] hover:text-black underline cursor-pointer"
            >
              Sitio Web Oficial
            </button>
            <span className="text-stone-300">•</span>
            <button
              type="button"
              onClick={() => setActiveRole('cotizador')}
              className="text-[#898A82] hover:text-black underline cursor-pointer"
            >
              Cotizador Inteligente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
