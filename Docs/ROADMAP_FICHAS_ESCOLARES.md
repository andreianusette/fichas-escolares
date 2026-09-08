# ROADMAP DEL PROYECTO — Generador de Fichas Escolares

*Última actualización (08/09/2026, misma tarde, tras el análisis del Megapack 2026): el usuario
planteó una duda de UX que no estaba recogida en el roadmap — con 41 tipos de ejercicio ya
implementados en Matemáticas, el docente no tiene forma de saber cuáles existen al rellenar
"Instrucciones especiales". Tras valorar tres caminos, se decidió un pop-up modal con botones (uno
por tipo disponible para el curso elegido, agrupados por "sentido" LOMLOE, nombre amigable +
descripción, nunca la clave interna) que rellena ese textarea al pulsarlos — cambio 100% de
frontend, no toca `server.js` ni los renderizadores. Implementado, verificado con `node --check` y
Playwright (recuento de tipos por curso, toggle de selección, persistencia del estado al reabrir) y
documentado — ver nueva subsección "Selector visual de tipos de ejercicio" al final de la Fase 3.
Alcance explícito: solo Matemáticas por ahora, por ser la asignatura más madura; el usuario ya
anticipó que el mismo patrón se replicará en el resto según se vayan migrando a JSON + renderizador
(Fase 5).

Antes de esto (mismo día, misma tarde): el usuario compartió un SEGUNDO PDF, el "Megapack
2026" de Kumubox (catálogo de este mismo curso, ~1130 páginas, restringido a la parte de Primaria
por instrucción explícita del usuario) y se repitió el mismo análisis, anotando solo lo NUEVO
frente al Megapack 2025 ya recogido. Se confirma la hipótesis del usuario: **Religión existe como
asignatura nueva** en el catálogo 2026 (5 recursos, mayoría de corte católico — Fase 5). En
Matemáticas, un tipo nuevo blindado (`numeros_romanos` — los 40 renderers pasan a ser 41, ver
Fase 3, "Quinta ampliación"); en Lengua, tres tipos nuevos blindados (`categoria_gramatical`,
`formacion_palabras`, `eleccion_ortografica`, ver Fase 9) — los cuatro ya validados con datos
simulados y Playwright (color/B-N), pendientes de confirmar con ficha real vía API. Se amplió el
backlog por asignatura (Fase 5) con lo nuevo de 2026 en Ciencias Sociales, Ciencias Naturales,
Inglés, Francés, Música, Educación Física, Educación Artística, ELE, lenguas cooficiales y ACNEAE,
y se amplió la Fase 10 con los recursos nuevos de Gestión Emocional/Gestión del Aula (incluyendo
un conjunto de instrumentos de evaluación en Excel para el docente, formato distinto al resto).
Se anotó también en la Fase 4 una tercera referencia independiente a la falta de "vistosidad
ilustrativa" de las fichas (misma conclusión que Twinkl/Santillana, esta vez comparando con el
propio Megapack), sin decidir ni actuar todavía. Aparte, se identificó que Kumubox tiene su propio
generador de recursos con IA (`app.kumubox.com/generador`, promocionado dentro del propio
Megapack con 100 generaciones gratis 30 días y cupón de suscripción de pago) — primer competidor
directo real encontrado en los dos catálogos estudiados hasta ahora.

Antes de esto (mismo día, por la mañana, Megapack 2025): el usuario compartió el PDF "Megapack
2025" de Kumubox (marketplace de recursos para Primaria de más de 100 docentes, ~500 páginas) y se
comparó su catálogo completo con lo ya implementado. Resultado: en Matemáticas, 3 tipos nuevos
blindados (`mcd_mcm`, `descomposicion_numerica`, `detective_numeros` — los 37 renderers pasan a
ser 40, ver Fase 3); en Lengua, 3 tipos nuevos blindados (`relacionar`, `clasificar_silabas`,
`acentuacion`, ver Fase 9) — los seis ya validados con datos simulados y Playwright (color/B-N),
pendientes de confirmar con ficha real vía API. Para el resto de asignaturas, solo se ANOTÓ el
catálogo del Megapack como backlog por asignatura (Fase 5), sin implementar nada todavía —
incluye la decisión de dividir "Conocimiento del Medio" en Ciencias Naturales/Ciencias Sociales y
añadir Francés como asignatura nueva. Se abrió también la Fase 10 (Gestión Emocional y Gestión
del Aula), una línea de contenido transversal detectada en el mismo catálogo, sin decidir alcance
todavía. También se anotó en la Fase 8 (Bloque C, sin urgencia) el diseño para generar la MISMA
ficha en dos idiomas a la vez (mismos números/ejercicios, solo cambia el texto) — pregunta del
usuario sobre un caso de aula real con un alumno no hispanohablante entre compañeros
hispanohablantes; depende del hallazgo previo de esa misma fase (idioma sin llegar a los
renderizadores). Antes de esto: FASE 9 (05/09/2026, decimotercera pasada) — revisadas 5 fuentes nuevas
subidas por el usuario: Dimica (OFL confirmada por partida doble, instalada y lista), Minimasimple
(licencia probablemente libre pero le faltan ñ/acentos españoles, NO usable tal cual), Aref Ruqaa
Ink y Cairo Play (árabe, OFL real con OFL.txt oficial, cobertura completa con GSUB/GPOS, instaladas
para la Fase 8), y GWM Sans Arabic (fuente corporativa de pago de Great Wall Motors/Monotype, "All
Rights Reserved" — NO instalada, se recomienda al usuario borrarla). Antes, en la duodécima pasada,
se construyó de verdad la fuente combinada "Escolar Ligada" (minúsculas de Little Days +
mayúsculas/dígitos/puntuación de Baloo 2), con `fontTools`: la maestra SÍ aprobó esta combinación
pese a que a Claude no le convenciera visualmente en la pasada anterior, por un motivo pedagógico (la
mayúscula más gruesa ayuda a los niños a distinguir mayús/minús). Guardada en
`public/fonts/escolar-ligada/`, con `@font-face` y LICENCIA.txt — lista para usarse, pero sin
aplicar aún a ningún ejercicio (Cole Carreira sigue siendo la fuente del punteado de puntitos; esta
es para un futuro trazo continuo, sin diseñar todavía). Antes, en la undécima pasada, se probó la
idea de mezclar mayúsculas de otra fuente con
las minúsculas de "Little Days": resulta que Little Days es una caligráfica de lazos muy ornamentada
(no letra escolar sencilla), y ninguna de las 4 candidatas de mayúsculas probadas entonces (Comic
Neue, Baloo 2, Andika, Fredoka — las 4 con licencia limpia) combinaba bien con ella a ojos de Claude
— se veía como dos alfabetos pegados; la maestra, sin embargo, decidió lo contrario (ver arriba).
Antes, en la décima pasada, descartada
la fuente "Not Comic" (Harrisson, propuesta por el usuario): buenas noticias falsas alarmas aparte
(SÍ tiene Ñ y acentos españoles), pero el propio archivo `.ttf`/`.otf` lleva grabado "Copyright
Microsoft Corporation" y "Comic Sans is a trademark of Microsoft" pese a declararse OFL en su
README — conflicto de licencia dentro del propio archivo, más serio que los casos anteriores. No
instalada. Además, confirmado que sus minúsculas no llevan el rabito de enganche que pide la
maestra. Antes, en la novena pasada, se
investigó si se podría pagar una licencia comercial para alguna de las 5 fuentes descartadas en la
octava pasada; encontrada una vía real para "Mestra1(MeMimaPautada)" (es la versión gratuita/escolar
de "Memimas", de la fundición Type-Ø-Tones, que sí se vende comercialmente), sin vía visible para
las otras 3 — nada de esto se ha comprado ni instalado, es solo información para decidir más
adelante. Antes, en la octava pasada, se descartaron 5 fuentes sin licencia libre de una web de
maestros, y la familia "Edu" de Google Fonts por estilo cursivo no adecuado. Y antes, en la séptima
pasada, la rejilla pequeña punteada de
"trazo_letra" pasa a usar texto real en la fuente autoalojada "Cole Carreira" (aprobada por la
maestra para mayúsculas, minúsculas y números) en vez de un punteado dibujado a mano; la rejilla
grande sigue con nuestro esqueleto propio. Se intentó primero derivar de Cole Carreira una
versión sólida (sin puntos) por procesado de imagen, para que ambas rejillas vinieran de la misma
fuente — descartado: funcionaba bien en minúsculas redondas pero dejaba mayúsculas/números con
huecos o sobregrosor, exigiendo ajuste letra a letra. Coste aceptado a propósito: la rejilla
pequeña pierde las flechas de dirección y el número de orden de trazo (los puntos de una fuente
no llevan esa información). De paso, corregido un bug ya existente: `o()`/`O()` dibujaban un
círculo con un único arco SVG de 360° (caso degenerado, inicio=fin, el navegador no lo pintaba) —
la "o"/"O" grande llevaba invisible desde que existe el modelo sólido. Ver detalle completo en
Fase 9, más abajo, y en la sección 13 de REFERENCIA_CLASES_HTML_FICHAS.md.*

Resumen de pasadas anteriores de esta misma Fase 9 — trazo de letras en Lengua Castellana (catálogo
inicial de 10 letras × mayús/minús: vocales + m,p,l,s,t), a petición de una maestra para un niño
de 1º sin base lectoescritora. Corregido tras comparar con una ficha real y referencias externas:
la `a`/`e` minúsculas necesitaban el "rabito" de salida de la letra escolar española real, no un
print genérico. Se probó también usar la fuente Playwrite ES como modelo grande de referencia —
retirada por completo en una cuarta pasada: el modelo grande se dibuja con nuestro propio
esqueleto (el mismo que el punteado), como trazo grueso y sólido, garantizando que modelo y
punteado sean siempre la misma letra sin depender de ninguna fuente externa. En una quinta pasada
(05/09/2026), siguiendo otra referencia real (varias copias grandes para colorear + muchas
copias pequeñas punteadas para repasar), el ejercicio se rediseñó del todo: ya no es un modelo
único + casillas en blanco, sino dos rejillas repetidas (`repeticionesGrandes`/
`repeticionesPequenas`) — ver el final de la Fase 9 para ambos cambios. Se evaluaron además dos
fuentes candidatas ajenas a Google Fonts (Little Days, Cole Carreira, con su licencia verificada
y documentada) para un uso todavía por decidir, distinto del modelo grande. Migrada también a
pipeline JSON +
renderizador propio (`renderer-lengua.js`): Lengua Castellana deja el pipeline legacy y pasa a
responder solo JSON, con "trazo_letra" como primer tipo blindado y "contenido_libre" como
válvula de escape para el resto de ejercicios todavía sin tipo propio — motivo: generar toda la
ficha en HTML libre cada vez era un desgaste innecesario, sin las garantías de blindaje que ya
tiene Matemáticas. También se aclaró el alcance de la Fase 5 (migración gradual, no por
asignatura completa de golpe — ver esa fase). Ver detalle en las fases correspondientes, al
final del documento. Antes de eso: Fase 3 CERRADA en lo esencial (30/08/2026). El
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

### Auditoría curricular completa contra el RD 157/2022 (07/09/2026)

**Motivo**: tras cerrar el paréntesis de trazo de letras de Lengua (Fase 9), el usuario pidió
volver a Matemáticas y comprobar dos cosas antes de seguir con Lengua: (1) confirmar que los 6
cursos siguen validados (respuesta: sí, ver tabla de cursos más arriba, cerrada el 30/08/2026,
sin cambios desde entonces) y (2) buscar en el propio currículo oficial —no solo en comparación
con Twinkl, que es lo que se había hecho hasta ahora— qué contenidos de Matemáticas de Primaria
todavía no tienen ningún tipo de ejercicio. La comparación con Twinkl (entradas de arriba) parte
de fichas concretas que el usuario ha visto; esta auditoría parte al revés, de la propia norma
(Real Decreto 157/2022, Anexo de Matemáticas), para no depender de qué fichas de terceros se
hayan visto por casualidad.

**Estructura oficial** (los "saberes básicos" de Matemáticas en Primaria se organizan en 6
"sentidos", cada uno con sus propios sub-bloques — fuente: Anexo de Matemáticas del RD 157/2022):

- **A. Sentido numérico**: conteo · cantidad · sentido de las operaciones · relaciones ·
  razonamiento proporcional · **educación financiera**.
- **B. Sentido de la medida**: magnitud · medición · estimación y relaciones.
- **C. Sentido espacial**: figuras geométricas 2D/3D · localización y sistemas de representación ·
  movimientos y transformaciones · visualización y razonamiento geométrico.
- **D. Sentido algebraico**: patrones · modelo matemático · relaciones y funciones · pensamiento
  computacional.
- **E. Sentido estocástico**: organización y análisis de datos · incertidumbre · inferencia.
- **F. Sentido socioafectivo**: actitudes/emociones ante las matemáticas, trabajo en equipo — es
  transversal (una forma de plantear cualquier ejercicio, no un contenido propio), así que no le
  corresponde un tipo de ejercicio propio y se descarta de este análisis.

**Cruce con los 21 tipos ya implementados** (`RENDERERS_POR_TIPO`, `renderer-matematicas.js`):

- **A (numérico) — bien cubierto**, salvo un hueco notable: `operacion_vertical`,
  `multiplicacion_vertical`, `division_vertical`, `calculo_mental`, `conteo_svg`,
  `comparar_numeros`, `rejilla_numerica`, `cuadro_numerico`, `tabla_multiplicar`, `reparto`,
  `problema`, `tipo_test` cubren conteo/cantidad/operaciones. **"Educación financiera" es un
  sub-bloque con nombre propio en la norma y hoy no tiene NINGÚN tipo de ejercicio** — no existe
  nada de contar monedas/billetes de euro, calcular vueltas/cambio o comparar precios.
  "Razonamiento proporcional" (proporcionalidad, regla de tres simple, típico de 5º-6º) tampoco
  tiene tipo propio — hoy solo se podría abordar como `problema` de texto libre, sin blindaje.
- **B (medida) — el hueco más grande de los 6 sentidos**: de sus tres sub-bloques
  (magnitud/medición/estimación), el catálogo actual solo cubre una magnitud, el tiempo
  (`reloj_analogico`). Ninguna magnitud más (longitud, masa, capacidad, superficie), ninguna
  medición con instrumento (ya estaba anotado como pendiente el 05/08 — "medir con regla" — sigue
  sin implementar), y ninguna conversión de unidades (m↔cm, kg↔g, l↔ml). El "perímetro/área" de
  `figura_geometrica` (modo `perimetro_area`, 4º-6º) es lo único que roza este sentido aparte del
  reloj.
- **C (espacial) — parcialmente cubierto**: `figura_geometrica` cubre bien el primer sub-bloque
  (figuras 2D/3D: identificar, propiedades, clasificar, perímetro/área). Los otros tres
  sub-bloques no tienen nada: "localización y sistemas de representación" (coordenadas en una
  cuadrícula/plano, tipo "el punto está en la columna C, fila 4"), "movimientos y
  transformaciones" (simetría — completar la mitad de una figura, ejes de simetría —, traslaciones,
  giros) y, dentro de "visualización y razonamiento", los ángulos (identificar/clasificar/medir
  recto-agudo-obtuso) no aparecen en ningún tipo actual.
- **D (algebraico) — cubierto solo de forma parcial**: `serie_numerica` cubre "patrones"
  (progresiones). "Relaciones y funciones" (tablas de relación tipo x→y, no confundir con
  `cuadro_numerico`, que es una tabla de sumar/restar) y "modelo matemático" en su forma más
  típica de Primaria (ecuaciones sencillas con la incógnita como hueco, ej. `☐ + 5 = 12` o
  `8 × ☐ = 24`) no tienen tipo propio hoy — de nuevo, solo abordable como `problema` suelto sin
  blindaje. "Pensamiento computacional" (secuencias de instrucciones/diagramas de flujo simples)
  es el sub-bloque más nuevo y menos consolidado en el aula real, no se propone como candidato
  inmediato.
