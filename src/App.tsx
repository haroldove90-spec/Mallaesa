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
import { OfficialQuoteCalculatorView } from './components/OfficialQuoteCalculatorView';
import { OfficialCatalogView } from './components/OfficialCatalogView';
import { QuoteHistoryView } from './components/QuoteHistoryView';
import { MallaesaChatbotWidget } from './components/MallaesaChatbotWidget';

function DashboardContent() {
  const { activeRole, currentModule, setCurrentModule } = useMallaesa();
  const [showSplash, setShowSplash] = useState(true);

  // When role changes, set default module if not already set
  useEffect(() => {
    if (activeRole) {
      const defaultModules: Record<string, string> = {
        pagina_web: 'inicio',
        cotizador: 'cotizador',
        cliente: 'cotizador',
        director: 'kpis',
        ventas: 'solicitudes',
        operaciones: 'ordenes',
        administracion: 'cuentas'
      };
      if (!currentModule || currentModule === 'inicio') {
        setCurrentModule(defaultModules[activeRole] || 'inicio');
      }
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
      ) : activeRole === 'pagina_web' ? (
        /* Rol Página Web: Sitio Oficial www.mallaesa.com a pantalla completa con navegación responsiva propia */
        <WebsitePortal
          activeModule={currentModule}
          onNavigateModule={setCurrentModule}
        />
      ) : (
        /* Si hay rol activo administrativo/operativo: Dashboard con Cabecera Unificada y Navegación Responsiva */
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
              {activeRole === 'cotizador' && (
                <>
                  {currentModule === 'cotizador' && (
                    <OfficialQuoteCalculatorView
                      onGoToHistory={() => setCurrentModule('historial')}
                    />
                  )}
                  {currentModule === 'catalogo' && (
                    <OfficialCatalogView
                      onGoToQuote={() => setCurrentModule('cotizador')}
                    />
                  )}
                  {currentModule === 'historial' && (
                    <QuoteHistoryView
                      onGoToQuote={() => setCurrentModule('cotizador')}
                    />
                  )}
                </>
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

      {/* Botón Flotante (FAB) y Ventana de Asistente Cotizador Mallaesa */}
      <MallaesaChatbotWidget />
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
