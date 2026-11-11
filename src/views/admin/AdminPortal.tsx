import React, { useState } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import { Invoice } from '../../types';
import confetti from 'canvas-confetti';
import {
  Receipt,
  FileCheck2,
  Wallet,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  DollarSign,
  AlertCircle,
  Building,
  Building2,
  User,
  CreditCard,
  Download,
  Eye,
  Check
} from 'lucide-react';
import { AccountsPayableView } from '../../components/AccountsPayableView';
import { SimpleReceiptsView } from '../../components/SimpleReceiptsView';
import { SuppliersView } from '../../components/SuppliersView';

export const AdminPortal: React.FC<{
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}> = ({ activeModule, onNavigateModule }) => {
  const {
    projects,
    invoices,
    registerAdvancePayment,
    registerFinalPayment,
    approvals,
    updateProjectPaymentScheme
  } = useMallaesa();

  // Modal / Inputs for Advance Payment
  const [selectedProjectIdForAdvance, setSelectedProjectIdForAdvance] = useState<string>('');
  const [advanceReceiptInput, setAdvanceReceiptInput] = useState<string>('');

  // Modal / Inputs for Final Payment
  const [selectedProjectIdForFinal, setSelectedProjectIdForFinal] = useState<string>('');
  const [finalRfcInput, setFinalRfcInput] = useState<string>('XAXX010101000');
  const [finalPaymentWay, setFinalPaymentWay] = useState<Invoice['paymentWay']>('Transferencia SPEI (03)');

  // Modal para Personalizar Esquema de Anticipos / Finiquito
  const [editingSchemeProjectId, setEditingSchemeProjectId] = useState<string | null>(null);
  const [customAdvancePercent, setCustomAdvancePercent] = useState<number>(50);

  // Active invoice preview modal
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Projects waiting for advance
  const projectsWaitingAdvance = projects.filter(
    p => p.phase >= 2 && !p.advancePaid && p.totalAmount > 0
  );

  // Projects waiting for final balance
  const projectsWaitingBalance = projects.filter(
    p => p.advancePaid && !p.balancePaid
  );

  const handleRegisterAdvance = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    registerAdvancePayment(
      projectId,
      advanceReceiptInput || `SPEI-BBVA-${Math.floor(100000 + Math.random() * 900000)}`,
      'Transferencia SPEI (03)'
    );

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}

    const advPct = proj.advancePercent || 50;
    alert(`¡Anticipo del ${advPct}% ($${proj.advanceAmount.toLocaleString('es-MX')} MXN) registrado con éxito! El proyecto ha avanzado a Fase 4 para programar su Orden de Trabajo (OT).`);
    setSelectedProjectIdForAdvance('');
    setAdvanceReceiptInput('');
  };

  const handleRegisterFinal = (projectId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const invoice = registerFinalPayment(projectId, finalPaymentWay, finalRfcInput);

    try {
      confetti({ particleCount: 100, spread: 80 });
    } catch {}

    const balPct = proj.balancePercent || 50;
    alert(`¡Finiquito del ${balPct}% ($${proj.balanceAmount.toLocaleString('es-MX')} MXN) registrado y Factura CFDI 4.0 (${invoice.seriesNumber}) emitida con éxito! El proyecto queda totalmente cerrado y concluido.`);
    setSelectedProjectIdForFinal('');
  };

  return (
    <div className="space-y-6">
      {/* Barra de Pestañas Rápidas Administrativas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'cuentas', label: '1. Cuentas por Cobrar (CxC)', icon: <Receipt className="w-4 h-4 text-emerald-600" /> },
          { id: 'cuentas_pagar', label: '2. Cuentas por Pagar (CxP)', icon: <CreditCard className="w-4 h-4 text-blue-600" /> },
          { id: 'proveedores', label: '3. Proveedores & Crédito', icon: <Building2 className="w-4 h-4 text-purple-600" /> },
          { id: 'recibos', label: '4. Recibos Simples (Sin Factura)', icon: <FileText className="w-4 h-4" /> },
          { id: 'facturas', label: '5. Facturación CFDI 4.0', icon: <FileCheck2 className="w-4 h-4" /> },
          { id: 'gastos', label: '6. Nómina & Gastos', icon: <Wallet className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigateModule?.(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-black'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          MÓDULO 1: CUENTAS POR COBRAR (ANTICIPOS Y SALDOS)
         ======================================================== */}
      {activeModule === 'cuentas' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Control de Cuentas por Cobrar & Anticipos MALLAESA
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Monitoreo estricto de anticipos (50% para inicio de obra) y finiquitos (50% al entregar con firma de conformidad).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Proyectos Esperando Anticipo (50%) */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="font-bold text-sm text-black">
                    Anticipos Pendientes de Cobro (50%)
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {projectsWaitingAdvance.length} por cobrar
                </span>
              </div>

              {projectsWaitingAdvance.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No hay proyectos pendientes de anticipo.
                </div>
              ) : (
                <div className="space-y-3">
                  {projectsWaitingAdvance.map(p => (
                    <div
                      key={p.id}
                      className="p-4 border border-stone-200 rounded-lg bg-stone-50 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center font-bold">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-black">{p.folio}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSchemeProjectId(p.id);
                              setCustomAdvancePercent(p.advancePercent || 50);
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 transition cursor-pointer"
                            title="Cambiar porcentaje de anticipo y finiquito"
                          >
                            Esquema: {p.advancePercent || 50}% / {p.balancePercent || 50}% ✎
                          </button>
                        </div>
                        <span className="text-black text-sm">
                          ${p.advanceAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <p className="font-semibold text-black">{p.clientName}</p>
                      <p className="text-stone-500 text-[11px]">{p.projectAddress}, {p.city}</p>

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Referencia SPEI / Banco"
                          value={selectedProjectIdForAdvance === p.id ? advanceReceiptInput : ''}
                          onChange={(e) => {
                            setSelectedProjectIdForAdvance(p.id);
                            setAdvanceReceiptInput(e.target.value);
                          }}
                          className="text-xs p-1.5 bg-white border border-stone-300 rounded flex-1 focus:outline-hidden"
                        />
                        <button
                          onClick={() => handleRegisterAdvance(p.id)}
                          className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white font-bold rounded text-xs transition cursor-pointer shrink-0"
                        >
                          Confirmar Anticipo ({p.advancePercent || 50}%)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Proyectos Esperando Liquidación Final */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h3 className="font-bold text-sm text-black">
                    Saldos / Finiquitos por Cobrar
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {projectsWaitingBalance.length} pendientes
                </span>
              </div>

              {projectsWaitingBalance.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No hay proyectos con finiquito pendiente.
                </div>
              ) : (
                <div className="space-y-3">
                  {projectsWaitingBalance.map(p => {
                    const isFinishedInField = p.phase === 5 || p.status === 'esperando_saldo';

                    return (
                      <div
                        key={p.id}
                        className={`p-4 border rounded-lg text-xs space-y-2 ${
                          isFinishedInField
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex justify-between items-center font-bold">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-black">{p.folio}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                              Finiquito: {p.balancePercent || 50}%
                            </span>
                          </div>
                          <span className="text-black text-sm">
                            ${p.balanceAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </span>
                        </div>
                        <p className="font-semibold text-black">{p.clientName}</p>

                        <div className="flex items-center justify-between text-[11px] text-stone-600">
                          <span>Estatus obra: <strong>{p.phaseName}</strong></span>
                          {p.warrantyFolio && (
                            <span className="text-emerald-700 font-bold">Firma de conformidad lista</span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="RFC Receptor (XAXX010101000)"
                            value={selectedProjectIdForFinal === p.id ? finalRfcInput : 'XAXX010101000'}
                            onChange={(e) => {
                              setSelectedProjectIdForFinal(p.id);
                              setFinalRfcInput(e.target.value);
                            }}
                            className="text-xs p-1.5 bg-white border border-stone-300 rounded w-44 focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleRegisterFinal(p.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition cursor-pointer shrink-0"
                          >
                            Cobrar Finiquito ({p.balancePercent || 50}%) & Emitir CFDI
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* MODAL: MODIFICAR ESQUEMA DE PAGOS (ANTICIPO / FINIQUITO) */}
          {editingSchemeProjectId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <h3 className="text-base font-bold text-black flex items-center gap-2">
                    Personalizar Esquema de Cobro
                  </h3>
                  <button
                    onClick={() => setEditingSchemeProjectId(null)}
                    className="text-stone-400 hover:text-black p-1 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-stone-600">
                  Modifica los porcentajes de anticipo y finiquito para este proyecto. Los montos se recalcularán automáticamente.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Porcentaje de Anticipo: <strong className="text-black text-sm">{customAdvancePercent}%</strong>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={customAdvancePercent}
                      onChange={e => setCustomAdvancePercent(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-stone-500 font-semibold mt-1">
                      <span>Anticipo: {customAdvancePercent}%</span>
                      <span>Finiquito: {100 - customAdvancePercent}%</span>
                    </div>
                  </div>

                  {/* Botones de esquemas rápidos */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '50% / 50% (Estándar)', adv: 50 },
                      { label: '60% / 40%', adv: 60 },
                      { label: '70% / 30%', adv: 70 },
                      { label: '100% Contado', adv: 100 }
                    ].map(opt => (
                      <button
                        key={opt.adv}
                        type="button"
                        onClick={() => setCustomAdvancePercent(opt.adv)}
                        className={`p-2 rounded-lg font-bold border text-center transition cursor-pointer ${
                          customAdvancePercent === opt.adv
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-stone-50 text-stone-800 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Previsualización de montos calculados */}
                  {(() => {
                    const targetProj = projects.find(p => p.id === editingSchemeProjectId);
                    if (!targetProj) return null;
                    const previewAdvance = (targetProj.totalAmount * customAdvancePercent) / 100;
                    const previewBalance = targetProj.totalAmount - previewAdvance;

                    return (
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-600">Total Obra:</span>
                          <strong className="text-black">${targetProj.totalAmount.toLocaleString('es-MX')} MXN</strong>
                        </div>
                        <div className="flex justify-between text-amber-800 font-semibold">
                          <span>Nuevo Anticipo ({customAdvancePercent}%):</span>
                          <strong>${previewAdvance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                        </div>
                        <div className="flex justify-between text-blue-800 font-semibold">
                          <span>Nuevo Finiquito ({100 - customAdvancePercent}%):</span>
                          <strong>${previewBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setEditingSchemeProjectId(null)}
                    className="px-3 py-1.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-stone-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSchemeProjectId) {
                        updateProjectPaymentScheme(editingSchemeProjectId, customAdvancePercent);
                        setEditingSchemeProjectId(null);
                      }
                    }}
                    className="px-4 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-neutral-800"
                  >
                    Guardar Esquema
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: FACTURACIÓN CFDI 4.0
         ======================================================== */}
      {activeModule === 'facturas' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Historial de Facturación Electrónica CFDI 4.0
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Comprobantes fiscales timbrados emitidos por MALLAESA S.A. DE C.V. asociados a cada orden de obra.
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Serie & Folio</th>
                    <th className="py-3 px-4">Folio Fiscal (UUID SAT)</th>
                    <th className="py-3 px-4">Cliente Receptor</th>
                    <th className="py-3 px-4">RFC</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4 text-right">Total Facturado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-black">
                        {inv.seriesNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-stone-500">
                        {inv.folioFiscalUuid.substring(0, 18)}...
                      </td>
                      <td className="py-3 px-4 font-semibold text-black">
                        {inv.clientName}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600">
                        {inv.rfc}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {inv.date}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {inv.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-black">
                        ${inv.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded transition"
                          title="Visualizar CFDI"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal de Previsualización CFDI */}
          {previewInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-stone-200">
                <div className="flex justify-between items-start border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                      CFDI 4.0 • INGRESO
                    </span>
                    <h3 className="text-lg font-bold text-black">
                      Factura {previewInvoice.seriesNumber}
                    </h3>
                  </div>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="text-stone-400 hover:text-black font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1 font-mono">
                  <p><strong>Emisor:</strong> MALLAESA S.A. DE C.V. (MAL210419NL8)</p>
                  <p><strong>Receptor:</strong> {previewInvoice.clientName} ({previewInvoice.rfc})</p>
                  <p><strong>Folio Fiscal UUID:</strong> {previewInvoice.folioFiscalUuid}</p>
                  <p><strong>Método de Pago:</strong> {previewInvoice.paymentMethod} - En una sola exhibición</p>
                  <p><strong>Forma de Pago:</strong> {previewInvoice.paymentWay}</p>
                </div>

                <div className="border-t border-b border-stone-200 py-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${previewInvoice.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA Trasladado (16%):</span>
                    <span className="font-semibold">${previewInvoice.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-black pt-1 border-t border-stone-100">
                    <span>Total CFDI:</span>
                    <span>${previewInvoice.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert('XML y PDF del CFDI 4.0 generados exitosamente.');
                      setPreviewInvoice(null);
                    }}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition"
                  >
                    Descargar XML & PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: NÓMINA Y GASTOS OPERATIVOS
         ======================================================== */}
      {activeModule === 'gastos' && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-black">
                Nómina Semanal & Viáticos de Cuadrillas
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Control de sueldos de instaladores de campo y viáticos operativos autorizados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { crew: 'Cuadrilla Alfa (Roberto & Carlos)', weeklyPay: 12400, viatics: 2800, status: 'Pagado' },
              { crew: 'Cuadrilla Beta (Eduardo & Manuel)', weeklyPay: 11800, viatics: 1400, status: 'Pagado' },
              { crew: 'Cuadrilla Gamma (Ignacio & Fernando)', weeklyPay: 10500, viatics: 950, status: 'Pendiente' }
            ].map((c, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-black">{c.crew.split('(')[0]}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                    {c.status}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mano de Obra Semanal:</span>
                    <span className="font-semibold text-black">${c.weeklyPay.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Viáticos Autorizados:</span>
                    <span className="font-semibold text-black">${c.viatics.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-black pt-2 border-t border-stone-100">
                    <span>Total Dispersión:</span>
                    <span>${(c.weeklyPay + c.viatics).toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MÓDULO: CATÁLOGO Y GESTIÓN DE PROVEEDORES
         ======================================================== */}
      {activeModule === 'proveedores' && (
        <SuppliersView onNavigateModule={onNavigateModule} />
      )}

      {/* ========================================================
          MÓDULO 4: CUENTAS POR PAGAR (CxP)
         ======================================================== */}
      {activeModule === 'cuentas_pagar' && (
        <AccountsPayableView />
      )}

      {/* ========================================================
          MÓDULO 5: RECIBOS SIMPLES (SIN FACTURA)
         ======================================================== */}
      {activeModule === 'recibos' && (
        <SimpleReceiptsView />
      )}
    </div>
  );
};