- **E (estocástico) — bien cubierto en "organización y análisis de datos"**
  (`tabla_frecuencia`, `grafico_barras`, `grafico_quesitos`), **vacío en los otros dos**:
  "incertidumbre" (probabilidad — sucesos seguro/posible/imposible, más o menos probable, con
  dado/moneda/ruleta) e "inferencia" (medidas de centralización — media, moda, mediana; currículo
  real de 5º-6º) no tienen ningún tipo hoy.

**Candidatos nuevos que añade esta auditoría** (no estaban en la lista de arriba, que salió de
comparar con Twinkl, no de leer la norma directamente) — igual que los anteriores, ninguno
depende del banco de ilustraciones de la Fase 4, todos son maquetables con SVG/HTML propio:

1. **`dinero_euros`** (sentido numérico — educación financiera): monedas/billetes de curso legal
   dibujados (catálogo cerrado, mismo patrón que `ICONOS_DISPONIBLES`) para contar una cantidad,
   calcular el cambio de una compra, o comparar qué es más caro. Currículo real desde 2º-3º.
2. **`conversion_unidades`** (sentido de la medida): tabla o serie de equivalencias a completar
   (ej. `3 m = ___ cm`, `2 kg = ___ g`) — puramente textual/tabular, sin necesidad de ilustración,
   muy rápido de implementar con el mismo patrón de blindaje que `cuadro_numerico`.
3. **`medir_con_regla`** (sentido de la medida): segmento u objeto dibujado a escala conocida
   junto a una regla graduada en SVG, el alumno lee la medida — ya estaba anotado como pendiente
   desde el 05/08, esta auditoría solo confirma que sigue siendo el candidato más claro del
   sub-bloque "medición" y que no depende de nada más para empezarlo.
4. **`angulos`** (sentido espacial): ángulos dibujados en SVG para identificar/clasificar
   (recto/agudo/obtuso) o, en cursos superiores, medir con un transportador dibujado igual que la
   regla del candidato anterior.
5. **`simetria`** (sentido espacial): figura con un eje marcado, la mitad dibujada y la otra mitad
   en blanco (o punteada) para que el alumno complete — o, en modo identificar, varias figuras
   para marcar cuáles son simétricas.
6. **`coordenadas`** (sentido espacial): cuadrícula con ejes rotulados (letras en columnas, números
   en filas, o un plano cartesiano simple en cursos altos) para ubicar puntos o leer la posición
   de un punto ya marcado.
7. **`probabilidad`** (sentido estocástico): sucesos con un dado/moneda/ruleta dibujados en SVG
   (reutilizable con el mismo patrón de `FIGURAS_2D`), el alumno clasifica cada suceso como
   seguro/posible/imposible, o los ordena de más a menos probable.
8. **`medidas_centralizacion`** (sentido estocástico): a partir de una lista de datos (mismo
   patrón que ya usa `tabla_frecuencia` en 5º-6º sin iconos), calcular media/moda/mediana —
   currículo real y frecuente de 5º-6º, hoy sin ningún tipo que lo cubra.
9. **`proporcionalidad`** (sentido numérico — razonamiento proporcional): tabla de razón simple
   (ej. "si 2 lápices cuestan 3€, ¿cuánto cuestan 6?") con blindaje de que la proporción sea
   exacta, similar en espíritu a `reparto`. Currículo real de 5º-6º.
10. **`ecuacion_sencilla`** (sentido algebraico — modelo matemático): operación con un hueco en
    lugar de un operando (`☐ + 5 = 12`, `8 × ☐ = 24`) en vez de en el resultado — distinto de
    `calculo_mental` (que siempre pide el resultado) y con blindaje de que el hueco tenga una
    solución entera exacta dentro del rango numérico del curso.

