import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// --- VALIDACIÓN DE LA API KEY AL ARRANCAR ---
// Si falta la key, el servidor falla rápido y con un mensaje claro,
// en vez de fallar en silencio cada vez que alguien pida una ficha.
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

if (!apiKey) {
  console.error('❌ Falta la API Key de Anthropic. Revisa tu .env (ANTHROPIC_API_KEY=...) o ponla directamente aquí en local.');
  process.exit(1);
}

// Inicializamos el cliente de Claude con tu API Key
const anthropic = new Anthropic({
  apiKey,
  // Si prefieres tenerla directamente en el código mientras trabajáis en local
  // (recordad quitarla antes de subir a un hosting o repo público), sería:
  // apiKey: 'sk-ant-tu-key-aqui',
});

// PROMPT BASE CON REGLAS DE MAQUETACIÓN, EXCEPCIONES DE DIBUJO Y ESTRUCTURA LOMLOE
const BASE_PROMPT = `
Eres un maquetador experto y diseñador instruccional especializado en crear fichas escolares impresas para Educación Primaria (España, LOMLOE).

REGLAS OBLIGATORIAS DE SALIDA HTML:
1. Devuelve ÚNICAMENTE el código HTML encerrado dentro de un contenedor raíz con la clase "ficha": <div class="ficha"> ... </div>
2. NO incluyas <html>, <head>, <body> ni bloques de marcado como \`\`\`html. Solo el HTML directo del contenedor.
3. Utiliza la cabecera estándar rellenando la materia exacta solicitada:
   <div class="cabecera">
     <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
     <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
   </div>
4. El título principal debe usar la clase "titulo-ficha": <h1 class="titulo-ficha">...</h1>
5. Cada pregunta, ejercicio o actividad DEBE ir dentro de su propio contenedor para controlar la paginación: <div class="ejercicio"> ... </div>

REGLAS DE ILUSTRACIONES Y DIBUJOS:
1. REGLA GENERAL (Lengua, Ciencias, Ed. Física, Música, Inglés):
   - Queda strictly PROHIBIDO generar código SVG complejo con formas humanas, deportistas, animales o instrumentos detallados.
   - Si la ficha requiere una zona para dibujar, colorear o representar algo, genera únicamente un contenedor limpio:
     <div class="caja-espacio-dibujo">[ Dibuja, colorea o representa aquí el ejercicio ]</div>

2. EXCEPCIÓN ÚNICA (Solo para Matemáticas de 1º y 2º de Primaria):
   - SE PERMITEN únicamente gráficos SVG geométricos y de conteo MUY SIMPLES (ej: círculos, cuadrados, rectángulos o marcas numéricas sencillas).

3. PREGUNTAS TIPO TEST O CUESTIONARIOS:
   - Maqueta las opciones de respuesta siempre en formato compacto a 2 columnas usando la clase "opciones-test":
     <div class="opciones-test">
       <div class="opcion-item"><span class="casilla-test"></span> a) Opción 1</div>
       <div class="opcion-item"><span class="casilla-test"></span> b) Opción 2</div>
       <div class="opcion-item"><span class="casilla-test"></span> c) Opción 3</div>
       <div class="opcion-item"><span class="casilla-test"></span> d) Opción 4</div>
     </div>
`;

// PROMPTS ESPECÍFICOS POR ASIGNATURA
const PROMPTS_MATERIA = {
  'Matemáticas': `
    - Para operaciones verticales (sumas, restas, multiplicaciones), usa tablas HTML con la clase "operacion-vertical".
    - Incluye problemas contextualizados de la vida cotidiana.
  `,
  'Lengua Castellana': `
    - Para ejercicios de pauta de escritura, caligrafía o redacción, usa contenedores con la clase "espacio-respuesta pauta".
    - Si incluyes un texto o lectura comprensiva, colócalo en un bloque destacado: <blockquote class="texto-lectura">...</blockquote>.
  `,
  'Conocimiento del Medio': `
    - Diseña esquemas, diagramas para completar o textos breves de Ciencias Naturales y Sociales.
    - Si requiere que el alumno dibuje un proceso (ej: ciclo del agua, partes de la planta), usa <div class="caja-espacio-dibujo">.
  `,
  'Educación Física': `
    - Enfócate en teoría del deporte, hábitos saludables, calambre/estiramientos, reglamento o deportes de equipo (como baloncesto o fútbol).
    - Para tests o preguntas de opción múltiple, aplica estrictamente la maquetación "opciones-test".
    - NO intentes dibujar jugadores en SVG.
  `,
  'Música': `
    - Diseña ejercicios sobre lenguaje musical (notas, figuras musicales, ritmos), discriminación auditiva o familias de instrumentos.
    - Usa esquemas tipográficos limpios o <div class="caja-espacio-dibujo"> para dibujar pentagramas o notas si el alumno debe representarlas.
  `,
  'Inglés': `
    - Redacta las instrucciones en inglés o en formato bilingüe según el nivel del curso.
    - Incluye ejercicios de vocabulario, relacionar columnas, completar huecos (fill in the blanks) o lecturas muy cortas.
  `
};

