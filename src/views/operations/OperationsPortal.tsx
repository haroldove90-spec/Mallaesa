import React, { useState, useRef } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import { WorkOrder, InventoryItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  ClipboardList,
  Boxes,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Check,
  UserCheck,
  Navigation as NavigationIcon,
  Phone
} from 'lucide-react';

export const OperationsPortal: React.FC<{ activeModule: string }> = ({ activeModule }) => {
  const {
    projects,
    workOrders,
    inventory,
    crews,
    createWorkOrder,
    updateWorkOrderStatus,
    submitFieldSignatureAndPhotos,
    adjustInventoryStock
  } = useMallaesa();

  // Create OT modal states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedCrewId, setSelectedCrewId] = useState<string>(crews[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-10-16');
  const [scheduledTime, setScheduledTime] = useState<string>('08:00 AM');

  // Field log modal states
  const [activeOTForReport, setActiveOTForReport] = useState<WorkOrder | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<string>('');
  const [afterPhoto, setAfterPhoto] = useState<string>('');
  const [crewNotesInput, setCrewNotesInput] = useState<string>('');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Inventory adjustment modal
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);

  // Eligible projects for creating an OT (Advance confirmed or waiting OT)
  const eligibleProjects = projects.filter(
    p => p.advancePaid && !workOrders.some(ot => ot.projectId === p.id)
  );

  const handleCreateOT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Por favor selecciona un proyecto con anticipo confirmado.');
      return;
    }
    const ot = createWorkOrder(selectedProjectId, selectedCrewId, scheduledDate, scheduledTime);
    alert(`¡Orden de Trabajo ${ot.folio} programada! Los materiales han sido descontados del almacén automáticamente.`);
    setSelectedProjectId('');
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmitFieldReport = () => {
    if (!activeOTForReport) return;
    if (!hasSignature) {
      alert('Se requiere la firma digital de conformidad del cliente para concluir la obra y emitir la póliza de garantía.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL() : 'Firma capturada';

    submitFieldSignatureAndPhotos(
      activeOTForReport.id,
      signatureData,
      beforePhoto ? [beforePhoto] : [],
      afterPhoto ? [afterPhoto] : [],
      crewNotesInput || 'Instalación concluida conforme a especificaciones técnicas.'
    );

    try {
      confetti({ particleCount: 80, spread: 70 });
    } catch {}

    alert('¡Reporte de campo guardado y firmado! Se ha emitido la Póliza de Garantía Digital y se notificó a Administración para el cobro del 50% de finiquito.');
    setActiveOTForReport(null);
    clearCanvas();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          MÓDULO 1: ÓRDENES DE TRABAJO (OT)
         ======================================================== */}
      {activeModule === 'ordenes' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Control de Órdenes de Trabajo (OT) & Asignación de Cuadrillas
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Programación de cuadrillas instaladoras, fechas, direcciones con mapas y salida de almacén.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 bg-stone-100 rounded-lg text-black border border-stone-200">
                {workOrders.length} Órdenes Registradas
              </span>
            </div>
          </div>

          {/* Formulario de Asignación si hay proyectos elegibles con anticipo */}
          {eligibleProjects.length > 0 && (
            <div className="bg-stone-50 border border-stone-300 rounded-xl p-5 shadow-xs">
              <h3 className="font-bold text-sm text-black mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#898A82]" />
                Asignar Nueva Orden de Trabajo para Proyecto con Anticipo Pagado
              </h3>

              <form onSubmit={handleCreateOT} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Proyecto Aprobado:</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                    required
                  >
                    <option value="">Selecciona proyecto...</option>
                    {eligibleProjects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.folio} - {p.clientName} ({p.linearMeters}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Cuadrilla Asignada:</label>
                  <select
                    value={selectedCrewId}
                    onChange={(e) => setSelectedCrewId(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                  >
                    {crews.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.leadName} & {c.assistantName} ({c.vehicle.split('(')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fecha Programada:</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                    required
                  >
                  </input>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-lg transition"
                  >
                    Crear OT & Descontar Stock
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listado de Órdenes de Trabajo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workOrders.map((ot) => (
              <div
                key={ot.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                      {ot.folio}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ot.status === 'completada'
                          ? 'bg-emerald-100 text-emerald-900'
                          : ot.status === 'en_instalacion'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ot.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="font-bold text-sm text-black">{ot.clientName}</h3>
                    <p className="text-xs text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#898A82]" /> {ot.address}
                    </p>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#898A82]" /> {ot.clientPhone}
                    </p>
                  </div>

                  <div className="mt-3 p-3 bg-stone-50 rounded-lg text-xs space-y-1.5 border border-stone-200/60">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Cuadrilla Responsable:</span>
                      <span className="font-bold text-black">{ot.crewName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Fecha y Hora:</span>
                      <span className="font-bold text-black">{ot.scheduledDate} a las {ot.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-semibold">Metraje Instalado:</span>
                      <span className="font-bold text-black">{ot.linearMeters} metros ({ot.serviceType})</span>
                    </div>
                  </div>

                  {/* Materiales Salidos de Almacén */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block mb-1">
                      Materiales Asignados de Almacén:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ot.materialsReserved.map((m, idx) => (
                        <span key={idx} className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-medium">
                          {m.quantity} {m.unit} • {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones de Operación */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(ot.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-black py-1.5 px-2.5 rounded-lg border border-stone-200 transition"
                  >
                    <NavigationIcon className="w-3 h-3 text-[#898A82]" />
                    Ver en Maps
                  </a>

                  {ot.status !== 'completada' ? (
                    <button
                      onClick={() => {
                        setActiveOTForReport(ot);
                        // Click module campo
                        const btn = document.querySelector('button[data-module="campo"]') as HTMLButtonElement;
                        if (btn) btn.click();
                      }}
                      className="px-4 py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Bitácora & Recabar Firma
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Concluida & Firmada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: CONTROL DE INVENTARIOS & ALERTA DE STOCK
         ======================================================== */}
      {activeModule === 'inventario' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Almacén Central & Control de Inventarios MALLAESA
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Monitoreo en tiempo real de mallas, postes, concertinas, accesorios y materiales de construcción con semáforo de stock mínimo.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Descripción del Material</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-center">Stock Actual</th>
                    <th className="py-3 px-4 text-center">Mínimo</th>
                    <th className="py-3 px-4 text-center">Estatus</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {inventory.map((item) => {
                    const isLowStock = item.stock <= item.minStock;

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/60">
                        <td className="py-3 px-4 font-mono font-bold text-black">{item.code}</td>
                        <td className="py-3 px-4 font-semibold text-black">{item.name}</td>
                        <td className="py-3 px-4 capitalize text-stone-500">{item.category}</td>
                        <td className="py-3 px-4 text-center font-bold text-sm text-black">
                          {item.stock} <span className="text-[10px] font-normal text-stone-500">{item.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-center text-stone-500 font-mono">
                          {item.minStock}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Stock Crítico
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Óptimo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-500">{item.location}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              const newQty = prompt(`Ajustar stock de ${item.name}:`, String(item.stock));
                              if (newQty !== null && !isNaN(Number(newQty))) {
                                adjustInventoryStock(item.id, Number(newQty));
                              }
                            }}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-black text-xs font-semibold rounded transition"
                          >
                            Ajustar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: BITÁCORA EN CAMPO & FIRMA DE CONFORMIDAD
         ======================================================== */}
      {activeModule === 'campo' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Bitácora Digital de Campo & Firma de Conformidad
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Subida de fotografías de antes/después y recolección de firma táctil del cliente al entregar la obra perimetral.
              </p>
            </div>
          </div>

          {/* Selector de orden activa si no hay una seleccionada */}
          {!activeOTForReport && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-black">
                Selecciona la Orden de Trabajo para Registrar Bitácora:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workOrders.map(ot => (
                  <button
                    key={ot.id}
                    onClick={() => setActiveOTForReport(ot)}
                    className="p-4 border border-stone-200 rounded-lg text-left hover:border-black transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-black">{ot.folio}</span>
                        <span className="text-[10px] uppercase font-bold text-stone-500">{ot.status}</span>
                      </div>
                      <h4 className="font-bold text-sm text-black mt-1">{ot.clientName}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{ot.address}</p>
                    </div>
                    <span className="mt-3 text-xs text-black font-semibold flex items-center gap-1">
                      Abrir Bitácora de Campo &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeOTForReport && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              {/* Encabezado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-stone-500">
                    {activeOTForReport.folio}
                  </span>
                  <h3 className="text-lg font-bold text-black">
                    {activeOTForReport.clientName}
                  </h3>
                  <p className="text-xs text-stone-500">{activeOTForReport.address}</p>
                </div>
                <button
                  onClick={() => setActiveOTForReport(null)}
                  className="text-xs text-stone-500 hover:text-black self-start sm:self-auto"
                >
                  Cambiar Orden
                </button>
              </div>

              {/* Sección Fotos de Antes y Después */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 mb-3">
                  1. Registro Fotográfico de Evidencia en Obra:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foto de Antes */}
                  <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 text-center flex flex-col items-center justify-center min-h-[160px]">
                    <span className="text-xs font-bold text-black mb-2">Foto de Terreno / Antes</span>
                    {beforePhoto || activeOTForReport.beforePhotos[0] ? (
                      <img
                        src={beforePhoto || activeOTForReport.beforePhotos[0]}
                        alt="Antes"
                        className="h-32 w-full object-cover rounded-lg border border-stone-300"
                      />
                    ) : (
                      <div className="space-y-1">
                        <Camera className="w-8 h-8 text-[#898A82] mx-auto" />
                        <span className="text-xs text-stone-500 block">Capturar foto inicial</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = ev => setBeforePhoto(ev.target?.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-stone-500 mt-1 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-stone-200 file:text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Foto de Después */}
                  <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 text-center flex flex-col items-center justify-center min-h-[160px]">
                    <span className="text-xs font-bold text-black mb-2">Foto de Obra Concluida / Después</span>
                    {afterPhoto || activeOTForReport.afterPhotos[0] ? (
                      <img
                        src={afterPhoto || activeOTForReport.afterPhotos[0]}
                        alt="Después"
                        className="h-32 w-full object-cover rounded-lg border border-stone-300"
                      />
                    ) : (
                      <div className="space-y-1">
                        <Camera className="w-8 h-8 text-[#898A82] mx-auto" />
                        <span className="text-xs text-stone-500 block">Capturar obra terminada</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = ev => setAfterPhoto(ev.target?.result as string);
                              r.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-stone-500 mt-1 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-black file:text-white file:text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bitácora de Observaciones */}
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  2. Observaciones y Notas Técnicas de la Cuadrilla:
                </label>
                <textarea
                  rows={2}
                  value={crewNotesInput}
                  onChange={(e) => setCrewNotesInput(e.target.value)}
                  placeholder="Detallar condiciones de fijación, alineación y pruebas de tensión realizadas..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                ></textarea>
              </div>

              {/* LIENZO DE FIRMA DIGITAL DE CONFORMIDAD */}
              <div className="border-t border-stone-200 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-[#898A82]" />
                      3. Firma Digital de Conformidad del Cliente (Pantalla Táctil):
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      El cliente confirma la recepción y correcta instalación del sistema de seguridad perimetral.
                    </p>
                  </div>
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-black"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Limpiar firma
                  </button>
                </div>

                <div className="border-2 border-stone-300 rounded-xl overflow-hidden bg-white touch-none">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair block"
                  />
                </div>
              </div>

              {/* Botón de Finalización */}
              <div className="pt-4 border-t border-stone-200 flex justify-end">
                <button
                  onClick={handleSubmitFieldReport}
                  className="px-8 py-3 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Concluir Obra, Guardar Firma & Emitir Garantía
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
