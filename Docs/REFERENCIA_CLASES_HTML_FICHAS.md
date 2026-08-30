# REFERENCIA DE CLASES HTML — Generador de Fichas Escolares

*Sincronizado con el código el 04/08/2026: se corrigió el maquetado de las
operaciones verticales (antes usaban una tabla con una celda por dígito,
que se rompía con números de varias cifras; ahora son líneas de texto
alineadas a la derecha, ver sección 8). `server.js` y `style.css` ya
generan y estilan exactamente las clases descritas aquí.*

Este documento describe la estructura HTML que genera el motor de IA (Claude)
para cada ficha escolar. Sirve como contrato fijo entre el HTML (contenido)
y el CSS (diseño visual). Quien diseñe el CSS debe usar EXACTAMENTE estas
clases, sin renombrarlas ni inventar nuevas, para que ambas partes sigan
siendo compatibles.

Edad de los usuarios finales (alumnos): 6 a 12 años, Educación Primaria
en España. El objetivo visual es que la ficha tenga aspecto profesional,
claro y amigable para esta edad — no infantil en exceso, pero sí cálido
y fácil de leer.

---

## 1. Contenedor general

```html
<div class="ficha">
  <!-- todo el contenido de la ficha va aquí dentro -->
</div>
```
Es el contenedor raíz de toda la ficha.

---

## 2. Cabecera

```html
<div class="cabecera">
  <p><strong>Nombre:</strong> <span class="hueco hueco-nombre"></span>
     <strong>Fecha:</strong> <span class="hueco hueco-fecha"></span></p>
  <p><strong>Curso:</strong> 2º <strong>Materia:</strong> Matemáticas</p>
</div>
```
Va siempre al principio. Contiene los datos que el alumno rellena a mano
(nombre, fecha) y los datos fijos de la ficha (curso, materia).

**Actualización (30/08/2026) — nombre del centro, FUERA de `.cabecera`:**
cuando el docente indica un "Centro educativo", el nombre se pinta como
línea suelta **antes** de `.cabecera`, nunca dentro (ni dentro de
`.cabecera-datos`, que en Matemáticas es el div real que envuelve el cajón
de Nombre/Fecha) — a petición explícita de un docente, para que quede
visualmente separado del cajón de Nombre/Fecha, sin cajón propio:

```html
<p class="cabecera-centro">CEIP Santa María Magdalena</p> <!-- solo si hay centro -->
<div class="cabecera">
  <div class="cabecera-datos">
    <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
    <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
  </div>
</div>
```
Si no hay centro, se omite la línea `.cabecera-centro` por completo (nunca
"Centro:" en blanco). Blindado por código en Matemáticas
(`renderizarFichaMatematicas()`); en las otras 5 asignaturas (pipeline
legacy, HTML generado por Claude) es solo una instrucción del
`SYSTEM_PROMPT`, no garantizado por código.

---

## 3. Título de la ficha

```html
<h1 class="titulo-ficha">Sumas y restas hasta el 99</h1>
```
Título descriptivo, va justo después de la cabecera.

---

## 4. Ejercicio (contenedor de cada ejercicio individual)

```html
<div class="ejercicio">
  <p class="enunciado"><strong>Ejercicio 1.</strong> Texto de la instrucción para el alumno.</p>
  <!-- contenido específico del ejercicio (ver secciones siguientes) -->
</div>
```
Cada ficha tiene ~15 de estos, numerados en el propio texto del enunciado.

---

## 5. Huecos para rellenar (inline, dentro de una frase)

```html
<span class="hueco"></span>              <!-- hueco estándar -->
<span class="hueco hueco-largo"></span>  <!-- hueco más ancho, para palabras -->
<span class="hueco hueco-corto"></span>  <!-- hueco muy corto, para V/F o una letra -->
<span class="hueco hueco-nombre"></span> <!-- hueco ancho específico de la cabecera -->
<span class="hueco hueco-fecha"></span>  <!-- hueco específico de fecha en cabecera -->
```
Visualmente deben verse como una línea para escribir encima (estilo
"rellena el hueco"), no como una caja cerrada.

---

## 6. Espacio de respuesta (para problemas o respuestas largas)

```html
<div class="espacio-respuesta"></div>        <!-- tamaño estándar -->
<div class="espacio-respuesta bajo"></div>   <!-- más bajo, respuesta corta -->
<div class="espacio-respuesta alto"></div>   <!-- más alto, respuesta extensa -->
```
Es una caja vacía donde el alumno escribe a mano. A diferencia del
`.hueco`, SÍ debe mantener un borde/recuadro visible (es intencionado:
marca claramente la zona de escritura de un problema).

