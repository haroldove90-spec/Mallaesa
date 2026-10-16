import React, { useState } from 'react';
import { useMallaesa } from '../../context/MallaesaContext';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Calendar,
  Send,
  ExternalLink,
  Award,
  Truck,
  Wrench,
  Layers,
  ChevronRight,
  Star,
  MessageCircle,
  Sparkles,
  PhoneCall,
  Check,
  Download,
  Printer,
  FileCheck2,
  Menu,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateIntelligentQuote, exportQuoteToPdf, IntelligentQuoteResult } from '../../utils/quoteCalculator';
import { ServiceType, TerrainType } from '../../types';

interface WebsitePortalProps {
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}

export const WebsitePortal: React.FC<WebsitePortalProps> = ({ activeModule, onNavigateModule }) => {
  const { saveIntelligentQuote, setActiveRole } = useMallaesa();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Monterrey, N.L.',
    address: '',
    service: 'malla_ciclonica',
    meters: 60,
    height: 2.0,
    terrain: 'tierra',
    addConcertinaTop: false,
    addBarbedWireTop: false,
    addGate: false,
    addPedestrianGate: false,
    addPrivacyTape: false,
    notes: ''
  });

  const [intelligentResult, setIntelligentResult] = useState<IntelligentQuoteResult | null>(null);

  // Live dynamic quote calculation for website
  const liveQuote = React.useMemo(() => {
    return calculateIntelligentQuote({
      clientName: formData.name || 'Prospecto',
      clientPhone: formData.phone,
      clientEmail: formData.email,
      projectAddress: formData.address,
      city: formData.city,
      serviceType: formData.service as ServiceType,
      linearMeters: Number(formData.meters) || 50,
      heightMeters: Number(formData.height) || 2.0,
      terrainType: (formData.terrain || 'tierra') as TerrainType,
      addConcertinaTop: formData.addConcertinaTop,
      addBarbedWireTop: formData.addBarbedWireTop,
      addGate: formData.addGate,
      addPedestrianGate: formData.addPedestrianGate,
      addPrivacyTape: formData.addPrivacyTape,
      notes: formData.notes
    });
  }, [formData]);

  React.useEffect(() => {
    if (activeModule && activeModule !== 'inicio') {
      const el = document.getElementById(activeModule);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeModule]);

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Por favor completa al menos tu nombre y teléfono para generar tu cotización oficial.');
      return;
    }

    const result = calculateIntelligentQuote({
      clientName: formData.name,
      clientPhone: formData.phone,
      clientEmail: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      projectAddress: formData.address || 'Ubicación en confirmación',
      city: formData.city,
      serviceType: formData.service as ServiceType,
      linearMeters: Number(formData.meters) || 50,
      heightMeters: Number(formData.height) || 2.0,
      terrainType: (formData.terrain || 'tierra') as TerrainType,
      addConcertinaTop: formData.addConcertinaTop,
      addBarbedWireTop: formData.addBarbedWireTop,
      addGate: formData.addGate,
      addPedestrianGate: formData.addPedestrianGate,
      addPrivacyTape: formData.addPrivacyTape,
      notes: formData.notes
    });

    saveIntelligentQuote(result);
    setIntelligentResult(result);
    try {
      confetti({ particleCount: 95, spread: 80, origin: { y: 0.6 } });
    } catch {}

    const contactEl = document.getElementById('contacto');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const SERVICES = [
    {
      id: 'malla_ciclonica',
      title: 'Malla Ciclónica Galvanizada & PVC',
      desc: 'El sistema más versátil y resistente para delimitación perimetral. Fabricada con alambre de acero galvanizado por inmersión en caliente o recubierta con PVC anticorrosivo en color verde y negro.',
      features: ['Calibres 10.5, 11 y 12.5 reforzados', 'Alturas desde 1.00m hasta 4.00m', 'Ideal para bodegas, predios e industrias', 'Resistencia total a la intemperie'],
      image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'reja_acero',
      title: 'Reja de Acero Ornamental',
      desc: 'Combinación perfecta de elegancia arquitectónica y protección de alta seguridad. Paneles electrosoldados con pliegues en forma de "V" y pintura poliéster termoendurecida.',
      features: ['Pintura electrostática verde, negra o blanca', 'Postes cuadrados con tapón hermético', 'Grapas y tornillería de seguridad inviolable', 'Apta para residencias y parques logísticos'],
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'concertina',
      title: 'Concertina de Seguridad & Arpón',
      desc: 'Elemento disuasivo de máxima eficacia física y psicológica para la coronación de bardas y cercados perimetrales. Cuchillas afiladas tipo arpón fabricadas en acero inoxidable.',
      features: ['Diámetros de 45cm y 60cm de espiral', 'Cuchillas tipo arpón de alta penetración', 'Alambre central de alta resistencia mecánica', 'Instalación con brazos galvanizados a 45°'],
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'cercos_electricos',
      title: 'Cercos Electrificados Industriales',
      desc: 'Protección activa con pulsos disuasivos de alto voltaje no letales. Sistema inteligente con supervisión continua de línea, energizador certificado, sirena y respaldo de batería.',
      features: ['Voltaje regulado de 10,000V a 14,000V', 'Avisos luminosos y sirena de 120dB', 'Líneas en acero inoxidable o alambre galvanizado', 'Cumplimiento con normas de seguridad NOM'],
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'malla_ganadera',
      title: 'Malla Ganadera & Alambre de Púas',
      desc: 'Diseñada especialmente para potreros, ranchos, predios rústicos y delimitación de ganado bovino y equino. Nudo articulado o graduado con alambre galvanizado clase comercial y pesada.',
      features: ['Nudos graduados que impiden el paso de animales', 'Alambre de púas de 2 hilos cal. 12.5 y 14', 'Postes T de fierro o postes de madera tratada', 'Bajo costo por metro lineal y gran durabilidad'],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'privacidad_follaje',
      title: 'Cinta de Privacidad & Follaje Artificial',
      desc: 'Soluciones estéticas para bloquear la visibilidad exterior hasta un 95%. La cinta rompevientos se teje directamente en la malla ciclónica, mientras que el follaje artificial brinda un aspecto natural sin mantenimiento.',
      features: ['Protección contra rayos UV anti-decoloración', 'Colores verde bosque, plata, blanco y café', 'Reducción de polvo y corrientes de viento', 'Cero necesidad de riego ni poda'],
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80'
    }
  ];

  const PROJECTS_GALLERY = [
    {
      title: 'Parque Industrial Mitras - 1,200 metros',
      category: 'Malla Ciclónica Industrial',
      location: 'García, Nuevo León',
      image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Fraccionamiento Residencial Cumbres - 450 metros',
      category: 'Reja de Acero Ornamental',
      location: 'Monterrey, Nuevo León',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Clínica Hospitalaria San Rafael - 180 metros',
      category: 'Concertina Arpón en Barda',
      location: 'Guadalupe, Nuevo León',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Rancho Campestre San Pedro - 3,500 metros',
      category: 'Malla Ganadera & Púas',
      location: 'El Carmen, Nuevo León',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="bg-white text-stone-900 -m-3.5 sm:-m-6 md:-m-8">
      {/* 1. TOP ANNOUNCEMENT & CONTACT BAR */}
      <div className="bg-black text-white text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-[#898A82]" />
              <strong>Monterrey:</strong> <a href="tel:8134060349" className="hover:text-white transition">(81) 3406-0349</a>
            </span>
            <span className="hidden sm:inline text-stone-600">|</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Phone className="w-3.5 h-3.5 text-[#898A82]" />
              <strong>San Luis Potosí:</strong> <a href="tel:4443339226" className="hover:text-white transition">(444) 333-9226</a>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-stone-300">
              <Mail className="w-3.5 h-3.5 text-[#898A82]" />
              ventas@mallaesamty.com
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:flex items-center gap-1 text-[11px] text-stone-400">
              <Clock className="w-3 h-3 text-[#898A82]" /> Lun-Vie 8:00 AM - 6:30 PM | Sáb 8:00 AM - 1:00 PM
            </span>
            <a
              href="https://wa.me/528134060349?text=Hola,%20me%20comunico%20desde%20www.mallaesa.com,%20deseo%20cotizar%20un%20cercado%20perimetral"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition"
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp Ventas
            </a>
            {/* Botón Acceso a Roles del Sistema */}
            <button
              onClick={() => setActiveRole(null)}
              className="flex items-center gap-1 px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded text-[11px] font-semibold border border-stone-700 transition cursor-pointer"
              title="Cambiar al selector de roles del sistema"
            >
              <Layers className="w-3 h-3 text-[#898A82]" />
              <span className="hidden sm:inline">Acceso al Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. INSTITUTIONAL WEBSITE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigateModule?.('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer focus:outline-hidden"
            >
              <img
                src="https://appdesignproyectos.com/mallaesalogo.png"
                alt="MALLAESA Seguridad Perimetral"
                className="h-10 sm:h-12 w-auto object-contain transition-transform hover:scale-102"
              />
            </button>
          </div>

          {/* Navigation Links en versión Fullscreen (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-stone-700">
            <button
              onClick={() => {
                onNavigateModule?.('inicio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'inicio' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Inicio
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('servicios');
                document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'servicios' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Servicios
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('nosotros');
                document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'nosotros' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Nosotros
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('proyectos');
                document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'proyectos' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Galería
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('contacto');
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'contacto' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Cotizador Inteligente
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* CTA Desktop */}
            <button
              onClick={() => {
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cotizar en Línea</span>
            </button>

            {/* Icono de Hamburguesa para Tablet y Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:text-black hover:bg-stone-100 transition focus:outline-hidden cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Responsivo para Tablet y Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-3 shadow-xl animate-fade-in">
            <div className="flex flex-col space-y-1 text-xs font-bold uppercase tracking-wider text-stone-700">
              <button
                onClick={() => {
                  onNavigateModule?.('inicio');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Inicio</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('servicios');
                  setMobileMenuOpen(false);
                  document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Servicios de Seguridad Perimetral</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('nosotros');
                  setMobileMenuOpen(false);
                  document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Nosotros & Garantía Mallaesa</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('proyectos');
                  setMobileMenuOpen(false);
                  document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Galería de Obras Instaladas</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('contacto');
                  setMobileMenuOpen(false);
                  document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-stone-100 text-black font-extrabold text-left transition border border-stone-200"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Cotizador Inteligente con PDF
                </span>
                <ChevronRight className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Accesos Rápidos en Móvil */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <a
                href="https://wa.me/528134060349?text=Hola,%20me%20comunico%20desde%20www.mallaesa.com,%20deseo%20cotizar"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Ventas (81) 3406-0349</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveRole('cliente');
                  }}
                  className="py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-[11px] border border-stone-300 transition"
                >
                  Portal de Clientes
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveRole(null);
                  }}
                  className="py-2 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-[11px] transition"
                >
                  Acceso a Roles
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION (www.mallaesa.com) */}
      <section className="relative bg-stone-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Dark Textured Background */}
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(#898A82_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#898A82] rounded-full filter blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800/80 border border-stone-700 rounded-full text-xs font-semibold text-stone-300">
            <Shield className="w-3.5 h-3.5 text-[#898A82]" />
            <span>MALLAESA • Más de 25 Años Blindando el Patrimonio de México</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Seguridad Perimetral & Cercados con Calidad Garantizada
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Venta, suministro e instalación profesional de <strong>malla ciclónica galvanizada</strong>, <strong>reja de acero</strong>, <strong>concertina arpón</strong> y <strong>cercos electrificados</strong> para industrias, parques logísticos, comercios, ranchos y residencias.
          </p>

          {/* Quick Badges */}
          <div className="pt-2 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs font-semibold text-stone-300">
            <span className="flex items-center gap-1 px-3 py-1.5 bg-stone-800/60 rounded-lg border border-stone-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acero 100% Galvanizado
            </span>
            <span className="flex items-center gap-1 px-3 py-1.5 bg-stone-800/60 rounded-lg border border-stone-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cobertura Nacional
            </span>
            <span className="flex items-center gap-1 px-3 py-1.5 bg-stone-800/60 rounded-lg border border-stone-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Póliza de Garantía por Escrito
            </span>
            <span className="flex items-center gap-1 px-3 py-1.5 bg-stone-800/60 rounded-lg border border-stone-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cuadrillas Certificadas
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigateModule?.('contacto')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-black hover:bg-stone-100 rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Solicitar Cotización Inmediata
            </button>
            <a
              href="tel:8134060349"
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent border-2 border-stone-600 hover:border-white text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-[#898A82]" />
              Llamar a un Especialista
            </a>
          </div>
        </div>
      </section>

      {/* 4. STATS NUMBERS BAR */}
      <section className="bg-stone-100 border-y border-stone-200 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black text-black">+25</p>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mt-1">Años de Experiencia</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-black">+15,000</p>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mt-1">Kilómetros Instalados</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-black">+8,500</p>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mt-1">Obras Concluidas</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-black">100%</p>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mt-1">Garantía Certificada</p>
          </div>
        </div>
      </section>

      {/* 5. SERVICES SECTION */}
      <section id="servicios" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
            Nuestros Productos & Soluciones
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-black">
            Soluciones Especializadas en Cercados Perimetrales
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            En <strong>MALLAESA</strong> fabricamos, suministramos e instalamos sistemas perimetrales con los más rigurosos estándares de resistencia mecánica y durabilidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                    MALLAESA Calidad
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-black">{srv.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{srv.desc}</p>

                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    {srv.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, service: srv.id }));
                    onNavigateModule?.('contacto');
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Cotizar este Sistema</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ABOUT US SECTION (NOSOTROS) */}
      <section id="nosotros" className="bg-stone-50 border-y border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
              Sobre MALLAESA
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black leading-tight">
              Más de 25 Años Brindando Protección y Tranquilidad
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              En <strong>MALLAESA (Cercas de Alambre)</strong> somos una empresa mexicana consolidada, líder en la protección perimetral. Nos dedicamos a salvaguardar los inmuebles de nuestros clientes a través de materiales galvanizados de primera calidad y mano de obra altamente especializada.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Entendemos que cada proyecto presenta desafíos únicos en topografía, tipo de suelo y requerimientos de seguridad. Por ello, nuestro equipo técnico realiza visitas de levantamiento y cálculos estructurales precisos para asegurar una instalación sólida, durable y libre de mantenimiento constante.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <Award className="w-6 h-6 text-[#898A82] mb-2" />
                <h4 className="font-bold text-sm text-black">Materia Prima Certificada</h4>
                <p className="text-xs text-stone-500 mt-1">Normas ASTM A392 y estándares de galvanizado de alta resistencia.</p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <Truck className="w-6 h-6 text-[#898A82] mb-2" />
                <h4 className="font-bold text-sm text-black">Entrega e Instalación</h4>
                <p className="text-xs text-stone-500 mt-1">Cuadrillas propias equipadas con transporte, herramientas y soldadura en obra.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-black border-b border-stone-100 pb-3">
                ¿Por Qué Elegir a MALLAESA?
              </h3>
              <ul className="space-y-3 text-xs text-stone-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Asesoría Técnica Personalizada:</strong> Evaluamos el terreno (firme, tierra, desniveles) para recomendar la profundidad y calibre óptimos.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Precios Directos de Fábrica:</strong> Sin intermediarios, asegurando la mejor relación costo-beneficio del mercado mexicano.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Presupuestos Formales Inmediatos:</strong> Cotizaciones desglosadas con materiales, mano de obra y tiempos claros de entrega.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Garantía por Escrito:</strong> Emitimos póliza digital formal que avala la fijación y protección contra la corrosión.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GALLERY SECTION */}
      <section id="proyectos" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
            Casos de Éxito
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-black">
            Galería de Obras Instaladas por MALLAESA
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Proyectos reales ejecutados en Nuevo León, Coahuila, San Luis Potosí y todo México.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROJECTS_GALLERY.map((proj, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden border border-stone-200 bg-black">
              <img
                src={proj.image}
                alt={proj.title}
                className="w-full h-56 object-cover opacity-90 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82]">
                  {proj.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">{proj.title}</h4>
                <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-[#898A82]" /> {proj.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. CONTACT & QUOTATION FORM */}
      <section id="contacto" className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
              Atención al Cliente & Ventas
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Cotiza tu Cercado en Menos de 24 Horas
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Completa el formulario y uno de nuestros ingenieros perimetrales se comunicará contigo con un presupuesto detallado.
            </p>

            {/* Direct Contacts */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Sucursal Monterrey, N.L.:</h4>
                  <p className="text-stone-300">Aaron Sáenz Garza 1900, Santa María, 64650 Monterrey, Nuevo León.</p>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">Tel: (81) 3406-0349</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Sucursal San Luis Potosí, S.L.P.:</h4>
                  <p className="text-stone-300">Calle Fidel Briano 110, Col. Morales Campestre, 78150 San Luis Potosí.</p>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">Tel: (444) 333-9226</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Correo Electrónico:</h4>
                  <p className="text-stone-300">ventas@mallaesamty.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3 bg-white text-black p-6 sm:p-8 rounded-2xl shadow-xl">
            {intelligentResult ? (
              <div className="space-y-5 animate-scale-in">
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <FileCheck2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-stone-100 text-black border border-stone-200 rounded">
                          {intelligentResult.folio}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Precio Exacto Oficial
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-black mt-0.5">
                        Cotización Formal para {intelligentResult.clientName}
                      </h3>
                    </div>
                  </div>

                  {/* Botón de Exportar a PDF */}
                  <button
                    onClick={() => exportQuoteToPdf(intelligentResult)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Exportar en PDF</span>
                  </button>
                </div>

                {/* Caja de Precio Exacto */}
                <div className="bg-stone-900 text-white p-5 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#898A82] block">
                    Inversión Total con IVA 16% Incluido:
                  </span>
                  <div className="text-3xl font-black font-mono text-white">
                    ${intelligentResult.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-stone-400">MXN</span>
                  </div>
                  <div className="pt-2 border-t border-stone-800 grid grid-cols-2 gap-2 text-xs text-stone-300">
                    <div>
                      <span>Anticipo 50%: </span>
                      <strong className="text-white">${intelligentResult.advance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div>
                      <span>Saldo Finiquito 50%: </span>
                      <strong className="text-white">${intelligentResult.balance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>

                {/* Resumen de Conceptos */}
                <div className="border border-stone-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="py-2 px-3">Concepto</th>
                        <th className="py-2 px-2 text-center">Cant.</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {intelligentResult.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-medium text-black">{item.description}</td>
                          <td className="py-2 px-2 text-center text-stone-500">{item.quantity} {item.unit}</td>
                          <td className="py-2 px-3 text-right font-bold font-mono text-black">
                            ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Acciones */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-between">
                  <button
                    onClick={() => setIntelligentResult(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition"
                  >
                    Cotizar otro metraje
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/528134060349?text=Hola%20MALLAESA,%20gener%C3%A9%20mi%20cotizaci%C3%B3n%20en%20l%C3%ADnea%20Folio:%20${intelligentResult.folio}%20por%20$${intelligentResult.total}%20MXN%20para%20${encodeURIComponent(intelligentResult.serviceLabel)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Ventas</span>
                    </a>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#898A82]" />
                      Imprimir
                    </button>
                    <button
                      onClick={() => exportQuoteToPdf(intelligentResult)}
                      className="px-5 py-2 bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Descargar PDF Oficial
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h3 className="text-base font-bold text-black">
                    Cotizador Inteligente con Precio en Línea
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Cálculo Exacto Inmediato
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Ing. Carlos Garza"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ej. 81-8399-2041"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black focus:outline-hidden focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Ciudad / Municipio *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ej. Monterrey, Apodaca, San Luis Potosí..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Sistema Requerido</label>
                    <select
                      value={formData.service}
                      onChange={e => setFormData({ ...formData, service: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    >
                      <option value="malla_ciclonica">Malla Ciclónica Galvanizada</option>
                      <option value="reja_acero">Reja de Acero Ornamental</option>
                      <option value="concertina">Concertina Arpón</option>
                      <option value="cerca_electrificada">Cerco Electrificado</option>
                      <option value="malla_ganadera">Malla Ganadera</option>
                      <option value="alambre_puas">Alambre de Púas</option>
                      <option value="cinta_privacidad">Cinta de Privacidad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Metros Lineales</label>
                    <input
                      type="number"
                      min="5"
                      value={formData.meters}
                      onChange={e => setFormData({ ...formData, meters: Number(e.target.value) })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-bold focus:outline-hidden focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Altura Deseada</label>
                    <select
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    >
                      <option value="1.5">1.50 metros</option>
                      <option value="2.0">2.00 metros</option>
                      <option value="2.5">2.50 metros</option>
                      <option value="3.0">3.00 metros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tipo de Terreno</label>
                    <select
                      value={formData.terrain}
                      onChange={e => setFormData({ ...formData, terrain: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black font-semibold focus:outline-hidden focus:border-black"
                    >
                      <option value="tierra">Tierra / Pasto Natural</option>
                      <option value="plano">Firme Plano Regular</option>
                      <option value="concreto">Concreto / Sobre Barda</option>
                      <option value="inclinado">Terreno Inclinado</option>
                      <option value="mixto">Mixto con Rocas</option>
                    </select>
                  </div>
                </div>

                {/* Accesorios y Complementos Opcionales */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-2">
                    Adicionales Opcionales para tu Proyecto
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.addConcertinaTop}
                        onChange={e => setFormData({ ...formData, addConcertinaTop: e.target.checked })}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="text-stone-800">Concertina Arpón superior</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.addBarbedWireTop}
                        onChange={e => setFormData({ ...formData, addBarbedWireTop: e.target.checked })}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="text-stone-800">3 Hilos alambre de púas</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.addGate}
                        onChange={e => setFormData({ ...formData, addGate: e.target.checked })}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="text-stone-800">Portón vehicular 4m</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.addPedestrianGate}
                        onChange={e => setFormData({ ...formData, addPedestrianGate: e.target.checked })}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="text-stone-800">Puerta peatonal 1m</span>
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.addPrivacyTape}
                        onChange={e => setFormData({ ...formData, addPrivacyTape: e.target.checked })}
                        className="rounded text-black focus:ring-black"
                      />
                      <span className="text-stone-800">Cinta rompevientos de privacidad</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Detalles del Perímetro o Comentarios</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Especifique detalles como portones especiales, acceso o restricciones de obra..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-black focus:outline-hidden focus:border-black resize-none"
                  ></textarea>
                </div>

                {/* Previsualización en Vivo del Precio */}
                <div className="p-3.5 bg-stone-100 rounded-xl flex flex-col sm:flex-row items-center justify-between border border-stone-200 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Precio Estimado en Vivo:
                    </span>
                    <span className="font-mono text-lg font-black text-black">
                      ${liveQuote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 text-right">
                    <span>Subtotal: ${liveQuote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} + IVA 16%</span>
                    <span className="block font-medium text-emerald-700">Incluye materiales, flete y mano de obra</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Calcular Precio Exacto & Generar Cotización Oficial en PDF
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. CORPORATE FOOTER */}
      <footer className="bg-black text-stone-400 py-12 px-4 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img
              src="https://appdesignproyectos.com/mallaesalogo.png"
              alt="MALLAESA"
              className="h-9 w-auto object-contain filter brightness-110"
            />
            <p className="text-[11px] text-stone-500 max-w-sm mt-1">
              MALLAESA S.A. DE C.V. — Soluciones líderes en seguridad perimetral, mallas ciclónicas y cercados de alta durabilidad en México.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-semibold text-stone-400">
            <a href="https://www.mallaesa.com" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">
              www.mallaesa.com <ExternalLink className="w-3 h-3" />
            </a>
            <span>Tel. (81) 3406-0349</span>
            <span>ventas@mallaesamty.com</span>
            <span>Monterrey & San Luis Potosí</span>
          </div>

          <div className="text-[10px] text-stone-600">
            © {new Date().getFullYear()} MALLAESA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
