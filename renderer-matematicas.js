// ─────────────────────────────────────────────────────────────────
// RENDERIZADOR DE MATEMÁTICAS
// Convierte el JSON pedagógico que devuelve Claude en el HTML/CSS
// exacto de la ficha. Esto es código determinista: el mismo JSON
// produce SIEMPRE el mismo HTML, sin depender de que el modelo
// "recuerde bien" las clases o la estructura.
// ─────────────────────────────────────────────────────────────────

// Catálogo de iconos SVG para 1º y 2º (conteo / sumas y restas ilustradas).
// SILUETEADOS a propósito: solo trazo negro, sin relleno de color. La ficha
// se imprime en blanco y negro, así que un icono a todo color se convierte
// en una mancha gris ilegible — el trazo negro se ve nítido siempre, y de
// paso el niño puede colorearlo él mismo si quiere.
// Si algún día se añaden iconos nuevos, es el ÚNICO sitio a tocar.
const ICONOS = {
  manzana:  '<svg width="60" height="60" viewBox="0 0 52 52"><circle cx="26" cy="32" r="17" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="18" cy="17" rx="7" ry="9" fill="none" stroke="#000" stroke-width="2" transform="rotate(-15,18,17)"/><line x1="26" y1="8" x2="26" y2="19" stroke="#000" stroke-width="2"/></svg>',
  estrella: '<svg width="60" height="60" viewBox="0 0 52 52"><polygon points="26,4 31,19 47,19 35,29 39,45 26,35 13,45 17,29 5,19 21,19" fill="none" stroke="#000" stroke-width="2"/></svg>',
  pelota:   '<svg width="60" height="60" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#000" stroke-width="2"/><polygon points="26,8 33,15 30,24 22,24 19,15" fill="none" stroke="#000" stroke-width="1.5"/><line x1="8" y1="21" x2="19" y2="15" stroke="#000" stroke-width="1"/><line x1="44" y1="21" x2="33" y2="15" stroke="#000" stroke-width="1"/><line x1="26" y1="44" x2="22" y2="24" stroke="#000" stroke-width="1"/></svg>',
  flor:     '<svg width="60" height="60" viewBox="0 0 52 52"><ellipse cx="26" cy="10" rx="6" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="26" cy="42" rx="6" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="10" cy="26" rx="9" ry="6" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="42" cy="26" rx="9" ry="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="26" cy="26" r="8" fill="none" stroke="#000" stroke-width="2"/></svg>',
  globo:    '<svg width="60" height="60" viewBox="0 0 52 52"><ellipse cx="26" cy="21" rx="15" ry="17" fill="none" stroke="#000" stroke-width="2"/><polygon points="22,38 26,46 30,38" fill="none" stroke="#000" stroke-width="2"/><line x1="26" y1="46" x2="26" y2="51" stroke="#000" stroke-width="1.5"/></svg>',
  mariposa: '<svg width="60" height="60" viewBox="0 0 52 52"><ellipse cx="14" cy="18" rx="12" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="38" cy="18" rx="12" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="14" cy="34" rx="10" ry="8" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="38" cy="34" rx="10" ry="8" fill="none" stroke="#000" stroke-width="2"/><line x1="26" y1="14" x2="26" y2="38" stroke="#000" stroke-width="2"/></svg>',
  coche:    '<svg width="60" height="60" viewBox="0 0 52 52"><rect x="4" y="22" width="44" height="18" rx="4" fill="none" stroke="#000" stroke-width="2"/><rect x="10" y="14" width="28" height="14" rx="4" fill="none" stroke="#000" stroke-width="2"/><line x1="24" y1="14" x2="24" y2="28" stroke="#000" stroke-width="1.5"/><circle cx="13" cy="40" r="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="39" cy="40" r="6" fill="none" stroke="#000" stroke-width="2"/></svg>',
  pajaro:   '<svg width="60" height="60" viewBox="0 0 52 52"><ellipse cx="26" cy="30" rx="14" ry="10" fill="none" stroke="#000" stroke-width="2"/><circle cx="35" cy="22" r="9" fill="none" stroke="#000" stroke-width="2"/><polygon points="44,22 50,20 44,25" fill="none" stroke="#000" stroke-width="1.5"/><path d="M12,30 Q4,24 6,18" stroke="#000" stroke-width="2" fill="none"/><circle cx="38" cy="20" r="1.3" fill="#000"/></svg>',
  pez:      '<svg width="60" height="60" viewBox="0 0 52 52"><ellipse cx="24" cy="26" rx="18" ry="11" fill="none" stroke="#000" stroke-width="2"/><polygon points="42,26 50,18 50,34" fill="none" stroke="#000" stroke-width="2"/><path d="M22,20 Q28,14 34,20" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="14" cy="23" r="1.3" fill="#000"/></svg>'
};

