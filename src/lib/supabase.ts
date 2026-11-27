import { createClient } from '@supabase/supabase-js';

// Supabase project credentials for MALLAESA
// Project Name: mallaesa@grupoinmobiliariamr.com's Project
// Project ID: uivyldmrbdwvbagsakij
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  return fallback;
};

const rawUrl = getEnvVar('VITE_SUPABASE_URL', 'https://uivyldmrbdwvbagsakij.supabase.co');
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_qqwHMZcX_rjnAaLvTqeTwA_nDc7g1yi');
export const SUPABASE_PROJECT_ID = 'uivyldmrbdwvbagsakij';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

/**
 * Verifica la conectividad con el proyecto de Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any; needsGrants?: boolean }> {
  try {
    // Intentamos consultar la tabla de app_settings o hacer una llamada básica
    const { data, error } = await supabase.from('app_settings').select('*').limit(1);
    if (error) {
      // Si PostgreSQL niega el permiso (código 42501 / permission denied)
      if (error.message.includes('permission denied') || error.code === '42501') {
        return {
          success: false,
          needsGrants: true,
          message: 'Atención: Tablas detectadas en Supabase pero PostgreSQL requiere permisos GRANT para el rol público (anon). Ejecuta el script de permisos en SQL Editor.'
        };
      }

      // Si el error es que la tabla no existe aún en el schema cache (PGRST205 / PGRST116), las credenciales y la conexión API son 100% válidas
      if (
        error.code === 'PGRST116' ||
        error.code === 'PGRST205' ||
        error.message.includes('relation "app_settings" does not exist') ||
        error.message.includes('Could not find the table') ||
        error.code === '42P01'
      ) {
        return {
          success: true,
          message: '¡Conexión verificada con éxito! Credenciales y proyecto válidos. Pendiente ejecutar el script SQL en Supabase SQL Editor para crear las tablas.'
        };
      }
      return {
        success: false,
        message: `Error al consultar Supabase: ${error.message} (Código: ${error.code})`,
        details: error
      };
    }
    return {
      success: true,
      message: 'Conexión exitosa y permisos verificados en Supabase.',
      details: data
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error de red al conectar con Supabase: ${err.message || 'Sin conexión'}`
    };
  }
}

/**
 * Obtener las configuraciones globales desde Supabase
 */
