# ROADMAP DEL PROYECTO — Generador de Fichas Escolares

*Última actualización: exploración de banco de imágenes propio para Fase 4 (04/08/2026)*

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
**Estado: 🔄 En curso**

| Curso | Estado |
|-------|--------|
| 1º | ⏳ Pendiente de revalidar con el motor JSON nuevo (validado antes con el sistema HTML viejo) |
| 2º | ⏳ Pendiente de revalidar con el motor JSON nuevo |
| 3º | ⏳ Sin validar con ficha real |
| 4º | ⏳ Sin validar con ficha real |
| 5º | 🔄 En pruebas — se detectó y corrigió el bug del enunciado duplicado |
| 6º | ⏳ Sin validar con ficha real |

**Metodología**: generar ficha real → PDF → inspección visual → reportar con
curso + tipo de ejercicio + qué se esperaba vs qué salió → corregir →
revalidar. No dar una fase por cerrada sin al menos una ficha real por curso.

---

## FASE 4 — Diferenciación visual por asignatura y curso
**Estado: 💭 Abierta — sin decidir alcance ni cuándo**

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
