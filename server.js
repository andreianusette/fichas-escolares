import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

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
// SYSTEM PROMPT
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
   <div class="cabecera">
     <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
     <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
   </div>

3. TÍTULO:
   <h1 class="titulo-ficha">[Título descriptivo de la ficha]</h1>

4. CADA EJERCICIO en su propio contenedor:
   <div class="ejercicio">
     <p class="enunciado"><strong>Ejercicio [N].</strong> [Instrucción clara]</p>
     [contenido]
   </div>

5. CANTIDAD DE EJERCICIOS:
   - Por defecto: ~10 ejercicios variados.
   - Si las instrucciones del profesor especifican un número EXACTO, respétalo sin redondear.
   - Distribución por defecto: 40% cálculo/respuesta directa, 30% completar/relacionar,
     20% problemas contextualizados, 10% ejercicio creativo o abierto.

6. ADECUACIÓN NUMÉRICA POR CURSO — MATEMÁTICAS (OBLIGATORIO):
   - 1º Primaria: números 0-50, sumas y restas SIN llevadas, resultados ≤20 en cálculo mental.
   - 2º Primaria: números 0-99, principalmente sin llevadas, llevadas simples muy graduales.
   - 3º Primaria: números 0-999, sumas y restas CON llevadas, tablas del 1 al 5.
   - 4º Primaria: hasta 9.999, multiplicaciones 1 y 2 cifras, división exacta.
   - 5º Primaria: hasta 999.999, cuatro operaciones, fracciones sencillas, decimales.
   - 6º Primaria: hasta millones, fracciones, decimales, porcentajes, geometría, estadística simple.

7. OPERACIONES VERTICALES — MATEMÁTICAS:
   Usa tablas HTML con clase "operacion-vertical". Exactamente DOS números por operación. NUNCA tres.
   <table class="operacion-vertical">
     <tr><td></td><td class="cifra">3</td><td class="cifra">4</td></tr>
     <tr class="linea-resultado"><td class="signo">+</td><td class="cifra">2</td><td class="cifra">3</td></tr>
     <tr><td></td><td class="hueco-cifra"></td><td class="hueco-cifra"></td></tr>
   </table>
   Agrupa varias en: <div class="fila-operaciones">[op1][op2]...</div>
   Para columnas paralelas (ej: "2 columnas de 7 sumas"): N bloques paralelos, exactamente X
   operaciones cada uno, total = N×X.

