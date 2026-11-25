import React, { useState, useEffect } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import {
  Database,
  Trash2,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  X,
  Copy,
  RefreshCw,
  Server,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_PROJECT_ID,
  SUPABASE_SQL_SCRIPT,
  SUPABASE_FIX_PERMISSIONS_SQL,
  testSupabaseConnection
} from '../lib/supabase';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    noSampleDataMode,
    setNoSampleDataMode,
    clearAllSampleData,
    restoreDemoData,
    requests,
    projects,
    formalQuotes,
    workOrders,
    invoices,
    suppliers,
    employees,
    attendanceRecords,
    syncWithSupabase,
    isSupabaseConnected
  } = useMallaesa();

  const [activeTab, setActiveTab] = useState<'demo' | 'supabase' | 'sql' | 'permisos'>('supabase');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'warning' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPermissionsSql, setCopiedPermissionsSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalRecords =
    requests.length +
    projects.length +
    formalQuotes.length +
    workOrders.length +
    invoices.length +
    suppliers.length +
    employees.length +
    attendanceRecords.length;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyPermissionsSql = () => {
    navigator.clipboard.writeText(SUPABASE_FIX_PERMISSIONS_SQL);
    setCopiedPermissionsSql(true);
    setTimeout(() => setCopiedPermissionsSql(false), 2500);
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Verificando conexión con Supabase...');
    const result = await testSupabaseConnection();
    if (result.success) {
      setConnectionStatus('success');
      setStatusMessage(result.message);
    } else {
      setConnectionStatus('error');
      setStatusMessage(result.message);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncWithSupabase();
      setSyncFeedback(res.message);
      handleTestConnection();
    } catch (e: any) {
      setSyncFeedback(`Error: ${e?.message || e}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Supabase Cloud
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  ID: {SUPABASE_PROJECT_ID}
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                Base de Datos Supabase & Gestión de Registros MALLAESA
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6 overflow-x-auto">
          {[
            { id: 'supabase', label: '1. Conexión & Diagnóstico', icon: <Server className="w-4 h-4" /> },
            { id: 'permisos', label: '2. Reparar Permisos (GRANT ALL)', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
            { id: 'sql', label: '3. Script DDL Completo (Tablas & RLS)', icon: <ShieldCheck className="w-4 h-4" /> },
            { id: 'demo', label: '4. Datos de Muestra & Producción', icon: <Trash2 className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-black text-black bg-white shadow-xs'
                  : 'border-transparent text-stone-600 hover:text-black'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ========================================================
              TAB 1: CONEXIÓN SUPABASE & ESTADO EN VIVO
             ======================================================== */}
          {activeTab === 'supabase' && (
            <div className="space-y-5">
              {/* ALERTA DE PERMISOS REQUERIDOS SI POSTGRESQL BLOQUEÓ TABLAS */}
              {(statusMessage.includes('permisos') || statusMessage.includes('permission denied') || connectionStatus === 'error') && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                        Solución requerida en Supabase: "permission denied for table ..."
                      </h5>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Tus tablas ya existen en Supabase, pero PostgreSQL necesita otorgar permisos <strong>GRANT ALL</strong> al rol público (<code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">anon</code>) para permitir guardar y consultar datos.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyPermissionsSql}
                      className="px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedPermissionsSql ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>¡Script de Permisos Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Script de Permisos (GRANT ALL)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('permisos')}
                      className="px-3 py-2 bg-white hover:bg-stone-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Ver Instrucciones Paso a Paso
                    </button>

                    <a
                      href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer sm:ml-auto"
                    >
                      <span>Abrir SQL Editor en Supabase</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Tarjeta de Estado de Conexión */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                connectionStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : connectionStatus === 'error'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${
                    connectionStatus === 'success'
                      ? 'bg-emerald-100 text-emerald-700'
                      : connectionStatus === 'error'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-stone-200 text-stone-700'
                  }`}>
                    {connectionStatus === 'success' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : connectionStatus === 'error' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                      Estatus del Proyecto
                    </span>
                    <h4 className="font-bold text-sm text-black">
                      {connectionStatus === 'testing'
                        ? 'Verificando con Supabase Cloud...'
                        : connectionStatus === 'success'
                        ? 'Proyecto Vinculado y Operativo'
                        : 'Atención: Permisos requeridos en Supabase'}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5 max-w-md">
                      {statusMessage || 'Conectado a https://uivyldmrbdwvbagsakij.supabase.co'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === 'testing' ? 'animate-spin' : ''}`} />
                    Probar Conexión
                  </button>
                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </button>
                </div>
              </div>

              {syncFeedback && (
                <div className="p-3 bg-stone-100 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Ficha Técnica de Configuración */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Parámetros del Proyecto Conectado
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block">Nombre del Proyecto:</span>
                    <strong className="text-black font-semibold">mallaesa@grupoinmobiliariamr.com's Project</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">ID del Proyecto:</span>
                    <strong className="text-black font-mono font-bold">{SUPABASE_PROJECT_ID}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-stone-500 block">Supabase URL:</span>
                    <code className="text-black font-mono text-[11px] bg-white p-1 rounded border border-stone-200 block mt-0.5 truncate">
                      {SUPABASE_URL}
                    </code>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-stone-500 block">Clave API Pública (Anon / Publishable):</span>
                    <code className="text-black font-mono text-[11px] bg-white p-1 rounded border border-stone-200 block mt-0.5 truncate">
                      {SUPABASE_ANON_KEY}
                    </code>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-stone-200">
                  <span className="text-[11px] text-stone-500">
                    Sincronización en la nube bidireccional (Guardado y Borrado activo).
                  </span>
                  <a
                    href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    Abrir Dashboard en Supabase <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: REPARACIÓN RÁPIDA DE PERMISOS (GRANT ALL)
             ======================================================== */}
          {activeTab === 'permisos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                      Solución Inmediata
                    </span>
                    <span className="text-xs font-bold text-stone-700">
                      Corrige: "permission denied for table ..."
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-black mt-1">
                    Script de Permisos & Row Level Security (RLS)
                  </h4>
                  <p className="text-xs text-stone-600">
                    Otorga a la clave anónima (anon) de Supabase los privilegios de lectura, escritura y políticas de seguridad en las tablas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPermissionsSql}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {copiedPermissionsSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Copiado con Éxito!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Script de Permisos</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guía de 3 pasos */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs text-amber-950 space-y-2">
                <span className="font-black uppercase tracking-wider text-[11px] block text-amber-900">
                  Instrucciones para aplicar en Supabase:
                </span>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-amber-900">
                  <li>
                    Haz clic en el botón superior <strong>"Copiar Script de Permisos"</strong>.
                  </li>
                  <li>
                    Abre el{' '}
                    <a
                      href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-black hover:text-emerald-700"
                    >
                      SQL Editor de tu proyecto Supabase ({SUPABASE_PROJECT_ID}) <ExternalLink className="w-3 h-3 inline" />
                    </a>.
                  </li>
                  <li>
                    Pega el código en la ventana de consulta y presiona el botón verde <strong>RUN</strong>.
                  </li>
                </ol>
                <div className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/80">
                  ⚡ <em>En cuanto presiones RUN, todas las advertencias desaparecerán y la sincronización quedará 100% activa.</em>
                </div>
              </div>

              {/* Bloque de Código SQL */}
              <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-stone-800">
                {SUPABASE_FIX_PERMISSIONS_SQL}
              </pre>
            </div>
          )}

          {/* ========================================================
              TAB 3: SCRIPT SQL DDL COMPLETO PARA SUPABASE
             ======================================================== */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-black">
                    Script DDL Oficial para el SQL Editor de Supabase
                  </h4>
                  <p className="text-xs text-stone-500">
                    Crea las 18 tablas de MALLAESA con tipado, JSONB para cotizaciones complejas y políticas de seguridad RLS.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center justify-center gap-1.5 py-2 px-4 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>¡Copiado al Portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Script SQL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Pasos Rápidos de Ejecución */}
              <div className="bg-stone-100 p-3 rounded-lg border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-black block">Pasos para ejecutar en tu Supabase:</span>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>Ingresa a tu proyecto: <a href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="font-bold underline text-black">Dashboard Supabase ({SUPABASE_PROJECT_ID})</a>.</li>
                  <li>En el menú de la izquierda, haz clic en el icono <strong>SQL Editor</strong>.</li>
                  <li>Presiona <strong>+ New query</strong>, pega el código copiado y haz clic en el botón verde <strong>RUN</strong>.</li>
                </ol>
              </div>

              <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-stone-800">
                {SUPABASE_SQL_SCRIPT}
              </pre>
            </div>
          )}

          {/* ========================================================
              TAB 3: CONTROL DE DATOS DE MUESTRA & PRODUCCIÓN
             ======================================================== */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              {/* Resumen de Registros */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                    Registros Activos en el Sistema
                  </span>
                  <div className="text-2xl font-black text-black mt-0.5">
                    {totalRecords} <span className="text-sm font-normal text-stone-500">registros totales</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-600 font-medium">
                  <div>• {employees.length} Empleados</div>
                  <div>• {attendanceRecords.length} Asistencias</div>
                  <div>• {formalQuotes.length} Cotizaciones</div>
                  <div>• {workOrders.length} OTs</div>
                  <div>• {projects.length} Proyectos</div>
                  <div>• {invoices.length} Facturas</div>
                  <div>• {suppliers.length} Proveedores</div>
                  <div>• {requests.length} Solicitudes</div>
                </div>
              </div>

              {/* Modo Producción Limpio */}
              <div className="border border-stone-200 rounded-xl p-4 bg-white flex items-start gap-3">
                <input
                  type="checkbox"
                  id="noSampleToggle"
                  checked={noSampleDataMode}
                  onChange={(e) => setNoSampleDataMode(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                />
                <label htmlFor="noSampleToggle" className="cursor-pointer text-sm">
                  <span className="font-bold text-black block">
                    Modo Producción Limpio: No volver a cargar datos de muestra
                  </span>
                  <span className="text-stone-500 text-xs block mt-1 leading-relaxed">
                    Al activar esta casilla o presionar el botón de borrado, la bandera se almacena de forma permanente tanto en este navegador como en la tabla <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-black">app_settings</code> de Supabase. <strong>Los registros de muestra jamás volverán a cargarse</strong> al recargar la página.
                  </span>
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    if (window.confirm('¿Confirmas que deseas borrar todos los registros de muestra del sistema y de Supabase? Esta acción activará permanentemente el modo producción limpio.')) {
                      clearAllSampleData();
                      alert('¡Todos los datos de muestra han sido eliminados de la base de datos Supabase y de la memoria local! El sistema ha quedado completamente limpio.');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar Todos los Datos de Muestra (Local & Supabase)
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas restaurar el conjunto de datos demo iniciales (Fases 1 a 5 y personal)?')) {
                      restoreDemoData();
                      alert('¡Datos demo restaurados y sincronizados con Supabase!');
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Datos Demo Iniciales
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-semibold text-stone-600">
              {isSupabaseConnected ? 'Conectado con Supabase' : 'Conectando con Supabase...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
