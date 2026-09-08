// ─────────────────────────────────────────────────────────────────────────
// renderer-lengua.js (04/09/2026, ampliado el mismo día)
// Lengua Castellana pasa a pipeline JSON + renderizador — mismo patrón que
// Matemáticas desde su Fase 2 — en vez de que Claude genere el HTML de la
// ficha entera de memoria cada vez (el motivo, en palabras del usuario:
// "no era práctico, era más un desgaste" — sin blindaje, dependía de que
// Claude recordara bien cabecera/título/clases CSS en cada llamada).
//
// Primera tanda de tipos de ejercicio (04/09/2026):
// - "trazo_letra": letra grande sólida (para colorear) + letra pequeña
//   punteada (para repasar), en rejillas repetidas — 100% código, blindado,
//   cero margen para que Claude decida un punto o una proporción. Origen:
//   petición de una maestra para un niño de 1º sin base lectoescritora
//   (distingue las vocales al hablar pero no las relaciona con lo escrito
//   ni sabe trazarlas).
// - "contenido_libre": VÁLVULA DE ESCAPE explícita (decisión del usuario,
//   04/09/2026) — Claude sigue escribiendo el HTML interior del ejercicio
//   (huecos, lectura comprensiva, relacionar, dictado...), con las mismas
//   clases del antiguo SYSTEM_PROMPT legacy, PERO ya no tiene que acertar
//   la cabecera/título/pie/envoltorio de cada ejercicio — eso lo pone
//   siempre el código. Existe para poder cambiar de pipeline HOY sin tener
//   que diseñar y verificar de golpe un tipo propio para cada variante
//   gramatical de Lengua (decisión explícita: no hacerlo todavía — ver
//   ROADMAP, Fase 9). Se irá vaciando con el tiempo, tipo a tipo, según
//   convenga — mismo criterio que ya se aclaró para el resto de la Fase 5.
//
// Geometría de las letras (05/09/2026, séptima pasada — quién dibuja cada
// rejilla de "trazo_letra" cambia de raíz, ver ROADMAP Fase 9): las 20
// formas (10 letras × mayús/minús) siguen dibujadas a mano como "esqueleto"
// (la línea que sigue el lápiz), pero YA NO alimentan las dos rejillas —
// solo la rejilla GRANDE (construirModeloSolido/construirGridModelos), el
// modelo sólido para colorear. La rejilla PEQUEÑA punteada (repasar el
// trazo) ha pasado a usar la fuente real "Cole Carreira" (autoalojada,
// public/fonts/colecarreira/ — la maestra la vio y la aprobó tal cual, con
// mayúsculas, minúsculas y números, para punteado) en vez de un punteado
// dibujado a mano. Motivo: se intentó primero "derivar" una versión sólida
// de Cole Carreira (rellenando sus propios puntos con procesado de imagen,
// para que modelo y punteado vinieran de la MISMA fuente) — funcionaba bien
// en minúsculas redondas (a, m) pero dejaba huecos o exigía un grosor
// desproporcionado en mayúsculas y números de esquina cerrada (A, 5);
// habría exigido ajustar fuente por fuente, carácter a carácter, con
// calidad desigual — ver /Docs/ROADMAP_FICHAS_ESCOLARES.md Fase 9 para el
// detalle. Se decidió en su lugar: el modelo grande SIGUE con nuestro
// esqueleto a mano (control total, cualquier letra, sin depender de que una
// fuente "cierre bien" al solidificarla) pero afinando sus proporciones
// para parecerse más a Cole Carreira; el punteado pequeño pasa a usar la
// fuente real directamente. ESTO TIENE UN COSTE ACEPTADO A PROPÓSITO: la
// rejilla punteada pierde las flechas de dirección y los números de orden
// de trazo que sí tenía el sistema anterior (los puntos de una fuente no
// llevan esa información) — decisión explícita del usuario, no un olvido.
// El modelo grande de referencia (letra sólida, no punteada) sigue sin
// depender de ninguna fuente externa, por el mismo motivo de siempre.
//
// MODELO GRANDE = GLIFO REAL + FLECHAS FUERA DE LA LETRA (05/09/2026,
// octava pasada — sustituye el esqueleto-sólido-grueso de la séptima
// pasada). El usuario subió fichas reales de referencia (Mini Mundo
// Infantil) y pidió acercarse a ellas, con dos condiciones explícitas:
// 1) las flechitas de dirección de escritura NO deben ir encima/dentro del
//    trazo como en esas fichas — deben quedar FUERA de la letra, del mismo
//    tamaño que las de referencia; 2) la letra en sí debe corresponder
//    EXACTAMENTE al trazo de nuestra propia tipografía (Escolar Ligada), no
//    a una aproximación con arcos hecha a mano — esto se hizo evidente con
//    la "S", que con el esqueleto a mano salía como "un churro" que no se
//    correspondía con la fuente real.
// Solución (validada con 20 letras × verificación píxel a píxel, sin ni
// una sola flecha tocando tinta): el modelo grande ya NO se dibuja con el
// esqueleto (ni como trazo grueso ni de ninguna otra forma) — se dibuja el
// CONTORNO REAL del glifo de Escolar Ligada, extraído una sola vez con
// fontTools desde public/fonts/escolar-ligada/EscolarLigada-Regular.ttf y
// embebido como rutas SVG precalculadas en letras-glifos-reales.json (no se
// añade fontkit/opentype.js como dependencia en tiempo de ejecución: el
// archivo ya trae los `d` de <path> listos). El esqueleto a mano (objeto
// LETRAS, más abajo) NO desaparece — cambia de papel: ya no es lo que se
// ve, es solo una GUÍA interna para saber dónde empieza cada trazo y hacia
// dónde va, usada para calcular la flecha corta de dirección (ver
// flechaCorta() y construirModeloSolido()). Por eso sus medidas se
// recalibraron con ANCHO_REAL (semianchos REALES medidos con fontTools
// sobre el propio glifo, ya no medidas inventadas a mano) — si la guía no
// coincide con el glifo real, la flecha puede arrancar atravesando la tinta
// real en vez de quedar pegada a su borde.
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs';

const BASELINE = 200;
const XHEIGHT_TOP = 100;
const ASCENDER_TOP = 20;
const CAP_TOP = 20;
const DESCENDER_BOTTOM = 280;
const T_TOP = 55;

// Contorno real de cada glifo de Escolar Ligada (rutas SVG `d`, extraídas
// una sola vez con fontTools — ver cabecera del archivo). Se lee con
// import.meta.url en vez de una ruta relativa a process.cwd(), para que
// funcione sea cual sea el directorio desde el que se arranque el server.
const GLIFOS_REALES = JSON.parse(
  readFileSync(new URL('./letras-glifos-reales.json', import.meta.url), 'utf8')
);

const deg2rad = d => d * Math.PI / 180;
function arcPoint(cx, cy, rx, ry, deg) {
  const r = deg2rad(deg);
  return [cx + rx * Math.cos(r), cy + ry * Math.sin(r)];
}
function line(from, to) { return { type: 'line', from, to }; }
function arc(cx, cy, rx, ry, startDeg, sweepDeg) { return { type: 'arc', cx, cy, rx, ry, startDeg, sweepDeg }; }

