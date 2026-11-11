import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { AccountsPayableItem } from '../types';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Building,
  FileText,
  Calendar,
  Send,
  ArrowRight
} from 'lucide-react';

export const AccountsPayableView: React.FC = () => {
  const {
    accountsPayable,
    suppliers,
    createAccountsPayable,
    registerAccountsPayablePayment
  } = useMallaesa();

  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Payment modal state
  const [payingItem, setPayingItem] = useState<AccountsPayableItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Transferencia SPEI Banorte');

  // New CxP modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState<AccountsPayableItem['category']>('materia_prima');
  const [invoiceOrRef, setInvoiceOrRef] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  const totalPayable = accountsPayable
    .filter(a => a.status !== 'pagado')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalPaid = accountsPayable.reduce((sum, a) => sum + a.amountPaid, 0);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingItem || paymentAmount <= 0) return;

    registerAccountsPayablePayment(payingItem.id, paymentAmount, paymentMethod);

    try {
      confetti({ particleCount: 60, spread: 50 });
    } catch {}

    alert(`¡Pago de $${paymentAmount.toLocaleString('es-MX')} registrado para ${payingItem.provider}! Saldo actualizado.`);
    setPayingItem(null);
  };

  const handleCreateCxP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || amount <= 0) {
      alert('Por favor ingresa proveedor y monto válido.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    createAccountsPayable({
      provider,
      category,
      invoiceOrRef: invoiceOrRef || `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: today,
      dueDate: dueDate || today,
      amount,
      notes
    });

    alert('¡Cuenta por Pagar registrada con éxito!');
    setIsCreateModalOpen(false);
    setProvider('');
    setAmount(0);
    setInvoiceOrRef('');
    setNotes('');
  };

  const filteredItems = accountsPayable.filter(item => {
    const matchesCat = filterCategory === 'todos' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;
    const matchesSearch =
      item.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceOrRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Encabezado */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Administración & Finanzas
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
              Módulo Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Cuentas por Pagar a Proveedores (CxP)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Control y programación de pagos a proveedores de acero (Ternium, Deacero, tubería), fletes de obra, insumos y herramientas con registro de transferencias SPEI.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Registrar Cuenta por Pagar</span>
        </button>
      </div>

      {/* Métricas Financieras de CxP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Saldo Total por Pagar</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-black mt-2 block">
            ${totalPayable.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Compromisos vigentes de suministro</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Total Pagado en Período</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block">
            ${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Dispersiones liquidadas</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Proveedores Registrados</span>
            <Building className="w-4 h-4 text-stone-600" />
          </div>
          <span className="text-2xl font-black text-black mt-2 block">
            {accountsPayable.length} <span className="text-xs font-semibold text-stone-400">partidas</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Materias primas, fletes y servicios</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por proveedor o folio..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['todos', 'pendiente', 'parcial', 'pagado'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Cuentas por Pagar */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Folio CxP</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Factura / Ref.</th>
                <th className="py-3 px-4">Vencimiento</th>
                <th className="py-3 px-4 text-right">Importe Total</th>
                <th className="py-3 px-4 text-right">Pagado</th>
                <th className="py-3 px-4 text-right">Saldo Pendiente</th>
                <th className="py-3 px-4 text-center">Estatus</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map(cxp => {
                const isPaid = cxp.status === 'pagado';
                return (
                  <tr key={cxp.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-black">{cxp.folio}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-black">{cxp.provider}</div>
                      <span className="text-[10px] capitalize text-stone-500">{cxp.category.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">{cxp.invoiceOrRef}</td>
                    <td className="py-3.5 px-4 text-stone-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {cxp.dueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-stone-700">
                      ${cxp.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      ${cxp.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-black">
                      ${cxp.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : cxp.status === 'parcial'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {cxp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {!isPaid ? (
                        <button
                          onClick={() => {
                            setPayingItem(cxp);
                            setPaymentAmount(cxp.balance);
                          }}
                          className="px-3 py-1 bg-black hover:bg-stone-800 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                        >
                          Abonar / Liquidar
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Liquidado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registrar Pago */}
      {payingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-stone-200">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  REGISTRO DE DISPERSIÓN A PROVEEDOR
                </span>
                <h3 className="text-lg font-black text-black">
                  Pagar a {payingItem.provider}
                </h3>
              </div>
              <button
                onClick={() => setPayingItem(null)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
              <p><strong>Folio CxP:</strong> {payingItem.folio}</p>
              <p><strong>Factura Proveedor:</strong> {payingItem.invoiceOrRef}</p>
              <p><strong>Total de la Cuenta:</strong> ${payingItem.amount.toLocaleString('es-MX')} MXN</p>
              <p><strong>Saldo Actual Pendiente:</strong> ${payingItem.balance.toLocaleString('es-MX')} MXN</p>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Monto a Pagar ($ MXN):</label>
                <input
                  type="number"
                  step="0.01"
                  max={payingItem.balance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Método de Pago / Banco:</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                >
                  <option value="Transferencia SPEI Banorte">Transferencia SPEI Banorte</option>
                  <option value="Transferencia SPEI BBVA">Transferencia SPEI BBVA</option>
                  <option value="Cheque Nominativo">Cheque Nominativo</option>
                  <option value="Efectivo en Caja Chica">Efectivo en Caja Chica</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setPayingItem(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Confirmar Pago SPEI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Nueva CxP */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  REGISTRO DE PASIVO / PROVEEDOR
                </span>
                <h3 className="text-lg font-black text-black">
                  Nueva Cuenta por Pagar
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCxP} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Proveedor / Beneficiario:</label>
                <input
                  type="text"
                  list="registered-suppliers"
                  placeholder="Ej. Deacero México"
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
                <datalist id="registered-suppliers">
                  {suppliers.map(s => (
                    <option key={s.id} value={s.commercialName}>
                      {s.businessName} ({s.code})
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Categoría:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="materia_prima">Materia Prima (Acero / Malla)</option>
                    <option value="fletes">Fletes y Transporte</option>
                    <option value="servicios">Servicios / Renta Equipo</option>
                    <option value="herramientas">Herramientas y Consumibles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Factura / Remisión:</label>
                  <input
                    type="text"
                    placeholder="FAC-2026-X"
                    value={invoiceOrRef}
                    onChange={e => setInvoiceOrRef(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Monto Total ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fecha de Vencimiento:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Notas / Referencia de Obra:</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-black hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Guardar Cuenta por Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
