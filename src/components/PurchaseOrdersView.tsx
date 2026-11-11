import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { PurchaseOrder, PurchaseOrderItem } from '../types';
import { OFFICIAL_PRICE_LIST } from '../data/officialPriceList';
import confetti from 'canvas-confetti';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Printer,
  Trash2,
  Building2,
  AlertCircle,
  PackageCheck,
  FileText,
  DollarSign
} from 'lucide-react';

export const PurchaseOrdersView: React.FC = () => {
  const {
    purchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    receivePurchaseOrderIntoWarehouse,
    inventory,
    suppliers
  } = useMallaesa();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [previewPO, setPreviewPO] = useState<PurchaseOrder | null>(null);

  // Form states for new Purchase Order
  const [provider, setProvider] = useState<string>('Ternium México / Deacero S.A. de C.V.');
  const [rfc, setRfc] = useState<string>('DEA710515NL2');
  const [contactName, setContactName] = useState<string>('Ing. Alejandro Villarreal');
  const [contactPhone, setContactPhone] = useState<string>('81-8300-4400');
  const [deliveryDateEstimated, setDeliveryDateEstimated] = useState<string>('2026-11-10');
  const [notes, setNotes] = useState<string>('Reposición estratégica de stock para contratos en puerta.');

  // Items builder for PO
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      id: 'poi-temp-1',
      description: 'Rollo Malla Ciclónica Calibre 10.5 (2.00m x 20m)',
      quantity: 20,
      unit: 'Rollo',
      unitCost: 1450,
      total: 29000,
      inventoryItemId: 'inv-1'
    },
    {
      id: 'poi-temp-2',
      description: 'Poste de Línea Galvanizado 48mm x 2.50m',
      quantity: 60,
      unit: 'Pieza',
      unitCost: 210,
      total: 12600,
      inventoryItemId: 'inv-3'
    }
  ]);

  const [newItemDesc, setNewItemDesc] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState<number>(10);
  const [newItemCost, setNewItemCost] = useState<number>(250);
  const [newItemUnit, setNewItemUnit] = useState<string>('Pieza');
  const [newItemInvId, setNewItemInvId] = useState<string>('inv-3');

  const handleAddItemToPO = () => {
    if (!newItemDesc && !newItemInvId) return;
    const inv = inventory.find(i => i.id === newItemInvId);
    const desc = newItemDesc || inv?.name || 'Material de acero';
    const total = Number((newItemQty * newItemCost).toFixed(2));

    setItems(prev => [
      ...prev,
      {
        id: `poi-${Date.now()}`,
        description: desc,
        quantity: newItemQty,
        unit: newItemUnit || inv?.unit || 'Pieza',
        unitCost: newItemCost,
        total,
        inventoryItemId: newItemInvId || undefined
      }
    ]);

    setNewItemDesc('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const iva = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Debes agregar al menos un material a la Orden de Compra.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPO = createPurchaseOrder({
      provider,
      rfc,
      contactName,
      contactPhone,
      date: today,
      deliveryDateEstimated,
      items,
      subtotal,
      iva,
      total,
      status: 'autorizada',
      approvedBy: 'Eduardo Siller (Director General)',
      notes
    });

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    alert(`¡Orden de Compra ${newPO.folio} autorizada y registrada! Se ha generado la cuenta por pagar asociada automáticamente.`);
    setIsModalOpen(false);
  };

  const handleReceivePO = (poId: string, folio: string) => {
    if (window.confirm(`¿Confirmas que el material de la ${folio} ha llegado físicamente al almacén? Esto sumará las cantidades automáticamente al inventario.`)) {
      receivePurchaseOrderIntoWarehouse(poId);
      try {
        confetti({ particleCount: 90, spread: 80 });
      } catch {}
      alert(`¡Material ingresado exitosamente! El stock de inventario se ha actualizado y se registró el vale de entrada en Almacén.`);
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesStatus = filterStatus === 'todos' || po.status === filterStatus;
    const matchesSearch =
      po.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Encabezado */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Compras & Suministro de Acero
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
              Módulo Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Órdenes de Compra a Proveedores (OC)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Generación y autorización de pedidos a fabricantes (Ternium, Deacero, tubería, concertinas). Al recibirse en patio, el sistema ingresa automáticamente el material al inventario.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Generar Nueva Orden de Compra</span>
        </button>
      </div>

      {/* Filtros y Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Órdenes Registradas
          </span>
          <span className="text-2xl font-black text-black mt-1 block">
            {purchaseOrders.length} <span className="text-xs font-semibold text-stone-400">pedidos</span>
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            En Tránsito / Por Recibir
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {purchaseOrders.filter(p => p.status === 'en_camino' || p.status === 'autorizada').length} <span className="text-xs font-semibold text-stone-400">en ruta</span>
          </span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Recibidas en Almacén
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {purchaseOrders.filter(p => p.status === 'recibida').length} <span className="text-xs font-semibold text-stone-400">ingresadas</span>
          </span>
        </div>
      </div>

      {/* Barra de búsqueda y tabs */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por folio o proveedor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['todos', 'autorizada', 'en_camino', 'recibida'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Órdenes de Compra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPOs.length === 0 ? (
          <div className="col-span-2 bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-500 text-xs">
            No se encontraron órdenes de compra con los filtros seleccionados.
          </div>
        ) : (
          filteredPOs.map(po => {
            const isReceived = po.status === 'recibida';
            const isAuthorized = po.status === 'autorizada' || po.status === 'en_camino';

            return (
              <div
                key={po.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-black transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                        {po.folio}
                      </span>
                      <span className="text-[10px] text-stone-500 font-semibold">{po.date}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isReceived
                          ? 'bg-emerald-100 text-emerald-800'
                          : po.status === 'en_camino'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {po.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="font-bold text-base text-black flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-stone-500 shrink-0" />
                      {po.provider}
                    </h3>
                    <p className="text-xs text-stone-500">
                      RFC: <strong>{po.rfc}</strong> • Contacto: {po.contactName || 'Ventas Planta'}
                    </p>
                    {po.deliveryDateEstimated && (
                      <p className="text-xs text-stone-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Fecha de arribo estimada: <strong>{po.deliveryDateEstimated}</strong>
                      </p>
                    )}
                  </div>

                  {/* Partidas de Materiales */}
                  <div className="mt-4 bg-stone-50 rounded-xl p-3 border border-stone-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Materiales Solicitados ({po.items.length} partidas):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {po.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-stone-700 truncate max-w-[240px]">
                            • {it.quantity} {it.unit} - {it.description}
                          </span>
                          <span className="font-mono font-semibold text-black shrink-0">
                            ${it.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-black">
                      <span>Total Orden (IVA Inc.):</span>
                      <span className="text-sm">${po.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  </div>

                  {po.notes && (
                    <p className="text-[11px] text-stone-500 italic mt-2">
                      Nota: {po.notes}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewPO(po)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Formato OC</span>
                  </button>

                  {isAuthorized && (
                    <button
                      onClick={() => handleReceivePO(po.id, po.folio)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Dar Entrada a Almacén</span>
                    </button>
                  )}

                  {isReceived && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Ingresado a Almacén
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para Crear Nueva Orden de Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs font-bold text-[#898A82] uppercase tracking-wider">
                  MALLAESA S.A. DE C.V. • Departamento de Compras
                </span>
                <h2 className="text-xl font-black text-black mt-0.5">
                  Nueva Orden de Compra (OC)
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Proveedor (Catálogo Oficial):</label>
                  <input
                    type="text"
                    list="po-suppliers-list"
                    value={provider}
                    onChange={e => {
                      const val = e.target.value;
                      setProvider(val);
                      const found = suppliers.find(s => s.commercialName.toLowerCase() === val.toLowerCase() || s.businessName.toLowerCase() === val.toLowerCase());
                      if (found) {
                        setRfc(found.rfc);
                        setContactName(found.contactName);
                        setContactPhone(found.phone);
                      }
                    }}
                    placeholder="Selecciona o escribe proveedor..."
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                  <datalist id="po-suppliers-list">
                    {suppliers.map(s => (
                      <option key={s.id} value={s.commercialName}>
                        {s.businessName} - RFC: {s.rfc}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">RFC del Proveedor:</label>
                  <input
                    type="text"
                    value={rfc}
                    onChange={e => setRfc(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Contacto / Ejecutivo:</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fecha Entrega Estimada:</label>
                  <input
                    type="date"
                    value={deliveryDateEstimated}
                    onChange={e => setDeliveryDateEstimated(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              {/* Constructor de Partidas */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                <h4 className="font-bold text-black text-xs uppercase tracking-wider">
                  Agregar Material o Materia Prima:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-500">Vincular Material de Inventario:</label>
                    <select
                      value={newItemInvId}
                      onChange={e => {
                        setNewItemInvId(e.target.value);
                        const sel = inventory.find(i => i.id === e.target.value);
                        if (sel) {
                          setNewItemDesc(sel.name);
                          setNewItemUnit(sel.unit);
                          setNewItemCost(sel.unitCost);
                        }
                      }}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                    >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.code} - {inv.name} (Stock: {inv.stock})
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
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500">Costo Unitario ($):</label>
                    <input
                      type="number"
                      min="1"
                      value={newItemCost}
                      onChange={e => setNewItemCost(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-stone-300 rounded text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToPO}
                  className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Agregar Partida a la OC</span>
                </button>

                {/* Lista de partidas añadidas */}
                <div className="space-y-1.5 border-t border-stone-200 pt-2">
                  {items.map(it => (
                    <div key={it.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-stone-200">
                      <div>
                        <span className="font-bold">{it.quantity} {it.unit}</span> - <span>{it.description}</span>
                        <span className="text-stone-500 block text-[10px]">C/U: ${it.unitCost.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-black">${it.total.toLocaleString('es-MX')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notas de Logística / Entrega:</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              {/* Totales */}
              <div className="p-3 bg-stone-100 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal Compra:</span>
                  <span className="font-bold">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA Trasladado (16%):</span>
                  <span className="font-bold">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-black pt-1 border-t border-stone-200">
                  <span>Total Orden de Compra:</span>
                  <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
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
                  Autorizar & Guardar Orden de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Previsualización Formal de la OC */}
      {previewPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  DOCUMENTO OFICIAL DE COMPRA
                </span>
                <h3 className="text-lg font-black text-black">
                  {previewPO.folio}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPO(null)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1 font-mono">
              <p><strong>Comprador:</strong> MALLAESA S.A. DE C.V. (MAL210419NL8)</p>
              <p><strong>Proveedor:</strong> {previewPO.provider} ({previewPO.rfc})</p>
              <p><strong>Fecha Emisión:</strong> {previewPO.date}</p>
              <p><strong>Estatus:</strong> {previewPO.status.toUpperCase()}</p>
              <p><strong>Autorizó:</strong> {previewPO.approvedBy || 'Dirección General'}</p>
            </div>

            <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto">
              <span className="font-bold block text-stone-700">Partidas:</span>
              {previewPO.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-stone-100">
                  <span>{it.quantity} {it.unit} • {it.description}</span>
                  <span className="font-bold">${it.total.toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-2 flex justify-between font-black text-sm text-black">
              <span>Total Orden:</span>
              <span>${previewPO.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
              <button
                onClick={() => setPreviewPO(null)}
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
