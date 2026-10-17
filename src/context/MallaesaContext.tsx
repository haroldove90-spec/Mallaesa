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
  QuoteItem
} from '../types';
import {
  INITIAL_REQUESTS,
  INITIAL_FORMAL_QUOTES,
  INITIAL_PROJECTS,
  INITIAL_WORK_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_APPROVALS,
  INITIAL_INVOICES,
  INITIAL_CREWS
} from '../data/initialData';

interface MallaesaContextType {
  activeRole: RoleType | null;
  setActiveRole: (role: RoleType | null) => void;
  requests: QuoteRequest[];
  formalQuotes: FormalQuote[];
  projects: Project[];
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  approvals: Approval[];
  invoices: Invoice[];
  crews: CrewMember[];
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
  INVOICES: 'mallaesa_invoices'
};

export const MallaesaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<RoleType | null>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as RoleType) || null;
  });

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

  const crews = INITIAL_CREWS;

  // Synchronize to localStorage
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

  const setActiveRole = (role: RoleType | null) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ROLE);
    }
  };

  const setNoSampleDataMode = (enabled: boolean) => {
    setNoSampleDataModeState(enabled);
    localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, String(enabled));
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
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
  };

  const restoreDemoData = () => {
    setNoSampleDataModeState(false);
    localStorage.setItem(STORAGE_KEYS.NO_SAMPLE, 'false');
    setRequests(INITIAL_REQUESTS);
    setFormalQuotes(INITIAL_FORMAL_QUOTES);
    setProjects(INITIAL_PROJECTS);
    setWorkOrders(INITIAL_WORK_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setApprovals(INITIAL_APPROVALS);
    setInvoices(INITIAL_INVOICES);
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
      advancePaid: false,
      balanceAmount: data.balance50,
      balancePaid: false,
      createdAt: now,
      updatedAt: now
    };

    setRequests(prev => [newReq, ...prev.filter(r => r.folio !== data.folio)]);
    setFormalQuotes(prev => [newQuote, ...prev.filter(q => q.folio !== data.folio)]);
    setProjects(prev => [newProj, ...prev.filter(p => p.folio !== data.folio)]);
  };

  const deleteFormalQuote = (quoteId: string) => {
    setFormalQuotes(prev => prev.filter(q => q.id !== quoteId));
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

  return (
    <MallaesaContext.Provider
      value={{
        activeRole,
        setActiveRole,
        requests,
        formalQuotes,
        projects,
        workOrders,
        inventory,
        approvals,
        invoices,
        crews,
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
        adjustInventoryStock
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