// (segLength/pointOnSeg/sampleStroke se retiraron el 05/09/2026 — solo los
// usaba construirSvgLetra(), el punteado dibujado a mano que ya no se
// invoca; ver cabecera del archivo y construirGridPunteado() más abajo.)

const CX = 70;
const cyXH = (XHEIGHT_TOP + BASELINE) / 2;
const rXH_y = (BASELINE - XHEIGHT_TOP) / 2;
const cyCap = (CAP_TOP + BASELINE) / 2;
const rCap_y = (BASELINE - CAP_TOP) / 2;

// (colaSalida/colaSalidaLarga/s_segments se retiraron el 05/09/2026, octava
// pasada — dibujaban a mano el "rabito" de salida y la doble curva de la S/s
// para el antiguo modelo-esqueleto sólido. Ya no hace falta: el modelo
// grande dibuja el contorno REAL del glifo (rabitos, curvas y todo incluido
// tal cual los trazó la propia tipografía), y el esqueleto-guía que queda
// (ver LETRAS más abajo) solo necesita el PRIMER segmento de cada trazo
// para calcular dónde nace la flecha de dirección — no necesita reconstruir
// el trazo completo letra por letra.)

// Semiancho REAL de cada letra (05/09/2026, octava pasada), medido una sola
// vez con fontTools (BoundsPen) sobre el contorno real de cada glifo de
// Escolar Ligada — sustituye los semianchos inventados a mano que tenía el
// antiguo esqueleto (p.ej. la "A" medía 45 a mano; el glifo real mide
// 77.25). El esqueleto-guía usa estas medidas para que su punto de arranque
// y su dirección correspondan de verdad a dónde está la tinta real —
// si la guía queda más ESTRECHA que el glifo real, la flecha calculada
// sobre ella puede atravesar la tinta en vez de nacer pegada a su borde.
const ANCHO_REAL = {
  A: 77.25, E: 57.73, O: 82.33, U: 68.00, P: 61.73, S: 59.91,
  I: 11.80, M: 91.46, L: 55.79, T: 69.45,
  a: 82.90, e: 51.82, o: 78.31, u: 77.72, m: 125.24, s: 50.95, i: 25.16,
  l: 39.83, t: 38.83, p: 67.38,
};

// Medio grosor de trazo asumido (05/09/2026, octava pasada), medido con
// fontTools sobre el palo de la "E" (~24u de grosor real, 12 a cada lado del
// centro) y reutilizado como estimación razonable para el resto de palos y
// patas del catálogo. Hace falta porque fontTools (BoundsPen) solo da el
// borde EXTERIOR de la letra, nunca la línea central de un trazo — cuando un
// trazo "sale" de otro (la barra media de la E desde su palo, la panza de la
// P/p desde su palo, el travesaño de la A desde sus patas, el palo de la T
// bajo su barra), hay que arrancar la guía en el borde REAL de ese otro
// trazo, no en su centro, o la flecha recorrería medio grosor de tinta antes
// de que la separación pudiera sacarla fuera.
const MEDIO_GROSOR = 12;

// Rango vertical real usado en la extracción fontTools para cada letra (debe
// coincidir con el mismo par usado al generar letras-glifos-reales.json).
const RANGO = {
  A: [CAP_TOP, BASELINE], E: [CAP_TOP, BASELINE], O: [CAP_TOP, BASELINE], U: [CAP_TOP, BASELINE],
  P: [CAP_TOP, BASELINE], S: [CAP_TOP, BASELINE], I: [CAP_TOP, BASELINE], M: [CAP_TOP, BASELINE],
  L: [CAP_TOP, BASELINE], T: [CAP_TOP, BASELINE],
  a: [XHEIGHT_TOP, BASELINE], e: [XHEIGHT_TOP, BASELINE], o: [XHEIGHT_TOP, BASELINE],
  u: [XHEIGHT_TOP, BASELINE], m: [XHEIGHT_TOP, BASELINE], s: [XHEIGHT_TOP, BASELINE], i: [XHEIGHT_TOP, BASELINE],
  l: [ASCENDER_TOP, BASELINE], t: [T_TOP, BASELINE], p: [XHEIGHT_TOP, DESCENDER_BOTTOM],
};

// Centro real de la letra, usado solo para decidir "hacia qué lado está
// fuera" al colocar cada flecha (05/09/2026, octava pasada). CORRECCIÓN
// IMPORTANTE: una primera versión calculaba este centro muestreando los
// propios segmentos del esqueleto-guía expuestos — pero varias letras (m, a,
// e) exponen a propósito solo su PRIMER segmento (el resto del trazo real lo
// dibuja el glifo de la fuente, no hace falta reconstruirlo a mano), así que
// el centroide coincidía con ese único segmento y la comparación de lado
// quedaba ambigua (le tocaba, al azar, el lado equivocado). Como la
// extracción siempre centra cada letra en CX y el rango vertical real ya se
// conoce (RANGO), el centro real es sencillamente (CX, punto medio de ese
// rango) — exacto y ajeno a qué segmentos decida exponer cada guía.
function centroideReal(letra) {
  const [topY, botY] = RANGO[letra];
  return [CX, (topY + botY) / 2];
}

