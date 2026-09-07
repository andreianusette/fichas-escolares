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

## 9B. Ampliación curricular — 14 tipos nuevos (07/09/2026)

Añadidos en una sola sesión para cubrir los sentidos de la medida, espacial, estocástico y
algebraico del RD 157/2022 que no tenían tipo propio (auditoría completa en el ROADMAP, entrada
del 07/09/2026). Todos siguen el mismo criterio del resto del fichero: código en
`renderer-matematicas.js`, nunca Claude, decide cualquier cantidad derivable o la forma de un
dibujo que tenga que "cuadrar bien". Gating por curso en `construirSystemPromptMatematicas()`
(`server.js`) — ver esa función para el detalle exacto.

### Dinero en euros
```html
<div class="dinero-bloque">
  <div class="dinero-grupos">
    <div class="dinero-grupo"><svg>...</svg><!-- ×cantidad, una moneda/billete por unidad --></div>
  </div>
  <p class="dinero-resultado">Total: <span class="hueco hueco-corto"></span> €</p>
</div>
```
Catálogo cerrado de denominaciones reales (0,01€-50€, `DENOMINACIONES_EURO`); monedas (&lt;5€)
como círculo, billetes como rectángulo. Modo `"cambio"` añade `.dinero-pagado` y
`.dinero-precio` en vez de mostrar los grupos directamente. Nunca se calcula el total/cambio.

### Proporcionalidad
```html
<table class="tabla-proporcionalidad">
  <thead><tr><th>Magnitud A</th><th>Magnitud B</th></tr></thead>
  <tbody><tr><td class="prop-celda">2</td><td class="prop-celda prop-hueco"></td></tr></tbody>
</table>
```
Columna A con los valores dados por Claude, columna B siempre vacía.

### Conversión de unidades
```html
<div class="conversion-bloque">
  <p class="conversion-ayuda">Recuerda: 1 m = 100 cm</p>
  <div class="conversion-fila"><span>3 m</span><span>=</span><span class="hueco hueco-corto"></span><span>cm</span></div>
</div>
```
`.conversion-ayuda` es una tabla de equivalencia de apoyo automática (`EQUIVALENCIAS_UNIDADES`),
solo aparece para los pares de unidades que el sistema reconoce.

### Medir con regla
```html
<div class="regla-bloque">
  <div class="regla-guia"><span class="regla-marca" style="left:0cm">0</span>...</div>
  <div class="regla-fila">
    <span class="regla-etiqueta">A)</span>
    <div class="regla-segmento" style="width:5cm;"></div>
    <span class="hueco hueco-corto"></span> cm
  </div>
</div>
```
**Importante para quien toque el CSS de impresión**: `.regla-guia` y `.regla-segmento` usan
unidades CSS físicas (`cm`), no píxeles — es la única forma de que la longitud impresa en papel
sea la longitud real. No convertir a `px` ni añadir un `transform: scale()` a estos elementos o
la regla deja de ser fiable.

### Ángulos
```html
<div class="angulos-grid">
  <div class="angulo-tarjeta">
    <svg>...<!-- vértice + semirrecta base + semirrecta al ángulo + arco --></svg>
    <p class="angulo-respuesta">Tipo: <span class="hueco hueco-corto"></span></p>
  </div>
</div>
```
Modo `"transportador"` añade una escala de 0°-180° dibujada alrededor del vértice.

### Simetría
```html
<div class="simetria-bloque">
  <svg>
    <g><!-- mitad ORIGINAL: rect .simetria-celda-llena / .simetria-celda-vacia --></g>
    <g transform="translate(...)"><!-- mitad ESPEJO: SOLO .simetria-celda-vacia, nunca llena --></g>
    <line stroke-dasharray="5,4"/><!-- eje -->
  </svg>
</div>
```
Catálogo cerrado de 4 figuras en `PATRONES_SIMETRIA` (`corazon`, `casa`, `flecha`, `copa`) sobre
una cuadrícula de 5×6 celdas. La mitad espejo NUNCA se dibuja rellena — sería la respuesta.

### Coordenadas
```html
<div class="coordenadas-bloque">
  <svg><!-- rejilla 0-10 + ejes + (modo "localizar") puntos rojos rotulados --></svg>
  <div class="coordenadas-lista"><p>A: ( <span class="hueco hueco-corto"></span> , <span class="hueco hueco-corto"></span> )</p></div>
</div>
```
Modo `"representar"`: el plano se dibuja sin ningún punto, solo la lista de coordenadas en texto.

