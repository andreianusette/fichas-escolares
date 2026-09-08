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

export const ICONOS_DISPONIBLES = Object.keys(ICONOS);

// Export del objeto completo (nombre -> SVG), usado por el nuevo endpoint
// /api/iconos para que el formulario pueda mostrar una vista previa visual
// de cada icono al docente (selector de iconos antes de generar, 11/08/2026).
export const ICONOS_SVG = ICONOS;

// ─────────────────────────────────────────────────────────────────
// FIGURAS GEOMÉTRICAS (13/08/2026) — catálogo separado de ICONOS: aquí no
// son "objetos para contar" sino figuras curriculares con propiedades
// pedagógicas (lados/vértices en 2D, caras/aristas/vértices en 3D), usadas
// por el tipo de ejercicio "figura_geometrica". Reutiliza el SVG de algunas
// figuras que ya existían en ICONOS (mismo trazo, para que el estilo visual
// sea coherente en toda la ficha) y añade las que faltaban.
// ─────────────────────────────────────────────────────────────────
const SVG_TRIANGULO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l9 17h-18z\"/></svg>";
const SVG_ROMBO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3l9 9l-9 9l-9 -9z\"/></svg>";
const SVG_TRAPECIO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 6h8l5 12h-18z\"/></svg>";
const SVG_CUBO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 9v10h10v-10z\"/><path d=\"M4 9l6 -6h10l-6 6z\"/><path d=\"M14 9l6 -6v10l-6 6z\"/></svg>";
const SVG_PRISMA = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6v15h10v-15z\"/><path d=\"M4 6l6 -4h10l-6 4z\"/><path d=\"M14 6l6 -4v15l-6 4z\"/></svg>";
const SVG_PIRAMIDE = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 13l9 5l-9 5l-9 -5z\"/><path d=\"M12 2l-9 16\"/><path d=\"M12 2l9 16\"/><path d=\"M12 2l0 11\"/></svg>";
const SVG_CONO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"12\" cy=\"19\" rx=\"8\" ry=\"3\"/><path d=\"M12 2l-8 17\"/><path d=\"M12 2l8 17\"/></svg>";
const SVG_CILINDRO = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><ellipse cx=\"12\" cy=\"5\" rx=\"8\" ry=\"3\"/><path d=\"M4 5v14\"/><path d=\"M20 5v14\"/><path d=\"M4 19a8 3 0 0 0 16 0\"/></svg>";
const SVG_ESFERA = "<svg width=\"60\" height=\"60\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#000\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12a9 4 0 0 0 18 0\"/><path d=\"M3 12a9 4 0 0 1 18 0\"/></svg>";

// Figuras planas: { nombre visible, lados, vértices, svg }.
const FIGURAS_2D = {
  triangulo:   { nombre: 'triángulo',  lados: 3, vertices: 3, svg: SVG_TRIANGULO },
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
  cubo:     { nombre: 'cubo',              caras: 6, aristas: 12, vertices: 8, svg: SVG_CUBO },
  prisma:   { nombre: 'prisma rectangular', caras: 6, aristas: 12, vertices: 8, svg: SVG_PRISMA },
  piramide: { nombre: 'pirámide',          caras: 5, aristas: 8,  vertices: 5, svg: SVG_PIRAMIDE },
  cono:     { nombre: 'cono',              caras: 2, aristas: 1,  vertices: 1, svg: SVG_CONO },
  cilindro: { nombre: 'cilindro',          caras: 3, aristas: 2,  vertices: 0, svg: SVG_CILINDRO },
  esfera:   { nombre: 'esfera',            caras: 1, aristas: 0,  vertices: 0, svg: SVG_ESFERA }
};

export const FIGURAS_2D_DISPONIBLES = Object.keys(FIGURAS_2D);
export const FIGURAS_3D_DISPONIBLES = Object.keys(FIGURAS_3D);

