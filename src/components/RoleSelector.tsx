import React from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { RoleType } from '../types';

interface RoleOption {
  id: RoleType;
  title: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'cliente',
    title: 'Cliente'
  },
  {
    id: 'director',
    title: 'Director General / Gerencia'
  },
  {
    id: 'ventas',
    title: 'Ventas / Atención a Clientes'
  },
  {
    id: 'operaciones',
    title: 'Operaciones / Logística e Instalaciones'
  },
  {
    id: 'administracion',
    title: 'Administración y Finanzas'
  }
];

export const RoleSelector: React.FC = () => {
  const { setActiveRole } = useMallaesa();

  return (
    <div className="min-h-screen w-full bg-[#F8F9F8] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-6xl mx-auto">
        {/* Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio: Sin header, sin descripciones, solo nombre del rol y el logo */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-6">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className="group flex flex-col items-center justify-between p-4 sm:p-6 bg-white border border-[#D8D9D5] rounded-xl hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer text-center min-h-[160px] sm:min-h-[190px]"
            >
              {/* Logo Mallaesa */}
              <div className="flex-1 flex items-center justify-center w-full py-2">
                <img
                  src="https://appdesignproyectos.com/mallaesalogo.png"
                  alt="MALLAESA"
                  className="max-h-12 sm:max-h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              {/* Solo nombre del rol */}
              <span className="font-semibold text-xs sm:text-sm text-black tracking-tight pt-2 border-t border-stone-100 w-full group-hover:text-black">
                {role.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
