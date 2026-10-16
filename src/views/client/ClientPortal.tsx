import React, { useState } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import { ServiceType, TerrainType } from '../../types';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  Upload,
  Search,
  FileText,
  ShieldCheck,
  MapPin,
  Maximize2,
  Calendar,
  Phone,
  Mail,
  User,
  ArrowRight,
  Layers,
  Clock,
  Download,
  PenTool,
  Check
} from 'lucide-react';

const SERVICE_OPTIONS: { id: ServiceType; label: string; image: string; desc: string }[] = [
  {
    id: 'malla_ciclonica',
    label: 'Malla Ciclónica Galvanizada',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=500&q=80',
    desc: 'Calibre 10.5 o 12.5 con postes y tubo superior para industria, terrenos y residencias.'
  },
  {
    id: 'concertina',
    label: 'Concertina de Seguridad Arpón',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=500&q=80',
    desc: 'Espiral helicoidal de cuchillas en acero inoxidable para coronación de bardas.'
  },
  {
    id: 'reja_acero',
    label: 'Reja de Acero Ornamental',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
    desc: 'Paneles de alambre electrosoldado con pintura poliéster horneada verde o negra.'
  },
  {
    id: 'malla_ganadera',
    label: 'Malla Ganadera / Borreguera',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
    desc: 'Nudo graduado para ranchos, contención de animales bovinos, ovinos y predios campestres.'
  },
  {
    id: 'cerca_electrificada',
    label: 'Cerca Electrificada Industrial',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=500&q=80',
    desc: 'Líneas de alto voltaje disuasivo con energizador y alarma perimetral integrada.'
  },
  {
    id: 'alambre_puas',
    label: 'Alambre de Púas Galvanizado',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80',
    desc: 'Protección perimetral económica de 2 a 4 hilos en calibres reforzados 12.5.'
  },
  {
    id: 'cinta_privacidad',
    label: 'Cinta de Privacidad Rompevientos',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80',
    desc: 'Cinta plástica con protección UV para tejer sobre malla ciclónica y dar privacidad.'
  }
];

