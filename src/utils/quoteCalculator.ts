import { ServiceType, TerrainType, QuoteItem } from '../types';
import jsPDF from 'jspdf';

export interface IntelligentQuoteInput {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectAddress: string;
  city: string;
  serviceType: ServiceType;
  linearMeters: number;
  heightMeters: number;
  terrainType: TerrainType;
  // Optional add-ons
  addConcertinaTop?: boolean;
  addBarbedWireTop?: boolean;
  addGate?: boolean;
  addPedestrianGate?: boolean;
  addPrivacyTape?: boolean;
  notes?: string;
}

export interface IntelligentQuoteResult {
  folio: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectAddress: string;
  city: string;
  serviceType: ServiceType;
  serviceLabel: string;
  linearMeters: number;
  heightMeters: number;
  terrainType: TerrainType;
  terrainLabel: string;
  items: QuoteItem[];
  subtotal: number;
  iva: number;
  total: number;
  advance50: number;
  balance50: number;
  estimatedWorkDays: number;
  warrantyYears: number;
  rawMaterials?: QuoteItem[];
  rawMaterialsCost?: number;
  profitMarginPercent?: number;
  profitAmount?: number;
  clientConcepts?: QuoteItem[];
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  malla_ciclonica: 'Malla Ciclónica Galvanizada Calibre 10.5',
  concertina: 'Concertina Helicoidal Arpón de Alta Seguridad',
  reja_acero: 'Reja de Acero Ornamental Electrosoldada',
  malla_ganadera: 'Malla Ganadera Borreguera Nudo Graduado',
  cerca_electrificada: 'Cerco Electrificado Industrial 14,000V',
  alambre_puas: 'Cercado de Alambre de Púas Galvanizado',
  cinta_privacidad: 'Cinta Rompevientos de Privacidad Térmica'
};

const TERRAIN_LABELS: Record<TerrainType, string> = {
  plano: 'Firme regular y plano',
  inclinado: 'Terreno inclinado con desniveles',
  tierra: 'Tierra natural o pasto',
  concreto: 'Firme de concreto o sobre barda',
  mixto: 'Mixto con zonas rocosas'
};

