import express from 'express';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { renderizarFichaMatematicas, ICONOS_DISPONIBLES, ICONOS_SVG, FIGURAS_2D_DISPONIBLES, FIGURAS_3D_DISPONIBLES, PATRONES_SIMETRIA_DISPONIBLES, ICONOS_PROBABILIDAD_DISPONIBLES, PLANTILLAS_CONECTA_PUNTOS_DISPONIBLES } from './renderer-matematicas.js';
import { renderizarFichaLengua, LETRAS_TRAZO_DISPONIBLES } from './renderer-lengua.js';

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
// SYSTEM PROMPT "LEGACY" — Conocimiento del Medio, Educación Física, Música
// e Inglés. Estas asignaturas siguen generando HTML directamente (todavía
// no migradas al pipeline JSON + renderizador). Matemáticas y, desde el
// 04/09/2026, Lengua Castellana YA NO usan este prompt: cada una tiene el
// suyo propio más abajo — más corto porque no necesita explicar reglas de
// maquetado HTML para lo que ya está tipado, eso lo garantiza el código.
// Criterio de migración (ver Fase 5 y Fase 9 del ROADMAP): cada asignatura
// pasa a JSON + renderizador conforme se desarrolla contenido propio para
// ella con precisión que Claude no puede garantizar generando HTML libre
// cada vez — no hace falta migrarlas todas de golpe.
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
   IMPORTANTE: "cabecera-centro" va FUERA de "cabecera" (línea suelta justo antes, sin
   cajón propio) — nunca dentro de "cabecera-datos" ni del cajón de Nombre/Fecha, para que
   quede visualmente separado de esos datos (30/08/2026, petición explícita del docente).
   <p class="cabecera-centro">[Nombre del centro]</p> <!-- SOLO si hay centro, FUERA del div de abajo -->
   <div class="cabecera">
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