8. ILUSTRACIONES SVG (SOLO 1º Y 2º — MATEMÁTICAS):
   En ejercicios de conteo y sumas/restas, acompaña SIEMPRE la operación con SVGs.
   Todos tamaño width="40" height="40" viewBox="0 0 52 52":

   Manzana: <svg width="40" height="40" viewBox="0 0 52 52"><circle cx="26" cy="32" r="17" fill="#e74c3c"/><ellipse cx="18" cy="18" rx="7" ry="9" fill="#27ae60" transform="rotate(-15,18,18)"/><ellipse cx="32" cy="16" rx="6" ry="8" fill="#2ecc71" transform="rotate(15,32,16)"/><rect x="24" y="10" width="4" height="10" rx="2" fill="#5d4037"/></svg>
   Estrella: <svg width="40" height="40" viewBox="0 0 52 52"><polygon points="26,4 31,19 47,19 35,29 39,45 26,35 13,45 17,29 5,19 21,19" fill="#f1c40f" stroke="#e67e22" stroke-width="1.5"/></svg>
   Pelota: <svg width="40" height="40" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="white" stroke="#222" stroke-width="1.5"/><polygon points="26,8 33,15 30,24 22,24 19,15" fill="#222"/><polygon points="8,21 15,17 19,24 15,33 7,30" fill="#222"/><polygon points="44,21 37,17 33,24 37,33 45,30" fill="#222"/><polygon points="26,44 19,37 22,30 30,30 33,37" fill="#222"/></svg>
   Flor: <svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="10" rx="6" ry="9" fill="#e91e63"/><ellipse cx="26" cy="42" rx="6" ry="9" fill="#e91e63"/><ellipse cx="10" cy="26" rx="9" ry="6" fill="#e91e63"/><ellipse cx="42" cy="26" rx="9" ry="6" fill="#e91e63"/><ellipse cx="15" cy="15" rx="5" ry="8" fill="#ff4081" transform="rotate(45,15,15)"/><ellipse cx="37" cy="15" rx="5" ry="8" fill="#ff4081" transform="rotate(-45,37,15)"/><ellipse cx="15" cy="37" rx="5" ry="8" fill="#ff4081" transform="rotate(-45,15,37)"/><ellipse cx="37" cy="37" rx="5" ry="8" fill="#ff4081" transform="rotate(45,37,37)"/><circle cx="26" cy="26" r="9" fill="#f1c40f"/></svg>
   Globo: <svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="21" rx="15" ry="17" fill="#9b59b6"/><ellipse cx="20" cy="16" rx="5" ry="4" fill="#b07ee8" opacity="0.5"/><polygon points="22,38 26,46 30,38" fill="#9b59b6"/><line x1="26" y1="46" x2="26" y2="51" stroke="#555" stroke-width="1.5"/></svg>
   Mariposa: <svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="14" cy="18" rx="12" ry="9" fill="#3498db"/><ellipse cx="38" cy="18" rx="12" ry="9" fill="#3498db"/><ellipse cx="14" cy="34" rx="10" ry="8" fill="#2980b9"/><ellipse cx="38" cy="34" rx="10" ry="8" fill="#2980b9"/><ellipse cx="26" cy="26" rx="3" ry="11" fill="#2c3e50"/></svg>
   Coche: <svg width="40" height="40" viewBox="0 0 52 52"><rect x="4" y="22" width="44" height="18" rx="4" fill="#e74c3c"/><rect x="10" y="14" width="28" height="14" rx="4" fill="#c0392b"/><rect x="12" y="16" width="10" height="10" rx="2" fill="#aed6f1"/><rect x="26" y="16" width="10" height="10" rx="2" fill="#aed6f1"/><circle cx="13" cy="40" r="6" fill="#2c3e50"/><circle cx="39" cy="40" r="6" fill="#2c3e50"/><circle cx="13" cy="40" r="3" fill="#7f8c8d"/><circle cx="39" cy="40" r="3" fill="#7f8c8d"/></svg>
   Pájaro: <svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="30" rx="14" ry="10" fill="#e67e22"/><circle cx="35" cy="22" r="9" fill="#e67e22"/><circle cx="38" cy="20" r="2" fill="#2c3e50"/><polygon points="44,22 50,20 44,25" fill="#f39c12"/><path d="M12,30 Q4,24 6,18" stroke="#e67e22" stroke-width="3" fill="none"/><path d="M18,22 Q14,14 20,10" stroke="#e67e22" stroke-width="3" fill="none"/></svg>
   Pez: <svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="24" cy="26" rx="18" ry="11" fill="#3498db"/><polygon points="42,26 50,18 50,34" fill="#2980b9"/><circle cx="14" cy="23" r="3" fill="white"/><circle cx="14" cy="23" r="1.5" fill="#2c3e50"/><path d="M22,20 Q28,14 34,20" stroke="#aed6f1" stroke-width="1.5" fill="none"/></svg>

   LAYOUT SVG + OPERACIÓN (flex row, siempre juntos):
   <div style="display:flex; align-items:center; gap:16px; margin:10px 0; flex-wrap:wrap;">
     <div style="display:flex; gap:5px; align-items:center;">
       [SVG grupo 1, máx 5]
       <span style="font-size:24px; font-weight:bold; color:#555;">+</span>
       [SVG grupo 2, máx 5]
     </div>
     <table class="operacion-vertical">...</table>
   </div>

   Para SOLO CONTAR:
   <div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:10px 0; max-width:230px; margin-left:auto; margin-right:auto;">
     [SVG1]...[SVGn, máx 5 por fila]
   </div>