export function calculateIntelligentQuote(input: IntelligentQuoteInput): IntelligentQuoteResult {
  const meters = Math.max(5, Number(input.linearMeters) || 50);
  const height = Number(input.heightMeters) || 2.0;
  const terrain = input.terrainType || 'tierra';
  const service = input.serviceType || 'malla_ciclonica';

  const items: QuoteItem[] = [];
  let itemId = 1;

  // Multiplier for terrain difficulty
  let terrainLaborRate = 110;
  let terrainFactorDesc = '';
  switch (terrain) {
    case 'plano':
      terrainLaborRate = 95;
      terrainFactorDesc = 'terreno regular';
      break;
    case 'tierra':
      terrainLaborRate = 110;
      terrainFactorDesc = 'tierra natural';
      break;
    case 'inclinado':
      terrainLaborRate = 135;
      terrainFactorDesc = 'desniveles y pendientes';
      break;
    case 'concreto':
      terrainLaborRate = 145;
      terrainFactorDesc = 'anclaje taqueteado en concreto/barda';
      break;
    case 'mixto':
      terrainLaborRate = 160;
      terrainFactorDesc = 'suelo mixto y rocoso';
      break;
  }

  if (service === 'malla_ciclonica') {
    const rolls = Math.ceil(meters / 20);
    const rollPrice = height <= 1.5 ? 1450 : height <= 2.0 ? 1750 : height <= 2.5 ? 2150 : 2650;
    items.push({
      id: String(itemId++),
      description: `Malla Ciclónica Galvanizada Calibre 10.5 de ${height.toFixed(2)}m alto (${rolls} rollos de 20m c/u)`,
      quantity: rolls,
      unit: 'Rollo 20m',
      unitPrice: rollPrice,
      total: rolls * rollPrice
    });

    const linePosts = Math.ceil(meters / 3);
    const postHeight = height + 0.6;
    const postPrice = height <= 2.0 ? 210 : 280;
    items.push({
      id: String(itemId++),
      description: `Postes de Línea Galvanizados 48mm (1 7/8") x ${postHeight.toFixed(2)}m`,
      quantity: linePosts,
      unit: 'Pieza',
      unitPrice: postPrice,
      total: linePosts * postPrice
    });

    const cornerPosts = Math.max(4, Math.ceil(meters / 50) * 2);
    items.push({
      id: String(itemId++),
      description: `Postes de Esquina y Arranque Reforzados 60mm (2 3/8") x ${(postHeight + 0.2).toFixed(2)}m`,
      quantity: cornerPosts,
      unit: 'Pieza',
      unitPrice: 360,
      total: cornerPosts * 360
    });

    const topTubes = Math.ceil(meters / 6);
    items.push({
      id: String(itemId++),
      description: `Tubo Superior / Marco Galvanizado 38mm (1 1/2") tramos de 6.00m`,
      quantity: topTubes,
      unit: 'Tramo 6m',
      unitPrice: 265,
      total: topTubes * 265
    });

    const clamps = linePosts * 3;
    items.push({
      id: String(itemId++),
      description: `Kits de Fijación Galvanizados (Abrazaderas de tensión, soleras, coples y tornillería)`,
      quantity: clamps,
      unit: 'Kit',
      unitPrice: 22,
      total: clamps * 22
    });

    if (terrain !== 'concreto') {
      const cementBags = Math.ceil(linePosts * 0.55);
      items.push({
        id: String(itemId++),
        description: `Cemento Gris Tolteca 50kg para colado y anclaje de postes`,
        quantity: cementBags,
        unit: 'Saco 50kg',
        unitPrice: 245,
        total: cementBags * 245
      });
    }

    items.push({
      id: String(itemId++),
      description: `Mano de obra técnica en excavación, plomeado, fijación y tensado (${terrainFactorDesc})`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: terrainLaborRate,
      total: meters * terrainLaborRate
    });
  } else if (service === 'reja_acero') {
    const panels = Math.ceil(meters / 2.5);
    const panelPrice = height <= 1.5 ? 980 : height <= 2.0 ? 1180 : 1480;
    items.push({
      id: String(itemId++),
      description: `Paneles Reja de Acero Electrosoldada con pintura poliéster horneada 2.50m x ${height.toFixed(2)}m`,
      quantity: panels,
      unit: 'Panel 2.5m',
      unitPrice: panelPrice,
      total: panels * panelPrice
    });

    const posts = panels + 1;
    items.push({
      id: String(itemId++),
      description: `Poste Cuadrado 60x60mm con base taqueteada o para ahogar con tapón hermético`,
      quantity: posts,
      unit: 'Poste',
      unitPrice: 380,
      total: posts * 380
    });

    const clamps = panels * 4;
    items.push({
      id: String(itemId++),
      description: `Grapas de seguridad metálicas y tornillería anticorrosiva de fijación`,
      quantity: clamps,
      unit: 'Kit',
      unitPrice: 35,
      total: clamps * 35
    });

    items.push({
      id: String(itemId++),
      description: `Mano de obra de alineación milimétrica, fijación de postes e instalación de paneles`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: terrainLaborRate + 20,
      total: meters * (terrainLaborRate + 20)
    });
  } else if (service === 'concertina') {
    const rolls = Math.ceil(meters / 8);
    items.push({
      id: String(itemId++),
      description: `Rollos de Concertina Helicoidal Arpón Galvanizada 45cm diámetro (8m lineales c/u)`,
      quantity: rolls,
      unit: 'Rollo 8m',
      unitPrice: 485,
      total: rolls * 485
    });

    const arms = Math.ceil(meters / 3);
    items.push({
      id: String(itemId++),
      description: `Brazos de soporte galvanizados a 45° con anclajes expansivos para barda`,
      quantity: arms,
      unit: 'Pieza',
      unitPrice: 90,
      total: arms * 90
    });

    const wireRolls = Math.max(1, Math.ceil(meters / 150));
    items.push({
      id: String(itemId++),
      description: `Alambre de púas galvanizado calibre 12.5 para tensor de guía`,
      quantity: wireRolls,
      unit: 'Rollo',
      unitPrice: 650,
      total: wireRolls * 650
    });

    items.push({
      id: String(itemId++),
      description: `Mano de obra especializada en montaje en altura con equipo de protección y arnés`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: 68,
      total: meters * 68
    });
  } else if (service === 'malla_ganadera') {
    const rolls = Math.ceil(meters / 100);
    items.push({
      id: String(itemId++),
      description: `Malla Ganadera Borreguera Nudo Graduado Calibre 12.5 (100m lineales por rollo)`,
      quantity: rolls,
      unit: 'Rollo 100m',
      unitPrice: 2850,
      total: rolls * 2850
    });

    const tPosts = Math.ceil(meters / 3);
    items.push({
      id: String(itemId++),
      description: `Postes T de fierro ganadero 1.80m de alta resistencia`,
      quantity: tPosts,
      unit: 'Pieza',
      unitPrice: 125,
      total: tPosts * 125
    });

    const cornerWood = Math.max(4, Math.ceil(meters / 50) * 2);
    items.push({
      id: String(itemId++),
      description: `Postes de pino tratado 4" para esquineros de tensión y anclajes`,
      quantity: cornerWood,
      unit: 'Pieza',
      unitPrice: 290,
      total: cornerWood * 290
    });

    items.push({
      id: String(itemId++),
      description: `Mano de obra de clavado, alineación rústica y tensado con malacate`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: 48,
      total: meters * 48
    });
  } else if (service === 'cerca_electrificada') {
    items.push({
      id: String(itemId++),
      description: `Energizador de alto voltaje 14,000V homologado con sirena 120dB y batería de respaldo`,
      quantity: 1,
      unit: 'Equipo',
      unitPrice: 5800,
      total: 5800
    });

    const linePosts = Math.ceil(meters / 3);
    items.push({
      id: String(itemId++),
      description: `Postes templadores e intermedios con aisladores tipo tensor de alto impacto`,
      quantity: linePosts,
      unit: 'Poste',
      unitPrice: 165,
      total: linePosts * 165
    });

    items.push({
      id: String(itemId++),
      description: `Alambre de aluminio / inoxidable de 5 líneas de alto poder conductor`,
      quantity: meters * 5,
      unit: 'Metro cable',
      unitPrice: 14,
      total: meters * 5 * 14
    });

    items.push({
      id: String(itemId++),
      description: `Mano de obra de montaje, calibración eléctrica y puesta en marcha del cerco`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: 75,
      total: meters * 75
    });
  } else {
    // Alambre de púas o cinta
    const rolls = Math.ceil(meters / 100);
    items.push({
      id: String(itemId++),
      description: `Material perimetral especificado para ${meters} metros de perímetro`,
      quantity: rolls,
      unit: 'Lote',
      unitPrice: 1600,
      total: rolls * 1600
    });
    items.push({
      id: String(itemId++),
      description: `Postes y elementos de soporte cada 3 metros`,
      quantity: Math.ceil(meters / 3),
      unit: 'Pieza',
      unitPrice: 180,
      total: Math.ceil(meters / 3) * 180
    });
    items.push({
      id: String(itemId++),
      description: `Mano de obra de instalación y fijación técnica`,
      quantity: meters,
      unit: 'Metro',
      unitPrice: 55,
      total: meters * 55
    });
  }

  // Optional Add-ons
  if (input.addConcertinaTop && service !== 'concertina') {
    const concertinaRolls = Math.ceil(meters / 8);
    const concertinaTotal = concertinaRolls * 485 + meters * 35;
    items.push({
      id: String(itemId++),
      description: `ADICIONAL: Concertina Arpón 45cm sobre corona de postes con alambre guía (${concertinaRolls} rollos)`,
      quantity: meters,
      unit: 'Metro lin.',
      unitPrice: Number((concertinaTotal / meters).toFixed(2)),
      total: concertinaTotal
    });
  }

  if (input.addBarbedWireTop && service !== 'alambre_puas') {
    const barbedTotal = meters * 42;
    items.push({
      id: String(itemId++),
      description: `ADICIONAL: Alambre de púas 3 hilos superiores en brazos a 45°`,
      quantity: meters,
      unit: 'Metro lin.',
      unitPrice: 42,
      total: barbedTotal
    });
  }

  if (input.addPrivacyTape && service !== 'cinta_privacidad') {
    const tapeTotal = meters * 65;
    items.push({
      id: String(itemId++),
      description: `ADICIONAL: Cinta plástica rompevientos de privacidad tejida en malla (protección UV)`,
      quantity: meters,
      unit: 'Metro lin.',
      unitPrice: 65,
      total: tapeTotal
    });
  }

  if (input.addGate) {
    items.push({
      id: String(itemId++),
      description: `ADICIONAL: Portón vehicular corredizo o abatible 4.00m x ${height.toFixed(2)}m con marco estructural y cerrojo`,
      quantity: 1,
      unit: 'Pieza',
      unitPrice: 8500,
      total: 8500
    });
  }

  if (input.addPedestrianGate) {
    items.push({
      id: String(itemId++),
      description: `ADICIONAL: Puerta peatonal de acceso 1.00m x ${height.toFixed(2)}m con marco y pasador porta-candado`,
      quantity: 1,
      unit: 'Pieza',
      unitPrice: 2800,
      total: 2800
    });
  }

  // Delivery & Freight
  const freight = input.city?.toLowerCase().includes('san luis') || input.city?.toLowerCase().includes('foraneo') ? 1800 : 950;
  items.push({
    id: String(itemId++),
    description: `Flete de materiales pesados y viáticos de traslado de cuadrilla en obra (${input.city || 'Monterrey, N.L.'})`,
    quantity: 1,
    unit: 'Servicio',
    unitPrice: freight,
    total: freight
  });

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const iva = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));
  const advance50 = Number((total * 0.5).toFixed(2));
  const balance50 = Number((total - advance50).toFixed(2));

  // Estimated days based on linear meters
  const estimatedWorkDays = Math.max(2, Math.ceil(meters / 35));

  const folioNum = Math.floor(1000 + Math.random() * 9000);
  const folio = `COT-2026-${folioNum}`;

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const validDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  const validUntilStr = validDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return {
    folio,
    date: dateStr,
    validUntil: validUntilStr,
    clientName: input.clientName || 'Cliente Particular',
    clientPhone: input.clientPhone || '',
    clientEmail: input.clientEmail || '',
    projectAddress: input.projectAddress || 'En confirmación',
    city: input.city || 'Monterrey, N.L.',
    serviceType: service,
    serviceLabel: SERVICE_LABELS[service] || service,
    linearMeters: meters,
    heightMeters: height,
    terrainType: terrain,
    terrainLabel: TERRAIN_LABELS[terrain] || terrain,
    items,
    subtotal,
    iva,
    total,
    advance50,
    balance50,
    estimatedWorkDays,
    warrantyYears: 3
  };
}