export const ICONOS_DISPONIBLES = Object.keys(ICONOS);

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Divide un número en parte entera y decimal para alinear por la coma.
// Acepta tanto "12.5" (JS number) como "12,5" (string ya en formato español).
function splitEnteroDecimal(numero) {
  const texto = String(numero).replace(',', '.');
  const [entero, decimal] = texto.split('.');
  return { entero, decimal: decimal || '' };
}


function renderIconos(nombreIcono, cantidad) {
  const svg = ICONOS[nombreIcono] || ICONOS.estrella;
  const n = Math.max(1, Math.min(10, parseInt(cantidad, 10) || 1));
  return svg.repeat(n);
}

// Una sola operación en columna (N sumandos o 2 términos de resta).
function renderOperacionColumna(operacion) {
  let numeros = Array.isArray(operacion.numeros) ? operacion.numeros : [];
  const esResta = operacion.signo === '-';

  // Blindaje: las restas SIEMPRE son de 2 términos, pase lo que pase en el JSON.
  if (esResta && numeros.length > 2) numeros = numeros.slice(0, 2);
  if (numeros.length < 2) return '';

  const signo = esResta ? '-' : '+';

  // Si algún número tiene decimales, usar el layout de alineación por coma
  // (columnas entero/coma/decimal) en vez del texto plano de siempre — de lo
  // contrario "12.5" y "3.75" se alinean por longitud de texto y no por la
  // coma decimal, que es donde de verdad debe alinear una resta o suma.
  const conDecimales = numeros.some(n => String(n).includes('.') || String(n).includes(','));

  if (conDecimales) {
    const ultimoIndice = numeros.length - 1;
    let filas = numeros.map((n, i) => {
      const { entero, decimal } = splitEnteroDecimal(n);
      // Convención española de columna: el signo va SOLO en el último término,
      // justo encima de la línea — no en cada sumando intermedio.
      const signoFila = i === ultimoIndice ? signo : '';
      const partDecimal = decimal
        ? `<span class="num-coma">,</span><span class="num-decimal">${escapeHtml(decimal)}</span>`
        : `<span class="num-coma"></span><span class="num-decimal"></span>`;
      return `<div class="operacion-fila-decimal"><span class="op-signo">${signoFila}</span><span class="num-entero">${escapeHtml(entero)}</span>${partDecimal}</div>`;
    }).join('');

    filas += `<hr class="linea-op linea-op-decimal">`;
    filas += `<div class="operacion-fila-decimal"><span class="op-signo"></span><span class="resultado-hueco resultado-decimal"></span></div>`;

    return `<div class="operacion-columna-decimal">${filas}</div>`;
  }

  // Igual que arriba: el signo solo va en la última fila (justo antes de la
  // línea), no en cada sumando — así es como se enseña en columna en España.
  let filas = `<div class="operacion-fila"><span class="op-signo"></span><span class="num">${escapeHtml(numeros[0])}</span></div>`;
  for (let i = 1; i < numeros.length; i++) {
    const esUltima = i === numeros.length - 1;
    const signoFila = esUltima ? signo : '';
    filas += `<div class="operacion-fila"><span class="op-signo">${signoFila}</span><span class="num">${escapeHtml(numeros[i])}</span></div>`;
  }
  filas += `<hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;

  return `<div class="operacion-columna">${filas}</div>`;
}

// Convierte a formato decimal español (coma) sin tocar el resto del texto.
function aComaEspanola(valor) {
  return String(valor).replace('.', ',');
}

// Una multiplicación en columna (multiplicando arriba, multiplicador abajo
// con signo ×). Si el multiplicador tiene 2+ cifras, se dibuja una fila en
// blanco por cada producto parcial, desplazada una posición a la izquierda
// por cada cifra (como en el algoritmo clásico), más una fila de suma final.
// Admite decimales en cualquiera de los dos términos (se muestran con coma;
// el conteo de cifras del multiplicador para las filas de producto parcial
// ignora la coma, ya que cada cifra —haya o no punto decimal— genera su
// propia fila). El sistema NUNCA calcula ni imprime el resultado — solo la
// estructura; el alumno rellena cada hueco.
function renderMultiplicacionColumna(op) {
  const numeros = Array.isArray(op.numeros) ? op.numeros : [];
  if (numeros.length < 2) return '';

  const multiplicando = aComaEspanola(numeros[0]);
  const multiplicador = aComaEspanola(numeros[1]);
  const cifrasMultiplicador = multiplicador.replace(/[^0-9]/g, '').length || 1;

  let filas = `<div class="operacion-fila"><span class="op-signo"></span><span class="num">${escapeHtml(multiplicando)}</span></div>`;
  filas += `<div class="operacion-fila"><span class="op-signo">×</span><span class="num">${escapeHtml(multiplicador)}</span></div>`;
  filas += `<hr class="linea-op">`;

  if (cifrasMultiplicador <= 1) {
    filas += `<div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
  } else {
    for (let i = 0; i < cifrasMultiplicador; i++) {
      const desplazamiento = i > 0 ? ` style="margin-right:${i}ch;"` : '';
      filas += `<div class="operacion-fila producto-parcial"${desplazamiento}><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
    }
    filas += `<hr class="linea-op">`;
    filas += `<div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
  }

  return `<div class="operacion-columna operacion-multiplicacion">${filas}</div>`;
}

