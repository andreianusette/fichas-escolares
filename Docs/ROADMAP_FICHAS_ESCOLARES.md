# ROADMAP DEL PROYECTO — Generador de Fichas Escolares

*Última actualización: nueva Fase 7 (maquetado/paginación) añadida como
pendiente 💭 tras detectar fichas de 2-3 páginas con espacio en blanco;
además de la decisión de foco — validación curso/asignatura en este hilo,
banco de ilustraciones en otro hilo/IA (05/08/2026)*

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
**Estado: 🔄 En curso** · **Fase activa de este hilo (decisión 05/08/2026)**

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
- [ ] Pendiente de confirmar en fichas reales generadas por el docente
      (con su API key) que Claude elige bien los iconos nuevos según el
      contexto/temática pedida en instrucciones especiales.

| Curso | Estado |
|-------|--------|
| 1º | ⏳ Pendiente de revalidar con el motor JSON nuevo (validado antes con el sistema HTML viejo) |
| 2º | ⏳ Pendiente de revalidar con el motor JSON nuevo |
| 3º | ⏳ Sin validar con ficha real |
| 4º | ⏳ Sin validar con ficha real |
| 5º | ✅ Validado (contenido/generativo) — 05/08/2026, ficha `Mates_5_C_007.pdf`. Visual pendiente de feedback del maestro (revisor distinto, ver nota de reparto de validación más abajo). |
| 6º | ⏳ Sin validar con ficha real |

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
B/N). **Pendiente** (igual que el resto de tipos nuevos de esta fase): confirmar con una ficha
real generada por Claude, no solo con datos simulados a mano.

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
darlo por bueno. **Pendiente** (igual que el resto de tipos de esta fase): confirmar con
ficha real generada por Claude.

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
visualmente con Playwright antes de darlo por bueno. **Pendiente**: confirmar con ficha real
de 1º y 2º generada por Claude.

---

## FASE 4 — Diferenciación visual por asignatura y curso
**Estado: 💭 Abierta — sin decidir alcance ni cuándo** · **Banco de
ilustraciones (Opción C) se trabaja en otro hilo/IA aparte (ver decisión
de foco en Fase 3); las mejoras de Opción A (CSS/SVG, sin banco) siguen
abiertas a instrucciones en este hilo.**

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
