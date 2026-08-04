import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { renderizarFichaMatematicas, ICONOS_DISPONIBLES } from './renderer-matematicas.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ Falta la API Key de Anthropic. Revisa tu .env (ANTHROPIC_API_KEY=...)');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey });

// ─────────────────────────────────────────────
// SYSTEM PROMPT "LEGACY" — Lengua, Conocimiento del Medio, Educación Física,
// Música e Inglés. Estas asignaturas siguen generando HTML directamente
// (todavía no migradas al pipeline JSON + renderizador). Matemáticas YA NO
// usa este prompt: tiene el suyo propio más abajo, mucho más corto porque
// no necesita explicar reglas de maquetado HTML — eso ahora es código.
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `
Eres un experto en diseño de materiales didácticos para Educación Primaria en España,
con dominio de la LOMLOE (Ley Orgánica 3/2020) y el Real Decreto 157/2022.

═══════════════════════════════════════
REGLAS DE SALIDA (NO NEGOCIABLES)
═══════════════════════════════════════

1. RESPONDE ÚNICAMENTE CON HTML PURO.
   Sin explicaciones, sin markdown, sin bloques \`\`\`html.
   El HTML empieza con <div class="ficha"> y termina con </div>.
   No incluyas <html>, <head>, <body> ni <style>.

2. CABECERA OBLIGATORIA:
   Si en los datos de la ficha se indica un "Centro educativo", añade una línea extra
   ARRIBA con el nombre del centro. Si NO se indica (está vacío), omite esa línea por
   completo — no escribas "Centro:" en blanco.
   <div class="cabecera">
     <p class="cabecera-centro">[Nombre del centro]</p> <!-- SOLO si hay centro -->
     <div class="cabecera-datos">
       <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
       <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
     </div>
   </div>

3. TÍTULO:
   <h1 class="titulo-ficha">[Título descriptivo de la ficha]</h1>

4. CADA EJERCICIO en su propio contenedor:
   <div class="ejercicio">
     <p class="enunciado"><span class="numero-ejercicio">[N]</span><span class="texto-enunciado">[Instrucción clara]</span></p>
     [contenido]
   </div>

5. CANTIDAD DE EJERCICIOS:
   - Por defecto: ~10 ejercicios variados.
   - Si las instrucciones del profesor especifican un número EXACTO, respétalo sin redondear.
   - Distribución por defecto: 40% cálculo/respuesta directa, 30% completar/relacionar,
     20% problemas contextualizados, 10% ejercicio creativo o abierto.

6. PREGUNTAS TIPO TEST:
   <div class="opciones-test">
     <div class="opcion-item"><span class="casilla-test"></span> a) Opción</div>
   </div>

7. ESPACIOS PARA DIBUJAR:
   <div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>

8. INSTRUCCIONES ESPECIALES DEL DOCENTE — MÁXIMA PRIORIDAD.
   Prevalecen sobre cualquier regla anterior (excepto 1 y 9).
   - Temática concreta: intégrala en TODOS los ejercicios.
   - Número exacto de ejercicios: respétalo sin redondear.
   - Rango numérico distinto: úsalo.

9. SIN AUTOEVALUACIÓN NI CARITAS. Nunca.

10. PIE DE PÁGINA:
    <p class="nota-pie">Ficha generada con LOMLOE · [CURSO] · [MATERIA] · [COMUNIDAD]</p>

11. CLASE DE CURSO EN EL CONTENEDOR RAÍZ.
    Cuando el curso sea 1º, 2º o 3º de Primaria, añade la clase "curso-inicial"
    al contenedor raíz de la ficha:
    <div class="ficha curso-inicial">
    Para 4º, 5º y 6º, usa solo:
    <div class="ficha">
    Esto permite que el CSS aplique automáticamente la tipografía adecuada a cada etapa.
`;

