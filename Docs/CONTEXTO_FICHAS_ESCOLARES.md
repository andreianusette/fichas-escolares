# CONTEXTO DEL PROYECTO: GENERADOR DE FICHAS ESCOLARES IA

*Última actualización: sesión 4 — fusión Claude+Gemini, GitHub configurado, nuevas reglas pedagógicas*

---

## 1. Visión del producto y modelo de negocio

- **Idea**: aplicación SaaS web para maestros de Educación Primaria en España. Genera fichas de clase personalizadas en segundos.
- **Propuesta de valor diferencial**: hiper-localización legislativa (LOMLOE + decretos autonómicos de las 17 CC.AA. + Ceuta y Melilla) e idiomática (Español, Catalán/Valenciano, Gallego, Euskera).
- **Campo "Instrucciones especiales"**: es el motor real de variedad de la app. El docente puede pedir temática, nivel, número exacto de ejercicios, formato... El formulario actual no lo comunica bien — mejorarlo es una tarea pendiente importante.
- **Formato de salida**: Claude genera HTML estructurado, se muestra en editor en vivo (contenteditable) y el docente exporta a PDF mediante el diálogo de impresión del navegador.
- **Monetización futura**: freemium (~4,99€/mes ilimitado). Foco en web para PC.

---

## 2. Arquitectura técnica y stack

- **Frontend**: HTML5 + CSS3 + JS vanilla (`public/index.html` + `public/style.css`)
- **Backend**: Node.js + Express con ES modules (`server.js`)
- **Motor de IA**: API de Anthropic — modelo `claude-sonnet-4-5`
- **Entorno actual**: 100% local (`localhost:3000`). Railway y Supabase pospuestos.
- **Repositorio**: GitHub privado → `https://github.com/andreianusette/fichas-escolares`
- **Seguridad**: API key en `.env`, nunca en el código. `.gitignore` excluye `.env` y `node_modules/`.
- **Entorno del usuario**: Windows, VS Code, PowerShell.

```
fichas-escolares/
├── server.js              ← backend: system prompt (15 reglas) + endpoint API
├── public/
│   ├── index.html         ← formulario + editor en vivo
│   └── style.css          ← diseño visual completo
├── package.json           ← "type": "module" (ES modules)
├── .env                   ← API key (no en git)
└── .gitignore
```

**Para arrancar**: `node server.js` → abrir `http://localhost:3000`

**Comandos Git habituales** desde la terminal de VS Code:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

---

## 3. Historia del proyecto — fusión Claude + Gemini

**Fase Claude** (sesiones 1-3): MVP desde cero. SYSTEM_PROMPT con reglas pedagógicas detalladas. Validación de 1º y 2º de Primaria en Matemáticas.

**Fase Gemini** (en paralelo con sesión 3-4): Gemini rediseñó la parte visual. Aportó:
- Layout de dos paneles (formulario izquierda / visor derecha)
- `style.css` separado del HTML
- Modo ahorro de tinta B/N (toggle en la UI)
- Prompts específicos por asignatura (Lengua, Ed. Física, Música, Inglés, Conocimiento del Medio)
- Protección de elementos estructurales al editar (SVGs, tablas no se rompen por error)
- Validación de API key al arrancar el servidor
- Nuevas clases CSS: `.opciones-test`, `.caja-espacio-dibujo`, `.texto-lectura`

**Fusión (sesión 4)**: los archivos de Gemini tenían mejoras visuales pero habían perdido las reglas pedagógicas de Claude (rangos numéricos, SVGs, instrucciones especiales, CC.AA., etc.). Se fusionaron tomando la estructura de Gemini como base e inyectando todas las reglas de Claude. Los tres archivos resultantes están en GitHub.

---

## 4. System Prompt — 15 reglas actuales

El prompt vive en `server.js` dentro de `SYSTEM_PROMPT`:

1. Solo HTML puro (sin markdown, sin explicaciones).
2. Cabecera obligatoria (Nombre, Fecha).
3. Título descriptivo con clase `titulo-ficha`.
4. Cada ejercicio en `<div class="ejercicio">`.
5. ~10 ejercicios por defecto; respetar número exacto si el docente lo especifica.
6. Adecuación numérica por curso en Matemáticas (1º: 0-50 sin llevadas → 6º: hasta millones).
7. Operaciones verticales con tabla `operacion-vertical`, exactamente 2 números, nunca 3.
8. SVGs embebidos para conteo en 1º y 2º (biblioteca de 9 objetos a 40×40px, layout flex-row).
9. Preguntas tipo test con clase `opciones-test`.
10. Espacios para dibujar con clase `caja-espacio-dibujo`.
11. Instrucciones especiales del docente con máxima prioridad.
12. Sin autoevaluación ni caritas.
13. Pie de página con referencia LOMLOE.
14. **[Nueva]** Clase `curso-inicial` en `<div class="ficha">` para 1º, 2º y 3º → el CSS aplica Andika automáticamente.
15. **[Nueva]** Estructura de problema en 4 bloques para 1º, 2º y 3º: Enunciado / Datos / Operación / Resultado.

Además hay `PROMPTS_MATERIA` con instrucciones específicas por asignatura: Matemáticas, Lengua Castellana, Conocimiento del Medio, Educación Física, Música, Inglés.

**Limitaciones honestas:**
- Reglas detalladas solo para Matemáticas. Otras materias tienen prompts básicos.
- Solo 1º y 2º validados con fichas reales. 3º-6º tienen reglas escritas pero sin probar.
- CC.AA. en el desplegable no afectan al contenido todavía (LOMLOE genérico en todos).

---

## 5. CSS — clases principales de la ficha

| Clase | Descripción |
|-------|-------------|
| `.ficha` | Contenedor raíz. Hoja blanca A4 con sombra. |
| `.ficha.curso-inicial` | Tipografía Andika en todo el contenido para 1º-3º, incluidas operaciones. |
| `.cabecera` | Nombre/fecha, borde azul redondeado. |
| `.titulo-ficha` | Fredoka, centrado, línea inferior azul. |
| `.ejercicio` | Contenedor de ejercicio, con `page-break-inside: avoid`. |
| `.enunciado` | Instrucción del ejercicio; número en badge azul. |
| `.operacion-vertical` | Tabla aritmética. Courier New (4º-6º) / Andika (1º-3º). |
| `.bloque-problema` | Contenedor de los 4 bloques estructurados (1º-3º). |
| `.bloque-enunciado` | Fondo azul claro + borde azul. |
| `.bloque-datos` | Fondo amarillo + borde amarillo. |
| `.bloque-operacion` | Fondo verde + borde verde. |
| `.bloque-resultado` | Fondo lila + borde lila. |
| `.opciones-test` | Grid 2 columnas para test. |
| `.caja-espacio-dibujo` | Caja punteada para dibujar. |
| `.espacio-respuesta` | Caja de respuesta (variantes: `.alto`, `.bajo`, `.pauta`). |
| `.nota-pie` | Pie de página LOMLOE. |
| `.modo-blanco-negro` | Elimina colores para ahorro de tinta. |

`@media print` oculta los paneles de la app y deja solo la ficha.

---

## 6. Formulario (index.html)

Campos disponibles:
1. **Idioma**: Español / Catalán / Gallego / Euskera
2. **Comunidad Autónoma**: 17 CC.AA. + Ceuta y Melilla
3. **Curso**: 1º a 6º de Primaria
4. **Asignatura**: Matemáticas / Lengua / Conocimiento del Medio / Ed. Física / Música / Inglés
5. **Instrucciones especiales**: textarea — campo más potente de la app

Funcionalidades del visor:
- Toggle modo B/N para ahorro de tinta
- Botón imprimir/PDF (desmarcar cabeceras del navegador en "Más opciones")
- Ficha editable en pantalla; SVGs y tablas protegidos contra edición accidental

---

## 7. Validación de fichas