// Punto de entrada de multiplicación: igual que operacion_vertical, recibe
// un array de "operaciones" y las agrupa en rejilla — así Claude puede meter
// varias multiplicaciones bajo un mismo ejercicio en vez de crear un
// ejercicio nuevo por cada cuenta (eso es lo que dejaba fichas con demasiado
// espacio en blanco).
function renderMultiplicacionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';
  const columnasHtml = operaciones.map(renderMultiplicacionColumna).join('');
  return `<div class="grid-operaciones">${columnasHtml}</div>`;
}

// Una división en columna clásica (caja): dividendo a la izquierda, divisor
// arriba a la derecha y hueco de cociente debajo. El sistema no calcula el
// resultado, solo dibuja la estructura. NO se dibuja ninguna caja para las
// restas parciales (07/08/2026: eliminada por feedback — quedaba "agresiva"
// para el alumno); el niño hace ese trabajo aparte, en su cuaderno o en el
// espacio libre alrededor. Admite decimales en dividendo y/o divisor.
// 07/08/2026 (3): rediseño de la caja — antes el "ángulo recto" se simulaba
// con DOS trazos independientes (border-right del dividendo + <hr> bajo el
// divisor), que nunca encajaban limpiamente en la esquina (quedaba como dos
// segmentos sueltos, no un ángulo continuo — feedback con captura). Ahora
// ".division-angulo" es UN SOLO elemento con border-left + border-bottom:
// el navegador dibuja la esquina como una sola pieza, sin costura visible.
function renderDivisionColumna(op) {
  const numeros = Array.isArray(op.numeros) ? op.numeros : [];
  if (numeros.length < 2) return '';

  const dividendo = aComaEspanola(numeros[0]);
  const divisor = aComaEspanola(numeros[1]);

  return `<div class="operacion-division-bloque">
    <div class="operacion-division">
      <div class="division-dividendo">${escapeHtml(dividendo)}</div>
      <div class="division-columna-derecha">
        <div class="division-angulo">
          <div class="division-divisor">${escapeHtml(divisor)}</div>
        </div>
        <div class="division-cociente"></div>
      </div>
    </div>
  </div>`;
}

// Punto de entrada de división: mismo patrón que multiplicación — array de
// "operaciones" agrupadas en rejilla.
function renderDivisionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';
  const items = operaciones.map(renderDivisionColumna).join('');
  return `<div class="grid-operaciones">${items}</div>`;
}

function renderOperacionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';

  // Caso especial: una sola operación acompañada de iconos (solo 1º/2º).
  if (operaciones.length === 1 && datos.svg && datos.svg.icono1 && datos.svg.icono2) {
    const op = operaciones[0];
    const signoVisual = op.signo === '-' ? '−' : '+';
    return `<div style="display:flex; align-items:flex-start; gap:16px; margin:10px 0; flex-wrap:wrap;">
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:260px;">${renderIconos(datos.svg.icono1, datos.svg.cantidad1)}</div>
        <span style="font-size:24px; font-weight:bold; color:#555;">${signoVisual}</span>
        <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:260px;">${renderIconos(datos.svg.icono2, datos.svg.cantidad2)}</div>
      </div>
      ${renderOperacionColumna(op)}
    </div>`;
  }

  const columnasHtml = operaciones.map(renderOperacionColumna).join('');

  // Distribución en N columnas paralelas si el docente lo pidió explícitamente.
  const n = parseInt(datos.columnasParalelas, 10);
  if (n >= 2 && n <= 4 && operaciones.length > n) {
    const porBloque = Math.ceil(operaciones.length / n);
    const bloques = [];
    for (let i = 0; i < operaciones.length; i += porBloque) {
      const grupo = operaciones.slice(i, i + porBloque).map(renderOperacionColumna).join('');
      bloques.push(`<div class="columna-bloque"><div class="grid-operaciones">${grupo}</div></div>`);
    }
    return `<div class="distribucion-columnas">${bloques.join('')}</div>`;
  }

  return `<div class="grid-operaciones">${columnasHtml}</div>`;
}

