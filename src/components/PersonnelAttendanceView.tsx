import React, { useState, useMemo } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { Employee, AttendanceRecord, AttendanceStatus, EmployeeDepartment } from '../types';
import confetti from 'canvas-confetti';
import {
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  DollarSign,
  FileText,
  Printer,
  ShieldCheck,
  Edit2,
  Trash2,
  ChevronRight,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Heart,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sliders,
  Check,
  X,
  Key,
  Copy,
  Share2,
  ExternalLink,
  RefreshCw,
  Lock
} from 'lucide-react';

interface PersonnelAttendanceViewProps {
  onGoToPayroll?: () => void;
}

export const PersonnelAttendanceView: React.FC<PersonnelAttendanceViewProps> = ({ onGoToPayroll }) => {
  const {
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
    calculateWeeklyLaborSummary
  } = useMallaesa();

  // Sub-pestañas activas del módulo
  const [activeTab, setActiveTab] = useState<'asistencia' | 'horas_extras' | 'expedientes' | 'liquidacion'>('asistencia');

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('todos');

  // Fecha seleccionada para checador diario (default hoy)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Modal para Nuevo/Editar Empleado
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Formulario de empleado
  const [empForm, setEmpForm] = useState<Omit<Employee, 'id'>>({
    code: '',
    fullName: '',
    curp: '',
    rfc: '',
    nss: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    bloodType: 'O+',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    jobTitle: 'Instalador de Cercas Perimetrales',
    department: 'instalacion_campo',
    assignedCrew: 'Cuadrilla Alfa',
    hireDate: new Date().toISOString().split('T')[0],
    dailySalary: 500,
    hourlyRate: 62.50,
    weeklyBaseHours: 40,
    status: 'activo',
    notes: '',
    username: '',
    password: '',
    assignedRole: 'operaciones',
    systemUrl: 'https://mallaesa.vercel.app/'
  });

  // Generador de contraseñas seguras aleatorias
  const generateRandomPassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    setEmpForm(prev => ({ ...prev, password: `Mallaesa#${randomPin}` }));
  };

  // Compartir accesos por WhatsApp
  const handleShareEmployeeAccessWhatsApp = (emp: Employee) => {
    const roleLabels: Record<string, string> = {
      operaciones: 'Operaciones en Campo (OTs & Cuadrillas)',
      ventas: 'Ventas & CRM de Prospectos',
      administracion: 'Administración y Finanzas',
      director: 'Dirección General',
      cotizador: 'Cotizador & Catálogo Oficial',
      cliente: 'Portal Cliente'
    };

    const roleName = emp.assignedRole ? (roleLabels[emp.assignedRole] || emp.assignedRole) : 'Operaciones en Campo';
    const systemLink = emp.systemUrl || 'https://mallaesa.vercel.app/';
    const userAccess = emp.username || emp.code.toLowerCase().replace('-', '_');
    const passAccess = emp.password || 'Mallaesa#2026';

    const message = 
`🔒 *ACCESOS AL SISTEMA OPERATIVO MALLAESA* 🔒

¡Hola, *${emp.fullName}*! Te compartimos tus credenciales de acceso para la plataforma operativa de MALLAESA:

🌐 *Link del Sistema:* ${systemLink}
👤 *Usuario:* ${userAccess}
🔑 *Contraseña:* ${passAccess}
🏷️ *Rol Asignado:* ${roleName}
📌 *Puesto:* ${emp.jobTitle}

📲 *Instrucciones:*
1. Ingresa al enlace: ${systemLink}
2. Si estás en la pantalla de bienvenida, da clic en "Acceso con Contraseña" o ingresa directamente con tus credenciales.
3. Desde tu módulo podrás registrar tu asistencia, consultar órdenes de trabajo y reportar avances.

_MALLAESA Seguridad Perimetral • Soporte Operativo_`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = (emp.phone || '').replace(/\D/g, '');
    let waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    if (cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
      waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    }

    window.open(waUrl, '_blank');
  };

  // Copiar credenciales al portapapeles
  const handleCopyCredentials = (emp: Employee) => {
    const roleLabels: Record<string, string> = {
      operaciones: 'Operaciones en Campo',
      ventas: 'Ventas y CRM',
      administracion: 'Administración y Finanzas',
      director: 'Dirección General',
      cotizador: 'Cotizador',
      cliente: 'Portal Cliente'
    };
    const roleName = emp.assignedRole ? (roleLabels[emp.assignedRole] || emp.assignedRole) : 'Operaciones';
    const systemLink = emp.systemUrl || 'https://mallaesa.vercel.app/';
    const userAccess = emp.username || emp.code.toLowerCase().replace('-', '_');
    const passAccess = emp.password || 'Mallaesa#2026';

    const textToCopy = `SISTEMA MALLAESA\nLink: ${systemLink}\nUsuario: ${userAccess}\nContraseña: ${passAccess}\nRol: ${roleName}\nEmpleado: ${emp.fullName}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      alert(`¡Credenciales de ${emp.fullName} copiadas con éxito!\n\nLink: ${systemLink}\nUsuario: ${userAccess}\nContraseña: ${passAccess}`);
    } else {
      alert(textToCopy);
    }
  };

  // Resumen calculado semanal de LFT 40h
  const weeklySummaries = useMemo(() => {
    return calculateWeeklyLaborSummary();
  }, [employees, attendanceRecords, weeklyHoursLimit]);

  // Totales globales para KPIs
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'activo').length;
  const totalOvertimeHoursWeek = weeklySummaries.reduce((sum, s) => sum + s.overtimeDoubleHours + s.overtimeTripleHours, 0);
  const totalOvertimeCostWeek = weeklySummaries.reduce((sum, s) => sum + s.totalOvertimePay, 0);
  const totalGrossPayrollWeek = weeklySummaries.reduce((sum, s) => sum + s.totalWeeklyGrossPay, 0);
  const employeesOverLimitCount = weeklySummaries.filter(s => s.lftComplianceStatus === 'alerta_exceso_lft').length;

  // Filtrado de empleados en expedientes
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.curp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'todos' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Registros de asistencia del día seleccionado
  const dateAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.filter(r => r.date === selectedDate).forEach(rec => {
      map.set(rec.employeeId, rec);
    });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Abrir modal de nuevo empleado
  const handleOpenNewEmployee = () => {
    setEditingEmployeeId(null);
    const nextNum = employees.length + 1;
    const code = `EMP-${String(nextNum).padStart(3, '0')}`;
    const autoUsername = `empleado_${code.toLowerCase().replace('-', '')}`;
    setEmpForm({
      code,
      fullName: '',
      curp: '',
      rfc: '',
      nss: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '1990-01-01',
      bloodType: 'O+',
      emergencyContact: {
        name: '',
        relationship: 'Esposa / Familiar',
        phone: ''
      },
      jobTitle: 'Instalador de Cercas',
      department: 'instalacion_campo',
      assignedCrew: 'Cuadrilla Alfa',
      hireDate: new Date().toISOString().split('T')[0],
      dailySalary: 550,
      hourlyRate: 68.75,
      weeklyBaseHours: weeklyHoursLimit || 40,
      status: 'activo',
      notes: '',
      username: autoUsername,
      password: 'Mallaesa#2026',
      assignedRole: 'operaciones',
      systemUrl: 'https://mallaesa.vercel.app/'
    });
    setIsEmployeeModalOpen(true);
  };

  // Abrir modal para editar empleado
  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setEmpForm({
      code: emp.code,
      fullName: emp.fullName,
      curp: emp.curp,
      rfc: emp.rfc,
      nss: emp.nss,
      phone: emp.phone,
      email: emp.email || '',
      address: emp.address,
      birthDate: emp.birthDate || '',
      bloodType: emp.bloodType || 'O+',
      emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' },
      jobTitle: emp.jobTitle,
      department: emp.department,
      assignedCrew: emp.assignedCrew || '',
      hireDate: emp.hireDate,
      dailySalary: emp.dailySalary,
      hourlyRate: emp.hourlyRate,
      weeklyBaseHours: emp.weeklyBaseHours || 40,
      status: emp.status,
      notes: emp.notes || '',
      username: emp.username || emp.code.toLowerCase().replace('-', '_'),
      password: emp.password || 'Mallaesa#2026',
      assignedRole: emp.assignedRole || 'operaciones',
      systemUrl: emp.systemUrl || 'https://mallaesa.vercel.app/'
    });
    setIsEmployeeModalOpen(true);
  };

  // Guardar empleado
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.fullName.trim()) {
      alert('Por favor ingresa el nombre completo del trabajador.');
      return;
    }

    const calculatedHourly = Number((empForm.dailySalary / 8).toFixed(2));
    const payload = {
      ...empForm,
      hourlyRate: calculatedHourly
    };

    if (editingEmployeeId) {
      updateEmployee(editingEmployeeId, payload);
      alert('¡Expediente de personal actualizado correctamente!');
    } else {
      addEmployee(payload);
      try { confetti({ particleCount: 50, spread: 60 }); } catch {}
      alert(`¡Empleado ${payload.code} registrado exitosamente en el sistema!`);
    }
    setIsEmployeeModalOpen(false);
  };

  // Guardar o actualizar registro de asistencia diario para un empleado
  const handleSaveAttendanceRow = (employee: Employee, checkIn: string, checkOut: string, lunchMinutes: number, status: AttendanceStatus, location: string, notes: string) => {
    const existing = dateAttendanceMap.get(employee.id);

    if (existing) {
      updateAttendance(existing.id, {
        checkIn,
        checkOut,
        lunchMinutes,
        status,
        locationOrProject: location,
        notes
      });
    } else {
      recordAttendance({
        employeeId: employee.id,
        employeeName: employee.fullName,
        date: selectedDate,
        checkIn,
        checkOut,
        lunchMinutes,
        hoursWorked: 0, // Se calcula internamente en el context
        overtimeHours: 0,
        status,
        locationOrProject: location || employee.assignedCrew || 'Almacén / Obra',
        notes,
        verifiedBy: 'Administración Mallaesa'
      });
    }
  };

  // Pase de lista masivo: Marcar a todos como Presentes a las 08:00 AM con 1 clic
  const handleQuickMarkAllPresent = () => {
    let count = 0;
    employees.filter(e => e.status === 'activo').forEach(emp => {
      if (!dateAttendanceMap.has(emp.id)) {
        recordAttendance({
          employeeId: emp.id,
          employeeName: emp.fullName,
          date: selectedDate,
          checkIn: '08:00',
          checkOut: '17:00',
          lunchMinutes: 60,
          hoursWorked: 8.0,
          overtimeHours: 0.0,
          status: 'presente',
          locationOrProject: emp.assignedCrew || 'Base Mallaesa',
          notes: 'Registro puntual de inicio de jornada',
          verifiedBy: 'Pase de Lista Automático'
        });
        count++;
      }
    });

    try { confetti({ particleCount: 70, spread: 70 }); } catch {}
    alert(`¡Pase de lista completado! Se registraron ${count} empleados como presentes a las 08:00 AM para la fecha ${selectedDate}.`);
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          CABECERA & BANNER NORMATIVO LEY 40 HORAS (MÉXICO)
         ======================================================== */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Capital Humano & Relaciones Laborales
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Reforma Laboral LFT: {weeklyHoursLimit} Horas
            </span>
          </div>
          <h1 className="text-2xl font-bold text-black mt-1">
            Control de Personal, Asistencia & Horas Extras
          </h1>
          <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
            Gestión integral de expedientes personales (NSS, CURP, RFC, Salario Diario), control biométrico/checador de entrada y salida, cálculo de horas ordinarias vs horas extras dobles y triples conforme a los <strong>Arts. 67 y 68 de la Ley Federal del Trabajo</strong>.
          </p>
        </div>

        {/* Selector de Límite Semanal de Jornada (40h vs 48h) */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#898A82]" />
              Jornada Base Semanal:
            </span>
            <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setWeeklyHoursLimit(40)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  weeklyHoursLimit === 40 ? 'bg-black text-white shadow-xs' : 'text-stone-600 hover:text-black'
                }`}
              >
                40 Horas (Nueva Ley)
              </button>
              <button
                type="button"
                onClick={() => setWeeklyHoursLimit(48)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  weeklyHoursLimit === 48 ? 'bg-black text-white shadow-xs' : 'text-stone-600 hover:text-black'
                }`}
              >
                48 Horas (Esquema Previo)
              </button>
            </div>
          </div>
          <span className="text-[10px] text-stone-500">
            {weeklyHoursLimit === 40
              ? 'Tope legal: Horas extras aplican a partir de la hora 40.01 semanal.'
              : 'Horas extras aplican a partir de la hora 48.01 semanal.'}
          </span>
        </div>
      </div>

      {/* ========================================================
          TARJETAS DE KPIS LABORALES & CUMPLIMIENTO
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Plantilla Total</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">{totalEmployees}</div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
            {activeEmployees} activos en nómina
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Asistencia Hoy</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {dateAttendanceMap.size} <span className="text-xs font-normal text-stone-500">/ {activeEmployees}</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5 truncate">
            {selectedDate}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Horas Extras Semana</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {totalOvertimeHoursWeek.toFixed(1)} <span className="text-xs font-normal text-stone-500">hrs</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
            Acumuladas en plantilla
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Costo Horas Extras</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-black truncate">
            ${totalOvertimeCostWeek.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
            Dobles y triples
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dispersión Nómina</span>
            <FileText className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-black truncate">
            ${(totalGrossPayrollWeek / 1000).toFixed(1)}k <span className="text-xs font-normal text-stone-500">MXN</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
            Sueldo + extras + viáticos
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Semáforo LFT 40h</span>
            <AlertTriangle className={`w-4 h-4 ${employeesOverLimitCount > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-black">
            {employeesOverLimitCount === 0 ? (
              <span className="text-emerald-700 text-lg sm:text-xl font-bold flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 100% Legal
              </span>
            ) : (
              <span className="text-red-700 text-lg sm:text-xl font-bold">
                {employeesOverLimitCount} en Alerta
              </span>
            )}
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-0.5">
            Riesgo de fatiga / STPS
          </div>
        </div>
      </div>

      {/* ========================================================
          BARRA DE PESTAÑAS DE TRABAJO
         ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'asistencia', label: '1. Checador & Asistencia Diaria', icon: <Clock className="w-4 h-4 text-emerald-600" /> },
          { id: 'horas_extras', label: `2. Monitor Horas Extras (Ley 40h)`, icon: <TrendingUp className="w-4 h-4 text-blue-600" /> },
          { id: 'expedientes', label: `3. Expedientes de Empleados (${employees.length})`, icon: <Users className="w-4 h-4 text-purple-600" /> },
          { id: 'liquidacion', label: '4. Resumen Semanal & Recibo Imprimible', icon: <FileText className="w-4 h-4 text-amber-600" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-black'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          PESTAÑA 1: CHECADOR & ASISTENCIA DIARIA
         ======================================================== */}
      {activeTab === 'asistencia' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Seleccionar Fecha de Registro:
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#898A82] absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-black focus:outline-hidden focus:border-black"
                  />
                </div>
              </div>
              <span className="text-xs text-stone-500 font-semibold mt-4 hidden md:inline">
                Mostrando {employees.filter(e => e.status === 'activo').length} trabajadores activos
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleQuickMarkAllPresent}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pase de Lista Rápido (Todos 08:00 AM)</span>
              </button>
            </div>
          </div>

          {/* Tabla de Asistencia Diaria */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Empleado & Puesto</th>
                    <th className="py-3 px-3">Estatus</th>
                    <th className="py-3 px-3">Entrada</th>
                    <th className="py-3 px-3">Comida (min)</th>
                    <th className="py-3 px-3">Salida</th>
                    <th className="py-3 px-3 text-center">Horas Laboradas</th>
                    <th className="py-3 px-3 text-center">Horas Extras (&gt;8h)</th>
                    <th className="py-3 px-4">Obra / Ubicación</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {employees.filter(e => e.status === 'activo').map((emp) => {
                    const record = dateAttendanceMap.get(emp.id);
                    const defaultIn = record?.checkIn || '08:00';
                    const defaultOut = record?.checkOut || '17:00';
                    const defaultLunch = record?.lunchMinutes !== undefined ? record.lunchMinutes : 60;
                    const defaultStatus: AttendanceStatus = record?.status || 'presente';
                    const defaultLocation = record?.locationOrProject || emp.assignedCrew || 'Obra Monterrey';
                    const defaultNotes = record?.notes || '';

                    return (
                      <AttendanceRowItem
                        key={emp.id}
                        employee={emp}
                        record={record}
                        defaultIn={defaultIn}
                        defaultOut={defaultOut}
                        defaultLunch={defaultLunch}
                        defaultStatus={defaultStatus}
                        defaultLocation={defaultLocation}
                        defaultNotes={defaultNotes}
                        onSave={(inTime, outTime, lunch, status, loc, notes) => {
                          handleSaveAttendanceRow(emp, inTime, outTime, lunch, status, loc, notes);
                        }}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: MONITOR DE HORAS EXTRAS & LEY 40 HORAS (LFT)
         ======================================================== */}
      {activeTab === 'horas_extras' && (
        <div className="space-y-6">
          {/* Explicación Normativa de la LFT */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                  Reglas de la Reforma Laboral de 40 Horas y Artículos 67 y 68 de la Ley Federal del Trabajo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-xs text-amber-950">
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60">
                    <span className="font-bold block text-black">1. Jornada Legal Base:</span>
                    Jornada ordinaria de <strong>{weeklyHoursLimit} horas semanales</strong>. Toda hora trabajada adicional se computa como extraordinaria.
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60">
                    <span className="font-bold block text-emerald-800">2. Horas Extras Dobles (+100%):</span>
                    Las primeras <strong>9 horas extras en la semana</strong> (hasta 3 horas diarias en máx. 3 días) se pagan al <strong>200% del valor hora</strong> (Art. 67 LFT).
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60">
                    <span className="font-bold block text-red-800">3. Horas Extras Triples (+200%):</span>
                    Todo tiempo extraordinario que <strong>exceda las 9 horas semanales</strong> se paga al <strong>300% del valor hora</strong> (Art. 68 LFT).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Desglose de Horas Extras y Semáforo */}
          <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-black">
                Desglose Acumulado por Trabajador (Semana Vigente)
              </h3>
              <span className="text-xs text-stone-500 font-semibold">
                Tope Base: <strong>{weeklyHoursLimit} hrs ordinarias</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Trabajador & Puesto</th>
                    <th className="py-3 px-3 text-center">Días Laborados</th>
                    <th className="py-3 px-3 text-right">Tarifa x Hora</th>
                    <th className="py-3 px-3 text-center font-bold">Total Horas Semanales</th>
                    <th className="py-3 px-3 text-center">Horas Ordinarias</th>
                    <th className="py-3 px-3 text-center text-emerald-700 font-bold">Horas Dobles (≤9h)</th>
                    <th className="py-3 px-3 text-center text-red-700 font-bold">Horas Triples (&gt;9h)</th>
                    <th className="py-3 px-3 text-right font-bold">Total Pagar Extras</th>
                    <th className="py-3 px-4 text-center">Estatus Reforma LFT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {weeklySummaries.map((summary) => {
                    const emp = employees.find(e => e.id === summary.employeeId);
                    return (
                      <tr key={summary.employeeId} className="hover:bg-stone-50/60">
                        <td className="py-3 px-4">
                          <div className="font-bold text-black">{summary.employeeName}</div>
                          <div className="text-[11px] text-stone-500">{summary.jobTitle} • {emp?.code}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-black">
                          {summary.daysWorkedCount} días
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-stone-700">
                          ${summary.hourlyRate.toFixed(2)}/h
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-black font-mono text-sm bg-stone-50/50">
                          {summary.totalHoursWorked.toFixed(2)} hrs
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-stone-600">
                          {summary.regularHours.toFixed(2)} hrs
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {summary.overtimeDoubleHours > 0 ? `${summary.overtimeDoubleHours.toFixed(2)} hrs` : '-'}
                          {summary.overtimeDoubleHours > 0 && (
                            <span className="block text-[10px] font-normal text-emerald-600">
                              (+${summary.overtimeDoublePay.toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-red-700">
                          {summary.overtimeTripleHours > 0 ? `${summary.overtimeTripleHours.toFixed(2)} hrs` : '-'}
                          {summary.overtimeTripleHours > 0 && (
                            <span className="block text-[10px] font-normal text-red-600">
                              (+${summary.overtimeTriplePay.toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-black font-mono text-sm">
                          ${summary.totalOvertimePay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {summary.lftComplianceStatus === 'optimo' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Jornada Legal (≤{weeklyHoursLimit}h)
                            </span>
                          )}
                          {summary.lftComplianceStatus === 'moderado_horas_extras' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> En Rango Legal Extras (≤9h)
                            </span>
                          )}
                          {summary.lftComplianceStatus === 'alerta_exceso_lft' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
                              <AlertTriangle className="w-3.5 h-3.5" /> Alerta Exceso LFT (&gt;9h extras)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 3: EXPEDIENTES DE EMPLEADOS (DATOS PERSONALES)
         ======================================================== */}
      {activeTab === 'expedientes' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, código, CURP, RFC o puesto..."
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-black"
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="py-2 px-3 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700"
              >
                <option value="todos">Todos los Departamentos</option>
                <option value="instalacion_campo">Instalación en Campo</option>
                <option value="taller_herreria">Taller de Herrería</option>
                <option value="almacen_logistica">Almacén y Logística</option>
                <option value="chofer_transporte">Choferes y Transporte</option>
                <option value="administracion_ventas">Administración y Ventas</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenNewEmployee}
              className="px-4 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Alta de Nuevo Empleado</span>
            </button>
          </div>

          {/* Listado de Tarjetas de Expedientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs hover:border-black transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center font-bold text-xs text-black">
                        {emp.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">
                            {emp.code}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                            {emp.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-black mt-0.5">{emp.fullName}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-md transition"
                        title="Editar expediente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Deseas eliminar el expediente de ${emp.fullName}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Datos Laborales y Fiscales */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Puesto:</span>
                      <span className="font-semibold text-black text-right">{emp.jobTitle}</span>
                    </div>

                    {emp.assignedCrew && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Cuadrilla:</span>
                        <span className="font-semibold text-[#898A82] text-right">{emp.assignedCrew}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-1 border-t border-stone-100 font-mono text-[11px]">
                      <span className="text-stone-500">CURP:</span>
                      <span className="font-bold text-black">{emp.curp}</span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-stone-500">RFC:</span>
                      <span className="font-bold text-black">{emp.rfc}</span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-stone-500">NSS (IMSS):</span>
                      <span className="font-bold text-emerald-700">{emp.nss}</span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-stone-100">
                      <span className="text-stone-500">Salario Diario:</span>
                      <span className="font-bold text-black">${emp.dailySalary.toFixed(2)} MXN</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-stone-500">Tarifa x Hora:</span>
                      <span className="font-mono font-semibold text-stone-700">${emp.hourlyRate.toFixed(2)}/h</span>
                    </div>

                    {emp.emergencyContact?.name && (
                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] mt-2">
                        <span className="font-bold text-stone-700 block flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" /> Contacto de Emergencia:
                        </span>
                        <div className="text-stone-600 mt-0.5">
                          {emp.emergencyContact.name} ({emp.emergencyContact.relationship}) • {emp.emergencyContact.phone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acceso al Sistema MALLAESA & Credenciales */}
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-600" /> Accesos al Sistema
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white uppercase tracking-tight">
                      {emp.assignedRole || 'operaciones'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase font-sans font-bold">Usuario:</span>
                      <span className="font-bold text-black truncate block">{emp.username || emp.code.toLowerCase().replace('-', '_')}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase font-sans font-bold">Clave:</span>
                      <span className="font-bold text-stone-700 truncate block">{emp.password || 'Mallaesa#2026'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleShareEmployeeAccessWhatsApp(emp)}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                      title="Enviar credenciales y enlace del sistema por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(emp)}
                      className="py-1.5 px-2.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 hover:text-black rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                      title="Copiar datos al portapapeles"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#898A82]" /> {emp.phone}
                  </span>
                  <span>Ingreso: {emp.hireDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 4: RESUMEN SEMANAL & RECIBO IMPRIMIBLE
         ======================================================== */}
      {activeTab === 'liquidacion' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-black">
                Liquidación de Nómina Semanal & Póliza Legal con Firma
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Resumen desglosado con sueldo base, horas extras dobles (LFT 67), horas extras triples (LFT 68) y viáticos de cuadrilla para firma de conformidad.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar Reporte de Nómina</span>
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <img
                  src="https://appdesignproyectos.com/mallaesalogo.png"
                  alt="MALLAESA"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h4 className="font-bold text-sm text-black">MALLAESA S.A. DE C.V.</h4>
                  <p className="text-[11px] text-stone-500">Póliza de Nómina y Liquidación Semanal • Jornada Legal: {weeklyHoursLimit} Horas</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-black block">Semana Vigente</span>
                <span className="text-stone-500 font-mono">Emisión: {new Date().toLocaleDateString('es-MX')}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Nombre del Trabajador</th>
                    <th className="py-2.5 px-3 text-right">Sueldo Base</th>
                    <th className="py-2.5 px-3 text-center">Horas Extras</th>
                    <th className="py-2.5 px-3 text-right">Monto Extras</th>
                    <th className="py-2.5 px-3 text-right">Viáticos</th>
                    <th className="py-2.5 px-3 text-right font-bold text-black">Total a Dispersar</th>
                    <th className="py-2.5 px-6 text-center">Firma de Conformidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {weeklySummaries.map((s) => (
                    <tr key={s.employeeId} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-black">{employees.find(e => e.id === s.employeeId)?.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-black">{s.employeeName}</div>
                        <div className="text-[10px] text-stone-500">{s.jobTitle}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono">${s.basePay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-center font-mono">
                        {(s.overtimeDoubleHours + s.overtimeTripleHours) > 0 ? (
                          <span>{(s.overtimeDoubleHours + s.overtimeTripleHours).toFixed(1)} hrs</span>
                        ) : (
                          <span className="text-stone-400">0.0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        ${s.totalOvertimePay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">${s.viaticsPay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-black text-sm">
                        ${s.totalWeeklyGrossPay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="w-36 h-9 border-b border-stone-400 mx-auto flex items-end justify-center pb-1 text-[9px] text-stone-400">
                          Firma del trabajador
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-stone-100 font-bold text-xs text-black border-t-2 border-stone-300">
                    <td colSpan={2} className="py-3 px-3">TOTALES CONSOLIDADOS:</td>
                    <td className="py-3 px-3 text-right font-mono">
                      ${weeklySummaries.reduce((sum, s) => sum + s.basePay, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {totalOvertimeHoursWeek.toFixed(1)} hrs
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-800">
                      ${totalOvertimeCostWeek.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      ${weeklySummaries.reduce((sum, s) => sum + s.viaticsPay, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-black">
                      ${totalGrossPayrollWeek.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-6 text-center text-[10px] text-stone-500">MALLAESA RH</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ALTA Y EDICIÓN DE EMPLEADO
         ======================================================== */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-black">
                  {editingEmployeeId ? 'Editar Expediente de Empleado' : 'Alta de Nuevo Empleado en Mallaesa'}
                </h3>
              </div>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 text-stone-400 hover:text-black rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Código de Empleado *</label>
                  <input
                    type="text"
                    required
                    value={empForm.code}
                    onChange={(e) => setEmpForm({ ...empForm, code: e.target.value.toUpperCase() })}
                    placeholder="EMP-010"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Nombre Completo del Trabajador *</label>
                  <input
                    type="text"
                    required
                    value={empForm.fullName}
                    onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })}
                    placeholder="Ej. Juan Pérez Garza"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              {/* CURP, RFC y NSS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">CURP (18 Dígitos) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.curp}
                    onChange={(e) => setEmpForm({ ...empForm, curp: e.target.value.toUpperCase() })}
                    placeholder="PEGJ900101HNL..."
                    maxLength={18}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">RFC con Homoclave *</label>
                  <input
                    type="text"
                    required
                    value={empForm.rfc}
                    onChange={(e) => setEmpForm({ ...empForm, rfc: e.target.value.toUpperCase() })}
                    placeholder="PEGJ9001011A2"
                    maxLength={13}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">NSS Seguro Social (IMSS) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.nss}
                    onChange={(e) => setEmpForm({ ...empForm, nss: e.target.value })}
                    placeholder="72098492019"
                    maxLength={11}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Puesto, Departamento y Cuadrilla */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Puesto en Obra / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={empForm.jobTitle}
                    onChange={(e) => setEmpForm({ ...empForm, jobTitle: e.target.value })}
                    placeholder="Ej. Cabo Instalador, Soldador..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Departamento</label>
                  <select
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value as EmployeeDepartment })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="instalacion_campo">Instalación en Campo</option>
                    <option value="taller_herreria">Taller de Herrería</option>
                    <option value="almacen_logistica">Almacén y Logística</option>
                    <option value="chofer_transporte">Chofer y Fletes</option>
                    <option value="administracion_ventas">Administración y Ventas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Cuadrilla Asignada</label>
                  <input
                    type="text"
                    value={empForm.assignedCrew || ''}
                    onChange={(e) => setEmpForm({ ...empForm, assignedCrew: e.target.value })}
                    placeholder="Ej. Cuadrilla Alfa"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Salarios */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <label className="block font-bold text-black mb-1">Salario Diario Base ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    min={250}
                    step={10}
                    value={empForm.dailySalary}
                    onChange={(e) => setEmpForm({ ...empForm, dailySalary: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Tarifa Hora Ordinaria (Calculada)</label>
                  <div className="p-2.5 bg-stone-200/70 border border-stone-300 rounded-lg font-mono font-bold text-black">
                    ${(empForm.dailySalary / 8).toFixed(2)}/h
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-600 mb-1">Tarifa Hora Extra Doble (+100%)</label>
                  <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-lg font-mono font-bold text-emerald-800">
                    ${((empForm.dailySalary / 8) * 2).toFixed(2)}/h
                  </div>
                </div>
              </div>

              {/* Contacto y Emergencias */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono Personal</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="81-1234-5678"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Sangre</label>
                  <select
                    value={empForm.bloodType}
                    onChange={(e) => setEmpForm({ ...empForm, bloodType: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Contacto Emergencia (Nombre y Parentesco)</label>
                  <input
                    type="text"
                    value={empForm.emergencyContact?.name || ''}
                    onChange={(e) => setEmpForm({
                      ...empForm,
                      emergencyContact: {
                        name: e.target.value,
                        relationship: empForm.emergencyContact?.relationship || 'Familiar',
                        phone: empForm.emergencyContact?.phone || ''
                      }
                    })}
                    placeholder="Ej. María López (Esposa)"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono del Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={empForm.emergencyContact?.phone || ''}
                    onChange={(e) => setEmpForm({
                      ...empForm,
                      emergencyContact: {
                        name: empForm.emergencyContact?.name || '',
                        relationship: empForm.emergencyContact?.relationship || 'Familiar',
                        phone: e.target.value
                      }
                    })}
                    placeholder="81-9988-7766"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Domicilio Particular</label>
                  <input
                    type="text"
                    value={empForm.address}
                    onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })}
                    placeholder="Calle, número, colonia, municipio"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              {/* SECCIÓN: ACCESO AL SISTEMA Y ASIGNACIÓN DE ROL */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Credenciales de Acceso & Asignación de Rol
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-medium">
                    Accesos oficiales para el empleado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Rol en el Sistema *</label>
                    <select
                      value={empForm.assignedRole || 'operaciones'}
                      onChange={(e) => setEmpForm({ ...empForm, assignedRole: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-bold text-stone-900"
                    >
                      <option value="operaciones">Operaciones (Cuadrillas, OTs y Almacén)</option>
                      <option value="ventas">Ventas (CRM y Presupuestos)</option>
                      <option value="administracion">Administración y Finanzas</option>
                      <option value="director">Dirección General</option>
                      <option value="cotizador">Cotizador & Catálogo</option>
                      <option value="cliente">Cliente (Portal Público)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nombre de Usuario *</label>
                    <input
                      type="text"
                      required
                      value={empForm.username || ''}
                      onChange={(e) => setEmpForm({ ...empForm, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="ej. roberto_mendoza"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-stone-700">Contraseña de Acceso *</label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Generar aleatoria
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={empForm.password || ''}
                      onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                      placeholder="Mallaesa#2026"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Enlace del Sistema (URL)</label>
                    <input
                      type="url"
                      required
                      value={empForm.systemUrl || 'https://mallaesa.vercel.app/'}
                      onChange={(e) => setEmpForm({ ...empForm, systemUrl: e.target.value })}
                      placeholder="https://mallaesa.vercel.app/"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-stone-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployeeId ? 'Actualizar Expediente' : 'Guardar Empleado'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de fila interactiva de asistencia para permitir edición ágil en checador
interface AttendanceRowItemProps {
  employee: Employee;
  record?: AttendanceRecord;
  defaultIn: string;
  defaultOut: string;
  defaultLunch: number;
  defaultStatus: AttendanceStatus;
  defaultLocation: string;
  defaultNotes: string;
  onSave: (inTime: string, outTime: string, lunch: number, status: AttendanceStatus, location: string, notes: string) => void;
}

const AttendanceRowItem: React.FC<AttendanceRowItemProps> = ({
  employee,
  record,
  defaultIn,
  defaultOut,
  defaultLunch,
  defaultStatus,
  defaultLocation,
  defaultNotes,
  onSave
}) => {
  const [inTime, setInTime] = useState(defaultIn);
  const [outTime, setOutTime] = useState(defaultOut);
  const [lunch, setLunch] = useState(defaultLunch);
  const [status, setStatus] = useState<AttendanceStatus>(defaultStatus);
  const [location, setLocation] = useState(defaultLocation);
  const [notes, setNotes] = useState(defaultNotes);
  const [isSaved, setIsSaved] = useState(Boolean(record));

  // Cálculo en vivo de horas
  const calculatedHours = useMemo(() => {
    if (!inTime || !outTime) return { worked: 0, overtime: 0 };
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return { worked: 0, overtime: 0 };

    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM) - Number(lunch || 0);
    if (totalMinutes < 0) totalMinutes = 0;
    const worked = Number((totalMinutes / 60).toFixed(2));
    const overtime = Number(Math.max(0, worked - 8).toFixed(2));
    return { worked, overtime };
  }, [inTime, outTime, lunch]);

  const handleApply = () => {
    onSave(inTime, outTime, lunch, status, location, notes);
    setIsSaved(true);
  };

  return (
    <tr className={`hover:bg-stone-50/70 transition ${isSaved ? 'bg-white' : 'bg-amber-50/30'}`}>
      <td className="py-3 px-4">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1 py-0.5 rounded">{employee.code}</span>
          {employee.fullName}
        </div>
        <div className="text-[11px] text-stone-500">{employee.jobTitle}</div>
      </td>

      <td className="py-3 px-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AttendanceStatus);
            setIsSaved(false);
          }}
          className="p-1.5 bg-stone-50 border border-stone-300 rounded font-semibold text-xs"
        >
          <option value="presente">Presente</option>
          <option value="retardo">Retardo</option>
          <option value="falta_justificada">Falta Justificada</option>
          <option value="falta_injustificada">Falta Injustificada</option>
          <option value="incapacidad">Incapacidad IMSS</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="descanso_semanal">Descanso Semanal</option>
        </select>
      </td>

      <td className="py-3 px-3">
        <input
          type="time"
          value={inTime}
          disabled={status === 'falta_injustificada' || status === 'descanso_semanal'}
          onChange={(e) => {
            setInTime(e.target.value);
            setIsSaved(false);
          }}
          className="p-1 bg-stone-50 border border-stone-300 rounded font-mono font-bold text-xs"
        />
      </td>

      <td className="py-3 px-3">
        <input
          type="number"
          min={0}
          max={120}
          step={15}
          value={lunch}
          disabled={status === 'falta_injustificada' || status === 'descanso_semanal'}
          onChange={(e) => {
            setLunch(Number(e.target.value));
            setIsSaved(false);
          }}
          className="w-16 p-1 bg-stone-50 border border-stone-300 rounded font-mono text-center text-xs"
        />
      </td>

      <td className="py-3 px-3">
        <input
          type="time"
          value={outTime}
          disabled={status === 'falta_injustificada' || status === 'descanso_semanal'}
          onChange={(e) => {
            setOutTime(e.target.value);
            setIsSaved(false);
          }}
          className="p-1 bg-stone-50 border border-stone-300 rounded font-mono font-bold text-xs"
        />
      </td>

      <td className="py-3 px-3 text-center font-mono font-bold text-sm text-black">
        {status === 'falta_injustificada' ? '0.00' : `${calculatedHours.worked}h`}
      </td>

      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
        {calculatedHours.overtime > 0 ? (
          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
            +{calculatedHours.overtime}h
          </span>
        ) : (
          <span className="text-stone-400 text-xs">0.0h</span>
        )}
      </td>

      <td className="py-3 px-4">
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Obra o almacén..."
          className="w-full p-1 bg-stone-50 border border-stone-300 rounded text-xs"
        />
      </td>

      <td className="py-3 px-4 text-right">
        <button
          type="button"
          onClick={handleApply}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 justify-end ml-auto ${
            isSaved
              ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              : 'bg-black text-white hover:bg-stone-800 shadow-xs'
          }`}
        >
          {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
          <span>{isSaved ? 'Registrado' : 'Guardar'}</span>
        </button>
      </td>
    </tr>
  );
};
