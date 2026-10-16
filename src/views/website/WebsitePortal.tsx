import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
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
  HelpCircle,
  PackageCheck,
  Building2,
  Home,
  Compass,
  FileText,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateIntelligentQuote, exportQuoteToPdf, IntelligentQuoteResult } from '../../utils/quoteCalculator';
import { ServiceType, TerrainType } from '../../types';

interface WebsitePortalProps {
  activeModule: string;
  onNavigateModule?: (module: string) => void;
}

// Slides inspirados en los productos estrella de Malla Inde
const STAR_SLIDES = [
  {
    id: 'malla_ciclonica',
    badge: 'PRODUCTO ESTRELLA #1',
    title: 'Malla Ciclónica Galvanizada & PVC',
    subtitle: 'La solución líder en delimitación perimetral para industrias, predios y naves comerciales.',
    highlights: ['Calibre 10.5, 11 y 12.5 reforzado', 'Acero 100% galvanizado por inmersión', 'Alturas desde 1.00m hasta 4.00m', 'Stock permanente de entrega inmediata'],
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
    service: 'malla_ciclonica' as ServiceType
  },
  {
    id: 'reja_acero',
    badge: 'ESTÉTICA & MÁXIMA SEGURIDAD',
    title: 'Reja de Acero Ornamental Tipo Inde',
    subtitle: 'Paneles electrosoldados con pliegues en "V" de alta rigidez estructural y pintura horneada termoendurecida.',
    highlights: ['Pintura electrostática verde, negra o blanca', 'Postes cuadrados herméticos con tapón', 'Grapas de acero inoxidable inviolables', 'Cero mantenimiento y alta plusvalía'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    service: 'reja_acero' as ServiceType
  },
  {
    id: 'concertina',
    badge: 'PROTECCIÓN DISUASIVA',
    title: 'Concertina Helicoidal Arpón de Acero Inox',
    subtitle: 'El elemento físico más eficiente para coronación de bardas, muros y cercados de alta seguridad.',
    highlights: ['Cuchillas afiladas tipo arpón penetrante', 'Diámetros de 45cm y 60cm en espiral', 'Alma de alambre galvanizado alta tensión', 'Montaje con brazos reforzados a 45°'],
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    service: 'concertina' as ServiceType
  },
  {
    id: 'tuberia_postes',
    badge: 'ESTRUCTURA Y POSTERÍA',
    title: 'Postes y Tubería Galvanizada para Cercas',
    subtitle: 'Postes de línea, esquineros y tubo de arranque fabricados bajo normas de alta resistencia a la flexión.',
    highlights: ['Diámetros 38mm (1 1/2"), 48mm (1 7/8") y 60mm (2 3/8")', 'Cédula 20 y Cédula 30 anticorrosión', 'Tramos de 4.80m, 6.00m y cortes a medida', 'Accesorios de fijación incluidos'],
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    service: 'malla_ciclonica' as ServiceType
  }
];

// Catálogo completo por categorías estilo Malla Inde
const PRODUCTS_CATALOG = [
  {
    id: 'prod-1',
    category: 'mallas',
    categoryLabel: 'Mallas Ciclónicas',
    title: 'Malla Ciclón Galvanizada Cal. 10.5',
    specs: 'Abertura 55x55mm • Alturas 1.50m, 2.00m, 2.50m, 3.00m • Rollo 20m',
    desc: 'Alambre de acero galvanizado clase comercial y pesada. Máxima resistencia a la tracción y climas extremos.',
    badge: 'Fabricación Directa',
    serviceType: 'malla_ciclonica' as ServiceType,
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-2',
    category: 'mallas',
    categoryLabel: 'Mallas Ciclónicas',
    title: 'Malla Ciclón Plastificada con PVC Verde',
    specs: 'Alambre interior galvanizado recubierto con PVC térmico anticorrosivo • Color verde bosque o negro',
    desc: 'Especial para zonas húmedas, albercas, jardines residenciales y deportivos. Cero mantenimiento.',
    badge: 'Garantía 5 Años',
    serviceType: 'malla_ciclonica' as ServiceType,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-3',
    category: 'rejas',
    categoryLabel: 'Rejas de Acero',
    title: 'Reja de Acero Inde con Pliegues en V',
    specs: 'Paneles de 2.50m ancho • Alturas 1.00m a 2.50m • Calibre 6 alta rigidez',
    desc: 'Electrosoldada con pintura poliéster horneada. Brinda gran vista arquitectónica y solidez impenetrable.',
    badge: 'Pintura Horneada',
    serviceType: 'reja_acero' as ServiceType,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-4',
    category: 'concertinas',
    categoryLabel: 'Concertinas & Púas',
    title: 'Concertina Arpón Galvanizada 45cm',
    specs: 'Espiral de 45cm • Cuchillas arpón 22mm • Acero galvanizado o inoxidable • Rinde 8m',
    desc: 'Especial para remate de bardas perimetrales residenciales, bodegas y penitenciarias.',
    badge: 'Alta Disuasión',
    serviceType: 'concertina' as ServiceType,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-5',
    category: 'concertinas',
    categoryLabel: 'Concertinas & Púas',
    title: 'Alambre de Púas Galvanizado 2 Hilos',
    specs: 'Calibre 12.5 y 14 • 4 puntas de púas afiladas cada 10cm • Rollos de 300m y 360m',
    desc: 'Líder en delimitación rural, ganadera y de terrenos campestres. Acero resistente al estiramiento.',
    badge: 'Económico & Durable',
    serviceType: 'alambre_puas' as ServiceType,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-6',
    category: 'postes',
    categoryLabel: 'Tubería & Postes',
    title: 'Postes de Línea y Esquinas Galvanizados',
    specs: 'Diámetros 48mm (1 7/8") y 60mm (2 3/8") • Calibre 20 y Cédula 30 • Con tapón hermético',
    desc: 'Tubería estructural galvanizada por inmersión en caliente. Soporte rígido para malla ciclón y reja.',
    badge: 'Cédula Estructural',
    serviceType: 'malla_ciclonica' as ServiceType,
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-7',
    category: 'ganadera',
    categoryLabel: 'Malla Ganadera',
    title: 'Malla Borreguera / Graduada Cal. 12.5',
    specs: 'Rollo de 100m • Altura 1.00m a 1.40m • Alambre galvanizado con nudo bisagra',
    desc: 'Diseño de aberturas más estrechas abajo para evitar el escape de ganado ovino y animales pequeños.',
    badge: 'Uso Agropecuario',
    serviceType: 'malla_ganadera' as ServiceType,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-8',
    category: 'privacidad',
    categoryLabel: 'Privacidad & Cinta',
    title: 'Cinta Plástica Rompevientos con Filtro UV',
    specs: 'Ancho 63mm para tejido en malla • Colores verde, blanco, plata y café • Protección 95%',
    desc: 'Oculta la visibilidad interior, mitiga corrientes de viento y polvo. Incluye broches de fijación.',
    badge: 'Protección UV 95%',
    serviceType: 'cinta_privacidad' as ServiceType,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
  }
];

// Accesorios destacados estilo Malla Inde
const ACCESSORIES_LIST = [
  { name: 'Abrazadera de Tensión', desc: 'Sujeta la solera de arranque al poste esquinero', badge: 'Galv. Coche' },
  { name: 'Abrazadera de Arranque', desc: 'Fija el tubo superior al poste de soporte inicial', badge: '1 7/8" y 2 3/8"' },
  { name: 'Solera de Remate', desc: 'Solera galvanizada perforada para tensión de malla', badge: 'Calibre 1/8"' },
  { name: 'Bayoneta para Concertina', desc: 'Brazo inclinado a 45° para alambre de púas o arpón', badge: 'Aluminio / Acero' },
  { name: 'Tapón Cúpula Hermético', desc: 'Impide filtración de agua dentro del poste hueco', badge: 'Antioxidación' },
  { name: 'Cople de Tubería', desc: 'Une tramos de tubo superior de 6 metros corridos', badge: '1 1/2" y 1 3/8"' },
  { name: 'Broches para Cinta', desc: 'Fijadores a presión para extremos de cinta plástica', badge: 'Bolsa 100 pzas' },
  { name: 'Tornillo de Coche', desc: 'Tornillería galvanizada cabeza de gota 5/16" x 1 1/4"', badge: 'Grado 2 Galv.' }
];

// Soluciones por segmento / industria
const SOLUTIONS_SEGMENTS = [
  {
    title: 'Parques Industriales & Bodegas',
    desc: 'Cercados de alta especificación para protección de naves, bodegas de logística, patios de maniobras y subestaciones eléctricas.',
    recommended: 'Malla Ciclónica Cal. 10.5 con Concertina Arpón Doble',
    icon: <Building2 className="w-6 h-6 text-black" />
  },
  {
    title: 'Residencial & Fraccionamientos',
    desc: 'Combinación perfecta de elegancia arquitectónica, privacidad y disuasión perimetral para cotos y residencias particulares.',
    recommended: 'Reja de Acero Ornamental + Cinta Rompevientos',
    icon: <Home className="w-6 h-6 text-black" />
  },
  {
    title: 'Ranchos & Sector Agropecuario',
    desc: 'Delimitación de grandes extensiones rústicas, corrales de engorda, potreros y división de potreros para ganado mayor y menor.',
    recommended: 'Malla Ganadera Graduada + Alambre de Púas 2 Hilos',
    icon: <Compass className="w-6 h-6 text-black" />
  },
  {
    title: 'Centros Deportivos & Escuelas',
    desc: 'Cercados seguros para canchas de fútbol rápido, frontón, áreas recreativas infantiles e instalaciones escolares.',
    recommended: 'Malla Ciclón con PVC Plastificado Verde / Negro',
    icon: <Award className="w-6 h-6 text-black" />
  }
];

export const WebsitePortal: React.FC<WebsitePortalProps> = ({ activeModule, onNavigateModule }) => {
  const { saveIntelligentQuote, setActiveRole } = useMallaesa();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Formulario de cotización inteligente
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Monterrey, N.L.',
    address: '',
    service: 'malla_ciclonica' as ServiceType,
    meters: 60,
    height: 2.0,
    terrain: 'tierra' as TerrainType,
    addConcertinaTop: false,
    addBarbedWireTop: false,
    addGate: false,
    addPedestrianGate: false,
    addPrivacyTape: false,
    notes: ''
  });

  const [intelligentResult, setIntelligentResult] = useState<IntelligentQuoteResult | null>(null);

  // Auto rotación del carrusel cada 7 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % STAR_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Live dynamic quote calculation
  const liveQuote = useMemo(() => {
    return calculateIntelligentQuote({
      clientName: formData.name || 'Prospecto',
      clientPhone: formData.phone,
      clientEmail: formData.email,
      projectAddress: formData.address,
      city: formData.city,
      serviceType: formData.service,
      linearMeters: Number(formData.meters) || 50,
      heightMeters: Number(formData.height) || 2.0,
      terrainType: formData.terrain,
      addConcertinaTop: formData.addConcertinaTop,
      addBarbedWireTop: formData.addBarbedWireTop,
      addGate: formData.addGate,
      addPedestrianGate: formData.addPedestrianGate,
      addPrivacyTape: formData.addPrivacyTape,
      notes: formData.notes
    });
  }, [formData]);

  // Manejo de scroll a módulo activo
  useEffect(() => {
    if (activeModule && activeModule !== 'inicio') {
      const el = document.getElementById(activeModule);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeModule]);

  // Envío del cotizador inteligente
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Por favor completa al menos tu nombre y número telefónico para emitir tu cotización formal.');
      return;
    }

    const result = calculateIntelligentQuote({
      clientName: formData.name,
      clientPhone: formData.phone,
      clientEmail: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      projectAddress: formData.address || 'Ubicación en confirmación',
      city: formData.city,
      serviceType: formData.service,
      linearMeters: Number(formData.meters) || 50,
      heightMeters: Number(formData.height) || 2.0,
      terrainType: formData.terrain,
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

  const handleSelectProductToQuote = (service: ServiceType) => {
    setFormData(prev => ({ ...prev, service }));
    onNavigateModule?.('contacto');
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrado de productos por categoría
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'todos') return PRODUCTS_CATALOG;
    return PRODUCTS_CATALOG.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="bg-white text-stone-900 selection:bg-neutral-800 selection:text-white">
      {/* ========================================================
          1. TOP ANNOUNCEMENT & CONTACT BAR (Estilo Malla Inde)
         ======================================================== */}
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
              className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition shadow-xs"
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

      {/* ========================================================
          2. INSTITUTIONAL WEBSITE HEADER (Fullscreen & Hamburguesa)
         ======================================================== */}
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
                onNavigateModule?.('catalogo');
                document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'catalogo' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Catálogo de Productos
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('accesorios');
                document.getElementById('accesorios')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'accesorios' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Accesorios & Postes
            </button>
            <button
              onClick={() => {
                onNavigateModule?.('soluciones');
                document.getElementById('soluciones')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'soluciones' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Soluciones
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
                onNavigateModule?.('contacto');
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`hover:text-black transition cursor-pointer ${activeModule === 'contacto' ? 'text-black border-b-2 border-black pb-1' : ''}`}
            >
              Cotizador Inteligente
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Descargar Catálogo PDF */}
            <button
              onClick={() => setShowCatalogModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-xs border border-stone-300 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#898A82]" />
              <span>Ficha Técnica PDF</span>
            </button>

            {/* CTA Desktop */}
            <button
              onClick={() => {
                document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hidden sm:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cotizar con Precio Exacto</span>
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
                  onNavigateModule?.('catalogo');
                  setMobileMenuOpen(false);
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Catálogo de Productos de Acero</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('accesorios');
                  setMobileMenuOpen(false);
                  document.getElementById('accesorios')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Accesorios, Postes & Herrajes</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onNavigateModule?.('soluciones');
                  setMobileMenuOpen(false);
                  document.getElementById('soluciones')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-stone-100 text-left transition"
              >
                <span>Soluciones por Industria</span>
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
                    setShowCatalogModal(true);
                  }}
                  className="py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-[11px] border border-stone-300 transition"
                >
                  Descargar Catálogo
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

      {/* ========================================================
          3. HERO SECTION INTERACTIVO / SLIDER ESTILO MALLA INDE
         ======================================================== */}
      <section id="inicio" className="relative bg-stone-900 text-white overflow-hidden">
        {/* Imagen de fondo del slide activo con filtro */}
        <div className="absolute inset-0 z-0">
          <img
            src={STAR_SLIDES[activeSlide].image}
            alt={STAR_SLIDES[activeSlide].title}
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#898A82_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 min-h-[580px] flex flex-col justify-center">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800/90 border border-stone-700 rounded-full text-xs font-semibold text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{STAR_SLIDES[activeSlide].badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {STAR_SLIDES[activeSlide].title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-stone-300 font-normal leading-relaxed">
              {STAR_SLIDES[activeSlide].subtitle}
            </p>

            {/* Viñetas técnicas destacadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {STAR_SLIDES[activeSlide].highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleSelectProductToQuote(STAR_SLIDES[activeSlide].service)}
                className="w-full sm:w-auto px-7 py-3.5 bg-white text-black hover:bg-stone-100 rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cotizar Este Producto con Precio Exacto</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-stone-800/80 hover:bg-stone-700 text-white rounded-xl font-bold text-sm border border-stone-600 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ver Catálogo Completo</span>
              </button>
            </div>
          </div>

          {/* Selector de Slides / Pestañas inferiores del Hero */}
          <div className="mt-12 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STAR_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(index)}
                className={`p-2.5 rounded-lg text-left transition cursor-pointer ${
                  activeSlide === index
                    ? 'bg-stone-800 border-l-3 border-[#898A82] text-white shadow-md'
                    : 'bg-stone-900/60 hover:bg-stone-800/60 text-stone-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                  0{index + 1}
                </span>
                <span className="text-xs font-bold truncate block">
                  {slide.title.split('&')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4. FRANJA DE VALOR Y CONFIANZA DEL FABRICANTE (Malla Inde)
         ======================================================== */}
      <section className="bg-stone-100 border-b border-stone-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl">
              <PackageCheck className="w-5 h-5 text-[#898A82]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-black uppercase tracking-wider">Fabricación Directa</h4>
              <p className="text-[11px] text-stone-500">Sin intermediarios, precios directos de planta.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl">
              <Shield className="w-5 h-5 text-[#898A82]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-black uppercase tracking-wider">Normas ASTM A392</h4>
              <p className="text-[11px] text-stone-500">Acero 100% galvanizado por inmersión.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl">
              <Truck className="w-5 h-5 text-[#898A82]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-black uppercase tracking-wider">Stock Inmediato</h4>
              <p className="text-[11px] text-stone-500">Rollos, postes y accesorios listos para despacho.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-white rounded-xl">
              <Award className="w-5 h-5 text-[#898A82]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-black uppercase tracking-wider">Cobertura Nacional</h4>
              <p className="text-[11px] text-stone-500">Suministro e instalación en todo México.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CATÁLOGO CATEGORIZADO DE PRODUCTOS (Estilo Malla Inde)
         ======================================================== */}
      <section id="catalogo" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
              Catálogo de Soluciones de Acero
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              Productos Especializados en Cercado y Seguridad
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Soluciones integrales de alambre galvanizado, mallas electrosoldadas, concertinas y accesorios con durabilidad garantizada contra la intemperie.
            </p>
          </div>

          {/* Botón Descargar Catálogo */}
          <button
            onClick={() => setShowCatalogModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-xs transition cursor-pointer self-start md:self-end"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar Catálogo Completo</span>
          </button>
        </div>

        {/* Filtros por Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos los Productos' },
            { id: 'mallas', label: 'Mallas Ciclónicas & PVC' },
            { id: 'rejas', label: 'Rejas de Acero Inde' },
            { id: 'concertinas', label: 'Concertinas & Púas' },
            { id: 'postes', label: 'Tubería & Postes' },
            { id: 'ganadera', label: 'Malla Ganadera' },
            { id: 'privacidad', label: 'Cinta de Privacidad' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cuadrícula de Tarjetas de Producto estilo E-Commerce Técnico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map(prod => (
            <div
              key={prod.id}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Imagen del Producto */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 bg-black/85 backdrop-blur-md text-white font-bold text-[10px] rounded-md tracking-wider uppercase">
                      {prod.badge}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 bg-white/90 text-stone-700 font-semibold text-[10px] rounded border border-stone-200">
                      {prod.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Contenido Técnico */}
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-black leading-snug group-hover:text-black">
                    {prod.title}
                  </h3>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200/60 text-[11px] font-mono text-stone-700">
                    {prod.specs}
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {prod.desc}
                  </p>
                </div>
              </div>

              {/* Botón de Cotización Directa */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleSelectProductToQuote(prod.serviceType)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-black hover:text-white text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cotizar este Producto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN DE ACCESORIOS, POSTES Y HERRAJES (Malla Inde)
         ======================================================== */}
      <section id="accesorios" className="bg-stone-50 border-y border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
              Componentes Estructurales & Herrajes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black">
              Accesorios y Postería para Instalación Profesional
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Contamos con toda la línea de herrajes galvanizados por inmersión para contratistas, herreros y proyectos industriales que requieren máxima resistencia a la corrosión.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {ACCESSORIES_LIST.map((acc, i) => (
              <div
                key={i}
                className="p-4 bg-white border border-stone-200 rounded-xl hover:border-black transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-black">{acc.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                      {acc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 leading-snug">{acc.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
                  <span className="text-emerald-700 font-semibold">Stock Disponible</span>
                  <Wrench className="w-3.5 h-3.5 text-[#898A82]" />
                </div>
              </div>
            ))}
          </div>

          {/* Banner de Suministro al Mayoreo */}
          <div className="p-6 bg-black text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-bold text-sm sm:text-base text-white">¿Eres contratista, instalador o distribuidor?</h4>
              <p className="text-xs text-stone-300">Ofrecemos precios especiales por tonelada de rollo y atado de postes galvanizados con entrega en obra.</p>
            </div>
            <a
              href="https://wa.me/528134060349?text=Hola,%20deseo%20informaci%C3%B3n%20para%20compras%20al%20mayoreo%20de%20mallas%20y%20postes"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a Ventas Mayoreo</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SOLUCIONES POR SEGMENTO / INDUSTRIA (Estilo Malla Inde)
         ======================================================== */}
      <section id="soluciones" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
            Aplicaciones Especializadas
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-black">
            Soluciones Perimetrales Adaptadas a Cada Sector
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Diseñamos la combinación ideal de materiales, alturas y anclajes según las características de tu terreno y nivel de riesgo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SOLUTIONS_SEGMENTS.map((seg, idx) => (
            <div
              key={idx}
              className="p-6 bg-white border border-stone-200 rounded-2xl hover:border-black hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="p-3 bg-stone-100 rounded-xl w-fit">
                  {seg.icon}
                </div>
                <h3 className="font-bold text-base text-black">{seg.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{seg.desc}</p>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-[#898A82] block mb-1">
                  Sistema Recomendado:
                </span>
                <span className="text-xs font-bold text-black block leading-tight">
                  {seg.recommended}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          8. SECCIÓN SOBRE NOSOTROS & GARANTÍA MALLAESA
         ======================================================== */}
      <section id="nosotros" className="bg-stone-50 border-t border-stone-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
              Trayectoria & Confiabilidad
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black leading-tight">
              Más de 25 Años Salvaguardando el Patrimonio de México
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              En <strong>MALLAESA</strong> nos consolidamos como fabricantes e instaladores líderes en cercados y seguridad perimetral. Controlamos todo el proceso desde el suministro de acero con inmersión en caliente hasta el hincado, colado y tensado final en sitio.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Entendemos que cada terreno presenta retos en topografía y condiciones climáticas. Nuestras cuadrillas cuentan con herramientas de nivel láser, malacates mecánicos y generadores portátiles para instalar cercados de kilómetros en tiempo récord.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <Award className="w-6 h-6 text-[#898A82] mb-1.5" />
                <h4 className="font-bold text-xs text-black">Materia Prima ASTM</h4>
                <p className="text-[11px] text-stone-500">Galvanizado de alta resistencia contra corrosión salina y humedad.</p>
              </div>
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <FileCheck2 className="w-6 h-6 text-[#898A82] mb-1.5" />
                <h4 className="font-bold text-xs text-black">Garantía Certificada</h4>
                <p className="text-[11px] text-stone-500">Emitimos póliza digital por escrito de 3 años por proyecto.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-black border-b border-stone-100 pb-3">
              Ventajas Competitivas de MALLAESA
            </h3>
            <ul className="space-y-3 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cotizador Inteligente con Precio Exacto:</strong> Obtén de manera autónoma el costo exacto con desglose de materiales, mano de obra e IVA, exportable a PDF oficial.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Precios de Fabricante:</strong> Sin comisiones ni intermediarios comerciales.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cuadrillas Propias Certificadas:</strong> Personal con IMSS, equipo de protección personal (EPP) y certificación DC-3 de trabajos en alturas.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Facturación Fiscal Inmediata (CFDI 4.0):</strong> Cumplimiento total ante el SAT con desglose de IVA y comprobantes válidos.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. COTIZADOR INTELIGENTE CON PRECIO EXACTO & EXPORTACIÓN EN PDF (Requerimiento 5)
         ======================================================== */}
      <section id="contacto" className="py-16 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* Columna de Información */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#898A82]">
                Cotizador Inteligente MALLAESA
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Cotiza en Línea con Precio Exacto al Instante
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Ingresa las medidas y especificaciones de tu proyecto. El motor calculará automáticamente la cantidad de rollos, postes, abrazaderas, concreto y mano de obra para darte un <strong>precio exacto definitivo</strong> con opción de <strong>descargar la cotización oficial en PDF</strong>.
              </p>
            </div>

            {/* Sucursales y Contactos */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Matriz Monterrey, N.L.:</h4>
                  <p className="text-stone-300">Aarón Sáenz Garza 1900, Santa María, 64650 Monterrey, Nuevo León.</p>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">Tel: (81) 3406-0349</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Sucursal San Luis Potosí, S.L.P.:</h4>
                  <p className="text-stone-300">Calle Fidel Briano 110, Morales Campestre, 78150 San Luis Potosí.</p>
                  <p className="font-mono text-emerald-400 font-bold mt-0.5">Tel: (444) 333-9226</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-800 rounded-lg text-[#898A82]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Correo Oficial de Ventas:</h4>
                  <p className="text-stone-300">ventas@mallaesamty.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna del Formulario / Resultado de Cotización */}
          <div className="lg:col-span-3 bg-white text-black p-6 sm:p-8 rounded-2xl shadow-2xl">
            {intelligentResult ? (
              <div className="space-y-5 animate-scale-in">
                {/* Encabezado del Resultado */}
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

                {/* Banner de Precio Exacto Total */}
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

                {/* Tabla Desglosada de Conceptos */}
                <div className="border border-stone-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="py-2 px-3">Concepto / Material</th>
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

                {/* Acciones del Presupuesto */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-between items-center">
                  <button
                    onClick={() => setIntelligentResult(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition"
                  >
                    Cotizar otro metraje
                  </button>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
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
                    Calculadora Inteligente de Cercado Perimetral
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
                      onChange={e => setFormData({ ...formData, service: e.target.value as ServiceType })}
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
                      onChange={e => setFormData({ ...formData, terrain: e.target.value as TerrainType })}
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

                {/* Accesorios y Adicionales Opcionales */}
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

      {/* ========================================================
          10. CORPORATE FOOTER (Estilo Malla Inde)
         ======================================================== */}
      <footer className="bg-black text-stone-400 py-12 px-4 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <img
                src="https://appdesignproyectos.com/mallaesalogo.png"
                alt="MALLAESA"
                className="h-10 w-auto object-contain filter brightness-110"
              />
              <p className="text-[11px] text-stone-400 leading-relaxed">
                MALLAESA S.A. DE C.V. — Fabricantes e instaladores especializados en cercados de alambre galvanizado, mallas ciclónicas y seguridad perimetral de alta durabilidad en México.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Líneas de Producto</h5>
              <ul className="space-y-1.5 text-[11px] text-stone-400">
                <li>Malla Ciclónica Galvanizada</li>
                <li>Malla con Recubrimiento PVC</li>
                <li>Reja de Acero Ornamental</li>
                <li>Concertina Helicoidal Arpón</li>
                <li>Cercos Electrificados 14,000V</li>
                <li>Malla Ganadera y Púas</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Soporte & Clientes</h5>
              <ul className="space-y-1.5 text-[11px] text-stone-400">
                <li><button onClick={() => setShowCatalogModal(true)} className="hover:text-white transition">Ficha Técnica en PDF</button></li>
                <li><button onClick={() => setActiveRole('cliente')} className="hover:text-white transition">Portal de Seguimiento con Folio</button></li>
                <li><button onClick={() => setActiveRole(null)} className="hover:text-white transition">Acceso al Sistema de Roles</button></li>
                <li>Garantía por Escrito 3 Años</li>
                <li>Facturación Electrónica CFDI 4.0</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Contacto Directo</h5>
              <div className="space-y-2 text-[11px] text-stone-400">
                <p><strong>Monterrey:</strong> (81) 3406-0349</p>
                <p><strong>San Luis Potosí:</strong> (444) 333-9226</p>
                <p><strong>Email:</strong> ventas@mallaesamty.com</p>
                <p>Aarón Sáenz Garza 1900, Monterrey, N.L.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-stone-500">
            <span>© {new Date().getFullYear()} MALLAESA. Todos los derechos reservados. Fabricantes de Soluciones Perimetrales.</span>
            <span>Diseño optimizado para computadoras, tablets y dispositivos móviles (PWA).</span>
          </div>
        </div>
      </footer>

      {/* ========================================================
          11. MODAL DE FICHA TÉCNICA Y CATÁLOGO DIGITAL EN PDF
         ======================================================== */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" />
                <h3 className="font-bold text-base text-black">Catálogo y Ficha Técnica MALLAESA</h3>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <p>
                Descarga o consulta las especificaciones técnicas completas de nuestros sistemas de acero:
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Malla Ciclónica:</span>
                  <span>Calibres 10.5, 11 y 12.5 (ASTM A392)</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Reja de Acero:</span>
                  <span>Varilla cal. 6 con pintura poliéster</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Concertina Arpón:</span>
                  <span>Acero inoxidable 45cm y 60cm</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Tubería Galvanizada:</span>
                  <span>Cédula 20 y Cédula 30 estructural</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  // Genera un PDF de muestra de catálogo
                  const demoQuote = calculateIntelligentQuote({
                    clientName: 'Cliente Consulta Catálogo',
                    clientPhone: '(81) 3406-0349',
                    clientEmail: 'ventas@mallaesamty.com',
                    projectAddress: 'Catálogo de Especificaciones Técnicas',
                    city: 'Monterrey, N.L.',
                    serviceType: 'malla_ciclonica',
                    linearMeters: 100,
                    heightMeters: 2.0,
                    terrainType: 'tierra',
                    addConcertinaTop: true,
                    addGate: true
                  });
                  exportQuoteToPdf(demoQuote);
                  setShowCatalogModal(false);
                }}
                className="flex-1 py-2.5 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Descargar Ficha en PDF</span>
              </button>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
