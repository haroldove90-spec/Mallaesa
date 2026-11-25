import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RoleType,
  QuoteRequest,
  FormalQuote,
  Project,
  WorkOrder,
  InventoryItem,
  Approval,
  Invoice,
  CrewMember,
  ServiceType,
  TerrainType,
  QuoteItem,
  PurchaseOrder,
  AccountsPayableItem,
  SimpleReceipt,
  WarehouseMovement,
  CustomerServiceTicket,
  DailyWorkLog,
  VehicleLog,
  Supplier,
  ROLE_DEFAULT_MODULE,
  Employee,
  AttendanceRecord,
  EmployeeWeeklySummary,
  AppUser
} from '../types';
import {
  INITIAL_REQUESTS,
  INITIAL_FORMAL_QUOTES,
  INITIAL_PROJECTS,
  INITIAL_WORK_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_APPROVALS,
  INITIAL_INVOICES,
  INITIAL_CREWS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ACCOUNTS_PAYABLE,
  INITIAL_SIMPLE_RECEIPTS,
  INITIAL_WAREHOUSE_MOVEMENTS,
  INITIAL_CUSTOMER_SERVICE_TICKETS,
  INITIAL_DAILY_WORK_LOGS,
  INITIAL_VEHICLE_LOGS,
  INITIAL_SUPPLIERS
} from '../data/initialData';
import { INITIAL_EMPLOYEES, INITIAL_ATTENDANCE } from '../data/initialEmployees';
import { PreloadedQuoteDraft } from '../utils/assistantQuoteParser';
import {
  supabase,
  saveToSupabase,
  deleteFromSupabase,
  clearTableInSupabase,
  fetchFromSupabase,
  getAppSettingsFromSupabase,
  saveAppSettingsToSupabase,
  testSupabaseConnection
} from '../lib/supabase';

interface MallaesaContextType {
  currentUser: AppUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  activeRole: RoleType | null;
  setActiveRole: (role: RoleType | null) => void;
  currentModule: string;
  setCurrentModule: (module: string) => void;
  preloadedQuoteDraft: PreloadedQuoteDraft | null;
  loadQuoteDraftIntoCalculator: (draft: PreloadedQuoteDraft) => void;
  clearPreloadedQuoteDraft: () => void;
  requests: QuoteRequest[];
  formalQuotes: FormalQuote[];
  projects: Project[];
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  approvals: Approval[];
  invoices: Invoice[];
  crews: CrewMember[];
  purchaseOrders: PurchaseOrder[];
  accountsPayable: AccountsPayableItem[];
  simpleReceipts: SimpleReceipt[];
  warehouseMovements: WarehouseMovement[];
  customerServiceTickets: CustomerServiceTicket[];
  dailyWorkLogs: DailyWorkLog[];
  vehicleLogs: VehicleLog[];
  directorTargetMargin: number;
  setDirectorTargetMargin: (margin: number) => void;
  noSampleDataMode: boolean;
  clearAllSampleData: () => void;
  setNoSampleDataMode: (enabled: boolean) => void;
  restoreDemoData: () => void;

  // Actions for Phase 1: Client
  submitClientRequest: (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    projectAddress: string;
    city: string;
    serviceType: ServiceType;
    linearMeters: number;
    heightMeters: number;
    terrainType: TerrainType;
    notes?: string;
    photoUrl?: string;
  }) => string; // returns folio

  saveIntelligentQuote: (data: {
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
    items: QuoteItem[];
    subtotal: number;
    iva: number;
    total: number;
    advance50: number;
    balance50: number;
    advancePercent?: number;
    balancePercent?: number;
    estimatedWorkDays: number;
    rawMaterials?: QuoteItem[];
    rawMaterialsCost?: number;
    profitMarginPercent?: number;
    profitAmount?: number;
    clientConcepts?: QuoteItem[];
  }) => void;
  deleteFormalQuote: (quoteId: string) => void;

  // Actions for Phase 2: Sales
  createFormalQuote: (requestId: string, items: QuoteItem[], discountPercent: number, estimatedDays: number) => FormalQuote;
  requestDiscountApproval: (quoteId: string, percent: number, reason: string) => void;
  sendQuoteToClient: (quoteId: string) => void;

  // Actions for Phase 3: Client & Admin
  clientApproveQuote: (quoteId: string, signature: string) => void;
  registerAdvancePayment: (projectId: string, receiptFolio: string, paymentMethod: string) => void;

  // Actions for Phase 4: Operations
  createWorkOrder: (projectId: string, crewId: string, scheduledDate: string, scheduledTime: string) => WorkOrder;
  updateWorkOrderStatus: (workOrderId: string, status: WorkOrder['status']) => void;
  submitFieldSignatureAndPhotos: (workOrderId: string, clientSignature: string, beforePhotos: string[], afterPhotos: string[], notes: string) => void;

  // Actions for Phase 5: Admin & Warranty
  registerFinalPayment: (projectId: string, paymentWay: Invoice['paymentWay'], rfc: string) => Invoice;

  // Director General approvals
  resolveApproval: (approvalId: string, status: 'aprobado' | 'rechazado', directorNotes?: string) => void;

  // Inventory actions
  adjustInventoryStock: (itemId: string, newStock: number) => void;

  // Órdenes de Compra
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'folio'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => void;
  receivePurchaseOrderIntoWarehouse: (poId: string) => void;

  // Cuentas por Pagar
  createAccountsPayable: (item: Omit<AccountsPayableItem, 'id' | 'folio' | 'balance' | 'status' | 'amountPaid'>) => AccountsPayableItem;
  registerAccountsPayablePayment: (cxpId: string, amount: number, method: string) => void;

  // Recibos No Fiscales
  createSimpleReceipt: (receipt: Omit<SimpleReceipt, 'id' | 'folio'>) => SimpleReceipt;

  // Almacén: Solicitudes de Ingreso y Egreso
  registerWarehouseMovement: (mov: Omit<WarehouseMovement, 'id' | 'folio'>) => WarehouseMovement;

  // Atención a Clientes
  createCustomerServiceTicket: (ticket: Omit<CustomerServiceTicket, 'id' | 'folio' | 'createdAt'>) => CustomerServiceTicket;
  updateCustomerServiceTicketStatus: (ticketId: string, status: CustomerServiceTicket['status'], resolutionNotes?: string) => void;

  // Avance Diario de Cuadrillas
  addDailyWorkLog: (log: Omit<DailyWorkLog, 'id' | 'folio' | 'createdAt'>) => DailyWorkLog;

  // Control Vehicular & Flotilla
  addVehicleLog: (log: Omit<VehicleLog, 'id' | 'folio' | 'createdAt'>) => VehicleLog;
  updateVehicleLogReturn: (id: string, returnData: {
    returnDate: string;
    returnTime: string;
    returnMileage: number;
    returnFuelLevel: '1/4' | '1/2' | '3/4' | 'Lleno';
    returnConditions?: string;
    returnPhotoUrl?: string;
    returnSignature: string;
    notes?: string;
  }) => void;

  // Cuentas por Cobrar: Esquema de Pagos Personalizado (Anticipo / Finiquito %)
  updateProjectPaymentScheme: (projectId: string, advancePercent: number) => void;

  // Catálogo de Proveedores
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Capital Humano, Asistencia y Horas Extras (Ley 40 Horas LFT)
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  weeklyHoursLimit: number;
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => AttendanceRecord;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: string) => void;
  setWeeklyHoursLimit: (hours: number) => void;
  calculateWeeklyLaborSummary: (weekNumber?: number, year?: number) => EmployeeWeeklySummary[];
  isSupabaseConnected: boolean;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  deleteProject: (id: string) => void;
  deleteWorkOrder: (id: string) => void;
}