export const ClientPortal: React.FC<{
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}> = ({ activeModule, onNavigateModule }) => {
  const {
    submitClientRequest,
    projects,
    formalQuotes,
    clientApproveQuote,
    workOrders
  } = useMallaesa();

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [city, setCity] = useState('Monterrey, N.L.');
  const [serviceType, setServiceType] = useState<ServiceType>('malla_ciclonica');
  const [linearMeters, setLinearMeters] = useState<number>(80);
  const [heightMeters, setHeightMeters] = useState<number>(2.0);
  const [terrainType, setTerrainType] = useState<TerrainType>('tierra');
  const [notes, setNotes] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [submittedFolio, setSubmittedFolio] = useState<string | null>(null);

  // Search Folio state
  const [searchFolio, setSearchFolio] = useState('');
  const [searchedProject, setSearchedProject] = useState<any>(null);

  // Approval modal in client view
  const [clientSignatureInput, setClientSignatureInput] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }

    const folio = submitClientRequest({
      clientName,
      clientPhone,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      projectAddress: projectAddress || 'Domicilio en confirmación',
      city,
      serviceType,
      linearMeters: Number(linearMeters) || 50,
      heightMeters: Number(heightMeters) || 2.0,
      terrainType,
      notes,
      photoUrl: uploadedPhotoUrl || undefined
    });

    setSubmittedFolio(folio);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const handleSearchProject = (folioToFind?: string) => {
    const term = (folioToFind || searchFolio).trim().toUpperCase();
    if (!term) return;

    const found = projects.find(
      p => p.folio.toUpperCase() === term || p.folio.toUpperCase().includes(term)
    );

    if (found) {
      setSearchedProject(found);
    } else {
      alert(`No encontramos ningún proyecto registrado con el folio "${term}". Por favor verifica el número.`);
    }
  };

  const handleClientApprove = (quoteId: string) => {
    if (!clientSignatureInput.trim()) {
      alert('Por favor ingresa tu nombre completo o firma de aceptación.');
      return;
    }
    clientApproveQuote(quoteId, clientSignatureInput);
    setIsApproving(false);
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {}
    alert('¡Cotización aprobada con éxito! El área administrativa registrará tu anticipo para iniciar la fabricación y logística de instalación.');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          MÓDULO 1: CUESTIONARIO INTERACTIVO DE COTIZACIÓN
         ======================================================== */}
      {activeModule === 'cuestionario' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Tarjeta de bienvenida limpia */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#898A82]">
                  MALLAESA • Seguridad Perimetral
                </span>
                <h1 className="text-2xl font-bold text-black mt-1">
                  Cotizador Interactivo de Cercados
                </h1>
                <p className="text-sm text-stone-600 mt-1 max-w-2xl">
                  Ingresa las medidas y especificaciones de tu terreno. Nuestro sistema comercial procesará tus datos y calculará el presupuesto oficial con materiales y mano de obra.
                </p>
              </div>
              <div className="bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-lg text-right">
                <span className="text-[11px] text-stone-500 block font-semibold">Atención Inmediata</span>
                <span className="text-xs font-bold text-black flex items-center gap-1 justify-end">
                  <Phone className="w-3.5 h-3.5 text-[#898A82]" /> 81-8000-MALLA (6255)
                </span>
              </div>
            </div>
          </div>

          {submittedFolio ? (
            <div className="bg-white border-2 border-emerald-500 rounded-xl p-8 text-center space-y-4 shadow-md animate-scale-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-black">
                ¡Solicitud Registrada con Éxito!
              </h2>
              <p className="text-sm text-stone-600 max-w-lg mx-auto">
                Tu solicitud ha sido enviada al equipo de Ventas de MALLAESA. Estamos calculando el desglose de materiales y te contactaremos en breve.
              </p>
              <div className="inline-block bg-stone-100 border border-stone-300 px-6 py-3 rounded-lg">
                <span className="text-xs font-semibold text-stone-500 block">Tu Folio de Seguimiento es:</span>
                <span className="text-2xl font-black text-black tracking-wider">{submittedFolio}</span>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSearchFolio(submittedFolio);
                    handleSearchProject(submittedFolio);
                    if (onNavigateModule) onNavigateModule('estatus');
                  }}
                  className="px-6 py-2.5 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-sm transition"
                >
                  Consultar Estatus de mi Proyecto
                </button>
                <button
                  onClick={() => {
                    setSubmittedFolio(null);
                    setClientName('');
                    setNotes('');
                  }}
                  className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-semibold text-sm transition"
                >
                  Realizar Otra Cotización
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
              {/* Paso 1: Tipo de Servicio */}
              <div>
                <label className="block text-sm font-bold text-black mb-1">
                  1. Selecciona el Tipo de Sistema de Seguridad Perimetral:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Elige la solución que mejor se adapte a tu necesidad de protección o delimitación.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SERVICE_OPTIONS.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setServiceType(srv.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        serviceType === srv.id
                          ? 'border-black bg-stone-50 shadow-xs'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-black">{srv.label}</h4>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              serviceType === srv.id
                                ? 'border-black bg-black text-white'
                                : 'border-stone-300'
                            }`}
                          >
                            {serviceType === srv.id && <Check className="w-3 h-3 stroke-3" />}
                          </div>
                        </div>
                        <p className="text-xs text-stone-500 leading-snug">{srv.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paso 2: Medidas y Terreno */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  2. Medidas Requeridas y Características del Terreno:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Ingresa los metros lineales aproximados y la altura deseada para tu cerca.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Metros Lineales Aprox. (m) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="10000"
                        value={linearMeters}
                        onChange={(e) => setLinearMeters(Math.max(1, Number(e.target.value)))}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-bold text-black text-sm focus:outline-hidden focus:border-black"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-stone-500 font-semibold">
                        mts
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Altura Requerida *
                    </label>
                    <select
                      value={heightMeters}
                      onChange={(e) => setHeightMeters(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold text-black text-sm focus:outline-hidden focus:border-black cursor-pointer"
                    >
                      <option value="1.25">1.25 metros (Residencial baja)</option>
                      <option value="1.50">1.50 metros (Residencial estándar)</option>
                      <option value="2.00">2.00 metros (Comercial / Recomendada)</option>
                      <option value="2.50">2.50 metros (Industrial y seguridad)</option>
                      <option value="3.00">3.00 metros (Alta seguridad perimetral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Tipo de Superficie / Terreno *
                    </label>
                    <select
                      value={terrainType}
                      onChange={(e) => setTerrainType(e.target.value as TerrainType)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg font-semibold text-black text-sm focus:outline-hidden focus:border-black cursor-pointer"
                    >
                      <option value="plano">Plano y firme regular</option>
                      <option value="inclinado">Terreno inclinado / desniveles</option>
                      <option value="tierra">Tierra o pasto natural</option>
                      <option value="concreto">Firme de concreto o sobre barda</option>
                      <option value="mixto">Mixto con zonas rocosas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Paso 3: Ubicación y Contacto */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  3. Datos de Ubicación y Contacto del Cliente:
                </label>
                <p className="text-xs text-stone-500 mb-4">
                  Datos indispensables para generar el folio formal y coordinar la propuesta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nombre Completo o Empresa *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ej. Ing. Armando Morales"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Teléfono Móvil (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Ej. 81-8399-2041"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Correo Electrónico (para recibir la Cotización en PDF) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="tu.correo@empresa.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black focus:outline-hidden focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Municipio / Zona Metropolitana *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#898A82] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ej. Monterrey, Apodaca, San Pedro, García..."
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black font-semibold focus:outline-hidden focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Dirección o Referencia del Proyecto
                    </label>
                    <input
                      type="text"
                      value={projectAddress}
                      onChange={(e) => setProjectAddress(e.target.value)}
                      placeholder="Calle, número, colonia o parque industrial donde se realizará la obra"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-black focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Paso 4: Fotos, Croquis y Notas */}
              <div className="border-t border-stone-200 pt-6">
                <label className="block text-sm font-bold text-black mb-1">
                  4. Adjuntar Fotos, Croquis del Perímetro o Notas Especiales (Opcional):
                </label>
                <p className="text-xs text-stone-500 mb-3">
                  Sube una foto del frente o croquis dibujado para agilizar la cotización técnica exacta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foto o Croquis */}
                  <div className="border-2 border-dashed border-stone-300 hover:border-black rounded-xl p-4 text-center bg-stone-50 transition flex flex-col items-center justify-center min-h-[120px]">
                    {uploadedPhotoUrl ? (
                      <div className="relative w-full">
                        <img
                          src={uploadedPhotoUrl}
                          alt="Foto del proyecto"
                          className="h-28 w-full object-cover rounded-lg border border-stone-200"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotoUrl('')}
                          className="mt-2 text-xs text-red-600 font-semibold hover:underline"
                        >
                          Eliminar foto
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[#898A82] mb-1" />
                        <span className="text-xs font-bold text-black">
                          Subir Foto o Croquis del Perímetro
                        </span>
                        <span className="text-[11px] text-stone-500 mt-0.5">
                          Formatos JPG, PNG o PDF
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setUploadedPhotoUrl(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="mt-2 text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-stone-800 cursor-pointer"
                        />
                      </>
                    )}
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Comentarios o requerimientos específicos:
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Requiero portón corredizo de 4 metros, o concertina con doble navaja en la parte superior..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-black focus:outline-hidden focus:border-black resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500">
                  <span className="font-semibold text-black">Garantía MALLAESA:</span> Materiales galvanizados de primera calidad y mano de obra certificada.
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Enviar Cuestionario y Solicitar Cotización
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 2: ESTATUS DE SU PROYECTO
         ======================================================== */}
      {activeModule === 'estatus' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xl font-bold text-black">
              Consulta de Estatus de Proyecto
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Ingresa el folio de tu cotización (ej. <strong>COT-2026-0841</strong>) para conocer el avance técnico, fecha programada, aprobar tu cotización o descargar tu póliza de garantía.
            </p>

            {/* Buscador de Folio */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchFolio}
                  onChange={(e) => setSearchFolio(e.target.value)}
                  placeholder="Ingresa tu Folio (ej. COT-2026-0841)"
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-black font-bold focus:outline-hidden focus:border-black uppercase"
                />
              </div>
              <button
                onClick={() => handleSearchProject()}
                className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition"
              >
                Buscar Folio
              </button>
            </div>

            {/* Accesos rápidos a folios demo si existen */}
            {projects.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500">Folios de muestra disponibles:</span>
                {projects.slice(0, 4).map((p) => (
                  <button
                    key={p.folio}
                    onClick={() => {
                      setSearchFolio(p.folio);
                      setSearchedProject(p);
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-black hover:text-white transition font-medium"
                  >
                    {p.folio} ({p.clientName.split(' ')[0]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resultado de búsqueda */}
          {searchedProject && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
              {/* Encabezado del Proyecto */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-stone-100 text-black border border-stone-200 rounded">
                      {searchedProject.folio}
                    </span>
                    <span className="text-xs font-bold text-white px-2.5 py-1 bg-[#898A82] rounded">
                      Fase {searchedProject.phase} de 5
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-black mt-2">
                    {searchedProject.clientName}
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#898A82]" />
                    {searchedProject.projectAddress}, {searchedProject.city}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                  <span className="text-xs text-stone-500 block font-semibold">Inversión Estimada:</span>
                  <span className="text-xl font-black text-black">
                    ${searchedProject.totalAmount > 0 ? searchedProject.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : 'En proceso'} MXN
                  </span>
                </div>
              </div>

              {/* Barra de Progreso de las 5 Fases del Sistema */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Progreso del Proyecto en el Sistema MALLAESA
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {[
                    { num: 1, name: 'Captación', desc: 'Cuestionario recibido' },
                    { num: 2, name: 'Cotización', desc: 'Presupuesto en línea' },
                    { num: 3, name: 'Aprobación', desc: 'Anticipo del 50%' },
                    { num: 4, name: 'Operaciones', desc: 'Instalación en campo' },
                    { num: 5, name: 'Cierre', desc: 'Firma & Garantía' }
                  ].map((f) => {
                    const isCompleted = searchedProject.phase > f.num;
                    const isCurrent = searchedProject.phase === f.num;

                    return (
                      <div
                        key={f.num}
                        className={`p-3 rounded-lg border text-center transition ${
                          isCompleted
                            ? 'bg-stone-50 border-stone-300'
                            : isCurrent
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-white border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                isCurrent ? 'bg-white text-black' : 'bg-stone-200 text-stone-700'
                              }`}
                            >
                              {f.num}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-white' : 'text-black'}`}>
                          {f.name}
                        </p>
                        <p className={`text-[10px] mt-0.5 leading-snug ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                          {f.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalles Técnicos */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Sistema</span>
                  <span className="text-xs font-semibold text-black capitalize">
                    {searchedProject.serviceType.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Metros Lineales</span>
                  <span className="text-xs font-semibold text-black">
                    {searchedProject.linearMeters} metros
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Anticipo (50%)</span>
                  <span className="text-xs font-semibold text-black flex items-center gap-1">
                    {searchedProject.advancePaid ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Confirmado
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">Pendiente de registro</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-stone-500 block">Cuadrilla Asignada</span>
                  <span className="text-xs font-semibold text-black">
                    {searchedProject.assignedCrew || 'Por programar'}
                  </span>
                </div>
              </div>

              {/* Botón interactivo para APROBAR Y FIRMAR cotización si está en Fase 2 o 3 */}
              {(() => {
                const quote = formalQuotes.find(q => q.folio === searchedProject.folio);
                if (quote && quote.status === 'enviada') {
                  return (
                    <div className="bg-stone-100 border border-stone-300 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-black" />
                          <h4 className="font-bold text-sm text-black">
                            Cotización Formal Lista para Aprobación
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-black">
                          Total: ${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Tu cotización ha sido calculada con los materiales exactos. Puedes aprobarla ahora con tu firma digital para autorizar el pedido y programar la cuadrilla.
                      </p>

                      {isApproving ? (
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-black">
                            Ingresa tu nombre completo para firmar electrónicamente:
                          </label>
                          <input
                            type="text"
                            value={clientSignatureInput}
                            onChange={(e) => setClientSignatureInput(e.target.value)}
                            placeholder="Nombre del Cliente o Representante Legal"
                            className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleClientApprove(quote.id)}
                              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800"
                            >
                              Firmar y Aprobar Proyecto
                            </button>
                            <button
                              onClick={() => setIsApproving(false)}
                              className="px-4 py-2 bg-stone-200 text-stone-800 text-xs font-medium rounded-lg"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsApproving(true)}
                          className="px-5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2"
                        >
                          <PenTool className="w-4 h-4" />
                          Aprobar Cotización y Firmar en Línea
                        </button>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Si el proyecto está en Fase 5 con Garantía emitida */}
              {searchedProject.warrantyFolio && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-emerald-950">
                        Póliza de Garantía Digital MALLAESA Vigente
                      </h4>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {searchedProject.warrantyFolio}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-1">
                      Cobertura integral por {searchedProject.warrantyYears || 3} años contra defectos de fabricación, anclaje y corrosión galvanizada.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => alert(`Póliza ${searchedProject.warrantyFolio} descargada exitosamente en PDF.`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar Certificado de Garantía (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MÓDULO 3: CATÁLOGO DE SISTEMAS PERIMETRALES
         ======================================================== */}
      {activeModule === 'catalogo' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xl font-bold text-black">
              Catálogo de Soluciones de Seguridad Perimetral MALLAESA
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Fabricación con acero galvanizado por inmersión en caliente bajo norma ASTM A392.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICE_OPTIONS.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-black transition flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.image}
                    alt={item.label}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-base text-black">{item.label}</h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>Garantía: 3 a 5 años</span>
                      <span className="font-semibold text-black">Instalación Inmediata</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setServiceType(item.id);
                      if (onNavigateModule) onNavigateModule('cuestionario');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2 bg-stone-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-lg transition"
                  >
                    Cotizar este Sistema
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