// Esqueleto-GUÍA (05/09/2026, octava pasada — ya NO se dibuja; ver
// construirModeloSolido() más abajo, donde la letra visible pasa a ser el
// contorno real del glifo). Cada letra sigue devolviendo una lista de
// "trazos" (listas de segmentos), pero ahora solo como referencia interna
// para calcular dónde nace cada flecha de dirección y hacia dónde apunta —
// varias letras exponen aquí solo su primer segmento (el resto del trazo
// real — humps, rabitos, rizos — lo dibuja el glifo de la fuente).
const LETRAS = {
  A() {
    const hw = ANCHO_REAL.A;
    const apex = [CX, CAP_TOP];
    const botL = [CX - hw, BASELINE], botR = [CX + hw, BASELINE];
    const diag1 = line(botL, apex), diag2 = line(apex, botR);
    const barY = CAP_TOP + (BASELINE - CAP_TOP) * 0.62;
    const tBar = (barY - CAP_TOP) / (BASELINE - CAP_TOP);
    let barL = [apex[0] + (botL[0] - apex[0]) * tBar, barY];
    let barR = [apex[0] + (botR[0] - apex[0]) * tBar, barY];
    // El travesaño no nace en el CENTRO de la pata (lo que marcaría la guía
    // por defecto) sino en su cara INTERIOR — se desplaza cada punto medio
    // grosor de pata hacia el centro de la letra (a lo largo de la normal de
    // esa pata); si no, el travesaño recorre medio grosor de pata por dentro
    // de la tinta antes de que la separación de la flecha pueda sacarlo fuera.
    const [nx1, ny1] = normal(apex[0] - botL[0], apex[1] - botL[1]);
    barL = (Math.abs(barL[0] + nx1 * MEDIO_GROSOR - CX) < Math.abs(barL[0] - nx1 * MEDIO_GROSOR - CX))
      ? [barL[0] + nx1 * MEDIO_GROSOR, barL[1] + ny1 * MEDIO_GROSOR]
      : [barL[0] - nx1 * MEDIO_GROSOR, barL[1] - ny1 * MEDIO_GROSOR];
    const [nx2, ny2] = normal(botR[0] - apex[0], botR[1] - apex[1]);
    barR = (Math.abs(barR[0] + nx2 * MEDIO_GROSOR - CX) < Math.abs(barR[0] - nx2 * MEDIO_GROSOR - CX))
      ? [barR[0] + nx2 * MEDIO_GROSOR, barR[1] + ny2 * MEDIO_GROSOR]
      : [barR[0] - nx2 * MEDIO_GROSOR, barR[1] - ny2 * MEDIO_GROSOR];
    return [[diag1, diag2], [line(barL, barR)]];
  },
  E() {
    const hw = ANCHO_REAL.E;
    const xBordeIzq = CX - hw; // borde real medido (fontTools)
    const xCentroPalo = xBordeIzq + MEDIO_GROSOR; // centro real del palo
    const xBordeDerechoPalo = xBordeIzq + 2 * MEDIO_GROSOR; // por donde salen las barras
    const anchoBarra = hw * 1.5;
    const stem = line([xCentroPalo, CAP_TOP], [xCentroPalo, BASELINE]);
    const top = line([xBordeDerechoPalo, CAP_TOP], [xBordeDerechoPalo + anchoBarra, CAP_TOP]);
    const mid = line([xBordeDerechoPalo, cyCap], [xBordeDerechoPalo + anchoBarra * 0.8, cyCap]);
    const bot = line([xBordeDerechoPalo, BASELINE], [xBordeDerechoPalo + anchoBarra, BASELINE]);
    return [[stem], [top], [mid], [bot]];
  },
  O() {
    const hw = ANCHO_REAL.O;
    return [[arc(CX, cyCap, hw, rCap_y, 270, -180), arc(CX, cyCap, hw, rCap_y, 90, -180)]];
  },
  U() {
    const half = ANCHO_REAL.U, r = half;
    const xL = CX - half, xR = CX + half, yCurveTop = BASELINE - r;
    const down = line([xL, CAP_TOP], [xL, yCurveTop]);
    const curve = arc(xL + r, yCurveTop, r, r, 180, -180);
    const up = line([xR, yCurveTop], [xR, CAP_TOP]);
    return [[down, curve, up]];
  },
  P() {
    const hw = ANCHO_REAL.P;
    const xBordeIzq = CX - hw;
    const xCentroPalo = xBordeIzq + MEDIO_GROSOR;
    const xBordeDerechoPalo = xBordeIzq + 2 * MEDIO_GROSOR;
    const stem = line([xCentroPalo, CAP_TOP], [xCentroPalo, BASELINE]);
    const midY = CAP_TOP + (BASELINE - CAP_TOP) * 0.55;
    const ry = midY - CAP_TOP, rx = hw * 1.65;
    // La panza sale del borde DERECHO del palo, no de su centro (mismo
    // motivo que las barras de la E).
    const bowl = arc(xBordeDerechoPalo, CAP_TOP + ry, rx, ry, 270, 180);
    return [[stem], [bowl]];
  },
  S() {
    const hw = ANCHO_REAL.S;
    const r = (BASELINE - CAP_TOP) / 4;
    const cyTop = CAP_TOP + r, cyBot = BASELINE - r;
    const upper = arc(CX, cyTop, hw, r, 300, -210);
    const lower = arc(CX, cyBot, hw, r, 90, -210);
    return [[upper, lower]];
  },
  I() {
    // Semiancho real (11.8u) = solo el propio grosor del palo — la "I" no
    // tiene nada más ancho que su trazo, sin problema de "sale de otro
    // trazo" (es el único elemento de la letra).
    return [[line([CX, CAP_TOP], [CX, BASELINE])]];
  },
  M() {
    const hw = ANCHO_REAL.M;
    const x0 = CX - hw, x2 = CX + hw, x1 = CX;
    const valleyY = CAP_TOP + (BASELINE - CAP_TOP) * 0.55;
    // El primer trazo (palo izquierdo) es el borde EXTERIOR de la letra —
    // no hace falta corrección de centro/borde (nada a su izquierda de lo
    // que "salir"), igual que las patas de la U.
    return [[
      line([x0, CAP_TOP], [x0, BASELINE]),
      line([x0, CAP_TOP], [x1, valleyY]),
      line([x1, valleyY], [x2, CAP_TOP]),
      line([x2, CAP_TOP], [x2, BASELINE]),
    ]];
  },
  L() {
    const hw = ANCHO_REAL.L;
    const x = CX - hw;
    // Un único trazo (palo + pie, sin levantar el lápiz) — solo se usa el
    // primer segmento (el palo) para la flecha; es borde exterior, sin
    // corrección de centro/borde.
    return [[line([x, CAP_TOP], [x, BASELINE]), line([x, BASELINE], [x + hw * 1.1, BASELINE])]];
  },
  T() {
    const hw = ANCHO_REAL.T;
    // Dos trazos: la barra (arriba, borde exterior — sin corrección) y el
    // palo, que arranca ya por DEBAJO del grosor real de la barra
    // (~2×MEDIO_GROSOR) — igual que las barras de la E salen del borde del
    // palo, pero en vertical.
    const stemStartY = CAP_TOP + 2 * MEDIO_GROSOR;
    return [[line([CX - hw, CAP_TOP], [CX + hw, CAP_TOP])], [line([CX, stemStartY], [CX, BASELINE])]];
  },
  a() {
    // Solo hace falta el primer segmento (el bucle) para la flecha; el resto
    // del trazo real (palo + rabito) lo dibuja el glifo de la fuente.
    const rx = ANCHO_REAL.o, ry = rXH_y, cx = CX, cy = cyXH;
    const bowl = arc(cx, cy, rx, ry, 310, -345);
    return [[bowl]];
  },
  e() {
    // Primer segmento = la barra de entrada (del centro al borde del
    // bucle). Vive dentro del hueco del bucle (no es tinta), acortada a un
    // 80% del semiancho de referencia para no acercarse de más al borde
    // inferior del bucle real con separaciones más anchas.
    const cx = CX, cy = cyXH, rx = ANCHO_REAL.o * 0.8, ry = rXH_y;
    const bar = line([cx, cy], [cx + rx, cy]);
    return [[bar]];
  },
  o() {
    const hw = ANCHO_REAL.o;
    return [[arc(CX, cyXH, hw, rXH_y, 270, -180), arc(CX, cyXH, hw, rXH_y, 90, -180)]];
  },
  u() {
    const half = ANCHO_REAL.u, r = half;
    const xL = CX - half, xR = CX + half, yCurveTop = BASELINE - r;
    const down = line([xL, XHEIGHT_TOP], [xL, yCurveTop]);
    const curve = arc(xL + r, yCurveTop, r, r, 180, -180);
    const up = line([xR, yCurveTop], [xR, XHEIGHT_TOP]);
    return [[down, curve, up]];
  },
  m() {
    const hw = ANCHO_REAL.m;
    const x0 = CX - hw;
    // Solo el primer segmento (palo izquierdo) — borde exterior, sin
    // corrección de centro/borde, igual que "u" y "M".
    return [[line([x0, XHEIGHT_TOP], [x0, BASELINE])]];
  },
  p() {
    const hw = ANCHO_REAL.p;
    const xBordeIzq = CX - hw;
    const xCentroPalo = xBordeIzq + MEDIO_GROSOR;
    const xBordeDerechoPalo = xBordeIzq + 2 * MEDIO_GROSOR;
    const stem = line([xCentroPalo, XHEIGHT_TOP], [xCentroPalo, DESCENDER_BOTTOM]);
    const midY = (XHEIGHT_TOP + BASELINE) / 2;
    const ry = midY - XHEIGHT_TOP, rx = ry * 1.3;
    // Misma corrección que en la P mayúscula: la panza sale del borde
    // DERECHO del palo, no de su centro.
    const bowl = arc(xBordeDerechoPalo, XHEIGHT_TOP + ry, rx, ry, 270, 180);
    return [[stem], [bowl]];
  },
  l() {
    return [[line([CX, ASCENDER_TOP], [CX, BASELINE])]];
  },
  s() {
    const hw = ANCHO_REAL.s;
    const r = (BASELINE - XHEIGHT_TOP) / 4;
    const cyTop = XHEIGHT_TOP + r, cyBot = BASELINE - r;
    const upper = arc(CX, cyTop, hw, r, 300, -210);
    const lower = arc(CX, cyBot, hw, r, 90, -210);
    return [[upper, lower]];
  },
  t() {
    // La barra arranca ya en el borde DERECHO del palo, como con la E/P —
    // arrancar a la izquierda del palo (como hacía el esqueleto antiguo) la
    // hace atravesar el propio palo antes de que la separación pueda
    // sacarla fuera.
    return [[line([CX, T_TOP], [CX, BASELINE])], [line([CX + MEDIO_GROSOR, XHEIGHT_TOP + 8], [CX + 35, XHEIGHT_TOP + 8])]];
  },
  i() {
    // La "i" real NO es simétrica respecto a CX — tiene una colita que se
    // curva hacia la derecha por abajo (para enlazar con la letra
    // siguiente), así que el centro medido del glifo completo (usado para
    // centrar en CX al extraerlo) queda desplazado a la derecha del propio
    // palo. Medido directamente sobre el contorno real: el palo está en
    // x≈48 (no en CX=70) y no arranca en XHEIGHT_TOP — hay un hueco real
    // entre el punto (arriba) y el palo (que no empieza hasta y≈137). Se
    // usan esos valores medidos en vez de los que "deberían" salir por
    // simetría.
    return [[line([48, 140], [48, BASELINE])]];
  },
};