function renderConteoSvg(datos) {
  return `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin:10px 0; max-width:340px; margin-left:auto; margin-right:auto;">${renderIconos(datos.icono, datos.cantidad)}</div>`;
}

function renderCalculoMental(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  const items = operaciones
    .map(op => `<li>${escapeHtml(op.texto)} <span class="hueco hueco-corto"></span></li>`)
    .join('');
  return `<ol class="ejercicio-lista">${items}</ol>`;
}

// El formato visual del problema lo decide el CURSO (código), no Claude.
function renderProblema(datos, curso) {
  const texto = escapeHtml(datos.texto);
  const esGuiado = ['1º', '2º', '3º'].includes(curso);
  const esConDibujos = ['1º', '2º'].includes(curso);

  // Base de dibujos: en 1º/2º el niño cuenta objetos, no lee números abstractos.
  let bloqueSvg = '';
  if (esConDibujos && datos.svg && datos.svg.icono1 && datos.svg.icono2) {
    const signoVisual = datos.svg.signo === '-' ? '−' : '+';
    bloqueSvg = `<div style="display:flex; gap:8px; align-items:center; justify-content:center; margin-top:8px; flex-wrap:wrap;">
      <div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:260px;">${renderIconos(datos.svg.icono1, datos.svg.cantidad1)}</div>
      <span style="font-size:22px; font-weight:bold; color:#555;">${signoVisual}</span>
      <div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:260px;">${renderIconos(datos.svg.icono2, datos.svg.cantidad2)}</div>
    </div>`;
  }

  if (esGuiado) {
    // "datosClave" NUNCA se imprime como texto — solo dice cuántas líneas en
    // blanco dejar. Si se imprimiera el dato ya resuelto, se le estaría dando
    // al niño el ejercicio hecho (identificar los datos ES el ejercicio).
    const numDatos = Array.isArray(datos.datosClave) ? datos.datosClave.length : 2;
    const lineasDatos = Array.from({ length: Math.max(2, numDatos) })
      .map(() => `<div class="linea-datos"></div>`)
      .join('');

    return `<div class="bloque-problema">
      <div class="bloque-enunciado"><span class="etiqueta-bloque">Enunciado</span>${texto}${bloqueSvg}</div>
      <div class="bloque-datos"><span class="etiqueta-bloque">Datos</span>${lineasDatos}</div>
      <div class="bloque-operacion"><span class="etiqueta-bloque">Operación</span><div class="espacio-respuesta"></div></div>
      <div class="bloque-resultado"><span class="etiqueta-bloque">Resultado</span><div class="espacio-respuesta bajo"></div></div>
    </div>`;
  }

  // 4º-6º: formato libre, sin bloques guiados. Antes se dibujaba un recuadro
  // ".espacio-respuesta" bajo el enunciado — feedback (07/08/2026): resultaba
  // "agresivo"/tipo examen para ese tramo de edad. Ahora es solo espacio en
  // blanco reservado (".espacio-libre", sin borde ni fondo): el enunciado
  // más el hueco ya bastan, y como ".ejercicio" es redimensionable a mano
  // (ver style.css, sección de edición), el propio docente puede agrandar
  // ese hueco si el problema necesita más sitio para resolverse.
  return `<p>${texto}</p><div class="espacio-libre"></div>`;
}

function renderTipoTest(datos) {
  const opciones = Array.isArray(datos.opciones) ? datos.opciones : [];
  const letras = 'abcdefgh';
  const items = opciones
    .map((op, i) => `<div class="opcion-item"><span class="casilla-test"></span> ${letras[i] || ''}) ${escapeHtml(op)}</div>`)
    .join('');
  return `<div class="opciones-test">${items}</div>`;
}

function renderDibujo() {
  return `<div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>`;
}

// Serie numérica: array de números, con "null" en las posiciones que el
// alumno debe rellenar. Se dibuja como una cadena de burbujas conectadas
// (igual que en los libros de texto), con hueco en blanco donde toque.
function renderSerieNumerica(datos) {
  const numeros = Array.isArray(datos.numeros) ? datos.numeros : [];
  if (numeros.length === 0) return '';

  const celdas = numeros.map((n, i) => {
    const esHueco = n === null || n === undefined || n === '';
    const contenido = esHueco ? '' : escapeHtml(n);
    const flecha = i < numeros.length - 1 ? `<span class="serie-flecha">→</span>` : '';
    return `<span class="serie-celda${esHueco ? ' serie-hueco' : ''}">${contenido}</span>${flecha}`;
  }).join('');

  return `<div class="serie-numerica">${celdas}</div>`;
}