// Instrucciones específicas por asignatura (pipeline legacy — sin Matemáticas)
const PROMPTS_MATERIA = {
  'Lengua Castellana': `
    - Para escritura o redacción usa: <div class="espacio-respuesta pauta"></div>
    - Textos de lectura comprensiva en: <blockquote class="texto-lectura">...</blockquote>
    - Ejercicios típicos: dictado preparatorio, huecos gramaticales, ordenar palabras,
      sinónimos/antónimos, tipos de oraciones, signos de puntuación.
  `,
  'Conocimiento del Medio': `
    - Combina Ciencias Naturales y Sociales según indiquen las instrucciones.
    - Usa esquemas para completar, preguntas cortas y tablas de clasificación.
    - Para representar procesos: <div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>
  `,
  'Educación Física': `
    - Teoría del deporte, hábitos saludables, estiramientos, reglamento, deportes de equipo.
    - Para tests usa "opciones-test". No generes SVGs de jugadores o deportistas.
  `,
  'Música': `
    - Lenguaje musical: notas, figuras, ritmos, discriminación auditiva, instrumentos.
    - Para pentagramas: <div class="caja-espacio-dibujo">[ Dibuja el pentagrama aquí ]</div>
  `,
  'Inglés': `
    - Instrucciones en inglés o formato bilingüe según el nivel del curso.
    - Ejercicios: vocabulario, relacionar columnas, fill in the blanks, lecturas cortas, V/F.
  `
};

// ─────────────────────────────────────────────
// MATEMÁTICAS — pipeline nuevo: JSON pedagógico + renderizador (renderer-matematicas.js).
// Claude ya no describe HTML: solo decide números, enunciados y qué tipo de
// ejercicio encaja. El maquetado (CSS/HTML) lo garantiza el código, siempre.
// ─────────────────────────────────────────────

const RANGOS_NUMERICOS_MATE = {
  '1º': 'números 0-50, sumas y restas SIN llevadas, resultados ≤20 en cálculo mental.',
  '2º': 'números 0-99, principalmente sin llevadas, llevadas simples muy graduales.',
  '3º': 'números 0-999, sumas y restas CON llevadas, tablas del 1 al 5.',
  '4º': 'hasta 9.999, multiplicaciones de 1 y 2 cifras, división exacta.',
  '5º': 'hasta 999.999, cuatro operaciones, fracciones sencillas, decimales.',
  '6º': 'hasta millones, fracciones, decimales, porcentajes, geometría, estadística simple.'
};