**Total del backlog identificado en esta auditoría (07/09/2026)**: 14 candidatos concretos
(`crucigrama`, `colorea_por_operacion`, `conecta_los_puntos`, `numero_del_dia`, y los 10 de esta
auditoría) — frente a los 21 ya implementados, confirma que la cifra de la maestra ("banco de
50-60 tipos en Twinkl") sigue lejos incluso sumando todo lo identificado hasta ahora;
probablemente aparecerán más candidatos al seguir comparando con fichas reales curso a curso.

### Implementación de los 14 tipos nuevos (07/09/2026, misma sesión)

El usuario dio luz verde a construir los 14 de una vez ("implementa esos 14 nuevos ejercicios"),
con una reserva explícita: *"aunque me parecen pocos 10 ejercicios nuevos si faltan tres bloques
enteros del currículo"* — es decir, considera que el número de tipos nuevos podría quedarse corto
frente al tamaño real del hueco en sentido de la medida/espacial/estocástico. Esa reserva queda
recogida aquí para retomarla: los 14 están implementados y validados, pero **no se ha ampliado la
granularidad** de ningún sentido más allá de lo que ya listaba la auditoría — ver "Posible
ampliación futura" al final de esta sección.

**Los 21 renderers ya existentes pasan a ser 35** (`RENDERERS_POR_TIPO` en
`renderer-matematicas.js`). Mismo patrón que todo el fichero: blindaje por código de cualquier
cantidad derivable, catálogo cerrado en vez de coordenadas/colores libres cuando el resultado
visual depende de que algo "cuadre bien" (una figura reconocible, una paleta legible). Resumen de
cada uno y su gating por curso en `construirSystemPromptMatematicas()` (`server.js`):

- **`dinero_euros`** (todos los cursos): monedas/billetes reales dibujados con un catálogo cerrado
  de denominaciones (0,01€ a 50€); modo "contar" (total en blanco) o "cambio" (precio dado, cambio
  en blanco). Nunca calcula el sistema el total/cambio, siempre lo deja en blanco.
- **`proporcionalidad`** (5º-6º): tabla de dos magnitudes, columna A con valores dados, columna B
  siempre en blanco.
- **`conversion_unidades`** (3º-6º): lista de conversiones con hueco, más una tabla de equivalencia
  de apoyo automática para los pares de unidades más comunes (m↔cm, kg↔g, l↔ml, h↔min...).
- **`medir_con_regla`** (todos los cursos): segmentos dibujados **a escala física real usando
  unidades CSS `cm`** (no píxeles) — al imprimir en A4 a tamaño real, un segmento de 5 cm mide 5 cm
  de verdad, y el alumno lo mide con su propia regla.
- **`angulos`** (3º-6º, modo "clasificar"; 5º-6º además "transportador"): dos semirrectas desde un
  vértice con arco de color; el modo "transportador" añade una escala de 0°-180° superpuesta.
- **`simetria`** (2º-6º): catálogo cerrado de 4 figuras en cuadrícula (`corazon`, `casa`, `flecha`,
  `copa`) — el sistema dibuja siempre solo la mitad, nunca la mitad simétrica (sería la respuesta).
- **`coordenadas`** (3º-6º): plano de primer cuadrante 0-10; modo "localizar" (puntos dibujados,
  coordenadas en blanco) o "representar" (plano en blanco, solo la lista de puntos).
- **`probabilidad`** (todos los cursos modo "clasificar"; 4º-6º además "ordenar"): sin ningún
  cálculo numérico — casillas seguro/posible/imposible, o ranking de más a menos probable. Iconos
  decorativos (dado/moneda/ruleta) de un catálogo cerrado, puramente ilustrativos.
- **`medidas_centralizacion`** (5º-6º): media/moda/mediana a partir de una lista de datos, mismo
  patrón que `tabla_frecuencia` numérica — datos en bruto + hueco por cada medida pedida.
- **`ecuacion_sencilla`** (3º-6º): operación con el hueco en cualquiera de sus tres posiciones (no
  siempre en el resultado). Blindaje: el resultado que se imprime lo calcula siempre el código a
  partir de `a`/`signo`/`b`, nunca se confía en el que mande Claude.
- **`crucigrama`** (2º-6º): crucigrama numérico — rejilla con celdas activas/bloqueadas calculada
  por código a partir de la posición/longitud de cada palabra (máx. 10×10), lista de pistas debajo.
  El sistema nunca calcula ni conoce las respuestas.
- **`colorea_por_operacion`** (1º-4º): mosaico de operaciones + leyenda de colorear por rango de
  resultado. Blindaje de color: la paleta la asigna siempre el sistema por posición, nunca un color
  libre mandado por Claude.
- **`conecta_los_puntos`** (1º-3º): catálogo cerrado de 5 plantillas (`estrella`, `casa`, `pez`,
  `cometa`, `barco`) con coordenadas fijas — mismo criterio que `simetria`, coordenadas libres de
  un modelo de lenguaje no garantizan un dibujo reconocible.
- **`numero_del_dia`** (1º-2º): número grande para trazar + marco de diez (ten-frame) con círculos
  rellenos derivados siempre de `numero` + conteo opcional con iconos ya existentes.

**Validado**: `node --check` en los tres ficheros, render unitario de los 14 tipos con datos de
ejemplo variados, capturas Playwright en modo color y modo blanco y negro (revisadas visualmente
tipo a tipo), regresión de tipos ya existentes (`operacion_vertical`, `reparto`,
`figura_geometrica`), y arranque del servidor real con smoke test de `/api/ficha-en-blanco` y
`/api/iconos`. Dos bugs reales atrapados y corregidos en esta pasada de validación: numeración
duplicada en las pistas del crucigrama (`<ol>` autonumerado + número manual → "1. 1. 8 + 7"), y una
línea de la documentación de `angulos` que mencionaba "transportador" en cursos donde ese modo ni
siquiera está disponible.

**Ampliación de sentido de la medida — implementada el mismo día (07/09/2026)**: la reserva del
usuario quedó resuelta enseguida — pidió abordar ya los dos candidatos anotados arriba
(`pesar_con_balanza`, `medir_capacidad`) para poder enseñárselo todo junto a la maestra antes de
que empezaran las clases al día siguiente. **Los 35 renderers pasan a ser 37.** Sentido de la
medida queda hoy cubierto por 5 tipos: `reloj_analogico` (tiempo, ya existente), `medir_con_regla`
(longitud), `conversion_unidades` (equivalencias genéricas), `pesar_con_balanza` (masa) y
`medir_capacidad` (capacidad/volumen) — los tres últimos, nuevos.

- **`pesar_con_balanza`** (todos los cursos): balanza de dos platillos, dibujada SIEMPRE nivelada
  — nunca inclinada hacia un lado, ni en modo "comparar" (el sistema no sabe realmente cuál pesa
  más, así que no da pistas con la inclinación) ni en modo "pesas" (donde el nivel representa el
  equilibrio real). Modo "comparar": un objeto distinto en cada platillo (catálogo de iconos ya
  existente), hueco para &lt;/&gt;/=. Modo "pesas": un objeto de peso desconocido en un lado y un
  catálogo cerrado de pesas reales en gramos (`DENOMINACIONES_PESO_G`: 1 g a 5 kg) en el otro —
  el alumno suma, el sistema nunca calcula el total.
- **`medir_capacidad`** (todos los cursos): recipientes graduados con el líquido dibujado a su
  nivel real. Modo "leer": el alumno lee y escribe la cantidad que contiene cada recipiente. Modo
  "comparar": dos recipientes ya llenos a su nivel real, uno junto al otro, hueco para &lt;/&gt;/=
  — mismo espíritu que `grafico_barras` en modo "leer" (el dibujo representa el dato real, leerlo
  o compararlo es la habilidad que se practica, no adivinarlo).

Mismo flujo de validación que la tanda anterior: `node --check`, render unitario con datos
variados, capturas Playwright en color y blanco/negro, regresión de tipos existentes, arranque
real del servidor.

**Nota para el futuro — expectativa realista de crecimiento continuo**: al pedir estos dos, el
usuario comentó *"igual tenemos que implementar más ejercicios a lo largo de estos primeros
meses, de todas formas es algo esperable ya que por muchos ejercicios que tengamos, siempre
querrán alguno más"*. Queda aquí registrado como expectativa compartida, no como tarea puntual:
la lista de tipos de Matemáticas seguirá creciendo de forma orgánica según feedback real de la
maestra y los niños, no como un proyecto cerrado con una cifra final — cada vez que aparezca un
hueco curricular o una petición concreta, el patrón a seguir es el mismo de esta sesión (render
function + registro en `RENDERERS_POR_TIPO` + CSS + documentación gateada por curso en
`construirSystemPromptMatematicas()` + validación visual color/B-N).

### Cuarta ampliación — backlog Megapack Kumubox (08/09/2026): mcd_mcm, descomposicion_numerica, detective_numeros

Origen: el usuario compartió el PDF "Megapack 2025" de Kumubox (marketplace de recursos para
Primaria de más de 100 docentes, ~500 páginas) y se pidió, entre otras cosas, comparar su catálogo
de Matemáticas de Primaria (32 recursos) con los tipos ya implementados aquí. Tres huecos
identificados que ni la propia auditoría curricular del 07/09 había detectado, todos de sentido
numérico: **`mcd_mcm`** (máximo común divisor/mínimo común múltiplo, currículo real de 5º-6º —
recursos del Megapack: "MCD y MCM Carteles y Truco", "40 problemas de MCM y MCD"),
**`descomposicion_numerica`** (valor posicional de números de 3+ cifras, disponible desde 3º —
recurso: "Descomposición de números de 3 y 4 cifras") y **`detective_numeros`** (adivinar un
número secreto a partir de una lista de pistas, todos los cursos — recurso: "Detective de
números"). **Los 37 renderers pasan a ser 40.**

Mismo patrón de blindaje que el resto del fichero: `mcd_mcm` y `descomposicion_numerica` nunca
calculan ni imprimen el resultado real (dejan huecos, igual que `medidas_centralizacion`); en
`descomposicion_numerica` las etiquetas de columna Y el número de huecos de la suma se derivan
siempre del propio número (`String(numero).length`), nunca de un dato aparte que Claude tenga
que acertar. En `detective_numeros`, el número secreto viaja en el JSON solo para que Claude
compruebe la coherencia de sus propias pistas — el renderizador lo ignora por completo, nunca
llega a imprimirse.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 9D. Validado:
`node --check` en los tres ficheros tocados (`renderer-matematicas.js`, `server.js`,
`public/style.css`), render unitario con datos simulados (incluyendo casos límite: arrays vacíos,
número de 6 cifras completo hasta "CM") y capturas Playwright en color y en blanco y negro sobre
una ficha completa con el `style.css` real. **Pendiente, igual que toda tanda nueva**: confirmar
con una ficha real generada por Claude a través de la API (no solo con datos simulados a mano).

### Quinta ampliación (08/09/2026): numeros_romanos

Origen: el usuario compartió el Megapack 2026 de Kumubox (catálogo de este mismo curso, distinto
del de 2025 usado en la ampliación anterior) y pidió comparar de nuevo, anotando solo lo NUEVO. De
los ~38 recursos de Matemáticas del catálogo 2026, todos menos uno ya encajaban en algún tipo
existente (incluidos los tres añadidos la tanda anterior — `descomposicion_numerica` cubre
directamente el recurso "Pack decenas", por ejemplo). El único hueco real: **`numeros_romanos`**
(conversión arábigo↔romano, currículo real de 3º-6º). **Los 40 renderers pasan a ser 41.**

Blindaje distinto al resto de la tanda anterior: a diferencia de `mcd_mcm`/`descomposicion_
numerica` (donde el sistema deja huecos porque no puede verificar el resultado), la conversión a
numeración romana es un algoritmo determinista sin ambigüedad — el sistema la calcula siempre por
su cuenta. Claude nunca escribe un numeral romano: solo elige números arábigos adecuados al curso
y un "sentido" (a_romano / a_arabigo / mixto); cuando hay que MOSTRAR el numeral romano como dato
de partida (sentido "a_arabigo"), lo genera el propio código (`numeroARomano()`, tabla de
sustracción estándar M/CM/D/CD/C/XC/L/XL/X/IX/V/IV/I) — así nunca puede salir mal escrito.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 9E. Validado:
`node --check` en los tres ficheros tocados, render unitario con datos simulados (casos límite:
array vacío, números fuera de rango 1-3999 filtrados, negativos normalizados con `Math.abs`,
1994→MCMXCIV y 3999→MMMCMXCIX comprobados a mano) y capturas Playwright en color y en blanco y
negro. **Pendiente, igual que toda tanda nueva**: confirmar con una ficha real generada por Claude
a través de la API.

---

### Selector visual de tipos de ejercicio — pop-up en el formulario (08/09/2026)

**Origen — hueco de descubribilidad detectado por el usuario:** con 41 tipos de ejercicio ya
implementados en Matemáticas, el docente que rellena "Instrucciones especiales" no tiene forma de
saber cuáles existen realmente — no puede pedir a propósito "un ejercicio de MCD y MCM" si no sabe
que ese tipo está implementado. Se valoraron tres caminos (chips/checkboxes en el propio
formulario, una página de catálogo aparte, autocompletado dentro del textarea) y se descartaron los
dos últimos por proceso mental adicional para el docente o por ambigüedad de lo que autocompletar.
Se eligió una variante de la primera opción, pero como **pop-up con botones** en vez de una fila de
etiquetas, explícitamente pedida "agradable a la vista, no tipo W95 ni nada por el estilo".

**Diseño implementado (solo Matemáticas, primera asignatura desarrollada — patrón pensado para
replicarse en el resto según se migren a JSON + renderizador, Fase 5):**
- Botón "➕ Elegir tipos de ejercicio" junto al campo de instrucciones especiales, habilitado solo
  con Matemáticas seleccionada (el curso ya tiene valor por defecto, así que no hace falta
  comprobarlo aparte).
- Al pulsarlo se abre un pop-up modal con los tipos disponibles para el curso actual, agrupados en
  6 categorías con lenguaje curricular LOMLOE real ("Sentido numérico", "Sentido de la medida",
  "Sentido espacial", "Sentido algebraico", "Sentido estocástico", "Resolución de problemas y
  refuerzo") en vez de una lista plana de 41 botones.
- Cada botón muestra un **nombre amigable + una descripción de una línea** (nunca la clave interna
  del tipo, p.ej. "MCD y MCM" en vez de `mcd_mcm`) — necesario porque el nombre solo no basta para
  que un docente sepa qué es sin abrir la ficha.
- Al pulsar un botón se añade la frase `"Incluye un ejercicio de {nombre}."` al textarea de
  instrucciones; al volver a pulsarlo se quita (toggle, con estado visual "seleccionado" — fondo
  relleno del color de su categoría + marca ✓ — para que el docente vea de un vistazo qué ha
  marcado y pueda deshacer un clic accidental). El estado se sincroniza contra el contenido actual
  del textarea cada vez que se (re)abre el pop-up, así que sobrevive a que el docente edite el
  texto a mano entremedias.
- Un botón "Finalizar" cierra el pop-up (también con la tecla Escape o pulsando fuera del panel);
  el docente puede seguir editando el textarea libremente después y sigue teniendo que pulsar el
  botón separado "✨ Generar Ficha" para enviar.
- Estética: tarjetas redondeadas de color plano con sombra difusa y pequeña elevación al pasar el
  ratón — sin bordes en relieve/bisel de estilo interfaces antiguas — reutilizando la paleta
  `--calido-*` ya usada en las fichas (azul/verde/morado/naranja/rosa, una por categoría-sentido;
  la sexta categoría, que no es un "sentido" LOMLOE real, usa el azul neutro `--color-primario` del
  resto de la app en vez de un color cálido) para que el selector se sienta parte de la misma app.

**Es un cambio 100% de frontend** (`public/index.html` + `public/style.css`): no toca `server.js`
ni los renderizadores. Explota que el campo "Instrucciones especiales" ya tenía prioridad máxima
documentada en el SYSTEM_PROMPT — el pop-up solo rellena ese textarea por el docente, nunca envía
nada nuevo al backend.

**Catálogo de los 41 tipos** (nombre amigable, descripción, categoría y cursos disponibles) escrito
a mano en el propio `<script>` de `index.html`, copiando el gating real de `server.js`
(`esConDibujos`, `esGuiado`, `esMultDiv`, `esConSimetria`, `esConCrucigrama`, etc. y el bloque
"todos los cursos"). **Importante para mantenimiento:** si en el futuro se amplía o cambia el rango
de cursos de un tipo en `server.js`, hay que actualizar también esta tabla en `index.html`, o el
selector ofrecerá al docente un tipo que el backend no vaya a incluir realmente en el prompt para
ese curso — se verificó a mano la correspondencia exacta de los 41 tipos antes de implementar.

Validado con `node --check` sobre el `<script>` extraído, y con Playwright: botón deshabilitado
fuera de Matemáticas, apertura/cierre del pop-up, recuento de tipos disponibles por curso (27 para
1º, 31 para 6º — coinciden exactamente con un recuento programático del propio catálogo), toggle de
selección (añade/quita la frase sin duplicar espacios), persistencia del estado "seleccionado" al
reabrir, refresco del catálogo al cambiar de curso con el pop-up abierto, cierre con Escape, y
captura de pantalla para comprobar visualmente el resultado.

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

**Nueva referencia (08/09/2026)**: al estudiar el Megapack 2026 de Kumubox el usuario repite la
misma observación con otro punto de comparación — "echo en falta la vistosidad ilustrativa de
todas las demás apps que hemos investigado, o incluso las fichas de estos pdfs, son muy visuales
aunque el contenido pedagógico nuestro sea correcto también". No es un dato nuevo en el sentido
técnico (mismo diagnóstico que el 30/08, y el propio catálogo Kumubox es justo la fuente de la que
se han sacado ya seis tipos de ejercicio nuevos esta sesión), pero sí es la tercera vez que surge
de forma independiente (Twinkl/Santillana el 04/08 y 30/08, Kumubox ahora) — refuerza que no es un
caso aislado de una comparación concreta. Sigue sin decidirse ni actuarse: mismo criterio que las
dos entradas anteriores, esto queda anotado para cuando se retome la Fase 4 con su propia sesión
de decisión de alcance, no se abre ni se implementa nada ahora.

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
**Estado: ⏳ Pendiente (migración completa por asignatura)** · **🔄 En curso de forma gradual —
ver aclaración de alcance más abajo (04/09/2026)**

Orden sugerido (a confirmar): Lengua Castellana → Ciencias Naturales / Ciencias
Sociales → Inglés → Francés → Educación Física → Música → Religión. El motor (JSON +
renderizador) ya existe y es compartido — migrar una asignatura nueva NO es
reconstruir el motor, es: definir sus tipos de ejercicio propios, escribir su
porción de `SYSTEM_PROMPT` (condicional por curso, como en Matemáticas) y sus
funciones de renderizado en un `renderer-<asignatura>.js` nuevo.

**Conocimiento del Medio se divide en dos asignaturas — Ciencias Naturales y Ciencias Sociales
(08/09/2026)**: decisión del usuario al comparar el catálogo de Matemáticas/Lengua con el
Megapack 2025 de Kumubox (ver más abajo, "Backlog de recursos del Megapack Kumubox") — ese
catálogo ya trata "Ciencias Sociales" y "Ciencias de la Naturaleza" como dos áreas separadas con
peso similar (15 y 16 recursos en Primaria), así que se adopta esa misma separación aquí en vez
de una única asignatura "Conocimiento del Medio". **Francés se añade como asignatura nueva**
(misma fecha), también a partir de la evidencia del Megapack (8 recursos de Francés en Primaria,
además de Inglés).

**Religión se añade como asignatura nueva (08/09/2026)**: al estudiar el Megapack 2026 de Kumubox
(catálogo de este mismo curso, distinto del de 2025 usado hasta ahora) se confirma la hipótesis
del usuario — sí existe un área "Religión" separada, con 5 recursos distintos en Primaria:
*Cuadernillo de colorear el Mes de María*, *Parábolas y valores*, *¿Quién es quién? Santos y
santas* (los tres de corte católico explícito) y *Las religiones del mundo* (comparativa neutral
judaísmo/cristianismo/islam/hinduismo/budismo, este último etiquetado también como Ciencias
Sociales). Catálogo pequeño todavía frente a las demás asignaturas (5 recursos frente a 40-90 de
Lengua/Inglés), pero suficiente para tratarla como asignatura propia desde ya, igual que se hizo
con Francés.

**Aclaración de alcance (04/09/2026)** — el usuario recordaba que la intención original, desde
que se decidió el patrón JSON+renderizador en la Fase 2, era que TODAS las asignaturas fueran
pasando a este patrón de forma gradual conforme se fueran desarrollando ejercicios nuevos para
ellas — no necesariamente una migración de golpe, asignatura completa a la vez, con Lengua
esperando su turno detrás de Matemáticas. Se ha revisado toda la documentación (`CONTEXTO`,
este roadmap, `REFERENCIA_CLASES_HTML_FICHAS.md`) buscando dónde quedó escrita esa decisión
explícitamente y **no se ha encontrado** — es posible que fuera una decisión hablada en una
sesión de chat que no llegó a anotarse aquí, o un matiz que se dio por sobreentendido. Quede
constancia ahora, con dos precedentes concretos el mismo día:

1. Primer precedente (mañana del 04/09/2026): la letra `trazo_letra` se construyó primero como
   un ejercicio suelto, con Claude aún dentro del pipeline legacy de Lengua pero escribiendo un
   marcador vacío que el código sustituía por HTML real antes de servir la ficha (blindaje
   "por parche", ver más abajo el histórico de la Fase 9).
2. Segundo precedente, y el que fija el criterio definitivo (mismo día, más tarde): el usuario
   consideró que ese parche era "un desgaste" — Claude seguía teniendo que generar toda la ficha
   de HTML desde cero cada vez, sin ningún blindaje salvo en ese único ejercicio — y pidió
   migrar Lengua Castellana YA al patrón JSON+renderizador completo, no ejercicio a ejercicio
   dentro del HTML libre. Se hizo con una **válvula de escape** (`"contenido_libre"`, ver Fase 9)
   para no bloquear la migración a que estuvieran definidos todos los tipos de ejercicio de
   Lengua de antemano: cabecera, título, envoltorio de cada ejercicio y pie quedan blindados por
   código desde ya, mientras que el contenido de los ejercicios aún no tipados sigue siendo HTML
   que escribe Claude, pero acotado al interior de un único ejercicio, nunca a la ficha entera.

El criterio a partir de ahora es este segundo precedente: en cuanto una asignatura necesita
un tipo de ejercicio con precisión que Claude no puede garantizar generando HTML libre (como
pasó con `trazo_letra`), esa asignatura entera pasa a JSON+renderizador con válvula de escape
`contenido_libre` para el resto — no hace falta migrar cada asignatura de una sola vez con
todos sus tipos ya diseñados, ni esperar a que le toque el turno en la lista de abajo.

- [ ] Lengua Castellana *(🔄 ya en el pipeline JSON+renderizador — tipos blindados: `trazo_letra`,
      `relacionar`, `clasificar_silabas`, `acentuacion` (Megapack 2025, ver entrada más abajo) y
      `categoria_gramatical`, `formacion_palabras`, `eleccion_ortografica` (Megapack 2026, ver
      entrada al final de la Fase 9) — resto de ejercicios vía "contenido_libre". No se marca
      como completa: quedan tipos por diseñar — huecos, lectura comprensiva, ordenar palabras...)*
- [ ] Ciencias Naturales *(dividida de "Conocimiento del Medio", 08/09/2026 — ver más arriba)*
- [ ] Ciencias Sociales *(dividida de "Conocimiento del Medio", 08/09/2026 — ver más arriba)*
- [ ] Inglés
- [ ] Francés *(asignatura nueva, 08/09/2026 — ver más arriba)*
- [ ] Educación Física
- [ ] Música
- [ ] Religión *(asignatura nueva, 08/09/2026 — ver más arriba)*

### Backlog de recursos del Megapack Kumubox, por asignatura (08/09/2026, ampliado 08/09/2026)

Origen: comparativa completa del catálogo de Primaria del Megapack 2025 de Kumubox (marketplace
de recursos de más de 100 docentes — ver el mismo análisis ya aplicado a Matemáticas y Lengua,
que sí se implementaron; entrada correspondiente en la Fase 3 y aquí abajo). Estas asignaturas
siguen sin desarrollar (⏳/💭, ni siquiera migradas a JSON+renderizador todavía), así que estos
recursos quedan solo ANOTADOS como referencia de qué tipo de ejercicio pedir cuando le llegue el
turno a cada una — no implementar nada de esto todavía.

**Ampliación con el Megapack 2026** (catálogo de este mismo curso, ~1130 páginas, restringido a
Primaria): mismo criterio — solo se anota lo que es genuinamente NUEVO frente a lo ya recogido
del Megapack 2025, para no duplicar la misma idea con otro nombre. Marcado como "(2026)" dentro
de cada asignatura para distinguir el origen.

- **Ciencias Sociales**: tarjetas de oficios · la Edad Antigua · la sociedad Medieval · la
  población · mapas y planos · descubre el s. XIX · ODS (llavero interactivo, tarjetas,
  investigación) · Memory Prehistoria · husos horarios · trivial histórico · trivial España ·
  Monopoly Unión Europea · juego de mesa india. *(2026)*: la Constitución y los derechos de la
  infancia · las comunidades autónomas de España (mapas, capitales, banderas, y sus días/
  tradiciones) · el relieve de España (sistemas montañosos, ríos, costas) · seguridad vial y
  movilidad sostenible · el Antiguo Egipto · mitología (romana, griega y egipcia) · historia del
  arte (autores, estilos, obras, formato "¿Quién es quién?").
- **Ciencias de la Naturaleza**: el cuerpo humano (rosco, desplegables de aparatos/sistemas,
  oca, trivial) · profesiones STEM (efecto Matilda) · tarjetas de oficios · todo sobre las
  plantas · maleta de las estaciones · atención primaveral · la Tierra · medioambiente y
  desarrollo sostenible · pasos del método científico (flipbook) · tipos de energía (foldable) ·
  propiedades de la materia · cuento de movimientos (imantismo/gravedad). *(2026)*: los 5
  sentidos · clasificación de animales (vertebrados e invertebrados) · máquinas simples e
  inventos (palanca, polea, plano inclinado, engranaje) · ecosistemas y cadenas tróficas
  (productores/consumidores/descomponedores) · el sistema solar y astronomía (fases de la luna,
  constelaciones) · el ciclo del agua · estados de la materia y sus cambios (fusión, evaporación,
  condensación, solidificación) — huecos curriculares llamativos, ninguno estaba en el listado
  de 2025 pese a ser contenido muy estándar de Primaria.
- **Inglés**: role plays · árbol genealógico · Who Am I (USA/British) · the city · animals ·
  our world · systems · who has the time · memory de frutas · let's go to London · animal hunt ·
  evaluación inicial 1º-3º · pets (spelling/gramática) · flipbooks de planetas · story maps ·
  question anchor chart · multilingual breakout · the -s game · Halloween (superpack + Dobble) ·
  todo sobre mí · calendario de rutinas · reglas de spelling (flipbooks) · Gulpy's school
  superpack · Jenga gamificado para idiomas · Inside Out (carrera de emociones, rueda de
  emociones) · English grammar (flipbooks) · lapbook de las plantas. *(2026)*: cognados y false
  friends (inglés-español) · comparativos y superlativos (aparece repetido varias veces en el
  catálogo, tema recurrente) · países de habla inglesa (cultura) · frases desordenadas /
  reconstruir oraciones ("broken sentences", "sentence builder") · phonics (sonidos, dígrafos,
  blending) · plan lector estructurado (reading badges, retos de lectura).
- **Francés**: calendario de rutinas · juego de la pesca FLE A1-A2 · todo sobre mí · Pasapalabra
  FLE · Jenga gamificado para idiomas · Inside Out (carrera/rueda de emociones) · Monopoli
  Voyage en France. *(2026)*: festividades y cultura francesa (Chandeleur, Francofonía,
  Carnaval) · vocabulario básico A1 ilustrado (saludos, colores, números, familia, alimentos,
  animales).
- **Música**: Break out del misterio de las canciones de Pascua · mindfulness musical · Dooble
  Musical. *(2026)*: lenguaje musical básico (figuras, silencios, pentagrama, notas, compases) ·
  familias de instrumentos de la orquesta · ritmo y percusión corporal · cualidades del sonido
  (altura, duración, timbre, intensidad).
- **Educación Física**: los reyes de la comba · tablero navideño · desafío deportivo · retos
  físicos · retos cooperativos. *(2026)*: motricidad fina · juegos populares y tradicionales del
  mundo · estructura de la sesión (calentamiento, parte principal, vuelta a la calma).
- **Religión** *(asignatura nueva, 08/09/2026 — ver Fase 5 más arriba)*: parábolas y valores
  cristianos · santos y santas de la tradición cristiana ("¿Quién es quién?") · el Mes de María ·
  las religiones del mundo (comparativa neutral entre las grandes tradiciones religiosas). Solo
  5 recursos en el Megapack 2026 — catálogo pequeño todavía, se irá ampliando con el tiempo.

**Fuera de la lista de asignaturas de esta fase, sin fase asignada todavía** — aparecen en el
Megapack pero no encajan en ninguna de las anteriores; quedan anotados aquí para no perderlos,
sin decidir qué hacer con ellos:
- **Educación Artística**: Keith Haring (art lesson) · cuaderno de estimulación cognitiva ·
  láminas de creatividad (proyecto superhéroes) · cuentos acordeón · grafismo vuelta al cole ·
  bus capibaras. *(2026)*: mujeres artistas en la historia del arte (mismo espíritu que "efecto
  Matilda" de Ciencias, aplicado a Plástica) · elementos plásticos básicos (línea, forma, textura,
  círculo cromático, composición).
- **ELE** (Español como Lengua Extranjera): mayormente los mismos recursos ya listados en
  Lengua Castellana e Inglés, reutilizados para ese público — no parece requerir tipos de
  ejercicio propios distintos, es más bien un caso de uso del selector de idioma (ver Fase 8).
  *(2026)*: mismo patrón confirmado con más ejemplos (refranes y expresiones idiomáticas por
  meses, dar opiniones/acuerdo-desacuerdo, vocabulario navideño) — sigue sin cambiar la
  conclusión.
- **Catalán/Euskera/Valenciano**: recursos ya listados en Lengua Castellana/Matemáticas
  adaptados a estas lenguas — relacionado directamente con la Fase 8 (idiomas), no con una
  asignatura nueva. *(2026)*: aparecen además recursos de lectoescritura y comprensión lectora
  específicos en estas lenguas (textos propios, no traducciones de Lengua) — sigue sin requerir
  tipos propios, mismo caso de uso del selector de idioma.
- **ACNEAE** (necesidades educativas especiales): nuestra mascota Pelusín comilón · maleta de
  las estaciones · cuaderno de estimulación cognitiva · camisetas en apuros · cuadernillo de
  memoria — línea de contenido transversal (no una asignatura), sin fase propia todavía.
  *(2026)*: pictogramas y agenda visual · historias sociales · tableros de comunicación
  aumentativa (CAA) · materiales específicos para dislexia · entrenamiento de funciones
  ejecutivas — catálogo notablemente más completo este año, con herramientas de apoyo muy
  estándar en aulas de PT/AL que antes no aparecían.

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

### Bloque C — Generar la misma ficha en varios idiomas a la vez (💭 abierta, 08/09/2026)

Origen: pregunta del usuario sobre un caso de aula real — un grupo con un alumno que no habla
español (ej. rumano) entre compañeros hispanohablantes, y si se le puede dar la MISMA ficha
(mismos ejercicios, mismos números) en su idioma, en vez de una ficha distinta generada aparte.

**Diagnóstico**: hoy no es posible tal cual. `idioma` es una línea de texto libre en el prompt
(`construirPromptMatematicas()`/`construirPromptLengua()`, `server.js`) y cada llamada a la API
genera contenido nuevo — dos llamadas (una en español, otra en rumano) dan dos fichas del mismo
curso/tema pero con ejercicios distintos, no la misma ficha traducida.

**Diseño propuesto (sin implementar, decisión de arquitectura para cuando se aborde)**: aprovechar
que en el patrón JSON+renderizador los datos numéricos/estructurales (`datos`: números, iconos,
coordenadas...) ya son independientes del idioma — solo el texto (`enunciado` y campos de texto
libre) cambia. Por tanto:
1. Pedir a Claude, en una única llamada, el JSON con los campos de texto en AMBOS idiomas a la
   vez (ej. `"enunciado": { "es": "...", "ro": "..." }`), en vez de un string simple.
2. Renderizar DOS VECES el mismo JSON — una con `idioma: 'es'` y otra con `idioma: 'ro'` —
   seleccionando el campo de texto correspondiente en cada pasada, pero reutilizando exactamente
   los mismos `datos` (mismos números, mismos dibujos) en las dos.
3. Resultado: dos PDFs con el mismo ejercicio exacto, solo cambia el idioma del texto — más
   barato que dos llamadas independientes y, a diferencia de esas dos llamadas, garantiza que es
   de verdad "la misma ficha".

**Depende del hallazgo previo de esta misma fase** (arriba, "idioma nunca llega a
`renderer-matematicas.js`"): sin resolver ese pendiente (pasar `idioma` hasta los renderizadores
y traducir las ~6 etiquetas fijas hardcodeadas), la ficha en el segundo idioma saldría con
etiquetas estructurales en español mezcladas — así que este Bloque C no se puede abordar antes
que ese hallazgo, aunque sí puede diseñarse/implementarse justo a continuación.

**Estado**: sin urgencia, no decidido cuándo abordarlo — queda anotado para cuando convenga
retomarlo, mismo criterio que el resto de esta fase.

**Próximo paso**: no tocar código todavía en ninguno de los tres bloques.
El Bloque A es candidato razonable para abordar pronto (complejidad baja,
una vez resuelto el hallazgo previo). El Bloque B necesita su propia
sesión dedicada a decidir alcance con referencias reales delante, igual
que se hizo con la Fase 4 y la Fase 7 — no mezclar ambos bloques al
reportar avances o dudas, son proyectos de tamaño muy distinto aunque
compartan el mismo origen (petición de idiomas nuevos).

---

## FASE 9 — Trazo de letras, Lengua Castellana (refuerzo puntual, 04/09/2026)
**Estado: ✅ Completada (versión inicial, con marcador+sustitución dentro del pipeline legacy) —
migrada el mismo día a JSON+renderizador propio (ver entrada final de esta fase) — catálogo
ampliable**

**Origen**: petición directa de una maestra al inicio de curso, para un niño de 1º que llega
de Infantil sin base: distingue las vocales al hablar pero no las relaciona con lo escrito ni
sabe trazarlas. Pidió cuatro cosas: (1) un tipo de letra más grande y redondeada de las que
había en el proyecto, (2) que se pueda poner grande en la ficha, (3) que se pueda puntear para
seguir el trazo, con flechas de dirección **sin texto** (el niño no sabe leer), y (4) pauta
escolar (4 líneas) opcional, a petición particular.

**Relación con la Fase 5** (migrar el resto de asignaturas al patrón JSON+renderizador): esta
fase empezó siendo una pieza aislada (ver histórico más abajo, "versión inicial") y ese mismo
día pasó a ser el disparador real de que Lengua Castellana migrara YA al patrón completo — ver
la entrada "Migración a JSON+renderizador" al final de esta fase y la aclaración de alcance en
la Fase 5. Se decidió así porque este ejercicio necesita precisión total (la dirección del
trazo tiene que ser siempre correcta) y no puede depender de que Claude dibuje bien un SVG de
memoria en cada llamada — mismo criterio de blindaje que el resto del proyecto.

**Decisiones tomadas con el usuario** (antes de tocar código):
- Alcance del catálogo v1: vocales + consonantes más frecuentes (`m, p, l, s, t`), no solo las
  vocales ni el abecedario completo — 10 letras en total.
- Mayúsculas y minúsculas desde el principio (no solo minúsculas).
- Se pide siempre por "Instrucciones especiales" (texto libre, como ya funciona hoy) — sin
  añadir ningún control nuevo al formulario (`public/index.html` sin cambios).

**Investigación previa** (antes de construir nada): se buscó una fuente gratuita ya hecha que
resolviera "punteada + flecha de dirección". Lo más cercano es la familia "Edu" de Google Fonts
(variantes Dots/Guides, licencia OFL) — pero su propia documentación dice que la variante con
flechas de dirección sigue "en desarrollo", no publicada, y no confirma cobertura de acentos
españoles. Decisión: catálogo propio, mismo patrón que `ICONOS_DISPONIBLES` y
`FIGURAS_2D`/`FIGURAS_3D` (contenido curado a mano, verificado visualmente, sin depender de que
un tercero mantenga algo).

**Qué se construyó**:
- `renderer-lengua.js` (nuevo): catálogo `LETRAS_TRAZO_DISPONIBLES` (10 letras × mayús/minús) +
  `renderTrazoLetra()`. Cada letra está dibujada a mano como "esqueleto" (la línea que sigue el
  lápiz, en una rejilla propia de baseline/x-alta/ascendente/descendente) — NO extraída del
  contorno de una fuente, para controlar con exactitud el punto de inicio y la dirección de cada
  trazo. El modelo grande de referencia (letra sólida, sin puntear) sí usa Fredoka, ya
  autoalojada en el proyecto. Contrato HTML/CSS completo en
  `Docs/REFERENCIA_CLASES_HTML_FICHAS.md`, sección 13.
- `server.js` (versión inicial, **superada por la migración de más abajo**): Claude nunca
  dibujaba la letra — solo escribía un marcador vacío
  (`<div class="trazo-letra" data-letra="a" data-pauta="true" data-repeticiones="3"></div>`)
  dentro de su propio `<div class="ejercicio">`, activado SOLO si el docente lo pedía
  explícitamente en instrucciones especiales (instrucción añadida a
  `PROMPTS_MATERIA['Lengua Castellana']`). `sustituirPlaceholdersTrazoLetra()` sustituía ese
  marcador por el HTML real de `renderer-lengua.js` antes de devolver la ficha. Este mecanismo
  ya no existe en el código — ver la migración a JSON+renderizador al final de esta fase.
- `public/style.css`, sección 9 (nueva, al final del archivo): estilos del bloque, incluida la
  pauta escolar de 4 líneas (dentro del propio SVG del modelo punteado, y como fondo CSS en las
  casillas de repetición en blanco) y soporte completo de modo B/N.
- Blindaje: si el docente pide una letra fuera del catálogo, el sistema no rompe la ficha —
  `renderTrazoLetra()` devuelve un aviso (`.trazo-letra-no-disponible`) en vez de un hueco vacío
  sin explicación.
- Modo `"modelo"` (además del modo `"trazo"` por defecto): solo la letra grande y redondeada,
  sin puntear — para cuando el docente solo quiere mostrar la forma de la letra.

**Verificación**: probado con datos simulados (sin gastar llamada a la API) y con una
sustitución de placeholder simulando la salida real de Claude (varias letras, atributos en
distinto orden, letra fuera de catálogo) — todo correcto. Verificado visualmente con Playwright,
renderizando con el `style.css` real del proyecto dentro de `.ficha`/`.ejercicio` reales, en
color y en modo B/N — el punteado, las flechas, el orden de trazo y la pauta se leen con
claridad. **Pendiente**: confirmar con una ficha real generada por Claude con la API (no solo
simulada) — mismo criterio que el resto del proyecto, no dar nada por bueno solo con datos a
mano.

- [x] Catálogo inicial (10 letras × mayús/minús) construido y verificado visualmente.
- [ ] **Pendiente de confirmar con ficha real** generada por Claude (PDF o pantalla), no solo
      con datos simulados.
- [ ] **Pendiente de ampliar el catálogo** al resto de consonantes, cuando convenga — mismo
      patrón iterativo (verificar cada letra nueva visualmente antes de darla por buena).
- [ ] Sin decidir: si en algún momento conviene mover esto a un control del formulario en vez de
      pedirse solo por instrucciones especiales (decisión explícita de esta sesión: no hacerlo
      todavía).

**04/09/2026 (mismo día) — corrección tras comparar con una ficha real generada y tres
referencias de letra escolar española encontradas por el usuario**: el usuario generó una ficha
real (`Lengua_1_C_008.pdf`, con el prompt de prueba de esta misma sesión) y la comparó con tres
fichas de referencia de otra fuente (letra "escolar"/pre-cursiva española real). Diagnóstico: el
catálogo v1 dibujaba un print genérico de "bola y palito" (estilo manual americano), sin el
rasgo más característico de la letra escolar española — las minúsculas redondas (`a`, `e`...)
no terminan en seco en la línea base, siguen con un pequeño **"rabito" de salida** (trazo de
enlace curvo hacia arriba-derecha, el que en cursiva conecta con la letra siguiente).

Arreglo en `renderer-lengua.js`: nueva función `colaSalida()` (un arco pequeño que se añade AL
FINAL del mismo trazo, sin levantar el lápiz) aplicada a `a` y `e` — las dos letras para las que
el usuario aportó referencia directa. Verificado visualmente con Playwright antes de darlo por
bueno. **No copiado de la fuente/PDF de referencia** (son de terceros, con marca de agua propia)
— es una interpretación propia del convenio pedagógico general de "letra escolar con rabito",
igual que el resto del catálogo.

- [x] Rabito de salida en `a` y `e` (minúsculas) — verificado visualmente.
- [ ] **Pendiente de valorar**: aplicar el mismo rabito a otras minúsculas redondas del catálogo
      (`o`, `u`, `m`...) si la maestra confirma que también lo necesita — no se ha tocado
      todavía por falta de referencia directa para esas letras.
- [ ] Sigue pendiente confirmar el catálogo completo con una ficha real (con este arreglo ya
      aplicado) — la ficha `Lengua_1_C_008.pdf` que motivó este arreglo es de ANTES del cambio.

**04/09/2026 (mismo día) — migración de Lengua Castellana a JSON+renderizador propio**: tras
revisar la ficha corregida, el usuario señaló que era raro no tener documentada en ningún sitio
la intención original de ir migrando asignaturas de forma gradual (ver aclaración de alcance en
la Fase 5) y, con eso ya sobre la mesa, pidió ir más allá del arreglo puntual de `trazo_letra`:
migrar Lengua Castellana YA al patrón JSON+renderizador completo, en vez de mantener el
marcador+sustitución dentro del pipeline legacy. Motivo explícito: que Claude tuviera que
generar cada vez toda la ficha en HTML desde cero, con blindaje real solo en un tipo de
ejercicio suelto, "no era práctico, era más un desgaste".

**Decisiones tomadas con el usuario** (antes de tocar código):
- Con **válvula de escape** (`"contenido_libre"`): así la migración no depende de tener
  diseñados de antemano todos los tipos de ejercicio de Lengua — cabecera, título, envoltorio de
  cada ejercicio y pie quedan blindados por código desde ya; el contenido de cualquier ejercicio
  todavía sin tipo propio lo sigue escribiendo Claude en HTML libre, pero acotado al interior de
  ESE ejercicio (nunca a la ficha entera), con las mismas clases que ya usaba el `SYSTEM_PROMPT`
  legacy (`.hueco`, `.espacio-respuesta`, `.texto-lectura`, `.opciones-test`,
  `.caja-espacio-dibujo`, `.tabla-ejercicio`, `.ejercicio-lista`).
- Catálogo v1 de tipos formalmente blindados: **solo `trazo_letra`** (letras grandes tipo
  redondeado español, mayúsculas y minúsculas, con pauta y sin ella) — respuesta explícita del
  usuario a las opciones ofrecidas (huecos, lectura comprensiva, relacionar/ordenar palabras),
  ninguna de las cuales se construye todavía. Todo lo demás cae en `contenido_libre` por ahora.

**Qué se construyó**:
- `renderer-lengua.js`: nueva sección "PIPELINE DE FICHA COMPLETA" — `renderContenidoLibre()`
  (`{ html }` → el contenido tal cual, sin sanear — mismo nivel de confianza que ya tenía todo
  el pipeline legacy, solo que acotado a un ejercicio), `RENDERERS_LENGUA_POR_TIPO` (dispatch por
  `tipo`, con `contenido_libre` como fallback si Claude manda un tipo desconocido — blindaje
  extra), `renderEjercicioLengua()` y el nuevo punto de entrada exportado
  `renderizarFichaLengua(datosFicha, contexto)` — construye la ficha completa (cabecera,
  cabecera-centro condicional, título, ejercicios, pie), mismo patrón exacto que
  `renderizarFichaMatematicas()` en `renderer-matematicas.js` (misma lógica de
  `curso-inicial`/`claseFuente` por curso).
- `server.js`: eliminados `PROMPTS_MATERIA['Lengua Castellana']` y
  `sustituirPlaceholdersTrazoLetra()` (ya no hace falta sustituir nada a posteriori). Nueva
  `construirSystemPromptLengua(curso)` (mismo patrón que `construirSystemPromptMatematicas()`):
  Claude responde solo JSON (`{titulo, ejercicios:[{tipo, enunciado, datos}]}`), con el esquema
  completo de `trazo_letra` (catálogo, modos, pauta, repeticiones) y de `contenido_libre`
  (clases HTML permitidas, con la instrucción explícita de que "html" es solo el contenido
  interior del ejercicio, nunca el envoltorio ni el enunciado). Nueva rama
  `if (materia === 'Lengua Castellana')` en `POST /api/generar-ficha`, mismo patrón que
  Matemáticas: llamada a la API, parseo de JSON con blindaje de error, `renderizarFichaLengua()`.
- `Docs/REFERENCIA_CLASES_HTML_FICHAS.md`, sección 13: reescrita para describir el pipeline
  JSON+renderizador y la válvula de escape, en vez del mecanismo de marcador+sustitución (ya
  retirado).

**Verificación**: `node --check` en ambos archivos tocados. Prueba con JSON simulado (sin
gastar llamada a la API) cubriendo los dos tipos (`trazo_letra` en varios modos, incluida una
letra fuera de catálogo para comprobar el blindaje; `contenido_libre` con huecos, lectura
comprensiva y test) y un tipo desconocido a propósito (cae correctamente en `contenido_libre`
por el fallback del dispatch) — todos los checks automáticos en verde. Verificado visualmente
con Playwright, ficha completa renderizada con el `style.css` real del proyecto, en color y en
modo B/N — cabecera, título, los 9 ejercicios (trazo y contenido libre mezclados) y el pie se
ven correctamente. **Pendiente, igual que con la versión inicial**: confirmar con una ficha real
generada por Claude con la API (no solo simulada).

- [x] Migración completa de Lengua Castellana al pipeline JSON+renderizador, con válvula de
      escape `contenido_libre` — verificado con datos simulados y visualmente (color y B/N).
- [x] **Confirmado con ficha real** generada por Claude con la API, ya con el pipeline nuevo
      (`Lengua_1_C_009.pdf`, 04/09/2026 — 7 ejercicios de `trazo_letra` en distintos modos + 2 de
      `contenido_libre`, todo correcto: catálogo, blindaje de letra fuera de catálogo, huecos,
      lectura+test).
- [ ] **Pendiente, sin definir aún**: tipos propios para el resto de ejercicios de Lengua
      (huecos gramaticales, lectura comprensiva, relacionar/ordenar palabras, dictado...) — de
      momento todos caen en `contenido_libre`. Cuando se diseñe alguno, sale de la válvula de
      escape y pasa a tener su propio tipo blindado, mismo criterio que en Matemáticas.

**04/09/2026 (mismo día) — segunda corrección de la `e`, y pregunta abierta sobre "letra más
escolar"**: al ver `Lengua_1_C_009.pdf` (ya con el rabito corto de la corrección anterior), el
usuario señaló que la `e` minúscula "se ve rara" comparándola de nuevo con las referencias reales
subidas — con el rabito corto, la `e` se leía como un simple círculo con un nudo, sin peso visual
suficiente para distinguirse de una `o`. Nueva función `colaSalidaLarga()` en
`renderer-lengua.js`: el mismo trazo se aleja primero hacia la derecha con una caída notable
antes de rizarse (en vez de rizarse pegado al bucle) — verificado visualmente (aislado y dentro
de la ficha completa, color y B/N) antes de aplicarlo. Ver sección 13 de
`REFERENCIA_CLASES_HTML_FICHAS.md` para el detalle.

La maestra planteó además, a través del usuario, si se puede "buscar un tipo de letra más
escolar" — sin concretar si se refiere al modelo grande de referencia (hoy Fredoka, una
geométrica redondeada moderna, no una tipografía de caligrafía escolar) o al propio trazo
punteado. Investigación rápida (búsqueda web, 04/09/2026): existe **Playwrite** en Google Fonts
— familia OFL, gratuita, con variantes por país (incluida **Playwrite ES**, ajustada al estándar
de letra escolar española) y una variante "Guides" con líneas de pauta integradas. Es
mayoritariamente una familia CURSIVA (letra ligada), lo que encaja con el aspecto de las
referencias del usuario (los rabitos pronunciados son en realidad entradas/salidas de cursiva
mostradas letra a letra). Sin confirmar todavía: si sus glifos incluyen flechas de dirección
integradas (imprescindible: el niño no sabe leer, todo tiene que ser dibujo) o si haría falta
seguir generando las flechas por código a partir del contorno de la fuente — no se ha decidido
nada ni tocado código de fuentes por esto, pendiente de hablarlo con el usuario.

- [x] **Decidido con el usuario**: cambiar SOLO el modelo grande a Playwrite ES, dejando el
      esqueleto punteado a mano tal cual — ver la entrada siguiente.

**04/09/2026 (mismo día) — Playwrite ES en el modelo grande, decisión final**: antes de tocar
código se investigó Playwrite ES a fondo (se descargó vía `@fontsource/playwrite-es` — npm
espeja Google Fonts en paquetes OFL descargables, ya que este sandbox no tiene salida directa a
fonts.google.com — y se renderizaron las 20 letras del catálogo con Playwright para verlas de
verdad, no solo leer su documentación). Hallazgos concretos:
- Las letras SUELTAS no llevan rabito por defecto — el rabito de Playwrite es una ligadura entre
  dos letras (una glifo aislado no la incluye). Se encontró un truco viable: escribir la letra
  seguida de OTRA letra en la misma tirada de texto pero con `color: transparent`, para que el
  navegador calcule igualmente la ligadura sin que se vea ni se lea la letra de más.
  `position:absolute` y `display:inline-block` en la letra fantasma ROMPEN el cálculo de la
  ligadura (probado, descartado); un `<span>` normal en flujo, con solo el color cambiado, sí
  funciona.
- Ninguna variante (Base/Guides/Deco) trae punteado ni flechas de dirección — "Guides" solo
  añade dos rayitas de renglón alrededor de la letra sólida. Esto descarta sustituir también el
  sistema de puntos+flechas: habría que extraer el contorno RELLENO de cada glifo (el borde de
  la tinta, no el trazo del lápiz) y de ahí inferir un esqueleto y una dirección — mucho más
  complejo y menos fiable que seguir dibujando el esqueleto a mano.
- Las mayúsculas de Playwrite ES no llevan rabito ni con el truco de la ligadura — coincide con
  las referencias reales del usuario (las mayúsculas ahí tampoco lo llevan).

Con esto delante, el usuario decidió cambiar SOLO el modelo grande, no todo el sistema de trazo.
Construido: `public/fonts/playwrite-es/PlaywriteES-Regular.woff2` (+ `OFL.txt`) autoalojada como
el resto de fuentes del proyecto; nuevo `@font-face` en `style.css`; `.trazo-letra-modelo` pasa
de Fredoka a `'Playwrite ES'` (tamaño ajustado de 60px/90px a 78px/110px porque a peso 400 se ve
más fino que Fredoka SemiBold/Bold); nueva clase `.trazo-letra-modelo-fantasma` (color
transparente, `user-select: none` en el padre). En `renderer-lengua.js`, `renderTrazoLetra()`
añade la letra fantasma SOLO donde se comprobó visualmente que cambia algo:
`{ a:'e', e:'i', o:'e', u:'e', m:'e' }` — el resto del catálogo (`i, p, l, s, t`, todas las
mayúsculas) se queda sin fantasma porque no le afecta.

Verificado visualmente con Playwright, ficha completa, color y B/N: el modelo grande de `a`, `e`
y `m` muestra el rabito con claridad (la `e` en particular ya no se confunde con una `o`); las
mayúsculas quedan como print limpio, igual que en las referencias; la letra fantasma no se ve ni
dificulta la lectura en ningún modo.

- [x] Modelo grande migrado a Playwrite ES, con el truco de la letra fantasma para el rabito —
      verificado visualmente (color y B/N) dentro de una ficha completa.
- [x] Pendiente de que la maestra confirme el resultado con una ficha real — **confirmado, y con
      feedback**: ver la entrada siguiente (`Lengua_1_C_010.pdf`, el trazo punteado y el modelo
      grande no coincidían en `e` y `m`).

**04/09/2026 (mismo día) — desajuste entre el modelo grande y el trazo punteado, y corrección de
`e` y `m`**: el usuario probó el cambio anterior con una ficha real (`Lengua_1_C_010.pdf`) y
señaló que "la letra que escribes con puntitos no sea igual a la que se muestra para replicar" —
diagnóstico confirmado mirando el PDF: el modelo grande (ahora Playwrite ES, una cursiva real
con su propia lógica de bucles) y el trazo punteado (nuestro esqueleto dibujado a mano, sin
cambios desde antes de adoptar Playwrite) dibujaban dos formas estructuralmente distintas de la
misma letra — sobre todo en `e` (bucle-espiral de Playwrite vs. círculo con barra de entrada del
esqueleto) y en `m` (Playwrite termina con un gancho, el esqueleto no tenía ninguno). Con
Fredoka esto no se notaba porque su forma también era simple/plana, sin bucles propios que
chocaran con los nuestros.

Se preguntó al usuario cómo resolverlo (revertir el modelo a Fredoka / rediseñar todo el
esqueleto para copiar a Playwrite / corregir solo las letras que ya chocan) y eligió la tercera:
mantener Playwrite en el modelo para todas las letras, pero corregir el esqueleto punteado SOLO
donde el desajuste se notaba (`e` y `m`), dejando el resto del catálogo para revisar más
adelante si hiciera falta.

Para la `e`, se midió con precisión la `e` real de Playwrite (renderizada grande y analizada con
Python — bounding box, altura de x, línea base) en vez de solo mirarla a ojo: entra por abajo,
traza un bucle alto y estrecho, y continúa en la cola larga — muy distinto de nuestra barra
horizontal + círculo ancho anterior. Nueva `e()` en `renderer-lengua.js` con esa misma lógica de
entrada (ver detalle en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 13). Para la `m`, se añadió
una `colaSalida()` corta tras la segunda joroba, igual que hace Playwrite.

Verificado visualmente con Playwright, trazo punteado y modelo grande uno junto al otro dentro
de una ficha real, color y B/N: ahora ambos se leen como el mismo gesto en `e` y `m` (no son
trazos idénticos, pero ya no parecen dos letras distintas).

- [x] `e` y `m` corregidas para que el trazo punteado coincida en gesto con el modelo grande de
      Playwrite ES — verificado visualmente (color y B/N), comparando ambos lado a lado.
- [ ] **Pendiente, sin decidir**: si el resto del catálogo (`a, i, o, u, p, l, s, t` y
      mayúsculas) necesita el mismo tratamiento — de momento solo `a` tiene rabito propio
      (`colaSalida()` corto) y ya coincidía razonablemente bien con Playwrite; el resto no se ha
      revisado con este criterio todavía.
- [ ] Sigue pendiente confirmar con una ficha real generada después de este arreglo (la
      `Lengua_1_C_010.pdf` que lo motivó es de ANTES del cambio).

**04/09/2026 (mismo día) — cuarta pasada: se retira Playwrite ES del modelo grande por completo**:
el usuario probó el arreglo anterior con otra ficha real (`Lengua_1_C_011.pdf`) y volvió con dos
observaciones: (1) preguntó si en vez de corregir el esqueleto letra por letra para que se
pareciera a Playwrite, no sería mejor que el propio trazo punteado usara directamente el contorno
de Playwrite como fuente; (2) por separado, señaló que la `e` minúscula de Playwrite en sí misma
"queda muy rara, como un lazo" — una objeción a la forma del glifo, no solo a la falta de
coincidencia con el punteado.

Se evaluó la petición literal (1) y se descartó: extraer el contorno relleno de un glifo de fuente
y convertirlo en un esqueleto de trazo punteado con dirección de flecha fiable es un trabajo mucho
mayor que el sistema actual, y además NO resolvería (2) — si el punteado copiara el contorno de
Playwrite, heredaría el mismo bucle "en lazo" que al usuario no le gusta. Se optó por la solución
inversa, mejor en los dos frentes a la vez: dejar de usar Playwrite ES en el modelo grande y
dibujarlo con nuestro propio esqueleto (`LETRAS[letra]()`, el mismo que ya genera el punteado),
como trazo grueso y sólido en vez de a puntos (`construirModeloSolido()` /
`pathDeTrazo()`/`segInicio()`, nuevas en `renderer-lengua.js` — conversión de los segmentos
`line`/`arc` ya existentes a comandos SVG `M`/`L`/`A`). Efecto: modelo y punteado quedan
**garantizados** idénticos para siempre y para cualquier letra del catálogo — ya no hay dos
fuentes de verdad que puedan desincronizarse — y de paso desaparece la `e` de Playwrite que no
gustaba, recuperando la forma que sí se había validado contra las referencias reales de letra
escolar española (la corrección "segunda pasada" descrita más arriba). Esta vez no se preguntó al
usuario con una pregunta de opción múltiple antes de implementar — se le explicó el razonamiento
por escrito y se procedió directamente, dado lo claro del argumento técnico (elimina la causa raíz
del problema que ya había obligado a dos rondas de parches letra por letra) y el patrón ya
establecido en esta conversación de proponer, verificar y entregar para iterar.

Se han retirado, por quedar sin uso: la fuente autoalojada
`public/fonts/playwrite-es/PlaywriteES-Regular.woff2` (+ `OFL.txt`), su `@font-face` en
`style.css`, el truco de la letra fantasma (`FANTASMA_SIGUIENTE`,
`.trazo-letra-modelo-fantasma`) y todo el CSS de `.trazo-letra-modelo` basado en texto/fuente —
sustituido por `.trazo-letra-modelo-trazo` (stroke) y `.trazo-letra-modelo-punto` (fill), más el
override correspondiente en modo B/N.

Verificado con Playwright (color y B/N), dentro de una ficha real construida con
`renderizarFichaLengua()`: modelo grande y punteado son ahora el mismo gesto exacto letra por
letra (probado con `A, a, E, e, M, m, P`), incluida la `i` con su punto suelto, que se renderiza
correctamente como círculo sólido en el modelo (antes no existía ese caso al ser texto).

- [x] Modelo grande deja de depender de Playwrite ES (o de cualquier fuente externa) —
      `construirModeloSolido()` lo dibuja con el mismo esqueleto que el punteado, como trazo
      grueso y sólido.
- [x] Fuente `public/fonts/playwrite-es/`, su `@font-face` y el truco de la letra fantasma,
      retirados por quedar sin uso.
- [x] Verificado visualmente (color y B/N) que modelo y punteado coinciden exactamente para todas
      las letras probadas, incluida la `i` con su punto.
- [ ] El desajuste "pendiente, sin decidir" de la entrada anterior (si `a, i, o, u, p, l, s, t` y
      mayúsculas necesitaban el mismo tratamiento que `e`/`m`) queda **resuelto de raíz** por este
      cambio — ya no aplica, no hace falta revisarlo letra por letra.
- [ ] Sigue pendiente confirmar con una ficha real generada después de este cambio.

**05/09/2026 — evaluación de fuentes candidatas fuera de Google Fonts (Little Days, Cole
Carreira)**: aunque el modelo grande ya no depende de ninguna fuente externa (pasada anterior),
la maestra seguía interesada en encontrar una tipografía "más escolar" para el proyecto en
general. El usuario trajo 6 candidatas de dafont.com y pidió revisar sus licencias antes de
nada — verificado con `WebFetch` contra dafont y, para las dos finalmente elegidas, cotejado con
un segundo catálogo independiente (fontspace.com, blogfonts.com) porque dafont no publica el
texto legal completo. Con uso comercial confirmado por el usuario, solo 2 de las 6 quedaban
libres sin gestiones: **Little Days** (West Wind Fonts, "100% Gratis"/dominio público-GPL-OFL,
confirmada además en fontspace y blogfonts) y **Cole Carreira** (Colexio Carreira, misma
clasificación en dafont, sin segunda fuente que lo confirme). Las otras 4 (Escolar Brasil, The
Magic Cookie, KG Primary Dots, Giulio) necesitarían permiso o pago del autor para uso comercial.

dafont.com y la mayoría de portales de descarga de fuentes están bloqueados por la política de
red del entorno de Claude (igual que Google Fonts en su día) — a diferencia de aquella vez, no
había ningún paquete npm equivalente para estas dos, así que el usuario las descargó él mismo y
subió los `.zip` al chat. Convertidas a `.woff2` con `fonttools` (+ `brotli`) e instaladas
autoalojadas (`public/fonts/little-days/`, `public/fonts/colecarreira/`) igual que el resto de
fuentes del proyecto, con un `LICENCIA.txt` en cada carpeta documentando la verificación (los
`.zip` de dafont no traen ficha de licencia como sí traen los de Google Fonts).

Al renderizar una muestra grande de las dos (ver más abajo) resultaron ser muy distintas de lo
esperado: **Little Days** es una cursiva unida decorativa, con bucles elaborados, no la letra
sencilla y semi-separada de las referencias de lalibretapiruleta que gustaron al usuario; **Cole
Carreira** resultó ser, en sí misma, una fuente de PRÁCTICA de caligrafía (glifos ya construidos
a base de puntos con línea base incorporada), no una fuente "sólida de referencia". Ninguna
sustituye por sí sola al modelo grande. Quedan instaladas y disponibles (`font-family: 'Little
Days'`/`'Cole Carreira'`) pero sin aplicarse a ningún elemento todavía — pendiente de que la
maestra las vea y decida si sirven para algo (títulos, cabecera...) o se descartan.

Para que la maestra pudiera verlas dentro de una ficha real, se añadieron dos clases CSS
TEMPORALES a la válvula de escape `contenido_libre` (`.muestra-fuente-little-days`,
`.muestra-fuente-cole-carreira` — documentadas en el `SYSTEM_PROMPT` de `server.js` y en la
sección 13 de `REFERENCIA_CLASES_HTML_FICHAS.md`, marcadas para retirar si finalmente no se
adoptan). Ficha de prueba de 4 ejercicios generada (mayús/minús × las dos fuentes) y verificada
con Playwright antes de entregar el prompt. A petición del usuario, tras comparar con una
referencia real (`12VOCALES.pdf`), se subió el tamaño de estas dos clases de 56px a 150px para
que la muestra quedara en una escala comparable a la de esa referencia.

- [x] Little Days y Cole Carreira verificadas, licencia documentada, instaladas autoalojadas.
- [x] Ficha de muestra (4 ejercicios) verificada visualmente antes de entregar el prompt.
- [ ] Pendiente: que la maestra vea la muestra y decida si alguna se usa para algo, o se
      descartan las dos junto con las clases temporales y los ficheros de fuente.

**05/09/2026 (mismo día) — quinta pasada: rejillas repetidas en vez de modelo único + casillas en
blanco, siguiendo una referencia real**: al enseñarle `12VOCALES.pdf` (misma referencia de
lalibretapiruleta ya usada para corregir el "rabito" de la `e`), el usuario pidió una ficha
parecida a esa: varias copias GRANDES idénticas de la letra para colorear libremente, y luego
MUCHAS copias PEQUEÑAS punteadas seguidas para repasar — un formato bastante distinto del que ya
existía (un modelo grande + un único trazo punteado + casillas en blanco para escribir libre).
Antes de dar directamente un prompt con el sistema actual, se preguntó al usuario si prefería
eso o rediseñar el ejercicio para parecerse de verdad a la referencia — como todavía se está en
una fase muy temprana de Lengua de 1º (mismo razonamiento que llevó a ir añadiendo tipos de
ejercicio en Matemáticas poco a poco), el usuario eligió rediseñarlo del todo y que quedara como
plantilla reutilizable para cualquier letra del catálogo.

Rediseño en `renderer-lengua.js`: `construirModeloSolido()` y `construirSvgLetra()` (ambas sin
cambios) pasan a repetirse en rejilla mediante dos funciones nuevas — `construirGridModelos()`
(rejilla grande, por defecto 6 copias, sin pauta, para colorear) y `construirGridPunteado()`
(rejilla pequeña, por defecto 12 copias, con pauta opcional, para repasar) — con un subtítulo fijo
puesto por el código ("Ahora repasa el trazo:") entre ambas. El campo `datos.repeticiones` (una
sola cifra para casillas en blanco) se sustituye por `datos.repeticionesGrandes` (0-9, por
defecto 6) y `datos.repeticionesPequenas` (0-24, por defecto 12); las casillas en blanco
(`.trazo-letra-repeticiones`/`.trazo-letra-repeticion-celda`) y la fila lado a lado
(`.trazo-letra-fila`) se retiran del CSS por quedar sin uso. `server.js` actualizado con el nuevo
esquema de `datos` para `trazo_letra`.

Verificado con Playwright (color y B/N): una ficha con la vocal `e` (6 grandes + 12 pequeñas)
queda en un formato muy cercano al de la referencia real, y una ficha de regresión con las 10
letras del catálogo (vocales + m,p,l,s,t, mayús/minús, más los ejercicios de `contenido_libre`)
confirma que nada se rompió con el cambio.

- [x] Rediseñado `renderTrazoLetra()`: rejilla grande para colorear + rejilla pequeña punteada
      para repasar, en vez de modelo único + casillas en blanco.
      Reutiliza `construirModeloSolido()`/`construirSvgLetra()` sin tocarlas.
- [x] `server.js` actualizado al nuevo esquema (`repeticionesGrandes`/`repeticionesPequenas`).
- [x] Verificado visualmente (color y B/N) contra la referencia real, y con una ficha de
      regresión de todo el catálogo para confirmar que no se rompió nada.
- [ ] Pendiente: confirmar con una ficha real generada por el usuario a través de la app (no
      solo la verificación interna de esta sesión).

**05/09/2026 (mismo día) — sexta pasada: la `e` "parece una Q", se recupera la barra de
entrada**: al ver la rejilla grande y sólida de la `e` (pasada anterior), el usuario señaló que
parece una "Q" y pidió tomar como referencia la letra "e" de la fuente Little Days. Confirmado
comparando ambas: nuestra `e` (bucle casi cerrado sin barra, heredado de cuando el modelo grande
usaba Playwrite ES) sí se lee como "Q" al rellenarla de color sólido. Se probaron varias
alternativas — un círculo con un hueco de verdad (se lee como "C", no como "e") y una
construcción compuesta con un bucle pequeño de entrada imitando a Little Days (varios intentos,
formas raras, ver detalle en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 13) — hasta recuperar la
primera versión de esta letra (barra desde el centro al borde + bucle), previa a los intentos de
parecerse a Playwrite ES, que nunca había recibido esa queja. Conclusión: lo que distingue a la
"e" de un círculo cerrado es la barra, no la fuente de referencia usada para diseñarla.

- [x] `e()` recuperada a la construcción con barra de entrada + bucle (más la cola de salida ya
      corregida en su día, sin cambios).
- [x] Verificado con Playwright (color y B/N) que ahora se lee sin ambigüedad como "e", y ficha
      de regresión de todo el catálogo para confirmar que nada más se vio afectado.

**05/09/2026 (mismo día) — séptima pasada: la rejilla punteada pasa a la fuente real "Cole
Carreira", se abandona la idea de derivarla sólida**: el usuario, tras enseñar la ficha con la
rejilla punteada dibujada a mano a la maestra, volvió confundido — no entendía de dónde salía esa
tipografía, porque esperaba que el ejercicio usara directamente las fuentes reales instaladas
("Little Days"/"Cole Carreira"), no un sistema propio independiente. Aclarado el malentendido
(el sistema de trazo SIEMPRE dibujó su propio esqueleto, las fuentes reales solo existían en la
ficha de comparación aparte), la maestra dio su veredicto sobre las fuentes reales: "Cole
Carreira" (ya una fuente de puntos con la pauta incluida en cada glifo) sirve para punteado en
mayúsculas, minúsculas y números; "Little Days" solo en minúsculas y números, no en mayúsculas
(confirmado también renderizando el alfabeto completo de las dos — las mayúsculas de Little Days
son ornamentadas, p.ej. la "S" se confunde con un "3"). El usuario preguntó si se podía derivar de
Cole Carreira una versión sólida (sin puntos) para que modelo grande y punteado vinieran de la
MISMA fuente real.

Se intentó: aislar los puntos de cada glifo (descartando las líneas de pauta por anchura de
componente), fusionarlos con cierre morfológico de kernel cuadrado (probado hasta 100px de kernel,
sin cerrar del todo las curvas de mayúsculas) y después con desenfoque gaussiano + umbral (mejor,
sin las esquinas cuadradas del cierre morfológico). Resultado desigual: minúsculas redondas (`a`,
`m`) quedaban limpias, pero mayúsculas/números de esquina cerrada (`A`, `5`) dejaban huecos o
exigían sobregrosor — habría exigido ajuste manual carácter a carácter para un alfabeto completo,
con calidad desigual. Mostradas las pruebas concretas (imagen de comparación con las 4 letras),
el usuario decidió no seguir por esa vía y usar en su lugar la fuente real directamente en la
rejilla punteada, aceptando explícitamente el coste de perder ahí las flechas de dirección y el
número de orden de trazo (los puntos de una fuente no llevan esa información) — se le preguntó
específicamente antes de aplicarlo.

Cambio final en `renderer-lengua.js`: la rejilla GRANDE sigue con nuestro esqueleto a mano
(`construirModeloSolido()`, sin cambios). La rejilla PEQUEÑA (`construirGridPunteado()`) deja de
llamar a `construirSvgLetra()` (retirada del código junto con `sampleStroke()`/`arrowMarker()`/
`segLength()`/`pointOnSeg()`, sin más uso) y en su lugar repite `<span class="trazo-letra-fuente-
punteada">` con la letra como texto real, en la fuente "Cole Carreira". Como cada glifo de esa
fuente ya trae dentro un tramo de las 4 líneas de pauta, basta con `gap: 0` entre celdas
(`.trazo-letra-grid-pequena`) para que los tramos encajen y formen una pauta continua en toda la
fila — no hace falta calcular una pauta aparte, y el campo `datos.pauta` se retira del esquema
(`server.js`) por quedar sin efecto. `public/index.html` (`protegerElementosEstructurales()`)
gana `.trazo-letra-fuente-punteada` en su lista de selectores protegidos — a diferencia de un
`<svg>`, texto real SÍ es vulnerable a edición accidental dentro de la ficha.

De paso, verificando la regresión completa del catálogo se encontró y corrigió un bug ya
existente sin relación con el cambio de fuente: `o()`/`O()` dibujaban el círculo completo con un
único arco SVG de 360° (`sweepDeg: -360`) — un comando `A` no puede representar una elipse
completa cuando el punto de inicio y el de fin coinciden (caso degenerado), así que el navegador
no dibujaba nada. No se notaba con el punteado anterior (los puntos se muestreaban aparte, sin
comandos SVG reales), pero SÍ afectaba al modelo grande sólido desde que existe (cuarta pasada):
la "o"/"O" grande llevaba invisible en toda ficha generada hasta ahora. Corregido partiendo el
círculo en dos arcos de 180° en el mismo trazo.

- [x] Aclarado con el usuario el malentendido sobre qué sistema dibuja cada rejilla.
- [x] Intento de derivar Cole Carreira sólida por procesado de imagen — probado, descartado con
      evidencia visual concreta mostrada al usuario, decisión explícita de no seguir por ahí.
- [x] Rejilla pequeña pasa a texto real en "Cole Carreira"; rejilla grande sin cambios.
- [x] `datos.pauta` retirado del esquema (`server.js`) por quedar sin efecto.
- [x] `.trazo-letra-fuente-punteada` añadida a `protegerElementosEstructurales()` en
      `public/index.html` (riesgo de edición accidental que el `<svg>` anterior no tenía).
- [x] Bug de `o()`/`O()` (círculo de 360° invisible en el modelo grande) encontrado y corregido.
- [x] Verificado con Playwright (color y B/N): ficha de regresión de las 20 letras del catálogo,
      pauta continua en la rejilla pequeña para cada una (incluidas mayúsculas), "o"/"O" grande
      visible.
- [ ] Pendiente: confirmar con la maestra que el resultado final (rejilla punteada en Cole
      Carreira real) le sigue pareciendo bien dentro de una ficha completa generada por la app.
- [ ] Pendiente (sin decidir): qué hacer con "Little Days" — queda instalada y disponible pero
      sin usarse en ningún ejercicio; y responder aparte la pregunta más general del usuario
      sobre si se podría montar una fuente propia combinando minúsculas de una fuente y
      mayúsculas de otra distinta (técnicamente sí, con fontTools, pero no se ha vuelto a
      plantear tras optar por esta vía).

**05/09/2026 (mismo día) — octava pasada: 5 fuentes de una web de maestros, ninguna con licencia
libre; se investiga la familia "Edu" de Google Fonts como alternativa OFL, se descarta por
estilo**: el usuario subió 5 archivos `.zip` a `public/fonts/` (descargados de una web de
recursos para maestros) pidiendo instalarlos igual que Little Days/Cole Carreira y probarlos —
avisando él mismo de que no sabía si tenían licencia. Comprobado el nombre y copyright grabados
DENTRO de cada `.ttf` (tabla `name` de OpenType, vía `fontTools`, no una suposición):

- **Edelfontmed**: "Made by Compolaser S.L. for Edelvives S.A." — Edelvives es una editorial
  educativa real y activa; fuente encargada para su propio uso comercial, no de libre
  redistribución.
- **Escolar1 / Escolar4 Puntos**: "© Antonio Herrera Infantes & Anye1992" — copyright de un autor
  concreto, sin licencia libre asociada en ningún sitio; un mirror que la distribuye avisa
  explícitamente "prohibido uso comercial, verificar licencia con el autor".
- **Mestra1(MeMimaPautada)**: basada en una fuente de Type-Ø-Tones (fundición comercial real) y
  con un aviso EN CATALÁN grabado dentro del propio archivo: "Versió de FTP per a ús escolar
  sense ànim de lucre" / "Ús escolar solament" (uso escolar sin ánimo de lucro, solo uso
  escolar) — prohibición de uso comercial explícita y sin ambigüedad.
- **PalMemim**: "© Ceip Marinada, Montornès del Vallès, 2000" — copyright de un colegio público
  concreto (confirmado real), sin licencia libre asociada.

Como la app se va a comercializar (motivo ya documentado por el que solo se autoalojan fuentes
OFL — ver cabecera de `style.css`, sección 1), instalar cualquiera de las 5 tal cual habría sido
un riesgo real. Se le explicó el hallazgo al usuario con detalle (no solo "no se puede", el motivo
concreto de cada una) y eligió NO seguir con ninguna de las 5 — quedan sus `.zip` originales sin
tocar en `public/fonts/` (no se han borrado, están sin usar y no los referencia el código).

El usuario preguntó si se podían buscar fuentes parecidas pero con OFL. Se investigó la familia
"Edu" de Google Fonts (ya mencionada en la cabecera de `renderer-lengua.js` desde el origen del
tipo `trazo_letra`, pero solo por su variante de flechas "en desarrollo" en su momento) —
confirmada licencia OFL genuina descargando directamente del repositorio oficial
`github.com/google/fonts` (cada carpeta trae su propio `OFL.txt`, fuente primaria, no un mirror).
Existen variantes de trazo sólido, con pauta, de puntos y con flechas de dirección (una variante
"Arrows" que no existía o no estaba publicada cuando se investigó "Edu" la primera vez). Pero al
renderizar muestras reales (Playwright): TODA la familia "Edu AU/NSW/QLD/SA/TAS/VIC WA NT" es una
letra cursiva/inclinada de escritura ligada (currículo australiano), muy distinta de la letra
recta y semi-separada tipo "letra escolar española" ya validada por la maestra (Cole
Carreira/Little Days) — el mismo motivo por el que se descartó Playwrite ES en su día. Además, sus
variantes "Dots"/"Arrows" (las de puntos y flechas) NO incluyen la `ñ` ni ninguna vocal acentuada
en su tabla de caracteres — solo alfabeto inglés básico + números (las variantes "Hand"/"Guides"/
"Beginner"/"Foundation" sí tienen cobertura española completa). Mostradas las muestras al usuario,
decidió no seguir por esta vía: lo ya instalado (Cole Carreira + Little Days) cubre lo que pidió
la maestra y no hace falta seguir buscando por ahora.

- [x] Verificado el copyright/nombre grabado dentro de las 5 fuentes nuevas (`fontTools`, tabla
      `name`) — ninguna con licencia libre, una (Mestra1) con prohibición de uso comercial
      explícita en el propio archivo.
- [x] Explicado el riesgo al usuario con el detalle de cada fuente antes de instalar nada —
      decisión explícita de no usar ninguna de las 5. `.zip` originales sin tocar en
      `public/fonts/`, sin instalar, sin referenciar en el código.
- [x] Investigada la familia "Edu" de Google Fonts como alternativa OFL (descargada directamente
      del repositorio oficial `google/fonts`, no de un mirror) — licencia confirmada, pero estilo
      cursivo/inclinado descartado por no encajar con la letra recta ya validada; además sin `ñ`/
      acentos en sus variantes de puntos/flechas. No adoptada.
- [ ] Pendiente (sin decidir, backlog bajo — ver también la entrada anterior sobre "Little Days"):
      si en el futuro hace falta una fuente con licencia clara y estilo recto/español distinto de
      Cole Carreira, retomar la búsqueda en otros catálogos (no solo Google Fonts).

**05/09/2026 (mismo día) — novena pasada: ¿se podría pagar una licencia comercial para alguna de
las 5 fuentes descartadas en la octava pasada?**: el usuario preguntó si, para las fuentes que
gustaron pero solo tienen licencia de uso personal/no comercial, se podría simplemente pagar una
licencia comercial al titular. Respuesta general: en principio sí — el "solo uso personal" grabado
en el archivo es solo la condición de la copia gratuita que circula, no un límite legal
infranqueable; el titular de los derechos puede vender una licencia distinta. Pero investigado
caso por caso (WebSearch + WebFetch a las webs oficiales, no solo la afirmación de un tercero):

- **Mestra1(MeMimaPautada)** → SÍ hay una vía comercial real y verificable. Es la versión de uso
  escolar sin ánimo de lucro del tipo "Memimas" de la fundición **Type-Ø-Tones** (Barcelona),
  encargado en 1991 por la editorial Barcanova como modelo digital para aprender a escribir
  (diseñadores Joan Barjau y José Manuel Urós). Type-Ø-Tones vende "Memimas" comercialmente en su
  propia web (type-o-tones.com) y en MyFonts: 12 estilos (Regular/Medium/Bold/Black/Ultra + itálicas
  + una versión "Dots" de puntos, como la que ya usamos), a $50 el estilo suelto o $245 la familia
  completa, con licencias que cubren Desktop, Webfont, App, Ebook y Digital Ad/Email — es decir,
  cubriría el uso que le daríamos en la app. Es, con diferencia, la más viable de las 5.
- **Escolar1/Escolar4 (Antonio Herrera Infantes)**, **Edelfontmed (Edelvives)** y **PalMemim (Ceip
  Marinada)** → sin tienda ni programa de licencias comercial visible en ningún sitio oficial;
  para cualquiera de las 3 habría que localizar y contactar directamente al autor/editorial/colegio
  y negociar desde cero, sin garantía de respuesta ni de que accedan a vender algo así. Viabilidad
  mucho más incierta que Type-Ø-Tones.

Aviso dado también al usuario (no soy abogado ni asesor legal): antes de pagar o dar por válida
cualquiera de estas licencias para uso en la app comercial, hay que leer el EULA real de Type-Ø-Tones
para confirmar qué cubre exactamente ese uso (una app/servicio con muchos usuarios finales puede
necesitar un tipo de licencia distinto al de diseño gráfico tradicional) — no basta con la
descripción de la web.

- [x] Investigado el origen comercial real de "Mestra1(MeMimaPautada)": confirmado que Type-Ø-Tones
      vende la versión legítima ("Memimas", con variante de puntos incluida) por $50/estilo o $245
      la familia completa, con licencia que cubre app/web.
- [x] Confirmado que las otras 3 fuentes descartadas no tienen ninguna vía de licencia comercial
      visible públicamente — requeriría contacto directo, sin garantías.
- [ ] Pendiente (sin decidir, backlog bajo): si en algún momento se quiere seguir esta vía en serio,
      contactar con Type-Ø-Tones/MyFonts para leer el EULA completo de "Memimas" antes de comprar
      nada, y confirmar si de verdad aporta algo que Cole Carreira no dé ya.

**05/09/2026 (mismo día) — décima pasada: fuente "Not Comic" descartada por un motivo de licencia
más serio que los anteriores — el propio archivo lleva grabado el copyright de Microsoft**: el
usuario subió `notcomic.zip`, encontrada por su cuenta, con las mayúsculas convenciéndole mucho y
las minúsculas bonitas pero (según él) sin el "rabito" de enganche que pide la maestra. Comprobado:

- Es un proyecto real y de código abierto del estudio belga Harrisson: una reescritura "seria" (sin
  el aspecto "gracioso") de Comic Sans MS, con licencia declarada en su propio `README.md` como SIL
  OFL, copyright 2024 Harrisson. Motivación documentada en el propio README: el estudio partió de
  forma deliberada del dibujo de Comic Sans MS (calcado en Inkscape) y lo "enderezó", como gesto
  explícitamente político-artístico para liberarlo de las restricciones de licencia de Microsoft —
  el propio texto reconoce que el EULA de Comic Sans "prohíbe copiarla y sobre todo modificarla".
- Sin embargo, la tabla `name` grabada DENTRO de los dos archivos de fuente (`.ttf` y `.otf`, vía
  `fontTools`, no una suposición) todavía dice literalmente: `Copyright (c) 1995 Microsoft
  Corporation. All rights reserved.` y `Comic Sans is a trademark of Microsoft Corporation.` — es
  decir, el propio archivo se autoidentifica como copyright y marca registrada de Microsoft, pese a
  que el README diga OFL. Esto contradice directamente la licencia declarada, y es un caso distinto
  (y más delicado) que los de la octava pasada: ahí el titular era ambiguo o restrictivo pero
  coherente; aquí el propio archivo entra en conflicto con la fuente que lo distribuye, y el
  titular en conflicto (Microsoft) es una empresa con medios y con motivos de sobra para defender
  su marca "Comic Sans". **Decisión: NO instalar ni usar esta fuente en la app comercial**, con
  independencia de lo bien que quede el dibujo, hasta que ese conflicto de metadatos esté aclarado
  por los propios autores (y aun aclarado, el origen calcado de Comic Sans sigue siendo un riesgo
  de fondo que el README no oculta).
- De paso, verificados los dos apuntes concretos del usuario, con resultado mixto: la **Ñ/ñ SÍ
  está** en la fuente (glifo con dos contornos, se renderiza bien — contra lo que él pensaba que
  faltaba; también están todos los acentos y ¿¡ españoles), pero la falta de **"rabito" de enganche
  en minúsculas se confirma**: es un estilo de imprenta tipo Comic Sans, cada letra suelta, sin
  trazo de salida para unir con la siguiente — no serviría tal cual para el estilo ligado que pide
  la maestra, coincidiendo con lo que el usuario ya sospechaba.

- [x] Verificado el copyright/nombre grabado dentro de `NotComic.ttf`/`NotComic.otf` (`fontTools`,
      tabla `name`) — contradice la licencia OFL declarada en el `README.md` del propio paquete:
      el archivo se autoatribuye a "Microsoft Corporation" y llama a "Comic Sans" marca registrada
      de Microsoft.
- [x] Comprobada la cobertura de caracteres españoles (`fontTools`, tabla `cmap` + comprobación de
      contornos): Ñ/ñ, todas las vocales acentuadas, ü/Ü, ¿¡ — todo presente y con glifo real (no
      vacío). Renderizada una muestra visual (Playwright) y enviada al usuario.
- [x] Confirmado visualmente que las minúsculas no llevan rabito de enganche (estilo de imprenta,
      letras sueltas) — no cumple el requisito de la maestra para el estilo ligado.
- [x] Decisión tomada: no instalar `Not Comic` en `public/fonts/` por el conflicto de licencia
      dentro del propio archivo. El `.zip` original queda solo en la carpeta de subidas de la
      conversación, no se ha copiado al proyecto.

**05/09/2026 (mismo día) — undécima pasada: se prueba de verdad la idea de "mayúsculas de otra
fuente + minúsculas de Little Days" — descubierto que Little Days no es el estilo que se pensaba, y
la mezcla no funciona visualmente con ninguna candidata probada**: para responder de una vez a la
idea que el usuario lleva un tiempo planteando (sustituir solo las mayúsculas de "Little Days",
manteniendo sus minúsculas), se renderizó primero el propio Little Days completo — y resulta ser una
**letra caligráfica de lazos muy ornamentada** (tipo invitación de boda, con florituras y bucles
grandes en ambas cajas), no la letra escolar sencilla que su nombre podría sugerir. Esto explica por
qué llevaba instalada desde hace tiempo sin usarse en ningún ejercicio real.

Se probaron 4 candidatas de mayúsculas con licencia OFL limpia (verificada con `fontTools`, sin
ningún conflicto de copyright como el de "Not Comic"): **Comic Neue** (nueva, descargada del
repositorio oficial `google/fonts`, el rediseño "serio" de Comic Sans hecho desde cero — sin calcar
el original, a diferencia de "Not Comic" — por Craig Rozynski), **Baloo 2** (nueva, mismo origen),
**Andika** y **Fredoka** (ya instaladas y aprobadas en el proyecto, para cuerpo de texto y títulos
respectivamente). Las 4 tienen cobertura española completa (Ñ/ñ, acentos, ¿¡) y licencia limpia.
Renderizada una comparación real (Playwright): cada mayúscula sola, y mezclada con las minúsculas
de Little Days en palabras de ejemplo ("Mariposa Ñoño Araña"). **Resultado: ninguna combina bien**
— las 4 candidatas son mayúsculas de imprenta lisas, geométricas o semi-redondeadas, mientras que
las minúsculas de Little Days son un guion caligráfico de trazo variable con lazos y enlaces; al
juntarlas se ve claramente como dos alfabetos distintos pegados, no como una sola letra coherente.
Enviada la comparación visual al usuario para que lo viera por sí mismo.

**Conclusión**: no seguir por esta vía con Little Days. El problema ya no es de licencia (las 4
candidatas están limpias) sino de estilo: para lograr una letra ligada con "rabito" de enganche
coherente hace falta una única fuente diseñada como un todo (mayúsculas y minúsculas a juego), no
una mezcla de piezas sueltas de fuentes de familias distintas — el mismo motivo, en el fondo, por el
que ya se había optado por Cole Carreira como única fuente para todo el catálogo de `trazo_letra`.

- [x] Renderizado el propio Little Days completo (mayús + minús) — identificado como caligráfica de
      lazos ornamentada, no letra escolar sencilla; explica por qué seguía sin usarse.
- [x] Verificadas 4 candidatas de mayúsculas (Comic Neue, Baloo 2, Andika, Fredoka) — las 4 con
      licencia OFL limpia y cobertura española completa, sin conflictos de copyright.
- [x] Renderizada y enviada al usuario una comparación visual de las 4 mezcladas con las minúsculas
      de Little Days — ninguna combina de forma coherente, se ve como dos alfabetos distintos.
- [x] Decisión: abandonar la idea de "mayúsculas sueltas + minúsculas de Little Days"; si se quiere
      una letra ligada con rabito, buscar una única fuente completa diseñada así, no una mezcla.

**05/09/2026 (mismo día) — duodécima pasada: la maestra SÍ aprueba Little Days + Baloo 2, por una
razón funcional que la undécima pasada no había valorado — construida la fuente combinada
"Escolar Ligada"**: el usuario le enseñó a la maestra la comparación de la pasada anterior y, pese a
la objeción estética de Claude, ella eligió expresamente la combinación de minúsculas de Little Days
+ mayúsculas de Baloo 2 — con un argumento pedagógico concreto que no se había tenido en cuenta: que
la mayúscula salga visiblemente más gruesa que la minúscula ayuda a los niños a distinguir con
claridad cuándo una letra es mayúscula y cuándo no, algo más importante para el aprendizaje que la
armonía visual entre ambos alfabetos. Aprendizaje para el propio proyecto: el criterio "¿combinan
bien visualmente?" no es el único válido — el criterio pedagógico de quien va a usar la ficha con
niños puede pesar más.

Construida la fuente de verdad (no solo una comparación HTML) con `fontTools`: se tomaron las
minúsculas (con ñ y acentos) de Little Days tal cual, y se copiaron los contornos de las mayúsculas,
dígitos y puntuación básica de Baloo 2 Regular (peso wght=400, la instancia por defecto, la misma
que vio y aprobó la maestra) — decomponiendo los glifos compuestos (Ñ, Á, É...) y remapeando el
cmap para que cada carácter apunte al glifo correcto. Ambas fuentes de origen comparten
unitsPerEm=1000, así que no hizo falta reescalar ninguna coordenada. Se subió el ascenso vertical de
la fuente resultante a 860 unidades para que las mayúsculas acentuadas de Baloo 2 (que llegan a 820)
no queden recortadas. Verificada con una muestra renderizada real (Playwright): todo el alfabeto,
dígitos, acentos y puntuación se ven correctos, sin recortes ni desajustes de línea base.

Guardada como "Escolar Ligada" en `public/fonts/escolar-ligada/` (`.ttf` y `.woff2`), con su propio
`LICENCIA.txt` explicando el origen de cada mitad y cómo se construyó, más una copia del `OFL.txt`
real de Baloo 2 (la OFL exige que cualquier fuente que contenga glifos derivados de una fuente OFL
se redistribuya también bajo OFL, conservando los avisos de copyright). Añadido su `@font-face` y
una clase `.muestra-fuente-escolar-ligada` en `style.css`, siguiendo el mismo patrón que Little
Days/Cole Carreira — **queda instalada y lista para usarse, pero SIN aplicar todavía a ningún
ejercicio de producción**. Cole Carreira sigue siendo la fuente en uso para el punteado de
`trazo_letra` (unir puntitos); "Escolar Ligada" se ha pensado para un futuro ejercicio de trazo
CONTINUO (no de puntitos) — el propio usuario señaló que aún queda por decidir cómo tratar fichas
que mezclen ambos tipos de trazo en un mismo ejercicio; sin diseñar todavía, queda pendiente.

- [x] Construida de verdad (no solo comparación) la fuente combinada con `fontTools`: minúsculas de
      Little Days + mayúsculas/dígitos/puntuación de Baloo 2 Regular (wght=400).
- [x] Corregido sobre la marcha un bug propio del script de construcción: al reutilizar el objeto
      `TTFont` de Little Days (abierto desde un `.woff2`) como base, heredaba `flavor='woff2'` — el
      primer intento de guardar como `.ttf` generó en realidad otro `.woff2` con esa extensión;
      corregido forzando `flavor=None` antes de guardar el `.ttf`.
- [x] Ajustado el ascenso vertical (`hhea`/`OS2`) a 860 para no recortar mayúsculas acentuadas de
      Baloo 2 (llegan a 820, Little Days traía solo 780).
- [x] Verificado con render real (Playwright) desde el `.woff2` final: alfabeto completo, dígitos,
      acentos, ¿¡, y frases de ejemplo — todo correcto, línea base consistente.
- [x] Guardada en `public/fonts/escolar-ligada/` con `LICENCIA.txt` propio + copia del `OFL.txt`
      real de Baloo 2. Añadido `@font-face` + `.muestra-fuente-escolar-ligada` en `style.css`.
- [ ] Pendiente (sin diseñar todavía): cómo aplicar "Escolar Ligada" a un ejercicio real de trazo
      continuo, y cómo tratar fichas que combinen trazo continuo y trazo de puntitos (Cole Carreira)
      en un mismo ejercicio o página.
- [ ] Pendiente (backlog bajo): decidir si "Escolar Ligada" es un buen nombre definitivo o conviene
      renombrarla — solo vive en la tabla `name` del propio archivo, cambiarlo no cuesta nada.

**05/09/2026 (mismo día) — decimotercera pasada: 5 fuentes nuevas subidas por el usuario — 2 para
variar tipografía en cursos avanzados de Primaria (Dimica, Minimasimple) y 3 en árabe para la Fase 8
(Aref Ruqaa Ink, Cairo Play, GWM Sans Arabic)**: motivo, según el propio usuario, es que la maestra
pidió varias tipografías porque, conforme el niño sube de curso dentro de Primaria, tiene que
aprender a leer también otros estilos de letra (no seguir viendo solo la de trazo escolar de 1º-2º).
Revisadas las 5 con el mismo método de siempre (tabla `name` grabada con `fontTools`, cobertura de
caracteres letra a letra, y verificación cruzada externa cuando el propio archivo no basta):

- **Dimica** (Dimka Fonts): licencia OFL confirmada por PARTIDA DOBLE — la propia tabla `name` del
  archivo lo dice, Y la web oficial del propio autor (v3.dimka.com/fonts/) lo confirma también
  ("free for both personal and commercial use") — la verificación más fuerte que hemos tenido para
  una fuente de fuera de Google Fonts, mejor que Little Days/Cole Carreira (que solo tenían
  catálogos de terceros). Cobertura española completa. **Instalada y lista para usarse de verdad.**
- **Minimasimple** (Benoit Fourdinier): licencia probablemente libre (dafont + commercialusefont.com
  coinciden en "100% Free"/"Free"), pero aparece un problema distinto y más grave: a la fuente le
  **faltan caracteres imprescindibles en español** — ñ, á, í, ó (minúsculas), Ñ, Á, Í, Ó, Ú
  (mayúsculas), ¿, ¡. Detalle importante del propio proceso de verificación: al probar la fuente en
  el navegador estos huecos NO se notaban a simple vista, porque el navegador rellena
  automáticamente cada carácter que falta con otra fuente distinta del sistema, sin avisar — hizo
  falta comprobar las tres tablas `cmap` del archivo con `fontTools` letra a letra para descubrirlo
  (y luego volver a renderizar marcando expresamente qué letras faltaban de verdad, para no enseñar
  al usuario una muestra engañosa). **Instalada tal cual mientras se decide, pero NO USABLE para
  ningún texto en español hasta rellenar esos huecos** (a mano con una herramienta de fuentes, o
  pidiéndoselo al autor).
- **Aref Ruqaa Ink** y **Cairo Play**: las dos con licencia OFL real, sin ninguna ambigüedad — el
  `.zip` de cada una trae su propio `OFL.txt` oficial (a diferencia de todas las fuentes anteriores
  de este documento, que había que verificar por otras vías), y coincide con la tabla `name`
  grabada. Las dos con cobertura árabe completa y tablas GSUB/GPOS (necesarias para que las letras
  árabes se unan correctamente entre sí — comprobado que existen, no solo que se ven bien en una
  captura). Aref Ruqaa Ink es más caligráfica/decorativa (estilo Ruqaa clásico); Cairo Play es más
  neutra y de lectura, y además cubre también el alfabeto latino/español en el mismo archivo.
  **Instaladas y listas para la Fase 8** (traducción a árabe) o antes si hiciera falta.
- **GWM Sans Arabic**: descartada de inmediato, sin duda posible — la tabla `name` del propio
  archivo dice literalmente "Copyright © 2025 Great Wall Motors Company Limited. All Rights
  Reserved.", diseñada por Monotype (fundición comercial que audita activamente el uso de sus
  fuentes) para esa marca de coches. Es una fuente corporativa de pago, sin ninguna licencia libre —
  el caso más claro de "no usar" de todos los evaluados hasta ahora, más incluso que "Not Comic" (ahí
  al menos había una licencia libre declarada, aunque contradictoria; aquí no hay ninguna). **NO
  instalada ni referenciada en el código.** Se avisó al usuario y se le recomienda borrar el `.zip`
  de su carpeta (Claude no puede borrar archivos del ordenador del usuario desde aquí).