### Probabilidad
```html
<div class="probabilidad-bloque">
  <div class="probabilidad-fila">
    <svg><!-- icono decorativo: dado/moneda/ruleta, catálogo cerrado --></svg>
    <span class="probabilidad-texto">Sacar un 7 en un dado normal</span>
    <span class="probabilidad-opciones">
      <span class="opcion-item"><span class="casilla-test"></span> Seguro</span>
      <span class="opcion-item"><span class="casilla-test"></span> Posible</span>
      <span class="opcion-item"><span class="casilla-test"></span> Imposible</span>
    </span>
  </div>
</div>
```
Reutiliza `.opcion-item`/`.casilla-test` de `tipo_test`. Modo `"ordenar"` sustituye
`.probabilidad-opciones` por un único `.probabilidad-orden.hueco`.

### Medidas de centralización
```html
<div class="medidas-centralizacion-bloque">
  <p class="mc-datos-lista">Datos: 3, 5, 5, 7, 9</p>
  <div class="mc-respuestas"><div class="mc-respuesta-fila"><span>Media = </span><span class="hueco hueco-largo"></span></div></div>
</div>
```
Mismo espíritu que `tabla_frecuencia` numérica (5º-6º): datos en bruto, nunca calculados.

### Ecuación sencilla
```html
<div class="ecuacion-sencilla-bloque">
  <div class="ecuacion-fila">
    <span class="hueco hueco-corto ecuacion-hueco"></span>
    <span class="ecuacion-signo">-</span>
    <span class="ecuacion-numero">4</span>
    <span class="ecuacion-signo">=</span>
    <span class="ecuacion-numero">8</span>
  </div>
</div>
```
El hueco puede caer en cualquiera de las tres posiciones. El número que se IMPRIME en la posición
"resultado" (cuando no es ella la incógnita) lo recalcula siempre `calcularResultadoEcuacion()`
a partir de `a`/`signo`/`b` — nunca el que mande Claude.

### Crucigrama numérico
```html
<div class="crucigrama-bloque">
  <div class="crucigrama-grid"><svg><!-- rect .crucigrama-celda-activa / -bloqueada por celda --></svg></div>
  <div class="crucigrama-pistas">
    <div class="crucigrama-lista-pistas"><p class="crucigrama-titulo-pistas">Horizontales</p><ul><li>1. 8 + 7</li></ul></div>
  </div>
</div>
```
**Ojo si se toca este bloque**: la lista de pistas usa `<ul>`, NUNCA `<ol>` — el número de pista
ya se imprime a mano dentro de cada `<li>` (`"1. 8 + 7"`), y un `<ol>` añadiría su propia
numeración automática encima, duplicándola (bug real, atrapado y corregido en esta sesión).
Rejilla máxima 10×10, calculada por código a partir de `datos.palabras` — el sistema nunca
calcula ni conoce las respuestas.

### Colorea según el resultado
```html
<div class="colorea-por-operacion-bloque">
  <div class="colorea-mosaico"><div class="colorea-celda">6 + 7</div></div>
  <div class="colorea-leyenda">
    <div class="colorea-leyenda-item"><span class="colorea-leyenda-color" style="background:#fde68a"></span><span>0–10: amarillo</span></div>
  </div>
</div>
```
El color real de cada tramo de leyenda lo asigna siempre el sistema (`PALETA_COLOREAR`, por
posición) — nunca un color libre mandado por Claude en el JSON.

### Conecta los puntos
```html
<div class="conecta-puntos-bloque">
  <svg><!-- círculo + número de texto por punto, coordenadas fijas de la plantilla --></svg>
</div>
```
Catálogo cerrado de 5 plantillas en `PLANTILLAS_CONECTA_PUNTOS` (`estrella`, `casa`, `pez`,
`cometa`, `barco`) con coordenadas fijas dentro de un lienzo de 200×200. El sistema numera los
puntos según `paso`/`inicio` — nunca dibuja líneas (las traza el alumno a mano).

### Número del día / formación del número
```html
<div class="numero-dia-bloque">
  <p class="numero-dia-trazar">14</p>
  <div class="numero-dia-marcos"><svg><!-- 10 rects .marco-diez-lleno / -vacio, marco de diez --></svg></div>
  <div class="numero-dia-iconos"><svg>...</svg><!-- ×min(numero,10), opcional --></div>
</div>
```
El número de círculos rellenos en cada marco de diez se deriva siempre de `datos.numero` (0-20,
dos marcos si pasa de 10) — nunca de un campo aparte.