export const LETRAS_TRAZO_DISPONIBLES = Object.keys(LETRAS);

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// (VB_W/VB_TOP/VB_BOTTOM/VB_H — el recuadro común fijo — se retiraron el
// 05/09/2026, octava pasada: con los semianchos REALES, el catálogo va de la
// "I" (~12u) a la "m" (~125u), y un recuadro pensado para la más ancha deja
// a la "I" minúscula dentro de un hueco enorme. Cada letra calcula ahora su
// propio viewBox dinámico, ver construirModeloSolido() más abajo.)

// (arrowMarker/construirSvgLetra se retiraron el 05/09/2026 — dibujaban a
// mano el punteado + flechas + pauta de la rejilla pequeña; esa rejilla usa
// ahora la fuente real "Cole Carreira" directamente, ver
// construirGridPunteado() más abajo y la cabecera del archivo.)

function normal(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return [-dy / len, dx / len];
}

// Flecha corta de dirección (05/09/2026, octava pasada — sustituye el
// antiguo trazo grueso completo). Validada con el usuario en varias rondas:
// nace pegada al inicio del PRIMER segmento de cada trazo-guía, se desplaza
// con una separación CONSTANTE (nunca creciente — un offset creciente deja
// de ser paralelo al trazo, "se abre en abanico", que fue justo lo que el
// usuario señaló viendo la E) y solo recorre hasta tArrow=0.35 (35%, dentro
// del 30-40% pedido) del trazo, donde se pone la punta. El signo de la
// separación se decide una vez, con el punto medio/dirección global del
// segmento, hacia el lado que se aleja del centro real de la letra
// (centroideReal) — así la flecha siempre queda fuera del glifo, nunca
// encima de su tinta.
function flechaCorta(trazoSegments, centroid, { separacion = 22, tArrow = 0.35, n = 14 } = {}) {
  const seg = trazoSegments[0];
  let signo, dirVecFn;
  if (seg.type === 'line') {
    const [x0, y0] = seg.from, [x1, y1] = seg.to;
    const [nx, ny] = normal(x1 - x0, y1 - y0);
    const midx = (x0 + x1) / 2, midy = (y0 + y1) / 2;
    const haciaFuera = (midx - centroid[0]) * nx + (midy - centroid[1]) * ny;
    signo = haciaFuera >= 0 ? 1 : -1;
    dirVecFn = () => [nx, ny];
  } else {
    const midDeg = seg.startDeg + seg.sweepDeg / 2;
    const [mx, my] = arcPoint(seg.cx, seg.cy, seg.rx, seg.ry, midDeg);
    const dxr = mx - seg.cx, dyr = my - seg.cy;
    const lenr = Math.hypot(dxr, dyr) || 1;
    const [rxn, ryn] = [dxr / lenr, dyr / lenr];
    const haciaFuera = (mx - centroid[0]) * rxn + (my - centroid[1]) * ryn;
    signo = haciaFuera >= 0 ? 1 : -1;
  }

  const pts = [];
  for (let i = 0; i <= n; i++) {
    const tLocal = i / n;
    const t = tLocal * tArrow;
    let base, dirVec;
    if (seg.type === 'line') {
      const [x0, y0] = seg.from, [x1, y1] = seg.to;
      base = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      dirVec = dirVecFn();
    } else {
      const deg = seg.startDeg + seg.sweepDeg * t;
      base = arcPoint(seg.cx, seg.cy, seg.rx, seg.ry, deg);
      const dxr = base[0] - seg.cx, dyr = base[1] - seg.cy;
      const lenr = Math.hypot(dxr, dyr) || 1;
      dirVec = [dxr / lenr, dyr / lenr];
    }
    // separación CONSTANTE en todo el recorrido -> paralela de verdad al trazo.
    pts.push([base[0] + dirVec[0] * signo * separacion, base[1] + dirVec[1] * signo * separacion]);
  }
  return pts;
}

function pathDesdePuntos(pts) {
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
}

// Contador global para IDs de <marker> únicos (05/09/2026, octava pasada):
// una rejilla repite la MISMA letra varias veces (hasta 9 copias grandes) en
// varios <svg> dentro del mismo documento HTML — los IDs de SVG son
// globales al documento, no locales a cada <svg>, así que "punta-A" no
// puede repetirse copia tras copia. Se añade un correlativo a cada llamada.
let _correlativoFlecha = 0;

