// Comprime los dibujos a color del banco (public/imagenes-color) SIN cambiarles
// el nombre ni el formato: siguen siendo PNG con fondo transparente, pero con
// una paleta de 256 colores (unas diez veces menos peso, sin diferencia a la
// vista). Se puede lanzar tantas veces como haga falta: los que ya están
// comprimidos se saltan, así que sirve también cuando lleguen dibujos nuevos.
//
//   Uso (desde la carpeta del proyecto):   node scripts/comprimir-dibujos.mjs
//   Otra carpeta:                          node scripts/comprimir-dibujos.mjs public/otra-carpeta
//
// Necesita "sharp" (una sola vez):          npm install --save-dev sharp
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const carpeta = path.resolve(raiz, process.argv[2] || 'public/imagenes-color');
const archivos = fs.readdirSync(carpeta).filter(f => f.toLowerCase().endsWith('.png')).sort();

let antes = 0, despues = 0, comprimidos = 0, saltados = 0, fallidos = 0;
for (const nombre of archivos) {
  const ruta = path.join(carpeta, nombre);
  const original = fs.readFileSync(ruta);
  antes += original.length;
  try {
    // Byte 25 de un PNG = tipo de color; 3 = ya tiene paleta (ya comprimido).
    if (original[25] === 3) { saltados++; despues += original.length; continue; }
    const nuevo = await sharp(original)
      .png({ palette: true, colours: 256, quality: 80, effort: 10, compressionLevel: 9 })
      .toBuffer();
    if (nuevo.length >= original.length) { saltados++; despues += original.length; continue; }
    // Se escribe primero en un archivo temporal: si algo falla a medias, el
    // dibujo original sigue intacto.
    fs.writeFileSync(ruta + '.tmp', nuevo);
    fs.renameSync(ruta + '.tmp', ruta);
    despues += nuevo.length;
    comprimidos++;
  } catch (e) {
    fallidos++;
    despues += original.length;
    console.warn(`  no se pudo comprimir ${nombre}: ${e.message}`);
  }
}
const mb = (b) => (b / 1024 / 1024).toFixed(1) + ' MB';
console.log(`${carpeta}`);
console.log(`${archivos.length} dibujos · ${comprimidos} comprimidos · ${saltados} ya estaban bien · ${fallidos} con error`);
console.log(`Antes: ${mb(antes)}  →  Ahora: ${mb(despues)}`);