---

## 9C. Segunda ampliación — sentido de la medida: masa y capacidad (07/09/2026)

Los dos candidatos que en la sección 9B quedaron como "posible ampliación futura" — implementados
el mismo día a petición del usuario. Mismo criterio de blindaje que toda la sección 9B.

### Pesar con balanza
```html
<div class="balanza-bloque">
  <div class="balanza-armazon">
    <svg class="balanza-svg">...<!-- fulcro + viga + 2 óvalos de platillo, SIEMPRE nivelada --></svg>
    <div class="balanza-platillo balanza-platillo-izq"><svg>...</svg><!-- ×cantidad --></div>
    <div class="balanza-platillo balanza-platillo-der"><svg>...</svg></div>
  </div>
  <p class="balanza-respuesta"><span class="balanza-lado-nombre">Izquierda</span><span class="hueco hueco-corto"></span><span class="balanza-lado-nombre">Derecha</span></p>
  <!-- modo "pesas": la última línea es en su lugar <p class="balanza-respuesta-pesas">Peso: <span class="hueco hueco-corto"></span></p> -->
</div>
```
**Importante si se toca el CSS**: `.balanza-armazon` es `position: relative` con ancho fijo
(280px, igual que el `viewBox` del SVG del armazón) y `.balanza-platillo` es `position: absolute`
con un `left` calculado a mano para caer bajo cada óvalo del armazón (`-17px` / `223px`) — si se
cambia el tamaño del armazón (`svgArmazonBalanza()` en `renderer-matematicas.js`) hay que
recalcular esos dos `left` a la vez, o los objetos dejan de caer dentro del platillo. Los iconos
dentro del platillo se fuerzan a 26×26px por CSS (`.balanza-platillo svg`) porque su tamaño nativo
(60×60) no cabe en un platillo de 74px de ancho.
La balanza **nunca se inclina** — ni el armazón ni el CSS tienen ninguna regla que la incline
según el contenido; es una decisión deliberada (ver comentario en `renderPesarConBalanza()`), no
un detalle pendiente de pulir.

### Medir capacidad
```html
<div class="capacidad-bloque"><!-- modo "leer": una .capacidad-tarjeta por recipiente -->
  <div class="capacidad-tarjeta">
    <span class="capacidad-etiqueta">A)</span>
    <svg><rect class="capacidad-fluido"/><!-- relleno a la altura real --><rect stroke="#000"/><!-- contorno --><!-- marcas graduadas --></svg>
    <p class="capacidad-respuesta">Contiene: <span class="hueco hueco-corto"></span> ml</p>
  </div>
</div>
<!-- modo "comparar": .capacidad-bloque.capacidad-comparar con 2 .capacidad-recipiente y un .capacidad-hueco-comparar en medio, sin .capacidad-respuesta (el hueco es el de comparar, no de lectura) -->
```
La altura del rect `.capacidad-fluido` se calcula siempre como
`alto × (nivelActual / capacidadMax)` en `svgRecipiente()` — nunca a partir de otro dato, y
`nivelActual` se acota siempre a `[0, capacidadMax]`. En blanco y negro el relleno se pinta blanco
con un borde gris fino (`stroke`) en vez de desaparecer del todo, para que la línea de nivel se
siga viendo aunque no haya color.

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

---

## 13. Trazo de letras — Lengua Castellana (04/09/2026, migrado a JSON+renderizador el mismo día)

Petición de una maestra para un niño de 1º que llega de Infantil sin base
lectoescritora: distingue las vocales al hablar pero no las relaciona con lo
escrito ni sabe trazarlas. Este tipo de ejercicio necesita precisión total
(la dirección de cada trazo tiene que ser SIEMPRE correcta), así que está
generado por código en `renderer-lengua.js` — mismo principio de blindaje
que ya usa Matemáticas.

