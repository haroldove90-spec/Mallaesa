import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DataManagementModal } from './DataManagementModal';
import { Download, LogOut, Database, UserCheck, Smartphone, Shield, ChevronDown, BookOpen } from 'lucide-react';
import { RoleType } from '../types';

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
  const { activeRole, setActiveRole, isSupabaseConnected, currentUser, logout, openUserManual } = useMallaesa();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showDataModal, setShowDataModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const isAdmin = currentUser?.role === 'director' || currentUser?.username === 'eduardo_siller' || currentUser?.username === 'haroldo90';
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
            {/* Logotipo del Sistema (Click para cambiar rol SOLO para admin) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isAdmin) {
                    setActiveRole(null);
                  }
                }}
                className={`flex items-center gap-2 group ${isAdmin ? 'cursor-pointer' : 'cursor-default'} focus:outline-hidden`}
                title={isAdmin ? 'Menú de roles (Acceso Administrador)' : 'MALLAESA Seguridad Perimetral'}
              >
                <img
                  src="https://appdesignproyectos.com/mallaesalogo.png"
                  alt="MALLAESA"
                  className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </button>
            </div>

            {/* Selector de Rol Exclusivo para Administrador / Dirección */}
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1.5 transition">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 leading-tight">
                    Navegación Admin
                  </span>
                  <select
                    value={activeRole || 'director'}
                    onChange={(e) => setActiveRole(e.target.value as RoleType)}
                    className="bg-transparent font-bold text-black text-xs cursor-pointer focus:outline-hidden pr-2"
                    title="Navegar a cualquier rol del sistema (Exclusivo Administrador)"
                  >
                    <option value="director">Dirección General (Eduardo Siller)</option>
                    <option value="administracion">Administración & Finanzas</option>
                    <option value="operaciones">Operaciones en Campo</option>
                    <option value="ventas">Ventas & CRM</option>
                    <option value="cotizador">Cotizador & Catálogo</option>
                    <option value="cliente">Portal Cliente</option>
                    <option value="pagina_web">Sitio Web Oficial</option>
                  </select>
                </div>
              </div>
            ) : (
              /* Identificación del Rol Activo y Empleado (Fijo, sin posibilidad de cambiar rol) */
              roleInfo && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200">
                  <UserCheck className="w-4 h-4 text-[#898A82]" />
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block leading-tight">
                      {currentUser ? currentUser.username : roleInfo.badge}
                    </span>
                    <span className="text-xs font-bold text-black block leading-tight">
                      {currentUser ? currentUser.fullName : roleInfo.title}
                    </span>
                  </div>
                </div>
              )
            )}

            {/* Acciones del Encabezado */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Manual de Usuario Oficial (Fácil acceso para cliente de 60-65 años) */}
              <button
                onClick={() => openUserManual(activeRole || undefined)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition cursor-pointer"
                title="Consultar manual de usuario de este rol o descargar en PDF"
              >
                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-extrabold">Manual</span>
                <span className="hidden sm:inline font-bold text-emerald-800">de Usuario</span>
                <span className="hidden md:inline-block text-[9px] bg-emerald-700 text-white font-black px-1.5 py-0.5 rounded uppercase">
                  PDF
                </span>
              </button>

              {/* Botón Gestión de Datos y Supabase */}
              <button
                onClick={() => setShowDataModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition cursor-pointer"
                title="Borrar datos de muestra o configurar Supabase"
              >
                <Database className="w-3.5 h-3.5 text-[#898A82]" />
                <span className="hidden md:inline">Supabase & Datos</span>
                <span
                  className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  title={isSupabaseConnected ? 'Conectado con Supabase' : 'Conectando con Supabase...'}
                />
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

              {/* Botón de Cierre de Sesión (Regresa al formulario de login) */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-100 border border-stone-200 rounded-lg transition cursor-pointer"
                title="Cerrar Sesión y volver al Login"
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
