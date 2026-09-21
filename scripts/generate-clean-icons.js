import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function decodePng(buffer) {
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idats = [];

  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + len);
    offset += 12 + len;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const inflated = zlib.inflateSync(Buffer.concat(idats));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;
  const rowSize = width * bpp + 1;
  const pixels = Buffer.alloc(width * height * 4);

  const prevRow = Buffer.alloc(width * bpp);
  const currRow = Buffer.alloc(width * bpp);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filter = inflated[y * rowSize];
    const lineData = inflated.subarray(y * rowSize + 1, y * rowSize + 1 + width * bpp);

    for (let i = 0; i < lineData.length; i++) {
      const x = i % bpp;
      const left = i >= bpp ? currRow[i - bpp] : 0;
      const up = prevRow[i];
      const upLeft = i >= bpp ? prevRow[i - bpp] : 0;
      let val = lineData[i];

      if (filter === 1) val = (val + left) & 255;
      else if (filter === 2) val = (val + up) & 255;
      else if (filter === 3) val = (val + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) val = (val + paeth(left, up, upLeft)) & 255;

      currRow[i] = val;
    }

    currRow.copy(prevRow);

    for (let x = 0; x < width; x++) {
      const srcPx = x * bpp;
      const dstPx = (y * width + x) * 4;
      if (bpp === 4) {
        pixels[dstPx] = currRow[srcPx];
        pixels[dstPx + 1] = currRow[srcPx + 1];
        pixels[dstPx + 2] = currRow[srcPx + 2];
        pixels[dstPx + 3] = currRow[srcPx + 3];
      } else {
        pixels[dstPx] = currRow[srcPx];
        pixels[dstPx + 1] = currRow[srcPx + 1];
        pixels[dstPx + 2] = currRow[srcPx + 2];
        pixels[dstPx + 3] = 255;
      }
    }
  }

  return { width, height, pixels };
}

function createPng(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const px = offset + 1 + x * 4;
      raw[px] = Math.round(r);
      raw[px + 1] = Math.round(g);
      raw[px + 2] = Math.round(b);
      raw[px + 3] = Math.round(a);
    }
  }
  const compressed = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Source image
const sourcePath = 'C:/Users/saulo/.gemini/antigravity/brain/140939a2-74d6-4b7c-b5b4-353482dfb1d7/media__1789958348842.png';
const src = decodePng(fs.readFileSync(sourcePath));
console.log('Source image decoded:', src.width, 'x', src.height);

// Find tight bounding box of the logo
let minX = src.width, maxX = 0, minY = src.height, maxY = 0;
for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < src.width; x++) {
    const idx = (y * src.width + x) * 4;
    const r = src.pixels[idx];
    const g = src.pixels[idx + 1];
    const b = src.pixels[idx + 2];
    const a = src.pixels[idx + 3];
    // If not near pure white/transparent
    if (a > 30 && (r < 240 || g < 240 || b < 240)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`Logo bounding box: [${minX}, ${minY}] to [${maxX}, ${maxY}] (size: ${maxX - minX} x ${maxY - minY})`);

const bboxW = maxX - minX;
const bboxH = maxY - minY;

function renderIcon(outW, outH, paddingRatio = 0.1, bgColor = [253, 251, 247, 255]) {
  const availW = outW * (1 - 2 * paddingRatio);
  const availH = outH * (1 - 2 * paddingRatio);
  const scale = Math.min(availW / bboxW, availH / bboxH);

  const drawW = bboxW * scale;
  const drawH = bboxH * scale;
  const offsetX = (outW - drawW) / 2;
  const offsetY = (outH - drawH) / 2;

  return createPng(outW, outH, (x, y) => {
    if (x >= offsetX && x < offsetX + drawW && y >= offsetY && y < offsetY + drawH) {
      const srcX = Math.min(maxX, Math.max(minX, Math.floor(minX + (x - offsetX) / scale)));
      const srcY = Math.min(maxY, Math.max(minY, Math.floor(minY + (y - offsetY) / scale)));
      const idx = (srcY * src.width + srcX) * 4;
      const sr = src.pixels[idx];
      const sg = src.pixels[idx + 1];
      const sb = src.pixels[idx + 2];
      const sa = src.pixels[idx + 3] / 255;

      // Detect white background in source image and make it match bgColor
      if (sr > 240 && sg > 240 && sb > 240) {
        return bgColor;
      }

      // Blend onto bgColor
      const br = bgColor[0], bg = bgColor[1], bb = bgColor[2], ba = bgColor[3];
      const r = sr * sa + br * (1 - sa);
      const g = sg * sa + bg * (1 - sa);
      const b = sb * sa + bb * (1 - sa);
      const a = Math.max(sa * 255, ba);

      return [r, g, b, a];
    }
    return bgColor;
  });
}

// Chique Detalhes brand colors:
// Primary Background: Warm Off-White / Ivory (#fdfbf7)
const brandBg = [253, 251, 247, 255];
const transparentBg = [0, 0, 0, 0];

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

console.log('Generating PWA icons with brand background (#fdfbf7)...');
const pwa192 = renderIcon(192, 192, 0.10, brandBg);
const pwa512 = renderIcon(512, 512, 0.10, brandBg);
const pwaMaskable = renderIcon(512, 512, 0.20, brandBg);
const appleIcon = renderIcon(180, 180, 0.10, brandBg);

const fav32 = renderIcon(32, 32, 0.05, brandBg);
const fav16 = renderIcon(16, 16, 0.05, brandBg);
const fav48 = renderIcon(48, 48, 0.05, brandBg);

fs.writeFileSync(path.join(iconsDir, 'pwa-192.png'), pwa192);
fs.writeFileSync(path.join(iconsDir, 'pwa-512.png'), pwa512);
fs.writeFileSync(path.join(iconsDir, 'pwa-maskable-512.png'), pwaMaskable);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);

fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), fav32);
fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.png'), fav16);

// Create standard favicon.ico (48x48 PNG format accepted by modern browsers)
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), fav48);

// Also generate transparent logo for headers
console.log('Generating transparent logo versions...');
const logo1 = renderIcon(440, 240, 0.05, transparentBg);
fs.writeFileSync(path.join(process.cwd(), 'public', 'Logo 1.png'), logo1);
fs.writeFileSync(path.join(process.cwd(), 'public', 'Logo 2.png'), logo1);

console.log('Icons and logos generated successfully!');
