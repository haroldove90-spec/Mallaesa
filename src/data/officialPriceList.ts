export interface OfficialProduct {
  id: string;
  name: string;
  spec: string;
  gauge?: string;
  unit: string;
  price: number;
  priceDistributor?: number;
  pricePublic?: number;
  material?: string;
  notes?: string;
}

export interface OfficialCategory {
  id: string;
  number: number;
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  badge: string;
  itemsCount: number;
  priceRange: string;
  products: OfficialProduct[];
}

export const OFFICIAL_PRICE_LIST: OfficialCategory[] = [
  {
    id: 'laminas_acanaladas',
    number: 1,
    name: '1. Láminas Acanaladas',
    shortName: 'Láminas Acanaladas',
    description: 'Láminas acanaladas R-72 y R-101 en acabados Galvanizado y Pintro. Fabricación en todos los largos hasta 12 metros.',
    iconName: 'Layers',
    badge: 'Precio x Metro Lineal',
    itemsCount: 8,
    priceRange: '$98.10 - $262.92 / ml',
    products: [
      {
        id: 'lam-1',
        name: 'Galvanizada R-72',
        spec: 'Ancho: 0.80 m',
        gauge: 'Cal. 32',
        unit: 'Metro Lineal',
        price: 98.10,
        notes: 'Acabado galvanizado anticorrosivo'
      },
      {
        id: 'lam-2',
        name: 'Galvanizada R-72',
        spec: 'Ancho: 0.80 m',
        gauge: 'Cal. 28',
        unit: 'Metro Lineal',
        price: 127.61,
        notes: 'Acabado galvanizado estándar'
      },
      {
        id: 'lam-3',
        name: 'Galvanizada R-72',
        spec: 'Ancho: 0.80 m',
        gauge: 'Cal. 26',
        unit: 'Metro Lineal',
        price: 141.03,
        notes: 'Acabado galvanizado reforzado'
      },
      {
        id: 'lam-4',
        name: 'Galvanizada R-101',
        spec: 'Ancho: 1.07 m',
        gauge: 'Cal. 28',
        unit: 'Metro Lineal',
        price: 164.09,
        notes: 'Perfil R-101 industrial ancho'
      },
      {
        id: 'lam-5',
        name: 'Galvanizada R-101',
        spec: 'Ancho: 1.07 m',
        gauge: 'Cal. 26',
        unit: 'Metro Lineal',
        price: 180.96,
        notes: 'Perfil R-101 calibre estándar'
      },
      {
        id: 'lam-6',
        name: 'Galvanizada R-101',
        spec: 'Ancho: 1.07 m',
        gauge: 'Cal. 24',
        unit: 'Metro Lineal',
        price: 205.82,
        notes: 'Perfil R-101 calibre pesado'
      },
      {
        id: 'lam-7',
        name: 'Pintro R-101',
        spec: 'Ancho: 1.07 m',
        gauge: 'Cal. 26',
        unit: 'Metro Lineal',
        price: 232.49,
        notes: 'Pintura esmaltada horneada blanca/arena'
      },
      {
        id: 'lam-8',
        name: 'Pintro R-101',
        spec: 'Ancho: 1.07 m',
        gauge: 'Cal. 24',
        unit: 'Metro Lineal',
        price: 262.92,
        notes: 'Pintura esmaltada horneada calibre pesado'
      }
    ]
  },
  {
    id: 'tubo_cuadrado_especiales',
    number: 2,
    name: '2. Tubo Cuadrado Galvanizado y Tubos Especiales',
    shortName: 'Tubo Cuadrado & Especiales',
    description: 'Tubería cuadrada 2"x2" Cal. 16 y tubos redondos especiales de 33mm a 60mm en tramos de 4.80m, 5.00m y 6.00m.',
    iconName: 'Square',
    badge: 'Precio / Tramo',
    itemsCount: 9,
    priceRange: '$220.29 - $860.90 / tramo',
    products: [
      {
        id: 'tub-c-1',
        name: 'Tubo Cuadrado Galv. (6.00 m.l.)',
        spec: '2" x 2"',
        gauge: 'Cal. 16',
        unit: 'Tramo 6.00 m',
        price: 860.90,
        notes: 'Tubo cuadrado estructural galvanizado'
      },
      {
        id: 'tub-c-2',
        name: 'Tubo Cuadrado Galv. (5.00 m.l.)',
        spec: '2" x 2"',
        gauge: 'Cal. 16',
        unit: 'Tramo 5.00 m',
        price: 717.40,
        notes: 'Tubo cuadrado estructural galvanizado'
      },
      {
        id: 'tub-e-1',
        name: 'Tubo Galv. Especial (6.00 m.l.)',
        spec: '33 mm. (1 1/4")',
        gauge: 'Esp. 22',
        unit: 'Tramo 6.00 m',
        price: 220.29,
        notes: 'Tubo galvanizado ligero'
      },
      {
        id: 'tub-e-2',
        name: 'Tubo Galv. Especial (6.00 m.l.)',
        spec: '38 mm. (1 1/2")',
        gauge: 'Esp. 22',
        unit: 'Tramo 6.00 m',
        price: 250.22,
        notes: 'Tubo galvanizado especial marco'
      },
      {
        id: 'tub-e-3',
        name: 'Tubo Galv. Especial (4.80 m.l.)',
        spec: '48 mm. (1 7/8")',
        gauge: 'Esp. 22',
        unit: 'Tramo 4.80 m',
        price: 250.22,
        notes: 'Tubo poste de línea 4.80m'
      },
      {
        id: 'tub-e-4',
        name: 'Tubo Galv. Especial (6.00 m.l.)',
        spec: '42 mm. (1 5/8")',
        gauge: 'Esp. 22',
        unit: 'Tramo 6.00 m',
        price: 279.30,
        notes: 'Tubo intermedio 6.00m'
      },
      {
        id: 'tub-e-5',
        name: 'Tubo Galv. Especial (6.00 m.l.)',
        spec: '48 mm. (1 7/8")',
        gauge: 'Esp. 22',
        unit: 'Tramo 6.00 m',
        price: 311.29,
        notes: 'Tubo poste de línea 6.00m'
      },
      {
        id: 'tub-e-6',
        name: 'Tubo Galv. Especial (4.80 m.l.)',
        spec: '60 mm. (2 3/8")',
        gauge: 'Esp. 20',
        unit: 'Tramo 4.80 m',
        price: 375.31,
        notes: 'Tubo poste esquinero 4.80m'
      },
      {
        id: 'tub-e-7',
        name: 'Tubo Galv. Especial (6.00 m.l.)',
        spec: '60 mm. (2 3/8")',
        gauge: 'Esp. 20',
        unit: 'Tramo 6.00 m',
        price: 471.32,
        notes: 'Tubo poste esquinero reforzado 6.00m'
      }
    ]
  },
  {
    id: 'tuberia_cerca',
    number: 3,
    name: '3. Tubería para Cerca (Cédula 40 y Cédula 30)',
    shortName: 'Tubería para Cerca',
    description: 'Tubería estructural galvanizada para postes y marcos en calibres 20, 18, 16 y 14. Tramos de 4.80m, 6.00m, 7.00m y Cédula 30.',
    iconName: 'Columns',
    badge: 'Cédula 30 y 40',
    itemsCount: 11,
    priceRange: '$261.84 - $2,187.20 / tramo',
    products: [
      {
        id: 'tc-1',
        name: 'Tubo 33 mm. Cal. 20 (Tramo 6.00 ML)',
        spec: 'Diámetro 33 mm. • Cal. 20',
        gauge: 'Cal. 20',
        unit: 'Tramo 6.00 m',
        price: 261.84,
        notes: 'Opción Cédula 30 (6m): $1,012.96'
      },
      {
        id: 'tc-2',
        name: 'Tubo 33 mm. Cal. 18 (Tramo 6.00 ML)',
        spec: 'Diámetro 33 mm. • Cal. 18',
        gauge: 'Cal. 18',
        unit: 'Tramo 6.00 m',
        price: 343.32,
        notes: 'Opción Cédula 30 (6m): $455.23'
      },
      {
        id: 'tc-3',
        name: 'Tubo 38 mm. Cal. 20 (Tramo 6.00 ML)',
        spec: 'Diámetro 38 mm. (1 1/2") • Cal. 20',
        gauge: 'Cal. 20',
        unit: 'Tramo 6.00 m',
        price: 302.57,
        notes: 'Tubo superior para cerca'
      },
      {
        id: 'tc-4',
        name: 'Tubo 38 mm. Cal. 18 (Tramo 6.00 ML)',
        spec: 'Diámetro 38 mm. (1 1/2") • Cal. 18',
        gauge: 'Cal. 18',
        unit: 'Tramo 6.00 m',
        price: 389.84,
        notes: 'Tubo superior reforzado'
      },
      {
        id: 'tc-5',
        name: 'Tubo 38 mm. Cal. 16 (Tramo 6.00 ML)',
        spec: 'Diámetro 38 mm. (1 1/2") • Cal. 16',
        gauge: 'Cal. 16',
        unit: 'Tramo 6.00 m',
        price: 482.96,
        notes: 'Tubo superior uso pesado'
      },
      {
        id: 'tc-6',
        name: 'Tubo 42 mm. Cal. 20 (Tramo 6.00 ML)',
        spec: 'Diámetro 42 mm. • Cal. 20',
        gauge: 'Cal. 20',
        unit: 'Tramo 6.00 m',
        price: 276.07,
        notes: 'Tramo 4.80m: $345.20 | Cédula 30 (6m): $1,376.02'
      },
      {
        id: 'tc-7',
        name: 'Tubo 42 mm. Cal. 18 (Tramo 6.00 ML)',
        spec: 'Diámetro 42 mm. • Cal. 18',
        gauge: 'Cal. 18',
        unit: 'Tramo 6.00 m',
        price: 430.59,
        notes: 'Tramo 4.80m: $362.64 | Cédula 30 (6m): $713.21'
      },
      {
        id: 'tc-8',
        name: 'Tubo 48 mm. Cal. 18 (Tramo 6.00 ML)',
        spec: 'Diámetro 48 mm. (1 7/8") • Cal. 18',
        gauge: 'Cal. 18',
        unit: 'Tramo 6.00 m',
        price: 407.32,
        notes: 'Tramo 4.80m: $491.67 | Tramo 7.00m: $593.50 | Céd. 30: $819.43'
      },
      {
        id: 'tc-9',
        name: 'Tubo 48 mm. Cal. 16 (Tramo 6.00 ML)',
        spec: 'Diámetro 48 mm. (1 7/8") • Cal. 16',
        gauge: 'Cal. 16',
        unit: 'Tramo 6.00 m',
        price: 502.12,
        notes: 'Tramo 4.80m: $627.67 | Tramo 7.00m: $732.26 | Céd. 30: $1,657.44'
      },
      {
        id: 'tc-10',
        name: 'Tubo 60 mm. Cal. 16 (Tramo 6.00 ML)',
        spec: 'Diámetro 60 mm. (2 3/8") • Cal. 16',
        gauge: 'Cal. 16',
        unit: 'Tramo 6.00 m',
        price: 788.44,
        notes: 'Tramo 7.00m: $947.90 | Cédula 30 (6m): $1,198.80'
      },
      {
        id: 'tc-11',
        name: 'Tubo 60 mm. Cal. 14 (Tramo 6.00 ML)',
        spec: 'Diámetro 60 mm. (2 3/8") • Cal. 14',
        gauge: 'Cal. 14',
        unit: 'Tramo 6.00 m',
        price: 1005.41,
        notes: 'Tramo 7.00m: $1,171.66 | Cédula 30 (6m): $2,187.20'
      }
    ]
  },
  {
    id: 'malla_ciclon',
    number: 4,
    name: '4. Rollos de Malla Ciclón Galvanizada y P.V.C.',
    shortName: 'Rollos Malla Ciclón',
    description: 'Rollos de 20 metros lineales en aberturas 64mm, 55mm y 69mm. Alturas de 1.00m, 1.50m y 2.00m en calibres 13, 12.5, 11.5 y PVC.',
    iconName: 'Grid',
    badge: 'Rollos de 20 ML',
    itemsCount: 6,
    priceRange: '$795.37 - $3,540.98 / rollo',
    products: [
      {
        id: 'mc-1',
        name: 'Malla Ciclón Ab. 64 x 20ml (Alt. 1.00m)',
        spec: 'Abertura 64mm • Altura 1.00m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 1041.83,
        notes: 'Cal. 13: $892.92 | Cal. 11.5/11: $1,332.54 | PVC: $1,806.23'
      },
      {
        id: 'mc-2',
        name: 'Malla Ciclón Ab. 64 x 20ml (Alt. 1.50m)',
        spec: 'Abertura 64mm • Altura 1.50m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 1544.25,
        notes: 'Cal. 13: $1,318.05 | Cal. 11.5/11: $1,964.75 | PVC: $2,680.77'
      },
      {
        id: 'mc-3',
        name: 'Malla Ciclón Ab. 64 x 20ml (Alt. 2.00m)',
        spec: 'Abertura 64mm • Altura 2.00m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 2044.49,
        notes: 'Cal. 13: $1,742.90 | Cal. 11.5/11: $2,614.35 | PVC: $3,540.98'
      },
      {
        id: 'mc-4',
        name: 'Malla Ciclón Ab. 55 x 20ml (Alt. 1.00m)',
        spec: 'Abertura 55mm (Tupida) • Altura 1.00m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 1262.50,
        notes: 'Cal. 13: $1,079.06 | Cal. 11.5/11: $1,447.54 | PVC: $2,059.02'
      },
      {
        id: 'mc-5',
        name: 'Malla Ciclón Ab. 55 x 20ml (Alt. 1.50m)',
        spec: 'Abertura 55mm (Tupida) • Altura 1.50m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 1860.34,
        notes: 'Cal. 13: $1,590.03 | Cal. 11.5/11: $2,174.41 | PVC: $3,082.36'
      },
      {
        id: 'mc-6',
        name: 'Malla Ciclón Ab. 69 x 20ml (Alt. 1.00m)',
        spec: 'Abertura 69mm • Altura 1.00m • Rollo 20 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 20 ML',
        price: 957.73,
        notes: 'Cal. 13: $795.37 | Cal. 11.5/11: $1,225.08 | PVC: $1,756.15'
      }
    ]
  },
  {
    id: 'alambres_puas_grapas',
    number: 5,
    name: '5. Alambres de Púas, Alambres y Grapas',
    shortName: 'Alambres de Púas & Grapas',
    description: 'Rollos de alambre de púas en 300m y 360m, alambres galvanizados por kilogramo (cal. 12.5 al 22) y grapas galvanizadas.',
    iconName: 'ShieldAlert',
    badge: 'Rollos y Kilos',
    itemsCount: 10,
    priceRange: '$33.13/kg - $1,566.25/rollo',
    products: [
      {
        id: 'puas-1',
        name: 'Rollos Púas Galv. Ligero',
        spec: 'Presentación: 300 ML',
        gauge: 'Cal. 16',
        unit: 'Rollo 300 ML',
        price: 586.00,
        notes: 'Púas galvanizadas 4 puntas'
      },
      {
        id: 'puas-2',
        name: 'Rollos Púas Galv. Ligero',
        spec: 'Presentación: 360 ML',
        gauge: 'Cal. 16',
        unit: 'Rollo 360 ML',
        price: 731.25,
        notes: 'Púas galvanizadas 4 puntas mayor longitud'
      },
      {
        id: 'puas-3',
        name: 'Rollo Púa Galvanizado Reforzado',
        spec: 'Presentación: 300 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 300 ML',
        price: 1142.83,
        notes: 'Alambre de púas uso pesado ganadero'
      },
      {
        id: 'puas-4',
        name: 'Rollo Púa Galvanizado Reforzado',
        spec: 'Presentación: 360 ML',
        gauge: 'Cal. 12.5',
        unit: 'Rollo 360 ML',
        price: 1423.13,
        notes: 'Alambre de púas uso pesado 360m'
      },
      {
        id: 'puas-5',
        name: 'Rollo Púa P.V.C. Verde',
        spec: 'Presentación: 300 ML',
        gauge: 'Cal. 12.5 con PVC',
        unit: 'Rollo 300 ML',
        price: 1566.25,
        notes: 'Recubrimiento plástico verde anticorrosión'
      },
      {
        id: 'alam-1',
        name: 'Alambre Galvanizado por KG',
        spec: 'Calibres 20 y 22 (Para amarre fino)',
        gauge: 'Cal. 20 y 22',
        unit: 'Kilogramo',
        price: 69.92,
        notes: 'Alta maleabilidad'
      },
      {
        id: 'alam-2',
        name: 'Alambre Galvanizado por KG',
        spec: 'Calibre 18 (Para amarre de malla)',
        gauge: 'Cal. 18',
        unit: 'Kilogramo',
        price: 61.74,
        notes: 'El estándar de amarre en cercas'
      },
      {
        id: 'alam-3',
        name: 'Alambre Galvanizado por KG',
        spec: 'Calibres 15 y 16 (Tensor intermedio)',
        gauge: 'Cal. 15 y 16',
        unit: 'Kilogramo',
        price: 50.21,
        notes: 'Alambre de tensión'
      },
      {
        id: 'alam-4',
        name: 'Alambre Galvanizado por KG',
        spec: 'Calibres 12.5 y 13 (Tensor pesado)',
        gauge: 'Cal. 12.5 y 13',
        unit: 'Kilogramo',
        price: 45.99,
        notes: 'Alambre de alta tensión estructural'
      },
      {
        id: 'grapa-1',
        name: 'Grapa Galvanizada por KG',
        spec: 'Calibre 32 (Para fijación en postes de madera)',
        gauge: 'Cal. 32',
        unit: 'Kilogramo',
        price: 33.13,
        notes: 'Grapas tipo U galvanizadas'
      }
    ]
  },
  {
    id: 'accesorios_herrajes',
    number: 6,
    name: '6. Accesorios y Herrajes para Cerca',
    shortName: 'Accesorios & Herrajes',
    description: 'Abrazaderas de arranque y tensión, tapones simple lámina, coples de aluminio, juegos de picaporte y tensores completos.',
    iconName: 'Wrench',
    badge: 'Precio Unitario',
    itemsCount: 10,
    priceRange: '$2.96 - $187.51 / pza',
    products: [
      {
        id: 'acc-1',
        name: 'Abrazadera de Arranque',
        spec: '33 mm / 38 mm (1 1/2")',
        gauge: 'Galvanizada',
        unit: 'Pieza',
        price: 2.96,
        notes: 'Fija el tubo superior al poste de arranque'
      },
      {
        id: 'acc-2',
        name: 'Abrazadera de Arranque',
        spec: '42 mm (1 5/8")',
        gauge: 'Galvanizada',
        unit: 'Pieza',
        price: 3.05,
        notes: 'Para postes intermedios'
      },
      {
        id: 'acc-3',
        name: 'Abrazadera de Arranque',
        spec: '48 mm (1 7/8")',
        gauge: 'Galvanizada',
        unit: 'Pieza',
        price: 3.40,
        notes: 'Para poste de línea estándar'
      },
      {
        id: 'acc-4',
        name: 'Abrazadera de Tensión',
        spec: '33 mm (1 1/4")',
        gauge: 'Galvanizada',
        unit: 'Pieza',
        price: 3.28,
        notes: 'Sujeta la solera de tensión de malla'
      },
      {
        id: 'acc-5',
        name: 'Tapón Simple Lámina',
        spec: '33 mm (1 1/4")',
        gauge: 'Galvanizado',
        unit: 'Pieza',
        price: 3.05,
        notes: 'Sella el extremo superior del tubo'
      },
      {
        id: 'acc-6',
        name: 'Tapón Simple Lámina',
        spec: '48 mm (1 7/8")',
        gauge: 'Galvanizado',
        unit: 'Pieza',
        price: 4.34,
        notes: 'Sella poste de línea'
      },
      {
        id: 'acc-7',
        name: 'Tapón Simple Lámina',
        spec: '60 mm (2 3/8")',
        gauge: 'Galvanizado',
        unit: 'Pieza',
        price: 5.76,
        notes: 'Sella poste esquinero'
      },
      {
        id: 'acc-8',
        name: 'Cople Simple Aluminio',
        spec: '33 mm (1 1/4")',
        gauge: 'Aluminio inyectado',
        unit: 'Pieza',
        price: 5.65,
        notes: 'Une dos tramos de tubo superior'
      },
      {
        id: 'acc-9',
        name: 'Juego Picaporte Estándar',
        spec: 'Kit completo para puerta/portón',
        gauge: 'Galvanizado reforzado',
        unit: 'Juego',
        price: 187.51,
        notes: 'Incluye cerrojo y pasador porta-candado'
      },
      {
        id: 'acc-10',
        name: 'Tensor Completo Estándar',
        spec: 'Gancho y ojo para alambre tensor',
        gauge: 'Acero galvanizado',
        unit: 'Pieza',
        price: 39.00,
        notes: 'Regula la tensión del alambre guía'
      }
    ]
  },
  {
    id: 'concertinas_cuchillas',
    number: 7,
    name: '7. Concertinas y Cuchillas de Seguridad',
    shortName: 'Concertinas & Arpón',
    description: 'Concerpúa recta y doble en acero inoxidable y galvanizado. Diámetros de 30cm, 45cm y 60cm en rollos de 4 y 8 metros lineales.',
    iconName: 'ShieldCheck',
    badge: 'Precio por Rollo',
    itemsCount: 6,
    priceRange: '$277.56 - $2,065.50 / rollo',
    products: [
      {
        id: 'con-1',
        name: 'Concerpúa Recta Acero Inox',
        spec: 'Rinde 8 ML • Diámetro 30 cm',
        material: 'Acero Inox',
        unit: 'Rollo 8 ML',
        price: 910.80,
        notes: 'Cuchillas tipo arpón en acero inoxidable'
      },
      {
        id: 'con-2',
        name: 'Concerpúa Recta Acero Inox',
        spec: 'Rinde 8 ML • Diámetro 45 cm',
        material: 'Acero Inox',
        unit: 'Rollo 8 ML',
        price: 1375.00,
        notes: 'El diámetro más vendido en residencias y bodegas'
      },
      {
        id: 'con-3',
        name: 'Concerpúa Doble Acero Inox',
        spec: 'Rinde 4 ML • Diámetro 45 cm',
        material: 'Acero Inox Doble Cruzada',
        unit: 'Rollo 4 ML',
        price: 1525.00,
        notes: 'Máxima penetración con espirales cruzadas'
      },
      {
        id: 'con-4',
        name: 'Concerpúa Recta Acero Inox',
        spec: 'Rinde 8 ML • Diámetro 60 cm',
        material: 'Acero Inox',
        unit: 'Rollo 8 ML',
        price: 2065.50,
        notes: 'Máximo diámetro para penitenciarias y alta seguridad'
      },
      {
        id: 'con-5',
        name: 'Concerpúa Recta (Galv)',
        spec: 'Rinde 8 ML • Diámetro 30 cm',
        material: 'Galvanizado',
        unit: 'Rollo 8 ML',
        price: 277.56,
        notes: 'Económica en alambre galvanizado'
      },
      {
        id: 'con-6',
        name: 'Concerpúa Recta (Galv)',
        spec: 'Rinde 8 ML • Diámetro 45 cm',
        material: 'Galvanizado',
        unit: 'Rollo 8 ML',
        price: 343.68,
        notes: 'Excelente relación costo-seguridad'
      }
    ]
  },
  {
    id: 'puertas_reja_inde',
    number: 8,
    name: '8. Puertas Abatibles y Reja Inde Cal. 6',
    shortName: 'Puertas & Reja Inde',
    description: 'Puertas abatibles de 1 hoja con marco estructural y paneles Reja Inde C-71 verde o blanco con postes cuadrados C-75.',
    iconName: 'DoorClosed',
    badge: 'Precios Dist. y Público',
    itemsCount: 7,
    priceRange: '$220.34 - $4,260.29',
    products: [
      {
        id: 'puer-1',
        name: 'Puerta Abatible 1 Hoja',
        spec: 'Medida: 1.00 x 1.00 m • Marco estructural',
        unit: 'Pieza',
        price: 3600.59,
        priceDistributor: 2880.53,
        pricePublic: 3600.59,
        notes: 'Incluye bisagras y pasador porta-candado'
      },
      {
        id: 'puer-2',
        name: 'Puerta Abatible 1 Hoja',
        spec: 'Medida: 1.00 x 1.50 m • Marco estructural',
        unit: 'Pieza',
        price: 4260.29,
        priceDistributor: 3408.32,
        pricePublic: 4260.29,
        notes: 'Puerta peatonal reforzada con marco'
      },
      {
        id: 'reja-1',
        name: 'Reja Inde C-71 (Verde/Blanco)',
        spec: 'Altura: 1.00 m • Ancho: 2.50 m • Calibre 6',
        unit: 'Panel 2.50 m',
        price: 604.23,
        priceDistributor: 503.52,
        pricePublic: 604.23,
        notes: 'Electrosoldada con pliegues en V y pintura horneada'
      },
      {
        id: 'reja-2',
        name: 'Reja Inde C-71 (Verde/Blanco)',
        spec: 'Altura: 1.50 m • Ancho: 2.50 m • Calibre 6',
        unit: 'Panel 2.50 m',
        price: 914.52,
        priceDistributor: 762.10,
        pricePublic: 914.52,
        notes: 'Panel arquitectónico ornamental'
      },
      {
        id: 'reja-3',
        name: 'Reja Inde C-71 (Verde/Blanco)',
        spec: 'Altura: 2.00 m • Ancho: 2.50 m • Calibre 6',
        unit: 'Panel 2.50 m',
        price: 1249.30,
        priceDistributor: 1041.08,
        pricePublic: 1249.30,
        notes: 'Máxima altura y rigidez para fraccionamientos'
      },
      {
        id: 'post-reja-1',
        name: 'Poste C-75 (2" x 2")',
        spec: 'Altura: 1.50 m • Perfil cuadrado con tapón',
        unit: 'Poste',
        price: 264.41,
        priceDistributor: 220.34,
        pricePublic: 264.41,
        notes: 'Para panel de 1.00m a 1.50m'
      },
      {
        id: 'post-reja-2',
        name: 'Poste C-75 (2" x 2")',
        spec: 'Altura: 2.00 m • Perfil cuadrado con tapón',
        unit: 'Poste',
        price: 340.79,
        priceDistributor: 293.78,
        pricePublic: 340.79,
        notes: 'Para panel de 1.50m a 2.00m'
      }
    ]
  }
];
