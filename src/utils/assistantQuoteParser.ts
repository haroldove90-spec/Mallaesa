import { OFFICIAL_PRICE_LIST, OfficialProduct } from '../data/officialPriceList';
import { ClientConceptRow } from '../components/OfficialQuoteCalculatorView';

export interface FinalQuoteJson {
  cliente: {
    nombre: string;
    atencion_a?: string;
    responsable_obra?: string;
    telefono: string;
    correo?: string;
    domicilio?: string;
    ubicacion_tipo?: 'local' | 'foraneo' | string;
    distancia_km?: number;
  };
  especificaciones: {
    producto: 'malla_ciclonica' | 'rejacero' | 'cerco_electrico' | 'cerco_ganadero' | 'concertina' | 'red_deportiva' | 'reja_seguridad' | string;
    altura_m: number;
    metros_lineales: number;
    forma?: 'linea_recta' | 'escuadra' | 'rectangulo' | 'poligono' | string;
    lados?: any[];
    tipo_instalacion?: 'cimentacion' | 'placa' | 'soldar' | string;
    tipo_terreno?: 'terreno_natural' | 'rocoso' | 'concreto' | 'asfalto' | 'barda_block' | 'barda_cadena' | 'pretil' | 'acero' | string;
    desniveles_escalones?: {
      tiene: boolean;
      cantidad: number;
      medida_aprox: string;
    };
    accesorios?: {
      alambre_pua?: boolean;
      concertina?: boolean;
      cerco_electrico?: boolean;
      cinta_privacidad?: boolean;
      barra_intermedia?: boolean;
      barra_inferior?: boolean;
      retenidas?: boolean;
    };
    puertas_portones?: Array<{
      tipo: 'puerta_peatonal' | 'porton_vehicular' | string;
      hojas: number;
      ancho_m: number;
      ubicacion_lado: string;
    }>;
    terreno_habilitado?: boolean;
  };
}

export interface AssistantCartItem {
  product: OfficialProduct;
  quantity: number;
}

export interface PreloadedQuoteDraft {
  clientData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  cart: AssistantCartItem[];
  clientConcepts: ClientConceptRow[];
  summary: {
    productoLabel: string;
    metrosLineales: number;
    alturaM: number;
    terrenoLabel: string;
    accesoriosLabels: string[];
    puertasSummary: string;
  };
  rawMaterialsCost: number;
  profitAmount: number;
  calculatedSaleSubtotal: number;
}

/**
 * Searches for a fenced JSON block or raw JSON object in the model's response.
 */
export function extractQuoteJsonFromText(text: string): FinalQuoteJson | null {
  if (!text) return null;

  try {
    // 1. Try finding ```json ... ``` block
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
    const match = text.match(jsonBlockRegex);
    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      if (parsed.cliente && parsed.especificaciones) {
        return parsed as FinalQuoteJson;
      }
    }

    // 2. Try finding raw JSON starting with {"cliente"
    const rawJsonRegex = /(\{[\s\S]*"cliente"[\s\S]*"especificaciones"[\s\S]*\})/i;
    const rawMatch = text.match(rawJsonRegex);
    if (rawMatch && rawMatch[1]) {
      const parsed = JSON.parse(rawMatch[1]);
      if (parsed.cliente && parsed.especificaciones) {
        return parsed as FinalQuoteJson;
      }
    }
  } catch (err) {
    console.warn('Error parsing JSON from assistant message:', err);
  }

  return null;
}

/**
 * Strips the technical JSON block from the assistant's message so the user sees only conversational text.
 */
export function cleanAssistantMessage(text: string): string {
  if (!text) return '';
  // Remove ```json ... ```
  let cleaned = text.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/gi, '').trim();
  // Remove bare JSON blocks if present
  cleaned = cleaned.replace(/\{\s*"cliente"[\s\S]*"terreno_habilitado"[\s\S]*?\}/gi, '').trim();
  return cleaned;
}

/**
 * Helper to find a product in OFFICIAL_PRICE_LIST by ID.
 */
