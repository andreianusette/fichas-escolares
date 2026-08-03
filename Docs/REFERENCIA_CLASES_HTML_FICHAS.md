# REFERENCIA DE CLASES HTML — Generador de Fichas Escolares

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
  <div class="operacion-fila"><span>3 4</span></div>
  <div class="operacion-fila"><span class="op-signo">+</span><span>2 3</span></div>
  <hr class="linea-op">
  <span class="resultado-hueco">_ _</span>
</div>
```

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
tener recuadro/borde alrededor (se quitó a propósito en una iteración
anterior). Solo se ven los números, el signo, la línea horizontal de
resultado (`.linea-op`) y el hueco de resultado (`.resultado-hueco`,
visualmente debe parecer una rayita corta tipo "_ _", no un número).

---

## 9. Listas de ejercicios

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