**Pipeline de Lengua Castellana (04/09/2026)**: Lengua ya NO usa el pipeline
legacy (Claude generando HTML de ficha completa). Ahora Claude responde SOLO
con JSON (`{titulo, ejercicios:[{tipo, enunciado, datos}]}`,
`construirSystemPromptLengua()` en `server.js`) y `renderizarFichaLengua()`
en `renderer-lengua.js` construye el HTML completo — cabecera, título,
numeración de ejercicios y pie SIEMPRE por código, igual que en Matemáticas.
De momento hay un único tipo de ejercicio formalmente blindado,
`"trazo_letra"` (descrito en esta sección). Para todo lo demás (huecos,
lectura comprensiva, dictado, ordenar palabras...) existe la válvula de
escape `"contenido_libre"` (`{ "datos": { "html": "..." } }`): Claude sigue
escribiendo HTML libre, pero SOLO el contenido interior de ESE ejercicio —
nunca la cabecera, el título, el envoltorio `.ejercicio` ni el pie, que
siempre pone el código. Las clases permitidas dentro de ese HTML libre son
las mismas que usaba el `SYSTEM_PROMPT` legacy para Lengua: `.hueco` (+
variantes), `.espacio-respuesta`/`.espacio-libre`, `blockquote.texto-lectura`,
`.opciones-test`/`.casilla-test`, `.caja-espacio-dibujo`, `.tabla-ejercicio`,
`ol.ejercicio-lista` (ver secciones 5-7 y 9 de este documento), más dos
clases TEMPORALES añadidas el 05/09/2026 — `.muestra-fuente-little-days` y
`.muestra-fuente-cole-carreira` — solo para que la maestra vea esas dos
fuentes candidatas aplicadas dentro de una ficha real antes de decidir si
se adoptan para algo; a retirar (server.js, style.css) si la respuesta es
que no. Motivo de la
migración: generar toda la ficha en HTML libre cada vez era un desgaste
innecesario para Claude y no daba las garantías de blindaje que sí tiene
Matemáticas desde la Fase 2 — ver Fase 9 y la aclaración de la Fase 5 en el
ROADMAP. Según se vayan diseñando tipos propios para más ejercicios de
Lengua, cada uno saldrá de `contenido_libre` y pasará a tener su propio tipo
blindado.

**Cómo pide Claude un ejercicio de trazo**: nunca dibuja la letra ni la
describe con texto — solo decide los datos, en JSON:

```json
{ "enunciado": "Repasa la vocal a", "tipo": "trazo_letra",
  "datos": { "letra": "a", "modo": "trazo",
             "repeticionesGrandes": 6, "repeticionesPequenas": 12 } }
```

`renderTrazoLetra(datos)` (llamada internamente por `renderizarFichaLengua()`
a través de `RENDERERS_LENGUA_POR_TIPO`) construye el HTML real a partir de
esos datos — Claude nunca decide ni un punto ni una flecha.

**HTML final generado** (lo que produce `renderTrazoLetra()`, formato en
rejillas repetidas desde el 05/09/2026 — ver más abajo):

```html
<div class="trazo-letra-bloque">
  <div class="trazo-letra-grid-grande"><!-- ×data-repeticionesGrandes, todas iguales -->
    <div class="trazo-letra-grid-celda">
      <svg viewBox="0 5 140 290" width="130" height="269"><!-- construirModeloSolido() -->
        <path class="trazo-letra-modelo-trazo" d="M ..."/><!-- ×N trazos, uno por levantamiento de lápiz -->
        <circle class="trazo-letra-modelo-punto" .../><!-- solo si la letra lleva punto suelto, p.ej. la "i" -->
      </svg>
    </div>
    <!-- ...se repite data-repeticionesGrandes veces... -->
  </div>
  <p class="trazo-letra-subtitulo">Ahora repasa el trazo:</p>
  <div class="trazo-letra-grid-pequena"><!-- ×data-repeticionesPequenas, todas iguales, gap:0 a propósito -->
    <span class="trazo-letra-fuente-punteada">a</span><!-- texto real, fuente "Cole Carreira" -->
    <!-- ...se repite data-repeticionesPequenas veces, sin espacio entre celdas... -->
  </div>
</div>
```

**IMPORTANTE (05/09/2026, séptima pasada)**: el bloque de arriba ya refleja el
cambio de esa fecha — la rejilla PEQUEÑA ya no es un `<svg>` con puntos
dibujados a mano, es texto real en la fuente autoalojada "Cole Carreira".
Ver la entrada fechada más abajo ("Rejilla pequeña pasa a usar la fuente
real Cole Carreira") para el porqué y el coste aceptado (se pierden las
flechas de dirección y el número de orden de trazo en esa rejilla).

**Catálogo cerrado** (`LETRAS_TRAZO_DISPONIBLES` en `renderer-lengua.js`,
04/09/2026 — de momento vocales + consonantes más frecuentes, mayúsculas y
minúsculas): `a, e, i, o, u, m, p, l, s, t, A, E, I, O, U, M, P, L, S, T`.
Si el docente pide una letra fuera de esta lista, el sistema NO rompe la
ficha: `renderTrazoLetra()` devuelve `<p class="trazo-letra-no-disponible">`
con un aviso, en vez de un hueco vacío sin explicación. Ampliar el catálogo
(resto de consonantes) es trabajo pendiente, mismo patrón iterativo que ya
se usó con los 84 iconos y las 15 figuras geométricas — cada letra nueva hay
que verificarla visualmente (Playwright) antes de darla por buena.

