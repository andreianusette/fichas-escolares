# CONTEXTO DEL PROYECTO: GENERADOR DE FICHAS ESCOLARES IA

*Última actualización: 30/08/2026 — revisión completa de este documento
para eliminar el desfase con `ROADMAP_FICHAS_ESCOLARES.md` que llevaba
arrastrándose desde la Fase 2 (arquitectura JSON + renderizador). Sesión
de solo documentación, sin tocar código.*

⚠️ **Este documento describe la visión de producto y la arquitectura.**
Para el detalle fase a fase, decisiones tomadas y checklists, la fuente
de verdad es `ROADMAP_FICHAS_ESCOLARES.md` — si algo de aquí y el roadmap
no coinciden en el futuro, gana el roadmap.

---

## 1. Visión del producto y modelo de negocio

- **Idea**: aplicación SaaS web para maestros de Educación Primaria en España. Genera fichas de clase personalizadas en segundos.
- **Propuesta de valor diferencial**: hiper-localización legislativa (LOMLOE + decretos autonómicos de las 17 CC.AA. + Ceuta y Melilla) e idiomática (Español, Catalán/Valenciano, Gallego, Euskera).
- **Campo "Instrucciones especiales"**: es el motor real de variedad de la app. El docente puede pedir temática, nivel, número exacto de ejercicios, formato... El formulario actual no lo comunica bien — mejorarlo sigue pendiente (Fase 6 del roadmap).
- **Formato de salida**: la app genera HTML estructurado, se muestra en un editor en vivo (contenteditable) y el docente exporta a PDF mediante el diálogo de impresión del navegador.
- **Monetización futura**: freemium (~4,99€/mes ilimitado). Foco en web para PC.

---

## 2. Arquitectura técnica y stack

- **Frontend**: HTML5 + CSS3 + JS vanilla (`public/index.html` + `public/style.css`)
- **Backend**: Node.js + Express con ES modules (`server.js`)
- **Motor de IA**: API de Anthropic — modelo `claude-sonnet-4-5`. La dependencia `@google/genai` sigue en `package.json` pero **no se usa en el código actual** (`server.js` no la importa); Gemini participó en el diseño visual de una sesión temprana (ver sección 3) pero no es una integración API viva hoy.
- **Entorno actual**: 100% local (`localhost:3000`). Railway y Supabase pospuestos (ver sección 9).
- **Repositorio**: GitHub privado → `https://github.com/andreianusette/fichas-escolares`
- **Seguridad**: API key en `.env`, nunca en el código. `.gitignore` excluye `.env` y `node_modules/`.
- **Entorno del usuario**: Windows, VS Code, PowerShell.

```
fichas-escolares/
├── server.js                  ← backend: SYSTEM_PROMPT legacy (15 reglas, resto de asignaturas)
│                                  + construirSystemPromptMatematicas() (JSON, condicional por curso)
│                                  + endpoint API (/api/generar-ficha, /api/iconos)
├── renderer-matematicas.js    ← motor determinista: convierte el JSON de Matemáticas en HTML/CSS
│                                  (18 tipos de ejercicio, catálogo de 84 iconos SVG + 15 figuras 2D/3D)
├── public/
│   ├── index.html             ← formulario + editor en vivo
│   └── style.css               ← diseño visual completo
├── Docs/                      ← este documento + roadmap + referencia de clases HTML + resumen de arranque
├── package.json                ← "type": "module" (ES modules)
├── .env                        ← API key (no en git)
└── .gitignore
```

**Para arrancar**: `node server.js` → abrir `http://localhost:3000`

**Comandos Git habituales** desde la terminal de VS Code:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

**Nota importante de arquitectura (ver sección 4)**: desde la Fase 2 del
roadmap, **Matemáticas ya no funciona como el resto de asignaturas**.
Claude no genera HTML para Matemáticas — genera JSON con datos
pedagógicos, y `renderer-matematicas.js` lo convierte en el HTML/CSS
exacto de forma determinista. Las otras 5 asignaturas (Lengua, Conocimiento
del Medio, Ed. Física, Música, Inglés) siguen con el patrón antiguo: Claude
genera el HTML directamente a partir del `SYSTEM_PROMPT` legacy. Migrarlas
al patrón JSON + renderizador es la Fase 5, pendiente.

