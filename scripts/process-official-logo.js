import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function decodePng(buffer) {
  let offset = 8; // skip PNG signature
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

const inputPath = path.join(process.cwd(), 'public', 'logo-completo.png');
const src = decodePng(fs.readFileSync(inputPath));
if (!src.pixels.some((value, index) => index % 4 === 3 && value === 0)) throw new Error('Logo must have a transparent background');

function renderTarget(size, padding, background = [0, 0, 0, 0]) {
  const scale = size * (1 - padding * 2) / Math.max(src.width, src.height);
  const left = (size - src.width * scale) / 2;
  const top = (size - src.height * scale) / 2;
  return createPng(size, size, (x, y) => {
    let alpha = 0;
    const rgb = [0, 0, 0];
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const ix = Math.floor((x + (sx + 0.5) / 4 - left) / scale);
      const iy = Math.floor((y + (sy + 0.5) / 4 - top) / scale);
      if (ix < 0 || iy < 0 || ix >= src.width || iy >= src.height) continue;
      const index = (iy * src.width + ix) * 4;
      const a = src.pixels[index + 3] / 255 / 16;
      alpha += a;
      for (let channel = 0; channel < 3; channel++) rgb[channel] += src.pixels[index + channel] * a;
    }
    const backgroundAlpha = background[3] / 255 * (1 - alpha);
    const outputAlpha = alpha + backgroundAlpha;
    return [...rgb.map((value, channel) => outputAlpha ? (value + background[channel] * backgroundAlpha) / outputAlpha : 0), outputAlpha * 255];
  });
}

const iconsDir = path.join(process.cwd(), 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });
for (const size of [192, 512]) {
  fs.writeFileSync(path.join(iconsDir, `chique-full-${size}.png`), renderTarget(size, 0.05));
}
fs.writeFileSync(path.join(iconsDir, 'chique-full-maskable-512.png'), renderTarget(512, 0.22, [253, 251, 247, 255]));
fs.writeFileSync(path.join(iconsDir, 'chique-full-apple-180.png'), renderTarget(180, 0.08, [253, 251, 247, 255]));
console.log('Full-logo icons generated; existing symbol preserved.');