// Comparar números: pares de números con un hueco en medio para que el
// alumno escriba <, > o =.
function renderCompararNumeros(datos) {
  const pares = Array.isArray(datos.pares) ? datos.pares : [];
  if (pares.length === 0) return '';

  const filas = pares.map(p => `
    <div class="comparar-fila">
      <span class="comparar-num">${escapeHtml(p.a)}</span>
      <span class="comparar-hueco"></span>
      <span class="comparar-num">${escapeHtml(p.b)}</span>
    </div>`).join('');

  return `<div class="comparar-numeros">${filas}</div>`;
}

// Tabla de conteo y frecuencia — dos variantes según el curso:
// 1º-4º: se muestran los objetos de cada categoría (iconos para contar).
// 5º-6º: currículo real, pero sin disfraz infantil — se muestra una lista de
// datos numéricos/texto (ej. una encuesta o los resultados de tirar un
// dado) y el alumno tabula él mismo las categorías, sin ningún dibujo.
function renderTablaFrecuenciaIconos(datos) {
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  const iconosHtml = categorias
    .map(c => `<span class="tf-grupo-iconos">${renderIconos(c.icono, c.cantidad)}</span>`)
    .join('');

  const filasTabla = categorias.map(c => `
    <tr>
      <td class="tf-celda-icono">${renderIconos(c.icono, 1)}</td>
      <td class="tf-hueco"></td>
      <td class="tf-hueco"></td>
    </tr>`).join('');

  return `<div class="tabla-frecuencia-bloque">
    <div class="tabla-frecuencia-iconos">${iconosHtml}</div>
    <table class="tabla-frecuencia">
      <thead><tr><th>Figura</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
      <tbody>
        ${filasTabla}
        <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
      </tbody>
    </table>
  </div>`;
}

function renderTablaFrecuenciaNumerica(datos) {
  const registros = Array.isArray(datos.registros) ? datos.registros : [];
  if (registros.length === 0) return '';

  const listaHtml = registros.map(v => escapeHtml(v)).join(', ');

  // Categorías = valores distintos que aparecen en los datos, ordenadas —
  // el sistema las deduce de los propios datos, nunca inventa ninguna.
  const categorias = [...new Set(registros.map(v => String(v)))].sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b, 'es');
  });

  const filasTabla = categorias.map(c => `
    <tr>
      <td class="tf-celda-valor">${escapeHtml(c)}</td>
      <td class="tf-hueco"></td>
      <td class="tf-hueco"></td>
    </tr>`).join('');

  return `<div class="tabla-frecuencia-bloque">
    <p class="tf-datos-lista">${listaHtml}</p>
    <table class="tabla-frecuencia">
      <thead><tr><th>Valor</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
      <tbody>
        ${filasTabla}
        <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
      </tbody>
    </table>
  </div>`;
}

function renderTablaFrecuencia(datos, curso) {
  const esNumerica = ['5º', '6º'].includes(curso);
  return esNumerica ? renderTablaFrecuenciaNumerica(datos) : renderTablaFrecuenciaIconos(datos);
}