const MallaesaContext = createContext<MallaesaContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_ROLE: 'mallaesa_active_role',
  NO_SAMPLE: 'mallaesa_no_sample_data',
  REQUESTS: 'mallaesa_requests',
  QUOTES: 'mallaesa_quotes',
  PROJECTS: 'mallaesa_projects',
  WORK_ORDERS: 'mallaesa_work_orders',
  INVENTORY: 'mallaesa_inventory',
  APPROVALS: 'mallaesa_approvals',
  INVOICES: 'mallaesa_invoices',
  PURCHASE_ORDERS: 'mallaesa_purchase_orders',
  ACCOUNTS_PAYABLE: 'mallaesa_accounts_payable',
  SIMPLE_RECEIPTS: 'mallaesa_simple_receipts',
  WAREHOUSE_MOVEMENTS: 'mallaesa_warehouse_movements',
  CUSTOMER_SERVICE_TICKETS: 'mallaesa_cs_tickets',
  DAILY_WORK_LOGS: 'mallaesa_daily_work_logs',
  VEHICLE_LOGS: 'mallaesa_vehicle_logs',
  DIRECTOR_TARGET_MARGIN: 'mallaesa_director_target_margin',
  SUPPLIERS: 'mallaesa_suppliers',
  EMPLOYEES: 'mallaesa_employees',
  ATTENDANCE: 'mallaesa_attendance',
  WEEKLY_HOURS_LIMIT: 'mallaesa_weekly_hours_limit'
};