**07/08/2026 — `.espacio-libre`**: variante SIN borde ni fondo, solo reserva
altura en blanco (`<div class="espacio-libre"></div>`). Se usa en problemas
de 4º-6º (formato libre, sin bloques guiados) en vez de `.espacio-respuesta`
— feedback: el recuadro pintado resultaba "agresivo"/tipo examen para ese
tramo de edad. El docente puede ampliar aún más ese hueco arrastrando la
esquina del `.ejercicio` (ver sección de edición en `style.css`, el
ejercicio es redimensionable a mano en pantalla).

---

## 7. Tablas de ejercicio

```html
<table class="tabla-ejercicio">
  <tr><th>Número</th><th>Decenas</th><th>Unidades</th></tr>
  <tr><td>35</td><td><span class="hueco"></span></td><td><span class="hueco"></span></td></tr>
</table>
```
Tablas de datos o de relacionar conceptos. Mantienen su borde/cuadrícula
(es su función: estructurar datos), a diferencia de las operaciones
aritméticas (ver punto 8) que NO deben llevar borde.

---

## 8. Operaciones aritméticas en columna (suma/resta)

Estructura de UNA operación (siempre exactamente 2 números):

```html
<div class="operacion-columna">
  <div class="operacion-fila"><span class="op-signo"></span><span class="num">34</span></div>
  <div class="operacion-fila"><span class="op-signo">+</span><span class="num">23</span></div>
  <hr class="linea-op">
  <div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
</div>
```

El número va **entero** dentro de `.num` (nunca separado en dígitos sueltos
en celdas de tabla — así el número se alinea solo a la derecha sea de 1
cifra o de 7, sin depender de que el contenido calcule cuántas celdas
vacías hacen falta para cuadrar columnas). La primera fila SIEMPRE lleva
un `<span class="op-signo"></span>` vacío, para que el número quede
alineado en la misma columna que el de la fila con signo.

Varias operaciones agrupadas (distribución simple en rejilla):

```html
<div class="grid-operaciones">
  <div class="operacion-columna">...</div>
  <div class="operacion-columna">...</div>
  <div class="operacion-columna">...</div>
</div>
```

Distribución en columnas paralelas (cuando el docente pide "N columnas de X operaciones"):

```html
<div class="distribucion-columnas">
  <div class="columna-bloque">
    <div class="grid-operaciones">
      <div class="operacion-columna">...</div>
      <!-- X operaciones en este bloque -->
    </div>
  </div>
  <div class="columna-bloque">
    <div class="grid-operaciones">
      <div class="operacion-columna">...</div>
      <!-- X operaciones en este bloque -->
    </div>
  </div>
  <!-- tantos .columna-bloque como N -->
</div>
```

**IMPORTANTE — decisión de diseño ya tomada:** `.operacion-columna` NO debe
tener recuadro/borde alrededor. Solo se ven el número, el signo, la línea
horizontal de resultado (`.linea-op`) y el hueco de resultado
(`.resultado-hueco`, una raya de puntos bajo la línea, no una caja cerrada).

---

## 8bis0. Ilustración con objetos en operaciones de 1º-2º (`operacion_vertical` y `problema`)

En 1º-2º (`esConDibujos`), una `operacion_vertical` de una sola operación y un
`problema` llevan además un campo `datos.svg` que dibuja objetos para contar
junto a la operación en columna / dentro del enunciado. El HTML que genera
**depende del signo** — modelo corregido el 30/08/2026 tras una aclaración
de una maestra real sobre cómo se enseña de verdad la resta con apoyo
manipulativo:

**Suma** (`signo: "+"`) — un conjunto por sumando, hasta 4 (actualizado
30/08/2026, cierre de la Fase 3 — antes fijo en 2 conjuntos):
```html
<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
  <div style="...">${iconos del 1er sumando}</div>
  <span style="...">+</span>
  <div style="...">${iconos del 2º sumando}</div>
  <span style="...">+</span>
  <div style="...">${iconos del 3er sumando, si lo hay}</div>
  <!-- hasta un 4º grupo, si "op.numeros" tiene 4 elementos -->
</div>
```

**Resta** (`signo: "-"`) — UN ÚNICO conjunto de objetos, el minuendo (nunca
dos conjuntos con un signo "menos" en medio — ese formato es el de la suma,
combinar conjuntos, y aplicado a una resta enseña el concepto equivocado: la
resta es *quitar de un mismo conjunto*, no comparar dos):
```html
<div style="...">${iconos del minuendo × la cantidad real}</div>
```
El alumno tacha a mano tantos objetos como el sustraendo y cuenta los que
quedan sin tachar — el sistema nunca marca ni tacha nada por su cuenta.