- [x] Revisadas las 5 fuentes nuevas con `fontTools` (tabla `name` + cobertura `cmap` completa, las
      tres subtablas Unicode, no solo "bestCmap") y, cuando hizo falta, verificación externa cruzada.
- [x] Dimica: licencia OFL confirmada por partida doble (archivo + web oficial del autor). Instalada
      en `public/fonts/dimica/` (convertida a `.woff2`), con `LICENCIA.txt` y `@font-face`.
- [x] Minimasimple: detectados y documentados los caracteres españoles que le faltan (ñ, á, í, ó,
      Ñ, Á, Í, Ó, Ú, ¿, ¡) — instalada solo como referencia, marcada como NO USABLE hasta rellenar
      esos huecos. `LICENCIA.txt` con el detalle exacto y el aviso sobre el relleno automático del
      navegador que casi lo esconde.
- [x] Aref Ruqaa Ink y Cairo Play: licencia OFL real verificada (OFL.txt oficial incluido),
      cobertura árabe completa con GSUB/GPOS confirmados. Instaladas en `public/fonts/aref-ruqaa-ink/`
      y `public/fonts/cairo-play/` (convertidas a `.woff2`), con `LICENCIA.txt` y `@font-face`.
- [x] GWM Sans Arabic: identificada como fuente corporativa de pago (Great Wall Motors / Monotype,
      "All Rights Reserved") — NO instalada, usuario avisado con el detalle y recomendación de
      borrarla de su carpeta.
