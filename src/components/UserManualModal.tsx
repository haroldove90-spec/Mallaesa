import React, { useState, useMemo } from 'react';
import { useMallaesa } from '../context/MallaesaContext';
import { RoleType } from '../types';
import { MALLAESA_BRANCHES } from './SimpleReceiptsView';
import {
  BookOpen,
  Printer,
  Copy,
  Check,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Calculator,
  Boxes,
  Users,
  Truck,
  Receipt,
  FileText,
  CheckCircle2,
  Building,
  Phone,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
  Globe,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface RoleManualSection {
  roleId: RoleType | 'general' | 'sucursales';
  title: string;
  badge: string;
  icon: React.ReactNode;
  summary: string;
  modules: {
    name: string;
    description: string;
    steps: string[];
    tips?: string;
  }[];
  frequentQuestions: {
    q: string;
    a: string;
  }[];
}

export const MANUAL_SECTIONS: RoleManualSection[] = [
  {
    roleId: 'general',
    title: 'Guía Rápida de Inicio',
    badge: 'Inicio General',
    icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
    summary: 'Instrucciones básicas para entender y navegar el sistema MALLAESA fácilmente desde cualquier computadora o teléfono.',
    modules: [
      {
        name: '¿Cómo funciona el programa MALLAESA?',
        description: 'MALLAESA es su sistema integral para controlar todo el negocio de cercos perimetrales: desde que un cliente pide un presupuesto, hasta que la cuadrilla instala la malla y se cobra el dinero.',
        steps: [
          'El sistema está dividido en "Roles" (Dirección, Cotizador, Ventas, Operaciones y Administración). Cada rol tiene únicamente los botones y pantallas que necesita.',
          'En la parte izquierda (o abajo en su teléfono) siempre encontrará la barra de menús con los nombres claros de cada módulo.',
          'En la parte superior derecha siempre tiene el botón "📖 Manual de Usuario" para consultar esta ayuda o imprimirla.',
          'Todos los módulos permiten guardar cambios automáticamente y están conectados entre sí: lo que cotiza Ventas, lo ve Operaciones para instalar y Administración para cobrar.'
        ],
        tips: 'Para agrandar la letra en la pantalla, use los botones (+) de este manual o mantenga presionada la tecla Ctrl y mueva la rueda de su ratón.'
      },
      {
        name: '¿Cómo guardar documentos o imprimirlos en papel o PDF?',
        description: 'Cualquier cotización, recibo de pago, orden de trabajo u orden de compra se puede imprimir directamente.',
        steps: [
          'Haga clic en el botón con icono de impresora que dice "Imprimir / PDF".',
          'Se abrirá la ventana de impresión de su computadora.',
          'Si desea imprimir en papel: elija su impresora en la lista y presione el botón azul "Imprimir".',
          'Si desea guardarlo en su computadora o enviarlo por WhatsApp: en "Destino" elija "Guardar como PDF" y presione "Guardar".'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Qué hago si me equivoco al llenar un dato?',
        a: 'No se preocupe. En la mayoría de las pantallas hay un botón para "Editar" o "Cancelar". Si algo no queda bien, puede volver a capturarlo o consultarlo con su administrador.'
      },
      {
        q: '¿Puedo usar el programa en mi celular?',
        a: 'Sí, el sistema funciona en computadoras, tabletas y celulares. En la parte superior hay un botón que dice "Instalar" para tener un acceso directo en su pantalla principal como una aplicación.'
      }
    ]
  },
  {
    roleId: 'director',
    title: 'Rol: Dirección General & Gerencia',
    badge: 'Eduardo Siller',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
    summary: 'Supervisión ejecutiva, aprobación de compras, control de ganancias, catálogo de 1,260 productos y reportes de la empresa.',
    modules: [
      {
        name: '1. Dashboard Ejecutivo & KPIs (Panel Principal)',
        description: 'Aquí ve el estado de salud de toda la empresa en números claros y grandes.',
        steps: [
          'Revise los 4 recuadros principales: Ingresos Cobrados, Cotizaciones Enviadas, Proyectos en Obra y Margen Bruto Real.',
          'Vea el semáforo de margen de utilidad (la meta establecida por la empresa).',
          'Consulte el módulo de Supervisión de Jornada Laboral (Reforma 40 horas) para saber si su personal está dentro de la norma o si hay horas extras acumuladas.'
        ],
        tips: 'Este panel se actualiza automáticamente cada vez que se registra un cobro o se aprueba una cotización.'
      },
      {
        name: '2. Registro de Personal & Roles',
        description: 'Módulo para dar de alta a sus empleados, cuadrillas de campo y personal de oficina.',
        steps: [
          'Haga clic en el botón naranja "+ Nuevo Empleado".',
          'Llene el nombre completo, teléfono, puesto (Instalador, Soldador, Chofer, Administrador) y salario base.',
          'Asigne si el empleado cuenta con seguro IMSS y su cuadrilla habitual.',
          'Haga clic en "Guardar Empleado". Ahora ya aparecerá en las listas de asistencia y nómina.'
        ]
      },
      {
        name: '3. Productos & Precios (Catálogo Maestro de 1,260 Artículos)',
        description: 'La lista maestra oficial de precios de costo y precios de venta de tubos, mallas, rejas, concertinas y accesorios.',
        steps: [
          'Navegue entre las pestañas superiores: Catálogo de Importación, Tuberías y Láminas, Malla Ciclónica, Reja INDE, Concertina y Alambres, Accesorios y Herrajes, o Mallas Especiales.',
          'Use el buscador escribiendo palabras como "tubo 2 pulgadas", "malla 55x55", "abrazadera" o "concertina".',
          'Para cambiar un precio: haga clic en el botón de lápiz (Editar), modifique el precio y guarde.',
          'Para subir un nuevo catálogo de Excel: use el botón "Importar CSV" y elija si desea reemplazar o conservar los productos existentes.'
        ]
      },
      {
        name: '4. Órdenes de Compra (OC)',
        description: 'Supervisión de compras de materiales a proveedores de acero y ferreterías.',
        steps: [
          'Revise las órdenes pendientes generadas para surtir obras.',
          'Valide el monto total y el proveedor.',
          'Autorice la compra para que Almacén reciba los materiales y Finanzas programe el pago.'
        ]
      },
      {
        name: '5. Aprobaciones Clave',
        description: 'Autorizaciones que requieren el visto bueno de la dirección general.',
        steps: [
          'Cuando un vendedor pide un descuento mayor al 5% o un cliente solicita facilidades especiales, aparecerá un aviso con número rojo.',
          'Haga clic en el botón "Aprobar" si está de acuerdo o "Rechazar" si no procede.'
        ]
      },
      {
        name: '6. Reportes Financieros',
        description: 'Balance de entradas de dinero, gastos de obra, nóminas pagadas y ganancia neta.',
        steps: [
          'Seleccione el mes o período que desea consultar.',
          'Revise el desglose de ventas netas, costo de materiales y mano de obra.',
          'Haga clic en "Imprimir Reporte" para guardarlo en PDF o tenerlo impreso.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Cómo puedo cambiarme a ver qué hace otro rol?',
        a: 'En la parte superior, donde dice "Navegación Admin", haga clic en la flechita y elija el rol que desea ver (por ejemplo: Cotizador, Ventas, Operaciones o Administración).'
      }
    ]
  },
  {
    roleId: 'cotizador',
    title: 'Rol: Cotizador & Catálogo',
    badge: 'Cálculo Técnico',
    icon: <Calculator className="w-5 h-5 text-amber-600" />,
    summary: 'Herramienta para calcular rápidamente presupuestos de cercos perimetrales con medidas de metros lineales, altura y accesorios.',
    modules: [
      {
        name: '1. Calculadora de Cotizaciones Perimetrales',
        description: 'El motor principal para armar presupuestos exactos en menos de 2 minutos.',
        steps: [
          'Paso 1: Seleccione el producto (Malla ciclónica galvanizada o PVC, Rejacero, Cerco eléctrico, Ganadero o Concertina).',
          'Paso 2: Ingrese los Metros Lineales (de largo) y la Altura requerida en metros (ej. 2.00 m).',
          'Paso 3: Seleccione el tipo de terreno (Tierra natural, Concreto con placa, Muro con barda o Terreno rocoso).',
          'Paso 4: Marque si llevará accesorios: Concertina superior, Alambre de púas, Cinta plástica de privacidad o Portón/Puerta.',
          'Paso 5: El sistema calcula en automático los postes, tubos, metros de malla, mano de obra y el precio total.',
          'Paso 6: Haga clic en "Generar Propuesta Formal" para imprimir en PDF o enviar por WhatsApp al cliente con el anticipo del 50% desglosado.'
        ],
        tips: 'La calculadora ya toma los precios del catálogo maestro de 1,260 productos, garantizando que nunca cotice por debajo del costo.'
      },
      {
        name: '2. Módulo de Productos & Precios',
        description: 'Consulta rápida de precios de lista de todos los componentes.',
        steps: [
          'Consulte el precio por metro o por pieza de cualquier accesorio sin salir del cotizador.',
          'Utilice el buscador para verificar existencias o medidas técnicas.'
        ]
      },
      {
        name: '3. Catálogo Visual de Cercos',
        description: 'Muestrario con fotografías reales de trabajos terminados para enseñarle al cliente.',
        steps: [
          'Muestre al cliente cómo luce una malla ciclónica con cinta de privacidad verde o cómo se ve la reja de acero de seguridad.',
          'Haga clic en cualquier foto para ver las ventajas técnicas y recomendaciones de instalación.'
        ]
      },
      {
        name: '4. Historial de Cotizaciones',
        description: 'Lista de todos los presupuestos emitidos anteriormente.',
        steps: [
          'Busque una cotización por el nombre del cliente o número de folio (ej. COT-2026-001).',
          'Haga clic en "Ver Detalle" para volver a imprimirla o mandarla nuevamente.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Cómo le envío la cotización por WhatsApp al cliente?',
        a: 'Al terminar de cotizar, haga clic en el botón verde con el icono de WhatsApp. El sistema abrirá la conversación con el cliente y le pondrá el mensaje listo con el resumen y el folio.'
      }
    ]
  },
  {
    roleId: 'ventas',
    title: 'Rol: Ventas & Atención (CRM)',
    badge: 'Comercial',
    icon: <Users className="w-5 h-5 text-blue-600" />,
    summary: 'Atención de prospectos que piden información por la página web, llamadas o WhatsApp, y seguimiento hasta cerrar la venta.',
    modules: [
      {
        name: '1. Bandeja de Cuestionarios Web & Asistente',
        description: 'Aquí caen los clientes nuevos que llenaron el cotizador en la página web www.mallaesa.com.',
        steps: [
          'Revise la lista de solicitudes con etiqueta "Nuevo".',
          'Haga clic en "Ver Cuestionario" para ver los datos: nombre, teléfono, domicilio de la obra y qué producto quieren.',
          'Haga clic en "Pasar a Cotizador" para armar su propuesta formal de inmediato.'
        ]
      },
      {
        name: '2. CRM de Prospectos (Embudo de Ventas)',
        description: 'Tablero visual para que ningún cliente se quede sin atender.',
        steps: [
          'Las columnas muestran las etapas: 1. Contacto Inicial -> 2. Levantamiento / Medición -> 3. Cotización Enviada -> 4. Ganada / Vendida -> 5. Perdida.',
          'Arrastre la tarjeta del cliente a la siguiente columna conforme avance la negociación.',
          'Escriba notas sobre cada llamada ("El cliente pide que le marquemos el martes a las 4pm").'
        ]
      },
      {
        name: '3. Atención a Clientes (Tickets & Dudas)',
        description: 'Registro de solicitudes de soporte, garantías o dudas de clientes con obra activa.',
        steps: [
          'Registre el número de reporte y el problema reportado.',
          'Asigne un responsable para resolverlo y márquelo como "Resuelto" una vez solucionado.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Qué pasa cuando el cliente acepta la cotización?',
        a: 'Haga clic en "Aprobar Cotización" y pase los datos a Administración para que emitan el recibo del 50% de anticipo. En cuanto se registra el anticipo, el proyecto se envía a Operaciones para empezar a instalar.'
      }
    ]
  },
  {
    roleId: 'operaciones',
    title: 'Rol: Operaciones & Instalación en Campo',
    badge: 'Cuadrillas & Obras',
    icon: <Truck className="w-5 h-5 text-amber-700" />,
    summary: 'Control de cuadrillas de instaladores, salida de materiales del almacén, avance de obra con fotos y firma de entrega al cliente.',
    modules: [
      {
        name: '1. Órdenes de Trabajo (OT)',
        description: 'Cada obra aprobada genera una Orden de Trabajo para que los instaladores sepan qué hacer.',
        steps: [
          'Abra la orden de trabajo para ver la dirección de la obra y los metros a instalar.',
          'Asigne la cuadrilla responsable (por ejemplo: Cuadrilla 1 - Don Roberto).',
          'Programe la fecha de inicio y la fecha estimada de terminación.'
        ]
      },
      {
        name: '2. Avance Diario de Cuadrillas',
        description: 'Supervisión de cuántos metros se colocaron hoy en cada obra.',
        steps: [
          'Registre los metros instalados en el día.',
          'Suba fotos del avance (postes colados, malla tensada, concertina colocada).',
          'Anote si hubo algún problema con lluvia o terreno duro para justificar los tiempos.'
        ]
      },
      {
        name: '3. Control Vehicular & Flotilla',
        description: 'Bitácora de camionetas de la empresa para evitar pérdidas de gasolina.',
        steps: [
          'Anote el kilometraje de salida en la mañana y el de regreso en la tarde.',
          'Registre los litros de gasolina cargados y el número de ticket.',
          'Revise cuándo le toca el próximo cambio de aceite a cada vehículo.'
        ]
      },
      {
        name: '4. Ingresos y Egresos de Almacén',
        description: 'Control de qué material sale de la bodega para cada obra.',
        steps: [
          'Cuando una cuadrilla cargue rollos de malla, postes o bultos de cemento, regístrelo en "Salida de Almacén" ligado al folio de la obra.',
          'Si sobró material al terminar la obra, regístrelo en "Devolución" para que vuelva al inventario.'
        ]
      },
      {
        name: '5. Bitácora & Firma de Campo (Entrega de Obra)',
        description: 'Comprobante final donde el cliente firma de recibido y satisfecho.',
        steps: [
          'Al terminar la instalación, abra la Bitácora de Campo en el teléfono o tableta.',
          'Tome la foto final del cerco terminado y limpio.',
          'Pídale al cliente que firme con su dedo sobre la pantalla en el recuadro blanco.',
          'Presione "Guardar Entrega". Con esto Administración sabe que ya puede cobrar el finiquito.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Qué hago si hace falta material adicional en una obra?',
        a: 'Genere una solicitud de material adicional en la Orden de Trabajo. Dirección lo autoriza y Almacén entrega el material sin detener la obra.'
      }
    ]
  },
  {
    roleId: 'administracion',
    title: 'Rol: Administración & Finanzas',
    badge: 'Cobranza & Fiscal',
    icon: <Receipt className="w-5 h-5 text-emerald-800" />,
    summary: 'Cobranza de anticipos y finiquitos, emisión de recibos con las 3 sucursales, facturas SAT, nómina y cuentas por pagar.',
    modules: [
      {
        name: '1. Recibos Simples de Pago (Sin Factura)',
        description: 'Comprobantes oficiales para clientes particulares que no requieren factura fiscal del SAT.',
        steps: [
          'Haga clic en el botón negro "Emitir Nuevo Recibo de Pago".',
          'Seleccione la Sucursal Emisora: San Luis Potosí, León de los Aldama o Monterrey.',
          'Escriba el nombre del cliente, teléfono y dirección de la obra.',
          'Indique el Monto Total de la Obra y cuánto está pagando hoy (Anticipo 50%, Abono Parcial o Finiquito).',
          'El sistema calcula automáticamente el saldo que queda pendiente por pagar.',
          'Haga clic en "Generar Recibo de Pago".',
          'Haga clic en "Imprimir / PDF" para entregarle su comprobante en papel o mandárselo por WhatsApp con los datos completos de las 3 sucursales y www.mallaesa.com.'
        ],
        tips: 'Todos los recibos emitidos quedan guardados en el historial para que nunca se pierda un registro de dinero.'
      },
      {
        name: '2. Facturación CFDI 4.0 (SAT)',
        description: 'Módulo para clientes empresariales o personas físicas con actividad empresarial que requieren factura para deducir impuestos.',
        steps: [
          'Ingrese el RFC, Razón Social, Código Postal y Régimen Fiscal del cliente.',
          'Seleccione el uso de CFDI (Gastos en general o Construcciones).',
          'Descargue el archivo PDF y XML para enviarlo por correo al contador del cliente.'
        ]
      },
      {
        name: '3. Cuentas por Cobrar (Saldos de Clientes)',
        description: 'Saber exactamente qué clientes tienen saldo pendiente y cuándo deben liquidar.',
        steps: [
          'Vea la lista con nombres, folio de obra, total de la obra y saldo por cobrar.',
          'Al terminar la instalación, contacte al cliente para el cobro del 50% restante.',
          'Haga clic en "Registrar Cobro" cuando el cliente pague por transferencia SPEI o efectivo.'
        ]
      },
      {
        name: '4. Cuentas por Pagar (CxP Proveedores)',
        description: 'Control de pagos a proveedores de acero, tubería, postes y cemento.',
        steps: [
          'Revise las facturas que vencen esta semana.',
          'Registre los pagos realizados para mantener abiertas las líneas de crédito con las acereras.'
        ]
      },
      {
        name: '5. Personal & Asistencia (Norma 40 Horas LFT)',
        description: 'Control del reloj checador semanal de los trabajadores.',
        steps: [
          'Marque las entradas y salidas del personal cada día.',
          'El sistema vigila el tope de 40 horas semanales y calcula en automático si hay horas extras dobles o triples.',
          'Imprima la hoja de asistencia semanal para que los trabajadores firmen su raya.'
        ]
      },
      {
        name: '6. Nómina & Gastos Operativos',
        description: 'Cálculo del pago semanal a instaladores, viáticos, gasolina y compras menores.',
        steps: [
          'Revise el total a pagar a cada trabajador según sus días trabajados y horas extras.',
          'Genere el recibo de nómina semanal y archive el comprobante firmado.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Cómo sé si un recibo pertenece a San Luis Potosí, León o Monterrey?',
        a: 'En la lista de recibos cada tarjeta tiene una etiqueta verde con el nombre de la sucursal emisora. Al imprimirlo, en el pie de página aparecen claramente las 3 direcciones oficiales con sus teléfonos y WhatsApp.'
      }
    ]
  },
  {
    roleId: 'cliente',
    title: 'Rol: Portal del Cliente (Público)',
    badge: 'Seguimiento',
    icon: <Search className="w-5 h-5 text-stone-700" />,
    summary: 'Pantalla donde el cliente final puede consultar su presupuesto, ver el avance en fotos de su cerco y validar su garantía.',
    modules: [
      {
        name: '1. Consulta de Presupuesto en Línea',
        description: 'El cliente entra con su número de folio (ej. COT-1002) y puede revisar el detalle de su cerco.',
        steps: [
          'El cliente escribe su número de folio en el buscador.',
          'Aparece el desglose de metros lineales, altura, precio total y anticipo.',
          'El cliente puede hacer clic en "Aprobar Propuesta" directamente desde su celular.'
        ]
      },
      {
        name: '2. Estatus de Obra en Tiempo Real',
        description: 'Tranquilidad total para el cliente viendo cómo avanza su instalación.',
        steps: [
          'El cliente ve la barra de avance: Material en preparación -> Cuadrilla en camino -> Postería colada -> Malla instalada -> Concluido.',
          'Puede ver las fotos tomadas por la cuadrilla en campo.'
        ]
      },
      {
        name: '3. Certificado de Garantía MALLAESA',
        description: 'Póliza formal de garantía de durabilidad contra corrosión y desprendimiento.',
        steps: [
          'Una vez liquidada la obra, el cliente puede descargar su Certificado Oficial de Garantía sellado digitalmente.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿El cliente puede modificar los precios desde su portal?',
        a: 'No, el portal del cliente es únicamente de consulta y aprobación. No puede modificar precios ni configuraciones internas.'
      }
    ]
  },
  {
    roleId: 'pagina_web',
    title: 'Rol: Página Web Oficial (www.mallaesa.com)',
    badge: 'Sitio Web',
    icon: <Globe className="w-5 h-5 text-emerald-600" />,
    summary: 'La cara de la empresa ante el público general en internet.',
    modules: [
      {
        name: '1. Catálogo de Acero y Soluciones Perimetrales',
        description: 'Presentación de malla ciclónica galvanizada y PVC, concertina, reja INDE, postes y tuberías.',
        steps: [
          'Los clientes visitantes pueden explorar fichas técnicas y aplicaciones residenciales, industriales y agrícolas.'
        ]
      },
      {
        name: '2. Cotizador Inteligente en Línea',
        description: 'Herramienta pública para que los visitantes soliciten presupuestos 24/7.',
        steps: [
          'El visitante llena el formulario con sus metros lineales y teléfono.',
          'La solicitud cae de inmediato a la Bandeja del Rol Ventas para su atención inmediata.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Cómo regreso al sistema administrativo desde la página web?',
        a: 'En la esquina superior derecha de la página web hay un botón que dice "Acceso Administrativo / Iniciar Sesión".'
      }
    ]
  },
  {
    roleId: 'sucursales',
    title: 'Directorio Oficial de Sucursales MALLAESA',
    badge: '3 Ubicaciones',
    icon: <Building className="w-5 h-5 text-emerald-700" />,
    summary: 'Datos de contacto oficiales que aparecen en todos los recibos, contratos y cotizaciones emitidas.',
    modules: [
      {
        name: 'Sucursal Matriz: San Luis Potosí, S.L.P.',
        description: 'Atención a clientes particulares, empresas y obras en la zona centro del país.',
        steps: [
          'Dirección: Fidel Briano 110, Col. Morales Campestre, Código Postal 78154, San Luis Potosí, S.L.P.',
          'Teléfono Fijo: 4448337481',
          'WhatsApp de Atención Inmediata: 4443339226',
          'Horario: Lunes a Viernes de 8:00 AM a 6:00 PM | Sábados de 8:30 AM a 1:30 PM'
        ]
      },
      {
        name: 'Sucursal: León de los Aldama, Guanajuato',
        description: 'Atención especializada para el Bajío y obras industriales.',
        steps: [
          'Dirección: Blvd. Paseo de la Presa #825, Col. Valle Hermoso, Código Postal 37108, León de los Aldama, Guanajuato.',
          'WhatsApp de Atención Inmediata: 4611718778'
        ]
      },
      {
        name: 'Sucursal: Monterrey, Nuevo León',
        description: 'Atención para la zona norte del país y grandes proyectos industriales.',
        steps: [
          'Dirección: Aarón Sáenz Garza #1900, Col. Santa María, Código Postal 64650, Monterrey, Nuevo León.',
          'WhatsApp de Atención Inmediata: 8134060349'
        ]
      },
      {
        name: 'Sitio Web Corporativo Oficial',
        description: 'Portal web disponible en todo el país.',
        steps: [
          'Portal Oficial: www.mallaesa.com',
          'Cotizaciones en línea las 24 horas del día los 365 días del año.'
        ]
      }
    ],
    frequentQuestions: [
      {
        q: '¿Cómo se asigna la sucursal a un recibo?',
        a: 'Al emitir un recibo en el módulo de Administración, elija la sucursal emisora en el menú desplegable. El recibo se generará con los logotipos y el pie de página de las 3 sucursales.'
      }
    ]
  }
];

export const UserManualModal: React.FC = () => {
  const { isUserManualOpen, closeUserManual, manualTargetRole, activeRole } = useMallaesa();
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>(() => {
    return manualTargetRole || activeRole || 'general';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Synchronize initial tab with target role when opening
  React.useEffect(() => {
    if (manualTargetRole) {
      setSelectedRoleTab(manualTargetRole);
    } else if (activeRole) {
      setSelectedRoleTab(activeRole);
    }
  }, [manualTargetRole, activeRole, isUserManualOpen]);

  if (!isUserManualOpen) return null;

  const currentSection = MANUAL_SECTIONS.find(s => s.roleId === selectedRoleTab) || MANUAL_SECTIONS[0];

  // Filtering for search term across modules
  const filteredModules = currentSection.modules.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.steps.some(s => s.toLowerCase().includes(term))
    );
  });

  // Generate plain text manual for WhatsApp / Email copy
  const handleCopyTextManual = () => {
    let fullText = `====================================================\n`;
    fullText += `MANUAL DE USUARIO OFICIAL - SISTEMA MALLAESA\n`;
    fullText += `Seguridad Perimetral & Cercos de Acero\n`;
    fullText += `Sitio Web: www.mallaesa.com\n`;
    fullText += `====================================================\n\n`;

    MANUAL_SECTIONS.forEach(sec => {
      fullText += `----------------------------------------------------\n`;
      fullText += `📌 ${sec.title.toUpperCase()} (${sec.badge})\n`;
      fullText += `Resumen: ${sec.summary}\n`;
      fullText += `----------------------------------------------------\n\n`;

      sec.modules.forEach(mod => {
        fullText += `▶ ${mod.name}\n`;
        fullText += `   ¿Qué hace?: ${mod.description}\n`;
        fullText += `   Paso a paso:\n`;
        mod.steps.forEach((st, idx) => {
          fullText += `     ${idx + 1}. ${st}\n`;
        });
        if (mod.tips) {
          fullText += `   💡 Consejo: ${mod.tips}\n`;
        }
        fullText += `\n`;
      });

      if (sec.frequentQuestions.length > 0) {
        fullText += `   Preguntas Frecuentes:\n`;
        sec.frequentQuestions.forEach(fq => {
          fullText += `   • Pregunta: ${fq.q}\n`;
          fullText += `     Respuesta: ${fq.a}\n`;
        });
        fullText += `\n`;
      }
    });

    fullText += `====================================================\n`;
    fullText += `DIRECTORIO OFICIAL DE SUCURSALES MALLAESA\n`;
    fullText += `1. San Luis Potosí, S.L.P.: Fidel Briano 110, Col. Morales Campestre, C.P. 78154 | Tel: 4448337481 | WhatsApp: 4443339226\n`;
    fullText += `2. León de los Aldama, Gto.: Blvd. P. de la Presa #825, Col. Valle Hermoso, C.P. 37108 | WhatsApp: 4611718778\n`;
    fullText += `3. Monterrey, N.L.: Aarón Sáenz Garza #1900, Col. Santa María, C.P. 64650 | WhatsApp: 8134060349\n`;
    fullText += `Sitio Web Oficial: www.mallaesa.com\n`;
    fullText += `====================================================\n`;

    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] border border-stone-300 print:max-h-none print:shadow-none print:border-none print:p-0 ${isLargeFont ? 'text-base' : 'text-sm'}`}>
        
        {/* Cabecera del Manual (Con botones claros e intuitivos) */}
        <div className="p-4 sm:p-6 bg-stone-900 text-white rounded-t-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 print:bg-white print:text-black print:border-b-2 print:border-black print:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white print:hidden">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-md print:hidden">
                  Guía Fácil Paso a Paso
                </span>
                <span className="text-xs text-stone-400 print:text-stone-700">MALLAESA S.A. DE C.V.</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5 tracking-tight flex items-center gap-2">
                Manual de Usuario del Sistema MALLAESA
              </h2>
              <p className="text-xs text-stone-300 print:text-stone-600 mt-0.5">
                Explicado de forma sencilla, práctica y directa para cada rol y módulo.
              </p>
            </div>
          </div>

          {/* Barra de Acciones: Imprimir PDF, Copiar Texto, Agrandar Letra, Cerrar */}
          <div className="flex items-center flex-wrap gap-2 print:hidden">
            {/* Botón Aumentar Letra */}
            <button
              onClick={() => setIsLargeFont(!isLargeFont)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isLargeFont
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
              }`}
              title="Aumentar o restablecer tamaño de letra para leer más fácil"
            >
              {isLargeFont ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              <span>{isLargeFont ? 'Letra Normal' : 'Letra Grande (+)'}</span>
            </button>

            {/* Botón Copiar Manual */}
            <button
              onClick={handleCopyTextManual}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Copiar todo el manual en texto para enviarlo por WhatsApp o Correo"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-300" />
                  <span>Copiar para WhatsApp</span>
                </>
              )}
            </button>

            {/* Botón Descargar en PDF / Imprimir */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
              title="Descargar este manual en PDF o mandarlo a su impresora"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar en PDF / Imprimir</span>
            </button>

            {/* Botón Cerrar */}
            <button
              onClick={closeUserManual}
              className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white rounded-xl transition cursor-pointer"
              title="Cerrar Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas por Rol (Fácil de identificar con iconos y nombres grandes) */}
        <div className="bg-stone-100 border-b border-stone-200 px-3 py-2 overflow-x-auto flex gap-1.5 shrink-0 print:hidden">
          {MANUAL_SECTIONS.map(sec => {
            const isSelected = selectedRoleTab === sec.roleId;
            return (
              <button
                key={sec.roleId}
                onClick={() => {
                  setSelectedRoleTab(sec.roleId);
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer text-xs sm:text-sm ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200/80 border border-stone-200'
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.title}</span>
                {activeRole === sec.roleId && (
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Su Rol Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador Rápido de Ayuda */}
        <div className="p-3 sm:px-6 bg-stone-50 border-b border-stone-200 flex items-center gap-3 shrink-0 print:hidden">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar en este rol: ej. cotizar, recibo, factura, registrar empleado, precio, obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-stone-500 hover:text-black font-semibold cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Contenido Principal del Manual (Scrollable y optimizado para imprimir) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:overflow-visible print:p-6">
          
          {/* Tarjeta de Resumen del Rol Seleccionado */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-800 text-white rounded-md">
                  {currentSection.badge}
                </span>
                <span className="text-xs font-semibold text-emerald-900">Guía Oficial de Operación</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-black mt-1">
                {currentSection.title}
              </h3>
              <p className={`text-stone-700 mt-1 leading-relaxed ${isLargeFont ? 'text-base' : 'text-xs sm:text-sm'}`}>
                {currentSection.summary}
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-2 print:hidden">
              <span className="text-xs font-bold text-stone-500">
                {filteredModules.length} {filteredModules.length === 1 ? 'módulo explicado' : 'módulos explicados'}
              </span>
            </div>
          </div>

          {/* Listado de Módulos con Pasos Claros */}
          <div className="space-y-4">
            {filteredModules.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-700">No se encontraron resultados para "{searchTerm}"</p>
                <p className="text-xs text-stone-500 mt-1">Intente con palabras como "malla", "precio", "pago" o borre la búsqueda.</p>
              </div>
            ) : (
              filteredModules.map((mod, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3 print:border-stone-400 print:shadow-none print:break-inside-avoid"
                >
                  <div className="border-b border-stone-100 pb-2.5">
                    <h4 className="text-sm sm:text-base font-black text-black flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-xs font-black text-stone-800 shrink-0">
                        {idx + 1}
                      </span>
                      <span>{mod.name}</span>
                    </h4>
                    <p className={`text-stone-600 mt-1 font-medium ${isLargeFont ? 'text-sm' : 'text-xs'}`}>
                      {mod.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 block mb-2">
                      ¿Cómo usarlo? Siga estos sencillos pasos:
                    </span>
                    <ol className="space-y-2">
                      {mod.steps.map((step, sIdx) => (
                        <li
                          key={sIdx}
                          className="flex items-start gap-2.5 text-stone-800"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className={`leading-relaxed ${isLargeFont ? 'text-base' : 'text-xs sm:text-sm'}`}>
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {mod.tips && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mt-2">
                      <span className="text-amber-800 font-bold text-xs shrink-0">💡 Consejo Importante:</span>
                      <span className={`text-amber-900 leading-snug ${isLargeFont ? 'text-sm' : 'text-xs'}`}>
                        {mod.tips}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Preguntas Frecuentes del Rol */}
          {currentSection.frequentQuestions.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3 print:break-inside-avoid">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preguntas Frecuentes y Dudas Comunes</span>
              </h4>
              <div className="space-y-2.5">
                {currentSection.frequentQuestions.map((item, fqIdx) => (
                  <div key={fqIdx} className="bg-white border border-stone-200 rounded-xl p-3 text-xs sm:text-sm space-y-1">
                    <p className="font-bold text-black flex items-start gap-1.5">
                      <span className="text-emerald-700 font-black">¿?</span>
                      <span>{item.q}</span>
                    </p>
                    <p className={`text-stone-600 pl-4 leading-relaxed ${isLargeFont ? 'text-sm' : 'text-xs'}`}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directorio de Sucursales en el Pie del Manual */}
          <div className="pt-4 border-t-2 border-stone-200 bg-stone-50 rounded-2xl p-4 text-xs space-y-3 print:border-black print:p-4 print:break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-200 pb-2">
              <span className="font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" />
                MALLAESA S.A. DE C.V. • Sucursales Oficiales de Atención
              </span>
              <span className="font-bold text-stone-600">
                Sitio Oficial: www.mallaesa.com
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-700">
              <div className="border-l-2 border-emerald-600 pl-2.5">
                <p className="font-bold text-black">San Luis Potosí (Matriz)</p>
                <p className="text-[11px] text-stone-600 leading-tight">Fidel Briano 110, Morales Campestre, C.P. 78154</p>
                <p className="text-[11px] font-semibold text-stone-800 mt-0.5">Tel: 4448337481</p>
                <p className="text-[11px] font-semibold text-emerald-700">WhatsApp: 4443339226</p>
              </div>

              <div className="border-l-2 border-emerald-600 pl-2.5">
                <p className="font-bold text-black">Sucursal León, Guanajuato</p>
                <p className="text-[11px] text-stone-600 leading-tight">Blvd. P. de la Presa #825, Valle Hermoso, C.P. 37108</p>
                <p className="text-[11px] font-semibold text-emerald-700 mt-1">WhatsApp: 4611718778</p>
              </div>

              <div className="border-l-2 border-emerald-600 pl-2.5">
                <p className="font-bold text-black">Sucursal Monterrey, N.L.</p>
                <p className="text-[11px] text-stone-600 leading-tight">Aarón Sáenz Garza #1900, Santa María, C.P. 64650</p>
                <p className="text-[11px] font-semibold text-emerald-700 mt-1">WhatsApp: 8134060349</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del Modal con Botones */}
        <div className="p-3 sm:p-4 bg-stone-100 border-t border-stone-200 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-stone-500 font-medium text-center sm:text-left">
            ¿Necesita ayuda adicional? Comuníquese con la Dirección General o use el Asistente Inteligente en pantalla.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>
            <button
              onClick={closeUserManual}
              className="px-5 py-2 bg-black hover:bg-stone-800 text-white text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer"
            >
              Cerrar Manual
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