**Blindaje de cantidad exacta** — `renderOperacionVertical()` en
`renderer-matematicas.js`: en `operacion_vertical`, la cantidad dibujada de
CADA grupo (sea resta o suma) nunca sale de `datos.svg.cantidadN` — se
calcula siempre a partir de los números reales de `datos.operaciones[0].
numeros` (el minuendo para la resta, cada sumando en orden para la suma).
Claude solo elige el nombre del icono de cada grupo (`icono1`..`icono4`;
si falta alguno intermedio se reutiliza `icono1`), nunca la cantidad — así
que a diferencia de versiones anteriores, `datos.svg.cantidadN` ya NO se
usa nunca en este tipo, ni para sumas ni para restas (queda actualizado
30/08/2026, cierre de la Fase 3).

En `problema` (texto libre, sin array de números del que derivar nada) sí
depende de que Claude informe cada `cantidad1`..`cantidad4` — no hay ahí
ningún otro campo numérico del que derivarlo. En ambos tipos, y para cada
grupo por separado, por encima de `UMBRAL_ICONOS_OPERACION` (10 objetos —
el mismo tope interno de `renderIconos()`, para que nunca se dibuje
silenciosamente una cantidad recortada) NO se dibuja NINGÚN grupo — mejor
sin dibujo que un dibujo a medias o con una cantidad incorrecta; el
ejercicio se queda solo con la operación en columna / el hueco de
respuesta, sin icono.

---

## 8bis. Operaciones con decimales (alineadas por la coma)

```html
<div class="operacion-columna-decimal">
  <div class="operacion-fila-decimal">
    <span class="op-signo"></span><span class="num-entero">12</span><span class="num-coma">,</span><span class="num-decimal">5</span>
  </div>
  <div class="operacion-fila-decimal">
    <span class="op-signo">+</span><span class="num-entero">3</span><span class="num-coma">,</span><span class="num-decimal">75</span>
  </div>
  <hr class="linea-op linea-op-decimal">
  <div class="operacion-fila-decimal">
    <span class="op-signo"></span><span class="resultado-hueco resultado-decimal"></span>
  </div>
</div>
```
Se usa en vez de `.operacion-columna` cuando algún número de la operación tiene
decimales. El contenedor es un grid de 4 columnas (signo / entero / coma /
decimal); cada `.operacion-fila-decimal` usa `display:contents` para que sus
`<span>` se alineen por columna con las demás filas — así la coma decimal
queda siempre en la misma posición vertical, en vez de alinear por longitud
de texto (que rompía la alineación real cuando los números tenían distinta
cantidad de decimales). `renderer-matematicas.js` decide automáticamente
cuándo usar esta variante; el motor de IA solo entrega números JSON normales
(`12.5`) y el sistema los convierte a coma española y los divide en las
columnas — nunca hay que pedirle a Claude que escriba la coma él mismo.

---

## 8ter. Multiplicación en columna

```html
<div class="grid-operaciones">
  <div class="operacion-columna operacion-multiplicacion">
    <div class="operacion-fila"><span class="op-signo"></span><span class="num">345</span></div>
    <div class="operacion-fila"><span class="op-signo">×</span><span class="num">27</span></div>
    <hr class="linea-op">
    <div class="operacion-fila producto-parcial"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
    <div class="operacion-fila producto-parcial" style="margin-right:1ch;"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
    <hr class="linea-op">
    <div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
  </div>
  <!-- varias .operacion-columna más, si el ejercicio agrupa varias multiplicaciones -->
</div>
```
Multiplicando arriba, multiplicador abajo con signo `×`. Admite decimales en
cualquiera de los dos (se muestran con coma; el conteo de cifras del
multiplicador para las filas de producto parcial ignora la coma). Si el
multiplicador tiene una sola cifra, solo hay una fila de resultado (sin
productos parciales). Si tiene 2+ cifras, hay una fila `.producto-parcial`
en blanco por cada cifra, desplazada `Nch` a la derecha (vía `margin-right`
inline) según su posición — igual que el algoritmo clásico en papel —
seguida de una línea de suma y el resultado final. El sistema nunca calcula
ni imprime ningún número de estas filas: son huecos para que el alumno los
rellene. Igual que en sumas/restas, el JSON entrega un array `"operaciones"`
para poder agrupar varias multiplicaciones bajo un mismo ejercicio (se
renderizan lado a lado dentro de `.grid-operaciones`, que ya envuelve con
salto de línea automático).

---

## 8quater. División en columna (caja clásica)