export async function getAppSettingsFromSupabase(): Promise<{
  sample_data_cleared?: boolean;
  weekly_hours_limit?: number;
  director_target_margin?: number;
} | null> {
  try {
    const { data, error } = await supabase.from('app_settings').select('*').eq('id', 'global').maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Guardar o actualizar las configuraciones globales en Supabase
 */
export async function saveAppSettingsToSupabase(settings: {
  sample_data_cleared?: boolean;
  weekly_hours_limit?: number;
  director_target_margin?: number;
}): Promise<boolean> {
  try {
    const payload = {
      id: 'global',
      ...settings,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('app_settings').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Transforma y sanitiza un registro para que coincida exactamente con las columnas de PostgreSQL en Supabase
 */
export function formatPayloadForSupabase(tableName: string, record: any): any {
  if (!record || !record.id) return record;

  if (tableName === 'app_users') {
    return {
      id: String(record.id),
      username: String(record.username || '').trim().toLowerCase(),
      password: String(record.password || '').trim(),
      full_name: String(record.full_name || record.fullName || '').trim(),
      role: String(record.role || record.assignedRole || 'operaciones'),
      phone: record.phone || null,
      status: String(record.status || 'activo'),
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'employees') {
    return {
      id: String(record.id),
      code: record.code || '',
      full_name: record.fullName || record.full_name || '',
      curp: record.curp || '',
      rfc: record.rfc || '',
      nss: record.nss || '',
      phone: record.phone || '',
      email: record.email || '',
      address: record.address || '',
      birth_date: record.birthDate || record.birth_date || '',
      blood_type: record.bloodType || record.blood_type || '',
      emergency_contact: record.emergencyContact || record.emergency_contact || null,
      job_title: record.jobTitle || record.job_title || '',
      department: record.department || 'instalacion_campo',
      assigned_crew: record.assignedCrew || record.assigned_crew || '',
      hire_date: record.hireDate || record.hire_date || '',
      daily_salary: Number(record.dailySalary ?? record.daily_salary ?? 0),
      hourly_rate: Number(record.hourlyRate ?? record.hourly_rate ?? 0),
      weekly_base_hours: Number(record.weeklyBaseHours ?? record.weekly_base_hours ?? 40),
      status: record.status || 'activo',
      notes: record.notes || '',
      username: record.username ? String(record.username).trim().toLowerCase() : '',
      password: record.password ? String(record.password).trim() : '',
      assigned_role: record.assignedRole || record.assigned_role || 'operaciones',
      system_url: record.systemUrl || record.system_url || 'https://mallaesa.vercel.app/',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'attendance_records') {
    return {
      id: String(record.id),
      employee_id: record.employeeId || record.employee_id || '',
      employee_name: record.employeeName || record.employee_name || '',
      date: record.date || '',
      check_in: record.checkIn || record.check_in || '',
      check_out: record.checkOut || record.check_out || '',
      lunch_minutes: Number(record.lunchMinutes ?? record.lunch_minutes ?? 60),
      status: record.status || 'asistio',
      regular_hours: Number(record.regularHours ?? record.hoursWorked ?? record.regular_hours ?? 8),
      overtime_double_hours: Number(record.overtimeDoubleHours ?? record.overtime_double_hours ?? 0),
      overtime_triple_hours: Number(record.overtimeTripleHours ?? record.overtime_triple_hours ?? 0),
      total_hours: Number(record.totalHours ?? record.total_hours ?? ((record.hoursWorked || 8) + (record.overtimeHours || 0))),
      notes: record.notes || '',
      signed_by_supervisor: record.signedBySupervisor || record.verifiedBy || record.signed_by_supervisor || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'products') {
    return {
      id: String(record.id || record.sku),
      sku: String(record.sku || record.id || '').trim(),
      catalog_type: String(record.catalog_type || 'otros'),
      category: String(record.category || ''),
      subcategory: String(record.subcategory || ''),
      product_name: String(record.product_name || record.productName || ''),
      specifications: String(record.specifications || ''),
      gauge: String(record.gauge || ''),
      dimensions: String(record.dimensions || ''),
      unit: String(record.unit || 'Pza'),
      price_base_sin_iva: Number(record.price_base_sin_iva ?? 0),
      price_base_con_iva: Number(record.price_base_con_iva ?? 0),
      price_public_sin_iva: Number(record.price_public_sin_iva ?? 0),
      price_public_con_iva: Number(record.price_public_con_iva ?? 0),
      notes: String(record.notes || ''),
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'quote_requests') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      client_name: record.clientName || record.client_name || '',
      client_phone: record.clientPhone || record.client_phone || '',
      client_email: record.clientEmail || record.client_email || '',
      project_address: record.projectAddress || record.project_address || '',
      city: record.city || '',
      service_type: record.serviceType || record.service_type || '',
      linear_meters: Number(record.linearMeters ?? record.linear_meters ?? 0),
      height_meters: Number(record.heightMeters ?? record.height_meters ?? 0),
      terrain_type: record.terrainType || record.terrain_type || '',
      notes: record.notes || '',
      photo_url: record.photoUrl || record.photo_url || '',
      status: record.status || 'nuevo',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'formal_quotes') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      request_id: record.requestId || record.request_id || null,
      client_name: record.clientName || record.client_name || '',
      client_phone: record.clientPhone || record.client_phone || '',
      client_email: record.clientEmail || record.client_email || '',
      project_address: record.projectAddress || record.project_address || '',
      city: record.city || '',
      service_type: record.serviceType || record.service_type || '',
      linear_meters: Number(record.linearMeters ?? record.linear_meters ?? 0),
      height_meters: Number(record.heightMeters ?? record.height_meters ?? 0),
      terrain_type: record.terrainType || record.terrain_type || '',
      items: record.items || [],
      raw_materials: record.rawMaterials || record.raw_materials || [],
      raw_materials_cost: Number(record.rawMaterialsCost ?? record.raw_materials_cost ?? 0),
      profit_margin_percent: Number(record.profitMarginPercent ?? record.profit_margin_percent ?? 36.5),
      profit_amount: Number(record.profitAmount ?? record.profit_amount ?? 0),
      subtotal: Number(record.subtotal ?? 0),
      iva: Number(record.iva ?? 0),
      total: Number(record.total ?? 0),
      advance_percent: Number(record.advancePercent ?? record.advance_percent ?? 50),
      balance_percent: Number(record.balancePercent ?? record.balance_percent ?? 50),
      advance50: Number(record.advance50 ?? record.advanceAmount ?? 0),
      balance50: Number(record.balance50 ?? record.balanceAmount ?? 0),
      estimated_work_days: Number(record.estimatedWorkDays ?? record.estimated_work_days ?? 3),
      status: record.status || 'borrador',
      client_signature: record.clientSignature || record.client_signature || null,
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'projects') {
    return {
      id: String(record.id),
      name: record.name || record.projectAddress || (record.clientName ? `Proyecto ${record.clientName}` : 'Proyecto Perimetral'),
      client_name: record.clientName || record.client_name || '',
      client_phone: record.clientPhone || record.client_phone || '',
      client_email: record.clientEmail || record.client_email || '',
      address: record.address || record.projectAddress || '',
      service_type: record.serviceType || record.service_type || '',
      linear_meters: Number(record.linearMeters ?? record.linear_meters ?? 0),
      height_meters: Number(record.heightMeters ?? record.height_meters ?? 0),
      total_amount: Number(record.totalAmount ?? record.total_amount ?? 0),
      advance_amount: Number(record.advanceAmount ?? record.advance_amount ?? 0),
      balance_amount: Number(record.balanceAmount ?? record.balance_amount ?? 0),
      advance_percent: Number(record.advancePercent ?? record.advance_percent ?? 50),
      balance_percent: Number(record.balancePercent ?? record.balance_percent ?? 50),
      advance_paid: Boolean(record.advancePaid ?? record.advance_paid ?? false),
      balance_paid: Boolean(record.balancePaid ?? record.balance_paid ?? false),
      phase: Number(record.phase ?? 1),
      status: record.status || 'activo',
      warranty_pdf_generated: Boolean(record.warrantyPdfGenerated ?? record.warranty_pdf_generated ?? false),
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'work_orders') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      project_id: record.projectId || record.project_id || null,
      crew_id: record.crewId || record.crew_id || null,
      crew_name: record.crewName || record.crew_name || '',
      client_name: record.clientName || record.client_name || '',
      address: record.address || record.projectAddress || '',
      linear_meters: Number(record.linearMeters ?? record.linear_meters ?? 0),
      service_type: record.serviceType || record.service_type || '',
      scheduled_date: record.scheduledDate || record.scheduled_date || '',
      scheduled_time: record.scheduledTime || record.scheduled_time || '',
      status: record.status || 'programada',
      client_signature: record.clientSignature || record.client_signature || null,
      supervisor_signature: record.supervisorSignature || record.supervisor_signature || null,
      before_photos: record.beforePhotos || record.before_photos || [],
      after_photos: record.afterPhotos || record.after_photos || [],
      notes: record.notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'inventory') {
    return {
      id: String(record.id),
      name: record.name || '',
      category: record.category || '',
      unit: record.unit || 'Pza',
      stock: Number(record.stock ?? 0),
      min_stock: Number(record.minStock ?? record.min_stock ?? 0),
      cost: Number(record.cost ?? record.unitCost ?? 0),
      price: Number(record.price ?? record.unitPrice ?? 0),
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'suppliers') {
    return {
      id: String(record.id),
      name: record.commercialName || record.businessName || record.name || 'Proveedor MALLAESA',
      rfc: record.rfc || '',
      contact_person: record.contactName || record.contact_person || '',
      phone: record.phone || '',
      email: record.email || '',
      address: record.address || '',
      credit_days: Number(record.creditDays ?? record.credit_days ?? 0),
      credit_limit: Number(record.creditLimit ?? record.credit_limit ?? 0),
      current_balance: Number(record.currentBalance ?? record.current_balance ?? 0),
      category: record.category || '',
      notes: record.notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'purchase_orders') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      supplier_id: record.supplierId || record.supplier_id || null,
      supplier_name: record.supplierName || record.supplier_name || record.provider || 'Proveedor',
      items: record.items || [],
      subtotal: Number(record.subtotal ?? 0),
      iva: Number(record.iva ?? 0),
      total: Number(record.total ?? 0),
      status: record.status || 'emitida',
      payment_terms: record.paymentTerms || record.payment_terms || '',
      delivery_date: record.deliveryDate || record.delivery_date || '',
      notes: record.notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'accounts_payable') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      supplier_id: record.supplierId || record.supplier_id || null,
      supplier_name: record.supplierName || record.supplier_name || record.provider || 'Proveedor',
      concept: record.concept || '',
      invoice_number: record.invoiceNumber || record.invoice_number || '',
      total_amount: Number(record.totalAmount ?? record.total_amount ?? record.total ?? 0),
      amount_paid: Number(record.amountPaid ?? record.amount_paid ?? 0),
      balance: Number(record.balance ?? ((record.totalAmount ?? record.total ?? 0) - (record.amountPaid ?? 0))),
      due_date: record.dueDate || record.due_date || '',
      status: record.status || 'pendiente',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'simple_receipts') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      client_name: record.clientName || record.client_name || '',
      concept: record.concept || '',
      amount: Number(record.amount ?? 0),
      payment_method: record.paymentMethod || record.payment_method || 'Efectivo',
      notes: record.notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'invoices') {
    return {
      id: String(record.id),
      series_number: record.seriesNumber || record.series_number || record.id || '',
      project_id: record.projectId || record.project_id || null,
      client_name: record.clientName || record.client_name || '',
      client_rfc: record.clientRfc || record.client_rfc || '',
      subtotal: Number(record.subtotal ?? 0),
      iva: Number(record.iva ?? 0),
      total: Number(record.total ?? 0),
      status: record.status || 'timbrada',
      payment_way: record.paymentWay || record.payment_way || 'Transferencia SPEI (03)',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'approvals') {
    return {
      id: String(record.id),
      type: record.type || 'descuento',
      title: record.title || '',
      description: record.description || '',
      requested_by: record.requestedBy || record.requested_by || '',
      status: record.status || 'pendiente',
      discount_percent: Number(record.discountPercent ?? record.discount_percent ?? 0),
      quote_id: record.quoteId || record.quote_id || null,
      director_notes: record.directorNotes || record.director_notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'daily_work_logs') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      project_id: record.projectId || record.project_id || null,
      work_order_folio: record.workOrderFolio || record.work_order_folio || '',
      crew_name: record.crewName || record.crew_name || '',
      date: record.date || '',
      advance_percentage: Number(record.advancePercentage ?? record.advance_percentage ?? 0),
      meters_installed_today: Number(record.metersInstalledToday ?? record.meters_installed_today ?? 0),
      work_performed: record.workPerformed || record.work_performed || '',
      obstacles: record.obstacles || '',
      photo_url: record.photoUrl || record.photo_url || '',
      crew_signature: record.crewSignature || record.crew_signature || '',
      supervisor_signature: record.supervisorSignature || record.supervisor_signature || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'vehicle_logs') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      vehicle_name: record.vehicleName || record.vehicle_name || '',
      plates: record.plates || '',
      driver_name: record.driverName || record.driver_name || '',
      departure_date: record.departureDate || record.departure_date || '',
      departure_time: record.departureTime || record.departure_time || '',
      departure_mileage: Number(record.departureMileage ?? record.departure_mileage ?? 0),
      departure_fuel_level: record.departureFuelLevel || record.departure_fuel_level || '',
      departure_conditions: record.departureConditions || record.departure_conditions || '',
      departure_photo_url: record.departurePhotoUrl || record.departure_photo_url || '',
      departure_signature: record.departureSignature || record.departure_signature || '',
      return_date: record.returnDate || record.return_date || null,
      return_time: record.returnTime || record.return_time || null,
      return_mileage: Number(record.returnMileage ?? record.return_mileage ?? 0),
      return_fuel_level: record.returnFuelLevel || record.return_fuel_level || null,
      return_conditions: record.returnConditions || record.return_conditions || null,
      return_photo_url: record.returnPhotoUrl || record.return_photo_url || null,
      return_signature: record.returnSignature || record.return_signature || null,
      status: record.status || 'en_ruta',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'customer_service_tickets') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      client_name: record.clientName || record.client_name || '',
      client_phone: record.clientPhone || record.client_phone || '',
      client_email: record.clientEmail || record.client_email || '',
      subject: record.subject || '',
      description: record.description || '',
      priority: record.priority || 'normal',
      status: record.status || 'abierto',
      resolution_notes: record.resolutionNotes || record.resolution_notes || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  if (tableName === 'warehouse_movements') {
    return {
      id: String(record.id),
      folio: record.folio || record.id || '',
      type: record.type || 'salida',
      item_name: record.itemName || record.item_name || '',
      quantity: Number(record.quantity ?? 0),
      unit: record.unit || 'Pza',
      reason: record.reason || '',
      authorized_by: record.authorizedBy || record.authorized_by || '',
      date: record.date || '',
      raw_data: record,
      updated_at: new Date().toISOString()
    };
  }

  return {
    id: String(record.id),
    ...record,
    raw_data: record,
    updated_at: new Date().toISOString()
  };
}

/**
 * Guardar o actualizar un registro en Supabase con auto-recuperación ante columnas faltantes en schema cache
 */
export async function saveToSupabase(tableName: string, record: any): Promise<boolean> {
  if (!record || !record.id) return false;

  let payload = formatPayloadForSupabase(tableName, record);

  // Reintentos auto-reparadores si Supabase carece de alguna columna en su tabla remota
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' });
      if (!error) {
        return true;
      }

      console.warn(`[Supabase] Intento ${attempt + 1} en ${tableName}:`, error.message);

      // Si el error es de permisos en PostgreSQL (permission denied / 42501), no tiene sentido reintentar columnas
      if (error.message.includes('permission denied') || error.code === '42501') {
        console.warn(`[Supabase] Permiso denegado al guardar en '${tableName}': requiere ejecutar script GRANT en Supabase SQL Editor.`);
        return false;
      }

      // Detectar nombres de columna faltantes en el schema cache de PostgREST o en PostgreSQL:
      // Ej 1: "Could not find the 'assignedCrew' column of 'employees' in the schema cache"
      // Ej 2: 'column "assigned_crew" of relation "employees" does not exist'
      // Ej 3: "column 'phone' does not exist"
      const match =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column "([^"]+)" (?:of relation )?does not exist/i) ||
        error.message.match(/column '([^']+)' does not exist/i) ||
        error.message.match(/column "([^"]+)" does not exist/i);

      if (match && match[1]) {
        const missingCol = match[1];
        delete payload[missingCol];
        continue;
      }

      // Si el error es por una clave foránea o campo no mapeado y llevamos varios intentos:
      if (attempt >= 8 && tableName !== 'app_users') {
        // Reducir payload a lo elemental: id, code, full_name, status si existen
        payload = {
          id: String(record.id),
          updated_at: new Date().toISOString()
        };
        if (record.fullName || record.full_name) payload.full_name = record.fullName || record.full_name;
        if (record.code) payload.code = record.code;
        if (record.username) payload.username = String(record.username).trim().toLowerCase();
        if (record.password) payload.password = String(record.password).trim();
        continue;
      }

      return false;
    } catch (err: any) {
      console.warn(`[Supabase] Excepción en ${tableName}:`, err.message);
      return false;
    }
  }

  return false;
}

