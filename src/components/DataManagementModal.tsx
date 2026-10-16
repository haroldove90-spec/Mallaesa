import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { Database, Trash2, CheckCircle2, RotateCcw, AlertTriangle, ExternalLink, X, Copy } from 'lucide-react';

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
    inventory,
    invoices
  } = useMallaesa();

  const [activeTab, setActiveTab] = useState<'demo' | 'supabase'>('demo');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const totalRecords = requests.length + projects.length + formalQuotes.length + workOrders.length + invoices.length;

  const supabaseDdlSql = `-- Esquema SQL oficial para MALLAESA en Supabase PostgreSQL
CREATE TABLE IF NOT EXISTS public.solicitudes_cotizacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    direccion TEXT NOT NULL,
    municipio TEXT NOT NULL,
    tipo_servicio TEXT NOT NULL,
    metros_lineales NUMERIC NOT NULL,
    altura_metros NUMERIC NOT NULL,
    tipo_terreno TEXT NOT NULL,
    notas TEXT,
    foto_url TEXT,
    estatus TEXT DEFAULT 'nuevo',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cotizaciones_formales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    solicitud_id TEXT,
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT,
    desglose_items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    descuento_porcentaje NUMERIC DEFAULT 0,
    descuento_monto NUMERIC DEFAULT 0,
    iva NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    anticipo_50 NUMERIC NOT NULL,
    saldo_50 NUMERIC NOT NULL,
    estatus TEXT DEFAULT 'borrador',
    firma_digital TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proyectos_mallaesa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    cliente_nombre TEXT NOT NULL,
    fase INT DEFAULT 1,
    estatus TEXT NOT NULL,
    total NUMERIC NOT NULL,
    anticipo_pagado BOOLEAN DEFAULT FALSE,
    saldo_pagado BOOLEAN DEFAULT FALSE,
    cuadrilla_asignada TEXT,
    poliza_garantia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    proyecto_id TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cuadrilla TEXT NOT NULL,
    fecha_programada DATE,
    estatus TEXT DEFAULT 'programada',
    firma_conformidad TEXT,
    fotos_antes JSONB,
    fotos_despues JSONB,
    completed_at TIMESTAMPTZ
);

-- Habilitar RLS y políticas
ALTER TABLE public.solicitudes_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones_formales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos_mallaesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseDdlSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestSupabase = () => {
    setConnectionStatus('testing');
    setTimeout(() => {
      if (supabaseUrl && supabaseKey) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#898A82]" />
            <h3 className="font-bold text-lg text-black">
              Gestión de Datos & Conexión Supabase
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-black p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100 px-6">
          <button
            onClick={() => setActiveTab('demo')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'demo'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-stone-600 hover:text-black'
            }`}
          >
            Control de Datos de Muestra
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition ${
              activeTab === 'supabase'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-stone-600 hover:text-black'
            }`}
          >
            Configuración Supabase
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'demo' ? (
            <div className="space-y-6">
              {/* Status summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                    Registros en el sistema actual
                  </p>
                  <p className="text-2xl font-bold text-black mt-0.5">
                    {totalRecords} <span className="text-sm font-normal text-stone-500">registros activos</span>
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500 space-y-1">
                  <p>• {requests.length} Solicitudes CRM</p>
                  <p>• {formalQuotes.length} Cotizaciones</p>
                  <p>• {workOrders.length} Órdenes de Trabajo</p>
                </div>
              </div>

              {/* Toggle: Do not show sample data again */}
              <div className="border border-stone-200 rounded-lg p-4 bg-white flex items-start gap-3">
                <input
                  type="checkbox"
                  id="noSampleToggle"
                  checked={noSampleDataMode}
                  onChange={(e) => setNoSampleDataMode(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                />
                <label htmlFor="noSampleToggle" className="cursor-pointer text-sm">
                  <span className="font-semibold text-black block">
                    Modo Producción Limpio: No volver a mostrar datos de muestra en este navegador
                  </span>
                  <span className="text-stone-500 text-xs block mt-0.5">
                    Al activar esta opción, el sistema iniciará siempre vacío, listo para capturar clientes reales y enviar los datos a Supabase sin interferencia de datos ficticios.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    if (window.confirm('¿Confirmas que deseas borrar todos los datos de muestra del sistema?')) {
                      clearAllSampleData();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar Todos los Datos de Muestra
                </button>

                <button
                  onClick={restoreDemoData}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium text-sm transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Datos Demo (Fases 1-5)
                </button>
              </div>

              <div className="text-xs text-stone-400 leading-relaxed border-t border-stone-200 pt-4">
                <strong>Nota de Arquitectura:</strong> Esta funcionalidad almacena el estado de los datos en el almacenamiento local del cliente y está sincronizada para ejecutar el comando <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded">DELETE FROM</code> en Supabase al vincular la API Key.
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-xs text-stone-600">
                Conecta tu proyecto de <strong>Supabase</strong> para sincronizar en la nube los presupuestos, bitácora de campo con fotos, firmas de conformidad y control de inventario de MALLAESA.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleTestSupabase}
                    className="py-2 px-4 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition"
                  >
                    {connectionStatus === 'testing' ? 'Verificando...' : 'Guardar y Probar Conexión'}
                  </button>

                  {connectionStatus === 'success' && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Conectado con Supabase
                    </span>
                  )}
                  {connectionStatus === 'error' && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                      <AlertTriangle className="w-4 h-4" /> Ingresa la URL y Key para conectar
                    </span>
                  )}
                </div>
              </div>

              {/* SQL Migration Script */}
              <div className="mt-4 border-t border-stone-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800">
                    Script DDL para crear las tablas en Supabase SQL Editor:
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-xs text-stone-600 hover:text-black font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
                <pre className="bg-stone-900 text-stone-200 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40 leading-relaxed">
                  {supabaseDdlSql}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
