import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Eye,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  MessageCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useMallaesa } from '../context/MallaesaContext';
import { FormalQuote, QuoteItem } from '../types';
import { exportQuoteToPdf, IntelligentQuoteResult } from '../utils/quoteCalculator';

interface QuoteHistoryViewProps {
  onGoToQuote?: () => void;
}

export const QuoteHistoryView: React.FC<QuoteHistoryViewProps> = ({ onGoToQuote }) => {
  const { formalQuotes, deleteFormalQuote } = useMallaesa();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'con_margen' | 'aprobada' | 'enviada'>('todos');
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState<FormalQuote | null>(null);

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return formalQuotes.filter(quote => {
      const matchesSearch =
        quote.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.clientPhone && quote.clientPhone.includes(searchTerm)) ||
        quote.items.some(item => item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (quote.clientConcepts && quote.clientConcepts.some(c => c.description.toLowerCase().includes(searchTerm.toLowerCase())));

      if (!matchesSearch) return false;

      if (statusFilter === 'con_margen') {
        return (quote.profitMarginPercent ?? 0) > 0;
      }
      if (statusFilter === 'aprobada') {
        return quote.status === 'aprobada';
      }
      if (statusFilter === 'enviada') {
        return quote.status === 'enviada';
      }
      return true;
    });
  }, [formalQuotes, searchTerm, statusFilter]);

  // General statistics
  const stats = useMemo(() => {
    const totalQuotes = formalQuotes.length;
    const totalAmount = formalQuotes.reduce((acc, q) => acc + q.total, 0);
    const totalRawMaterialsCost = formalQuotes.reduce((acc, q) => acc + (q.rawMaterialsCost || q.subtotal), 0);
    const totalEstimatedProfit = formalQuotes.reduce((acc, q) => acc + (q.profitAmount || (q.subtotal * 0.2)), 0);
    const approvedCount = formalQuotes.filter(q => q.status === 'aprobada').length;

    return {
      totalQuotes,
      totalAmount,
      totalRawMaterialsCost,
      totalEstimatedProfit,
      approvedCount
    };
  }, [formalQuotes]);

  // Handle PDF Export
  const handleExportPdf = (quote: FormalQuote) => {
    // Transform FormalQuote into IntelligentQuoteResult
    const pdfQuote: IntelligentQuoteResult = {
      folio: quote.folio,
      date: quote.createdAt.split(' ')[0] || new Date().toISOString().split('T')[0],
      validUntil: '15 días naturales',
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientEmail: quote.clientEmail,
      projectAddress: quote.projectAddress,
      city: 'Monterrey, N.L.',
      serviceType: quote.serviceType,
      serviceLabel: 'Suministro Oficial de Mallas y Estructuras de Acero',
      linearMeters: quote.linearMeters,
      heightMeters: quote.heightMeters,
      terrainType: 'tierra',
      terrainLabel: 'Suministro y Acopio de Materiales',
      items: (quote.clientConcepts && quote.clientConcepts.length > 0) ? quote.clientConcepts : quote.items,
      subtotal: quote.subtotal,
      iva: quote.iva,
      total: quote.total,
      advance50: quote.advanceRequired,
      balance50: quote.balanceRemaining,
      estimatedWorkDays: quote.estimatedDays || 3,
      warrantyYears: 1,
      rawMaterials: quote.rawMaterials || quote.items,
      rawMaterialsCost: quote.rawMaterialsCost || quote.subtotal,
      profitMarginPercent: quote.profitMarginPercent ?? 20,
      profitAmount: quote.profitAmount || 0,
      clientConcepts: quote.clientConcepts
    };

    exportQuoteToPdf(pdfQuote);
  };

  const handleDelete = (quote: FormalQuote) => {
    if (window.confirm(`¿Estás seguro de eliminar del historial la cotización folio ${quote.folio} para ${quote.clientName}?`)) {
      deleteFormalQuote(quote.id);
      if (selectedQuoteForDetail?.id === quote.id) {
        setSelectedQuoteForDetail(null);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Encabezado Principal */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
                MALLAESA • Control Administrativo
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
                Uso Exclusivo Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2.5">
              <History className="w-7 h-7 text-black" />
              <span>Historial de Cotizaciones</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              Consulta, descarga y audita todas las cotizaciones generadas. Cada cotización guarda el registro de la <strong>materia prima interna</strong> seleccionada por el administrador, el <strong>margen de ganancia aplicado (20%)</strong> y los <strong>conceptos de producto final</strong> que se reflejan en el PDF formal del cliente.
            </p>
          </div>

          {onGoToQuote && (
            <button
              onClick={onGoToQuote}
              className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Crear Nueva Cotización</span>
            </button>
          )}
        </div>

        {/* Tarjetas de Métricas Ejecutivas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-700" />
              Total Cotizaciones
            </span>
            <div className="text-2xl font-black font-mono text-black">
              {stats.totalQuotes}
            </div>
            <span className="text-[10px] text-stone-500">Registradas en sistema</span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-stone-700" />
              Importe Total Cotizado
            </span>
            <div className="text-2xl font-black font-mono text-black">
              ${stats.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-stone-500">Con IVA incluido</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              Ganancia Estimada (+20%)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-900">
              ${stats.totalEstimatedProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Margen neto de utilidad</span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-stone-700" />
              Costo Materia Prima
            </span>
            <div className="text-2xl font-black font-mono text-stone-800">
              ${stats.totalRawMaterialsCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-stone-500">Costo base de materiales</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Input Buscador */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio (COT-INDE...), cliente, teléfono o concepto final..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-black font-medium focus:bg-white focus:outline-hidden focus:border-black transition"
          />
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'todos'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas ({formalQuotes.length})
          </button>
          <button
            onClick={() => setStatusFilter('con_margen')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'con_margen'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Con Margen +20%
          </button>
          <button
            onClick={() => setStatusFilter('enviada')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'enviada'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Vigentes / Enviadas
          </button>
          <button
            onClick={() => setStatusFilter('aprobada')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'aprobada'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Aprobadas
          </button>
        </div>
      </div>

      {/* Lista de Cotizaciones */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center space-y-3">
          <History className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-black">No se encontraron cotizaciones en el historial</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchTerm
              ? 'No hay registros que coincidan con tu término de búsqueda. Prueba con otro folio o nombre de cliente.'
              : 'Aún no se han generado cotizaciones. Ve al Cotizador, selecciona tu materia prima, asigna tus conceptos finales y genera el presupuesto.'}
          </p>
          {onGoToQuote && (
            <button
              onClick={onGoToQuote}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-xs mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Ir al Cotizador</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map(quote => {
            const hasRawMaterials = quote.rawMaterials && quote.rawMaterials.length > 0;
            const hasClientConcepts = quote.clientConcepts && quote.clientConcepts.length > 0;
            const margin = quote.profitMarginPercent ?? 20;
            const rawCost = quote.rawMaterialsCost || (quote.subtotal / (1 + margin / 100));
            const profit = quote.profitAmount || (quote.subtotal - rawCost);

            return (
              <div
                key={quote.id}
                className="bg-white border border-stone-200 hover:border-black rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 bg-black text-white rounded-lg">
                      {quote.folio}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        quote.status === 'aprobada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : quote.status === 'rechazada'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {quote.status === 'aprobada'
                        ? 'Cotización Aprobada'
                        : quote.status === 'enviada'
                        ? 'Enviada al Cliente'
                        : quote.status}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {quote.createdAt.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedQuoteForDetail(quote)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition cursor-pointer"
                      title="Ver desglose completo de materia prima y conceptos de venta"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-600" />
                      <span>Ver Detalle</span>
                    </button>
                    <button
                      onClick={() => handleExportPdf(quote)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Descargar presupuesto oficial para el cliente en PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Descargar PDF</span>
                    </button>
                    <a
                      href={`https://wa.me/52${(quote.clientPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(quote.clientName)},%20te%20comparto%20la%20cotizaci%C3%B3n%20${quote.folio}%20de%20MALLAESA%20por%20$${quote.total.toFixed(2)}%20MXN.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
                      title="Enviar mensaje por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(quote)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido en Dos Secciones: Datos del Cliente y Desglose Financiero */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Datos del Cliente y Conceptos Finales (Cols 1-7) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-stone-500" />
                        <h4 className="font-black text-stone-900 text-sm">
                          {quote.clientName}
                        </h4>
                      </div>
                      <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {quote.clientPhone}
                        </span>
                        {quote.projectAddress && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {quote.projectAddress}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conceptos Visibles al Cliente */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Concepto Final Cotizado al Cliente (PDF)
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Lo que ve el cliente
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {(hasClientConcepts ? quote.clientConcepts! : quote.items).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-stone-200 rounded-lg p-2 flex items-center justify-between text-xs"
                          >
                            <div className="font-bold text-black pr-2">
                              {item.description}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono font-bold text-black">
                                ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[10px] text-stone-500 block">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Auditoría Interna: Materia Prima + Margen (Cols 8-12) */}
                  <div className="lg:col-span-5 bg-stone-900 text-white rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                      <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        Desglose Interno (Admin)
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                        +{margin}% Margen
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-300">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Costo Materia Prima:</span>
                        <span className="font-mono text-white font-semibold">
                          ${rawCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400 font-semibold">
                        <span>Ganancia Neta (+{margin}%):</span>
                        <span className="font-mono">
                          +${profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-stone-800 pt-1.5">
                        <span className="text-stone-300">Subtotal Cliente:</span>
                        <span className="font-mono text-white font-bold">
                          ${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-stone-400">
                        <span>IVA 16%:</span>
                        <span className="font-mono">
                          ${quote.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-stone-800 pt-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase">Total Cliente:</span>
                      <span className="text-lg font-black font-mono text-white">
                        ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-[10px] font-normal text-stone-400">MXN</span>
                      </span>
                    </div>

                    {hasRawMaterials && (
                      <div className="text-[10px] text-stone-400 bg-stone-800/80 rounded-lg p-2 space-y-1">
                        <span className="font-bold text-stone-300 block">
                          Materia prima calculada ({quote.rawMaterials!.length} productos):
                        </span>
                        <p className="line-clamp-2 text-stone-400">
                          {quote.rawMaterials!.map(m => `${m.quantity} ${m.unit} ${m.description}`).join(' • ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE DETALLE Y AUDITORÍA COMPLETA */}
      {selectedQuoteForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-scale-in">
            {/* Encabezado del Modal */}
            <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 bg-white text-black rounded">
                    {selectedQuoteForDetail.folio}
                  </span>
                  <span className="text-xs text-stone-400">
                    Fecha: {selectedQuoteForDetail.createdAt}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  Auditoría de Cotización: {selectedQuoteForDetail.clientName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPdf(selectedQuoteForDetail)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedQuoteForDetail(null)}
                  className="p-2 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Resumen del Cliente */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Cliente / Razón Social</span>
                  <span className="text-sm font-bold text-black">{selectedQuoteForDetail.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Teléfono Móvil</span>
                  <span className="text-sm font-bold text-black">{selectedQuoteForDetail.clientPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Ubicación</span>
                  <span className="text-sm font-bold text-black">{selectedQuoteForDetail.projectAddress || 'Monterrey, N.L.'}</span>
                </div>
              </div>

              {/* SECCIÓN 1: Concepto Final Cotizado al Cliente (Lo que aparece en el PDF) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1. Conceptos que Aparecen en la Cotización del Cliente (PDF)</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    Vista Pública / Cliente
                  </span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 font-bold uppercase text-[10px] text-stone-700">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Concepto / Producto Final</th>
                        <th className="p-3 text-center">Cantidad</th>
                        <th className="p-3 text-center">Unidad</th>
                        <th className="p-3 text-right">P. Unitario</th>
                        <th className="p-3 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(selectedQuoteForDetail.clientConcepts && selectedQuoteForDetail.clientConcepts.length > 0
                        ? selectedQuoteForDetail.clientConcepts
                        : selectedQuoteForDetail.items
                      ).map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="p-3 font-mono text-stone-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-black">{item.description}</td>
                          <td className="p-3 text-center font-mono">{item.quantity}</td>
                          <td className="p-3 text-center text-stone-600">{item.unit}</td>
                          <td className="p-3 text-right font-mono text-stone-700">
                            ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-black">
                            ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECCIÓN 2: Desglose de Materia Prima Interna (Uso Exclusivo Administrador) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-black flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>2. Materia Prima Interna Utilizada (Costos de Fabricación)</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                    Privado / Solo Administrador
                  </span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 font-bold uppercase text-[10px] text-stone-700">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Materia Prima / Accesorio</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-center">Unidad</th>
                        <th className="p-3 text-right">Costo Unitario</th>
                        <th className="p-3 text-right">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(selectedQuoteForDetail.rawMaterials && selectedQuoteForDetail.rawMaterials.length > 0
                        ? selectedQuoteForDetail.rawMaterials
                        : selectedQuoteForDetail.items
                      ).map((m, idx) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="p-3 font-mono text-stone-400">{idx + 1}</td>
                          <td className="p-3 font-semibold text-stone-800">{m.description}</td>
                          <td className="p-3 text-center font-mono">{m.quantity}</td>
                          <td className="p-3 text-center text-stone-600">{m.unit}</td>
                          <td className="p-3 text-right font-mono text-stone-600">
                            ${m.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-stone-900">
                            ${m.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales y Cálculo de Utilidad */}
              <div className="bg-stone-900 text-white rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Cálculo Financiero y Ganancia
                  </span>
                  <div className="space-y-1 text-stone-300">
                    <div className="flex justify-between">
                      <span>Costo Base de Materia Prima:</span>
                      <span className="font-mono text-white font-bold">
                        ${(selectedQuoteForDetail.rawMaterialsCost || (selectedQuoteForDetail.subtotal * 0.8)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Margen de Ganancia (+{selectedQuoteForDetail.profitMarginPercent ?? 20}%):</span>
                      <span className="font-mono">
                        +${(selectedQuoteForDetail.profitAmount || (selectedQuoteForDetail.subtotal * 0.2)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-stone-800 pt-1 text-white">
                      <span>Subtotal de Venta al Cliente:</span>
                      <span className="font-mono font-bold">
                        ${selectedQuoteForDetail.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:border-l sm:border-stone-800 sm:pl-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                    Presupuesto Final Cliente
                  </span>
                  <div className="space-y-1 text-stone-300">
                    <div className="flex justify-between">
                      <span>IVA (16% Trasladado):</span>
                      <span className="font-mono">${selectedQuoteForDetail.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white">
                      <span>Total Cotización:</span>
                      <span className="font-mono text-white">
                        ${selectedQuoteForDetail.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400 text-[11px]">
                      <span>Anticipo 50%: ${selectedQuoteForDetail.advanceRequired.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      <span>Finiquito 50%: ${selectedQuoteForDetail.balanceRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Folio: <strong>{selectedQuoteForDetail.folio}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedQuoteForDetail(null)}
                  className="px-4 py-2 bg-white hover:bg-stone-200 border border-stone-300 rounded-xl text-stone-800 font-bold text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleExportPdf(selectedQuoteForDetail)}
                  className="flex items-center gap-2 px-5 py-2 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