| Curso | Estado | Notas |
|-------|--------|-------|
| 1º Primaria | ✅ Base OK / ⚠️ SVGs 40×40 sin re-validar | Bug SVGs 52×52 corregido, no re-probado con ficha real. |
| 2º Primaria | ✅ Validado | Rango 0-99. Bugs corregidos. |
| 3º-6º | ⏳ Pendientes | Reglas escritas, sin pruebas reales. |

**Metodología**: generar ficha → subir PDF → `pdftoppm` para inspección visual → diagnosticar → corregir → revalidar.

---

## 8. Idea importante para próxima sesión: gradualidad en 1º-3º

Las reglas 14 y 15 (clase `curso-inicial` y estructura de 4 bloques) se aplican igual a 1º, 2º y 3º, pero deberían ser **graduales**. Propuesta de refinamiento:

- **1º**: letra más grande, mucho espacio visual, 4 bloques SIEMPRE, SVGs obligatorios.
- **2º**: letra algo más pequeña, 4 bloques todavía, SVGs en conteo pero no siempre.
- **3º**: letra ya próxima a 4º-6º, 4 bloques solo en problemas complejos, sin SVGs.

**Decisión tomada**: abordar esto con fichas reales de los tres cursos delante, no a ciegas. Generar una ficha de cada curso, compararlas y ajustar lo que no encaje.

---

## 9. Pendiente / roadmap

### Inmediato
- [ ] Re-validar 1º con SVGs de 40×40 (nueva ficha de prueba).
- [ ] Implementar gradualidad en reglas 14 y 15 (ver sección 8).
- [ ] Validar 3º, 4º, 5º y 6º en Matemáticas, uno a uno.

### Medio plazo
- [ ] Mejorar formulario: ejemplos de instrucciones, sugerencias por asignatura, selector de tipo de ficha.
- [ ] Tamaño de letra ajustable por curso o selector manual.
- [ ] Reglas específicas para otras materias (Lengua, Naturales, Sociales).

### Fase 2 — requiere infraestructura
- [ ] Autenticación de usuarios.
- [ ] Histórico de fichas por docente (Supabase).
- [ ] Despliegue en Railway.
- [ ] Adaptación por Comunidad Autónoma.
- [ ] Idiomas cooficiales.

### Fase 3 — largo plazo
- [ ] Expansión a Secundaria y Bachillerato.
- [ ] Expansión a países hispanohablantes de América.

---

## 10. Decisiones descartadas (no reabrir)

- **Lovable/Bubble**: el núcleo diferencial es el SYSTEM_PROMPT, no la interfaz.
- **JSON + plantillas**: las plantillas fijas rompen la flexibilidad.
- **App móvil**: los docentes preparan clases desde PC.
- **Railway ahora**: pospuesto hasta tener autenticación y más cursos validados.
- **Latinoamérica ahora**: cada país tiene currículo distinto, es otro producto.

---

## 11. Archivos a adjuntar al iniciar un nuevo chat

**Siempre:**
1. `Docs/ROADMAP_FICHAS_ESCOLARES.md` — en qué fase estáis y qué toca ahora.
2. Este archivo: `CONTEXTO_FICHAS_ESCOLARES.md`

**Si se va a tocar código o generar/depurar fichas:**
3. `server.js`
4. `renderer-matematicas.js` (motor de Matemáticas — JSON + renderizador)
5. `public/index.html`
6. `public/style.css`

**Si se trabaja específicamente el maquetado de Matemáticas:**
7. `REFERENCIA_CLASES_HTML_FICHAS.md`

**Si hay un bug visual en una ficha ya generada:**
8. El PDF o captura de la ficha con el problema — así se puede diagnosticar
   directamente en vez de suponer qué pasó.

El código real manda sobre este resumen. Si hay discrepancia, el código tiene razón.

⚠️ **Nota**: `CONTEXTO_FICHAS_ESCOLARES.md` tiene partes desactualizadas
desde la sesión de arquitectura JSON+renderizador (ver aviso al principio
de `ROADMAP_FICHAS_ESCOLARES.md`). Pendiente de revisión completa — no dar
por buena a ciegas la sección 4 (las "15 reglas") ni la sección 10
(decisiones descartadas).
