# RESUMEN DE ARRANQUE — Generador de Fichas Escolares IA

*Genera este documento al cierre de una sesión larga en Claude.ai, para que
el siguiente hilo se ponga al día sin tener que leer la conversación
completa. Adjúntalo al nuevo chat junto con los 3 documentos de `Docs/`
que se listan abajo.*

---

## 1. Qué leer, y en qué orden

Adjunta estos archivos al nuevo hilo (todos viven en `Docs/` dentro del
repo):

1. **Este documento** — arranque rápido y qué cambió en la última sesión.
2. **`CONTEXTO_FICHAS_ESCOLARES.md`** — visión de producto, arquitectura,
   modelo de negocio. Cambia poco entre sesiones. ⚠️ tiene partes
   desactualizadas desde la arquitectura JSON+renderizador — no dar por
   buenas a ciegas sus secciones 4 y 10 (ver aviso al principio del propio
   documento).
3. **`ROADMAP_FICHAS_ESCOLARES.md`** — el documento vivo de verdad. Tiene
   el detalle completo de cada fase, decisiones tomadas y por qué, y
   checklists. Si algo de este resumen y el roadmap no coinciden, **manda
   el roadmap**, es la fuente de verdad.
4. Si se va a tocar CSS/maquetación o a añadir/depurar tipos de ejercicio de
   Matemáticas: **`REFERENCIA_CLASES_HTML_FICHAS.md`** (contrato de clases
   HTML — ya incluye las 5 secciones de los tipos de ejercicio nuevos de
   esta sesión, 8undecies a 8quindecies).

Además, sube los archivos de código actuales tal cual están en tu carpeta
local (`server.js`, `public/index.html`, `public/style.css`,
`renderer-matematicas.js`) — no asumas que el resumen contiene el código
línea por línea.

**Repositorio**: `https://github.com/andreianusette/fichas-escolares`
(se puede clonar/leer directamente sin subir archivos, si la sesión nueva
tiene acceso a herramientas de terminal/bash). Todo lo de esta sesión ya
está subido (último push: `8c183ab..10bc3d8` en `master`).

---

## 2. Estado del proyecto en una frase

App funcionando en local (`node server.js` + `localhost:3000`), con
Matemáticas en un motor determinista (JSON + `renderer-matematicas.js`)
que ya cubre **13 tipos de ejercicio** (los originales — operaciones,
conteo, problemas, gráficos, reloj... — más los 5 añadidos hoy: resta con
barritas, cuadro numérico de sumar/restar, figuras geométricas 2D/3D,
recta numérica y rejilla numérica de conteo), maquetación bastante pulida,
catálogo propio de 84 iconos SVG de conteo + 15 figuras geométricas nuevas
(9 en 2D, 6 en 3D). Sin desplegar todavía. Fase activa: **Fase 3**
(validación curso a curso, ahora con bastante más superficie que validar
que al cierre de la sesión anterior).

---

## 3. Qué se hizo en la última sesión (13/08/2026)

Sesión centrada en ampliar el catálogo de tipos de ejercicio de
Matemáticas, a partir de fichas de referencia (Santillana y otras fuentes)
que el usuario fue adjuntando — en ningún caso se copió texto ni
ilustraciones de esas fichas, solo el patrón pedagógico general.

**Cinco tipos de ejercicio nuevos** (todos en `renderer-matematicas.js` +
bloques condicionales por curso en `construirSystemPromptMatematicas()` de
`server.js`; documentados en `REFERENCIA_CLASES_HTML_FICHAS.md`):

- **`resta_barritas`** (1º-2º): resta con modelo de comparación de
  conjuntos — dos grupos de palotes que el alumno tacha a mano. Modo
  "tachar" (palotes ya dibujados) y modo "dibujar" (cajas vacías).
- **`cuadro_numerico`** (1º-3º): tabla de doble entrada de sumar o restar
  (cabecera de fila/columna con números, celdas en blanco). En resta, la
  operación es siempre columna − fila; las celdas inválidas se bloquean
  visualmente. Admite una celda "ejemplo" ya resuelta como modelo.
- **`figura_geometrica`** (todos los cursos, 4 modos: identificar,
  propiedades, clasificar, perímetro/área): catálogo nuevo de 9 figuras 2D
  y 6 cuerpos 3D. Figuras 3D desde 2º; modo "perimetro_area" solo 4º-6º,
  limitado a cuadrado/rectángulo/triángulo. ⚠️ feedback del usuario: el
  trazo de estas figuras "queda un poco raro" — pendiente de rediseño (ver
  sección 5).
