import React, { useState, useMemo, useRef } from 'react';
import {
  Boxes,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit3,
  Eye,
  Search,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  RefreshCw,
  CheckSquare,
  Square,
  AlertTriangle,
  Tag,
  DollarSign,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useMallaesa } from '../context/MallaesaContext';
import { ProductItem, ProductCatalogType } from '../types';
import { CATALOG_TYPE_LABELS } from '../data/initialProducts';

type ActiveTab =
  | 'todos'
  | 'importacion'
  | 'tuberias_laminas'
  | 'malla_ciclonica'
  | 'reja_inde'
  | 'concertina_alambres'
  | 'accesorios_herrajes'
  | 'mallas_especiales'
  | 'otros';

export const ProductsCatalogView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    importProducts,
    resetProductsToDefault
  } = useMallaesa();

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Selection for batch actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [detailProduct, setDetailProduct] = useState<ProductItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Notifications / Feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter products by tab
  const tabFilteredProducts = useMemo(() => {
    if (activeTab === 'todos') return products;
    return products.filter(p => p.catalog_type === activeTab);
  }, [products, activeTab]);

  // Available subcategories for the active tab
  const availableSubcategories = useMemo(() => {
    const subs = new Set<string>();
    tabFilteredProducts.forEach(p => {
      if (p.subcategory && p.subcategory.trim()) {
        subs.add(p.subcategory.trim());
      }
    });
    return Array.from(subs).sort();
  }, [tabFilteredProducts]);

  // Search and subcategory filter
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return tabFilteredProducts.filter(p => {
      // Subcategory filter
      if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) {
        return false;
      }
      // Search term
      if (!term) return true;
      return (
        p.sku?.toLowerCase().includes(term) ||
        p.product_name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.subcategory?.toLowerCase().includes(term) ||
        p.specifications?.toLowerCase().includes(term) ||
        p.gauge?.toLowerCase().includes(term) ||
        p.dimensions?.toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term)
      );
    });
  }, [tabFilteredProducts, searchTerm, selectedSubcategory]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safeCurrentPage, pageSize]);

  // Tab counters
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: products.length,
      importacion: 0,
      tuberias_laminas: 0,
      malla_ciclonica: 0,
      reja_inde: 0,
      concertina_alambres: 0,
      accesorios_herrajes: 0,
      mallas_especiales: 0,
      otros: 0
    };
    products.forEach(p => {
      if (counts[p.catalog_type] !== undefined) {
        counts[p.catalog_type]++;
      }
    });
    return counts;
  }, [products]);

  // Batch selection handlers
  const handleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    const allSelected = paginatedProducts.every(p => next.has(p.id));
    if (allSelected) {
      paginatedProducts.forEach(p => next.delete(p.id));
    } else {
      paginatedProducts.forEach(p => next.add(p.id));
    }
    setSelectedIds(next);
  };

  const handleSelectAllFiltered = () => {
    const next = new Set<string>();
    filteredProducts.forEach(p => next.add(p.id));
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Single delete
  const handleConfirmSingleDelete = async () => {
    if (!deleteConfirmTarget) return;
    await deleteProduct(deleteConfirmTarget.id);
    if (selectedIds.has(deleteConfirmTarget.id)) {
      const next = new Set(selectedIds);
      next.delete(deleteConfirmTarget.id);
      setSelectedIds(next);
    }
    showToast(`Producto "${deleteConfirmTarget.name}" eliminado correctamente.`, 'info');
    setDeleteConfirmTarget(null);
  };

  // Batch delete
  const handleConfirmBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await deleteMultipleProducts(ids);
    setSelectedIds(new Set());
    setIsBatchDeleteConfirmOpen(false);
    showToast(`${ids.length} productos eliminados del catálogo.`, 'info');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const itemsToExport = filteredProducts;
    if (itemsToExport.length === 0) {
      showToast('No hay productos para exportar con los filtros actuales.', 'error');
      return;
    }

    const headers = [
      'ID_SKU',
      'Categoria',
      'Subcategoria',
      'Producto',
      'Especificaciones',
      'Calibre',
      'Medida_Dimension',
      'Unidad_Venta',
      'Precio_Base_Sin_IVA',
      'Precio_Base_Con_IVA',
      'Precio_Publico_Sin_IVA',
      'Precio_Publico_Con_IVA',
      'Notas'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = itemsToExport.map(p => [
      escapeCSV(p.sku),
      escapeCSV(p.category),
      escapeCSV(p.subcategory),
      escapeCSV(p.product_name),
      escapeCSV(p.specifications),
      escapeCSV(p.gauge || ''),
      escapeCSV(p.dimensions || ''),
      escapeCSV(p.unit || 'Pza'),
      `"$${p.price_base_sin_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      `"$${p.price_base_con_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      `"$${p.price_public_sin_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      `"$${p.price_public_con_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      escapeCSV(p.notes || '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const tabName = activeTab === 'todos' ? 'Catalogo_Completo' : activeTab;
    link.download = `MALLAESA_Precios_${tabName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Se exportaron ${itemsToExport.length} productos a CSV con formato compatible Excel.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-medium border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700'
              : toastMessage.type === 'error'
              ? 'bg-red-900/95 text-red-100 border-red-700'
              : 'bg-stone-900/95 text-stone-100 border-stone-700'
          }`}
        >
          {toastMessage.type === 'success' && <Check className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400" />}
          {toastMessage.type === 'info' && <Tag className="w-5 h-5 text-amber-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  Productos & Lista de Precios
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {products.length} registrados
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  Catálogo maestro de costos base, precios de lista al público, calibres y especificaciones técnicas.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Importar CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95"
              title="Descarga la lista visible con encabezados compatibles con Excel"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl text-xs font-medium transition"
              title="Restaurar catálogo inicial oficial (1,534 items en 7 submódulos)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Oficial (1,534)</span>
            </button>
          </div>
        </div>

        {/* 7 Submódulos Oficiales - Panel de Acceso Directo Visible */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              7 Submódulos de Precios Oficiales (100% Visibles)
            </span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              7 de 7 Categorías Activas • {products.length} productos
            </span>
          </div>

          {/* Selector de Pestañas con Envoltura Flexible (Sin barras ocultas ni corte de pantalla) */}
          <div className="flex flex-wrap gap-2 pb-2">
            {[
              { id: 'todos', num: '★', label: 'Todos los Productos', count: tabCounts.todos },
              { id: 'importacion', num: '1', label: 'Catálogo de Importación', count: tabCounts.importacion },
              { id: 'tuberias_laminas', num: '2', label: 'Tuberías y Láminas', count: tabCounts.tuberias_laminas },
              { id: 'malla_ciclonica', num: '3', label: 'Malla Ciclónica', count: tabCounts.malla_ciclonica },
              { id: 'reja_inde', num: '4', label: 'Reja INDE y Puertas', count: tabCounts.reja_inde },
              { id: 'concertina_alambres', num: '5', label: 'Concertina y Alambres', count: tabCounts.concertina_alambres },
              { id: 'accesorios_herrajes', num: '6', label: 'Accesorios y Herrajes', count: tabCounts.accesorios_herrajes },
              { id: 'mallas_especiales', num: '7', label: 'Mallas Especiales', count: tabCounts.mallas_especiales }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as ActiveTab);
                    setSelectedSubcategory('all');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs border ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-700 shadow-amber-600/20 shadow-md font-extrabold'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.num}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-amber-900/40 text-amber-100' : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por SKU, producto, calibre, medida, especificación..."
              className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subcategory Dropdown Filter */}
          {availableSubcategories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={selectedSubcategory}
                onChange={e => {
                  setSelectedSubcategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="all">Todas las Subcategorías ({availableSubcategories.length})</option>
                {availableSubcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Page size */}
          <div className="flex items-center gap-2 justify-end text-xs text-stone-500">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1.5 px-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700 font-semibold focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>
          </div>
        </div>

        {/* Batch Selection Action Bar */}
        {selectedIds.size > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs font-bold">
                {selectedIds.size}
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-950">
                {selectedIds.size} producto{selectedIds.size > 1 ? 's' : ''} seleccionado{selectedIds.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleSelectAllFiltered}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline ml-2"
              >
                Seleccionar todos los {filteredProducts.length} filtrados
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBatchDeleteConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar seleccionados ({selectedIds.size})</span>
              </button>
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold transition"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-10 text-center">
                  <button
                    onClick={handleSelectAllOnPage}
                    className="text-stone-500 hover:text-amber-600 transition"
                    title="Seleccionar o deseleccionar productos visibles en esta página"
                  >
                    {paginatedProducts.length > 0 &&
                    paginatedProducts.every(p => selectedIds.has(p.id)) ? (
                      <CheckSquare className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3.5 w-32">SKU / Clave</th>
                <th className="py-3 px-3.5 min-w-[220px]">Producto & Categoría</th>
                <th className="py-3 px-3.5 w-28">Calibre</th>
                <th className="py-3 px-3.5 min-w-[140px]">Medida / Dimensión</th>
                <th className="py-3 px-3.5 w-20 text-center">Unidad</th>
                <th className="py-3 px-3.5 w-28 text-right">P. Base (+IVA)</th>
                <th className="py-3 px-3.5 w-32 text-right">P. Público (+IVA)</th>
                <th className="py-3 px-3.5 w-28 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <Boxes className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                    <p className="font-semibold text-sm">No se encontraron productos</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Intenta con otros términos de búsqueda o selecciona otra pestaña.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-amber-50/40 transition-colors ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => toggleSelectOne(p.id)}
                          className="text-stone-400 hover:text-amber-600 transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-3.5 font-mono font-bold text-stone-900">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-[11px] border border-stone-200">
                          {p.sku}
                        </span>
                      </td>

                      {/* Product Name & Subcategory */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-stone-900 leading-snug">{p.product_name}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {p.subcategory && (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {p.subcategory}
                            </span>
                          )}
                          {p.specifications && (
                            <span
                              className="text-[10px] text-stone-500 truncate max-w-[260px]"
                              title={p.specifications}
                            >
                              {p.specifications}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Gauge */}
                      <td className="py-3 px-3.5 text-stone-700 font-medium">
                        {p.gauge || <span className="text-stone-300">-</span>}
                      </td>

                      {/* Dimensions */}
                      <td className="py-3 px-3.5 text-stone-700">
                        {p.dimensions || <span className="text-stone-300">-</span>}
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3.5 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-bold text-stone-600">
                          {p.unit || 'Pza'}
                        </span>
                      </td>

                      {/* Base Price (+IVA) */}
                      <td className="py-3 px-3.5 text-right font-mono">
                        <div className="font-bold text-stone-900">
                          ${p.price_base_con_iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          s/IVA: ${p.price_base_sin_iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Public Price (+IVA) */}
                      <td className="py-3 px-3.5 text-right font-mono">
                        <div className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          ${p.price_public_con_iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          s/IVA: ${p.price_public_sin_iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailProduct(p)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                            title="Ver detalle completo"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Editar producto y precios"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTarget({ id: p.id, name: p.product_name || p.sku })}
                            className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 font-medium">
          <div>
            Mostrando <span className="font-bold text-stone-900">{totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</span> a{' '}
            <span className="font-bold text-stone-900">{Math.min(safeCurrentPage * pageSize, totalItems)}</span> de{' '}
            <span className="font-bold text-stone-900">{totalItems}</span> productos
            {searchTerm && ' (filtrados)'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-stone-700">
              Página {safeCurrentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-800 text-xs font-mono font-bold border border-stone-200">
                    {detailProduct.sku}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {CATALOG_TYPE_LABELS[detailProduct.catalog_type] || detailProduct.catalog_type}
                  </span>
                </div>
                <h3 className="text-lg font-black text-stone-900 mt-1">{detailProduct.product_name}</h3>
                <p className="text-xs text-stone-500">{detailProduct.category} &gt; {detailProduct.subcategory}</p>
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* Technical specs */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-700 text-xs uppercase tracking-wide">Especificaciones Técnicas</div>
                <p className="text-stone-800">{detailProduct.specifications || 'Sin especificaciones adicionales registradas.'}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200 text-stone-600">
                  <div>
                    <span className="font-semibold block text-stone-500">Calibre:</span>
                    <span className="font-bold text-stone-800">{detailProduct.gauge || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-stone-500">Medida / Dimensión:</span>
                    <span className="font-bold text-stone-800">{detailProduct.dimensions || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-stone-500">Unidad de Venta:</span>
                    <span className="font-bold text-stone-800">{detailProduct.unit || 'Pza'}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block">Precio Base (Costo)</span>
                  <div className="mt-2 space-y-1 font-mono">
                    <div className="text-stone-600 flex justify-between">
                      <span>Sin IVA:</span>
                      <span className="font-semibold">${detailProduct.price_base_sin_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-stone-900 font-bold text-sm flex justify-between pt-1 border-t border-stone-200">
                      <span>Con IVA (16%):</span>
                      <span className="text-amber-800">${detailProduct.price_base_con_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">Precio Lista al Público</span>
                  <div className="mt-2 space-y-1 font-mono">
                    <div className="text-emerald-900/70 flex justify-between">
                      <span>Sin IVA:</span>
                      <span className="font-semibold">${detailProduct.price_public_sin_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-emerald-950 font-black text-base flex justify-between pt-1 border-t border-emerald-300">
                      <span>Con IVA (16%):</span>
                      <span className="text-emerald-700">${detailProduct.price_public_con_iva?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {detailProduct.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Notas Comerciales:</span>
                  <p className="text-amber-950">{detailProduct.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-stone-200">
              <button
                onClick={() => {
                  setEditingProduct(detailProduct);
                  setDetailProduct(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Editar este Producto
              </button>
              <button
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(isCreating || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          isCreating={isCreating}
          onClose={() => {
            setIsCreating(false);
            setEditingProduct(null);
          }}
          onSave={async updatedOrNew => {
            if (isCreating) {
              await addProduct(updatedOrNew);
              showToast(`Producto ${updatedOrNew.sku} creado exitosamente.`);
            } else if (editingProduct) {
              await updateProduct(updatedOrNew as ProductItem);
              showToast(`Producto ${updatedOrNew.sku} actualizado.`);
            }
            setIsCreating(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* IMPORT CSV MODAL */}
      {isImportModalOpen && (
        <ImportCSVModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={async (importedItems, resolution) => {
            const res = await importProducts(importedItems, resolution);
            setIsImportModalOpen(false);
            showToast(
              `Importación completada: ${res.added} nuevos, ${res.updated} actualizados, ${res.skipped} omitidos.`
            );
          }}
        />
      )}

      {/* SINGLE DELETE CONFIRM MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">¿Eliminar producto del catálogo?</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente{' '}
              <strong className="text-stone-900">"{deleteConfirmTarget.name}"</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRM MODAL */}
      {isBatchDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">¿Eliminar {selectedIds.size} productos?</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Has seleccionado <strong className="text-stone-900">{selectedIds.size} productos</strong> para ser eliminados por lote.
              Se eliminarán tanto de tu vista local como de la base de datos en Supabase.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setIsBatchDeleteConfirmOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Eliminar {selectedIds.size} seleccionados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESTORE INITIAL CATALOG MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-stone-900">Restaurar Catálogo Oficial</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Esto restablecerá los 1,534 productos oficiales de los 7 catálogos de Excel de Mallaesa (Importación, Tuberías y Láminas, Malla Ciclónica, Reja INDE, Concertina y Alambres, Accesorios y Herrajes, y Mallas Especiales).
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetProductsToDefault();
                  setIsResetConfirmOpen(false);
                  showToast('Catálogo oficial restablecido exitosamente.');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                Restaurar Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// FORM MODAL: Create / Edit Product
// =====================================================================
interface ProductFormModalProps {
  product: ProductItem | null;
  isCreating: boolean;
  onClose: () => void;
  onSave: (product: Omit<ProductItem, 'id'> & { id?: string }) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isCreating,
  onClose,
  onSave
}) => {
  const [sku, setSku] = useState(product?.sku || '');
  const [catalogType, setCatalogType] = useState<ProductCatalogType>(
    product?.catalog_type || 'importacion'
  );
  const [category, setCategory] = useState(product?.category || '');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [productName, setProductName] = useState(product?.product_name || '');
  const [specifications, setSpecifications] = useState(product?.specifications || '');
  const [gauge, setGauge] = useState(product?.gauge || '');
  const [dimensions, setDimensions] = useState(product?.dimensions || '');
  const [unit, setUnit] = useState(product?.unit || 'Pza');

  // Precios
  const [priceBaseSinIva, setPriceBaseSinIva] = useState<number>(product?.price_base_sin_iva || 0);
  const [priceBaseConIva, setPriceBaseConIva] = useState<number>(product?.price_base_con_iva || 0);
  const [pricePublicSinIva, setPricePublicSinIva] = useState<number>(
    product?.price_public_sin_iva || 0
  );
  const [pricePublicConIva, setPricePublicConIva] = useState<number>(
    product?.price_public_con_iva || 0
  );
  const [notes, setNotes] = useState(product?.notes || '');
  const [saving, setSaving] = useState(false);

  // Auto calculate IVA when Sin IVA changes
  const handleBaseSinIvaChange = (val: number) => {
    setPriceBaseSinIva(val);
    setPriceBaseConIva(Number((val * 1.16).toFixed(2)));
  };

  const handlePublicSinIvaChange = (val: number) => {
    setPricePublicSinIva(val);
    setPricePublicConIva(Number((val * 1.16).toFixed(2)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !productName.trim()) {
      alert('El SKU y el Nombre del producto son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: product?.id || sku.trim(),
        sku: sku.trim(),
        catalog_type: catalogType,
        category: category.trim(),
        subcategory: subcategory.trim(),
        product_name: productName.trim(),
        specifications: specifications.trim(),
        gauge: gauge.trim(),
        dimensions: dimensions.trim(),
        unit: unit.trim() || 'Pza',
        price_base_sin_iva: Number(priceBaseSinIva) || 0,
        price_base_con_iva: Number(priceBaseConIva) || 0,
        price_public_sin_iva: Number(pricePublicSinIva) || 0,
        price_public_con_iva: Number(pricePublicConIva) || 0,
        notes: notes.trim()
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900">
                {isCreating ? 'Registrar Nuevo Producto' : 'Editar Producto & Precios'}
              </h3>
              <p className="text-xs text-stone-500">
                {isCreating ? 'Agrega un nuevo artículo a la lista de precios oficial' : `SKU: ${product?.sku}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Row 1: SKU & Catálogo Origen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                ID / SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Ej. R72C32-32, 020-64-1.00..."
                className="w-full p-2.5 font-mono font-bold bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Submódulo / Catálogo</label>
              <select
                value={catalogType}
                onChange={e => setCatalogType(e.target.value as ProductCatalogType)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="importacion">Catálogo de Importación</option>
                <option value="tuberias_laminas">Tuberías y Láminas</option>
                <option value="malla_ciclonica">Malla Ciclónica</option>
                <option value="reja_inde">Reja INDE y Puertas</option>
                <option value="concertina_alambres">Concertina y Alambres</option>
                <option value="accesorios_herrajes">Accesorios y Herrajes</option>
                <option value="mallas_especiales">Mallas Especiales</option>
                <option value="otros">Otros Accesorios</option>
              </select>
            </div>
          </div>

          {/* Row 2: Categoría & Subcategoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Categoría</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ej. Malla Ciclónica, Puertas y Portones..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Subcategoría</label>
              <input
                type="text"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                placeholder="Ej. Malla Ciclón Galvanizada Ab. 64 mm..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          {/* Row 3: Product Name */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Nombre Comercial del Producto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Ej. Malla Ciclón Galvanizada Ab. 64 mm Alt. 1.00 m"
              className="w-full p-2.5 font-semibold bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          {/* Row 4: Specifications */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Especificaciones Técnicas</label>
            <textarea
              rows={2}
              value={specifications}
              onChange={e => setSpecifications(e.target.value)}
              placeholder="Ej. Abertura 64 mm, Rollo 20 ML (Galvanizada), incluye accesorios de fijación..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          {/* Row 5: Calibre, Medida, Unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Calibre</label>
              <input
                type="text"
                value={gauge}
                onChange={e => setGauge(e.target.value)}
                placeholder="Ej. Cal. 10.5, Cal. 16..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Medida / Dimensión</label>
              <input
                type="text"
                value={dimensions}
                onChange={e => setDimensions(e.target.value)}
                placeholder="Ej. Alt. 1.00 m, 6.00 m..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Unidad de Venta</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="Pza, Rollo, ML, Tramo..."
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              />
            </div>
          </div>

          {/* Row 6: Pricing Grid */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <span className="font-black text-stone-900 block text-xs uppercase tracking-wide">
              Estructura de Precios (Base y Público)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Costo Base */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2">
                <span className="font-bold text-stone-700 block">1. Precio Base (Costo)</span>
                <div>
                  <label className="text-[11px] text-stone-500 font-medium">Sin IVA:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceBaseSinIva || ''}
                    onChange={e => handleBaseSinIvaChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 font-medium">Con IVA (16%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceBaseConIva || ''}
                    onChange={e => setPriceBaseConIva(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold text-amber-800"
                  />
                </div>
              </div>

              {/* Precio Público */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block">2. Precio Público (Venta)</span>
                <div>
                  <label className="text-[11px] text-emerald-800 font-medium">Sin IVA:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricePublicSinIva || ''}
                    onChange={e => handlePublicSinIvaChange(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-emerald-800 font-medium">Con IVA (16%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pricePublicConIva || ''}
                    onChange={e => setPricePublicConIva(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-emerald-400 rounded-lg font-mono font-black text-emerald-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Notas Comerciales o de Venta</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. Tiempo de entrega 3 días hábiles, pedido mínimo..."
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isCreating ? 'Guardar Producto' : 'Actualizar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =====================================================================
// IMPORT CSV MODAL: Upload with duplicate conflict resolution
// =====================================================================
interface ImportCSVModalProps {
  onClose: () => void;
  onImport: (
    items: ProductItem[],
    conflictResolution: 'replace' | 'skip'
  ) => Promise<void>;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ onClose, onImport }) => {
  const [conflictResolution, setConflictResolution] = useState<'replace' | 'skip'>('replace');
  const [targetCatalogType, setTargetCatalogType] = useState<ProductCatalogType>('importacion');
  const [csvRawText, setCsvRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ProductItem[]>([]);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseNumber = (val: string | undefined): number => {
    if (!val) return 0;
    const clean = val.replace(/\$/g, '').replace(/,/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const parseCSVString = (csvText: string, defaultType: ProductCatalogType) => {
    setErrorMsg('');
    try {
      const lines = csvText.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        setErrorMsg('El archivo o texto no contiene filas de datos.');
        return;
      }

      // Simple CSV split taking quotes into account
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let insideQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      const header = parseCSVLine(lines[0]).map(h => h.trim().toUpperCase());
      const idxMap: Record<string, number> = {};
      header.forEach((h, i) => {
        if (h.includes('SKU') || h.includes('CLAVE') || h.includes('CODIGO')) idxMap.sku = i;
        if (h.includes('CATEGORIA') && !h.includes('SUB')) idxMap.category = i;
        if (h.includes('SUBCATEGORIA') || h.includes('SUB_CAT')) idxMap.subcategory = i;
        if (h.includes('PRODUCTO') || h.includes('NOMBRE') || h.includes('DESCRIPCION')) idxMap.product_name = i;
        if (h.includes('ESPECIFICACION')) idxMap.specifications = i;
        if (h.includes('CALIBRE')) idxMap.gauge = i;
        if (h.includes('MEDIDA') || h.includes('DIMENSION')) idxMap.dimensions = i;
        if (h.includes('UNIDAD')) idxMap.unit = i;
        if (h.includes('BASE') && h.includes('SIN')) idxMap.price_base_sin_iva = i;
        if (h.includes('BASE') && h.includes('CON')) idxMap.price_base_con_iva = i;
        if (h.includes('PUBLICO') && h.includes('SIN')) idxMap.price_public_sin_iva = i;
        if (h.includes('PUBLICO') && h.includes('CON')) idxMap.price_public_con_iva = i;
        if (h.includes('NOTAS') || h.includes('OBSERVACIONES')) idxMap.notes = i;
      });

      const items: ProductItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 3) continue;

        const sku = (idxMap.sku !== undefined ? cols[idxMap.sku] : cols[0]) || `SKU-${Date.now()}-${i}`;
        const category = idxMap.category !== undefined ? cols[idxMap.category] : cols[1] || '';
        const subcategory = idxMap.subcategory !== undefined ? cols[idxMap.subcategory] : cols[2] || '';
        const productName = idxMap.product_name !== undefined ? cols[idxMap.product_name] : cols[3] || sku;
        const specifications = idxMap.specifications !== undefined ? cols[idxMap.specifications] : cols[4] || '';
        const gauge = idxMap.gauge !== undefined ? cols[idxMap.gauge] : cols[5] || '';
        const dimensions = idxMap.dimensions !== undefined ? cols[idxMap.dimensions] : cols[6] || '';
        const unit = idxMap.unit !== undefined ? cols[idxMap.unit] : cols[7] || 'Pza';
        const pBaseSin = idxMap.price_base_sin_iva !== undefined ? parseNumber(cols[idxMap.price_base_sin_iva]) : parseNumber(cols[8]);
        const pBaseCon = idxMap.price_base_con_iva !== undefined ? parseNumber(cols[idxMap.price_base_con_iva]) : parseNumber(cols[9]) || pBaseSin * 1.16;
        let pPubSin = idxMap.price_public_sin_iva !== undefined ? parseNumber(cols[idxMap.price_public_sin_iva]) : parseNumber(cols[10]);
        let pPubCon = idxMap.price_public_con_iva !== undefined ? parseNumber(cols[idxMap.price_public_con_iva]) : parseNumber(cols[11]);
        if (pPubSin <= 0 && pBaseSin > 0) {
          pPubSin = Number((pBaseSin * 1.25).toFixed(2));
          pPubCon = Number((pBaseCon * 1.25).toFixed(2));
        } else if (pPubCon <= 0 && pPubSin > 0) {
          pPubCon = Number((pPubSin * 1.16).toFixed(2));
        }
        const notes = idxMap.notes !== undefined ? cols[idxMap.notes] : cols[12] || '';

        items.push({
          id: sku,
          sku,
          catalog_type: defaultType,
          category,
          subcategory,
          product_name: productName,
          specifications,
          gauge,
          dimensions,
          unit,
          price_base_sin_iva: Number(pBaseSin.toFixed(2)),
          price_base_con_iva: Number(pBaseCon.toFixed(2)),
          price_public_sin_iva: Number(pPubSin.toFixed(2)),
          price_public_con_iva: Number(pPubCon.toFixed(2)),
          notes
        });
      }

      setParsedItems(items);
    } catch (err: any) {
      setErrorMsg(`Error al interpretar el CSV: ${err.message || 'Verifique el formato'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    // Auto infer catalog type from file name
    const fname = file.name.toLowerCase();
    let detectedType = targetCatalogType;
    if (fname.includes('concertina') || fname.includes('alambre') || fname.includes('pua')) {
      detectedType = 'concertina_alambres';
    } else if (fname.includes('accesorio') || fname.includes('herraje') || fname.includes('abrazadera')) {
      detectedType = 'accesorios_herrajes';
    } else if (fname.includes('especial') || fname.includes('ondulada') || fname.includes('criba') || fname.includes('desplegado')) {
      detectedType = 'mallas_especiales';
    } else if (fname.includes('tuberia') || fname.includes('lamina')) {
      detectedType = 'tuberias_laminas';
    } else if (fname.includes('ciclonica') || fname.includes('malla')) {
      detectedType = 'malla_ciclonica';
    } else if (fname.includes('reja') || fname.includes('inde')) {
      detectedType = 'reja_inde';
    } else if (fname.includes('importacion')) {
      detectedType = 'importacion';
    }
    setTargetCatalogType(detectedType);

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      setCsvRawText(content);
      parseCSVString(content, detectedType);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = async () => {
    if (parsedItems.length === 0) return;
    setIsProcessing(true);
    try {
      // Assign the user's selected catalog_type
      const finalItems = parsedItems.map(p => ({
        ...p,
        catalog_type: targetCatalogType
      }));
      await onImport(finalItems, conflictResolution);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900">
                Importar Lista de Precios (CSV / Excel)
              </h3>
              <p className="text-xs text-stone-500">
                Sube tu archivo CSV o pega el contenido para actualizar o incorporar productos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* Target Submodule selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Asignar al Submódulo / Catálogo:
              </label>
              <select
                value={targetCatalogType}
                onChange={e => {
                  const nt = e.target.value as ProductCatalogType;
                  setTargetCatalogType(nt);
                  if (csvRawText) parseCSVString(csvRawText, nt);
                }}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="importacion">Catálogo de Importación</option>
                <option value="tuberias_laminas">Tuberías y Láminas</option>
                <option value="malla_ciclonica">Malla Ciclónica</option>
                <option value="reja_inde">Reja INDE y Puertas</option>
                <option value="concertina_alambres">Concertina y Alambres</option>
                <option value="accesorios_herrajes">Accesorios y Herrajes</option>
                <option value="mallas_especiales">Mallas Especiales</option>
                <option value="otros">Otros Accesorios</option>
              </select>
            </div>

            {/* Conflict resolution policy */}
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                Si un producto ya existe (mismo SKU):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    conflictResolution === 'replace'
                      ? 'bg-amber-50/70 border-amber-500 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="conflict"
                    checked={conflictResolution === 'replace'}
                    onChange={() => setConflictResolution('replace')}
                    className="accent-amber-600"
                  />
                  <span>Reemplazar</span>
                </label>
                <label
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    conflictResolution === 'skip'
                      ? 'bg-amber-50/70 border-amber-500 text-amber-950 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="conflict"
                    checked={conflictResolution === 'skip'}
                    onChange={() => setConflictResolution('skip')}
                    className="accent-amber-600"
                  />
                  <span>Omitir</span>
                </label>
              </div>
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl bg-stone-50 hover:bg-amber-50/40 text-center cursor-pointer transition"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 mx-auto text-amber-600 mb-2" />
            <p className="font-bold text-stone-800 text-sm">
              {fileName ? fileName : 'Haz clic para seleccionar tu archivo CSV'}
            </p>
            <p className="text-stone-400 text-xs mt-0.5">
              Formato estándar con columnas: ID_SKU, Categoria, Subcategoria, Producto, Calibre, Precios...
            </p>
          </div>

          {/* Or Paste Raw CSV */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              O pegar contenido CSV directamente:
            </label>
            <textarea
              rows={3}
              value={csvRawText}
              onChange={e => {
                setCsvRawText(e.target.value);
                parseCSVString(e.target.value, targetCatalogType);
              }}
              placeholder="Pega aquí las filas de tu hoja de cálculo..."
              className="w-full p-2.5 font-mono text-[11px] bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview of Parsed Products */}
          {parsedItems.length > 0 && (
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {parsedItems.length} productos detectados listos para importar
                </span>
                <span className="text-amber-800 text-[11px]">
                  Política: {conflictResolution === 'replace' ? 'Reemplazar si ya existe' : 'Omitir existentes'}
                </span>
              </div>

              {/* Table preview */}
              <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-lg bg-white">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                    <tr>
                      <th className="p-1.5 pl-2">SKU</th>
                      <th className="p-1.5">Producto</th>
                      <th className="p-1.5 text-right">P. Base (+IVA)</th>
                      <th className="p-1.5 text-right pr-2">P. Público (+IVA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {parsedItems.slice(0, 5).map((it, i) => (
                      <tr key={i}>
                        <td className="p-1.5 pl-2 font-bold text-stone-900">{it.sku}</td>
                        <td className="p-1.5 font-sans truncate max-w-[200px]">{it.product_name}</td>
                        <td className="p-1.5 text-right">${it.price_base_con_iva.toFixed(2)}</td>
                        <td className="p-1.5 text-right pr-2 font-bold text-emerald-700">
                          ${it.price_public_con_iva.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 5 && (
                <p className="text-[10px] text-stone-400 text-center">
                  ...y {parsedItems.length - 5} productos más
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedItems.length === 0 || isProcessing}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Importar {parsedItems.length > 0 ? `${parsedItems.length} Productos` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