---

## 3. Historia del proyecto

**Fase Claude** (sesiones 1-3): MVP desde cero. `SYSTEM_PROMPT` con reglas pedagógicas detalladas. Validación de 1º y 2º de Primaria en Matemáticas, generando HTML directamente.

**Fase Gemini** (en paralelo con sesión 3-4): Gemini rediseñó la parte visual. Aportó el layout de dos paneles, `style.css` separado, el modo ahorro de tinta B/N, prompts específicos por asignatura, protección de elementos estructurales al editar, y validación de API key al arrancar. Fue una aportación de diseño en el chat de esa sesión, no dejó una integración API activa (ver sección 2).

**Fusión** (sesión 4): se tomó la estructura visual de Gemini como base y se le inyectaron todas las reglas pedagógicas de Claude.

**A partir de ahí, el roadmap (`ROADMAP_FICHAS_ESCOLARES.md`) es la fuente de verdad fase a fase.** Resumen muy breve del recorrido (fechas y detalle completo en el roadmap):

| Fase | Qué es | Estado |
|------|--------|--------|
| 0 | Fusión Claude + Gemini | ✅ Completada |
| 1 | Estabilización del maquetado existente (operaciones verticales robustas, hasta 4 sumandos, impresión B/N reparada, nombre del centro) | ✅ Completada |
| 2 | Arquitectura JSON + renderizador, solo Matemáticas | ✅ Completada para Matemáticas |
| 3 | Validación real de Matemáticas, curso a curso | 🔄 En curso — fase activa |
| 4 | Diferenciación visual por asignatura/curso (banco de ilustraciones, etc.) | 💭 Abierta, sin decidir alcance. La Opción D (imagen propia subida por el docente) sí está ✅ validada — ver sección 8 |
| 5 | Migrar el resto de asignaturas al patrón JSON + renderizador | ⏳ Pendiente |
| 6 | Producto más amplio (formulario, CC.AA. real, idiomas, auth, Railway) | ⏳ Pendiente |
| 7 | Optimización de maquetado y paginación (fichas de 2-3 páginas con espacio en blanco) | 💭 Abierta |
| 8 | Idiomas adicionales — Bloque A (rumano/portugués, LTR) y Bloque B (árabe/hebreo, RTL) | 💭 Abierta |

---

## 4. Motor de contenido — dos patrones distintos conviven hoy

Este es el punto donde este documento estaba más desactualizado (arrastraba
la versión previa a la Fase 2). Hoy hay **dos motores distintos** según la
asignatura:

### 4.1. Matemáticas — JSON + renderizador (`renderer-matematicas.js`)

Claude ya no genera HTML para Matemáticas: genera un JSON con datos
pedagógicos (números, enunciados, tipo de ejercicio) a partir de
`construirSystemPromptMatematicas(curso, iconosElegidos)` en `server.js`
— un prompt **condicional por curso** (a partir de 3º ya no se mencionan
SVGs ni conteo; a partir de 4º tampoco los bloques guiados de problema).
`renderer-matematicas.js` convierte ese JSON en el HTML/CSS exacto, con
blindajes de código (ej. las restas nunca pueden tener más de 2 términos,
pase lo que pase en el JSON).