- [ ] Pendiente (sin decidir): en qué curso/ejercicio concreto se usarían Dimica (y Minimasimple, una
      vez arreglada), y cuándo empezar la Fase 8 (traducción a árabe) para usar Aref Ruqaa Ink/Cairo
      Play — de momento las 4 quedan solo guardadas y documentadas.

**08/09/2026 — tres tipos blindados nuevos: `relacionar`, `clasificar_silabas`, `acentuacion`
(backlog Megapack Kumubox)**: mismo origen que la ampliación equivalente de Matemáticas (ver
Fase 3) — comparativa del catálogo de Lengua de Primaria del Megapack 2025 de Kumubox (47
recursos) contra lo ya implementado. Confirma exactamente el pendiente que ya constaba en la
Fase 5 ("huecos, lectura comprensiva, relacionar, ordenar palabras") y añade `clasificar_silabas`
y `acentuacion` como candidatos concretos con buena pinta para blindar (recursos de origen:
"Dominó rimado"/"Palomitas silábicas"/"Monosílabas, bisílabas y trisílabas"/"Estructuras
silábicas" → `clasificar_silabas`; "Frases hechas" y varios ejercicios de relacionar conceptos →
`relacionar`; "Pack ortografía" → `acentuacion`). `huecos` y `lectura comprensiva` y `ordenar
palabras` NO se implementan en esta tanda — siguen disponibles vía la válvula de escape
`contenido_libre` (ya cubren esos tres con las clases documentadas ahí: `.hueco`,
`.texto-lectura`, `.ejercicio-lista`), quedan pendientes de blindar como tipo propio cuando les
toque turno.

