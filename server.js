import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { renderizarFichaMatematicas, ICONOS_DISPONIBLES, ICONOS_SVG, FIGURAS_2D_DISPONIBLES, FIGURAS_3D_DISPONIBLES } from './renderer-matematicas.js';

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

3. TÍTULO (breve, máximo 4-5 palabras — NO una frase larga tipo "Ficha de
   Matemáticas: Números hasta 20, sumas y restas sin llevadas". No repitas
   "Ficha" ni la materia, eso ya lo pone la cabecera):
   <h1 class="titulo-ficha">[Título breve]</h1>

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

function construirSystemPromptMatematicas(curso, iconosElegidos) {
  const rango = RANGOS_NUMERICOS_MATE[curso] || RANGOS_NUMERICOS_MATE['3º'];
  // Si el docente eligió iconos concretos en el formulario, Claude SOLO
  // puede usar esos — restringe la lista que se le pasa en el prompt en
  // vez de dejarle elegir entre los 84. Importante: esto NO sustituye
  // iconos después de generar (eso rompería la coherencia enunciado↔icono,
  // ver instrucción más abajo) — se restringe ANTES, para que el propio
  // Claude escriba el enunciado ya coherente con lo que puede usar.
  const listaIconos = (iconosElegidos && iconosElegidos.length > 0)
    ? iconosElegidos.join(', ')
    : ICONOS_DISPONIBLES.join(', ');
  const esConDibujos = ['1º', '2º'].includes(curso);
  const esGuiado = ['1º', '2º', '3º'].includes(curso);
  const esMultDiv = ['4º', '5º', '6º'].includes(curso);

  // La lista de tipos disponibles varía por curso: a partir de 3º ya no tiene
  // sentido ni mencionarle a Claude "conteo_svg" — así ni existe la tentación
  // de usarlo donde no toca. Multiplicación/división en columna solo a partir
  // de 4º, que es cuando el currículo las introduce (ver RANGOS_NUMERICOS_MATE).
  let tiposDisponibles = esConDibujos
    ? 'operacion_vertical | conteo_svg | calculo_mental | problema | tipo_test | dibujo'
    : 'operacion_vertical | calculo_mental | problema | tipo_test | dibujo';
  if (esMultDiv) {
    tiposDisponibles = tiposDisponibles.replace(
      'operacion_vertical |',
      'operacion_vertical | multiplicacion_vertical | division_vertical |'
    );
  }
  tiposDisponibles += ' | serie_numerica | comparar_numeros | tabla_frecuencia | reloj_analogico | grafico_barras';
  const esConQuesitos = ['5º', '6º'].includes(curso);
  if (esConQuesitos) {
    tiposDisponibles += ' | grafico_quesitos';
  }

  // Tipos nuevos (13/08/2026): restas con barritas (apoyo manipulativo,
  // solo donde ya se usan dibujos), cuadro numérico (tabla de doble entrada,
  // cursos guiados) y figura_geometrica (disponible en todos los cursos,
  // pero con distinta dificultad — ver bloqueFiguraGeometrica más abajo).
  if (esConDibujos) {
    tiposDisponibles += ' | resta_barritas | recta_numerica';
  }
  if (esGuiado) {
    tiposDisponibles += ' | cuadro_numerico | rejilla_numerica';
  }
  tiposDisponibles += ' | figura_geometrica';

  let bloqueOperacion = `
- "operacion_vertical": SOLO sumas y restas en columna (nunca multiplicación
  ni división — para eso usa "multiplicacion_vertical" o "division_vertical").
  { "operaciones": [ { "signo": "+" o "-", "numeros": [n1, n2, ...] } ]${esConDibujos ? `,
    "svg": { "icono1": "...", "cantidad1": n, "icono2": "...", "cantidad2": n }` : ''},
    "columnasParalelas": 2 (o null) }
  * Rango numérico para este curso (${curso}): ${rango}
  * SUMAS: usa EXACTAMENTE el número de sumandos indicado en "Sumandos por suma".
  * RESTAS: SIEMPRE exactamente 2 números. Nunca más.
  * Decimales: si el curso lo requiere, usa números JSON normales con punto
    (ej. 12.5) — el sistema los muestra con coma española y los alinea por la
    coma automáticamente. No escribas tú la coma ni intentes alinear texto.`;

  if (esConDibujos) {
    bloqueOperacion += `
  * OBLIGATORIO en ${curso}: incluye SIEMPRE "svg" (nunca null) representando los dos primeros
    términos con objetos para contar — en ${curso} el niño cuenta objetos, no lee números
    abstractos. Iconos disponibles (usa EXACTAMENTE estos nombres): ${listaIconos}.
  * COHERENCIA enunciado↔icono: el icono elegido tiene que ser EXACTAMENTE lo que el enunciado
    dice que se cuenta — nunca un objeto distinto "parecido". Si el enunciado no menciona
    ninguno de estos objetos (${listaIconos}), reescribe el enunciado para que hable de uno de
    ellos — el objeto disponible manda sobre la historia, no al revés. Ejemplo mal: enunciado
    "cuenta los niños" + icono "coche" (no hay icono de niño, así que el enunciado no debería
    hablar de niños). Ejemplo bien: enunciado "cuenta las pelotas" + icono "pelota".`;
  }

  bloqueOperacion += `
  * "columnasParalelas" solo si el docente pide explícitamente varias columnas de operaciones.`;

  const bloqueConteo = esConDibujos ? `

- "conteo_svg": solo contar objetos, sin operación.
  { "icono": "...", "cantidad": n } — icono de la lista: ${listaIconos}.` : '';

  const bloqueMultDiv = esMultDiv ? `

- "multiplicacion_vertical": multiplicaciones en columna (multiplicando × multiplicador).
  { "operaciones": [ { "numeros": [multiplicando, multiplicador] } ] }
  * Cada operación es SIEMPRE exactamente 2 números. Decimales permitidos en
    cualquiera de los dos (usa punto, ej. 3.2 — el sistema lo muestra con
    coma automáticamente, no lo hagas tú).
  * Agrupa VARIAS multiplicaciones (normalmente 2-4) en el mismo array
    "operaciones" bajo un único ejercicio, igual que harías con sumas — no
    crees un ejercicio nuevo por cada multiplicación suelta, o la ficha
    queda con demasiado espacio en blanco.
  * El sistema dibuja solo, y en blanco, la estructura completa (productos
    parciales si el multiplicador tiene 2+ cifras, línea de suma, resultado
    final) — nunca escribas tú el resultado ni te preocupes del maquetado.

- "division_vertical": divisiones en columna clásica (caja).
  { "operaciones": [ { "numeros": [dividendo, divisor] } ] }
  * Cada operación es SIEMPRE exactamente 2 números. Decimales permitidos en
    cualquiera de los dos, igual que en multiplicación.
  * Agrupa varias divisiones (normalmente 2-3) en el mismo array
    "operaciones" bajo un único ejercicio, por el mismo motivo que arriba.
  * El sistema dibuja la caja (dividendo | divisor, hueco de cociente) y un
    área en blanco para las restas parciales — nunca escribas tú el resultado.` : '';

  const bloqueCalculoMental = `

- "calculo_mental": lista de operaciones horizontales cortas con hueco para la respuesta.
  { "operaciones": [ { "texto": "7 + 5 =" } ] }`;

  const bloqueTiposNuevos = `

- "serie_numerica": secuencia de números con huecos que el alumno debe completar.
  { "numeros": [2, null, 6, 8, null, null] }
  * Usa "null" (JSON null, no el texto "null") en cada posición que el alumno debe rellenar.
  * El patrón de la serie (de 2 en 2, de 5 en 5, etc.) tiene que ser deducible SOLO con los
    números que sí aparecen — no dejes huecos consecutivos que hagan el patrón ambiguo.
  * Respeta el rango numérico del curso.

- "comparar_numeros": pares de números para que el alumno escriba <, > o = entre ellos.
  { "pares": [ { "a": 45, "b": 78 } ] }
  * Entre 3 y 6 pares por ejercicio es lo habitual. Respeta el rango numérico del curso.

- "tabla_frecuencia": el alumno cuenta datos de varias categorías y rellena una tabla.${
  ['5º', '6º'].includes(curso) ? `
  { "registros": [23, 45, 23, 12, 45, 23, 12, 45, 23, 45] }
  * IMPORTANTE en ${curso}: NADA de iconos ni dibujos infantiles — son currículo de
    estadística real (tablas de frecuencias), no un ejercicio de contar objetos. "registros"
    es la lista de datos en bruto (resultados de una encuesta, tiradas de dado, medidas...),
    números o palabras cortas — el sistema la muestra tal cual y deduce las categorías
    (valores distintos) directamente de la lista, sin que tú se las digas por separado.
  * Usa entre 10 y 20 registros, con 3-6 categorías distintas repetidas varias veces cada una
    (si no se repiten, no hay nada que contar). Contextualiza con el enunciado (ej. "Estas son
    las calificaciones de 15 alumnos en un examen", "Resultados de tirar un dado 20 veces").` : `
  { "categorias": [ { "icono": "estrella", "cantidad": 6 }, { "icono": "pelota", "cantidad": 4 } ] }
  * Icono EXACTAMENTE de esta lista: ${listaIconos}. Entre 2 y 4 categorías.
  * El sistema dibuja los iconos y la tabla con las columnas "Conteo" y "Frecuencia" en blanco
    (además de la fila "Total") — nunca escribas tú los números de conteo.`
}

- "reloj_analogico": esfera de reloj para trabajar la hora.
  { "hora": 3, "minuto": 30, "modo": "leer" }
  * "modo": "leer" → el sistema dibuja las agujas en esa hora y deja un hueco para que el
    alumno escriba qué hora es (usa esto cuando el enunciado sea del tipo "¿qué hora es?").
    "modo": "dibujar" → el sistema dibuja la esfera VACÍA (sin agujas) para que el alumno las
    dibuje él mismo a la hora que le pidas en el enunciado (usa esto cuando el enunciado sea
    del tipo "dibuja las agujas marcando las 3 y media").
  * "hora": 0-11 (en formato 12h, sin am/pm). "minuto": 0-59, normalmente en pasos de 5.

- "grafico_barras": gráfico de barras verticales.
  { "categorias": [ { "etiqueta": "Lola", "valor": 5 }, { "etiqueta": "Rita", "valor": 7 } ],
    "escalaMax": 10,
    "modo": "leer" }
  * "escalaMax" es OPCIONAL — si lo omites (o pones null), el sistema calcula una escala
    redondeada razonable a partir del valor más alto. Solo indícalo si quieres una escala
    concreta (ej. porque el enunciado menciona "hasta 20 votos").
  * "modo": "leer" (el sistema DIBUJA las barras ya coloreadas a su altura real) o "rellenar"
    (el sistema deja las columnas EN BLANCO y muestra la lista de datos aparte, para que el
    alumno dibuje él mismo cada barra).
    - Con "leer": el enunciado debe pedir INTERPRETAR el gráfico (¿cuál es el más votado?,
      ¿cuántos tiene X?, ¿cuántos más tiene X que Y?...). NUNCA repitas los valores como texto
      en el enunciado — el gráfico ya los representa, el alumno debe leerlos del dibujo.
    - Con "rellenar": SÍ debes dar los valores en "categorias", porque son el dato de partida
      (no la respuesta) — el enunciado debe pedir "completa/dibuja el gráfico con estos datos".
  * Entre 3 y 6 categorías. "etiqueta" corta (una palabra o dos, ej. nombres, días, colores).
  * "valor" y "escalaMax" DEBEN ser números JSON puros (ej. 12), nunca texto ni con símbolos
    como "%" o unidades (mal: "12 libros" — bien: 12).${
  esConQuesitos ? `

- "grafico_quesitos": gráfico circular (de tarta/quesitos) — currículo de ${curso} ligado a
  fracciones/porcentajes.
  { "categorias": [ { "etiqueta": "Fútbol", "valor": 12 }, { "etiqueta": "Baloncesto", "valor": 8 } ] }
  * "valor" es la cantidad bruta de cada categoría — NO hace falta que sumen 100 ni que ya sean
    porcentajes. El sistema calcula el ángulo y el porcentaje exacto de cada porción y los
    imprime dentro del gráfico y en la leyenda — nunca calcules tú los porcentajes.
  * "valor" DEBE ser un número JSON puro (ej. 12), NUNCA un texto ni incluir el símbolo "%" ni
    ninguna unidad (mal: "35%", "35 puntos" — bien: 35). Si el enunciado habla de repartir 24
    horas del día, pon directamente las horas de cada categoría (ej. 8, 7, 1, 5, 2, 1) y deja
    que el sistema calcule el porcentaje — nunca conviertas tú las horas a porcentaje antes.
  * Entre 3 y 6 categorías. El enunciado debe pedir leer/interpretar el gráfico (¿qué porcentaje
    representa X?, ¿cuál es la categoría mayoritaria?, ¿qué fracción del total es X?) — nunca
    repitas los valores ya dados como si fueran nueva información.` : ''
}`;

  // Restas con barritas (13/08/2026): alternativa manipulativa a
  // "operacion_vertical" — dos grupos de palotes que el alumno tacha a mano.
  const bloqueRestaBarritas = esConDibujos ? `

- "resta_barritas": resta representada con dos grupos de palotes/barritas (modelo de
  comparación de conjuntos: el alumno tacha a mano tantos palotes como el número menor en los
  DOS grupos, y lo que sobra sin tachar en el grupo mayor es el resultado). Úsalo como
  alternativa visual a "operacion_vertical" para practicar la resta con apoyo manipulativo, no
  en columna.
  { "minuendo": n, "sustraendo": m, "modo": "tachar" o "dibujar" }
  * "minuendo" SIEMPRE mayor o igual que "sustraendo".
  * "modo": "tachar" → el sistema dibuja ya los palotes en las dos cajas (el alumno solo
    tacha). "dibujar" → el sistema deja las dos cajas vacías, con el número como referencia,
    para que el alumno dibuje él mismo los palotes antes de tachar — es un paso más de
    dificultad, úsalo cuando el docente pida explícitamente "que dibuje" o para variar.
  * Usa números pequeños (hasta unos 20-25): con más cantidad los palotes dejan de leerse bien
    en la caja de la ficha.` : '';

  // Recta numérica (13/08/2026): apoyo visual clásico para sumas/restas de
  // un solo paso — mismo curso que resta_barritas.
  const bloqueRectaNumerica = esConDibujos ? `

- "recta_numerica": recta numérica horizontal (de 0 a un máximo) con el número de partida
  resaltado y los saltos de la operación marcados, para practicar sumas o restas SENCILLAS de
  un solo paso.
  { "operacion": { "a": n1, "signo": "+" o "-", "b": n2 }, "rangoMax": n (opcional) }
  * Números pequeños, típicamente hasta 20 — con números grandes la recta deja de caber/leerse
    bien impresa.
  * "rangoMax" es OPCIONAL: si lo omites, el sistema calcula un rango con margen suficiente
    para "a" y el resultado. Indícalo solo si quieres que varias rectas de la misma ficha
    compartan exactamente el mismo rango (por ejemplo, todas de 0 a 19).
  * El sistema dibuja la recta, resalta "a" y marca los saltos — nunca calcules ni escribas tú
    el resultado, solo queda un hueco en blanco.` : '';

  // Rejilla numérica (13/08/2026): cuadrícula de números en fila×columna
  // (versión en rejilla de "serie_numerica") — mismos cursos que
  // cuadro_numerico, pero es un tipo DISTINTO: esta es una secuencia de
  // conteo (de 1 en 1, de 2 en 2...), no una tabla de sumar/restar.
  // 13/08/2026 (aclaración del usuario): en 1º-2º "rejilla_numerica" debe ser
  // sobre todo EL "cuadro numérico" clásico de conteo hasta 100 (cuadrícula
  // 10×10, una decena por fila) — no una cuadrícula genérica de rango y paso
  // libres. La versión genérica (cualquier rango/paso/columnas) sigue igual
  // que antes para 3º, que el usuario confirmó que ya funciona bien.
  const esRejillaClasica = ['1º', '2º'].includes(curso);
  const notaRejillaEspecifica = esRejillaClasica ? `
  * EN ${curso}, ÚSALO PRINCIPALMENTE como el "cuadro numérico" clásico de conteo hasta 100:
    "columnas": 10 SIEMPRE, y "numeros" con EXACTAMENTE 100 números (10 filas × 10 columnas),
    donde cada fila es una decena completa y consecutiva. Dos variantes válidas, elige una:
    (a) empieza en 0 (fila 1: 0-9, fila 2: 10-19, ..., fila 10: 90-99), o
    (b) empieza en 1 (fila 1: 1-10, fila 2: 11-20, ..., fila 10: 91-100).
    Cada celda es la anterior + 1, siempre de izquierda a derecha y fila a fila.
  * Número de huecos por fila en ${curso}: dificultad MODERADA por defecto — dos o tres huecos
    por fila (de las 10 celdas). Si las instrucciones especiales del docente piden una ficha
    "para empezar curso", "básica" o "de repaso inicial", deja menos huecos (uno o dos por
    fila); si piden algo "avanzado", "de repaso final" o "más difícil", deja hasta cinco o seis
    por fila. Nunca dejes una fila entera en blanco ni una fila entera sin ningún hueco.
  * Reparte los huecos en columnas distintas de una fila a otra (no siempre en la misma
    posición), para que el alumno cuente en vez de memorizar un patrón de columnas.` : `
  * El patrón tiene que ser deducible SOLO con los números que sí aparecen: reparte las pistas
    por toda la cuadrícula (no las agrupes todas al principio) y nunca dejes una fila entera en
    blanco.
  * "columnas" entre 5 y 10. El total de celdas (filas × columnas, es decir
    "numeros".length) no debería superar 100.`;

  const bloqueRejillaNumerica = esGuiado ? `

- "rejilla_numerica": cuadrícula de números en fila×columna para practicar el conteo (de 1 en
  1, de 2 en 2, de 10 en 10...) o el reconocimiento de decenas. Es la versión en cuadrícula de
  "serie_numerica" — un tipo DISTINTO de "cuadro_numerico" (aquella es una tabla de sumar o
  restar; esta es una secuencia de conteo).
  { "columnas": n, "numeros": [1, null, 3, 4, ...] }
  * "numeros" es la lista COMPLETA de la cuadrícula, en orden, fila a fila (cada fila tiene
    "columnas" números). Usa "null" (JSON null, no el texto "null") en cada posición que el
    alumno debe rellenar — igual que en "serie_numerica".
${notaRejillaEspecifica}` : '';

  // Cuadro numérico (13/08/2026): tabla de doble entrada para practicar
  // sumas o restas — disponible en los cursos con formato guiado (1º-3º).
  const bloqueCuadroNumerico = esGuiado ? `

- "cuadro_numerico": tabla de doble entrada para practicar sumas o restas — cabecera de filas
  y columnas con números, celdas en blanco para que el alumno escriba el resultado.
  { "operacion": "suma" o "resta", "filas": [n1, n2, ...], "columnas": [n1, n2, ...],
    "ejemplo": { "fila": n, "columna": n } }
  * En "resta", la operación de CADA celda es SIEMPRE columna − fila (nunca al revés) — para
    que todas las celdas den un resultado válido, usa columnas con números iguales o mayores
    que el mayor valor de "filas" (si aun así alguna celda diera negativo, el sistema la
    bloquea automáticamente en vez de dejarla en blanco, pero es mejor evitarlo eligiendo bien
    los rangos).
  * "ejemplo" es OPCIONAL: si lo incluyes, esa celda concreta (su "fila" y "columna" deben
    existir en los arrays "filas"/"columnas") se rellena ya resuelta como modelo, para que el
    alumno entienda el mecanismo antes de rellenar el resto — el sistema calcula ese resultado,
    tú NUNCA escribas el número.
  * Tamaño recomendado: 3-4 filas × 5-7 columnas. No uses tablas más grandes: no caben bien en
    la ficha.` : '';

  // Figuras geométricas (13/08/2026): disponible en todos los cursos, pero
  // con dificultad graduada — figuras 3D solo a partir de 2º, y el modo
  // "perimetro_area" solo donde ya se trabaja multiplicación/división
  // (4º-6º, cuando el currículo real introduce fórmulas de área).
  const esConFiguras3D = curso !== '1º';
  const figurasDisponibles = esConFiguras3D
    ? [...FIGURAS_2D_DISPONIBLES, ...FIGURAS_3D_DISPONIBLES].join(', ')
    : FIGURAS_2D_DISPONIBLES.join(', ');
  const bloqueFiguraGeometrica = `

- "figura_geometrica": ejercicios de geometría (figuras planas 2D${esConFiguras3D ? ' y cuerpos geométricos 3D' : ''}).
  Figuras disponibles (usa EXACTAMENTE estos nombres): ${figurasDisponibles}.
  Cuatro modos posibles según lo que quieras trabajar — cada uno con su "datos":
  - "identificar": { "modo": "identificar", "figuras": ["triangulo", "cuadrado", "circulo"] }
    El sistema dibuja cada figura con un hueco debajo para que el alumno escriba su nombre —
    NUNCA reveles el nombre en el enunciado ni en "datos". Entre 3 y 8 figuras.
  - "propiedades": { "modo": "propiedades", "figuras": [...] }
    El sistema dibuja cada figura YA CON SU NOMBRE (aquí sí, a diferencia de "identificar") y
    deja en blanco sus propiedades numéricas (lados y vértices en figuras 2D; caras, aristas y
    vértices en figuras 3D) para que el alumno las cuente sobre el dibujo. Entre 2 y 6 figuras.
  - "clasificar": { "modo": "clasificar", "figuras": [...], "grupos": ["Polígonos", "Figuras curvas"] }
    El sistema dibuja todas las figuras sueltas arriba (sin nombre) y una caja en blanco por
    cada grupo (2-4 grupos) para que el alumno escriba en cada caja qué figuras pertenecen a
    ese grupo. Tú decides el criterio de clasificación y lo explicas en el enunciado (por
    número de lados, rectas/curvas, 2D/3D...) — los nombres de "grupos" deben ser coherentes
    con ese criterio.${esConFiguras3D && ['4º', '5º', '6º'].includes(curso) ? `
  - "perimetro_area": SOLO para "cuadrado", "rectangulo" o "triangulo" (no hay fórmula de área
    para el resto de figuras en este sistema).
    { "modo": "perimetro_area", "figura": "rectangulo", "unidad": "cm",
      "medidas": { "base": 8, "altura": 5 }, "pedir": ["perimetro", "area"] }
    * "medidas": para "cuadrado" usa { "lado": n }; para "rectangulo" usa { "base": n, "altura": n };
      para "triangulo" usa { "base": n, "altura": n } (necesario para pedir "area") y añade
      también "lado" solo si el triángulo es equilátero y quieres pedir "perimetro".
    * "pedir": array con uno o los dos valores "perimetro", "area" — solo se piden los que
      tengan sentido con las medidas dadas (para "perimetro" de un triángulo hace falta "lado").
    * El sistema dibuja la figura con las medidas indicadas y deja SOLO huecos en blanco para
      la respuesta — nunca calcules ni escribas tú el resultado.
    * Rango numérico adecuado a ${curso}: ${rango}` : ''}
  * COHERENCIA: el enunciado debe pedir explícitamente lo que el modo hace (ej. "Escribe el
    nombre de cada figura", "Cuenta los lados y los vértices de cada figura", "Clasifica estas
    figuras en...", "Calcula el perímetro y el área").`;

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
    problema, igual que en las operaciones verticales — el niño cuenta los dibujos.
  * COHERENCIA texto↔icono: igual que en las operaciones — el protagonista/objeto que se cuenta
    en "texto" tiene que ser uno de estos iconos (${listaIconos}), literalmente. Escribe el
    problema DESPUÉS de elegir el icono, no al revés — nunca ilustres "niños" o "juguetes" con
    un icono de "coche" o "estrella" solo porque no hay uno mejor: cambia el enunciado.`;
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
  "titulo": "string — título CORTO, máximo 4-5 palabras (ej. 'Sumas y restas hasta el 20', NO una frase larga tipo 'Ficha de Matemáticas: Números hasta 20, sumas y restas sin llevadas'). No repitas la palabra 'Ficha' ni la materia, eso ya lo pone la cabecera.",
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
${bloqueMultDiv}
${bloqueConteo}
${bloqueCalculoMental}
${bloqueTiposNuevos}
${bloqueRestaBarritas}
${bloqueRectaNumerica}
${bloqueCuadroNumerico}
${bloqueRejillaNumerica}
${bloqueFiguraGeometrica}
${bloqueProblema}

- "tipo_test": pregunta de opción múltiple (la pregunta va en "enunciado").
  { "opciones": ["opción a", "opción b", "opción c"] }

- "dibujo": espacio para dibujar. "datos": {}

REGLAS GENERALES:
- Por defecto genera ~10 ejercicios variados. Si el docente pide un número EXACTO, respétalo.
- Distribución por defecto: 40% cálculo/operación directa, 30% cálculo mental o completar,
  20% problemas contextualizados, 10% tipo test o ejercicio abierto.
- Para "operacion_vertical", "multiplicacion_vertical" y "division_vertical": agrupa varias
  operaciones del mismo tipo bajo un único ejercicio usando el array "operaciones" (2-4
  operaciones por ejercicio es lo habitual). NO crees un ejercicio nuevo por cada operación
  suelta — eso deja la ficha con demasiado espacio en blanco y obliga a más páginas de las
  necesarias para el mismo contenido.
  * EXCEPCIÓN — 1º y 2º: aquí NO agrupes. Cada ejercicio de "operacion_vertical" debe tener
    EXACTAMENTE 1 operación en el array (nunca 2+), porque el campo "svg" obligatorio de estos
    cursos representa los dibujos de UNA sola operación — si agrupas varias, no hay forma de
    dibujar cada una por separado y el sistema no pintará ningún icono. En 1º-2º genera más
    ejercicios en su lugar, uno por operación (con su "svg" cada uno).
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

// ─────────────────────────────────────────────────────────────────
// GET /api/iconos
// Devuelve el catálogo completo de iconos (nombre -> SVG) para que el
// formulario pueda mostrar una vista previa visual antes de generar la
// ficha (selector de iconos, 11/08/2026). No usa la API de Anthropic —
// es una simple consulta al catálogo ya cargado en memoria, sin coste.
// ─────────────────────────────────────────────────────────────────
app.get('/api/iconos', (req, res) => {
  res.json(ICONOS_SVG);
});

app.post('/api/generar-ficha', async (req, res) => {
  try {
    const { materia, curso, comunidad, instrucciones, idioma, colegio, sumandos, iconosElegidos } = req.body;

    if (!materia || !curso) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: materia y curso.' });
    }

    // Selector de iconos (11/08/2026): el docente puede elegir de antemano
    // qué iconos usar en los ejercicios de conteo/operaciones ilustradas.
    // Se valida contra el catálogo real (nunca confiar en lo que mande el
    // navegador) — cualquier nombre que no exista en ICONOS_DISPONIBLES se
    // descarta en silencio. Si no queda ninguno válido, se ignora la
    // restricción y Claude vuelve a elegir libremente entre los 84 (mismo
    // comportamiento que antes de esta función).
    const iconosValidados = Array.isArray(iconosElegidos)
      ? iconosElegidos.filter(nombre => ICONOS_DISPONIBLES.includes(nombre))
      : [];

    // ═══════════════════════════════════════════════════════════
    // MATEMÁTICAS: pipeline nuevo (JSON pedagógico + renderizador).
    // ═══════════════════════════════════════════════════════════
    if (materia === 'Matemáticas') {
      // Acota el número de sumandos a un rango razonable (2 a 4); por defecto 2.
      let sumandosValidados = parseInt(sumandos, 10);
      if (!Number.isInteger(sumandosValidados) || sumandosValidados < 2) sumandosValidados = 2;
      if (sumandosValidados > 4) sumandosValidados = 4;

      const systemPrompt = construirSystemPromptMatematicas(curso, iconosValidados);
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