```html
<div class="grid-operaciones">
  <div class="operacion-division-bloque">
    <div class="operacion-division">
      <div class="division-dividendo">864</div>
      <div class="division-columna-derecha">
        <div class="division-angulo">
          <div class="division-divisor">4</div>
        </div>
        <div class="division-cociente"></div>
      </div>
    </div>
  </div>
  <!-- varios .operacion-division-bloque más, si el ejercicio agrupa varias divisiones -->
</div>
```
Dividendo a la izquierda, divisor arriba a la derecha dentro de
`.division-angulo` (el ángulo recto: `border-left` + `border-bottom` **en el
mismo elemento**, para que la esquina salga de una sola pieza y no como dos
trazos sueltos), y `.division-cociente` debajo, sin línea, para que el
alumno escriba el resultado. Admite decimales en dividendo y/o divisor (se
muestran con coma). `.operacion-division-bloque` envuelve la caja para que
se puedan agrupar varias divisiones lado a lado dentro de
`.grid-operaciones`, igual que en multiplicación. El sistema no dibuja los
pasos intermedios del algoritmo (serían el resultado, no la estructura).

**Historial de esta caja (07/08/2026, tres iteraciones)**:
1. Se eliminó `.division-trabajo` (área en blanco bajo la división, para
   restas parciales) — resultaba visualmente agresiva.
2. Se probó `.operacion-division { align-items: stretch }` para que la línea
   vertical del dividendo llegara hasta abajo — pero eso mismo se vio mal
   ("la barrita baja demasiado"): revertido a `flex-start`.