function construirSystemPromptMatematicas(curso) {
  const rango = RANGOS_NUMERICOS_MATE[curso] || RANGOS_NUMERICOS_MATE['3º'];
  const listaIconos = ICONOS_DISPONIBLES.join(', ');
  const esConDibujos = ['1º', '2º'].includes(curso);
  const esGuiado = ['1º', '2º', '3º'].includes(curso);

  // La lista de tipos disponibles varía por curso: a partir de 3º ya no tiene
  // sentido ni mencionarle a Claude "conteo_svg" — así ni existe la tentación
  // de usarlo donde no toca.
  const tiposDisponibles = esConDibujos
    ? 'operacion_vertical | conteo_svg | calculo_mental | problema | tipo_test | dibujo'
    : 'operacion_vertical | calculo_mental | problema | tipo_test | dibujo';

  let bloqueOperacion = `
- "operacion_vertical": sumas y restas en columna.
  { "operaciones": [ { "signo": "+" o "-", "numeros": [n1, n2, ...] } ]${esConDibujos ? `,
    "svg": { "icono1": "...", "cantidad1": n, "icono2": "...", "cantidad2": n }` : ''},
    "columnasParalelas": 2 (o null) }
  * Rango numérico para este curso (${curso}): ${rango}
  * SUMAS: usa EXACTAMENTE el número de sumandos indicado en "Sumandos por suma".
  * RESTAS: SIEMPRE exactamente 2 números. Nunca más.`;

  if (esConDibujos) {
    bloqueOperacion += `
  * OBLIGATORIO en ${curso}: incluye SIEMPRE "svg" (nunca null) representando los dos primeros
    términos con objetos para contar — en ${curso} el niño cuenta objetos, no lee números
    abstractos. Iconos disponibles (usa EXACTAMENTE estos nombres): ${listaIconos}.`;
  }

  bloqueOperacion += `
  * "columnasParalelas" solo si el docente pide explícitamente varias columnas de operaciones.`;

  const bloqueConteo = esConDibujos ? `

- "conteo_svg": solo contar objetos, sin operación.
  { "icono": "...", "cantidad": n } — icono de la lista: ${listaIconos}.` : '';

  const bloqueCalculoMental = `

- "calculo_mental": lista de operaciones horizontales cortas con hueco para la respuesta.
  { "operaciones": [ { "texto": "7 + 5 =" } ] }`;

  let bloqueProblema;
  if (esConDibujos) {
    bloqueProblema = `
- "problema": problema contextualizado con base de dibujos (OBLIGATORIO en ${curso}).
  { "texto": "enunciado del problema, lenguaje sencillo y adecuado al curso",
    "datosClave": ["dato 1", "dato 2"],
    "svg": { "icono1": "...", "cantidad1": n, "signo": "+" o "-", "icono2": "...", "cantidad2": n } }
  * "datosClave": el sistema SOLO usa la CANTIDAD de elementos de esta lista para saber cuántas
    líneas en blanco dejar — nunca se imprime el texto. No es un resumen para el lector, es
    solo un contador; normalmente serán 2.
  * "svg": OBLIGATORIO en ${curso} (nunca null). Ilustra con objetos los dos términos del
    problema, igual que en las operaciones verticales — el niño cuenta los dibujos.`;
  } else if (esGuiado) {
    bloqueProblema = `
- "problema": problema contextualizado. El sistema usa el formato guiado de bloques en ${curso}.
  { "texto": "enunciado del problema, lenguaje adecuado al curso",
    "datosClave": ["dato 1", "dato 2"] }
  * "datosClave": el sistema SOLO usa la CANTIDAD de elementos de esta lista para saber cuántas
    líneas en blanco dejar para que el alumno escriba los datos — nunca se imprime el texto.`;
  } else {
    bloqueProblema = `
- "problema": problema contextualizado, formato libre (${curso}, sin bloques guiados).
  { "texto": "enunciado del problema, lenguaje adecuado al curso", "datosClave": [] }`;
  }

  return `
Eres un experto en diseño de materiales didácticos de Matemáticas para Educación Primaria
en España, con dominio de la LOMLOE (Ley Orgánica 3/2020) y el Real Decreto 157/2022.

Tu ÚNICA salida es JSON VÁLIDO. Nada de HTML, nada de markdown, nada de \`\`\`json,
ni una sola palabra antes o después del objeto JSON.

ESQUEMA EXACTO:
{
  "titulo": "string — título descriptivo de la ficha",
  "ejercicios": [
    {
      "enunciado": "string — instrucción del ejercicio, SIN 'Ejercicio N.' delante (lo añade el sistema).
        EXCEPCIÓN: para tipo 'problema' este campo se IGNORA (el sistema pone su propia
        instrucción fija) — no te esfuerces en rellenarlo, pon cualquier cosa breve.",
      "tipo": "${tiposDisponibles}",
      "datos": { ... según el tipo, ver abajo ... }
    }
  ]
}

TIPOS DE EJERCICIO DISPONIBLES PARA ${curso} Y SU CAMPO "datos":
${bloqueOperacion}
${bloqueConteo}
${bloqueCalculoMental}
${bloqueProblema}

- "tipo_test": pregunta de opción múltiple (la pregunta va en "enunciado").
  { "opciones": ["opción a", "opción b", "opción c"] }

- "dibujo": espacio para dibujar. "datos": {}

REGLAS GENERALES:
- Por defecto genera ~10 ejercicios variados. Si el docente pide un número EXACTO, respétalo.
- Distribución por defecto: 40% cálculo/operación directa, 30% cálculo mental o completar,
  20% problemas contextualizados, 10% tipo test o ejercicio abierto.
- Las instrucciones especiales del docente tienen MÁXIMA PRIORIDAD sobre todo lo anterior
  (temática, número de ejercicios, rango numérico distinto...).
- NUNCA autoevaluación ni caritas.
- El título y los enunciados deben ser coherentes con Matemáticas de ${curso} de Primaria.
`.trim();
}