// Reloj analógico: dibuja una esfera con los 12 números. En modo "leer" las
// agujas ya están puestas a la hora indicada y hay un hueco debajo para que
// el alumno escriba la hora. En modo "dibujar" la esfera está vacía (sin
// agujas) para que el propio alumno las dibuje a la hora que se le pida en
// el enunciado — el sistema nunca revela el resultado en ese modo.
function renderRelojAnalogico(datos) {
  const hora = (parseInt(datos.hora, 10) || 0) % 12;
  const minuto = parseInt(datos.minuto, 10) || 0;
  const modo = datos.modo === 'dibujar' ? 'dibujar' : 'leer';

  const numeros = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const ang = (n / 12) * 2 * Math.PI - Math.PI / 2;
    const x = (55 + 42 * Math.cos(ang)).toFixed(1);
    const y = (55 + 42 * Math.sin(ang) + 3).toFixed(1);
    return `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" font-family="Arial">${n}</text>`;
  }).join('');

  let agujas = '';
  if (modo === 'leer') {
    const angMin = (minuto / 60) * 360;
    const angHora = ((hora + minuto / 60) / 12) * 360;
    const xHora = (55 + 22 * Math.sin(angHora * Math.PI / 180)).toFixed(1);
    const yHora = (55 - 22 * Math.cos(angHora * Math.PI / 180)).toFixed(1);
    const xMin = (55 + 34 * Math.sin(angMin * Math.PI / 180)).toFixed(1);
    const yMin = (55 - 34 * Math.cos(angMin * Math.PI / 180)).toFixed(1);
    agujas = `
      <line x1="55" y1="55" x2="${xHora}" y2="${yHora}" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="${xMin}" y2="${yMin}" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
  }

  const svg = `<svg width="110" height="110" viewBox="0 0 110 110">
    <circle cx="55" cy="55" r="48" fill="none" stroke="#000" stroke-width="2"/>
    ${numeros}
    ${agujas}
    <circle cx="55" cy="55" r="2.5" fill="#000"/>
  </svg>`;

  const respuesta = modo === 'leer' ? `<span class="reloj-respuesta">___ : ___</span>` : '';

  return `<div class="reloj-bloque">${svg}${respuesta}</div>`;
}

// ── Gráfico de barras ────────────────────────────────────────────────────
// Dos modos, igual de espíritu que tabla_frecuencia (icónico vs numérico):
// "leer": las barras ya están dibujadas a su altura real (proporcional al
//   valor) — el ejercicio consiste en LEER el gráfico, no en construirlo.
// "rellenar": las columnas se dejan en blanco (solo el contorno punteado) y
//   se imprime la lista de datos aparte, para que el alumno dibuje él mismo
//   cada barra a la altura correspondiente.
// La escala (eje Y) se calcula sola si no se indica "escalaMax": se redondea
// el valor máximo hacia arriba al múltiplo de 5 más cercano, con un mínimo
// de 5, para que las líneas de cuadrícula caigan en números "redondos".
// Parseo numérico defensivo: Claude en teoría siempre debe entregar "valor"
// como número JSON puro, pero si alguna vez devuelve texto con símbolo "%",
// espacios o coma decimal (ej. "35%", "12,5"), esto evita que se lea como
// NaN → 0 silenciosamente (bug real detectado 07/08/2026: un gráfico de
// quesitos con "valor": "0%" en todas las categorías se quedó sin dibujar
// ninguna porción, porque Number("0%") es NaN y el fallback era 0 para
// todas). Nunca sustituye a un prompt claro, pero es la última línea de
// defensa antes de que el gráfico simplemente desaparezca sin explicación.
function numeroDesdeJSON(valor) {
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  if (typeof valor === 'string') {
    const limpio = valor.replace(',', '.').replace(/[^0-9.\-]/g, '');
    const n = parseFloat(limpio);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function renderGraficoBarras(datos) {
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  const modoRellenar = datos.modo === 'rellenar';
  const valores = categorias.map(c => numeroDesdeJSON(c.valor));
  const valorMaximo = Math.max(...valores, 1);

  let escalaMax = numeroDesdeJSON(datos.escalaMax);
  if (escalaMax < valorMaximo) escalaMax = Math.max(5, Math.ceil(valorMaximo / 5) * 5);

  const numLineas = 5;
  const pasoValor = escalaMax / numLineas;

  const anchoBarra = 58;
  const espacioBarra = 32;
  const altoGrafico = 210;
  const margenIzq = 44;
  const margenSup = 18;
  const margenInfEtiquetas = 28;

  const anchoTotal = margenIzq + espacioBarra + categorias.length * (anchoBarra + espacioBarra);
  const altoTotal = margenSup + altoGrafico + margenInfEtiquetas;
  const yEjeX = margenSup + altoGrafico;

  let lineasGrid = '';
  let etiquetasEje = '';
  for (let i = 0; i <= numLineas; i++) {
    const y = margenSup + altoGrafico - (i / numLineas) * altoGrafico;
    const valorEtiqueta = Math.round(pasoValor * i);
    if (i > 0) {
      lineasGrid += `<line x1="${margenIzq}" y1="${y.toFixed(1)}" x2="${anchoTotal - 8}" y2="${y.toFixed(1)}" class="grafico-linea-guia"/>`;
    }
    etiquetasEje += `<text x="${margenIzq - 8}" y="${(y + 3.5).toFixed(1)}" font-size="12" text-anchor="end" font-family="Arial" fill="#64748b">${valorEtiqueta}</text>`;
  }

  let barras = '';
  let etiquetasX = '';
  let listaDatos = '';
  categorias.forEach((c, i) => {
    const x = margenIzq + espacioBarra + i * (anchoBarra + espacioBarra);
    const valor = numeroDesdeJSON(c.valor);

    if (modoRellenar) {
      barras += `<rect x="${x}" y="${margenSup}" width="${anchoBarra}" height="${altoGrafico}" class="grafico-barra-hueco" rx="3"/>`;
    } else {
      const alturaBarra = escalaMax > 0 ? (valor / escalaMax) * altoGrafico : 0;
      const yBarra = yEjeX - alturaBarra;
      barras += `<rect x="${x}" y="${yBarra.toFixed(1)}" width="${anchoBarra}" height="${alturaBarra.toFixed(1)}" class="grafico-barra" rx="3"/>`;
    }

    etiquetasX += `<text x="${x + anchoBarra / 2}" y="${yEjeX + 18}" font-size="13" text-anchor="middle" font-family="Arial" class="grafico-etiqueta-x">${escapeHtml(c.etiqueta)}</text>`;
  });

  if (modoRellenar) {
    listaDatos = `<p class="grafico-datos-lista">${categorias.map(c => `${escapeHtml(c.etiqueta)}: ${escapeHtml(c.valor)}`).join(' · ')}</p>`;
  }

  const ejeX = `<line x1="${margenIzq}" y1="${yEjeX}" x2="${anchoTotal - 8}" y2="${yEjeX}" class="grafico-eje"/>`;
  const ejeY = `<line x1="${margenIzq}" y1="${margenSup}" x2="${margenIzq}" y2="${yEjeX}" class="grafico-eje"/>`;

  const svg = `<svg width="${anchoTotal}" height="${altoTotal}" viewBox="0 0 ${anchoTotal} ${altoTotal}">
    ${lineasGrid}${ejeY}${ejeX}${etiquetasEje}${barras}${etiquetasX}
  </svg>`;

  return `<div class="grafico-barras-bloque">${listaDatos}${svg}</div>`;
}

// ── Gráfico de quesitos (circular) ──────────────────────────────────────
// Currículo real de 5º-6º, ligado a fracciones/porcentajes — Claude entrega
// valores brutos (no hace falta que sumen 100 ni que ya sean porcentajes) y
// el sistema calcula el ángulo y el porcentaje exacto de cada porción. El
// porcentaje se imprime dentro de cada porción y en la leyenda porque leer
// un ángulo a ojo no es fiable — el ejercicio pedagógico es interpretar el
// gráfico, no adivinar proporciones.
function polarACartesiano(cx, cy, r, anguloGrados) {
  const anguloRad = (anguloGrados - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(anguloRad), y: cy + r * Math.sin(anguloRad) };
}

function trazarPorcionArco(cx, cy, r, anguloInicio, anguloFin) {
  const inicio = polarACartesiano(cx, cy, r, anguloFin);
  const fin = polarACartesiano(cx, cy, r, anguloInicio);
  const arcoLargo = anguloFin - anguloInicio <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${r} ${r} 0 ${arcoLargo} 0 ${fin.x.toFixed(2)} ${fin.y.toFixed(2)} Z`;
}

