import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Square,
  Columns,
  Grid,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  DoorClosed,
  ArrowRight,
  Sparkles,
  Download,
  Trash2,
  Printer,
  FileCheck2,
  Phone,
  Mail,
  User,
  MapPin,
  MessageCircle,
  PlusCircle,
  HelpCircle,
  Sliders,
  CheckCircle2,
  TrendingUp,
  History,
  Package,
  Plus,
  Info,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { OFFICIAL_PRICE_LIST, OfficialCategory, OfficialProduct } from '../data/officialPriceList';
import { CategoryProductsModal } from './CategoryProductsModal';
import { exportQuoteToPdf, IntelligentQuoteResult } from '../utils/quoteCalculator';
import { useMallaesa } from '../context/MallaesaContext';
import { QuoteItem } from '../types';

interface CartItem {
  product: OfficialProduct;
  quantity: number;
}

export interface ClientConceptRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface OfficialQuoteCalculatorViewProps {
  onGoToHistory?: () => void;
}

export const OfficialQuoteCalculatorView: React.FC<OfficialQuoteCalculatorViewProps> = ({ onGoToHistory }) => {
  const { saveIntelligentQuote } = useMallaesa();
  const [selectedCategory, setSelectedCategory] = useState<OfficialCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Margen de ganancia para el administrador (Default: 20% como solicitó el usuario)
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(20);

  // Client details for official quote
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Monterrey, N.L.'
  });

  // Conceptos manuales finales para el cliente (Lo que saldrá en la cotización)
  const [clientConcepts, setClientConcepts] = useState<ClientConceptRow[]>([
    {
      id: 'concept-1',
      description: 'MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2',
      quantity: 1,
      unit: 'Lote / Suministro',
      unitPrice: 0,
      total: 0
    }
  ]);

  const [generatedQuoteResult, setGeneratedQuoteResult] = useState<IntelligentQuoteResult | null>(null);

  const getCategoryIcon = (iconName: string) => {
    const props = { className: 'w-8 h-8 text-black group-hover:scale-110 transition-transform' };
    switch (iconName) {
      case 'Layers': return <Layers {...props} />;
      case 'Square': return <Square {...props} />;
      case 'Columns': return <Columns {...props} />;
      case 'Grid': return <Grid {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'DoorClosed': return <DoorClosed {...props} />;
      default: return <Grid {...props} />;
    }
  };

  const handleOpenCategory = (cat: OfficialCategory) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleAddProduct = (product: OfficialProduct, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (window.confirm('¿Deseas vaciar toda la materia prima de la cotización actual?')) {
      setCart([]);
      setGeneratedQuoteResult(null);
    }
  };

  // 1. Cálculos de Costo de Materia Prima
  const rawMaterialsCost = useMemo(() => {
    return Number(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2));
  }, [cart]);

  // 2. Margen de Ganancia (+20% por defecto)
  const profitAmount = useMemo(() => {
    return Number((rawMaterialsCost * (profitMarginPercent / 100)).toFixed(2));
  }, [rawMaterialsCost, profitMarginPercent]);

  // 3. Subtotal Venta Sugerido (Materia Prima + Ganancia)
  const calculatedSaleSubtotal = useMemo(() => {
    return Number((rawMaterialsCost + profitAmount).toFixed(2));
  }, [rawMaterialsCost, profitAmount]);

  // Sincronización AUTOMÁTICA: Pone automáticamente el precio sugerido de venta en el importe total del concepto
  useEffect(() => {
    if (calculatedSaleSubtotal > 0) {
      setClientConcepts(prev => {
        if (prev.length === 1) {
          const single = prev[0];
          return [
            {
              ...single,
              unitPrice: Number((calculatedSaleSubtotal / (single.quantity || 1)).toFixed(2)),
              total: calculatedSaleSubtotal
            }
          ];
        } else if (prev.length > 1) {
          const currentSum = prev.reduce((acc, c) => acc + (c.total || 0), 0);
          if (currentSum === 0) {
            const split = Number((calculatedSaleSubtotal / prev.length).toFixed(2));
            return prev.map((c, i) => {
              const isLast = i === prev.length - 1;
              const assigned = isLast ? Number((calculatedSaleSubtotal - split * (prev.length - 1)).toFixed(2)) : split;
              return {
                ...c,
                unitPrice: Number((assigned / (c.quantity || 1)).toFixed(2)),
                total: assigned
              };
            });
          }
        }
        return prev;
      });
    }
  }, [calculatedSaleSubtotal]);

  // Helper para re-sincronizar o repartir el subtotal sugerido manualmente si se desea
  const handleAutoAssignPrice = () => {
    if (clientConcepts.length === 1) {
      const single = clientConcepts[0];
      setClientConcepts([
        {
          ...single,
          unitPrice: Number((calculatedSaleSubtotal / (single.quantity || 1)).toFixed(2)),
          total: calculatedSaleSubtotal
        }
      ]);
    } else if (clientConcepts.length > 1) {
      // Divide equitativamente entre los conceptos
      const split = Number((calculatedSaleSubtotal / clientConcepts.length).toFixed(2));
      setClientConcepts(
        clientConcepts.map((c, i) => {
          const isLast = i === clientConcepts.length - 1;
          const assigned = isLast ? Number((calculatedSaleSubtotal - split * (clientConcepts.length - 1)).toFixed(2)) : split;
          return {
            ...c,
            unitPrice: Number((assigned / (c.quantity || 1)).toFixed(2)),
            total: assigned
          };
        })
      );
    }
  };

  // Manejadores de Conceptos para el Cliente
  const handleAddConceptRow = () => {
    const newId = `concept-${Date.now()}`;
    setClientConcepts(prev => [
      ...prev,
      {
        id: newId,
        description: '',
        quantity: 1,
        unit: 'Tramo',
        unitPrice: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveConceptRow = (id: string) => {
    if (clientConcepts.length <= 1) {
      alert('Debes mantener al menos un concepto para la cotización del cliente.');
      return;
    }
    setClientConcepts(prev => prev.filter(c => c.id !== id));
  };

  const handleConceptChange = (id: string, field: keyof ClientConceptRow, value: any) => {
    setClientConcepts(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === 'quantity') {
          const qty = Math.max(1, Number(value) || 1);
          updated.quantity = qty;
          if (item.total > 0) {
            updated.unitPrice = Number((item.total / qty).toFixed(2));
          } else if (item.unitPrice > 0) {
            updated.total = Number((qty * item.unitPrice).toFixed(2));
          }
        } else if (field === 'unitPrice') {
          const price = Number(value) || 0;
          updated.unitPrice = price;
          updated.total = Number(((item.quantity || 1) * price).toFixed(2));
        } else if (field === 'total') {
          const tot = Number(value) || 0;
          updated.total = tot;
          updated.unitPrice = Number((tot / (item.quantity || 1)).toFixed(2));
        }
        return updated;
      })
    );
  };

  // Subtotal real de los conceptos que se cobrarán al cliente
  const clientSubtotal = useMemo(() => {
    const sum = clientConcepts.reduce((acc, c) => acc + (c.total || 0), 0);
    // Si los conceptos no tienen precio asignado pero ya hay materia prima + ganancia calculada, usamos el calculado
    return sum > 0 ? sum : calculatedSaleSubtotal;
  }, [clientConcepts, calculatedSaleSubtotal]);

  const iva = Number((clientSubtotal * 0.16).toFixed(2));
  const total = Number((clientSubtotal + iva).toFixed(2));
  const advance50 = Number((total * 0.5).toFixed(2));
  const balance50 = Number((total - advance50).toFixed(2));

  // Generar Cotización Oficial
  const handleGenerateOfficialQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Por favor selecciona al menos un producto o materia prima haciendo clic en las 8 tarjetas de categorías.');
      return;
    }

    if (!clientData.name || !clientData.phone) {
      alert('Por favor ingresa al menos el Nombre y Teléfono del cliente para membretar la cotización formal.');
      return;
    }

    // Validar que los conceptos tengan descripción
    const invalidConcept = clientConcepts.find(c => !c.description.trim());
    if (invalidConcept) {
      alert('Por favor escribe la descripción de todos los conceptos finales que verá el cliente (ejemplo: MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2).');
      return;
    }

    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `COT-INDE-${folioNum}`;
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const validDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    const validUntilStr = validDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1. Materia prima interna (para auditoría del admin)
    const rawMaterialsItems: QuoteItem[] = cart.map((item, idx) => ({
      id: `raw-${idx + 1}`,
      description: `${item.product.name} (${item.product.spec}${item.product.gauge ? ` - ${item.product.gauge}` : ''})`,
      quantity: item.quantity,
      unit: item.product.unit,
      unitPrice: item.product.price,
      total: Number((item.product.price * item.quantity).toFixed(2))
    }));

    // 2. Conceptos finales visibles al cliente
    const finalClientConcepts: QuoteItem[] = clientConcepts.map((c, idx) => {
      const itemTotal = c.total > 0 ? c.total : (clientConcepts.length === 1 ? calculatedSaleSubtotal : 0);
      const itemPrice = c.unitPrice > 0 ? c.unitPrice : (itemTotal / (c.quantity || 1));
      return {
        id: `concept-${idx + 1}`,
        description: c.description.trim(),
        quantity: c.quantity || 1,
        unit: c.unit || 'Lote',
        unitPrice: Number(itemPrice.toFixed(2)),
        total: Number(itemTotal.toFixed(2))
      };
    });

    const result: IntelligentQuoteResult = {
      folio,
      date: dateStr,
      validUntil: validUntilStr,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      clientEmail: clientData.email || `${clientData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      projectAddress: clientData.address || 'Monterrey, N.L.',
      city: clientData.city,
      serviceType: 'malla_ciclonica',
      serviceLabel: 'Suministro Oficial de Malla e Instalación Perimetral',
      linearMeters: cart.reduce((acc, i) => acc + i.quantity, 0),
      heightMeters: 2.0,
      terrainType: 'tierra',
      terrainLabel: 'Suministro y Acopio de Materiales',
      items: finalClientConcepts, // Lo que ve el cliente
      subtotal: clientSubtotal,
      iva,
      total,
      advance50,
      balance50,
      estimatedWorkDays: Math.max(2, Math.ceil(cart.length / 2)),
      warrantyYears: 1,
      // Auditoría interna admin
      rawMaterials: rawMaterialsItems,
      rawMaterialsCost,
      profitMarginPercent,
      profitAmount,
      clientConcepts: finalClientConcepts
    };

    saveIntelligentQuote(result);
    setGeneratedQuoteResult(result);

    // Descarga automática inmediata del archivo PDF oficial para el cliente
    try {
      exportQuoteToPdf(result);
    } catch (pdfErr) {
      console.error('Error al generar y descargar automáticamente el PDF:', pdfErr);
    }

    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } catch {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Banner Superior Institucional */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
                MALLAESA • Cotizador Oficial de Producción
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
                Uso Exclusivo Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Cotizador Inteligente: Materia Prima & Producto Final
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              <strong>Paso 1:</strong> Selecciona en las 8 categorías los productos o materia prima que utilizarás (abrazaderas, láminas, postes, malla).<br />
              <strong>Paso 2:</strong> El sistema calcula el costo y añade automáticamente el <strong>20% de ganancia</strong>.<br />
              <strong>Paso 3:</strong> Escribe abajo de los datos del cliente el <strong>concepto o producto final</strong> (ejemplo: <em>MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2</em>). El cliente <strong>no verá la materia prima</strong>, únicamente tu concepto final en el PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {onGoToHistory && (
              <button
                type="button"
                onClick={onGoToHistory}
                className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs border border-stone-300 transition cursor-pointer"
              >
                <History className="w-4 h-4 text-stone-700" />
                <span>Historial de Cotizaciones</span>
              </button>
            )}
            <span className="text-xs font-bold px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
              Margen Activo: +{profitMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* VISTA DE RESULTADO FORMAL SI YA SE GENERÓ LA COTIZACIÓN */}
      {generatedQuoteResult && (
        <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                <FileCheck2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black border border-stone-200 rounded">
                    {generatedQuoteResult.folio}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Cotización Formal Generada y Guardada en Historial
                  </span>
                </div>
                <h2 className="text-xl font-black text-black mt-1">
                  Presupuesto Oficial para {generatedQuoteResult.clientName}
                </h2>
                <p className="text-xs text-stone-500">
                  Emitido el {generatedQuoteResult.date} • Vigencia: {generatedQuoteResult.validUntil}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportQuoteToPdf(generatedQuoteResult)}
                className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar Cotización en PDF</span>
              </button>
              {onGoToHistory && (
                <button
                  onClick={onGoToHistory}
                  className="flex items-center gap-1.5 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs border border-stone-300 transition cursor-pointer"
                >
                  <History className="w-4 h-4 text-stone-700" />
                  <span>Ver en Historial</span>
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs border border-stone-300 transition"
              >
                <Printer className="w-4 h-4 text-[#898A82]" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
              <a
                href={`https://wa.me/52${(generatedQuoteResult.clientPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(generatedQuoteResult.clientName)},%20te%20comparto%20la%20cotizaci%C3%B3n%20${generatedQuoteResult.folio}%20de%20MALLAESA%20por%20$${generatedQuoteResult.total}%20MXN.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Comparativa: Lo que ve el cliente vs Auditoría interna */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Vista Cliente */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Concepto en la Cotización del Cliente (PDF)
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Público para Cliente
                </span>
              </div>
              <div className="space-y-2">
                {(generatedQuoteResult.clientConcepts || generatedQuoteResult.items).map((item, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="font-black text-stone-900 text-sm">{item.description}</div>
                      <div className="text-[11px] text-stone-500">Cantidad: {item.quantity} {item.unit}</div>
                    </div>
                    <div className="text-right font-mono font-black text-sm text-black">
                      ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 text-right space-y-1">
                <div className="text-stone-500">Subtotal: ${generatedQuoteResult.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                <div className="text-stone-500">IVA (16%): ${generatedQuoteResult.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                <div className="text-base font-black text-black">Total: ${generatedQuoteResult.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</div>
              </div>
            </div>

            {/* Vista Administrador (Materia Prima + Margen) */}
            <div className="bg-stone-900 text-white rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Auditoría Administrativa (Materia Prima)
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 font-bold px-2 py-0.5 rounded">
                  Solo Administrador
                </span>
              </div>
              <div className="space-y-1.5 text-stone-300">
                <div className="flex justify-between">
                  <span>Costo Materia Prima:</span>
                  <span className="font-mono text-white font-bold">
                    ${(generatedQuoteResult.rawMaterialsCost || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Margen de Ganancia (+{generatedQuoteResult.profitMarginPercent}%):</span>
                  <span className="font-mono">
                    +${(generatedQuoteResult.profitAmount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-800 pt-1 text-white font-bold">
                  <span>Precio Venta Sugerido:</span>
                  <span className="font-mono">
                    ${generatedQuoteResult.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-stone-400 bg-stone-800 rounded-lg p-2.5">
                Materia prima oculta al cliente: {generatedQuoteResult.rawMaterials?.map(r => `${r.quantity} ${r.unit} ${r.description}`).join(' • ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PASO 1: LAS 8 TARJETAS DE CATEGORÍAS (MATERIA PRIMA)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Paso 1: Selecciona la Materia Prima por Categoría</span>
            </h2>
            <p className="text-xs text-stone-500">
              Haz clic en cualquiera de las 8 tarjetas para abrir la ventana flotante y seleccionar tus insumos (postes, abrazaderas, malla, lámina, etc.).
            </p>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {cart.length === 0 ? 'Sin materia prima agregada' : `${cart.length} productos en lista de insumos`}
          </span>
        </div>

        {/* Cuadrícula de 8 Tarjetas de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
          {OFFICIAL_PRICE_LIST.map(category => {
            const itemsInThisCategory = cart.filter(item =>
              category.products.some(p => p.id === item.product.id)
            ).reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={category.id}
                onClick={() => handleOpenCategory(category)}
                className="group relative bg-white border border-stone-200 hover:border-black rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left hover:-translate-y-1"
              >
                {itemsInThisCategory > 0 && (
                  <div className="absolute top-3 right-3 bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {itemsInThisCategory} seleccionados
                  </div>
                )}

                <div>
                  <div className="w-14 h-14 rounded-xl bg-stone-100 group-hover:bg-black group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                    {getCategoryIcon(category.iconName)}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#898A82] uppercase tracking-wider block mb-1">
                    Categoría 0{category.id}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-black group-hover:text-black line-clamp-2 leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-600 group-hover:text-black transition">
                    Ver {category.products.length} productos
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          RESUMEN DE MATERIA PRIMA SELECCIONADA + MARGEN DE GANANCIA
         ======================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-xl flex items-center justify-center font-bold">
              <Package className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">
                Materia Prima Seleccionada (Costos de Fabricación Internos)
              </h3>
              <p className="text-xs text-stone-500">
                {cart.length === 0
                  ? 'Aún no has agregado materia prima. Haz clic en las tarjetas de arriba para seleccionarla.'
                  : `Tienes ${cart.length} insumos de materia prima seleccionados.`}
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar insumos</span>
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-10 px-4 bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-2">
            <Grid className="w-10 h-10 text-stone-400 mx-auto" />
            <h4 className="font-bold text-sm text-black">No has seleccionado materia prima</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Haz clic en cualquiera de las <strong>8 tarjetas de categorías</strong> superiores para seleccionar las abrazaderas, postes, tubos o malla que conformarán el producto final.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabla de Materia Prima en el Carrito */}
            <div className="border border-stone-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Materia Prima / Insumo</th>
                    <th className="py-2.5 px-3">Medida / Calibre</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                    <th className="py-2.5 px-3 text-right">Subtotal Insumo</th>
                    <th className="py-2.5 px-2 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cart.map(item => (
                    <tr key={item.product.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-black">{item.product.name}</td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {item.product.spec} {item.product.gauge ? `(${item.product.gauge})` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-black">
                        {item.quantity} {item.product.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                        ${item.product.price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-black">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          title="Eliminar insumo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Control de Margen de Ganancia (+20% Automático) */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-800" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                    Margen de Ganancia Comercial
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                    +20% Automático
                  </span>
                </div>
                <p className="text-xs text-emerald-800 max-w-xl">
                  El sistema suma automáticamente tu porcentaje de ganancia sobre el costo total de materia prima (${rawMaterialsCost.toFixed(2)} MXN).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-700">Margen:</span>
                {[15, 20, 25, 30].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setProfitMarginPercent(pct)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      profitMarginPercent === pct
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    {pct}% {pct === 20 ? '(Recomendado)' : ''}
                  </button>
                ))}
                <div className="flex items-center bg-white border border-emerald-300 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={profitMarginPercent}
                    onChange={e => setProfitMarginPercent(Math.max(0, Number(e.target.value)))}
                    className="w-12 text-xs font-mono font-bold text-center text-black focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-stone-500">%</span>
                </div>
              </div>
            </div>

            {/* Tarjeta Resumen Financiero del Costo vs Venta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-100 p-4 rounded-xl border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-stone-500 font-bold uppercase text-[10px]">Costo Materia Prima (Interno)</span>
                <div className="text-lg font-black font-mono text-black">
                  ${rawMaterialsCost.toFixed(2)} <span className="text-[10px] font-normal text-stone-500">MXN</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-emerald-700 font-bold uppercase text-[10px]">Ganancia Estimada (+{profitMarginPercent}%)</span>
                <div className="text-lg font-black font-mono text-emerald-800">
                  +${profitAmount.toFixed(2)} <span className="text-[10px] font-normal text-emerald-700">MXN</span>
                </div>
              </div>
              <div className="space-y-0.5 bg-white p-2.5 rounded-lg border border-stone-300">
                <span className="text-black font-bold uppercase text-[10px]">Precio Venta Total Sugerido</span>
                <div className="text-lg font-black font-mono text-black">
                  ${calculatedSaleSubtotal.toFixed(2)} <span className="text-[10px] font-normal text-stone-500">+ IVA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          FORMULARIO PRINCIPAL DE COTIZACIÓN (DATOS CLIENTE + CONCEPTOS)
         ======================================================== */}
      {cart.length > 0 && (
        <form onSubmit={handleGenerateOfficialQuote} className="space-y-8">
          {/* PASO 2: DATOS DEL CLIENTE PARA MEMBRETAR */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Paso 2: Datos del Cliente para Membretar la Cotización</span>
              </h2>
              <p className="text-xs text-stone-500">
                Ingresa el nombre y contacto del cliente al que se le enviará la cotización formal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nombre o Razón Social *</label>
                <input
                  type="text"
                  required
                  value={clientData.name}
                  onChange={e => setClientData({ ...clientData, name: e.target.value })}
                  placeholder="Ej. Constructora Regiomontana S.A."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:bg-white focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={clientData.phone}
                  onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                  placeholder="Ej. (81) 8399-2041"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:bg-white focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={clientData.email}
                  onChange={e => setClientData({ ...clientData, email: e.target.value })}
                  placeholder="compras@empresa.com"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black focus:bg-white focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Dirección del Proyecto u Obra</label>
                <input
                  type="text"
                  value={clientData.address}
                  onChange={e => setClientData({ ...clientData, address: e.target.value })}
                  placeholder="Ej. Carretera a Laredo Km 14, Parque Industrial"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black focus:bg-white focus:outline-hidden focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Ciudad / Estado</label>
                <input
                  type="text"
                  value={clientData.city}
                  onChange={e => setClientData({ ...clientData, city: e.target.value })}
                  placeholder="Monterrey, N.L."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black focus:bg-white focus:outline-hidden focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              PASO 3: CAMPO DE CONCEPTOS O PRODUCTOS FINALES PARA EL CLIENTE
              (COLOCADO JUSTO ABAJO DE LOS DATOS DEL CLIENTE, COMO SOLICITÓ)
             ======================================================== */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-black">
                    Conceptos o Productos Finales para la Cotización del Cliente
                  </h2>
                </div>
                <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
                  Escribe el <strong>concepto o producto terminado</strong> que saldrá impreso en la cotización formal para el cliente.
                  <span className="text-rose-700 font-bold block mt-0.5">
                    El cliente NO verá la lista desglosada de materia prima (abrazaderas, tornillos, tubos), únicamente verá los conceptos que ingreses aquí.
                  </span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAutoAssignPrice}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Vuelve a colocar el precio sugerido de venta (materia prima + ganancia del 20%)"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Re-sincronizar Precio (${calculatedSaleSubtotal.toFixed(2)})</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddConceptRow}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Agregar Otro Concepto</span>
                </button>
              </div>
            </div>

            {/* Sugerencias Rápidas de Conceptos Comunes */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Sugerencias rápidas de conceptos (haz clic para copiar en el renglón activo):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2',
                  'MALLA CICLÓNICA GALVANIZADA 55x55 CALIBRE 10.5 ALTURA 2.00M',
                  'SUMINISTRO E INSTALACIÓN DE CERCO PERIMETRAL DE MALLA CICLÓNICA',
                  'REJA DE ACERO MODULAR ELECTROSOLDADA CALIBRE 6 CON POSTES',
                  'CONCERTINA HELICOIDAL GALVANIZADA ARPÓN DE SEGURIDAD 45CM'
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => {
                      if (clientConcepts.length > 0) {
                        handleConceptChange(clientConcepts[0].id, 'description', sug);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-[11px] font-semibold text-stone-800 transition cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista Dinámica de Conceptos Finales */}
            <div className="space-y-4">
              {clientConcepts.map((concept, index) => (
                <div
                  key={concept.id}
                  className="bg-stone-50 border border-stone-300 hover:border-black rounded-xl p-4 sm:p-5 space-y-3 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        Concepto #{index + 1} para el Cliente
                      </span>
                      {calculatedSaleSubtotal > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Precio sugerido cargado automáticamente
                        </span>
                      )}
                    </div>
                    {clientConcepts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveConceptRow(concept.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        title="Eliminar este concepto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                    {/* Campo de Concepto Principal (Manualmente Ingresado) */}
                    <div className="lg:col-span-6">
                      <label className="block font-bold text-stone-800 mb-1">
                        Descripción del Concepto / Producto Final que verá el Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={concept.description}
                        onChange={e => handleConceptChange(concept.id, 'description', e.target.value)}
                        placeholder="Ej. MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2"
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-black font-bold focus:outline-hidden focus:border-black"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">Cantidad *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={concept.quantity}
                        onChange={e => handleConceptChange(concept.id, 'quantity', e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-black font-semibold text-center focus:outline-hidden focus:border-black"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">Unidad</label>
                      <input
                        type="text"
                        value={concept.unit}
                        onChange={e => handleConceptChange(concept.id, 'unit', e.target.value)}
                        placeholder="Lote, Tramo, Mtl..."
                        className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-800">Importe Total *</label>
                        {calculatedSaleSubtotal > 0 && (
                          <span className="text-[10px] text-emerald-700 font-mono font-bold" title="Precio Sugerido">
                            Sug: ${calculatedSaleSubtotal.toFixed(0)}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={concept.total > 0 ? concept.total : (calculatedSaleSubtotal > 0 ? calculatedSaleSubtotal : '')}
                          onChange={e => handleConceptChange(concept.id, 'total', e.target.value)}
                          placeholder={calculatedSaleSubtotal.toFixed(2)}
                          className="w-full pl-7 pr-3 py-2.5 bg-white border-2 border-emerald-500 focus:border-black rounded-lg text-black font-mono font-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totales y Botón Generar Cotización (Diseño Responsivo Optimizado) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 p-5 sm:p-6 bg-stone-900 text-white rounded-2xl shadow-xl">
              <div className="space-y-1.5 text-center lg:text-left flex-1">
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-stone-300 flex-wrap justify-center lg:justify-start font-mono">
                  <span>Materia Prima: <strong className="text-white">${rawMaterialsCost.toFixed(2)}</strong></span>
                  <span className="text-stone-600 hidden sm:inline">•</span>
                  <span className="text-emerald-400 font-bold">Ganancia (+{profitMarginPercent}%): <strong>+${profitAmount.toFixed(2)}</strong></span>
                  <span className="text-stone-600 hidden sm:inline">•</span>
                  <span>Subtotal: <strong className="text-white">${clientSubtotal.toFixed(2)}</strong></span>
                  <span className="text-stone-600 hidden sm:inline">•</span>
                  <span>IVA 16%: <strong className="text-white">${iva.toFixed(2)}</strong></span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                  Total Cotización Cliente: ${total.toFixed(2)} <span className="text-xs font-normal text-stone-400">MXN</span>
                </div>
                <div className="text-[11px] sm:text-xs text-stone-400">
                  Anticipo 50%: <strong className="text-white">${advance50.toFixed(2)} MXN</strong> • Saldo a la entrega: <strong className="text-white">${balance50.toFixed(2)} MXN</strong>
                </div>
              </div>

              <div className="w-full lg:w-auto shrink-0 flex items-center justify-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[54px] px-8 sm:px-10 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black rounded-xl font-black text-sm sm:text-base uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <FileCheck2 className="w-5 h-5 text-black shrink-0" />
                  <span>Generar cotización</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Ventana Flotante de Productos por Categoría (Modal) */}
      <CategoryProductsModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};
