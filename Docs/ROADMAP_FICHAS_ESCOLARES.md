# ROADMAP DEL PROYECTO — Generador de Fichas Escolares

*Última actualización: Fase 3 CERRADA en lo esencial (30/08/2026). El
arreglo de las sumas ilustradas de 1º-2º (blindaje de cantidad por grupo,
hasta 4 grupos) quedó confirmado con una ficha real de 10 ejercicios
(`Mates_1_C_027.pdf`, "Sumas de tres números") — los 10 cuadran exactamente,
icono a icono. También confirmado el catálogo de 84 iconos con una ficha
real de temática granja/selva/mar (`Mates_1_C_028.pdf`, 13 ejercicios, 12
iconos distintos usados con coherencia, incluidos varios de los que más
rediseño necesitaron — elefante, león, cangrejo, ballena — y de paso,
primera confirmación en producción del umbral de 10 objetos: un caso real
justo por encima cae correctamente a "sin dibujo"). Con esto, 1º-6º de
Matemáticas están validados con fichas reales y los tres bugs de contenido
encontrados esta sesión (reparto, resta por conteo, suma por conteo) están
corregidos y confirmados en producción. Aclarado también con el usuario que
su reporte de "el nombre del centro no aparece en el PDF" fue con otra
asignatura, no Matemáticas — confirma la hipótesis de que es cosa del
pipeline legacy de las otras 5 asignaturas (HTML generado por Claude, sin
blindaje de código), a resolver de raíz en la Fase 5. Quedan solo dos
mejoras menores no bloqueantes abiertas (ver Fase 3 más abajo: rediseño de
figuras 2D/3D, renglones de trazo fino). Fase 8 (idiomas adicionales) sigue
abierta 💭, sin empezar.*

Este documento existe para tener una **meta clara por fases**, en vez de ir
tomando decisiones sueltas según van surgiendo dudas en la marcha. Antes de
proponer un cambio nuevo, mira primero si ya encaja en una fase existente o
si abre una fase nueva — así el trabajo no se dispersa.

Complementa a `CONTEXTO_FICHAS_ESCOLARES.md` (visión de producto e historia)
y a `REFERENCIA_CLASES_HTML_FICHAS.md` (contrato de clases HTML/CSS). Este
documento es el que manda sobre **en qué orden se hacen las cosas**.

⚠️ **Aviso de contradicción con `CONTEXTO_FICHAS_ESCOLARES.md`**: su sección
10 ("Decisiones descartadas — no reabrir") dice que "JSON + plantillas" fue
descartado porque "las plantillas fijas rompen la flexibilidad". Esa decisión
se **revirtió** en la Fase 2 de este roadmap, con aprobación explícita, y
funcionó bien: separar contenido pedagógico (JSON, lo decide Claude) de
maquetado (plantillas de código, deterministas) no le quita flexibilidad al
contenido — solo evita que el maquetado dependa de que el modelo "recuerde"
las clases CSS correctas. Ese documento necesita una revisión para dejar de
contradecir esto; mientras tanto, este roadmap tiene prioridad en caso de
conflicto.

---

## Cómo leer este documento

- ✅ **Completada** — implementada y probada con datos simulados o reales.
- 🔄 **En curso** — empezada, pendiente de cerrar.
- ⏳ **Pendiente** — decidida pero no empezada.
- 💭 **Abierta** — hay una pregunta o decisión de diseño sin cerrar todavía.

---

## FASE 0 — Fusión Claude + Gemini
**Estado: ✅ Completada** (documentada en detalle en `CONTEXTO_FICHAS_ESCOLARES.md`, sección 3)

Base de partida: estructura visual de Gemini (paneles, CSS separado, modo B/N)
+ reglas pedagógicas de Claude (rangos numéricos, SVGs, instrucciones
especiales). Repositorio en GitHub.

---

## FASE 1 — Estabilización del maquetado existente
**Estado: ✅ Completada**

Correcciones sobre lo que ya existía, sin cambiar la arquitectura:

- [x] Operaciones verticales: de tabla HTML con una celda por dígito
      (se rompía con números de varias cifras) → líneas de texto monoespaciado
      alineadas a la derecha, robustas ante cualquier longitud de número.
- [x] Hasta 4 sumandos configurables por el docente (antes fijo en 2).
- [x] Impresión en blanco y negro reparada (`print-color-adjust: exact`;
      antes los navegadores no imprimían los colores de fondo por defecto,
      así que el toggle de "Modo Ahorro de Tinta" no se notaba).
- [x] Campo "Nombre del centro" en la cabecera de la ficha.
- [x] Bug de sincronización: `public/index.html` protegía contra edición
      accidental la clase CSS vieja (`.operacion-vertical`) después de
      renombrarla — corregido.

---

## FASE 2 — Arquitectura JSON + renderizador (Matemáticas)
**Estado: ✅ Completada para Matemáticas** · **⏳ Pendiente para el resto de asignaturas (ver Fase 5)**

Cambio de arquitectura: Claude ya no genera HTML — genera JSON con datos
pedagógicos (números, enunciados, tipo de ejercicio), y un módulo de código
determinista (`renderer-matematicas.js`) lo convierte en el HTML/CSS exacto.
Motivación completa en el historial de chat de esta sesión; resumen:

- [x] Esquema JSON por tipo de ejercicio (`operacion_vertical`, `conteo_svg`,
      `calculo_mental`, `problema`, `tipo_test`, `dibujo`).
- [x] `renderer-matematicas.js`: un renderizador por tipo, más blindajes
      (ej. las restas nunca pueden tener más de 2 términos, pase lo que
      pase en el JSON).
- [x] `SYSTEM_PROMPT` de Matemáticas **condicional por curso**: a partir de
      3º ya no se le menciona a Claude SVGs ni conteo; a partir de 4º
      tampoco los bloques guiados de problema. Esto es lo que resuelve
      "cosas de 1º/2º corriendo en 5º" y además reduce tokens por petición.
- [x] Base de dibujos obligatoria en operaciones y problemas de 1º-2º
      (antes opcional).
- [x] Iconos silueteados (solo trazo negro) en vez de a color — pensados
      para impresión en blanco y negro.
- [x] Los datos del problema (bloque "Datos") ya no se imprimen resueltos:
      son líneas en blanco para que el niño los identifique y escriba.
- [x] Numeración: círculo con el número en vez de la pastilla "Ejercicio N."
      (aplicado también al prompt legacy de las otras 5 asignaturas, porque
      comparten la misma clase CSS).
- [x] Blindaje anti-duplicación: para tipo `problema`, el sistema ignora lo
      que Claude ponga en `enunciado` y usa una instrucción fija en código
      — así es imposible que el enunciado se imprima dos veces, pase lo que
      pase en el JSON.

---

## FASE 3 — Validación real de Matemáticas, curso a curso
**Estado: ✅ Cerrada en lo esencial (30/08/2026)** · **Fase activa de este hilo (decisión 05/08/2026)**

**30/08/2026**: cerrados los tres frentes que quedaban abiertos — 1º-6º ya validados con fichas
reales (tabla de cursos más abajo), el bug de las sumas ilustradas de 1º-2º arreglado y
confirmado con ficha real (ver entrada correspondiente más abajo, incluye el caso de 3-4
sumandos, `Mates_1_C_027.pdf`, 10/10 ejercicios exactos), y el catálogo de 84 iconos confirmado
con una ficha real de temática granja/selva/mar (`Mates_1_C_028.pdf`, 12 iconos distintos, todos
coherentes y legibles — ver entrada más abajo). Quedan solo dos asuntos menores, deliberadamente
no bloqueantes (cada uno con su propia entrada más abajo): el rediseño del trazo de las figuras
2D/3D, y los renglones de trazo fino para 1º-2º — ninguno afecta a la corrección del contenido
generado, son mejoras visuales/de contenido que se pueden abordar cuando convenga sin que
bloqueen dar la fase por buena en lo esencial.

**Decisión de foco (05/08/2026)**: este hilo se centra en seguir validando
cursos y asignaturas, uno detrás de otro (Fase 3 y, después, Fase 5). El
banco de ilustraciones propio (Fase 4, Opción C) se trabajará en otro
hilo/IA aparte, para no mezclar ambas líneas de trabajo. Esto es
independiente de que las fichas deban ser visualmente atractivas: las
mejoras visuales que no dependan del banco (CSS/SVG, Opción A) se pueden
seguir pidiendo e implementando aquí mismo, curso a curso, según se vayan
dando instrucciones.

### Catálogo de iconos SVG ampliado de 9 a 84 (11/08/2026)
**Estado: ✅ Completado y validado visualmente**

Los iconos de conteo (1º-2º, ejercicio `conteo_svg`) solo cubrían 9 objetos.
Se detectó además que 3 de los 9 originales (pelota, mariposa, pájaro) eran
poco reconocibles — se rediseñaron primero (ver más abajo en esta misma
sesión), y a partir de ahí se decidió ampliar todo el catálogo.

