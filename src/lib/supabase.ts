import { createClient } from '@supabase/supabase-js';

// Supabase project credentials for MALLAESA
// Project Name: mallaesa@grupoinmobiliariamr.com's Project
// Project ID: uivyldmrbdwvbagsakij
const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://uivyldmrbdwvbagsakij.supabase.co';
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_qqwHMZcX_rjnAaLvTqeTwA_nDc7g1yi';
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
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // Intentamos consultar la tabla de app_settings o hacer una llamada básica
    const { data, error } = await supabase.from('app_settings').select('*').limit(1);
    if (error) {
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
      message: 'Conexión exitosa y tablas detectadas en Supabase.',
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
 * Guardar o actualizar un registro en Supabase con payload completo y raw_data
 */
export async function saveToSupabase(tableName: string, record: any): Promise<boolean> {
  if (!record || !record.id) return false;
  try {
    const payload = {
      id: String(record.id),
      ...record,
      raw_data: record,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from(tableName).upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase] Error al guardar en ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase] Excepción al guardar en ${tableName}:`, err.message);
    return false;
  }
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
 * Obtener todos los registros de una tabla en Supabase
 */
export async function fetchFromSupabase<T = any>(tableName: string): Promise<T[] | null> {
  try {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (error) {
      return null;
    }
    if (!data) return [];
    // Si viene con raw_data, restaurar el objeto original con todos los campos tipados
    return data.map((row: any) => (row.raw_data ? { ...row.raw_data, ...row } : row)) as T[];
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
    status TEXT DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- =====================================================================
-- HABILITACIÓN DE ROW LEVEL SECURITY (RLS) Y POLÍTICAS DE PERMISO
-- Permite lectura, guardado y borrado mediante la clave pública (anon)
-- =====================================================================

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
            'warehouse_movements'
        )
    LOOP
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
