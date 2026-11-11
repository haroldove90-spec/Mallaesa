import React, { useState } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import {
  TrendingUp,
  FileCheck,
  Building2,
  PieChart,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  Shield,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { QuoteHistoryView } from '../../components/QuoteHistoryView';
import { PurchaseOrdersView } from '../../components/PurchaseOrdersView';

export const DirectorDashboard: React.FC<{
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}> = ({ activeModule, onNavigateModule }) => {
  const {
    projects,
    formalQuotes,
    approvals,
    resolveApproval,
    invoices,
    inventory,
    directorTargetMargin,
    setDirectorTargetMargin
  } = useMallaesa();

  const [filterApprovalType, setFilterApprovalType] = useState<string>('todos');
  const [directorNotesInput, setDirectorNotesInput] = useState<string>('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [isEditingMargin, setIsEditingMargin] = useState(false);
  const [tempMarginInput, setTempMarginInput] = useState<number>(directorTargetMargin || 36.5);

  // KPIs Calculations
  const totalInvoiced = invoices
    .filter(i => i.status === 'timbrada')
    .reduce((sum, i) => sum + i.total, 0);

  const activeProjectsCount = projects.filter(
    p => p.status !== 'finalizado' && p.phase >= 2
  ).length;

  const totalQuotesSent = formalQuotes.length;
  const approvedQuotes = formalQuotes.filter(q => q.status === 'aprobada').length;
  const conversionRate = totalQuotesSent > 0 ? ((approvedQuotes / totalQuotesSent) * 100).toFixed(1) : '0';

  // Margen Real Calculado sobre Cotizaciones vs Margen Objetivo Configurable
  const totalCost = formalQuotes.reduce((sum, q) => sum + (q.rawMaterialsCost || (q.total * 0.635)), 0);
  const totalRevenue = formalQuotes.reduce((sum, q) => sum + q.total, 0);
  const realMarginCalculated = totalRevenue > 0
    ? (((totalRevenue - totalCost) / totalRevenue) * 100).toFixed(1)
    : '36.5';

  // Approvals filtering
  const pendingApprovals = approvals.filter(a => a.status === 'pendiente');
  const filteredApprovals = approvals.filter(a => {
    if (filterApprovalType === 'todos') return true;
    return a.type === filterApprovalType;
  });

  const handleApprove = (approvalId: string) => {
    resolveApproval(approvalId, 'aprobado', directorNotesInput || 'Autorizado por Eduardo Siller (Dirección General)');
    setSelectedApprovalId(null);
    setDirectorNotesInput('');
  };

  const handleReject = (approvalId: string) => {
    resolveApproval(approvalId, 'rechazado', directorNotesInput || 'Rechazado por exceder políticas de rentabilidad.');
    setSelectedApprovalId(null);
    setDirectorNotesInput('');
  };

  const validModules = ['kpis', 'aprobaciones', 'financiero', 'historial', 'ordenes_compra'];
  const resolvedTab = validModules.includes(activeModule) ? activeModule : 'kpis';

  return (
    <div className="space-y-6">
      {/* Barra de Pestañas Rápidas de Dirección */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'kpis', label: '1. Supervisión Ejecutiva & KPIs', icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
          { id: 'aprobaciones', label: `2. Aprobaciones (${pendingApprovals.length})`, icon: <CheckCircle2 className="w-4 h-4 text-amber-600" /> },
          { id: 'ordenes_compra', label: '3. Órdenes de Compra (OC)', icon: <Building2 className="w-4 h-4 text-blue-600" /> },
          { id: 'financiero', label: '4. Reportes Financieros', icon: <DollarSign className="w-4 h-4 text-purple-600" /> },
          { id: 'historial', label: `5. Historial (${formalQuotes.length})`, icon: <Clock className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = resolvedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigateModule?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-black'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          MÓDULO 1: DASHBOARD EJECUTIVO (KPIS)
         ======================================================== */}
      {resolvedTab === 'kpis' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Bienvenida Ejecutiva */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
                  Dirección General
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  <UserCheck className="w-3 h-3 text-[#898A82]" /> Eduardo Siller
                </span>
              </div>
              <h1 className="text-2xl font-bold text-black mt-1">
                Supervisión Ejecutiva & Rendimiento MALLAESA
              </h1>
              <p className="text-xs text-stone-600 mt-0.5">
                Métricas financieras consolidadas, margen de utilidad por obra y control operativo en tiempo real.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-semibold">Período:</span>
              <span className="text-xs font-bold text-black bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                Octubre 2026 (Mensual)
              </span>
            </div>
          </div>

          {/* Tarjetas KPI de Alto Impacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Ventas / Facturación */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Ingresos Cobrados
                </span>
                <div className="p-2 bg-stone-100 text-black rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-black block">
                  ${totalInvoiced.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs mes anterior
                </span>
              </div>
            </div>

            {/* KPI 2: Cotizaciones y Conversión */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Cotizaciones Enviadas
                </span>
                <div className="p-2 bg-stone-100 text-[#898A82] rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-black block">
                  {totalQuotesSent} <span className="text-sm font-normal text-stone-500">propuestas</span>
                </span>
                <span className="text-xs text-stone-600 font-semibold block mt-1">
                  Tasa de Cierre: <strong className="text-black font-bold">{conversionRate}%</strong> ({approvedQuotes} aprobadas)
                </span>
              </div>
            </div>

            {/* KPI 3: Proyectos Activos */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Proyectos en Obra
                </span>
                <div className="p-2 bg-stone-100 text-black rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-black block">
                  {activeProjectsCount} <span className="text-sm font-normal text-stone-500">obras</span>
                </span>
                <span className="text-xs text-stone-600 font-semibold block mt-1">
                  3 cuadrillas activas en campo
                </span>
              </div>
            </div>

            {/* KPI 4: Margen de Ganancia Dinámico */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Margen Bruto Real
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempMarginInput(directorTargetMargin || 36.5);
                    setIsEditingMargin(true);
                  }}
                  title="Configurar Margen Meta de Dirección"
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-[#898A82] hover:text-black rounded-lg transition cursor-pointer"
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-black block">
                    {realMarginCalculated}%
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    Number(realMarginCalculated) >= (directorTargetMargin || 35)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {Number(realMarginCalculated) >= (directorTargetMargin || 35) ? '✓ En Meta' : 'Bajo Meta'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-stone-500 font-semibold">
                  <span>Meta Configurada: <strong className="text-black">{directorTargetMargin}%</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempMarginInput(directorTargetMargin || 36.5);
                      setIsEditingMargin(true);
                    }}
                    className="text-[11px] text-[#898A82] hover:text-black underline font-bold cursor-pointer"
                  >
                    Ajustar
                  </button>
                </div>
              </div>

              {/* Popover / Mini-Modal de edición de Margen Meta */}
              {isEditingMargin && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-4 rounded-xl flex flex-col justify-between border-2 border-black z-20 shadow-xl">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1.5">
                    <span className="text-xs font-bold text-black uppercase">Definir Margen Objetivo</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingMargin(false)}
                      className="text-stone-400 hover:text-black p-0.5"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-1.5 py-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        step="0.5"
                        value={tempMarginInput}
                        onChange={e => setTempMarginInput(Number(e.target.value))}
                        className="w-20 p-1.5 text-center font-bold text-sm bg-stone-50 border border-stone-300 rounded-lg text-black focus:outline-hidden"
                      />
                      <span className="text-xs font-bold text-stone-600">% Objetivo</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {[30, 35, 36.5, 40].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTempMarginInput(m)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold transition cursor-pointer ${
                            tempMarginInput === m ? 'bg-black text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {m}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsEditingMargin(false)}
                      className="text-[11px] font-bold text-stone-500 hover:text-stone-800 px-2 py-1"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectorTargetMargin(tempMarginInput);
                        setIsEditingMargin(false);
                      }}
                      className="text-[11px] font-bold bg-black text-white px-3 py-1 rounded-md"
                    >
                      Guardar Meta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfica de Rendimiento y Desglose de Ventas por Producto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desglose por Sistema */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs lg:col-span-2">
              <h3 className="font-bold text-base text-black mb-1">
                Participación de Ventas por Línea de Producto
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Desglose volumétrico de metraje instalado en el período actual
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Malla Ciclónica Galvanizada', pct: 45, meters: '340 m', color: 'bg-black' },
                  { name: 'Reja de Acero Verde & Negra', pct: 25, meters: '185 m', color: 'bg-[#898A82]' },
                  { name: 'Concertina Helicoidal Arpón', pct: 18, meters: '135 m', color: 'bg-stone-600' },
                  { name: 'Malla Ganadera / Alambre Púas', pct: 12, meters: '250 m', color: 'bg-stone-400' }
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-black">{item.name}</span>
                      <span className="text-stone-600">{item.meters} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen de Aprobaciones Pendientes */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-black">Aprobaciones Clave</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {pendingApprovals.length} pendientes
                  </span>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    No hay solicitudes pendientes de autorización por el momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApprovals.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex justify-between font-bold text-black">
                          <span className="capitalize">{app.type}: {app.referenceFolio}</span>
                          <span>${app.amount.toLocaleString('es-MX')}</span>
                        </div>
                        <p className="text-stone-600 truncate">{app.clientOrProject}</p>
                        <p className="text-stone-400 text-[10px]">{app.requestedAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100">
                <button
                  onClick={() => {
                    if (onNavigateModule) onNavigateModule('aprobaciones');
                  }}
                  className="w-full py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1"
                >
                  Ir al Módulo de Aprobaciones
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: APROBACIONES CLAVE
         ======================================================== */}
      {resolvedTab === 'aprobaciones' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Módulo de Autorizaciones de Dirección General
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Autorización de descuentos comerciales a clientes y viáticos extraordinarios para cuadrillas de instalación.
              </p>
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              {['todos', 'descuento', 'viaticos'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterApprovalType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                    filterApprovalType === type
                      ? 'bg-black text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-black'
                  }`}
                >
                  {type === 'todos' ? 'Todos' : type}
                </button>
              ))}
            </div>
          </div>

          {filteredApprovals.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
              <CheckCircle2 className="w-12 h-12 text-[#898A82] mx-auto mb-2" />
              <p className="text-sm font-semibold text-black">No hay solicitudes en esta categoría.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-6 shadow-xs transition ${
                    item.status === 'pendiente'
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-stone-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.type === 'descuento'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-black">
                        {item.referenceFolio}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.status === 'pendiente'
                            ? 'bg-amber-100 text-amber-900'
                            : item.status === 'aprobado'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {item.status === 'pendiente'
                          ? 'Esperando Decisión'
                          : item.status === 'aprobado'
                          ? 'Autorizado'
                          : 'Rechazado'}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {item.requestedAt}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-stone-500 block">Solicitante:</span>
                      <span className="font-semibold text-black">{item.requestedBy}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-500 block">Cliente / Obra:</span>
                      <span className="font-semibold text-black">{item.clientOrProject}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-500 block">Monto en Cuestión:</span>
                      <span className="font-black text-black text-sm">
                        ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-stone-50 rounded-lg text-xs text-stone-700">
                    <strong className="text-black">Motivo técnico/comercial: </strong>
                    {item.reason}
                  </div>

                  {item.directorNotes && (
                    <div className="mt-2 text-xs text-stone-500 italic">
                      Observaciones de Dirección: "{item.directorNotes}"
                    </div>
                  )}

                  {/* Acciones de Aprobación */}
                  {item.status === 'pendiente' && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Nota o condición de aprobación (opcional)"
                        value={selectedApprovalId === item.id ? directorNotesInput : ''}
                        onChange={(e) => {
                          setSelectedApprovalId(item.id);
                          setDirectorNotesInput(e.target.value);
                        }}
                        className="w-full sm:w-80 text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-black"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Autorizar Operación
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-4 py-2 bg-stone-200 hover:bg-red-600 hover:text-white text-stone-800 text-xs font-semibold rounded-lg transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: REPORTES FINANCIEROS
         ======================================================== */}
      {resolvedTab === 'financiero' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Estado de Resultados & Control Financiero MALLAESA
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Estructura de costos, ingresos brutos por obra y margen neto de la operación.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-black text-xs font-semibold rounded-lg transition border border-stone-300"
            >
              <Printer className="w-4 h-4 text-[#898A82]" />
              Imprimir Reporte Financiero
            </button>
          </div>

          {/* Estado de Resultados Simplificado */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-bold text-base text-black border-b border-stone-200 pb-3">
              Estado de Resultados Consolidado (Periodo Acumulado)
            </h3>

            <div className="space-y-3 text-sm">
              {/* Ingresos */}
              <div className="flex justify-between py-2 border-b border-stone-100 font-bold text-black">
                <span>(+) Ingresos Brutos por Proyectos & Facturación</span>
                <span>$218,223.26 MXN</span>
              </div>

              {/* Costos directos */}
              <div className="pl-4 space-y-2 text-stone-600 text-xs">
                <div className="flex justify-between">
                  <span>(-) Costo de Materiales Galvanizados & Insumos</span>
                  <span>$82,925.00 MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Mano de Obra Cuadrillas & Especialistas</span>
                  <span>$48,300.00 MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Fletes, Viáticos & Combustible</span>
                  <span>$7,400.00 MXN</span>
                </div>
              </div>

              {/* Utilidad Bruta */}
              <div className="flex justify-between py-2.5 bg-stone-100 px-3 rounded-lg font-bold text-black border border-stone-200">
                <span>(=) Utilidad Bruta Operativa</span>
                <span className="text-emerald-700">$79,598.26 MXN (36.5%)</span>
              </div>

              {/* Gastos de Operación */}
              <div className="pl-4 space-y-2 text-stone-600 text-xs pt-2">
                <div className="flex justify-between">
                  <span>(-) Gastos Administrativos y Software</span>
                  <span>$12,500.00 MXN</span>
                </div>
                <div className="flex justify-between">
                  <span>(-) Publicidad & Prospección Digital</span>
                  <span>$6,800.00 MXN</span>
                </div>
              </div>

              {/* Utilidad Neta */}
              <div className="flex justify-between py-3 bg-black text-white px-4 rounded-xl font-bold text-base mt-4 shadow-sm">
                <span>(=) Utilidad Neta de Ejercicio</span>
                <span className="text-white font-mono">$60,298.26 MXN (27.6%)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO: HISTORIAL DE COTIZACIONES OFICIALES */}
      {resolvedTab === 'historial' && (
        <QuoteHistoryView />
      )}

      {/* MÓDULO: ÓRDENES DE COMPRA (OC) */}
      {resolvedTab === 'ordenes_compra' && (
        <PurchaseOrdersView />
      )}
    </div>
  );
};