export function exportQuoteToPdf(quote: IntelligentQuoteResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Bar Top
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text('MALLAESA', 18, y + 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(137, 138, 130);
  doc.text('SEGURIDAD PERIMETRAL • CERCADOS & MALLAS', 18, y + 7);
  doc.text('www.mallaesa.com • ventas@mallaesamty.com • Tel. (81) 3406-0349', 18, y + 11);

  // Quote Folio Box Right
  doc.setFillColor(245, 245, 244);
  doc.roundedRect(pageWidth - 75, y - 4, 57, 18, 2, 2, 'F');
  doc.setDrawColor(216, 217, 213);
  doc.roundedRect(pageWidth - 75, y - 4, 57, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(137, 138, 130);
  doc.text('PRESUPUESTO FORMAL', pageWidth - 71, y);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(quote.folio, pageWidth - 71, y + 5.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha: ${quote.date}`, pageWidth - 71, y + 10);

  y += 22;

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(18, y, pageWidth - 18, y);

  y += 6;

  // Client Info & Project Specs in 2 Columns
  doc.setFillColor(250, 250, 249);
  doc.rect(18, y, pageWidth - 36, 22, 'F');
  doc.setDrawColor(225, 225, 220);
  doc.rect(18, y, pageWidth - 36, 22, 'S');

  // Col 1: Client
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('DATOS DEL CLIENTE:', 22, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Cliente: ${quote.clientName}`, 22, y + 9.5);
  doc.text(`Teléfono: ${quote.clientPhone}  |  Email: ${quote.clientEmail}`, 22, y + 14);
  doc.text(`Ubicación: ${quote.projectAddress}, ${quote.city}`, 22, y + 18.5);

  // Col 2: Specs
  const col2X = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('ESPECIFICACIONES TÉCNICAS:', col2X, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Sistema: ${quote.serviceLabel}`, col2X, y + 9.5);
  doc.text(`Metros Lineales: ${quote.linearMeters} m  |  Altura: ${quote.heightMeters} m`, col2X, y + 14);
  doc.text(`Condición del Suelo: ${quote.terrainLabel}`, col2X, y + 18.5);

  y += 28;

  // Items Table Header
  doc.setFillColor(0, 0, 0);
  doc.rect(18, y, pageWidth - 36, 7, 'F');

  const itemsToRender = (quote.clientConcepts && quote.clientConcepts.length > 0)
    ? quote.clientConcepts
    : quote.items;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 21, y + 4.8);
  doc.text('CONCEPTO / PRODUCTO COTIZADO AL CLIENTE', 28, y + 4.8);
  doc.text('CANT.', pageWidth - 80, y + 4.8);
  doc.text('UNIDAD', pageWidth - 65, y + 4.8);
  doc.text('P. UNIT.', pageWidth - 45, y + 4.8);
  doc.text('TOTAL (MXN)', pageWidth - 22, y + 4.8, { align: 'right' });

  y += 7;

  // Table Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  itemsToRender.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(249, 249, 248);
      doc.rect(18, y, pageWidth - 36, 6.5, 'F');
    }

    doc.setTextColor(60, 60, 60);
    doc.text(String(index + 1), 21, y + 4.4);

    // Truncate long descriptions if needed
    const desc = item.description.length > 58 ? item.description.substring(0, 55) + '...' : item.description;
    doc.setTextColor(20, 20, 20);
    doc.text(desc, 28, y + 4.4);

    doc.setTextColor(60, 60, 60);
    doc.text(String(item.quantity), pageWidth - 78, y + 4.4);
    doc.text(item.unit, pageWidth - 65, y + 4.4);
    doc.text(`$${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 45, y + 4.4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`$${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 22, y + 4.4, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 6.5;
  });

  y += 4;

  // Totals Box
  const totalsBoxX = pageWidth - 90;
  doc.setFillColor(250, 250, 249);
  doc.rect(totalsBoxX, y, 72, 24, 'F');
  doc.setDrawColor(216, 217, 213);
  doc.rect(totalsBoxX, y, 72, 24, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Subtotal Materiales y M.O.:', totalsBoxX + 4, y + 5.5);
  doc.text(`$${quote.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 22, y + 5.5, { align: 'right' });

  doc.text('I.V.A. (16% Trasladado):', totalsBoxX + 4, y + 11);
  doc.text(`$${quote.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, pageWidth - 22, y + 11, { align: 'right' });

  doc.setFillColor(0, 0, 0);
  doc.rect(totalsBoxX, y + 14.5, 72, 9.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PRECIO EXACTO TOTAL:', totalsBoxX + 4, y + 20.5);
  doc.text(`$${quote.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, pageWidth - 22, y + 20.5, { align: 'right' });

  // Payment Conditions Left Box
  const condBoxWidth = totalsBoxX - 22;
  doc.setFillColor(245, 245, 244);
  doc.rect(18, y, condBoxWidth, 24, 'F');
  doc.setDrawColor(220, 220, 215);
  doc.rect(18, y, condBoxWidth, 24, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('CONDICIONES DE CONTRATACIÓN Y PAGO:', 22, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.text(`• Anticipo del 50% ($${quote.advance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN) para iniciar acopio y logística.`, 22, y + 9.5);
  doc.text(`• Saldo finiquito del 50% ($${quote.balance50.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN) a la entrega y firma de conformidad.`, 22, y + 13.5);
  doc.text(`• Tiempo estimado de instalación en obra: ${quote.estimatedWorkDays} días hábiles.`, 22, y + 17.5);
  doc.text(`• Póliza de Garantía por escrito: ${quote.warrantyYears} años contra vicios ocultos y corrosión.`, 22, y + 21);

  y += 32;

  // Guarantee & Bank Information
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(18, y, pageWidth - 18, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('CUENTAS BANCARIAS OFICIALES PARA TRANSFERENCIA SPEI:', 18, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  doc.text('Beneficiario: MALLAESA S.A. DE C.V.  |  Banco: BBVA México  |  CLABE Interbancaria: 012580001099238411', 18, y + 4);
  doc.text('Banco: Banorte  |  Cuenta: 0492810488  |  CLABE: 072580004928104882  |  RFC: MAL210419NL8', 18, y + 7.5);

  // Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text(`Presupuesto oficial emitido por el sistema inteligente de MALLAESA. Vigencia de precios: ${quote.validUntil}.`, 18, y + 14);

  // Save the PDF directly to client's browser
  doc.save(`Cotizacion_MALLAESA_${quote.folio}.pdf`);
}
