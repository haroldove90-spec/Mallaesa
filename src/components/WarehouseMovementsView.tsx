import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { WarehouseMovement, WarehouseMovementItem } from '../types';
import confetti from 'canvas-confetti';
import {
  ArrowDownUp,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Boxes,
  FileText,
  Printer,
  Calendar,
  User,
  Truck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const WarehouseMovementsView: React.FC = () => {
  const {
    warehouseMovements,
    registerWarehouseMovement,
    inventory,
    workOrders
  } = useMallaesa();

  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [previewMovement, setPreviewMovement] = useState<WarehouseMovement | null>(null);

  // Form states for new movement
  const [movementType, setMovementType] = useState<WarehouseMovement['type']>('egreso_obra');
  const [referenceFolio, setReferenceFolio] = useState<string>('');
  const [requestedBy, setRequestedBy] = useState<string>('Cuadrilla Alfa (Roberto Mendoza)');
  const [destinationOrOrigin, setDestinationOrOrigin] = useState<string>('Obra San Pedro Garza García');
  const [notes, setNotes] = useState<string>('Material para habilitado perimetral');

  // Items for movement
  const [items, setItems] = useState<WarehouseMovementItem[]>([
    {
      materialName: 'Rollo Malla Ciclónica Calibre 10.5 (2.00m x 20m)',
      quantity: 5,
      unit: 'Rollo',
      inventoryItemId: 'inv-1'
    },
    {
      materialName: 'Poste de Línea Galvanizado 48mm x 2.50m',
      quantity: 30,
      unit: 'Pieza',
      inventoryItemId: 'inv-3'
    }
  ]);

  const [newItemInvId, setNewItemInvId] = useState<string>('inv-3');
  const [newItemQty, setNewItemQty] = useState<number>(10);

  const handleAddItem = () => {
    const inv = inventory.find(i => i.id === newItemInvId);
    if (!inv) return;

    setItems(prev => [
      ...prev,
      {
        materialName: inv.name,
        quantity: newItemQty,
        unit: inv.unit,
        inventoryItemId: inv.id
      }
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Debes agregar al menos un material al vale de almacén.');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMov = registerWarehouseMovement({
      type: movementType,
      referenceFolio: referenceFolio || (movementType === 'egreso_obra' ? 'OT-DIRECTA' : 'ENT-BODEGA'),
      date: now,
      requestedBy,
      destinationOrOrigin,
      items,
      notes,
      status: 'completado'
    });

    try {
      confetti({ particleCount: 65, spread: 60 });
    } catch {}

    alert(`¡Vale de almacén ${newMov.folio} generado y procesado con éxito! Las existencias se han sincronizado.`);
    setIsModalOpen(false);
  };

  const filteredMovements = warehouseMovements.filter(m => {
    const matchesType = filterType === 'todos' || m.type === filterType;
    const matchesSearch =
      m.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceFolio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.destinationOrOrigin.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Encabezado */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Almacén & Logística Central
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
              Módulo Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Solicitudes de Ingreso y Egreso de Materiales
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Bitácora de movimientos físicos de almacén: <strong>Vales de Salida (Egreso)</strong> por cada cuadrilla y obra, <strong>Entradas por Compra</strong> a proveedores y <strong>Devoluciones de Sobrantes</strong> de campo.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Registrar Vale de Movimiento</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Vales de Salida (Egresos Obra)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-black text-black mt-2 block">
            {warehouseMovements.filter(m => m.type === 'egreso_obra').length} <span className="text-xs font-semibold text-stone-400">salidas</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Material despachado a instalación</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Ingresos por Compras</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block">
            {warehouseMovements.filter(m => m.type === 'ingreso_compra').length} <span className="text-xs font-semibold text-stone-400">recepciones</span>
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Acero suministrado por proveedores</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Devoluciones de Sobrantes</span>
            <RotateCcw className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-black text-blue-700 mt-2 block">
            {warehouseMovements.filter(m => m.type === 'devolucion_sobrante').length} <span className="text-xs font-semibold text-stone-400">retornos</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Reintegrados al inventario físico</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por folio, responsable o destino..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['todos', 'egreso_obra', 'ingreso_compra', 'devolucion_sobrante'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                filterType === t
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {t === 'egreso_obra'
                ? 'Egresos (Salidas)'
                : t === 'ingreso_compra'
                ? 'Ingresos (Compras)'
                : t === 'devolucion_sobrante'
                ? 'Devoluciones'
                : 'Todos los Vales'}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Vales de Movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMovements.map(mov => {
          const isEgreso = mov.type === 'egreso_obra';
          const isIngreso = mov.type === 'ingreso_compra';

          return (
            <div
              key={mov.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-black transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                      {mov.folio}
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">{mov.date}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isEgreso
                        ? 'bg-amber-100 text-amber-900'
                        : isIngreso
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {isEgreso && <ArrowUpRight className="w-3 h-3" />}
                    {isIngreso && <ArrowDownLeft className="w-3 h-3" />}
                    {!isEgreso && !isIngreso && <RotateCcw className="w-3 h-3" />}
                    {mov.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-base text-black flex items-center gap-1.5">
                    <User className="w-4 h-4 text-stone-500 shrink-0" />
                    {mov.requestedBy}
                  </h3>
                  <p className="text-xs text-stone-600 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#898A82]" />
                    {isEgreso ? 'Destino Obra:' : 'Origen / Procedencia:'} <strong>{mov.destinationOrOrigin}</strong>
                  </p>
                  <p className="text-xs text-stone-500 font-mono">
                    Referencia Vinculada: <strong>{mov.referenceFolio}</strong>
                  </p>
                </div>

                {/* Items del movimiento */}
                <div className="mt-4 bg-stone-50 rounded-xl p-3 border border-stone-200/60 space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Materiales del Movimiento ({mov.items.length} partidas):
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {mov.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-stone-800 font-medium truncate max-w-[280px]">
                          • {it.quantity} {it.unit} - {it.materialName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded">
                          {isEgreso ? 'Salida' : 'Entrada'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {mov.notes && (
                  <p className="text-[11px] text-stone-500 italic mt-2">
                    Nota: {mov.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Stock Afectado
                </span>

                <button
                  onClick={() => setPreviewMovement(mov)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver Vale Completo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Registrar Vale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  MALLAESA • CONTROL DE BODEGA
                </span>
                <h3 className="text-lg font-black text-black">
                  Registrar Movimiento de Almacén
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tipo de Movimiento:</label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value as any)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-bold"
                >
                  <option value="egreso_obra">Vale de Salida (Egreso para Obra / Instalación)</option>
                  <option value="ingreso_compra">Vale de Entrada (Ingreso por Compra a Proveedor)</option>
                  <option value="devolucion_sobrante">Vale de Reingreso (Devolución de Sobrantes de Obra)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Responsable / Solicitante:</label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={e => setRequestedBy(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Folio OT / Referencia:</label>
                  <input
                    type="text"
                    placeholder="Ej. OT-MAL-2026-891"
                    value={referenceFolio}
                    onChange={e => setReferenceFolio(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Destino de Obra o Procedencia:</label>
                <input
                  type="text"
                  value={destinationOrOrigin}
                  onChange={e => setDestinationOrOrigin(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              {/* Agregar Materiales */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                  Materiales a Mover de Almacén:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500">Material de Inventario:</label>
                    <select
                      value={newItemInvId}
                      onChange={e => setNewItemInvId(e.target.value)}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                    >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (Stock: {inv.stock} {inv.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500">Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={e => setNewItemQty(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agregar al Vale</span>
                </button>

                <div className="space-y-1 border-t border-stone-200 pt-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-stone-200">
                      <span>{it.quantity} {it.unit} - {it.materialName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notas / Observaciones:</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Confirmar y Descontar/Ingresar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Vale Completo */}
      {previewMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  VALE OFICIAL DE ALMACÉN
                </span>
                <h3 className="text-lg font-black text-black">
                  {previewMovement.folio}
                </h3>
              </div>
              <button
                onClick={() => setPreviewMovement(null)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 font-mono">
              <p><strong>Tipo:</strong> {previewMovement.type.toUpperCase()}</p>
              <p><strong>Fecha y Hora:</strong> {previewMovement.date}</p>
              <p><strong>Responsable:</strong> {previewMovement.requestedBy}</p>
              <p><strong>Destino / Procedencia:</strong> {previewMovement.destinationOrOrigin}</p>
              <p><strong>Referencia:</strong> {previewMovement.referenceFolio}</p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold block text-stone-700">Materiales Asignados:</span>
              {previewMovement.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-stone-100">
                  <span>{it.quantity} {it.unit} • {it.materialName}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200 text-center text-[10px]">
              <div>
                <div className="border-b border-stone-300 h-8 mb-1"></div>
                <span className="font-bold text-stone-700">Entrega: Almacén Central</span>
              </div>
              <div>
                <div className="border-b border-stone-300 h-8 mb-1"></div>
                <span className="font-bold text-stone-700">Recibe: {previewMovement.requestedBy.split('(')[0]}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Vale</span>
              </button>
              <button
                onClick={() => setPreviewMovement(null)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