**Geometría**: cada letra está dibujada a mano como "esqueleto" (la línea
que sigue el lápiz, en unidades de una rejilla propia —
`BASELINE`/`XHEIGHT_TOP`/`ASCENDER_TOP`/`DESCENDER_BOTTOM` en
`renderer-lengua.js`), NO extraída del contorno de una fuente — así se
controla con exactitud dónde empieza cada trazo y hacia dónde apunta la
flecha. Se investigó si existía ya una fuente gratuita que resolviera esto
(punteado + flecha de dirección): lo más cercano es la familia "Edu" de
Google Fonts (variantes Dots/Guides, licencia OFL), pero su propia
documentación dice que la variante con flechas de dirección sigue "en
desarrollo", no publicada, y no confirma cobertura de acentos españoles — de
ahí la decisión de construir el catálogo propio.

**Modos** (`datos.modo`, opcional):
- `"trazo"` (por defecto): las dos rejillas descritas arriba (grande para colorear + pequeña punteada para repasar).
- `"modelo"`: solo UNA copia grande y sólida, sin rejillas ni pauta — para cuando el docente solo quiere mostrar la forma de la letra, no un ejercicio de trazo. Devuelve `<div class="trazo-letra-bloque trazo-letra-solo-modelo">`.

**Rejillas repetidas en vez de casillas en blanco (05/09/2026, quinta pasada)**: el formato
original (un modelo grande + un único trazo punteado + casillas en blanco para escribir libre)
se diseñó sin comparar con una referencia real de 1º sin ninguna base todavía. El usuario trajo
una referencia real (lalibretapiruleta.com, "12VOCALES.pdf"): varias copias GRANDES idénticas
para colorear libremente ("con el color que tú quieras"), y luego MUCHAS copias PEQUEÑAS
punteadas seguidas para repasar una y otra vez — nada de casillas en blanco para escribir de
memoria (eso quedaría, si hace falta, para un tipo de ejercicio propio más adelante). Rediseñado
para seguir ese mismo patrón: `construirGridModelos()` repite `construirModeloSolido()`
tantas veces como pida `datos.repeticionesGrandes` (0-9, por defecto 6);
`construirGridPunteado()` repite una celda tantas veces como pida
`datos.repeticionesPequenas` (0-24, por defecto 12) — en esta pasada (quinta) todavía repetía
`construirSvgLetra()`, el punteado dibujado a mano; desde la séptima pasada repite en su lugar
texto real en la fuente "Cole Carreira" (ver entrada fechada más abajo). Entre ambas rejillas, un subtítulo fijo puesto por
el propio código (`<p class="trazo-letra-subtitulo">Ahora repasa el trazo:</p>`, nunca por
Claude) marca la transición, igual que la referencia distingue "repasa con el color que
quieras" de "repasa la e" con dos instrucciones. Las casillas en blanco
(`.trazo-letra-repeticiones`/`.trazo-letra-repeticion-celda`) y la fila lado a lado
(`.trazo-letra-fila`) del formato anterior se han retirado del CSS por quedar sin uso.
Verificado con Playwright (color y B/N) contra la referencia real: mismo espíritu de ejercicio
(varias copias para colorear + muchas para repasar), aunque no una copia pixel a pixel — 6
grandes + 12 pequeñas por defecto, en vez de las 6 + 21 del PDF original, para no desbordar la
página con letras más anchas del catálogo propio.

