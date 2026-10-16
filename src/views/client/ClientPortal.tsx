import React, { useState, useMemo } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import { ServiceType, TerrainType } from '../../types';
import { calculateIntelligentQuote, exportQuoteToPdf, IntelligentQuoteResult } from '../../utils/quoteCalculator';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  Upload,
  Search,
  FileText,
  ShieldCheck,
  MapPin,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  User,
  ArrowRight,
  Layers,
  Clock,
  Download,
  PenTool,
  Check,
  Printer,
  Sparkles,
  Calculator,
  PlusCircle,
  FileCheck2,
  Info
} from 'lucide-react';

const SERVICE_OPTIONS: { id: ServiceType; label: string; image: string; desc: string }[] = [
  {
    id: 'malla_ciclonica',
    label: 'Malla Ciclónica Galvanizada',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=500&q=80',
    desc: 'Calibre 10.5 o 12.5 con postes y tubo superior para industria, terrenos y residencias.'
  },
  {
    id: 'concertina',
    label: 'Concertina de Seguridad Arpón',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=500&q=80',
    desc: 'Espiral helicoidal de cuchillas en acero inoxidable para coronación de bardas.'
  },
  {
    id: 'reja_acero',
    label: 'Reja de Acero Ornamental',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
    desc: 'Paneles de alambre electrosoldado con pintura poliéster horneada verde o negra.'
  },
  {
    id: 'malla_ganadera',
    label: 'Malla Ganadera / Borreguera',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
    desc: 'Nudo graduado para ranchos, contención de animales bovinos, ovinos y predios campestres.'
  },
  {
    id: 'cerca_electrificada',
    label: 'Cerca Electrificada Industrial',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=500&q=80',
    desc: 'Líneas de alto voltaje disuasivo con energizador y alarma perimetral integrada.'
  },
  {
    id: 'alambre_puas',
    label: 'Alambre de Púas Galvanizado',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
    desc: 'Protección perimetral económica de 2 a 4 hilos en calibres reforzados 12.5.'
  },
  {
    id: 'cinta_privacidad',
    label: 'Cinta de Privacidad Rompevientos',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
    desc: 'Cinta plástica con protección UV para tejer sobre malla ciclónica y dar privacidad.'
  }
];

