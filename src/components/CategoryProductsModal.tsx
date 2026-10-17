import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Sparkles,
  Layers,
  Square,
  Columns,
  Grid,
  ShieldAlert,
  Wrench,
  ShieldCheck,
  DoorClosed,
  Info,
  Tag
} from 'lucide-react';
import { OfficialCategory, OfficialProduct } from '../data/officialPriceList';

interface CategoryProductsModalProps {
  category: OfficialCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: OfficialProduct, quantity: number) => void;
}

export const CategoryProductsModal: React.FC<CategoryProductsModalProps> = ({
  category,
  isOpen,
  onClose,
  onAddProduct
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  if (!isOpen || !category) return null;

  const getCategoryIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-black' };
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

  const handleQtyChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: OfficialProduct) => {
    const qty = quantities[product.id] || 1;
    onAddProduct(product, qty);
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Cabecera de la Ventana Flotante */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-xs shrink-0">
              {getCategoryIcon(category.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase tracking-wider px-2 py-0.5 bg-black text-white rounded">
                  Categoría {category.number}
                </span>
                <span className="text-[11px] font-semibold text-stone-600 px-2 py-0.5 bg-stone-200/70 rounded">
                  {category.badge}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  {category.priceRange}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-black mt-1">
                {category.name}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-black hover:bg-stone-200/80 transition cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Lista de Productos con Descripciones, Características y Precios */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
            <span>Mostrando <strong>{category.products.length} productos</strong> oficiales</span>
            <span className="text-[11px] font-medium text-stone-400">Precios: Más IVA | LAB Almacén</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {category.products.map(prod => {
              const qty = quantities[prod.id] || 1;
              const isAdded = addedItems[prod.id];

              return (
                <div
                  key={prod.id}
                  className="p-4 rounded-xl border border-stone-200 hover:border-black bg-white hover:bg-stone-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  {/* Detalles del Producto */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-black">
                        {prod.name}
                      </h4>
                      {prod.gauge && (
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-stone-100 border border-stone-200 text-black rounded font-mono">
                          {prod.gauge}
                        </span>
                      )}
                      {prod.material && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-800 text-white rounded">
                          {prod.material}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                      <span>{prod.spec}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-500">{prod.unit}</span>
                    </div>

                    {prod.notes && (
                      <p className="text-[11px] text-stone-500 italic flex items-center gap-1 mt-0.5">
                        <Info className="w-3 h-3 text-[#898A82] shrink-0" />
                        <span>{prod.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Precios y Acción de Cotización */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div>
                      {prod.priceDistributor ? (
                        <div className="sm:text-right space-y-0.5">
                          <div className="text-[11px] text-stone-500">
                            Distr: <span className="font-mono font-bold text-stone-700">${prod.priceDistributor.toFixed(2)}</span>
                          </div>
                          <div className="font-mono text-base sm:text-lg font-black text-black">
                            ${prod.pricePublic?.toFixed(2)} <span className="text-[10px] font-normal text-stone-500">Público</span>
                          </div>
                        </div>
                      ) : (
                        <div className="sm:text-right">
                          <span className="text-[10px] font-bold uppercase text-stone-400 block">Precio Lista</span>
                          <span className="font-mono text-lg sm:text-xl font-black text-black">
                            ${prod.price.toFixed(2)} <span className="text-xs font-normal text-stone-500">MXN</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selector de Cantidad y Botón Agregar */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, -1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-mono font-bold min-w-8 text-center text-black">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(prod.id, 1)}
                          className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(prod)}
                        className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black hover:bg-stone-800 text-white'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Agregado!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Agregar ({qty})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie de la Ventana Flotante */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2 text-stone-500">
            <Tag className="w-4 h-4 text-[#898A82]" />
            <span>Selecciona las cantidades deseadas para armar tu cotización oficial en el panel lateral.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            Listo / Volver al Cotizador
          </button>
        </div>
      </div>
    </div>
  );
};