Gating por curso en `construirSystemPromptLengua()` (`server.js`), mismo patrón que Matemáticas:
`relacionar` en todos los cursos, `clasificar_silabas` solo 1º-3º (conciencia silábica, cursos
iniciales), `acentuacion` desde 3º (currículo real de reglas de acentuación). Blindaje real en
`relacionar` (`renderer-lengua.js`): la columna B que se IMPRIME nunca llega en el mismo orden
que la columna A que manda Claude — el propio código la desordena con una baraja determinista
(sembrada con un hash del contenido, para que la ficha no cambie entre vista previa e impresión)
y corrige cualquier elemento que por azar quede en su fila original. `clasificar_silabas` y
`acentuacion` blindan solo el maquetado (huecos, casillas, separación en sílabas con "·"): el
contenido lingüístico en sí no se verifica por código, mismo criterio que ya se usa con
`crucigrama` en Matemáticas — exigiría reproducir reglas fonéticas/ortográficas completas del
español sin margen de error.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 14. Validado:
`node --check`, render unitario con datos simulados (incluyendo columnas de relacionar con
distinta longitud, tipo desconocido cayendo en `contenido_libre`) y capturas Playwright en color
y blanco/negro sobre una ficha completa. **Pendiente**: confirmar con una ficha real generada por
Claude a través de la API.

