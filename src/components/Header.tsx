import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DataManagementModal } from './DataManagementModal';
import { Download, LogOut, Database, UserCheck, Smartphone } from 'lucide-react';

const ROLE_LABELS: Record<string, { title: string; badge: string }> = {
  pagina_web: {
    title: 'Sitio Web Oficial www.mallaesa.com',
    badge: 'Página Web'
  },
  cotizador: {
    title: 'Cotizador & Catálogo Oficial',
    badge: 'Cotizador'
  },
  cliente: {
    title: 'Portal de Clientes',
    badge: 'Público'
  },
  director: {
    title: 'Eduardo Siller',
    badge: 'Director General / Gerencia'
  },
  ventas: {
    title: 'Ventas & Atención',
    badge: 'Comercial'
  },
  operaciones: {
    title: 'Operaciones & Logística',
    badge: 'Instalaciones en Campo'
  },
  administracion: {
    title: 'Administración & Finanzas',
    badge: 'Facturación / Cobros'
  }
};

export const Header: React.FC = () => {
  const { activeRole, setActiveRole } = useMallaesa();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showDataModal, setShowDataModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const roleInfo = activeRole ? ROLE_LABELS[activeRole] : null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert('Para instalar MALLAESA en tu dispositivo, pulsa los 3 puntos de tu navegador y selecciona "Instalar aplicación" o "Agregar a pantalla de inicio".');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logotipo del Sistema */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveRole(null)}
                className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
                title="Ir a selector de roles"
              >
                <img
                  src="https://appdesignproyectos.com/mallaesalogo.png"
                  alt="MALLAESA"
                  className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </button>
            </div>

            {/* Identificación del Rol Activo */}
            {roleInfo && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200">
                <UserCheck className="w-4 h-4 text-[#898A82]" />
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block leading-tight">
                    {roleInfo.badge}
                  </span>
                  <span className="text-xs font-bold text-black block leading-tight">
                    {roleInfo.title}
                  </span>
                </div>
              </div>
            )}

            {/* Acciones del Encabezado */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Gestión de Datos y Supabase */}
              <button
                onClick={() => setShowDataModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition"
                title="Borrar datos de muestra o configurar Supabase"
              >
                <Database className="w-3.5 h-3.5 text-[#898A82]" />
                <span className="hidden md:inline">Datos Demo / Supabase</span>
              </button>

              {/* Botón de Instalación Rápida de la Aplicación */}
              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-stone-800 rounded-lg shadow-xs transition cursor-pointer"
                  title="Instalar MALLAESA en este dispositivo"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Instalar</span>
                </button>
              )}

              {/* Botón de Cierre de Sesión (Regresa a selector limpio) */}
              <button
                onClick={() => setActiveRole(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-100 border border-stone-200 rounded-lg transition cursor-pointer"
                title="Cambiar de Rol o Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de rol visible solo en móvil */}
        {roleInfo && (
          <div className="sm:hidden px-4 py-1.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {roleInfo.badge}:
            </span>
            <span className="text-xs font-bold text-black">
              {roleInfo.title}
            </span>
          </div>
        )}
      </header>

      {/* Modal de datos de muestra y Supabase */}
      <DataManagementModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
      />

      {/* Modal instructivo para iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center space-y-4">
            <Smartphone className="w-10 h-10 text-black mx-auto" />
            <h4 className="font-bold text-base text-black">
              Instalar MALLAESA en iPhone / iPad
            </h4>
            <div className="text-xs text-stone-600 text-left space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <p>1. Pulsa el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba en Safari).</p>
              <p>2. Desplázate hacia abajo y selecciona <strong>«Agregar a la pantalla de inicio»</strong>.</p>
              <p>3. Pulsa <strong>«Agregar»</strong> en la esquina superior derecha.</p>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