**18 tipos de ejercicio disponibles hoy** (contrato completo de cada uno
en `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones 8-8quindecies):
`operacion_vertical` (con variante decimal), `multiplicacion_vertical`,
`division_vertical`, `conteo_svg`, `calculo_mental`, `problema`,
`tipo_test`, `dibujo`, `serie_numerica`, `comparar_numeros`,
`tabla_frecuencia` (variante iconos 1º-4º / variante datos en texto
5º-6º), `reloj_analogico`, `grafico_barras`, `grafico_quesitos` (solo
5º-6º), `resta_barritas`, `cuadro_numerico`, `figura_geometrica` (4
modos: identificar / propiedades / clasificar / perímetro-área) y
`recta_numerica` + `rejilla_numerica` (1º-3º).

Catálogos de contenido cerrados y deterministas: 84 iconos SVG de conteo
(`ICONOS_DISPONIBLES`) y 15 figuras geométricas (9 en 2D, 6 en 3D,
`FIGURAS_2D_DISPONIBLES` / `FIGURAS_3D_DISPONIBLES`) — el prompt no
necesita cambios cuando se añade contenido al catálogo porque la lista se
inyecta dinámicamente.

**Reglas de negocio ya blindadas en código** (no dependen de que Claude
"se acuerde"): en `cuadro_numerico` la resta siempre es columna − fila y
las celdas inválidas se bloquean visualmente; en `problema` el enunciado
lo pone siempre el código, nunca Claude, para que no se duplique; el
gráfico de quesitos calcula ángulos y porcentajes en código a partir de
valores brutos.

### 4.2. Resto de asignaturas — SYSTEM_PROMPT legacy (HTML directo)

Lengua Castellana, Conocimiento del Medio, Educación Física, Música e
Inglés **siguen con el patrón original**: el `SYSTEM_PROMPT` de 15 reglas
+ `PROMPTS_MATERIA` (instrucciones específicas por asignatura) le piden a
Claude que genere el HTML directamente, sin pasar por JSON ni
renderizador. Migrarlas es la Fase 5 del roadmap, sin empezar.

Las 15 reglas del `SYSTEM_PROMPT` legacy (siguen vigentes solo para estas
5 asignaturas, ya NO aplican a Matemáticas):

1. Solo HTML puro (sin markdown, sin explicaciones).
2. Cabecera obligatoria (Nombre, Fecha).
3. Título descriptivo con clase `titulo-ficha`.
4. Cada ejercicio en `<div class="ejercicio">`.
5. ~10 ejercicios por defecto; respetar número exacto si el docente lo especifica.
6. Adecuación numérica por curso.
7. Operaciones verticales con exactamente 2 números, nunca 3 (regla heredada de antes de la Fase 2; en Matemáticas ahora está blindada en código, no solo en el prompt).
8. SVGs embebidos para conteo en 1º y 2º.
9. Preguntas tipo test con clase `opciones-test`.
10. Espacios para dibujar con clase `caja-espacio-dibujo`.
11. Instrucciones especiales del docente con máxima prioridad.
12. Sin autoevaluación ni caritas.
13. Pie de página con referencia LOMLOE.
14. Clase `curso-inicial` en `<div class="ficha">` para 1º, 2º y 3º.
15. Estructura de problema en 4 bloques para 1º, 2º y 3º.

**Limitaciones honestas de este patrón legacy** (motivo real de por qué
existe la Fase 5): depende de que el modelo "recuerde" las clases CSS
correctas en cada llamada, sin los blindajes deterministas que sí tiene
Matemáticas desde la Fase 2. Solo hay reglas detalladas para Matemáticas;
las otras 5 asignaturas tienen prompts básicos y no comparten el nivel de
robustez ni de tipos de ejercicio variados.

---

## 5. CSS / HTML — clases principales

El contrato completo y actualizado de clases (los 18 tipos de ejercicio de
Matemáticas + las clases compartidas) vive en
**`REFERENCIA_CLASES_HTML_FICHAS.md`** — es el documento a consultar antes
de tocar CSS o depurar el maquetado de una ficha, no se duplica aquí para
evitar que ambos documentos se desincronicen otra vez. Resumen de las
clases estructurales compartidas por todas las asignaturas:

| Clase | Descripción |
|-------|-------------|
| `.ficha` | Contenedor raíz. Hoja blanca A4 con sombra. `position: relative` (ancla de las imágenes flotantes, ver sección 8). |
| `.ficha.curso-inicial` | Tipografía Andika en todo el contenido para 1º-3º. |
| `.cabecera` | Nombre/fecha/centro, borde azul redondeado. |
| `.titulo-ficha` | Fredoka, centrado, línea inferior azul. |
| `.ejercicio` | Contenedor de ejercicio, con `page-break-inside: avoid`, redimensionable a mano. |
| `.hueco` / `.espacio-respuesta` / `.espacio-libre` | Tres variantes de "espacio para que el alumno escriba", conceptualmente distintas (ver `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones 5-6). |
| `.nota-pie` | Pie de página LOMLOE. |
| `.modo-blanco-negro` | Elimina colores para ahorro de tinta (`print-color-adjust: exact` para que se note también al imprimir). |

`@media print` oculta los paneles de la app y deja solo la ficha, en A4
vertical con márgenes de 15mm/18mm.

---

## 6. Formulario (`public/index.html`)