3. **Rediseño final**: la esquina ya no se simula con dos trazos
   independientes (antes: `border-right` en `.division-dividendo` + `<hr>`
   aparte bajo el divisor, que no encajaban limpiamente). Ahora
   `.division-angulo` es un único elemento con `border-left` +
   `border-bottom`, así el navegador dibuja el ángulo recto de una sola
   pieza (feedback con captura de pantalla: pedían "cerrar el ángulo de 90°,
   no dos segmentos").

---

## 8quinquies. Serie numérica

```html
<div class="serie-numerica">
  <span class="serie-celda">2</span><span class="serie-flecha">→</span>
  <span class="serie-celda serie-hueco"></span><span class="serie-flecha">→</span>
  <span class="serie-celda">6</span>
</div>
```
Cadena de burbujas conectadas por flechas. `.serie-hueco` (borde discontinuo,
fondo gris claro) marca las posiciones que el alumno debe rellenar.

---

## 8sexies. Comparar números

```html
<div class="comparar-numeros">
  <div class="comparar-fila">
    <span class="comparar-num">45</span>
    <span class="comparar-hueco"></span>
    <span class="comparar-num">78</span>
  </div>
</div>
```
Una fila por par, con una casilla en blanco (`.comparar-hueco`) en medio para
que el alumno escriba `<`, `>` o `=`.

---

## 8septies. Tabla de conteo y frecuencia

Dos variantes según el curso — **1º-4º** (iconos para contar) y **5º-6º**
(datos en texto, sin dibujos infantiles; currículo real de estadística).

```html
<!-- 1º-4º -->
<div class="tabla-frecuencia-bloque">
  <div class="tabla-frecuencia-iconos">…iconos de cada categoría, agrupados…</div>
  <table class="tabla-frecuencia">
    <thead><tr><th>Figura</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
    <tbody>
      <tr><td class="tf-celda-icono">…icono…</td><td class="tf-hueco"></td><td class="tf-hueco"></td></tr>
      <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
    </tbody>
  </table>
</div>

<!-- 5º-6º -->
<div class="tabla-frecuencia-bloque">
  <p class="tf-datos-lista">7, 8, 7, 9, 6, 7, 8, 9, 9, 6…</p>
  <table class="tabla-frecuencia">
    <thead><tr><th>Valor</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
    <tbody>
      <tr><td class="tf-celda-valor">6</td><td class="tf-hueco"></td><td class="tf-hueco"></td></tr>
      <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
    </tbody>
  </table>
</div>
```
En 1º-4º los iconos de cada categoría se muestran agrupados arriba (el
sistema no puede barajar píxeles para simular el "revuelto" de una ficha
editorial real). En 5º-6º se muestra la lista de datos en bruto tal cual
viene del JSON (`.tf-datos-lista`, caja con fondo gris) y las filas de la
tabla se generan a partir de los valores distintos que el propio sistema
detecta en esa lista — nunca inventa categorías, y nunca dibuja iconos ahí.
En ambos casos la tabla lleva las columnas de conteo/frecuencia y el total
completamente en blanco.

---

## 8octies. Reloj analógico

```html
<div class="reloj-bloque">
  <svg width="110" height="110" viewBox="0 0 110 110">…esfera con números y, en modo "leer", agujas…</svg>
  <span class="reloj-respuesta">___ : ___</span>
</div>
```
Dos modos: **"leer"** dibuja las agujas en la hora indicada y deja un hueco
para escribir la hora; **"dibujar"** deja la esfera vacía (solo números) para
que el alumno dibuje las agujas él mismo — nunca se imprime la respuesta.

---

## 8nonies. Gráfico de barras (07/08/2026)

```html
<!-- modo "leer": barras ya dibujadas a su altura real -->
<div class="grafico-barras-bloque">
  <svg width="…" height="…" viewBox="…">
    <line class="grafico-eje" .../>          <!-- ejes X/Y -->
    <line class="grafico-linea-guia" .../>   <!-- líneas de cuadrícula horizontales -->
    <text>…</text>                            <!-- valores del eje Y -->
    <rect class="grafico-barra" .../>         <!-- una por categoría, altura proporcional -->
    <text class="grafico-etiqueta-x">…</text> <!-- nombre de categoría bajo cada barra -->
  </svg>
</div>

<!-- modo "rellenar": columnas en blanco + lista de datos aparte -->
<div class="grafico-barras-bloque">
  <p class="grafico-datos-lista">Lunes: 3 · Martes: 6</p>
  <svg>…<rect class="grafico-barra-hueco" .../>…</svg>
</div>
```
Gráfico de barras verticales, dos modos según lo que pida el ejercicio:
- **"leer"**: `.grafico-barra` — barra sólida, altura calculada en código a
  partir del valor real y la escala del eje (nunca aproximada a ojo). Pensado
  para que el alumno interprete el gráfico, no para que lo construya.
- **"rellenar"**: `.grafico-barra-hueco` — solo el contorno punteado, sin
  altura; `.grafico-datos-lista` muestra los datos de partida en texto plano
  (igual que `.tf-datos-lista` en tabla de frecuencia) para que el alumno
  dibuje cada barra él mismo.

La escala del eje Y se calcula en código a partir del valor máximo (redondeo
al múltiplo de 5 superior) salvo que se indique una escala fija. El color de
`.grafico-barra` usa la paleta cálida (`--calido-azul`); en modo B/N pasa a
blanco con contorno negro.

---

## 8decies. Gráfico de quesitos / circular (07/08/2026)

```html
<div class="grafico-quesitos-bloque">
  <svg width="190" height="190" viewBox="0 0 190 190">
    <path class="quesito-porcion quesito-color-1" d="…"/>
    <text class="quesito-texto-porcentaje">40%</text>
    <!-- una .quesito-porcion por categoría, con su color cíclico 1-6 -->
  </svg>
  <div class="quesito-leyenda">
    <div class="quesito-leyenda-item">
      <span class="quesito-leyenda-color quesito-color-1"></span>Fútbol — 40%
    </div>
    <!-- una .quesito-leyenda-item por categoría -->
  </div>
</div>
```
Gráfico circular, **solo disponible en 5º-6º** (currículo de
fracciones/porcentajes). El ángulo y el porcentaje de cada porción se
calculan en código a partir de los valores brutos que entrega Claude — nunca
hace falta que sumen 100. El porcentaje se imprime dentro de la porción (si
es lo bastante grande para caber legible) y siempre en la leyenda, porque
leer un ángulo a ojo no es fiable: el ejercicio es interpretar el gráfico, no
adivinar proporciones.

`.quesito-color-1` a `.quesito-color-6` son la paleta cálida cíclica (si hay
más de 6 categorías, se repiten los colores). En modo B/N todas las porciones
pasan a blanco con contorno negro — la diferenciación entre categorías queda
en el porcentaje impreso y la leyenda, no en el color (limitación conocida,
inherente a un gráfico de tarta impreso sin color).

---

## 8undecies. Restas con barritas (13/08/2026)

```html
<div class="resta-barritas-bloque">
  <p class="resta-barritas-operacion">15 − 8 = <span class="hueco hueco-corto"></span></p>
  <div class="resta-barritas-grupos">
    <div class="resta-barritas-grupo">
      <span class="resta-barritas-numero">15</span>
      <div class="resta-barritas-caja">
        <span class="barrita"></span><!-- ×15, modo "tachar" -->
      </div>
    </div>
    <div class="resta-barritas-grupo">
      <span class="resta-barritas-numero">8</span>
      <div class="resta-barritas-caja">
        <span class="barrita"></span><!-- ×8 -->
      </div>
    </div>
  </div>
</div>

<!-- modo "dibujar": la caja va vacía, con contorno punteado -->
<div class="resta-barritas-caja resta-barritas-caja-vacia"></div>
```

Modelo de comparación de conjuntos (no de "tachar N de un montón de M"): dos
grupos de palotes, uno por cada término de la resta. El alumno tacha a mano
la misma cantidad en los dos grupos; lo que sobra sin tachar en el grupo
mayor es el resultado. `.resta-barritas-caja-vacia` (modo "dibujar") está en
la lista de elementos protegidos contra edición accidental en
`public/index.html` (`protegerElementosEstructurales`), igual que
`.caja-espacio-dibujo` — es una caja pensada para dibujar a mano, no para
escribir texto encima.

---

## 8duodecies. Cuadro numérico (13/08/2026)

```html
<table class="cuadro-numerico">
  <thead>
    <tr>
      <th class="cn-esquina">−</th>
      <th>9</th><th>8</th><th>7</th><th>6</th><th>5</th><th>4</th><th>3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>4</th>
      <td class="cn-celda cn-ejemplo">5</td>
      <td class="cn-celda"></td>
      <!-- ... -->
      <td class="cn-celda cn-bloqueada"></td><!-- columna(3) < fila(4): inválida -->
    </tr>
    <!-- ... -->
  </tbody>
</table>
```

Tabla de doble entrada para practicar sumas o restas. En restas, la
operación de cada celda es SIEMPRE `columna − fila` (nunca al revés) —
`renderCuadroNumerico()` en `renderer-matematicas.js` bloquea visualmente
(`.cn-bloqueada`, trama diagonal) cualquier celda donde eso daría negativo,
en vez de dejarla como si hubiera que rellenarla. `.cn-ejemplo` es una celda
opcional ya resuelta como modelo — el resultado lo calcula el propio código
a partir de `datos.ejemplo`, nunca Claude.

---

## 8tredecies. Figuras geométricas — 2D y 3D (13/08/2026)

Cuatro modos, todos dentro del tipo de ejercicio `figura_geometrica`.

**Identificar** (icono + hueco para el nombre, sin revelarlo):
```html
<div class="figura-geometrica-grid">
  <div class="figura-geometrica-tarjeta">
    <div class="figura-geometrica-icono"><svg>...</svg></div>
    <span class="hueco hueco-largo"></span>
  </div>
  <!-- una tarjeta por figura -->
</div>
```

**Propiedades** (icono CON su nombre + huecos de lados/vértices en 2D o
caras/aristas/vértices en 3D):
```html
<div class="figura-geometrica-grid">
  <div class="figura-geometrica-tarjeta figura-geometrica-tarjeta-propiedades">
    <div class="figura-geometrica-icono"><svg>...</svg></div>
    <p class="fg-nombre-figura">cubo</p>
    <div class="fg-propiedades">
      <div class="fg-propiedad-fila"><span>Caras:</span><span class="hueco hueco-corto"></span></div>
      <div class="fg-propiedad-fila"><span>Aristas:</span><span class="hueco hueco-corto"></span></div>
      <div class="fg-propiedad-fila"><span>Vértices:</span><span class="hueco hueco-corto"></span></div>
    </div>
  </div>
</div>
```

**Clasificar** (figuras sueltas arriba, sin nombre, + una caja en blanco por
grupo):
```html
<div class="figura-geometrica-clasificar">
  <div class="fg-clasificar-figuras">
    <div class="fg-clasificar-icono"><svg>...</svg></div>
    <!-- una por figura -->
  </div>
  <div class="fg-clasificar-grupos">
    <div class="fg-clasificar-grupo">
      <p class="fg-clasificar-titulo">Polígonos</p>
      <div class="espacio-respuesta"></div>
    </div>
    <!-- una por grupo -->
  </div>
</div>
```

**Perímetro y área** (solo `cuadrado` / `rectangulo` / `triangulo`, solo
4º-6º): figura dibujada a medida con las etiquetas numéricas que llegan en
`datos.medidas`, más huecos de respuesta — el sistema NUNCA calcula ni
imprime el resultado, solo la estructura.
```html
<div class="figura-geometrica-medida">
  <div class="fg-medida-svg"><svg>...rectángulo con "8 cm" / "5 cm"...</svg></div>
  <div class="fg-respuestas">
    <div class="fg-respuesta-fila"><span>Perímetro = </span><span class="hueco hueco-largo"></span></div>
    <div class="fg-respuesta-fila"><span>Área = </span><span class="hueco hueco-largo"></span></div>
  </div>
</div>
```

El catálogo de figuras (`FIGURAS_2D` / `FIGURAS_3D` en
`renderer-matematicas.js`) es independiente del catálogo `ICONOS` de conteo
(objetos para contar en 1º-2º) — comparten estilo de trazo (silueteado,
solo negro) pero significan cosas distintas: unos son "objetos para contar",
estos son "figuras curriculares con propiedades" (lados/vértices, caras/
aristas/vértices). Figuras 3D disponibles a partir de 2º (en 1º solo 2D);
modo "perimetro_area" disponible solo en 4º-6º — ver `construirSystemPromptMatematicas()` en `server.js`.

---

## 8quattuordecies. Recta numérica (13/08/2026)

```html
<div class="recta-numerica-bloque">
  <p class="recta-numerica-operacion">12 − 4 = <span class="hueco hueco-corto"></span></p>
  <div class="recta-numerica-svg">
    <svg>
      <!-- línea base 0..rangoMax, una marca + número por entero -->
      <rect class="recta-numerica-caja-inicio" .../>  <!-- resalta el número de partida -->
      <path class="recta-numerica-salto" d="..."/>    <!-- un arco por cada salto, entre "a" y el destino -->
    </svg>
  </div>
</div>
```

Recta horizontal de 0 a un máximo (`datos.rangoMax`, o calculado automáticamente con margen
si se omite), con el número de partida (`datos.operacion.a`) resaltado con una caja
(`.recta-numerica-caja-inicio`) y un arco discontinuo (`.recta-numerica-salto`) por cada salto
de la operación — hacia atrás en restas, hacia delante en sumas. Solo para sumas/restas
sencillas de un paso (1º-2º); el sistema nunca calcula ni imprime el resultado, solo deja el
hueco de la ecuación en blanco.

---

## 8quindecies. Rejilla numérica (13/08/2026)

```html
<div class="rejilla-numerica" style="grid-template-columns: repeat(5, 1fr);">
  <span class="rn-celda">2</span>
  <span class="rn-celda">4</span>
  <span class="rn-celda rn-hueco"></span>
  <!-- ... el resto de celdas, en el mismo orden que "datos.numeros" ... -->
</div>
```

Cuadrícula de números en fila×columna — la versión en rejilla de `.serie-numerica` (sección
8quinquies): mismo convenio de huecos (`null` en el JSON → `.rn-hueco` en el HTML), pero
distribuido en una cuadrícula de `datos.columnas` columnas en vez de una cadena con flechas.
Se usa para practicar conteo (de 1 en 1, de 2 en 2, de 10 en 10...) o reconocimiento de
decenas. **No confundir con `.cuadro-numerico`** (sección 8duodecies): aquella es una tabla de
sumar/restar con cabecera de fila y columna; esta es una secuencia de conteo sin cabecera ni
operación, solo números y huecos en el orden en que Claude los entrega.

**Nota (13/08/2026, aclaración del usuario)**: en 1º-2º este tipo se usa sobre todo para el
"cuadro numérico" clásico de conteo hasta 100 — cuadrícula 10×10 fija, una decena completa por
fila (0-9/10-19/.../90-99, o 1-10/11-20/.../91-100), con 2-6 huecos por fila según la
dificultad. Esa regla vive en el prompt (`construirSystemPromptMatematicas()` en `server.js`,
bloque `notaRejillaEspecifica`), no en el renderizador — el HTML/CSS de esta sección no cambia,
solo cambia qué `numeros`/`columnas` decide enviar Claude para 1º-2º frente a 3º (que sigue con
la versión libre: cualquier rango, paso y número de columnas).

---

## 8sedecies. Tabla de multiplicar (30/08/2026)

```html
<div class="tabla-multiplicar-bloque">
  <p class="tabla-multiplicar-titulo">Tabla del 3</p>
  <div class="tabla-multiplicar-columnas">
    <div class="tm-columna">
      <div class="tm-fila"><span class="tm-texto">3 × 1 =</span><span class="hueco hueco-corto"></span></div>
      <!-- ... hasta 3 × 5 ... -->
    </div>
    <div class="tm-columna">
      <div class="tm-fila"><span class="tm-texto">3 × 6 =</span><span class="hueco hueco-corto"></span></div>
      <!-- ... hasta 3 × 10 ... -->
    </div>
  </div>
</div>
```

Practicar UNA tabla de multiplicar completa (de ×1 a ×10), repartida en dos columnas de 5 filas
para que quepa cómoda en la ficha. Blindaje total: el ÚNICO dato que llega de Claude es
`datos.tabla` — las 10 filas (`N × 1` a `N × 10`) y sus resultados en blanco los genera siempre
`renderTablaMultiplicar()` en `renderer-matematicas.js`, nunca se confía en que Claude enumere o
multiplique bien. Disponible solo en 1º-2º (mismo curso que el resto de tipos con dibujos): en
1º restringido por el prompt a las tablas del 1, 2, 3, 5 y 10 (las que ya se trabajan en ese
curso, aclaración de una maestra real); en 2º cualquier tabla del 1 al 10. Esa restricción por
curso vive solo en el prompt (`construirSystemPromptMatematicas()` en `server.js`), no hay
blindaje de código que la fuerce — igual que la restricción de figuras 3D a partir de 2º.

---

## 8septendecies. Reparto (30/08/2026)

```html
<div class="reparto-bloque">
  <p class="reparto-operacion">12 : 3 = <span class="hueco hueco-corto"></span></p>
  <div class="reparto-objetos">
    <svg>...</svg><!-- ×12, un icono por objeto a repartir -->
  </div>
  <div class="reparto-grupos">
    <div class="reparto-grupo-caja"></div><!-- ×3, una caja vacía por grupo -->
  </div>
</div>
```

División como reparto manipulativo: el sistema dibuja `datos.total` objetos arriba
(`.reparto-objetos`, mismos iconos silueteados que `conteo_svg`/`operacion_vertical`) y
`datos.grupos` cajas vacías debajo (`.reparto-grupo-caja`, mismo estilo punteado que
`.resta-barritas-caja-vacia`) para que el alumno reparta a mano — dibujando o escribiendo
cuántos objetos tocan en cada caja. Deliberadamente SIN algoritmo de división en columna (para
eso está `division_vertical`, disponible a partir de 3º) y SIN resto: `renderReparto()` en
`renderer-matematicas.js` ajusta `datos.total` al múltiplo más cercano de `datos.grupos` si
Claude manda un reparto que no cuadra exacto, en vez de dibujar una situación imposible de
repartir sin sobras. Disponible en 1º-2º; el enunciado siempre debe pedir explícitamente
repartir/distribuir en grupos.

---



```html
<ol class="ejercicio-lista">
  <li>20 + <span class="hueco"></span> = 35</li>
  <li><span class="hueco"></span> + 14 = 40</li>
</ol>
```
Para ejercicios tipo "completa la serie", "verdadero o falso", "une con flechas", etc.

---

## 10. Pie de página

```html
<p class="nota-pie">Ficha generada con LOMLOE · 2º de Educación Primaria · Matemáticas · Castilla-La Mancha</p>
```
Línea final, discreta, informativa.

---

## 11. Reglas de diseño ya decididas (no cambiar el comportamiento, solo el estilo)

- **Sin recuadros en operaciones aritméticas**: decisión explícita del usuario.
- **Con recuadros en `.espacio-respuesta` y `.tabla-ejercicio`**: cumplen función de guía de escritura, se mantienen.
- **Sin ejercicios de autoevaluación ni caritas**: no aplica al CSS, es una regla de contenido.
- **Formato de impresión en A4 vertical**: el CSS de impresión (`@media print`) debe mantener el contenido dentro de A4 portrait con márgenes de 15mm verticales y 18mm horizontales, sin perder colores ni bordes al imprimir (usar `-webkit-print-color-adjust: exact` donde aplique).
- **El tamaño de letra en impresión debe controlarse por elemento, no por el contenedor `.operacion-columna` completo** — bug ya corregido una vez: si se fuerza un `font-size` grande sobre el contenedor entero, distorsiona el `letter-spacing` de `.resultado-hueco` y puede parecer un número extra al imprimir. Si Gemini toca esto, debe aplicar tamaños por separado a `.operacion-fila` y a `.resultado-hueco`.
- **Edición en vivo**: la ficha completa se muestra dentro de un contenedor con `contenteditable="true"`, así que el CSS debe funcionar bien también en ese estado (cursor visible, sin romper el layout al escribir).

---

## 12. Lo que NO debe tocar quien diseñe el CSS

- No cambiar nombres de clases existentes.
- No eliminar ni fusionar `.hueco` y `.espacio-respuesta` (son conceptualmente distintos: uno es una raya para una palabra/número corto dentro de una frase, el otro es una caja para una respuesta de problema).
- No añadir JavaScript nuevo (el frontend ya tiene su propio script para llamar a la API y gestionar el editor).
- Si necesita una clase nueva para algún elemento decorativo (iconos, fondos, etc.), debe documentarla aparte para que se pueda avisar a Claude si el HTML necesita generarla también.