// --- REFUERZO OBLIGATORIO DE SVG PARA MATEMÁTICAS DE 1º/2º DE PRIMARIA ---
// En vez de confiar en que el modelo interprete bien un "se permiten" (permiso, no orden),
// detectamos el curso en código y añadimos una instrucción explícita y obligatoria.
function getInstruccionSVGMatematicas(curso) {
  const cursosConDibujos = ['1', '1º', 'primero', '2', '2º', 'segundo'];
  const cursoNormalizado = (curso || '').toString().toLowerCase();
  const esInicial = cursosConDibujos.some(c => cursoNormalizado.includes(c));

  if (esInicial) {
    return `
    - OBLIGATORIO: en TODOS los ejercicios de sumar, restar o contar, acompaña cada operación con un SVG sencillo
      que represente las cantidades con figuras simples (círculos o cuadrados repetidos). Por ejemplo,
      para "3 + 2", dibuja 3 círculos, el signo +, y 2 círculos más.
    - No omitas el SVG en ningún ejercicio numérico de este curso, aunque también incluyas la tabla "operacion-vertical".
    `;
  }
  return `
    - Este curso no requiere apoyo visual obligatorio con SVG; céntrate en el formato de tabla "operacion-vertical".
  `;
}

app.post('/api/generar-ficha', async (req, res) => {
  try {
    const { materia, curso, comunidad, instrucciones } = req.body;

    // --- VALIDACIÓN DE LA MATERIA ---
    // Si "materia" no coincide exactamente con una clave de PROMPTS_MATERIA
    // (mayúsculas, tildes, espacios raros desde el <select>), avisamos en vez
    // de generar en silencio una ficha genérica sin instrucciones específicas.
    if (!materia || !PROMPTS_MATERIA[materia]) {
      return res.status(400).json({
        error: `Materia no reconocida: "${materia}". Revisa que coincida exactamente con las opciones del formulario.`
      });
    }

    let promptEspecifico = PROMPTS_MATERIA[materia];

    // Refuerzo específico para Matemáticas 1º/2º
    if (materia === 'Matemáticas') {
      promptEspecifico += getInstruccionSVGMatematicas(curso);
    }

    const promptFinal = `
      ${BASE_PROMPT}

      DETALLES ESPECÍFICOS DE ESTA PETICIÓN:
      - Asignatura: ${materia}
      - Curso: ${curso} de Educación Primaria
      - Comunidad Autónoma: ${comunidad || 'Estándar LOMLOE'}
      - Instrucciones concretas del profesor: ${instrucciones || 'Genera una ficha variada y adecuada al curso.'}

      INSTRUCCIONES ESPECÍFICOS DE LA ASIGNATURA (${materia}):
      ${promptEspecifico}

      RECUERDA: En el título y en los textos de la ficha DEBE figurar explícitamente que la materia es "${materia}".
    `;

    // Llamada a la API de Claude (Anthropic)
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // modelo vigente (claude-3-haiku-20240307 fue retirado)
      max_tokens: 8000, // margen extra para fichas con SVGs y varios ejercicios
      messages: [{ role: 'user', content: promptFinal }]
    });

    // Avisamos si la respuesta se cortó por límite de tokens
    if (response.stop_reason === 'max_tokens') {
      console.warn('⚠️ La respuesta se cortó por límite de tokens (max_tokens). Considera subirlo más si vuelve a pasar.');
    }

    // Buscamos explícitamente el bloque de tipo "text" en vez de asumir que es el primero,
    // por si en el futuro se añaden tools u otros tipos de bloque.
    const bloqueTexto = response.content.find(block => block.type === 'text');
    let htmlGenerado = bloqueTexto?.text || '';

    // Limpieza de etiquetas markdown por si el modelo devuelve la respuesta envuelta en bloques de código
    htmlGenerado = htmlGenerado.replace(/```html/g, '').replace(/```/g, '').trim();

    res.json({ html: htmlGenerado });

  } catch (error) {
    console.error('Error al generar la ficha:', error);
    res.status(500).json({ error: 'Error interno al generar la ficha con Claude' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de Fichas Escolares listo en http://localhost:${port}`);
});