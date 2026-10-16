import React, { useState } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import { QuoteRequest, FormalQuote, QuoteItem, ServiceType } from '../../types';
import confetti from 'canvas-confetti';
import {
  Inbox,
  Calculator,
  Kanban,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Printer,
  Mail,
  Phone,
  MapPin,
  Maximize2,
  Clock,
  UserCheck,
  ShieldCheck,
  Download
} from 'lucide-react';

export const SalesPortal: React.FC<{ activeModule: string }> = ({ activeModule }) => {
  const {
    requests,
    formalQuotes,
    createFormalQuote,
    sendQuoteToClient,
    requestDiscountApproval,
    projects
  } = useMallaesa();

  // Selected request for quotation generator
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests.length > 0 ? requests[0].id : ''
  );

  // Quote builder fields
  const [builderItems, setBuilderItems] = useState<QuoteItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [activePreviewQuote, setActivePreviewQuote] = useState<FormalQuote | null>(null);

  // Search in CRM
  const [crmSearch, setCrmSearch] = useState('');

  // When a request is selected, auto-calculate initial parametric materials breakdown
  const handleSelectRequestToQuote = (req: QuoteRequest) => {
    setSelectedRequestId(req.id);

    const meters = req.linearMeters || 100;
    const rolls = Math.ceil(meters / 20);
    const linePosts = Math.ceil(meters / 3);
    const cornerPosts = 4;
    const topPipes = Math.ceil(meters / 6);
    const clamps = linePosts * 3;
    const concreteBags = Math.ceil(linePosts * 0.5);

    const generatedItems: QuoteItem[] = [
      {
        id: '1',
        description: `Malla Ciclónica Galvanizada Calibre 10.5 de ${req.heightMeters.toFixed(2)}m (${rolls} rollos)`,
        quantity: rolls,
        unit: 'Rollo 20m',
        unitPrice: req.heightMeters > 2 ? 1850 : 1450,
        total: rolls * (req.heightMeters > 2 ? 1850 : 1450)
      },
      {
        id: '2',
        description: `Poste de Línea Galvanizado 48mm x ${(req.heightMeters + 0.5).toFixed(2)}m`,
        quantity: linePosts,
        unit: 'Pieza',
        unitPrice: 210,
        total: linePosts * 210
      },
      {
        id: '3',
        description: `Poste Esquinero y Arranque Reforzado 60mm`,
        quantity: cornerPosts,
        unit: 'Pieza',
        unitPrice: 340,
        total: cornerPosts * 340
      },
      {
        id: '4',
        description: `Tubo Superior / Marco Galvanizado 38mm x 6.00m`,
        quantity: topPipes,
        unit: 'Tramo',
        unitPrice: 260,
        total: topPipes * 260
      },
      {
        id: '5',
        description: `Accesorios de Fijación (Abrazaderas, soleras y tornillería)`,
        quantity: clamps,
        unit: 'Kit',
        unitPrice: 22,
        total: clamps * 22
      },
      {
        id: '6',
        description: `Cemento Tolteca para zapatas de postes (${req.terrainType})`,
        quantity: concreteBags,
        unit: 'Saco 50kg',
        unitPrice: 245,
        total: concreteBags * 245
      },
      {
        id: '7',
        description: `Mano de obra especializada en excavación, plomeado y enmallado`,
        quantity: meters,
        unit: 'Metro lineal',
        unitPrice: 120,
        total: meters * 120
      },
      {
        id: '8',
        description: `Flete y viáticos de entrega en obra (${req.city})`,
        quantity: 1,
        unit: 'Servicio',
        unitPrice: 1200,
        total: 1200
      }
    ];

    setBuilderItems(generatedItems);
    setDiscountPercent(0);
  };

  // Add item manually to quote
  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: String(Date.now()),
      description: 'Material o accesorio adicional',
      quantity: 1,
      unit: 'Pieza',
      unitPrice: 500,
      total: 500
    };
    setBuilderItems([...builderItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setBuilderItems(
      builderItems.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setBuilderItems(builderItems.filter(item => item.id !== id));
  };

  // Totals calculations
  const subtotal = builderItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const subtotalNeto = subtotal - discountAmount;
  const iva = Number((subtotalNeto * 0.16).toFixed(2));
  const total = Number((subtotalNeto + iva).toFixed(2));
  const advance50 = Number((total * 0.5).toFixed(2));

  const handleGenerateQuote = () => {
    if (!selectedRequestId) {
      alert('Por favor selecciona una solicitud de la bandeja.');
      return;
    }
    const createdQuote = createFormalQuote(
      selectedRequestId,
      builderItems,
      discountPercent,
      estimatedDays
    );
    setActivePreviewQuote(createdQuote);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
    alert(`¡Cotización formal ${createdQuote.folio} generada con éxito!`);
  };

  const handleSendToClientEmail = (quoteId: string) => {
    sendQuoteToClient(quoteId);
    alert('Cotización enviada exitosamente al correo del cliente en formato PDF oficial.');
  };

  const currentRequest = requests.find(r => r.id === selectedRequestId);

  return (
    <div className="space-y-6">
      {/* ========================================================
          MÓDULO 1: BANDEJA DE ENTRADA DE SOLICITUDES
         ======================================================== */}
      {activeModule === 'solicitudes' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Bandeja de Cuestionarios Recibidos (Leads Web)
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Solicitudes de cotización enviadas de forma autónoma por clientes en el portal interactivo.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1.5 bg-stone-100 rounded-lg text-stone-700 border border-stone-200">
                Total solicitudes: <strong>{requests.length}</strong>
              </span>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
              <Inbox className="w-12 h-12 text-[#898A82] mx-auto mb-2" />
              <p className="font-semibold text-black">No hay cuestionarios pendientes.</p>
              <p className="text-xs mt-1">Los nuevos clientes que coticen en el portal aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req) => {
                const isQuoteGenerated = formalQuotes.some(q => q.requestId === req.id || q.folio === req.folio);

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-black transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Cabecera Tarjeta */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                          {req.folio}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            req.status === 'nuevo'
                              ? 'bg-blue-100 text-blue-900'
                              : req.status === 'cotizado'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      {/* Datos del Cliente */}
                      <div className="mt-3 space-y-1">
                        <h3 className="font-bold text-sm text-black">{req.clientName}</h3>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#898A82]" /> {req.clientPhone}
                        </p>
                        <p className="text-xs text-stone-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#898A82]" /> {req.clientEmail}
                        </p>
                        <p className="text-xs text-stone-600 flex items-center gap-1 pt-1">
                          <MapPin className="w-3 h-3 text-[#898A82]" /> {req.city}
                        </p>
                      </div>

                      {/* Especificaciones Técnicas */}
                      <div className="mt-4 p-3 bg-stone-50 rounded-lg text-xs grid grid-cols-2 gap-2 border border-stone-200/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Sistema</span>
                          <span className="font-semibold text-black capitalize">
                            {req.serviceType.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Metros y Altura</span>
                          <span className="font-semibold text-black">
                            {req.linearMeters}m x {req.heightMeters}m
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Terreno</span>
                          <span className="font-semibold text-black capitalize">
                            {req.terrainType}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">Ingreso</span>
                          <span className="font-mono text-[10px] text-stone-600">
                            {req.createdAt.split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Foto o Croquis si existe */}
                      {req.photoUrl && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                            Foto / Croquis adjunto:
                          </span>
                          <img
                            src={req.photoUrl}
                            alt="Croquis"
                            className="h-24 w-full object-cover rounded-lg border border-stone-200"
                          />
                        </div>
                      )}

                      {req.notes && (
                        <p className="mt-3 text-xs text-stone-600 bg-stone-50 p-2 rounded italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Botón de Acción */}
                    <div className="mt-5 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => {
                          handleSelectRequestToQuote(req);
                          // Click module cotizador
                          const btn = document.querySelector('button[data-module="cotizador"]') as HTMLButtonElement;
                          if (btn) btn.click();
                        }}
                        className="w-full py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <Calculator className="w-3.5 h-3.5 text-stone-300" />
                        {isQuoteGenerated ? 'Revisar / Modificar Cotización' : 'Calcular Cotización Formal'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: GENERADOR DE COTIZACIONES EN LÍNEA
         ======================================================== */}
      {activeModule === 'cotizador' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Generador Técnico de Presupuestos MALLAESA
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Estructuración paramétrica de materiales, mano de obra, viáticos y condiciones comerciales.
              </p>
            </div>

            {/* Selector de Solicitud */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">Solicitud:</span>
              <select
                value={selectedRequestId}
                onChange={(e) => {
                  const req = requests.find(r => r.id === e.target.value);
                  if (req) handleSelectRequestToQuote(req);
                }}
                className="text-xs font-semibold p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.folio} - {r.clientName} ({r.linearMeters}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentRequest && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Calculadora y Desglose de Materiales */}
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-black flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-[#898A82]" />
                      Desglose de Materiales, Mano de Obra y Equipos
                    </h3>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-xs font-bold text-black bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Concepto
                    </button>
                  </div>

                  {/* Tabla de Conceptos */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2 px-2">Descripción del Material / Mano de Obra</th>
                          <th className="py-2 px-2 text-center w-16">Cant.</th>
                          <th className="py-2 px-2 text-center w-20">Unidad</th>
                          <th className="py-2 px-2 text-right w-24">P. Unit.</th>
                          <th className="py-2 px-2 text-right w-24">Total</th>
                          <th className="py-2 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {builderItems.map((item) => (
                          <tr key={item.id} className="hover:bg-stone-50/50">
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent hover:border-stone-300 focus:border-black focus:outline-hidden text-xs text-black font-medium"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                                className="w-14 text-center bg-stone-50 border border-stone-200 rounded p-1 text-xs font-semibold"
                              />
                            </td>
                            <td className="py-2 px-2 text-center text-stone-500">
                              {item.unit}
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                                className="w-20 text-right bg-stone-50 border border-stone-200 rounded p-1 text-xs font-semibold"
                              />
                            </td>
                            <td className="py-2 px-2 text-right font-bold text-black">
                              ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-stone-400 hover:text-red-600 p-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Parámetros Comerciales */}
                  <div className="mt-6 pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">
                        Descuento Comercial (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-24 p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-black"
                        />
                        <span className="text-xs text-stone-500">%</span>
                        {discountPercent > 8 && (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Requiere aprobación de Eduardo Siller
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-black mb-1">
                        Tiempo Estimado de Instalación
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={estimatedDays}
                          onChange={(e) => setEstimatedDays(Number(e.target.value))}
                          className="w-24 p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-black"
                        />
                        <span className="text-xs text-stone-500">días hábiles en obra</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen de Totales y Emisión */}
              <div className="space-y-5">
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-black border-b border-stone-100 pb-3">
                    Resumen Financiero de la Propuesta
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal Materiales & MO:</span>
                      <span className="font-semibold text-black">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between text-purple-700 font-medium">
                        <span>Descuento ({discountPercent}%):</span>
                        <span>-${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>IVA (16%):</span>
                      <span className="font-semibold text-black">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="flex justify-between text-base font-black text-black pt-2 border-t border-stone-200">
                      <span>Total de la Obra:</span>
                      <span className="font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Condiciones de Pago MALLAESA */}
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs space-y-1">
                    <span className="font-bold text-black block">Condiciones de Contratación:</span>
                    <p className="text-stone-600">
                      • Anticipo del 50%: <strong>${advance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong> al aprobarse.
                    </p>
                    <p className="text-stone-600">
                      • Finiquito del 50%: <strong>${advance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong> al firmar conformidad.
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={handleGenerateQuote}
                      className="w-full py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      Estructurar y Guardar Cotización
                    </button>

                    <button
                      onClick={() => {
                        const existing = formalQuotes.find(q => q.requestId === currentRequest.id);
                        if (existing) {
                          handleSendToClientEmail(existing.id);
                        } else {
                          alert('Primero debes generar la cotización formal con el botón superior.');
                        }
                      }}
                      className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-[#898A82]" />
                      Enviar PDF Formal al Correo del Cliente
                    </button>
                  </div>
                </div>

                {/* Previsualización en Membrete Oficial */}
                <div className="bg-stone-900 text-white rounded-xl p-5 shadow-xs text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-mono text-[10px] text-stone-400">MEMBRETE CORPORATIVO</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Listo para Imprimir</span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Las cotizaciones incluyen la imagen corporativa oficial de <strong>MALLAESA</strong>, desglose para deducibilidad fiscal y cláusula de póliza de garantía por hasta 5 años.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: GESTIÓN DE PROSPECTOS (CRM PIPELINE)
         ======================================================== */}
      {activeModule === 'crm' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Pipeline Comercial CRM MALLAESA
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Seguimiento del embudo de ventas desde el primer contacto hasta el cierre de contrato.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                placeholder="Buscar prospecto por cliente o folio..."
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* Tablero Kanban de Estados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'cotizado', title: 'Cotizados Recientes', statusMatch: ['nuevo', 'cotizacion_recibida', 'cotizado', 'cotizacion_enviada'] },
              { id: 'negociacion', title: 'En Negociación', statusMatch: ['en_revision'] },
              { id: 'aprobado', title: 'Aprobados / Cierre', statusMatch: ['esperando_anticipo', 'anticipo_confirmado', 'aprobado', 'orden_programada', 'en_instalacion', 'finalizado'] },
              { id: 'rechazado', title: 'Rechazados / En Pausa', statusMatch: ['rechazado'] }
            ].map((col) => {
              const columnProjects = projects.filter(p => {
                const matchesStatus = col.statusMatch.includes(p.status);
                const matchesSearch = crmSearch
                  ? p.clientName.toLowerCase().includes(crmSearch.toLowerCase()) ||
                    p.folio.toLowerCase().includes(crmSearch.toLowerCase())
                  : true;
                return matchesStatus && matchesSearch;
              });

              return (
                <div key={col.id} className="bg-stone-100 rounded-xl p-4 flex flex-col min-h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
                    <span className="font-bold text-xs text-black uppercase tracking-wider">
                      {col.title}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-700">
                      {columnProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnProjects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-stone-200 rounded-lg p-3.5 shadow-xs hover:border-black transition cursor-pointer"
                        onClick={() => {
                          const req = requests.find(r => r.folio === p.folio);
                          if (req) handleSelectRequestToQuote(req);
                        }}
                      >
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono mb-1">
                          <span>{p.folio}</span>
                          <span className="capitalize">{p.city.split(',')[0]}</span>
                        </div>
                        <h4 className="font-bold text-xs text-black">{p.clientName}</h4>
                        <p className="text-[11px] text-stone-500 mt-1 capitalize">
                          {p.serviceType.replace('_', ' ')} • {p.linearMeters}m
                        </p>
                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-black">
                            ${p.totalAmount > 0 ? p.totalAmount.toLocaleString('es-MX') : 'Por calcular'}
                          </span>
                          <span className="text-[10px] text-[#898A82] font-semibold">
                            Fase {p.phase}
                          </span>
                        </div>
                      </div>
                    ))}

                    {columnProjects.length === 0 && (
                      <div className="h-32 flex items-center justify-center text-xs text-stone-400">
                        Sin proyectos en este estatus
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