- **`recta_numerica`** (1º-2º): recta de 0 a un máximo con el número de
  partida resaltado y arcos marcando los saltos de la operación — solo
  sumas/restas sencillas de un solo paso.
- **`rejilla_numerica`** (1º-3º): cuadrícula de números en fila×columna
  para practicar conteo. **En 1º-2º se afinó para ser específicamente el
  "cuadro numérico" clásico**: cuadrícula 10×10 fija, una decena completa
  por fila (variante 0-99 o 1-100), con 2-3 huecos por fila por defecto
  (menos en fichas de inicio de curso, más en repaso avanzado). **En 3º
  sigue siendo libre** (cualquier rango/paso/columnas) — el usuario
  confirmó que esa versión ya funcionaba bien y no se tocó.
  ⚠️ **No confundir `cuadro_numerico` con `rejilla_numerica`**: son tipos
  distintos en el sistema aunque el usuario se refirió a ambos como
  "cuadro numérico" al pedirlos — uno es tabla de operación, el otro es
  secuencia de conteo sin operación.

**Metodología seguida**: cada tipo se probó con JSON simulado a mano
(sin gastar ninguna llamada a la API en toda la sesión) y se verificó
visualmente renderizando el HTML+CSS real con Playwright y capturando
pantalla — en color y en modo blanco/negro. Así se detectó y corrigió un
bug real: el símbolo de la esquina de `cuadro_numerico` quedaba blanco
sobre blanco (ilegible) en modo B/N.

**Todo subido a GitHub** al cierre de la sesión (`git add . && git commit
&& git push`, commit `8c183ab..10bc3d8`).

---

## 4. Siguiente paso sugerido (según el propio roadmap)

Ninguno de los 5 tipos nuevos se ha probado todavía con una llamada real a
la API — solo con datos simulados a mano. El siguiente paso es exactamente
eso: generar fichas reales de 1º, 3º y 5º que fuercen la aparición de los
tipos nuevos, exportarlas a PDF e inspeccionarlas visualmente (metodología
habitual del proyecto, ver sección 5).

### Prompts de prueba ya preparados (pegar en "Instrucciones especiales")

**Ficha 1º — tanda A** (`resta_barritas`, `cuadro_numerico`,
`figura_geometrica` 2D):
```
Genera exactamente 7 ejercicios, uno de cada tipo descrito aquí, en este orden, sin añadir ninguno más:
1. Una resta representada con dos grupos de barritas YA DIBUJADAS que el alumno debe tachar para calcular el resultado (por ejemplo 15 - 8).
2. Una resta representada con dos grupos de barritas VACÍOS, para que el propio alumno dibuje las barritas antes de tachar (por ejemplo 12 - 5).
3. Un cuadro numérico (tabla de doble entrada) de restas, con una celda ya resuelta como ejemplo.
4. Un cuadro numérico (tabla de doble entrada) de sumas.
5. Un ejercicio de identificar y escribir el nombre de varias figuras geométricas planas (triángulo, cuadrado, círculo, rectángulo, hexágono).
6. Un ejercicio de contar los lados y los vértices de varias figuras geométricas planas.
7. Un ejercicio de clasificar varias figuras geométricas planas en dos grupos, por ejemplo "Polígonos" y "Figuras curvas".
```

**Ficha 1º — tanda B** (`recta_numerica`, `rejilla_numerica` clásica):
```
Genera exactamente 4 ejercicios, uno de cada tipo descrito aquí, en este orden, sin añadir ninguno más:
1. Una recta numérica para calcular una resta sencilla de un solo paso (por ejemplo 13 - 6), con la recta de 0 a 19.
2. Una recta numérica para calcular una suma sencilla de un solo paso (por ejemplo 7 + 6).
3. Un cuadro numérico clásico del 0 al 99 (cuadrícula 10x10, una decena por fila) para empezar curso, con pocos huecos.
4. Un cuadro numérico clásico del 1 al 100 (cuadrícula 10x10, una decena por fila) de repaso avanzado, con más huecos que el anterior.
```

