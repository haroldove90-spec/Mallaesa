import React, { useState, useMemo } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { Employee, RoleType, EmployeeDepartment } from '../types';
import confetti from 'canvas-confetti';
import {
  Users,
  UserPlus,
  Key,
  Copy,
  Share2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';

const ROLE_DISPLAY_NAMES: Record<RoleType, { label: string; color: string }> = {
  operaciones: { label: 'Operaciones (Instalaciones & OTs)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  ventas: { label: 'Ventas (CRM & Cotizaciones)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  administracion: { label: 'Administración & Finanzas', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  director: { label: 'Dirección General / Gerencia', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cotizador: { label: 'Cotizador & Catálogo', color: 'bg-stone-100 text-stone-800 border-stone-200' },
  cliente: { label: 'Portal de Clientes', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  pagina_web: { label: 'Sitio Web Público', color: 'bg-stone-100 text-stone-700 border-stone-200' }
};

export const PersonnelRegistrationView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    weeklyHoursLimit
  } = useMallaesa();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('todos');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Form State
  const [empForm, setEmpForm] = useState<Omit<Employee, 'id'>>({
    code: '',
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
      relationship: 'Familiar',
      phone: ''
    },
    jobTitle: 'Instalador de Cercas Perimetrales',
    department: 'instalacion_campo',
    assignedCrew: 'Cuadrilla Alfa',
    hireDate: new Date().toISOString().split('T')[0],
    dailySalary: 550,
    hourlyRate: 68.75,
    weeklyBaseHours: 40,
    status: 'activo',
    notes: '',
    username: '',
    password: '',
    assignedRole: 'operaciones',
    systemUrl: 'https://mallaesa.vercel.app/'
  });

  // Generador de clave segura
  const generateRandomPassword = () => {
    const pin = Math.floor(1000 + Math.random() * 9000);
    setEmpForm(prev => ({ ...prev, password: `Mallaesa#${pin}` }));
  };

  // Abrir modal de nuevo empleado
  const handleOpenNewEmployee = () => {
    setEditingEmployeeId(null);
    const nextNum = employees.length + 1;
    const code = `EMP-${String(nextNum).padStart(3, '0')}`;
    const autoUser = `empleado_${code.toLowerCase().replace('-', '')}`;
    const defaultPin = Math.floor(1000 + Math.random() * 9000);

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
        relationship: 'Familiar',
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
      username: autoUser,
      password: `Mallaesa#${defaultPin}`,
      assignedRole: 'operaciones',
      systemUrl: 'https://mallaesa.vercel.app/'
    });
    setIsModalOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (emp: Employee) => {
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
      birthDate: emp.birthDate || '1990-01-01',
      bloodType: emp.bloodType || 'O+',
      emergencyContact: emp.emergencyContact || { name: '', relationship: 'Familiar', phone: '' },
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
    setIsModalOpen(true);
  };

  // Guardar empleado
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.fullName.trim()) {
      alert('Por favor ingresa el nombre completo del empleado.');
      return;
    }

    const rawUser = empForm.username || '';
    const rawPass = empForm.password || '';

    if (!rawUser.trim() || !rawPass.trim()) {
      alert('Por favor ingresa un nombre de usuario y contraseña de acceso para el empleado.');
      return;
    }

    const calculatedHourly = Number((empForm.dailySalary / 8).toFixed(2));
    const cleanUser = rawUser.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanPass = rawPass.trim();

    const payload = {
      ...empForm,
      username: cleanUser,
      password: cleanPass,
      hourlyRate: calculatedHourly,
      systemUrl: empForm.systemUrl || 'https://mallaesa.vercel.app/'
    };

    if (editingEmployeeId) {
      updateEmployee(editingEmployeeId, payload);
      alert(`¡Expediente y credenciales de ${payload.fullName} actualizados con éxito!`);
    } else {
      addEmployee(payload);
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
      alert(`¡Empleado ${payload.fullName} (${payload.code}) registrado con éxito con rol: ${payload.assignedRole}!`);
    }

    setIsModalOpen(false);
  };

  // Compartir accesos por WhatsApp
  const handleShareWhatsApp = (emp: Employee) => {
    const roleConfig = ROLE_DISPLAY_NAMES[emp.assignedRole || 'operaciones'];
    const roleLabel = roleConfig ? roleConfig.label : (emp.assignedRole || 'Operaciones');
    const link = emp.systemUrl || 'https://mallaesa.vercel.app/';
    const userAccess = emp.username || emp.code.toLowerCase().replace('-', '_');
    const passAccess = emp.password || 'Mallaesa#2026';

    const message = 
`🔒 *ACCESOS AL SISTEMA MALLAESA* 🔒

¡Hola, *${emp.fullName}*! Te compartimos tus accesos oficiales a la plataforma de MALLAESA:

🌐 *Link del Sistema:* ${link}
👤 *Usuario:* ${userAccess}
🔑 *Contraseña:* ${passAccess}
🏷️ *Rol Asignado:* ${roleLabel}
📌 *Puesto:* ${emp.jobTitle}

📲 *Instrucciones para ingresar:*
1. Haz clic en el enlace: ${link}
2. Ingresa con tu usuario y contraseña.
3. El sistema abrirá automáticamente tu panel operativo.

_MALLAESA Seguridad Perimetral • Soporte Técnico_`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = (emp.phone || '').replace(/\D/g, '');
    let waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    if (cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
      waUrl = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    }

    window.open(waUrl, '_blank');
  };

  // Copiar credenciales
  const handleCopyCredentials = (emp: Employee) => {
    const roleConfig = ROLE_DISPLAY_NAMES[emp.assignedRole || 'operaciones'];
    const roleLabel = roleConfig ? roleConfig.label : (emp.assignedRole || 'Operaciones');
    const link = emp.systemUrl || 'https://mallaesa.vercel.app/';
    const userAccess = emp.username || emp.code.toLowerCase().replace('-', '_');
    const passAccess = emp.password || 'Mallaesa#2026';

    const textToCopy = `SISTEMA MALLAESA\nLink: ${link}\nUsuario: ${userAccess}\nContraseña: ${passAccess}\nRol: ${roleLabel}\nEmpleado: ${emp.fullName}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      alert(`¡Credenciales copiadas!\n\nUsuario: ${userAccess}\nContraseña: ${passAccess}\nLink: ${link}`);
    } else {
      alert(textToCopy);
    }
  };

  // Filtrado de empleados
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        emp.fullName.toLowerCase().includes(search) ||
        emp.code.toLowerCase().includes(search) ||
        (emp.username && emp.username.toLowerCase().includes(search)) ||
        emp.jobTitle.toLowerCase().includes(search) ||
        emp.phone.toLowerCase().includes(search);

      const matchesRole = selectedRoleFilter === 'todos' || emp.assignedRole === selectedRoleFilter;
      const matchesDept = selectedDeptFilter === 'todos' || emp.department === selectedDeptFilter;

      return matchesSearch && matchesRole && matchesDept;
    });
  }, [employees, searchTerm, selectedRoleFilter, selectedDeptFilter]);

  const activeEmployeesCount = employees.filter(e => e.status === 'activo').length;
  const withCredentialsCount = employees.filter(e => e.username && e.password).length;

  return (
    <div className="space-y-6">
      {/* CABECERA PRINCIPAL DEL MÓDULO */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Módulo Oficial de Administración
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {employees.length} colaboradores registrados
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-1.5 flex items-center gap-2.5">
              <Users className="w-7 h-7 text-emerald-600" />
              <span>Registro de Personal & Asignación de Roles</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Registra a los empleados de MALLAESA, define su <strong>nombre de usuario y contraseña</strong>, asígnales su <strong>rol correspondiente</strong> en el sistema y comparte sus credenciales por <strong>WhatsApp</strong> con el link oficial{' '}
              <span className="font-mono font-bold text-black bg-stone-100 px-1.5 py-0.5 rounded">https://mallaesa.vercel.app/</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewEmployee}
            className="px-5 py-3 bg-black hover:bg-stone-800 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer self-start lg:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Empleado</span>
          </button>
        </div>

        {/* MÉTRICAS DE CAPITAL HUMANO & ACCESOS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-100">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Total Empleados</span>
            <div className="text-xl sm:text-2xl font-black text-black mt-0.5">{employees.length}</div>
            <span className="text-[11px] text-stone-500 font-medium">Plantilla registrada</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Con Credenciales</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">{withCredentialsCount}</div>
            <span className="text-[11px] text-emerald-700 font-medium">Listos para entrar</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Personal Activo</span>
            <div className="text-xl sm:text-2xl font-black text-black mt-0.5">{activeEmployeesCount}</div>
            <span className="text-[11px] text-stone-500 font-medium">En campo y oficina</span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Link del Sistema</span>
            <div className="text-xs font-mono font-bold text-black truncate mt-1.5" title="https://mallaesa.vercel.app/">
              mallaesa.vercel.app
            </div>
            <span className="text-[11px] text-stone-500 font-medium">Acceso seguro con contraseña</span>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código EMP, usuario o puesto..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-black placeholder:text-stone-400 focus:outline-hidden focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-700"
          >
            <option value="todos">Todos los Roles</option>
            <option value="operaciones">Rol: Operaciones</option>
            <option value="ventas">Rol: Ventas</option>
            <option value="administracion">Rol: Administración</option>
            <option value="director">Rol: Dirección General</option>
            <option value="cotizador">Rol: Cotizador</option>
            <option value="cliente">Rol: Cliente</option>
          </select>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-700"
          >
            <option value="todos">Todos los Departamentos</option>
            <option value="instalacion_campo">Instalación en Campo</option>
            <option value="taller_herreria">Taller de Herrería</option>
            <option value="almacen_logistica">Almacén y Logística</option>
            <option value="chofer_transporte">Chofer y Fletes</option>
            <option value="administracion_ventas">Administración y Ventas</option>
          </select>
        </div>
      </div>

      {/* LISTADO DE TARJETAS DE EMPLEADOS CON CREDENCIALES Y ROL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => {
          const roleBadge = ROLE_DISPLAY_NAMES[emp.assignedRole || 'operaciones'] || {
            label: emp.assignedRole || 'operaciones',
            color: 'bg-stone-100 text-stone-800 border-stone-200'
          };

          return (
            <div
              key={emp.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cabecera de la tarjeta: Nombre, Código y Botones de edición */}
                <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center font-black text-sm text-black shrink-0">
                      {emp.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-stone-100 rounded text-stone-700">
                          {emp.code}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                          {emp.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-black mt-0.5 leading-snug">{emp.fullName}</h3>
                      <div className="text-[11px] text-stone-500 font-medium">{emp.jobTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(emp)}
                      className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg transition cursor-pointer"
                      title="Editar empleado y credenciales"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar el expediente y credenciales de ${emp.fullName}?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Eliminar empleado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rol asignado en el sistema */}
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Rol asignado para el Dashboard:
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge.color} inline-flex items-center gap-1.5`}>
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{roleBadge.label}</span>
                  </div>
                </div>

                {/* Credenciales de Acceso */}
                <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-emerald-600" /> Credenciales de Entrada
                    </span>
                    <span className="text-stone-400 font-mono text-[9px]">https://mallaesa.vercel.app/</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase font-sans font-bold">Usuario:</span>
                      <span className="font-bold text-black truncate block">{emp.username || emp.code.toLowerCase().replace('-', '_')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase font-sans font-bold">Contraseña:</span>
                      <span className="font-bold text-stone-800 truncate block">{emp.password || 'Mallaesa#2026'}</span>
                    </div>
                  </div>

                  {/* Botones de Compartir por WhatsApp y Copiar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(emp)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Compartir credenciales y enlace por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(emp)}
                      className="py-2 px-3 bg-white hover:bg-stone-100 active:scale-[0.98] border border-stone-300 text-stone-700 hover:text-black rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Copiar credenciales al portapapeles"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                {/* Detalles adicionales del puesto */}
                <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                  {emp.assignedCrew && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-stone-400">Cuadrilla:</span>
                      <span className="font-semibold text-stone-800">{emp.assignedCrew}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Teléfono:</span>
                    <span className="font-semibold text-stone-800 font-mono">{emp.phone}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Salario Diario:</span>
                    <span className="font-bold text-black font-mono">${emp.dailySalary.toFixed(2)} MXN</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                <span>Ingreso: {emp.hireDate}</span>
                <span className="font-mono">NSS: {emp.nss || 'S/N'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
          <Users className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-black">No se encontraron empleados con los filtros aplicados</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Puedes cambiar tu término de búsqueda o registrar un nuevo colaborador haciendo clic en el botón superior.
          </p>
          <button
            type="button"
            onClick={handleOpenNewEmployee}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-stone-800 transition"
          >
            Registrar Empleado Ahora
          </button>
        </div>
      )}

      {/* MODAL PARA DAR DE ALTA O EDITAR EMPLEADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">
                    {editingEmployeeId ? 'Editar Personal & Credenciales' : 'Registro de Nuevo Personal'}
                  </h3>
                  <p className="text-xs text-stone-500">Configura datos personales, credenciales y rol de acceso.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-black rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              {/* SECCIÓN 1: ACCESO AL SISTEMA & ROL ASIGNADO (DESTACADA) */}
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                      Acceso al Sistema MALLAESA & Rol Asignado
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    El usuario entrará solo a este rol
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Rol Asignado en el Sistema *</label>
                    <select
                      value={empForm.assignedRole || 'operaciones'}
                      onChange={(e) => setEmpForm({ ...empForm, assignedRole: e.target.value as RoleType })}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-black focus:outline-hidden focus:border-black"
                    >
                      <option value="operaciones">Operaciones (Instalaciones, OTs & Cuadrillas)</option>
                      <option value="ventas">Ventas (CRM, Prospectos & Cuestionarios)</option>
                      <option value="administracion">Administración y Finanzas</option>
                      <option value="director">Dirección General / Gerencia</option>
                      <option value="cotizador">Cotizador & Catálogo</option>
                      <option value="cliente">Cliente (Portal de Seguimiento)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Nombre de Usuario para Login *</label>
                    <input
                      type="text"
                      required
                      value={empForm.username || ''}
                      onChange={(e) => setEmpForm({ ...empForm, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="ej. juan_perez"
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-black focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-emerald-950">Contraseña de Acceso *</label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 cursor-pointer underline"
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
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-black focus:outline-hidden focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-emerald-950 mb-1">Link del Sistema</label>
                    <input
                      type="url"
                      required
                      value={empForm.systemUrl || 'https://mallaesa.vercel.app/'}
                      onChange={(e) => setEmpForm({ ...empForm, systemUrl: e.target.value })}
                      placeholder="https://mallaesa.vercel.app/"
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-mono text-stone-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS DEL TRABAJADOR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Código de Empleado *</label>
                  <input
                    type="text"
                    required
                    value={empForm.code}
                    onChange={(e) => setEmpForm({ ...empForm, code: e.target.value.toUpperCase() })}
                    placeholder="EMP-010"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
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
                    placeholder="Ej. Cabo Instalador..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Departamento</label>
                  <select
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value as EmployeeDepartment })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
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
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* CURP, RFC y NSS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">CURP (18 Dígitos)</label>
                  <input
                    type="text"
                    value={empForm.curp}
                    onChange={(e) => setEmpForm({ ...empForm, curp: e.target.value.toUpperCase() })}
                    placeholder="PEGJ900101HNL..."
                    maxLength={18}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">RFC con Homoclave</label>
                  <input
                    type="text"
                    value={empForm.rfc}
                    onChange={(e) => setEmpForm({ ...empForm, rfc: e.target.value.toUpperCase() })}
                    placeholder="PEGJ9001011A2"
                    maxLength={13}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">NSS Seguro Social (IMSS)</label>
                  <input
                    type="text"
                    value={empForm.nss}
                    onChange={(e) => setEmpForm({ ...empForm, nss: e.target.value })}
                    placeholder="72098492019"
                    maxLength={11}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Salarios y Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Salario Diario Base ($ MXN) *</label>
                  <input
                    type="number"
                    required
                    min={250}
                    step={10}
                    value={empForm.dailySalary}
                    onChange={(e) => setEmpForm({ ...empForm, dailySalary: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="81-1234-5678"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Domicilio</label>
                  <input
                    type="text"
                    value={empForm.address}
                    onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })}
                    placeholder="Municipio, colonia, calle"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEmployeeId ? 'Actualizar Expediente & Rol' : 'Guardar Empleado & Activar Acceso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