**Modelo grande = mismo esqueleto que el punteado, trazo grueso y sólido (04/09/2026, cuarta
pasada — sustituye por completo el experimento con Playwrite ES descrito antes en este documento
y ya retirado)**: el modelo grande dejó de depender de ninguna fuente externa. Se dibuja con
`construirModeloSolido(letra, {anchoPx})` en `renderer-lengua.js`, que reutiliza el MISMO
esqueleto (`LETRAS[letra]()`) que ya usa `construirSvgLetra()` para el punteado, convirtiendo cada
segmento (`line`/`arc`) en un `<path>` de SVG con comandos `M`/`L`/`A`
(`pathDeTrazo()`/`segInicio()`) y dibujándolo como trazo continuo, grueso y redondeado
(`stroke-linecap:round`, clase `.trazo-letra-modelo-trazo`) en vez de a puntos; el marcador
`{isDot:true}` de letras como la `i` se dibuja como un `<circle class="trazo-letra-modelo-punto">`
sólido. Motivo del cambio: con Playwrite ES como modelo grande, el modelo y el punteado eran
literalmente dos dibujos distintos de la misma letra (dos fuentes de verdad), lo que obligaba a
rediseñar el esqueleto letra por letra cada vez que se notaba una discrepancia (ver el historial
de `e`/`m` más abajo) — un problema que solo podía crecer según se ampliara el catálogo. Con
`construirModeloSolido()` esa inconsistencia desaparece de raíz y para siempre: modelo y trazo son
el mismo dibujo por construcción, para cualquier letra del catálogo, sin mantenimiento adicional.
Efecto colateral deseado: al dejar de usar Playwrite también desaparece su `e` minúscula (un bucle
que se auto-cruza, señalada por el usuario como "rara, como un lazo") — el modelo grande vuelve a
mostrar la `e` con la forma que sí se validó contra las referencias reales de letra escolar
española (ver "Ajuste del rabito de la `e`" más abajo). Se han retirado también, por quedar sin
uso, la letra "fantasma" invisible (el truco de ligadura de Playwrite) y el fichero de fuente
`public/fonts/playwrite-es/`.

Verificado con Playwright (color y B/N) dentro de una ficha real generada con
`renderizarFichaLengua()`: el modelo grande y el punteado son ahora el mismo gesto exacto para
cada letra probada (incluidas `e` e `i`, esta última con su punto suelto renderizado
correctamente como círculo sólido).

**Pauta escolar (retirada como campo, 05/09/2026, séptima pasada)**: hasta la sexta pasada,
`datos.pauta` (booleano) decidía si la rejilla pequeña dibujaba a mano las 4 líneas de guía.
Desde que esa rejilla usa la fuente real "Cole Carreira" (ver más abajo), el campo ya no tiene
efecto y se retiró del esquema (`server.js`) — la pauta la trae puesta cada glifo de la propia
fuente (ver esa misma entrada para el detalle). Nunca afectó a la rejilla grande — esas copias
son para colorear, no llevan pauta.

**Rabito de salida** (04/09/2026, corrección tras comparar con referencias reales de letra
escolar española): las minúsculas redondas (`a`, `e` de momento) no terminan en seco en la
línea base — el trazo sigue, sin levantar el lápiz, con un pequeño arco de enlace hacia
arriba-derecha (`colaSalida()` en `renderer-lengua.js`), el mismo trazo que en cursiva conecta
con la letra siguiente. Sin esto, las letras leían como un print genérico, no como la letra que
se enseña realmente en España. Pendiente de extender a otras minúsculas redondas del catálogo
(`o`, `u`, `m`) si hace falta.

**Ajuste del rabito de la `e` (04/09/2026, mismo día, segunda pasada)**: comparando con más
fichas de referencia, la `e` con el `colaSalida()` corto se leía como un simple círculo con un
nudo — sin suficiente "peso visual" para distinguirse de una `o`. Nueva función
`colaSalidaLarga()` en `renderer-lengua.js`: el mismo trazo (sin levantar el lápiz) se ALEJA
primero hacia la derecha con una caída notable (como la cola de un "6" invertido) y solo
entonces se riza con `colaSalida()`. Aplicada de momento solo a la `e` (única letra señalada
como "rara" en esta corrección); reutilizable para `o` si hiciera falta el mismo tratamiento
más adelante.

**Rediseño de `e` y `m` para que coincidan con el modelo grande (04/09/2026, tercera pasada,
tras cambiar el modelo a Playwrite ES)**: con el modelo grande usando Playwrite ES (ver más
abajo) apareció un problema distinto — el trazo punteado y el modelo grande dibujaban dos formas
distintas de la MISMA letra, no la misma letra en dos formatos. Se notaba sobre todo en `e`
(bucle-espiral elaborado en Playwrite vs. círculo con barra de entrada a media altura en el
esqueleto) y en `m` (Playwrite termina con un pequeño gancho de salida; el esqueleto no tenía
ninguno). Diagnosticado con una ficha real del usuario (`Lengua_1_C_010.pdf`).