export const ClientPortal: React.FC<{
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}> = ({ activeModule, onNavigateModule }) => {
  const {
    saveIntelligentQuote,
    projects,
    formalQuotes,
    clientApproveQuote
  } = useMallaesa();

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [city, setCity] = useState('Monterrey, N.L.');
  const [serviceType, setServiceType] = useState<ServiceType>('malla_ciclonica');
  const [linearMeters, setLinearMeters] = useState<number>(80);
  const [heightMeters, setHeightMeters] = useState<number>(2.0);
  const [terrainType, setTerrainType] = useState<TerrainType>('tierra');
  const [notes, setNotes] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');

  // Optional Add-ons for Intelligent calculation
  const [addConcertinaTop, setAddConcertinaTop] = useState(false);
  const [addBarbedWireTop, setAddBarbedWireTop] = useState(false);
  const [addGate, setAddGate] = useState(false);
  const [addPedestrianGate, setAddPedestrianGate] = useState(false);
  const [addPrivacyTape, setAddPrivacyTape] = useState(false);

  // Generated Intelligent Quote result state
  const [intelligentResult, setIntelligentResult] = useState<IntelligentQuoteResult | null>(null);

  // Search Folio state
  const [searchFolio, setSearchFolio] = useState('');
  const [searchedProject, setSearchedProject] = useState<any>(null);

  // Approval modal in client view
  const [clientSignatureInput, setClientSignatureInput] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Live dynamic price preview computation
  const liveQuote = useMemo(() => {
    return calculateIntelligentQuote({
      clientName: clientName || 'Prospecto',
      clientPhone,
      clientEmail,
      projectAddress,
      city,
      serviceType,
      linearMeters: Number(linearMeters) || 50,
      heightMeters: Number(heightMeters) || 2.0,
      terrainType,
      addConcertinaTop,
      addBarbedWireTop,
      addGate,
      addPedestrianGate,
      addPrivacyTape,
      notes
    });
  }, [
    clientName,
    clientPhone,
    clientEmail,
    projectAddress,
    city,
    serviceType,
    linearMeters,
    heightMeters,
    terrainType,
    addConcertinaTop,
    addBarbedWireTop,
    addGate,
    addPedestrianGate,
    addPrivacyTape,
    notes
  ]);

  const handleGenerateIntelligentQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Por favor ingresa tu nombre y teléfono para generar la cotización formal con membrete.');
      return;
    }

    const result = calculateIntelligentQuote({
      clientName,
      clientPhone,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      projectAddress: projectAddress || 'Ubicación en confirmación',
      city,
      serviceType,
      linearMeters: Number(linearMeters) || 50,
      heightMeters: Number(heightMeters) || 2.0,
      terrainType,
      addConcertinaTop,
      addBarbedWireTop,
      addGate,
      addPedestrianGate,
      addPrivacyTape,
      notes
    });

    // Save into Mallaesa system context
    saveIntelligentQuote(result);
    setIntelligentResult(result);

    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 } });
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportPdf = () => {
    if (!intelligentResult) return;
    exportQuoteToPdf(intelligentResult);
  };

  const handleSearchProject = (folioToFind?: string) => {
    const term = (folioToFind || searchFolio).trim().toUpperCase();
    if (!term) return;

    const found = projects.find(
      p => p.folio.toUpperCase() === term || p.folio.toUpperCase().includes(term)
    );

    if (found) {
      setSearchedProject(found);
    } else {
      alert(`No encontramos ningún proyecto registrado con el folio "${term}". Por favor verifica el número.`);
    }
  };

  const handleClientApprove = (quoteId: string) => {
    if (!clientSignatureInput.trim()) {
      alert('Por favor ingresa tu nombre completo o firma de aceptación.');
      return;
    }
    clientApproveQuote(quoteId, clientSignatureInput);
    setIsApproving(false);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {}
    alert('¡Cotización aprobada con éxito! El área administrativa registrará tu anticipo para iniciar la fabricación y logística de instalación.');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          MÓDULO 1: COTIZADOR INTELIGENTE CON PRECIO EXACTO
         ======================================================== */}
      {activeModule === 'cuestionario' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tarjeta de bienvenida limpia */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
                  MALLAESA • Cotizador Inteligente
                </span>
                <h1 className="text-2xl font-bold text-black mt-1">
                  Cotizador Inteligente con Precio Exacto en Vivo
                </h1>
                <p className="text-sm text-stone-600 mt-1 max-w-2xl">
                  Configura las medidas y especificaciones de tu proyecto. El motor calculará de forma automática los materiales, mano de obra y el <strong>precio exacto</strong>, con opción de <strong>exportar en PDF</strong> oficial.
                </p>
              </div>
              <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg text-right">
                <span className="text-[11px] text-stone-500 block font-semibold">Atención Telefónica</span>
                <span className="text-xs font-bold text-black flex items-center gap-1 justify-end">
                  <Phone className="w-3.5 h-3.5 text-[#898A82]" /> (81) 3406-0349
                </span>
              </div>
            </div>
          </div>

          {/* VISTA DE RESULTADO CON PRECIO EXACTO Y EXPORTACIÓN EN PDF */}
          {intelligentResult ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg animate-scale-in">
              {/* Encabezado del Presupuesto */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                    <FileCheck2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black border border-stone-200 rounded">
                        {intelligentResult.folio}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Precio Exacto Calculado
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-black mt-1">
                      Presupuesto Formal Generado
                    </h2>
                    <p className="text-xs text-stone-500">
                      Emitido para: <strong>{intelligentResult.clientName}</strong> • {intelligentResult.city}
                    </p>
                  </div>
                </div>

                {/* BOTÓN DESTACADO DE EXPORTAR A PDF */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Exportar en PDF</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs border border-stone-300 transition"
                    title="Imprimir cotización"
                  >
                    <Printer className="w-4 h-4 text-[#898A82]" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </button>
                </div>
              </div>

              {/* CAJA PRINCIPAL DE PRECIO EXACTO TOTAL */}
              <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-inner">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#898A82] block">
                    Inversión Total con IVA Incluido (16%)
                  </span>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
                    ${intelligentResult.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-lg font-normal text-stone-400">MXN</span>
                  </div>
                  <p className="text-xs text-stone-400 pt-1">
                    Incluye materiales galvanizados certificados, herrajes de tensión, cemento y mano de obra especializada en obra.
                  </p>
                </div>

                <div className="bg-stone-800/90 border border-stone-700 p-4 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-[#898A82]">
                    Esquema de Pago 50/50:
                  </span>
                  <div className="flex justify-between text-stone-300">
                    <span>50% Anticipo Inicial:</span>
                    <strong className="text-white">${intelligentResult.advance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between text-stone-300">
                    <span>50% Saldo contra entrega:</span>
                    <strong className="text-white">${intelligentResult.balance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="pt-2 border-t border-stone-700 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Garantía de {intelligentResult.warrantyYears} años por escrito
                  </div>
                </div>
              </div>

              {/* TABLA DE CONCEPTOS DESGLOSADOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                    Desglose Técnico de Materiales y Mano de Obra:
                  </h3>
                  <span className="text-xs text-stone-500 font-semibold">
                    {intelligentResult.items.length} conceptos calculados
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3 text-center">Cant.</th>
                        <th className="py-2.5 px-3 text-center">Unidad</th>
                        <th className="py-2.5 px-3 text-right">P. Unitario</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {intelligentResult.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-stone-50/50">
                          <td className="py-2.5 px-3 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-black">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-center text-stone-500">{item.unit}</td>
                          <td className="py-2.5 px-3 text-right font-mono">${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-black font-mono">${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-stone-50 border-t border-stone-200 text-xs">
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-stone-500 text-right">Subtotal:</td>
                        <td colSpan={2} className="py-2 px-3 text-right font-bold text-black font-mono">
                          ${intelligentResult.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-stone-500 text-right">IVA Trasladado (16%):</td>
                        <td colSpan={2} className="py-2 px-3 text-right font-bold text-black font-mono">
                          ${intelligentResult.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </td>
                      </tr>
                      <tr className="bg-stone-100 font-bold text-sm">
                        <td colSpan={4} className="py-3 px-3 text-black text-right">PRECIO EXACTO TOTAL:</td>
                        <td colSpan={2} className="py-3 px-3 text-right font-black text-black font-mono">
                          ${intelligentResult.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Botones de Acción al pie de la cotización */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setIntelligentResult(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-xs transition"
                >
                  Modificar Parámetros / Nueva Cotización
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleExportPdf}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-xs transition"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Descargar PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setSearchFolio(intelligentResult.folio);
                      handleSearchProject(intelligentResult.folio);
                      if (onNavigateModule) onNavigateModule('estatus');
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-black rounded-lg font-bold text-xs border border-stone-300 transition"
                  >
                    <span>Ver Estatus de Obra</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerateIntelligentQuote} className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
              {/* Paso 1: Tipo de Servicio */}
              <div>
                <label className="block text-sm font-bold text-black mb-1">
                  1. Selecciona el Tipo de Sistema de Seguridad Perimetral:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Elige la solución que mejor se adapte a tu necesidad de protección o delimitación.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SERVICE_OPTIONS.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setServiceType(srv.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        serviceType === srv.id
                          ? 'border-black bg-stone-50 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-black">{srv.label}</h4>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              serviceType === srv.id
                                ? 'border-black bg-black text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {serviceType === srv.id && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                        </div>
                        <p className="text-xs text-stone-500 leading-snug">{srv.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paso 2: Medidas y Terreno */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  2. Medidas Requeridas y Características del Terreno:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Ingresa los metros lineales aproximados y la altura deseada para tu cerca.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Metros Lineales Aprox. (m) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="10000"
                        value={linearMeters}
                        onChange={(e) => setLinearMeters(Math.max(1, Number(e.target.value)))}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold text-black text-sm focus:outline-hidden focus:border-black"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-stone-500 font-semibold">
                        mts
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Altura Requerida *
                    </label>
                    <select
                      value={heightMeters}
                      onChange={(e) => setHeightMeters(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold text-black text-sm focus:outline-hidden focus:border-black cursor-pointer"
                    >
                      <option value="1.25">1.25 metros (Residencial baja)</option>
                      <option value="1.50">1.50 metros (Residencial estándar)</option>
                      <option value="2.00">2.00 metros (Comercial / Recomendada)</option>
                      <option value="2.50">2.50 metros (Industrial y seguridad)</option>
                      <option value="3.00">3.00 metros (Alta seguridad perimetral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tipo de Superficie / Terreno *
                    </label>
                    <select
                      value={terrainType}
                      onChange={(e) => setTerrainType(e.target.value as TerrainType)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold text-black text-sm focus:outline-hidden focus:border-black cursor-pointer"
                    >
                      <option value="plano">Plano y firme regular</option>
                      <option value="inclinado">Terreno inclinado / desniveles</option>
                      <option value="tierra">Tierra o pasto natural</option>
                      <option value="concreto">Firme de concreto o sobre barda</option>
                      <option value="mixto">Mixto con zonas rocosas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Paso 3: Adicionales Inteligentes */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  3. Elementos Adicionales de Seguridad y Accesos (Opcional):
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Selecciona complementos para integrarlos al cálculo exacto del presupuesto.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={addConcertinaTop}
                      onChange={e => setAddConcertinaTop(e.target.checked)}
                      className="mt-0.5 rounded text-black focus:ring-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-black block">Concertina Arpón Superior</span>
                      <span className="text-[11px] text-stone-500">Espiral de navajas sobre postes</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={addBarbedWireTop}
                      onChange={e => setAddBarbedWireTop(e.target.checked)}
                      className="mt-0.5 rounded text-black focus:ring-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-black block">Alambre de Púas (3 hilos)</span>
                      <span className="text-[11px] text-stone-500">Brazos inclinados a 45°</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={addGate}
                      onChange={e => setAddGate(e.target.checked)}
                      className="mt-0.5 rounded text-black focus:ring-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-black block">Portón Vehicular (4m x {heightMeters}m)</span>
                      <span className="text-[11px] text-stone-500">Corredizo o abatible para camiones</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={addPedestrianGate}
                      onChange={e => setAddPedestrianGate(e.target.checked)}
                      className="mt-0.5 rounded text-black focus:ring-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-black block">Puerta Peatonal (1m x {heightMeters}m)</span>
                      <span className="text-[11px] text-stone-500">Con cerrojo y marco galvanizado</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={addPrivacyTape}
                      onChange={e => setAddPrivacyTape(e.target.checked)}
                      className="mt-0.5 rounded text-black focus:ring-black h-4 w-4"
                    />
                    <div>
                      <span className="font-bold text-black block">Cinta de Privacidad Rompevientos</span>
                      <span className="text-[11px] text-stone-500">Bloqueo visual del 95% con filtro UV</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Paso 4: Ubicación y Contacto */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  4. Datos del Cliente para Emisión de Presupuesto Formal:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Requeridos para emitir el folio fiscal y membrete oficial descargable.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nombre Completo o Razón Social *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ej. Ing. Armando Morales"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Ej. 81-8399-2041"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tu.correo@empresa.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Municipio / Zona Metropolitana *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej. Monterrey, Apodaca, San Pedro..."
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Dirección o Referencia del Predio
                    </label>
                    <input
                      type="text"
                      value={projectAddress}
                      onChange={(e) => setProjectAddress(e.target.value)}
                      placeholder="Calle, número, colonia o parque industrial donde se realizará la obra"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* BARRA FLOTANTE EN VIVO DEL PRECIO ESTIMADO */}
              <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82] block">
                    Cálculo Inteligente en Tiempo Real:
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                    ${liveQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-stone-400">MXN (IVA Incluido)</span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    50% Anticipo: ${liveQuote.advance50.toLocaleString('es-MX')} • 50% Saldo: ${liveQuote.balance50.toLocaleString('es-MX')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-stone-100 rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#898A82]" />
                  <span>Generar Cotización Formal con Precio Exacto</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: ESTATUS DE SU PROYECTO
         ======================================================== */}
      {activeModule === 'estatus' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xl font-bold text-black">
              Consulta de Estatus de Proyecto
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Ingresa el folio de tu cotización (ej. <strong>COT-2026-0841</strong>) para conocer el avance técnico, fecha programada, aprobar tu cotización o descargar tu póliza de garantía.
            </p>

            {/* Buscador de Folio */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchFolio}
                  onChange={(e) => setSearchFolio(e.target.value)}
                  placeholder="Ingresa tu Folio (ej. COT-2026-0841)"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-black font-bold focus:outline-hidden focus:border-black uppercase"
                />
              </div>
              <button
                onClick={() => handleSearchProject()}
                className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition"
              >
                Buscar Folio
              </button>
            </div>

            {/* Accesos rápidos a folios demo si existen */}
            {projects.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500">Folios registrados en el sistema:</span>
                {projects.slice(0, 4).map((p) => (
                  <button
                    key={p.folio}
                    onClick={() => {
                      setSearchFolio(p.folio);
                      setSearchedProject(p);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-black hover:text-white transition font-medium"
                  >
                    {p.folio} ({p.clientName.split(' ')[0]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resultado de búsqueda */}
          {searchedProject && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
              {/* Encabezado del Proyecto */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 text-black border border-stone-200 rounded">
                      {searchedProject.folio}
                    </span>
                    <span className="text-xs font-bold text-white px-2.5 py-1 bg-[#898A82] rounded">
                      Fase {searchedProject.phase} de 5
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-black mt-2">
                    {searchedProject.clientName}
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#898A82]" />
                    {searchedProject.projectAddress}, {searchedProject.city}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <span className="text-xs text-stone-500 block font-semibold">Precio Total de Obra:</span>
                  <span className="text-xl font-black text-black">
                    ${searchedProject.totalAmount > 0 ? searchedProject.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : 'En proceso'} MXN
                  </span>
                </div>
              </div>

              {/* Barra de Progreso de las 5 Fases del Sistema */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Progreso del Proyecto en el Sistema MALLAESA
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { num: 1, name: 'Captación', desc: 'Cuestionario recibido' },
                    { num: 2, name: 'Cotización', desc: 'Presupuesto en línea' },
                    { num: 3, name: 'Aprobación', desc: 'Anticipo del 50%' },
                    { num: 4, name: 'Operaciones', desc: 'Instalación en campo' },
                    { num: 5, name: 'Cierre', desc: 'Firma & Garantía' }
                  ].map((f) => {
                    const isCompleted = searchedProject.phase > f.num;
                    const isCurrent = searchedProject.phase === f.num;

                    return (
                      <div
                        key={f.num}
                        className={`p-3 rounded-lg border text-center transition ${
                          isCompleted
                            ? 'bg-stone-50 border-stone-300'
                            : isCurrent
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-white border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isCurrent ? 'bg-white text-black' : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {f.num}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-white' : 'text-black'}`}>
                          {f.name}
                        </p>
                        <p className={`text-[10px] mt-0.5 leading-snug ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                          {f.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón interactivo para APROBAR Y FIRMAR cotización */}
              {(() => {
                const quote = formalQuotes.find(q => q.folio === searchedProject.folio);
                if (quote && (quote.status === 'enviada' || quote.status === 'borrador')) {
                  return (
                    <div className="bg-stone-100 border border-stone-300 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-black" />
                          <h4 className="font-bold text-sm text-black">
                            Cotización Formal Lista para Aprobación
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-black">
                          Total: ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Tu cotización ha sido calculada con los materiales exactos. Puedes aprobarla ahora con tu firma digital para autorizar el pedido y programar la cuadrilla.
                      </p>

                      {isApproving ? (
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-black">
                            Ingresa tu nombre completo para firmar electrónicamente:
                          </label>
                          <input
                            type="text"
                            value={clientSignatureInput}
                            onChange={(e) => setClientSignatureInput(e.target.value)}
                            placeholder="Nombre del Cliente o Representante Legal"
                            className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClientApprove(quote.id)}
                              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800"
                            >
                              Firmar y Aprobar Proyecto
                            </button>
                            <button
                              onClick={() => setIsApproving(false)}
                              className="px-4 py-2 bg-stone-200 text-stone-800 text-xs font-medium rounded-lg"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsApproving(true)}
                          className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
                        >
                          <PenTool className="w-4 h-4" />
                          Aprobar Cotización y Firmar en Línea
                        </button>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Póliza de Garantía Digital */}
              {searchedProject.warrantyFolio && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-emerald-950">
                        Póliza de Garantía Digital MALLAESA Vigente
                      </h4>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {searchedProject.warrantyFolio}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      Cobertura integral por {searchedProject.warrantyYears || 3} años contra defectos de fabricación, anclaje y corrosión galvanizada.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: CATÁLOGO DE SISTEMAS PERIMETRALES
         ======================================================== */}
      {activeModule === 'catalogo' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xl font-bold text-black">
              Catálogo de Soluciones de Seguridad Perimetral MALLAESA
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Fabricación con acero galvanizado por inmersión en caliente bajo norma ASTM A392.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_OPTIONS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-black transition flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.image}
                    alt={item.label}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-base text-black">{item.label}</h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Garantía: 3 a 5 años</span>
                      <span className="font-semibold text-black">Instalación Inmediata</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setServiceType(item.id);
                      if (onNavigateModule) onNavigateModule('cuestionario');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2 bg-stone-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-lg transition"
                  >
                    Cotizar este Sistema
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