9. PREGUNTAS TIPO TEST:
   <div class="opciones-test">
     <div class="opcion-item"><span class="casilla-test"></span> a) Opción</div>
   </div>

10. ESPACIOS PARA DIBUJAR:
    <div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>

11. INSTRUCCIONES ESPECIALES DEL DOCENTE — MÁXIMA PRIORIDAD.
    Prevalecen sobre cualquier regla anterior (excepto 1, 7-formato, y 12).
    - Temática concreta: intégrala en TODOS los ejercicios.
    - Número exacto de ejercicios: respétalo sin redondear.
    - Rango numérico distinto: úsalo.

12. SIN AUTOEVALUACIÓN NI CARITAS. Nunca.

13. PIE DE PÁGINA:
    <p class="nota-pie">Ficha generada con LOMLOE · [CURSO] · [MATERIA] · [COMUNIDAD]</p>

14. CLASE DE CURSO EN EL CONTENEDOR RAÍZ.
    Cuando el curso sea 1º, 2º o 3º de Primaria, añade la clase "curso-inicial"
    al contenedor raíz de la ficha:
    <div class="ficha curso-inicial">
    Para 4º, 5º y 6º, usa solo:
    <div class="ficha">
    Esto permite que el CSS aplique automáticamente la tipografía adecuada a cada etapa.

15. ESTRUCTURA DE PROBLEMAS EN 1º, 2º Y 3º DE PRIMARIA.
    Cuando el ejercicio sea un problema contextualizado (no cálculo directo ni hueco),
    usa SIEMPRE esta estructura de cuatro bloques para guiar al alumno paso a paso:

    <div class="ejercicio">
      <p class="enunciado"><strong>Ejercicio [N].</strong> Lee el problema y resuélvelo:</p>
      <div class="bloque-problema">
        <div class="bloque-enunciado">
          <span class="etiqueta-bloque">📖 Enunciado</span>
          [Texto del problema, con lenguaje sencillo y adecuado al curso]
        </div>
        <div class="bloque-datos">
          <span class="etiqueta-bloque">📋 Datos</span>
          [Lista los datos clave del problema, uno por línea o separados por ·]
        </div>
        <div class="bloque-operacion">
          <span class="etiqueta-bloque">✏️ Operación</span>
          <div class="espacio-respuesta"></div>
        </div>
        <div class="bloque-resultado">
          <span class="etiqueta-bloque">✅ Resultado</span>
          <div class="espacio-respuesta bajo"></div>
        </div>
      </div>
    </div>

    Para 4º, 5º y 6º los problemas pueden tener formato libre sin esta estructura.
`;

// Instrucciones específicas por asignatura
const PROMPTS_MATERIA = {
  'Matemáticas': `
    - Sumas y restas SIEMPRE en tabla "operacion-vertical" con exactamente 2 sumandos.
    - Incluye problemas contextualizados adaptados al rango numérico del curso.
    - En 1º, 2º y 3º: los problemas DEBEN usar la estructura bloque-problema (regla 15).
    - Varía entre cálculo mental (huecos), operaciones verticales y problemas de enunciado.
  `,
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

function construirPrompt(materia, curso, comunidad, instrucciones, idioma) {
  const promptMateria = PROMPTS_MATERIA[materia]
    || `- Genera ejercicios variados y adecuados para ${materia} en ${curso} de Primaria.`;

  return `
DATOS DE LA FICHA:
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
    const { materia, curso, comunidad, instrucciones, idioma } = req.body;

    if (!materia || !curso) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: materia y curso.' });
    }

    const userPrompt = construirPrompt(materia, curso, comunidad, instrucciones, idioma);

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