function construirPromptMatematicas({ curso, comunidad, instrucciones, idioma, sumandos }) {
  return `
DATOS DE LA FICHA:
- Curso: ${curso} de Educación Primaria
- Idioma: ${idioma || 'Español'}
- Comunidad Autónoma: ${comunidad || 'LOMLOE estatal (general)'}
- Sumandos por suma: ${sumandos} (aplica solo a sumas; las restas son siempre de 2 números)
- Instrucciones especiales del docente: ${instrucciones || 'Ninguna — genera una ficha variada y adecuada al curso.'}
  `.trim();
}

function construirPrompt(materia, curso, comunidad, instrucciones, idioma, colegio) {
  const promptMateria = PROMPTS_MATERIA[materia]
    || `- Genera ejercicios variados y adecuados para ${materia} en ${curso} de Primaria.`;

  return `
DATOS DE LA FICHA:
- Centro educativo: ${colegio || '(no indicado — omite la línea de centro en la cabecera)'}
- Idioma: ${idioma || 'Español'}
- Comunidad Autónoma: ${comunidad || 'LOMLOE estatal (general)'}
- Curso: ${curso} de Educación Primaria
- Materia: ${materia}
- Instrucciones especiales del docente: ${instrucciones || 'Ninguna — genera una ficha variada y adecuada al curso.'}

INSTRUCCIONES ESPECÍFICAS PARA ${materia.toUpperCase()}:
${promptMateria}

RECUERDA: el título y los textos deben reflejar explícitamente la materia "${materia}".
  `.trim();
}

app.post('/api/generar-ficha', async (req, res) => {
  try {
    const { materia, curso, comunidad, instrucciones, idioma, colegio, sumandos } = req.body;

    if (!materia || !curso) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: materia y curso.' });
    }

    // ═══════════════════════════════════════════════════════════
    // MATEMÁTICAS: pipeline nuevo (JSON pedagógico + renderizador).
    // ═══════════════════════════════════════════════════════════
    if (materia === 'Matemáticas') {
      // Acota el número de sumandos a un rango razonable (2 a 4); por defecto 2.
      let sumandosValidados = parseInt(sumandos, 10);
      if (!Number.isInteger(sumandosValidados) || sumandosValidados < 2) sumandosValidados = 2;
      if (sumandosValidados > 4) sumandosValidados = 4;

      const systemPrompt = construirSystemPromptMatematicas(curso);
      const userPrompt = construirPromptMatematicas({
        curso, comunidad, instrucciones, idioma, sumandos: sumandosValidados
      });

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      if (response.stop_reason === 'max_tokens') {
        console.warn('⚠️ Respuesta cortada por límite de tokens.');
      }

      const bloqueTexto = response.content.find(block => block.type === 'text');
      let textoJson = bloqueTexto?.text || '';
      textoJson = textoJson.replace(/```json/g, '').replace(/```/g, '').trim();

      let datosFicha;
      try {
        datosFicha = JSON.parse(textoJson);
      } catch (errorParseo) {
        console.error('❌ La IA devolvió JSON inválido:', errorParseo.message);
        console.error('Contenido recibido:', textoJson.slice(0, 500));
        return res.status(500).json({
          error: 'La IA devolvió un formato inesperado al generar la ficha. Inténtalo de nuevo.'
        });
      }

      const html = renderizarFichaMatematicas(datosFicha, { curso, materia, comunidad, colegio });
      return res.json({ html });
    }

    // ═══════════════════════════════════════════════════════════
    // RESTO DE ASIGNATURAS: pipeline anterior (HTML directo), sin cambios.
    // ═══════════════════════════════════════════════════════════
    const userPrompt = construirPrompt(materia, curso, comunidad, instrucciones, idioma, colegio);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });

    if (response.stop_reason === 'max_tokens') {
      console.warn('⚠️ Respuesta cortada por límite de tokens.');
    }

    const bloqueTexto = response.content.find(block => block.type === 'text');
    let htmlGenerado = bloqueTexto?.text || '';
    htmlGenerado = htmlGenerado.replace(/```html/g, '').replace(/```/g, '').trim();

    res.json({ html: htmlGenerado });

  } catch (error) {
    console.error('Error al generar la ficha:', error);
    res.status(500).json({ error: 'Error interno al generar la ficha.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor de Fichas Escolares listo en http://localhost:${port}`);
});
