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
   modelo de negocio. Cambia poco entre sesiones.
3. **`ROADMAP_FICHAS_ESCOLARES.md`** — el documento vivo de verdad. Tiene
   el detalle completo de cada fase, decisiones tomadas y por qué, y
   checklists. Si algo de este resumen y el roadmap no coinciden, **manda
   el roadmap**, es la fuente de verdad.
4. Si se va a tocar CSS/maquetación: **`REFERENCIA_CLASES_HTML_FICHAS.md`**
   (contrato de clases HTML).

Además, sube los archivos de código actuales tal cual están en tu carpeta
local (`server.js`, `public/index.html`, `public/style.css`,
`renderer-matematicas.js`) — no asumas que el resumen contiene el código
línea por línea.

**Repositorio**: `https://github.com/andreianusette/fichas-escolares`
(público — se puede clonar/leer directamente sin subir archivos, si la
sesión nueva tiene acceso a herramientas de terminal/bash).

---

## 2. Estado del proyecto en una frase

App funcionando en local (`node server.js` + `localhost:3000`), con
Matemáticas ya en un motor determinista (JSON + `renderer-matematicas.js`,
no HTML libre), maquetación bastante pulida, y un catálogo propio de 84
iconos SVG. Sin desplegar todavía. Fase activa: **Fase 3** (validación
curso a curso de Matemáticas).

---

## 3. Qué se hizo en la última sesión (11/08/2026)

- **Imagen del docente**: al final quedó como bloque flotante independiente
  (`position: absolute` sobre `.ficha`), arrastrable con una manija,
  redimensionable, sin marco/fondo (respeta transparencia PNG real). *Ojo:
  la primera versión (imagen dentro de `.ejercicio`) se descartó tras
  probarla en local — no lo repitas si alguien lo vuelve a sugerir.*
- **Título de ficha**: antes era una frase larga en negrita gigante. Ahora
  es corto (prompt actualizado) y con fuente más fina (Fredoka Medium en
  vez de Bold).
- **Cálculo mental sin doble numeración**: la lista de operaciones tipo
  "6 + 2 =" ya no numera cada línea (se solapaba con el número del propio
  ejercicio).
- **Catálogo de iconos SVG ampliado de 9 a 84**: 57 adaptados de Tabler
  Icons (MIT), 18 dibujados a mano (fauna clásica que Tabler no cubre).
  Varios necesitaron 2-4 rediseños hasta leerse bien a tamaño real (60px).
  Detalle completo y metodología en el ROADMAP, sección Fase 3.
- **Selector de iconos en el formulario**: el docente puede elegir de
  antemano qué iconos usar (opcional). Si elige, se restringe la lista que
  ve Claude en el prompt (no se sustituye nada después de generar, para no
  romper la coherencia enunciado↔icono). Nuevo endpoint `GET /api/iconos`
  (sin coste, sin IA).
- Se vació `generador.html` (prototipo antiguo que exponía la API key vía
  proxy externo) — ya no supone un riesgo.
- Todo lo anterior ya está subido a GitHub (commit `623c416`).

---

## 4. Siguiente paso sugerido (según el propio roadmap)

Volver a la **Fase 3**: probar el selector de iconos nuevo con una ficha
real (API key real, no simulada), y si sale bien, seguir la validación
curso a curso pendiente:

| Curso | Estado |
|-------|--------|
| 1º | ⏳ Pendiente de *revalidar* con el motor JSON nuevo |
| 2º | ⏳ Pendiente de *revalidar* con el motor JSON nuevo |
| 3º, 4º, 6º | ⏳ Sin validar nunca con el motor JSON |
| 5º | ✅ Validado en contenido — falta el visto bueno visual de un maestro real |

---

## 5. Cosas que NO hay que perder de vista

- **No desplegar en Railway todavía** (decisión explícita, ver roadmap
  sección de riesgos/pendientes: sin autenticación ni límite de uso).
- **Metodología de validación**: el docente genera en local con su API key,
  sube el PDF, Claude lo convierte a imagen (`pdftoppm`) para inspección
  visual real — nunca dar por buena una ficha solo leyendo el HTML/JSON.
- **Toda prueba de UI/CSS que se haga en el chat debe verificarse con
  Playwright + captura de pantalla real** (a tamaño 60px cuando sea un
  icono, o imprimiendo a PDF cuando sea maquetación) antes de entregar
  nada como "arreglado" — varias veces esta sesión un arreglo a ojo
  resultó tener efectos secundarios que solo se vieron al probarlo de
  verdad (ejemplo: `overflow: hidden` vs `visible` al ocultar el borde de
  redimensionado en impresión).
- Flujo de trabajo de esta sesión: cambios se acumulan en local durante la
  sesión, se suben a GitHub todos juntos al final (`git add . && git
  commit && git push`), no archivo a archivo.