/**
 * Borrar un registro específico de Supabase por ID
 */
export async function deleteFromSupabase(tableName: string, id: string): Promise<boolean> {
  if (!id) return false;
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', String(id));
    if (error) {
      console.warn(`[Supabase] Error al borrar de ${tableName} (ID: ${id}):`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Excepción al borrar de ${tableName}:`, err.message);
    return false;
  }
}

/**
 * Borrar múltiples registros de Supabase por una lista de IDs
 */
export async function deleteMultipleFromSupabase(tableName: string, ids: string[]): Promise<boolean> {
  if (!ids || ids.length === 0) return true;
  try {
    const { error } = await supabase.from(tableName).delete().in('id', ids.map(String));
    if (error) {
      console.warn(`[Supabase] Error al borrar múltiples de ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Excepción al borrar múltiples de ${tableName}:`, err.message);
    return false;
  }
}

/**
 * Vaciar una tabla completa en Supabase (usado para limpiar datos de muestra)
 */
export async function clearTableInSupabase(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).delete().neq('id', '___no_matching_id___');
    if (error) {
      console.warn(`[Supabase] Error al vaciar tabla ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Excepción al vaciar tabla ${tableName}:`, err.message);
    return false;
  }
}

/**
 * Obtener todos los registros de una tabla en Supabase con mapeo seguro a modelos TypeScript
 */
export async function fetchFromSupabase<T = any>(tableName: string): Promise<T[] | null> {
  try {
    let result = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (result.error) {
      // Si la tabla no tiene la columna created_at en Supabase, consultar sin order
      result = await supabase.from(tableName).select('*');
    }
    if (result.error) {
      if (result.error.message.includes('permission denied') || result.error.code === '42501') {
        console.warn(`[Supabase] Permiso pendiente en '${tableName}': requiere ejecutar GRANT en Supabase SQL Editor.`);
      } else {
        console.warn(`[Supabase] Error al consultar tabla ${tableName}:`, result.error.message);
      }
      return null;
    }
    const data = result.data;
    if (!data) return [];

    return data.map((row: any) => {
      const raw = row.raw_data || {};
      if (tableName === 'employees') {
        return {
          ...raw,
          id: row.id,
          code: row.code || raw.code || '',
          fullName: raw.fullName || row.full_name || '',
          curp: row.curp || raw.curp || '',
          rfc: row.rfc || raw.rfc || '',
          nss: row.nss || raw.nss || '',
          phone: row.phone || raw.phone || '',
          email: row.email || raw.email || '',
          address: row.address || raw.address || '',
          birthDate: raw.birthDate || row.birth_date || '',
          bloodType: row.bloodType || raw.blood_type || 'O+',
          emergencyContact: raw.emergencyContact || row.emergency_contact || { name: '', relationship: '', phone: '' },
          jobTitle: raw.jobTitle || row.job_title || '',
          department: raw.department || row.department || 'instalacion_campo',
          assignedCrew: raw.assignedCrew || row.assigned_crew || '',
          hireDate: raw.hireDate || row.hire_date || '',
          dailySalary: Number(raw.dailySalary ?? row.daily_salary ?? 0),
          hourlyRate: Number(raw.hourlyRate ?? row.hourly_rate ?? 0),
          weeklyBaseHours: Number(raw.weeklyBaseHours ?? row.weekly_base_hours ?? 40),
          status: row.status || raw.status || 'activo',
          notes: row.notes || raw.notes || '',
          username: row.username || raw.username || '',
          password: row.password || raw.password || '',
          assignedRole: row.assigned_role || raw.assignedRole || 'operaciones',
          systemUrl: row.system_url || raw.systemUrl || 'https://mallaesa.vercel.app/'
        };
      }
      if (tableName === 'products') {
        return {
          id: row.id,
          sku: row.sku || row.id,
          catalog_type: row.catalog_type || 'otros',
          category: row.category || '',
          subcategory: row.subcategory || '',
          product_name: row.product_name || '',
          specifications: row.specifications || '',
          gauge: row.gauge || '',
          dimensions: row.dimensions || '',
          unit: row.unit || 'Pza',
          price_base_sin_iva: Number(row.price_base_sin_iva ?? 0),
          price_base_con_iva: Number(row.price_base_con_iva ?? 0),
          price_public_sin_iva: Number(row.price_public_sin_iva ?? 0),
          price_public_con_iva: Number(row.price_public_con_iva ?? 0),
          notes: row.notes || '',
          created_at: row.created_at,
          updated_at: row.updated_at,
          ...(row.raw_data || {})
        };
      }
      return (row.raw_data ? { ...row.raw_data, ...row } : row);
    }) as T[];
  } catch {
    return null;
  }
}

/**
 * SCRIPT SQL DDL COMPLETO PARA SUPABASE
 * Incluye tablas, claves primarias, columnas de búsqueda, jsonb completo y políticas RLS.
 */
export const SUPABASE_SQL_SCRIPT = `-- =====================================================================
-- ESQUEMA SQL OFICIAL PARA MALLAESA EN SUPABASE POSTGRESQL
-- Proyecto: mallaesa@grupoinmobiliariamr.com's Project
-- ID de Proyecto: uivyldmrbdwvbagsakij
-- =====================================================================

-- 0. USUARIOS & CREDENCIALES DE ACCESO AL SISTEMA
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'administracion',
    phone TEXT,
    status TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar columnas si la tabla app_users ya existía previamente en Supabase
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'operaciones';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'activo';
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Insertar las credenciales oficiales de acceso
INSERT INTO public.app_users (id, username, password, full_name, role, status)
VALUES 
    ('usr-haroldo90', 'haroldo90', 'Chevropar#1970', 'Haroldo (Administración General)', 'administracion', 'activo'),
    ('usr-eduardo-siller', 'eduardo_siller', 'Chevropar#1970', 'Ing. Eduardo Siller (Dirección General)', 'director', 'activo')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 1. CONFIGURACIÓN DEL SISTEMA & ESTADO DE DATOS DE MUESTRA
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    sample_data_cleared BOOLEAN DEFAULT FALSE,
    weekly_hours_limit NUMERIC DEFAULT 40,
    director_target_margin NUMERIC DEFAULT 36.5,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXPEDIENTES DE EMPLEADOS & DATOS PERSONALES
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    code TEXT,
    full_name TEXT NOT NULL,
    curp TEXT,
    rfc TEXT,
    nss TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    birth_date TEXT,
    blood_type TEXT,
    emergency_contact JSONB,
    job_title TEXT,
    department TEXT,
    assigned_crew TEXT,
    hire_date TEXT,
    daily_salary NUMERIC DEFAULT 0,
    hourly_rate NUMERIC DEFAULT 0,
    weekly_base_hours NUMERIC DEFAULT 40,
    status TEXT DEFAULT 'activo',
    notes TEXT,
    username TEXT,
    password TEXT,
    assigned_role TEXT DEFAULT 'operaciones',
    system_url TEXT DEFAULT 'https://mallaesa.vercel.app/',
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurar todas las columnas si la tabla employees ya existía previamente en Supabase
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS curp TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS rfc TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS nss TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS assigned_crew TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hire_date TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS daily_salary NUMERIC DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS weekly_base_hours NUMERIC DEFAULT 40;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'activo';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS assigned_role TEXT DEFAULT 'operaciones';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS system_url TEXT DEFAULT 'https://mallaesa.vercel.app/';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS raw_data JSONB;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. CONTROL DE ASISTENCIA & HORAS EXTRAS (LEY 40 HORAS)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    employee_name TEXT,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    lunch_minutes NUMERIC DEFAULT 60,
    status TEXT DEFAULT 'asistio',
    regular_hours NUMERIC DEFAULT 8,
    overtime_double_hours NUMERIC DEFAULT 0,
    overtime_triple_hours NUMERIC DEFAULT 0,
    total_hours NUMERIC DEFAULT 8,
    notes TEXT,
    signed_by_supervisor TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SOLICITUDES DE COTIZACIÓN (CRM Y CLIENTES)
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id TEXT PRIMARY KEY,
    folio TEXT,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    project_address TEXT,
    city TEXT,
    service_type TEXT,
    linear_meters NUMERIC DEFAULT 0,
    height_meters NUMERIC DEFAULT 0,
    terrain_type TEXT,
    notes TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'nuevo',
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COTIZACIONES FORMALES E INTELIGENTES
CREATE TABLE IF NOT EXISTS public.formal_quotes (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    request_id TEXT,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    project_address TEXT,
    city TEXT,
    service_type TEXT,
    linear_meters NUMERIC DEFAULT 0,
    height_meters NUMERIC DEFAULT 0,
    terrain_type TEXT,
    items JSONB,
    raw_materials JSONB,
    raw_materials_cost NUMERIC DEFAULT 0,
    profit_margin_percent NUMERIC DEFAULT 36.5,
    profit_amount NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    iva NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    advance_percent NUMERIC DEFAULT 50,
    balance_percent NUMERIC DEFAULT 50,
    advance50 NUMERIC DEFAULT 0,
    balance50 NUMERIC DEFAULT 0,
    estimated_work_days NUMERIC DEFAULT 3,
    status TEXT DEFAULT 'borrador',
    client_signature TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROYECTOS & OBRAS PERIMETRALES
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    address TEXT,
    service_type TEXT,
    linear_meters NUMERIC DEFAULT 0,
    height_meters NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    advance_amount NUMERIC DEFAULT 0,
    balance_amount NUMERIC DEFAULT 0,
    advance_percent NUMERIC DEFAULT 50,
    balance_percent NUMERIC DEFAULT 50,
    advance_paid BOOLEAN DEFAULT FALSE,
    balance_paid BOOLEAN DEFAULT FALSE,
    phase NUMERIC DEFAULT 1,
    status TEXT DEFAULT 'activo',
    warranty_pdf_generated BOOLEAN DEFAULT FALSE,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ÓRDENES DE TRABAJO (OT)
CREATE TABLE IF NOT EXISTS public.work_orders (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    project_id TEXT,
    crew_id TEXT,
    crew_name TEXT,
    client_name TEXT,
    address TEXT,
    linear_meters NUMERIC DEFAULT 0,
    service_type TEXT,
    scheduled_date TEXT,
    scheduled_time TEXT,
    status TEXT DEFAULT 'programada',
    client_signature TEXT,
    supervisor_signature TEXT,
    before_photos JSONB,
    after_photos JSONB,
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVENTARIO & STOCK DE MATERIALES
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    stock NUMERIC DEFAULT 0,
    min_stock NUMERIC DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    price NUMERIC DEFAULT 0,
    raw_data JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CATÁLOGO DE PROVEEDORES
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rfc TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    credit_days NUMERIC DEFAULT 0,
    credit_limit NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,
    category TEXT,
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ÓRDENES DE COMPRA (OC)
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    supplier_id TEXT,
    supplier_name TEXT,
    items JSONB,
    subtotal NUMERIC DEFAULT 0,
    iva NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'emitida',
    payment_terms TEXT,
    delivery_date TEXT,
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CUENTAS POR PAGAR (CxP)
CREATE TABLE IF NOT EXISTS public.accounts_payable (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    supplier_id TEXT,
    supplier_name TEXT,
    concept TEXT,
    invoice_number TEXT,
    total_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    due_date TEXT,
    status TEXT DEFAULT 'pendiente',
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RECIBOS SIMPLES (SIN FACTURA)
CREATE TABLE IF NOT EXISTS public.simple_receipts (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    client_name TEXT NOT NULL,
    concept TEXT,
    amount NUMERIC DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FACTURAS FISCALES CFDI 4.0
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    series_number TEXT NOT NULL,
    project_id TEXT,
    client_name TEXT,
    client_rfc TEXT,
    subtotal NUMERIC DEFAULT 0,
    iva NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'timbrada',
    payment_way TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. APROBACIONES DE DIRECCIÓN
CREATE TABLE IF NOT EXISTS public.approvals (
    id TEXT PRIMARY KEY,
    type TEXT,
    title TEXT,
    description TEXT,
    requested_by TEXT,
    status TEXT DEFAULT 'pendiente',
    discount_percent NUMERIC DEFAULT 0,
    quote_id TEXT,
    director_notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. AVANCES DIARIOS DE CUADRILLAS (CON FIRMAS)
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    project_id TEXT,
    work_order_folio TEXT,
    crew_name TEXT,
    date TEXT,
    advance_percentage NUMERIC DEFAULT 0,
    meters_installed_today NUMERIC DEFAULT 0,
    work_performed TEXT,
    obstacles TEXT,
    photo_url TEXT,
    crew_signature TEXT,
    supervisor_signature TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CONTROL VEHICULAR & CHECKLISTS DE FLOTILLA
CREATE TABLE IF NOT EXISTS public.vehicle_logs (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    vehicle_name TEXT,
    plates TEXT,
    driver_name TEXT,
    departure_date TEXT,
    departure_time TEXT,
    departure_mileage NUMERIC DEFAULT 0,
    departure_fuel_level TEXT,
    departure_conditions TEXT,
    departure_photo_url TEXT,
    departure_signature TEXT,
    return_date TEXT,
    return_time TEXT,
    return_mileage NUMERIC DEFAULT 0,
    return_fuel_level TEXT,
    return_conditions TEXT,
    return_photo_url TEXT,
    return_signature TEXT,
    status TEXT DEFAULT 'en_ruta',
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. TICKETS DE ATENCIÓN A CLIENTES
CREATE TABLE IF NOT EXISTS public.customer_service_tickets (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    subject TEXT,
    description TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'abierto',
    resolution_notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MOVIMIENTOS DE ALMACÉN
CREATE TABLE IF NOT EXISTS public.warehouse_movements (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    type TEXT,
    item_name TEXT,
    quantity NUMERIC DEFAULT 0,
    unit TEXT,
    reason TEXT,
    authorized_by TEXT,
    date TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. CATÁLOGO OFICIAL DE PRODUCTOS Y PRECIOS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE,
    catalog_type TEXT,
    category TEXT,
    subcategory TEXT,
    product_name TEXT,
    specifications TEXT,
    gauge TEXT,
    dimensions TEXT,
    unit TEXT DEFAULT 'Pza',
    price_base_sin_iva NUMERIC DEFAULT 0,
    price_base_con_iva NUMERIC DEFAULT 0,
    price_public_sin_iva NUMERIC DEFAULT 0,
    price_public_con_iva NUMERIC DEFAULT 0,
    notes TEXT,
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_catalog_type ON public.products(catalog_type);

-- =====================================================================
-- HABILITACIÓN DE PRIVILEGIOS POSTGRESQL (GRANT ALL) Y ROW LEVEL SECURITY (RLS)
-- Resuelve: "permission denied for table ..."
-- =====================================================================

-- 1. Conceder uso del esquema public a anon, authenticated y service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Conceder permisos de lectura y escritura en todas las tablas y secuencias
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Permisos automáticos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. Habilitar RLS con políticas de acceso total para anon y authenticated
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'app_users', 'app_settings', 'employees', 'attendance_records', 'quote_requests', 
            'formal_quotes', 'projects', 'work_orders', 'inventory', 'suppliers', 
            'purchase_orders', 'accounts_payable', 'simple_receipts', 'invoices', 
            'approvals', 'daily_work_logs', 'vehicle_logs', 'customer_service_tickets', 
            'warehouse_movements', 'products'
        )
    LOOP
        EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role;', tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Anon Permiso Total" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Anon Permiso Total" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Auth Permiso Total" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Auth Permiso Total" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

-- Registro de configuración inicial
INSERT INTO public.app_settings (id, sample_data_cleared, weekly_hours_limit, director_target_margin)
VALUES ('global', false, 40, 36.5)
ON CONFLICT (id) DO NOTHING;
`;

/**
 * SCRIPT SQL ESPECÍFICO PARA CORREGIR "permission denied for table ..."
 * Concede permisos de lectura, escritura y RLS al rol anon en Supabase.
 */
export const SUPABASE_FIX_PERMISSIONS_SQL = `-- =====================================================================
-- REPARACIÓN RÁPIDA DE PERMISOS POSTGRESQL PARA MALLAESA
-- Resuelve el error: "permission denied for table ..."
-- =====================================================================

-- 1. Dar acceso al esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Conceder todos los permisos en tablas, secuencias y funciones
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Configurar permisos automáticos a futuro
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. Habilitar RLS y políticas abiertas para lectura/escritura pública
DO $$ 
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role;', tbl);
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Anon Permiso Total" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Anon Permiso Total" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Auth Permiso Total" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Auth Permiso Total" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;
`;
