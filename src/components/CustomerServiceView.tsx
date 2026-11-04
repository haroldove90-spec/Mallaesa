import React, { useState } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { CustomerServiceTicket } from '../types';
import confetti from 'canvas-confetti';
import {
  Headphones,
  Plus,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Send,
  MessageCircle,
  ShieldCheck,
  Filter
} from 'lucide-react';

export const CustomerServiceView: React.FC = () => {
  const {
    customerServiceTickets,
    createCustomerServiceTicket,
    updateCustomerServiceTicketStatus,
    projects
  } = useMallaesa();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<CustomerServiceTicket | null>(null);
  const [resolutionInput, setResolutionInput] = useState<string>('');

  // Form states for new ticket
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectFolio, setProjectFolio] = useState('');
  const [type, setType] = useState<CustomerServiceTicket['type']>('garantia_mantenimiento');
  const [priority, setPriority] = useState<CustomerServiceTicket['priority']>('media');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Atención a Clientes Mallaesa');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !subject || !description) {
      alert('Por favor completa el nombre del cliente, asunto y descripción.');
      return;
    }

    const newTicket = createCustomerServiceTicket({
      clientName,
      clientPhone,
      clientEmail,
      projectFolio,
      type,
      priority,
      status: 'abierto',
      subject,
      description,
      assignedTo
    });

    try {
      confetti({ particleCount: 60, spread: 50 });
    } catch {}

    alert(`¡Ticket ${newTicket.folio} creado con éxito! Se ha asignado a ${assignedTo}.`);
    setIsModalOpen(false);
    setClientName('');
    setClientPhone('');
    setSubject('');
    setDescription('');
  };

  const handleResolveTicket = (ticketId: string) => {
    if (!resolutionInput) {
      alert('Por favor escribe las notas de resolución o acuerdo con el cliente.');
      return;
    }
    updateCustomerServiceTicketStatus(ticketId, 'resuelto', resolutionInput);
    alert('¡Ticket marcado como Resuelto exitosamente!');
    setSelectedTicket(null);
    setResolutionInput('');
  };

  const filteredTickets = customerServiceTickets.filter(t => {
    const matchesStatus = filterStatus === 'todos' || t.status === filterStatus;
    const matchesType = filterType === 'todos' || t.type === filterType;
    const matchesSearch =
      t.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Encabezado */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
              Soporte & Post-Venta MALLAESA
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-black text-white rounded-full">
              Módulo Oficial
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Mesa de Atención a Clientes & Garantías
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Gestión y seguimiento de requerimientos de clientes: solicitudes de cotización, calibración de puertas/portones, reclamos de garantía de 3 años, mantenimientos perimetrales y canal directo de WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Levantar Ticket de Servicio</span>
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Tickets en Proceso</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 mt-2 block">
            {customerServiceTickets.filter(t => t.status !== 'resuelto').length} <span className="text-xs font-semibold text-stone-400">activos</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Visitas técnicas o aclaraciones</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Garantías Atendidas</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-700 mt-2 block">
            {customerServiceTickets.filter(t => t.type === 'garantia_mantenimiento').length} <span className="text-xs font-semibold text-stone-400">casos</span>
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">Cobertura de 1 a 3 años</span>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold uppercase">
            <span>Tickets Resueltos</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <span className="text-2xl font-black text-black mt-2 block">
            {customerServiceTickets.filter(t => t.status === 'resuelto').length} <span className="text-xs font-semibold text-stone-400">concluidos</span>
          </span>
          <span className="text-xs text-stone-500 mt-1 block">Conformidad del cliente asegurada</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, folio o asunto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['todos', 'abierto', 'en_proceso', 'resuelto'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-black text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTickets.map(tkt => {
          const isResolved = tkt.status === 'resuelto';
          const cleanPhone = tkt.clientPhone.replace(/\D/g, '');

          return (
            <div
              key={tkt.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-black transition"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black rounded border border-stone-200">
                      {tkt.folio}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tkt.priority === 'alta'
                          ? 'bg-red-100 text-red-800'
                          : tkt.priority === 'media'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      Prioridad {tkt.priority}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : tkt.status === 'en_proceso'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tkt.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-base text-black">{tkt.subject}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-semibold text-black">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {tkt.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {tkt.clientPhone}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-stone-50 rounded-xl text-xs space-y-2 border border-stone-200/60">
                  <p className="text-stone-700 leading-relaxed font-medium">
                    "{tkt.description}"
                  </p>

                  <div className="pt-2 border-t border-stone-200 flex justify-between text-[11px] text-stone-500">
                    <span>Asignado: <strong>{tkt.assignedTo}</strong></span>
                    <span>Creado: {tkt.createdAt}</span>
                  </div>

                  {tkt.resolutionNotes && (
                    <div className="pt-2 border-t border-emerald-200 text-emerald-900 bg-emerald-50/70 p-2 rounded-lg font-medium text-[11px]">
                      <strong>Solución / Acuerdo:</strong> {tkt.resolutionNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${tkt.clientName}, le saludamos de MALLAESA respecto a su solicitud ${tkt.folio} (${tkt.subject}). ¿Cómo le podemos apoyar el día de hoy?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Cliente</span>
                </a>

                {!isResolved ? (
                  <button
                    onClick={() => setSelectedTicket(tkt)}
                    className="px-3.5 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Atender / Resolver
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resuelto
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Resolver Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  SEGUIMIENTO DE SERVICIO Y GARANTÍA
                </span>
                <h3 className="text-lg font-black text-black">
                  Resolver {selectedTicket.folio}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-1">
              <p><strong>Cliente:</strong> {selectedTicket.clientName} ({selectedTicket.clientPhone})</p>
              <p><strong>Asunto:</strong> {selectedTicket.subject}</p>
              <p className="text-stone-600">"{selectedTicket.description}"</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Notas de Solución / Visita de Cuadrilla:</label>
                <textarea
                  rows={3}
                  value={resolutionInput}
                  onChange={e => setResolutionInput(e.target.value)}
                  placeholder="Describe las acciones tomadas (ej. Cuadrilla Alfa acudió a retensar el alambre y ajustar las bisagras del portón, cliente firma conformidad)."
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Guardar como Resuelto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  NUEVO REQUERIMIENTO DE CLIENTE
                </span>
                <h3 className="text-lg font-black text-black">
                  Registrar Ticket de Atención
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-black font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nombre del Cliente:</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono:</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Servicio:</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="garantia_mantenimiento">Garantía / Mantenimiento</option>
                    <option value="seguimiento_obra">Seguimiento de Instalación</option>
                    <option value="solicitud_presupuesto">Solicitud de Presupuesto</option>
                    <option value="aclaracion">Aclaración Administrativa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Prioridad:</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                  >
                    <option value="alta">Alta (Urgente)</option>
                    <option value="media">Media (Estándar)</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Asunto:</label>
                <input
                  type="text"
                  placeholder="Ej. Ajuste de cerradura en puerta de acceso"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Detalle del Requerimiento:</label>
                <textarea
                  rows={3}
                  placeholder="Describe la solicitud del cliente..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Asignar a:</label>
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-semibold"
                >
                  <option value="Atención a Clientes Mallaesa">Atención a Clientes Mallaesa</option>
                  <option value="Cuadrilla Alfa (Roberto & Carlos)">Cuadrilla Alfa (Roberto & Carlos)</option>
                  <option value="Cuadrilla Beta (Eduardo & Manuel)">Cuadrilla Beta (Eduardo & Manuel)</option>
                  <option value="Ventas / Asesor Técnico">Ventas / Asesor Técnico</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Levantar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