// ─────────────────────────────────────────────────────────────────────────
// MODELO GRANDE = GLIFO REAL DE ESCOLAR LIGADA + FLECHAS FUERA DE LA LETRA
// (05/09/2026, octava pasada — sustituye el esqueleto-sólido-grueso de la
// séptima pasada; ver cabecera del archivo para el porqué completo).
// ─────────────────────────────────────────────────────────────────────────
function construirModeloSolido(letra, { anchoPx = 100, separacion = 22, tArrow = 0.35, conFlechas = true } = {}) {
  const build = LETRAS[letra];
  const glifo = GLIFOS_REALES[letra];
  if (!build || !glifo) return null;

  let flechas = '';
  if (conFlechas) {
    const strokes = build();
    const centroid = centroideReal(letra);
    const idBase = `punta-${letra}-${_correlativoFlecha++}`;
    strokes.forEach((trazoSegments) => {
      if (trazoSegments && trazoSegments.isDot) return; // el punto de la "i" no es un trazo direccional
      const pts = flechaCorta(trazoSegments, centroid, { separacion, tArrow });
      flechas += `<path d="${pathDesdePuntos(pts)}" class="trazo-letra-modelo-flecha" marker-end="url(#${idBase})"/>`;
    });
    if (flechas) {
      flechas = `<defs><marker id="${idBase}" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" class="trazo-letra-modelo-flecha-punta"/></marker></defs>${flechas}`;
    }
  }

  // viewBox dinámico: cada letra tiene su propio semiancho real (de la "I",
  // ~12u, a la "m", ~125u) y su propio rango vertical (ascendentes,
  // descendentes) — un único recuadro fijo para las 20 dejaría a las anchas
  // cortadas o a las estrechas diminutas dentro de un hueco enorme.
  const hw = ANCHO_REAL[letra] ?? 60;
  const [topY, botY] = RANGO[letra] ?? [CAP_TOP, BASELINE];
  const margen = (conFlechas ? separacion : 0) + 25;
  const vx = CX - hw - margen, vy = topY - margen;
  const vw = hw * 2 + margen * 2, vh = (botY - topY) + margen * 2;
  const alto = Math.round((vh / vw) * anchoPx);

  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" width="${anchoPx}" height="${alto}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Modelo de la letra ${escapeHtml(letra)}"><path d="${glifo}" class="trazo-letra-modelo-real"/>${flechas}</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────
// REJILLAS REPETIDAS (05/09/2026, quinta pasada — sustituye modelo único +
// un trazo punteado + casillas en blanco)
// ─────────────────────────────────────────────────────────────────────────
// El formato anterior (un modelo grande + un trazo punteado + casillas en
// blanco para escribir libre) se pensó sin comparar con fichas reales de
// referencia para 1º sin ninguna base todavía. El usuario trajo una
// referencia real (lalibretapiruleta.com, "12VOCALES.pdf"): varias copias
// GRANDES idénticas para colorear libremente, y luego MUCHAS copias
// PEQUEÑAS punteadas seguidas para repasar una y otra vez — nada de
// casillas en blanco (eso vendría después, en un tipo de ejercicio propio
// más adelante si hace falta). Se rediseña el ejercicio para seguir ese
// mismo patrón: construirModeloSolido() para cada copia grande (sin cambios)
// y, desde el 05/09/2026 (séptima pasada), la fuente real "Cole Carreira" para
// cada copia pequeña — ver cabecera del archivo.
function construirGridModelos(letra, { cantidad = 6, anchoPx = 130 } = {}) {
  if (!cantidad || cantidad <= 0) return '';
  const celda = `<div class="trazo-letra-grid-celda">${construirModeloSolido(letra, { anchoPx })}</div>`;
  return `<div class="trazo-letra-grid-grande">${celda.repeat(cantidad)}</div>`;
}

// Rejilla pequeña punteada = texto real en la fuente "Cole Carreira"
// (public/fonts/colecarreira/, autoalojada), NO un SVG dibujado a mano. Sus
// propios glifos ya incluyen los puntos Y las 4 líneas de pauta escolar
// dibujadas dentro del propio glifo (se comprobó al procesar la fuente para
// el intento de solidificarla) — por eso no hace falta calcular aquí una
// pauta aparte: basta con poner las letras seguidas, con espaciado CERO
// entre celdas (ver .trazo-letra-grid-pequena en style.css), para que las
// líneas de cada letra encajen unas con otras y formen una pauta continua
// de principio a fin de la fila, tal cual una hoja pautada real.
function construirGridPunteado(letra, { cantidad = 12 } = {}) {
  if (!cantidad || cantidad <= 0) return '';
  const celda = `<span class="trazo-letra-fuente-punteada">${escapeHtml(letra)}</span>`;
  return `<div class="trazo-letra-grid-pequena">${celda.repeat(cantidad)}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────
// ESTILO "PAUTADO" (07/09/2026, novena pasada — variante alternativa al
// estilo "clásico" de arriba, ambas conviven). El usuario trajo 7 capturas
// reales de "Mini Mundo Infantil" con un formato distinto al que ya
// teníamos: dos letras grandes de referencia arriba (una lisa, una con
// flechas de dirección DENTRO del propio trazo) seguidas de varias filas de
// copias más pequeñas dentro de una pauta de 3 líneas, con el contorno de
// la letra punteado para repasar encima. Se adopta el LAYOUT de esas
// fichas (comparativa arriba + filas con pauta debajo) pero NO su sistema
// de flechas dentro del trazo — eso es justo lo que el usuario pidió evitar
// desde el primer día ("no pongas las flechitas... fuera de la letra"). En
// su lugar, la comparativa de arriba usa el MISMO glifo real + flechas
// FUERA de la letra ya validado (construirModeloSolido), mostrado dos
// veces: una sin flechas (para ver la forma limpia) y otra con flechas
// (para ver la dirección) — mismo sistema, solo mostrado como pareja en vez
// de una sola copia.
function construirCabeceraComparativa(letra, { anchoPx = 170 } = {}) {
  const plano = construirModeloSolido(letra, { anchoPx, conFlechas: false });
  const conFlechas = construirModeloSolido(letra, { anchoPx, conFlechas: true });
  if (!plano || !conFlechas) return '';
  return `<div class="trazo-letra-comparativa" aria-hidden="true">
    <div class="trazo-letra-comparativa-celda">${plano}</div>
    <div class="trazo-letra-comparativa-celda">${conFlechas}</div>
  </div>`;
}

// Una casilla de la rejilla de práctica: la MISMA pauta de 3 líneas que usa
// una hoja escolar real (línea superior, línea media discontinua, línea
// base) con el contorno del glifo real punteado encima, para repasar. El
// contorno reutiliza el mismo `d` de GLIFOS_REALES que usa el modelo sólido
// — trazarlo como STROKE en vez de FILL dibuja tanto el borde exterior de
// la letra como cualquier "hueco" interior (el ojo de la "o"/"e"/"a") como
// una línea punteada, que es justo lo que hace falta para repasar el
// contorno completo, sin tener que preparar un segundo dato por letra.
function construirCasillaPauta(letra, { anchoPx = 110 } = {}) {
  const glifo = GLIFOS_REALES[letra];
  if (!glifo) return '';
  const [topY, botY] = RANGO[letra] ?? [CAP_TOP, BASELINE];
  const midY = (topY + botY) / 2;
  const hw = ANCHO_REAL[letra] ?? 60;
  const margenLat = 18;
  const vx = CX - hw - margenLat, vy = topY - 6;
  const vw = hw * 2 + margenLat * 2, vh = (botY - topY) + 12;
  const alto = Math.round((vh / vw) * anchoPx);
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" width="${anchoPx}" height="${alto}" xmlns="http://www.w3.org/2000/svg">
    <line x1="${vx}" y1="${topY}" x2="${vx + vw}" y2="${topY}" class="trazo-letra-pauta-linea"/>
    <line x1="${vx}" y1="${midY}" x2="${vx + vw}" y2="${midY}" class="trazo-letra-pauta-linea-media"/>
    <line x1="${vx}" y1="${botY}" x2="${vx + vw}" y2="${botY}" class="trazo-letra-pauta-linea"/>
    <path d="${glifo}" class="trazo-letra-pauta-contorno"/>
  </svg>`;
}

// Rejilla de práctica pautada: columnas fijas (grid-template-columns, no
// flex-wrap) para que cada fila tenga SIEMPRE el número de copias pedido,
// sin depender del ancho disponible — igual que las filas de 5 en 5 de las
// fichas de referencia. column-gap:0 (ver style.css) para que las 3 líneas
// de pauta de cada celda encajen con las de al lado y formen una pauta
// continua a lo largo de toda la fila, mismo motivo que ya se aplicó a
// construirGridPunteado().
function construirGridPauta(letra, { filas = 2, columnas = 5, anchoPx = 110 } = {}) {
  if (!filas || filas <= 0 || !columnas || columnas <= 0) return '';
  const celda = construirCasillaPauta(letra, { anchoPx });
  if (!celda) return '';
  const total = filas * columnas;
  const celdas = `<div class="trazo-letra-pauta-celda">${celda}</div>`.repeat(total);
  return `<div class="trazo-letra-pauta-grid" style="grid-template-columns: repeat(${columnas}, auto);">${celdas}</div>`;
}

/**
 * Punto de entrada del módulo. `datos` viene del JSON que devuelve Claude
 * (ver construirSystemPromptLengua() en server.js):
 *   { letra, modo: 'trazo'|'modelo', estilo: 'clasico'|'pautado',
 *     repeticionesGrandes: number, repeticionesPequenas: number,
 *     filasPauta: number, columnasPauta: number }
 * (El campo `pauta` se retiró el 05/09/2026: la rejilla pequeña ya no la
 * calcula este código, la trae puesta la propia fuente — ver más arriba.)
 * `estilo` (07/09/2026, novena pasada): "clasico" (por defecto) = rejilla
 * grande sólida + rejilla pequeña en Cole Carreira, sin cambios. "pautado" =
 * comparativa de dos modelos arriba (con y sin flechas) + filas de práctica
 * con pauta de 3 líneas debajo — solo aplica en modo "trazo", se ignora en
 * modo "modelo" (no aplica en un modelo suelto).
 */
export function renderTrazoLetra(datos = {}) {
  const letra = typeof datos.letra === 'string' && datos.letra.length === 1 ? datos.letra : null;
  if (!letra || !LETRAS[letra]) {
    // Blindaje: si Claude pide una letra fuera del catálogo actual (10
    // letras × mayús/minús), no se rompe la ficha — se avisa con claridad
    // en vez de fallar en silencio o dejar un hueco vacío sin explicación.
    // (Se sigue comprobando contra el catálogo de LETRAS, no contra la
    // fuente: el modelo grande de la rejilla necesita nuestro esqueleto a
    // mano igualmente, aunque la rejilla pequeña por sí sola valdría para
    // cualquier carácter que traiga la fuente.)
    return `<p class="trazo-letra-no-disponible">⚠️ Letra "${escapeHtml(datos.letra || '')}" aún no está en el catálogo de trazo (de momento: a,e,i,o,u,m,p,l,s,t, mayúsculas y minúsculas).</p>`;
  }

  const modo = datos.modo === 'modelo' ? 'modelo' : 'trazo';

  if (modo === 'modelo') {
    // Solo un modelo grande y sólido, sin rejillas — para cuando el docente
    // solo quiere mostrar la forma de la letra, no un ejercicio de trazo. Sin
    // flechas de dirección (conFlechas:false): aquí no hay ejercicio de
    // trazo que guiar, solo se quiere ver la forma de la letra en sí.
    const modeloGrande = `<div class="trazo-letra-modelo" aria-hidden="true">${construirModeloSolido(letra, { anchoPx: 150, conFlechas: false })}</div>`;
    return `<div class="trazo-letra-bloque trazo-letra-solo-modelo">${modeloGrande}</div>`;
  }

  // Estilo "pautado" (07/09/2026, novena pasada — ver construirCabeceraComparativa
  // más arriba): comparativa de dos modelos arriba + filas de práctica con
  // pauta de 3 líneas debajo, en vez del par rejilla-grande/rejilla-Cole-Carreira
  // del estilo "clásico" (que sigue siendo el de por defecto, sin cambios).
  const estilo = datos.estilo === 'pautado' ? 'pautado' : 'clasico';

  if (estilo === 'pautado') {
    const filasPauta = Math.max(1, Math.min(6, parseInt(datos.filasPauta, 10) || 2));
    const columnasPauta = Math.max(1, Math.min(8, parseInt(datos.columnasPauta, 10) || 5));
    const cabecera = construirCabeceraComparativa(letra);
    const grid = construirGridPauta(letra, { filas: filasPauta, columnas: columnasPauta });
    return `<div class="trazo-letra-bloque trazo-letra-pautado">
      ${cabecera}
      ${grid}
    </div>`;
  }

  const repGrandes = Math.max(0, Math.min(9, parseInt(datos.repeticionesGrandes, 10) || 6));
  const repPequenas = Math.max(0, Math.min(24, parseInt(datos.repeticionesPequenas, 10) || 12));

  const gridGrande = construirGridModelos(letra, { cantidad: repGrandes, anchoPx: 130 });
  const gridPequena = construirGridPunteado(letra, { cantidad: repPequenas });

  return `<div class="trazo-letra-bloque">
    ${gridGrande}
    <p class="trazo-letra-subtitulo">Ahora repasa el trazo:</p>
    ${gridPequena}
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────
// PIPELINE DE FICHA COMPLETA (04/09/2026)
// ─────────────────────────────────────────────────────────────────────────

// Válvula de escape: para cualquier tipo de ejercicio de Lengua que todavía
// no tiene su propio tipo blindado (huecos, lectura comprensiva, relacionar,
// dictado, ordenar palabras...). Claude manda `datos.html` ya construido con
// las clases permitidas (ver construirSystemPromptLengua en server.js, son
// las mismas que usaba el SYSTEM_PROMPT legacy: .hueco, .espacio-respuesta,
// .texto-lectura, .opciones-test, .caja-espacio-dibujo, .ejercicio-lista) —
// el código YA NO tiene que fiarse de que Claude acierte la cabecera, el
// título, el pie o el envoltorio del ejercicio (eso lo pone siempre este
// módulo), solo del contenido interior de ese ejercicio en concreto. No se
// sanea/escapa (rompería el HTML a propósito) — mismo nivel de confianza
// que ya tenía todo el pipeline legacy, solo que ahora acotado a un trozo
// pequeño en vez de a la ficha entera.
function renderContenidoLibre(datos = {}) {
  return typeof datos.html === 'string' ? datos.html : '';
}

// ── Relacionar columnas (backlog Megapack Kumubox, 08/09/2026) ─────────
// Emparejar cada elemento de la columna A (sinónimos, antónimos, frases
// hechas, sustantivo↔adjetivo...) con el que le corresponde en la columna
// B. Blindaje: el orden de la columna B que se IMPRIME nunca es el mismo
// que el de la columna A que manda Claude (si las dos llegaran ya
// emparejadas en el mismo orden, el ejercicio se resolvería solo mirando
// la fila) — el propio código la desordena con una baraja determinista
// (misma entrada → mismo orden de salida, para que la ficha no cambie
// entre una vista previa y la impresión) y, si el azar deja algún
// elemento en su fila original, lo intercambia con el siguiente.
function hashTexto(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function barajaDeterminista(n, semilla) {
  const indices = Array.from({ length: n }, (_, i) => i);
  let s = (semilla % 2147483647) || 1;
  if (s < 0) s += 2147483646;
  const siguiente = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(siguiente() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  for (let i = 0; i < n; i++) {
    if (indices[i] === i && n > 1) {
      const j = (i + 1) % n;
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }
  return indices;
}

function renderRelacionar(datos) {
  const columnaA = Array.isArray(datos.columnaA) ? datos.columnaA.slice(0, 10) : [];
  const columnaB = Array.isArray(datos.columnaB) ? datos.columnaB.slice(0, 10) : [];
  const n = Math.min(columnaA.length, columnaB.length);
  if (n < 2) return '';

  const semilla = hashTexto(columnaA.slice(0, n).join('|') + '#' + columnaB.slice(0, n).join('|')) + 1;
  const orden = barajaDeterminista(n, semilla);

  const filasA = columnaA.slice(0, n).map((texto, i) => `
    <div class="relacionar-fila-a">
      <span class="relacionar-hueco"></span>
      <span class="relacionar-num">${i + 1}.</span>
      <span class="relacionar-texto">${escapeHtml(texto)}</span>
    </div>`).join('');

  const filasB = orden.map((origen, posicion) => `
    <div class="relacionar-fila-b">
      <span class="relacionar-letra">${String.fromCharCode(97 + posicion)})</span>
      <span class="relacionar-texto">${escapeHtml(columnaB[origen])}</span>
    </div>`).join('');

  return `<div class="relacionar-bloque">
    <div class="relacionar-columna">${filasA}</div>
    <div class="relacionar-columna">${filasB}</div>
  </div>`;
}

// ── Clasificar sílabas (backlog Megapack Kumubox, 08/09/2026) ──────────
// Practicar conteo/clasificación silábica de una lista de palabras. El
// sistema NO calcula el número real de sílabas de cada palabra (exigiría
// reproducir en código las reglas de división silábica del español, sin
// margen de error) — como en "crucigrama", la corrección del contenido la
// garantiza Claude; el código solo estructura el maquetado. "modo":
// "contar" deja un hueco numérico por palabra; "clasificar" añade 4
// casillas (Mono/Bi/Tri/Poli) para que el alumno marque una.
function renderClasificarSilabas(datos) {
  const palabras = Array.isArray(datos.palabras) ? datos.palabras.slice(0, 12) : [];
  if (palabras.length === 0) return '';
  const modo = datos.modo === 'clasificar' ? 'clasificar' : 'contar';

  if (modo === 'clasificar') {
    const categorias = ['Mono', 'Bi', 'Tri', 'Poli'];
    const filas = palabras.map(p => {
      const casillas = categorias.map(c => `
        <label class="cs-casilla-item"><span class="casilla-test"></span>${c}</label>`).join('');
      return `<div class="cs-fila-clasificar">
        <span class="cs-palabra">${escapeHtml(p)}</span>
        <span class="cs-casillas">${casillas}</span>
      </div>`;
    }).join('');
    return `<div class="clasificar-silabas-bloque">${filas}</div>`;
  }

  const filas = palabras.map(p => `
    <div class="cs-fila-contar">
      <span class="cs-palabra">${escapeHtml(p)}</span>
      <span class="hueco hueco-corto"></span>
    </div>`).join('');
  return `<div class="clasificar-silabas-bloque">${filas}</div>`;
}

// ── Acentuación / tildes (backlog Megapack Kumubox, 08/09/2026) ────────
// El alumno reescribe cada palabra colocando la tilde donde corresponda.
// Se imprime la palabra ya separada en sílabas (con "·") pero SIN ninguna
// tilde — el sistema nunca decide ni imprime dónde va (exigiría
// reproducir en código las reglas completas de acentuación española sin
// margen de error); en su lugar deja un hueco para que el alumno escriba
// la palabra ya acentuada correctamente.
function renderAcentuacion(datos) {
  const palabras = Array.isArray(datos.palabras) ? datos.palabras.slice(0, 14) : [];
  if (palabras.length === 0) return '';

  const filas = palabras.map(p => {
    const silabas = Array.isArray(p.silabas) && p.silabas.length > 0
      ? p.silabas.map(s => escapeHtml(s)).join('·')
      : escapeHtml(p.palabra || '');
    return `<div class="acentuacion-fila">
      <span class="acentuacion-silabas">${silabas}</span>
      <span class="hueco hueco-largo"></span>
    </div>`;
  }).join('');

  return `<div class="acentuacion-bloque">${filas}</div>`;
}

// ── Categoría gramatical (backlog Megapack Kumubox 2026, 08/09/2026) ───
// El alumno identifica la categoría gramatical (sustantivo/verbo/adjetivo/
// determinante) de una palabra dentro de una frase. El sistema NO decide
// la categoría correcta (exigiría análisis morfosintáctico completo, con
// ambigüedades reales según el contexto, ej. "canto" sustantivo o verbo) —
// Claude garantiza el contenido; el código solo resalta la palabra objetivo
// dentro de la frase (por coincidencia exacta de texto) y estructura las 4
// casillas de respuesta, mismo patrón que "clasificar_silabas" en modo
// "clasificar".
const CATEGORIAS_GRAMATICALES = ['Sustantivo', 'Verbo', 'Adjetivo', 'Determinante'];

function renderCategoriaGramatical(datos) {
  const items = Array.isArray(datos.items) ? datos.items.slice(0, 12) : [];
  if (items.length === 0) return '';

  const filas = items.map(it => {
    const palabra = String(it.palabra || '').trim();
    if (!palabra) return '';
    const frase = String(it.frase || '').trim();
    // Resalta la palabra objetivo dentro de la frase con una búsqueda de
    // texto exacta (sin regex) — si no aparece tal cual, se imprime la
    // frase sin resaltar en vez de fallar.
    let fraseHtml = '';
    if (frase) {
      const idx = frase.indexOf(palabra);
      fraseHtml = idx === -1
        ? escapeHtml(frase)
        : `${escapeHtml(frase.slice(0, idx))}<span class="cg-resaltada">${escapeHtml(palabra)}</span>${escapeHtml(frase.slice(idx + palabra.length))}`;
    }
    const casillas = CATEGORIAS_GRAMATICALES.map(c => `
      <label class="cs-casilla-item"><span class="casilla-test"></span>${c}</label>`).join('');
    return `<div class="cg-fila">
      ${fraseHtml ? `<p class="cg-frase">${fraseHtml}</p>` : ''}
      <span class="cg-palabra">${escapeHtml(palabra)}</span>
      <span class="cg-casillas">${casillas}</span>
    </div>`;
  }).join('');

  return `<div class="categoria-gramatical-bloque">${filas}</div>`;
}

// ── Formación de palabras (backlog Megapack Kumubox 2026, 08/09/2026) ──
// Clasificar palabras en simples/derivadas/compuestas. Mismo patrón que
// "clasificar_silabas" en modo "clasificar" (reutiliza directamente sus
// clases CSS, solo cambian las 3 categorías) — el sistema no verifica la
// clasificación real, la garantiza Claude.
const CATEGORIAS_FORMACION_PALABRAS = ['Simple', 'Derivada', 'Compuesta'];

function renderFormacionPalabras(datos) {
  const palabras = Array.isArray(datos.palabras) ? datos.palabras.slice(0, 14) : [];
  if (palabras.length === 0) return '';

  const filas = palabras.map(p => {
    const casillas = CATEGORIAS_FORMACION_PALABRAS.map(c => `
      <label class="cs-casilla-item"><span class="casilla-test"></span>${c}</label>`).join('');
    return `<div class="cs-fila-clasificar">
      <span class="cs-palabra">${escapeHtml(p)}</span>
      <span class="cs-casillas">${casillas}</span>
    </div>`;
  }).join('');

  return `<div class="clasificar-silabas-bloque">${filas}</div>`;
}

// ── Elección ortográfica (backlog Megapack Kumubox 2026, 08/09/2026) ───
// Completar una palabra eligiendo la letra correcta entre un cierre de
// opciones (b/v, g/j, h, ll/y...). El sistema NUNCA decide qué opción es
// correcta — Claude la garantiza; el código solo separa la palabra en el
// punto marcado con "_" e imprime el hueco y las opciones dadas.
function renderEleccionOrtografica(datos) {
  const items = Array.isArray(datos.items) ? datos.items.slice(0, 16) : [];
  if (items.length === 0) return '';

  const filas = items.map(it => {
    const palabra = String(it.palabra || '');
    if (!palabra.includes('_')) return '';
    const palabraHtml = palabra.split('_').map(p => escapeHtml(p))
      .join('<span class="hueco hueco-corto eo-hueco-inline"></span>');
    const opciones = Array.isArray(it.opciones) ? it.opciones.slice(0, 4) : [];
    const casillas = opciones.map(o => `
      <label class="cs-casilla-item"><span class="casilla-test"></span>${escapeHtml(String(o))}</label>`).join('');
    return `<div class="eo-fila">
      <span class="eo-palabra">${palabraHtml}</span>
      ${casillas ? `<span class="eo-opciones">${casillas}</span>` : ''}
    </div>`;
  }).join('');

  return `<div class="eleccion-ortografica-bloque">${filas}</div>`;
}

const RENDERERS_LENGUA_POR_TIPO = {
  trazo_letra: (datos) => renderTrazoLetra(datos),
  contenido_libre: (datos) => renderContenidoLibre(datos),
  relacionar: (datos) => renderRelacionar(datos),
  clasificar_silabas: (datos) => renderClasificarSilabas(datos),
  acentuacion: (datos) => renderAcentuacion(datos),
  categoria_gramatical: (datos) => renderCategoriaGramatical(datos),
  formacion_palabras: (datos) => renderFormacionPalabras(datos),
  eleccion_ortografica: (datos) => renderEleccionOrtografica(datos),
};

function renderEjercicioLengua(ejercicio, indice) {
  const render = RENDERERS_LENGUA_POR_TIPO[ejercicio.tipo] || RENDERERS_LENGUA_POR_TIPO.contenido_libre;
  const contenido = render(ejercicio.datos || {});
  return `<div class="ejercicio">
    <p class="enunciado"><span class="numero-ejercicio">${indice + 1}</span><span class="texto-enunciado">${escapeHtml(ejercicio.enunciado || '')}</span></p>
    ${contenido}
  </div>`;
}

/**
 * Punto de entrada del módulo para una ficha COMPLETA de Lengua Castellana.
 * Recibe el JSON pedagógico devuelto por Claude (`{ titulo, ejercicios }`,
 * ejercicios = `{ tipo, enunciado, datos }`) y el contexto del servidor
 * (curso, materia, comunidad, colegio) — mismo contrato que
 * `renderizarFichaMatematicas()` en renderer-matematicas.js. La cabecera, el
 * pie de página y la clase "curso-inicial" los decide el código a partir del
 * contexto, igual que en Matemáticas — Claude ya no tiene que acertarlos.
 */
export function renderizarFichaLengua(datosFicha, contexto) {
  const { curso, materia, comunidad, colegio } = contexto;
  const esInicial = ['1º', '2º', '3º'].includes(curso);

  // Mismo criterio tipográfico por curso que Matemáticas (05/08/2026, a
  // validar): Nunito en 1º-2º, Quicksand en 3º-4º, Andika por defecto en
  // 5º-6º — es una decisión de maquetado de la ficha en general, no
  // específica de una asignatura, así que se replica aquí tal cual.
  let claseFuente = '';
  if (['1º', '2º'].includes(curso)) claseFuente = 'fuente-nunito';
  else if (['3º', '4º'].includes(curso)) claseFuente = 'fuente-quicksand';

  const claseFicha = ['ficha', esInicial ? 'curso-inicial' : '', claseFuente]
    .filter(Boolean)
    .join(' ');

  const titulo = escapeHtml(datosFicha.titulo || `Ficha de ${materia}`);
  const ejercicios = Array.isArray(datosFicha.ejercicios) ? datosFicha.ejercicios : [];
  const cuerpoEjercicios = ejercicios.map((ej, i) => renderEjercicioLengua(ej, i)).join('');

  const lineaCentro = colegio
    ? `<p class="cabecera-centro">${escapeHtml(colegio)}</p>`
    : '';

  return `<div class="${claseFicha}">
    ${lineaCentro}
    <div class="cabecera">
      <div class="cabecera-datos">
        <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
        <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
      </div>
    </div>
    <h1 class="titulo-ficha">${titulo}</h1>
    ${cuerpoEjercicios}
    <p class="nota-pie">Ficha generada con LOMLOE · ${escapeHtml(curso)} · ${escapeHtml(materia)} · ${escapeHtml(comunidad || 'LOMLOE estatal')}</p>
  </div>`;
}