function buscarFigura(nombre) {
  return FIGURAS_2D[nombre] || FIGURAS_3D[nombre] || null;
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


function renderIconos(nombreIcono, cantidad) {
  const svg = ICONOS[nombreIcono] || ICONOS.estrella;
  const n = Math.max(1, Math.min(10, parseInt(cantidad, 10) || 1));
  return svg.repeat(n);
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

  // Distribución en N columnas paralelas si el docente lo pidió explícitamente.
  const n = parseInt(datos.columnasParalelas, 10);
  if (n >= 2 && n <= 4 && operaciones.length > n) {
    const porBloque = Math.ceil(operaciones.length / n);
    const bloques = [];
    for (let i = 0; i < operaciones.length; i += porBloque) {
      const grupo = operaciones.slice(i, i + porBloque).map(renderOperacionColumna).join('');
      bloques.push(`<div class="columna-bloque"><div class="grid-operaciones">${grupo}</div></div>`);
    }
    return `<div class="distribucion-columnas">${bloques.join('')}</div>`;
  }

  return `<div class="grid-operaciones">${columnasHtml}</div>`;
}

function renderConteoSvg(datos) {
  return `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin:10px 0; max-width:340px; margin-left:auto; margin-right:auto;">${renderIconos(datos.icono, datos.cantidad)}</div>`;
}

function renderCalculoMental(datos) {
  const operaciones = Array.isArray(datos.operaciones) ? datos.operaciones : [];
  const items = operaciones
    .map(op => `<li>${escapeHtml(op.texto)} <span class="hueco hueco-corto"></span></li>`)
    .join('');
  return `<ol class="ejercicio-lista">${items}</ol>`;
}

// El formato visual del problema lo decide el CURSO (código), no Claude.
function renderProblema(datos, curso) {
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

  const iconosHtml = categorias
    .map(c => `<span class="tf-grupo-iconos">${renderIconos(c.icono, c.cantidad)}</span>`)
    .join('');

  const filasTabla = categorias.map(c => `
    <tr>
      <td class="tf-celda-icono">${renderIconos(c.icono, 1)}</td>
      <td class="tf-hueco"></td>
      <td class="tf-hueco"></td>
    </tr>`).join('');

  return `<div class="tabla-frecuencia-bloque">
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

  const respuesta = modo === 'leer' ? `<span class="reloj-respuesta">___ : ___</span>` : '';

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

  return `<div class="grafico-barras-bloque">${listaDatos}${svg}</div>`;
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

function renderRestaBarritas(datos) {
  let minuendo = parseInt(datos.minuendo, 10);
  let sustraendo = parseInt(datos.sustraendo, 10);
  if (!Number.isInteger(minuendo)) minuendo = 0;
  if (!Number.isInteger(sustraendo)) sustraendo = 0;
  // Blindaje: el minuendo nunca puede ser menor que el sustraendo — si el
  // JSON llega mal, se corrige aquí en vez de dibujar una resta imposible.
  if (sustraendo > minuendo) { const tmp = minuendo; minuendo = sustraendo; sustraendo = tmp; }

  const modoDibujar = datos.modo === 'dibujar';

  const cajaGrupo = (numero) => modoDibujar
    ? `<div class="resta-barritas-caja resta-barritas-caja-vacia"></div>`
    : `<div class="resta-barritas-caja">${renderBarritas(numero)}</div>`;

  return `<div class="resta-barritas-bloque">
    <p class="resta-barritas-operacion">${minuendo} − ${sustraendo} = <span class="hueco hueco-corto"></span></p>
    <div class="resta-barritas-grupos">
      <div class="resta-barritas-grupo">
        <span class="resta-barritas-numero">${minuendo}</span>
        ${cajaGrupo(minuendo)}
      </div>
      <div class="resta-barritas-grupo">
        <span class="resta-barritas-numero">${sustraendo}</span>
        ${cajaGrupo(sustraendo)}
      </div>
    </div>
  </div>`;
}

// ── Recta numérica ───────────────────────────────────────────────────────
// Recta horizontal de 0 a un máximo, con el número de partida ("a")
// resaltado con una caja y los saltos de la operación marcados con arcos
// discontinuos (hacia atrás en restas, hacia delante en sumas) — el mismo
// recurso visual "saltamos hacia atrás/delante" de los libros de texto. El
// sistema NUNCA marca ni escribe el resultado, solo deja un hueco.
function renderRectaNumerica(datos) {
  const op = datos.operacion || {};
  const a = Math.max(0, Math.round(numeroDesdeJSON(op.a)));
  const b = Math.max(0, Math.round(numeroDesdeJSON(op.b)));
  const esResta = op.signo !== '+';

  const destino = esResta ? a - b : a + b;

  let rangoMax = parseInt(datos.rangoMax, 10);
  if (!Number.isInteger(rangoMax) || rangoMax < 1) {
    rangoMax = Math.max(a, destino) + 3;
  }
  // Blindaje: una recta con demasiadas marcas deja de leerse bien impresa.
  rangoMax = Math.max(Math.max(a, destino), Math.min(rangoMax, 30));

  const paso = 26;
  const margen = 16;
  const yLinea = 46;
  const anchoTotal = margen * 2 + rangoMax * paso;
  const altoTotal = 78;

  let ticks = '';
  let numeros = '';
  for (let i = 0; i <= rangoMax; i++) {
    const x = margen + i * paso;
    ticks += `<line x1="${x}" y1="${yLinea - 5}" x2="${x}" y2="${yLinea + 5}" stroke="#334155" stroke-width="1.5"/>`;
    numeros += `<text x="${x}" y="${yLinea + 22}" font-size="12" text-anchor="middle" font-family="Arial">${i}</text>`;
  }
  const lineaBase = `<line x1="${margen}" y1="${yLinea}" x2="${anchoTotal - margen}" y2="${yLinea}" stroke="#334155" stroke-width="2"/>`;

  const xInicio = margen + a * paso;
  const cajaInicio = `<rect x="${xInicio - 11}" y="${yLinea - 11}" width="22" height="22" fill="none" class="recta-numerica-caja-inicio" rx="4"/>`;

  let saltos = '';
  const desde = Math.min(a, destino);
  const hasta = Math.max(a, destino);
  for (let i = desde; i < hasta; i++) {
    const x1 = margen + i * paso;
    const x2 = margen + (i + 1) * paso;
    const xMedio = (x1 + x2) / 2;
    saltos += `<path d="M${x1} ${yLinea} Q${xMedio} ${(yLinea - 22).toFixed(1)} ${x2} ${yLinea}" fill="none" class="recta-numerica-salto"/>`;
  }

  const svg = `<svg width="${anchoTotal}" height="${altoTotal}" viewBox="0 0 ${anchoTotal} ${altoTotal}">
    ${lineaBase}${ticks}${numeros}${saltos}${cajaInicio}
  </svg>`;

  return `<div class="recta-numerica-bloque">
    <p class="recta-numerica-operacion">${a} ${esResta ? '−' : '+'} ${b} = <span class="hueco hueco-corto"></span></p>
    <div class="recta-numerica-svg">${svg}</div>
  </div>`;
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

  const filaHtml = (factor) => `<div class="tm-fila">
      <span class="tm-texto">${tabla} × ${factor} =</span>
      <span class="hueco hueco-corto"></span>
    </div>`;

  const columnaIzquierda = [1, 2, 3, 4, 5].map(filaHtml).join('');
  const columnaDerecha = [6, 7, 8, 9, 10].map(filaHtml).join('');

  return `<div class="tabla-multiplicar-bloque">
    <p class="tabla-multiplicar-titulo">Tabla del ${tabla}</p>
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
  const svgIcono = ICONOS[nombreIcono];
  const objetos = svgIcono.repeat(total);

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

function renderFiguraGeometrica(datos) {
  if (datos.modo === 'identificar') return renderFiguraIdentificar(datos);
  if (datos.modo === 'propiedades') return renderFiguraPropiedades(datos);
  if (datos.modo === 'clasificar') return renderFiguraClasificar(datos);
  if (datos.modo === 'perimetro_area') return renderFiguraPerimetroArea(datos);
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
  barco: [[30, 140], [30, 80], [100, 20], [100, 80], [170, 80], [150, 140]]
};
export const PLANTILLAS_CONECTA_PUNTOS_DISPONIBLES = Object.keys(PLANTILLAS_CONECTA_PUNTOS);
function renderConectaLosPuntos(datos) {
  const plantilla = PLANTILLAS_CONECTA_PUNTOS[datos.plantilla] ? datos.plantilla : 'estrella';
  const puntos = PLANTILLAS_CONECTA_PUNTOS[plantilla];
  let paso = parseInt(datos.paso, 10);
  if (!Number.isInteger(paso) || paso < 1) paso = 1;
  paso = Math.min(paso, 10);
  let inicio = parseInt(datos.inicio, 10);
  if (!Number.isInteger(inicio) || inicio < 0) inicio = paso;

  const marcas = puntos.map(([x, y], i) => {
    const numero = inicio + i * paso;
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="#000"/><text x="${x + 6}" y="${y - 6}" font-size="11" font-family="Arial">${numero}</text>`;
  }).join('');

  return `<div class="conecta-puntos-bloque">
    <svg width="200" height="200" viewBox="0 0 200 200">${marcas}</svg>
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

  const primerMarco = Math.min(numero, 10);
  const segundoMarco = numero > 10 ? svgMarcoDiez(numero - 10) : '';

  const iconoHtml = datos.icono && ICONOS[datos.icono]
    ? `<div class="numero-dia-iconos">${renderIconos(datos.icono, Math.min(numero, 10))}</div>`
    : '';

  return `<div class="numero-dia-bloque">
    <p class="numero-dia-trazar">${numero}</p>
    <div class="numero-dia-marcos">
      ${svgMarcoDiez(primerMarco)}
      ${segundoMarco}
    </div>
    ${iconoHtml}
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

const RENDERERS_POR_TIPO = {
  operacion_vertical: (datos) => renderOperacionVertical(datos),
  multiplicacion_vertical: (datos) => renderMultiplicacionVertical(datos),
  division_vertical:  (datos) => renderDivisionVertical(datos),
  conteo_svg:          (datos) => renderConteoSvg(datos),
  calculo_mental:       (datos) => renderCalculoMental(datos),
  problema:             (datos, curso) => renderProblema(datos, curso),
  tipo_test:            (datos) => renderTipoTest(datos),
  dibujo:               () => renderDibujo(),
  serie_numerica:       (datos) => renderSerieNumerica(datos),
  comparar_numeros:     (datos) => renderCompararNumeros(datos),
  tabla_frecuencia:     (datos, curso) => renderTablaFrecuencia(datos, curso),
  reloj_analogico:      (datos) => renderRelojAnalogico(datos),
  grafico_barras:       (datos) => renderGraficoBarras(datos),
  grafico_quesitos:     (datos) => renderGraficoQuesitos(datos),
  resta_barritas:       (datos) => renderRestaBarritas(datos),
  cuadro_numerico:      (datos) => renderCuadroNumerico(datos),
  figura_geometrica:    (datos) => renderFiguraGeometrica(datos),
  recta_numerica:       (datos) => renderRectaNumerica(datos),
  rejilla_numerica:     (datos) => renderRejillaNumerica(datos),
  tabla_multiplicar:    (datos) => renderTablaMultiplicar(datos),
  reparto:              (datos) => renderReparto(datos),
  dinero_euros:            (datos) => renderDineroEuros(datos),
  proporcionalidad:        (datos) => renderProporcionalidad(datos),
  conversion_unidades:     (datos) => renderConversionUnidades(datos),
  medir_con_regla:         (datos) => renderMedirConRegla(datos),
  angulos:                 (datos) => renderAngulos(datos),
  simetria:                (datos) => renderSimetria(datos),
  coordenadas:              (datos) => renderCoordenadas(datos),
  probabilidad:             (datos) => renderProbabilidad(datos),
  medidas_centralizacion:   (datos) => renderMedidasCentralizacion(datos),
  ecuacion_sencilla:        (datos) => renderEcuacionSencilla(datos),
  crucigrama:               (datos) => renderCrucigrama(datos),
  colorea_por_operacion:    (datos) => renderColoreaPorOperacion(datos),
  conecta_los_puntos:       (datos) => renderConectaLosPuntos(datos),
  numero_del_dia:           (datos) => renderNumeroDelDia(datos),
  pesar_con_balanza:        (datos) => renderPesarConBalanza(datos),
  medir_capacidad:          (datos) => renderMedirCapacidad(datos),
  mcd_mcm:                  (datos) => renderMcdMcm(datos),
  descomposicion_numerica:  (datos) => renderDescomposicionNumerica(datos),
  detective_numeros:        (datos) => renderDetectiveNumeros(datos),
  numeros_romanos:          (datos) => renderNumerosRomanos(datos)
};

function renderEjercicio(ejercicio, indice, curso) {
  const render = RENDERERS_POR_TIPO[ejercicio.tipo];
  const contenido = render ? render(ejercicio.datos || {}, curso) : '';

  // Blindaje contra duplicación: para "problema", el texto de la historia YA
  // se imprime dentro de renderProblema() (campo "datos.texto"). Si además se
  // imprimiera "ejercicio.enunciado" tal cual, y Claude ha vuelto a escribir
  // el mismo enunciado ahí (que es lo que hace a veces), el problema aparece
  // dos veces. Por eso aquí NUNCA se usa "ejercicio.enunciado" para tipo
  // "problema" — se sustituye por una instrucción fija, decidida por código.
  const textoEncabezado = ejercicio.tipo === 'problema'
    ? 'Lee el problema y resuélvelo:'
    : ejercicio.enunciado;

  return `<div class="ejercicio">
    <p class="enunciado"><span class="numero-ejercicio">${indice + 1}</span><span class="texto-enunciado">${escapeHtml(textoEncabezado)}</span></p>
    ${contenido}
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
    if (ej.tipo === 'operacion_vertical' && Array.isArray(operaciones) && operaciones.length > 1) {
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
  const ejercicios = separarOperacionesParaDibujos(
    Array.isArray(datosFicha.ejercicios) ? datosFicha.ejercicios : [],
    curso
  );
  const cuerpoEjercicios = ejercicios.map((ej, i) => renderEjercicio(ej, i, curso)).join('');

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
    <h1 class="titulo-ficha">${titulo}</h1>
    ${cuerpoEjercicios}
    <p class="nota-pie">Ficha generada con LOMLOE · ${escapeHtml(curso)} · ${escapeHtml(materia)} · ${escapeHtml(comunidad || 'LOMLOE estatal')}</p>
  </div>`;
}