Se midió la `e` de Playwrite con precisión (renderizada a tamaño grande y analizada con Python:
bounding box, altura de x, línea base) para entender su gesto real: entra por ABAJO (no por una
barra horizontal a media altura), traza un bucle ALTO y ESTRECHO (no un círculo ancho), y solo
entonces continúa en la cola larga. Nueva `e()` en `renderer-lengua.js`: bucle de `rx=34,
ry≈52.5` (antes `rx=42, ry=50`, más ancho y bajo) que empieza en el ángulo 95° (abajo, como la
`o`) en vez de con una barra desde el centro. La `m()` gana una `colaSalida()` corta (radio 13)
tras la segunda joroba, en vez de terminar en seco.

Verificado visualmente con Playwright, comparando el trazo punteado y el modelo grande uno al
lado del otro dentro de la ficha real (color y B/N): ahora ambos leen como el mismo gesto (bucle
alto + cola en la `e`; dos jorobas + gancho en la `m`), aunque no son trazos idénticos —
suficiente para no confundir al niño. **Decisión explícita del usuario**: corregir solo `e` y
`m` (las que chocaban en su ficha real) y dejar el resto del catálogo (`a, i, o, u, p, l, s, t`
y mayúsculas) para revisar más adelante si hiciera falta el mismo tratamiento.

**Cuarta corrección de la `e` (05/09/2026, sexta pasada — se recupera la barra de entrada)**: al
ver la rejilla de copias grandes y sólidas de la `e` (pasada anterior), el usuario señaló que la
forma "parece una Q", y pidió tomar como referencia la letra de la fuente "Little Days" (recién
instalada, ver LICENCIA.txt en `public/fonts/little-days/`). Comprobado: la `e` de esa fuente y
la de la ficha de referencia original (lalibretapiruleta.com) resuelven la letra con un bucle
pequeño de entrada, pero reproducir ese bucle compuesto a mano con nuestro sistema de arcos dio
formas raras en varios intentos (ver iteraciones descartadas en el historial de la sesión). Un
círculo simplemente abierto (sin barra) tampoco sirve: se lee como "C", no como "e" — lo que
distingue a la "e" de un círculo es precisamente una barra o entrada a media altura.

Se recuperó la primera versión de esta letra (barra desde el centro hasta el borde del círculo +
bucle, la que existía ANTES de intentar parecerse a Playwrite ES) — esa versión nunca recibió la
queja de "parece una Q", solo se corrigió su cola de salida (ver "Rabito de salida" más arriba,
que se conserva sin cambios). Es la construcción más simple y fiable disponible: la barra es lo
que hace que se lea sin ambigüedad como "e". El problema de fondo no era la fuente usada de
referencia, sino que las pasadas segunda y tercera habían quitado esa barra para intentar
parecerse a Playwrite (una fuente que, además, ya se retiró del proyecto en la cuarta pasada).

Verificado con Playwright (color y B/N): la `e`, tanto en la copia grande sólida como en cada
copia pequeña punteada, se lee ahora sin ambigüedad como "e"; ficha de regresión con todo el
catálogo (vocales + m,p,l,s,t, mayús/minús) confirma que nada más se vio afectado.

**Modo B/N**: totalmente soportado (`style.css`, sección 9). El modelo
grande (SVG) pasa a trazo negro, igual que siempre. La rejilla pequeña,
desde la séptima pasada, es texto en la fuente "Cole Carreira": en B/N su
`color` pasa a negro (`.trazo-letra-fuente-punteada`) — ya no hay flechas ni
número de orden que recolorear, porque esa rejilla ya no los dibuja (ver
entrada fechada más abajo). Verificado con Playwright antes de dar el tipo
por bueno (color y B/N).

El `<svg>` del modelo grande queda protegido contra edición accidental sin
tocar `public/index.html`: `protegerElementosEstructurales()` ya marca
genéricamente todo `svg` como `contenteditable="false"` (línea 247). La
rejilla pequeña, al ser texto real desde la séptima pasada (no un `<svg>`),
necesitó su propia entrada en esa misma lista (`.trazo-letra-fuente-punteada`)
para quedar igual de protegida — sin esto, el docente podría borrar o
escribir encima de las letras punteadas sin querer al editar la ficha. El
único texto editable dentro del bloque sigue siendo el subtítulo fijo "Ahora
repasa el trazo:", que pone el propio código, no Claude.

