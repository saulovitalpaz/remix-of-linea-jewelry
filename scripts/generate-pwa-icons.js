import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    raw[offset] = 0; // Filter: None
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
  ihdr[8] = 8; // bit depth 8
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function renderIcon(width, height, maskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;
  const outerR = 210 * scale;
  const innerR = 195 * scale;
  const ringThick = 6 * scale;

  return createPng(width, height, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    // Background: Dark Onyx (#141416)
    let r = 20, g = 20, b = 22, a = 255;

    // Outer subtle gold glow / ring
    if (dist <= outerR && dist >= outerR - ringThick) {
      const t = 1 - Math.abs(dist - (outerR - ringThick / 2)) / (ringThick / 2);
      r = 212 * t + r * (1 - t);
      g = 175 * t + g * (1 - t);
      b = 55 * t + b * (1 - t);
    }

    // Inner gold ring
    if (dist <= innerR && dist >= innerR - ringThick) {
      const t = 1 - Math.abs(dist - (innerR - ringThick / 2)) / (ringThick / 2);
      r = 230 * t + r * (1 - t);
      g = 190 * t + g * (1 - t);
      b = 85 * t + b * (1 - t);
    }

    // Central Emblem: "C" arc and "D" arc styled in gold (#e6ca65)
    // Left arc "C"
    const cDist = Math.hypot(dx + 35 * scale, dy);
    if (cDist >= 55 * scale && cDist <= 75 * scale && dx < -15 * scale) {
      r = 230; g = 202; b = 101;
    }

    // Right arc "D"
    const dDist = Math.hypot(dx - 15 * scale, dy);
    if (dDist >= 55 * scale && dDist <= 75 * scale && dx > -15 * scale) {
      r = 230; g = 202; b = 101;
    }
    // Vertical line for "D"
    if (Math.abs(dx - (-15 * scale)) <= 10 * scale && Math.abs(dy) <= 65 * scale) {
      r = 230; g = 202; b = 101;
    }

    // Small diamond accent at top and bottom
    const diamond1 = Math.abs(dx) + Math.abs(dy + 120 * scale);
    const diamond2 = Math.abs(dx) + Math.abs(dy - 120 * scale);
    if (diamond1 <= 14 * scale || diamond2 <= 14 * scale) {
      r = 245; g = 220; b = 125;
    }

    return [r, g, b, a];
  });
}

const dir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'pwa-192.png'), renderIcon(192, 192));
fs.writeFileSync(path.join(dir, 'pwa-512.png'), renderIcon(512, 512));
fs.writeFileSync(path.join(dir, 'pwa-maskable-512.png'), renderIcon(512, 512, true));
fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), renderIcon(180, 180));

console.log('PWA Icons generated successfully!');
