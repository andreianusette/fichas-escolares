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
  manzana:  '<svg width="40" height="40" viewBox="0 0 52 52"><circle cx="26" cy="32" r="17" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="18" cy="17" rx="7" ry="9" fill="none" stroke="#000" stroke-width="2" transform="rotate(-15,18,17)"/><line x1="26" y1="8" x2="26" y2="19" stroke="#000" stroke-width="2"/></svg>',
  estrella: '<svg width="40" height="40" viewBox="0 0 52 52"><polygon points="26,4 31,19 47,19 35,29 39,45 26,35 13,45 17,29 5,19 21,19" fill="none" stroke="#000" stroke-width="2"/></svg>',
  pelota:   '<svg width="40" height="40" viewBox="0 0 52 52"><circle cx="26" cy="26" r="22" fill="none" stroke="#000" stroke-width="2"/><polygon points="26,8 33,15 30,24 22,24 19,15" fill="none" stroke="#000" stroke-width="1.5"/><line x1="8" y1="21" x2="19" y2="15" stroke="#000" stroke-width="1"/><line x1="44" y1="21" x2="33" y2="15" stroke="#000" stroke-width="1"/><line x1="26" y1="44" x2="22" y2="24" stroke="#000" stroke-width="1"/></svg>',
  flor:     '<svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="10" rx="6" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="26" cy="42" rx="6" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="10" cy="26" rx="9" ry="6" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="42" cy="26" rx="9" ry="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="26" cy="26" r="8" fill="none" stroke="#000" stroke-width="2"/></svg>',
  globo:    '<svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="21" rx="15" ry="17" fill="none" stroke="#000" stroke-width="2"/><polygon points="22,38 26,46 30,38" fill="none" stroke="#000" stroke-width="2"/><line x1="26" y1="46" x2="26" y2="51" stroke="#000" stroke-width="1.5"/></svg>',
  mariposa: '<svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="14" cy="18" rx="12" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="38" cy="18" rx="12" ry="9" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="14" cy="34" rx="10" ry="8" fill="none" stroke="#000" stroke-width="2"/><ellipse cx="38" cy="34" rx="10" ry="8" fill="none" stroke="#000" stroke-width="2"/><line x1="26" y1="14" x2="26" y2="38" stroke="#000" stroke-width="2"/></svg>',
  coche:    '<svg width="40" height="40" viewBox="0 0 52 52"><rect x="4" y="22" width="44" height="18" rx="4" fill="none" stroke="#000" stroke-width="2"/><rect x="10" y="14" width="28" height="14" rx="4" fill="none" stroke="#000" stroke-width="2"/><line x1="24" y1="14" x2="24" y2="28" stroke="#000" stroke-width="1.5"/><circle cx="13" cy="40" r="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="39" cy="40" r="6" fill="none" stroke="#000" stroke-width="2"/></svg>',
  pajaro:   '<svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="26" cy="30" rx="14" ry="10" fill="none" stroke="#000" stroke-width="2"/><circle cx="35" cy="22" r="9" fill="none" stroke="#000" stroke-width="2"/><polygon points="44,22 50,20 44,25" fill="none" stroke="#000" stroke-width="1.5"/><path d="M12,30 Q4,24 6,18" stroke="#000" stroke-width="2" fill="none"/><circle cx="38" cy="20" r="1.3" fill="#000"/></svg>',
  pez:      '<svg width="40" height="40" viewBox="0 0 52 52"><ellipse cx="24" cy="26" rx="18" ry="11" fill="none" stroke="#000" stroke-width="2"/><polygon points="42,26 50,18 50,34" fill="none" stroke="#000" stroke-width="2"/><path d="M22,20 Q28,14 34,20" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="14" cy="23" r="1.3" fill="#000"/></svg>'
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
  let filas = `<div class="operacion-fila"><span class="op-signo"></span><span class="num">${escapeHtml(numeros[0])}</span></div>`;
  for (let i = 1; i < numeros.length; i++) {
    filas += `<div class="operacion-fila"><span class="op-signo">${signo}</span><span class="num">${escapeHtml(numeros[i])}</span></div>`;
  }
  filas += `<hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;

  return `<div class="operacion-columna">${filas}</div>`;
}

function renderOperacionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';

  // Caso especial: una sola operación acompañada de iconos (solo 1º/2º).
  if (operaciones.length === 1 && datos.svg && datos.svg.icono1 && datos.svg.icono2) {
    const op = operaciones[0];
    const signoVisual = op.signo === '-' ? '−' : '+';
    return `<div style="display:flex; align-items:center; gap:16px; margin:10px 0; flex-wrap:wrap;">
      <div style="display:flex; gap:5px; align-items:center;">
        ${renderIconos(datos.svg.icono1, datos.svg.cantidad1)}
        <span style="font-size:24px; font-weight:bold; color:#555;">${signoVisual}</span>
        ${renderIconos(datos.svg.icono2, datos.svg.cantidad2)}
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
  return `<div style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin:10px 0; max-width:230px; margin-left:auto; margin-right:auto;">${renderIconos(datos.icono, datos.cantidad)}</div>`;
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
    bloqueSvg = `<div style="display:flex; gap:5px; align-items:center; justify-content:center; margin-top:8px; flex-wrap:wrap;">
      ${renderIconos(datos.svg.icono1, datos.svg.cantidad1)}
      <span style="font-size:22px; font-weight:bold; color:#555;">${signoVisual}</span>
      ${renderIconos(datos.svg.icono2, datos.svg.cantidad2)}
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

  return `<p>${texto}</p><div class="espacio-respuesta"></div>`;
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

const RENDERERS_POR_TIPO = {
  operacion_vertical: (datos) => renderOperacionVertical(datos),
  conteo_svg:          (datos) => renderConteoSvg(datos),
  calculo_mental:       (datos) => renderCalculoMental(datos),
  problema:             (datos, curso) => renderProblema(datos, curso),
  tipo_test:            (datos) => renderTipoTest(datos),
  dibujo:               () => renderDibujo()
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
export function renderizarFichaMatematicas(datosFicha, contexto) {
  const { curso, materia, comunidad, colegio } = contexto;
  const esInicial = ['1º', '2º', '3º'].includes(curso);
  const claseFicha = esInicial ? 'ficha curso-inicial' : 'ficha';

  const titulo = escapeHtml(datosFicha.titulo || `Ficha de ${materia}`);
  const ejercicios = Array.isArray(datosFicha.ejercicios) ? datosFicha.ejercicios : [];
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
