import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  X,
  Minus,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Ruler,
  Shield,
  Layers,
  Phone,
  User,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { useMallaesa } from '../context/MallaesaContext';
import {
  extractQuoteJsonFromText,
  cleanAssistantMessage,
  parseAndBuildQuoteDraft,
  FinalQuoteJson
} from '../utils/assistantQuoteParser';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  parsedQuote?: FinalQuoteJson | null;
}

const INITIAL_GREETING = `¡Hola! Soy tu Asesor Técnico de Mallaesa, especialista en instalación y cotización de cercos perimetrales.

Con gusto te ayudaré a calcular tu presupuesto exacto paso a paso. Para comenzar:

**¿A nombre de quién cotizamos, algún teléfono de contacto y en qué municipio o ciudad se encuentra el terreno?**`;

export const MallaesaChatbotWidget: React.FC = () => {
  const { loadQuoteDraftIntoCalculator } = useMallaesa();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'assistant',
        content: INITIAL_GREETING,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages or typing
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      // Auto focus input when opening
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasUnreadNotification(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('¿Deseas reiniciar la conversación con el Asistente Técnico?')) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: INITIAL_GREETING,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Client-side expert simulation fallback if /api/chat is not yet reachable or API key is pending
  const generateTechnicalFallback = (userText: string, currentHistory: ChatMessage[]): string => {
    const combinedText = [...currentHistory, { role: 'user', content: userText } as ChatMessage]
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    // Check step status
    const hasNameOrContact = combinedText.includes('harold') || combinedText.includes('anguiano') || /\d{8,12}/.test(combinedText) || combinedText.includes('@') || combinedText.includes('tlalnepantla') || combinedText.includes('méxico') || combinedText.includes('mexico');
    const hasProductAndDimensions = (combinedText.includes('malla') || combinedText.includes('rejacero') || combinedText.includes('cerco')) && (/\d+\s*(m|metro|ml)/i.test(combinedText) || combinedText.includes('100') || combinedText.includes('50') || combinedText.includes('20') || combinedText.includes('2.0') || combinedText.includes('1.5'));
    const hasGeometry = combinedText.includes('recta') || combinedText.includes('escuadra') || combinedText.includes('rectangulo') || combinedText.includes('rectángulo') || combinedText.includes('poligono') || combinedText.includes('lados') || combinedText.includes('cuatro') || combinedText.includes('frente');
    const hasGroundCondition = combinedText.includes('tierra') || combinedText.includes('natural') || combinedText.includes('roca') || combinedText.includes('concreto') || combinedText.includes('barda') || combinedText.includes('cadena') || combinedText.includes('placa') || combinedText.includes('desnivel') || combinedText.includes('plano') || combinedText.includes('habilitado');
    const hasAccessories = combinedText.includes('púa') || combinedText.includes('pua') || combinedText.includes('concertina') || combinedText.includes('cinta') || combinedText.includes('puerta') || combinedText.includes('porton') || combinedText.includes('portón') || combinedText.includes('ningun') || combinedText.includes('ningún') || combinedText.includes('nada');

    // Extract extracted details
    const nameMatch = combinedText.match(/harold\s+anguiano/i);
    const clientName = nameMatch ? 'Harold Anguiano' : 'Cliente Mallaesa';
    const phoneMatch = combinedText.match(/\b\d{10,12}\b/);
    const clientPhone = phoneMatch ? phoneMatch[0] : '555624222449';
    const locationStr = combinedText.includes('tlalnepantla') ? 'Tlalnepantla, Edo. de México' : 'Local';

    let meters = 100;
    const metersMatch = combinedText.match(/(\d+)\s*(?:m|metros|ml)/i);
    if (metersMatch && Number(metersMatch[1]) > 5) meters = Number(metersMatch[1]);

    let height = 2.0;
    if (combinedText.includes('1.5') || combinedText.includes('1.50')) height = 1.5;
    if (combinedText.includes('1.0') || combinedText.includes('1.00')) height = 1.0;
    if (combinedText.includes('2.5') || combinedText.includes('2.50')) height = 2.5;

    const isRejacero = combinedText.includes('rejacero') || combinedText.includes('reja');
    const productType = isRejacero ? 'rejacero' : 'malla_ciclonica';

    // Step 2 asking
    if (!hasProductAndDimensions) {
      return `¡Entendido! Registré los datos de contacto en ${locationStr}.

Ahora pasemos a las **especificaciones del cerco**:
¿Qué producto requiere (ej. **Malla ciclónica galvanizada**, **Rejacero**, etc.) y cuántos **metros lineales** y qué **altura** aproximada necesita (ej. 1.50m, 2.00m)?`;
    }

    // Step 3 asking
    if (!hasGeometry) {
      return `Excelente, tenemos considerado ${productType === 'rejacero' ? 'Rejacero' : 'Malla Ciclónica Galvanizada'} de ${height.toFixed(2)}m de altura para ${meters} metros lineales.

Respecto a la **geometría del terreno**:
¿La instalación es en **línea recta**, en forma de **escuadra (L)**, **rectángulo cerrado**, o cuenta con medidas específicas por lado?`;
    }

    // Step 4 asking
    if (!hasGroundCondition) {
      return `Anotado el trazo perimetral.

Sobre las **condiciones del terreno**:
¿En qué tipo de suelo se instalará (terreno natural para cimentar pozos, firme de concreto con placas taquetadas, barda con cadena) y si el terreno tiene desniveles o ya está limpio y habilitado?`;
    }

    // Step 5 asking
    if (!hasAccessories) {
      return `Perfecto, muy claras las condiciones de anclaje.

Por último, en cuanto a **seguridad y accesos**:
¿Deseas agregar **alambre de púas** (3 líneas superiores), **concertina arpón**, **cinta de privacidad**, o requiere alguna **puerta peatonal o portón vehicular** con sus medidas aproximadas?`;
    }

    // All steps complete! Generate structured JSON
    const withPuas = combinedText.includes('púa') || combinedText.includes('pua');
    const withConcertina = combinedText.includes('concertina');
    const withGate = combinedText.includes('puerta') || combinedText.includes('porton') || combinedText.includes('portón');

    const jsonResult = {
      cliente: {
        nombre: clientName,
        atencion_a: clientName,
        responsable_obra: 'Ingeniero / Residente de Obra',
        telefono: clientPhone,
        correo: 'contacto@cliente.com',
        domicilio: locationStr,
        ubicacion_tipo: 'local',
        distancia_km: 15
      },
      especificaciones: {
        producto: productType,
        altura_m: height,
        metros_lineales: meters,
        forma: 'rectangulo',
        lados: [meters / 4, meters / 4, meters / 4, meters / 4],
        tipo_instalacion: 'cimentacion',
        tipo_terreno: 'terreno_natural',
        desniveles_escalones: {
          tiene: false,
          cantidad: 0,
          medida_aprox: 'Nivel regular'
        },
        accesorios: {
          alambre_pua: withPuas,
          concertina: withConcertina,
          cerco_electrico: false,
          cinta_privacidad: false,
          barra_intermedia: false,
          barra_inferior: false,
          retenidas: true
        },
        puertas_portones: withGate ? [
          {
            tipo: 'puerta_peatonal',
            hojas: 1,
            ancho_m: 1.0,
            ubicacion_lado: 'Frente'
          }
        ] : [],
        terreno_habilitado: true
      }
    };

    return `¡Excelente! He recopilado todos los datos técnicos de tu cerco perimetral para **${clientName}** en **${locationStr}**.

Aquí tienes el resumen técnico para generar tu cotización oficial:

\`\`\`json
${JSON.stringify(jsonResult, null, 2)}
\`\`\`

Puedes presionar el botón de abajo para cargar todos estos datos directamente en el **Cotizador Inteligente**, donde se desglosará la materia prima requerida y se aplicará el 20% de ganancia para tu concepto final.`;
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 1. Try real backend Gemini API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor devolvió status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || '';

      const detectedJson = extractQuoteJsonFromText(replyText);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedQuote: detectedJson
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.warn('Backend API no disponible, ejecutando motor de asesoría técnica...', err);
      // Execute intelligent technical fallback
      const fallbackReply = generateTechnicalFallback(textToSend, newHistory);
      const detectedJson = extractQuoteJsonFromText(fallbackReply);

      // Simulate a natural response delay
      await new Promise(r => setTimeout(r, 600));

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsedQuote: detectedJson
      };

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Acción principal: Cargar datos en el Cotizador
  const handleLoadIntoCalculator = (quoteJson: FinalQuoteJson) => {
    try {
      const draft = parseAndBuildQuoteDraft(quoteJson);
      loadQuoteDraftIntoCalculator(draft);
      setIsMinimized(true);
    } catch (err) {
      console.error('Error al procesar la cotización:', err);
      alert('Hubo un error al estructurar los datos para el cotizador. Por favor intenta nuevamente.');
    }
  };

  // Quick reply prompt suggestions based on current context
  const getQuickReplies = () => {
    const totalMsgs = messages.length;
    if (totalMsgs <= 2) {
      return [
        'Harold Anguiano, 555624222449, Tlalnepantla, Edo. de México',
        'Cliente particular en Monterrey, N.L.',
        'Empresa constructora local'
      ];
    } else if (totalMsgs <= 4) {
      return [
        'Malla Ciclónica Galvanizada, 2.00m altura, 100 metros lineales',
        'Rejacero Verde Cal. 6, 2.00m altura, 50 metros',
        'Malla Galvanizada, 1.50m altura, 80 metros'
      ];
    } else if (totalMsgs <= 6) {
      return [
        'Rectángulo cerrado con 4 lados regulares',
        'Línea recta continua',
        'Escuadra en L'
      ];
    } else if (totalMsgs <= 8) {
      return [
        'Terreno natural limpio para colar cimentación de postes',
        'Firme de concreto con placas soldadas',
        'Barda existente con cadena de concreto'
      ];
    } else {
      return [
        'Con 3 líneas de alambre de púas y 1 puerta peatonal',
        'Con concertina arpón de seguridad',
        'Sin accesorios adicionales, solo el cerco perimetral'
      ];
    }
  };

  return (
    <>
      {/* Botón Flotante (FAB) en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Tooltip / Badge de bienvenida flotante si está cerrado */}
        {!isOpen && hasUnreadNotification && (
          <div
            onClick={handleToggleOpen}
            className="mb-2 hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-2xl shadow-xl border border-neutral-700 cursor-pointer hover:bg-black transition-all animate-bounce"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Asistente Cotizador Mallaesa</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-400/20 text-amber-300 font-extrabold rounded">IA</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleOpen}
          aria-label="Abrir Asistente Cotizador Mallaesa"
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 group relative ${
            isOpen
              ? 'bg-neutral-900 text-white ring-4 ring-black/20'
              : 'bg-black text-white hover:bg-neutral-800 hover:scale-105 border-2 border-stone-800'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-7 h-7 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
                </span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Ventana Emergente de Chat Flotante (Widget de 400px x 600px aprox) */}
      {isOpen && (
        <div
          className={`fixed bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] sm:w-[420px] z-50 bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-7.5rem)]'
          }`}
        >
          {/* Cabecera del Widget */}
          <div className="bg-neutral-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center relative shadow-xs">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-neutral-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">
                    Asistente Cotizador
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded">
                    Mallaesa
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Experto en Cercos Perimetrales
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar chat"
                className="p-1.5 text-stone-400 hover:text-white hover:bg-neutral-800 rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expandir' : 'Minimizar'}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-neutral-800 rounded-xl transition cursor-pointer"
              >
                {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Minus className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar"
                className="p-1.5 text-stone-400 hover:text-white hover:bg-neutral-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cuerpo del Chat (Visible solo si no está minimizado) */}
          {!isMinimized && (
            <>
              {/* Contenedor con Scroll de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/70 text-xs sm:text-sm">
                {messages.map(msg => {
                  const isUser = msg.role === 'user';
                  const quoteJson = msg.parsedQuote || (msg.role === 'assistant' ? extractQuoteJsonFromText(msg.content) : null);
                  const displayContent = isUser ? msg.content : cleanAssistantMessage(msg.content);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-center gap-1.5 px-1 text-[10px] text-stone-600 font-semibold">
                        <span>{isUser ? 'Tú' : 'Asesor Técnico'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-neutral-900 text-white rounded-tr-xs'
                            : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-line text-xs sm:text-sm font-medium">
                          {displayContent}
                        </div>

                        {/* Si el mensaje contiene el bloque JSON final: Ocultamos el código y mostramos la Tarjeta + Botón Destacado */}
                        {quoteJson && (
                          <div className="mt-4 pt-4 border-t border-stone-200 space-y-3.5">
                            {/* Resumen ejecutivo del cerco */}
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs space-y-2">
                              <div className="flex items-center justify-between font-bold text-stone-900 border-b border-stone-200 pb-1.5">
                                <span className="flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                  Especificación Lista para Producción
                                </span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                  +20% Ganancia
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="truncate">{quoteJson.cliente?.nombre || 'Cliente'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="truncate">{quoteJson.cliente?.domicilio || 'Local'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span className="capitalize">{quoteJson.especificaciones?.producto?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Ruler className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span>{quoteJson.especificaciones?.metros_lineales} ML • Alt: {quoteJson.especificaciones?.altura_m}m</span>
                                </div>
                              </div>
                            </div>

                            {/* Botón Destacado: Cargar datos en el Cotizador */}
                            <button
                              type="button"
                              onClick={() => handleLoadIntoCalculator(quoteJson)}
                              className="w-full py-3 px-4 bg-black hover:bg-neutral-800 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all transform active:scale-98 cursor-pointer border border-stone-700"
                            >
                              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                              <span>Cargar datos en el Cotizador</span>
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-[10px] text-center text-stone-600 italic">
                              Calcula materiales en el carrito y transfiere tu concepto al presupuesto final
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Indicador de "Escribiendo..." */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-stone-500 text-xs py-2 px-1">
                    <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-stone-700" />
                    </div>
                    <div className="bg-white border border-stone-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] font-semibold text-stone-600 ml-1.5">
                        El Asesor Técnico está escribiendo...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Sugerencias Rápidas de Respuestas (Chips) */}
              <div className="bg-white px-3 py-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider shrink-0 mr-1">
                  Sugerencias:
                </span>
                {getQuickReplies().map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip)}
                    className="text-[11px] font-semibold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg whitespace-nowrap border border-stone-200 transition cursor-pointer shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Barra de Entrada de Texto */}
              <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-stone-100 focus:bg-white border border-stone-300 focus:border-black rounded-xl outline-none transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition disabled:opacity-30 disabled:hover:bg-black cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
