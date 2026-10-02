import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// ─────────────────────────────────────────────────────────────────
// RENDERIZADOR DE MATEMÁTICAS
// Convierte el JSON pedagógico que devuelve Claude en el HTML/CSS
// exacto de la ficha. Esto es código determinista: el mismo JSON
// produce SIEMPRE el mismo HTML, sin depender de que el modelo
// "recuerde bien" las clases o la estructura.
// ─────────────────────────────────────────────────────────────────

// Catálogo de iconos SVG para 1º y 2º (conteo / sumas y restas ilustradas).
// SILUETEADOS a propósito: solo trazo negro, sin relleno de color. La ficha
// se imprime en blanco y negro, así que un icono a todo color se convierte
// en una mancha gris ilegible — el trazo negro se ve nítido siempre, y de
// paso el niño puede colorearlo él mismo si quiere.
// Si algún día se añaden iconos nuevos, es el ÚNICO sitio a tocar.
const ICONOS = {
  abeja:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"28\" rx=\"13\" ry=\"16\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M14,20 L38,20 M13,26 L39,26 M14,32 L38,32\" stroke=\"#000\" stroke-width=\"2\" fill=\"none\"/><ellipse cx=\"12\" cy=\"16\" rx=\"8\" ry=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\" transform=\"rotate(-20,12,16)\"/><ellipse cx=\"40\" cy=\"16\" rx=\"8\" ry=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\" transform=\"rotate(20,40,16)\"/><path d=\"M22,10 Q20,4 16,4 M30,10 Q32,4 36,4\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><circle cx=\"21\" cy=\"14\" r=\"1\" fill=\"#000\"/><circle cx=\"31\" cy=\"14\" r=\"1\" fill=\"#000\"/><line x1=\"26\" y1=\"44\" x2=\"26\" y2=\"49\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  arana:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 4v2l5 5\" />\n  <path d=\"M2.5 9.5l1.5 1.5h6\" />\n  <path d=\"M4 19v-2l6 -6\" />\n  <path d=\"M19 4v2l-5 5\" />\n  <path d=\"M21.5 9.5l-1.5 1.5h-6\" />\n  <path d=\"M20 19v-2l-6 -6\" />\n  <path d=\"M8 15a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" />\n  <path d=\"M10 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /></svg>",
  arbol:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 13l-2 -2\" />\n  <path d=\"M12 12l2 -2\" />\n  <path d=\"M12 21v-13\" />\n  <path d=\"M9.824 16a3 3 0 0 1 -2.743 -3.69a3 3 0 0 1 .304 -4.833a3 3 0 0 1 4.615 -3.707a3 3 0 0 1 4.614 3.707a3 3 0 0 1 .305 4.833a3 3 0 0 1 -2.919 3.695h-4l-.176 -.005\" /></svg>",
  arcoiris:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 17c0 -5.523 -4.477 -10 -10 -10c-5.523 0 -10 4.477 -10 10\" />\n  <path d=\"M18 17a6 6 0 1 0 -12 0\" />\n  <path d=\"M14 17a2 2 0 1 0 -4 0\" /></svg>",
  autobus:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M16 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8\" />\n  <path d=\"M16 5l1.5 7l4.5 0\" />\n  <path d=\"M2 10l15 0\" />\n  <path d=\"M7 5l0 5\" />\n  <path d=\"M12 5l0 5\" /></svg>",
  avion:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3l4 7\" /></svg>",
  ballena:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M4,30 C4,18 16,12 28,14 C40,16 46,22 46,26 C46,30 40,32 32,30 C34,34 32,38 28,36 C24,40 14,38 8,32 C6,30 4,30 4,30 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M14,10 L14,4 M17,10 L18,3\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"16\" cy=\"20\" r=\"1.2\" fill=\"#000\"/></svg>",
  barco:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1\" />\n  <path d=\"M4 18l-1 -5h18l-2 4\" />\n  <path d=\"M5 13v-6h8l4 6\" />\n  <path d=\"M7 7v-4h-1\" /></svg>",
  bicicleta:   "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 18a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M16 18a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" />\n  <path d=\"M12 19v-4l-3 -3l5 -4l2 3h3\" />\n  <path d=\"M13.007 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /></svg>",
  buho:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"30\" rx=\"16\" ry=\"15\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"14,12 18,4 22,13\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><polygon points=\"30,13 34,4 38,12\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><circle cx=\"18\" cy=\"26\" r=\"6.5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"34\" cy=\"26\" r=\"6.5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"18\" cy=\"26\" r=\"1.6\" fill=\"#000\"/><circle cx=\"34\" cy=\"26\" r=\"1.6\" fill=\"#000\"/><polygon points=\"24,32 28,32 26,37\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><line x1=\"16\" y1=\"44\" x2=\"14\" y2=\"48\" stroke=\"#000\" stroke-width=\"1.8\"/><line x1=\"36\" y1=\"44\" x2=\"38\" y2=\"48\" stroke=\"#000\" stroke-width=\"1.8\"/></svg>",
  caballo:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"30\" cy=\"30\" rx=\"16\" ry=\"10\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M16,24 Q8,16 10,8\" stroke=\"#000\" stroke-width=\"2\" fill=\"none\"/><circle cx=\"9\" cy=\"10\" r=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"6,5 9,1 11,6\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><circle cx=\"7\" cy=\"9\" r=\"1\" fill=\"#000\"/><path d=\"M14,10 Q18,6 22,10 Q18,13 14,17\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><path d=\"M17,15 L14,18 M20,19 L17,22 M22,23 L19,26\" stroke=\"#000\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"38\" x2=\"18\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"28\" y1=\"40\" x2=\"27\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"38\" y1=\"38\" x2=\"40\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"44\" y1=\"40\" x2=\"46\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M45,22 Q52,26 46,34\" stroke=\"#000\" stroke-width=\"2\" fill=\"none\"/></svg>",
  cactus:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9v1a3 3 0 0 0 3 3h1\" />\n  <path d=\"M18 8v5a3 3 0 0 1 -3 3h-1\" />\n  <path d=\"M10 21v-16a2 2 0 1 1 4 0v16\" />\n  <path d=\"M7 21h10\" /></svg>",
  cama:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M22 17v-3h-20\" />\n  <path d=\"M2 8v9\" />\n  <path d=\"M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5\" /></svg>",
  camion:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5\" /></svg>",
  cangrejo:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"28\" rx=\"15\" ry=\"10\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"18\" cy=\"23\" r=\"1.3\" fill=\"#000\"/><circle cx=\"34\" cy=\"23\" r=\"1.3\" fill=\"#000\"/><path d=\"M9,20 Q2,16 4,8 Q10,10 12,18 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M43,20 Q50,16 48,8 Q42,10 40,18 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M13,36 L6,42 M20,38 L16,46 M32,38 L36,46 M39,36 L46,42\" stroke=\"#000\" stroke-width=\"2\" stroke-linecap=\"round\" fill=\"none\"/></svg>",
  caracol:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M12,40 Q2,40 2,32 Q2,24 12,24 Q22,24 24,32 Q26,40 34,40 Q46,40 46,30\" fill=\"none\" stroke=\"#000\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"18\" r=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"30\" cy=\"18\" r=\"6.5\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><circle cx=\"30\" cy=\"18\" r=\"2\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\"/><path d=\"M8,26 L4,18 M13,25 L12,17\" stroke=\"#000\" stroke-width=\"1.6\" fill=\"none\"/><circle cx=\"4\" cy=\"17\" r=\"1\" fill=\"#000\"/><circle cx=\"12\" cy=\"16\" r=\"1\" fill=\"#000\"/></svg>",
  caramelo:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7.05 11.293l4.243 -4.243a2 2 0 0 1 2.828 0l2.829 2.83a2 2 0 0 1 0 2.828l-4.243 4.243a2 2 0 0 1 -2.828 0l-2.829 -2.831a2 2 0 0 1 0 -2.828\" />\n  <path d=\"M16.243 9.172l3.086 -.772a1.5 1.5 0 0 0 .697 -2.516l-2.216 -2.217a1.5 1.5 0 0 0 -2.44 .47l-1.248 2.913\" />\n  <path d=\"M9.172 16.243l-.772 3.086a1.5 1.5 0 0 1 -2.516 .697l-2.217 -2.216a1.5 1.5 0 0 1 .47 -2.44l2.913 -1.248\" /></svg>",
  casa:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l-2 0l9 -9l9 9l-2 0\" />\n  <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\" />\n  <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\" /></svg>",
  cerdo:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 11v.01\" />\n  <path d=\"M16 3l0 3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342a6.008 6.008 0 0 1 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l4.5 -3\" /></svg>",
  cereza:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0\" />\n  <path d=\"M14 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M9 13c.366 -2 1.866 -3.873 4.5 -5.6\" />\n  <path d=\"M17 15c-1.333 -2.333 -2.333 -5.333 -1 -9\" />\n  <path d=\"M5 6c3.667 -2.667 7.333 -2.667 11 0c-3.667 2.667 -7.333 2.667 -11 0\" /></svg>",
  ciervo:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 3c0 2 1 3 4 3c2 0 3 1 3 3\" />\n  <path d=\"M21 3c0 2 -1 3 -4 3c-2 0 -3 .333 -3 3\" />\n  <path d=\"M12 18c-1 0 -4 -3 -4 -6c0 -2 1.333 -3 4 -3s4 1 4 3c0 3 -3 6 -4 6\" />\n  <path d=\"M15.185 14.889l.095 -.18a4 4 0 1 1 -6.56 0\" />\n  <path d=\"M17 3c0 1.333 -.333 2.333 -1 3\" />\n  <path d=\"M7 3c0 1.333 .333 2.333 1 3\" />\n  <path d=\"M7 6c-2.667 .667 -4.333 1.667 -5 3\" />\n  <path d=\"M17 6c2.667 .667 4.333 1.667 5 3\" />\n  <path d=\"M8.5 10l-1.5 -1\" />\n  <path d=\"M15.5 10l1.5 -1\" />\n  <path d=\"M12 15h.01\" /></svg>",
  circulo:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /></svg>",
  coche:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><rect x=\"4\" y=\"22\" width=\"44\" height=\"18\" rx=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><rect x=\"10\" y=\"14\" width=\"28\" height=\"14\" rx=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"24\" y1=\"14\" x2=\"24\" y2=\"28\" stroke=\"#000\" stroke-width=\"1.5\"/><circle cx=\"13\" cy=\"40\" r=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"39\" cy=\"40\" r=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  cohete:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3\" />\n  <path d=\"M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3\" />\n  <path d=\"M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /></svg>",
  conejo:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"34\" rx=\"14\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"20\" cy=\"20\" r=\"7\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"14\" cy=\"6\" rx=\"3.5\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\" transform=\"rotate(-12,14,6)\"/><ellipse cx=\"24\" cy=\"4\" rx=\"3.5\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\" transform=\"rotate(8,24,4)\"/><circle cx=\"17\" cy=\"19\" r=\"1\" fill=\"#000\"/><circle cx=\"38\" cy=\"34\" r=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/></svg>",
  copo:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 4l2 1l2 -1\" />\n  <path d=\"M12 2v6.5l3 1.72\" />\n  <path d=\"M17.928 6.268l.134 2.232l1.866 1.232\" />\n  <path d=\"M20.66 7l-5.629 3.25l.01 3.458\" />\n  <path d=\"M19.928 14.268l-1.866 1.232l-.134 2.232\" />\n  <path d=\"M20.66 17l-5.629 -3.25l-2.99 1.738\" />\n  <path d=\"M14 20l-2 -1l-2 1\" />\n  <path d=\"M12 22v-6.5l-3 -1.72\" />\n  <path d=\"M6.072 17.732l-.134 -2.232l-1.866 -1.232\" />\n  <path d=\"M3.34 17l5.629 -3.25l-.01 -3.458\" />\n  <path d=\"M4.072 9.732l1.866 -1.232l.134 -2.232\" />\n  <path d=\"M3.34 7l5.629 3.25l2.99 -1.738\" /></svg>",
  corazon:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572\" /></svg>",
  cuadrado:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14\" /></svg>",
  dado:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14\" />\n  <path d=\"M8 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0\" fill=\"currentColor\" />\n  <path d=\"M15 8.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0\" fill=\"currentColor\" />\n  <path d=\"M15 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0\" fill=\"currentColor\" />\n  <path d=\"M8 15.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0\" fill=\"currentColor\" /></svg>",
  diamante:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5\" />\n  <path d=\"M10 12l-2 -2.2l.6 -1\" /></svg>",
  elefante:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"8\" cy=\"24\" rx=\"8\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"44\" cy=\"24\" rx=\"8\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"24\" r=\"14\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"20\" cy=\"21\" r=\"1.3\" fill=\"#000\"/><circle cx=\"32\" cy=\"21\" r=\"1.3\" fill=\"#000\"/><path d=\"M26,34 Q22,42 26,46 Q29,48 27,44\" fill=\"none\" stroke=\"#000\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg>",
  estrella:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><polygon points=\"26,4 31,19 47,19 35,29 39,45 26,35 13,45 17,29 5,19 21,19\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  flor:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"10\" rx=\"6\" ry=\"9\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"26\" cy=\"42\" rx=\"6\" ry=\"9\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"10\" cy=\"26\" rx=\"9\" ry=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"42\" cy=\"26\" rx=\"9\" ry=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"26\" r=\"8\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  gafas:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 4h-2l-3 10\" />\n  <path d=\"M16 4h2l3 10\" />\n  <path d=\"M10 16h4\" />\n  <path d=\"M21 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5\" />\n  <path d=\"M10 16.5a3.5 3.5 0 0 1 -7 0v-2.5h7v2.5\" />\n  <path d=\"M4 14l4.5 4.5\" />\n  <path d=\"M15 14l4.5 4.5\" /></svg>",
  galleta:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 13v.01\" />\n  <path d=\"M12 17v.01\" />\n  <path d=\"M12 12v.01\" />\n  <path d=\"M16 14v.01\" />\n  <path d=\"M11 8v.01\" />\n  <path d=\"M13.148 3.476l2.667 1.104a4 4 0 0 0 4.656 6.14l.053 .132a3 3 0 0 1 0 2.296q -.745 1.18 -1.024 1.852q -.283 .684 -.66 2.216a3 3 0 0 1 -1.624 1.623q -1.572 .394 -2.216 .661q -.712 .295 -1.852 1.024a3 3 0 0 1 -2.296 0q -1.203 -.754 -1.852 -1.024q -.707 -.292 -2.216 -.66a3 3 0 0 1 -1.623 -1.624q -.397 -1.577 -.661 -2.216q -.298 -.718 -1.024 -1.852a3 3 0 0 1 0 -2.296q .719 -1.116 1.024 -1.852q .257 -.62 .66 -2.216a3 3 0 0 1 1.624 -1.623q 1.547 -.384 2.216 -.661q .687 -.285 1.852 -1.024a3 3 0 0 1 2.296 0\" /></svg>",
  gallina:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"24\" cy=\"32\" rx=\"15\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"36\" cy=\"18\" r=\"8\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"24,14 20,10 25,7 22,12\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><polygon points=\"44,17 50,19 44,21\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><circle cx=\"38\" cy=\"15\" r=\"1\" fill=\"#000\"/><path d=\"M8,30 Q0,26 4,20 M8,34 Q-2,32 2,26\" stroke=\"#000\" stroke-width=\"1.6\" fill=\"none\"/><line x1=\"18\" y1=\"44\" x2=\"16\" y2=\"49\" stroke=\"#000\" stroke-width=\"1.8\"/><line x1=\"28\" y1=\"44\" x2=\"30\" y2=\"49\" stroke=\"#000\" stroke-width=\"1.8\"/></svg>",
  gato:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 3v10a8 8 0 1 1 -16 0v-10l3.432 3.432a7.963 7.963 0 0 1 4.568 -1.432c1.769 0 3.403 .574 4.728 1.546l3.272 -3.546\" />\n  <path d=\"M2 16h5l-4 4\" />\n  <path d=\"M22 16h-5l4 4\" />\n  <path d=\"M11 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" />\n  <path d=\"M9 11v.01\" />\n  <path d=\"M15 11v.01\" /></svg>",
  globo:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"21\" rx=\"15\" ry=\"17\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"22,38 26,46 30,38\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"26\" y1=\"46\" x2=\"26\" y2=\"51\" stroke=\"#000\" stroke-width=\"1.5\"/></svg>",
  helicoptero: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10l1 2h6\" />\n  <path d=\"M12 9a2 2 0 0 0 -2 2v3c0 1.1 .9 2 2 2h7a2 2 0 0 0 2 -2c0 -3.31 -3.13 -5 -7 -5h-2\" />\n  <path d=\"M13 9l0 -3\" />\n  <path d=\"M5 6l15 0\" />\n  <path d=\"M15 9.1v3.9h5.5\" />\n  <path d=\"M15 19l0 -3\" />\n  <path d=\"M19 19l-8 0\" /></svg>",
  hexagono:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809 -.443 1.555 -1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1 -2.184 0l-6.75 -4.27a2.225 2.225 0 0 1 -1.158 -1.948v-7.285c0 -.809 .443 -1.554 1.158 -1.947l6.75 -3.98a2.33 2.33 0 0 1 2.25 0l6.75 3.98h-.033\" /></svg>",
  hoja:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 21c.5 -4.5 2.5 -8 7 -10\" />\n  <path d=\"M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3l.014 0\" /></svg>",
  huevo:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14.083c0 4.154 -2.966 6.74 -7 6.917c-4.2 0 -7 -2.763 -7 -6.917c0 -5.538 3.5 -11.09 7 -11.083c3.5 .007 7 5.545 7 11.083\" /></svg>",
  lampara:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 20h6\" />\n  <path d=\"M12 20v-8\" />\n  <path d=\"M5 12h14l-4 -8h-6l-4 8\" /></svg>",
  lapiz:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" />\n  <path d=\"M13.5 6.5l4 4\" /></svg>",
  leon:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><polygon points=\"26,2 30,11 22,11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"38,5 39,15 30,12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"47,15 42,21 39,13\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"49,28 41,28 45,20\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"14,5 13,15 22,12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"5,15 10,21 13,13\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"3,28 11,28 7,20\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"22\" r=\"10\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"20\" cy=\"14\" r=\"3\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><circle cx=\"32\" cy=\"14\" r=\"3\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><ellipse cx=\"29\" cy=\"37\" rx=\"14\" ry=\"8\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"22\" cy=\"20\" r=\"1.1\" fill=\"#000\"/><circle cx=\"30\" cy=\"20\" r=\"1.1\" fill=\"#000\"/><path d=\"M24,25 Q26,27 28,25\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/></svg>",
  libro:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0\" />\n  <path d=\"M3 6l0 13\" />\n  <path d=\"M12 6l0 13\" />\n  <path d=\"M21 6l0 13\" /></svg>",
  limon:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.536 3.393c3.905 3.906 3.905 10.237 0 14.143c-3.906 3.905 -10.237 3.905 -14.143 0l14.143 -14.143\" />\n  <path d=\"M5.868 15.06a6.5 6.5 0 0 0 9.193 -9.192\" />\n  <path d=\"M10.464 10.464l4.597 4.597\" />\n  <path d=\"M10.464 10.464v6.364\" />\n  <path d=\"M10.464 10.464h6.364\" /></svg>",
  llave:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0\" />\n  <path d=\"M15 9h.01\" /></svg>",
  luna:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008\" /></svg>",
  manzana:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><circle cx=\"26\" cy=\"32\" r=\"17\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"18\" cy=\"17\" rx=\"7\" ry=\"9\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\" transform=\"rotate(-15,18,17)\"/><line x1=\"26\" y1=\"8\" x2=\"26\" y2=\"19\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  mariposa:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M26,12 Q20,3 15,5\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><path d=\"M26,12 Q32,3 37,5\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><ellipse cx=\"26\" cy=\"27\" rx=\"2.5\" ry=\"17\" fill=\"#000\" stroke=\"none\"/><path d=\"M24,15 C10,4 2,14 4,22 C6,30 18,28 24,20 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M28,15 C42,4 50,14 48,22 C46,30 34,28 28,20 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M24,24 C14,24 6,30 8,37 C10,43 20,41 24,33 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M28,24 C38,24 46,30 44,37 C42,43 32,41 28,33 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  mariquita:   "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M26,10 a17,19 0 1,1 -0.1,0 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"26\" y1=\"10\" x2=\"26\" y2=\"46\" stroke=\"#000\" stroke-width=\"1.8\"/><circle cx=\"17\" cy=\"22\" r=\"2.3\" fill=\"#000\"/><circle cx=\"35\" cy=\"22\" r=\"2.3\" fill=\"#000\"/><circle cx=\"15\" cy=\"34\" r=\"2.3\" fill=\"#000\"/><circle cx=\"37\" cy=\"34\" r=\"2.3\" fill=\"#000\"/><circle cx=\"26\" cy=\"30\" r=\"2.3\" fill=\"#000\"/><circle cx=\"26\" cy=\"6\" r=\"6\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M22,2 Q19,-2 16,0 M30,2 Q33,-2 36,0\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><circle cx=\"23\" cy=\"5\" r=\"1\" fill=\"#000\"/><circle cx=\"29\" cy=\"5\" r=\"1\" fill=\"#000\"/></svg>",
  montana:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612\" />\n  <path d=\"M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2\" /></svg>",
  murcielago:  "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 16c.74 -2.286 2.778 -3.762 5 -3c-.173 -2.595 .13 -5.314 -2 -7.5c-1.708 2.648 -3.358 2.557 -5 2.5v-4l-3 2l-3 -2v4c-1.642 .057 -3.292 .148 -5 -2.5c-2.13 2.186 -1.827 4.905 -2 7.5c2.222 -.762 4.26 .714 5 3c2.593 0 3.889 .952 5 4c1.111 -3.048 2.407 -4 5 -4\" />\n  <path d=\"M9 8a3 3 0 0 0 6 0\" /></svg>",
  nube:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6.657 18c-2.572 0 -4.657 -2.007 -4.657 -4.483c0 -2.475 2.085 -4.482 4.657 -4.482c.393 -1.762 1.794 -3.2 3.675 -3.773c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 1.927 -1.551 3.487 -3.465 3.487h-11.878\" /></svg>",
  octogono:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0\" /></svg>",
  oso:         "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"32\" rx=\"16\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"16\" r=\"10\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"15\" cy=\"7\" r=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><circle cx=\"37\" cy=\"7\" r=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><ellipse cx=\"26\" cy=\"19\" rx=\"4.5\" ry=\"3.5\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><circle cx=\"26\" cy=\"18\" r=\"1\" fill=\"#000\"/><circle cx=\"20\" cy=\"14\" r=\"1\" fill=\"#000\"/><circle cx=\"32\" cy=\"14\" r=\"1\" fill=\"#000\"/></svg>",
  ovalo:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 12a6 9 0 1 0 12 0a6 9 0 1 0 -12 0\" /></svg>",
  oveja:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M12,28 a6,6 0 1,1 6,-8 a6,6 0 1,1 8,-3 a6,6 0 1,1 8,3 a6,6 0 1,1 6,8 a7,9 0 1,1 -28,0 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"10\" cy=\"30\" r=\"7\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"6\" cy=\"30\" rx=\"2.5\" ry=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><circle cx=\"8\" cy=\"28\" r=\"1\" fill=\"#000\"/><line x1=\"18\" y1=\"44\" x2=\"18\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"34\" y1=\"44\" x2=\"34\" y2=\"48\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  pajaro:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"22\" cy=\"28\" rx=\"16\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"38\" cy=\"18\" r=\"8\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"45,17 51,15 45,20\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><circle cx=\"40\" cy=\"16\" r=\"1.3\" fill=\"#000\"/><path d=\"M10,26 Q20,22 28,27\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><line x1=\"18\" y1=\"39\" x2=\"15\" y2=\"46\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"26\" y1=\"39\" x2=\"29\" y2=\"46\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  pan:         "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 4a3 3 0 0 1 2 5.235v8.765a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-8.764a3 3 0 0 1 1.824 -5.231h12.176v-.005\" /></svg>",
  pato:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"24\" cy=\"32\" rx=\"17\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"34\" cy=\"16\" r=\"9\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M42,16 Q50,15 50,19 Q50,22 42,20 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><circle cx=\"37\" cy=\"13\" r=\"1\" fill=\"#000\"/><path d=\"M10,32 Q18,26 24,32 Q18,36 10,32\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/></svg>",
  pelota:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><circle cx=\"26\" cy=\"26\" r=\"22\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M26,4 C13,15 13,37 26,48\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><path d=\"M26,4 C39,15 39,37 26,48\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><line x1=\"5\" y1=\"26\" x2=\"47\" y2=\"26\" stroke=\"#000\" stroke-width=\"1.5\"/></svg>",
  pentagono:   "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13.163 2.168l8.021 5.828c.694 .504 .984 1.397 .719 2.212l-3.064 9.43a1.978 1.978 0 0 1 -1.881 1.367h-9.916a1.978 1.978 0 0 1 -1.881 -1.367l-3.064 -9.43a1.978 1.978 0 0 1 .719 -2.212l8.021 -5.828a1.978 1.978 0 0 1 2.326 0\" /></svg>",
  perro:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 5h2\" />\n  <path d=\"M19 12c-.667 5.333 -2.333 8 -5 8h-4c-2.667 0 -4.333 -2.667 -5 -8\" />\n  <path d=\"M11 16c0 .667 .333 1 1 1s1 -.333 1 -1h-2\" />\n  <path d=\"M12 18v2\" />\n  <path d=\"M10 11v.01\" />\n  <path d=\"M14 11v.01\" />\n  <path d=\"M5 4l6 .97l-6.238 6.688a1.021 1.021 0 0 1 -1.41 .111a.953 .953 0 0 1 -.327 -.954l1.975 -6.815\" />\n  <path d=\"M19 4l-6 .97l6.238 6.688c.358 .408 .989 .458 1.41 .111a.953 .953 0 0 0 .327 -.954l-1.975 -6.815\" /></svg>",
  pez:         "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"24\" cy=\"26\" rx=\"18\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><polygon points=\"42,26 50,18 50,34\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M22,20 Q28,14 34,20\" stroke=\"#000\" stroke-width=\"1.5\" fill=\"none\"/><circle cx=\"14\" cy=\"23\" r=\"1.3\" fill=\"#000\"/></svg>",
  pinguino:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M26,4 C38,4 42,20 40,32 C38,46 14,46 12,32 C10,20 14,4 26,4 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><ellipse cx=\"26\" cy=\"30\" rx=\"9\" ry=\"15\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><polygon points=\"22,16 30,16 26,22\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\"/><circle cx=\"21\" cy=\"12\" r=\"1\" fill=\"#000\"/><circle cx=\"31\" cy=\"12\" r=\"1\" fill=\"#000\"/><path d=\"M12,26 Q4,30 10,40\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M40,26 Q48,30 42,40\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><polygon points=\"18,46 22,46 20,50\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\"/><polygon points=\"30,46 34,46 32,50\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\"/></svg>",
  piruleta:    "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />\n  <path d=\"M21 10a3.5 3.5 0 0 0 -7 0\" />\n  <path d=\"M14 10a3.5 3.5 0 0 1 -7 0\" />\n  <path d=\"M14 17a3.5 3.5 0 0 0 0 -7\" />\n  <path d=\"M14 3a3.5 3.5 0 0 0 0 7\" />\n  <path d=\"M3 21l6 -6\" /></svg>",
  pizza:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 21.5c-3.04 0 -5.952 -.714 -8.5 -1.983l8.5 -16.517l8.5 16.517a19.09 19.09 0 0 1 -8.5 1.983\" />\n  <path d=\"M5.38 15.866a14.94 14.94 0 0 0 6.815 1.634a14.944 14.944 0 0 0 6.502 -1.479\" />\n  <path d=\"M13 11.01v-.01\" />\n  <path d=\"M11 14v-.01\" /></svg>",
  platano:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v2a9.09 9.09 0 0 1 -4 8.08c-2 1.31 -5 1.57 -7 1.59a2 2 0 0 0 -2 2a2 2 0 0 0 1.16 1.81c2.69 1.2 9.46 3.44 14.35 -1.66c4.49 -4.74 1.49 -11.82 1.49 -11.82\" /></svg>",
  pulpo:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M10,24 a16,16 0 1,1 32,0 v6 h-32 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"19\" cy=\"21\" r=\"1.6\" fill=\"#000\"/><circle cx=\"33\" cy=\"21\" r=\"1.6\" fill=\"#000\"/><path d=\"M12,30 Q10,38 6,42 M18,30 Q17,40 14,46 M24,30 Q24,42 22,48 M30,30 Q30,42 32,48 M36,30 Q37,40 40,46 M42,30 Q44,38 48,42\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/></svg>",
  rana:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"32\" rx=\"17\" ry=\"12\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"15\" cy=\"17\" r=\"7\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"35\" cy=\"17\" r=\"7\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"15\" cy=\"17\" r=\"2.2\" fill=\"#000\"/><circle cx=\"35\" cy=\"17\" r=\"2.2\" fill=\"#000\"/><path d=\"M16,30 Q26,36 36,30\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M10,40 Q4,44 6,50 M14,42 Q10,48 14,50\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M42,40 Q48,44 46,50 M38,42 Q42,48 38,50\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/></svg>",
  raton:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 7a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-4a4 4 0 0 1 -4 -4l0 -10\" />\n  <path d=\"M12 7l0 4\" /></svg>",
  rectangulo:  "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" /></svg>",
  regalo:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2\" />\n  <path d=\"M12 8l0 13\" />\n  <path d=\"M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7\" />\n  <path d=\"M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5\" /></svg>",
  sol:         "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656\" />\n  <path d=\"M6.343 17.657l-1.414 1.414\" />\n  <path d=\"M6.343 6.343l-1.414 -1.414\" />\n  <path d=\"M17.657 6.343l1.414 -1.414\" />\n  <path d=\"M17.657 17.657l1.414 1.414\" />\n  <path d=\"M4 12h-2\" />\n  <path d=\"M12 4v-2\" />\n  <path d=\"M20 12h2\" />\n  <path d=\"M12 20v2\" /></svg>",
  tarta:       "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 20h18v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8\" />\n  <path d=\"M3 14.803c.312 .135 .654 .204 1 .197a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1c.35 .007 .692 -.062 1 -.197\" />\n  <path d=\"M12 4l1.465 1.638a2 2 0 1 1 -3.015 .099l1.55 -1.737\" /></svg>",
  tijeras:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M3 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" />\n  <path d=\"M8.6 8.6l10.4 10.4\" />\n  <path d=\"M8.6 15.4l10.4 -10.4\" /></svg>",
  tortuga:     "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><path d=\"M8,32 a18,14 0 1,1 36,0 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M8,32 Q26,40 44,32\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><path d=\"M20,22 L20,32 M26,19 L26,32 M32,22 L32,32 M14,28 L38,28\" stroke=\"#000\" stroke-width=\"1.2\" fill=\"none\"/><circle cx=\"4\" cy=\"24\" r=\"5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"2\" cy=\"22\" r=\"0.9\" fill=\"#000\"/><line x1=\"12\" y1=\"36\" x2=\"8\" y2=\"42\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"40\" y1=\"36\" x2=\"44\" y2=\"42\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"16\" y1=\"38\" x2=\"13\" y2=\"44\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"36\" y1=\"38\" x2=\"39\" y2=\"44\" stroke=\"#000\" stroke-width=\"2\"/></svg>",
  tren:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><rect x=\"4\" y=\"10\" width=\"18\" height=\"16\" rx=\"3\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><rect x=\"20\" y=\"20\" width=\"26\" height=\"14\" rx=\"3\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><rect x=\"32\" y=\"4\" width=\"6\" height=\"8\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\"/><circle cx=\"12\" cy=\"26\" r=\"1.3\" fill=\"#000\"/><circle cx=\"12\" cy=\"40\" r=\"5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"40\" r=\"5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"40\" cy=\"40\" r=\"5\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><line x1=\"4\" y1=\"34\" x2=\"46\" y2=\"34\" stroke=\"#000\" stroke-width=\"1.5\"/></svg>",
  triangulo:   "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0\" /></svg>",
  trofeo:      "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 21l8 0\" />\n  <path d=\"M12 17l0 4\" />\n  <path d=\"M7 4l10 0\" />\n  <path d=\"M17 4v8a5 5 0 0 1 -10 0v-8\" />\n  <path d=\"M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" />\n  <path d=\"M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0\" /></svg>",
  uva:         "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13 3a14.5 14.5 0 0 0 -1 6\" />\n  <path d=\"M12 8.9s-2.77 .52 -4.1 -.8s-.8 -4 -.8 -4s2.57 -.53 3.88 .8s1.02 4 1.02 4\" />\n  <path d=\"M14 19a2 2 0 1 0 -4 0a2 2 0 0 0 4 0\" />\n  <path d=\"M14 17a2 2 0 1 1 0 -4a2 2 0 0 1 0 4\" />\n  <path d=\"M10 17a2 2 0 1 1 0 -4a2 2 0 0 1 0 4\" />\n  <path d=\"M12 13a2 2 0 1 1 0 -4a2 2 0 0 1 0 4\" />\n  <path d=\"M16 13a2 2 0 1 1 0 -4a2 2 0 0 1 0 4\" />\n  <path d=\"M8 13a2 2 0 1 1 0 -4a2 2 0 0 1 0 4\" /></svg>",
  vaca:        "<svg width=\"60\" height=\"60\" viewBox=\"0 0 52 52\"><ellipse cx=\"26\" cy=\"32\" rx=\"16\" ry=\"11\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><circle cx=\"26\" cy=\"16\" r=\"9\" fill=\"none\" stroke=\"#000\" stroke-width=\"2\"/><path d=\"M19,10 Q17,4 20,3 M33,10 Q35,4 32,3\" stroke=\"#000\" stroke-width=\"1.8\" fill=\"none\"/><ellipse cx=\"17\" cy=\"12\" rx=\"3\" ry=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><ellipse cx=\"35\" cy=\"12\" rx=\"3\" ry=\"4\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><circle cx=\"22\" cy=\"16\" r=\"1\" fill=\"#000\"/><circle cx=\"30\" cy=\"16\" r=\"1\" fill=\"#000\"/><path d=\"M18,34 Q22,30 20,38 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/><path d=\"M34,28 Q39,32 33,36 Z\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.5\"/></svg>"
};

// Figuras planas con los vértices EN PUNTA (02/10/2026, maestra): los iconos
// originales tenían las esquinas redondeadas, y un polígono con las esquinas
// redondas no sirve para contar lados ni vértices.
Object.assign(ICONOS, {
  cuadrado: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M3.5 3.5h17v17h-17z\"/></svg>",
  rectangulo: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M2 6h20v12h-20z\"/></svg>",
  triangulo: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M12 3.5L21.5 20h-19z\"/></svg>",
  pentagono: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M12.00 2.80 L21.32 9.57 L17.76 20.53 L6.24 20.53 L2.68 9.57z\"/></svg>",
  hexagono: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M12.00 2.20 L20.49 7.10 L20.49 16.90 L12.00 21.80 L3.51 16.90 L3.51 7.10z\"/></svg>",
  octogono: "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M15.83 2.76 L21.24 8.17 L21.24 15.83 L15.83 21.24 L8.17 21.24 L2.76 15.83 L2.76 8.17 L8.17 2.76z\"/></svg>"
});

export const ICONOS_DISPONIBLES = Object.keys(ICONOS);

// Export del objeto completo (nombre -> SVG), usado por el nuevo endpoint
// /api/iconos para que el formulario pueda mostrar una vista previa visual
// de cada icono al docente (selector de iconos antes de generar, 11/08/2026).
// Desde el 01/10/2026 cada valor es el HTML del dibujo que saldrá en la
// ficha (imágenes color + B/N, o el SVG si no hay imagen); el nombre del
// export se mantiene para no tocar server.js. Se calcula al pedirlo porque
// htmlIcono() se define más abajo.
export const ICONOS_SVG = new Proxy(ICONOS, { get: (obj, k) => (typeof k === 'string' && k in obj) ? htmlIcono(k) : obj[k] });

// ─────────────────────────────────────────────────────────────────
// FIGURAS GEOMÉTRICAS (13/08/2026) — catálogo separado de ICONOS: aquí no
// son "objetos para contar" sino figuras curriculares con propiedades
// pedagógicas (lados/vértices en 2D, caras/aristas/vértices en 3D), usadas
// por el tipo de ejercicio "figura_geometrica". Reutiliza el SVG de algunas
// figuras que ya existían en ICONOS (mismo trazo, para que el estilo visual
// sea coherente en toda la ficha) y añade las que faltaban.
// ─────────────────────────────────────────────────────────────────
const SVG_TRIANGULO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M12 3l9 17h-18z\"/></svg>";
const SVG_ROMBO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M12 3l9 9l-9 9l-9 -9z\"/></svg>";
const SVG_TRAPECIO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linejoin=\"miter\"><path d=\"M8 6h8l5 12h-18z\"/></svg>";
const SVG_CUBO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v10h10v-10z\"/><path d=\"M4 9l6 -6h10l-6 6z\"/><path d=\"M14 9l6 -6v10l-6 6z\"/></svg>";
const SVG_PRISMA = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6v15h10v-15z\"/><path d=\"M4 6l6 -4h10l-6 4z\"/><path d=\"M14 6l6 -4v15l-6 4z\"/></svg>";
const SVG_PIRAMIDE = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 13l9 5l-9 5l-9 -5z\"/><path d=\"M12 2l-9 16\"/><path d=\"M12 2l9 16\"/><path d=\"M12 2l0 11\"/></svg>";
const SVG_CONO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"12\" cy=\"19\" rx=\"8\" ry=\"3\"/><path d=\"M12 2l-8 17\"/><path d=\"M12 2l8 17\"/></svg>";
const SVG_CILINDRO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"/><path d=\"M4 5v14\"/><path d=\"M20 5v14\"/><path d=\"M4 19a8 3 0 0 0 16 0\"/></svg>";
const SVG_ESFERA = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12a9 4 0 0 0 18 0\"/><path d=\"M3 12a9 4 0 0 1 18 0\"/></svg>";

const DIR_PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
function listarPng(carpeta) {
  try {
    return new Set(fs.readdirSync(path.join(DIR_PUBLIC, carpeta))
      .filter(f => f.toLowerCase().endsWith('.png'))
      .map(f => f.slice(0, -4)));
  } catch {
    return new Set();
  }
}
const IMAGENES_COLOR = listarPng('imagenes-color');
const IMAGENES_BN = listarPng('imagenes-iconos');

// Cuerpos geométricos: si existe public/imagenes-iconos/geo_<nombre>.png se
// usa ese dibujo (aristas ocultas en discontinua, para contar caras, aristas
// y vértices); si no, el SVG de siempre. Un solo dibujo de línea negra sirve
// para color y para B/N.
function dibujoCuerpo(nombre, svg) {
  return IMAGENES_BN.has('geo_' + nombre)
    ? `<img class="figura-img" src="imagenes-iconos/geo_${nombre}.png" width="60" height="60" alt="${nombre}" draggable="false">`
    : svg;
}

// Figuras planas: { nombre visible, lados, vértices, svg }.
const FIGURAS_2D = {
  triangulo:   { nombre: 'triángulo',  lados: 3, vertices: 3, svg: ICONOS.triangulo },
  cuadrado:    { nombre: 'cuadrado',   lados: 4, vertices: 4, svg: ICONOS.cuadrado },
  rectangulo:  { nombre: 'rectángulo', lados: 4, vertices: 4, svg: ICONOS.rectangulo },
  rombo:       { nombre: 'rombo',      lados: 4, vertices: 4, svg: SVG_ROMBO },
  trapecio:    { nombre: 'trapecio',   lados: 4, vertices: 4, svg: SVG_TRAPECIO },
  pentagono:   { nombre: 'pentágono',  lados: 5, vertices: 5, svg: ICONOS.pentagono },
  hexagono:    { nombre: 'hexágono',   lados: 6, vertices: 6, svg: ICONOS.hexagono },
  circulo:     { nombre: 'círculo',    lados: 0, vertices: 0, svg: ICONOS.circulo },
  ovalo:       { nombre: 'óvalo',      lados: 0, vertices: 0, svg: ICONOS.ovalo }
};

// Cuerpos geométricos: { nombre visible, caras, aristas, vértices, svg }.
// Valores simplificados al criterio habitual de Primaria (superficies
// curvas cuentan como una "cara" — ej. la esfera tiene 1 cara, 0 aristas,
// 0 vértices; el cono tiene 2 caras, 1 arista curva, 1 vértice).
const FIGURAS_3D = {
  cubo:     { nombre: 'cubo',              caras: 6, aristas: 12, vertices: 8, svg: dibujoCuerpo('cubo', SVG_CUBO) },
  prisma:   { nombre: 'prisma rectangular', caras: 6, aristas: 12, vertices: 8, svg: dibujoCuerpo('prisma', SVG_PRISMA) },
  piramide: { nombre: 'pirámide',          caras: 5, aristas: 8,  vertices: 5, svg: dibujoCuerpo('piramide', SVG_PIRAMIDE) },
  cono:     { nombre: 'cono',              caras: 2, aristas: 1,  vertices: 1, svg: dibujoCuerpo('cono', SVG_CONO) },
  cilindro: { nombre: 'cilindro',          caras: 3, aristas: 2,  vertices: 0, svg: dibujoCuerpo('cilindro', SVG_CILINDRO) },
  esfera:   { nombre: 'esfera',            caras: 1, aristas: 0,  vertices: 0, svg: dibujoCuerpo('esfera', SVG_ESFERA) }
};

export const FIGURAS_2D_DISPONIBLES = Object.keys(FIGURAS_2D);
export const FIGURAS_3D_DISPONIBLES = Object.keys(FIGURAS_3D);

function buscarFigura(nombre) {
  return FIGURAS_2D[nombre] || FIGURAS_3D[nombre] || null;
}

// ─────────────────────────────────────────────────────────────────
// DESARROLLOS PLANOS (19/09/2026) — catálogo cerrado del desarrollo plano
// "de libro de texto" de cada cuerpo geométrico DESARROLLABLE. La esfera se
// excluye a propósito: no tiene un desarrollo plano real en el sentido en
// que lo trabaja Primaria (no se puede aplanar sin deformarla), así que
// nunca aparece aquí aunque Claude la incluya por error en "cuerpos" — se
// filtra en renderFiguraDesarrollo() igual que cualquier nombre no
// reconocido. Mismo trazo negro sin relleno que el resto de iconos de
// FIGURAS_3D para que el estilo sea coherente en la ficha.
const SVG_DESARROLLO_CUBO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 40 30\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" stroke-linejoin=\"round\"><rect x=\"10\" y=\"0\" width=\"10\" height=\"10\"/><rect x=\"0\" y=\"10\" width=\"10\" height=\"10\"/><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\"/><rect x=\"20\" y=\"10\" width=\"10\" height=\"10\"/><rect x=\"30\" y=\"10\" width=\"10\" height=\"10\"/><rect x=\"10\" y=\"20\" width=\"10\" height=\"10\"/></svg>";
const SVG_DESARROLLO_PRISMA = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 48 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" stroke-linejoin=\"round\"><rect x=\"12\" y=\"0\" width=\"12\" height=\"8\"/><rect x=\"0\" y=\"8\" width=\"12\" height=\"8\"/><rect x=\"12\" y=\"8\" width=\"12\" height=\"8\"/><rect x=\"24\" y=\"8\" width=\"12\" height=\"8\"/><rect x=\"36\" y=\"8\" width=\"12\" height=\"8\"/><rect x=\"12\" y=\"16\" width=\"12\" height=\"8\"/></svg>";
const SVG_DESARROLLO_PIRAMIDE = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 30 30\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" stroke-linejoin=\"round\"><rect x=\"10\" y=\"10\" width=\"10\" height=\"10\"/><path d=\"M10 10 L20 10 L15 0 Z\"/><path d=\"M10 20 L20 20 L15 30 Z\"/><path d=\"M10 10 L10 20 L0 15 Z\"/><path d=\"M20 10 L20 20 L30 15 Z\"/></svg>";
// Sector circular (superficie lateral desenrollada) + círculo pequeño (base):
// apex del sector en (35,21), radio 17, abierto 300° con la "boca" (60°
// restantes) mirando hacia la base, para que se lea como un abanico/porción
// grande y no como una forma deforme. Puntos del arco calculados a 150° y
// -150° desde el apex (ver comentario del mismo cálculo en svgAngulo).
const SVG_DESARROLLO_CONO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 54 42\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"21\" r=\"7\"/><path d=\"M35 21 L20.3 12.5 A17 17 0 1 1 20.3 29.5 Z\"/></svg>";
const SVG_DESARROLLO_CILINDRO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 44 40\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.4\" stroke-linejoin=\"round\"><rect x=\"10\" y=\"8\" width=\"24\" height=\"20\"/><circle cx=\"22\" cy=\"4\" r=\"4\"/><circle cx=\"22\" cy=\"32\" r=\"4\"/></svg>";

const DESARROLLOS_3D = {
  cubo:     SVG_DESARROLLO_CUBO,
  prisma:   SVG_DESARROLLO_PRISMA,
  piramide: SVG_DESARROLLO_PIRAMIDE,
  cono:     SVG_DESARROLLO_CONO,
  cilindro: SVG_DESARROLLO_CILINDRO
};

// Baraja determinista para emparejar cuerpo↔desarrollo (misma idea que
// renderRelacionar en renderer-lengua.js — copiada, no importada: cada
// renderer de asignatura es autocontenido en este proyecto — de forma que
// la ficha no cambia entre una vista previa y la impresión, y la columna de
// desarrollos nunca sale en el mismo orden que la de cuerpos).
function hashTextoFig(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function barajaDeterministaFig(n, semilla) {
  const indices = Array.from({ length: n }, (_, i) => i);
  let s = (semilla % 2147483647) || 1;
  if (s < 0) s += 2147483646;
  const siguiente = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(siguiente() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  for (let i = 0; i < n; i++) {
    if (indices[i] === i && n > 1) {
      const j = (i + 1) % n;
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }
  return indices;
}

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Divide un número en parte entera y decimal para alinear por la coma.
// Acepta tanto "12.5" (JS number) como "12,5" (string ya en formato español).
function splitEnteroDecimal(numero) {
  const texto = String(numero).replace(',', '.');
  const [entero, decimal] = texto.split('.');
  return { entero, decimal: decimal || '' };
}


// ── Relleno gris suave de los iconos (22/09/2026) ────────────────────────
// Petición del usuario, inspirada en una ficha real muy cuidada: los dibujos
// con un relleno gris MUY suave se leen mejor que la línea sola, sin hacer
// manchón al fotocopiar. Medida provisional: los SVG se sustituirán por
// ilustraciones del banco de imágenes (Gemini, Fase 4).
// Cómo se hace sin estropear ningún dibujo:
//  1. Solo se rellenan formas CERRADAS (círculo, elipse, rectángulo, polígono
//     y trazados cuyo final vuelve a su inicio). Una línea abierta rellena
//     crea manchas con forma rara, así que se deja tal cual.
//  2. El relleno va en una capa APARTE, copiada al principio del SVG y sin
//     trazo: el dibujo original queda encima, intacto — un relleno nunca
//     puede tapar una línea negra que estuviera debajo.
//  3. Los elementos con un relleno propio (p. ej. ojos negros) no se tocan.
// Se calcula una sola vez por icono (caché) al primer uso.
const GRIS_RELLENO_ICONO = '#ededed';

function trazadoCerrado(d) {
  const tokens = String(d).match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return false;
  let i = 0, cmd = null, x = 0, y = 0, sx = 0, sy = 0, subtrazos = 0, abiertos = 0, dibujado = false;
  const cerrarSubtrazo = (explicito) => {
    if (!dibujado) return;
    subtrazos++;
    if (!explicito && Math.hypot(x - sx, y - sy) > 0.35) abiertos++;
    dibujado = false;
  };
  const num = () => parseFloat(tokens[i++]);
  const ARGS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) { cmd = tokens[i++]; if (cmd === 'z' || cmd === 'Z') { cerrarSubtrazo(true); x = sx; y = sy; continue; } }
    if (!cmd) return false;
    const rel = cmd === cmd.toLowerCase(), c = cmd.toLowerCase();
    if (!(c in ARGS) || c === 'z') return false;
    const v = []; for (let k = 0; k < ARGS[c]; k++) { if (i >= tokens.length) return false; v.push(num()); }
    if (v.some(Number.isNaN)) return false;
    if (c === 'm') { cerrarSubtrazo(false); x = rel ? x + v[0] : v[0]; y = rel ? y + v[1] : v[1]; sx = x; sy = y; cmd = rel ? 'l' : 'L'; continue; }
    if (c === 'h') x = rel ? x + v[0] : v[0];
    else if (c === 'v') y = rel ? y + v[0] : v[0];
    else { const n = v.length; x = rel ? x + v[n - 2] : v[n - 2]; y = rel ? y + v[n - 1] : v[n - 1]; }
    dibujado = true;
  }
  cerrarSubtrazo(false);
  return subtrazos > 0 && abiertos === 0;
}

const cacheIconosRellenos = new Map();
function iconoConRelleno(svg) {
  if (cacheIconosRellenos.has(svg)) return cacheIconosRellenos.get(svg);
  const copias = [];
  const re = /<(circle|ellipse|rect|polygon|path)\b([^>]*?)\/?>/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    const [, etiqueta, attrs] = m;
    const fill = attrs.match(/\bfill="([^"]*)"/);
    if (fill && fill[1] !== 'none') continue;                  // ya tiene relleno propio
    if (etiqueta === 'path') {
      const d = attrs.match(/\bd="([^"]*)"/);
      if (!d || !trazadoCerrado(d[1])) continue;               // línea abierta: no se rellena
    }
    const limpios = attrs.replace(/\b(fill|stroke|stroke-width|class)="[^"]*"/g, '').trim();
    copias.push(`<${etiqueta} ${limpios} fill="${GRIS_RELLENO_ICONO}" stroke="none"/>`);
  }
  const resultado = copias.length
    ? svg.replace(/(<svg\b[^>]*>)/, `$1<g class="icono-relleno">${copias.join('')}</g>`)
    : svg;
  cacheIconosRellenos.set(svg, resultado);
  return resultado;
}

// ─────────────────────────────────────────────────────────────────
// DIBUJOS DEL BANCO (Colab/Gemini) EN VEZ DE LOS SVG (01/10/2026)
// Cada icono se pinta con DOS imágenes hermanas: la versión en color
// (public/imagenes-color/) y la de línea para colorear
// (public/imagenes-iconos/). El CSS muestra una u otra según la ficha
// tenga o no la clase "modo-blanco-negro", así que el interruptor B/N
// del formulario sigue funcionando sin volver a generar la ficha.
// Las carpetas se leen UNA vez al arrancar el servidor: un PNG nuevo con
// el nombre de un icono se usa solo, tras reiniciar. Si un icono no tiene
// imagen (o es una figura geométrica, que debe ser exacta), se usa el SVG
// de siempre — nunca se queda un hueco.
// ─────────────────────────────────────────────────────────────────
// Nombre del icono -> nombre del archivo, cuando no coinciden (la ñ va como "ny").
const ALIAS_IMAGEN = { arana: 'aranya', montana: 'montanya' };
// Figuras geométricas: se quedan en SVG (un dibujo a mano alzada no sirve
// para contar lados ni comparar formas).
const ICONOS_SOLO_SVG = new Set(['circulo', 'cuadrado', 'hexagono', 'octogono', 'ovalo', 'pentagono', 'rectangulo', 'triangulo']);

// Cualquier dibujo del banco por su nombre de archivo, con las dos versiones
// hermanas (color y línea) igual que los iconos. Devuelve '' si no existe.
function imagenBanco(archivo, alt, claseExtra = '') {
  const hayColor = IMAGENES_COLOR.has(archivo);
  const hayBn = IMAGENES_BN.has(archivo);
  if (!hayColor && !hayBn) return '';
  const img = (carpeta, clase) =>
    `<img class="icono-img ${clase}${claseExtra ? ' ' + claseExtra : ''}" src="${carpeta}/${archivo}.png" width="60" height="60" alt="${escapeHtml(alt)}" draggable="false">`;
  return (hayColor ? img('imagenes-color', 'icono-color') : img('imagenes-iconos', 'icono-color'))
    + (hayBn ? img('imagenes-iconos', 'icono-bn') : img('imagenes-color', 'icono-bn icono-gris'));
}

const cacheIconoHtml = new Map();
function htmlIcono(nombreIcono) {
  const nombre = ICONOS[nombreIcono] ? nombreIcono : 'estrella';
  if (cacheIconoHtml.has(nombre)) return cacheIconoHtml.get(nombre);
  const archivo = ALIAS_IMAGEN[nombre] || nombre;
  const hayColor = IMAGENES_COLOR.has(archivo);
  const hayBn = IMAGENES_BN.has(archivo);
  let html;
  if (ICONOS_SOLO_SVG.has(nombre) || (!hayColor && !hayBn)) {
    html = iconoConRelleno(ICONOS[nombre]);
  } else {
    const img = (carpeta, clase) =>
      `<img class="icono-img ${clase}" src="${carpeta}/${archivo}.png" width="60" height="60" alt="${nombre}" draggable="false">`;
    // Si solo existe una de las dos versiones, esa sirve para los dos modos
    // (la de color se pasa a grises por CSS en B/N).
    const color = hayColor ? img('imagenes-color', 'icono-color') : img('imagenes-iconos', 'icono-color');
    const bn = hayBn ? img('imagenes-iconos', 'icono-bn') : img('imagenes-color', 'icono-bn icono-gris');
    html = color + bn;
  }
  cacheIconoHtml.set(nombre, html);
  return html;
}

function renderIconos(nombreIcono, cantidad) {
  const n = Math.max(1, Math.min(10, parseInt(cantidad, 10) || 1));
  return htmlIcono(nombreIcono).repeat(n);
}

// Una sola operación en columna (N sumandos o 2 términos de resta).
function renderOperacionColumna(operacion) {
  let numeros = Array.isArray(operacion.numeros) ? operacion.numeros : [];
  const esResta = operacion.signo === '-';

  // Blindaje: las restas SIEMPRE son de 2 términos, pase lo que pase en el JSON.
  if (esResta && numeros.length > 2) numeros = numeros.slice(0, 2);
  if (numeros.length < 2) return '';

  const signo = esResta ? '-' : '+';

  // Si algún número tiene decimales, usar el layout de alineación por coma
  // (columnas entero/coma/decimal) en vez del texto plano de siempre — de lo
  // contrario "12.5" y "3.75" se alinean por longitud de texto y no por la
  // coma decimal, que es donde de verdad debe alinear una resta o suma.
  const conDecimales = numeros.some(n => String(n).includes('.') || String(n).includes(','));

  if (conDecimales) {
    const ultimoIndice = numeros.length - 1;
    let filas = numeros.map((n, i) => {
      const { entero, decimal } = splitEnteroDecimal(n);
      // Convención española de columna: el signo va SOLO en el último término,
      // justo encima de la línea — no en cada sumando intermedio.
      const signoFila = i === ultimoIndice ? signo : '';
      const partDecimal = decimal
        ? `<span class="num-coma">,</span><span class="num-decimal">${escapeHtml(decimal)}</span>`
        : `<span class="num-coma"></span><span class="num-decimal"></span>`;
      return `<div class="operacion-fila-decimal"><span class="op-signo">${signoFila}</span><span class="num-entero">${escapeHtml(entero)}</span>${partDecimal}</div>`;
    }).join('');

    filas += `<hr class="linea-op linea-op-decimal">`;
    filas += `<div class="operacion-fila-decimal"><span class="op-signo"></span><span class="resultado-hueco resultado-decimal"></span></div>`;

    return `<div class="operacion-columna-decimal">${filas}</div>`;
  }

  // Igual que arriba: el signo solo va en la última fila (justo antes de la
  // línea), no en cada sumando — así es como se enseña en columna en España.
  let filas = `<div class="operacion-fila"><span class="op-signo"></span><span class="num">${escapeHtml(numeros[0])}</span></div>`;
  for (let i = 1; i < numeros.length; i++) {
    const esUltima = i === numeros.length - 1;
    const signoFila = esUltima ? signo : '';
    filas += `<div class="operacion-fila"><span class="op-signo">${signoFila}</span><span class="num">${escapeHtml(numeros[i])}</span></div>`;
  }
  filas += `<hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;

  return `<div class="operacion-columna">${filas}</div>`;
}

// Convierte a formato decimal español (coma) sin tocar el resto del texto.
function aComaEspanola(valor) {
  return String(valor).replace('.', ',');
}

// Una multiplicación en columna (multiplicando arriba, multiplicador abajo
// con signo ×). Si el multiplicador tiene 2+ cifras, se dibuja una fila en
// blanco por cada producto parcial, desplazada una posición a la izquierda
// por cada cifra (como en el algoritmo clásico), más una fila de suma final.
// Admite decimales en cualquiera de los dos términos (se muestran con coma;
// el conteo de cifras del multiplicador para las filas de producto parcial
// ignora la coma, ya que cada cifra —haya o no punto decimal— genera su
// propia fila). El sistema NUNCA calcula ni imprime el resultado — solo la
// estructura; el alumno rellena cada hueco.
function renderMultiplicacionColumna(op) {
  const numeros = Array.isArray(op.numeros) ? op.numeros : [];
  if (numeros.length < 2) return '';

  const multiplicando = aComaEspanola(numeros[0]);
  const multiplicador = aComaEspanola(numeros[1]);
  const cifrasMultiplicador = multiplicador.replace(/[^0-9]/g, '').length || 1;

  let filas = `<div class="operacion-fila"><span class="op-signo"></span><span class="num">${escapeHtml(multiplicando)}</span></div>`;
  filas += `<div class="operacion-fila"><span class="op-signo">×</span><span class="num">${escapeHtml(multiplicador)}</span></div>`;
  filas += `<hr class="linea-op">`;

  if (cifrasMultiplicador <= 1) {
    filas += `<div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
  } else {
    for (let i = 0; i < cifrasMultiplicador; i++) {
      const desplazamiento = i > 0 ? ` style="margin-right:${i}ch;"` : '';
      filas += `<div class="operacion-fila producto-parcial"${desplazamiento}><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
    }
    filas += `<hr class="linea-op">`;
    filas += `<div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>`;
  }

  return `<div class="operacion-columna operacion-multiplicacion">${filas}</div>`;
}

// Punto de entrada de multiplicación: igual que operacion_vertical, recibe
// un array de "operaciones" y las agrupa en rejilla — así Claude puede meter
// varias multiplicaciones bajo un mismo ejercicio en vez de crear un
// ejercicio nuevo por cada cuenta (eso es lo que dejaba fichas con demasiado
// espacio en blanco).
function renderMultiplicacionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';
  const columnasHtml = operaciones.map(renderMultiplicacionColumna).join('');
  return `<div class="grid-operaciones">${columnasHtml}</div>`;
}

// Una división en columna clásica (caja): dividendo a la izquierda, divisor
// arriba a la derecha y hueco de cociente debajo. El sistema no calcula el
// resultado, solo dibuja la estructura. NO se dibuja ninguna caja para las
// restas parciales (07/08/2026: eliminada por feedback — quedaba "agresiva"
// para el alumno); el niño hace ese trabajo aparte, en su cuaderno o en el
// espacio libre alrededor. Admite decimales en dividendo y/o divisor.
// 07/08/2026 (3): rediseño de la caja — antes el "ángulo recto" se simulaba
// con DOS trazos independientes (border-right del dividendo + <hr> bajo el
// divisor), que nunca encajaban limpiamente en la esquina (quedaba como dos
// segmentos sueltos, no un ángulo continuo — feedback con captura). Ahora
// ".division-angulo" es UN SOLO elemento con border-left + border-bottom:
// el navegador dibuja la esquina como una sola pieza, sin costura visible.
function renderDivisionColumna(op) {
  const numeros = Array.isArray(op.numeros) ? op.numeros : [];
  if (numeros.length < 2) return '';

  const dividendo = aComaEspanola(numeros[0]);
  const divisor = aComaEspanola(numeros[1]);

  return `<div class="operacion-division-bloque">
    <div class="operacion-division">
      <div class="division-dividendo">${escapeHtml(dividendo)}</div>
      <div class="division-columna-derecha">
        <div class="division-angulo">
          <div class="division-divisor">${escapeHtml(divisor)}</div>
        </div>
        <div class="division-cociente"></div>
      </div>
    </div>
  </div>`;
}

// Punto de entrada de división: mismo patrón que multiplicación — array de
// "operaciones" agrupadas en rejilla.
function renderDivisionVertical(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';
  const items = operaciones.map(renderDivisionColumna).join('');
  return `<div class="grid-operaciones">${items}</div>`;
}

// Umbral de objetos dibujables uno a uno en las operaciones ilustradas de
// 1º-2º (operacion_vertical y problema) — por encima de esto los iconos
// sueltos dejan de leerse bien en la ficha, así que se deja de dibujar en
// vez de recortar o inventar una cantidad que no sea la real. Debe coincidir
// con el tope interno de "renderIconos()" (máximo 10 repeticiones): un
// umbral más alto aquí dibujaría silenciosamente menos objetos de los
// reales en vez de no dibujar nada, que es justo el bug que este umbral
// existe para evitar.
const UMBRAL_ICONOS_OPERACION = 10;

function renderOperacionVertical(datos) {
  if (datos.colocar === true || datos.colocar === 'cuadricula' || datos.cuadricula === true) return renderColocarEnColumna(datos);
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';

  // Caso especial: una sola operación acompañada de iconos (solo 1º/2º).
  if (operaciones.length === 1 && datos.svg && datos.svg.icono1) {
    const op = operaciones[0];
    const esResta = op.signo === '-';
    let bloqueIconos = '';

    if (esResta) {
      // Modelo de resta por conteo (aclaración de una maestra real, 30/08/2026):
      // se dibuja SOLO el minuendo, como un único conjunto de objetos — el
      // alumno tacha a mano tantos como el sustraendo y cuenta los que quedan.
      // NUNCA dos grupos separados con un signo "menos" en medio (ese formato,
      // el que se usaba antes, sugiere combinar dos conjuntos — el modelo de
      // LA SUMA, no el de la resta — y confundía a los niños).
      // Blindaje: la cantidad dibujada es SIEMPRE el minuendo real de la propia
      // operación (nunca "datos.svg.cantidad1" — no hace falta confiar en que
      // Claude cuente bien). Por encima del umbral de objetos legibles, no se
      // dibuja nada en vez de una cantidad recortada o inventada que no
      // representaría el número real.
      const numeros = Array.isArray(op.numeros) ? op.numeros : [];
      const minuendo = Math.round(numeroDesdeJSON(numeros[0]));
      if (Number.isInteger(minuendo) && minuendo >= 1 && minuendo <= UMBRAL_ICONOS_OPERACION) {
        bloqueIconos = `<div style="display:flex; flex-wrap:wrap; gap:4px; max-width:260px;">${renderIconos(datos.svg.icono1, minuendo)}</div>`;
      }
    } else {
      // SUMAS (30/08/2026, cierre del bug de cantidad + caso de 3-4 sumandos):
      // un grupo de iconos por cada sumando real de la operación — hasta 4,
      // el mismo tope que "Sumandos por suma" en otro punto del sistema.
      // Blindaje: la cantidad de CADA grupo se deriva SIEMPRE de
      // "op.numeros" (nunca de "datos.svg.cantidadN" — el mismo criterio que
      // ya se aplicaba a la resta, extendido aquí). El icono de cada grupo sí
      // lo elige Claude ("icono1".."icono4"); si falta alguno de los
      // intermedios se reutiliza "icono1" en su lugar, para no dejar un
      // grupo sin dibujar por un despiste del icono sin que falte la
      // cantidad real. Si CUALQUIER sumando supera el umbral de objetos
      // legibles, no se dibuja NINGÚN grupo — mejor nada que un dibujo a
      // medias que no represente bien la suma completa.
      const numerosSuma = Array.isArray(op.numeros) ? op.numeros : [];
      const cantidades = numerosSuma.slice(0, 4).map(n => Math.round(numeroDesdeJSON(n)));
      const todasValidas = cantidades.length >= 2 && cantidades.every(
        c => Number.isInteger(c) && c >= 1 && c <= UMBRAL_ICONOS_OPERACION
      );
      if (todasValidas) {
        const grupos = cantidades.map((cantidad, i) => {
          const iconoGrupo = datos.svg[`icono${i + 1}`] || datos.svg.icono1;
          return `<div style="display:flex; flex-wrap:wrap; gap:4px; max-width:260px;">${renderIconos(iconoGrupo, cantidad)}</div>`;
        });
        const conSignos = grupos
          .map((g, i) => (i === 0 ? g : `<span style="font-size:24px; font-weight:bold; color:#555;">+</span>${g}`))
          .join('');
        bloqueIconos = `<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">${conSignos}</div>`;
      }
    }

    // Sin dibujo posible (resta por encima del umbral, o suma con algún
    // sumando fuera de rango): se muestra solo la operación en columna,
    // igual que en cursos sin dibujos, en vez de forzar un dibujo poco fiable.
    if (!bloqueIconos) return renderOperacionColumna(op);

    return `<div style="display:flex; align-items:flex-start; gap:16px; margin:10px 0; flex-wrap:wrap;">
      ${bloqueIconos}
      ${renderOperacionColumna(op)}
    </div>`;
  }

  const columnasHtml = operaciones.map(renderOperacionColumna).join('');

  // Varias operaciones (24/09/2026, feedback de la maestra en una ficha de 4º):
  // se reparten en FILAS horizontales, nunca en columnas verticales apiladas
  // (quedaban dos columnas estrechas con media hoja vacía al lado). Si hay
  // sumas y restas mezcladas, una fila por signo, en el orden en que aparecen.
  // Si todas son del mismo signo, una sola fila que salta sola cuando no cabe
  // ("columnasParalelas" ya no parte en columnas: se ignora).
  const signos = [...new Set(operaciones.map(op => op.signo || '+'))];
  if (signos.length > 1) {
    const filas = signos.map(sg => operaciones.filter(op => (op.signo || '+') === sg));
    return `<div class="distribucion-filas">${filas
      .map(f => `<div class="grid-operaciones">${f.map(renderOperacionColumna).join('')}</div>`)
      .join('')}</div>`;
  }

  return `<div class="grid-operaciones">${columnasHtml}</div>`;
}

function renderConteoSvg(datos) {
  // 02/10/2026 (maestra): además de los dibujos, una casilla grande donde
  // el niño escribe cuántos ha contado.
  return `<div class="conteo-bloque">
    <div class="conteo-iconos">${renderIconos(datos.icono, datos.cantidad)}</div>
    <div class="conteo-respuesta"><span>Hay</span>${casillaRespuesta('casilla-grande')}</div>
  </div>`;
}

// Tarjetas en rejilla (22/09/2026): cada operación en su tarjeta, con una
// casilla grande en 1º-3º y una raya en 4º-6º (resultados más largos, con
// decimales o porcentajes, que no caben cómodos en una casilla).
function renderCalculoMental(datos, curso) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  if (operaciones.length === 0) return '';
  const conCasilla = ['1º', '2º', '3º'].includes(curso);
  // Enunciados largos ("La tercera parte de 60 =") no caben en la tarjeta estándar
  // (24/09/2026: se solapaban unos con otros en una ficha real de 4º). Según el
  // enunciado más largo, tarjetas más anchas y con salto de línea permitido.
  const largo = Math.max(...operaciones.map(op => String(op.texto || '').length));
  const claseAncho = largo > 18 ? ' tc-muy-largas' : largo > 13 ? ' tc-largas' : '';
  const tarjetas = operaciones
    .map(op => `<div class="tarjeta-calculo"><span class="tc-texto">${escapeHtml(op.texto)}</span>${conCasilla ? casillaRespuesta('casilla-grande') : '<span class="hueco hueco-corto"></span>'}</div>`)
    .join('');
  return `<div class="tarjetas-calculo${claseAncho}">${tarjetas}</div>`;
}

// El formato visual del problema lo decide el CURSO (código), no Claude.
function renderProblema(datos, curso) {
  // Modos de la octava ampliación (22/09/2026), cursos guiados (1º-3º).
  if (datos.modo === 'razonado') return renderProblemaRazonado(datos);
  if (datos.modo === 'inventar') return renderProblemaInventar(datos);
  if (datos.modo === 'barras') return renderProblemaBarras(datos);
  if (datos.modo === 'frase') return renderProblemaFrase(datos);
  const texto = escapeHtml(datos.texto);
  const esGuiado = ['1º', '2º', '3º'].includes(curso);
  const esConDibujos = ['1º', '2º'].includes(curso);

  // Base de dibujos: en 1º/2º el niño cuenta objetos, no lee números abstractos.
  let bloqueSvg = '';
  if (esConDibujos && datos.svg && datos.svg.icono1) {
    if (datos.svg.signo === '-') {
      // Mismo modelo de resta por conteo que "operacion_vertical" (aclaración
      // de una maestra real, 30/08/2026): un único conjunto de objetos —el
      // minuendo— que el alumno tacha a mano; nunca dos grupos separados con
      // un signo "menos" en medio (ese formato sugiere combinar dos
      // conjuntos, el modelo de LA SUMA, no el de la resta). A diferencia de
      // "operacion_vertical", aquí no hay ningún campo numérico aparte de
      // "cantidad1" del que derivar el minuendo real (el problema es texto
      // libre) — el blindaje se limita, pues, al umbral de tamaño: por
      // encima de él, no se dibuja nada en vez de una cantidad recortada.
      const minuendo = Math.round(numeroDesdeJSON(datos.svg.cantidad1));
      if (Number.isInteger(minuendo) && minuendo >= 1 && minuendo <= UMBRAL_ICONOS_OPERACION) {
        bloqueSvg = `<div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:260px; margin:8px auto 0;">${renderIconos(datos.svg.icono1, minuendo)}</div>`;
      }
    } else {
      // SUMAS (30/08/2026, cierre del bug de cantidad + caso de 3-4
      // sumandos): a diferencia de "operacion_vertical", el problema es
      // texto libre — no hay un array de números reales del que derivar las
      // cantidades, así que se mantiene la dependencia de "cantidadN" que dé
      // Claude, pero ahora hasta 4 grupos (icono1..icono4/cantidad1..
      // cantidad4) en vez de 2 fijos, leídos en orden consecutivo desde
      // "icono1". Mismo blindaje de umbral que en el resto: si CUALQUIER
      // grupo sale inválido o por encima de lo legible, no se dibuja NINGUNO
      // — mejor nada que un dibujo a medias o con una cantidad recortada.
      const grupos = [];
      for (let i = 1; i <= 4; i++) {
        const icono = datos.svg[`icono${i}`];
        if (!icono) break;
        grupos.push({ icono, cantidad: Math.round(numeroDesdeJSON(datos.svg[`cantidad${i}`])) });
      }
      const todosValidos = grupos.length >= 2 && grupos.every(
        g => Number.isInteger(g.cantidad) && g.cantidad >= 1 && g.cantidad <= UMBRAL_ICONOS_OPERACION
      );
      if (todosValidos) {
        const bloques = grupos
          .map((g, i) => {
            const div = `<div style="display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-width:260px;">${renderIconos(g.icono, g.cantidad)}</div>`;
            return i === 0 ? div : `<span style="font-size:22px; font-weight:bold; color:#555;">+</span>${div}`;
          })
          .join('');
        bloqueSvg = `<div style="display:flex; gap:8px; align-items:center; justify-content:center; margin-top:8px; flex-wrap:wrap;">${bloques}</div>`;
      }
    }
  }

  if (esGuiado) {
    // "datosClave" NUNCA se imprime como texto — solo dice cuántas líneas en
    // blanco dejar. Si se imprimiera el dato ya resuelto, se le estaría dando
    // al niño el ejercicio hecho (identificar los datos ES el ejercicio).
    const numDatos = Array.isArray(datos.datosClave) ? datos.datosClave.length : 2;
    const lineasDatos = Array.from({ length: Math.max(2, numDatos) })
      .map(() => `<div class="linea-datos"></div>`)
      .join('');

    return `<div class="bloque-problema">
      <div class="bloque-enunciado"><span class="etiqueta-bloque">Enunciado</span>${texto}${bloqueSvg}</div>
      <div class="bloque-datos"><span class="etiqueta-bloque">Datos</span>${lineasDatos}</div>
      <div class="bloque-operacion"><span class="etiqueta-bloque">Operación</span><div class="espacio-respuesta"></div></div>
      <div class="bloque-resultado"><span class="etiqueta-bloque">Resultado</span><div class="espacio-respuesta bajo"></div></div>
    </div>`;
  }

  // 4º-6º: formato libre, sin bloques guiados. Antes se dibujaba un recuadro
  // ".espacio-respuesta" bajo el enunciado — feedback (07/08/2026): resultaba
  // "agresivo"/tipo examen para ese tramo de edad. Ahora es solo espacio en
  // blanco reservado (".espacio-libre", sin borde ni fondo): el enunciado
  // más el hueco ya bastan, y como ".ejercicio" es redimensionable a mano
  // (ver style.css, sección de edición), el propio docente puede agrandar
  // ese hueco si el problema necesita más sitio para resolverse.
  return `<p>${texto}</p><div class="espacio-libre"></div>`;
}

function renderTipoTest(datos) {
  const opciones = Array.isArray(datos.opciones) ? datos.opciones : [];
  const letras = 'abcdefgh';
  const items = opciones
    .map((op, i) => `<div class="opcion-item"><span class="casilla-test"></span> ${letras[i] || ''}) ${escapeHtml(op)}</div>`)
    .join('');
  return `<div class="opciones-test">${items}</div>`;
}

function renderDibujo() {
  return `<div class="caja-espacio-dibujo">[ Dibuja aquí ]</div>`;
}

// Serie numérica: array de números, con "null" en las posiciones que el
// alumno debe rellenar. Se dibuja como una cadena de burbujas conectadas
// (igual que en los libros de texto), con hueco en blanco donde toque.
function renderSerieNumerica(datos) {
  const numeros = Array.isArray(datos.numeros) ? datos.numeros : [];
  if (numeros.length === 0) return '';

  // Modos visuales (22/09/2026): "marco" mete cada número en un dibujo del
  // catálogo MARCOS_TEMATICOS (vagones, casitas, hojas...) y "arcos" dibuja
  // el salto (+2, −1...) sobre cada pareja. La etiqueta del salto la calcula
  // el código a partir de los números visibles (pasoDeSerie) — si no forman
  // una progresión exacta, no se dibuja ningún arco.
  const marco = MARCOS_TEMATICOS[datos.marco] ? datos.marco : null;
  const paso = datos.arcos === true ? pasoDeSerie(numeros) : null;
  if (marco || paso !== null) {
    const etiqueta = paso !== null ? (paso > 0 ? `+${paso}` : `−${Math.abs(paso)}`) : '';
    const piezas = numeros.map((n, i) => {
      const esHueco = n === null || n === undefined || n === '';
      const celda = marco
        ? marcoTematico(marco, esHueco ? '' : `<b>${escapeHtml(n)}</b>`, esHueco)
        : `<span class="serie-celda${esHueco ? ' serie-hueco' : ''}">${esHueco ? '' : escapeHtml(n)}</span>`;
      const union = i < numeros.length - 1 ? (paso !== null ? arcoSalto(etiqueta) : '<span class="serie-flecha">→</span>') : '';
      return celda + union;
    }).join('');
    return `<div class="serie-numerica serie-tematica">${piezas}</div>`;
  }

  const celdas = numeros.map((n, i) => {
    const esHueco = n === null || n === undefined || n === '';
    const contenido = esHueco ? '' : escapeHtml(n);
    const flecha = i < numeros.length - 1 ? `<span class="serie-flecha">→</span>` : '';
    return `<span class="serie-celda${esHueco ? ' serie-hueco' : ''}">${contenido}</span>${flecha}`;
  }).join('');

  return `<div class="serie-numerica">${celdas}</div>`;
}

// Comparar números: pares de números con un hueco en medio para que el
// alumno escriba <, > o =.
function renderCompararNumeros(datos) {
  const pares = Array.isArray(datos.pares) ? datos.pares : [];
  if (pares.length === 0) return '';

  const filas = pares.map(p => `
    <div class="comparar-fila">
      <span class="comparar-num">${escapeHtml(p.a)}</span>
      <span class="comparar-hueco"></span>
      <span class="comparar-num">${escapeHtml(p.b)}</span>
    </div>`).join('');

  return `<div class="comparar-numeros">${filas}</div>`;
}

// Tabla de conteo y frecuencia — dos variantes según el curso:
// 1º-4º: se muestran los objetos de cada categoría (iconos para contar).
// 5º-6º: currículo real, pero sin disfraz infantil — se muestra una lista de
// datos numéricos/texto (ej. una encuesta o los resultados de tirar un
// dado) y el alumno tabula él mismo las categorías, sin ningún dibujo.
function renderTablaFrecuenciaIconos(datos) {
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  // "revuelto" (22/09/2026): todos los objetos mezclados en una escena, como
  // en los cuadernos reales — el niño busca y cuenta cada tipo.
  const iconosHtml = datos.revuelto === true
    ? escenaRevuelta(categorias)
    : categorias
      .map(c => `<span class="tf-grupo-iconos">${renderIconos(c.icono, c.cantidad)}</span>`)
      .join('');

  const filasTabla = categorias.map(c => `
    <tr>
      <td class="tf-celda-icono">${renderIconos(c.icono, 1)}</td>
      <td class="tf-hueco"></td>
      <td class="tf-hueco"></td>
    </tr>`).join('');

  return `<div class="tabla-frecuencia-bloque${datos.revuelto === true ? ' tf-en-paralelo' : ''}">
    <div class="tabla-frecuencia-iconos">${iconosHtml}</div>
    <table class="tabla-frecuencia">
      <thead><tr><th>Figura</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
      <tbody>
        ${filasTabla}
        <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
      </tbody>
    </table>
  </div>`;
}

function renderTablaFrecuenciaNumerica(datos) {
  const registros = Array.isArray(datos.registros) ? datos.registros : [];
  if (registros.length === 0) return '';

  const listaHtml = registros.map(v => escapeHtml(v)).join(', ');

  // Categorías = valores distintos que aparecen en los datos, ordenadas —
  // el sistema las deduce de los propios datos, nunca inventa ninguna.
  const categorias = [...new Set(registros.map(v => String(v)))].sort((a, b) => {
    const na = Number(a), nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b, 'es');
  });

  const filasTabla = categorias.map(c => `
    <tr>
      <td class="tf-celda-valor">${escapeHtml(c)}</td>
      <td class="tf-hueco"></td>
      <td class="tf-hueco"></td>
    </tr>`).join('');

  return `<div class="tabla-frecuencia-bloque">
    <p class="tf-datos-lista">${listaHtml}</p>
    <table class="tabla-frecuencia">
      <thead><tr><th>Valor</th><th>Conteo</th><th>Frecuencia</th></tr></thead>
      <tbody>
        ${filasTabla}
        <tr class="tf-total"><td colspan="2">Total</td><td class="tf-hueco"></td></tr>
      </tbody>
    </table>
  </div>`;
}

function renderTablaFrecuencia(datos, curso) {
  const esNumerica = ['5º', '6º'].includes(curso);
  return esNumerica ? renderTablaFrecuenciaNumerica(datos) : renderTablaFrecuenciaIconos(datos);
}

// Reloj analógico: dibuja una esfera con los 12 números. En modo "leer" las
// agujas ya están puestas a la hora indicada y hay un hueco debajo para que
// el alumno escriba la hora. En modo "dibujar" la esfera está vacía (sin
// agujas) para que el propio alumno las dibuje a la hora que se le pida en
// el enunciado — el sistema nunca revela el resultado en ese modo.
function renderRelojAnalogico(datos) {
  const hora = (parseInt(datos.hora, 10) || 0) % 12;
  const minuto = parseInt(datos.minuto, 10) || 0;
  const modo = datos.modo === 'dibujar' ? 'dibujar' : 'leer';

  const numeros = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const ang = (n / 12) * 2 * Math.PI - Math.PI / 2;
    const x = (55 + 42 * Math.cos(ang)).toFixed(1);
    const y = (55 + 42 * Math.sin(ang) + 3).toFixed(1);
    return `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" font-family="Arial">${n}</text>`;
  }).join('');

  let agujas = '';
  if (modo === 'leer') {
    const angMin = (minuto / 60) * 360;
    const angHora = ((hora + minuto / 60) / 12) * 360;
    const xHora = (55 + 22 * Math.sin(angHora * Math.PI / 180)).toFixed(1);
    const yHora = (55 - 22 * Math.cos(angHora * Math.PI / 180)).toFixed(1);
    const xMin = (55 + 34 * Math.sin(angMin * Math.PI / 180)).toFixed(1);
    const yMin = (55 - 34 * Math.cos(angMin * Math.PI / 180)).toFixed(1);
    agujas = `
      <line x1="55" y1="55" x2="${xHora}" y2="${yHora}" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <line x1="55" y1="55" x2="${xMin}" y2="${yMin}" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
  }

  const svg = `<svg width="110" height="110" viewBox="0 0 110 110">
    <circle cx="55" cy="55" r="48" fill="none" stroke="#000" stroke-width="2"/>
    ${numeros}
    ${agujas}
    <circle cx="55" cy="55" r="2.5" fill="#000"/>
  </svg>`;

  // Modos 22/09/2026: la respuesta puede pedirse en reloj digital o en
  // palabras ("las tres y media"); en modo "dibujar" el sistema puede mostrar
  // la hora objetivo en digital o en palabras — calculada SIEMPRE por código
  // a partir de hora/minuto (horaEnPalabras, relojDigital), nunca por Claude.
  let respuesta = '';
  if (modo === 'leer') {
    if (datos.respuesta === 'digital') respuesta = relojDigital(hora, minuto, true);
    else if (datos.respuesta === 'palabras') respuesta = `<span class="reloj-palabras">${lineaPauta()}</span>`;
    else respuesta = `<span class="reloj-respuesta">___ : ___</span>`;
  } else if (datos.mostrar === 'digital') {
    respuesta = relojDigital(hora, minuto, false);
  } else if (datos.mostrar === 'palabras') {
    respuesta = `<span class="reloj-objetivo">${horaEnPalabras(hora, minuto)}</span>`;
  }

  return `<div class="reloj-bloque">${svg}${respuesta}</div>`;
}

// ── Gráfico de barras ────────────────────────────────────────────────────
// Dos modos, igual de espíritu que tabla_frecuencia (icónico vs numérico):
// "leer": las barras ya están dibujadas a su altura real (proporcional al
//   valor) — el ejercicio consiste en LEER el gráfico, no en construirlo.
// "rellenar": las columnas se dejan en blanco (solo el contorno punteado) y
//   se imprime la lista de datos aparte, para que el alumno dibuje él mismo
//   cada barra a la altura correspondiente.
// La escala (eje Y) se calcula sola si no se indica "escalaMax": se redondea
// el valor máximo hacia arriba al múltiplo de 5 más cercano, con un mínimo
// de 5, para que las líneas de cuadrícula caigan en números "redondos".
// Parseo numérico defensivo: Claude en teoría siempre debe entregar "valor"
// como número JSON puro, pero si alguna vez devuelve texto con símbolo "%",
// espacios o coma decimal (ej. "35%", "12,5"), esto evita que se lea como
// NaN → 0 silenciosamente (bug real detectado 07/08/2026: un gráfico de
// quesitos con "valor": "0%" en todas las categorías se quedó sin dibujar
// ninguna porción, porque Number("0%") es NaN y el fallback era 0 para
// todas). Nunca sustituye a un prompt claro, pero es la última línea de
// defensa antes de que el gráfico simplemente desaparezca sin explicación.
function numeroDesdeJSON(valor) {
  if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
  if (typeof valor === 'string') {
    const limpio = valor.replace(',', '.').replace(/[^0-9.\-]/g, '');
    const n = parseFloat(limpio);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function renderGraficoBarras(datos) {
  if (datos.modo === 'pictograma') return renderPictograma(datos);
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  const modoRellenar = datos.modo === 'rellenar';
  const valores = categorias.map(c => numeroDesdeJSON(c.valor));
  const valorMaximo = Math.max(...valores, 1);

  let escalaMax = numeroDesdeJSON(datos.escalaMax);
  if (escalaMax < valorMaximo) escalaMax = Math.max(5, Math.ceil(valorMaximo / 5) * 5);

  const numLineas = 5;
  const pasoValor = escalaMax / numLineas;

  const anchoBarra = 58;
  const espacioBarra = 32;
  const altoGrafico = 210;
  const margenIzq = 44;
  const margenSup = 18;
  const margenInfEtiquetas = 28;

  const anchoTotal = margenIzq + espacioBarra + categorias.length * (anchoBarra + espacioBarra);
  const altoTotal = margenSup + altoGrafico + margenInfEtiquetas;
  const yEjeX = margenSup + altoGrafico;

  let lineasGrid = '';
  let etiquetasEje = '';
  for (let i = 0; i <= numLineas; i++) {
    const y = margenSup + altoGrafico - (i / numLineas) * altoGrafico;
    const valorEtiqueta = Math.round(pasoValor * i);
    if (i > 0) {
      lineasGrid += `<line x1="${margenIzq}" y1="${y.toFixed(1)}" x2="${anchoTotal - 8}" y2="${y.toFixed(1)}" class="grafico-linea-guia"/>`;
    }
    etiquetasEje += `<text x="${margenIzq - 8}" y="${(y + 3.5).toFixed(1)}" font-size="12" text-anchor="end" font-family="Arial" fill="#64748b">${valorEtiqueta}</text>`;
  }

  let barras = '';
  let etiquetasX = '';
  let listaDatos = '';
  categorias.forEach((c, i) => {
    const x = margenIzq + espacioBarra + i * (anchoBarra + espacioBarra);
    const valor = numeroDesdeJSON(c.valor);

    if (modoRellenar) {
      barras += `<rect x="${x}" y="${margenSup}" width="${anchoBarra}" height="${altoGrafico}" class="grafico-barra-hueco" rx="3"/>`;
    } else {
      const alturaBarra = escalaMax > 0 ? (valor / escalaMax) * altoGrafico : 0;
      const yBarra = yEjeX - alturaBarra;
      barras += `<rect x="${x}" y="${yBarra.toFixed(1)}" width="${anchoBarra}" height="${alturaBarra.toFixed(1)}" class="grafico-barra" rx="3"/>`;
    }

    etiquetasX += `<text x="${x + anchoBarra / 2}" y="${yEjeX + 18}" font-size="13" text-anchor="middle" font-family="Arial" class="grafico-etiqueta-x">${escapeHtml(c.etiqueta)}</text>`;
  });

  if (modoRellenar) {
    listaDatos = `<p class="grafico-datos-lista">${categorias.map(c => `${escapeHtml(c.etiqueta)}: ${escapeHtml(c.valor)}`).join(' · ')}</p>`;
  }

  const ejeX = `<line x1="${margenIzq}" y1="${yEjeX}" x2="${anchoTotal - 8}" y2="${yEjeX}" class="grafico-eje"/>`;
  const ejeY = `<line x1="${margenIzq}" y1="${margenSup}" x2="${margenIzq}" y2="${yEjeX}" class="grafico-eje"/>`;

  const svg = `<svg width="${anchoTotal}" height="${altoTotal}" viewBox="0 0 ${anchoTotal} ${altoTotal}">
    ${lineasGrid}${ejeY}${ejeX}${etiquetasEje}${barras}${etiquetasX}
  </svg>`;

  return `<div class="grafico-barras-bloque">${listaDatos}${svg}${listaPreguntas(datos.preguntas)}</div>`;
}

// ── Gráfico de quesitos (circular) ──────────────────────────────────────
// Currículo real de 5º-6º, ligado a fracciones/porcentajes — Claude entrega
// valores brutos (no hace falta que sumen 100 ni que ya sean porcentajes) y
// el sistema calcula el ángulo y el porcentaje exacto de cada porción. El
// porcentaje se imprime dentro de cada porción y en la leyenda porque leer
// un ángulo a ojo no es fiable — el ejercicio pedagógico es interpretar el
// gráfico, no adivinar proporciones.
function polarACartesiano(cx, cy, r, anguloGrados) {
  const anguloRad = (anguloGrados - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(anguloRad), y: cy + r * Math.sin(anguloRad) };
}

function trazarPorcionArco(cx, cy, r, anguloInicio, anguloFin) {
  const inicio = polarACartesiano(cx, cy, r, anguloFin);
  const fin = polarACartesiano(cx, cy, r, anguloInicio);
  const arcoLargo = anguloFin - anguloInicio <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${inicio.x.toFixed(2)} ${inicio.y.toFixed(2)} A ${r} ${r} 0 ${arcoLargo} 0 ${fin.x.toFixed(2)} ${fin.y.toFixed(2)} Z`;
}

function renderGraficoQuesitos(datos) {
  const categorias = Array.isArray(datos.categorias) ? datos.categorias : [];
  if (categorias.length === 0) return '';

  const total = categorias.reduce((suma, c) => suma + numeroDesdeJSON(c.valor), 0) || 1;
  const cx = 120, cy = 120, r = 105;

  let anguloActual = 0;
  let porciones = '';
  let leyenda = '';

  categorias.forEach((c, i) => {
    const valor = numeroDesdeJSON(c.valor);
    const angulo = (valor / total) * 360;
    const porcentaje = Math.round((valor / total) * 100);
    const claseColor = `quesito-color-${(i % 6) + 1}`;

    if (angulo > 0) {
      const path = trazarPorcionArco(cx, cy, r, anguloActual, anguloActual + angulo);
      porciones += `<path d="${path}" class="quesito-porcion ${claseColor}"/>`;

      // Etiqueta de % dentro de la porción, solo si es lo bastante grande
      // para que quepa legible (evita texto amontonado en porciones diminutas).
      if (angulo > 18) {
        const medio = polarACartesiano(cx, cy, r * 0.62, anguloActual + angulo / 2);
        porciones += `<text x="${medio.x.toFixed(1)}" y="${medio.y.toFixed(1)}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle" class="quesito-texto-porcentaje">${porcentaje}%</text>`;
      }
    }
    anguloActual += angulo;

    leyenda += `<div class="quesito-leyenda-item"><span class="quesito-leyenda-color ${claseColor}"></span>${escapeHtml(c.etiqueta)} — ${porcentaje}%</div>`;
  });

  const svg = `<svg width="240" height="240" viewBox="0 0 240 240">${porciones}</svg>`;

  return `<div class="grafico-quesitos-bloque">${svg}<div class="quesito-leyenda">${leyenda}</div></div>`;
}

// ── Restas con barritas (modelo de comparación de conjuntos) ────────────
// Dos grupos de palotes, uno por término de la resta. El alumno tacha a
// mano la misma cantidad de palotes en los dos grupos; lo que sobra sin
// tachar en el grupo mayor es el resultado. El sistema NUNCA marca ningún
// palote como tachado (eso sería resolver el ejercicio): en modo "tachar"
// dibuja los palotes ya puestos, listos para tachar a mano; en modo
// "dibujar" deja las dos cajas vacías (solo el número como referencia)
// para que el alumno dibuje él mismo los palotes antes de tachar.
function renderBarritas(cantidad) {
  // Blindaje: más de 30 palotes deja de leerse bien en una caja de ficha.
  const n = Math.max(0, Math.min(30, parseInt(cantidad, 10) || 0));
  return '<span class="barrita"></span>'.repeat(n);
}

// Suma con barritas (02/10/2026, maestra): dos montones de palotes, uno por
// sumando, que el niño cuenta juntos. "dibujar" deja las dos cajas vacías.
function renderSumaBarritas(datos) {
  const limpio = (v) => Math.max(0, Math.min(20, parseInt(v, 10) || 0));
  const a = limpio(datos.a), b = limpio(datos.b);
  if (a + b === 0) return '';
  const modoDibujar = datos.modo === 'dibujar';
  const grupo = (n) => `<div class="resta-barritas-grupo">
        <span class="resta-barritas-numero">${n}</span>
        ${modoDibujar
          ? '<div class="resta-barritas-caja resta-barritas-caja-vacia"></div>'
          : `<div class="resta-barritas-caja">${renderBarritas(n)}</div>`}
      </div>`;
  return `<div class="resta-barritas-bloque suma-barritas-bloque">
    <p class="resta-barritas-operacion">${a} + ${b} = ${casillaRespuesta()}</p>
    <div class="resta-barritas-grupos">
      ${grupo(a)}<span class="barritas-signo">+</span>${grupo(b)}
    </div>
  </div>`;
}

function renderRestaBarritas(datos) {
  let minuendo = parseInt(datos.minuendo, 10);
  let sustraendo = parseInt(datos.sustraendo, 10);
  if (!Number.isInteger(minuendo)) minuendo = 0;
  if (!Number.isInteger(sustraendo)) sustraendo = 0;
  // Blindaje: el minuendo nunca puede ser menor que el sustraendo — si el
  // JSON llega mal, se corrige aquí en vez de dibujar una resta imposible.
  if (sustraendo > minuendo) { const tmp = minuendo; minuendo = sustraendo; sustraendo = tmp; }

  const modoDibujar = datos.modo === 'dibujar';

  // 02/10/2026 (maestra): solo se dibujan las barritas del MINUENDO. Las del
  // sustraendo no se pintan aparte: el niño las tacha dentro de ese montón y
  // cuenta las que quedan.
  const caja = modoDibujar
    ? '<div class="resta-barritas-caja resta-barritas-caja-vacia"></div>'
    : `<div class="resta-barritas-caja">${renderBarritas(minuendo)}</div>`;
  const orden = modoDibujar
    ? `Dibuja <b>${minuendo}</b> y tacha <b>${sustraendo}</b>`
    : `Tacha <b>${sustraendo}</b>`;

  return `<div class="resta-barritas-bloque">
    <p class="resta-barritas-operacion">${minuendo} − ${sustraendo} = ${casillaRespuesta()}</p>
    <div class="resta-barritas-grupos">
      <div class="resta-barritas-grupo">
        <span class="resta-barritas-numero">${minuendo}</span>
        ${caja}
      </div>
      <p class="barritas-orden">${orden}</p>
    </div>
  </div>`;
}

// ── Recta numérica ───────────────────────────────────────────────────────
// Recta horizontal de 0 a un máximo, con el número de partida ("a")
// resaltado con una caja y los saltos de la operación marcados con arcos
// discontinuos (hacia atrás en restas, hacia delante en sumas) — el mismo
// recurso visual "saltamos hacia atrás/delante" de los libros de texto. El
// sistema NUNCA marca ni escribe el resultado, solo deja un hueco.
function svgRectaNumerica(op, rangoMaxPedido, conSaltos) {
  const a = Math.max(0, Math.round(numeroDesdeJSON(op.a)));
  let b = Math.max(0, Math.round(numeroDesdeJSON(op.b)));
  const esResta = op.signo !== '+';
  if (esResta && b > a) b = a;                 // nunca un resultado negativo
  const destino = esResta ? a - b : a + b;

  let rangoMax = parseInt(rangoMaxPedido, 10);
  if (!Number.isInteger(rangoMax) || rangoMax < 1) {
    rangoMax = Math.max(a, destino) + 3;
  }
  // Blindaje: una recta con demasiadas marcas deja de leerse bien impresa.
  rangoMax = Math.max(Math.max(a, destino), Math.min(rangoMax, 30));

  // La recta ocupa el ancho de la ficha: marcas más separadas cuanto más
  // corto es el rango (los saltos de un niño de 1º necesitan sitio).
  const paso = Math.max(21, Math.min(40, Math.floor(620 / rangoMax)));
  const altoSalto = Math.min(28, Math.round(paso * 0.85));
  const margen = 16;
  const yLinea = 20 + altoSalto;
  const anchoTotal = margen * 2 + rangoMax * paso;
  const altoTotal = yLinea + 30;

  let ticks = '';
  let numeros = '';
  for (let i = 0; i <= rangoMax; i++) {
    const x = margen + i * paso;
    ticks += `<line x1="${x}" y1="${yLinea - 5}" x2="${x}" y2="${yLinea + 5}" stroke="#334155" stroke-width="1.5"/>`;
    numeros += `<text x="${x}" y="${yLinea + 22}" font-size="13" text-anchor="middle" font-family="Arial">${i}</text>`;
  }
  const lineaBase = `<line x1="${margen}" y1="${yLinea}" x2="${anchoTotal - margen}" y2="${yLinea}" stroke="#334155" stroke-width="2"/>`;

  let saltos = '';
  let cajaInicio = '';
  if (conSaltos) {
    const xInicio = margen + a * paso;
    cajaInicio = `<rect x="${xInicio - 11}" y="${yLinea - 11}" width="22" height="22" fill="none" class="recta-numerica-caja-inicio" rx="4"/>`;
    const desde = Math.min(a, destino);
    const hasta = Math.max(a, destino);
    for (let i = desde; i < hasta; i++) {
      const x1 = margen + i * paso;
      const x2 = margen + (i + 1) * paso;
      const xMedio = (x1 + x2) / 2;
      saltos += `<path d="M${x1} ${yLinea} Q${xMedio} ${yLinea - altoSalto} ${x2} ${yLinea}" fill="none" class="recta-numerica-salto"/>`;
    }
    if (hasta > desde) {
      // Punta de flecha en el último salto: indica hacia dónde se avanza.
      const xFin = margen + destino * paso;
      const ux = (esResta ? -1 : 1) * paso / 2, uy = altoSalto;
      const largo = Math.hypot(ux, uy);
      const [dx, dy] = [ux / largo, uy / largo];
      const bx = xFin - dx * 10, by = yLinea - dy * 10;
      saltos += `<path d="M${xFin} ${yLinea} L${(bx - dy * 4.5).toFixed(1)} ${(by + dx * 4.5).toFixed(1)} L${(bx + dy * 4.5).toFixed(1)} ${(by - dx * 4.5).toFixed(1)} Z" class="recta-numerica-punta"/>`;
    }
  }

  const svg = `<svg width="${anchoTotal}" height="${altoTotal}" viewBox="0 0 ${anchoTotal} ${altoTotal}">
    ${lineaBase}${ticks}${numeros}${saltos}${cajaInicio}
  </svg>`;
  return `<div class="recta-numerica-item">
    <p class="recta-numerica-operacion">${a} ${esResta ? '−' : '+'} ${b} = ${casillaRespuesta()}</p>
    <div class="recta-numerica-svg">${svg}</div>
  </div>`;
}

function renderRectaNumerica(datos) {
  // "saltos": false (02/10/2026, maestra) → la recta sale limpia, sin el
  // número de partida marcado ni los saltos: los dibuja el niño.
  // "operaciones": varias sumas/restas en el mismo ejercicio (hasta 4).
  const conSaltos = datos.saltos !== false;
  const ops = (Array.isArray(datos.operaciones) ? datos.operaciones : [datos.operacion])
    .filter(o => o && typeof o === 'object').slice(0, 4);
  if (ops.length === 0) return '';
  return `<div class="recta-numerica-bloque">${ops.map(o => svgRectaNumerica(o, datos.rangoMax, conSaltos)).join('')}</div>`;
}

// ── Rejilla numérica ─────────────────────────────────────────────────────
// Cuadrícula de números en fila×columna (versión en rejilla de
// "serie_numerica"): practica el conteo (de 1 en 1, de 2 en 2, de 10 en
// 10...) o el reconocimiento de decenas. Mismo convenio que serie_numerica:
// "numeros" es la lista completa, con "null" en las posiciones a rellenar
// — el sistema solo la reparte en filas de "columnas" celdas, nunca decide
// el patrón ni el contenido.
function renderRejillaNumerica(datos) {
  let columnas = parseInt(datos.columnas, 10);
  if (!Number.isInteger(columnas) || columnas < 2) columnas = 10;
  columnas = Math.min(columnas, 10);

  const numeros = Array.isArray(datos.numeros) ? datos.numeros.slice(0, 120) : [];
  if (numeros.length === 0) return '';

  const celdas = numeros.map(n => {
    const esHueco = n === null || n === undefined || n === '';
    return `<span class="rn-celda${esHueco ? ' rn-hueco' : ''}">${esHueco ? '' : escapeHtml(n)}</span>`;
  }).join('');

  return `<div class="rejilla-numerica" style="grid-template-columns: repeat(${columnas}, 1fr);">${celdas}</div>`;
}

// ── Cuadro numérico ──────────────────────────────────────────────────────
// Tabla de doble entrada para practicar sumas o restas: cabecera de filas y
// columnas con números, celdas en blanco para que el alumno escriba el
// resultado. En "resta" la operación de cada celda es SIEMPRE
// columna − fila (nunca al revés) — las celdas donde eso daría negativo
// (columna < fila) se bloquean visualmente en vez de dejarse como si
// hubiera que rellenarlas. "ejemplo" (opcional) marca una celda concreta
// que el sistema rellena ya resuelta, como modelo — el propio código
// calcula ese resultado, nunca Claude.
function renderCuadroNumerico(datos) {
  const operacion = datos.operacion === 'suma' ? 'suma' : 'resta';
  let filas = Array.isArray(datos.filas) ? datos.filas.map(n => parseInt(n, 10)).filter(Number.isInteger) : [];
  let columnas = Array.isArray(datos.columnas) ? datos.columnas.map(n => parseInt(n, 10)).filter(Number.isInteger) : [];
  // Blindaje de tamaño: una tabla demasiado grande no cabe bien en la ficha.
  filas = filas.slice(0, 6);
  columnas = columnas.slice(0, 8);
  if (filas.length === 0 || columnas.length === 0) return '';

  const simbolo = operacion === 'suma' ? '+' : '−';

  const ejemploFila = datos.ejemplo ? parseInt(datos.ejemplo.fila, 10) : NaN;
  const ejemploColumna = datos.ejemplo ? parseInt(datos.ejemplo.columna, 10) : NaN;
  const hayEjemplo = Number.isInteger(ejemploFila) && Number.isInteger(ejemploColumna);

  const cabeceraColumnas = columnas.map(c => `<th>${escapeHtml(c)}</th>`).join('');

  const filasHtml = filas.map(f => {
    const celdas = columnas.map(c => {
      const esInvalida = operacion === 'resta' && c < f;
      if (esInvalida) return `<td class="cn-celda cn-bloqueada"></td>`;

      if (hayEjemplo && ejemploFila === f && ejemploColumna === c) {
        const resultado = operacion === 'suma' ? f + c : c - f;
        return `<td class="cn-celda cn-ejemplo">${resultado}</td>`;
      }
      return `<td class="cn-celda"></td>`;
    }).join('');
    return `<tr><th>${escapeHtml(f)}</th>${celdas}</tr>`;
  }).join('');

  return `<table class="cuadro-numerico">
    <thead><tr><th class="cn-esquina">${simbolo}</th>${cabeceraColumnas}</tr></thead>
    <tbody>${filasHtml}</tbody>
  </table>`;
}

// ── Tabla de multiplicar (30/08/2026) ────────────────────────────────────
// Practicar UNA tabla completa (×1 a ×10). Blindaje total: el ÚNICO dato que
// llega de Claude es "tabla" — las 10 filas y sus resultados los calcula el
// código, nunca se confía en que Claude enumere o multiplique bien. Se
// reparte en dos columnas de 5 filas para que quepa cómodo en la ficha.
function renderTablaMultiplicar(datos) {
  let tabla = parseInt(datos.tabla, 10);
  if (!Number.isInteger(tabla) || tabla < 1 || tabla > 10) tabla = 1;

  // "operacion" (22/09/2026): además de multiplicar, la "tabla del +N" y la
  // "tabla del −N" de 1º (1 + 0 ... 1 + 9 / 2 − 2 ... 11 − 2), como en los
  // cuadernos reales. Las 10 filas las genera siempre el código.
  const operacion = ['suma', 'resta'].includes(datos.operacion) ? datos.operacion : 'multiplicacion';
  const textoFila = (k) => operacion === 'suma' ? `${tabla} + ${k - 1} =`
    : operacion === 'resta' ? `${tabla + k - 1} − ${tabla} =`
    : `${tabla} × ${k} =`;
  const filaHtml = (k) => `<div class="tm-fila">
      <span class="tm-texto">${textoFila(k)}</span>
      <span class="hueco hueco-corto"></span>
    </div>`;

  const columnaIzquierda = [1, 2, 3, 4, 5].map(filaHtml).join('');
  const columnaDerecha = [6, 7, 8, 9, 10].map(filaHtml).join('');
  // 02/10/2026 (maestra): "Tabla del 5" a secas se entiende como de multiplicar.
  const titulo = operacion === 'suma' ? `Tabla de sumar del ${tabla}` : operacion === 'resta' ? `Tabla de restar del ${tabla}` : `Tabla de multiplicar del ${tabla}`;
  const libreta = operacion !== 'multiplicacion' || datos.estilo === 'libreta';

  return `<div class="tabla-multiplicar-bloque${libreta ? ' tm-libreta' : ''}">
    <p class="tabla-multiplicar-titulo">${titulo}</p>
    <div class="tabla-multiplicar-columnas">
      <div class="tm-columna">${columnaIzquierda}</div>
      <div class="tm-columna">${columnaDerecha}</div>
    </div>
  </div>`;
}

// ── Reparto (30/08/2026) ─────────────────────────────────────────────────
// División como reparto manipulativo, sin algoritmo: el sistema dibuja
// "total" objetos y "grupos" cajas vacías, y el alumno reparte a mano
// (dibujando o escribiendo) cuántos tocan en cada caja. Blindaje: "total"
// se ajusta al múltiplo de "grupos" más cercano si Claude manda un reparto
// con resto (en 1º-2º todavía no se trabaja el resto de una división), y el
// número de objetos se limita para que quepan bien dibujados en la ficha.
function renderReparto(datos) {
  let grupos = parseInt(datos.grupos, 10);
  if (!Number.isInteger(grupos) || grupos < 2) grupos = 2;
  grupos = Math.min(grupos, 6);

  let total = parseInt(datos.total, 10);
  if (!Number.isInteger(total) || total < grupos) total = grupos;
  // Blindaje de tamaño: más de 30 objetos deja de leerse bien en el bloque
  // de la ficha — se aplica ANTES de ajustar el múltiplo, para que ese
  // ajuste sea siempre el último paso y nunca lo rompa un recorte posterior
  // (si se recortara después, un total válido como 32/4 podría acabar en
  // 30/4, que ya no es exacto).
  total = Math.min(total, 30);
  // Blindaje: reparto sin resto — si "total" no es múltiplo exacto de
  // "grupos", se redondea al múltiplo más cercano (nunca por debajo de
  // "grupos" ni por encima del límite de 30) en vez de dibujar un reparto
  // que no cuadra.
  const resto = total % grupos;
  if (resto !== 0) {
    const arriba = total + (grupos - resto);
    const abajo = total - resto;
    total = (arriba <= 30 && resto >= grupos / 2) ? arriba : abajo;
  }
  if (total < grupos) total = grupos;

  const nombreIcono = ICONOS[datos.icono] ? datos.icono : 'estrella';
  const objetos = htmlIcono(nombreIcono).repeat(total);

  const cajasGrupos = Array.from({ length: grupos }, () =>
    `<div class="reparto-grupo-caja"></div>`
  ).join('');

  return `<div class="reparto-bloque">
    <p class="reparto-operacion">${total} : ${grupos} = <span class="hueco hueco-corto"></span></p>
    <div class="reparto-objetos">${objetos}</div>
    <div class="reparto-grupos">${cajasGrupos}</div>
  </div>`;
}

// ── Figuras geométricas (2D y 3D) ────────────────────────────────────────
// Cuatro modos, cada uno con su propio "datos.modo":
// "identificar"    → icono + hueco en blanco para que el alumno escriba el nombre.
// "propiedades"    → icono CON su nombre + huecos para lados/vértices (2D) o
//                     caras/aristas/vértices (3D), a contar por el alumno.
// "clasificar"     → todas las figuras sueltas arriba + una caja en blanco
//                     por cada grupo, para que el alumno reparta las figuras.
// "perimetro_area" → una figura (cuadrado/rectángulo/triángulo) dibujada con
//                     sus medidas, y huecos en blanco para perímetro y/o área
//                     — el sistema nunca calcula ni imprime el resultado.
function renderFiguraIdentificar(datos) {
  const figuras = Array.isArray(datos.figuras) ? datos.figuras.slice(0, 8) : [];
  const tarjetas = figuras.map(nombre => {
    const fig = buscarFigura(nombre);
    if (!fig) return '';
    return `<div class="figura-geometrica-tarjeta">
      <div class="figura-geometrica-icono">${fig.svg}</div>
      <span class="hueco hueco-largo"></span>
    </div>`;
  }).join('');
  return `<div class="figura-geometrica-grid">${tarjetas}</div>`;
}

function renderFiguraPropiedades(datos) {
  const figuras = Array.isArray(datos.figuras) ? datos.figuras.slice(0, 6) : [];
  const tarjetas = figuras.map(nombre => {
    const fig = buscarFigura(nombre);
    if (!fig) return '';
    const es3d = !!FIGURAS_3D[nombre];
    const filasProp = es3d
      ? `<div class="fg-propiedad-fila"><span>Caras:</span><span class="hueco hueco-corto"></span></div>
         <div class="fg-propiedad-fila"><span>Aristas:</span><span class="hueco hueco-corto"></span></div>
         <div class="fg-propiedad-fila"><span>Vértices:</span><span class="hueco hueco-corto"></span></div>`
      : `<div class="fg-propiedad-fila"><span>Lados:</span><span class="hueco hueco-corto"></span></div>
         <div class="fg-propiedad-fila"><span>Vértices:</span><span class="hueco hueco-corto"></span></div>`;
    return `<div class="figura-geometrica-tarjeta figura-geometrica-tarjeta-propiedades">
      <div class="figura-geometrica-icono">${fig.svg}</div>
      <p class="fg-nombre-figura">${escapeHtml(fig.nombre)}</p>
      <div class="fg-propiedades">${filasProp}</div>
    </div>`;
  }).join('');
  return `<div class="figura-geometrica-grid">${tarjetas}</div>`;
}

function renderFiguraClasificar(datos) {
  const figuras = Array.isArray(datos.figuras) ? datos.figuras.slice(0, 10) : [];
  const grupos = Array.isArray(datos.grupos) ? datos.grupos.slice(0, 4) : [];
  if (figuras.length === 0 || grupos.length === 0) return '';

  const iconos = figuras.map(nombre => {
    const fig = buscarFigura(nombre);
    return fig ? `<div class="fg-clasificar-icono">${fig.svg}</div>` : '';
  }).join('');

  const cajasGrupos = grupos.map(g => `
    <div class="fg-clasificar-grupo">
      <p class="fg-clasificar-titulo">${escapeHtml(g)}</p>
      <div class="espacio-respuesta"></div>
    </div>`).join('');

  return `<div class="figura-geometrica-clasificar">
    <div class="fg-clasificar-figuras">${iconos}</div>
    <div class="fg-clasificar-grupos">${cajasGrupos}</div>
  </div>`;
}

function formatMedida(valor, unidad) {
  return `${numeroDesdeJSON(valor)} ${escapeHtml(unidad || 'cm')}`;
}

function renderFiguraPerimetroArea(datos) {
  const figura = datos.figura;
  const medidas = datos.medidas || {};
  const unidad = datos.unidad || 'cm';
  const pedir = Array.isArray(datos.pedir) ? datos.pedir : ['area'];

  let svgFigura = '';
  if (figura === 'cuadrado') {
    const etiqueta = formatMedida(medidas.lado, unidad);
    svgFigura = `<svg width="170" height="160" viewBox="0 0 170 160">
      <rect x="25" y="10" width="120" height="120" fill="none" stroke="#000" stroke-width="2"/>
      <text x="85" y="150" text-anchor="middle" font-size="15" font-family="Arial" class="fg-medida-texto">${etiqueta}</text>
    </svg>`;
  } else if (figura === 'rectangulo') {
    const etiquetaBase = formatMedida(medidas.base, unidad);
    const etiquetaAltura = formatMedida(medidas.altura, unidad);
    svgFigura = `<svg width="220" height="160" viewBox="0 0 220 160">
      <rect x="30" y="20" width="160" height="90" fill="none" stroke="#000" stroke-width="2"/>
      <text x="110" y="130" text-anchor="middle" font-size="15" font-family="Arial" class="fg-medida-texto">${etiquetaBase}</text>
      <text x="15" y="65" text-anchor="middle" font-size="15" font-family="Arial" class="fg-medida-texto" transform="rotate(-90 15 65)">${etiquetaAltura}</text>
    </svg>`;
  } else if (figura === 'triangulo') {
    const etiquetaBase = formatMedida(medidas.base ?? medidas.lado, unidad);
    let lineaAltura = '';
    let etiquetaAltura = '';
    if (medidas.altura !== undefined) {
      etiquetaAltura = `<text x="122" y="65" font-size="14" font-family="Arial" class="fg-medida-texto">${formatMedida(medidas.altura, unidad)}</text>`;
      lineaAltura = `<line x1="110" y1="20" x2="110" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    }
    svgFigura = `<svg width="220" height="140" viewBox="0 0 220 140">
      <polygon points="110,20 20,110 200,110" fill="none" stroke="#000" stroke-width="2"/>
      ${lineaAltura}${etiquetaAltura}
      <text x="110" y="130" text-anchor="middle" font-size="15" font-family="Arial" class="fg-medida-texto">${etiquetaBase}</text>
    </svg>`;
  }
  if (!svgFigura) return '';

  const etiquetasRespuesta = { perimetro: 'Perímetro', area: 'Área' };
  const filasRespuesta = pedir
    .filter(p => etiquetasRespuesta[p])
    .map(p => `<div class="fg-respuesta-fila"><span>${etiquetasRespuesta[p]} = </span><span class="hueco hueco-largo"></span></div>`)
    .join('');
  if (!filasRespuesta) return '';

  return `<div class="figura-geometrica-medida">
    <div class="fg-medida-svg">${svgFigura}</div>
    <div class="fg-respuestas">${filasRespuesta}</div>
  </div>`;
}

// "desarrollo" → emparejar cada cuerpo geométrico con su desarrollo plano
// (relacionar dos columnas, como renderRelacionar en Lengua, pero con
// iconos en vez de texto). Blindaje: solo cuerpos con desarrollo plano
// REAL definido en DESARROLLOS_3D — la esfera y cualquier nombre no
// reconocido se descartan en silencio en vez de romper el ejercicio; con
// menos de 2 cuerpos válidos no hay nada que emparejar, así que no se
// imprime nada. El orden de la columna de desarrollos lo decide una baraja
// determinista (nunca coincide fila a fila con la columna de cuerpos), no
// Claude — igual que en Lengua, para que el ejercicio no se resuelva solo
// mirando la fila.
function renderFiguraDesarrollo(datos) {
  let cuerpos = Array.isArray(datos.cuerpos) ? datos.cuerpos : [];
  cuerpos = [...new Set(cuerpos)].filter(nombre => DESARROLLOS_3D[nombre]).slice(0, 4);
  if (cuerpos.length < 2) return '';

  const semilla = hashTextoFig(cuerpos.join('|')) + 1;
  const orden = barajaDeterministaFig(cuerpos.length, semilla);

  const filasCuerpo = cuerpos.map((nombre, i) => `
    <div class="relacionar-fila-a">
      <span class="relacionar-hueco"></span>
      <span class="relacionar-num">${i + 1}.</span>
      <span class="desarrollo-icono">${FIGURAS_3D[nombre].svg}</span>
    </div>`).join('');

  const filasDesarrollo = orden.map((origen, posicion) => `
    <div class="relacionar-fila-b">
      <span class="relacionar-letra">${String.fromCharCode(97 + posicion)})</span>
      <span class="desarrollo-icono">${DESARROLLOS_3D[cuerpos[origen]]}</span>
    </div>`).join('');

  return `<div class="relacionar-bloque desarrollo-plano-bloque">
    <div class="relacionar-columna">${filasCuerpo}</div>
    <div class="relacionar-columna">${filasDesarrollo}</div>
  </div>`;
}

function renderFiguraGeometrica(datos) {
  if (datos.modo === 'identificar') return renderFiguraIdentificar(datos);
  if (datos.modo === 'propiedades') return renderFiguraPropiedades(datos);
  if (datos.modo === 'clasificar') return renderFiguraClasificar(datos);
  if (datos.modo === 'perimetro_area') return renderFiguraPerimetroArea(datos);
  if (datos.modo === 'desarrollo') return renderFiguraDesarrollo(datos);
  return '';
}

// ═══════════════════════════════════════════════════════════════════════
// AMPLIACIÓN CURRICULAR (07/09/2026): 14 tipos nuevos para cubrir los
// sentidos de la medida, espacial, estocástico y algebraico del RD 157/2022
// que todavía no tenían tipo de ejercicio propio (ver auditoría completa en
// el ROADMAP, entrada del 07/09/2026). Mismo criterio de blindaje que el
// resto del fichero: toda cantidad derivable la calcula el código, nunca se
// confía en un dato redundante de Claude; y donde el resultado visual
// depende de que algo "cuadre bien" (una figura reconocible, una paleta de
// colores legible), se usa un catálogo cerrado en vez de coordenadas o
// valores libres.
// ═══════════════════════════════════════════════════════════════════════

// ── Dinero en euros (sentido numérico / educación financiera) ───────────
// Catálogo cerrado de denominaciones reales del sistema monetario europeo.
// Monedas: círculo. Billetes (a partir de 5€): rectángulo. Mismo trazo
// negro que el resto de iconos, para que se lea bien en blanco y negro.
const DENOMINACIONES_EURO = [0.01, 0.02, 0.05, 0.10, 0.20, 0.50, 1, 2, 5, 10, 20, 50];
function formatoEuros(valor) {
  if (valor < 1) return `${Math.round(valor * 100)}c`;
  return `${valor % 1 === 0 ? valor : String(valor.toFixed(2)).replace('.', ',')}€`;
}
function svgMonedaEuro(valor) {
  const texto = formatoEuros(valor);
  return `<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke="#000" stroke-width="2"/><circle cx="28" cy="28" r="19" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="2,2"/><text x="28" y="33" text-anchor="middle" font-size="12" font-family="Arial" font-weight="bold">${texto}</text></svg>`;
}
function svgBilleteEuro(valor) {
  const texto = formatoEuros(valor);
  return `<svg width="90" height="52" viewBox="0 0 90 52"><rect x="2" y="2" width="86" height="48" rx="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="22" cy="26" r="14" fill="none" stroke="#000" stroke-width="1.3"/><text x="60" y="31" text-anchor="middle" font-size="15" font-family="Arial" font-weight="bold">${texto}</text></svg>`;
}
function svgDinero(valor) {
  return valor < 5 ? svgMonedaEuro(valor) : svgBilleteEuro(valor);
}
function renderDineroEuros(datos) {
  const modo = datos.modo === 'cambio' ? 'cambio' : 'contar';
  let monedas = Array.isArray(datos.monedas) ? datos.monedas : [];
  // Blindaje: solo denominaciones reales, cantidad y nº de grupos acotados
  // para que quepan bien dibujadas en la ficha.
  monedas = monedas
    .filter(m => DENOMINACIONES_EURO.includes(numeroDesdeJSON(m.valor)))
    .slice(0, 6)
    .map(m => ({ valor: numeroDesdeJSON(m.valor), cantidad: Math.max(1, Math.min(8, parseInt(m.cantidad, 10) || 1)) }));
  if (monedas.length === 0) return '';

  const grupos = monedas.map(m => `<div class="dinero-grupo">${svgDinero(m.valor).repeat(m.cantidad)}</div>`).join('');

  if (modo === 'cambio') {
    const precio = numeroDesdeJSON(datos.precio);
    return `<div class="dinero-bloque">
      <div class="dinero-pagado"><p class="dinero-etiqueta">Pagas con:</p><div class="dinero-grupos">${grupos}</div></div>
      <p class="dinero-precio">Precio del artículo: <strong>${formatoEuros(precio)}</strong></p>
      <p class="dinero-resultado">Cambio: <span class="hueco hueco-corto"></span> €</p>
    </div>`;
  }

  return `<div class="dinero-bloque">
    <div class="dinero-grupos">${grupos}</div>
    <p class="dinero-resultado">Total: <span class="hueco hueco-corto"></span> €</p>
  </div>`;
}

// ── Proporcionalidad simple (sentido numérico / razonamiento proporcional)
// Tabla de dos magnitudes en proporción directa: se dan varios valores YA
// dados de la magnitud A y se deja la magnitud B en blanco para que el
// alumno aplique la razón del enunciado — el sistema nunca calcula ni
// revela ningún valor de B.
function renderProporcionalidad(datos) {
  let valoresA = Array.isArray(datos.valoresA) ? datos.valoresA.slice(0, 6).map(numeroDesdeJSON) : [];
  if (valoresA.length === 0) return '';
  const magnitudA = escapeHtml(datos.magnitudA || 'A');
  const magnitudB = escapeHtml(datos.magnitudB || 'B');

  const filas = valoresA.map(v => `
    <tr><td class="prop-celda">${v}</td><td class="prop-celda prop-hueco"></td></tr>`).join('');

  return `<table class="tabla-proporcionalidad">
    <thead><tr><th>${magnitudA}</th><th>${magnitudB}</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>`;
}

// ── Conversión de unidades (sentido de la medida) ────────────────────────
// Lista de conversiones a completar, con una tabla de equivalencia de
// apoyo (decorativa) cuando el sistema reconoce el par de unidades.
const EQUIVALENCIAS_UNIDADES = {
  'm-cm': '1 m = 100 cm', 'cm-m': '1 m = 100 cm',
  'km-m': '1 km = 1000 m', 'm-km': '1 km = 1000 m',
  'kg-g': '1 kg = 1000 g', 'g-kg': '1 kg = 1000 g',
  'l-ml': '1 l = 1000 ml', 'ml-l': '1 l = 1000 ml',
  'h-min': '1 h = 60 min', 'min-h': '1 h = 60 min',
  'min-s': '1 min = 60 s', 's-min': '1 min = 60 s',
  'm-mm': '1 m = 1000 mm', 'mm-m': '1 m = 1000 mm',
  'cm-mm': '1 cm = 10 mm', 'mm-cm': '1 cm = 10 mm'
};
function renderConversionUnidades(datos) {
  const conversiones = Array.isArray(datos.conversiones) ? datos.conversiones.slice(0, 8) : [];
  if (conversiones.length === 0) return '';

  const claveEquiv = `${conversiones[0].unidadOrigen}-${conversiones[0].unidadDestino}`;
  const ayuda = EQUIVALENCIAS_UNIDADES[claveEquiv]
    ? `<p class="conversion-ayuda">Recuerda: ${EQUIVALENCIAS_UNIDADES[claveEquiv]}</p>` : '';

  const filas = conversiones.map(c => `
    <div class="conversion-fila">
      <span>${numeroDesdeJSON(c.cantidad)} ${escapeHtml(c.unidadOrigen)}</span>
      <span>=</span>
      <span class="hueco hueco-corto"></span>
      <span>${escapeHtml(c.unidadDestino)}</span>
    </div>`).join('');

  return `<div class="conversion-bloque">${ayuda}${filas}</div>`;
}

// ── Medir con regla (sentido de la medida) ───────────────────────────────
// Segmentos dibujados a ESCALA FÍSICA REAL usando unidades CSS "cm" (no
// píxeles): así, al imprimir en A4 a tamaño real, un segmento de "5cm" mide
// 5 cm de verdad sobre el papel y el alumno puede medirlo con su propia
// regla. La longitud siempre se deriva de "longitudCm", nunca de otro dato.
function renderMedirConRegla(datos) {
  let segmentos = Array.isArray(datos.segmentos) ? datos.segmentos.slice(0, 6) : [];
  segmentos = segmentos.map(s => Math.max(1, Math.min(15, Math.round(numeroDesdeJSON(s.longitudCm)))));
  if (segmentos.length === 0) return '';

  const marcasRegla = Array.from({ length: 16 }, (_, i) =>
    `<span class="regla-marca" style="left:${i}cm;">${i}</span>`).join('');

  const filas = segmentos.map((cm, i) => `
    <div class="regla-fila">
      <span class="regla-etiqueta">${String.fromCharCode(65 + i)})</span>
      <div class="regla-segmento" style="width:${cm}cm;"></div>
      <span class="hueco hueco-corto"></span> cm
    </div>`).join('');

  return `<div class="regla-bloque">
    <p class="regla-nota">Mide cada línea con tu regla:</p>
    <div class="regla-guia"><div class="regla-linea"></div>${marcasRegla}</div>
    ${filas}
  </div>`;
}

// ── Ángulos (sentido espacial) ────────────────────────────────────────
// Dos semirrectas desde un vértice (la primera siempre horizontal, a 0°) y
// un arco de color entre ambas. "modo": "clasificar" deja un hueco para
// escribir el tipo (agudo/recto/obtuso/llano); "transportador" añade una
// escala de 0° a 180° superpuesta al vértice para practicar la medida.
function svgAngulo(grados, conTransportador) {
  const g = Math.max(5, Math.min(180, Math.round(numeroDesdeJSON(grados))));
  const cx = 95, cy = 105, radio = 75;
  const rad = (deg) => (deg * Math.PI) / 180;
  const x2 = (cx + radio * Math.cos(rad(g))).toFixed(1);
  const y2 = (cy - radio * Math.sin(rad(g))).toFixed(1);
  const arco = `<path d="M${(cx + 26).toFixed(1)} ${cy} A26 26 0 0 0 ${(cx + 26 * Math.cos(rad(g))).toFixed(1)} ${(cy - 26 * Math.sin(rad(g))).toFixed(1)}" fill="none" stroke="#dc2626" stroke-width="1.6"/>`;

  let escala = '';
  if (conTransportador) {
    for (let d = 0; d <= 180; d += 10) {
      const grande = d % 30 === 0;
      const r1 = radio + 4, r2 = grande ? radio + 12 : radio + 8;
      const xa = (cx + r1 * Math.cos(rad(d))).toFixed(1), ya = (cy - r1 * Math.sin(rad(d))).toFixed(1);
      const xb = (cx + r2 * Math.cos(rad(d))).toFixed(1), yb = (cy - r2 * Math.sin(rad(d))).toFixed(1);
      escala += `<line x1="${xa}" y1="${ya}" x2="${xb}" y2="${yb}" stroke="#64748b" stroke-width="1"/>`;
      if (grande) {
        const xt = (cx + (r2 + 10) * Math.cos(rad(d))).toFixed(1), yt = (cy - (r2 + 10) * Math.sin(rad(d))).toFixed(1);
        escala += `<text x="${xt}" y="${yt}" font-size="8" text-anchor="middle" font-family="Arial" fill="#64748b">${d}</text>`;
      }
    }
    escala += `<path d="M${(cx - radio - 14).toFixed(1)} ${cy} A${radio + 14} ${radio + 14} 0 0 0 ${(cx + radio + 14).toFixed(1)} ${cy}" fill="none" stroke="#94a3b8" stroke-width="1"/>`;
  }

  return `<svg width="195" height="115" viewBox="0 0 195 115">
    ${escala}
    <line x1="${cx}" y1="${cy}" x2="${cx + radio}" y2="${cy}" stroke="#000" stroke-width="2"/>
    <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2"/>
    ${arco}
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="#000"/>
  </svg>`;
}
function renderAngulos(datos) {
  const angulos = Array.isArray(datos.angulos) ? datos.angulos.slice(0, 4) : [];
  if (angulos.length === 0) return '';
  const modo = datos.modo === 'transportador' ? 'transportador' : 'clasificar';

  const tarjetas = angulos.map(a => {
    const svg = svgAngulo(a.grados, modo === 'transportador');
    const respuesta = modo === 'transportador'
      ? `<p class="angulo-respuesta">Mide: <span class="hueco hueco-corto"></span>°</p>`
      : `<p class="angulo-respuesta">Tipo: <span class="hueco hueco-corto"></span></p>`;
    return `<div class="angulo-tarjeta">${svg}${respuesta}</div>`;
  }).join('');

  return `<div class="angulos-grid">${tarjetas}</div>`;
}

// ── Simetría (sentido espacial) ──────────────────────────────────────
// Catálogo cerrado de figuras en cuadrícula (ya dibujada solo la MITAD):
// una lista fija de celdas ocupadas en un grid de 5 columnas × 6 filas.
// El alumno completa a mano la mitad simétrica sobre la cuadrícula en
// blanco — el sistema NUNCA dibuja esa mitad (sería darle la respuesta ya
// hecha). Coordenadas libres mandadas por Claude no garantizan una figura
// reconocible al reflejarla, así que — igual criterio que "figura
// geométrica" o "conecta los puntos" — el dibujo en sí es un catálogo
// cerrado; Claude solo elige qué plantilla y qué eje usar.
const PATRONES_SIMETRIA = {
  corazon: [[0, 3], [0, 4], [1, 2], [1, 3], [2, 2], [3, 2], [4, 1], [4, 2], [5, 0], [5, 1]],
  casa: [[0, 4], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [3, 4], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [5, 4]],
  flecha: [[0, 4], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4], [5, 4]],
  copa: [[0, 2], [0, 3], [0, 4], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4], [4, 1], [4, 2], [4, 3], [4, 4], [5, 1], [5, 2], [5, 3], [5, 4]]
};
export const PATRONES_SIMETRIA_DISPONIBLES = Object.keys(PATRONES_SIMETRIA);
const CELDA_SIMETRIA_PX = 22;
function renderSimetria(datos) {
  const nombre = PATRONES_SIMETRIA[datos.figura] ? datos.figura : 'corazon';
  const patron = PATRONES_SIMETRIA[nombre];
  const columnas = 5, filas = 6;
  const eje = datos.eje === 'horizontal' ? 'horizontal' : 'vertical';

  const celdas = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      celdas.push({ f, c, ocupada: patron.some(([pf, pc]) => pf === f && pc === c) });
    }
  }
  const mitadOriginal = celdas.map(({ f, c, ocupada }) =>
    `<rect x="${c * CELDA_SIMETRIA_PX}" y="${f * CELDA_SIMETRIA_PX}" width="${CELDA_SIMETRIA_PX}" height="${CELDA_SIMETRIA_PX}" class="${ocupada ? 'simetria-celda-llena' : 'simetria-celda-vacia'}"/>`
  ).join('');
  const mitadEspejo = celdas.map(({ f, c }) =>
    `<rect x="${c * CELDA_SIMETRIA_PX}" y="${f * CELDA_SIMETRIA_PX}" width="${CELDA_SIMETRIA_PX}" height="${CELDA_SIMETRIA_PX}" class="simetria-celda-vacia"/>`
  ).join('');

  const anchoGrid = columnas * CELDA_SIMETRIA_PX, altoGrid = filas * CELDA_SIMETRIA_PX;
  let svg;
  if (eje === 'vertical') {
    const anchoTotal = anchoGrid * 2 + 4;
    svg = `<svg width="${anchoTotal}" height="${altoGrid}" viewBox="0 0 ${anchoTotal} ${altoGrid}">
      <g>${mitadOriginal}</g>
      <g transform="translate(${anchoGrid + 4},0)">${mitadEspejo}</g>
      <line x1="${anchoGrid + 2}" y1="0" x2="${anchoGrid + 2}" y2="${altoGrid}" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>
    </svg>`;
  } else {
    const altoTotal = altoGrid * 2 + 4;
    svg = `<svg width="${anchoGrid}" height="${altoTotal}" viewBox="0 0 ${anchoGrid} ${altoTotal}">
      <g>${mitadOriginal}</g>
      <g transform="translate(0,${altoGrid + 4})">${mitadEspejo}</g>
      <line x1="0" y1="${altoGrid + 2}" x2="${anchoGrid}" y2="${altoGrid + 2}" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,4"/>
    </svg>`;
  }
  return `<div class="simetria-bloque">${svg}</div>`;
}

// ── Coordenadas (sentido espacial / localización) ────────────────────
// Primer cuadrante, 0-10 en cada eje. "localizar": el sistema dibuja los
// puntos y el alumno escribe sus coordenadas. "representar": el plano
// queda en blanco y solo se imprime la lista — el sistema nunca dibuja
// los puntos en ese modo, sería resolverlo por el alumno.
function renderCoordenadas(datos) {
  let puntos = Array.isArray(datos.puntos) ? datos.puntos.slice(0, 8) : [];
  puntos = puntos.map(p => ({
    x: Math.max(0, Math.min(10, Math.round(numeroDesdeJSON(p.x)))),
    y: Math.max(0, Math.min(10, Math.round(numeroDesdeJSON(p.y)))),
    etiqueta: escapeHtml(p.etiqueta || '')
  }));
  if (puntos.length === 0) return '';
  const modo = datos.modo === 'representar' ? 'representar' : 'localizar';

  const paso = 24, margen = 24, n = 10, tam = margen + n * paso;
  let lineas = '';
  for (let i = 0; i <= n; i++) {
    const p = margen + i * paso;
    lineas += `<line x1="${margen}" y1="${p}" x2="${tam}" y2="${p}" stroke="#e2e8f0" stroke-width="1"/>`;
    lineas += `<line x1="${p}" y1="${margen}" x2="${p}" y2="${tam}" stroke="#e2e8f0" stroke-width="1"/>`;
    if (i % 2 === 0) {
      lineas += `<text x="${margen - 8}" y="${tam - (p - margen) + 4}" font-size="8" text-anchor="end" font-family="Arial">${i}</text>`;
      lineas += `<text x="${p}" y="${tam + 12}" font-size="8" text-anchor="middle" font-family="Arial">${i}</text>`;
    }
  }
  const ejes = `<line x1="${margen}" y1="${tam}" x2="${tam}" y2="${tam}" stroke="#000" stroke-width="1.5"/>
    <line x1="${margen}" y1="${margen}" x2="${margen}" y2="${tam}" stroke="#000" stroke-width="1.5"/>`;

  const marcasPuntos = modo === 'localizar' ? puntos.map(p => {
    const cx = margen + p.x * paso, cy = tam - p.y * paso;
    return `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#dc2626"/><text x="${cx + 6}" y="${cy - 6}" font-size="11" font-family="Arial" font-weight="bold">${p.etiqueta}</text>`;
  }).join('') : '';

  const svg = `<svg width="${tam + 16}" height="${tam + 20}" viewBox="0 0 ${tam + 16} ${tam + 20}">${lineas}${ejes}${marcasPuntos}</svg>`;

  const listaHuecos = modo === 'localizar'
    ? `<div class="coordenadas-lista">${puntos.map(p => `<p>${p.etiqueta}: ( <span class="hueco hueco-corto"></span> , <span class="hueco hueco-corto"></span> )</p>`).join('')}</div>`
    : `<div class="coordenadas-lista">${puntos.map(p => `<p>${p.etiqueta}: (${p.x}, ${p.y})</p>`).join('')}</div>`;

  return `<div class="coordenadas-bloque">${svg}${listaHuecos}</div>`;
}

// ── Probabilidad (sentido estocástico) ───────────────────────────────
// Solo cualitativo (seguro/posible/imposible, o ranking por probabilidad)
// — no hay ninguna cantidad numérica que blindar, así que los iconos de
// apoyo son puramente decorativos, de un catálogo cerrado fijo.
const ICONOS_PROBABILIDAD = {
  dado: '<svg width="46" height="46" viewBox="0 0 46 46"><rect x="3" y="3" width="40" height="40" rx="6" fill="none" stroke="#000" stroke-width="2"/><circle cx="14" cy="14" r="3" fill="#000"/><circle cx="32" cy="14" r="3" fill="#000"/><circle cx="23" cy="23" r="3" fill="#000"/><circle cx="14" cy="32" r="3" fill="#000"/><circle cx="32" cy="32" r="3" fill="#000"/></svg>',
  moneda: '<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="#000" stroke-width="2"/><path d="M15,23 a8,8 0 1,1 16,0 a8,8 0 1,1 -16,0" fill="none" stroke="#000" stroke-width="1.3"/></svg>',
  ruleta: '<svg width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" fill="none" stroke="#000" stroke-width="2"/><line x1="23" y1="4" x2="23" y2="42" stroke="#000" stroke-width="1.3"/><line x1="4" y1="23" x2="42" y2="23" stroke="#000" stroke-width="1.3"/></svg>'
};
export const ICONOS_PROBABILIDAD_DISPONIBLES = Object.keys(ICONOS_PROBABILIDAD);
function renderProbabilidad(datos) {
  const modo = datos.modo === 'ordenar' ? 'ordenar' : 'clasificar';
  const sucesos = Array.isArray(datos.sucesos) ? datos.sucesos.slice(0, 6) : [];
  if (sucesos.length === 0) return '';

  const filas = sucesos.map(s => {
    const icono = ICONOS_PROBABILIDAD[s.icono] || '';
    const texto = escapeHtml(s.texto);
    if (modo === 'ordenar') {
      return `<div class="probabilidad-fila">
        ${icono}<span class="probabilidad-texto">${texto}</span>
        <span class="probabilidad-orden hueco hueco-corto"></span>
      </div>`;
    }
    return `<div class="probabilidad-fila">
      ${icono}<span class="probabilidad-texto">${texto}</span>
      <span class="probabilidad-opciones">
        <span class="opcion-item"><span class="casilla-test"></span> Seguro</span>
        <span class="opcion-item"><span class="casilla-test"></span> Posible</span>
        <span class="opcion-item"><span class="casilla-test"></span> Imposible</span>
      </span>
    </div>`;
  }).join('');

  return `<div class="probabilidad-bloque">${filas}</div>`;
}

// ── Medidas de centralización (sentido estocástico) ──────────────────
// Media, moda y/o mediana a partir de una lista de datos — mismo espíritu
// que la tabla de frecuencias numérica: se imprimen los datos en bruto y
// se deja un hueco por cada medida pedida, sin calcular ni insinuar nada.
function renderMedidasCentralizacion(datos) {
  const registros = Array.isArray(datos.registros) ? datos.registros : [];
  if (registros.length === 0) return '';
  const pedir = Array.isArray(datos.pedir) && datos.pedir.length > 0 ? datos.pedir : ['media'];
  const etiquetas = { media: 'Media', moda: 'Moda', mediana: 'Mediana' };

  const listaHtml = registros.map(v => escapeHtml(v)).join(', ');
  const filasRespuesta = pedir
    .filter(p => etiquetas[p])
    .map(p => `<div class="mc-respuesta-fila"><span>${etiquetas[p]} = </span><span class="hueco hueco-largo"></span></div>`)
    .join('');
  if (!filasRespuesta) return '';

  return `<div class="medidas-centralizacion-bloque">
    <p class="mc-datos-lista">Datos: ${listaHtml}</p>
    <div class="mc-respuestas">${filasRespuesta}</div>
  </div>`;
}

// ── Ecuación sencilla (sentido algebraico / modelo matemático) ──────────
// Operación con un hueco en CUALQUIERA de sus tres posiciones (primer
// término, segundo término o resultado) — no siempre en el resultado, a
// diferencia de "calculo_mental". Blindaje: el número que se IMPRIME en
// la posición "resultado" (cuando no es ella la incógnita) lo calcula
// SIEMPRE el propio código a partir de "a", "signo" y "b" — nunca se
// confía en que el "resultado" que mande Claude sea correcto.
function calcularResultadoEcuacion(a, signo, b) {
  if (signo === '-') return a - b;
  if (signo === '×') return a * b;
  return a + b;
}
function renderEcuacionSencilla(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones.slice(0, 8) : [];
  if (operaciones.length === 0) return '';

  const filas = operaciones.map(op => {
    const a = Math.round(numeroDesdeJSON(op.a));
    const b = Math.round(numeroDesdeJSON(op.b));
    const signo = op.signo === '-' ? '-' : (op.signo === '×' || op.signo === '*' ? '×' : '+');
    const resultado = calcularResultadoEcuacion(a, signo, b);
    const posicion = ['a', 'b', 'resultado'].includes(op.posicionIncognita) ? op.posicionIncognita : 'resultado';

    const celda = (valor, esIncognita) => esIncognita
      ? `<span class="hueco hueco-corto ecuacion-hueco"></span>`
      : `<span class="ecuacion-numero">${valor}</span>`;

    return `<div class="ecuacion-fila">
      ${celda(a, posicion === 'a')}
      <span class="ecuacion-signo">${signo}</span>
      ${celda(b, posicion === 'b')}
      <span class="ecuacion-signo">=</span>
      ${celda(resultado, posicion === 'resultado')}
    </div>`;
  }).join('');

  return `<div class="ecuacion-sencilla-bloque">${filas}</div>`;
}

// ── Crucigrama numérico (backlog Twinkl, 30/08/2026) ─────────────────
// Cada pista es una operación cuyo resultado se escribe dígito a dígito,
// en horizontal o vertical, dentro de una rejilla. El sistema NUNCA
// calcula ni conoce las respuestas — solo dibuja la rejilla (celdas
// activas en blanco, el resto bloqueadas) a partir de la posición/
// longitud de cada palabra, y la lista de pistas debajo. Blindaje de
// tamaño y de límites de la rejilla (máximo 10×10).
function renderCrucigrama(datos) {
  let palabras = Array.isArray(datos.palabras) ? datos.palabras.slice(0, 12) : [];
  const pistas = Array.isArray(datos.pistas) ? datos.pistas : [];
  if (palabras.length === 0) return '';

  palabras = palabras
    .map(p => ({
      numero: parseInt(p.numero, 10) || 0,
      direccion: p.direccion === 'v' ? 'v' : 'h',
      fila: Math.max(0, parseInt(p.fila, 10) || 0),
      columna: Math.max(0, parseInt(p.columna, 10) || 0),
      longitud: Math.max(1, Math.min(8, parseInt(p.longitud, 10) || 1))
    }))
    .filter(p => p.fila < 10 && p.columna < 10);
  if (palabras.length === 0) return '';

  let maxFila = 0, maxColumna = 0;
  const celdasActivas = new Map();
  for (const p of palabras) {
    for (let i = 0; i < p.longitud; i++) {
      const f = p.direccion === 'v' ? p.fila + i : p.fila;
      const c = p.direccion === 'h' ? p.columna + i : p.columna;
      if (f > 9 || c > 9) continue;
      maxFila = Math.max(maxFila, f);
      maxColumna = Math.max(maxColumna, c);
      const clave = `${f},${c}`;
      if (i === 0 && p.numero) celdasActivas.set(clave, p.numero);
      else if (!celdasActivas.has(clave)) celdasActivas.set(clave, null);
    }
  }

  const CELDA_CRUCIGRAMA = 30;
  let svgCeldas = '';
  for (let f = 0; f <= maxFila; f++) {
    for (let c = 0; c <= maxColumna; c++) {
      const clave = `${f},${c}`;
      const activa = celdasActivas.has(clave);
      const x = c * CELDA_CRUCIGRAMA, y = f * CELDA_CRUCIGRAMA;
      svgCeldas += `<rect x="${x}" y="${y}" width="${CELDA_CRUCIGRAMA}" height="${CELDA_CRUCIGRAMA}" class="${activa ? 'crucigrama-celda-activa' : 'crucigrama-celda-bloqueada'}"/>`;
      const numeroClave = celdasActivas.get(clave);
      if (numeroClave) svgCeldas += `<text x="${x + 3}" y="${y + 10}" font-size="8" font-family="Arial">${numeroClave}</text>`;
    }
  }
  const ancho = (maxColumna + 1) * CELDA_CRUCIGRAMA, alto = (maxFila + 1) * CELDA_CRUCIGRAMA;
  const svg = `<svg width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">${svgCeldas}</svg>`;

  const pistasHorizontales = pistas.filter(p => p.direccion === 'h');
  const pistasVerticales = pistas.filter(p => p.direccion === 'v');
  const listaPistas = (lista, titulo) => lista.length === 0 ? '' : `
    <div class="crucigrama-lista-pistas">
      <p class="crucigrama-titulo-pistas">${titulo}</p>
      <ul>${lista.map(p => `<li>${escapeHtml(p.numero)}. ${escapeHtml(p.texto)}</li>`).join('')}</ul>
    </div>`;

  return `<div class="crucigrama-bloque">
    <div class="crucigrama-grid">${svg}</div>
    <div class="crucigrama-pistas">
      ${listaPistas(pistasHorizontales, 'Horizontales')}
      ${listaPistas(pistasVerticales, 'Verticales')}
    </div>
  </div>`;
}

// ── Colorea según el resultado (backlog Twinkl, 30/08/2026) ─────────
// Mosaico de casillas con una operación cada una; el alumno resuelve y
// colorea según el color de la leyenda que corresponda al rango del
// resultado. Blindaje de color: la paleta la elige SIEMPRE el sistema (un
// color fijo por posición de la leyenda) — nunca un color libre mandado
// por Claude, para no arriesgar una paleta ilegible o inconsistente.
const PALETA_COLOREAR = ['#fde68a', '#a7f3d0', '#bfdbfe', '#fbcfe8', '#fecaca', '#ddd6fe', '#fdba74', '#c7d2fe'];
function renderColoreaPorOperacion(datos) {
  const celdas = Array.isArray(datos.celdas) ? datos.celdas.slice(0, 30) : [];
  const leyenda = Array.isArray(datos.leyenda) ? datos.leyenda.slice(0, 8) : [];
  if (celdas.length === 0 || leyenda.length === 0) return '';

  const mosaico = celdas.map(c => `<div class="colorea-celda">${escapeHtml(c.operacion)}</div>`).join('');

  const leyendaHtml = leyenda.map((l, i) => `
    <div class="colorea-leyenda-item">
      <span class="colorea-leyenda-color" style="background:${PALETA_COLOREAR[i % PALETA_COLOREAR.length]}"></span>
      <span>${escapeHtml(l.rangoMin)}–${escapeHtml(l.rangoMax)}: ${escapeHtml(l.etiqueta || '')}</span>
    </div>`).join('');

  return `<div class="colorea-por-operacion-bloque">
    <div class="colorea-mosaico">${mosaico}</div>
    <div class="colorea-leyenda">${leyendaHtml}</div>
  </div>`;
}

// ── Conecta los puntos (backlog Twinkl, 30/08/2026) ──────────────────
// Catálogo cerrado de plantillas de dibujo (coordenadas fijas dentro de un
// lienzo también fijo) — mismo criterio que "simetria": coordenadas libres
// de un modelo de lenguaje no garantizan un dibujo reconocible al
// conectarlas, así que el dibujo final lo decide el propio sistema, nunca
// Claude. Claude solo elige qué plantilla usar y el paso de conteo.
const PLANTILLAS_CONECTA_PUNTOS = {
  estrella: [[100, 10], [123, 70], [190, 72], [138, 112], [157, 178], [100, 140], [43, 178], [62, 112], [10, 72], [77, 70]],
  casa: [[20, 120], [20, 60], [100, 10], [180, 60], [180, 120], [130, 120], [130, 170], [70, 170], [70, 120]],
  pez: [[10, 80], [60, 40], [130, 40], [170, 20], [190, 80], [170, 140], [130, 120], [60, 120]],
  cometa: [[100, 10], [160, 70], [100, 190], [40, 70]],
  barco: [[30, 140], [30, 80], [100, 20], [100, 80], [170, 80], [150, 140]],
  // Ampliación (02/10/2026): más dibujos, todos figuras cerradas (el último
  // punto se une con el primero).
  corazon: [[100, 60], [120, 35], [150, 25], [178, 40], [188, 70], [178, 105], [150, 140], [100, 185], [50, 140], [22, 105], [12, 70], [22, 40], [50, 25], [80, 35]],
  pino: [[100, 10], [135, 55], [112, 55], [155, 100], [125, 100], [175, 150], [112, 150], [112, 185], [88, 185], [88, 150], [25, 150], [75, 100], [45, 100], [88, 55], [65, 55]],
  cohete: [[100, 8], [125, 40], [130, 80], [130, 130], [160, 165], [160, 185], [125, 170], [115, 185], [85, 185], [75, 170], [40, 185], [40, 165], [70, 130], [70, 80], [75, 40]],
  rayo: [[115, 8], [140, 8], [105, 80], [150, 80], [70, 192], [92, 105], [50, 105]],
  corona: [[20, 170], [10, 60], [55, 110], [100, 30], [145, 110], [190, 60], [180, 170]],
  camiseta: [[70, 20], [85, 35], [115, 35], [130, 20], [185, 50], [165, 90], [145, 78], [145, 185], [55, 185], [55, 78], [35, 90], [15, 50]],
  coche: [[10, 150], [10, 110], [45, 100], [65, 60], [135, 60], [160, 100], [190, 110], [190, 150], [165, 150], [155, 170], [135, 170], [125, 150], [75, 150], [65, 170], [45, 170], [35, 150]],
  seta: [[100, 15], [150, 30], [180, 65], [185, 100], [125, 100], [130, 180], [70, 180], [75, 100], [15, 100], [20, 65], [50, 30]],
  velero: [[100, 10], [175, 110], [110, 110], [110, 145], [190, 145], [160, 185], [40, 185], [10, 145], [90, 145], [90, 110], [25, 110]],
  luna: [[120, 12], [80, 15], [45, 35], [20, 70], [12, 105], [25, 145], [55, 175], [95, 188], [135, 180], [100, 160], [75, 135], [62, 100], [70, 65], [90, 35]],
  flecha: [[100, 10], [185, 95], [135, 95], [135, 190], [65, 190], [65, 95], [15, 95]],
  gato: [[30, 15], [70, 50], [130, 50], [170, 15], [180, 90], [165, 140], [130, 175], [100, 185], [70, 175], [35, 140], [20, 90]],
  helado: [[100, 190], [60, 95], [40, 85], [35, 55], [55, 25], [85, 12], [115, 12], [145, 25], [165, 55], [160, 85], [140, 95]]
};
export const PLANTILLAS_CONECTA_PUNTOS_DISPONIBLES = Object.keys(PLANTILLAS_CONECTA_PUNTOS);
// Para el prompt: "estrella (10 puntos), casa (9 puntos)..."
export const PLANTILLAS_CONECTA_PUNTOS_CON_CANTIDAD = Object.entries(PLANTILLAS_CONECTA_PUNTOS).map(([n, p]) => `${n} (${p.length} puntos)`);
function puntosConecta(nombrePlantilla, cantidadPedida) {
  // Añade puntos intermedios a lo largo del contorno (también en el tramo que
  // cierra la figura) hasta la cantidad pedida: el dibujo es el mismo, pero
  // con más números que unir. Los puntos extra se reparten según la longitud
  // de cada tramo, para que no se amontonen en los tramos cortos.
  const base = PLANTILLAS_CONECTA_PUNTOS[nombrePlantilla];
  // Tope de 40 puntos en total: con más, los números ya no caben sin pisarse.
  const pedida = Math.min(40, parseInt(cantidadPedida, 10) || 0);
  if (pedida <= base.length) return base;
  const tramos = base.map((p, i) => {
    const q = base[(i + 1) % base.length];
    return { p, q, largo: Math.hypot(q[0] - p[0], q[1] - p[1]), extra: 0 };
  });
  for (let n = pedida - base.length; n > 0; n--) {
    // Cada punto extra va al tramo cuyos trozos son ahora mismo más largos.
    let mejor = tramos[0];
    tramos.forEach(t => { if (t.largo / (t.extra + 1) > mejor.largo / (mejor.extra + 1)) mejor = t; });
    mejor.extra++;
  }
  const puntos = [];
  tramos.forEach(({ p, q, extra }) => {
    for (let j = 0; j <= extra; j++) puntos.push([p[0] + (q[0] - p[0]) * j / (extra + 1), p[1] + (q[1] - p[1]) * j / (extra + 1)]);
  });
  return puntos;
}

function datosConecta(datos) {
  const plantilla = PLANTILLAS_CONECTA_PUNTOS[datos.plantilla] ? datos.plantilla : 'estrella';
  const puntos = puntosConecta(plantilla, datos.puntos);
  let paso = parseInt(datos.paso, 10);
  if (!Number.isInteger(paso) || paso < 1) paso = 1;
  paso = Math.min(paso, 10);
  let inicio = parseInt(datos.inicio, 10);
  if (!Number.isInteger(inicio) || inicio < 0) inicio = paso;
  return { puntos, paso, inicio, fin: inicio + (puntos.length - 1) * paso };
}

// El enunciado de "conecta_los_puntos" lo escribe el código (02/10/2026): la
// IA decía "del 1 al 30" con un dibujo de 10 puntos. Así siempre coincide.
function enunciadoConecta(datos) {
  const { paso, inicio, fin } = datosConecta(datos || {});
  return paso === 1
    ? `Une los puntos en orden, del ${inicio} al ${fin}.`
    : `Une los puntos contando de ${paso} en ${paso}, del ${inicio} al ${fin}.`;
}

function renderConectaLosPuntos(datos) {
  const { puntos, paso, inicio } = datosConecta(datos);
  // Sentido de giro del contorno: sirve para saber hacia dónde queda "fuera".
  let area = 0;
  puntos.forEach(([x, y], i) => { const [x2, y2] = puntos[(i + 1) % puntos.length]; area += x * y2 - x2 * y; });
  const giro = area >= 0 ? 1 : -1;
  const lejos = puntos.length > 15 ? 9 : 12;
  const marcas = puntos.map(([x, y], i) => {
    const numero = inicio + i * paso;
    // La etiqueta se pone por FUERA del contorno (perpendicular al trazo en
    // ese punto), para que no pise la línea que el niño va a dibujar.
    const [xa, ya] = puntos[(i - 1 + puntos.length) % puntos.length];
    const [xb, yb] = puntos[(i + 1) % puntos.length];
    const d = Math.hypot(xb - xa, yb - ya) || 1;
    const tx = x + giro * (yb - ya) / d * lejos, ty = y - giro * (xb - xa) / d * lejos + 3;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${puntos.length > 15 ? 1.9 : 2.6}" fill="#000"/><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="${puntos.length > 15 ? 8 : 10.5}" text-anchor="middle" font-family="Arial">${numero}</text>`;
  }).join('');

  // Con muchos puntos el dibujo sale más grande para que los números no se pisen.
  const lado = puntos.length > 15 ? 430 : 300;
  return `<div class="conecta-puntos-bloque">
    <svg width="${lado}" height="${Math.round(lado * 240 / 248)}" viewBox="-24 -22 248 240">${marcas}</svg>
  </div>`;
}

// ── Número del día / formación del número (backlog Twinkl, 30/08/2026) ──
// Valor posicional: el número a trazar, un marco de diez (ten-frame) con
// tantos círculos rellenos como el número (hasta 20, con dos marcos), y
// opcionalmente un conteo con iconos. Blindaje: el número de círculos
// rellenos se deriva SIEMPRE de "numero" (nunca de un campo aparte) y se
// acota a 0-20 (más allá deja de caber en dos marcos de diez).
function svgMarcoDiez(rellenos) {
  const celdas = Array.from({ length: 10 }, (_, i) => {
    const fila = Math.floor(i / 5), col = i % 5;
    const x = 4 + col * 26, y = 4 + fila * 26;
    const lleno = i < rellenos;
    return `<rect x="${x}" y="${y}" width="22" height="22" rx="3" class="${lleno ? 'marco-diez-lleno' : 'marco-diez-vacio'}"/>`;
  }).join('');
  return `<svg width="138" height="56" viewBox="0 0 138 56">${celdas}</svg>`;
}
function renderNumeroDelDia(datos) {
  let numero = parseInt(datos.numero, 10);
  if (!Number.isInteger(numero) || numero < 0) numero = 0;
  numero = Math.min(numero, 20);

  // 02/10/2026 (maestra): al niño no le quedaba claro qué hacer. Ahora son
  // tres pasos numerados, cada uno con su orden escrita por el código:
  // repasar y escribir el número, colorear casillas (el marco sale VACÍO) y
  // rodear dibujos (salen más de los que hay que rodear).
  const paso = (n, texto, cuerpo) => `<div class="numero-dia-paso">
      <p class="numero-dia-orden"><span class="numero-dia-n">${n}</span>${texto}</p>
      ${cuerpo}
    </div>`;

  const escribir = `<div class="numero-dia-escribir">
      ${celdaTrazo(numero, true)}
      ${'<span class="numero-dia-casilla"></span>'.repeat(2)}
    </div>`;

  const marcos = `<div class="numero-dia-marcos">${svgMarcoDiez(0)}${numero > 10 ? svgMarcoDiez(0) : ''}</div>`;

  let tercero;
  if (datos.icono && ICONOS[datos.icono] && numero > 0) {
    const total = Math.min(25, Math.ceil((numero + 3) / 5) * 5);
    tercero = paso(3, `Rodea <b>${numero}</b>`, `<div class="numero-dia-iconos">${htmlIcono(datos.icono).repeat(total)}</div>`);
  } else {
    tercero = paso(3, `Dibuja <b>${numero}</b> ${numero === 1 ? 'bolita' : 'bolitas'}`, '<div class="numero-dia-dibujar"></div>');
  }

  return `<div class="numero-dia-bloque">
    ${paso(1, 'Repasa y escribe', escribir)}
    ${paso(2, `Colorea <b>${numero}</b> ${numero === 1 ? 'casilla' : 'casillas'}`, marcos)}
    ${tercero}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════
// SEGUNDA AMPLIACIÓN — SENTIDO DE LA MEDIDA (07/09/2026, misma sesión)
// Los dos candidatos que quedaron anotados como "posible ampliación
// futura" tras la primera tanda de 14 tipos: el usuario pidió abordarlos
// ya para poder enseñárselo todo junto a la maestra antes de que empiece
// el curso. Mismo criterio de blindaje que el resto del fichero.
// ═══════════════════════════════════════════════════════════════════════

// ── Pesar con balanza (sentido de la medida — masa) ──────────────────
// Balanza de dos platillos, dibujada SIEMPRE nivelada (nunca inclinada
// hacia un lado): en "modo pesas" eso representa el equilibrio real (el
// peso del objeto es la suma de las pesas, que el alumno calcula); en
// "modo comparar" es deliberado — el sistema no sabe cuál pesa más
// realmente, así que nunca inclina la balanza como pista, el alumno
// decide por sí mismo a partir del enunciado y escribe <, > o =.
const DENOMINACIONES_PESO_G = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
function formatoPeso(valorGramos) {
  if (valorGramos >= 1000 && valorGramos % 1000 === 0) return `${valorGramos / 1000} kg`;
  return `${valorGramos} g`;
}
function svgPesa(valorGramos) {
  const texto = formatoPeso(valorGramos);
  return `<svg width="52" height="52" viewBox="0 0 50 50"><path d="M14,44 L10,20 Q10,14 16,14 L34,14 Q40,14 40,20 L36,44 Z" fill="none" stroke="#000" stroke-width="2"/><circle cx="25" cy="8" r="5" fill="none" stroke="#000" stroke-width="2"/><line x1="25" y1="13" x2="25" y2="14" stroke="#000" stroke-width="2"/><text x="25" y="34" text-anchor="middle" font-size="9.5" font-family="Arial" font-weight="bold">${texto}</text></svg>`;
}
function svgArmazonBalanza() {
  return `<svg class="balanza-svg" width="280" height="70" viewBox="0 0 280 70">
    <line x1="140" y1="6" x2="140" y2="24" stroke="#000" stroke-width="3"/>
    <polygon points="140,24 122,52 158,52" fill="none" stroke="#000" stroke-width="2.5"/>
    <line x1="20" y1="6" x2="260" y2="6" stroke="#000" stroke-width="3"/>
    <line x1="20" y1="6" x2="20" y2="30" stroke="#000" stroke-width="1.3"/>
    <line x1="260" y1="6" x2="260" y2="30" stroke="#000" stroke-width="1.3"/>
    <ellipse cx="20" cy="34" rx="36" ry="7" fill="none" stroke="#000" stroke-width="1.3"/>
    <ellipse cx="260" cy="34" rx="36" ry="7" fill="none" stroke="#000" stroke-width="1.3"/>
  </svg>`;
}
function renderPesarConBalanza(datos) {
  const modo = datos.modo === 'comparar' ? 'comparar' : 'pesas';

  if (modo === 'comparar') {
    const izq = datos.izquierda || {};
    const der = datos.derecha || {};
    const cantIzq = Math.max(1, Math.min(10, parseInt(izq.cantidad, 10) || 1));
    const cantDer = Math.max(1, Math.min(10, parseInt(der.cantidad, 10) || 1));
    const contenidoIzq = renderIconos(izq.icono, cantIzq);
    const contenidoDer = renderIconos(der.icono, cantDer);
    return `<div class="balanza-bloque">
      <div class="balanza-armazon">
        ${svgArmazonBalanza()}
        <div class="balanza-platillo balanza-platillo-izq">${contenidoIzq}</div>
        <div class="balanza-platillo balanza-platillo-der">${contenidoDer}</div>
      </div>
      <p class="balanza-respuesta">
        <span class="balanza-lado-nombre">Izquierda</span>
        <span class="hueco hueco-corto"></span>
        <span class="balanza-lado-nombre">Derecha</span>
      </p>
    </div>`;
  }

  // modo "pesas": objeto de peso desconocido en un platillo, pesas
  // conocidas en el otro — el alumno suma las pesas para saber cuánto
  // pesa el objeto. Blindaje de denominaciones: solo valores reales de un
  // juego de pesas, igual criterio que "dinero_euros" con las monedas.
  const objeto = datos.objeto || {};
  let pesas = Array.isArray(datos.pesas) ? datos.pesas : [];
  pesas = pesas
    .filter(p => DENOMINACIONES_PESO_G.includes(parseInt(p.valor, 10)))
    .slice(0, 6)
    .map(p => ({ valor: parseInt(p.valor, 10), cantidad: Math.max(1, Math.min(6, parseInt(p.cantidad, 10) || 1)) }));
  if (pesas.length === 0) return '';

  const cantObjeto = Math.max(1, Math.min(4, parseInt(objeto.cantidad, 10) || 1));
  const contenidoObjeto = renderIconos(objeto.icono, cantObjeto);
  const contenidoPesas = pesas.map(p => svgPesa(p.valor).repeat(p.cantidad)).join('');

  return `<div class="balanza-bloque">
    <div class="balanza-armazon">
      ${svgArmazonBalanza()}
      <div class="balanza-platillo balanza-platillo-izq">${contenidoObjeto}</div>
      <div class="balanza-platillo balanza-platillo-der">${contenidoPesas}</div>
    </div>
    <p class="balanza-respuesta-pesas">Peso: <span class="hueco hueco-corto"></span></p>
  </div>`;
}

// ── Medir capacidad (sentido de la medida — capacidad/volumen) ───────
// Recipientes graduados con el líquido dibujado a su nivel real (mismo
// espíritu que "grafico_barras" en modo "leer": el dibujo representa el
// dato real y el ejercicio consiste en LEERLO o COMPARARLO, no en
// adivinarlo). La altura del relleno se deriva SIEMPRE de
// "nivelActual"/"capacidadMax" por código, nunca de otro dato.
function svgRecipiente(capacidadMax, nivelActual, alto) {
  const max = Math.max(1, numeroDesdeJSON(capacidadMax));
  const nivel = Math.max(0, Math.min(max, numeroDesdeJSON(nivelActual)));
  const ancho = 60;
  const pctLleno = nivel / max;
  const alturaFluido = alto * pctLleno;

  const pasos = 4;
  let marcas = '';
  for (let i = 0; i <= pasos; i++) {
    const y = alto - (alto * i / pasos);
    const valorMarca = Math.round(max * i / pasos);
    marcas += `<line x1="${ancho}" y1="${y.toFixed(1)}" x2="${ancho + 6}" y2="${y.toFixed(1)}" stroke="#000" stroke-width="1.2"/>`;
    marcas += `<text x="${ancho + 9}" y="${(y + 3).toFixed(1)}" font-size="8" font-family="Arial">${valorMarca}</text>`;
  }

  return `<svg width="${ancho + 34}" height="${alto + 6}" viewBox="0 0 ${ancho + 34} ${alto + 6}">
    <rect x="0" y="${(alto - alturaFluido).toFixed(1)}" width="${ancho}" height="${alturaFluido.toFixed(1)}" class="capacidad-fluido"/>
    <rect x="0" y="0" width="${ancho}" height="${alto}" fill="none" stroke="#000" stroke-width="2"/>
    ${marcas}
  </svg>`;
}
function renderMedirCapacidad(datos) {
  if (datos.modo === 'estimar') return renderEstimarCapacidad(datos);
  const modo = datos.modo === 'comparar' ? 'comparar' : 'leer';
  const unidad = escapeHtml(datos.unidad || 'ml');

  if (modo === 'comparar') {
    const izq = datos.izquierda || {};
    const der = datos.derecha || {};
    return `<div class="capacidad-bloque capacidad-comparar">
      <div class="capacidad-recipiente">${svgRecipiente(izq.capacidadMax, izq.nivelActual, 130)}</div>
      <p class="capacidad-hueco-comparar"><span class="hueco hueco-corto"></span></p>
      <div class="capacidad-recipiente">${svgRecipiente(der.capacidadMax, der.nivelActual, 130)}</div>
    </div>`;
  }

  const recipientes = Array.isArray(datos.recipientes) ? datos.recipientes.slice(0, 4) : [];
  if (recipientes.length === 0) return '';
  const tarjetas = recipientes.map((r, i) => `
    <div class="capacidad-tarjeta">
      <span class="capacidad-etiqueta">${String.fromCharCode(65 + i)})</span>
      ${svgRecipiente(r.capacidadMax, r.nivelActual, 130)}
      <p class="capacidad-respuesta">Contiene: <span class="hueco hueco-corto"></span> ${unidad}</p>
    </div>`).join('');

  return `<div class="capacidad-bloque">${tarjetas}</div>`;
}

// ── MCD y MCM (sentido numérico, backlog Megapack Kumubox 08/09/2026) ───
// Blindaje de tamaño (máximo 6 pares) y de qué hueco se pinta según
// "pedir" — el sistema nunca calcula ni imprime el MCD/MCM real (mismo
// criterio que "medidas_centralizacion": el contenido lo garantiza el
// prompt, el código solo estructura el hueco correspondiente).
function renderMcdMcm(datos) {
  let pares = Array.isArray(datos.pares) ? datos.pares.slice(0, 6) : [];
  if (pares.length === 0) return '';

  const filas = pares.map((p, i) => {
    const a = Math.max(1, Math.round(numeroDesdeJSON(p.a)));
    const b = Math.max(1, Math.round(numeroDesdeJSON(p.b)));
    const pedir = Array.isArray(p.pedir) && p.pedir.length > 0 ? p.pedir : ['mcd', 'mcm'];
    const huecoMcd = pedir.includes('mcd')
      ? `<span class="mcdmcm-etiqueta">MCD:</span><span class="hueco hueco-corto"></span>` : '';
    const huecoMcm = pedir.includes('mcm')
      ? `<span class="mcdmcm-etiqueta">MCM:</span><span class="hueco hueco-corto"></span>` : '';
    return `<div class="mcdmcm-fila">
      <span class="mcdmcm-letra">${String.fromCharCode(97 + i)})</span>
      <span class="mcdmcm-numeros">${a} y ${b}</span>
      ${huecoMcd}${huecoMcm}
    </div>`;
  }).join('');

  return `<div class="mcdmcm-bloque">${filas}</div>`;
}

// ── Descomposición numérica / valor posicional (sentido numérico,
// backlog Megapack Kumubox 08/09/2026) ──────────────────────────────────
// El alumno escribe cada cifra del número en su columna de valor
// posicional y, debajo, lo reescribe como suma de esos valores. Blindaje:
// las ETIQUETAS de columna y el NÚMERO de huecos de la suma se derivan
// siempre del propio número (nunca de un dato aparte que Claude tenga que
// acertar) — así nunca puede haber más o menos columnas que cifras tiene
// el número, ni más o menos sumandos que cifras.
const ETIQUETAS_VALOR_POSICIONAL = ['Unidades', 'Decenas', 'Centenas', 'UM', 'DM', 'CM', 'Millones'];

function renderDescomposicionNumerica(datos) {
  let numeros = Array.isArray(datos.numeros) ? datos.numeros.slice(0, 6) : [];
  numeros = numeros
    .map(n => Math.round(Math.abs(numeroDesdeJSON(n))))
    .filter(n => n > 0 && n < 10000000);
  if (numeros.length === 0) return '';

  const bloques = numeros.map(n => {
    const cifras = String(n).split('');
    const etiquetas = ETIQUETAS_VALOR_POSICIONAL.slice(0, cifras.length).reverse();
    const cabecera = etiquetas.map(e => `<th>${e}</th>`).join('');
    const celdas = etiquetas.map(() => `<td class="dn-celda"></td>`).join('');
    const sumaHuecos = cifras.map(() => `<span class="hueco hueco-corto"></span>`).join(' <span class="dn-mas">+</span> ');

    return `<div class="descomposicion-bloque">
      <table class="descomposicion-tabla">
        <thead><tr>${cabecera}</tr></thead>
        <tbody><tr>${celdas}</tr></tbody>
      </table>
      <p class="descomposicion-suma"><span class="descomposicion-numero">${n}</span> = ${sumaHuecos}</p>
    </div>`;
  }).join('');

  return `<div class="descomposicion-numerica-bloque">${bloques}</div>`;
}

// ── Detective de números (sentido numérico, backlog Megapack Kumubox
// 08/09/2026) ─────────────────────────────────────────────────────────
// Adivinar un número secreto a partir de una lista de pistas (par/impar,
// mayor/menor que, suma de cifras...). El número en sí NUNCA se imprime
// en la ficha: "datos.casos[].numero" viaja en el JSON solo para que en
// el prompt quede claro qué solución tienen que cuadrar las pistas —
// el renderizador lo ignora por completo al pintar el HTML, solo usa
// "pistas".
function renderDetectiveNumeros(datos) {
  let casos = Array.isArray(datos.casos) ? datos.casos.slice(0, 4) : [];
  casos = casos.filter(c => Array.isArray(c.pistas) && c.pistas.length > 0);
  if (casos.length === 0) return '';

  const bloques = casos.map((c, i) => {
    const pistas = c.pistas.slice(0, 6).map(p => `<li>${escapeHtml(p)}</li>`).join('');
    return `<div class="detective-caso">
      <p class="detective-titulo">Caso ${i + 1}</p>
      <ol class="detective-pistas">${pistas}</ol>
      <p class="detective-respuesta">El número secreto es: <span class="hueco hueco-corto"></span></p>
    </div>`;
  }).join('');

  return `<div class="detective-numeros-bloque">${bloques}</div>`;
}

// ── Números romanos (sentido numérico, backlog Megapack Kumubox 2026,
// 08/09/2026) ────────────────────────────────────────────────────────────
// Conversión arábigo↔romano. A diferencia de "acentuacion"/"clasificar_
// silabas" en Lengua (reglas lingüísticas con excepciones, se confía en
// Claude), la numeración romana es un algoritmo determinista y sin
// ambigüedad — el sistema la calcula siempre por su cuenta, nunca confía
// en que Claude escriba el numeral romano correctamente: cuando hay que
// MOSTRAR un numeral romano como dato de partida, el propio código lo
// genera a partir del número arábigo. Claude solo elige números arábigos
// pedagógicamente adecuados al curso, nunca escribe un romano él mismo.
function numeroARomano(n) {
  const TABLA = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let resto = Math.round(n);
  let resultado = '';
  for (const [valor, simbolo] of TABLA) {
    while (resto >= valor) {
      resultado += simbolo;
      resto -= valor;
    }
  }
  return resultado;
}

function renderNumerosRomanos(datos) {
  let numeros = Array.isArray(datos.numeros) ? datos.numeros.slice(0, 10) : [];
  numeros = numeros
    .map(n => Math.round(Math.abs(numeroDesdeJSON(n))))
    .filter(n => n > 0 && n <= 3999);
  if (numeros.length === 0) return '';

  const sentido = ['a_romano', 'a_arabigo', 'mixto'].includes(datos.sentido) ? datos.sentido : 'a_romano';

  const filas = numeros.map((n, i) => {
    const modoFila = sentido === 'mixto' ? (i % 2 === 0 ? 'a_romano' : 'a_arabigo') : sentido;
    const dado = modoFila === 'a_arabigo'
      ? `<span class="nr-dado nr-romano">${numeroARomano(n)}</span>`
      : `<span class="nr-dado nr-arabigo">${n}</span>`;
    return `<div class="numeros-romanos-fila">
      ${dado}
      <span class="nr-igual">=</span>
      <span class="hueco hueco-corto"></span>
    </div>`;
  }).join('');

  return `<div class="numeros-romanos-bloque">${filas}</div>`;
}

// ==========================================================================
// TIPOS NUEVOS — Séptima ampliación (19/09/2026, backlog identificado en
// PDFs "Personalización Matemáticas 1º" de Santillana España, páginas
// 92-109 — ver ROADMAP). Tres tipos genuinamente nuevos, sentido
// algebraico/numérico/razonamiento, sin equivalente en el catálogo previo.
// ==========================================================================

// ── Pirámide numérica (sentido algebraico/numérico) ─────────────────────
// Blindaje (b): el código SIEMPRE calcula la pirámide entera a partir de la
// base (fila inferior) que da Claude — cada casilla es la suma de las dos
// que tiene debajo, calculada aquí, nunca confiando en que Claude sume bien.
// Claude solo decide (1) los números de la base y (2) qué casillas quedan
// ocultas (pueden ser de la base o de filas superiores — así el hueco puede
// caer "abajo", "arriba" o "en medio", como pedía el recurso original).
function renderPiramideNumerica(datos) {
  let piramides = Array.isArray(datos.piramides) ? datos.piramides.slice(0, 4) : [];

  const bloques = piramides.map(p => {
    let base = Array.isArray(p.base) ? p.base.slice(0, 6) : [];
    // Hasta 9.999 en la base (24/09/2026: en 4º Claude usó bases de tres cifras y la pirámide
    // entera se descartaba porque el límite era 99).
    base = base.map(n => Math.round(Math.abs(numeroDesdeJSON(n)))).filter(n => n > 0 && n <= 9999);
    if (base.length < 3) return '';

    // La fila 0 es la base; cada fila siguiente tiene una casilla menos,
    // calculada aquí sumando parejas adyacentes de la fila de abajo.
    const filas = [base];
    while (filas[filas.length - 1].length > 1) {
      const anterior = filas[filas.length - 1];
      const siguiente = [];
      for (let i = 0; i < anterior.length - 1; i++) siguiente.push(anterior[i] + anterior[i + 1]);
      filas.push(siguiente);
    }

    let ocultar = Array.isArray(p.ocultar) ? p.ocultar : null;
    const ocultarSet = new Set();
    if (ocultar) {
      ocultar.forEach(par => {
        if (!Array.isArray(par) || par.length !== 2) return;
        const [f, c] = par;
        if (Number.isInteger(f) && Number.isInteger(c) && f >= 0 && f < filas.length &&
            c >= 0 && c < filas[f].length) {
          ocultarSet.add(f + '-' + c);
        }
      });
    } else {
      // Por defecto (modo clásico): la base se da entera, todo lo de
      // encima queda oculto para que el alumno lo calcule subiendo.
      for (let f = 1; f < filas.length; f++) {
        for (let c = 0; c < filas[f].length; c++) ocultarSet.add(f + '-' + c);
      }
    }

    // Se pinta de arriba a abajo (fila más alta primero) para que la forma
    // triangular salga bien en el HTML/CSS.
    const filasHtml = filas.slice().reverse().map((fila, iInv) => {
      const f = filas.length - 1 - iInv;
      const celdas = fila.map((valor, c) => {
        const oculta = ocultarSet.has(f + '-' + c);
        return oculta
          ? `<span class="piramide-celda piramide-celda-vacia"></span>`
          : `<span class="piramide-celda">${valor}</span>`;
      }).join('');
      return `<div class="piramide-fila">${celdas}</div>`;
    }).join('');

    // Casillas más anchas si el número más alto (la cúspide) tiene 4 o más cifras.
    const cifras = String(filas[filas.length - 1][0]).length;
    const claseAncha = cifras >= 5 ? ' piramide-muy-ancha' : cifras >= 4 ? ' piramide-ancha' : '';
    return `<div class="piramide-numerica${claseAncha}">${filasHtml}</div>`;
  }).filter(Boolean).join('');

  if (!bloques) return '';
  return `<div class="piramide-numerica-bloque">${bloques}</div>`;
}

// ── Laberinto de operaciones encadenadas (sentido algebraico — patrones) ──
// Blindaje (b): el código SIEMPRE calcula cada resultado intermedio
// aplicando la cadena de operaciones sobre el número inicial — Claude solo
// elige el número de inicio y la lista de operaciones (+N/-N), nunca
// escribe él mismo ningún resultado intermedio.
function renderLaberintoOperaciones(datos) {
  let laberintos = Array.isArray(datos.laberintos) ? datos.laberintos.slice(0, 3) : [];

  const bloques = laberintos.map(l => {
    const inicio = Math.round(numeroDesdeJSON(l.inicio));
    if (!Number.isFinite(inicio)) return '';

    let operaciones = Array.isArray(l.operaciones) ? l.operaciones.slice(0, 10) : [];
    operaciones = operaciones
      .map(op => String(op).trim())
      .filter(op => /^[+-]\d{1,3}$/.test(op));
    if (operaciones.length < 4) return '';

    // resultados[0] = inicio; resultados[i] = resultados[i-1] tras aplicar
    // operaciones[i-1]. Cálculo íntegro aquí, nunca confiando en Claude.
    const resultados = [inicio];
    operaciones.forEach(op => {
      resultados.push(resultados[resultados.length - 1] + parseInt(op, 10));
    });

    let ocultar = Array.isArray(l.ocultar) ? l.ocultar : null;
    const ocultarSet = new Set();
    if (ocultar) {
      ocultar.forEach(i => {
        if (Number.isInteger(i) && i >= 0 && i < resultados.length) ocultarSet.add(i);
      });
    } else {
      // Por defecto: se da el inicio, todo lo demás queda oculto.
      for (let i = 1; i < resultados.length; i++) ocultarSet.add(i);
    }

    // Layout en zigzag (efecto "laberinto"): filas de 4 casillas, dirección
    // alternada fila a fila mediante una clase CSS que invierte flex-direction.
    const PASOS_POR_FILA = 4;
    const nodos = resultados.map((valor, i) => {
      const casilla = ocultarSet.has(i)
        ? `<span class="laberinto-casilla laberinto-casilla-vacia"></span>`
        : `<span class="laberinto-casilla">${valor}</span>`;
      if (i === 0) return casilla;
      return `<span class="laberinto-flecha">${operaciones[i - 1]}</span>${casilla}`;
    });

    const filasHtml = [];
    for (let i = 0; i < nodos.length; i += PASOS_POR_FILA) {
      const filaNodos = nodos.slice(i, i + PASOS_POR_FILA);
      const filaIndex = Math.floor(i / PASOS_POR_FILA);
      const claseInvertida = filaIndex % 2 === 1 ? ' laberinto-fila-invertida' : '';
      filasHtml.push(`<div class="laberinto-fila${claseInvertida}">${filaNodos.join('')}</div>`);
    }

    return `<div class="laberinto-operaciones">${filasHtml.join('')}</div>`;
  }).filter(Boolean).join('');

  if (!bloques) return '';
  return `<div class="laberinto-operaciones-bloque">${bloques}</div>`;
}

// ── Acertijo numérico por pistas (razonamiento/lógica) ───────────────────
// Formato visual propio (camino de pistas encadenadas), distinto de
// "detective_numeros" (lista simple) aunque el contenido pedagógico sea
// parecido — se mantienen como tipos independientes (ver ROADMAP,
// Séptima ampliación). Igual que en "detective_numeros", "datos.numero" (si
// viaja) es solo para que Claude compruebe la coherencia de las pistas —
// el renderizador lo IGNORA por completo, nunca lo imprime.
function renderAcertijoNumerico(datos) {
  let acertijos = Array.isArray(datos.acertijos) ? datos.acertijos.slice(0, 4) : [];

  const bloques = acertijos.map((a, i) => {
    let pistas = Array.isArray(a.pistas) ? a.pistas.slice(0, 6) : [];
    pistas = pistas.filter(p => typeof p === 'string' && p.trim());
    if (pistas.length < 3) return '';

    const nodos = pistas.map((p, iPista) => `<div class="acertijo-nodo">
        <span class="acertijo-nodo-numero">${iPista + 1}</span>
        <span class="acertijo-nodo-texto">${escapeHtml(p.trim())}</span>
      </div>${iPista < pistas.length - 1 ? '<span class="acertijo-conector"></span>' : ''}`).join('');

    return `<div class="acertijo-numerico-caso">
      <p class="acertijo-titulo">Acertijo ${i + 1}</p>
      <div class="acertijo-camino">${nodos}</div>
      <p class="acertijo-respuesta">El número secreto es: <span class="hueco hueco-corto"></span></p>
    </div>`;
  }).filter(Boolean).join('');

  if (!bloques) return '';
  return `<div class="acertijo-numerico-bloque">${bloques}</div>`;
}


// ════════════════════════════════════════════════════════════════════════
// OCTAVA AMPLIACIÓN (22/09/2026) — fichas reales de 1º (1ª evaluación,
// "bloque_1.pdf" y "bloque_2_mate_1_1a_evaluación.pdf", mayoritariamente
// Santillana Refuerzo/Ampliación). Ver ROADMAP, Fase 3, "Octava ampliación",
// y Docs/ANALISIS_PDFS_BLOQUE1_BLOQUE2 (Project). Solo se toma el patrón
// pedagógico y el lenguaje visual — ni texto ni ilustración copiados.
//
// Criterio de blindaje de toda la tanda: siempre que la respuesta sea un
// algoritmo cerrado (contar decenas, escribir un número en letras, aplicar un
// operador, comprobar una condición...), el código lo calcula o lo verifica
// él solo y Claude se limita a elegir los números de partida.
// ════════════════════════════════════════════════════════════════════════

// Generador pseudoaleatorio determinista (misma idea que barajaDeterministaFig):
// misma entrada → misma ficha, para que la vista previa y la impresión sean
// idénticas. Nunca Math.random() en un renderer.
function crearAleatorio(semillaTexto) {
  let s = (hashTextoFig(String(semillaTexto)) % 2147483647) || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function enteroValido(valor, min, max) {
  // numeroDesdeJSON() convierte cualquier texto sin cifras en 0 — aquí eso
  // colaría un "0" inventado, así que un texto sin ningún dígito se descarta.
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'string' && !/\d/.test(valor)) return null;
  const n = Math.round(numeroDesdeJSON(valor));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

// Ejercicios de "unir con flechas": rejilla común para que la fila i de cada
// columna quede siempre a la misma altura, aunque las piezas midan distinto
// (una barrita de decenas es mucho más alta que un número en una caja).
// "columnas" es un array de columnas, cada una un array de celdas HTML.
function unirRejilla(columnas) {
  const filas = Math.max(...columnas.map(c => c.length));
  let celdas = '';
  for (let f = 0; f < filas; f++) {
    columnas.forEach((col, c) => {
      celdas += `<div class="unir-fila${c === 0 ? ' unir-fila-izq' : ''}">${col[f] || ''}</div>`;
    });
  }
  return `<div class="unir-bloque" style="grid-template-columns: repeat(${columnas.length}, max-content)">${celdas}</div>`;
}

// ── Cabecera de sección (22/09/2026) ─────────────────────────────────────
// Formato tomado de fichas reales muy cuidadas: cada ejercicio es una sección
// con marco, con el número en un círculo, un TÍTULO corto en grande ("Cuenta
// y suma") y la INSTRUCCIÓN en pequeño a la derecha. El título es opcional
// (campo "titulo" del ejercicio): si Claude no lo manda, la cabecera queda
// exactamente como antes. Se recorta a 40 caracteres por si llega una frase
// larga donde se esperaban 2-4 palabras.
function cabeceraEjercicio(numero, titulo, instruccion) {
  const tituloLimpio = typeof titulo === 'string' ? titulo.trim().slice(0, 40) : '';
  if (!tituloLimpio) {
    return `<p class="enunciado"><span class="numero-ejercicio">${numero}</span><span class="texto-enunciado">${escapeHtml(instruccion)}</span></p>`;
  }
  const textoInstruccion = String(instruccion || '').trim();
  return `<p class="enunciado enunciado-con-titulo"><span class="numero-ejercicio">${numero}</span><span class="titulo-ejercicio">${escapeHtml(tituloLimpio)}</span>${textoInstruccion ? `<span class="texto-enunciado instruccion-ejercicio">${escapeHtml(textoInstruccion)}</span>` : ''}</p>`;
}

// Casilla de respuesta redondeada (el "□" de los cuadernos), en vez de raya.
function casillaRespuesta(extraClase = '') {
  return `<span class="casilla-respuesta${extraClase ? ' ' + extraClase : ''}"></span>`;
}

// Cabecera "D | U" (o "C | D | U") en pastilla oscura, como en los cuadernos.
function cabeceraPosicional(numCifras) {
  const etiquetas = ['U', 'D', 'C', 'UM'].slice(0, numCifras).reverse();
  return `<span class="du-cabecera">${etiquetas.map(e => `<span>${e}</span>`).join('')}</span>`;
}

// ── Número en letras (algoritmo determinista, sin ambigüedad) ────────────
// Mismo criterio que numeroARomano(): Claude NUNCA escribe el número en
// letras, lo calcula siempre el código. Cubre 0-999.999 con las reglas del
// español: 16-29 en una palabra (dieciséis, veintidós, veintitrés,
// veintiséis con tilde), "cien" solo exacto, "ciento" + resto, apócope de
// "uno" ante "mil" (veintiún mil, treinta y un mil, ciento un mil).
const LETRAS_0_29 = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete',
  'veintiocho', 'veintinueve'];
const LETRAS_DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const LETRAS_CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function letrasMenorMil(n) {
  if (n < 30) return LETRAS_0_29[n];
  if (n < 100) {
    const d = Math.floor(n / 10), u = n % 10;
    return LETRAS_DECENAS[d] + (u ? ' y ' + LETRAS_0_29[u] : '');
  }
  if (n === 100) return 'cien';
  const c = Math.floor(n / 100), resto = n % 100;
  return LETRAS_CENTENAS[c] + (resto ? ' ' + letrasMenorMil(resto) : '');
}

function apocoparUno(texto) {
  if (texto.endsWith('veintiuno')) return texto.slice(0, -9) + 'veintiún';
  if (texto === 'uno' || texto.endsWith(' uno')) return texto.slice(0, -3) + 'un';
  return texto;
}

function numeroALetras(n) {
  n = Math.floor(Math.abs(n));
  if (n < 1000) return letrasMenorMil(n);
  if (n >= 1000000) return String(n);
  const miles = Math.floor(n / 1000), resto = n % 1000;
  const textoMiles = miles === 1 ? 'mil' : apocoparUno(letrasMenorMil(miles)) + ' mil';
  return textoMiles + (resto ? ' ' + letrasMenorMil(resto) : '');
}

// ── Marcos temáticos (catálogo cerrado) ──────────────────────────────────
// El recurso visual más repetido de los cuadernos reales: los números no van
// en una caja cualquiera sino dentro de vagones, casitas, hojas, globos...
// Mismo patrón que ICONOS: diccionario nombre → SVG, curado a mano. Relleno y
// trazo van por clase CSS (no inline) para que el modo B/N los pueda anular.
// "zona" es dónde queda centrado el número dentro del dibujo (en % del alto).
const MARCOS_TEMATICOS = {
  caja: { zona: 50, svg: '<rect class="marco-forma" x="4" y="6" width="72" height="58" rx="12"/>' },
  casita: { zona: 66, svg: '<path class="marco-forma" d="M6 32 L40 5 L74 32 L74 66 L6 66 Z"/><rect class="marco-detalle" x="58" y="9" width="7" height="14"/>' },
  vagon: { zona: 42, svg: '<rect class="marco-forma" x="5" y="8" width="70" height="44" rx="6"/><circle class="marco-detalle" cx="20" cy="58" r="7"/><circle class="marco-detalle" cx="60" cy="58" r="7"/><line class="marco-linea" x1="0" y1="40" x2="5" y2="40"/><line class="marco-linea" x1="75" y1="40" x2="80" y2="40"/>' },
  hoja: { zona: 50, svg: '<path class="marco-forma" d="M40 3 C70 8 80 38 40 67 C0 38 10 8 40 3 Z"/><path class="marco-linea" d="M40 67 L40 70"/>' },
  globo: { zona: 42, svg: '<ellipse class="marco-forma" cx="40" cy="30" rx="31" ry="27"/><path class="marco-linea" d="M40 57 q-5 6 0 13"/>' },
  nube: { zona: 58, svg: '<path class="marco-forma" d="M18 64 C4 64 2 46 15 43 C12 28 30 20 38 30 C42 14 66 16 64 34 C80 34 80 64 64 64 Z"/>' },
  estrella: { zona: 55, svg: '<path class="marco-forma" d="M40 3 L50 26 L76 27 L55 43 L63 68 L40 54 L17 68 L25 43 L4 27 L30 26 Z"/>' }
};
export const MARCOS_TEMATICOS_DISPONIBLES = Object.keys(MARCOS_TEMATICOS);

function marcoTematico(nombre, contenidoHtml, esHueco) {
  const marco = MARCOS_TEMATICOS[nombre] || MARCOS_TEMATICOS.caja;
  const claseNombre = MARCOS_TEMATICOS[nombre] ? nombre : 'caja';
  return `<span class="marco-tematico marco-${claseNombre}${esHueco ? ' marco-hueco' : ''}">
    <svg viewBox="0 0 80 72" width="64" height="58" aria-hidden="true">${marco.svg}</svg>
    <span class="marco-contenido" style="top:${marco.zona}%">${contenidoHtml}</span>
  </span>`;
}

// Arco de salto entre dos casillas de una serie, con la etiqueta (+2, −1...)
// encima — el mismo dibujo que ya usa recta_numerica, llevado a las series.
function arcoSalto(etiqueta) {
  return `<span class="serie-salto"><span class="serie-salto-etiqueta">${escapeHtml(etiqueta)}</span>
    <svg viewBox="0 0 40 16" width="40" height="16" aria-hidden="true"><path class="serie-salto-arco" d="M3 15 Q20 -4 37 11"/><path class="serie-salto-arco" d="M37 11 l-5 -1 M37 11 l-1 -5"/></svg></span>`;
}

// Paso constante de una serie deducido SOLO de los números visibles. Si los
// números visibles no encajan todos en una progresión aritmética, devuelve
// null y no se dibuja ningún arco (mejor sin pista que con una pista falsa).
function pasoDeSerie(numeros) {
  const visibles = numeros
    .map((n, i) => ({ i, n: n === null || n === undefined || n === '' ? null : numeroDesdeJSON(n) }))
    .filter(x => x.n !== null);
  if (visibles.length < 2) return null;
  const a = visibles[0], b = visibles[1];
  const paso = (b.n - a.n) / (b.i - a.i);
  if (!Number.isFinite(paso) || paso === 0 || !Number.isInteger(paso)) return null;
  const ok = visibles.every(x => x.n === a.n + (x.i - a.i) * paso);
  return ok ? paso : null;
}

// ── Ábaco ────────────────────────────────────────────────────────────────
// Blindaje total: el número de bolitas de cada varilla se deriva siempre de
// las cifras del propio número — Claude solo elige el número.
function svgAbaco(numero, numVarillas, conBolitas) {
  const ancho = 30 + numVarillas * 36;
  const alto = 150;
  const cifras = String(numero).padStart(numVarillas, '0').slice(-numVarillas).split('').map(Number);
  const etiquetas = ['C', 'D', 'U'].slice(3 - numVarillas);
  let partes = `<rect class="abaco-base" x="4" y="118" width="${ancho - 8}" height="14" rx="3"/>`;
  cifras.forEach((cifra, i) => {
    const x = 24 + i * 36;
    partes += `<line class="abaco-varilla" x1="${x}" y1="10" x2="${x}" y2="118"/>`;
    partes += `<text x="${x}" y="146" font-size="13" font-weight="bold" text-anchor="middle" font-family="Arial">${etiquetas[i]}</text>`;
    if (conBolitas) {
      for (let k = 0; k < cifra; k++) {
        const y = 110 - k * 11;
        partes += `<ellipse class="abaco-bolita abaco-bolita-${etiquetas[i]}" cx="${x}" cy="${y}" rx="11" ry="5.2"/>`;
      }
    }
  });
  return `<svg width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">${partes}</svg>`;
}

function renderAbaco(datos) {
  const modo = datos.modo === 'representar' ? 'representar' : 'leer';
  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 999)).filter(n => n !== null).slice(0, 4);
  if (numeros.length === 0) return '';
  const numVarillas = numeros.some(n => n >= 100) ? 3 : 2;

  const tarjetas = numeros.map(n => {
    if (modo === 'representar') {
      return `<div class="abaco-tarjeta">
        ${svgAbaco(n, numVarillas, false)}
        <span class="abaco-numero-dado">${n}</span>
      </div>`;
    }
    const respuesta = numVarillas === 3
      ? `${casillaRespuesta()} centenas, ${casillaRespuesta()} decenas y ${casillaRespuesta()} unidades`
      : `${casillaRespuesta()} decenas y ${casillaRespuesta()} unidades`;
    return `<div class="abaco-tarjeta">
      ${svgAbaco(n, numVarillas, true)}
      <div class="abaco-respuesta"><p>${respuesta}</p><p class="abaco-igual">Número: ${casillaRespuesta('casilla-ancha')}</p></div>
    </div>`;
  }).join('');
  return `<div class="abaco-bloque">${tarjetas}</div>`;
}

// ── Barritas de decena y cubitos (material base 10) ──────────────────────
// Una barrita = 10 cubitos unidos en vertical; un cubito = 1 unidad. Blindaje
// total: barras y cubitos se derivan del número (decenas / unidades).
function svgBarritasDecenas(numero) {
  const decenas = Math.floor(numero / 10), unidades = numero % 10;
  const lado = 10;
  let partes = '';
  let x = 2;
  for (let d = 0; d < decenas; d++) {
    for (let k = 0; k < 10; k++) partes += `<rect class="base10-cubo" x="${x}" y="${2 + k * lado}" width="${lado}" height="${lado}"/>`;
    x += lado + 5;
  }
  if (unidades > 0) x += 4;
  for (let u = 0; u < unidades; u++) {
    const col = Math.floor(u / 5), fila = u % 5;
    partes += `<rect class="base10-cubo base10-suelto" x="${x + col * (lado + 3)}" y="${2 + (5 + fila) * lado}" width="${lado}" height="${lado}"/>`;
  }
  const ancho = x + (unidades > 5 ? 2 : 1) * (lado + 3) + 4;
  return `<svg width="${ancho}" height="${10 * lado + 6}" viewBox="0 0 ${ancho} ${10 * lado + 6}">${partes}</svg>`;
}

function renderBarritasDecenas(datos) {
  const modo = ['dibujar', 'unir'].includes(datos.modo) ? datos.modo : 'contar';
  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 1, 99)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 4);
  if (numeros.length === 0) return '';

  if (modo === 'dibujar') {
    const tarjetas = numeros.map(n => `<div class="base10-tarjeta">
      <span class="base10-numero-dado">${n}</span>
      <div class="base10-caja-dibujo"></div>
    </div>`).join('');
    return `<div class="base10-bloque">${tarjetas}</div>`;
  }

  if (modo === 'unir' && numeros.length >= 2) {
    const orden = barajaDeterministaFig(numeros.length, hashTextoFig(numeros.join(',')));
    return unirRejilla([
      numeros.map(n => `<span class="unir-dibujo">${svgBarritasDecenas(n)}</span><span class="unir-punto"></span>`),
      orden.map(i => `<span class="unir-punto"></span>${marcoTematico('caja', `<b>${numeros[i]}</b>`)}`)
    ]);
  }

  const tarjetas = numeros.map(n => `<div class="base10-tarjeta">
    ${svgBarritasDecenas(n)}
    <div class="base10-respuesta">
      <p>${casillaRespuesta()} decena${Math.floor(n / 10) === 1 ? '' : 's'} y ${casillaRespuesta()} unidades</p>
      <p>${casillaRespuesta()} + ${casillaRespuesta()} = ${casillaRespuesta('casilla-ancha')}</p>
    </div>
  </div>`).join('');
  return `<div class="base10-bloque">${tarjetas}</div>`;
}

// ── Número en letras ─────────────────────────────────────────────────────
function lineaPauta() {
  return `<span class="linea-pauta"></span>`;
}

function renderNumeroEnLetras(datos) {
  const modo = ['a_numero', 'mixto', 'unir'].includes(datos.modo) ? datos.modo : 'a_letras';
  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 999999)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 8);
  if (numeros.length === 0) return '';

  if (modo === 'unir' && numeros.length >= 2) {
    const semilla = hashTextoFig(numeros.join('-'));
    const ordenNombres = barajaDeterministaFig(numeros.length, semilla);
    const ordenDU = barajaDeterministaFig(numeros.length, semilla + 7);
    const conDU = datos.conDecenas !== false && numeros.every(n => n < 100);
    const columnas = [
      ordenNombres.map(i => `<span class="unir-texto">${numeroALetras(numeros[i])}</span><span class="unir-punto"></span>`),
      numeros.map(n => `<span class="unir-punto"></span>${marcoTematico('caja', `<b>${n}</b>`)}${conDU ? '<span class="unir-punto"></span>' : ''}`)
    ];
    if (conDU) columnas.push(ordenDU.map(i => `<span class="unir-punto"></span><span class="unir-texto">${Math.floor(numeros[i] / 10)} D y ${numeros[i] % 10} U</span>`));
    return unirRejilla(columnas);
  }

  const filas = numeros.map((n, i) => {
    const aNumero = modo === 'a_numero' || (modo === 'mixto' && i % 2 === 1);
    if (aNumero) {
      return `<div class="letras-fila letras-fila-a-numero"><span class="letras-palabra">${numeroALetras(n)}</span><span class="letras-flecha">▶</span>${casillaRespuesta('casilla-ancha')}</div>`;
    }
    return `<div class="letras-fila"><span class="letras-numero">${n}</span><span class="letras-flecha">▶</span>${lineaPauta()}</div>`;
  }).join('');
  return `<div class="letras-bloque">${filas}</div>`;
}

// ── Anterior y posterior (números vecinos) ───────────────────────────────
function renderAnteriorPosterior(datos) {
  const modo = ['anterior', 'posterior'].includes(datos.modo) ? datos.modo : 'vecinos';
  const paso = enteroValido(datos.paso, 1, 100) || 1;
  const marco = MARCOS_TEMATICOS[datos.marco] ? datos.marco : 'casita';
  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 999999)).filter(n => n !== null)
    .filter(n => modo === 'posterior' || n - paso >= 0)
    .slice(0, 8);
  if (numeros.length === 0) return '';

  const grupos = numeros.map(n => {
    const ant = modo !== 'posterior' ? `${marcoTematico(marco, '', true)}<span class="vecino-flecha">◂</span>` : '';
    const pos = modo !== 'anterior' ? `<span class="vecino-flecha">▸</span>${marcoTematico(marco, '', true)}` : '';
    return `<div class="vecinos-grupo">${ant}${marcoTematico(marco, `<b>${n}</b>`)}${pos}</div>`;
  }).join('');
  const nota = paso !== 1 ? `<p class="vecinos-nota">De ${paso} en ${paso}</p>` : '';
  return `<div class="vecinos-bloque">${nota}${grupos}</div>`;
}

// ── Problema razonado (formato Santillana "Refuerzo") ────────────────────
// Pasos fijos: subraya la pregunta → escribe los datos y dibújalos → marca qué
// hay que averiguar y qué operación → rodea la operación correcta → frase de
// respuesta. Blindaje: las dos operaciones entre las que se elige las
// construye el código a partir de "numeros" (a+b y a−b), en un orden que
// depende del texto — así la correcta no siempre está en la misma posición.
function renderProblemaRazonado(datos) {
  const texto = escapeHtml(datos.texto);
  const nums = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 2);
  const filasDatos = (Array.isArray(datos.filasDatos) ? datos.filasDatos : []).slice(0, 3);

  const bloqueDatos = filasDatos.length
    ? filasDatos.map(f => `<div class="razonado-dato">
        <span>${escapeHtml(f.etiqueta || '')}</span>${casillaRespuesta()}<span>${escapeHtml(f.unidad || '')}</span>
        <span class="razonado-flecha">▶</span><span class="razonado-dibujo"></span>
      </div>`).join('')
    : '';

  let bloqueOperaciones = '';
  if (nums.length === 2) {
    const [a, b] = nums;
    const ops = [`${a} + ${b} =`];
    if (a >= b) ops.push(`${a} − ${b} =`);
    if (hashTextoFig(datos.texto || '') % 2 === 1) ops.reverse();
    bloqueOperaciones = `<p class="razonado-paso">Rodea la operación que tienes que hacer y calcula.</p>
      <div class="razonado-operaciones">${ops.map(o => `<span class="razonado-op">${o} ${casillaRespuesta()}</span>`).join('')}</div>`;
  }

  const frase = typeof datos.respuesta === 'string' && datos.respuesta.includes('___')
    ? escapeHtml(datos.respuesta).split('___').join('<span class="hueco hueco-corto"></span>')
    : `<span class="hueco hueco-largo"></span>`;

  return `<div class="bloque-razonado">
    <p class="razonado-texto">${texto}</p>
    ${bloqueDatos ? `<p class="razonado-paso">Escribe los datos y dibújalos.</p>${bloqueDatos}` : ''}
    <p class="razonado-paso">Vuelve a leer la pregunta. Después, piensa y marca.</p>
    <div class="razonado-marcas">
      <div><p>Hay que averiguar...</p>
        <div class="opcion-item"><span class="casilla-test"></span> el total</div>
        <div class="opcion-item"><span class="casilla-test"></span> la diferencia (lo que queda o lo que falta)</div></div>
      <div><p>Hay que...</p>
        <div class="opcion-item"><span class="casilla-test"></span> sumar</div>
        <div class="opcion-item"><span class="casilla-test"></span> restar</div></div>
    </div>
    ${bloqueOperaciones}
    <p class="razonado-solucion"><span class="etiqueta-solucion">Solución</span><span class="razonado-frase">${frase}</span></p>
  </div>`;
}

function renderProblemaInventar(datos) {
  const palabras = (Array.isArray(datos.palabras) && datos.palabras.length ? datos.palabras : ['más', 'menos']).slice(0, 3);
  const filas = palabras.map(p => `<div class="inventar-fila">
    <p>Utiliza la palabra <b>${escapeHtml(p)}</b> ▶</p>
    <div class="espacio-respuesta pauta bajo"></div>
  </div>`).join('');
  return `<div class="bloque-razonado"><p class="razonado-texto">${escapeHtml(datos.texto)}</p>${filas}</div>`;
}

// ════════════════════════ TANDA 2 ════════════════════════════════════════

// ── Casita / árbol de descomposición (number bonds) ──────────────────────
// Número de arriba = suma de las partes de abajo. Blindaje: si Claude manda
// "total" y "partes" que no cuadran, manda la suma de las partes (el total se
// recalcula siempre). Sirve para el doble (3 → 3 y 3), la mitad (8 → ? y ?
// iguales), los amigos del 10 y descomposiciones como 200 → 100 + 100.
function renderCasitaDescomposicion(datos) {
  const forma = datos.forma === 'arbol' ? 'arbol' : 'casita';
  const casitas = (Array.isArray(datos.casitas) ? datos.casitas : []).slice(0, 8).map(c => {
    const partes = (Array.isArray(c.partes) ? c.partes : []).map(p => enteroValido(p, 0, 99999)).filter(p => p !== null).slice(0, 3);
    if (partes.length < 2) return null;
    const total = partes.reduce((s, p) => s + p, 0);
    const ocultar = ['total', 'parte1', 'parte2', 'parte3'].includes(c.ocultar) ? c.ocultar : 'total';
    return { total, partes, ocultar };
  }).filter(Boolean);
  if (casitas.length === 0) return '';

  const celda = (valor, oculto) => oculto ? `<span class="casita-celda casita-celda-vacia"></span>` : `<span class="casita-celda">${valor}</span>`;
  const piezas = casitas.map(c => {
    const arriba = celda(c.total, c.ocultar === 'total');
    const abajo = c.partes.map((p, i) => celda(p, c.ocultar === `parte${i + 1}`)).join('');
    if (forma === 'arbol') {
      return `<div class="arbol-descomp"><div class="arbol-raiz">${arriba}</div>
        <svg class="arbol-ramas" viewBox="0 0 100 24" width="${c.partes.length * 46}" height="22" preserveAspectRatio="none"><path d="M50 0 L${c.partes.length === 3 ? '10 24 M50 0 L50 24 M50 0 L90 24' : '18 24 M50 0 L82 24'}"/></svg>
        <div class="arbol-partes">${abajo}</div></div>`;
    }
    return `<div class="casita-descomp"><span class="casita-tejado"></span><div class="casita-arriba">${arriba}</div><div class="casita-abajo">${abajo}</div></div>`;
  }).join('');
  return `<div class="casitas-bloque">${piezas}</div>`;
}

// ── Máquina de operador (doble, triple, mitad, +10, −2...) ───────────────
// Validación por código: la mitad solo con pares, ":" solo con divisiones
// exactas, "−" nunca por debajo de 0 — los números que no cumplen se
// descartan. El resultado nunca se imprime (es el hueco).
function parsearOperador(op) {
  const t = String(op || '').trim().toLowerCase().replace('−', '-').replace('×', 'x').replace('*', 'x').replace('÷', ':');
  if (t === 'doble') return { etiqueta: 'Doble de', aplicar: n => 2 * n, valido: () => true, palabra: true };
  if (t === 'triple') return { etiqueta: 'Triple de', aplicar: n => 3 * n, valido: () => true, palabra: true };
  if (t === 'mitad') return { etiqueta: 'Mitad de', aplicar: n => n / 2, valido: n => n % 2 === 0, palabra: true };
  const m = t.match(/^([+\-x:])\s*(\d{1,4})$/);
  if (!m) return null;
  const k = parseInt(m[2], 10);
  const simbolo = { '+': '+', '-': '−', 'x': '×', ':': ':' }[m[1]];
  const fn = { '+': n => n + k, '-': n => n - k, 'x': n => n * k, ':': n => n / k }[m[1]];
  const valido = { '+': () => true, '-': n => n - k >= 0, 'x': () => true, ':': n => k > 0 && n % k === 0 }[m[1]];
  return { etiqueta: `${simbolo}${k}`, aplicar: fn, valido, palabra: false };
}

function renderMaquinaOperador(datos) {
  const formato = datos.formato === 'tabla' ? 'tabla' : 'flechas';
  const operadores = (Array.isArray(datos.operadores) ? datos.operadores : [datos.operador])
    .map(parsearOperador).filter(Boolean).slice(0, 2);
  if (operadores.length === 0) return '';
  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 99999)).filter(n => n !== null)
    .filter(n => operadores.every(op => op.valido(n))).slice(0, 10);
  if (numeros.length === 0) return '';

  if (formato === 'tabla') {
    const op = operadores[0];
    const cabecera = numeros.map(n => `<td class="maquina-celda">${n}</td>`).join('');
    const fila = numeros.map(() => `<td class="maquina-celda maquina-celda-vacia"></td>`).join('');
    return `<table class="maquina-tabla"><tr><th class="maquina-etiqueta">Número</th>${cabecera}</tr><tr><th class="maquina-etiqueta">${escapeHtml(op.etiqueta)}</th>${fila}</tr></table>`;
  }

  const columnas = operadores.map(op => {
    const filas = numeros.map(n => `<div class="maquina-fila">
      <span class="maquina-flecha">${op.palabra ? `${escapeHtml(op.etiqueta)} ${n}` : `${n} <b>${escapeHtml(op.etiqueta)}</b>`}</span>
      ${casillaRespuesta('casilla-ancha')}
    </div>`).join('');
    return `<div class="maquina-columna">${filas}</div>`;
  }).join('');
  return `<div class="maquina-bloque">${columnas}</div>`;
}

// ── Clasificar números según una condición ───────────────────────────────
// A diferencia de detective_numeros, aquí el código SÍ puede comprobar la
// respuesta: cada condición es una regla cerrada. Las condiciones que no
// cumple ningún número de la lista se descartan (no se imprime una clave de
// color que no sirve para nada), y en modo "escribir" se reduce el número de
// casillas si no existen tantos números que cumplan todas las condiciones.
const COLORES_LAPIZ = {
  rojo: '#ef4444', azul: '#3b82f6', verde: '#22c55e', amarillo: '#facc15', naranja: '#fb923c', morado: '#a855f7', marron: '#92400e'
};

function condicionNumero(c) {
  const v = enteroValido(c.valor, 0, 99999), v2 = enteroValido(c.valor2, 0, 99999);
  switch (c.tipo) {
    case 'par': return { texto: 'Números pares', cumple: n => n % 2 === 0 };
    case 'impar': return { texto: 'Números impares', cumple: n => n % 2 === 1 };
    case 'unidades': return v === null || v > 9 ? null : { texto: `Números con ${v} unidad${v === 1 ? '' : 'es'}`, cumple: n => n % 10 === v };
    case 'decenas': return v === null || v > 9 ? null : { texto: `Números con ${v} decena${v === 1 ? '' : 's'}`, cumple: n => Math.floor(n / 10) % 10 === v };
    case 'mayor_que': return v === null ? null : { texto: `Mayores que ${v}`, cumple: n => n > v };
    case 'menor_que': return v === null ? null : { texto: `Menores que ${v}`, cumple: n => n < v };
    case 'entre': return v === null || v2 === null || v2 <= v ? null : { texto: `Entre ${v} y ${v2}`, cumple: n => n > v && n < v2 };
    case 'multiplo_de': case 'multiplo': return v === null || v < 2 ? null : { texto: `Múltiplos de ${v}`, cumple: n => n % v === 0 };
    default: return null;
  }
}

function svgLapiz(nombreColor) {
  const color = COLORES_LAPIZ[nombreColor] || '#94a3b8';
  return `<svg class="lapiz" viewBox="0 0 64 22" width="64" height="22" aria-hidden="true"><path d="M2 11 L14 3 L14 19 Z" fill="#f5deb3" stroke="#000" stroke-width="1.2"/><path d="M2 11 L6 8.3 L6 13.7 Z" fill="${color}"/><rect x="14" y="3" width="46" height="16" rx="2" fill="${color}" stroke="#000" stroke-width="1.2" class="lapiz-cuerpo"/></svg>`;
}

function renderClasificarNumeros(datos) {
  const modo = datos.modo === 'escribir' ? 'escribir' : 'rodear';

  if (modo === 'escribir') {
    const grupos = (Array.isArray(datos.grupos) ? datos.grupos : []).slice(0, 4).map(g => {
      const conds = (Array.isArray(g.condiciones) ? g.condiciones : []).map(condicionNumero).filter(Boolean);
      if (conds.length === 0) return null;
      let posibles = 0;
      for (let n = 0; n <= 9999 && posibles < 12; n++) if (conds.every(c => c.cumple(n))) posibles++;
      const cantidad = Math.min(enteroValido(g.cantidad, 1, 6) || 4, posibles);
      if (cantidad === 0) return null;
      return `<div class="clasificar-grupo"><span class="clasificar-cartel">${conds.map((c, i) => (i === 0 ? c.texto : c.texto.charAt(0).toLowerCase() + c.texto.slice(1))).join(' y ')}</span><span class="clasificar-flecha">▶</span>${Array.from({ length: cantidad }, () => casillaRespuesta('casilla-ancha')).join('')}</div>`;
    }).filter(Boolean);
    return grupos.length ? `<div class="clasificar-bloque">${grupos.join('')}</div>` : '';
  }

  const numeros = (Array.isArray(datos.numeros) ? datos.numeros : [])
    .map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 16);
  if (numeros.length === 0) return '';
  const coloresUsados = new Set();
  const condiciones = (Array.isArray(datos.condiciones) ? datos.condiciones : []).slice(0, 3).map(c => {
    const cond = condicionNumero(c);
    if (!cond || !numeros.some(cond.cumple)) return null;
    let color = COLORES_LAPIZ[c.color] ? c.color : Object.keys(COLORES_LAPIZ).find(k => !coloresUsados.has(k));
    if (coloresUsados.has(color)) color = Object.keys(COLORES_LAPIZ).find(k => !coloresUsados.has(k));
    coloresUsados.add(color);
    return { ...cond, color };
  }).filter(Boolean);
  if (condiciones.length === 0) return '';

  const aleatorio = crearAleatorio(numeros.join(','));
  const clave = condiciones.map(c => `<div class="clave-lapiz">${svgLapiz(c.color)}<span class="clave-color-nombre">${c.color}</span><span class="clave-condicion">${c.texto}</span></div>`).join('');
  const nubeNumeros = numeros.map(n => `<span class="numero-suelto" style="margin-top:${Math.round(aleatorio() * 14)}px">${n}</span>`).join('');
  return `<div class="clasificar-bloque"><div class="clave-lapices">${clave}</div><div class="mural-numeros">${nubeNumeros}</div></div>`;
}

// ── Operaciones con el mismo resultado ───────────────────────────────────
// Evaluador aritmético mínimo y cerrado (enteros, + − × :, precedencia de ×
// y : sobre + y −). Solo acepta dígitos y esos cuatro signos — cualquier otra
// cosa devuelve null y esa operación se descarta. Nunca eval().
function evaluarOperacion(texto) {
  const limpio = String(texto || '').replace(/−/g, '-').replace(/[×x*]/gi, '×').replace(/÷/g, ':').replace(/\s+/g, '');
  if (!/^\d+([+\-×:]\d+)*$/.test(limpio)) return null;
  const tokens = limpio.match(/\d+|[+\-×:]/g);
  const terminos = [];
  let actual = parseInt(tokens[0], 10);
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], n = parseInt(tokens[i + 1], 10);
    if (op === '×') actual *= n;
    else if (op === ':') { if (n === 0 || actual % n !== 0) return null; actual /= n; }
    else { terminos.push(actual); terminos.push(op); actual = n; }
  }
  terminos.push(actual);
  let resultado = terminos[0];
  for (let i = 1; i < terminos.length; i += 2) resultado = terminos[i] === '+' ? resultado + terminos[i + 1] : resultado - terminos[i + 1];
  return resultado >= 0 ? resultado : null;
}

function textoOperacion(texto) {
  return escapeHtml(String(texto).replace(/\s*([+\-−×x*:÷])\s*/g, ' $1 ').replace(/ - /g, ' − ').replace(/ [x*] /gi, ' × ').trim());
}

function renderMismoResultado(datos) {
  if (datos.modo === 'dibujos') return renderUnirDibujosSuma(datos);
  const modo = ['unir', 'diana'].includes(datos.modo) ? datos.modo : 'resultado';

  if (modo === 'diana') {
    const dianas = (Array.isArray(datos.dianas) ? datos.dianas : []).slice(0, 4).map(d => {
      const objetivo = enteroValido(d.objetivo, 0, 99999);
      const ops = (Array.isArray(d.operaciones) ? d.operaciones : []).filter(o => evaluarOperacion(o) !== null).slice(0, 4);
      if (objetivo === null || ops.length < 2 || !ops.some(o => evaluarOperacion(o) === objetivo)) return null;
      const celdas = ops.map(o => `<span class="diana-op">${textoOperacion(o)}</span>`);
      return `<div class="diana"><div class="diana-rejilla">${celdas[0] || ''}${celdas[1] || ''}<span class="diana-centro">${objetivo}</span>${celdas[2] || ''}${celdas[3] || ''}</div></div>`;
    }).filter(Boolean);
    return dianas.length ? `<div class="dianas-bloque">${dianas.join('')}</div>` : '';
  }

  let izquierda, derecha;
  if (modo === 'unir') {
    const parejas = (Array.isArray(datos.parejas) ? datos.parejas : [])
      .filter(p => Array.isArray(p) && p.length === 2)
      .filter(p => evaluarOperacion(p[0]) !== null && evaluarOperacion(p[0]) === evaluarOperacion(p[1]))
      .slice(0, 6);
    if (parejas.length < 2) return '';
    izquierda = parejas.map(p => textoOperacion(p[0]));
    derecha = parejas.map(p => textoOperacion(p[1]));
  } else {
    const vistos = new Set();
    const ops = (Array.isArray(datos.operaciones) ? datos.operaciones : []).filter(o => {
      const r = evaluarOperacion(o);
      if (r === null || vistos.has(r)) return false;
      vistos.add(r);
      return true;
    }).slice(0, 6);
    if (ops.length < 2) return '';
    izquierda = ops.map(textoOperacion);
    derecha = ops.map(o => String(evaluarOperacion(o)));
  }
  const orden = barajaDeterministaFig(derecha.length, hashTextoFig(izquierda.join('|')));
  return unirRejilla([
    izquierda.map(t => `<span class="unir-op">${t}</span><span class="unir-punto"></span>`),
    orden.map(i => `<span class="unir-punto"></span><span class="unir-op">${derecha[i]}</span>`)
  ]);
}

// ── Escena revuelta (para contar por tipos) ──────────────────────────────
// Los cuadernos reales mezclan todos los objetos en una escena para que el
// niño busque y cuente cada tipo. Se hace sin ilustraciones: iconos del
// catálogo colocados en una rejilla desordenada con un ligero desplazamiento
// y giro, todo determinista. Las cantidades salen siempre de "categorias".
function escenaRevuelta(categorias) {
  const lista = [];
  categorias.forEach(c => {
    const n = Math.max(1, Math.min(10, parseInt(c.cantidad, 10) || 1));
    for (let i = 0; i < n; i++) lista.push(c.icono);
  });
  const aleatorio = crearAleatorio(lista.join(','));
  const columnas = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(lista.length * 2))));
  const filas = Math.ceil(lista.length / columnas);
  const celdas = Array.from({ length: columnas * filas }, (_, i) => i);
  for (let i = celdas.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [celdas[i], celdas[j]] = [celdas[j], celdas[i]]; }
  const paso = 46;
  const piezas = lista.map((icono, k) => {
    const celda = celdas[k];
    const x = (celda % columnas) * paso + Math.round(aleatorio() * 10);
    const y = Math.floor(celda / columnas) * paso + Math.round(aleatorio() * 10);
    const giro = Math.round((aleatorio() - 0.5) * 30);
    return `<span class="escena-icono" style="left:${x}px; top:${y}px; transform:rotate(${giro}deg)">${renderIconos(icono, 1)}</span>`;
  }).join('');
  return `<div class="escena-revuelta" style="width:${columnas * paso + 14}px; height:${filas * paso + 14}px">${piezas}</div>`;
}

// ════════════════════════ TANDA 3 ════════════════════════════════════════

// ── Operaciones con cifras ocultas ───────────────────────────────────────
// El código calcula el resultado real y oculta cifras con dos reglas que
// garantizan que siempre tiene solución única: como mucho UNA cifra oculta
// por columna, y nunca todas las cifras de un mismo número.
function renderOperacionCifrasOcultas(datos) {
  const ops = (Array.isArray(datos.operaciones) ? datos.operaciones : []).slice(0, 5).map(op => {
    const signo = op.signo === '-' ? '-' : '+';
    const nums = (Array.isArray(op.numeros) ? op.numeros : []).map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 2);
    if (nums.length < 2) return null;
    let [a, b] = nums;
    if (signo === '-' && b > a) [a, b] = [b, a];
    const r = signo === '+' ? a + b : a - b;
    return { signo, filas: [a, b, r] };
  }).filter(Boolean);
  if (ops.length === 0) return '';
  const numOcultas = enteroValido(datos.ocultas, 1, 4) || 2;

  const bloques = ops.map(op => {
    const ancho = Math.max(...op.filas.map(n => String(n).length));
    const cifras = op.filas.map(n => String(n).padStart(ancho, ' ').split(''));
    const aleatorio = crearAleatorio(op.filas.join(op.signo));
    const columnas = Array.from({ length: ancho }, (_, i) => i);
    for (let i = columnas.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [columnas[i], columnas[j]] = [columnas[j], columnas[i]]; }
    const ocultas = new Set();
    const ocultasPorFila = [0, 0, 0];
    for (const col of columnas) {
      if (ocultas.size >= numOcultas) break;
      // Nunca se ocultan todas las cifras de un número de 2+ cifras (queda al
      // menos una de pista); en números de 1 cifra se permite ocultar esa.
      const candidatas = [0, 1, 2].filter(f => cifras[f][col] !== ' ' && ocultasPorFila[f] < Math.max(1, String(op.filas[f]).length - 1));
      if (candidatas.length === 0) continue;
      const fila = candidatas[Math.floor(aleatorio() * candidatas.length)];
      ocultas.add(`${fila}-${col}`);
      ocultasPorFila[fila]++;
    }
    const filaHtml = (f, signo) => `<div class="cifras-fila"><span class="cifras-signo">${signo}</span>${cifras[f].map((c, col) => {
      if (c === ' ') return '<span class="cifras-celda cifras-vacia"></span>';
      return ocultas.has(`${f}-${col}`) ? '<span class="cifras-celda cifras-oculta"></span>' : `<span class="cifras-celda">${c}</span>`;
    }).join('')}</div>`;
    return `<div class="cifras-operacion">${filaHtml(0, '')}${filaHtml(1, op.signo === '+' ? '+' : '−')}<div class="cifras-linea"></div>${filaHtml(2, '')}</div>`;
  }).join('');
  return `<div class="cifras-bloque">${bloques}</div>`;
}

// ── Suma agrupando sumandos (propiedad asociativa / "busca la decena") ───
function renderSumaAsociativa(datos) {
  const buscarDecena = datos.agrupar === 'decena';
  // "guia": false (02/10/2026, maestra) → sin flechas ni casilla intermedia:
  // solo la suma y el resultado, para más dificultad.
  const sinGuia = datos.guia === false;
  const sumas = (Array.isArray(datos.sumas) ? datos.sumas : []).slice(0, 6).map(s => {
    const n = (Array.isArray(s) ? s : []).map(x => enteroValido(x, 0, 999)).filter(x => x !== null);
    return n.length === 3 ? n : null;
  }).filter(Boolean);
  if (sumas.length === 0) return '';

  // Todo va en UNA rejilla de 7 columnas (n + n + n = □), así las flechas y
  // la casilla caen justo debajo de la pareja que se agrupa.
  const COL = 34;
  const piezas = sumas.map((s, idx) => {
    const fila1 = `<span class="asoc-num" style="grid-column:1">${s[0]}</span><span style="grid-column:2">+</span><span class="asoc-num" style="grid-column:3">${s[1]}</span><span style="grid-column:4">+</span><span class="asoc-num" style="grid-column:5">${s[2]}</span>`;
    if (sinGuia) {
      return `<div class="asociativa asociativa-sin-guia">${fila1}<span style="grid-column:6">=</span><span style="grid-column:7">${casillaRespuesta()}</span></div>`;
    }
    let par = 0;
    if (buscarDecena && (s[0] + s[1]) % 10 !== 0 && (s[1] + s[2]) % 10 === 0) par = 1;
    const ejemplo = datos.ejemplo === true && idx === 0;
    const parcial = s[par] + s[par + 1];
    const suelto = par === 0 ? s[2] : s[0];
    const caja = ejemplo ? `<span class="casilla-respuesta casilla-ejemplo">${parcial}</span>` : casillaRespuesta();
    const cajaFinal = ejemplo ? `<span class="casilla-respuesta casilla-ejemplo">${parcial + suelto}</span>` : casillaRespuesta();
    // Centros de columna (px) dentro de las 5 primeras columnas.
    const cx = (col) => (col - 0.5) * COL;
    const [c1, c2, cSuelto] = par === 0 ? [cx(1), cx(3), cx(5)] : [cx(3), cx(5), cx(1)];
    const medio = (c1 + c2) / 2;
    const flechas = `<svg class="asoc-flechas" style="grid-column:1 / 6" width="${COL * 5}" height="24" viewBox="0 0 ${COL * 5} 24" aria-hidden="true">
        <path d="M${c1} 2 L${medio} 18 M${c2} 2 L${medio} 18 M${cSuelto} 2 L${cSuelto} 18"/>
        <path class="asoc-punta" d="M${medio - 4} 15 L${medio} 22 L${medio + 4} 15 Z M${cSuelto - 4} 15 L${cSuelto} 22 L${cSuelto + 4} 15 Z"/>
      </svg>`;
    const fila3 = par === 0
      ? `<span class="asoc-caja" style="grid-column:1 / 4">${caja}</span><span style="grid-column:4">+</span><span class="asoc-num" style="grid-column:5">${suelto}</span>`
      : `<span class="asoc-num" style="grid-column:1">${suelto}</span><span style="grid-column:2">+</span><span class="asoc-caja" style="grid-column:3 / 6">${caja}</span>`;
    return `<div class="asociativa">
      ${fila1}
      ${flechas}
      ${fila3}<span style="grid-column:6">=</span><span style="grid-column:7">${cajaFinal}</span>
    </div>`;
  }).join('');
  return `<div class="asociativa-bloque">${piezas}</div>`;
}

// ── Camino de resultados ─────────────────────────────────────────────────
// Rejilla de números; el alumno colorea las casillas de la serie (de N en N)
// para encontrar el camino desde la salida hasta la meta. El código genera
// él solo un camino válido (solo pasos a la derecha o hacia abajo, de la
// esquina superior izquierda a la inferior derecha) y rellena el resto con
// números que NO pertenecen a la serie — nunca puede haber dos caminos.
function renderCaminoResultados(datos) {
  const paso = enteroValido(datos.paso, 1, 100) || 2;
  const inicio = enteroValido(datos.inicio, 0, 9999) ?? 0;
  let longitud = enteroValido(datos.longitud, 5, 13) || 9;
  const serie = Array.from({ length: longitud }, (_, i) => inicio + i * paso);
  const columnas = Math.ceil((longitud + 1) / 2);
  const filas = longitud + 1 - columnas;
  const aleatorio = crearAleatorio(`${inicio}-${paso}-${longitud}`);

  const movimientos = [...Array(columnas - 1).fill('R'), ...Array(filas - 1).fill('D')];
  for (let i = movimientos.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [movimientos[i], movimientos[j]] = [movimientos[j], movimientos[i]]; }
  const rejilla = Array.from({ length: filas }, () => Array(columnas).fill(null));
  let f = 0, c = 0;
  rejilla[0][0] = serie[0];
  movimientos.forEach((m, i) => { if (m === 'R') c++; else f++; rejilla[f][c] = serie[i + 1]; });

  const enSerie = new Set(serie);
  const margen = Math.max(paso * 2, 10);
  const minimo = Math.max(0, inicio - margen), maximo = serie[serie.length - 1] + margen;
  for (let fi = 0; fi < filas; fi++) for (let co = 0; co < columnas; co++) {
    if (rejilla[fi][co] !== null) continue;
    let n, intentos = 0;
    // Con paso > 1 se excluye toda la progresión (también antes y después del
    // camino), para que un distractor nunca parezca la continuación válida.
    const prohibido = x => enSerie.has(x) || (paso > 1 && (x - inicio) % paso === 0);
    do { n = minimo + Math.floor(aleatorio() * (maximo - minimo + 1)); intentos++; } while (prohibido(n) && intentos < 80);
    if (prohibido(n)) n = inicio + 1 + ((fi * columnas + co) % (paso > 1 ? paso - 1 : 1)) + paso * (fi + co);
    if (prohibido(n)) n = maximo + 1 + fi + co;
    rejilla[fi][co] = n;
  }
  const iconoMeta = ICONOS[datos.iconoMeta] ? datos.iconoMeta : 'estrella';
  const celdas = rejilla.map(fila => `<div class="camino-fila">${fila.map(n => `<span class="camino-celda">${n}</span>`).join('')}</div>`).join('');
  return `<div class="camino-bloque">
    <span class="camino-salida">SALIDA ▶</span>
    <div class="camino-rejilla">${celdas}</div>
    <span class="camino-meta">▶ ${renderIconos(iconoMeta, 1)}</span>
  </div>`;
}

// ── Pictograma (modo de grafico_barras) ──────────────────────────────────
// Cada icono vale "valorIcono" unidades. Si un valor no es múltiplo exacto,
// se redondea al múltiplo más cercano ANTES de dibujar: en este modo el
// dibujo es el dato (el enunciado pide leerlo), así que dibujo y clave
// siempre cuadran entre sí.
// Preguntas sobre un gráfico (02/10/2026, maestra): cada una en su línea,
// con un punto gordo delante y una raya detrás para escribir la respuesta.
function listaPreguntas(preguntas) {
  const lista = (Array.isArray(preguntas) ? preguntas : [])
    .map(p => String(p || '').trim()).filter(Boolean).slice(0, 6);
  if (lista.length === 0) return '';
  return `<ul class="preguntas-lista">${lista.map(p =>
    `<li><span class="pregunta-texto">${escapeHtml(p)}</span><span class="pregunta-raya"></span></li>`).join('')}</ul>`;
}

function renderPictograma(datos) {
  const categorias = (Array.isArray(datos.categorias) ? datos.categorias : []).slice(0, 6);
  if (categorias.length === 0) return '';
  const valorIcono = enteroValido(datos.valorIcono, 1, 100) || 1;
  const icono = ICONOS[datos.icono] ? datos.icono : 'estrella';
  const filas = categorias.map(c => {
    const cuantos = Math.max(0, Math.min(10, Math.round(numeroDesdeJSON(c.valor) / valorIcono)));
    return `<tr><th class="picto-etiqueta">${escapeHtml(c.etiqueta)}</th><td class="picto-iconos">${cuantos ? renderIconos(icono, cuantos) : ''}</td></tr>`;
  }).join('');
  return `<div class="pictograma-bloque">
    <table class="pictograma">${filas}</table>
    <p class="picto-clave">${renderIconos(icono, 1)} <span>= ${valorIcono}</span></p>
    ${listaPreguntas(datos.preguntas)}
  </div>`;
}

// ── Hora en palabras y reloj digital (modos de reloj_analogico) ──────────
function horaEnPalabras(hora, minuto) {
  const h = ((hora % 12) + 12) % 12 || 12;
  const siguiente = (h % 12) + 1;
  const nombreHora = x => (x === 1 ? 'la una' : 'las ' + numeroALetras(x));
  if (minuto === 0) return `${nombreHora(h)} en punto`;
  if (minuto === 15) return `${nombreHora(h)} y cuarto`;
  if (minuto === 30) return `${nombreHora(h)} y media`;
  if (minuto === 45) return `${nombreHora(siguiente)} menos cuarto`;
  if (minuto < 30) return `${nombreHora(h)} y ${numeroALetras(minuto)}`;
  return `${nombreHora(siguiente)} menos ${numeroALetras(60 - minuto)}`;
}

function relojDigital(hora, minuto, vacio) {
  if (vacio) return `<span class="reloj-digital"><span class="rd-hueco"></span><span class="rd-puntos">:</span><span class="rd-hueco"></span></span>`;
  const h = ((hora % 12) + 12) % 12 || 12;
  return `<span class="reloj-digital"><span class="rd-cifras">${String(h).padStart(2, '0')}</span><span class="rd-puntos">:</span><span class="rd-cifras">${String(minuto).padStart(2, '0')}</span></span>`;
}

// ── Estimar capacidad (modo de medir_capacidad) ──────────────────────────
// Catálogo cerrado de recipientes con su clase de capacidad YA decidida en
// código ("menos" o "más" de 1 litro) — por eso Claude solo elige nombres:
// la respuesta correcta es un dato del catálogo, no algo que el modelo
// pueda equivocar. Solo recipientes sin ambigüedad (nada de jarras o
// botellas que según el tamaño puedan ser de 1 litro justo).
const RECIPIENTES_ESTIMAR = {
  cuchara: { clase: 'menos', svg: '<ellipse cx="18" cy="16" rx="11" ry="8"/><path d="M28 20 L54 44"/>' },
  vaso: { clase: 'menos', svg: '<path d="M18 10 L42 10 L38 52 L22 52 Z"/><path d="M20 26 L40 26"/>' },
  taza: { clase: 'menos', svg: '<path d="M12 18 L42 18 L40 48 Q27 54 14 48 Z"/><path d="M42 24 Q54 26 50 36 Q48 42 41 40"/>' },
  yogur: { clase: 'menos', svg: '<path d="M18 16 L42 16 L39 48 L21 48 Z"/><rect x="16" y="11" width="28" height="5" rx="1"/>' },
  cubo: { clase: 'mas', svg: '<path d="M10 20 L50 20 L45 54 L15 54 Z"/><path d="M10 20 Q30 0 50 20"/>' },
  banera: { clase: 'mas', archivo: 'banyera', svg: '<path d="M4 26 L56 26 L52 44 Q30 50 8 44 Z"/><path d="M12 46 L10 54 M48 46 L50 54 M48 26 L48 12 L54 12"/>' },
  regadera: { clase: 'mas', svg: '<path d="M14 22 L38 22 L38 52 L14 52 Z"/><path d="M38 30 L56 16 M52 12 L58 20"/><path d="M14 28 Q4 28 6 40 Q8 46 14 46"/>' },
  garrafa: { clase: 'mas', svg: '<path d="M20 14 L36 14 L36 20 Q48 22 48 32 L48 54 L10 54 L10 32 Q10 22 20 20 Z"/><rect x="22" y="8" width="12" height="6"/><path d="M40 26 Q46 26 44 36"/>' }
};
// Recipientes que solo existen como dibujo del banco (02/10/2026): no tienen
// SVG de reserva, así que solo se ofrecen si su PNG está en la carpeta.
Object.assign(RECIPIENTES_ESTIMAR, {
  biberon: { clase: 'menos' }, lata: { clase: 'menos' }, copa: { clase: 'menos' }, frasco: { clase: 'menos' },
  olla: { clase: 'mas' }, fregadero: { clase: 'mas' }, piscina: { clase: 'mas' }
});
function recipienteDisponible(n) {
  const r = RECIPIENTES_ESTIMAR[n];
  return !!r && (!!r.svg || IMAGENES_BN.has(r.archivo || n) || IMAGENES_COLOR.has(r.archivo || n));
}
export const RECIPIENTES_ESTIMAR_DISPONIBLES = Object.keys(RECIPIENTES_ESTIMAR).filter(recipienteDisponible);

function renderEstimarCapacidad(datos) {
  const nombres = (Array.isArray(datos.recipientes) ? datos.recipientes : [])
    .map(r => (typeof r === 'string' ? r : r?.nombre)).filter(n => recipienteDisponible(n))
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 6);
  if (nombres.length < 2) return '';
  const tarjetas = nombres.map(n => {
    const r = RECIPIENTES_ESTIMAR[n];
    // Dibujo del banco si lo hay; si no, el SVG esquemático de siempre.
    const dibujo = imagenBanco(r.archivo || n, n, 'estimar-img')
      || `<svg viewBox="0 0 60 60" width="64" height="64" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${r.svg}</svg>`;
    return `<div class="estimar-tarjeta">
    <div class="estimar-dibujo">${dibujo}</div>
    <div class="opcion-item"><span class="casilla-test"></span> Más de 1 litro</div>
    <div class="opcion-item"><span class="casilla-test"></span> Menos de 1 litro</div>
  </div>`;
  }).join('');
  return `<div class="estimar-bloque">${tarjetas}</div>`;
}

// ── Colocar en columna (modo de operacion_vertical) ──────────────────────
// Suma/resta escrita en horizontal + rejilla vacía con cabecera D | U para
// que el alumno la coloque él mismo en columna y la resuelva. El número de
// columnas se deriva del número más largo (incluido el resultado real, para
// dejar sitio a la llevada) — nunca se imprime ninguna cifra en la rejilla.
function renderColocarEnColumna(datos) {
  // "cuadricula" (02/10/2026, maestra): un paso más de dificultad — en vez de
  // casillas ya preparadas con D | U, signo y raya, un solo cuadrado de
  // cuadrícula vacío donde el niño lo coloca todo él solo.
  const enCuadricula = datos.colocar === 'cuadricula' || datos.cuadricula === true;
  const ops = (Array.isArray(datos.operaciones) ? datos.operaciones : []).slice(0, 4).map(op => {
    const signo = op.signo === '-' ? '-' : '+';
    const nums = (Array.isArray(op.numeros) ? op.numeros : []).map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, signo === '-' ? 2 : 4);
    if (nums.length < 2) return null;
    if (signo === '-' && nums[1] > nums[0]) nums.reverse();
    const resultado = signo === '+' ? nums.reduce((s, n) => s + n, 0) : nums[0] - nums[1];
    return { signo, nums, resultado };
  }).filter(Boolean);
  if (ops.length === 0) return '';
  const bloques = ops.map(op => {
    const cifras = Math.max(2, ...op.nums.map(n => String(n).length), String(op.resultado).length);
    const texto = op.nums.join(op.signo === '+' ? ' + ' : ' − ') + ' =';
    if (enCuadricula) {
      const lado = Math.max(5, cifras + 2, op.nums.length + 2);
      const celdas = '<span class="cuadricula-celda"></span>'.repeat(lado * lado);
      return `<div class="colocar-operacion">
      <p class="colocar-texto">${texto}</p>
      <div class="colocar-cuadricula" style="grid-template-columns:repeat(${lado}, 28px)">${celdas}</div>
    </div>`;
    }
    const fila = () => `<div class="colocar-fila">${Array.from({ length: cifras }, () => '<span class="colocar-celda"></span>').join('')}</div>`;
    const filasNumeros = op.nums.map((_, i) => i === op.nums.length - 1
      ? `<div class="colocar-con-signo"><span class="colocar-signo">${op.signo === '+' ? '+' : '−'}</span>${fila()}</div>`
      : `<div class="colocar-con-signo"><span class="colocar-signo"></span>${fila()}</div>`).join('');
    return `<div class="colocar-operacion">
      <p class="colocar-texto">${texto}</p>
      <div class="colocar-rejilla"><div class="colocar-con-signo"><span class="colocar-signo"></span>${cabeceraPosicional(cifras)}</div>${filasNumeros}<div class="colocar-linea"></div><div class="colocar-con-signo"><span class="colocar-signo"></span>${fila()}</div></div>
    </div>`;
  }).join('');
  return `<div class="colocar-bloque">${bloques}</div>`;
}

// ── Suma o resta con dibujos en horizontal (22/09/2026) ──────────────────
// "🍎🍎 + 🍎🍎🍎 = □" dentro de una tarjeta, en rejilla de dos columnas. En la
// resta se dibuja SOLO el minuendo, sin tachar nada: tachar los objetos que
// se quitan es justo el trabajo del niño (corrección del usuario, 22/09/2026 —
// la primera versión los tachaba el código y eso le daba la respuesta hecha).
// Mismo modelo que la resta ilustrada de operacion_vertical.
// Un ejercicio lleva un solo tipo de operación: si Claude mezcla sumas y
// restas, se quedan solo las del signo de la primera — así el título del
// ejercicio ("Cuenta y suma", "Tacha y resta") nunca contradice lo que hay
// dentro. Blindaje total: las cantidades de dibujos salen siempre de
// "numeros" — Claude solo elige números e iconos.
function renderOperacionDibujos(datos) {
  const ops = (Array.isArray(datos.operaciones) ? datos.operaciones : []).slice(0, 6).map(op => {
    const signo = op.signo === '-' ? '-' : '+';
    const nums = (Array.isArray(op.numeros) ? op.numeros : []).map(n => enteroValido(n, 0, 10)).filter(n => n !== null).slice(0, 2);
    if (nums.length < 2) return null;
    if (signo === '-' && nums[1] > nums[0]) return null;
    if (signo === '+' && nums[0] + nums[1] === 0) return null;
    const icono1 = ICONOS[op.icono] ? op.icono : 'estrella';
    const icono2 = ICONOS[op.icono2] ? op.icono2 : icono1;
    return { signo, a: nums[0], b: nums[1], icono1, icono2 };
  }).filter(Boolean);
  if (ops.length === 0) return '';
  const opsMismoSigno = ops.filter(op => op.signo === ops[0].signo);

  const grupo = (icono, n) => n > 0 ? `<span class="od-grupo">${renderIconos(icono, n)}</span>` : '';
  const tarjetas = opsMismoSigno.map(op => {
    if (op.signo === '-') {
      return `<div class="od-tarjeta od-resta${op.a > 6 ? ' od-compacta' : ''}"><span class="od-grupo">${op.a > 0 ? renderIconos(op.icono1, op.a) : ''}</span>
        <span class="od-texto">${op.a} − ${op.b} = ${casillaRespuesta('casilla-grande')}</span></div>`;
    }
    // Con 6 o más dibujos en total se usan iconos más pequeños para que la
    // suma completa (dibujos + casilla) quepa en una sola línea de la tarjeta.
    return `<div class="od-tarjeta${op.a + op.b >= 6 ? ' od-compacta' : ''}">${grupo(op.icono1, op.a)}<span class="od-signo">+</span>${grupo(op.icono2, op.b)}<span class="od-signo">=</span>${casillaRespuesta('casilla-grande')}</div>`;
  }).join('');
  return `<div class="od-bloque">${tarjetas}</div>`;
}

// Modo "dibujos" de mismo_resultado: grupos de dibujos a la izquierda (dos
// montones separados) y sumas desordenadas a la derecha. Los montones los
// dibuja el código a partir de la propia suma — no pueden no coincidir.
// Se descartan sumas repetidas o con los sumandos cambiados de orden (2 + 3
// y 3 + 2 tendrían el mismo dibujo si el icono fuera igual).
function renderUnirDibujosSuma(datos) {
  const vistos = new Set();
  const iconos = Array.isArray(datos.iconos) ? datos.iconos : [];
  const filas = (Array.isArray(datos.operaciones) ? datos.operaciones : []).map((texto, i) => {
    const m = String(texto || '').match(/^\s*(\d{1,2})\s*\+\s*(\d{1,2})\s*$/);
    if (!m) return null;
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    if (a < 1 || b < 1 || a > 9 || b > 9) return null;
    const clave = [a, b].sort().join('+');
    if (vistos.has(clave)) return null;
    vistos.add(clave);
    return { a, b, icono: ICONOS[iconos[i]] ? iconos[i] : 'estrella' };
  }).filter(Boolean).slice(0, 5);
  if (filas.length < 2) return '';
  const orden = barajaDeterministaFig(filas.length, hashTextoFig(filas.map(f => `${f.a}+${f.b}`).join('|')));
  return unirRejilla([
    filas.map(f => `<span class="od-montones"><span class="od-grupo">${renderIconos(f.icono, f.a)}</span><span class="od-grupo">${renderIconos(f.icono, f.b)}</span></span><span class="unir-punto"></span>`),
    orden.map(i => `<span class="unir-punto"></span><span class="unir-op">${filas[i].a} + ${filas[i].b}</span>`)
  ]);
}


// ═══════════════════════════════════════════════════════════════════════
// NOVENA AMPLIACIÓN (02/10/2026) — cuadernos de 1º y 2º (refuerzo y
// ampliación de 2º, cuadernos de actividades de 1º y 2º, fichas de trazo).
// Solo se tomó el FORMATO de cada ejercicio: ni textos ni dibujos.
// Mismo criterio de blindaje que el resto del fichero: Claude elige los
// números de partida y el código calcula, dibuja y descarta lo incoherente.
// ═══════════════════════════════════════════════════════════════════════

function lista(valor) { return Array.isArray(valor) ? valor : []; }
function iconoValido(nombre, porDefecto = 'estrella') { return ICONOS[nombre] ? nombre : porDefecto; }
function barajar(arr, aleatorio) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// "Respuesta: □ flores." — casilla y unidad ya escrita, en vez de una raya.
function respuestaConUnidad(unidad) {
  const u = String(unidad || '').trim().slice(0, 30);
  return `<p class="respuesta-unidad">Respuesta: ${casillaRespuesta('casilla-ancha')}${u ? ` <span>${escapeHtml(u)}.</span>` : ''}</p>`;
}
function fraseOperacion(signo) {
  return `<p class="frase-numerica">${casillaRespuesta()} <span>${signo}</span> ${casillaRespuesta()} <span>=</span> ${casillaRespuesta()}</p>`;
}

// ── Fracciones ───────────────────────────────────────────────────────────
// El código dibuja la figura partida en "denominador" partes IGUALES y, si
// toca, sombrea "numerador". Claude solo da los dos números.
const NOMBRE_DENOMINADOR = { 2: 'medio', 3: 'tercio', 4: 'cuarto', 5: 'quinto', 6: 'sexto', 7: 'séptimo', 8: 'octavo', 9: 'noveno', 10: 'décimo', 11: 'onceavo', 12: 'doceavo' };
function nombreFraccion(num, den) {
  const base = NOMBRE_DENOMINADOR[den];
  if (!base) return '';
  const cuantos = num === 1 ? 'un' : numeroALetras(num);
  return `${cuantos} ${base}${num === 1 ? '' : 's'}`;
}
function svgFraccion(figura, den, sombreadas) {
  const clase = i => (i < sombreadas ? 'frac-parte frac-llena' : 'frac-parte');
  if (figura === 'circulo') {
    const cx = 45, cy = 45, r = 40;
    const partes = Array.from({ length: den }, (_, i) => {
      const a0 = (i / den) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2;
      const p = a => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
      return `<path class="${clase(i)}" d="M${cx} ${cy} L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z"/>`;
    }).join('');
    return `<svg width="90" height="90" viewBox="0 0 90 90">${partes}</svg>`;
  }
  if (figura === 'cuadrado' && (den === 4 || den === 9)) {
    const n = Math.sqrt(den), lado = 80 / n;
    const partes = Array.from({ length: den }, (_, i) =>
      `<rect class="${clase(i)}" x="${5 + (i % n) * lado}" y="${5 + Math.floor(i / n) * lado}" width="${lado}" height="${lado}"/>`).join('');
    return `<svg width="90" height="90" viewBox="0 0 90 90">${partes}</svg>`;
  }
  const ancho = figura === 'cuadrado' ? 80 : 150, alto = figura === 'cuadrado' ? 80 : 44;
  const w = ancho / den;
  const partes = Array.from({ length: den }, (_, i) =>
    `<rect class="${clase(i)}" x="${(5 + i * w).toFixed(2)}" y="5" width="${w.toFixed(2)}" height="${alto}"/>`).join('');
  return `<svg width="${ancho + 10}" height="${alto + 10}" viewBox="0 0 ${ancho + 10} ${alto + 10}">${partes}</svg>`;
}
function htmlFraccion(num, den) {
  return `<span class="frac"><span class="frac-num">${num}</span><span class="frac-den">${den}</span></span>`;
}
function renderFracciones(datos) {
  const modo = datos.modo === 'escribir' ? 'escribir' : 'colorear';
  const figuras = ['circulo', 'rectangulo', 'cuadrado'];
  const items = lista(datos.fracciones).map((f, i) => {
    const den = enteroValido(f && f.denominador, 2, 12);
    const num = enteroValido(f && f.numerador, 1, 12);
    if (den === null || num === null || num > den) return null;
    const figura = figuras.includes(f.figura) ? f.figura : figuras.includes(datos.figura) ? datos.figura : figuras[i % 2];
    return { num, den, figura };
  }).filter(Boolean).slice(0, 8);
  if (items.length === 0) return '';
  const tarjetas = items.map(({ num, den, figura }) => modo === 'colorear'
    ? `<div class="frac-tarjeta">${svgFraccion(figura, den, 0)}<p class="frac-pie">${htmlFraccion(num, den)}<span class="frac-nombre">${nombreFraccion(num, den)}</span></p></div>`
    : `<div class="frac-tarjeta">${svgFraccion(figura, den, num)}<p class="frac-pie"><span class="frac"><span class="frac-num">${casillaRespuesta()}</span><span class="frac-den">${casillaRespuesta()}</span></span></p></div>`
  ).join('');
  return `<div class="frac-bloque">${tarjetas}</div>`;
}

// ── Suma repetida ↔ multiplicación ───────────────────────────────────────
// Grupos iguales de dibujos; debajo "Suma" (tantas casillas como grupos) y
// "Multiplicación". Los dibujos salen de grupos × porGrupo.
function renderSumaRepetida(datos) {
  const items = lista(datos.grupos).map(g => {
    const grupos = enteroValido(g && g.grupos, 2, 5), porGrupo = enteroValido(g && g.porGrupo, 1, 6);
    if (grupos === null || porGrupo === null) return null;
    return { grupos, porGrupo, icono: iconoValido(g.icono) };
  }).filter(Boolean).slice(0, 4);
  if (items.length === 0) return '';
  return `<div class="sr-bloque">${items.map(({ grupos, porGrupo, icono }) => {
    const cajas = Array.from({ length: grupos }, () => `<span class="sr-grupo">${htmlIcono(icono).repeat(porGrupo)}</span>`).join('');
    const suma = Array.from({ length: grupos }, () => casillaRespuesta()).join(' <span>+</span> ');
    return `<div class="sr-item">
      <div class="sr-grupos">${cajas}</div>
      <p class="sr-linea"><b>Suma:</b> ${suma} <span>=</span> ${casillaRespuesta()}</p>
      <p class="sr-linea"><b>Multiplicación:</b> ${casillaRespuesta()} <span>×</span> ${casillaRespuesta()} <span>=</span> ${casillaRespuesta()}</p>
    </div>`;
  }).join('')}</div>`;
}

// ── Problema con diagrama de barras / con frase numérica ─────────────────
// "barras": el código dibuja la barra proporcional a los dos números del
// problema, con el dato que se busca marcado con "?". Tres esquemas:
// juntar (total desconocido), quitar (queda desconocido) y comparar
// (diferencia desconocida). El signo de la frase numérica lo pone el código.
function llave(x1, x2, y, arriba) {
  const d = arriba ? -6 : 6;
  return `<path class="barra-llave" d="M${x1} ${y} v${d} H${x2} v${-d}"/>`;
}
function renderProblemaBarras(datos) {
  const esquema = ['quitar', 'comparar'].includes(datos.esquema) ? datos.esquema : 'juntar';
  let [a, b] = lista(datos.numeros).map(n => enteroValido(n, 1, 9999)).filter(n => n !== null);
  if (a === undefined || b === undefined) return '';
  const et = lista(datos.etiquetas).map(e => escapeHtml(String(e || '').slice(0, 18)));
  // En "comparar" las etiquetas van con su número: si se ordenan los números, también ellas.
  if (esquema !== 'juntar' && b > a) { [a, b] = [b, a]; if (esquema === 'comparar') [et[0], et[1]] = [et[1], et[0]]; }
  if (esquema !== 'juntar' && a === b) return '';
  const X = 70, W = 300, H = 24;
  const txt = (x, y, t, clase = '') => `<text class="barra-texto ${clase}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
  let svg;
  if (esquema === 'comparar') {
    const wb = Math.max(W * 0.2, W * b / a);
    svg = `<svg width="${X + W + 16}" height="92" viewBox="0 0 ${X + W + 16} 92">
      <text class="barra-texto" x="${X - 6}" y="27" text-anchor="end">${et[0] || ''}</text>
      <rect class="barra barra-gris" x="${X}" y="10" width="${W}" height="${H}"/>${txt(X + W / 2, 27, a)}
      <text class="barra-texto" x="${X - 6}" y="67" text-anchor="end">${et[1] || ''}</text>
      <rect class="barra" x="${X}" y="50" width="${wb}" height="${H}"/>${txt(X + wb / 2, 67, b)}
      <rect class="barra barra-hueco" x="${X + wb}" y="50" width="${W - wb}" height="${H}"/>${txt(X + wb + (W - wb) / 2, 67, '?', 'barra-incognita')}
    </svg>`;
  } else {
    const total = esquema === 'juntar' ? a + b : a;
    const izq = esquema === 'juntar' ? a : a - b, der = b;
    const wi = Math.min(W * 0.78, Math.max(W * 0.22, W * izq / total));
    const eti = esquema === 'juntar' ? [String(a), String(b), '?'] : ['?', String(b), String(a)];
    svg = `<svg width="${X + W + 16}" height="100" viewBox="0 0 ${X + W + 16} 100">
      ${llave(X, X + W, 26, true)}${txt(X + W / 2, 14, eti[2], eti[2] === '?' ? 'barra-incognita' : '')}
      <rect class="barra barra-gris" x="${X}" y="30" width="${wi}" height="${H}"/>
      <rect class="barra" x="${X + wi}" y="30" width="${W - wi}" height="${H}"/>
      ${llave(X, X + wi - 2, 58, false)}${llave(X + wi + 2, X + W, 58, false)}
      ${txt(X + wi / 2, 80, eti[0], eti[0] === '?' ? 'barra-incognita' : '')}${txt(X + wi + (W - wi) / 2, 80, eti[1])}
      ${txt(X + wi / 2, 95, et[0] || '', 'barra-etiqueta')}${txt(X + wi + (W - wi) / 2, 95, et[1] || '', 'barra-etiqueta')}
    </svg>`;
  }
  return `<div class="problema-barras">
    <p class="razonado-texto">${escapeHtml(datos.texto)}</p>
    <div class="barras-diagrama">${svg}</div>
    ${fraseOperacion(esquema === 'juntar' ? '+' : '−')}
    ${respuestaConUnidad(datos.unidad)}
  </div>`;
}
function renderProblemaFrase(datos) {
  return `<div class="problema-barras">
    <p class="razonado-texto">${escapeHtml(datos.texto)}</p>
    ${fraseOperacion(datos.signo === '-' || datos.signo === '−' ? '−' : '+')}
    ${respuestaConUnidad(datos.unidad)}
  </div>`;
}

// ── Ordinales ────────────────────────────────────────────────────────────
// Las palabras (tercero, duodécimo...) las escribe SIEMPRE el código.
const ORDINALES = ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo',
  'undécimo', 'duodécimo', 'decimotercero', 'decimocuarto', 'decimoquinto', 'decimosexto', 'decimoséptimo', 'decimoctavo', 'decimonoveno', 'vigésimo'];
function renderOrdinales(datos) {
  const modo = ['unir', 'escribir'].includes(datos.modo) ? datos.modo : 'rodear';
  if (modo === 'rodear') {
    const cantidad = enteroValido(datos.cantidad, 4, 10) || 6;
    const icono = iconoValido(datos.icono, 'coche');
    const filas = lista(datos.ordenes).map(o => {
      const pos = enteroValido(o && o.posicion, 1, cantidad);
      if (pos === null) return null;
      const desde = o.desde === 'derecha' ? 'derecha' : 'izquierda';
      const texto = o.tipo === 'cardinal'
        ? (pos === 1 ? `Rodea <b>1</b> empezando por la ${desde}.` : `Rodea los <b>${pos}</b> primeros empezando por la ${desde}.`)
        : `Rodea solo el <b>${pos}.º</b> empezando por la ${desde}.`;
      return `<div class="ord-fila"><p class="ord-orden">${texto}</p><div class="ord-iconos">${htmlIcono(icono).repeat(cantidad)}</div></div>`;
    }).filter(Boolean).slice(0, 5);
    return filas.length ? `<div class="ord-bloque">${filas.join('')}</div>` : '';
  }
  const numeros = lista(datos.numeros).map(n => enteroValido(n, 1, 20)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 8);
  if (numeros.length < 2) return '';
  if (modo === 'unir') {
    const orden = barajaDeterministaFig(numeros.length, hashTextoFig('ord' + numeros.join(',')));
    return unirRejilla([
      numeros.map(n => `${marcoTematico('caja', `<b>${n}.º</b>`)}<span class="unir-punto"></span>`),
      orden.map(i => `<span class="unir-punto"></span><span class="unir-texto">${ORDINALES[numeros[i]]}</span>`)
    ]);
  }
  const filas = numeros.map((n, i) => i % 2 === 1 && datos.sentido !== 'a_letras'
    ? `<div class="letras-fila letras-fila-a-numero"><span class="letras-palabra">${ORDINALES[n]}</span><span class="letras-flecha">▶</span>${casillaRespuesta('casilla-ancha')}</div>`
    : `<div class="letras-fila"><span class="letras-numero">${n}.º</span><span class="letras-flecha">▶</span>${lineaPauta()}</div>`).join('');
  return `<div class="letras-bloque">${filas}</div>`;
}

// ── Calendario ───────────────────────────────────────────────────────────
// "mes": el código dibuja el mes REAL (en qué día cae el 1, cuántos días
// tiene) y, si Claude no manda preguntas, pone unas propias sobre ese mes.
// "semana": los siete días desordenados para numerarlos. "meses": los doce
// meses con algunos en blanco.
const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function renderCalendario(datos) {
  const modo = ['semana', 'meses'].includes(datos.modo) ? datos.modo : 'mes';
  if (modo === 'semana') {
    const orden = barajaDeterministaFig(7, hashTextoFig('semana' + (datos.semilla || '')));
    return `<div class="cal-semana">${orden.map(i => `<div class="cal-dia"><span>${DIAS_SEMANA[i]}</span>${casillaRespuesta()}</div>`).join('')}</div>`;
  }
  if (modo === 'meses') {
    const huecos = enteroValido(datos.huecos, 2, 8) || 5;
    const aleatorio = crearAleatorio('meses' + huecos + (datos.semilla || ''));
    const ocultos = new Set(barajar(MESES.map((_, i) => i), aleatorio).slice(0, huecos));
    return `<div class="cal-meses">${MESES.map((m, i) => `<span class="cal-mes${ocultos.has(i) ? ' cal-mes-hueco' : ''}"><i>${i + 1}</i>${ocultos.has(i) ? '' : m}</span>`).join('')}</div>`;
  }
  const mes = enteroValido(datos.mes, 1, 12) || 1;
  const anio = enteroValido(datos.anio, 2000, 2100) || new Date().getFullYear();
  const diasMes = new Date(anio, mes, 0).getDate();
  const primero = (new Date(anio, mes - 1, 1).getDay() + 6) % 7; // 0 = lunes
  const celdas = [...Array(primero).fill(''), ...Array.from({ length: diasMes }, (_, i) => i + 1)];
  while (celdas.length % 7) celdas.push('');
  let filas = '';
  for (let i = 0; i < celdas.length; i += 7) filas += `<tr>${celdas.slice(i, i + 7).map(d => `<td>${d}</td>`).join('')}</tr>`;
  let preguntas = lista(datos.preguntas).map(p => String(p || '').trim()).filter(Boolean);
  if (preguntas.length === 0) {
    const aleatorio = crearAleatorio(`cal${mes}-${anio}`);
    const dia = 2 + Math.floor(aleatorio() * (diasMes - 2));
    const ds1 = Math.floor(aleatorio() * 7), ds2 = (ds1 + 3) % 7;
    const plural = d => (/s$/.test(d) ? d : d + 's');
    preguntas = [
      `¿Qué día de la semana es el día ${dia}?`,
      `¿Cuántos ${plural(DIAS_SEMANA[ds1])} tiene este mes?`,
      `¿Qué día del mes es el primer ${DIAS_SEMANA[ds2]}?`,
      '¿Cuántos días tiene este mes?'
    ];
  }
  return `<div class="cal-bloque">
    <table class="cal-tabla"><caption>${MESES[mes - 1]} ${anio}</caption>
      <thead><tr>${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<th>${d}</th>`).join('')}</tr></thead>
      <tbody>${filas}</tbody></table>
    ${listaPreguntas(preguntas)}
  </div>`;
}

// ── Redondeo (aproximar a la decena, centena o millar) ───────────────────
// El código calcula entre qué dos números redondos está cada número y dibuja
// la recta con el número en su sitio. La respuesta queda en blanco.
function renderRedondeo(datos) {
  const base = datos.a === 'centena' ? 100 : datos.a === 'millar' ? 1000 : 10;
  const nombre = base === 10 ? 'decena' : base === 100 ? 'centena' : 'unidad de millar';
  const conGuia = datos.guia !== false;
  const numeros = lista(datos.numeros).map(n => enteroValido(n, 1, 99999)).filter(n => n !== null && n % base !== 0 && n > base / 10)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 6);
  if (numeros.length === 0) return '';
  const items = numeros.map(n => {
    const abajo = Math.floor(n / base) * base, arriba = abajo + base;
    if (!conGuia) {
      return `<div class="red-item"><p class="red-frase"><b>${n}</b> está entre ${casillaRespuesta('casilla-ancha')} y ${casillaRespuesta('casilla-ancha')}. Se aproxima a ${casillaRespuesta('casilla-ancha')}.</p></div>`;
    }
    const X0 = 28, X1 = 272, x = X0 + (X1 - X0) * (n - abajo) / base;
    const marcas = Array.from({ length: 11 }, (_, i) => {
      const xi = X0 + (X1 - X0) * i / 10, alto = i === 0 || i === 10 ? 9 : i === 5 ? 7 : 4;
      return `<line class="red-marca" x1="${xi}" y1="${30 - alto}" x2="${xi}" y2="${30 + alto}"/>`;
    }).join('');
    return `<div class="red-item">
      <svg width="300" height="62" viewBox="0 0 300 62">
        <line class="red-linea" x1="${X0}" y1="30" x2="${X1}" y2="30"/>${marcas}
        <text class="red-extremo" x="${X0}" y="54" text-anchor="middle">${abajo}</text>
        <text class="red-extremo" x="${X1}" y="54" text-anchor="middle">${arriba}</text>
        <path class="red-flecha" d="M${x.toFixed(1)} 19 l-4 -7 h8 z"/>
        <text class="red-numero" x="${x.toFixed(1)}" y="9" text-anchor="middle">${n}</text>
      </svg>
      <p class="red-frase"><b>${n}</b> se aproxima a ${casillaRespuesta('casilla-ancha')}</p>
    </div>`;
  }).join('');
  return `<div class="red-bloque"><p class="red-nota">Aproxima a la ${nombre} más cercana.</p>${items}</div>`;
}

// ── Encuentra el error ───────────────────────────────────────────────────
// Cuentas en columna YA resueltas: el código calcula el resultado bueno y
// decide él solo cuáles salen con un resultado equivocado (siempre al menos
// una bien y una mal). El alumno marca las correctas y corrige las otras.
function renderEncuentraError(datos) {
  const ops = lista(datos.operaciones).map(op => {
    const signo = op && (op.signo === '-' || op.signo === '−') ? '-' : '+';
    const nums = lista(op && op.numeros).map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 2);
    if (nums.length < 2) return null;
    if (signo === '-' && nums[1] > nums[0]) nums.reverse();
    return { signo, nums, bien: signo === '+' ? nums[0] + nums[1] : nums[0] - nums[1] };
  }).filter(Boolean).slice(0, 6);
  if (ops.length < 2) return '';
  const aleatorio = crearAleatorio(ops.map(o => o.nums.join(o.signo)).join('|'));
  const malas = ops.map(() => aleatorio() < 0.5);
  if (malas.every(m => m)) malas[0] = false;
  if (malas.every(m => !m)) malas[malas.length - 1] = true;
  const tarjetas = ops.map((op, i) => {
    let mostrado = op.bien;
    if (malas[i]) {
      const cambios = [10, -10, 1, -1, 9, 11].map(c => op.bien + c).filter(v => v >= 0);
      mostrado = cambios[Math.floor(aleatorio() * cambios.length)];
    }
    return `<div class="error-tarjeta">
      <div class="operacion-columna">
        <div class="operacion-fila"><span class="op-signo"></span><span class="num">${op.nums[0]}</span></div>
        <div class="operacion-fila"><span class="op-signo">${op.signo}</span><span class="num">${op.nums[1]}</span></div>
        <hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="num">${mostrado}</span></div>
      </div>
      <div class="error-marcas"><span class="casilla-test"></span><span class="error-corrige">${casillaRespuesta('casilla-ancha')}</span></div>
    </div>`;
  }).join('');
  return `<div class="error-bloque"><p class="error-nota">Marca ✓ si está bien. Si está mal, escribe al lado el resultado correcto.</p><div class="error-rejilla">${tarjetas}</div></div>`;
}

// ── Recortes de la tabla del 100 (modo de rejilla_numerica) ──────────────
// Trozos sueltos de la tabla del 1 al 100 con uno o dos números puestos. El
// código coloca cada trozo en un sitio real de la tabla y calcula sus números.
const FORMAS_RECORTE = [
  [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [1, 0], [1, 1]], [[0, 1], [0, 2], [1, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 2], [1, 0], [1, 1], [1, 2]], [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]]
];
function renderRecortesTabla(datos) {
  const cuantas = enteroValido(datos.piezas, 2, 9) || 6;
  const aleatorio = crearAleatorio('recortes' + cuantas + (datos.semilla || ''));
  const formas = barajar(FORMAS_RECORTE, aleatorio).slice(0, cuantas);
  const piezas = formas.map(forma => {
    const alto = Math.max(...forma.map(c => c[0])) + 1, ancho = Math.max(...forma.map(c => c[1])) + 1;
    const f0 = Math.floor(aleatorio() * (10 - alto + 1)), c0 = Math.floor(aleatorio() * (10 - ancho + 1));
    const dados = new Set([Math.floor(aleatorio() * forma.length)]);
    if (forma.length >= 5) dados.add((Math.floor(aleatorio() * forma.length) + 2) % forma.length);
    let celdas = '';
    for (let f = 0; f < alto; f++) for (let c = 0; c < ancho; c++) {
      const k = forma.findIndex(([ff, cc]) => ff === f && cc === c);
      celdas += k < 0 ? '<span class="rec-nada"></span>' : `<span class="rec-celda">${dados.has(k) ? (f0 + f) * 10 + c0 + c + 1 : ''}</span>`;
    }
    return `<div class="rec-pieza" style="grid-template-columns:repeat(${ancho}, 34px)">${celdas}</div>`;
  }).join('');
  return `<div class="rec-bloque">${piezas}</div>`;
}

// ── Dominó de operaciones (recortable) ───────────────────────────────────
// Cadena Inicio → Fin: cada ficha lleva el resultado de la operación de la
// ficha anterior. El código calcula los resultados, descarta operaciones con
// resultado repetido (la cadena tendría dos soluciones) y desordena las fichas.
function renderDominoOperaciones(datos) {
  const vistos = new Set();
  const ops = lista(datos.operaciones).filter(o => {
    const r = evaluarOperacion(o);
    if (r === null || r < 0 || vistos.has(r)) return false;
    vistos.add(r);
    return true;
  }).slice(0, 13);
  if (ops.length < 3) return '';
  const fichas = ops.map((o, i) => ({ izq: i === 0 ? 'Inicio' : String(evaluarOperacion(ops[i - 1])), der: textoOperacion(o) }));
  fichas.push({ izq: String(evaluarOperacion(ops[ops.length - 1])), der: 'Fin' });
  const resto = barajar(fichas.slice(1), crearAleatorio(ops.join('|')));
  const html = [fichas[0], ...resto].map(f =>
    `<div class="domino-ficha"><span class="domino-izq${f.izq === 'Inicio' ? ' domino-palabra' : ''}">${f.izq}</span><span class="domino-der${f.der === 'Fin' ? ' domino-palabra' : ''}">${f.der}</span></div>`).join('');
  return `<div class="domino-bloque"><p class="domino-nota">✂ Recorta las fichas y únelas: empieza por «Inicio» y acaba en «Fin».</p><div class="domino-rejilla">${html}</div></div>`;
}

// ── Posición en una cuadrícula de dibujos ────────────────────────────────
// Dibujos en un tablero; frases para completar con izquierda / derecha /
// encima / debajo. En las frases van los propios DIBUJOS, no sus nombres:
// sirve para quien aún no lee y evita errores de género ("el/la").
function renderPosicionCuadricula(datos) {
  const iconos = lista(datos.iconos).filter(n => ICONOS[n]).filter((n, i, arr) => arr.indexOf(n) === i);
  const columnas = enteroValido(datos.columnas, 2, 4) || 3;
  const filas = Math.min(3, Math.floor(iconos.length / columnas));
  if (filas < 2) return '';
  const rejilla = iconos.slice(0, filas * columnas);
  const en = (f, c) => rejilla[f * columnas + c];
  const mini = n => `<span class="pos-mini">${htmlIcono(n)}</span>`;
  const hueco = '<span class="hueco hueco-largo"></span>';
  const aleatorio = crearAleatorio(rejilla.join(','));
  const candidatas = [];
  for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) {
    if (c + 1 < columnas) {
      candidatas.push(`${mini(en(f, c))} está a la ${hueco} de ${mini(en(f, c + 1))}`);
      candidatas.push(`${mini(en(f, c + 1))} está a la ${hueco} de ${mini(en(f, c))}`);
    }
    if (f + 1 < filas) {
      candidatas.push(`${mini(en(f, c))} está ${hueco} de ${mini(en(f + 1, c))}`);
      candidatas.push(`${mini(en(f + 1, c))} está ${hueco} de ${mini(en(f, c))}`);
    }
  }
  const cuantas = enteroValido(datos.frases, 2, 6) || 4;
  const frases = barajar(candidatas, aleatorio).slice(0, cuantas - 1);
  const fo = Math.floor(aleatorio() * filas), co = Math.floor(aleatorio() * columnas);
  frases.push(`En su fila, contando desde la izquierda, ${mini(en(fo, co))} es el número ${casillaRespuesta()}`);
  return `<div class="pos-bloque">
    <div class="pos-tablero" style="grid-template-columns:repeat(${columnas}, 74px)">${rejilla.map(n => `<span class="pos-celda">${htmlIcono(n)}</span>`).join('')}</div>
    <div class="pos-frases">
      <p class="pos-banco"><span>izquierda</span><span>derecha</span><span>encima</span><span>debajo</span></p>
      ${frases.map(f => `<p class="pos-frase">${f}.</p>`).join('')}
    </div>
  </div>`;
}

// ── Comparar dos montones de dibujos ─────────────────────────────────────
// "mas"/"menos": dos cajas y una casilla en cada una para marcar. "diferencia":
// dos filas emparejadas una encima de otra y la resta debajo. Las cantidades
// iguales se descartan en mas/menos (no habría nada que marcar).
function renderCompararCantidades(datos) {
  const modo = ['menos', 'diferencia'].includes(datos.modo) ? datos.modo : 'mas';
  const parejas = lista(datos.parejas).map(p => {
    const a = enteroValido(p && p.a, 1, 10), b = enteroValido(p && p.b, 1, 10);
    if (a === null || b === null || a === b) return null;
    const iconoA = iconoValido(p.iconoA), iconoB = iconoValido(p.iconoB, iconoA === 'estrella' ? 'corazon' : 'estrella');
    return { a, b, iconoA, iconoB: iconoB === iconoA ? (iconoA === 'estrella' ? 'corazon' : 'estrella') : iconoB };
  }).filter(Boolean).slice(0, 4);
  if (parejas.length === 0) return '';
  if (modo === 'diferencia') {
    return `<div class="cc-bloque">${parejas.map(p => {
      const mayor = Math.max(p.a, p.b);
      const fila = (icono, n) => `<div class="cc-fila" style="grid-template-columns:repeat(${mayor}, 38px)">${Array.from({ length: n }, () => `<span>${htmlIcono(icono)}</span>`).join('')}</div>`;
      return `<div class="cc-diferencia">${fila(p.iconoA, p.a)}${fila(p.iconoB, p.b)}${fraseOperacion('−')}</div>`;
    }).join('')}</div>`;
  }
  const caja = (icono, n) => `<div class="cc-caja"><div class="cc-dibujos">${htmlIcono(icono).repeat(n)}</div><span class="casilla-test"></span></div>`;
  return `<div class="cc-bloque"><p class="cc-nota">Marca donde hay <b>${modo === 'mas' ? 'más' : 'menos'}</b>.</p>${parejas.map(p =>
    `<div class="cc-pareja">${caja(p.iconoA, p.a)}${caja(p.iconoB, p.b)}</div>`).join('')}</div>`;
}

// ── Recorrido en cuadrícula ──────────────────────────────────────────────
// Órdenes ("3 a la derecha, 2 abajo...") sobre una cuadrícula con tres metas
// A, B y C. El código sigue el camino, comprueba que no se sale ni pasa dos
// veces por la misma casilla, y pone UNA meta al final del camino y las otras
// dos en casillas por las que el camino no pasa.
const DIRECCIONES = { derecha: [0, 1, '→'], izquierda: [0, -1, '←'], arriba: [-1, 0, '↑'], abajo: [1, 0, '↓'] };
function renderRecorridoCuadricula(datos) {
  const pasos = lista(datos.pasos).map(p => {
    const dir = DIRECCIONES[String(p && p.direccion || '').toLowerCase()];
    const n = enteroValido(p && p.cuantos, 1, 8);
    return dir && n !== null ? { dir, n } : null;
  }).filter(Boolean).slice(0, 6);
  if (pasos.length < 2) return '';
  let f = 0, c = 0;
  const camino = [[0, 0]];
  for (const { dir, n } of pasos) for (let i = 0; i < n; i++) { f += dir[0]; c += dir[1]; camino.push([f, c]); }
  const claves = camino.map(p => p.join(','));
  if (new Set(claves).size !== claves.length) return '';
  const minF = Math.min(...camino.map(p => p[0])), maxF = Math.max(...camino.map(p => p[0]));
  const minC = Math.min(...camino.map(p => p[1])), maxC = Math.max(...camino.map(p => p[1]));
  const filas = Math.max(4, maxF - minF + 2), columnas = Math.max(5, maxC - minC + 2);
  if (filas > 9 || columnas > 12) return '';
  const pos = p => (p[0] - minF) * columnas + (p[1] - minC);
  const ocupadas = new Set(camino.map(pos));
  const aleatorio = crearAleatorio(claves.join('|'));
  const libres = barajar(Array.from({ length: filas * columnas }, (_, i) => i).filter(i => !ocupadas.has(i)), aleatorio);
  if (libres.length < 2) return '';
  const letras = barajar(['A', 'B', 'C'], aleatorio);
  const marcas = { [pos(camino[camino.length - 1])]: letras[0], [libres[0]]: letras[1], [libres[1]]: letras[2] };
  const inicio = pos(camino[0]);
  const celdas = Array.from({ length: filas * columnas }, (_, i) =>
    `<span class="reco-celda${i === inicio ? ' reco-inicio' : ''}">${i === inicio ? '●' : marcas[i] ? `<b>${marcas[i]}</b>` : ''}</span>`).join('');
  return `<div class="reco-bloque">
    <div class="reco-rejilla" style="grid-template-columns:repeat(${columnas}, 30px)">${celdas}</div>
    <div class="reco-ordenes">
      <p>Sal del punto ● y sigue las órdenes:</p>
      <p class="reco-pasos">${pasos.map(p => `<span>${p.n} ${p.dir[2]}</span>`).join('')}</p>
      <p>Llegas a la letra ${casillaRespuesta()}</p>
    </div>
  </div>`;
}

// ── Tipos de líneas ──────────────────────────────────────────────────────
// Catálogo cerrado de dibujos: la respuesta correcta es un dato del código.
const LINEAS = {
  recta: '<path d="M8 44 L92 12"/>',
  curva: '<path d="M8 40 C28 2 50 60 70 26 S90 14 92 30"/>',
  poligonal_abierta: '<path d="M8 44 L28 12 L48 40 L68 14 L92 36"/>',
  poligonal_cerrada: '<path d="M14 42 L30 10 L66 8 L90 30 L62 46 Z"/>',
  curva_cerrada: '<path d="M50 8 C82 6 94 30 74 44 C56 54 22 50 12 34 C4 18 26 8 50 8 Z"/>'
};
const PARES_RECTAS = {
  paralelas: '<path d="M8 16 L92 28 M8 34 L92 46"/>',
  secantes: '<path d="M8 14 L92 44 M10 46 L90 18"/>',
  perpendiculares: '<path d="M10 40 L90 22 M44 4 L54 50"/>'
};
function renderTiposLineas(datos) {
  const modo = ['posicion', 'abierta_cerrada'].includes(datos.modo) ? datos.modo : 'clasificar';
  const catalogo = modo === 'posicion' ? PARES_RECTAS : LINEAS;
  const opciones = modo === 'posicion' ? ['paralelas', 'secantes', 'perpendiculares']
    : modo === 'abierta_cerrada' ? ['abierta', 'cerrada'] : ['recta', 'curva', 'poligonal'];
  const nombres = lista(datos.lineas).filter(n => catalogo[n]).slice(0, 6);
  const usar = nombres.length >= 2 ? nombres : barajar(Object.keys(catalogo), crearAleatorio('lineas' + modo));
  const tarjetas = usar.filter(n => modo !== 'abierta_cerrada' || n !== 'recta').map(n => `<div class="lin-tarjeta">
      <svg class="lin-dibujo" width="110" height="60" viewBox="0 0 100 54">${catalogo[n]}</svg>
      <div class="lin-opciones">${opciones.map(o => `<span class="opcion-item"><span class="casilla-test"></span> ${o}</span>`).join('')}</div>
    </div>`).join('');
  return `<div class="lin-bloque">${tarjetas}</div>`;
}

// ── Serie de figuras o dibujos ───────────────────────────────────────────
// Claude da solo el patrón (2-4 elementos); el código lo repite y deja las
// últimas casillas en blanco para que el alumno continúe.
function renderSerieFiguras(datos) {
  const series = (Array.isArray(datos.series) ? datos.series : [datos]).map(s => {
    const patron = lista(s && s.patron).filter(n => ICONOS[n]).slice(0, 4);
    if (patron.length < 2 || new Set(patron).size < 2) return null;
    const huecos = enteroValido(s.huecos, 1, 5) || 3;
    const longitud = Math.min(12, Math.max(patron.length * 2 + huecos, enteroValido(s.longitud, 5, 12) || 9));
    return Array.from({ length: longitud }, (_, i) => i < longitud - huecos
      ? `<span class="sf-celda">${htmlIcono(patron[i % patron.length])}</span>` : '<span class="sf-celda sf-hueco"></span>').join('');
  }).filter(Boolean).slice(0, 4);
  return series.length ? `<div class="sf-bloque">${series.map(s => `<div class="sf-fila">${s}</div>`).join('')}</div>` : '';
}

// ── Tabla de doble entrada (horarios, encuestas...) ──────────────────────
// "leer": tabla rellena + preguntas. "completar": pistas + tabla vacía.
function renderTablaDobleEntrada(datos) {
  const columnas = lista(datos.columnas).map(c => String(c || '').slice(0, 20)).slice(0, 7);
  const filas = lista(datos.filas).slice(0, 6);
  if (columnas.length < 2 || filas.length === 0) return '';
  const completar = datos.modo === 'completar';
  const cuerpo = filas.map(f => `<tr><th>${escapeHtml(f && f.etiqueta)}</th>${columnas.map((_, i) =>
    `<td>${completar ? '' : escapeHtml(lista(f && f.celdas)[i] ?? '')}</td>`).join('')}</tr>`).join('');
  const pistas = completar ? lista(datos.pistas).map(p => String(p || '').trim()).filter(Boolean).slice(0, 8) : [];
  return `<div class="tde-bloque">
    ${pistas.length ? `<ul class="tde-pistas">${pistas.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
    <table class="tde-tabla${completar ? ' tde-vacia' : ''}"><thead><tr><th></th>${columnas.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${cuerpo}</tbody></table>
    ${listaPreguntas(datos.preguntas)}
  </div>`;
}

// ── Sopa de operaciones ──────────────────────────────────────────────────
// Rejilla de números con operaciones escondidas (a b c seguidos, en
// horizontal o en vertical, con a ○ b = c). El código calcula c, coloca cada
// trío y rellena el resto con números que no formen por casualidad otra
// operación válida.
function renderSopaOperaciones(datos) {
  const esProducto = ['x', 'X', '×', '*'].includes(String(datos.signo));
  const op = (a, b) => (esProducto ? a * b : a + b);
  const vistos = new Set();
  const trios = lista(datos.operaciones).map(o => {
    const [a, b] = lista(o).map(n => enteroValido(n, 1, esProducto ? 10 : 50)).filter(n => n !== null);
    if (a === undefined || b === undefined || vistos.has(`${a},${b}`)) return null;
    vistos.add(`${a},${b}`);
    return [a, b, op(a, b)];
  }).filter(Boolean).slice(0, 6);
  if (trios.length < 2) return '';
  const N = trios.length > 4 ? 7 : 6;
  const maximo = Math.max(...trios.map(t => t[2]), 12);
  const aleatorio = crearAleatorio(trios.join('|'));
  const g = Array.from({ length: N }, () => Array(N).fill(null));
  const fijo = Array.from({ length: N }, () => Array(N).fill(false));
  let colocados = 0;
  trios.forEach(t => {
    for (let intento = 0; intento < 200; intento++) {
      const h = aleatorio() < 0.5, f = Math.floor(aleatorio() * (h ? N : N - 2)), c = Math.floor(aleatorio() * (h ? N - 2 : N));
      const cel = [0, 1, 2].map(k => (h ? [f, c + k] : [f + k, c]));
      if (cel.some(([y, x]) => g[y][x] !== null)) continue;
      cel.forEach(([y, x], k) => { g[y][x] = t[k]; fijo[y][x] = true; });
      colocados++;
      return;
    }
  });
  if (colocados < 2) return '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (g[y][x] === null) g[y][x] = 1 + Math.floor(aleatorio() * maximo);
  // Quita las operaciones "accidentales" cambiando una casilla de relleno.
  const validos = new Set();
  const esFijo = cel => cel.every(([y, x]) => fijo[y][x]);
  for (let pasada = 0; pasada < 40; pasada++) {
    let cambios = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const h of [true, false]) {
      const cel = [0, 1, 2].map(k => (h ? [y, x + k] : [y + k, x]));
      if (cel.some(([yy, xx]) => yy >= N || xx >= N)) continue;
      const [a, b, r] = cel.map(([yy, xx]) => g[yy][xx]);
      if (op(a, b) !== r || esFijo(cel)) continue;
      const libre = cel.find(([yy, xx]) => !fijo[yy][xx]);
      if (!libre) continue;
      g[libre[0]][libre[1]] = 1 + Math.floor(aleatorio() * maximo);
      cambios++;
    }
    if (cambios === 0) { validos.add('ok'); break; }
  }
  const celdas = g.map(fila => fila.map(n => `<span class="sopa-celda">${n}</span>`).join('')).join('');
  return `<div class="sopa-bloque">
    <div class="sopa-rejilla" style="grid-template-columns:repeat(${N}, 36px)">${celdas}</div>
    <p class="sopa-nota">Hay <b>${colocados}</b> ${esProducto ? 'multiplicaciones' : 'sumas'} escondidas, en horizontal → o en vertical ↓. Rodéalas así: <span class="sopa-ejemplo">${trios[0][0]} ${trios[0][1]} ${trios[0][2]}</span> porque ${trios[0][0]} ${esProducto ? '×' : '+'} ${trios[0][1]} = ${trios[0][2]}.</p>
  </div>`;
}

// ── Contar figuras ───────────────────────────────────────────────────────
// Figuras con otras escondidas dentro, de un catálogo cerrado.
function renderContarFiguras(datos) {
  const tarjetas = lista(datos.figuras).map(f => {
    const tipo = f && f.tipo;
    if (tipo === 'triangulos') {
      const n = enteroValido(f.divisiones, 2, 5) || 3;
      const lineas = Array.from({ length: n - 1 }, (_, i) => `<line x1="60" y1="8" x2="${10 + 100 * (i + 1) / n}" y2="92"/>`).join('');
      return { svg: `<path d="M60 8 L10 92 L110 92 Z"/>${lineas}`, nombre: 'triángulos' };
    }
    if (tipo === 'cuadrados') {
      const n = enteroValido(f.lado, 2, 3) || 2, l = 84 / n;
      let r = '';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) r += `<rect x="${18 + x * l}" y="${8 + y * l}" width="${l}" height="${l}"/>`;
      return { svg: r, nombre: 'cuadrados' };
    }
    if (tipo === 'rectangulos') {
      const n = enteroValido(f.celdas, 2, 5) || 3, w = 104 / n;
      return { svg: Array.from({ length: n }, (_, i) => `<rect x="${8 + i * w}" y="30" width="${w}" height="40"/>`).join(''), nombre: 'rectángulos' };
    }
    return null;
  }).filter(Boolean).slice(0, 4).map(t => `<div class="cf-tarjeta">
      <svg class="cf-dibujo" width="120" height="100" viewBox="0 0 120 100">${t.svg}</svg>
      <p>¿Cuántos ${t.nombre} hay en total? ${casillaRespuesta()}</p>
    </div>`).join('');
  return tarjetas ? `<div class="cf-bloque">${tarjetas}</div>` : '';
}

// ── Elegir la unidad de medida ───────────────────────────────────────────
function renderElegirUnidad(datos) {
  const filas = lista(datos.items).map(it => {
    const texto = String(it && it.texto || '').trim();
    const opciones = lista(it && it.opciones).map(o => String(o || '').trim()).filter(Boolean).slice(0, 4);
    if (!texto || opciones.length < 2) return '';
    return `<div class="eu-fila"><span class="eu-texto">${escapeHtml(texto)}</span><span class="eu-opciones">${opciones.map(o =>
      `<span class="opcion-item"><span class="casilla-test"></span> ${escapeHtml(o)}</span>`).join('')}</span></div>`;
  }).filter(Boolean).slice(0, 8).join('');
  return filas ? `<div class="eu-bloque">${filas}</div>` : '';
}

// ── Trazo de cifras con punto de inicio y flechas ────────────────────────
// Cada cifra es un esqueleto propio (el camino que sigue el lápiz), en gris
// claro para repasar, con el punto donde se empieza y una flecha numerada
// por cada trazo. Casilla con cruz punteada, como en los cuadernos.
const TRAZOS_CIFRA = {
  0: ['M20 6 C8 6 6 20 6 30 C6 44 10 54 20 54 C30 54 34 44 34 30 C34 18 31 6 20 6'],
  1: ['M9 19 L22 6 L22 54'],
  2: ['M8 17 C10 3 32 3 32 18 C32 29 16 40 8 54 L34 54'],
  3: ['M8 12 C14 3 32 5 32 17 C32 26 22 29 16 29 C24 29 34 33 34 42 C34 56 12 57 7 47'],
  4: ['M24 6 L6 40 L36 40', 'M28 22 L28 54'],
  5: ['M12 6 L9 27 C16 22 34 24 34 39 C34 55 13 57 7 47', 'M12 6 L31 6'],
  6: ['M30 8 C14 8 7 26 7 40 C7 50 13 54 20 54 C28 54 33 48 33 41 C33 33 27 29 20 29 C13 29 8 34 7 40'],
  7: ['M7 6 L33 6 L16 54'],
  8: ['M20 6 C9 6 10 26 20 29 C33 33 32 54 20 54 C8 54 7 33 20 29 C30 26 31 6 20 6'],
  9: ['M33 20 C33 10 27 6 20 6 C12 6 7 12 7 19 C7 27 13 31 20 31 C27 31 33 26 33 20 C33 36 30 54 14 54']
};
// Dirección inicial de cada trazo (para la flechita): [dx, dy] ya normalizado.
const SALIDA_TRAZO = { 0: [[-1, 0.4]], 1: [[0.7, -0.7]], 2: [[0.5, -0.85]], 3: [[0.7, -0.7]], 4: [[-0.47, 0.88], [0, 1]], 5: [[-0.14, 0.99], [1, 0]], 6: [[-1, 0.2]], 7: [[1, 0]], 8: [[-1, 0.5]], 9: [[-0.3, -0.95]] };
function svgCifraTrazo(cifra, conGuia) {
  const trazos = TRAZOS_CIFRA[cifra];
  if (!trazos) return '';
  const caminos = trazos.map(d => `<path class="tc-trazo" d="${d}"/>`).join('');
  let guia = '';
  if (conGuia) {
    guia = trazos.map((d, i) => {
      const [x, y] = d.match(/^M(-?[\d.]+) (-?[\d.]+)/).slice(1).map(Number);
      const [dx, dy] = SALIDA_TRAZO[cifra][i];
      // La flecha va desplazada hacia un lado del trazo, para no taparlo.
      const ox = x - dy * 8, oy = y + dx * 8;
      const x2 = ox + dx * 12, y2 = oy + dy * 12;
      const numero = trazos.length > 1 ? `<text class="tc-orden" x="${(ox - dx * 6).toFixed(1)}" y="${(oy - dy * 6 + 3).toFixed(1)}" text-anchor="middle">${i + 1}</text>` : '';
      return `<circle class="tc-inicio" cx="${x}" cy="${y}" r="2.6"/><path class="tc-flecha" d="M${ox.toFixed(1)} ${oy.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}"/><path class="tc-punta" d="M${x2.toFixed(1)} ${y2.toFixed(1)} l${(-dx * 5 - dy * 3).toFixed(1)} ${(-dy * 5 + dx * 3).toFixed(1)} l${(dy * 6).toFixed(1)} ${(-dx * 6).toFixed(1)} z"/>${numero}`;
    }).join('');
  }
  return `<svg class="tc-cifra" width="40" height="60" viewBox="-6 -4 52 68">${caminos}${guia}</svg>`;
}
function celdaTrazo(numero, conGuia) {
  const cifras = String(numero).split('').map(c => svgCifraTrazo(Number(c), conGuia)).join('');
  return `<span class="tc-celda${String(numero).length > 1 ? ' tc-doble' : ''}">${cifras}</span>`;
}
function renderTrazoNumero(datos) {
  const numeros = lista(datos.numeros).map(n => enteroValido(n, 0, 20)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 11);
  if (numeros.length === 0) return '';
  const repasar = enteroValido(datos.repasar, 1, 5) || 3;
  const solo = enteroValido(datos.solo, 0, 6) ?? 3;
  const filas = numeros.map(n => {
    const doble = n > 9;
    const vacias = `<span class="tc-celda${doble ? ' tc-doble' : ''}"></span>`.repeat(solo);
    return `<div class="tc-fila">${celdaTrazo(n, true)}${celdaTrazo(n, false).repeat(repasar)}${vacias}<span class="tc-palabra">${numeroALetras(n)}</span></div>`;
  }).join('');
  return `<div class="tc-bloque">${filas}</div>`;
}

// ════════════ MODOS NUEVOS SOBRE TIPOS QUE YA EXISTÍAN (02/10/2026) ══════

// operacion_vertical — "prueba": resta en columna y, al lado, la suma que la
// comprueba (resultado + sustraendo = minuendo), con el sustraendo ya puesto.
function renderRestaConPrueba(datos) {
  const ops = lista(datos.operaciones).map(op => {
    const nums = lista(op && op.numeros).map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 2);
    if (nums.length < 2) return null;
    if (nums[1] > nums[0]) nums.reverse();
    return nums;
  }).filter(Boolean).slice(0, 4);
  if (ops.length === 0) return '';
  return `<div class="prueba-bloque">${ops.map(([a, b]) => `<div class="prueba-item">
    ${renderOperacionColumna({ signo: '-', numeros: [a, b] })}
    <span class="prueba-flecha">Prueba ▶</span>
    <div class="operacion-columna">
      <div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
      <div class="operacion-fila"><span class="op-signo">+</span><span class="num">${b}</span></div>
      <hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="resultado-hueco"></span></div>
    </div>
  </div>`).join('')}</div>`;
}
// operacion_vertical — "hueco": "sumando": falta el segundo número; el
// resultado (calculado por el código) ya está puesto.
function renderSumandoOculto(datos) {
  const ops = lista(datos.operaciones).map(op => {
    const signo = op && (op.signo === '-' || op.signo === '−') ? '-' : '+';
    const nums = lista(op && op.numeros).map(n => enteroValido(n, 0, 99999)).filter(n => n !== null).slice(0, 2);
    if (nums.length < 2) return null;
    if (signo === '-' && nums[1] > nums[0]) nums.reverse();
    return { signo, a: nums[0], r: signo === '+' ? nums[0] + nums[1] : nums[0] - nums[1] };
  }).filter(Boolean).slice(0, 8);
  if (ops.length === 0) return '';
  return `<div class="operaciones-fila sumando-oculto">${ops.map(op => `<div class="operacion-columna">
      <div class="operacion-fila"><span class="op-signo"></span><span class="num">${op.a}</span></div>
      <div class="operacion-fila"><span class="op-signo">${op.signo}</span><span class="resultado-hueco"></span></div>
      <hr class="linea-op"><div class="operacion-fila"><span class="op-signo"></span><span class="num">${op.r}</span></div>
    </div>`).join('')}</div>`;
}

// ecuacion_sencilla — posicionIncognita "signo" (¿suma o resta?) y "ambos"
// (inventa una operación para un resultado dado).
function renderEcuacionExtra(datos) {
  const filas = lista(datos.operaciones).slice(0, 8).map(op => {
    const a = Math.round(numeroDesdeJSON(op && op.a)), b = Math.round(numeroDesdeJSON(op && op.b));
    const signo = op.signo === '-' || op.signo === '−' ? '−' : '+';
    if (signo === '−' && b > a) return null;
    const r = signo === '+' ? a + b : a - b;
    const num = v => `<span class="ecuacion-numero">${v}</span>`;
    const hueco = '<span class="hueco hueco-corto ecuacion-hueco"></span>';
    if (op.posicionIncognita === 'signo') {
      if (b === 0) return null; // con 0, sumar y restar dan lo mismo
      return `<div class="ecuacion-fila">${num(a)}<span class="ecuacion-circulo"></span>${num(b)}<span class="ecuacion-signo">=</span>${num(r)}</div>`;
    }
    return `<div class="ecuacion-fila">${hueco}<span class="ecuacion-signo">${signo}</span>${hueco}<span class="ecuacion-signo">=</span>${num(r)}</div>`;
  }).filter(Boolean).join('');
  return filas ? `<div class="ecuacion-sencilla-bloque">${filas}</div>` : '';
}

// reparto — "resto": true: no se ajusta al múltiplo; "y sobran □".
function renderRepartoConResto(datos) {
  const grupos = enteroValido(datos.grupos, 2, 6) || 2;
  const total = Math.min(30, Math.max(grupos, enteroValido(datos.total, 2, 30) || grupos));
  return `<div class="reparto-bloque">
    <p class="reparto-operacion">${total} : ${grupos} = ${casillaRespuesta()} y sobran ${casillaRespuesta()}</p>
    <div class="reparto-objetos">${htmlIcono(iconoValido(datos.icono)).repeat(total)}</div>
    <div class="reparto-grupos">${'<div class="reparto-grupo-caja"></div>'.repeat(grupos)}</div>
  </div>`;
}

// barritas_decenas — placas de centena, "agrupar" de 10 en 10 y "operar"
// (sumar o restar decenas con decenas y unidades con unidades, sin llevadas).
function svgBase10(numero) {
  const c = Math.floor(numero / 100), d = Math.floor(numero / 10) % 10, u = numero % 10, l = 8;
  let partes = '', x = 2;
  for (let k = 0; k < c; k++) {
    for (let i = 0; i < 100; i++) partes += `<rect class="base10-cubo" x="${x + (i % 10) * l}" y="${2 + Math.floor(i / 10) * l}" width="${l}" height="${l}"/>`;
    x += 10 * l + 6;
  }
  for (let k = 0; k < d; k++) {
    for (let i = 0; i < 10; i++) partes += `<rect class="base10-cubo" x="${x}" y="${2 + i * l}" width="${l}" height="${l}"/>`;
    x += l + 4;
  }
  if (u > 0) x += 3;
  for (let i = 0; i < u; i++) partes += `<rect class="base10-cubo base10-suelto" x="${x + Math.floor(i / 5) * (l + 3)}" y="${2 + (5 + i % 5) * l}" width="${l}" height="${l}"/>`;
  const ancho = x + (u > 5 ? 2 : u > 0 ? 1 : 0) * (l + 3) + 3;
  return `<svg width="${ancho}" height="${10 * l + 4}" viewBox="0 0 ${ancho} ${10 * l + 4}">${partes}</svg>`;
}
function renderBarritasExtra(datos) {
  if (datos.modo === 'agrupar') {
    const numeros = lista(datos.numeros).map(n => enteroValido(n, 11, 60)).filter(n => n !== null).slice(0, 2);
    if (numeros.length === 0) return '';
    return `<div class="agrupar-bloque">${numeros.map(n => {
      const aleatorio = crearAleatorio('agrupar' + n);
      const columnas = 12, filas = Math.ceil(n / columnas) + 1;
      const sitios = barajar(Array.from({ length: columnas * filas }, (_, i) => i), aleatorio).slice(0, n);
      const bolas = sitios.map(s => `<circle class="agrupar-bola" cx="${(14 + (s % columnas) * 27 + aleatorio() * 9).toFixed(1)}" cy="${(14 + Math.floor(s / columnas) * 27 + aleatorio() * 9).toFixed(1)}" r="7"/>`).join('');
      return `<div class="agrupar-item">
        <svg width="${columnas * 27 + 14}" height="${filas * 27 + 14}" viewBox="0 0 ${columnas * 27 + 14} ${filas * 27 + 14}">${bolas}</svg>
        <p>Rodea grupos de 10. Hay ${casillaRespuesta()} grupos de 10 y ${casillaRespuesta()} sueltas. En total: ${casillaRespuesta('casilla-ancha')}</p>
      </div>`;
    }).join('')}</div>`;
  }
  if (datos.modo === 'operar') {
    const ops = lista(datos.operaciones).map(op => {
      const resta = op && (op.signo === '-' || op.signo === '−');
      let [a, b] = lista(op && op.numeros).map(n => enteroValido(n, 1, 99)).filter(n => n !== null);
      if (a === undefined || b === undefined) return null;
      if (resta && b > a) [a, b] = [b, a];
      const ok = resta ? (a % 10 >= b % 10) : (a % 10 + b % 10 < 10 && a + b < 100);
      return ok ? { a, b, s: resta ? '−' : '+' } : null;
    }).filter(Boolean).slice(0, 3);
    if (ops.length === 0) return '';
    const linea = (nombre, s) => `<p><span class="operar-nombre">${nombre}</span> ${casillaRespuesta()} <span>${s}</span> ${casillaRespuesta()} <span>=</span> ${casillaRespuesta()}</p>`;
    return `<div class="operar-bloque">${ops.map(({ a, b, s }) => `<div class="operar-item">
      <p class="operar-cuenta">${a} ${s} ${b}</p>
      <div class="operar-dibujos"><span>${svgBarritasDecenas(a)}</span><b>${s}</b><span>${svgBarritasDecenas(b)}</span></div>
      <div class="operar-lineas">${linea('Decenas', s)}${linea('Unidades', s)}<p><span class="operar-nombre">Resultado</span> ${casillaRespuesta('casilla-ancha')}</p></div>
    </div>`).join('')}</div>`;
  }
  // Números de tres cifras en modo "contar": placas de centena.
  const numeros = lista(datos.numeros).map(n => enteroValido(n, 100, 999)).filter(n => n !== null).slice(0, 3);
  if (numeros.length === 0) return '';
  return `<div class="base10-bloque">${numeros.map(n => `<div class="base10-tarjeta base10-centenas">
    ${svgBase10(n)}
    <div class="base10-respuesta"><p>${casillaRespuesta()} C, ${casillaRespuesta()} D y ${casillaRespuesta()} U</p><p>Número: ${casillaRespuesta('casilla-ancha')}</p></div>
  </div>`).join('')}</div>`;
}

// suma_asociativa — "conmutativa": a + b = b + □ = □
function renderConmutativa(datos) {
  const pares = lista(datos.pares).map(p => lista(p).map(n => enteroValido(n, 0, 999)).filter(n => n !== null))
    .filter(p => p.length === 2 && p[0] !== p[1]).slice(0, 6);
  if (pares.length === 0) return '';
  return `<div class="conmutativa-bloque">${pares.map(([a, b]) =>
    `<p class="conmutativa-fila">${a} + ${b} = ${b} + ${casillaRespuesta()} = ${casillaRespuesta('casilla-ancha')}</p>`).join('')}</div>`;
}

// reloj_analogico — "despues" (media hora después/antes), "elegir" (colorea
// el reloj que marca la hora escrita) y "tabla24" (mañana ↔ tarde).
function svgReloj(hora, minuto) {
  const numeros = Array.from({ length: 12 }, (_, i) => {
    const ang = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
    return `<text x="${(55 + 42 * Math.cos(ang)).toFixed(1)}" y="${(58 + 42 * Math.sin(ang)).toFixed(1)}" font-size="9" text-anchor="middle" font-family="Arial">${i + 1}</text>`;
  }).join('');
  const am = (minuto / 60) * 2 * Math.PI, ah = (((hora % 12) + minuto / 60) / 12) * 2 * Math.PI;
  return `<svg width="110" height="110" viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" fill="#fff" stroke="#000" stroke-width="2"/>${numeros}
    <line x1="55" y1="55" x2="${(55 + 22 * Math.sin(ah)).toFixed(1)}" y2="${(55 - 22 * Math.cos(ah)).toFixed(1)}" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    <line x1="55" y1="55" x2="${(55 + 34 * Math.sin(am)).toFixed(1)}" y2="${(55 - 34 * Math.cos(am)).toFixed(1)}" stroke="#000" stroke-width="2" stroke-linecap="round"/>
    <circle cx="55" cy="55" r="2.5" fill="#000"/></svg>`;
}
function renderRelojExtra(datos) {
  if (datos.modo === 'tabla24') {
    const horas = lista(datos.horas).map(h => enteroValido(h, 1, 11)).filter(h => h !== null)
      .filter((h, i, arr) => arr.indexOf(h) === i).slice(0, 6);
    if (horas.length < 2) return '';
    const filas = horas.map((h, i) => `<tr><td>${i % 2 === 0 || i === 0 ? `${h}:00` : ''}</td><td>${i === 0 ? `${h + 12}:00` : i % 2 === 1 ? `${h + 12}:00` : ''}</td></tr>`).join('');
    return `<table class="tabla24"><thead><tr><th>Por la mañana</th><th>Por la tarde</th></tr></thead><tbody>${filas}</tbody></table>`;
  }
  const relojes = (Array.isArray(datos.relojes) ? datos.relojes : [datos]).map(r => {
    const hora = enteroValido(r && r.hora, 0, 23), minuto = enteroValido(r && r.minuto, 0, 59) ?? 0;
    return hora === null ? null : { hora: hora % 12, minuto: Math.round(minuto / 5) * 5 % 60, dif: r.minutosDespues };
  }).filter(Boolean).slice(0, 4);
  if (relojes.length === 0) return '';
  if (datos.modo === 'elegir') {
    return `<div class="reloj-elegir-bloque">${relojes.map(({ hora, minuto }) => {
      const falsas = [[(hora + 1) % 12, minuto], [hora, (minuto + 30) % 60]];
      const orden = barajar([[hora, minuto], ...falsas], crearAleatorio(`elegir${hora}:${minuto}`));
      return `<div class="reloj-elegir"><p class="reloj-objetivo">${horaEnPalabras(hora, minuto)}</p>
        <div class="reloj-opciones">${orden.map(([h, m]) => `<span class="reloj-opcion">${svgReloj(h, m)}<span class="casilla-test"></span></span>`).join('')}</div></div>`;
    }).join('')}</div>`;
  }
  const TEXTOS = { 30: 'Media hora después', 60: 'Una hora después', 15: 'Un cuarto de hora después', '-30': 'Media hora antes', '-60': 'Una hora antes', '-15': 'Un cuarto de hora antes' };
  return `<div class="reloj-despues-bloque">${relojes.map(({ hora, minuto, dif }) => {
    const d = TEXTOS[parseInt(dif, 10)] ? parseInt(dif, 10) : 30;
    return `<div class="reloj-despues">${svgReloj(hora, minuto)}<p>${TEXTOS[d]} son las</p>${relojDigital(0, 0, true)}</div>`;
  }).join('')}</div>`;
}

// simetria — "eje": la figura entera, sin eje: lo dibuja el alumno.
function renderSimetriaEje(datos) {
  const nombres = lista(datos.figuras).filter(n => PATRONES_SIMETRIA[n]);
  const usar = (nombres.length ? nombres : [PATRONES_SIMETRIA[datos.figura] ? datos.figura : 'corazon']).slice(0, 4);
  const C = 16, columnas = 10, filas = 6;
  return `<div class="simetria-bloque simetria-eje">${usar.map(nombre => {
    const llenas = new Set();
    PATRONES_SIMETRIA[nombre].forEach(([f, c]) => { llenas.add(`${f},${c}`); llenas.add(`${f},${columnas - 1 - c}`); });
    let rects = '';
    for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) rects += `<rect x="${c * C}" y="${f * C}" width="${C}" height="${C}" class="${llenas.has(`${f},${c}`) ? 'simetria-celda-llena' : 'simetria-celda-vacia'}"/>`;
    return `<svg width="${columnas * C}" height="${filas * C}" viewBox="0 0 ${columnas * C} ${filas * C}">${rects}</svg>`;
  }).join('')}</div>`;
}

// figura_geometrica — "triangulos" (según sus lados), "circulo" (centro,
// radio y diámetro) y "objetos" (unir cada cuerpo con un objeto del banco).
const TRIANGULOS_LADOS = {
  'equilátero': 'M50 8 L92 80 L8 80 Z', 'isósceles': 'M50 6 L78 82 L22 82 Z', 'escaleno': 'M14 16 L94 82 L6 82 Z'
};
const OBJETOS_CUERPO = { esfera: ['balon', 'pelota', 'naranja'], cubo: ['dado'], cilindro: ['lata', 'bote', 'tambor'], cono: ['cono', 'tipi'], prisma: ['caja', 'ladrillo', 'paquete', 'libro'] };
function renderFiguraExtra(datos) {
  if (datos.modo === 'triangulos') {
    const orden = barajar(Object.keys(TRIANGULOS_LADOS), crearAleatorio('tri' + (datos.semilla || '')));
    return `<div class="lin-bloque">${orden.map(n => `<div class="lin-tarjeta">
      <svg class="lin-dibujo" width="100" height="90" viewBox="0 0 100 90"><path d="${TRIANGULOS_LADOS[n]}"/></svg>
      <div class="lin-opciones">${Object.keys(TRIANGULOS_LADOS).map(o => `<span class="opcion-item"><span class="casilla-test"></span> ${o}</span>`).join('')}</div>
    </div>`).join('')}</div>`;
  }
  if (datos.modo === 'circulo') {
    return `<div class="circ-bloque">
      <svg width="250" height="150" viewBox="0 0 250 150">
        <circle class="circ-linea" cx="80" cy="75" r="60"/><circle cx="80" cy="75" r="3"/>
        <line class="circ-linea" x1="80" y1="75" x2="122.4" y2="32.6"/><line class="circ-linea" x1="22" y1="90.5" x2="138" y2="59.5"/>
        <path class="circ-guia" d="M80 75 L165 118 M104 51 L165 22 M118 65 L165 70"/>
        <rect class="circ-caja" x="165" y="10" width="80" height="24"/><rect class="circ-caja" x="165" y="58" width="80" height="24"/><rect class="circ-caja" x="165" y="106" width="80" height="24"/>
      </svg>
      <p class="pos-banco"><span>centro</span><span>radio</span><span>diámetro</span></p>
    </div>`;
  }
  // "objetos"
  const cuerpos = lista(datos.cuerpos).filter(n => FIGURAS_3D[n] && OBJETOS_CUERPO[n]).filter((n, i, arr) => arr.indexOf(n) === i);
  const aleatorio = crearAleatorio('objetos' + cuerpos.join(','));
  const parejas = cuerpos.map(n => {
    const disponibles = OBJETOS_CUERPO[n].filter(o => IMAGENES_BN.has(o) || IMAGENES_COLOR.has(o));
    return disponibles.length ? { n, objeto: disponibles[Math.floor(aleatorio() * disponibles.length)] } : null;
  }).filter(Boolean).slice(0, 4);
  if (parejas.length < 2) return '';
  const orden = barajaDeterministaFig(parejas.length, hashTextoFig(parejas.map(p => p.objeto).join(',')));
  return unirRejilla([
    parejas.map(p => `<span class="unir-dibujo">${FIGURAS_3D[p.n].svg}</span><span class="unir-punto"></span>`),
    orden.map(i => `<span class="unir-punto"></span><span class="unir-dibujo">${imagenBanco(parejas[i].objeto, parejas[i].objeto)}</span>`)
  ]);
}

// conteo_svg — "unir": dibujos ↔ número ↔ cubitos, en tres columnas.
function renderUnirConteo(datos) {
  const grupos = lista(datos.grupos).map(g => {
    const n = enteroValido(g && g.cantidad, 1, 10);
    return n === null ? null : { n, icono: iconoValido(g.icono) };
  }).filter(Boolean).filter((g, i, arr) => arr.findIndex(x => x.n === g.n) === i).slice(0, 5);
  if (grupos.length < 2) return '';
  const semilla = hashTextoFig(grupos.map(g => g.n).join(','));
  const ordenNum = grupos.map((_, i) => i).sort((a, b) => grupos[a].n - grupos[b].n);
  const ordenCubos = barajaDeterministaFig(grupos.length, semilla + 3);
  const cubitos = n => `<svg width="${Math.min(n, 5) * 13 + 2}" height="${n > 5 ? 28 : 15}" viewBox="0 0 ${Math.min(n, 5) * 13 + 2} ${n > 5 ? 28 : 15}">${Array.from({ length: n }, (_, i) =>
    `<rect class="base10-cubo" x="${1 + (i % 5) * 13}" y="${1 + Math.floor(i / 5) * 13}" width="13" height="13"/>`).join('')}</svg>`;
  return `<div class="unir-conteo">${unirRejilla([
    grupos.map(g => `<span class="unir-dibujo uc-dibujos">${htmlIcono(g.icono).repeat(g.n)}</span><span class="unir-punto"></span>`),
    ordenNum.map(i => `<span class="unir-punto"></span>${marcoTematico('caja', `<b>${grupos[i].n}</b>`)}<span class="unir-punto"></span>`),
    ordenCubos.map(i => `<span class="unir-punto"></span><span class="unir-dibujo">${cubitos(grupos[i].n)}</span>`)
  ])}</div>`;
}

// mismo_resultado — "completar": une los dos montones que juntos hacen N.
function renderUnirParaHacer(datos) {
  const total = enteroValido(datos.total, 3, 10);
  if (total === null) return '';
  const icono = iconoValido(datos.icono);
  const partes = lista(datos.partes).map(n => enteroValido(n, 1, total - 1)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 5);
  if (partes.length < 2) return '';
  const orden = barajaDeterministaFig(partes.length, hashTextoFig(`hacer${total}:${partes.join(',')}`));
  const monton = n => `<span class="unir-dibujo uc-dibujos">${htmlIcono(icono).repeat(n)}</span>`;
  return `<div class="unir-conteo"><p class="cc-nota">Une los dos montones que juntos hacen <b>${total}</b>.</p>${unirRejilla([
    partes.map(n => `${monton(n)}<span class="unir-punto"></span>`),
    orden.map(i => `<span class="unir-punto"></span>${monton(total - partes[i])}`)
  ])}</div>`;
}

// recta_numerica — "senalar": ¿qué número señala cada flecha?
function renderRectaSenalar(datos) {
  const paso = [1, 2, 5, 10, 100].includes(enteroValido(datos.paso, 1, 100)) ? enteroValido(datos.paso, 1, 100) : 1;
  const desde = enteroValido(datos.desde, 0, 9999) ?? 0;
  let hasta = enteroValido(datos.hasta, 1, 99999) ?? desde + 20 * paso;
  let tramos = Math.round((hasta - desde) / paso);
  if (tramos < 5) tramos = 10;
  if (tramos > 25) tramos = 25;
  hasta = desde + tramos * paso;
  const numeros = lista(datos.numeros).map(n => enteroValido(n, desde, hasta)).filter(n => n !== null && (n - desde) % paso === 0)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 5);
  if (numeros.length === 0) return '';
  const X0 = 20, ANCHO = 560, dx = ANCHO / tramos;
  let svg = `<line class="red-linea" x1="${X0 - 8}" y1="50" x2="${X0 + ANCHO + 8}" y2="50"/>`;
  for (let i = 0; i <= tramos; i++) {
    const v = desde + i * paso, x = X0 + i * dx, gordo = i % 5 === 0;
    svg += `<line class="red-marca" x1="${x}" y1="${gordo ? 40 : 44}" x2="${x}" y2="${gordo ? 60 : 56}"/>`;
    if (numeros.includes(v)) svg += `<path class="red-flecha" d="M${x} 38 l-4 -8 h8 z"/><rect class="recta-caja" x="${x - 16}" y="2" width="32" height="26" rx="5"/>`;
    else if (gordo) svg += `<text class="red-extremo" x="${x}" y="76" text-anchor="middle">${v}</text>`;
  }
  return `<div class="recta-senalar"><svg width="${ANCHO + 2 * X0}" height="82" viewBox="0 0 ${ANCHO + 2 * X0} 82">${svg}</svg></div>`;
}

// comparar_numeros — "ordenar": ordena una lista con "<" o ">" entre casillas.
function renderOrdenarNumeros(datos) {
  const numeros = lista(datos.numeros).map(n => enteroValido(n, 0, 999999)).filter(n => n !== null)
    .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 7);
  if (numeros.length < 3) return '';
  const signo = datos.orden === 'mayor_a_menor' ? '&gt;' : '&lt;';
  return `<div class="ordenar-bloque">
    <p class="ordenar-numeros">${numeros.map(n => marcoTematico('caja', `<b>${n}</b>`)).join('')}</p>
    <p class="ordenar-nota">Ordena de ${datos.orden === 'mayor_a_menor' ? 'mayor a menor' : 'menor a mayor'}:</p>
    <p class="ordenar-casillas">${numeros.map(() => casillaRespuesta('casilla-ancha')).join(`<span class="ordenar-signo">${signo}</span>`)}</p>
  </div>`;
}

// medir_con_regla — "dibujar" (dibuja una línea de N cm), "leer" (qué marca
// cada flecha en la regla) y "cuadros" (cuántos cuadrados mide cada tira).
function renderReglaExtra(datos) {
  if (datos.modo === 'dibujar') {
    const largos = lista(datos.longitudes).map(n => enteroValido(n, 1, 15)).filter(n => n !== null).slice(0, 5);
    if (largos.length === 0) return '';
    return `<div class="regla-bloque">${largos.map(cm => `<div class="regla-dibujar"><span>Dibuja una línea de <b>${cm} cm</b>:</span><span class="regla-punto-inicio"></span></div>`).join('')}</div>`;
  }
  if (datos.modo === 'leer') {
    const marcas = lista(datos.marcas).map(n => enteroValido(n, 1, 14)).filter(n => n !== null)
      .filter((n, i, arr) => arr.indexOf(n) === i).slice(0, 4);
    if (marcas.length === 0) return '';
    const numeros = Array.from({ length: 16 }, (_, i) => `<span class="regla-marca" style="left:${i}cm;">${i}</span>`).join('');
    const flechas = marcas.map((cm, i) => `<span class="regla-flecha" style="left:${cm}cm;">▲<b>${String.fromCharCode(97 + i)}</b></span>`).join('');
    return `<div class="regla-bloque regla-leer">
      <div class="regla-guia"><div class="regla-linea"></div>${numeros}${flechas}</div>
      <p class="regla-respuestas">${marcas.map((_, i) => `<span>${String.fromCharCode(97 + i)}) ${casillaRespuesta()} cm</span>`).join('')}</p>
    </div>`;
  }
  const tiras = lista(datos.tiras).map(n => enteroValido(n, 1, 12)).filter(n => n !== null).slice(0, 5);
  if (tiras.length < 2) return '';
  return `<div class="tiras-bloque">${tiras.map((n, i) => `<div class="tiras-fila"><b>${String.fromCharCode(65 + i)}</b>
      <span class="tira">${'<i></i>'.repeat(n)}</span>${casillaRespuesta()}</div>`).join('')}
    <p class="tiras-pregunta">La más larga es ${casillaRespuesta()} y la más corta es ${casillaRespuesta()}</p></div>`;
}

// tabla_frecuencia — "grafico": true: debajo de la tabla, una cuadrícula para
// colorear un cuadro por cada dibujo contado, y preguntas.
function graficoParaColorear(datos) {
  const categorias = lista(datos.categorias).slice(0, 6);
  const alto = Math.min(10, Math.max(...categorias.map(c => Math.max(1, Math.min(10, parseInt(c.cantidad, 10) || 1)))) + 1);
  const columnas = categorias.map(c => `<div class="gc-columna">${'<span class="gc-cuadro"></span>'.repeat(alto)}<span class="gc-pie">${renderIconos(c.icono, 1)}</span></div>`).join('');
  const escala = `<div class="gc-escala">${Array.from({ length: alto }, (_, i) => `<span>${alto - i}</span>`).join('')}<span class="gc-pie"></span></div>`;
  return `<div class="gc-bloque"><p class="cc-nota">Colorea un cuadro por cada dibujo que has contado.</p><div class="gc-grafico">${escala}${columnas}</div>${listaPreguntas(datos.preguntas)}</div>`;
}


const RENDERERS_POR_TIPO = {
  operacion_vertical: (datos) => datos.prueba === true ? renderRestaConPrueba(datos) : datos.hueco === 'sumando' ? renderSumandoOculto(datos) : renderOperacionVertical(datos),
  multiplicacion_vertical: (datos) => renderMultiplicacionVertical(datos),
  division_vertical:  (datos) => renderDivisionVertical(datos),
  conteo_svg:          (datos) => datos.modo === 'unir' ? renderUnirConteo(datos) : renderConteoSvg(datos),
  calculo_mental:       (datos, curso) => renderCalculoMental(datos, curso),
  problema:             (datos, curso) => renderProblema(datos, curso),
  tipo_test:            (datos) => renderTipoTest(datos),
  dibujo:               () => renderDibujo(),
  serie_numerica:       (datos) => renderSerieNumerica(datos),
  comparar_numeros:     (datos) => datos.modo === 'ordenar' ? renderOrdenarNumeros(datos) : renderCompararNumeros(datos),
  tabla_frecuencia:     (datos, curso) => { const tabla = renderTablaFrecuencia(datos, curso); return tabla && datos.grafico === true && !['5º', '6º'].includes(curso) ? tabla + graficoParaColorear(datos) : tabla; },
  reloj_analogico:      (datos) => ['despues', 'elegir', 'tabla24'].includes(datos.modo) ? renderRelojExtra(datos) : renderRelojAnalogico(datos),
  grafico_barras:       (datos) => renderGraficoBarras(datos),
  grafico_quesitos:     (datos) => renderGraficoQuesitos(datos),
  resta_barritas:       (datos) => renderRestaBarritas(datos),
  suma_barritas:        (datos) => renderSumaBarritas(datos),
  cuadro_numerico:      (datos) => renderCuadroNumerico(datos),
  figura_geometrica:    (datos) => ['triangulos', 'circulo', 'objetos'].includes(datos.modo) ? renderFiguraExtra(datos) : renderFiguraGeometrica(datos),
  recta_numerica:       (datos) => datos.modo === 'senalar' ? renderRectaSenalar(datos) : renderRectaNumerica(datos),
  rejilla_numerica:     (datos) => datos.modo === 'recortes' ? renderRecortesTabla(datos) : renderRejillaNumerica(datos),
  tabla_multiplicar:    (datos) => renderTablaMultiplicar(datos),
  reparto:              (datos) => datos.resto === true ? renderRepartoConResto(datos) : renderReparto(datos),
  dinero_euros:            (datos) => renderDineroEuros(datos),
  proporcionalidad:        (datos) => renderProporcionalidad(datos),
  conversion_unidades:     (datos) => renderConversionUnidades(datos),
  medir_con_regla:         (datos) => ['dibujar', 'leer', 'cuadros'].includes(datos.modo) ? renderReglaExtra(datos) : renderMedirConRegla(datos),
  angulos:                 (datos) => renderAngulos(datos),
  simetria:                (datos) => datos.modo === 'eje' ? renderSimetriaEje(datos) : renderSimetria(datos),
  coordenadas:              (datos) => renderCoordenadas(datos),
  probabilidad:             (datos) => renderProbabilidad(datos),
  medidas_centralizacion:   (datos) => renderMedidasCentralizacion(datos),
  ecuacion_sencilla:        (datos) => {
    const extra = o => o && ['signo', 'ambos'].includes(o.posicionIncognita);
    const ops = lista(datos.operaciones);
    return renderEcuacionSencilla({ ...datos, operaciones: ops.filter(o => !extra(o)) }) + renderEcuacionExtra({ operaciones: ops.filter(extra) });
  },
  crucigrama:               (datos) => renderCrucigrama(datos),
  colorea_por_operacion:    (datos) => renderColoreaPorOperacion(datos),
  conecta_los_puntos:       (datos) => renderConectaLosPuntos(datos),
  numero_del_dia:           (datos) => renderNumeroDelDia(datos),
  pesar_con_balanza:        (datos) => renderPesarConBalanza(datos),
  medir_capacidad:          (datos) => renderMedirCapacidad(datos),
  mcd_mcm:                  (datos) => renderMcdMcm(datos),
  descomposicion_numerica:  (datos) => renderDescomposicionNumerica(datos),
  detective_numeros:        (datos) => renderDetectiveNumeros(datos),
  numeros_romanos:          (datos) => renderNumerosRomanos(datos),
  piramide_numerica:        (datos) => renderPiramideNumerica(datos),
  laberinto_operaciones:    (datos) => renderLaberintoOperaciones(datos),
  acertijo_numerico:        (datos) => renderAcertijoNumerico(datos),
  // Octava ampliación (22/09/2026) — fichas reales de 1º, 1ª evaluación
  abaco:                    (datos) => renderAbaco(datos),
  barritas_decenas:         (datos) => ['agrupar', 'operar'].includes(datos.modo) ? renderBarritasExtra(datos)
    : renderBarritasDecenas(datos) + (!datos.modo || datos.modo === 'contar' ? renderBarritasExtra(datos) : ''),
  numero_en_letras:         (datos) => renderNumeroEnLetras(datos),
  anterior_posterior:       (datos) => renderAnteriorPosterior(datos),
  casita_descomposicion:    (datos) => renderCasitaDescomposicion(datos),
  maquina_operador:         (datos) => renderMaquinaOperador(datos),
  clasificar_numeros:       (datos) => renderClasificarNumeros(datos),
  mismo_resultado:          (datos) => datos.modo === 'completar' ? renderUnirParaHacer(datos) : renderMismoResultado(datos),
  operacion_cifras_ocultas: (datos) => renderOperacionCifrasOcultas(datos),
  suma_asociativa:          (datos) => datos.modo === 'conmutativa' ? renderConmutativa(datos) : renderSumaAsociativa(datos),
  camino_resultados:        (datos) => renderCaminoResultados(datos),
  operacion_dibujos:        (datos) => renderOperacionDibujos(datos),
  // Novena ampliación (02/10/2026) — cuadernos de 1º y 2º
  fracciones:               (datos) => renderFracciones(datos),
  suma_repetida:            (datos) => renderSumaRepetida(datos),
  ordinales:                (datos) => renderOrdinales(datos),
  calendario:               (datos) => renderCalendario(datos),
  redondeo:                 (datos) => renderRedondeo(datos),
  encuentra_error:          (datos) => renderEncuentraError(datos),
  domino_operaciones:       (datos) => renderDominoOperaciones(datos),
  posicion_cuadricula:      (datos) => renderPosicionCuadricula(datos),
  comparar_cantidades:      (datos) => renderCompararCantidades(datos),
  recorrido_cuadricula:     (datos) => renderRecorridoCuadricula(datos),
  tipos_lineas:             (datos) => renderTiposLineas(datos),
  serie_figuras:            (datos) => renderSerieFiguras(datos),
  tabla_doble_entrada:      (datos) => renderTablaDobleEntrada(datos),
  sopa_operaciones:         (datos) => renderSopaOperaciones(datos),
  contar_figuras:           (datos) => renderContarFiguras(datos),
  elegir_unidad:            (datos) => renderElegirUnidad(datos),
  trazo_numero:             (datos) => renderTrazoNumero(datos)
};


// ── Normalización y agrupado de operaciones (23/09/2026) ─────────────────
// Motivo: en una ficha real de 6º las multiplicaciones y divisiones salieron
// con su enunciado pero SIN ninguna cuenta, y tres sumas salieron como tres
// ejercicios sueltos. Causa: si Claude se desvía un poco del esquema (un
// nombre de tipo parecido, "numeros" con otra forma, el signo × dentro de
// operacion_vertical...), el renderer no encontraba lo que esperaba y no
// dibujaba nada. En vez de depender de que el modelo acierte siempre la
// forma exacta, se normaliza aquí antes de dibujar:
const ALIAS_TIPOS = {
  multiplicacion: 'multiplicacion_vertical', multiplicaciones: 'multiplicacion_vertical',
  multiplicacion_columna: 'multiplicacion_vertical', multiplicacion_en_columna: 'multiplicacion_vertical',
  division: 'division_vertical', divisiones: 'division_vertical', division_columna: 'division_vertical',
  division_en_columna: 'division_vertical',
  suma: 'operacion_vertical', sumas: 'operacion_vertical', resta: 'operacion_vertical', restas: 'operacion_vertical',
  operacion_columna: 'operacion_vertical', operacion_en_columna: 'operacion_vertical', operaciones: 'operacion_vertical'
};
const SIGNOS_MULTIPLICAR = ['x', 'X', '×', '*', '·'];
const SIGNOS_DIVIDIR = [':', '÷', '/'];

function normalizarOperacion(op) {
  if (Array.isArray(op)) return { numeros: op };
  if (!op || typeof op !== 'object') return null;
  const o = { ...op };
  if (!Array.isArray(o.numeros)) {
    if (o.multiplicando !== undefined && o.multiplicador !== undefined) o.numeros = [o.multiplicando, o.multiplicador];
    else if (o.dividendo !== undefined && o.divisor !== undefined) o.numeros = [o.dividendo, o.divisor];
    else if (o.a !== undefined && o.b !== undefined) o.numeros = [o.a, o.b];
    else if (Array.isArray(o.operandos)) o.numeros = o.operandos;
    else if (Array.isArray(o.sumandos)) o.numeros = o.sumandos;
  }
  return Array.isArray(o.numeros) && o.numeros.length >= 2 ? o : null;
}

function normalizarEjercicio(ej) {
  if (!ej || typeof ej !== 'object') return ej;
  const tipoOriginal = String(ej.tipo || '').trim().toLowerCase();
  let tipo = RENDERERS_POR_TIPO[tipoOriginal] ? tipoOriginal : (ALIAS_TIPOS[tipoOriginal] || tipoOriginal);
  const datos = { ...(ej.datos || {}) };
  const esOperacion = ['operacion_vertical', 'multiplicacion_vertical', 'division_vertical'].includes(tipo);
  if (esOperacion) {
    let ops = Array.isArray(datos.operaciones) ? datos.operaciones
      : Array.isArray(datos.numeros) ? [{ numeros: datos.numeros, signo: datos.signo }]
      : datos.operacion ? [datos.operacion] : [];
    ops = ops.map(normalizarOperacion).filter(Boolean);
    // El signo manda sobre el nombre del tipo: una "operacion_vertical" con
    // signo × o : se dibuja como multiplicación o división de verdad.
    if (tipo === 'operacion_vertical' && ops.length) {
      if (ops.every(o => SIGNOS_MULTIPLICAR.includes(String(o.signo)))) tipo = 'multiplicacion_vertical';
      else if (ops.every(o => SIGNOS_DIVIDIR.includes(String(o.signo)))) tipo = 'division_vertical';
    }
    datos.operaciones = ops;
    delete datos.numeros;
  }
  let enunciado = ej.enunciado;
  let titulo = ej.titulo;
  // Gráficos: si la IA mete las preguntas dentro del enunciado en vez de en
  // "preguntas", se sacan de ahí para que cada una salga en su línea con su
  // raya de respuesta (02/10/2026).
  if (tipo === 'grafico_barras' && !(Array.isArray(datos.preguntas) && datos.preguntas.length) && typeof enunciado === 'string') {
    const encontradas = enunciado.match(/¿[^?¿]+\?/g);
    if (encontradas && encontradas.length) {
      datos.preguntas = encontradas.map(p => p.trim());
      enunciado = enunciado.replace(/¿[^?¿]+\?/g, '').replace(/[\s:;,.]+$/, '').trim();
      enunciado = enunciado ? enunciado + '.' : 'Observa y contesta.';
    }
  }
  // Tabla de sumar/restar: un título "Tabla del 5" se entiende como de multiplicar.
  if (tipo === 'tabla_multiplicar' && ['suma', 'resta'].includes(datos.operacion) && typeof titulo === 'string' && /^\s*tabla\s+del\b/i.test(titulo)) {
    titulo = titulo.replace(/^\s*tabla\s+del\s*[+−-]?\s*/i, datos.operacion === 'suma' ? 'Tabla de sumar del ' : 'Tabla de restar del ');
  }
  return { ...ej, tipo, datos, enunciado, titulo };
}

// Agrupa ejercicios de cuentas en columna CONSECUTIVOS del mismo tipo con una
// sola operación cada uno (el síntoma "tres sumas como tres ejercicios") en un
// único ejercicio de hasta 4 operaciones — el título y el enunciado son los
// del primero. Solo de 3º a 6º: en 1º-2º cada cuenta lleva su propio dibujo
// y DEBE ir sola (ver separarOperacionesParaDibujos).
const TIPOS_AGRUPABLES = ['operacion_vertical', 'multiplicacion_vertical', 'division_vertical'];
function agruparOperacionesSueltas(ejercicios, curso) {
  if (['1º', '2º'].includes(curso)) return ejercicios;
  const resultado = [];
  for (const ej of ejercicios) {
    const anterior = resultado[resultado.length - 1];
    const suelta = ej && TIPOS_AGRUPABLES.includes(ej.tipo) && !ej.datos?.colocar && !ej.datos?.prueba && !ej.datos?.hueco
      && Array.isArray(ej.datos?.operaciones) && ej.datos.operaciones.length === 1;
    if (suelta && anterior && anterior._agrupable && anterior.tipo === ej.tipo && anterior.datos.operaciones.length < 4) {
      anterior.datos = { ...anterior.datos, operaciones: [...anterior.datos.operaciones, ...ej.datos.operaciones] };
      continue;
    }
    resultado.push(suelta ? { ...ej, datos: { ...ej.datos }, _agrupable: true } : ej);
  }
  return resultado.map(ej => { if (ej && ej._agrupable) { const { _agrupable, ...resto } = ej; return resto; } return ej; });
}

function contenidoEjercicio(ejercicio, curso) {
  const render = RENDERERS_POR_TIPO[ejercicio.tipo];
  return render ? render(ejercicio.datos || {}, curso) : '';
}

function renderEjercicio(ejercicio, indice, curso, contenidoYaCalculado) {
  const contenido = contenidoYaCalculado !== undefined ? contenidoYaCalculado : contenidoEjercicio(ejercicio, curso);

  // Blindaje contra duplicación: para "problema", el texto de la historia YA
  // se imprime dentro de renderProblema() (campo "datos.texto"). Si además se
  // imprimiera "ejercicio.enunciado" tal cual, y Claude ha vuelto a escribir
  // el mismo enunciado ahí (que es lo que hace a veces), el problema aparece
  // dos veces. Por eso aquí NUNCA se usa "ejercicio.enunciado" para tipo
  // "problema" — se sustituye por una instrucción fija, decidida por código.
  const modoProblema = ejercicio.datos && ejercicio.datos.modo;
  const textoEncabezado = ejercicio.tipo === 'problema'
    ? (modoProblema === 'razonado' ? 'Lee y subraya la pregunta.'
      : modoProblema === 'inventar' ? 'Inventa preguntas diferentes para esta situación.'
      : 'Lee el problema y resuélvelo:')
    : ejercicio.tipo === 'conecta_los_puntos' ? enunciadoConecta(ejercicio.datos)
    : ejercicio.enunciado;

  // "ancho": "medio" → el ejercicio ocupa media ficha (dos seguidos quedan
  // uno al lado del otro). "recuerda": recuadro de ayuda al pie del ejercicio.
  const medio = ejercicio.ancho === 'medio' ? ' ejercicio-medio' : '';
  const recuerda = typeof ejercicio.recuerda === 'string' && ejercicio.recuerda.trim()
    ? `<p class="recuerda"><b>Recuerda</b>${escapeHtml(ejercicio.recuerda.trim().slice(0, 220))}</p>` : '';
  return `<div class="ejercicio${medio}">
    ${cabeceraEjercicio(indice + 1, ejercicio.titulo, textoEncabezado)}
    ${contenido}${recuerda ? '\n    ' + recuerda : ''}
  </div>`;
}

/**
 * Punto de entrada del módulo. Recibe el JSON pedagógico devuelto por Claude
 * (solo { titulo, ejercicios: [...] }) y el contexto conocido por el servidor
 * (curso, materia, comunidad, colegio), y devuelve el HTML final de la ficha.
 * La cabecera, el pie de página y la clase "curso-inicial" los decide el
 * código a partir del contexto — Claude ya no tiene que acertarlos.
 */
// Blindaje para 1º-2º: cada operación necesita su propio dibujo, y el campo
// "svg" de un ejercicio solo puede representar UNA operación. Si el modelo
// agrupa varias operaciones en el mismo ejercicio pese a la instrucción del
// prompt, las separamos aquí en ejercicios individuales — la primera se
// queda con el "svg" original (es la que de verdad representaba), el resto
// queda sin icono en vez de desaparecer silenciosamente sin que se note.
function separarOperacionesParaDibujos(ejercicios, curso) {
  const esConDibujos = ['1º', '2º'].includes(curso);
  if (!esConDibujos) return ejercicios;

  const resultado = [];
  for (const ej of ejercicios) {
    const operaciones = ej?.datos?.operaciones;
    if (ej.tipo === 'operacion_vertical' && !ej.datos.colocar && !ej.datos.prueba && !ej.datos.hueco && Array.isArray(operaciones) && operaciones.length > 1) {
      operaciones.forEach((op, idx) => {
        resultado.push({
          ...ej,
          datos: { ...ej.datos, operaciones: [op], svg: idx === 0 ? ej.datos.svg : null }
        });
      });
    } else {
      resultado.push(ej);
    }
  }
  return resultado;
}

// Etiquetas opcionales bajo el título (02/10/2026): nivel de la ficha
// (Repaso / Refuerzo / Ampliación) y tiempo estimado. Si no llegan, no se
// imprime nada y la ficha queda como siempre.
const NIVELES_FICHA = { repaso: 'Repaso', refuerzo: 'Refuerzo', ampliacion: 'Ampliación', 'ampliación': 'Ampliación' };
export function etiquetasFicha(datosFicha) {
  const nivel = NIVELES_FICHA[String(datosFicha.nivel || '').trim().toLowerCase()];
  const minutos = parseInt(datosFicha.minutos, 10);
  const piezas = [];
  if (nivel) piezas.push(`<span class="etiqueta-nivel">${nivel}</span>`);
  if (Number.isInteger(minutos) && minutos >= 5 && minutos <= 90) piezas.push(`<span class="etiqueta-tiempo">${minutos} min</span>`);
  return piezas.length ? `\n    <p class="etiquetas-ficha">${piezas.join('')}</p>` : '';
}

export function renderizarFichaMatematicas(datosFicha, contexto) {
  const { curso, materia, comunidad, colegio } = contexto;
  const esInicial = ['1º', '2º', '3º'].includes(curso);

  // Familia tipográfica por curso (05/08/2026, a validar): Nunito en 1º-2º,
  // Quicksand en 3º-4º, Andika (por defecto, sin clase extra) en 5º-6º.
  // Independiente de "curso-inicial", que solo controla el tamaño.
  let claseFuente = '';
  if (['1º', '2º'].includes(curso)) claseFuente = 'fuente-nunito';
  else if (['3º', '4º'].includes(curso)) claseFuente = 'fuente-quicksand';

  const claseFicha = ['ficha', esInicial ? 'curso-inicial' : '', claseFuente]
    .filter(Boolean)
    .join(' ');

  const titulo = escapeHtml(datosFicha.titulo || `Ficha de ${materia}`);
  const ejerciciosNormalizados = (Array.isArray(datosFicha.ejercicios) ? datosFicha.ejercicios : []).map(normalizarEjercicio);
  const ejercicios = separarOperacionesParaDibujos(agruparOperacionesSueltas(ejerciciosNormalizados, curso), curso);

  // Un ejercicio que no dibuja nada (tipo desconocido o datos inservibles) se
  // descarta en vez de imprimir un enunciado sin nada debajo — y se avisa en
  // la consola del servidor con sus datos, para poder diagnosticarlo.
  const conContenido = [];
  ejercicios.forEach(ej => {
    const contenido = contenidoEjercicio(ej, curso);
    if (contenido && contenido.trim()) conContenido.push({ ej, contenido });
    else console.warn(`⚠️ Ejercicio descartado por no tener contenido dibujable — tipo "${ej?.tipo}":`, JSON.stringify(ej?.datos || {}).slice(0, 300));
  });
  const cuerpoEjercicios = conContenido.map(({ ej, contenido }, i) => renderEjercicio(ej, i, curso, contenido)).join('');

  // Nombre del centro (30/08/2026): separado del cajón de Nombre/Fecha —
  // antes iba dentro de ".cabecera", pegado a esos datos, y el docente pidió
  // que quedara visualmente aparte (sin cajón propio, pero por encima). Va
  // FUERA de ".cabecera" a propósito, como línea suelta antes del cajón.
  const lineaCentro = colegio
    ? `<p class="cabecera-centro">${escapeHtml(colegio)}</p>`
    : '';

  return `<div class="${claseFicha}">
    ${lineaCentro}
    <div class="cabecera">
      <div class="cabecera-datos">
        <p><strong>Nombre:</strong> <span class="hueco-nombre"></span></p>
        <p><strong>Fecha:</strong> <span class="hueco-fecha"></span></p>
      </div>
    </div>
    <h1 class="titulo-ficha">${titulo}</h1>${etiquetasFicha(datosFicha)}
    ${cuerpoEjercicios}
    <p class="nota-pie">Ficha generada con LOMLOE · ${escapeHtml(curso)} · ${escapeHtml(materia)} · ${escapeHtml(comunidad || 'LOMLOE estatal')}</p>
  </div>`;
}
