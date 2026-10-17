import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  FileText,
  Printer,
  Sparkles,
  Tag,
  Info,
  Layers,
  Square,
  Columns,
  Grid,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  DoorClosed,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { OFFICIAL_PRICE_LIST, OfficialCategory, OfficialProduct } from '../data/officialPriceList';
import { calculateIntelligentQuote, exportQuoteToPdf } from '../utils/quoteCalculator';

interface OfficialCatalogViewProps {
  onGoToQuote?: () => void;
}

export const OfficialCatalogView: React.FC<OfficialCatalogViewProps> = ({ onGoToQuote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const getCategoryIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 text-black shrink-0' };
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

  const filteredCategories = useMemo(() => {
    return OFFICIAL_PRICE_LIST.map(category => {
      // If a category filter is selected and does not match, return empty products
      if (selectedCatId !== 'all' && category.id !== selectedCatId) {
        return { ...category, products: [] };
      }

      // If there is a search term, filter products
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matched = category.products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.spec.toLowerCase().includes(term) ||
          (p.gauge && p.gauge.toLowerCase().includes(term)) ||
          (p.notes && p.notes.toLowerCase().includes(term))
        );
        return { ...category, products: matched };
      }

      return category;
    }).filter(c => c.products.length > 0);
  }, [selectedCatId, searchTerm]);

  const totalProductsCount = useMemo(() => {
    return filteredCategories.reduce((acc, c) => acc + c.products.length, 0);
  }, [filteredCategories]);

  const handleDownloadFullCatalogPdf = () => {
    const sampleQuote = calculateIntelligentQuote({
      clientName: 'Lista de Precios Oficial MALLA INDE / MALLAESA',
      clientPhone: '(81) 3406-0349',
      clientEmail: 'ventas@mallaesamty.com',
      projectAddress: '8 Categorías Oficiales de Acero y Perfiles',
      city: 'Monterrey, N.L.',
      serviceType: 'malla_ciclonica',
      linearMeters: 100,
      heightMeters: 2.0,
      terrainType: 'tierra',
      addConcertinaTop: true,
      addGate: true
    });
    exportQuoteToPdf(sampleQuote);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Encabezado del Módulo Catálogo */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Lista de Precios Oficial (Lista No. 01/2023)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Módulo: Catálogo Oficial por Categorías
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Consulta las <strong>8 categorías de productos de acero</strong>: Láminas acanaladas, tubos cuadrados y especiales, tubería de cerca cédula 30 y 40, rollos de malla ciclón, alambres y grapas, accesorios de cerca, concertinas y puertas/reja cal. 6.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
            <button
              onClick={handleDownloadFullCatalogPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Descargar Catálogo PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold text-xs border border-stone-300 transition"
              title="Imprimir catálogo"
            >
              <Printer className="w-4 h-4 text-[#898A82]" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="pt-5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Input de Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar producto, medida, calibre o especificación..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-black focus:outline-hidden focus:border-black"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[10px] text-stone-400 hover:text-black absolute right-3 top-1/2 -translate-y-1/2"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Estadísticas de Búsqueda */}
          <div className="flex items-center gap-2 text-xs text-stone-500 self-end md:self-center">
            <span>Mostrando <strong>{totalProductsCount}</strong> productos</span>
            <span className="text-stone-300">•</span>
            <span className="text-emerald-700 font-semibold">Precios: Más IVA | LAB Almacén</span>
          </div>
        </div>

        {/* Filtros por Categoría */}
        <div className="pt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas las Categorías (8)
          </button>
          {OFFICIAL_PRICE_LIST.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCatId === c.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {c.number}. {c.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Categorías y sus Productos */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
            <Search className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-bold text-base text-black">No se encontraron productos</h4>
            <p className="text-xs text-stone-500">
              Intenta con otro término de búsqueda o selecciona "Todas las Categorías".
            </p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <div
              key={category.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Encabezado de la Categoría */}
              <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs">
                    {getCategoryIcon(category.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white rounded">
                        Categoría {category.number}
                      </span>
                      <span className="text-[10px] font-semibold text-stone-600 px-2 py-0.5 bg-stone-200/70 rounded">
                        {category.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-black mt-0.5">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {category.products.length} productos
                  </span>
                  {onGoToQuote && (
                    <button
                      onClick={onGoToQuote}
                      className="flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-black transition"
                    >
                      <span>Ir al Cotizador</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabla de Productos de la Categoría */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Producto / Descripción</th>
                      <th className="py-2.5 px-3">Medida / Ancho</th>
                      <th className="py-2.5 px-3">Calibre / Material</th>
                      <th className="py-2.5 px-3 text-right">Precio Oficial</th>
                      <th className="py-2.5 px-4 text-stone-500">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {category.products.map(prod => (
                      <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-black">
                          {prod.name}
                        </td>
                        <td className="py-3 px-3 text-stone-600 font-medium">
                          {prod.spec}
                        </td>
                        <td className="py-3 px-3">
                          {prod.gauge && (
                            <span className="px-2 py-0.5 bg-stone-100 text-black font-mono font-bold text-[11px] rounded border border-stone-200">
                              {prod.gauge}
                            </span>
                          )}
                          {prod.material && (
                            <span className="px-2 py-0.5 bg-neutral-800 text-white font-semibold text-[10px] rounded ml-1">
                              {prod.material}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {prod.priceDistributor ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-bold text-stone-600 block">
                                Distr: ${prod.priceDistributor.toFixed(2)}
                              </span>
                              <span className="font-mono text-sm font-black text-black block">
                                Púb: ${prod.pricePublic?.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-sm font-black text-black">
                              ${prod.price.toFixed(2)} <span className="text-[10px] font-normal text-stone-500">MXN</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-stone-500 italic">
                          {prod.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
