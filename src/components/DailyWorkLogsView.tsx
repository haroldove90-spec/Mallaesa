import React, { useState, useRef } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { DailyWorkLog } from '../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Plus,
  PenTool,
  RotateCcw,
  Search,
  Filter,
  Layers,
  CloudSun,
  MapPin,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyWorkLogsView: React.FC = () => {
  const { workOrders, dailyWorkLogs, addDailyWorkLog, crews } = useMallaesa();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrew, setFilterCrew] = useState('todos');

  // Form states
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [linearMetersInstalled, setLinearMetersInstalled] = useState<number>(30);
  const [weatherConditions, setWeatherConditions] = useState<DailyWorkLog['weatherConditions']>('Despejado / Óptimo');
  const [soilConditions, setSoilConditions] = useState<DailyWorkLog['soilConditions']>('Terreno limpio / Suave');
  const [workDoneDescription, setWorkDoneDescription] = useState('');
  const [incidentsOrDelays, setIncidentsOrDelays] = useState('');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Selected OT data
  const selectedOT = workOrders.find(ot => ot.id === selectedWorkOrderId);
  const totalMeters = selectedOT ? selectedOT.linearMeters : 100;

  // Calculate existing accumulated for this OT
  const previousLogsForOT = dailyWorkLogs.filter(l => l.workOrderId === selectedWorkOrderId);
  const previousMeters = previousLogsForOT.reduce((sum, l) => sum + l.linearMetersInstalled, 0);
  const newAccumulated = previousMeters + (Number(linearMetersInstalled) || 0);
  const calculatedPercent = Math.min(100, Math.round((newAccumulated / (totalMeters || 1)) * 100));

  // Canvas handlers
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOT) {
      alert('Por favor selecciona una Orden de Trabajo.');
      return;
    }
    if (!workDoneDescription.trim()) {
      alert('Por favor describe los trabajos realizados en la jornada.');
      return;
    }

    let signatureData = '';
    if (canvasRef.current && hasSignature) {
      signatureData = canvasRef.current.toDataURL('image/png');
    } else {
      signatureData = `Firma Digital: ${selectedOT.crewName}`;
    }

    const newLog = addDailyWorkLog({
      workOrderId: selectedOT.id,
      workOrderFolio: selectedOT.folio,
      clientName: selectedOT.clientName,
      crewName: selectedOT.crewName,
      leadInstaller: crews.find(c => c.id === selectedOT.crewId)?.leadName || 'Jefe de Cuadrilla',
      date,
      linearMetersInstalled: Number(linearMetersInstalled),
      totalLinearMeters: totalMeters,
      accumulatedMeters: newAccumulated,
      progressPercent: calculatedPercent,
      weatherConditions,
      soilConditions,
      workDoneDescription,
      incidentsOrDelays,
      leadSignature: signatureData
    });

    try {
      confetti({ particleCount: 60, spread: 70 });
    } catch {}

    alert(`¡Avance de jornada ${newLog.folio} registrado con éxito! Avance acumulado: ${newLog.progressPercent}% (${newLog.accumulatedMeters}m de ${newLog.totalLinearMeters}m).`);
    setIsModalOpen(false);
    setSelectedWorkOrderId('');
    setWorkDoneDescription('');
    setIncidentsOrDelays('');
    clearCanvas();
  };

  // Filtered logs
  const filteredLogs = dailyWorkLogs.filter(log => {
    const matchesSearch =
      log.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.workOrderFolio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.crewName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrew = filterCrew === 'todos' || log.crewName.toLowerCase().includes(filterCrew.toLowerCase());
    return matchesSearch && matchesCrew;
  });

  // Global metrics
  const totalMetersInstalledEver = dailyWorkLogs.reduce((sum, l) => sum + l.linearMetersInstalled, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Operación & Supervisión de Campo
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Bitácora en Vivo
            </span>
          </div>
          <h2 className="text-2xl font-bold text-black mt-1">
            Bitácora y Avance Diario de Cuadrillas
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Control de metros lineales instalados por día, condiciones de terreno, reporte de incidencias y firma digital de los responsables.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Avance de Jornada
        </button>
      </div>

      {/* Tarjetas Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Reportes de Jornada</span>
          <span className="text-2xl font-black text-black block mt-2">{dailyWorkLogs.length} reportes</span>
          <span className="text-xs text-stone-600 mt-1 block">Firmados y validados en campo</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Metros Instalados Reportados</span>
          <span className="text-2xl font-black text-emerald-700 block mt-2">{totalMetersInstalledEver} ML</span>
          <span className="text-xs text-stone-600 mt-1 block">Cercos perimetrales instalados</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Cuadrillas Registradas</span>
          <span className="text-2xl font-black text-black block mt-2">{crews.length} activas</span>
          <span className="text-xs text-stone-600 mt-1 block">Alfa, Beta, Gamma en Monterrey</span>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o cuadrilla..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-600 shrink-0">Filtrar Cuadrilla:</span>
          <select
            value={filterCrew}
            onChange={e => setFilterCrew(e.target.value)}
            className="p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:bg-white"
          >
            <option value="todos">Todas las cuadrillas</option>
            <option value="Alfa">Cuadrilla Alfa</option>
            <option value="Beta">Cuadrilla Beta</option>
            <option value="Gamma">Cuadrilla Gamma</option>
          </select>
        </div>
      </div>

      {/* Lista de Registros Diarios */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
            <Layers className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-bold text-stone-700">No se encontraron reportes diarios de avance</p>
            <p className="text-xs text-stone-500 mt-1">Registra la primera jornada de trabajo con el botón superior.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-black transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                    {log.folio}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-black">{log.clientName}</h3>
                    <p className="text-xs text-stone-500">OT: {log.workOrderFolio} • {log.crewName} ({log.leadInstaller})</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600 flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" /> {log.date}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {log.progressPercent}% de Avance Total
                  </span>
                </div>
              </div>

              {/* Barra de progreso de la obra */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-stone-700">
                    Avanzado en esta jornada: <strong className="text-black">+{log.linearMetersInstalled} ML</strong>
                  </span>
                  <span className="text-stone-700">
                    Acumulado: <strong className="text-black">{log.accumulatedMeters} ML</strong> de {log.totalLinearMeters} ML
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, log.progressPercent)}%` }}
                  ></div>
                </div>
              </div>

              {/* Detalles técnicos de campo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="font-bold text-stone-700 block mb-0.5">Trabajos Realizados:</span>
                  <p className="text-stone-600 leading-relaxed">{log.workDoneDescription}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-700 block mb-0.5">Condiciones & Terreno:</span>
                  <p className="text-stone-600">
                    Clima: <strong>{log.weatherConditions}</strong><br />
                    Suelo: <strong>{log.soilConditions}</strong>
                    {log.incidentsOrDelays && (
                      <span className="block text-amber-800 mt-1 font-medium">
                        Incidencias: {log.incidentsOrDelays}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Firma digital del responsable */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#898A82]" />
                  <span>Reportado por: <strong>{log.leadInstaller}</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Firma de Conformidad Registrada
                  </span>
                  {log.leadSignature && log.leadSignature.startsWith('data:image') && (
                    <img
                      src={log.leadSignature}
                      alt="Firma"
                      className="h-7 w-20 object-contain border border-stone-200 rounded bg-white px-1"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: REGISTRAR AVANCE DIARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#898A82]" />
                  Registrar Avance Diario de Cuadrilla
                </h3>
                <p className="text-xs text-stone-500">
                  Firma de conformidad y reporte diario de metros lineales instalados.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-black hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Seleccionar Orden de Trabajo */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Orden de Trabajo (OT) / Proyecto en Curso:
                </label>
                <select
                  value={selectedWorkOrderId}
                  onChange={e => setSelectedWorkOrderId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs"
                  required
                >
                  <option value="">Selecciona la Orden de Trabajo...</option>
                  {workOrders.map(ot => (
                    <option key={ot.id} value={ot.id}>
                      {ot.folio} — {ot.clientName} ({ot.linearMeters} ML) • {ot.crewName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOT && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">Cliente</span>
                    <strong className="text-black">{selectedOT.clientName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">Metros Totales</span>
                    <strong className="text-black">{selectedOT.linearMeters} ML</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">Cuadrilla</span>
                    <strong className="text-black">{selectedOT.crewName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">Previo Acumulado</span>
                    <strong className="text-emerald-700">{previousMeters} ML</strong>
                  </div>
                </div>
              )}

              {/* Fecha y Metros de la jornada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Fecha de la Jornada:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Metros Lineales Instalados Hoy (ML):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={totalMeters}
                      value={linearMetersInstalled}
                      onChange={e => setLinearMetersInstalled(Number(e.target.value))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-sm pr-10"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-stone-400 font-bold text-xs">ML</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Avance resultante: <strong>{newAccumulated} ML ({calculatedPercent}%)</strong>
                  </span>
                </div>
              </div>

              {/* Condiciones de clima y suelo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Condición Climática:</label>
                  <select
                    value={weatherConditions}
                    onChange={e => setWeatherConditions(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="Despejado / Óptimo">Despejado / Óptimo</option>
                    <option value="Lluvia ligera">Lluvia ligera</option>
                    <option value="Calor extremo">Calor extremo</option>
                    <option value="Viento fuerte">Viento fuerte</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Condición de Suelo / Terreno:</label>
                  <select
                    value={soilConditions}
                    onChange={e => setSoilConditions(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="Terreno limpio / Suave">Terreno limpio / Suave</option>
                    <option value="Roca / Difícil">Roca / Difícil</option>
                    <option value="Barda / Cimentación previa">Barda / Cimentación previa</option>
                    <option value="Desnivel pronunciado">Desnivel pronunciado</option>
                  </select>
                </div>
              </div>

              {/* Descripción de trabajos */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Descripción Detallada de Trabajos Realizados en el Día:
                </label>
                <textarea
                  rows={2}
                  value={workDoneDescription}
                  onChange={e => setWorkDoneDescription(e.target.value)}
                  placeholder="Ej: Colocación de 15 postes esquineros con concreto, cepas a 60cm de profundidad y alineado con hilo guía."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                  required
                />
              </div>

              {/* Incidencias opcionales */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Incidencias, Retrasos o Requerimientos de Material (Opcional):
                </label>
                <input
                  type="text"
                  value={incidentsOrDelays}
                  onChange={e => setIncidentsOrDelays(e.target.value)}
                  placeholder="Ej: Sin novedad, o: falta grava para mañana."
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                />
              </div>

              {/* Lienzo de Firma Digital Táctil */}
              <div className="space-y-1.5 border border-stone-300 rounded-xl p-3 bg-stone-50">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-black" />
                    Firma Táctil del Responsable de Cuadrilla:
                  </span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-stone-500 hover:text-black flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpiar Firma
                  </button>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-lg bg-white overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={110}
                    className="w-full h-24 touch-none cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  Firma con el dedo en pantallas táctiles o con el ratón en escritorio para validar el avance.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Guardar y Validar Avance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
