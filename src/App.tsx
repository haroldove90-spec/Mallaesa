import React, { useState, useEffect } from 'react';
import { MallaesaProvider, useMallaesa } from './context/MallaesaContext';
import { SplashScreen } from './components/SplashScreen';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Navigation, ROLE_MODULES } from './components/Navigation';
import { ClientPortal } from './views/client/ClientPortal';
import { DirectorDashboard } from './views/director/DirectorDashboard';
import { SalesPortal } from './views/sales/SalesPortal';
import { OperationsPortal } from './views/operations/OperationsPortal';
import { AdminPortal } from './views/admin/AdminPortal';

function DashboardContent() {
  const { activeRole } = useMallaesa();
  const [showSplash, setShowSplash] = useState(true);

  // Current active module inside the selected role
  const [currentModule, setCurrentModule] = useState<string>('cuestionario');

  // When role changes, set default module
  useEffect(() => {
    if (activeRole) {
      const defaultModules: Record<string, string> = {
        cliente: 'cuestionario',
        director: 'kpis',
        ventas: 'solicitudes',
        operaciones: 'ordenes',
        administracion: 'cuentas'
      };
      setCurrentModule(defaultModules[activeRole] || 'cuestionario');
    }
  }, [activeRole]);

  return (
    <>
      {/* Splash Screen sin encapsular logos */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Si no hay rol activo: Pantalla de Inicio con Cuadrícula limpia de Roles */}
      {!activeRole ? (
        <RoleSelector />
      ) : (
        /* Si hay rol activo: Dashboard con Cabecera Unificada y Navegación */
        <div className="min-h-screen bg-[#F8F9F8] flex flex-col selection:bg-neutral-800 selection:text-white">
          {/* Cabecera Institucional Unificada */}
          <Header />

          {/* Cuerpo Principal con Sidebar en Escritorio y Área de Trabajo Limpia */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
            {/* Navegación (Sidebar en escritorio y Bottom Bar en móvil) */}
            <Navigation
              currentModule={currentModule}
              onSelectModule={setCurrentModule}
            />

            {/* Área de Trabajo de Alto Rendimiento (Sin pestañas duplicadas) */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {activeRole === 'cliente' && (
                <ClientPortal activeModule={currentModule} />
              )}
              {activeRole === 'director' && (
                <DirectorDashboard activeModule={currentModule} />
              )}
              {activeRole === 'ventas' && (
                <SalesPortal activeModule={currentModule} />
              )}
              {activeRole === 'operaciones' && (
                <OperationsPortal activeModule={currentModule} />
              )}
              {activeRole === 'administracion' && (
                <AdminPortal activeModule={currentModule} />
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <MallaesaProvider>
      <DashboardContent />
    </MallaesaProvider>
  );
}