function findProductById(productId: string): OfficialProduct | null {
  for (const cat of OFFICIAL_PRICE_LIST) {
    const found = cat.products.find(p => p.id === productId);
    if (found) return found;
  }
  return null;
}

/**
 * Converts the assistant's JSON specifications into materials (cart items),
 * client concept with 20% margin, and client data.
 */
export function parseAndBuildQuoteDraft(json: FinalQuoteJson): PreloadedQuoteDraft {
  const cliente = json.cliente || {};
  const specs = json.especificaciones || {
    producto: 'malla_ciclonica',
    altura_m: 2.0,
    metros_lineales: 100
  };

  const metrosLineales = Math.max(1, Number(specs.metros_lineales) || 50);
  const alturaM = Number(specs.altura_m) || 2.0;
  const productoTipo = (specs.producto || 'malla_ciclonica').toLowerCase();
  const accesorios = specs.accesorios || {};
  const puertas = specs.puertas_portones || [];

  const cart: AssistantCartItem[] = [];

  // Helper to add to cart
  const addToCart = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    const product = findProductById(productId);
    if (product) {
      const existing = cart.find(c => c.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ product, quantity });
      }
    }
  };

  let productoLabel = 'Malla Ciclónica Galvanizada';

  // 1. Calculate materials based on product type
  if (productoTipo.includes('rejacero') || productoTipo.includes('reja')) {
    productoLabel = 'Rejacero Arquitectónico Inde Cal. 6';
    // Paneles de 2.50m
    const panelsNeeded = Math.ceil(metrosLineales / 2.5);
    if (alturaM <= 1.0) {
      addToCart('reja-1', panelsNeeded);
      addToCart('post-reja-1', panelsNeeded + 1);
    } else if (alturaM <= 1.5) {
      addToCart('reja-2', panelsNeeded);
      addToCart('post-reja-1', panelsNeeded + 1);
    } else {
      addToCart('reja-3', panelsNeeded);
      addToCart('post-reja-2', panelsNeeded + 1);
    }
  } else {
    // Default: Malla Ciclónica (galvanizada o pvc)
    const rollsNeeded = Math.max(1, Math.ceil(metrosLineales / 20));
    const postsNeeded = Math.max(2, Math.ceil(metrosLineales / 3));
    const topRailsNeeded = Math.max(1, Math.ceil(metrosLineales / 6));

    if (alturaM <= 1.0) {
      addToCart('mc-1', rollsNeeded); // 1.00m
      productoLabel = 'Malla Ciclónica Galvanizada Cal. 12.5 (1.00m)';
    } else if (alturaM <= 1.5) {
      addToCart('mc-2', rollsNeeded); // 1.50m
      productoLabel = 'Malla Ciclónica Galvanizada Cal. 12.5 (1.50m)';
    } else {
      addToCart('mc-3', rollsNeeded); // 2.00m
      productoLabel = 'Malla Ciclónica Galvanizada Cal. 12.5 (2.00m)';
    }

    // Postes de línea 48mm 6.00m (tub-e-5)
    addToCart('tub-e-5', postsNeeded);
    // Tubo superior 38mm 6.00m (tc-3)
    addToCart('tc-3', topRailsNeeded);
    // Abrazaderas de arranque (acc-3)
    addToCart('acc-3', Math.max(4, Math.ceil(metrosLineales / 10) * 2));
    // Abrazaderas de tensión (acc-4)
    addToCart('acc-4', Math.max(6, Math.ceil(metrosLineales / 5) * 2));
    // Tapones de lámina 48mm (acc-6)
    addToCart('acc-6', postsNeeded);
    // Coples simples de aluminio 38mm (acc-8)
    addToCart('acc-8', topRailsNeeded);
    // Alambre de amarre Cal. 18 (alam-2)
    addToCart('alam-2', Math.max(2, Math.ceil(metrosLineales / 25)));
  }

  // 2. Accesorios opcionales
  const accesoriosLabels: string[] = [];

  if (accesorios.alambre_pua) {
    accesoriosLabels.push('Alambre de Púas Galv. (3 hilos)');
    // 3 líneas de púas
    const barbRolls = Math.max(1, Math.ceil((metrosLineales * 3) / 300));
    addToCart('puas-1', barbRolls);
  }

  if (accesorios.concertina) {
    accesoriosLabels.push('Concertina Arpón Inox 45cm');
    // Rinde 8m por rollo
    const concertinaRolls = Math.max(1, Math.ceil(metrosLineales / 8));
    addToCart('con-2', concertinaRolls);
  }

  if (accesorios.cinta_privacidad) {
    accesoriosLabels.push('Cinta de Privacidad Plástica');
  }

  // 3. Puertas y Portones
  let puertasSummary = 'Sin accesos adicionales';
  if (puertas && puertas.length > 0) {
    const puertaPeatonal = puertas.find(p => p.tipo?.includes('peatonal'));
    const porton = puertas.find(p => p.tipo?.includes('vehicular') || p.tipo?.includes('porton'));

    if (puertaPeatonal) {
      addToCart('puer-2', 1); // Puerta abatible 1.00 x 1.50m
      addToCart('acc-9', 1);  // Juego picaporte
      puertasSummary = '1 Puerta peatonal abatible con picaporte';
    }

    if (porton) {
      addToCart('puer-2', 2); // 2 hojas para portón
      addToCart('acc-9', 1);
      puertasSummary = puertaPeatonal
        ? '1 Puerta peatonal + 1 Portón vehicular de 2 hojas'
        : '1 Portón vehicular de 2 hojas';
    }
  }

  // 4. Calcular costos de materia prima
  const rawMaterialsCost = Number(
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
  );

  // 5. Aplicar margen del 20%
  const profitAmount = Number((rawMaterialsCost * 0.20).toFixed(2));
  const calculatedSaleSubtotal = Number((rawMaterialsCost + profitAmount).toFixed(2));

  // 6. Generar el concepto formal para el cliente
  // "MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA 2 - 100 METROS LINEALES"
  let conceptTitle = '';
  if (productoTipo.includes('rejacero')) {
    conceptTitle = `REJACERO ARQUITECTÓNICO C-71 CALIBRE 6 ALTURA ${alturaM.toFixed(2)}M - ${metrosLineales} ML`;
  } else {
    conceptTitle = `MALLA GALV. CALIBRE 12.5 ABERTURA 64 ALTURA ${alturaM.toFixed(1)} - ${metrosLineales} ML`;
  }

  if (accesoriosLabels.length > 0) {
    conceptTitle += ` (INCLUYE: ${accesoriosLabels.join(' + ')})`;
  }

  const clientConcepts: ClientConceptRow[] = [
    {
      id: `concept-${Date.now()}`,
      description: conceptTitle,
      quantity: 1,
      unit: 'Lote / Suministro e Instalación',
      unitPrice: calculatedSaleSubtotal,
      total: calculatedSaleSubtotal
    }
  ];

  // 7. Mapear datos del cliente
  const clientData = {
    name: cliente.nombre || cliente.atencion_a || 'Cliente Particular',
    phone: cliente.telefono || '',
    email: cliente.correo || '',
    address: cliente.domicilio || 'Domicilio del Proyecto',
    city: cliente.ubicacion_tipo === 'foraneo'
      ? (cliente.domicilio || 'Foráneo')
      : (cliente.domicilio ? `${cliente.domicilio}` : 'Tlalnepantla / Edo. de México')
  };

  const terrenoLabel = specs.tipo_terreno
    ? specs.tipo_terreno.replace(/_/g, ' ')
    : 'Terreno natural / cimentación estándar';

  return {
    clientData,
    cart,
    clientConcepts,
    summary: {
      productoLabel,
      metrosLineales,
      alturaM,
      terrenoLabel,
      accesoriosLabels,
      puertasSummary
    },
    rawMaterialsCost,
    profitAmount,
    calculatedSaleSubtotal
  };
}