export const MallaesaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('mallaesa_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeRole, setActiveRoleState] = useState<RoleType | null>(() => {
    const savedUser = localStorage.getItem('mallaesa_current_user');
    if (!savedUser) return null;
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as RoleType) || null;
  });

  const [currentModule, setCurrentModule] = useState<string>('inicio');
  const [preloadedQuoteDraft, setPreloadedQuoteDraft] = useState<PreloadedQuoteDraft | null>(null);

  const [noSampleDataMode, setNoSampleDataModeState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true';
  });

  const [requests, setRequests] = useState<QuoteRequest[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [formalQuotes, setFormalQuotes] = useState<FormalQuote[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : INITIAL_FORMAL_QUOTES;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [approvals, setApprovals] = useState<Approval[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [accountsPayable, setAccountsPayable] = useState<AccountsPayableItem[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_PAYABLE);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS_PAYABLE);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS_PAYABLE;
  });

  const [simpleReceipts, setSimpleReceipts] = useState<SimpleReceipt[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.SIMPLE_RECEIPTS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.SIMPLE_RECEIPTS);
    return saved ? JSON.parse(saved) : INITIAL_SIMPLE_RECEIPTS;
  });

  const [warehouseMovements, setWarehouseMovements] = useState<WarehouseMovement[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_MOVEMENTS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSE_MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_MOVEMENTS;
  });

  const [customerServiceTickets, setCustomerServiceTickets] = useState<CustomerServiceTicket[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICE_TICKETS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICE_TICKETS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_SERVICE_TICKETS;
  });

  const [dailyWorkLogs, setDailyWorkLogs] = useState<DailyWorkLog[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_WORK_LOGS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_WORK_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_WORK_LOGS;
  });

  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLE_LOGS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.VEHICLE_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_LOGS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    if (localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true') {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return saved ? JSON.parse(saved) : [];
    }
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [weeklyHoursLimit, setWeeklyHoursLimitState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKLY_HOURS_LIMIT);
    return saved ? Number(saved) : 40;
  });

  const setWeeklyHoursLimit = (hours: number) => {
    const valid = Math.max(30, Math.min(56, hours));
    setWeeklyHoursLimitState(valid);
    localStorage.setItem(STORAGE_KEYS.WEEKLY_HOURS_LIMIT, String(valid));
  };

  const [directorTargetMargin, setDirectorTargetMarginState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIRECTOR_TARGET_MARGIN);
    return saved ? Number(saved) : 36.5;
  });

  const setDirectorTargetMargin = (margin: number) => {
    const valid = Math.max(1, Math.min(100, margin));
    setDirectorTargetMarginState(valid);
    localStorage.setItem(STORAGE_KEYS.DIRECTOR_TARGET_MARGIN, String(valid));
  };

  const crews = INITIAL_CREWS;

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_WORK_LOGS, JSON.stringify(dailyWorkLogs));
  }, [dailyWorkLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLE_LOGS, JSON.stringify(vehicleLogs));
  }, [vehicleLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(formalQuotes));
  }, [formalQuotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS_PAYABLE, JSON.stringify(accountsPayable));
  }, [accountsPayable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIMPLE_RECEIPTS, JSON.stringify(simpleReceipts));
  }, [simpleReceipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSE_MOVEMENTS, JSON.stringify(warehouseMovements));
  }, [warehouseMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SERVICE_TICKETS, JSON.stringify(customerServiceTickets));
  }, [customerServiceTickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  const syncWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const conn = await testSupabaseConnection();
      setIsSupabaseConnected(conn.success);

      const settings = await getAppSettingsFromSupabase();
      const isSampleCleared = settings?.sample_data_cleared === true || localStorage.getItem(STORAGE_KEYS.NO_SAMPLE) === 'true';

      if (settings?.weekly_hours_limit) {
        setWeeklyHoursLimitState(settings.weekly_hours_limit);
        localStorage.setItem(STORAGE_KEYS.WEEKLY_HOURS_LIMIT, String(settings.weekly_hours_limit));
      }
      if (settings?.director_target_margin) {
        setDirectorTargetMarginState(settings.director_target_margin);
        localStorage.setItem(STORAGE_KEYS.DIRECTOR_TARGET_MARGIN, String(settings.director_target_margin));
      }
      if (isSampleCleared) {
        setNoSampleDataModeState(true);
        localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, 'true');
      }

      const [
        remoteEmployees,
        remoteAttendance,
        remoteQuotes,
        remoteProjects,
        remoteOrders,
        remoteSuppliers,
        remotePOs,
        remoteCxP,
        remoteReceipts,
        remoteInvoices,
        remoteApprovals,
        remoteDailyLogs,
        remoteVehicleLogs,
        remoteRequests
      ] = await Promise.all([
        fetchFromSupabase<Employee>('employees'),
        fetchFromSupabase<AttendanceRecord>('attendance_records'),
        fetchFromSupabase<FormalQuote>('formal_quotes'),
        fetchFromSupabase<Project>('projects'),
        fetchFromSupabase<WorkOrder>('work_orders'),
        fetchFromSupabase<Supplier>('suppliers'),
        fetchFromSupabase<PurchaseOrder>('purchase_orders'),
        fetchFromSupabase<AccountsPayableItem>('accounts_payable'),
        fetchFromSupabase<SimpleReceipt>('simple_receipts'),
        fetchFromSupabase<Invoice>('invoices'),
        fetchFromSupabase<Approval>('approvals'),
        fetchFromSupabase<DailyWorkLog>('daily_work_logs'),
        fetchFromSupabase<VehicleLog>('vehicle_logs'),
        fetchFromSupabase<QuoteRequest>('quote_requests')
      ]);

      if (remoteEmployees !== null) {
        if (remoteEmployees.length > 0) {
          setEmployees(prevLocal => {
            const remoteIds = new Set(remoteEmployees.map(e => e.id));
            const unsynced = prevLocal.filter(e => !remoteIds.has(e.id));
            if (unsynced.length > 0) {
              // Subir a Supabase los empleados locales que aún no estaban en la nube
              unsynced.forEach(emp => {
                saveToSupabase('employees', emp);
                if (emp.username && emp.password) {
                  saveToSupabase('app_users', {
                    id: `usr-${emp.id}`,
                    username: emp.username.trim().toLowerCase(),
                    password: emp.password.trim(),
                    full_name: emp.fullName,
                    role: emp.assignedRole || 'operaciones',
                    status: emp.status === 'activo' ? 'activo' : 'inactivo'
                  });
                }
              });
              return [...remoteEmployees, ...unsynced];
            }
            return remoteEmployees;
          });
        } else if (isSampleCleared) {
          // Si Supabase devuelve 0 empleados y se limpiaron muestras,
          // verificamos si en local el usuario ya había agregado algún empleado real
          setEmployees(prevLocal => {
            if (prevLocal.length > 0) {
              // El usuario tiene empleados reales locales, los sincronizamos a Supabase de inmediato
              prevLocal.forEach(emp => {
                saveToSupabase('employees', emp);
                if (emp.username && emp.password) {
                  saveToSupabase('app_users', {
                    id: `usr-${emp.id}`,
                    username: emp.username.trim().toLowerCase(),
                    password: emp.password.trim(),
                    full_name: emp.fullName,
                    role: emp.assignedRole || 'operaciones',
                    status: emp.status === 'activo' ? 'activo' : 'inactivo'
                  });
                }
              });
              return prevLocal;
            }
            return [];
          });
        }
      }
      if (remoteAttendance !== null && (remoteAttendance.length > 0 || isSampleCleared)) {
        setAttendanceRecords(remoteAttendance);
      }
      if (remoteQuotes !== null && (remoteQuotes.length > 0 || isSampleCleared)) {
        setFormalQuotes(remoteQuotes);
      }
      if (remoteProjects !== null && (remoteProjects.length > 0 || isSampleCleared)) {
        setProjects(remoteProjects);
      }
      if (remoteOrders !== null && (remoteOrders.length > 0 || isSampleCleared)) {
        setWorkOrders(remoteOrders);
      }
      if (remoteSuppliers !== null && (remoteSuppliers.length > 0 || isSampleCleared)) {
        setSuppliers(remoteSuppliers);
      }
      if (remotePOs !== null && (remotePOs.length > 0 || isSampleCleared)) {
        setPurchaseOrders(remotePOs);
      }
      if (remoteCxP !== null && (remoteCxP.length > 0 || isSampleCleared)) {
        setAccountsPayable(remoteCxP);
      }
      if (remoteReceipts !== null && (remoteReceipts.length > 0 || isSampleCleared)) {
        setSimpleReceipts(remoteReceipts);
      }
      if (remoteInvoices !== null && (remoteInvoices.length > 0 || isSampleCleared)) {
        setInvoices(remoteInvoices);
      }
      if (remoteApprovals !== null && (remoteApprovals.length > 0 || isSampleCleared)) {
        setApprovals(remoteApprovals);
      }
      if (remoteDailyLogs !== null && (remoteDailyLogs.length > 0 || isSampleCleared)) {
        setDailyWorkLogs(remoteDailyLogs);
      }
      if (remoteVehicleLogs !== null && (remoteVehicleLogs.length > 0 || isSampleCleared)) {
        setVehicleLogs(remoteVehicleLogs);
      }
      if (remoteRequests !== null && (remoteRequests.length > 0 || isSampleCleared)) {
        setRequests(remoteRequests);
      }

      return {
        success: conn.success,
        message: conn.message
      };
    } catch (err: any) {
      return { success: false, message: `Error al conectar con Supabase: ${err?.message || err}` };
    }
  };

  useEffect(() => {
    syncWithSupabase();
  }, []);

  const login = async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; message?: string }> => {
    const rawU = (usernameInput || '').trim().toLowerCase();
    const cleanU = rawU.replace(/\s+/g, '_');
    const uNoUnderscore = cleanU.replace(/_/g, '');
    const cleanP = (passwordInput || '').trim();

    // 1. Verificación tolerante para Eduardo Siller
    const isEduardo =
      cleanU === 'eduardo_siller' ||
      cleanU === 'eduardo-siller' ||
      cleanU === 'eduardo.siller' ||
      uNoUnderscore === 'eduardosiller' ||
      cleanU === 'eduardo' ||
      cleanU === 'siller';
    if (isEduardo && (cleanP === 'Chevropar#1970' || cleanP.toLowerCase() === 'chevropar#1970')) {
      const user: AppUser = {
        username: 'eduardo_siller',
        fullName: 'Ing. Eduardo Siller (Dirección General)',
        role: 'director'
      };
      setCurrentUser(user);
      localStorage.setItem('mallaesa_current_user', JSON.stringify(user));
      setActiveRole('director');
      return { success: true };
    }

    // 2. Verificación tolerante para Haroldo
    const isHaroldo =
      cleanU === 'haroldo90' ||
      cleanU === 'haroldo_90' ||
      cleanU === 'haroldo-90' ||
      uNoUnderscore === 'haroldo90' ||
      cleanU === 'haroldo';
    if (isHaroldo && (cleanP === 'Chevropar#1970' || cleanP.toLowerCase() === 'chevropar#1970')) {
      const user: AppUser = {
        username: 'haroldo90',
        fullName: 'Haroldo (Administración General)',
        role: 'administracion'
      };
      setCurrentUser(user);
      localStorage.setItem('mallaesa_current_user', JSON.stringify(user));
      setActiveRole('administracion');
      return { success: true };
    }

    // 3. Verificación contra la plantilla de empleados registrados en memoria
    const matchedEmployee = employees.find(emp => {
      if (!emp.username || !emp.password) return false;
      const empU = emp.username.trim().toLowerCase().replace(/\s+/g, '_');
      const empUNo = empU.replace(/_/g, '');
      const matchUser = empU === cleanU || empUNo === uNoUnderscore;
      const matchPass = emp.password.trim() === cleanP;
      return matchUser && matchPass;
    });

    if (matchedEmployee) {
      const userRole: RoleType = matchedEmployee.assignedRole || (
        matchedEmployee.department === 'administracion_ventas' ? 'administracion' : 'operaciones'
      );
      const user: AppUser = {
        id: matchedEmployee.id,
        username: matchedEmployee.username || cleanU,
        fullName: matchedEmployee.fullName,
        role: userRole
      };
      setCurrentUser(user);
      localStorage.setItem('mallaesa_current_user', JSON.stringify(user));
      setActiveRole(userRole);
      return { success: true };
    }

    // 4. Verificación en Supabase: tabla app_users
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .or(`username.ilike.${cleanU},username.ilike.${uNoUnderscore}`)
        .eq('password', cleanP)
        .maybeSingle();

      if (!error && data && data.status === 'activo') {
        const user: AppUser = {
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          role: (data.role as RoleType) || 'operaciones'
        };
        setCurrentUser(user);
        localStorage.setItem('mallaesa_current_user', JSON.stringify(user));
        setActiveRole(user.role);
        return { success: true };
      }
    } catch (err) {
      console.warn('[Auth] Error al verificar credenciales en app_users:', err);
    }

    // 5. Verificación de respaldo directa en tabla employees de Supabase
    try {
      let empRows: any[] | null = null;
      const directQuery = await supabase
        .from('employees')
        .select('*')
        .or(`username.ilike.${cleanU},username.ilike.${uNoUnderscore}`);

      if (!directQuery.error && directQuery.data && directQuery.data.length > 0) {
        empRows = directQuery.data;
      } else {
        const allQuery = await supabase.from('employees').select('*').limit(50);
        if (!allQuery.error && allQuery.data) {
          empRows = allQuery.data;
        }
      }

      if (empRows && empRows.length > 0) {
        const found = empRows.find((r: any) => {
          const raw = r.raw_data || {};
          const u1 = String(r.username || raw.username || '').trim().toLowerCase().replace(/\s+/g, '_');
          const p1 = String(r.password || raw.password || '').trim();
          const matchU = u1 === cleanU || u1.replace(/_/g, '') === uNoUnderscore;
          const matchP = p1 === cleanP;
          return matchU && matchP;
        });

        if (found) {
          const raw = found.raw_data || {};
          const userRole = (found.assigned_role || raw.assignedRole || 'operaciones') as RoleType;
          const user: AppUser = {
            id: found.id,
            username: found.username || raw.username || cleanU,
            fullName: found.full_name || raw.fullName || 'Colaborador MALLAESA',
            role: userRole
          };
          setCurrentUser(user);
          localStorage.setItem('mallaesa_current_user', JSON.stringify(user));
          setActiveRole(userRole);

          // Asegurar que quede en app_users para la próxima
          saveToSupabase('app_users', {
            id: `usr-${found.id}`,
            username: user.username,
            password: cleanP,
            full_name: user.fullName,
            role: userRole,
            status: 'activo'
          });

          return { success: true };
        }
      }
    } catch (err) {
      console.warn('[Auth] Error al verificar credenciales en employees de Supabase:', err);
    }

    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Verifique sus credenciales.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRoleState(null);
    localStorage.removeItem('mallaesa_current_user');
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
  };

  const setActiveRole = (role: RoleType | null) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
      const defaultMod = ROLE_DEFAULT_MODULE[role] || 'inicio';
      setCurrentModule(defaultMod);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
  };

  const setNoSampleDataMode = (enabled: boolean) => {
    setNoSampleDataModeState(enabled);
    localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, String(enabled));
    saveAppSettingsToSupabase({ sample_data_cleared: enabled });
    if (enabled) {
      clearAllSampleData();
    }
  };

  const clearAllSampleData = () => {
    setRequests([]);
    setFormalQuotes([]);
    setProjects([]);
    setWorkOrders([]);
    setApprovals([]);
    setInvoices([]);
    setPurchaseOrders([]);
    setAccountsPayable([]);
    setSimpleReceipts([]);
    setWarehouseMovements([]);
    setCustomerServiceTickets([]);
    setDailyWorkLogs([]);
    setVehicleLogs([]);
    setSuppliers([]);
    setEmployees([]);
    setAttendanceRecords([]);

    // Marca persistente en localStorage para que NUNCA vuelvan a cargar datos demo
    setNoSampleDataModeState(true);
    localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, 'true');

    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.ACTIVE_ROLE && key !== STORAGE_KEYS.NO_SAMPLE) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    // Guardar marca permanente en Supabase app_settings
    saveAppSettingsToSupabase({ sample_data_cleared: true });

    // Vaciar registros en Supabase
    const tables = [
      'employees',
      'attendance_records',
      'quote_requests',
      'formal_quotes',
      'projects',
      'work_orders',
      'inventory',
      'suppliers',
      'purchase_orders',
      'accounts_payable',
      'simple_receipts',
      'invoices',
      'approvals',
      'daily_work_logs',
      'vehicle_logs',
      'customer_service_tickets',
      'warehouse_movements'
    ];
    tables.forEach(tbl => clearTableInSupabase(tbl));
  };

  const restoreDemoData = () => {
    setNoSampleDataModeState(false);
    localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, 'false');
    saveAppSettingsToSupabase({ sample_data_cleared: false, weekly_hours_limit: 40, director_target_margin: 36.5 });
    setRequests(INITIAL_REQUESTS);
    setFormalQuotes(INITIAL_FORMAL_QUOTES);
    setProjects(INITIAL_PROJECTS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setApprovals(INITIAL_APPROVALS);
    setInvoices(INITIAL_INVOICES);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setAccountsPayable(INITIAL_ACCOUNTS_PAYABLE);
    setSimpleReceipts(INITIAL_SIMPLE_RECEIPTS);
    setWarehouseMovements(INITIAL_WAREHOUSE_MOVEMENTS);
    setCustomerServiceTickets(INITIAL_CUSTOMER_SERVICE_TICKETS);
    setDailyWorkLogs(INITIAL_DAILY_WORK_LOGS);
    setVehicleLogs(INITIAL_VEHICLE_LOGS);
    setSuppliers(INITIAL_SUPPLIERS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendanceRecords(INITIAL_ATTENDANCE);
    setWeeklyHoursLimitState(40);
    setDirectorTargetMarginState(36.5);
    localStorage.setItem(STORAGE_KEYS.DIRECTOR_TARGET_MARGIN, '36.5');
    localStorage.setItem(STORAGE_KEYS.WEEKLY_HOURS_LIMIT, '40');
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));

    // Guardar datos iniciales en Supabase
    INITIAL_EMPLOYEES.forEach(emp => saveToSupabase('employees', emp));
    INITIAL_ATTENDANCE.forEach(att => saveToSupabase('attendance_records', att));
    INITIAL_SUPPLIERS.forEach(sup => saveToSupabase('suppliers', sup));
    INITIAL_FORMAL_QUOTES.forEach(q => saveToSupabase('formal_quotes', q));
    INITIAL_PROJECTS.forEach(p => saveToSupabase('projects', p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    deleteFromSupabase('projects', id);
  };

  const deleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(w => w.id !== id));
    deleteFromSupabase('work_orders', id);
  };

  // Phase 1: Client submits questionnaire
  const submitClientRequest = (data: {
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    projectAddress: string;
    city: string;
    serviceType: ServiceType;
    linearMeters: number;
    heightMeters: number;
    terrainType: TerrainType;
    notes?: string;
    photoUrl?: string;
  }): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `COT-2026-${randomNum}`;
    const newId = `req-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newReq: QuoteRequest = {
      id: newId,
      folio,
      ...data,
      createdAt: now,
      status: 'nuevo'
    };

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      folio,
      quoteId: '',
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      projectAddress: data.projectAddress,
      city: data.city,
      serviceType: data.serviceType,
      linearMeters: data.linearMeters,
      heightMeters: data.heightMeters,
      phase: 1,
      phaseName: 'Fase 1: Solicitud de Cuestionario Ingresada',
      status: 'cotizacion_recibida',
      totalAmount: 0,
      advanceAmount: 0,
      advancePaid: false,
      balanceAmount: 0,
      balancePaid: false,
      createdAt: now,
      updatedAt: now
    };

    setRequests(prev => [newReq, ...prev]);
    setProjects(prev => [newProj, ...prev]);
    saveToSupabase('quote_requests', newReq);
    saveToSupabase('projects', newProj);
    return folio;
  };

  // Phase 1 to 2: Intelligent Quote save
  const saveIntelligentQuote = (data: {
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
    items: QuoteItem[];
    subtotal: number;
    iva: number;
    total: number;
    advance50: number;
    balance50: number;
    advancePercent?: number;
    balancePercent?: number;
    estimatedWorkDays: number;
    rawMaterials?: QuoteItem[];
    rawMaterialsCost?: number;
    profitMarginPercent?: number;
    profitAmount?: number;
    clientConcepts?: QuoteItem[];
  }) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const reqId = `req-${Date.now()}`;
    const quoteId = `quote-${Date.now()}`;
    const projId = `proj-${Date.now()}`;
    const advPct = data.advancePercent ?? 50;
    const balPct = data.balancePercent ?? (100 - advPct);

    const newReq: QuoteRequest = {
      id: reqId,
      folio: data.folio,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      projectAddress: data.projectAddress,
      city: data.city,
      serviceType: data.serviceType,
      linearMeters: data.linearMeters,
      heightMeters: data.heightMeters,
      terrainType: data.terrainType,
      createdAt: now,
      status: 'cotizado'
    };

    const newQuote: FormalQuote = {
      id: quoteId,
      requestId: reqId,
      folio: data.folio,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      projectAddress: data.projectAddress,
      serviceType: data.serviceType,
      linearMeters: data.linearMeters,
      heightMeters: data.heightMeters,
      items: (data.clientConcepts && data.clientConcepts.length > 0) ? data.clientConcepts : data.items,
      subtotal: data.subtotal,
      discountPercent: 0,
      discountApproved: true,
      discountApprovalPending: false,
      discountAmount: 0,
      iva: data.iva,
      total: data.total,
      advanceRequired: data.advance50,
      balanceRemaining: data.balance50,
      advancePercent: advPct,
      balancePercent: balPct,
      estimatedDays: data.estimatedWorkDays,
      status: 'enviada',
      createdAt: now,
      sentAt: now,
      rawMaterials: data.rawMaterials || data.items,
      rawMaterialsCost: data.rawMaterialsCost || data.subtotal,
      profitMarginPercent: data.profitMarginPercent ?? 20,
      profitAmount: data.profitAmount || 0,
      clientConcepts: data.clientConcepts
    };

    const newProj: Project = {
      id: projId,
      folio: data.folio,
      quoteId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      projectAddress: data.projectAddress,
      city: data.city,
      serviceType: data.serviceType,
      linearMeters: data.linearMeters,
      heightMeters: data.heightMeters,
      phase: 2,
      phaseName: 'Fase 2: Cotización Generada con Precio Exacto',
      status: 'cotizacion_enviada',
      totalAmount: data.total,
      advanceAmount: data.advance50,
      advancePercent: advPct,
      advancePaid: false,
      balanceAmount: data.balance50,
      balancePercent: balPct,
      balancePaid: false,
      createdAt: now,
      updatedAt: now
    };

    setRequests(prev => [newReq, ...prev.filter(r => r.folio !== data.folio)]);
    setFormalQuotes(prev => [newQuote, ...prev.filter(q => q.folio !== data.folio)]);
    setProjects(prev => [newProj, ...prev.filter(p => p.folio !== data.folio)]);

    saveToSupabase('quote_requests', newReq);
    saveToSupabase('formal_quotes', newQuote);
    saveToSupabase('projects', newProj);
  };

  const deleteFormalQuote = (quoteId: string) => {
    setFormalQuotes(prev => prev.filter(q => q.id !== quoteId));
    deleteFromSupabase('formal_quotes', quoteId);
  };

  // Phase 2: Sales creates quotation
  const createFormalQuote = (
    requestId: string,
    items: QuoteItem[],
    discountPercent: number,
    estimatedDays: number
  ): FormalQuote => {
    const req = requests.find(r => r.id === requestId);
    const folio = req ? req.folio : `COT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
    const subtotalWithDiscount = subtotal - discountAmount;
    const iva = Number((subtotalWithDiscount * 0.16).toFixed(2));
    const total = Number((subtotalWithDiscount + iva).toFixed(2));
    const advanceRequired = Number((total * 0.5).toFixed(2));
    const balanceRemaining = Number((total - advanceRequired).toFixed(2));

    const quoteId = `quote-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const requiresApproval = discountPercent > 8;

    const newQuote: FormalQuote = {
      id: quoteId,
      requestId,
      folio,
      clientName: req?.clientName || 'Cliente Particular',
      clientEmail: req?.clientEmail || '',
      clientPhone: req?.clientPhone || '',
      projectAddress: req?.projectAddress || '',
      serviceType: req?.serviceType || 'malla_ciclonica',
      linearMeters: req?.linearMeters || 100,
      heightMeters: req?.heightMeters || 2.0,
      items,
      subtotal,
      discountPercent,
      discountApproved: !requiresApproval,
      discountApprovalPending: requiresApproval,
      discountAmount,
      iva,
      total,
      advanceRequired,
      balanceRemaining,
      estimatedDays,
      status: 'borrador',
      createdAt: now
    };

    // If discount requires approval, create approval request for Eduardo Siller
    if (requiresApproval) {
      const newApproval: Approval = {
        id: `appr-${Date.now()}`,
        type: 'descuento',
        requestedBy: 'Ventas Mallaesa',
        referenceFolio: folio,
        clientOrProject: `${req?.clientName} (${folio})`,
        description: `Descuento del ${discountPercent}% solicitado ($${discountAmount.toLocaleString('es-MX')} MXN).`,
        amount: discountAmount,
        reason: 'Descuento comercial para asegurar cierre contra competencia.',
        status: 'pendiente',
        requestedAt: now
      };
      setApprovals(prev => [newApproval, ...prev]);
    }

    setFormalQuotes(prev => [newQuote, ...prev.filter(q => q.requestId !== requestId)]);

    // Update request and project status
    setRequests(prev =>
      prev.map(r => (r.id === requestId ? { ...r, status: 'cotizado' } : r))
    );

    setProjects(prev =>
      prev.map(p =>
        p.folio === folio
          ? {
              ...p,
              quoteId,
              phase: 2,
              phaseName: 'Fase 2: Cotización Generada',
              status: 'cotizacion_enviada',
              totalAmount: total,
              advanceAmount: advanceRequired,
              balanceAmount: balanceRemaining,
              updatedAt: now
            }
          : p
      )
    );

    return newQuote;
  };

  const requestDiscountApproval = (quoteId: string, percent: number, reason: string) => {
    const quote = formalQuotes.find(q => q.id === quoteId);
    if (!quote) return;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const discountAmount = Number(((quote.subtotal * percent) / 100).toFixed(2));

    const newApproval: Approval = {
      id: `appr-${Date.now()}`,
      type: 'descuento',
      requestedBy: 'Ventas Mallaesa',
      referenceFolio: quote.folio,
      clientOrProject: quote.clientName,
      description: `Autorización de descuento ${percent}% ($${discountAmount.toLocaleString('es-MX')} MXN)`,
      amount: discountAmount,
      reason,
      status: 'pendiente',
      requestedAt: now
    };

    setApprovals(prev => [newApproval, ...prev]);
    setFormalQuotes(prev =>
      prev.map(q =>
        q.id === quoteId
          ? { ...q, discountPercent: percent, discountApprovalPending: true }
          : q
      )
    );
  };

  const sendQuoteToClient = (quoteId: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setFormalQuotes(prev =>
      prev.map(q =>
        q.id === quoteId ? { ...q, status: 'enviada', sentAt: now } : q
      )
    );
  };

  // Phase 3: Client approves & signs quote
  const clientApproveQuote = (quoteId: string, signature: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const quote = formalQuotes.find(q => q.id === quoteId);
    if (!quote) return;

    setFormalQuotes(prev =>
      prev.map(q =>
        q.id === quoteId
          ? { ...q, status: 'aprobada', approvedAt: now, clientSignature: signature }
          : q
      )
    );

    setProjects(prev =>
      prev.map(p =>
        p.folio === quote.folio
          ? {
              ...p,
              phase: 3,
              phaseName: 'Fase 3: Aprobada - Esperando Anticipo 50%',
              status: 'esperando_anticipo',
              updatedAt: now
            }
          : p
      )
    );
  };

  // Phase 3 to 4: Admin registers 50% advance
  const registerAdvancePayment = (projectId: string, receiptFolio: string, paymentMethod: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Generate CFDI 4.0 advance invoice
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      folioFiscalUuid: `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4A12-88B1-${Date.now()}`,
      seriesNumber: `MAL-A-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId: project.id,
      clientName: project.clientName,
      rfc: 'XAXX010101000',
      date: now.split(' ')[0],
      subtotal: Number((project.advanceAmount / 1.16).toFixed(2)),
      iva: Number((project.advanceAmount - project.advanceAmount / 1.16).toFixed(2)),
      total: project.advanceAmount,
      type: 'Anticipo 50%',
      paymentMethod: 'PUE',
      paymentWay: 'Transferencia SPEI (03)',
      status: 'timbrada'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              advancePaid: true,
              advanceDate: now,
              advanceReceipt: receiptFolio || `SPEI-${Date.now()}`,
              phase: 4,
              phaseName: 'Fase 4: Anticipo Confirmado - Programación de OT',
              status: 'anticipo_confirmado',
              updatedAt: now
            }
          : p
      )
    );
  };

  // Phase 4: Create Work Order (OT) and deduct inventory
  const createWorkOrder = (
    projectId: string,
    crewId: string,
    scheduledDate: string,
    scheduledTime: string
  ): WorkOrder => {
    const project = projects.find(p => p.id === projectId);
    const crew = crews.find(c => c.id === crewId) || crews[0];
    const otFolio = `OT-MAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const rollsNeeded = Math.ceil((project?.linearMeters || 100) / 20);
    const postsNeeded = Math.ceil((project?.linearMeters || 100) / 3);

    const materials = [
      { materialId: 'inv-1', name: 'Rollos Malla Ciclónica', quantity: rollsNeeded, unit: 'Rollo' },
      { materialId: 'inv-3', name: 'Postes de Línea 48mm', quantity: postsNeeded, unit: 'Pieza' },
      { materialId: 'inv-8', name: 'Abrazaderas y Tornillería', quantity: postsNeeded * 3, unit: 'Pieza' },
      { materialId: 'inv-9', name: 'Sacos Cemento Gris Tolteca', quantity: Math.ceil(postsNeeded * 0.5), unit: 'Saco' }
    ];

    // Deduct stock
    setInventory(prev =>
      prev.map(item => {
        const reserved = materials.find(m => m.materialId === item.id);
        if (reserved) {
          return { ...item, stock: Math.max(0, item.stock - reserved.quantity) };
        }
        return item;
      })
    );

    const newOT: WorkOrder = {
      id: `ot-${Date.now()}`,
      folio: otFolio,
      projectId,
      clientName: project?.clientName || 'Cliente',
      clientPhone: project?.clientPhone || '',
      address: project?.projectAddress || '',
      serviceType: project?.serviceType || 'malla_ciclonica',
      linearMeters: project?.linearMeters || 100,
      crewId: crew.id,
      crewName: `${crew.leadName} & ${crew.assistantName}`,
      scheduledDate,
      scheduledTime,
      materialsReserved: materials,
      status: 'programada',
      beforePhotos: [],
      afterPhotos: []
    };

    setWorkOrders(prev => [newOT, ...prev]);

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              workOrderId: newOT.id,
              assignedCrew: newOT.crewName,
              scheduledDate,
              status: 'orden_programada',
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          : p
      )
    );

    return newOT;
  };

  const updateWorkOrderStatus = (workOrderId: string, status: WorkOrder['status']) => {
    setWorkOrders(prev =>
      prev.map(ot => (ot.id === workOrderId ? { ...ot, status } : ot))
    );

    const ot = workOrders.find(o => o.id === workOrderId);
    if (ot && ot.projectId) {
      setProjects(prev =>
        prev.map(p =>
          p.id === ot.projectId
            ? {
                ...p,
                status: status === 'en_instalacion' ? 'en_instalacion' : p.status
              }
            : p
        )
      );
    }
  };

  // Phase 5: Field completion with Touch Signature and Photos
  const submitFieldSignatureAndPhotos = (
    workOrderId: string,
    clientSignature: string,
    beforePhotos: string[],
    afterPhotos: string[],
    notes: string
  ) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const ot = workOrders.find(o => o.id === workOrderId);
    if (!ot) return;

    setWorkOrders(prev =>
      prev.map(o =>
        o.id === workOrderId
          ? {
              ...o,
              status: 'completada',
              clientSignature,
              clientSignatureDate: now,
              beforePhotos: beforePhotos.length > 0 ? beforePhotos : o.beforePhotos,
              afterPhotos: afterPhotos.length > 0 ? afterPhotos : o.afterPhotos,
              crewNotes: notes,
              completedAt: now
            }
          : o
      )
    );

    // Auto issue digital warranty and move project to Phase 5: waiting for final payment
    const warrantyNum = `POL-MAL-${Date.now().toString().slice(-6)}`;

    setProjects(prev =>
      prev.map(p =>
        p.id === ot.projectId
          ? {
              ...p,
              phase: 5,
              phaseName: 'Fase 5: Cierre & Liquidación Pendiente',
              status: 'esperando_saldo',
              warrantyFolio: warrantyNum,
              warrantyYears: 3,
              warrantyIssuedAt: now,
              updatedAt: now
            }
          : p
      )
    );
  };

  // Phase 5 Final: Register final 50% balance and finish project
  const registerFinalPayment = (projectId: string, paymentWay: Invoice['paymentWay'], rfc: string): Invoice => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const newInvoice: Invoice = {
      id: `inv-fin-${Date.now()}`,
      folioFiscalUuid: `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4A12-88B1-${Date.now()}`,
      seriesNumber: `MAL-A-${Math.floor(2000 + Math.random() * 7000)}`,
      projectId: project.id,
      clientName: project.clientName,
      rfc: rfc || 'XAXX010101000',
      date: now.split(' ')[0],
      subtotal: Number((project.balanceAmount / 1.16).toFixed(2)),
      iva: Number((project.balanceAmount - project.balanceAmount / 1.16).toFixed(2)),
      total: project.balanceAmount,
      type: 'Finiquito 50%',
      paymentMethod: 'PUE',
      paymentWay,
      status: 'timbrada'
    };

    setInvoices(prev => [newInvoice, ...prev]);

    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              balancePaid: true,
              balanceDate: now,
              status: 'finalizado',
              phaseName: 'Fase 5: Concluido y Garantía Vigente',
              updatedAt: now
            }
          : p
      )
    );

    return newInvoice;
  };

  // Director General Approvals
  const resolveApproval = (approvalId: string, status: 'aprobado' | 'rechazado', directorNotes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const app = approvals.find(a => a.id === approvalId);

    setApprovals(prev =>
      prev.map(a =>
        a.id === approvalId
          ? {
              ...a,
              status,
              resolvedAt: now,
              directorNotes: directorNotes || (status === 'aprobado' ? 'Autorizado por Eduardo Siller (Dirección General)' : 'No autorizado por política de margen')
            }
          : a
      )
    );

    // If it was a discount approval, unlock the quote
    if (app && app.type === 'descuento') {
      setFormalQuotes(prev =>
        prev.map(q =>
          q.folio === app.referenceFolio
            ? {
                ...q,
                discountApproved: status === 'aprobado',
                discountApprovalPending: false
              }
            : q
        )
      );
    }
  };

  // Inventory adjustment
  const adjustInventoryStock = (itemId: string, newStock: number) => {
    setInventory(prev =>
      prev.map(i => (i.id === itemId ? { ...i, stock: Math.max(0, newStock) } : i))
    );
  };

  // Órdenes de Compra (OC)
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'folio'>): PurchaseOrder => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `OC-2026-${randomNum}`;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      folio,
      ...poData
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Crear automáticamente cuenta por pagar asociada si la OC queda autorizada o en camino
    if (poData.status === 'autorizada' || poData.status === 'en_camino') {
      const newCXP: AccountsPayableItem = {
        id: `cxp-${Date.now()}`,
        folio: `CXP-${randomNum}`,
        provider: poData.provider,
        category: 'materia_prima',
        invoiceOrRef: folio,
        issueDate: poData.date,
        dueDate: poData.deliveryDateEstimated || poData.date,
        amount: poData.total,
        amountPaid: 0,
        balance: poData.total,
        status: 'pendiente',
        notes: `Generado automáticamente por ${folio}`
      };
      setAccountsPayable(prev => [newCXP, ...prev]);
    }

    return newPO;
  };

  const updatePurchaseOrderStatus = (poId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === poId ? { ...p, status } : p))
    );
  };

  const receivePurchaseOrderIntoWarehouse = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Marcar OC como recibida
    setPurchaseOrders(prev =>
      prev.map(p => (p.id === poId ? { ...p, status: 'recibida', receivedAt: now } : p))
    );

    // 2. Incrementar stock en inventario
    po.items.forEach(item => {
      if (item.inventoryItemId) {
        setInventory(prev =>
          prev.map(inv =>
            inv.id === item.inventoryItemId
              ? { ...inv, stock: inv.stock + item.quantity }
              : inv
          )
        );
      }
    });

    // 3. Registrar vale de movimiento de ingreso en almacén
    const newMov: WarehouseMovement = {
      id: `wm-${Date.now()}`,
      folio: `ENT-COMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: 'ingreso_compra',
      referenceFolio: po.folio,
      date: now,
      requestedBy: 'Encargado de Almacén',
      destinationOrOrigin: po.provider,
      items: po.items.map(i => ({
        materialName: i.description,
        quantity: i.quantity,
        unit: i.unit,
        inventoryItemId: i.inventoryItemId
      })),
      notes: `Ingreso automático por recepción total de ${po.folio}`,
      status: 'completado'
    };
    setWarehouseMovements(prev => [newMov, ...prev]);
  };

  // Cuentas por Pagar (CxP)
  const createAccountsPayable = (item: Omit<AccountsPayableItem, 'id' | 'folio' | 'balance' | 'status' | 'amountPaid'>): AccountsPayableItem => {
    const newCXP: AccountsPayableItem = {
      id: `cxp-${Date.now()}`,
      folio: `CXP-${Math.floor(1000 + Math.random() * 9000)}`,
      ...item,
      amountPaid: 0,
      balance: item.amount,
      status: 'pendiente'
    };
    setAccountsPayable(prev => [newCXP, ...prev]);
    return newCXP;
  };

  const registerAccountsPayablePayment = (cxpId: string, amount: number, method: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setAccountsPayable(prev =>
      prev.map(cxp => {
        if (cxp.id !== cxpId) return cxp;
        const newPaid = Number((cxp.amountPaid + amount).toFixed(2));
        const newBalance = Math.max(0, Number((cxp.amount - newPaid).toFixed(2)));
        const newStatus: AccountsPayableItem['status'] = newBalance <= 0 ? 'pagado' : 'parcial';
        return {
          ...cxp,
          amountPaid: newPaid,
          balance: newBalance,
          status: newStatus,
          paymentMethod: method,
          paidAt: now
        };
      })
    );
  };

  // Recibos Simples No Fiscales
  const createSimpleReceipt = (data: Omit<SimpleReceipt, 'id' | 'folio'>): SimpleReceipt => {
    const folio = `REC-MAL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceipt: SimpleReceipt = {
      id: `rec-${Date.now()}`,
      folio,
      ...data
    };
    setSimpleReceipts(prev => [newReceipt, ...prev]);

    // Si está vinculado a un proyecto, sincronizar saldo
    if (data.projectId) {
      setProjects(prev =>
        prev.map(p => {
          if (p.id !== data.projectId) return p;
          if (data.paymentType === 'anticipo') {
            return {
              ...p,
              advancePaid: true,
              advanceDate: data.date,
              advanceReceipt: folio,
              status: 'anticipo_confirmado'
            };
          } else if (data.paymentType === 'liquidacion_total') {
            return {
              ...p,
              balancePaid: true,
              balanceDate: data.date,
              status: 'finalizado'
            };
          }
          return p;
        })
      );
    }

    return newReceipt;
  };

  // Almacén: Movimientos
  const registerWarehouseMovement = (data: Omit<WarehouseMovement, 'id' | 'folio'>): WarehouseMovement => {
    const folio = data.type === 'egreso_obra'
      ? `VALE-SAL-${Math.floor(1000 + Math.random() * 9000)}`
      : data.type === 'ingreso_compra'
      ? `ENT-COMP-${Math.floor(1000 + Math.random() * 9000)}`
      : `DEV-OBRA-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMov: WarehouseMovement = {
      id: `wm-${Date.now()}`,
      folio,
      ...data
    };

    // Ajustar inventario según el tipo
    data.items.forEach(item => {
      if (item.inventoryItemId) {
        setInventory(prev =>
          prev.map(inv => {
            if (inv.id !== item.inventoryItemId) return inv;
            if (data.type === 'egreso_obra') {
              return { ...inv, stock: Math.max(0, inv.stock - item.quantity) };
            } else if (data.type === 'ingreso_compra' || data.type === 'devolucion_sobrante') {
              return { ...inv, stock: inv.stock + item.quantity };
            }
            return inv;
          })
        );
      }
    });

    setWarehouseMovements(prev => [newMov, ...prev]);
    return newMov;
  };

  // Atención a Clientes
  const createCustomerServiceTicket = (data: Omit<CustomerServiceTicket, 'id' | 'folio' | 'createdAt'>): CustomerServiceTicket => {
    const folio = `ATC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newTicket: CustomerServiceTicket = {
      id: `tkt-${Date.now()}`,
      folio,
      createdAt: now,
      ...data
    };
    setCustomerServiceTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const updateCustomerServiceTicketStatus = (ticketId: string, status: CustomerServiceTicket['status'], resolutionNotes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setCustomerServiceTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              status,
              resolutionNotes: resolutionNotes || t.resolutionNotes,
              resolvedAt: status === 'resuelto' ? now : t.resolvedAt
            }
          : t
      )
    );
  };

  // Avance Diario de Cuadrillas
  const addDailyWorkLog = (logData: Omit<DailyWorkLog, 'id' | 'folio' | 'createdAt'>): DailyWorkLog => {
    const nextNum = dailyWorkLogs.length + 1;
    const folio = `AVN-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newLog: DailyWorkLog = {
      ...logData,
      id: `dwl-${Date.now()}`,
      folio,
      createdAt: new Date().toISOString()
    };
    setDailyWorkLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  // Control Vehicular & Flotilla
  const addVehicleLog = (logData: Omit<VehicleLog, 'id' | 'folio' | 'createdAt'>): VehicleLog => {
    const nextNum = vehicleLogs.length + 1;
    const folio = `VEH-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    const newLog: VehicleLog = {
      ...logData,
      id: `veh-${Date.now()}`,
      folio,
      createdAt: new Date().toISOString()
    };
    setVehicleLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  const updateVehicleLogReturn = (id: string, returnData: {
    returnDate: string;
    returnTime: string;
    returnMileage: number;
    returnFuelLevel: '1/4' | '1/2' | '3/4' | 'Lleno';
    returnConditions?: string;
    returnPhotoUrl?: string;
    returnSignature: string;
    notes?: string;
  }) => {
    setVehicleLogs(prev => prev.map(v => {
      if (v.id !== id) return v;
      const distanceTraveledKm = Math.max(0, returnData.returnMileage - v.departureMileage);
      return {
        ...v,
        ...returnData,
        distanceTraveledKm,
        status: 'retornado' as const
      };
    }));
  };

  // Cuentas por Cobrar: Esquema Flexible de Anticipo y Finiquito
  const updateProjectPaymentScheme = (projectId: string, advancePercent: number) => {
    const validAdvance = Math.min(100, Math.max(0, advancePercent));
    const validBalance = 100 - validAdvance;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const advanceAmount = Number(((p.totalAmount * validAdvance) / 100).toFixed(2));
      const balanceAmount = Number((p.totalAmount - advanceAmount).toFixed(2));
      return {
        ...p,
        advancePercent: validAdvance,
        balancePercent: validBalance,
        advanceAmount,
        balanceAmount,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  // Catálogo de Proveedores
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `prov-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    saveToSupabase('suppliers', newSupplier);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        saveToSupabase('suppliers', updated);
        return updated;
      }
      return s;
    }));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    deleteFromSupabase('suppliers', id);
  };

  // Helper para cálculo diario de horas y horas extras (>8h)
  const calculateDailyHours = (checkIn: string, checkOut: string, lunchMinutes: number = 60): { hoursWorked: number; overtimeHours: number } => {
    if (!checkIn || !checkOut) return { hoursWorked: 0, overtimeHours: 0 };
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return { hoursWorked: 0, overtimeHours: 0 };

    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM) - (lunchMinutes || 0);
    if (totalMinutes < 0) totalMinutes = 0;
    const hoursWorked = Number((totalMinutes / 60).toFixed(2));
    const overtimeHours = Number(Math.max(0, hoursWorked - 8).toFixed(2));
    return { hoursWorked, overtimeHours };
  };

  // Capital Humano: Empleados
  const addEmployee = (empData: Omit<Employee, 'id'>): Employee => {
    const hourlyRate = empData.hourlyRate || Number((empData.dailySalary / 8).toFixed(2));
    const newEmployee: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      hourlyRate,
      weeklyBaseHours: empData.weeklyBaseHours || weeklyHoursLimit || 40,
      systemUrl: empData.systemUrl || 'https://mallaesa.vercel.app/'
    };
    setEmployees(prev => [newEmployee, ...prev]);
    saveToSupabase('employees', newEmployee);

    if (newEmployee.username && newEmployee.password) {
      saveToSupabase('app_users', {
        id: `usr-${newEmployee.id}`,
        username: newEmployee.username.trim().toLowerCase(),
        password: newEmployee.password.trim(),
        full_name: newEmployee.fullName,
        role: newEmployee.assignedRole || 'operaciones',
        status: newEmployee.status === 'activo' ? 'activo' : 'inactivo'
      });
    }

    return newEmployee;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id !== id) return emp;
      const updated = { ...emp, ...updates };
      if (updates.dailySalary && !updates.hourlyRate) {
        updated.hourlyRate = Number((updates.dailySalary / 8).toFixed(2));
      }
      saveToSupabase('employees', updated);

      if (updated.username && updated.password) {
        saveToSupabase('app_users', {
          id: `usr-${updated.id}`,
          username: updated.username.trim().toLowerCase(),
          password: updated.password.trim(),
          full_name: updated.fullName,
          role: updated.assignedRole || 'operaciones',
          status: updated.status === 'activo' ? 'activo' : 'inactivo'
        });
      }

      return updated;
    }));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setAttendanceRecords(prev => prev.filter(att => att.employeeId !== id));
    deleteFromSupabase('employees', id);
    deleteFromSupabase('app_users', `usr-${id}`);
  };

  // Control de Asistencia & Checador
  const recordAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>): AttendanceRecord => {
    const { hoursWorked, overtimeHours } = calculateDailyHours(recordData.checkIn, recordData.checkOut, recordData.lunchMinutes);
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}`,
      hoursWorked: recordData.hoursWorked || hoursWorked,
      overtimeHours: recordData.overtimeHours !== undefined ? recordData.overtimeHours : overtimeHours,
      createdAt: new Date().toISOString()
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    saveToSupabase('attendance_records', newRecord);
    return newRecord;
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.id !== id) return rec;
      const merged = { ...rec, ...updates };
      if (updates.checkIn || updates.checkOut || updates.lunchMinutes !== undefined) {
        const { hoursWorked, overtimeHours } = calculateDailyHours(merged.checkIn, merged.checkOut, merged.lunchMinutes);
        merged.hoursWorked = hoursWorked;
        merged.overtimeHours = overtimeHours;
      }
      saveToSupabase('attendance_records', merged);
      return merged;
    }));
  };

  const deleteAttendance = (id: string) => {
    setAttendanceRecords(prev => prev.filter(rec => rec.id !== id));
    deleteFromSupabase('attendance_records', id);
  };

  // Cálculo Semanal de Horas Extras conforme a la Ley de 40 Horas (LFT México)
  const calculateWeeklyLaborSummary = (): EmployeeWeeklySummary[] => {
    return employees.map(emp => {
      const empRecords = attendanceRecords.filter(att => att.employeeId === emp.id && att.status !== 'falta_injustificada');
      const totalHoursWorked = Number(empRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0).toFixed(2));
      const daysWorkedCount = empRecords.filter(r => r.status === 'presente' || r.status === 'retardo').length;

      // Base regular legal (40 horas semanales según reforma LFT)
      const baseLegalLimit = weeklyHoursLimit || 40;
      const regularHours = Math.min(baseLegalLimit, totalHoursWorked);
      const totalOvertime = Math.max(0, totalHoursWorked - regularHours);

      // Art. 67 y 68 LFT: Primeras 9 horas extras al 100% adicional (dobles), excedente al 200% (triples)
      const overtimeDoubleHours = Number(Math.min(9, totalOvertime).toFixed(2));
      const overtimeTripleHours = Number(Math.max(0, totalOvertime - 9).toFixed(2));

      const hourlyRate = emp.hourlyRate || Number((emp.dailySalary / 8).toFixed(2));

      // Sueldo base semanal
      const basePay = Number((emp.dailySalary * (daysWorkedCount || 6)).toFixed(2));
      const overtimeDoublePay = Number((overtimeDoubleHours * hourlyRate * 2).toFixed(2));
      const overtimeTriplePay = Number((overtimeTripleHours * hourlyRate * 3).toFixed(2));
      const totalOvertimePay = Number((overtimeDoublePay + overtimeTriplePay).toFixed(2));

      // Viáticos semanales si es personal en obra
      const viaticsPay = emp.department === 'instalacion_campo' ? 1400 : 0;
      const totalWeeklyGrossPay = Number((basePay + totalOvertimePay + viaticsPay).toFixed(2));

      let lftComplianceStatus: 'optimo' | 'moderado_horas_extras' | 'alerta_exceso_lft' = 'optimo';
      if (totalHoursWorked > baseLegalLimit && totalHoursWorked <= baseLegalLimit + 9) {
        lftComplianceStatus = 'moderado_horas_extras';
      } else if (totalHoursWorked > baseLegalLimit + 9) {
        lftComplianceStatus = 'alerta_exceso_lft';
      }

      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        jobTitle: emp.jobTitle,
        department: emp.department,
        dailySalary: emp.dailySalary,
        hourlyRate,
        totalHoursWorked,
        regularHours,
        overtimeDoubleHours,
        overtimeTripleHours,
        basePay,
        overtimeDoublePay,
        overtimeTriplePay,
        totalOvertimePay,
        viaticsPay,
        totalWeeklyGrossPay,
        daysWorkedCount,
        lftComplianceStatus
      };
    });
  };

  const loadQuoteDraftIntoCalculator = (draft: PreloadedQuoteDraft) => {
    setPreloadedQuoteDraft(draft);
    setActiveRole('cotizador');
    setCurrentModule('cotizador');
  };

  const clearPreloadedQuoteDraft = () => {
    setPreloadedQuoteDraft(null);
  };

  return (
    <MallaesaContext.Provider
      value={{
        currentUser,
        login,
        logout,
        activeRole,
        setActiveRole,
        currentModule,
        setCurrentModule,
        preloadedQuoteDraft,
        loadQuoteDraftIntoCalculator,
        clearPreloadedQuoteDraft,
        requests,
        formalQuotes,
        projects,
        workOrders,
        inventory,
        approvals,
        invoices,
        crews,
        purchaseOrders,
        accountsPayable,
        simpleReceipts,
        warehouseMovements,
        customerServiceTickets,
        dailyWorkLogs,
        vehicleLogs,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        employees,
        attendanceRecords,
        weeklyHoursLimit,
        setWeeklyHoursLimit,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        recordAttendance,
        updateAttendance,
        deleteAttendance,
        calculateWeeklyLaborSummary,
        directorTargetMargin,
        setDirectorTargetMargin,
        noSampleDataMode,
        clearAllSampleData,
        setNoSampleDataMode,
        restoreDemoData,
        submitClientRequest,
        saveIntelligentQuote,
        deleteFormalQuote,
        createFormalQuote,
        requestDiscountApproval,
        sendQuoteToClient,
        clientApproveQuote,
        registerAdvancePayment,
        createWorkOrder,
        updateWorkOrderStatus,
        submitFieldSignatureAndPhotos,
        registerFinalPayment,
        resolveApproval,
        adjustInventoryStock,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        receivePurchaseOrderIntoWarehouse,
        createAccountsPayable,
        registerAccountsPayablePayment,
        createSimpleReceipt,
        registerWarehouseMovement,
        createCustomerServiceTicket,
        updateCustomerServiceTicketStatus,
        addDailyWorkLog,
        addVehicleLog,
        updateVehicleLogReturn,
        updateProjectPaymentScheme,
        isSupabaseConnected,
        syncWithSupabase,
        deleteProject,
        deleteWorkOrder
      }}
    >
      {children}
    </MallaesaContext.Provider>
  );
};

export const useMallaesa = () => {
  const context = useContext(MallaesaContext);
  if (!context) {
    throw new Error('useMallaesa must be used within a MallaesaProvider');
  }
  return context;
};
