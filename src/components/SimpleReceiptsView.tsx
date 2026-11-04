import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { SimpleReceipt } from '../types';
import confetti from 'canvas-confetti';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Download,
  DollarSign,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Building,
  ShieldCheck
} from 'lucide-react';

export const SimpleReceiptsView: React.FC = () => {
  const {
    simpleReceipts,
    createSimpleReceipt,
    projects
  } = useMallaesa();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<SimpleReceipt | null>(null);

  // Form states for new receipt
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [concept, setConcept] = useState('Anticipo 50% para Suministro e Instalación de Cerco Perimetral');
  const [totalProjectAmount, setTotalProjectAmount] = useState<number>(35000);
  const [amountPaid, setAmountPaid] = useState<number>(17500);
  const [paymentType, setPaymentType] = useState<SimpleReceipt['paymentType']>('anticipo');
  const [paymentMethod, setPaymentMethod] = useState<SimpleReceipt['paymentMethod']>('Transferencia SPEI');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('Pago particular que no requiere comprobante fiscal digital CFDI.');

  const remainingBalance = Math.max(0, totalProjectAmount - amountPaid);

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setClientName(proj.clientName);
      setClientPhone(proj.clientPhone);
      setClientAddress(`${proj.projectAddress}, ${proj.city}`);
      setTotalProjectAmount(proj.totalAmount || 30000);
      if (paymentType === 'anticipo') {
        setAmountPaid(proj.advanceAmount || (proj.totalAmount * 0.5));
      } else if (paymentType === 'liquidacion_total') {
        setAmountPaid(proj.balanceAmount || (proj.totalAmount * 0.5));
      }
    }
  };

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || amountPaid <= 0) {
      alert('Ingresa el nombre del cliente y el monto abonado.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newReceipt = createSimpleReceipt({
      projectId: selectedProjectId || undefined,
      clientName,
      clientPhone,
      clientAddress,
      concept,
      totalProjectAmount,
      amountPaid,
      remainingBalance,
      paymentType,
      paymentMethod,
      reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      date: today,
      issuedBy: 'Administración MALLAESA (Caja General)',
      notes
    });

    try {
      confetti({ particleCount: 75, spread: 60 });
    } catch {}

    alert(`¡Recibo ${newReceipt.folio} emitido con éxito! Listo para imprimir o descargar.`);
    setIsModalOpen(false);
    setSelectedReceipt(newReceipt);
  };

  const filteredReceipts = simpleReceipts.filter(r => {
    const matchesSearch =
      r.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.concept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'todos' || r.paymentType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Encabezado */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Cobranza & Comprobantes No Fiscales
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
              Módulo Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Recibos de Pago (Sin Factura)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Emisión de comprobantes formales para clientes particulares que no requieren factura fiscal del SAT. Permite registrar anticipos del 50%, abonos parciales o finiquitos totales con cálculo de saldo pendiente y formato descargable.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Emitir Nuevo Recibo de Pago</span>
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Recibos Emitidos
          </span>
          <span className="text-2xl font-black text-black mt-1 block">
            {simpleReceipts.length} <span className="text-xs font-semibold text-stone-400">comprobantes</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Clientes particulares y residenciales</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Monto Total Cobrado
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ${simpleReceipts.reduce((sum, r) => sum + r.amountPaid, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Ingresos en caja y SPEI</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Saldos Pendientes Registrados
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            ${simpleReceipts.reduce((sum, r) => sum + r.remainingBalance, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Por cobrar al concluir obras</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o concepto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['todos', 'anticipo', 'abono_parcial', 'liquidacion_total'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                filterType === t
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Recibos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReceipts.map(rec => (
          <div
            key={rec.id}
            className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-black transition"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                  {rec.folio}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    rec.paymentType === 'liquidacion_total'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {rec.paymentType.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="font-bold text-base text-black">{rec.clientName}</h3>
                <p className="text-xs text-stone-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#898A82]" /> {rec.clientPhone}
                </p>
                {rec.clientAddress && (
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#898A82]" /> {rec.clientAddress}
                  </p>
                )}
              </div>

              <div className="mt-3 p-3 bg-stone-50 rounded-xl text-xs space-y-1.5 border border-stone-200/60">
                <div className="font-semibold text-stone-700">
                  Concepto: <span className="text-black">{rec.concept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Forma de Pago:</span>
                  <span className="font-bold text-black">{rec.paymentMethod} ({rec.reference})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Fecha de Pago:</span>
                  <span className="font-bold text-black">{rec.date}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200 font-bold text-emerald-800 text-sm">
                  <span>Monto Recibido:</span>
                  <span>${rec.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
                {rec.remainingBalance > 0 && (
                  <div className="flex justify-between text-[11px] text-amber-700 font-semibold">
                    <span>Saldo Restante por Liquidar:</span>
                    <span>${rec.remainingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                Emitido por: {rec.issuedBy}
              </span>
              <button
                onClick={() => setSelectedReceipt(rec)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver / Imprimir Recibo</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Emitir Recibo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  MALLAESA • COBRANZA NO FISCAL
                </span>
                <h3 className="text-lg font-black text-black">
                  Emitir Recibo de Pago
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-3 text-xs">
              {projects.length > 0 && (
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Vincular Proyecto de Obra (Opcional):</label>
                  <select
                    value={selectedProjectId}
                    onChange={e => handleSelectProject(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="">Seleccionar de lista de proyectos...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.folio} - {p.clientName} (${p.totalAmount.toLocaleString('es-MX')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nombre del Cliente:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Domicilio del Terreno / Obra:</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={e => setClientAddress(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Concepto:</label>
                <input
                  type="text"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Pago:</label>
                  <select
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="anticipo">Anticipo (50%)</option>
                    <option value="abono_parcial">Abono Parcial</option>
                    <option value="liquidacion_total">Liquidación Total</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Monto Total Obra ($):</label>
                  <input
                    type="number"
                    value={totalProjectAmount}
                    onChange={e => setTotalProjectAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Monto Abonado ($):</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-emerald-50 border border-emerald-300 rounded-lg font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Método de Pago:</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="Transferencia SPEI">Transferencia SPEI</option>
                    <option value="Efectivo">Efectivo en Sucursal / Obra</option>
                    <option value="Tarjeta de Débito/Crédito">Tarjeta de Débito/Crédito</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Folio / Referencia Bancaria:</label>
                  <input
                    type="text"
                    placeholder="Ej. SPEI-192084"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl flex justify-between font-bold text-stone-800 text-xs">
                <span>Saldo Pendiente Después de este Abono:</span>
                <span className="font-mono text-black">${remainingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
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
                  Generar Recibo de Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Vista Formal del Recibo para Imprimir */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-stone-300">
            {/* Membrete Oficial Mallaesa */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4">
              <div>
                <img
                  src="https://appdesignproyectos.com/mallaesalogo.png"
                  alt="MALLAESA"
                  className="h-10 w-auto object-contain mb-1"
                />
                <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                  Mallaesa S.A. de C.V. • Seguridad Perimetral & Cercos
                </p>
                <p className="text-[10px] text-stone-400">
                  Monterrey, N.L. • Tel: (81) 8300-0000 • www.mallaesa.com
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-black border border-stone-200 rounded">
                  COMPROBANTE NO FISCAL
                </span>
                <h3 className="font-mono font-black text-lg text-black mt-1">
                  {selectedReceipt.folio}
                </h3>
                <p className="text-xs text-stone-500">{selectedReceipt.date}</p>
              </div>
            </div>

            {/* Datos del Cliente y Pago */}
            <div className="bg-stone-50 rounded-xl p-4 text-xs space-y-2 border border-stone-200 font-medium">
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold">Recibimos de:</span>
                <span className="font-bold text-black">{selectedReceipt.clientName}</span>
              </div>
              {selectedReceipt.clientPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Teléfono:</span>
                  <span className="text-black">{selectedReceipt.clientPhone}</span>
                </div>
              )}
              {selectedReceipt.clientAddress && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Ubicación Obra:</span>
                  <span className="text-black truncate max-w-[280px]">{selectedReceipt.clientAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Por Concepto de:</span>
                <span className="font-bold text-black text-right max-w-[320px]">{selectedReceipt.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Forma y Referencia:</span>
                <span className="font-mono text-black">{selectedReceipt.paymentMethod} ({selectedReceipt.reference})</span>
              </div>
            </div>

            {/* Desglose de Importes */}
            <div className="border border-stone-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-600">Importe Total del Proyecto:</span>
                <span className="font-semibold text-black">${selectedReceipt.totalProjectAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-800 pt-2 border-t border-stone-200">
                <span>CANTIDAD RECIBIDA:</span>
                <span>${selectedReceipt.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-amber-700 pt-1">
                <span>Saldo Pendiente:</span>
                <span>${selectedReceipt.remainingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
            </div>

            {/* Firmas de conformidad */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-stone-200 text-center text-[10px]">
              <div>
                <div className="border-b border-stone-400 h-10 mb-1"></div>
                <span className="font-bold text-stone-700 block">{selectedReceipt.issuedBy}</span>
                <span className="text-stone-400">Por MALLAESA S.A. DE C.V.</span>
              </div>
              <div>
                <div className="border-b border-stone-400 h-10 mb-1"></div>
                <span className="font-bold text-stone-700 block">{selectedReceipt.clientName}</span>
                <span className="text-stone-400">Firma del Cliente Receptor</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-stone-700" />
                <span>Imprimir / PDF</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition cursor-pointer"
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
