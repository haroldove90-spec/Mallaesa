import React, { useState, useEffect } from 'react';
import { MallaesaProvider, useMallaesa } from './context/MallaesaContext';
import { SplashScreen } from './components/SplashScreen';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { WebsitePortal } from './views/website/WebsitePortal';
import { ClientPortal } from './views/client/ClientPortal';
import { DirectorDashboard } from './views/director/DirectorDashboard';
import { SalesPortal } from './views/sales/SalesPortal';
import { OperationsPortal } from './views/operations/OperationsPortal';
import { AdminPortal } from './views/admin/AdminPortal';

function DashboardContent() {
  const { activeRole } = useMallaesa();
  const [showSplash, setShowSplash] = useState(true);

  // Current active module inside the selected role
  const [currentModule, setCurrentModule] = useState<string>('inicio');

  // When role changes, set default module
  useEffect(() => {
    if (activeRole) {
      const defaultModules: Record<string, string> = {
        pagina_web: 'inicio',
        cliente: 'cuestionario',
        director: 'kpis',
        ventas: 'solicitudes',
        operaciones: 'ordenes',
        administracion: 'cuentas'
      };
      setCurrentModule(defaultModules[activeRole] || 'inicio');
    }
  }, [activeRole]);

  return (
    <>
      {/* Splash Screen sin encapsular logos */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Si no hay rol activo: Pantalla de Inicio con un solo logo arriba y tarjetas limpias */}
      {!activeRole ? (
        <RoleSelector />
      ) : (
        /* Si hay rol activo: Dashboard con Cabecera Unificada y Navegación Responsiva */
        <div className="min-h-screen bg-[#F8F9F8] flex flex-col selection:bg-neutral-800 selection:text-white">
          {/* Cabecera Institucional Unificada */}
          <Header />

          {/* Cuerpo Principal con Sidebar en Escritorio y Bottom Bar en Móvil */}
          <div className="flex-1 flex max-w-7xl w-full mx-auto pb-24 md:pb-8">
            {/* Navegación (Sidebar en escritorio y Bottom Bar en móvil) */}
            <Navigation
              currentModule={currentModule}
              onSelectModule={setCurrentModule}
            />

            {/* Área de Trabajo de Alto Rendimiento (Sin pestañas duplicadas) */}
            <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto">
              {activeRole === 'pagina_web' && (
                <WebsitePortal
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
              )}
              {activeRole === 'cliente' && (
                <ClientPortal
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
              )}
              {activeRole === 'director' && (
                <DirectorDashboard
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
              )}
              {activeRole === 'ventas' && (
                <SalesPortal
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
              )}
              {activeRole === 'operaciones' && (
                <OperationsPortal
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
              )}
              {activeRole === 'administracion' && (
                <AdminPortal
                  activeModule={currentModule}
                  onNavigateModule={setCurrentModule}
                />
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