- **Fuente**: 57 iconos adaptados de [Tabler Icons](https://tabler.io/icons)
  (licencia MIT, uso libre — atribución no obligatoria pero documentada
  aquí por si se despliega la app públicamente en el futuro). Se
  seleccionaron por categoría (animales, comida, vehículos, formas
  geométricas, naturaleza, objetos) y se convirtieron al estilo propio
  (solo trazo negro, sin relleno, sin la caja de fondo invisible que trae
  Tabler por defecto).
- **18 animales dibujados a mano** desde cero (`conejo`, `elefante`, `leon`,
  `vaca`, `oveja`, `pato`, `buho`, `tortuga`, `rana`, `abeja`, `mariquita`,
  `cangrejo`, `caracol`, `pinguino`, `pulpo`, `ballena`, `gallina`, `oso`) —
  Tabler no cubre bien la fauna clásica de fichas infantiles.
- **Metodología de validación**: galería de auditoría visual a tamaño real
  (60px, el mismo tamaño que en la ficha impresa), no solo a ojo sobre el
  código. Varios iconos necesitaron 2-4 rediseños hasta leerse con
  claridad: `elefante` (el más difícil — perfil de cuerpo completo no
  funcionaba, se resolvió como retrato frontal simétrico con dos orejas
  grandes y trompa colgando), `leon` (la melena de puntos apenas se veía;
  se rehizo con mechones triangulares tipo corona), `ballena`, `tren`,
  `caballo` y `cangrejo`. Dos ideas iniciales (`ardilla`, `delfin`) se
  descartaron por no lograrse una silueta clara en varios intentos, y se
  sustituyeron por `cangrejo` y `caracol`.
- **Verificación final**: no solo iconos sueltos en galería, sino
  renderizados varias veces seguidas dentro de un ejercicio real de
  conteo (`conteo_svg` con `cantidad: 5`) — un icono puede leerse bien
  aislado y volverse confuso al repetirse en fila; esa fue la prueba que
  detectó que `elefante` y `cangrejo` necesitaban una ronda más de ajuste
  incluso después de parecer correctos en la galería inicial.
- El prompt de `server.js` no necesitó cambios: la lista de iconos
  disponibles se inyecta dinámicamente (`ICONOS_DISPONIBLES.join(', ')`),
  así que Claude ya tiene acceso automático a los 84 nombres.
- [x] **Confirmado con ficha real** (30/08/2026, `Mates_1_C_028.pdf`, "Sumas y restas con
      animales", 13 ejercicios pedidos a propósito con temática de granja/selva/mar para forzar
      variedad de iconos): Claude usó 12 iconos distintos del catálogo — `vaca`, `oveja`, `pato`,
      `gallina`, `conejo` (granja), `elefante`, `leon`, `oso`, `tortuga` (selva/zoo/bosque),
      `pulpo`, `cangrejo`, `ballena`, `pinguino` (mar) — todos coherentes con el enunciado de cada
      ejercicio (nunca un objeto "parecido" en vez del real) y legibles repetidos en fila dentro de
      la ficha impresa, incluidos varios de los que más rondas de rediseño necesitaron
      (`elefante`, `leon`, `cangrejo`, `ballena`). De paso, confirma en producción el blindaje de
      `UMBRAL_ICONOS_OPERACION`: el ejercicio 13 (pingüinos, minuendo exactamente 10) dibuja los 10
      objetos, y el ejercicio 10 (pulpos, minuendo 11, un caso real por encima del umbral que no se
      había visto hasta ahora) cae correctamente a "sin dibujo", solo con la operación en columna —
      primera confirmación con la API real de ese límite, antes solo probado con datos simulados.
      Cantidades de los 6 problemas con dibujo verificadas una a una contra el enunciado y la
      columna impresa (5+3, 9−4, 7+6, 4+5, 10−3, 8+4, 11−5, 6+3, 10−4): todas exactas. Sin
      incidencias.

| Curso | Estado |
|-------|--------|
| 1º | ✅ Revalidado con el motor JSON nuevo — 30/08/2026, varias fichas reales (`Mates_1_C_023/024/026.pdf` y más), incluyendo `tabla_multiplicar`, `reparto`, resta por conteo, `reloj_analogico`, `rejilla_numerica`, `cuadro_numerico`. |
| 2º | ✅ Revalidado con el motor JSON nuevo — 30/08/2026, varias fichas reales (`Mates_2_C_002/004.pdf` y más), incluyendo `tabla_multiplicar`, `reparto`, resta por conteo, `tabla_frecuencia`, `rejilla_numerica`, `serie_numerica`, `comparar_numeros`. |
| 3º | ✅ Validado con ficha real — 30/08/2026 (`Mates_3_C_013/014.pdf`): algoritmo formal de multiplicación/división en columna (adelantado desde 4º), sin `tabla_multiplicar`/`reparto` (correcto, son solo 1º-2º). |
| 4º | ✅ Validado con ficha real — 30/08/2026 (`Mates_4_C_003.pdf`): suma en columna, multiplicación (multiplicador 2 cifras), división exacta, problema, cálculo mental, test, serie numérica, comparar números, tabla de frecuencia, reloj, gráfico de barras, figura geométrica — sin incidencias. |
| 5º | ✅ Validado (contenido/generativo) — 05/08/2026, ficha `Mates_5_C_007.pdf`. Visual pendiente de feedback del maestro (revisor distinto, ver nota de reparto de validación más abajo). |
| 6º | ✅ Validado con ficha real — 30/08/2026 (`Mates_6_C_007.pdf`): suma en columna con decimales (alineación por coma confirmada por fin con la API real, no solo simulada), dos multiplicaciones, dos divisiones exactas, problema con porcentaje+fracción combinados, cálculo mental con %/fracciones, test de fracciones equivalentes, serie con paso decimal, comparar números (incluye millones y decimales), tabla de frecuencia sin iconos (20 encuestados, cuadra el total), reloj, gráfico de barras, gráfico de quesitos (porcentajes suman 100%), figura geométrica, dos problemas más — sin incidencias. |

**Reparto de validación (nota 05/08/2026)**: dos personas revisan cosas distintas
y conviene no mezclarlas al reportar un bug — uno es prompt/código, el otro es
CSS. El usuario de este hilo valida la **coherencia generativa** (números
correctos, tipo de ejercicio adecuado al curso, sin duplicados, JSON bien
formado). Un maestro que usa la app en el mismo ordenador local valida el
**criterio pedagógico/visual** (si la ficha se ve y se siente como algo
usable en su clase). Cuando llegue feedback del maestro sobre 5º, se añade
aquí como una capa aparte, no como bloqueo de lo ya validado.

**Metodología**: generar ficha real → PDF → inspección visual → reportar con
curso + tipo de ejercicio + qué se esperaba vs qué salió → corregir →
revalidar. No dar una fase por cerrada sin al menos una ficha real por curso.

**05/08/2026 — bloqueante resuelto antes de validar 5º**: el JSON de
`operacion_vertical` solo admitía `+`/`-`, sin soporte para multiplicación ni
división en columna (pese a que el rango numérico de 4º-6º ya las menciona),
y los decimales se alineaban por longitud de texto en vez de por la coma.
Se añadieron los tipos `multiplicacion_vertical` y `division_vertical`
(disponibles desde 4º) y una variante de `operacion_vertical` con alineación
real por coma decimal. Probado con una ficha simulada (sin gastar llamada a
la API) — ver clases nuevas en `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones
8bis-8quater. **Pendiente**: validar con una ficha real generada por Claude
(no solo con datos simulados a mano).

**05/08/2026 (misma sesión) — primera ficha real de 5º (`Mates_5_C_005.pdf`),
dos problemas encontrados y corregidos**:
1. *Generativo*: los tipos nuevos exigían números enteros, pero el tema real
   (multiplicar/dividir decimales, currículo estándar de 5º-6º) no encajaba
   ahí — Claude caía de vuelta a `operacion_vertical` con un signo que ese
   tipo no reconoce, y el código lo convertía en `+` silenciosamente. Todas
   las cuentas de la ficha salieron como sumas.
2. *Visual*: `multiplicacion_vertical`/`division_vertical` solo admitían UNA
   operación por ejercicio (a diferencia de `operacion_vertical`), así que
   Claude generó 10 ejercicios de una sola cuenta cada uno → mucho espacio en
   blanco, 2 páginas para contenido que cabe en menos de una.

Arreglo: ambos tipos ahora admiten decimales y un array `"operaciones"`
igual que `operacion_vertical` (se pueden agrupar 2-4 por ejercicio). Se
añadió también una regla general en el prompt pidiendo agrupar operaciones
del mismo tipo bajo un ejercicio en vez de crear uno por cada cuenta suelta.
Probado con ficha simulada — mismo contenido en 1 página en vez de 2.
**Pendiente**: confirmar con una ficha real nueva generada por Claude.

**05/08/2026 (misma sesión) — ampliación de tipos de ejercicio (decisión
explícita: seguir ampliando en Matemáticas y, más adelante, en el resto de
asignaturas, priorizando siempre que el maestro pueda generar la ficha de la
semana en pocos minutos — no añadir tipos que compliquen el uso)**:
añadidos `serie_numerica`, `comparar_numeros`, `tabla_frecuencia` y
`reloj_analogico` (dos modos: leer la hora / dibujar las agujas). Probados
con ficha simulada — ver `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones
8quinquies-8octies. **Pendientes para la siguiente tanda** (no bloquean lo ya
hecho): unir con flechas, patrón de figuras/colores, medir con regla,
clasificar cuerpos geométricos con etiquetas.
**Pendiente de validar**: ficha real con estos 4 tipos.

**05/08/2026 (misma sesión) — `tabla_frecuencia` en 5º salía con iconos
infantiles** (`Mates_5_C_010.pdf`, ejercicio 8): contar estrellitas/flores
es currículo de 1º-2º, no de 5º, aunque las tablas de frecuencias sí son
currículo real de 5º-6º. Arreglo: en 5º-6º la tabla ahora se genera a partir
de una lista de datos en texto (`"registros": [...]`, ej. una encuesta o
resultados de un dado) sin ningún icono; el sistema deduce las categorías de
los propios datos. 1º-4º mantienen la versión con iconos. Probado con ficha
simulada de ambas variantes — ver `REFERENCIA_CLASES_HTML_FICHAS.md`,
sección 8septies. **Pendiente**: confirmar con ficha real de 5º-6º.

**13/08/2026 — tres tipos de ejercicio nuevos, a petición del usuario con fichas de Santillana
como referencia de formato** (no se copió texto ni ilustraciones de Santillana — solo el
patrón pedagógico general, que no es propiedad de nadie):
- `resta_barritas` (1º-2º, dos modos): resta con modelo de comparación de conjuntos — dos
  grupos de palotes que el alumno tacha a mano. Modo "tachar" (palotes ya dibujados) y modo
  "dibujar" (cajas vacías, el alumno dibuja los palotes él mismo — un paso más de dificultad).
- `cuadro_numerico` (1º-3º, suma o resta): tabla de doble entrada de la ficha de referencia
  (`Resta para completar la tabla`). En resta, la operación de cada celda es siempre
  columna − fila; las celdas que darían negativo se bloquean visualmente (trama diagonal) en
  vez de dejarse en blanco como si hubiera que rellenarlas. Admite una celda "ejemplo"
  opcional, resuelta por el propio código como modelo.
- `figura_geometrica` (todos los cursos, cuatro modos — decisión de alcance con el usuario:
  identificar, propiedades, clasificar y perímetro/área): catálogo nuevo de 9 figuras 2D
  (triángulo, cuadrado, rectángulo, rombo, trapecio, pentágono, hexágono, círculo, óvalo) y 6
  cuerpos 3D (cubo, prisma rectangular, pirámide, cono, cilindro, esfera) en
  `renderer-matematicas.js`, independiente del catálogo `ICONOS` de conteo. Gradualidad por
  curso: figuras 3D a partir de 2º (en 1º solo 2D); modo "perimetro_area" (con fórmulas de
  área/perímetro) solo en 4º-6º, y limitado a cuadrado/rectángulo/triángulo.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones
8undecies-8tredecies. Probado con JSON simulado (sin gastar llamada a la API) cubriendo los 3
tipos y sus modos, y verificado visualmente con Playwright + captura de pantalla real (a
tamaño de ficha completa), incluyendo el modo B/N — se detectó y corrigió ahí mismo un bug real
(el símbolo de la esquina del cuadro numérico quedaba en blanco sobre blanco, ilegible, en modo
B/N).

**30/08/2026 — confirmado con fichas reales generadas por Claude** (`Mates_1_C_022.pdf`, 1º;
`Mates_3_C_011.pdf`, 3º; `Mates_5_C_013.pdf`, 5º): `resta_barritas` (modos tachar y dibujar, conteo
de barritas verificado píxel a píxel — 15 y 8 en la resta de 1º, correcto), `cuadro_numerico`
(restas y sumas; celda de ejemplo verificada con la fórmula columna−fila en ambos cursos — 10−2=8
en 1º, 107−25=82 en 3º, correctas) y `figura_geometrica` en los modos identificar/propiedades/
clasificar (1º solo 2D, 3º mezclando 2D y 3D) y en modo `perimetro_area` en 5º (cuadrado 12 cm,
rectángulo 15×9 cm, triángulo base 18/altura 10 cm — medidas bien etiquetadas, sin resultados
precalculados) generan contenido correcto sin duplicados ni tipos fuera de orden. No se activó en estas fichas ningún caso de celda bloqueada
por resultado negativo en `cuadro_numerico` — sigue sin probarse ese caso concreto con una llamada
real, aunque el cálculo simulado ya lo cubría. El rediseño pendiente del trazo de las figuras
2D/3D (ver ítem sin marcar más abajo) sigue abierto, es un asunto de contenido visual aparte de
esta validación generativa.

- [ ] **Pendiente de rediseño — trazo de las 9 figuras 2D y, sobre todo, los 6 cuerpos 3D**
      (`FIGURAS_2D`/`FIGURAS_3D` en `renderer-matematicas.js`): feedback del usuario nada más
      verlas (13/08/2026), quedan "un poco raras" — mismo tipo de problema que ya pasó con
      varios iconos del catálogo de conteo (`elefante`, `león`, `cangrejo`...), que necesitaron
      2-4 rediseños hasta leerse con claridad a tamaño real (ver más arriba en esta misma fase).
      El catálogo sigue el mismo patrón que `ICONOS_DISPONIBLES` (diccionario nombre → SVG), así
      que redibujarlas más grandes/nítidas es un cambio de contenido, no de arquitectura — no
      bloquea nada de lo ya implementado. No es tarea para el banco de ilustraciones de la Fase 4
      (ese banco es para escenas/ilustraciones temáticas por asignatura, no para diagramas
      curriculares que necesitan ser exactos en número de lados/caras/vértices): esto se resuelve
      aquí mismo, iterando el SVG a mano igual que se hizo con los iconos de conteo.

**13/08/2026 (misma sesión) — dos tipos de ejercicio más, a petición del usuario con 4 fichas
de referencia adjuntadas** (recta numérica de una ficha de Santillana, y tres fichas de
rejillas de conteo de otras fuentes — de nuevo, solo como referencia de formato, sin copiar
texto ni ilustraciones):
- `recta_numerica` (1º-2º): recta horizontal de 0 a un máximo, con el número de partida
  resaltado en una caja y arcos discontinuos marcando los saltos de la operación (atrás en
  restas, delante en sumas) — para sumas/restas sencillas de un solo paso.
- `rejilla_numerica` (1º-3º): cuadrícula de números en fila×columna para practicar conteo (de
  1 en 1, de 2 en 2, de 10 en 10...) — versión en rejilla de `serie_numerica`, con el mismo
  convenio de huecos (`null` = casilla a rellenar). **Importante — no confundir con
  `cuadro_numerico`** (añadido en la entrada anterior): aunque el usuario se refirió a ambos
  como "cuadro numérico" en su petición original, son dos tipos distintos en el sistema —
  `cuadro_numerico` es una tabla de sumar/restar con cabecera de fila y columna,
  `rejilla_numerica` es una secuencia de conteo sin operación. Aclarado con el usuario.

Documentación en `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones 8quattuordecies-8quindecies.
Probado con JSON simulado y verificado visualmente con Playwright (color y B/N) antes de
darlo por bueno.

**30/08/2026 — confirmado con fichas reales generadas por Claude** (`Mates_1_C_023.pdf`, 1º;
`Mates_3_C_012.pdf`, 3º): `recta_numerica` en 1º verificada contando los arcos uno a uno (6 saltos
atrás en 13−6, 6 saltos adelante en 7+6, ambas correctas) y `rejilla_numerica` verificada en sus
dos variantes — el "cuadro numérico" clásico 10×10 de 1º (0-99 con pocos huecos, 1-100 con más
huecos, tal y como se pidió) y la versión libre de 3º (progresiones de 5 en 5, de 10 en 10 y de 1
en 1 empezando en 100 en vez de en 1, con la fila final incompleta bien calculada). Sin
incidencias.

- [ ] **Pendiente de implementar — renglones de trazo fino para 1º-2º** (13/08/2026, a partir
      de una ficha de referencia del usuario): en 1º y 2º, los espacios donde el alumno escribe
      a mano (resultado de problemas, respuestas cortas) deberían llevar un renglón guía fino de
      fondo, no quedar en blanco liso — ayuda a los niños que todavía están aprendiendo a
      escribir con letra de tamaño uniforme. El sistema YA TIENE el mecanismo CSS necesario:
      `.espacio-respuesta.pauta` (usado hoy solo en Lengua, para dictado —
      `repeating-linear-gradient` de líneas horizontales cada 27px). Probablemente sea cuestión
      de aplicar esa misma clase (o una variante con el espaciado ajustado a la letra más grande
      de `curso-inicial`) a `.bloque-resultado` y/o `.espacio-libre` cuando el curso sea 1º o 2º,
      en vez de crear un mecanismo nuevo. No implementado todavía — queda anotado para abordarlo
      en otra sesión.

**13/08/2026 (misma sesión) — afinado `rejilla_numerica` para 1º-2º: debe ser el "cuadro
numérico" clásico, no una cuadrícula libre** (aclaración del usuario tras ver la primera
versión): en 1º-2º, "rejilla_numerica" ahora se instruye para generar SIEMPRE una cuadrícula
10×10 fija (100 números, 10 columnas), con cada fila siendo una decena completa y consecutiva
— variante 0-99 o variante 1-100, a elegir por Claude — en vez de rangos/columnas libres. La
cantidad de huecos por fila se guía como "moderada por defecto" (2-3 de 10), con instrucción de
bajar a 1-2 para fichas de inicio de curso y subir a 5-6 para fichas de repaso avanzado, si el
docente lo pide en instrucciones especiales. **3º no cambia**: sigue con la versión libre
(cualquier rango, paso y columnas) que el usuario confirmó que ya funcionaba bien. Cambio solo
en el `SYSTEM_PROMPT` (`server.js`) — el renderizador y el CSS son los mismos de la entrada
anterior. Probado con una cuadrícula 10×10 simulada (0-99, 2-3 huecos/fila) y verificado
visualmente con Playwright antes de darlo por bueno. **30/08/2026 — confirmado con ficha real
de 1º** (`Mates_1_C_023.pdf`, misma ficha de la entrada de arriba): cuadrícula 10×10 con pocos
huecos (variante inicio de curso) y con más huecos (variante repaso avanzado), ambas correctas.
Pendiente de confirmar específicamente en 2º (no probado todavía, ni con el motor viejo ni con
el nuevo).

**30/08/2026 — bug encontrado en las operaciones ilustradas de 1º-2º, pendiente de arreglar**
(`Mates_1_C_024.pdf`, ficha con los tipos "base" de 1º — operación en columna, conteo, cálculo
mental, problema, test, dibujo — generada para revalidar con el motor JSON nuevo, ver tabla de
cursos más arriba): en un ejercicio de `operacion_vertical` (23 + 45), los dibujos obligatorios
de 1º-2º (`datos.svg.icono1/cantidad1/icono2/cantidad2`) mostraron 10 manzanas + 10 estrellas —
sin relación con los números reales de la operación. Causa raíz identificada en `server.js`: el
bloque del `SYSTEM_PROMPT` que exige el campo `svg` en operaciones de 1º-2º solo obliga a que el
*tipo* de icono encaje con el enunciado (coherencia objeto↔historia), pero nunca dice
explícitamente que `cantidad1`/`cantidad2` deban coincidir con los números reales de la
operación — así que con operandos de una cifra Claude suele acertar por sentido común (confirmado
en la misma ficha: el `problema` de las mariposas, 8 + 5, sí dibujó 8 y 5 mariposas exactas), pero
con operandos de dos cifras (dentro del rango permitido en 1º, "0-50") improvisa una cantidad
simbólica desconectada en vez de no dibujar nada. Mismo campo `svg` y mismo hueco de instrucción
en el bloque de `problema` (línea ~471 de `server.js`) — no confirmado si reproduce ahí también,
pero es el mismo mecanismo y muy probable que sí con un problema de dos cifras.

- [x] **Arreglar en la RESTA** (30/08/2026, ver entrada más abajo — "fallo de concepto en las
      restas de conteo"): resuelto de raíz, no solo el recorte de cantidad. La suma sigue con el
      arreglo pendiente, agrupado al cierre de la Fase 3.
- [x] **Arreglar en la SUMA** (30/08/2026, cierre de la Fase 3): resuelto tanto el recorte de
      cantidad como el caso de 3-4 sumandos que había quedado como dato nuevo el mismo día
      (`Mates_2_C_004.pdf`, ejercicio 6, 12+15+8 con solo dos grupos y cantidades recortadas a
      10+10). Decisión del usuario: ampliar a hasta 4 grupos de iconos en vez de omitir el dibujo
      por encima de 2 sumandos.

      En `operacion_vertical` se fue más allá de lo mínimo pedido, aplicando el mismo criterio de
      blindaje que ya se usaba en la resta: la cantidad de CADA grupo se deriva siempre de
      `op.numeros` (el array de sumandos reales), nunca de `datos.svg.cantidadN` — así que, a
      diferencia del planteamiento original, Claude ya NO tiene que informar ninguna cantidad para
      esta sección, ni en sumas ni en restas, solo el nombre del icono de cada grupo (con
      `icono2`/`icono3`/`icono4` opcionales — si faltan, se reutiliza `icono1`). Si cualquier
      sumando supera el umbral de `UMBRAL_ICONOS_OPERACION` (10), no se dibuja NINGÚN grupo — mejor
      nada que un dibujo a medias que no represente la suma completa. En `problema` (texto libre,
      sin array de números del que derivar nada) se mantiene la dependencia de que Claude informe
      cada `cantidadN`, pero ahora hasta 4 grupos (`icono1`/`cantidad1`...`icono4`/`cantidad4`,
      leídos en orden consecutivo), con el mismo blindaje de umbral por grupo.

      `SYSTEM_PROMPT` actualizado en ambos bloques (`bloqueOperacion` y `bloqueProblema` en
      `server.js`). Probado con 8 casos simulados (2, 3 y 4 sumandos con y sin icono repetido, el
      caso real de 12+15+8 cayendo correctamente a "sin dibujo", sumas y restas en `problema`, y
      las regresiones de resta simple en ambos tipos) — todos exactos, contando nodos SVG uno a
      uno — y verificado visualmente con Playwright en color y en blanco y negro.

      **30/08/2026 (misma sesión) — confirmado con ficha real** (`Mates_1_C_027.pdf`, "Sumas de
      tres números", 10 ejercicios de `operacion_vertical` con 3 sumandos cada uno, generada a
      propósito para cerrar este pendiente): los 10 ejercicios dibujan correctamente los 3 grupos
      de iconos, cada uno con el icono que le corresponde según el enunciado del propio Claude (sin
      repetir el mismo icono en los tres grupos, algo que el sistema permite pero no obliga) y con
      la cantidad exacta de cada grupo — verificado contando objeto a objeto en las 10 fichas y
      cruzando contra los tres números impresos en la columna de la operación (3+2+4, 5+1+3, 2+3+3,
      4+2+2, 1+4+3, 3+3+2, 2+2+5, 4+1+4, 2+4+1, 3+1+5): las diez cuadran exactamente. Sin
      incidencias. Cierra el último pendiente de este bug y de la Fase 3.

**30/08/2026 (misma sesión) — reproducido en 2º, con un dato que afina el diagnóstico**
(`Mates_2_C_002.pdf`, ficha con los tipos base de 2º): ejercicio 1 (68 − 23) volvió a dibujar
10 + 10 objetos, igual que en 1º. Pero el ejercicio 5 (`problema`: "María tiene 15 caramelos...
Laura le da 8 más") fue más revelador — el segundo grupo dibujó exactamente 8 caramelos
(coincide con el enunciado), y el primero se quedó corto en 10 en vez de los 15 reales. Confirma
el patrón exacto: cuando el número real es ≤ 10, Claude dibuja la cantidad exacta; por encima de
10, recorta a 10 en vez de omitir el dibujo. Coincide con el umbral propuesto arriba para el
arreglo — no hace falta afinarlo más, ya está confirmado con dos fichas reales de dos cursos
distintos. Resto de la ficha de 2º (restas sin llevadas, conteo, cálculo mental, tipo test,
dibujo libre) correcto, sin más incidencias.

**30/08/2026 — dos tipos de ejercicio nuevos y ajuste de currículo, a partir de información de
primera mano de una maestra real** (`Mates_3_C_013.pdf` fue el disparador de la pregunta):
la maestra aclaró que en 1º ya se dan las tablas de multiplicar del 1, 2, 3, 5 y 10, y en 2º el
resto (4, 6, 7, 8, 9) — siempre como memorización de tabla completa, no como algoritmo en
columna. La división en 1º-2º se trabaja como reparto manipulativo (sin algoritmo), y en 2º
además enlazada con las tablas ya aprendidas. Esto no encajaba con el estado anterior del
sistema, que no ofrecía ningún tipo de ejercicio para multiplicar/dividir antes de 4º (el
algoritmo formal en columna). Decisiones tomadas con el usuario (confirmadas vía pregunta
explícita):
- **`tabla_multiplicar`** (nuevo, 1º-2º): practicar una tabla completa (×1 a ×10). El único dato
  que decide Claude es `tabla` — las 10 filas y sus resultados en blanco los genera siempre el
  código (blindaje total, cero confianza en que Claude enumere o multiplique bien). En 1º
  restringido por prompt a las tablas 1, 2, 3, 5, 10; en 2º cualquiera del 1 al 10.
- **`reparto`** (nuevo, 1º-2º): división como reparto manipulativo — decisión de diseño
  confirmada por el usuario entre varias opciones: "objetos + grupos vacíos para repartir a
  mano", en vez de, por ejemplo, un modelo de tachado como `resta_barritas`. El sistema dibuja
  `total` objetos y `grupos` cajas vacías; el alumno reparte a mano dibujando o escribiendo
  cuántos tocan en cada caja. Sin resto (`total` siempre múltiplo exacto de `grupos` — blindado
  en el código: si Claude manda un reparto que no cuadra, se ajusta al múltiplo más cercano).
- **Algoritmo formal (`multiplicacion_vertical`/`division_vertical`) adelantado de 4º a 3º**:
  decisión confirmada por el usuario tras la aclaración de la maestra — el currículo real
  introduce el algoritmo en columna en 3º, no en 4º como asumía el sistema hasta ahora
  (`esMultDiv` en `construirSystemPromptMatematicas()`, `server.js`). `RANGOS_NUMERICOS_MATE['3º']`
  actualizado para reflejarlo.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, secciones
8sedecies-8septendecies. Probado con JSON simulado (sin gastar llamada a la API) cubriendo
ambos tipos, incluyendo los casos límite del blindaje (tabla fuera de rango, reparto con resto),
y verificado visualmente con Playwright + captura a tamaño de ficha completa, en color y en modo
B/N.

**30/08/2026 (misma sesión) — confirmado con fichas reales generadas por Claude en el servidor
local del usuario**, esta vez manejando el navegador directamente (sin exportar PDF, verificación
en pantalla + inspección del DOM): `tabla_multiplicar` en 1º generó la tabla del 2 (dentro del
subconjunto permitido {1,2,3,5,10}) con las 10 filas correctas; en 2º generó la tabla del 7 (fuera
de ese subconjunto, confirmando que 2º sí puede usar cualquier tabla). `reparto` en 1º generó
"15 manzanas en 3 grupos" (15:3, exacto, 15 objetos + 3 cajas verificados contando nodos SVG en el
DOM); en 2º, al pedir explícitamente un reparto con un total alto (28-32 objetos entre 4 grupos)
para forzar el límite de 30 objetos, **se encontró un bug real**: el blindaje de `renderReparto()`
aplicaba el tope de 30 objetos DESPUÉS de ajustar al múltiplo exacto de "grupos", así que un
reparto válido como 32:4 se recortaba a 30:4 (ya no exacto) en vez de a 28:4. Corregido invirtiendo
el orden (tope de 30 primero, ajuste de múltiplo después, sin poder superar el tope) y revalidado
con seis casos límite simulados (incluyendo 32:4→28:4, 29:5→30:5, 30:4→28:4) más una nueva ficha
real de 2º ya con el fix, que generó "28 caramelos en 4 grupos" correctamente. También confirmado
en 3º: `multiplicacion_vertical` y `division_vertical` (algoritmo formal en columna) ya aparecen
disponibles un curso antes que hasta ahora (347×6, 528×4, 264×7 / 486÷6, 672÷8, 345÷5, todas de
3 cifras entre 1 cifra, coherente con el rango numérico de 3º), y `tabla_multiplicar`/`reparto`
correctamente ausentes en 3º (no se ofrecen fuera de 1º-2º). Sin más incidencias.

**30/08/2026 — fallo de concepto en las restas de conteo de 1º-2º, reportado por una maestra
real tras usar las fichas descargadas de la sesión** (no un bug de recuento como el de más
arriba, sino un fallo del propio modelo pedagógico): las restas ilustradas de `operacion_vertical`
y `problema` dibujaban DOS conjuntos separados con un signo "menos" en medio (ej. "9−4": un grupo
de 9 objetos, el signo, un grupo de 4 objetos) — ese formato es el de LA SUMA (combinar dos
conjuntos), no el de la resta. El procedimiento real, según la maestra: dibujar SOLO el minuendo
(un único conjunto de 9 objetos) y que el alumno tache a mano tantos como el sustraendo, contando
los que quedan sin tachar.

Arreglo en `renderOperacionVertical()` y `renderProblema()` (`renderer-matematicas.js`): para
`signo: "-"` ahora se dibuja un solo conjunto de objetos, nunca dos. De paso, aprovechando que se
tocaba el mismo bloque, se blindó también la cantidad exacta para la resta (decisión confirmada
con el usuario): en `operacion_vertical` la cantidad dibujada ya NO depende de que Claude informe
bien `datos.svg.cantidad1` — se deriva siempre del minuendo real de `datos.operaciones[0].numeros`,
con blindaje de código de verdad, igual que otros tipos (`cuadro_numerico`, `tabla_multiplicar`).
En `problema` no hay otro campo numérico del que derivarlo (es texto libre), así que ahí se
mantiene la dependencia de `cantidad1`, pero con el mismo umbral de seguridad. En ambos casos, por
encima de `UMBRAL_ICONOS_OPERACION` (10 objetos — ajustado durante la propia implementación al
comprobar que coincidía con el tope interno de `renderIconos()`, que ya recortaba a 10 en silencio;
un umbral más alto habría reintroducido el bug de cantidad recortada que este mismo cambio
pretendía evitar) no se dibuja nada, en vez de una cantidad incompleta. La suma no se toca: sigue
con el modelo de dos conjuntos (correcto ahí) y con el arreglo de cantidad exacta pendiente,
agrupado al cierre de la Fase 3 (ver checklist más arriba).

Documentado el contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 8bis0 (nueva).
Probado con 8 casos simulados (resta con minuendo dentro/fuera del umbral, límite exacto en 10,
suma sin cambios, y las mismas variantes en `problema`) y verificado visualmente con Playwright —
capturas correctas: un solo conjunto en las restas, sin signo entre grupos, cayendo a "sin dibujo"
por encima de 10. **Pendiente**: confirmar con una ficha real de 1º y/o 2º generada por Claude
(no solo con datos simulados a mano).

**30/08/2026 (misma sesión) — confirmado con tres fichas reales** (`Mates_3_C_014.pdf`,
`Mates_2_C_004.pdf`, `Mates_1_C_026.pdf`, generadas por el usuario tras reiniciar el servidor
local con el fix aplicado): las restas ilustradas de 1º y 2º dibujan ahora un único conjunto de
objetos (el minuendo), sin segundo grupo ni signo "menos" entre medias, en todos los casos
revisados — sin incidencias. De paso, revalidados sin problemas en estas mismas fichas otros
tipos ya dados por buenos: `reloj_analogico` (1º), `tabla_frecuencia` en modo iconos (2º),
`rejilla_numerica` específicamente en 2º (quedaba pendiente, ver entrada de arriba — ahora
confirmada), `serie_numerica` y `comparar_numeros`.

**30/08/2026 (misma sesión) — nombre del centro: separación visual del cajón de Nombre/Fecha**,
a petición del docente ("al imprimir debería estar separado visualmente del nombre del alumno y
fecha, en otro cajón aparte, o sin cajón, pero por encima"). Antes de tocar nada se investigó
también la otra mitad de la petición — "en pantalla aparece... en la impresión a pdf no aparece"
— revisando el CSS (`.cabecera`, `.cabecera-centro`, la regla `@media print` de
`print-color-adjust: exact` ya existente) sin encontrar ninguna causa a nivel de código, y
reinspeccionando directamente las tres fichas de Matemáticas subidas por el usuario en esta misma
sesión (`Mates_3_C_014.pdf`, `Mates_2_C_004.pdf`, `Mates_1_C_026.pdf`): el nombre del centro
("CEIP Santa María Magdalena - Chozas de Canales") aparece correctamente en las tres. No se ha
podido reproducir el fallo con la evidencia disponible — hipótesis de trabajo (sin confirmar
todavía con el usuario): puede ser específico de las 5 asignaturas del pipeline antiguo (donde
Claude genera el HTML de la cabecera él mismo a partir de una plantilla de texto, sin blindaje de
código) y no de Matemáticas (100% generada por código, nunca a criterio del modelo).

Independientemente de esa duda, se implementó el cambio de separación visual pedido: en
`renderer-matematicas.js` (`renderizarFichaMatematicas()`), la línea `.cabecera-centro` con el
nombre del centro pasa de ir DENTRO de `.cabecera` (justo antes de `.cabecera-datos`) a ir FUERA,
como línea suelta justo encima del cajón de Nombre/Fecha — sin cajón propio, tal y como pidió el
docente como primera opción. En `public/style.css` se ajustó el margen inferior de
`.cabecera-centro` (6px → 8px) para que quede un hueco claro respecto al cajón de abajo. En
`server.js`, la plantilla de cabecera del `SYSTEM_PROMPT` legacy (las otras 5 asignaturas) se
actualizó igual, a título de mejor esfuerzo, ya que ese HTML lo genera Claude y no está blindado
por código. Probado con datos simulados y capturas de Playwright en color y en blanco y negro —
correcto en ambos modos. **Pendiente**: confirmar con una ficha real tras el reinicio del servidor,
y aclarar con el usuario si el fallo "no aparece en el PDF" ocurrió con una asignatura distinta de
Matemáticas.

**30/08/2026 (misma sesión) — cabecera separada confirmada con ficha real, y 4º/6º cerrados**
(`Mates_4_C_003.pdf`, `Mates_6_C_007.pdf`, dos fichas de repaso general generadas a propósito para
cubrir de un tirón todos los tipos de ejercicio disponibles en esos cursos): en ambas, el nombre
del centro aparece correctamente en el PDF impreso y ya como línea suelta separada, sin cajón,
justo encima del cajón de Nombre/Fecha — confirma en producción tanto que el nombre SÍ se imprime
bien en Matemáticas como que el cambio de separación visual funciona. Contenido revisado número a
número sin incidencias en los dos cursos: sumas/multiplicaciones/divisiones en columna (incluida
la suma con decimales de 6º, con la alineación real por la coma ya confirmada con la API real, no
solo con datos simulados — cierra el pendiente de la entrada del 05/08), problemas (incluido uno
de 6º combinando porcentaje y fracción en el mismo enunciado), cálculo mental, tipo test, series
numéricas (incluida una con paso decimal en 6º, ambas con progresión aritmética consistente en
todos los huecos), comparación de números, tablas de frecuencia (la variante sin iconos de 6º,
con 20 encuestados y el conteo real cuadrando con el total indicado en el enunciado), reloj
analógico, gráfico de barras y, solo en 6º, gráfico de quesitos (porcentajes suman 100%
exactamente). Con esto, 4º y 6º quedan validados en la tabla de cursos de arriba — junto con 1º,
2º, 3º y 5º ya confirmados, cierra la revalidación curso a curso del motor JSON nuevo para
Matemáticas.

**30/08/2026 (misma sesión) — aclarado con el usuario el reporte de "no aparece en el PDF"**:
confirma que fue con una asignatura distinta de Matemáticas, no con Matemáticas — coincide con la
hipótesis de trabajo de la entrada de arriba. Con las 5 asignaturas del pipeline legacy, la
cabecera la escribe Claude directamente en el HTML a partir de la instrucción del `SYSTEM_PROMPT`
(sin blindaje de código), así que puede fallar de forma inconsistente entre generaciones —
mientras que en Matemáticas es imposible que falte porque el código la añade siempre que
`colegio` no esté vacío. No se investiga más por ahora (fuera del alcance actual, centrado en
Matemáticas — ver Fase 5 para la extensión del motor JSON al resto de asignaturas, que resolvería
esto de raíz igual que ya resolvió los problemas equivalentes en Matemáticas). El cambio de
separación visual del `SYSTEM_PROMPT` legacy ya está aplicado a título de mejor esfuerzo (ver
entrada de arriba), pero sigue sin blindaje de código en esas 5 asignaturas.

### Candidatos a nuevos tipos de ejercicio (backlog, 30/08/2026)

**Contexto cuantitativo, aportado por la maestra que asesora al usuario**: ella trabaja
normalmente con un banco de mínimo 50-60 tipos/variantes de ejercicio distintos (referencia:
Twinkl). Matemáticas tiene hoy **21 tipos** registrados en `RENDERERS_POR_TIPO`
(`renderer-matematicas.js`) — aunque no todos están disponibles en todos los cursos (varios son
solo 1º-2º o solo cursos guiados), así que el número que ve un docente en un curso concreto es
menor todavía. Confirma que la estimación de la maestra ("no llegamos ni a veinte") es
aproximadamente correcta y que sigue habiendo bastante recorrido en cantidad, no solo en pulido
visual. No se ha decidido ni empezado a cerrar esta brecha — queda como contexto para priorizar
qué tipos nuevos pedir/aceptar según vaya avanzando el curso.

**Candidatos concretos identificados comparando con Twinkl (30/08/2026)** — ninguno de estos dos
depende de la Fase 4 (banco de ilustraciones): son puramente algorítmicos, con el mismo patrón de
blindaje por código que ya se usa en el resto del sistema.
- **`crucigrama`**: rejilla de crucigrama con pistas numeradas (horizontales/verticales) cuya
  solución es el resultado de una operación — mismo patrón que un crucigrama de palabras, pero la
  "pista" es una cuenta matemática (ej. `18 × 6` → escribe el resultado en las casillas). Vistos
  ejemplos de Twinkl con multiplicaciones/divisiones, números romanos y números negativos.
- **`colorea_por_operacion`** ("colorea por multiplicación/operación"): mosaico de polígonos, cada
  uno con una operación dentro; una leyenda de rango numérico → color; el alumno resuelve cada
  polígono y lo colorea según en qué rango cae el resultado. Se puede construir generando el
  mosaico por código (SVG con formas poligonales aleatorias o semi-aleatorias, similar en espíritu
  a `figura_geometrica`), sin depender de ilustraciones externas.

**Visto pero NO candidato inmediato** (sí depende de la Fase 4, banco de ilustraciones):
`circuito de multiplicación`/juegos de tablero con pista, coches, banderines — ahí la ilustración
es parte del mecanismo del juego, no decorativa, así que no se puede resolver solo con SVG
geométrico genérico como los dos de arriba.

**Segunda tanda de comparación con Twinkl (30/08/2026)** — 4 imágenes más aportadas por el
usuario, pidiendo comprobar cuáles son realmente nuevas:

- *"Cuadernillo: Sumas básicas — Los piratas"* (portada temática ilustrada + varias páginas
  agrupadas bajo un mismo tema): confirmado que esto NO es un tipo de ejercicio nuevo, es más bien
  una cuestión de presentación/empaquetado — ya generamos fichas de varias páginas con varios
  ejercicios de un mismo tema (el docente puede pedir un tema concreto en instrucciones
  especiales). Lo único que no tenemos es una portada ilustrada de personaje como página 0, sin
  ejercicios — eso sí depende de la Fase 4 (necesita ilustración de personaje, no solo maquetación).
- *"Colorear con sumas y restas"* (dibujo de un personaje/monstruo segmentado en regiones, cada
  una con una operación dentro, coloreado según una leyenda de rango→color): el MECANISMO es
  exactamente el mismo que el candidato `colorea_por_operacion` ya anotado arriba — pero esta
  versión concreta de Twinkl usa la silueta de un personaje ilustrado (regiones irregulares
  siguiendo su forma), no un mosaico de polígonos genérico. Esa ejecución concreta sí depende de
  la Fase 4 (banco de ilustraciones); la versión con mosaico de polígonos (sin arte de personaje)
  sigue siendo viable ahora mismo tal y como se anotó arriba.
- *"Monstruos punto a punto"* (conecta los puntos en orden, del 1 al 20/30/50, revelando un
  dibujo): **confirmado, es un tipo de ejercicio nuevo genuino** — no hay nada parecido en el
  catálogo actual (21 tipos). Candidato: **`conecta_los_puntos`**. Viable sin banco de
  ilustraciones grande: en vez de arte libre, necesita un catálogo pequeño y cerrado de plantillas
  con coordenadas de puntos ya definidas (mismo patrón que `ICONOS_DISPONIBLES` o
  `FIGURAS_2D`/`FIGURAS_3D` — un diccionario nombre → lista de puntos, curado a mano una vez).
  Encaja con el rango de conteo del curso (1º: hasta 20; cursos superiores: hasta 50 o más, como
  repaso de series).
- *"Todo sobre el número X"* (trazado repetido del dígito, cuenta de objetos con icono temático,
  representación en cuadrícula tipo ficha de diez/dados, manitas mostrando el número con los
  dedos): **confirmado, es un tipo de ejercicio nuevo genuino**. Candidato: **`numero_del_dia`**
  (o `formacion_numero`). Nota de alcance: esto es contenido típico de Infantil (reconocimiento y
  trazo básico 0-10), no estrictamente currículo LOMLOE de Primaria — consultado con el usuario,
  se anota igualmente como candidato para 1º, ya que encaja con el tipo de alumnado con el que
  trabaja la maestra al empezar el curso. Viable en su mayor parte con patrones que ya existen: el
  conteo de objetos reutiliza `ICONOS_DISPONIBLES` (igual que `conteo_svg`), la cuadrícula
  tipo diez-marco es una variante de `rejilla_numerica`/`cuadro_numerico`, y el trazado del dígito
  es maquetación CSS (texto en contorno/punteado para repasar). La única pieza realmente nueva es
  el catálogo de "manitas contando" (0 al 10) — un catálogo pequeño y cerrado de 11 iconos, mismo
  patrón que `ICONOS_DISPONIBLES`, no un banco de ilustraciones grande.

---

## FASE 4 — Diferenciación visual por asignatura y curso
**Estado: 💭 Abierta — sin decidir alcance ni cuándo** · **Banco de
ilustraciones (Opción C) se trabaja en otro hilo/IA aparte (ver decisión
de foco en Fase 3); las mejoras de Opción A (CSS/SVG, sin banco) siguen
abiertas a instrucciones en este hilo.**

**30/08/2026 — recordatorio de urgencia del propio usuario, con el curso a punto de empezar**:
el cierre de la Fase 3 es "provisional, como siempre" — en cuanto empiece el curso en las aulas,
la maestra que asesora al usuario pedirá previsiblemente más tipos de ejercicio (de momento solo
se han cubierto los que ha ido pidiendo puntualmente, no un catálogo exhaustivo). Además, el
usuario ha comparado nuestras fichas con las de Twinkl y Santillana y las nota "muy estáticas" al
lado de las suyas, mucho más visuales y con más dibujo. Esto no es una sorpresa nueva — es
exactamente la brecha que ya identificó la sesión del 04/08 (ver más abajo, comparación con
`Educa_5_GPT_002.png`) y la razón de ser de esta Fase 4 — pero el usuario la trae ahora como algo
más urgente de lo que estaba tratándose (open, sin fecha) dado que el curso empieza pronto.

**Decisión (misma fecha)**: se mantiene el patrón actual — seguir ampliando tipos de ejercicio
reactivamente según pida la maestra durante el curso, sin adelantar todavía el piloto de la
Opción C ni comprometerse a ningún camino concreto de la Fase 4. El usuario consultó
específicamente con la maestra si el estilo tan ilustrado de Twinkl/Santillana es lo que de
verdad hace falta o si es más bien gusto personal: **la maestra responde que la inmensa mayoría
del profesorado prefiere fichas visuales, porque ayudan al niño a entender mejor el contenido**
— no es un capricho estético, es un dato pedagógico real a favor de acabar abordando esta fase.
Queda anotado como el dato más fuerte a favor de la Opción C (banco de ilustraciones) cuando
llegue el momento de retomar la Fase 4, aunque por ahora no se actúa sobre él.

Pregunta planteada: hoy solo hay una variable de diferenciación visual
(`curso-inicial`, 1º-3º vs el resto — tipografía). No hay ninguna diferencia
visual por **asignatura**. Un 1º de Matemáticas y un 1º de Inglés se ven
iguales salvo el contenido.

### Referencia externa (sesión 04/08/2026)

Se comparó una ficha real (`Educa_5_GPT_002.png`, Educación Física /
Baloncesto) generada con IA de imagen (no con HTML/CSS) como referencia de
"qué tan agradable a la vista debería ser una ficha". Conclusiones:

- Esa imagen es **una sola ilustración plana** (texto pintado, no editable,
  no adaptable al currículo) — es un producto de otra tecnología
  (generación de imagen), no de maquetación HTML/CSS. No es directamente
  replicable con nuestro enfoque, ni es deseable copiarlo del todo: perdería
  justo lo que hace fuerte a la app (contenido pedagógico real, generado por
  Claude, verificable y editable).
- **Techo de lo alcanzable solo con CSS/SVG** (sin generación de imágenes):
  bordes decorativos a juego con el tema, tipografía con carácter (Fredoka),
  insignias circulares de color (ya implementadas para la numeración),
  iconos SVG lineales simples. Agradable y 100% fiable/imprimible, pero no
  llega al nivel de ilustración de personaje/escena de la referencia.
  Prototipo de esto ya probado en el chat de esta sesión (tema baloncesto).

### Opciones sobre la mesa (sin decidir todavía)

- **Opción A — Solo CSS/SVG** (sin coste nuevo, sin riesgo, techo visual
  limitado). Cambio pequeño, se puede hacer ya sobre el motor actual.
- **Opción B — Generación de imagen por IA en cada ficha** (llamada extra
  al generar). Descartada como primera opción: coste y latencia por ficha,
  y calidad/estilo variable entre generaciones (no determinista, a
  diferencia del resto del sistema).
- **Opción C — Banco propio de ilustraciones PNG/SVG** (recomendada como
  siguiente paso a explorar). Igual patrón que ya usamos con los iconos de
  conteo (`ICONOS_DISPONIBLES`): catálogo cerrado y aprobado por adelantado,
  etiquetado por tema/materia, y el sistema elige de ahí — nunca genera
  nada nuevo en tiempo real. Determinista, rápido, sin coste recurrente por
  ficha. Requiere trabajo previo de contenido (no de código):
  - Crear el banco: encargar a un ilustrador, comprar un pack de clip art
    con **licencia comercial redistribuible** (revisar la licencia con
    cuidado — para SaaS de pago no vale una licencia personal/editorial),
    o generar con IA de imagen y curar a mano (revisando también los
    términos de uso comercial del servicio usado).
  - Decidir cuánto banco hace falta para que no se note la repetición
    ficha tras ficha.

**Recomendación de la sesión**: no construir el banco completo para las 6
asignaturas de golpe. Empezar con un **piloto pequeño** — 8-10 ilustraciones
de un solo tema (ej. deportes en Educación Física) — montar la integración
técnica con ese piloto, y decidir con eso delante si se escala al resto.

**Próximo paso**: decidir si se persigue la Opción C (y con qué piloto) o
si de momento se queda en Opción A, antes de tocar código aquí.

### Opción D — Imagen propia subida por el docente (10/08/2026)
**Estado: ✅ Validada en local (11/08/2026)**

Cuarta opción, independiente de la A/B/C y compatible con ellas: el docente
sube su propia imagen (foto de libro, dibujo escaneado, captura de pizarra
digital) desde su ordenador.

**Pivote de diseño (11/08/2026):** la primera implementación insertaba la
imagen DENTRO de la caja del `.ejercicio` que la activaba. Probado en local,
no era el resultado buscado — el docente quería un bloque totalmente
independiente, libre sobre la página, sin atarse a la alineación de los
ejercicios. Rehecho como bloque flotante:

- La imagen es un `<div class="imagen-flotante">` colgado directamente de
  `.ficha` (`position: absolute`), no de `.ejercicio`. `.ficha` pasa a tener
  `position: relative` para servir de ancla.
- Se sigue disparando desde el botón "🖼️" de un ejercicio concreto (mismo
  patrón que el botón "+" de pista), pero solo como punto de partida
  cómodo — el botón NO desaparece tras usarse, así que se pueden insertar
  varias imágenes sueltas desde el mismo o distintos ejercicios.
- **Arrastrable**: manija (⠿) visible en modo edición al pasar el ratón;
  el docente la mueve a cualquier punto del A4. Movimiento limitado a los
  límites de `.ficha` (no se puede "perder" fuera de la página).
- **Redimensionable**: tirador nativo de esquina (`resize: both`), igual
  que los ejercicios.
- **Puede solaparse** con el texto de los ejercicios — z-index por encima,
  el docente decide dónde colocarla con cuidado de no tapar lo importante.
- Botón de borrado directo (×) en la esquina, sin depender de seleccionar
  y pulsar Retroceso.
- **Sin marco (11/08/2026)**: se quitaron el borde, el fondo blanco y la
  sombra permanentes del bloque — si el docente sube un PNG con
  transparencia real, se ve lo que hay debajo a través de las zonas
  transparentes, en vez de quedar tapado por un fondo blanco opaco. Se
  añadió en su lugar un contorno punteado *solo visible en pantalla, en
  modo edición y al pasar el ratón* (para saber dónde está el límite de la
  caja al arrastrar/redimensionar), oculto explícitamente en impresión.
- No depende del banco de ilustraciones (Opción C), que se desarrolla en
  otro hilo aparte y aún no está listo para conectar — esta opción no
  bloquea ni espera a ese trabajo.
- **Sin backend ni persistencia**: la imagen se lee en el propio navegador
  del docente (`FileReader` → `base64`), sin pasar por el servidor.
  Coherente con que cada ficha se genera al vuelo sin guardarse (sección 9
  del contexto original). Se pierde si se recarga la página sin haber
  impreso/exportado antes, igual que el resto de ediciones en vivo.
- Límite de tamaño de archivo (4 MB) y validación de que el archivo sea
  realmente una imagen.
- Valorado como diferencial competitivo real: la mayoría de generadores de
  fichas con IA equivalentes producen una imagen plana no editable — aquí
  el docente controla dónde y qué imagen añade, con transparencia real,
  sobre una ficha que sigue siendo pedagógicamente generada y editable.

- [x] Botón "🖼️ Añadir imagen" por ejercicio, como punto de partida.
- [x] Selector de archivo, lectura a base64, inserción como bloque
      independiente (no dentro del ejercicio).
- [x] Bloque flotante: `position: absolute` sobre `.ficha`, arrastrable
      (manija ⠿) y redimensionable (tirador nativo).
- [x] Botón de borrado directo.
- [x] Validación de tipo (`image/*`) y tamaño máximo.
- [x] Oculto en impresión (manija, botón de borrado, contorno de edición);
      imagen protegida de edición de texto accidental
      (`contenteditable="false"`, igual que SVGs y otras estructuras clave).
- [x] Sin marco/fondo — transparencia real de PNG respetada, tanto en
      pantalla como en impresión.
- [x] Validado con prueba real del docente en su entorno local (11/08/2026):
      arrastre, solape con texto, transparencia PNG e impresión a PDF,
      todo con el resultado esperado.
- [ ] Pendiente de decidir si se comprime/redimensiona la imagen con
      `<canvas>` antes de insertarla (mejora de rendimiento con fotos muy
      pesadas, no bloqueante — el límite de 4 MB ya cubre el caso general).
- [ ] Pendiente de probar el caso de una ficha que ocupa más de una página
      (2-3 páginas, ver Fase 7): al ser `position: absolute` con coordenadas
      fijas respecto a `.ficha`, no se ha comprobado todavía si una imagen
      colocada cerca del final de la página 1 se comporta bien si el salto
      de página cae encima suyo.

---

## FASE 5 — Migrar el resto de asignaturas al patrón JSON + renderizador
**Estado: ⏳ Pendiente**

Orden sugerido (a confirmar): Lengua Castellana → Conocimiento del Medio →
Inglés → Educación Física → Música. El motor (JSON + renderizador) ya existe
y es compartido — migrar una asignatura nueva NO es reconstruir el motor,
es: definir sus tipos de ejercicio propios, escribir su porción de
`SYSTEM_PROMPT` (condicional por curso, como en Matemáticas) y sus funciones
de renderizado en un `renderer-<asignatura>.js` nuevo.

- [ ] Lengua Castellana
- [ ] Conocimiento del Medio
- [ ] Inglés
- [ ] Educación Física
- [ ] Música

---

## FASE 6 — Producto más amplio (heredado del roadmap anterior, aún vigente)

Del `CONTEXTO_FICHAS_ESCOLARES.md` original, sección 9 — sigue pendiente y
no se ha tocado en esta sesión:

- [ ] Mejorar el formulario: ejemplos de instrucciones, sugerencias por
      asignatura.
- [ ] Que la Comunidad Autónoma seleccionada afecte de verdad al contenido
      (hoy es genérico LOMLOE en todos los casos).
- [ ] Idiomas cooficiales con contenido real (hoy el selector existe pero
      no está comprobado a fondo).
- [ ] Autenticación de usuarios, histórico de fichas (Supabase), despliegue
      (Railway) — pospuesto hasta tener más cursos y asignaturas validados.
- [ ] Expansión a Secundaria/Bachillerato y a Latinoamérica — largo plazo.

---

## FASE 7 — Optimización de maquetado y paginación (💭 abierta, 07/08/2026)
**Estado: 💭 Abierta — sin decidir alcance ni cuándo**

Problema detectado probando fichas reales de varios cursos: algunas fichas
ocupan 2-3 páginas al imprimir, con bastante espacio en blanco en la última
página o entre ejercicios. Ya se corrigió un caso puntual (agrupar varias
operaciones bajo un mismo ejercicio en vez de una por ejercicio, ver Fase 3,
nota del 05/08/2026), pero el problema de fondo es más general: el
maquetado actual coloca los ejercicios en flujo simple, uno debajo de otro,
sin ningún mecanismo que intente aprovechar mejor la página (por ejemplo,
distribuir en 2 columnas cuando el contenido es corto, o avisar/recolocar
si un ejercicio se va a quedar solo en una página nueva dejando la anterior
medio vacía).

**No confundir con Fase 4** (diferenciación visual/banco de ilustraciones)
— esto es un problema de aprovechamiento de espacio y coste de impresión
(páginas de más), no de estética.

Preguntas abiertas, sin decidir:
- ¿Maquetado en columnas cuando el contenido de un curso/materia es corto,
  en vez de una sola columna siempre?
- ¿Debe el sistema calcular cuánto contenido "cabe" y ajustar cuántos
  ejercicios genera Claude en consecuencia, en vez de generar un número fijo
  y ver después cuántas páginas ocupa?
- ¿Vale la pena un modo "denso" opcional para el docente (menos espaciado,
  pensado para ahorrar papel) frente al modo actual (más aire, pensado para
  que el alumno escriba cómodo)? Puede que ambos objetivos choquen y haya
  que priorizar uno según el contexto de uso.

**Próximo paso**: no tocar código todavía — reunir 4-5 fichas reales de
distintos cursos/materias que se hayan quedado con mucho espacio en blanco,
mirarlas juntas y decidir el enfoque antes de implementar nada (mismo
criterio que se usó para decidir la Fase 4).

---

## FASE 8 — Idiomas adicionales (💭 abierta, 30/08/2026)
**Estado: 💭 Abierta — sin decidir alcance ni cuándo**

Origen: un docente pidió rumano, portugués y árabe además de los idiomas
cooficiales ya disponibles. Al revisar el código para valorar la petición
se encontró que el selector de idioma (`public/index.html`: Español,
Catalán/Valenciano, Gallego, Euskera) **nunca se ha validado a fondo**
(esto ya estaba anotado como pendiente en la Fase 6) — y apareció un hueco
real que afecta a los idiomas que YA existen, no solo a los nuevos.

### Hallazgo previo — no es parte de esta fase en sí, pero la bloquea en la práctica

`idioma` se inyecta como texto libre en el prompt (`server.js`,
`construirPromptMatematicas()` / `construirPrompt()`), pero **nunca llega a
`renderer-matematicas.js`**. El motor JSON+renderizador de Matemáticas
(Fase 2) tiene varias etiquetas fijas escritas directamente en español en
el código, no en el prompt: los 4 bloques de `problema` en 1º-3º
("Enunciado" / "Datos" / "Operación" / "Resultado"), las etiquetas de
`figura_geometrica` en modo perímetro/área ("Perímetro" / "Área"), y el
pie de página (`nota-pie`, "Ficha generada con LOMLOE..."). Hoy mismo, una
ficha de Matemáticas en catalán, gallego o euskera sale con el contenido
de los ejercicios traducido pero esas etiquetas estructurales en español —
mezclado. Es un cambio acotado (~6 cadenas de texto + pasar `idioma`
desde `server.js` hasta el renderizador) pero debe resolverse antes de dar
por "soportado" cualquier idioma no castellano en Matemáticas, sea de los
actuales o de los nuevos.

- [ ] Traducir las etiquetas fijas del renderizador de Matemáticas y pasar
      `idioma` hasta `renderer-matematicas.js` — beneficia también a
      catalán/gallego/euskera, no es exclusivo de los idiomas nuevos.

### Bloque A — Idiomas europeos (escritura latina, izquierda-a-derecha)

Candidatos inmediatos: **rumano** y **portugués**. Mecánicamente sencillo
— `idioma` ya es texto libre inyectado en el prompt, sin cambios de
arquitectura. Comprobado directamente en las fuentes autoalojadas del
proyecto (`public/fonts/`):

- Andika (cuerpo de texto), Nunito y Quicksand cubren sin problema los
  caracteres especiales de rumano (ș ț ă â î) y portugués (ã õ ç).
- **Fredoka** (`--fuente-titulo`, usada en `.titulo-ficha` y otros
  elementos destacados) **no tiene ș, ț ni ă** — un título en rumano con
  esas letras (muy probable que las lleve) caería a la fuente de reserva
  del sistema justo en el elemento más visible de la ficha.

Pendiente (no empezado):
- [ ] Añadir rumano y portugués al desplegable de idioma.
- [ ] Resolver el título en rumano: usar Nunito/Quicksand para
      `--fuente-titulo` cuando idioma=Rumano, o buscar una fuente con más
      cobertura si se quiere mantener el estilo Fredoka.
- [ ] Validar con fichas reales generadas por Claude (metodología
      habitual del proyecto): confirmar que usa terminología curricular
      adecuada al idioma, no solo traducción literal.
- [ ] Decidir si se añaden a la vez otros idiomas latinos sin cambio de
      dirección de escritura (francés, italiano, inglés, alemán — mismo
      nivel de dificultad que rumano/portugués) o se dejan para otra
      ronda.

### Bloque B — Árabe / hebreo (RTL)

A petición del usuario se añade hebreo junto al árabe pedido por el
docente — comparten el mismo tipo de problema. A diferencia del Bloque A,
esto no es "añadir una opción al desplegable": cambia la dirección de
escritura y requiere una fuente distinta. Tres problemas identificados
(no solo el de RTL):

1. Ninguna fuente del proyecto tiene glifos árabes ni hebreos (comprobado
   directamente). Haría falta añadir y autoalojar una fuente nueva por
   cada script, igual que se hace hoy con Andika/Fredoka/Nunito/Quicksand
   (para árabe hay alternativas OFL — Noto Naskh Arabic, Cairo,
   Almarai...; para hebreo habría que buscar el equivalente con licencia
   compatible).
2. **RTL real, no solo `dir="rtl"` global**: la prosa, tablas y
   formularios sí deben invertirse, pero por convención internacional
   (incluso en documentos en árabe/hebreo) las operaciones aritméticas en
   columna, rectas numéricas, cuadro numérico, gráficos, etc. se
   mantienen en LTR dentro de la página RTL. Hay que revisar varios de
   los 18 tipos de ejercicio de Matemáticas uno a uno, no es un cambio de
   una sola clase CSS global.
3. Las etiquetas fijas hardcodeadas del hallazgo previo habría que
   traducirlas Y revisar su posición en contexto RTL.

Pendiente (no empezado, sin alcance cerrado):
- [ ] Decidir con cuál de los dos (árabe, hebreo, o ambos a la vez) se
      empieza.
- [ ] Elegir y autoalojar la fuente correspondiente a cada script.
- [ ] Mapear qué tipos de ejercicio de Matemáticas necesitan revisión de
      layout en RTL y cuáles se quedan igual (los bloques aritméticos).
- [ ] Decidir sistema de numerales (arábigos occidentales "123" vs.
      orientales "١٢٣") — probablemente occidentales, a confirmar con el
      docente que lo pida.
- [ ] No empezar sin al menos una ficha de referencia real en árabe o
      hebreo delante, mismo criterio que se usó para decidir la Fase 4.

**Próximo paso**: no tocar código todavía en ninguno de los dos bloques.
El Bloque A es candidato razonable para abordar pronto (complejidad baja,
una vez resuelto el hallazgo previo). El Bloque B necesita su propia
sesión dedicada a decidir alcance con referencias reales delante, igual
que se hizo con la Fase 4 y la Fase 7 — no mezclar ambos bloques al
reportar avances o dudas, son proyectos de tamaño muy distinto aunque
compartan el mismo origen (petición de idiomas nuevos).

---

## Cómo usar este documento en la próxima sesión

1. Antes de pedir un cambio nuevo, mira si encaja en una fase existente.
2. Si es una duda de diseño sin decidir (como la Fase 4), márcala como 💭
   y no la resuelvas a medias dentro de otra conversación — dedícale su
   propio hueco.
3. Al cerrar una fase, actualiza su casilla a ✅ y anota la fecha si es
   relevante.
4. Si una fase revierte una "decisión descartada" de `CONTEXTO_FICHAS_ESCOLARES.md`,
   anótalo explícitamente (como se hizo arriba con JSON+plantillas) para que
   no queden documentos contradictorios.
