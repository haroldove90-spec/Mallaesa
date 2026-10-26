import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3000;

// Inicialización de Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTIONS = `Rol: Experto técnico de Mallaesa especializado en instalación y cotización de cercos perimetrales.

Tono: Consultor profesional y práctico.

Dinámica: Preguntar paso a paso de forma conversacional y amigable (no soltar el cuestionario de golpe):
1. Datos básicos: Tipo de cliente, atención a quién, contacto y ubicación (local o foráneo).
2. Producto y dimensiones: Producto (Malla ciclónica galvanizada/PVC, Rejacero, Cerco eléctrico, Cerco ganadero, Concertina, Red deportiva, Reja de seguridad), altura requerida y metros lineales.
3. Geometría del perímetro: Línea recta, escuadra, polígono cerrado/rectángulo, o medidas por lados.
4. Condiciones de instalación: Tipo de suelo (terreno natural, roca, concreto con placa, barda con cadena, etc.), desniveles/escalones y si el terreno está limpio/habilitado.
5. Accesorios: Concertina, alambre de púas, cinta de privacidad, retenidas, barras intermedias/inferiores, puertas o portones (dimensiones y ubicación).

REGLA DE SALIDA FINAL:
Mientras estés recopilando datos, responde de forma conversacional y amigable, haciendo una pregunta a la vez.

Una vez que tengas toda la información completa, genera tu última respuesta incluyendo un bloque de código JSON estrictamente estructurado así:

\`\`\`json
{
  "cliente": {
    "nombre": "string",
    "atencion_a": "string",
    "responsable_obra": "string",
    "telefono": "string",
    "correo": "string",
    "domicilio": "string",
    "ubicacion_tipo": "local | foraneo",
    "distancia_km": 0
  },
  "especificaciones": {
    "producto": "malla_ciclonica | rejacero | cerco_electrico | cerco_ganadero | concertina | red_deportiva | reja_seguridad",
    "altura_m": 0.0,
    "metros_lineales": 0.0,
    "forma": "linea_recta | escuadra | rectangulo | poligono",
    "lados": [],
    "tipo_instalacion": "cimentacion | placa | soldar",
    "tipo_terreno": "terreno_natural | rocoso | concreto | asfalto | barda_block | barda_cadena | pretil | acero",
    "desniveles_escalones": {
      "tiene": false,
      "cantidad": 0,
      "medida_aprox": "string"
    },
    "accesorios": {
      "alambre_pua": false,
      "concertina": false,
      "cerco_electrico": false,
      "cinta_privacidad": false,
      "barra_intermedia": false,
      "barra_inferior": false,
      "retenidas": false
    },
    "puertas_portones": [
      {
        "tipo": "puerta_peatonal | porton_vehicular",
        "hojas": 1,
        "ancho_m": 0.0,
        "ubicacion_lado": "string"
      }
    ],
    "terreno_habilitado": true
  }
}
\`\`\``;

// Endpoint de Chatbot Asistente Técnico Mallaesa
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Faltan mensajes en la solicitud' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no encontrada en el entorno.',
        needsKey: true
      });
    }

    // Convertir historial a formato compatible con Gemini API
    const formattedContents: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }> = [];

    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      // Gemini no debe iniciar con role 'model' como primer mensaje
      if (formattedContents.length === 0 && role === 'model') {
        continue;
      }
      formattedContents.push({
        role,
        parts: [{ text: msg.content || '' }]
      });
    }

    if (formattedContents.length === 0) {
      formattedContents.push({
        role: 'user',
        parts: [{ text: 'Hola, me gustaría cotizar un cerco perimetral.' }]
      });
    }

    let replyText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.7,
        }
      });
      replyText = response.text || '';
    } catch (modelError: any) {
      console.warn('Fallo con gemini-3.8-flash, probando con gemini-2.5-flash:', modelError?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS,
          temperature: 0.7,
        }
      });
      replyText = fallbackResponse.text || '';
    }

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Error en /api/chat:', err);
    return res.status(500).json({
      error: 'Error interno en el procesamiento del Asistente Técnico',
      details: err?.message || 'Error desconocido'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Mallaesa Server] Escuchando en http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('[Mallaesa Server] Error al iniciar:', err);
  process.exit(1);
});