**Ficha 3º — tanda A** (`cuadro_numerico`, `figura_geometrica` 2D+3D):
```
Genera exactamente 5 ejercicios, uno de cada tipo descrito aquí, en este orden, sin añadir ninguno más:
1. Un cuadro numérico (tabla de doble entrada) de restas, con una celda ya resuelta como ejemplo.
2. Un cuadro numérico (tabla de doble entrada) de sumas.
3. Un ejercicio de identificar y escribir el nombre de varias figuras geométricas, mezclando figuras planas (por ejemplo triángulo, rombo) y cuerpos geométricos en 3D (por ejemplo cubo, esfera, cono).
4. Un ejercicio de contar las propiedades de varias figuras: lados y vértices en las figuras planas, y caras, aristas y vértices en los cuerpos geométricos 3D.
5. Un ejercicio de clasificar varias figuras en dos grupos: "Figuras planas (2D)" y "Cuerpos geométricos (3D)".
```

**Ficha 3º — tanda B** (`rejilla_numerica` libre):
```
Genera exactamente 3 ejercicios, uno de cada tipo descrito aquí, en este orden, sin añadir ninguno más:
1. Una rejilla numérica en cuadrícula de 10 columnas para completar contando de 5 en 5, del 5 al 100, con algunas pistas repartidas y el resto en blanco.
2. Una rejilla numérica en cuadrícula de 10 columnas para completar contando de 10 en 10, del 10 al 200, con algunas pistas repartidas y el resto en blanco.
3. Una rejilla numérica en cuadrícula de 5 columnas para completar contando de 1 en 1, empezando en el 100 y terminando en el 150 (no desde el 1), con algunas pistas repartidas y el resto en blanco.
```

**Ficha 5º** (`figura_geometrica` con `perimetro_area` — `recta_numerica`
y `rejilla_numerica` NO existen en 5º, por diseño, así que no se incluyen):
```
Genera exactamente 6 ejercicios, uno de cada tipo descrito aquí, en este orden, sin añadir ninguno más:
1. Un ejercicio de identificar y escribir el nombre de varias figuras geométricas, mezclando figuras planas y cuerpos geométricos en 3D.
2. Un ejercicio de contar las propiedades de varias figuras: lados y vértices en las planas, y caras, aristas y vértices en los cuerpos 3D.
3. Un ejercicio de clasificar varias figuras en dos grupos, por ejemplo "Poliedros" y "Cuerpos redondos".
4. Calcular el perímetro y el área de un cuadrado, dando la medida del lado.
5. Calcular el perímetro y el área de un rectángulo, dando la base y la altura.
6. Calcular el área de un triángulo, dando la base y la altura.
```

Después de generarlas: exportar a PDF, convertir a imagen (`pdftoppm`) e
inspeccionar visualmente — nunca dar una ficha por buena solo leyendo el
HTML/JSON. Reportar por curso + tipo de ejercicio + qué se esperaba vs qué
salió si algo falla, mismo criterio que el resto de la Fase 3.

---

## 5. Cosas que NO hay que perder de vista

- **No desplegar en Railway todavía** (decisión explícita, ver roadmap
  sección de riesgos/pendientes: sin autenticación ni límite de uso).
- **Metodología de validación**: el docente genera en local con su API key,
  sube el PDF, Claude lo convierte a imagen (`pdftoppm`) para inspección
  visual real — nunca dar por buena una ficha solo leyendo el HTML/JSON.
- **Toda prueba de UI/CSS que se haga en el chat debe verificarse con
  Playwright + captura de pantalla real** antes de entregar nada como
  "arreglado" — esta sesión detectó así un bug real de modo B/N que a ojo
  no se hubiera visto.
- **Pendiente de rediseño**: el trazo de las figuras geométricas 2D/3D
  (`FIGURAS_2D`/`FIGURAS_3D` en `renderer-matematicas.js`) — feedback del
  usuario nada más verlas: "quedan un poco raras". Es contenido (el SVG
  de cada figura), no arquitectura — se puede iterar sin tocar el
  renderizador, igual que se hizo con varios iconos del catálogo de conteo
  (`elefante`, `león`, `cangrejo`...) hasta que se leyeron bien.
- **Pendiente de implementar** (anotado, no empezado): renglones de trazo
  fino de fondo en los espacios de respuesta de 1º-2º, para guiar la
  escritura a mano. El mecanismo CSS ya existe
  (`.espacio-respuesta.pauta`, hoy solo usado en Lengua) — probablemente
  sea cuestión de reutilizarlo en Matemáticas para esos cursos.
- **No confundir `cuadro_numerico` (tabla de sumar/restar) con
  `rejilla_numerica` (secuencia de conteo)** — son tipos distintos en el
  sistema aunque a primera vista ambos sean "una cuadrícula de números".
- Flujo de trabajo de esta sesión: cambios se acumulan en local durante la
  sesión, se suben a GitHub todos juntos al final (`git add . && git
  commit && git push`), no archivo a archivo.