**08/09/2026 — tres tipos blindados más: `categoria_gramatical`, `formacion_palabras`,
`eleccion_ortografica` (backlog Megapack 2026 de Kumubox)**: mismo origen que la ampliación
equivalente de Matemáticas de la misma fecha (ver Fase 3, "Quinta ampliación") — comparativa del
catálogo de Lengua de Primaria del Megapack 2026 (50 recursos, catálogo de este mismo curso,
distinto del de 2025 usado en la ampliación anterior) contra lo ya implementado, anotando solo lo
NUEVO. Tres huecos identificados: **`categoria_gramatical`** (identificar sustantivo/verbo/
adjetivo/determinante dentro de una frase, currículo real de 3º-6º — recurso: "Plantillas
analizadoras tipos de palabras"), **`formacion_palabras`** (clasificar palabras simples/derivadas/
compuestas, 4º-6º — recursos: "El muro de las palabras", "Pizzas familiares de palabras simples,
derivadas y compuestas") y **`eleccion_ortografica`** (completar una palabra eligiendo la letra
correcta entre un cierre de opciones — b/v, g/j, h, ll/y —, 2º-6º — recurso: "Reglas de
ortografía: b/v, g/j, h y ll/y"). Se descartó implementar "sinónimos y antónimos" como tipo propio
porque ya lo cubre `relacionar` (columna A ↔ columna B genérica, sin necesidad de un tipo nuevo) y
se dejó "comprensión lectora"/"dictados preparados" fuera de esta tanda por ser un desarrollo
mucho mayor (necesitan textos de lectura reales) — siguen en el pendiente de siempre, vía
`contenido_libre`.

Gating por curso en `construirSystemPromptLengua()`, mismo patrón: `categoria_gramatical` 3º-6º,
`formacion_palabras` 4º-6º, `eleccion_ortografica` 2º-6º. Blindaje: ninguno de los tres decide
contenido lingüístico (categoría gramatical real, clasificación de la palabra, letra correcta) —
eso lo garantiza Claude, mismo criterio que `clasificar_silabas`/`acentuacion`; el código solo
resalta la palabra objetivo dentro de la frase en `categoria_gramatical` (búsqueda de texto exacta,
sin regex — si no encuentra la palabra tal cual, imprime la frase sin resaltar en vez de fallar) y
convierte el "_" de `eleccion_ortografica` en el hueco exacto donde va la letra a elegir.
`formacion_palabras` reutiliza directamente las clases CSS de `clasificar_silabas` (mismo patrón
visual de casillas, solo cambian las 3 categorías), sin CSS propio.

Documentación del contrato HTML/CSS en `REFERENCIA_CLASES_HTML_FICHAS.md`, sección 15. Validado:
`node --check` en los tres ficheros tocados, render unitario con datos simulados (incluyendo casos
límite: palabra objetivo no encontrada en la frase, item sin frase, palabra sin "_", múltiples "_"
en la misma palabra, `opciones` vacío) y capturas Playwright en color y blanco/negro sobre una
ficha completa junto con `numeros_romanos`. **Pendiente, igual que toda tanda nueva**: confirmar
con una ficha real generada por Claude a través de la API.

---

## FASE 10 — Gestión Emocional y Gestión del Aula (💭 abierta, 08/09/2026)
**Estado: 💭 Abierta — sin decidir alcance ni cuándo**

Origen: al comparar el catálogo completo de Primaria del Megapack 2025 de Kumubox con lo que ya
cubre la app, dos categorías aparecieron con peso real (26 y 17 recursos respectivamente) que no
son "fichas de asignatura" en el sentido curricular LOMLOE — no encajan en ninguna fase existente
(Fase 5 es migración de ASIGNATURAS; esto es contenido transversal) — así que quedan anotadas
aquí, como línea de contenido a tener en cuenta para el futuro, sin decidir todavía si se aborda,
cuándo, ni con qué alcance. Ninguno de estos recursos depende del banco de ilustraciones (Fase 4)
para empezar — la mayoría es texto/estructura maquetable con el mismo patrón JSON+renderizador
que el resto del proyecto.

**Gestión Emocional y Mindfulness** (26 recursos en el Megapack): carpeta general con enigmas ·
enigmas de las 4 emociones básicas (alegría/ira/miedo/tristeza) · entendiendo la ansiedad
(clasificación) · autoconocimiento y autoestima · cómo acompañar una rabieta · cómo gestionar que
no pegue · reforzar seguridad y autonomía · teoría del apego · calendario emocional · tarjetas de
calma · caja de habilidades sociales · pack de gestión emocional · cuadernillo de mindfulness ·
meditaciones guiadas (25 días) · juego de mindfulness · estrategias de afrontamiento (A-Z) ·
estrategias de calma · escape room "El Jardín de la Tranquilidad" · mindfulness musical · mini
cuaderno de respiración consciente · cuaderno de convivencia emocional · Inside Out (carrera y
rueda de emociones).

**Gestión del Aula** (17 recursos en el Megapack): dinámica grupal "círculo curioso" · medallas
de inicio de curso · aviso al Ratoncito Pérez · señales de aula · registro de baño · diario de
aula · decoración temática (El Principito) · dinámicas para cambiar de sitio · carteles de
aprendizaje socioemocional · prevención y detección del acoso escolar · "en sus zapatos" (empatía)
· pack de recursos de evaluación · pack de rutinas de pensamiento · exit tickets para evaluar ·
dianas de evaluación · llaves de los pensadores · tickets de salida para la reflexión.

**Ampliación con el Megapack 2026 (08/09/2026)** — catálogo de este mismo curso; mismo criterio,
solo lo genuinamente NUEVO frente a lo ya recogido arriba del Megapack 2025 (se confirma, por
ejemplo, que "círculo curioso" y "medallas de inicio de curso" son literalmente los mismos
recursos repetidos, no se duplican aquí):

**Gestión Emocional y Mindfulness — nuevo (2026)**: "Rompe los Estereotipos" (kit de debate visual
sobre igualdad de género) · microhistorias para pensar y debatir (dilemas breves) · semáforo
emocional / semáforo de aprendizaje (parar-pensar-actuar, autorregulación) · rincón de la calma
(reloj de las emociones) · material sobre uso y abuso de las pantallas · pausas activas (tarjetas
de movimiento/calma/creatividad/estiramiento).

**Gestión del Aula — nuevo (2026)**: carteles de técnicas de aprendizaje cooperativo · actividades
multinivel de cohesión grupal de inicio de curso · sistema de puntos/refuerzo positivo estilo
ClassDojo (tablero de recompensas, tarjeta de puntos) · un conjunto completo de **instrumentos de
evaluación en Excel para el docente** (rúbrica analítica, coevaluación, autoevaluación, control de
asistencia, seguimiento de competencias LOMLOE, objetivos individuales, rúbrica de exposiciones
orales) — formato distinto al resto (hoja de cálculo descargable, no una ficha imprimible para el
alumnado), pero mismo terreno de "gestión de aula"; se anota aparte porque si algún día se aborda
esta fase, esta parte necesitaría un enfoque de producto distinto (exportar/generar una plantilla
de seguimiento, no una ficha A4).

**Próximo paso**: ninguno todavía — igual que se hizo con la Fase 4 y la Fase 7, no tocar código
hasta dedicarle su propia sesión de decisión de alcance (¿es una "asignatura" más dentro del
selector, o una categoría de contenido transversal distinta? ¿qué tipos de ejercicio/formato
tendría sentido blindar primero? ¿tiene sentido meter ahí también los instrumentos de evaluación
en Excel, o es un producto aparte?).

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