Campos disponibles (confirmado contra el código, `id`/`name` en
`public/index.html`):
1. **Idioma** (`idioma`): Español / Catalán / Gallego / Euskera
2. **Comunidad Autónoma** (`comunidad`): 17 CC.AA. + Ceuta y Melilla
3. **Curso** (`curso`): 1º a 6º de Primaria
4. **Asignatura** (`materia`): Matemáticas / Lengua / Conocimiento del Medio / Ed. Física / Música / Inglés
5. **Nombre del centro** (`colegio`) — añadido en la Fase 1
6. **Sumandos** (`sumandos`) — hasta 4 sumandos configurables, añadido en la Fase 1
7. **Instrucciones especiales** (`instrucciones`) — textarea, campo más potente de la app

Funcionalidades del visor:
- Toggle modo B/N para ahorro de tinta
- Botón imprimir/PDF (desmarcar cabeceras del navegador en "Más opciones")
- Ficha editable en pantalla; SVGs, tablas e imágenes protegidos contra edición accidental de texto

---

## 7. Validación de fichas

**Metodología del proyecto**: generar ficha real (con API key propia) →
exportar a PDF → `pdftoppm` para inspección visual → diagnosticar →
corregir → revalidar. Nunca dar una ficha por buena solo leyendo el
HTML/JSON. Para cambios de CSS/maquetado sin gastar llamadas a la API,
se complementa con Playwright + captura de pantalla real (color y B/N)
antes de dar nada por "arreglado" — así se detectó, por ejemplo, un bug
real de `cuadro_numerico` ilegible en modo B/N.

**Reparto de validación**: el usuario de este hilo valida la coherencia
generativa (números correctos, tipo de ejercicio adecuado al curso, sin
duplicados, JSON bien formado); un maestro que usa la app en el mismo
ordenador local valida el criterio pedagógico/visual por separado.

Estado por curso en Matemáticas (motor JSON nuevo — ver
`ROADMAP_FICHAS_ESCOLARES.md`, Fase 3, para el detalle y la fecha de cada
validación):

| Curso | Estado |
|-------|--------|
| 1º | ⏳ Pendiente de revalidar con el motor JSON (estaba validado con el sistema HTML viejo, previo a la Fase 2) |
| 2º | ⏳ Pendiente de revalidar con el motor JSON |
| 3º | ⏳ Sin validar con ficha real |
| 4º | ⏳ Sin validar con ficha real |
| 5º | ✅ Validado en lo generativo/contenido (05/08/2026). Visual pendiente de feedback del maestro |
| 6º | ⏳ Sin validar con ficha real |

Además, **ninguno de los 5 tipos de ejercicio añadidos el 13/08/2026**
(`resta_barritas`, `cuadro_numerico`, `figura_geometrica`,
`recta_numerica`, `rejilla_numerica`) se ha probado todavía con una
llamada real a la API — solo con JSON simulado a mano. Es el siguiente
paso sugerido por el propio roadmap (con prompts de prueba ya redactados
en `RESUMEN_PARA_NUEVO_HILO.md`).

Las otras 5 asignaturas (patrón legacy, sección 4.2) no tienen tabla de
validación por curso — no ha sido el foco de esta fase.

---

## 8. Imagen propia subida por el docente

Añadido el 10/08/2026, validado en local el 11/08/2026 (Fase 4, Opción D
del roadmap) — no estaba recogido en la versión anterior de este
documento. El docente puede subir su propia imagen (foto de libro, dibujo
escaneado, captura de pizarra digital) desde un botón "🖼️" en cualquier
ejercicio. Puntos clave:

- Bloque flotante e independiente (`<div class="imagen-flotante">`,
  `position: absolute` sobre `.ficha`), no atado a la alineación de los
  ejercicios: arrastrable, redimensionable, se puede solapar con el texto.
- Sin marco ni fondo — respeta transparencia real de PNG.
- Sin backend ni persistencia: se lee en el propio navegador
  (`FileReader` → base64), igual que el resto de la ficha, que no se
  guarda en servidor.
- Límite de 4 MB, validación de tipo de archivo.
- Independiente del banco de ilustraciones (Fase 4, Opción C, que sigue
  sin empezar) — no bloquea ni depende de él.