function renderGraficoQuesitos(datos) {
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  const total = categorias.reduce((suma, c) => suma + numeroDesdeJSON(c.valor), 0) || 1;
  const cx = 120, cy = 120, r = 105;

  let anguloActual = 0;
  let porciones = '';
  let leyenda = '';

  categorias.forEach((c, i) => {
    const valor = numeroDesdeJSON(c.valor);
    const angulo = (valor / total) * 360;
    const porcentaje = Math.round((valor / total) * 100);
    const claseColor = `quesito-color-${(i % 6) + 1}`;

    if (angulo > 0) {
      const path = trazarPorcionArco(cx, cy, r, anguloActual, anguloActual + angulo);
      porciones += `<path d="${path}" class="quesito-porcion ${claseColor}"/>`;

      // Etiqueta de % dentro de la porción, solo si es lo bastante grande
      // para que quepa legible (evita texto amontonado en porciones diminutas).
      if (angulo > 18) {
        const medio = polarACartesiano(cx, cy, r * 0.62, anguloActual + angulo / 2);
        porciones += `<text x="${medio.x.toFixed(1)}" y="${medio.y.toFixed(1)}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle" class="quesito-texto-porcentaje">${porcentaje}%</text>`;
      }
    }
    anguloActual += angulo;

    leyenda += `<div class="quesito-leyenda-item"><span class="quesito-leyenda-color ${claseColor}"></span>${escapeHtml(c.etiqueta)} — ${porcentaje}%</div>`;
  });

  const svg = `<svg width="240" height="240" viewBox="0 0 240 240">${porciones}</svg>`;

  return `<div class="grafico-quesitos-bloque">${svg}<div class="quesito-leyenda">${leyenda}</div></div>`;
}

