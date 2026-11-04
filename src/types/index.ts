export type RoleType = 'pagina_web' | 'cotizador' | 'cliente' | 'director' | 'ventas' | 'operaciones' | 'administracion';

export interface RoleConfig {
  id: RoleType;
  name: string;
  shortName: string;
  iconName: string;
  badge: string;
  description: string;
}

export type ServiceType =
  | 'malla_ciclonica'
  | 'concertina'
  | 'reja_acero'
  | 'malla_ganadera'
  | 'cerca_electrificada'
  | 'alambre_puas'
  | 'cinta_privacidad';

export type TerrainType = 'plano' | 'inclinado' | 'tierra' | 'concreto' | 'mixto';

export interface QuoteRequest {
  id: string;
  folio: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectAddress: string;
  city: string;
  serviceType: ServiceType;
  linearMeters: number;
  heightMeters: number;
  terrainType: TerrainType;
  photoUrl?: string;
  sketchData?: string;
  notes?: string;
  createdAt: string;
  status: 'nuevo' | 'en_revision' | 'cotizado' | 'aprobado' | 'rechazado';
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface FormalQuote {
  id: string;
  requestId: string;
  folio: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectAddress: string;
  serviceType: ServiceType;
  linearMeters: number;
  heightMeters: number;
  items: QuoteItem[];
  subtotal: number;
  discountPercent: number;
  discountApproved: boolean;
  discountApprovalPending: boolean;
  discountAmount: number;
  iva: number;
  total: number;
  advanceRequired: number; // 50%
  balanceRemaining: number; // 50%
  estimatedDays: number;
  status: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
  createdAt: string;
  sentAt?: string;
  approvedAt?: string;
  clientSignature?: string;
  rawMaterials?: QuoteItem[];
  rawMaterialsCost?: number;
  profitMarginPercent?: number;
  profitAmount?: number;
  clientConcepts?: QuoteItem[];
}

export interface Project {
  id: string;
  folio: string;
  quoteId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectAddress: string;
  city: string;
  serviceType: ServiceType;
  linearMeters: number;
  heightMeters: number;
  phase: 1 | 2 | 3 | 4 | 5;
  phaseName: string;
  status:
    | 'cotizacion_recibida'
    | 'cotizacion_enviada'
    | 'esperando_anticipo'
    | 'anticipo_confirmado'
    | 'orden_programada'
    | 'en_instalacion'
    | 'esperando_saldo'
    | 'finalizado';
  totalAmount: number;
  advanceAmount: number;
  advancePaid: boolean;
  advanceDate?: string;
  advanceReceipt?: string;
  balanceAmount: number;
  balancePaid: boolean;
  balanceDate?: string;
  workOrderId?: string;
  assignedCrew?: string;
  scheduledDate?: string;
  warrantyFolio?: string;
  warrantyYears?: number;
  warrantyIssuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  folio: string;
  projectId: string;
  clientName: string;
  clientPhone: string;
  address: string;
  serviceType: ServiceType;
  linearMeters: number;
  crewId: string;
  crewName: string;
  scheduledDate: string;
  scheduledTime: string;
  materialsReserved: {
    materialId: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  status: 'programada' | 'en_camino' | 'en_instalacion' | 'completada';
  beforePhotos: string[];
  afterPhotos: string[];
  clientSignature?: string;
  clientSignatureDate?: string;
  crewNotes?: string;
  completedAt?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'malla' | 'postes' | 'concertina' | 'accesorios' | 'construccion';
  stock: number;
  minStock: number;
  unit: string;
  unitCost: number;
  location: string;
}

export interface Approval {
  id: string;
  type: 'descuento' | 'viaticos' | 'material_extra';
  requestedBy: string;
  referenceFolio: string;
  clientOrProject: string;
  description: string;
  amount: number;
  reason: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  requestedAt: string;
  resolvedAt?: string;
  directorNotes?: string;
}

export interface Invoice {
  id: string;
  folioFiscalUuid: string;
  seriesNumber: string;
  projectId: string;
  clientName: string;
  rfc: string;
  date: string;
  subtotal: number;
  iva: number;
  total: number;
  type: 'Anticipo 50%' | 'Finiquito 50%' | 'Total 100%';
  paymentMethod: 'PUE' | 'PPD';
  paymentWay: 'Transferencia SPEI (03)' | 'Cheque nominativo (02)' | 'Tarjeta (04)';
  status: 'timbrada' | 'cancelada';
}

export interface CrewMember {
  id: string;
  leadName: string;
  assistantName: string;
  phone: string;
  vehicle: string;
  status: 'disponible' | 'en_obra' | 'mantenimiento';
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
  inventoryItemId?: string;
}

export interface PurchaseOrder {
  id: string;
  folio: string;
  provider: string;
  rfc: string;
  contactName?: string;
  contactPhone?: string;
  date: string;
  deliveryDateEstimated?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  iva: number;
  total: number;
  status: 'borrador' | 'autorizada' | 'en_camino' | 'recibida' | 'cancelada';
  approvedBy?: string;
  notes?: string;
  receivedAt?: string;
}

export interface AccountsPayableItem {
  id: string;
  folio: string;
  provider: string;
  category: 'materia_prima' | 'servicios' | 'fletes' | 'herramientas' | 'novedades';
  invoiceOrRef: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: 'pendiente' | 'parcial' | 'pagado';
  paymentMethod?: string;
  paidAt?: string;
  notes?: string;
}

export interface SimpleReceipt {
  id: string;
  folio: string;
  projectId?: string;
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  concept: string;
  totalProjectAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentType: 'anticipo' | 'abono_parcial' | 'liquidacion_total';
  paymentMethod: 'Efectivo' | 'Transferencia SPEI' | 'Tarjeta de Débito/Crédito' | 'Cheque';
  reference: string;
  date: string;
  issuedBy: string;
  notes?: string;
}

export interface WarehouseMovementItem {
  materialName: string;
  quantity: number;
  unit: string;
  inventoryItemId?: string;
}

export interface WarehouseMovement {
  id: string;
  folio: string;
  type: 'egreso_obra' | 'ingreso_compra' | 'devolucion_sobrante' | 'ajuste_inventario';
  referenceFolio: string; // e.g. OT-MAL-2026-901 or OC-2026-102
  date: string;
  requestedBy: string;
  destinationOrOrigin: string;
  items: WarehouseMovementItem[];
  notes?: string;
  status: 'completado' | 'pendiente';
}

export interface CustomerServiceTicket {
  id: string;
  folio: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  projectFolio?: string;
  type: 'solicitud_presupuesto' | 'seguimiento_obra' | 'garantia_mantenimiento' | 'aclaracion';
  priority: 'alta' | 'media' | 'baja';
  status: 'abierto' | 'en_proceso' | 'resuelto';
  subject: string;
  description: string;
  createdAt: string;
  assignedTo: string;
  resolutionNotes?: string;
  resolvedAt?: string;
}