// Instrucciones específicas por asignatura (pipeline legacy — sin Matemáticas ni Lengua)
const PROMPTS_MATERIA = {
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
  '3º': 'números 0-999, sumas y restas CON llevadas, todas las tablas de multiplicar ya conocidas (memorizadas en 1º-2º) — a partir de aquí empieza el algoritmo formal en columna, multiplicador/divisor de 1 cifra.',
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
  const esMultDiv = ['3º', '4º', '5º', '6º'].includes(curso);

  // La lista de tipos disponibles varía por curso: a partir de 3º ya no tiene
  // sentido ni mencionarle a Claude "conteo_svg" — así ni existe la tentación
  // de usarlo donde no toca. Multiplicación/división en columna (algoritmo
  // formal) solo a partir de 3º, que es cuando el currículo real las
  // introduce (aclaración de una maestra, 30/08/2026 — antes decía 4º). En
  // 1º-2º la multiplicación es memorización de tablas ("tabla_multiplicar")
  // y la división es reparto manipulativo sin algoritmo ("reparto"), ver
  // ambos bloques más abajo.
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
    tiposDisponibles += ' | resta_barritas | recta_numerica | tabla_multiplicar | reparto';
  }
  if (esGuiado) {
    tiposDisponibles += ' | cuadro_numerico | rejilla_numerica';
  }
  tiposDisponibles += ' | figura_geometrica';

  // ── Ampliación curricular (07/09/2026) — 14 tipos nuevos, gating por curso
  // según cuándo el RD 157/2022 introduce de verdad cada saber. Ver
  // auditoría completa en el ROADMAP (entrada del 07/09/2026).
  const esConDineroEuros = true; // todos los cursos
  const esConProporcionalidad = ['5º', '6º'].includes(curso);
  const esConConversionUnidades = ['3º', '4º', '5º', '6º'].includes(curso);
  const esConMedirRegla = true; // todos los cursos
  const esConAngulos = ['3º', '4º', '5º', '6º'].includes(curso);
  const esConTransportador = ['5º', '6º'].includes(curso);
  const esConSimetria = ['2º', '3º', '4º', '5º', '6º'].includes(curso);
  const esConCoordenadas = ['3º', '4º', '5º', '6º'].includes(curso);
  const esConProbabilidad = true; // todos los cursos (modo "clasificar")
  const esConProbabilidadOrdenar = ['4º', '5º', '6º'].includes(curso);
  const esConMedidasCentralizacion = ['5º', '6º'].includes(curso);
  const esConEcuacionSencilla = ['3º', '4º', '5º', '6º'].includes(curso);
  const esConCrucigrama = ['2º', '3º', '4º', '5º', '6º'].includes(curso);
  const esConColoreaPorOperacion = ['1º', '2º', '3º', '4º'].includes(curso);
  const esConConectaLosPuntos = ['1º', '2º', '3º'].includes(curso);
  const esConNumeroDelDia = ['1º', '2º'].includes(curso);
  // Segunda ampliación (07/09/2026, misma sesión): los dos candidatos de
  // "sentido de la medida" que quedaron pendientes de la primera tanda —
  // mismo criterio "todos los cursos" que dinero_euros/medir_con_regla, ver
  // esos dos bloques para la justificación (la dificultad real la regula
  // Claude a través del rango numérico del curso, no el gating del tipo).
  const esConPesarConBalanza = true; // todos los cursos
  const esConMedirCapacidad = true; // todos los cursos

  if (esConDineroEuros) tiposDisponibles += ' | dinero_euros';
  if (esConProporcionalidad) tiposDisponibles += ' | proporcionalidad';
  if (esConConversionUnidades) tiposDisponibles += ' | conversion_unidades';
  if (esConMedirRegla) tiposDisponibles += ' | medir_con_regla';
  if (esConAngulos) tiposDisponibles += ' | angulos';
  if (esConSimetria) tiposDisponibles += ' | simetria';
  if (esConCoordenadas) tiposDisponibles += ' | coordenadas';
  if (esConProbabilidad) tiposDisponibles += ' | probabilidad';
  if (esConMedidasCentralizacion) tiposDisponibles += ' | medidas_centralizacion';
  if (esConEcuacionSencilla) tiposDisponibles += ' | ecuacion_sencilla';
  if (esConCrucigrama) tiposDisponibles += ' | crucigrama';
  if (esConColoreaPorOperacion) tiposDisponibles += ' | colorea_por_operacion';
  if (esConConectaLosPuntos) tiposDisponibles += ' | conecta_los_puntos';
  if (esConNumeroDelDia) tiposDisponibles += ' | numero_del_dia';
  if (esConPesarConBalanza) tiposDisponibles += ' | pesar_con_balanza';
  if (esConMedirCapacidad) tiposDisponibles += ' | medir_capacidad';

  let bloqueOperacion = `
- "operacion_vertical": SOLO sumas y restas en columna (nunca multiplicación
  ni división — para eso usa "multiplicacion_vertical" o "division_vertical").
  { "operaciones": [ { "signo": "+" o "-", "numeros": [n1, n2, ...] } ]${esConDibujos ? `,
    "svg": { "icono1": "...", "icono2": "...", "icono3": "...", "icono4": "..." }` : ''},
    "columnasParalelas": 2 (o null) }
  * Rango numérico para este curso (${curso}): ${rango}
  * SUMAS: usa EXACTAMENTE el número de sumandos indicado en "Sumandos por suma".
  * RESTAS: SIEMPRE exactamente 2 números. Nunca más.
  * Decimales: si el curso lo requiere, usa números JSON normales con punto
    (ej. 12.5) — el sistema los muestra con coma española y los alinea por la
    coma automáticamente. No escribas tú la coma ni intentes alinear texto.`;

  if (esConDibujos) {
    bloqueOperacion += `
  * OBLIGATORIO en ${curso}: incluye SIEMPRE "svg" (nunca null) — su forma depende del signo
    (aclaración de una maestra real de Primaria, 30/08/2026, sobre cómo se enseña de verdad la
    resta con apoyo manipulativo). En NINGÚN caso (ni suma ni resta) tienes que dar "cantidadN":
    el sistema calcula siempre la cantidad real él solo a partir de "numeros" — tú solo eliges
    qué objeto se dibuja, nunca cuántos.
    - SUMAS: un grupo de objetos por cada sumando — "icono1" para el primero, "icono2" para el
      segundo, y "icono3"/"icono4" si hay más sumandos (mismo número de iconos que de sumandos en
      "numeros"). El niño cuenta cada conjunto por separado y los combina. Si todos los grupos son
      del mismo tipo de objeto puedes repetir el mismo nombre en cada campo.
    - RESTAS: representa SOLO el minuendo (el primer número) como UN ÚNICO conjunto de objetos —
      da solo "icono1" (ni "icono2"/"icono3"/"icono4"). El niño tacha a mano tantos objetos como
      el sustraendo y cuenta los que quedan sin tachar — así es como se enseña de verdad la resta
      con objetos, quitando de un mismo conjunto. NUNCA dibujes dos conjuntos separados con un
      signo "menos" en medio: ese formato es el de la suma (combinar dos conjuntos) y aplicado a
      una resta confunde al alumno sobre qué operación está haciendo — es un fallo conceptual, no
      solo visual.
    En ambos casos, en ${curso} el niño cuenta objetos, no lee números abstractos. Iconos
    disponibles (usa EXACTAMENTE estos nombres): ${listaIconos}.
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

  // Tablas de multiplicar y reparto (30/08/2026): aclaración de una maestra
  // real de Primaria — en 1º se dan las tablas del 1, 2, 3, 5 y 10 (las más
  // fáciles); en 2º el resto de tablas (4, 6, 7, 8, 9). En ambos cursos es
  // memorización de tabla completa, NUNCA multiplicación en columna (eso
  // llega en 3º, ver "esMultDiv" más arriba). El reparto (división) se
  // trabaja en 1º-2º como reparto manipulativo — objetos que se distribuyen
  // a mano en grupos vacíos, SIN algoritmo de división en columna (eso
  // también llega en 3º).
  const bloqueTablaMultiplicar = esConDibujos ? `

- "tabla_multiplicar": practicar UNA tabla de multiplicar completa (de la fila ×1 a la ×10).
  { "tabla": n }
  * "tabla": el número de la tabla a practicar.${curso === '1º' ? `
    En ${curso}, usa SOLO una de estas tablas: 1, 2, 3, 5 o 10 (las que ya se trabajan en este
    curso) — nunca otra.` : `
    En ${curso}, cualquier tabla del 1 al 10 (todas se trabajan ya en este curso).`}
  * El sistema genera él solo las 10 filas completas (tabla × 1 hasta tabla × 10) con el
    resultado en blanco para que el alumno lo rellene — nunca escribas tú las filas ni los
    resultados, "tabla" es el ÚNICO dato que necesitas dar.
  * Como mucho UN ejercicio de este tipo por ficha (ya ocupa bastante espacio él solo).` : '';

  const bloqueReparto = esConDibujos ? `

- "reparto": división como reparto manipulativo (objetos que el alumno distribuye a mano en
  grupos vacíos, dibujando o escribiendo cuántos tocan en cada uno) — SIN algoritmo de división
  en columna (para eso usa "division_vertical", disponible a partir de 3º).
  { "total": n, "grupos": g, "icono": "..." }
  * "total": número de objetos a repartir. "grupos": número de grupos entre los que se reparten.
  * "total" DEBE ser múltiplo exacto de "grupos" (reparto sin resto — en ${curso} todavía no se
    trabaja el resto de una división). Por ejemplo, "total": 12, "grupos": 3 (4 en cada grupo).
  * "icono": EXACTAMENTE uno de estos nombres: ${listaIconos} — coherente con lo que cuenta el
    enunciado (mismo criterio de coherencia enunciado↔icono que en el resto de ejercicios).
  * El sistema dibuja los "total" objetos arriba y "grupos" cajas vacías debajo para que el
    alumno reparta a mano — nunca calcules tú cuántos tocan por grupo, ni lo escribas ni lo
    reveles en el enunciado.${curso === '2º' ? `
  * En ${curso} puedes enlazarlo con las tablas de multiplicar cuando tenga sentido (ej. "reparte
    24 caramelos en 4 grupos iguales" conecta con la tabla del 4) — pero el dato que das sigue
    siendo simplemente "total" y "grupos".` : ''}
  * El enunciado debe pedir explícitamente repartir/distribuir en grupos (ej. "Reparte estas
    12 pelotas en 3 grupos iguales. ¿Cuántas hay en cada grupo?").` : '';

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

  // ── Bloques de documentación de los 14 tipos nuevos (07/09/2026) ────────
  const bloqueDineroEuros = esConDineroEuros ? `

- "dinero_euros": monedas y billetes de euro (educación financiera).
  { "modo": "contar" o "cambio",
    "monedas": [ { "valor": n, "cantidad": n } ],
    "precio": n }
  * "valor" DEBE ser EXACTAMENTE una de estas denominaciones reales (número JSON, nunca texto):
    0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50. El sistema dibuja monedas (hasta
    2€) o billetes (5€ en adelante) — tú no decides cuál, se deduce del valor. Cualquier otro
    valor se ignora sin dibujarse, así que no inventes denominaciones que no existen.
  * "cantidad" por denominación: entre 1 y 8. Máximo 6 denominaciones distintas por ejercicio.
  * "modo": "contar" → el sistema dibuja las monedas/billetes de "monedas" y deja un hueco para
    que el alumno escriba el total — NUNCA calcules ni escribas tú el total.
    "modo": "cambio" → "monedas" representa CON QUÉ paga el comprador y "precio" es el precio
    del artículo (número JSON, puede llevar decimales, ej. 6.5) — el sistema muestra ambos datos
    y deja un hueco para el cambio, que el alumno calcula. NUNCA calcules ni escribas tú el
    cambio.` : '';

  const bloqueProporcionalidad = esConProporcionalidad ? `

- "proporcionalidad": tabla de dos magnitudes en proporción directa (razonamiento proporcional).
  { "magnitudA": "Tazas de harina", "magnitudB": "Huevos", "valoresA": [1, 2, 3, 4] }
  * "valoresA": entre 2 y 6 valores de la primera magnitud (los que tú decidas, coherentes con
    la razón que expliques en el enunciado — ej. "cada tarta necesita 2 huevos por cada taza de
    harina"). El sistema dibuja una tabla con esos valores en la columna A y la columna B
    completamente en blanco — NUNCA calcules ni escribas tú ningún valor de la magnitud B, ni
    siquiera como pista.
  * El enunciado debe dar la razón de proporcionalidad explícitamente (ej. "por cada", "cada...
    necesita...") para que el alumno pueda completar la tabla.` : '';

  const bloqueConversionUnidades = esConConversionUnidades ? `

- "conversion_unidades": conversiones entre unidades del sistema métrico (longitud, masa,
  capacidad o tiempo).
  { "conversiones": [ { "cantidad": n, "unidadOrigen": "m", "unidadDestino": "cm" } ] }
  * Entre 3 y 8 conversiones por ejercicio, TODAS con el MISMO par de unidades (no mezcles
    m→cm con kg→g en el mismo ejercicio — crea ejercicios separados para cada par).
  * Pares de unidades recomendados (el sistema muestra una tabla de equivalencia de apoyo
    automáticamente para estos pares, en cualquier orden): m↔cm, m↔mm, cm↔mm, km↔m, kg↔g,
    l↔ml, h↔min, min↔s. Puedes usar otros pares si el curso lo justifica, pero sin tabla de
    apoyo visual.
  * "cantidad" DEBE ser un número JSON puro. El sistema deja SIEMPRE el resultado en blanco —
    nunca calcules ni escribas tú la conversión.` : '';

  const bloqueMedirConRegla = esConMedirRegla ? `

- "medir_con_regla": segmentos para medir con una regla real, impresos A ESCALA FÍSICA exacta
  (1 cm en la ficha impresa = 1 cm real).
  { "segmentos": [ { "longitudCm": n } ] }
  * Entre 1 y 6 segmentos por ejercicio. "longitudCm": número entre 1 y 15 (puede llevar
    decimales, ej. 7.5, en cursos con decimales) — el sistema dibuja cada línea exactamente a
    esa longitud y una regla de apoyo graduada de 0 a 15 cm encima. NUNCA escribas tú la medida
    en el enunciado (sería dársela resuelta) — el alumno la mide físicamente con su regla.
  * El enunciado debe pedir explícitamente medir con la regla (ej. "Mide cada línea con tu regla
    y anota su longitud en centímetros").` : '';

  const bloqueAngulos = esConAngulos ? `

- "angulos": ángulos dibujados con dos semirrectas desde un vértice.
  { "modo": "clasificar"${esConTransportador ? ' o "transportador"' : ''}, "angulos": [ { "grados": n } ] }
  * Entre 1 y 4 ángulos por ejercicio. "grados": número entre 5 y 180.
  * "modo": "clasificar" → el sistema dibuja el ángulo y deja un hueco para que el alumno
    escriba su tipo (agudo, recto, obtuso o llano) — NUNCA reveles el tipo en el enunciado ni
    en "datos".${esConTransportador ? `
    "modo": "transportador" → el sistema AÑADE una escala de 0° a 180° superpuesta al vértice
    (como un transportador real) y deja un hueco para que el alumno escriba los grados exactos
    — úsalo solo cuando el enunciado pida medir con transportador, no para clasificar.
  * Usa grados "limpios" y fáciles de leer sobre la escala (múltiplos de 5 o 10) cuando el modo
    sea "transportador".` : ''}` : '';

  const bloqueSimetria = esConSimetria ? `

- "simetria": completar una figura simétrica sobre una cuadrícula (mitad ya dibujada).
  { "figura": "corazon", "eje": "vertical" o "horizontal" }
  * "figura": EXACTAMENTE uno de estos nombres del catálogo cerrado: ${PATRONES_SIMETRIA_DISPONIBLES.join(', ')}.
    El sistema dibuja SIEMPRE la mitad de esa figura sobre una cuadrícula — nunca dibujes tú la
    otra mitad ni la describas, es lo que el alumno tiene que completar a mano.
  * "eje": "vertical" (mitad izquierda dibujada, cuadrícula vacía a la derecha) u "horizontal"
    (mitad superior dibujada, cuadrícula vacía debajo).
  * El enunciado debe pedir "completa el dibujo simétrico" o equivalente.` : '';

  const bloqueCoordenadas = esConCoordenadas ? `

- "coordenadas": plano de primer cuadrante (ejes X e Y de 0 a 10).
  { "modo": "localizar" o "representar", "puntos": [ { "x": n, "y": n, "etiqueta": "A" } ] }
  * Entre 1 y 8 puntos. "x" e "y": números enteros entre 0 y 10. "etiqueta": letra o nombre corto.
  * "modo": "localizar" → el sistema DIBUJA los puntos en el plano y deja un hueco para que el
    alumno escriba las coordenadas de cada uno (usa esto cuando el enunciado pida "escribe las
    coordenadas de cada punto").
    "modo": "representar" → el sistema deja el plano EN BLANCO (sin dibujar ningún punto) y solo
    imprime la lista de coordenadas, para que el alumno los dibuje él mismo (usa esto cuando el
    enunciado pida "representa/dibuja estos puntos en el plano").` : '';

  const bloqueProbabilidad = esConProbabilidad ? `

- "probabilidad": sucesos para valorar cualitativamente (sin ningún cálculo numérico).
  { "modo": "clasificar"${esConProbabilidadOrdenar ? ' o "ordenar"' : ''},
    "sucesos": [ { "texto": "Sacar un 7 al lanzar un dado normal", "icono": "dado" } ] }
  * Entre 2 y 6 sucesos. "icono" es OPCIONAL y solo decorativo — EXACTAMENTE uno de estos
    nombres si lo usas: ${ICONOS_PROBABILIDAD_DISPONIBLES.join(', ')}. Omítelo si el suceso no
    tiene que ver con ninguno de ellos.
  * "modo": "clasificar" → el sistema añade 3 casillas (Seguro / Posible / Imposible) junto a
    cada suceso para que el alumno marque una.${esConProbabilidadOrdenar ? `
    "modo": "ordenar" → el sistema deja un hueco numérico junto a cada suceso para que el
    alumno los ordene de más a menos probable (usa esto solo cuando el enunciado pida
    explícitamente ordenar/comparar la probabilidad de varios sucesos entre sí).` : ''}
  * Nunca reveles tú si un suceso es seguro/posible/imposible ni su orden — eso es la respuesta.` : '';

  const bloqueMedidasCentralizacion = esConMedidasCentralizacion ? `

- "medidas_centralizacion": media, moda y/o mediana a partir de una lista de datos.
  { "registros": [n1, n2, ...], "pedir": ["media", "moda", "mediana"] }
  * "registros": entre 5 y 12 números. "pedir": entre 1 y 3 de "media"/"moda"/"mediana" — el
    sistema imprime los datos en bruto y un hueco por cada medida pedida. NUNCA calcules ni
    escribas tú ningún resultado.
  * Para que "moda" tenga sentido, repite algún valor en "registros". Para que "mediana" sea
    limpia, usa preferiblemente un número impar de registros.` : '';

  const bloqueEcuacionSencilla = esConEcuacionSencilla ? `

- "ecuacion_sencilla": operación con un hueco en cualquiera de sus tres posiciones (no siempre
  en el resultado, a diferencia de "calculo_mental").
  { "operaciones": [ { "a": n, "signo": "+", "b": n, "posicionIncognita": "a" } ] }
  * Entre 3 y 8 operaciones por ejercicio. "signo": "+", "-" o "×". "posicionIncognita": "a"
    (primer término), "b" (segundo término) o "resultado" — varía la posición entre las
    distintas operaciones del mismo ejercicio, no la dejes siempre en el mismo sitio.
  * El sistema CALCULA ÉL SOLO el resultado real a partir de "a", "signo" y "b" (nunca confía en
    que tú lo hagas bien) — así que da SIEMPRE los tres campos "a", "b" Y el resultado
    matemáticamente correcto no hace falta que lo mandes, el sistema lo ignora y lo recalcula.
    Lo único que de verdad importa es que "a", "signo" y "b" sean coherentes y que
    "posicionIncognita" señale el hueco.
  * Respeta el rango numérico del curso (${rango}).` : '';

  const bloqueCrucigrama = esConCrucigrama ? `

- "crucigrama": crucigrama numérico — las respuestas (resultados de operaciones) se escriben
  dígito a dígito en una rejilla, en horizontal o vertical, como un crucigrama normal pero con
  números en vez de letras.
  { "palabras": [ { "numero": 1, "direccion": "h", "fila": 0, "columna": 0, "longitud": 2 } ],
    "pistas": [ { "numero": 1, "direccion": "h", "texto": "8 + 7" } ] }
  * "palabras": cada una es una respuesta dentro de la rejilla — "fila"/"columna" (empezando en
    0) son la celda INICIAL, "direccion" "h" (crece hacia la derecha) o "v" (crece hacia abajo),
    "longitud" el número de dígitos de esa respuesta (normalmente 1-3). Rejilla máxima 10×10:
    ninguna palabra puede salirse de ese límite. Dos palabras pueden cruzarse compartiendo una
    celda (misma fila y columna en la posición del cruce) — es lo que hace que sea un
    crucigrama de verdad, intenta que al menos algunas se crucen.
  * "pistas": el texto de la operación para cada "numero" (coincidiendo con el de "palabras"),
    agrupadas por el sistema en "Horizontales" y "Verticales" automáticamente según
    "direccion". El resultado de la operación de cada pista DEBE tener EXACTAMENTE tantos
    dígitos como la "longitud" de su palabra correspondiente — repásalo antes de responder.
  * El sistema NUNCA calcula ni conoce las respuestas — solo dibuja la rejilla vacía (celdas
    activas en blanco, el resto bloqueadas) y la lista de pistas. Comprueba tú que las cuentas
    sean correctas y que el número de dígitos cuadre con la rejilla que diseñas.` : '';

  const bloqueColoreaPorOperacion = esConColoreaPorOperacion ? `

- "colorea_por_operacion": mosaico de casillas con una operación cada una; el alumno la resuelve
  y colorea la casilla según a qué rango de la leyenda pertenezca el resultado.
  { "celdas": [ { "operacion": "6 + 7" } ],
    "leyenda": [ { "rangoMin": 0, "rangoMax": 10, "etiqueta": "amarillo" } ] }
  * "celdas": entre 6 y 24 operaciones cortas (texto libre, ej. "6+7", "9-3"), una por casilla.
  * "leyenda": entre 2 y 6 tramos que cubran TODOS los resultados posibles de las operaciones,
    sin huecos ni solapes entre rangos. "etiqueta" es el nombre del color que el alumno debe
    usar (ej. "amarillo", "azul") — el sistema asigna él mismo el color real de cada tramo
    (nunca mandes tú un color en hexadecimal ni nada parecido, solo el nombre en "etiqueta").
  * Los resultados de las operaciones deben caer TODOS dentro de algún tramo de la leyenda —
    revisa que ningún resultado quede fuera de rango antes de responder.` : '';

  const bloqueConectaLosPuntos = esConConectaLosPuntos ? `

- "conecta_los_puntos": conectar puntos numerados en orden para revelar un dibujo.
  { "plantilla": "estrella", "paso": 2, "inicio": 2 }
  * "plantilla": EXACTAMENTE uno de estos nombres del catálogo cerrado: ${PLANTILLAS_CONECTA_PUNTOS_DISPONIBLES.join(', ')}.
    El sistema dibuja SIEMPRE ese dibujo (nunca inventes ni describas otro) — tú solo eliges cuál.
  * "paso": de cuánto en cuánto se cuenta (1 = de 1 en 1, 2 = de 2 en 2, 5 = de 5 en 5...), entre
    1 y 10. "inicio": OPCIONAL, el primer número de la serie (por defecto empieza en el propio
    "paso", ej. si "paso" es 2 empieza en 2, 4, 6...).
  * El sistema numera los puntos automáticamente según "paso"/"inicio" — nunca necesitas (ni
    puedes) dar tú las coordenadas.` : '';

  const bloqueNumeroDelDia = esConNumeroDelDia ? `

- "numero_del_dia": trabajo de valor posicional — el número a trazar, un marco de diez (ten
  frame) con círculos rellenos, y opcionalmente objetos para contar.
  { "numero": n, "icono": "..." }
  * "numero": entero entre 0 y 20. El sistema dibuja el número grande para trazar y el marco de
    diez (dos marcos si el número pasa de 10) con exactamente ese número de círculos rellenos —
    nunca des tú ninguna cantidad aparte, se deriva siempre de "numero".
  * "icono": OPCIONAL, uno de estos nombres: ${listaIconos} — si lo das, el sistema añade también
    ese número de objetos para contar (coherente con el enunciado, mismo criterio de coherencia
    enunciado↔icono que en el resto de ejercicios).` : '';

  // ── Segunda ampliación (07/09/2026) — sentido de la medida: masa y capacidad ──
  const bloquePesarConBalanza = esConPesarConBalanza ? `

- "pesar_con_balanza": balanza de dos platillos (sentido de la medida — masa).
  { "modo": "comparar" o "pesas",
    "izquierda": { "icono": "...", "cantidad": n }, "derecha": { "icono": "...", "cantidad": n },
    "objeto": { "icono": "...", "cantidad": n },
    "pesas": [ { "valor": n, "cantidad": n } ] }
  * "modo": "comparar" → usa "izquierda" y "derecha" (ignora "objeto"/"pesas"). El sistema dibuja
    ese número de objetos en cada platillo (icono EXACTAMENTE de esta lista: ${listaIconos},
    cantidad entre 1 y 10) y deja un hueco entre "Izquierda" y "Derecha" para que el alumno
    escriba <, > o =. La balanza se dibuja SIEMPRE nivelada (nunca inclinada hacia un lado) —
    NUNCA reveles tú cuál pesa más, ni en el enunciado ni en los datos: el alumno lo decide solo
    con lo que sepa del mundo real sobre esos objetos (ej. "un elefante" y "una hormiga").
    "modo": "pesas" → usa "objeto" (el objeto de peso desconocido, un único platillo, cantidad
    normalmente 1) y "pesas" (las pesas conocidas en el otro platillo). El sistema dibuja el
    objeto en un lado y las pesas en el otro, y deja un hueco para que el alumno SUME el peso
    total — NUNCA calcules ni escribas tú esa suma.
  * "pesas[].valor" DEBE ser EXACTAMENTE una de estas denominaciones reales, en GRAMOS (número
    JSON, nunca texto): 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000. Cualquier otro
    valor se ignora sin dibujarse. "cantidad" por denominación: entre 1 y 6. Máximo 6
    denominaciones distintas.
  * Respeta el rango numérico del curso (${rango}) al elegir los valores de las pesas.` : '';

  const bloqueMedirCapacidad = esConMedirCapacidad ? `

- "medir_capacidad": recipientes graduados con el líquido dibujado a su nivel real (sentido de
  la medida — capacidad).
  { "modo": "leer" o "comparar", "unidad": "ml" o "l",
    "recipientes": [ { "capacidadMax": n, "nivelActual": n } ],
    "izquierda": { "capacidadMax": n, "nivelActual": n }, "derecha": { "capacidadMax": n, "nivelActual": n } }
  * "modo": "leer" → usa "recipientes" (entre 1 y 4). El sistema dibuja cada uno como un
    recipiente graduado con el líquido YA PINTADO hasta "nivelActual" y deja un hueco para que
    el alumno lea y escriba esa cantidad — el enunciado debe pedir LEER el nivel (ej. "¿cuántos
    ml contiene cada recipiente?"), nunca repitas tú el valor de "nivelActual" como texto.
    "modo": "comparar" → usa "izquierda" y "derecha" (ignora "recipientes"). El sistema dibuja
    los dos recipientes ya llenos a su nivel real, uno junto al otro, y deja un hueco en medio
    para que el alumno escriba <, > o = comparando cuánto líquido tiene cada uno — mismo
    espíritu que "grafico_barras" en modo leer: el dibujo representa el dato real, el alumno lo
    lee o lo compara, nunca lo adivina.
  * "capacidadMax": la capacidad total del recipiente (número JSON, ej. 1000). "nivelActual":
    cuánto líquido tiene ahora mismo, SIEMPRE menor o igual que "capacidadMax". El sistema marca
    4 divisiones graduadas (0, 1/4, 1/2, 3/4 y el máximo) con su valor numérico.
  * Usa valores "redondos" para que las marcas de la escala caigan en números fáciles de leer
    (ej. capacidadMax 1000 con marcas en 0/250/500/750/1000).` : '';

  let bloqueProblema;
  if (esConDibujos) {
    bloqueProblema = `
- "problema": problema contextualizado con base de dibujos (OBLIGATORIO en ${curso}).
  { "texto": "enunciado del problema, lenguaje sencillo y adecuado al curso",
    "datosClave": ["dato 1", "dato 2"],
    "svg": { "icono1": "...", "cantidad1": n, "signo": "+" o "-",
              "icono2": "...", "cantidad2": n, "icono3": "...", "cantidad3": n,
              "icono4": "...", "cantidad4": n } }
  * "datosClave": el sistema SOLO usa la CANTIDAD de elementos de esta lista para saber cuántas
    líneas en blanco dejar — nunca se imprime el texto. No es un resumen para el lector, es
    solo un contador; normalmente serán 2.
  * "svg": OBLIGATORIO en ${curso} (nunca null). Igual que en las operaciones verticales, su forma
    depende de "signo":
    - Problema de SUMA ("signo": "+"): un conjunto por cada término que se suma en el enunciado —
      "icono1"/"cantidad1", "icono2"/"cantidad2" y, si el problema suma 3 o 4 cantidades,
      "icono3"/"cantidad3" y "icono4"/"cantidad4" también (deja sin rellenar los que no hagan
      falta). A diferencia de "operacion_vertical", aquí SÍ tienes que dar cada "cantidadN" con el
      número real de ese término — el problema es texto libre y el sistema no tiene otra forma de
      saberlo, así que tiene que coincidir exactamente con lo que dice el enunciado.
    - Problema de RESTA ("signo": "-"): UN ÚNICO conjunto de objetos — solo "icono1"/"cantidad1",
      representando el minuendo (el total inicial, del que se quita algo). El niño tacha a mano
      lo que el problema dice que se quita/pierde/reparte y cuenta lo que queda. NUNCA dibujes dos
      conjuntos separados con un signo "menos" en medio (ese formato es el de la suma, no el de la
      resta — mismo criterio que en "operacion_vertical", ver más arriba). Aquí sí debes dar
      "cantidad1" con el número real del minuendo (a diferencia de "operacion_vertical", el
      sistema no tiene aquí otra forma de saberlo).
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
${bloqueTablaMultiplicar}
${bloqueReparto}
${bloqueCuadroNumerico}
${bloqueRejillaNumerica}
${bloqueFiguraGeometrica}
${bloqueDineroEuros}
${bloqueProporcionalidad}
${bloqueConversionUnidades}
${bloqueMedirConRegla}
${bloqueAngulos}
${bloqueSimetria}
${bloqueCoordenadas}
${bloqueProbabilidad}
${bloqueMedidasCentralizacion}
${bloqueEcuacionSencilla}
${bloqueCrucigrama}
${bloqueColoreaPorOperacion}
${bloqueConectaLosPuntos}
${bloqueNumeroDelDia}
${bloquePesarConBalanza}
${bloqueMedirCapacidad}
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

// ─────────────────────────────────────────────
// LENGUA CASTELLANA — pipeline JSON + renderizador (04/09/2026,
// renderer-lengua.js). Primer tipo formalmente blindado: "trazo_letra"
// (rejilla de copias grandes sólidas para colorear + rejilla de copias
// pequeñas punteadas en la fuente real "Cole Carreira" para repasar, ver
// Fase 9 del ROADMAP — séptima pasada, 05/09/2026). Para todo lo demás
// (huecos gramaticales, lectura comprensiva, dictado, ordenar palabras...)
// se usa la válvula de escape "contenido_libre": Claude sigue escribiendo
// HTML libre, pero SOLO el contenido interior de ESE ejercicio — la
// cabecera, el título, el envoltorio de cada ejercicio y el pie los pone
// siempre el código (renderizarFichaLengua), igual que en Matemáticas.
// Cuando se diseñen tipos propios para más ejercicios de Lengua (huecos,
// lectura_comprensiva, relacionar, ordenar_palabras...), cada uno pasará
// de "contenido_libre" a su propio tipo blindado y este prompt se irá
// recortando poco a poco — ver Fase 9 del ROADMAP para el criterio.
// ─────────────────────────────────────────────
function construirSystemPromptLengua(curso) {
  return `
Eres un experto en diseño de materiales didácticos de Lengua Castellana para Educación
Primaria en España, con dominio de la LOMLOE (Ley Orgánica 3/2020) y el Real Decreto 157/2022.

Tu ÚNICA salida es JSON VÁLIDO. Nada de HTML fuera del campo "datos.html" que se describe
abajo, nada de markdown, nada de \`\`\`json, ni una sola palabra antes o después del objeto JSON.

ESQUEMA EXACTO:
{
  "titulo": "string — título CORTO, máximo 4-5 palabras (ej. 'Trazo de las vocales', NO una
    frase larga tipo 'Ficha de Lengua Castellana: repaso de vocales y consonantes'). No repitas
    la palabra 'Ficha' ni la materia, eso ya lo pone la cabecera.",
  "ejercicios": [
    {
      "enunciado": "string — instrucción breve y clara del ejercicio, SIN 'Ejercicio N.'
        delante (el número lo añade el sistema).",
      "tipo": "trazo_letra | contenido_libre",
      "datos": { ... según el tipo, ver abajo ... }
    }
  ]
}

TIPOS DE EJERCICIO DISPONIBLES Y SU CAMPO "datos":

- "trazo_letra": refuerzo para alumnado que aún no relaciona el sonido con la letra escrita ni
  sabe trazarla. Úsalo SOLO cuando el docente lo pida explícitamente en las instrucciones
  especiales (ej. "ficha de trazo de la vocal A", "que repase la M mayúscula y minúscula") — no
  lo generes por iniciativa propia si no se ha pedido.
  { "letra": "A", "modo": "trazo" o "modelo", "estilo": "clasico" o "pautado",
    "repeticionesGrandes": 6, "repeticionesPequenas": 12,
    "filasPauta": 2, "columnasPauta": 5 }
  * "letra": EXACTAMENTE un carácter (respeta mayúscula/minúscula), SOLO de este catálogo
    cerrado — no inventes ni aproximes letras fuera de esta lista:
    ${LETRAS_TRAZO_DISPONIBLES.join(', ')}
    Si el docente pide una letra fuera de esta lista, NO generes este tipo de ejercicio para
    ella: usa "contenido_libre" y explica en el enunciado que esa letra todavía no está
    disponible para trazo, o simplemente omítela.
  * "modo": "trazo" (por defecto) → un ejercicio de práctica del trazo (ver "estilo" para las
    dos variantes disponibles). "modelo" → solo UNA copia grande y sólida de la letra, sin
    rejillas ni flechas (úsalo si el docente solo quiere mostrar la forma de la letra, no un
    ejercicio de trazo) — "estilo" no aplica en este modo.
  * "estilo" (solo aplica con modo:"trazo"; por defecto "clasico" si no se especifica):
    - "clasico" → una fila de copias GRANDES y sólidas de la letra (para colorear libremente)
      seguida de una fila de copias PEQUEÑAS punteadas con la pauta escolar de 4 líneas ya
      incluida (para repasar el trazo una y otra vez) — solo dibujos y letras sueltas
      repetidas, nunca una palabra ni una frase. Las copias pequeñas usan la fuente real "Cole
      Carreira" (aprobada por la maestra), así que no llevan flechas de dirección.
    - "pautado" → dos modelos grandes de referencia arriba (uno liso, otro con flechas de
      dirección FUERA de la letra) seguidos de varias filas de copias más pequeñas dentro de
      una pauta de 3 líneas, con el contorno de la letra punteado para repasar encima —
      formato más parecido a una ficha de caligrafía clásica de una fila por línea.
  * "repeticionesGrandes": cuántas copias grandes para colorear, SOLO con estilo "clasico"
    (número entero 0-9; por defecto 6 si no se especifica).
  * "repeticionesPequenas": cuántas copias pequeñas punteadas para repasar, SOLO con estilo
    "clasico" (número entero 0-24; por defecto 12 si no se especifica).
  * "filasPauta"/"columnasPauta": SOLO con estilo "pautado" — cuántas filas y cuántas copias
    por fila en la rejilla de práctica pautada (filasPauta: entero 1-6, por defecto 2;
    columnasPauta: entero 1-8, por defecto 5).
  * Cada letra pedida es SU PROPIO ejercicio, con un enunciado breve propio (ej. "Repasa la
    vocal A"), aunque el docente pida varias letras seguidas en la misma ficha.

- "contenido_libre": cualquier otro ejercicio de Lengua (dictado preparatorio, huecos
  gramaticales, lectura comprensiva, ordenar palabras, sinónimos/antónimos, tipos de oraciones,
  signos de puntuación, relacionar columnas, etc. — todo lo que todavía no tiene tipo propio).
  { "html": "<!-- HTML del CONTENIDO del ejercicio, sin el envoltorio -->" }
  * IMPORTANTE: "html" es SOLO el contenido interior del ejercicio — el sistema ya pone por su
    cuenta el <div class="ejercicio">, el número y el enunciado (que va en el campo "enunciado"
    de arriba, NUNCA repetido dentro de "html"). No incluyas <div class="ejercicio"> ni
    <p class="enunciado"> dentro de "html".
  * Clases HTML disponibles para construir "html" (usa SOLO estas, no inventes otras):
    - Huecos para rellenar dentro de una frase: <span class="hueco"></span>
      (variantes: "hueco hueco-largo" para palabras, "hueco hueco-corto" para una letra o V/F).
    - Espacio de respuesta para escritura o redacción: <div class="espacio-respuesta pauta"></div>
      (variantes: añade "alto" o "bajo" para más/menos alto; sin "pauta" es una caja lisa).
    - Texto de lectura comprensiva: <blockquote class="texto-lectura">...</blockquote>
    - Preguntas tipo test:
      <div class="opciones-test">
        <div class="opcion-item"><span class="casilla-test"></span> a) Opción</div>
      </div>
    - Espacio para dibujar: <div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>
    - Tabla de datos o de relacionar conceptos: <table class="tabla-ejercicio">...</table>
    - Lista numerada de frases/palabras (ej. ordenar palabras, frases sueltas):
      <ol class="ejercicio-lista"><li>...</li></ol>
    - Muestra de una tipografía candidata para el trazo (TEMPORAL, 05/09/2026 — SOLO cuando el
      docente pida explícitamente comparar/ver una fuente, ej. "ficha de prueba de la fuente
      Little Days en mayúsculas"; retirar esta clase si finalmente no se adoptan):
      <p class="muestra-fuente-little-days">A E I O U</p> o
      <p class="muestra-fuente-cole-carreira">a e i o u</p> — dentro va SOLO la lista de letras
      pedida (mayúsculas o minúsculas, tal cual se pida, separadas por espacios), nunca una
      frase con significado; esto no es un ejercicio pedagógico normal, es una prueba visual.
  * NUNCA autoevaluación ni caritas. NUNCA HTML fuera de estas clases (nada de estilos inline
    salvo que una de las clases anteriores ya lo requiera).

REGLAS GENERALES:
- Por defecto genera ~10 ejercicios variados, mezclando tipos según lo que pida el docente.
- Las instrucciones especiales del docente tienen MÁXIMA PRIORIDAD sobre todo lo anterior
  (temática, número de ejercicios, letras concretas a trabajar...).
- El título y los enunciados deben ser coherentes con Lengua Castellana de ${curso} de Primaria.
`.trim();
}

function construirPromptLengua({ curso, comunidad, instrucciones, idioma }) {
  return `
DATOS DE LA FICHA:
- Curso: ${curso} de Educación Primaria
- Idioma: ${idioma || 'Español'}
- Comunidad Autónoma: ${comunidad || 'LOMLOE estatal (general)'}
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

// ─────────────────────────────────────────────────────────────────
// POST /api/ficha-en-blanco (07/09/2026)
// Petición del usuario: algunos docentes ven un ejercicio ya hecho en
// internet (ej. "las partes de un volcán") y prefieren capturar esa imagen
// y pegarla ellos mismos en vez de que la IA intente redibujar o describir
// el ejercicio. No hace falta la IA para esto — la ficha en blanco es solo
// la cabecera/pie del sistema (mismo aspecto que cualquier otra ficha, para
// que encaje con el resto) con CERO ejercicios generados; el propio
// index.html ya tenía desde el 10/08/2026 un mecanismo de "imagen flotante"
// para que el docente suba y coloque sus propias imágenes sobre la
// ficha (ver añadirBotonesImagen/insertarImagenFlotante) — este endpoint
// solo genera la página en blanco sobre la que colocarlas, sin gastar
// ninguna llamada a la IA. Reutiliza renderizarFichaLengua() con
// ejercicios:[] porque su cabecera/pie no dependen de que la materia sea
// Lengua — funciona igual para cualquier materia elegida en el formulario.
app.post('/api/ficha-en-blanco', (req, res) => {
  try {
    const { materia, curso, comunidad, colegio, titulo } = req.body;
    if (!materia || !curso) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: materia y curso.' });
    }
    const datosFicha = {
      titulo: typeof titulo === 'string' && titulo.trim() ? titulo.trim() : undefined,
      ejercicios: [],
    };
    const html = renderizarFichaLengua(datosFicha, { curso, materia, comunidad, colegio });
    res.json({ html });
  } catch (error) {
    console.error('Error al generar la ficha en blanco:', error);
    res.status(500).json({ error: 'Error interno al generar la ficha en blanco.' });
  }
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
    // LENGUA CASTELLANA: pipeline nuevo (JSON + renderizador propio,
    // renderer-lengua.js). Ver construirSystemPromptLengua más arriba.
    // ═══════════════════════════════════════════════════════════
    if (materia === 'Lengua Castellana') {
      const systemPrompt = construirSystemPromptLengua(curso);
      const userPrompt = construirPromptLengua({ curso, comunidad, instrucciones, idioma });

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

      const html = renderizarFichaLengua(datosFicha, { curso, materia, comunidad, colegio });
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