const RENDERERS_POR_TIPO = {
  operacion_vertical: (datos) => renderOperacionVertical(datos),
  multiplicacion_vertical: (datos) => renderMultiplicacionVertical(datos),
  division_vertical:  (datos) => renderDivisionVertical(datos),
  conteo_svg:          (datos) => renderConteoSvg(datos),
  calculo_mental:       (datos) => renderCalculoMental(datos),
  problema:             (datos, curso) => renderProblema(datos, curso),
  tipo_test:            (datos) => renderTipoTest(datos),
  dibujo:               () => renderDibujo(),
  serie_numerica:       (datos) => renderSerieNumerica(datos),
  comparar_numeros:     (datos) => renderCompararNumeros(datos),
  tabla_frecuencia:     (datos, curso) => renderTablaFrecuencia(datos, curso),
  reloj_analogico:      (datos) => renderRelojAnalogico(datos),
  grafico_barras:       (datos) => renderGraficoBarras(datos),
  grafico_quesitos:     (datos) => renderGraficoQuesitos(datos)
};

function renderEjercicio(ejercicio, indice, curso) {
  const render = RENDERERS_POR_TIPO[ejercicio.tipo];
  const contenido = render ? render(ejercicio.datos || {}, curso) : '';

  // Blindaje contra duplicación: para "problema", el texto de la historia YA
  // se imprime dentro de renderProblema() (campo "datos.texto"). Si además se
  // imprimiera "ejercicio.enunciado" tal cual, y Claude ha vuelto a escribir
  // el mismo enunciado ahí (que es lo que hace a veces), el problema aparece
  // dos veces. Por eso aquí NUNCA se usa "ejercicio.enunciado" para tipo
  // "problema" — se sustituye por una instrucción fija, decidida por código.
  const textoEncabezado = ejercicio.tipo === 'problema'
    ? 'Lee el problema y resuélvelo:'
    : ejercicio.enunciado;

  return `<div class="ejercicio">
    <p class="enunciado"><span class="numero-ejercicio">${indice + 1}</span><span class="texto-enunciado">${escapeHtml(textoEncabezado)}</span></p>
    ${contenido}
  </div>`;
}

/**
 * Punto de entrada del módulo. Recibe el JSON pedagógico devuelto por Claude
 * (solo { titulo, ejercicios: [...] }) y el contexto conocido por el servidor
 * (curso, materia, comunidad, colegio), y devuelve el HTML final de la ficha.
 * La cabecera, el pie de página y la clase "curso-inicial" los decide el
 * código a partir del contexto — Claude ya no tiene que acertarlos.
 */
// Blindaje para 1º-2º: cada operación necesita su propio dibujo, y el campo
// "svg" de un ejercicio solo puede representar UNA operación. Si el modelo
// agrupa varias operaciones en el mismo ejercicio pese a la instrucción del
// prompt, las separamos aquí en ejercicios individuales — la primera se
// queda con el "svg" original (es la que de verdad representaba), el resto
// queda sin icono en vez de desaparecer silenciosamente sin que se note.
function separarOperacionesParaDibujos(ejercicios, curso) {
  const esConDibujos = ['1º', '2º'].includes(curso);
  if (!esConDibujos) return ejercicios;

  const resultado = [];
  for (const ej of ejercicios) {
    const operaciones = ej?.datos?.operaciones;
    if (ej.tipo === 'operacion_vertical' && Array.isArray(operaciones) && operaciones.length > 1) {
      operaciones.forEach((op, idx) => {
        resultado.push({
          ...ej,
          datos: { ...ej.datos, operaciones: [op], svg: idx === 0 ? ej.datos.svg : null }
        });
      });
    } else {
      resultado.push(ej);
    }
  }
  return resultado;
}

export function renderizarFichaMatematicas(datosFicha, contexto) {
  const { curso, materia, comunidad, colegio } = contexto;
  const esInicial = ['1º', '2º', '3º'].includes(curso);

  // Familia tipográfica por curso (05/08/2026, a validar): Nunito en 1º-2º,
  // Quicksand en 3º-4º, Andika (por defecto, sin clase extra) en 5º-6º.
  // Independiente de "curso-inicial", que solo controla el tamaño.
  let claseFuente = '';
  if (['1º', '2º'].includes(curso)) claseFuente = 'fuente-nunito';
  else if (['3º', '4º'].includes(curso)) claseFuente = 'fuente-quicksand';

  const claseFicha = ['ficha', esInicial ? 'curso-inicial' : '', claseFuente]
    .filter(Boolean)
    .join(' ');

  const titulo = escapeHtml(datosFicha.titulo || `Ficha de ${materia}`);
  const ejercicios = separarOperacionesParaDibujos(
    Array.isArray(datosFicha.ejercicios) ? datosFicha.ejercicios : [],
    curso
  );
  const cuerpoEjercicios = ejercicios.map((ej, i) => renderEjercicio(ej, i, curso)).join('');

  const lineaCentro = colegio
    ? `<p class="cabecera-centro">${escapeHtml(colegio)}</p>`
    : '';

  return `<div class="${claseFicha}">
    <div class="cabecera">
      ${lineaCentro}
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
