export type RoleType = 'pagina_web' | 'cotizador' | 'cliente' | 'director' | 'ventas' | 'operaciones' | 'administracion';

export interface AppUser {
  id?: string;
  username: string;
  fullName: string;
  role: RoleType;
}

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
  advancePercent?: number;
  balanceRemaining: number; // 50%
  balancePercent?: number;
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
  advancePercent?: number; // Porcentaje de anticipo personalizado (default: 50)
  advancePaid: boolean;
  advanceDate?: string;
  advanceReceipt?: string;
  balanceAmount: number;
  balancePercent?: number; // Porcentaje de finiquito personalizado (default: 50)
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

export interface Supplier {
  id: string;
  code: string;
  businessName: string;
  commercialName: string;
  rfc: string;
  category: 'acero_mallas' | 'tuberia_postes' | 'cemento_agregados' | 'ferreteria_accesorios' | 'fletes_logistica' | 'seguridad_herramientas' | 'servicios';
  contactName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  creditDays: number;
  creditLimit: number;
  currentBalance: number;
  bankName?: string;
  bankAccount?: string;
  bankClabe?: string;
  status: 'activo' | 'inactivo' | 'bloqueado';
  rating?: number;
  notes?: string;
  createdAt: string;
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

export interface DailyWorkLog {
  id: string;
  folio: string; // e.g. BIT-2026-001
  workOrderId: string;
  workOrderFolio: string;
  clientName: string;
  crewName: string;
  leadInstaller: string;
  date: string; // YYYY-MM-DD
  linearMetersInstalled: number; // Metros instalados en la jornada
  totalLinearMeters: number; // Metros totales del proyecto
  accumulatedMeters: number; // Metros acumulados incluyendo hoy
  progressPercent: number; // % avance total calculado
  weatherConditions: 'Despejado / Óptimo' | 'Lluvia ligera' | 'Calor extremo' | 'Viento fuerte';
  soilConditions: 'Terreno limpio / Suave' | 'Roca / Difícil' | 'Barda / Cimentación previa' | 'Desnivel pronunciado';
  workDoneDescription: string;
  incidentsOrDelays?: string;
  leadSignature: string; // Firma táctil en base64
  inspectorOrClientSignature?: string;
  photos?: string[];
  createdAt: string;
}

export interface VehicleLog {
  id: string;
  folio: string; // e.g. VEH-2026-101
  vehicleName: string; // e.g. Nissan NP300 Estacas Blanca
  plates: string; // e.g. NPK-4421
  driverName: string; // Chofer o responsable asignado
  assignedCrew?: string; // e.g. Cuadrilla Alfa
  destinationProject?: string; // e.g. OT-MAL-2026-901 / Terreno Industrial
  status: 'en_ruta' | 'retornado' | 'mantenimiento';
  // Salida
  departureDate: string;
  departureTime: string;
  departureMileage: number; // Km al salir
  departureFuelLevel: '1/4' | '1/2' | '3/4' | 'Lleno';
  departureConditions: string; // Revisión física/mecánica de salida
  departurePhotoUrl?: string; // Fotografía de la unidad al salir
  departureSignature: string; // Firma del conductor al salir
  // Llegada / Retorno
  returnDate?: string;
  returnTime?: string;
  returnMileage?: number; // Km al regresar
  distanceTraveledKm?: number; // Calculado (llegada - salida)
  returnFuelLevel?: '1/4' | '1/2' | '3/4' | 'Lleno';
  returnConditions?: string; // Estado de la unidad al retornar
  returnPhotoUrl?: string; // Fotografía de la unidad al regresar
  returnSignature?: string; // Firma de entrega en almacén/taller
  notes?: string;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export type EmployeeDepartment =
  | 'instalacion_campo'
  | 'taller_herreria'
  | 'almacen_logistica'
  | 'chofer_transporte'
  | 'administracion_ventas';

export interface Employee {
  id: string;
  code: string; // EMP-001
  fullName: string;
  curp: string; // 18 caracteres
  rfc: string; // 13 caracteres con homoclave
  nss: string; // 11 dígitos IMSS
  phone: string;
  email?: string;
  address: string;
  birthDate?: string;
  bloodType: string; // O+, A+, etc.
  emergencyContact: EmergencyContact;
  jobTitle: string; // Cabo Instalador, Ayudante, Soldador, etc.
  department: EmployeeDepartment;
  assignedCrew?: string; // Cuadrilla Alfa, Beta, etc.
  hireDate: string;
  dailySalary: number; // Salario Diario Base ($ MXN)
  hourlyRate: number;  // Tarifa por Hora Ordinaria (dailySalary / 8)
  weeklyBaseHours: number; // 40 hrs (Ley 40 Horas México)
  status: 'activo' | 'vacaciones' | 'incapacidad' | 'baja';
  photoUrl?: string;
  notes?: string;
}

export type AttendanceStatus =
  | 'presente'
  | 'retardo'
  | 'falta_justificada'
  | 'falta_injustificada'
  | 'incapacidad'
  | 'vacaciones'
  | 'descanso_semanal';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // "08:00"
  checkOut: string; // "17:00"
  lunchMinutes: number; // 60
  hoursWorked: number; // Calculado automático
  overtimeHours: number; // Horas excedentes de 8 hrs diarias
  status: AttendanceStatus;
  locationOrProject?: string; // Ej. "Obra San Pedro / OT-2026-901" o "Almacén Central"
  notes?: string;
  verifiedBy?: string; // Cabo o Supervisor
  createdAt: string;
}

export interface EmployeeWeeklySummary {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: EmployeeDepartment;
  dailySalary: number;
  hourlyRate: number;
  totalHoursWorked: number;
  regularHours: number; // Hasta 40 hrs
  overtimeDoubleHours: number; // Primeras 9 hrs (+100% art. 67 LFT)
  overtimeTripleHours: number; // Excedentes de 9 hrs (+200% art. 68 LFT)
  basePay: number;
  overtimeDoublePay: number;
  overtimeTriplePay: number;
  totalOvertimePay: number;
  viaticsPay: number;
  totalWeeklyGrossPay: number;
  daysWorkedCount: number;
  lftComplianceStatus: 'optimo' | 'moderado_horas_extras' | 'alerta_exceso_lft';
}

export const ROLE_DEFAULT_MODULE: Record<RoleType, string> = {
  pagina_web: 'inicio',
  cotizador: 'cotizador',
  cliente: 'cotizador',
  director: 'kpis',
  ventas: 'solicitudes',
  operaciones: 'ordenes',
  administracion: 'cuentas'
};