**Rejilla pequeña pasa a usar la fuente real "Cole Carreira" (05/09/2026,
séptima pasada)**: la maestra, tras ver el ejercicio de trazo con nuestro
punteado dibujado a mano, señaló que esas letras no eran la tipografía
"Little Days" que había pedido — reveló que esperaba que el ejercicio
usara directamente fuentes reales, no un sistema propio independiente.
Hablando con ella, dio un veredicto concreto sobre las dos fuentes
instaladas (ver LICENCIA.txt de cada una en `public/fonts/`): "Cole
Carreira" (que ya es una fuente de puntos, con las 4 líneas de pauta
incluidas dentro de cada glifo) funciona bien para punteado en mayúsculas,
minúsculas Y números; "Little Days" solo funciona bien en minúsculas y
números, no en mayúsculas (comprobado también por Claude renderizando el
alfabeto completo de las dos: las mayúsculas de Little Days son ornamentadas
y difíciles de leer, p.ej. la "S" se confunde con un "3").

El usuario preguntó si se podía "buscar una tipografía como la colecarreira
pero que no sea de puntos" — es decir, derivar de Cole Carreira una versión
SÓLIDA (sin puntos) para que el modelo grande y el punteado vinieran de la
MISMA fuente real, en vez de nuestro esqueleto a mano + la fuente real por
separado. Se intentó (procesado de imagen: aislar los puntos de cada glifo
descartando las líneas de pauta —anchura de componente < 100px—, y fusionar
los puntos en un trazo continuo primero con cierre morfológico de kernel
cuadrado creciente hasta 100px, después con desenfoque gaussiano + umbral).
El resultado fue desigual: minúsculas redondas (`a`, `m`) quedaban limpias y
naturales, pero mayúsculas y números de esquina cerrada (`A`, `5`) dejaban
huecos sin cerrar o exigían un grosor desproporcionado — habría hecho falta
ajustar carácter por carácter, con calidad desigual entre letras, para
completar un alfabeto entero. Mostradas las pruebas concretas al usuario
(imagen de comparación), decidió NO seguir por esa vía.

**Decisión final**: en vez de una fuente derivada, se separan las dos
rejillas por primera vez desde que existen. La rejilla GRANDE (modelo
sólido para colorear) sigue con nuestro esqueleto a mano
(`construirModeloSolido()`, sin cambios) — control total, cualquier letra
del catálogo, sin depender de que una fuente "cierre bien" al solidificarla.
La rejilla PEQUEÑA (punteado para repasar) pasa a usar texto real de "Cole
Carreira" directamente (`construirGridPunteado()` ya no llama a
`construirSvgLetra()`, que se ha retirado del código junto con
`sampleStroke()`/`arrowMarker()`/`segLength()`/`pointOnSeg()`, sin más uso).
Como cada glifo de la fuente ya trae dentro un tramo de las 4 líneas de
pauta escolar, basta con poner las celdas SIN separación
(`.trazo-letra-grid-pequena { gap: 0 }`) para que esos tramos encajen entre
sí y formen una pauta continua a lo largo de toda la fila — comprobado
visualmente con mayúsculas, minúsculas y un número de prueba, sin huecos.

**Coste aceptado explícitamente por el usuario**: la rejilla pequeña pierde
las flechas de dirección y el número de orden de trazo que sí tenía el
punteado dibujado a mano (los puntos de una fuente no llevan esa
información). Se le preguntó específicamente antes de aplicarlo y prefirió
la fuente real de todos modos. `server.js` avisa a Claude de esto en la
descripción del tipo, por si un docente pide explícitamente "que se vea el
orden" o "con flechas" — en ese caso Claude debe decirlo en el enunciado, no
inventar una alternativa.

**De paso, corregido un defecto ya existente**: `o()`/`O()` dibujaban el
círculo completo con un único arco SVG de 360° (`sweepDeg: -360`) —
un comando `A` de SVG no puede representar una elipse completa cuando el
punto de inicio y el de fin coinciden (caso degenerado): el navegador no
dibujaba nada. No se notaba con el punteado anterior (los puntos se
calculaban muestreando el arco directamente, no con comandos SVG reales),
pero sí afectaba al modelo grande sólido (`construirModeloSolido`/
`pathDeTrazo`, que sí genera comandos `A`): la "o"/"O" grande quedaba
invisible en toda ficha generada hasta ahora. Corregido partiendo el
círculo en dos arcos de 180° (mismo trazo, sin levantar el lápiz) — no
relacionado con el cambio de fuente, encontrado durante la verificación de
regresión de esta misma pasada.

Verificado con Playwright (color y B/N): ficha de regresión con las 20
letras del catálogo completo, comprobando que la rejilla pequeña tiene pauta
continua para cada una (incluidas mayúsculas) y que la "o"/"O" grande ya es
visible.