Pendiente: decidir si se comprime la imagen antes de insertarla, y probar
el comportamiento en fichas de más de una página (relacionado con la
Fase 7, paginación).

---

## 9. Pendiente / roadmap

El detalle fase a fase, con checklists y fechas, vive en
**`ROADMAP_FICHAS_ESCOLARES.md`** — no se duplica aquí. Resumen de en qué
punto está el proyecto ahora mismo (30/08/2026, sin actividad de código
desde el 13/08/2026 según el último commit):

- **Fase activa**: Fase 3 (validar Matemáticas curso a curso, ver tabla
  de la sección 7). Próximo paso sugerido por el roadmap: generar fichas
  reales de 1º, 3º y 5º con los 5 tipos de ejercicio nuevos y validarlas
  con PDF real.
- **Abiertas, sin decidir alcance ni cuándo**: Fase 4 (banco de
  ilustraciones — Opción C — para diferenciación visual por asignatura),
  Fase 7 (paginación/aprovechamiento de espacio) y Fase 8 (idiomas
  adicionales — rumano/portugués frente a árabe/hebreo, ver roadmap para
  el hallazgo de que ni siquiera catalán/gallego/euskera están del todo
  bien en Matemáticas hoy).
- **Sin empezar**: Fase 5 (migrar Lengua/CM/EF/Música/Inglés al patrón
  JSON + renderizador) y Fase 6 (formulario mejorado, CC.AA. real,
  idiomas cooficiales, autenticación, Railway/Supabase).
- **Explícitamente pospuesto**: desplegar en Railway (sin autenticación
  ni límite de uso todavía).

---

## 10. Decisiones descartadas (no reabrir)

- **Lovable/Bubble**: el núcleo diferencial es el motor de contenido
  (prompt + JSON + renderizador), no la interfaz.
- **App móvil**: los docentes preparan clases desde PC.
- **Railway ahora**: pospuesto hasta tener autenticación y más cursos/asignaturas validados.
- **Latinoamérica ahora**: cada país tiene currículo distinto, es otro producto.

~~**JSON + plantillas**~~ — **ya no es una decisión descartada.** La
versión anterior de este documento decía que se había descartado porque
"las plantillas fijas rompen la flexibilidad". Esa decisión se **revirtió
explícitamente en la Fase 2** del roadmap y es la arquitectura actual de
Matemáticas (ver sección 4.1): separar contenido pedagógico (JSON, lo
decide Claude) de maquetado (renderizador determinista) no le quita
flexibilidad al contenido — evita que el maquetado dependa de que el
modelo "recuerde" las clases CSS correctas. Esta era exactamente la
contradicción que el roadmap llevaba señalando desde su encabezado; queda
resuelta con esta revisión.

---

## 11. Archivos a adjuntar al iniciar un nuevo chat

**Siempre, en este orden** (según `RESUMEN_PARA_NUEVO_HILO.md`, que es el
propio documento pensado para esto):
1. `Docs/RESUMEN_PARA_NUEVO_HILO.md` — arranque rápido y qué cambió en la última sesión.
2. Este archivo: `CONTEXTO_FICHAS_ESCOLARES.md` — visión de producto y arquitectura, cambia poco entre sesiones.
3. `Docs/ROADMAP_FICHAS_ESCOLARES.md` — documento vivo de verdad, fases y checklists. Si algo no coincide con este resumen, manda el roadmap.

**Si se va a tocar código o generar/depurar fichas**, además:
4. `server.js`
5. `renderer-matematicas.js` (motor de Matemáticas — JSON + renderizador)
6. `public/index.html`
7. `public/style.css`

**Si se trabaja específicamente el maquetado de Matemáticas**:
8. `Docs/REFERENCIA_CLASES_HTML_FICHAS.md`

**Si hay un bug visual en una ficha ya generada**:
9. El PDF o captura de la ficha con el problema.

El código real manda sobre este resumen. Si hay discrepancia, el código
tiene razón — y si un documento contradice a otro, `ROADMAP_FICHAS_ESCOLARES.md`
tiene prioridad sobre este documento (ver aviso al principio).

**Repositorio**: `https://github.com/andreianusette/fichas-escolares`
(se puede clonar/leer directamente si la sesión nueva tiene acceso a
herramientas de terminal, sin necesidad de subir archivos a mano).
