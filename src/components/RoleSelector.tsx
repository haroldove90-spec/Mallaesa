import React from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { RoleType } from '../types';
import {
  Globe,
  User,
  ShieldCheck,
  TrendingUp,
  Truck,
  Receipt,
  ArrowRight
} from 'lucide-react';

interface RoleOption {
  id: RoleType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const ROLES: RoleOption[] = [
  {
    id: 'pagina_web',
    title: 'Página Web',
    subtitle: 'Sitio Oficial www.mallaesa.com',
    icon: <Globe className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  },
  {
    id: 'cliente',
    title: 'Cliente',
    subtitle: 'Portal Público & Cotizaciones',
    icon: <User className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  },
  {
    id: 'director',
    title: 'Director General / Gerencia',
    subtitle: 'Eduardo Siller',
    icon: <ShieldCheck className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  },
  {
    id: 'ventas',
    title: 'Ventas / Atención a Clientes',
    subtitle: 'CRM & Presupuestos',
    icon: <TrendingUp className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  },
  {
    id: 'operaciones',
    title: 'Operaciones / Logística e Instalaciones',
    subtitle: 'Órdenes de Trabajo & Cuadrillas',
    icon: <Truck className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  },
  {
    id: 'administracion',
    title: 'Administración y Finanzas',
    subtitle: 'Cobros & CFDI 4.0',
    icon: <Receipt className="w-8 h-8 md:w-9 md:h-9 text-[#898A82] group-hover:text-black transition-colors" />
  }
];

export const RoleSelector: React.FC = () => {
  const { setActiveRole } = useMallaesa();

  return (
    <div className="min-h-screen w-full bg-[#F8F9F8] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        {/* UN SOLO LOGO ARRIBA DE LOS ACCESOS (Con buen tamaño y sin encapsular) */}
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center animate-fade-in">
          <img
            src="https://appdesignproyectos.com/mallaesalogo.png"
            alt="MALLAESA Seguridad Perimetral"
            className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-102"
          />
          <div className="w-20 h-0.5 bg-[#898A82] mt-4 mb-2 rounded-full"></div>
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#898A82]">
            Sistema Integral de Seguridad Perimetral & Gestión Operativa
          </p>
        </div>

        {/* Cuadrícula de Roles: 2 Columnas Móvil / 3 Columnas Tablet / 6 Columnas Escritorio (Totalmente Simétrico) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-4.5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className="group flex flex-col items-center justify-between p-4 sm:p-5 bg-white border border-[#D8D9D5] rounded-xl hover:border-black hover:shadow-lg transition-all duration-200 cursor-pointer text-center min-h-[175px] sm:min-h-[195px] relative overflow-hidden"
            >
              {/* Indicador sutil de hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-black transition-colors"></div>

              {/* Ícono de Rol */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="p-3 rounded-full bg-stone-50 group-hover:bg-stone-100 transition-colors mb-2.5">
                  {role.icon}
                </div>

                {/* Nombre del Rol */}
                <span className="font-bold text-xs sm:text-sm text-black tracking-tight leading-snug group-hover:text-black">
                  {role.title}
                </span>

                {/* Subtítulo identificador breve */}
                <span className="text-[11px] text-stone-500 mt-1 font-medium leading-tight">
                  {role.subtitle}
                </span>
              </div>

              {/* Pie de tarjeta con flecha sutil */}
              <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-400 group-hover:text-black transition-colors">
                <span>Ingresar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
