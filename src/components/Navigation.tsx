import React from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { RoleType } from '../types';
import {
  FileText,
  Search,
  Grid,
  BarChart3,
  CheckSquare,
  DollarSign,
  Inbox,
  Calculator,
  Kanban,
  ClipboardList,
  Boxes,
  Camera,
  Receipt,
  FileCheck2,
  Wallet,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Layers
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const ROLE_MODULES: Record<RoleType, NavItem[]> = {
  cliente: [
    { id: 'cuestionario', label: 'Cotizar en Línea', icon: <Calculator className="w-5 h-5" /> },
    { id: 'estatus', label: 'Estatus de Proyecto', icon: <Search className="w-5 h-5" /> },
    { id: 'catalogo', label: 'Sistemas & Mallas', icon: <Grid className="w-5 h-5" /> }
  ],
  director: [
    { id: 'kpis', label: 'Dashboard Ejecutivo', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'aprobaciones', label: 'Aprobaciones Clave', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'financiero', label: 'Reportes Financieros', icon: <DollarSign className="w-5 h-5" /> }
  ],
  ventas: [
    { id: 'solicitudes', label: 'Bandeja Cuestionarios', icon: <Inbox className="w-5 h-5" /> },
    { id: 'cotizador', label: 'Generador Cotizaciones', icon: <FileText className="w-5 h-5" /> },
    { id: 'crm', label: 'CRM Prospectos', icon: <Kanban className="w-5 h-5" /> }
  ],
  operaciones: [
    { id: 'ordenes', label: 'Órdenes de Trabajo (OT)', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'inventario', label: 'Almacén & Inventario', icon: <Boxes className="w-5 h-5" /> },
    { id: 'campo', label: 'Bitácora & Firmas', icon: <Camera className="w-5 h-5" /> }
  ],
  administracion: [
    { id: 'cuentas', label: 'Cuentas por Cobrar', icon: <Receipt className="w-5 h-5" /> },
    { id: 'facturas', label: 'Facturación CFDI', icon: <FileCheck2 className="w-5 h-5" /> },
    { id: 'gastos', label: 'Nómina & Gastos', icon: <Wallet className="w-5 h-5" /> }
  ]
};

interface NavigationProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentModule, onSelectModule }) => {
  const { activeRole, setActiveRole, approvals, requests } = useMallaesa();

  if (!activeRole) return null;

  const modules = ROLE_MODULES[activeRole] || [];
  const pendingApprovalsCount = approvals.filter(a => a.status === 'pendiente').length;
  const newRequestsCount = requests.filter(r => r.status === 'nuevo').length;

  return (
    <>
      {/* ========================================================
          1. MENÚ LATERAL EN ESCRITORIO (SIDEBAR)
          Para pantallas grandes (md:flex), panel lateral completo
          con acceso directo a módulos y opciones de sesión.
         ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-stone-200 shrink-0 min-h-[calc(100vh-4.5rem)]">
        {/* Encabezado del Menú Lateral */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#898A82]" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Módulos del Sistema
            </span>
          </div>
        </div>

        {/* Lista de Módulos */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((item) => {
            const isActive = currentModule === item.id;
            const hasBadge =
              (item.id === 'aprobaciones' && pendingApprovalsCount > 0) ||
              (item.id === 'solicitudes' && newRequestsCount > 0);

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-[#898A82]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {hasBadge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-black' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.id === 'aprobaciones' ? pendingApprovalsCount : newRequestsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pie del Menú Lateral: Cambiar de Rol / Cerrar */}
        <div className="p-4 border-t border-stone-200 bg-stone-50">
          <button
            onClick={() => setActiveRole(null)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-600 hover:text-black hover:bg-stone-200/60 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-stone-400" />
              Cambiar Rol / Salir
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </aside>

      {/* ========================================================
          2. NAVEGACIÓN MÓVIL Y TABLET (BOTTOM BAR)
          Barra fija en parte inferior optimizada para uso táctil.
         ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg">
        <div className="flex items-center justify-around h-16 px-1 safe-area-pb">
          {modules.map((item) => {
            const isActive = currentModule === item.id;
            const hasBadge =
              (item.id === 'aprobaciones' && pendingApprovalsCount > 0) ||
              (item.id === 'solicitudes' && newRequestsCount > 0);

            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 relative transition ${
                  isActive ? 'text-black' : 'text-stone-500 hover:text-black'
                }`}
              >
                <div className="relative">
                  <div
                    className={`p-1 rounded-md transition ${
                      isActive ? 'bg-stone-200/80 text-black' : 'text-[#898A82]'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 font-medium tracking-tight truncate max-w-[80px] ${
                    isActive ? 'font-bold text-black' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
