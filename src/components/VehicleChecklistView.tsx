import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { VehicleLog } from '../types';
import {
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Gauge,
  Fuel,
  UserCheck,
  ShieldCheck,
  Search,
  Check,
  X,
  FileCheck2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VehicleChecklistView: React.FC = () => {
  const { vehicleLogs, addVehicleLog, updateVehicleLogReturn, crews } = useMallaesa();

  const [activeTab, setActiveTab] = useState<'todos' | 'en_ruta' | 'retornado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Departure Modal State
  const [isDepartureModalOpen, setIsDepartureModalOpen] = useState(false);
  const [vehicleName, setVehicleName] = useState('Camioneta Nissan NP300 Estacas Blanca');
  const [plates, setPlates] = useState('NPK-4421');
  const [driverName, setDriverName] = useState(crews[0]?.leadName || 'Roberto Mendoza');
  const [assignedCrew, setAssignedCrew] = useState('Cuadrilla Alfa');
  const [destinationProject, setDestinationProject] = useState('Instalación Perimetral Carretera Nacional');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().substring(0, 10));
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [departureMileage, setDepartureMileage] = useState<number>(48300);
  const [departureFuelLevel, setDepartureFuelLevel] = useState<VehicleLog['departureFuelLevel']>('Lleno');
  const [departureConditions, setDepartureConditions] = useState('Nivel de aceite verificado, llantas con 35 PSI, refacción y gato a bordo.');
  const [departurePhotoUrl, setDeparturePhotoUrl] = useState('https://images.unsplash.com/photo-1559297434-fae8a1916a79?w=600&auto=format&fit=crop&q=80');

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLogForReturn, setSelectedLogForReturn] = useState<VehicleLog | null>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().substring(0, 10));
  const [returnTime, setReturnTime] = useState('17:45 PM');
  const [returnMileage, setReturnMileage] = useState<number>(48390);
  const [returnFuelLevel, setReturnFuelLevel] = useState<'1/4' | '1/2' | '3/4' | 'Lleno'>('3/4');
  const [returnConditions, setReturnConditions] = useState('Unidad sin averías, herramienta completa entregada al almacenero.');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80');

  const VEHICLE_OPTIONS = [
    { name: 'Camioneta Nissan NP300 Estacas Blanca', plates: 'NPK-4421', defaultKm: 48300 },
    { name: 'Camioneta Ford Ranger Diésel Gris', plates: 'NL-341-B', defaultKm: 62600 },
    { name: 'Camión Rabón Chevrolet 3500 Plataforma', plates: 'NL-928-C', defaultKm: 115350 },
    { name: 'Van Toyota Hiace Logística Insumos', plates: 'TX-5510-A', defaultKm: 34100 }
  ];

  const handleSelectVehicle = (vName: string) => {
    setVehicleName(vName);
    const found = VEHICLE_OPTIONS.find(v => v.name === vName);
    if (found) {
      setPlates(found.plates);
      setDepartureMileage(found.defaultKm);
    }
  };

  const handleCreateDeparture = (e: React.FormEvent) => {
    e.preventDefault();
    if (departureMileage <= 0) {
      alert('Por favor ingresa un kilometraje de salida válido.');
      return;
    }

    const newLog = addVehicleLog({
      vehicleName,
      plates,
      driverName,
      assignedCrew,
      destinationProject,
      status: 'en_ruta',
      departureDate,
      departureTime,
      departureMileage: Number(departureMileage),
      departureFuelLevel,
      departureConditions,
      departurePhotoUrl,
      departureSignature: `Firma Conductor: ${driverName}`
    });

    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch {}

    alert(`¡Salida vehicular ${newLog.folio} registrada con éxito! Unidad ${newLog.plates} en ruta con ${newLog.departureMileage} km iniciales.`);
    setIsDepartureModalOpen(false);
  };

  const handleOpenReturnModal = (log: VehicleLog) => {
    setSelectedLogForReturn(log);
    setReturnMileage(log.departureMileage + 65); // suggested reasonable km
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForReturn) return;
    if (returnMileage < selectedLogForReturn.departureMileage) {
      alert('El kilometraje de llegada no puede ser menor al kilometraje de salida.');
      return;
    }

    updateVehicleLogReturn(selectedLogForReturn.id, {
      returnDate,
      returnTime,
      returnMileage: Number(returnMileage),
      returnFuelLevel,
      returnConditions,
      returnPhotoUrl,
      returnSignature: 'Firma Almacén: Javier Salgado (Recepción Aprobada)'
    });

    const distance = Number(returnMileage) - selectedLogForReturn.departureMileage;
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch {}

    alert(`¡Retorno de unidad ${selectedLogForReturn.plates} registrado exitosamente! Recorrido total: ${distance} km.`);
    setIsReturnModalOpen(false);
    setSelectedLogForReturn(null);
  };

  // Filtered list
  const filteredLogs = vehicleLogs.filter(log => {
    const matchesTab = activeTab === 'todos' || log.status === activeTab;
    const matchesSearch =
      log.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.plates.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const activeVehiclesCount = vehicleLogs.filter(v => v.status === 'en_ruta').length;
  const totalKmTraveled = vehicleLogs.reduce((sum, v) => sum + (v.distanceTraveledKm || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Logística & Flotilla Operativa
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-black bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              <Truck className="w-3 h-3 text-[#898A82]" /> Control Vehicular
            </span>
          </div>
          <h2 className="text-2xl font-bold text-black mt-1">
            Checklist Vehicular, Kilometraje y Evidencia
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Inspección fotográfica de salida/llegada, kilometraje, chofer asignado, placas, combustible y estado de la unidad.
          </p>
        </div>

        <button
          onClick={() => setIsDepartureModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrar Salida de Vehículo
        </button>
      </div>

      {/* Métricas de la Flotilla */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Unidades en Ruta</span>
          <span className="text-2xl font-black text-amber-600 block mt-2">{activeVehiclesCount} unidades</span>
          <span className="text-xs text-stone-600 mt-1 block">En obra o traslado perimetral</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Total KM Recorridos</span>
          <span className="text-2xl font-black text-black block mt-2">{totalKmTraveled.toLocaleString('es-MX')} KM</span>
          <span className="text-xs text-stone-600 mt-1 block">Kilometraje monitoreado</span>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-stone-500">Inspecciones con Evidencia</span>
          <span className="text-2xl font-black text-emerald-700 block mt-2">{vehicleLogs.length} checklists</span>
          <span className="text-xs text-stone-600 mt-1 block">Fotos y firmas registradas</span>
        </div>
      </div>

      {/* Tabs y Búsqueda */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['todos', 'en_ruta', 'retornado'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {tab === 'todos' ? 'Todas las unidades' : tab === 'en_ruta' ? 'En ruta' : 'Retornadas'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por placa, chofer o unidad..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Listado de Checklists Vehiculares */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500">
            <Truck className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-bold text-stone-700">No hay registros vehiculares que coincidan</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const isEnRuta = log.status === 'en_ruta';

            return (
              <div
                key={log.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-black transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                      {log.folio}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-black flex items-center gap-2">
                        {log.vehicleName}
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded">
                          Placas: {log.plates}
                        </span>
                      </h3>
                      <p className="text-xs text-stone-500">
                        Responsable: <strong>{log.driverName}</strong> • {log.assignedCrew || 'Logística Central'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        isEnRuta
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isEnRuta ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
                      {isEnRuta ? 'En Ruta / Obra' : 'Retornado a Base'}
                    </span>

                    {isEnRuta && (
                      <button
                        onClick={() => handleOpenReturnModal(log)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Registrar Retorno
                      </button>
                    )}
                  </div>
                </div>

                {/* Destino y datos */}
                <div className="text-xs text-stone-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#898A82]" />
                  <span>Destino / Obra: <strong>{log.destinationProject || 'Planta & Patio Mallaesa'}</strong></span>
                </div>

                {/* Comparación Salida vs Llegada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Salida */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                      <span className="font-bold text-xs text-stone-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#898A82]" /> Salida: {log.departureDate} ({log.departureTime})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-200 text-stone-800 rounded">
                        Odómetro Salida
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-stone-500" />
                        <span>Km Inicial: <strong className="font-mono text-black">{log.departureMileage.toLocaleString('es-MX')} km</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-4 h-4 text-stone-500" />
                        <span>Tanque: <strong>{log.departureFuelLevel}</strong></span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                      <strong>Condición Salida:</strong> {log.departureConditions}
                    </p>

                    {log.departurePhotoUrl && (
                      <div className="flex items-center gap-3">
                        <img
                          src={log.departurePhotoUrl}
                          alt="Foto Salida"
                          className="h-16 w-24 object-cover rounded-lg border border-stone-200"
                        />
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-stone-400" /> Foto de unidad e odómetro al salir
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Llegada */}
                  <div className={`border rounded-xl p-4 space-y-3 ${isEnRuta ? 'bg-amber-50/50 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
                    <div className="flex justify-between items-center border-b border-stone-200/60 pb-2">
                      <span className="font-bold text-xs text-stone-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#898A82]" />
                        {isEnRuta ? 'Retorno Pendiente' : `Llegada: ${log.returnDate} (${log.returnTime})`}
                      </span>
                      {!isEnRuta && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                          Odómetro Llegada
                        </span>
                      )}
                    </div>

                    {isEnRuta ? (
                      <div className="py-6 text-center text-xs text-stone-500">
                        <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-bounce" />
                        <p className="font-bold text-stone-800">Unidad actualmente en ruta de trabajo</p>
                        <p className="text-[11px] mt-1">Registra el retorno al llegar al taller o almacén.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Gauge className="w-4 h-4 text-emerald-700" />
                            <span>Km Final: <strong className="font-mono text-black">{log.returnMileage?.toLocaleString('es-MX')} km</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Fuel className="w-4 h-4 text-emerald-700" />
                            <span>Tanque: <strong>{log.returnFuelLevel}</strong></span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs">
                          <span className="font-bold text-emerald-900 block">
                            Distancia Recorrida en Obra: <strong className="text-black font-mono text-sm">+{log.distanceTraveledKm} KM</strong>
                          </span>
                          <span className="text-stone-600 text-[11px] mt-0.5 block">
                            Estado: {log.returnConditions}
                          </span>
                        </div>

                        {log.returnPhotoUrl && (
                          <div className="flex items-center gap-3">
                            <img
                              src={log.returnPhotoUrl}
                              alt="Foto Llegada"
                              className="h-16 w-24 object-cover rounded-lg border border-stone-200"
                            />
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-stone-400" /> Foto de unidad a la entrega
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: REGISTRAR SALIDA DE VEHÍCULO */}
      {isDepartureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <Truck className="w-5 h-5 text-black" />
                  Registrar Salida de Vehículo / Checklist Inicial
                </h3>
                <p className="text-xs text-stone-500">
                  Control de kilometraje, placas, nivel de combustible y estado mecánico antes de salir.
                </p>
              </div>
              <button
                onClick={() => setIsDepartureModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-black hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeparture} className="space-y-4 text-xs">
              {/* Selección de vehículo */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">Vehículo de la Flotilla:</label>
                <select
                  value={vehicleName}
                  onChange={e => handleSelectVehicle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-xs"
                >
                  {VEHICLE_OPTIONS.map(v => (
                    <option key={v.plates} value={v.name}>
                      {v.name} (Placas: {v.plates})
                    </option>
                  ))}
                </select>
              </div>

              {/* Placas y Conductor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Placas del Vehículo:</label>
                  <input
                    type="text"
                    value={plates}
                    onChange={e => setPlates(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Conductor / Responsable:</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              {/* Destino y Cuadrilla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Cuadrilla / Área:</label>
                  <select
                    value={assignedCrew}
                    onChange={e => setAssignedCrew(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  >
                    <option value="Cuadrilla Alfa">Cuadrilla Alfa</option>
                    <option value="Cuadrilla Beta">Cuadrilla Beta</option>
                    <option value="Cuadrilla Gamma">Cuadrilla Gamma</option>
                    <option value="Logística & Compras">Logística & Compras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Destino de la Obra:</label>
                  <input
                    type="text"
                    value={destinationProject}
                    onChange={e => setDestinationProject(e.target.value)}
                    placeholder="Ej: Instalación perimetral en Apodaca"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              {/* Fecha, Hora, Km de Salida y Gasolina */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Fecha Salida:</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={e => setDepartureDate(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Hora Salida:</label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Km Salida:</label>
                  <input
                    type="number"
                    value={departureMileage}
                    onChange={e => setDepartureMileage(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Gasolina:</label>
                  <select
                    value={departureFuelLevel}
                    onChange={e => setDepartureFuelLevel(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="1/4">1/4 Tanque</option>
                    <option value="1/2">1/2 Tanque</option>
                    <option value="3/4">3/4 Tanque</option>
                    <option value="Lleno">Tanque Lleno</option>
                  </select>
                </div>
              </div>

              {/* Condiciones y Foto de Salida */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Condiciones Físicas & Mecánicas de Salida:
                </label>
                <input
                  type="text"
                  value={departureConditions}
                  onChange={e => setDepartureConditions(e.target.value)}
                  placeholder="Ej: Luces en orden, presión de llantas correcta, gato hidráulico presente."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Foto de la Unidad / Odómetro al Salir (URL o evidencia):
                </label>
                <input
                  type="url"
                  value={departurePhotoUrl}
                  onChange={e => setDeparturePhotoUrl(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsDepartureModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Autorizar Salida de Unidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR LLEGADA / RETORNO */}
      {isReturnModalOpen && selectedLogForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Registrar Retorno de Unidad ({selectedLogForReturn.plates})
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedLogForReturn.vehicleName} • Chofer: {selectedLogForReturn.driverName}
                </p>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-black hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Km de Salida</span>
                  <strong className="text-sm font-mono text-black">{selectedLogForReturn.departureMileage} km</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Km Estimado Retorno</span>
                  <strong className="text-sm font-mono text-emerald-800">
                    +{Math.max(0, returnMileage - selectedLogForReturn.departureMileage)} km recorridos
                  </strong>
                </div>
              </div>

              {/* Fecha, Hora, Km Retorno y Combustible */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Fecha Retorno:</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Hora Retorno:</label>
                  <input
                    type="text"
                    value={returnTime}
                    onChange={e => setReturnTime(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Km Llegada:</label>
                  <input
                    type="number"
                    min={selectedLogForReturn.departureMileage}
                    value={returnMileage}
                    onChange={e => setReturnMileage(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Gasolina Llegada:</label>
                  <select
                    value={returnFuelLevel}
                    onChange={e => setReturnFuelLevel(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="1/4">1/4 Tanque</option>
                    <option value="1/2">1/2 Tanque</option>
                    <option value="3/4">3/4 Tanque</option>
                    <option value="Lleno">Tanque Lleno</option>
                  </select>
                </div>
              </div>

              {/* Condiciones al retornar */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Condiciones de Entrega en Almacén / Taller:
                </label>
                <input
                  type="text"
                  value={returnConditions}
                  onChange={e => setReturnConditions(e.target.value)}
                  placeholder="Ej: Unidad entregada limpia, sin rayones ni desperfectos mecánicos."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                />
              </div>

              {/* Foto de llegada */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Foto de la Unidad / Odómetro al Retornar (URL):
                </label>
                <input
                  type="url"
                  value={returnPhotoUrl}
                  onChange={e => setReturnPhotoUrl(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Validar y Cerrar Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
