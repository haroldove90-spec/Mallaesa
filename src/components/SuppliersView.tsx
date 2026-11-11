import React, { useState, useMemo } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { Supplier } from '../types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  FileText,
  Star,
  Layers,
  Truck,
  ShieldCheck,
  X
} from 'lucide-react';

interface SuppliersViewProps {
  onNavigateModule?: (moduleId: string) => void;
}

const CATEGORY_LABELS: Record<Supplier['category'], { label: string; color: string }> = {
  acero_mallas: { label: 'Malla & Acero', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  tuberia_postes: { label: 'Tubería & Postes', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  cemento_agregados: { label: 'Cemento & Agregados', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  ferreteria_accesorios: { label: 'Ferretería & Accesorios', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  fletes_logistica: { label: 'Fletes & Logística', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  seguridad_herramientas: { label: 'Seguridad & Cerco Eléctrico', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  servicios: { label: 'Servicios Generales', color: 'bg-stone-100 text-stone-800 border-stone-200' }
};

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onNavigateModule }) => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, accountsPayable } = useMallaesa();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [copiedClabeId, setCopiedClabeId] = useState<string | null>(null);

  // Form State
  const initialFormState: Omit<Supplier, 'id' | 'createdAt'> = {
    code: `PROV-00${suppliers.length + 1}`,
    businessName: '',
    commercialName: '',
    rfc: '',
    category: 'acero_mallas',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Monterrey',
    state: 'Nuevo León',
    creditDays: 30,
    creditLimit: 100000,
    currentBalance: 0,
    bankName: 'BBVA México',
    bankAccount: '',
    bankClabe: '',
    status: 'activo',
    rating: 5,
    notes: ''
  };

  const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'createdAt'>>(initialFormState);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch =
        s.commercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'todos' || s.category === selectedCategory;
      const matchesStatus = selectedStatus === 'todos' || s.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [suppliers, searchTerm, selectedCategory, selectedStatus]);

  // Financial KPI totals
  const totalCreditLimit = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.creditLimit || 0), 0);
  }, [suppliers]);

  const totalCurrentBalance = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.currentBalance || 0), 0);
  }, [suppliers]);

  const activeCount = useMemo(() => {
    return suppliers.filter(s => s.status === 'activo').length;
  }, [suppliers]);

  // Handle Copy CLABE
  const handleCopyClabe = (clabe: string, id: string) => {
    navigator.clipboard.writeText(clabe);
    setCopiedClabeId(id);
    setTimeout(() => setCopiedClabeId(null), 2500);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      ...initialFormState,
      code: `PROV-00${suppliers.length + 1}`
    });
    setEditingSupplier(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: supplier.code,
      businessName: supplier.businessName,
      commercialName: supplier.commercialName,
      rfc: supplier.rfc,
      category: supplier.category,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      city: supplier.city,
      state: supplier.state,
      creditDays: supplier.creditDays,
      creditLimit: supplier.creditLimit,
      currentBalance: supplier.currentBalance,
      bankName: supplier.bankName || '',
      bankAccount: supplier.bankAccount || '',
      bankClabe: supplier.bankClabe || '',
      status: supplier.status,
      rating: supplier.rating || 5,
      notes: supplier.notes || ''
    });
    setIsCreateModalOpen(true);
  };

  // Save (Create / Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.rfc || !formData.phone) {
      alert('Por favor completa los campos obligatorios: Razón Social, RFC y Teléfono.');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
      alert(`Proveedor ${formData.commercialName || formData.businessName} actualizado con éxito.`);
    } else {
      addSupplier(formData);
      alert(`Proveedor ${formData.commercialName || formData.businessName} registrado con éxito.`);
    }

    setIsCreateModalOpen(false);
    setEditingSupplier(null);
  };

  // Delete Supplier
  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar al proveedor "${name}"? Esta acción no se puede deshacer.`)) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              MALLAESA • Administración & Compras
            </span>
          </div>
          <h1 className="text-2xl font-black text-black mt-1 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-stone-800" />
            <span>Catálogo y Directorio de Proveedores</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Gestión de fabricantes de acero, laminadoras, tuberías galvanizadas, agregados de construcción, líneas de crédito y cuentas bancarias oficiales para transferencias SPEI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onNavigateModule && (
            <button
              onClick={() => onNavigateModule('cuentas_pagar')}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-stone-600" />
              <span>Ver Cuentas por Pagar (CxP)</span>
            </button>
          )}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-stone-500 font-bold uppercase text-[10px] tracking-wider">
            Proveedores Activos
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-black">{activeCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
              {suppliers.length} Total
            </span>
          </div>
          <p className="text-[11px] text-stone-500">Fabricantes y distribuidores vigentes</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-stone-500 font-bold uppercase text-[10px] tracking-wider">
            Línea de Crédito Total
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-black">
              ${totalCreditLimit.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] font-bold text-stone-500">MXN</span>
          </div>
          <p className="text-[11px] text-stone-500">Crédito mercantil autorizado a MALLAESA</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-stone-500 font-bold uppercase text-[10px] tracking-wider">
            Saldo Comprometido en CxP
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-700">
              ${totalCurrentBalance.toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] font-bold text-stone-500">MXN</span>
          </div>
          <p className="text-[11px] text-stone-500">Facturas por pagar o anticipos pendientes</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
          <span className="text-stone-500 font-bold uppercase text-[10px] tracking-wider">
            Crédito Disponible
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-700">
              ${(totalCreditLimit - totalCurrentBalance).toLocaleString('es-MX')}
            </span>
            <span className="text-[10px] font-bold text-stone-500">MXN</span>
          </div>
          <p className="text-[11px] text-stone-500">Margen disponible para nuevas órdenes de compra</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre comercial, razón social, RFC, contacto o ciudad..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-black focus:bg-white focus:outline-hidden focus:border-black"
            />
          </div>

          {/* Filtro por Estatus */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-stone-600">Estatus:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:bg-white focus:outline-hidden"
            >
              <option value="todos">Todos los estatus</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Pestañas de Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-black text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas las Categorías ({suppliers.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([catKey, catInfo]) => {
            const count = suppliers.filter(s => s.category === catKey).length;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {catInfo.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Listado de Proveedores (Grid de Tarjetas) */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-700 text-base">No se encontraron proveedores</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            No existen registros que coincidan con los filtros o término de búsqueda. Intenta ajustar el texto o añade un nuevo proveedor.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 transition"
          >
            + Registrar Proveedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSuppliers.map(supplier => {
            const catBadge = CATEGORY_LABELS[supplier.category] || CATEGORY_LABELS.servicios;
            const creditUsedPercent = supplier.creditLimit > 0
              ? Math.min(100, Math.round((supplier.currentBalance / supplier.creditLimit) * 100))
              : 0;

            return (
              <div
                key={supplier.id}
                className="bg-white border border-stone-200 hover:border-black rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all space-y-4"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-black px-2 py-0.5 bg-stone-100 text-stone-800 rounded">
                          {supplier.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-black mt-1.5 leading-snug">
                        {supplier.commercialName}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {supplier.businessName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          supplier.status === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {supplier.status === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* RFC y Ubicación */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 font-bold block uppercase text-[9px]">RFC:</span>
                      <span className="font-mono font-bold text-stone-800">{supplier.rfc}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold block uppercase text-[9px]">Ubicación:</span>
                      <span className="font-semibold text-stone-700 truncate block">
                        {supplier.city}, {supplier.state}
                      </span>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="bg-stone-50 rounded-xl p-3 text-xs space-y-1.5 border border-stone-100">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold text-black">{supplier.contactName}</span>
                      <span className="text-[10px] text-stone-400">Atención</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a
                        href={`tel:${supplier.phone.replace(/[^0-9]/g, '')}`}
                        className="hover:text-black font-semibold"
                      >
                        {supplier.phone}
                      </a>
                    </div>
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-stone-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a
                          href={`mailto:${supplier.email}`}
                          className="hover:text-black truncate"
                          title={supplier.email}
                        >
                          {supplier.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Condiciones Financieras / Crédito */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-stone-500 font-bold text-[11px]">
                        Crédito: <strong className="text-black">{supplier.creditDays === 0 ? 'Contado' : `${supplier.creditDays} días`}</strong>
                      </span>
                      <span className="font-mono font-bold text-xs text-black">
                        Límite: ${supplier.creditLimit.toLocaleString('es-MX')}
                      </span>
                    </div>

                    {/* Barra de Crédito Utilizado */}
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-300 ${
                          creditUsedPercent > 80
                            ? 'bg-rose-500'
                            : creditUsedPercent > 40
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${creditUsedPercent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>Saldo Ocupado: <strong className="text-stone-800 font-mono">${supplier.currentBalance.toLocaleString('es-MX')}</strong></span>
                      <span>{creditUsedPercent}% de línea</span>
                    </div>
                  </div>

                  {/* Datos Bancarios Rápidos para SPEI */}
                  {supplier.bankClabe && (
                    <div className="flex items-center justify-between p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs">
                      <div className="truncate pr-2">
                        <span className="text-[10px] font-bold text-stone-500 block uppercase">
                          SPEI: {supplier.bankName || 'Banco'}
                        </span>
                        <span className="font-mono font-bold text-black text-[11px] truncate block">
                          {supplier.bankClabe}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyClabe(supplier.bankClabe || '', supplier.id)}
                        className="p-1.5 hover:bg-white rounded-md text-stone-600 hover:text-black border border-transparent hover:border-stone-300 transition cursor-pointer shrink-0"
                        title="Copiar CLABE"
                      >
                        {copiedClabeId === supplier.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingSupplier(supplier)}
                    className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg transition cursor-pointer text-center"
                  >
                    Ficha Completa
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(supplier)}
                    className="p-2 hover:bg-stone-100 text-stone-600 hover:text-black rounded-lg transition cursor-pointer"
                    title="Editar información"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id, supplier.commercialName)}
                    className="p-2 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                    title="Eliminar proveedor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          MODAL: CREAR / EDITAR PROVEEDOR
         ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-stone-800" />
                  <span>{editingSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ingresa los datos fiscales, comerciales, de contacto y bancarios para pagos SPEI.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-black rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-5 text-xs">
              {/* Sección 1: Datos de Identificación Fiscal */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider border-b border-stone-100 pb-1">
                  1. Identificación Comercial y Fiscal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Código Interno:</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">Nombre Comercial *:</label>
                    <input
                      type="text"
                      required
                      value={formData.commercialName}
                      onChange={e => setFormData({ ...formData, commercialName: e.target.value })}
                      placeholder="Ej. Deacero México"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-bold text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">Razón Social *:</label>
                    <input
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Ej. Deacero S.A.P.I. de C.V."
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">RFC Fiscal *:</label>
                    <input
                      type="text"
                      required
                      value={formData.rfc}
                      onChange={e => setFormData({ ...formData, rfc: e.target.value.toUpperCase().replace(/\s/g, '') })}
                      placeholder="DEA710515NL2"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Categoría del Proveedor:</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold text-black"
                    >
                      <option value="acero_mallas">Malla Ciclónica & Alambre de Acero</option>
                      <option value="tuberia_postes">Tubería Galvanizada & Postes</option>
                      <option value="cemento_agregados">Cemento, Arena & Agregados</option>
                      <option value="ferreteria_accesorios">Ferretería, Abrazaderas & Tornillería</option>
                      <option value="fletes_logistica">Fletes & Maniobras de Carga</option>
                      <option value="seguridad_herramientas">Cercos Eléctricos & Herramientas</option>
                      <option value="servicios">Servicios Generales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Estatus:</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold text-black"
                    >
                      <option value="activo">Activo (Habilitado para Compras)</option>
                      <option value="inactivo">Inactivo / Suspendido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Contacto y Ubicación */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider border-b border-stone-100 pb-1">
                  2. Contacto y Dirección
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Persona de Contacto *:</label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Ej. Ing. Alejandro Villarreal"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Teléfono Móvil / Oficina *:</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="81-8300-4400"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ventas@proveedor.com"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Dirección / Calle:</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Av. Principal #100"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Municipio / Ciudad:</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Monterrey"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Estado:</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Nuevo León"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Condiciones Financieras y Crédito */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider border-b border-stone-100 pb-1">
                  3. Crédito Comercial y Datos Bancarios (SPEI)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Días de Crédito:</label>
                    <select
                      value={formData.creditDays}
                      onChange={e => setFormData({ ...formData, creditDays: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-bold text-black"
                    >
                      <option value="0">0 días (Contado)</option>
                      <option value="7">7 días</option>
                      <option value="15">15 días</option>
                      <option value="30">30 días</option>
                      <option value="45">45 días</option>
                      <option value="60">60 días</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Límite de Crédito ($ MXN):</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.creditLimit}
                      onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Saldo Actual Adeudado ($ MXN):</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={formData.currentBalance}
                      onChange={e => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Banco Receptor:</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="BBVA / Banorte / Santander..."
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">No. de Cuenta Bancaria:</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={e => setFormData({ ...formData, bankAccount: e.target.value })}
                      placeholder="0192837465"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">CLABE Interbancaria (18 dígitos):</label>
                    <input
                      type="text"
                      maxLength={18}
                      value={formData.bankClabe}
                      onChange={e => setFormData({ ...formData, bankClabe: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="012580001928374658"
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Notas / Observaciones Internas:</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tiempos de entrega habituales, pedidos mínimos, flete incluido, etc."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg text-black"
                  ></textarea>
                </div>
              </div>

              {/* Botones de acción modal */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: FICHA COMPLETA DEL PROVEEDOR
         ======================================================== */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                  {viewingSupplier.code}
                </span>
                <h3 className="text-xl font-black text-black mt-2">
                  {viewingSupplier.commercialName}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {viewingSupplier.businessName}
                </p>
              </div>
              <button
                onClick={() => setViewingSupplier(null)}
                className="p-1.5 text-stone-400 hover:text-black rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bloque Fiscal */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                <span className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">
                  Datos Fiscales & Ubicación
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-stone-400 text-[10px] block">RFC:</span>
                    <span className="font-mono font-bold text-black text-sm">{viewingSupplier.rfc}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Estatus:</span>
                    <span className="font-bold text-emerald-700 capitalize">{viewingSupplier.status}</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block">Dirección:</span>
                  <span className="font-medium text-stone-800">
                    {viewingSupplier.address}, {viewingSupplier.city}, {viewingSupplier.state}
                  </span>
                </div>
              </div>

              {/* Bloque Bancario para SPEI */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[10px] text-emerald-900 tracking-wider">
                    Datos para Transferencia SPEI
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                    Oficial de Pagos
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-emerald-700 text-[10px] block font-semibold">Banco:</span>
                    <span className="font-bold text-emerald-950 text-sm">{viewingSupplier.bankName || 'No especificado'}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 text-[10px] block font-semibold">No. de Cuenta:</span>
                    <span className="font-mono font-bold text-emerald-950">{viewingSupplier.bankAccount || 'N/A'}</span>
                  </div>
                </div>

                {viewingSupplier.bankClabe && (
                  <div className="pt-2 border-t border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-700 text-[10px] block font-semibold">CLABE Interbancaria:</span>
                      <span className="font-mono font-black text-base text-emerald-950">
                        {viewingSupplier.bankClabe}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyClabe(viewingSupplier.bankClabe || '', viewingSupplier.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedClabeId === viewingSupplier.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Bloque Crédito */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
                <span className="font-bold uppercase text-[10px] text-stone-500 tracking-wider">
                  Línea de Crédito & Finanzas
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Días Crédito</span>
                    <span className="font-bold text-black text-sm">{viewingSupplier.creditDays} días</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Límite Total</span>
                    <span className="font-mono font-bold text-black text-sm">
                      ${viewingSupplier.creditLimit.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-stone-200">
                    <span className="text-[10px] text-stone-400 block">Saldo Adeudado</span>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      ${viewingSupplier.currentBalance.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {viewingSupplier.notes && (
                <div className="p-3 bg-stone-100 rounded-xl text-stone-700 text-[11px]">
                  <strong>Observaciones:</strong> {viewingSupplier.notes}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewingSupplier.phone.replace(/[^0-9]/g, '')}`}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>Llamar</span>
                </a>
                {viewingSupplier.email && (
                  <a
                    href={`mailto:${viewingSupplier.email}`}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-stone-600" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  setViewingSupplier(null);
                  handleOpenEditModal(viewingSupplier);
                }}
                className="px-4 py-2 bg-black hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Editar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
