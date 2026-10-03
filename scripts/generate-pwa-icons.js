import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal standard PNG generator in pure Node.js using built-in zlib
function makePng(width, height, rgbaBuffer) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let srcOffset = 0;
  let dstOffset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[dstOffset++] = 0; // Filter byte 0 (None)
    rgbaBuffer.copy(scanlines, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const deflated = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcVal = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Draw ATOM 3D Icon into RGBA Buffer
function renderAtomIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const scale = (size / 512) * (isMaskable ? 0.75 : 0.95);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Dark background gradient (#020617 to #09122c)
      const gradRatio = (x + y) / (size * 2);
      let r = Math.round(2 + gradRatio * 7);
      let g = Math.round(6 + gradRatio * 12);
      let b = Math.round(23 + gradRatio * 21);
      let a = 255;

      const dx = (x - cx) / scale;
      const dy = (y - cy) / scale;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Orbital ellipse rings function
      function distToEllipse(px, py, rx, ry, angleDeg) {
        const rad = (angleDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rxRot = px * cos + py * sin;
        const ryRot = -px * sin + py * cos;
        const normalizedDist = Math.abs(Math.sqrt((rxRot / rx) ** 2 + (ryRot / ry) ** 2) - 1.0);
        return normalizedDist * Math.min(rx, ry);
      }

      // Check distance to 3 orbital rings
      const d1 = distToEllipse(dx, dy, 190, 74, 0);
      const d2 = distToEllipse(dx, dy, 190, 74, 60);
      const d3 = distToEllipse(dx, dy, 190, 74, 120);
      const minOrbitalDist = Math.min(d1, d2, d3);

      if (minOrbitalDist < 8) {
        const ringAlpha = Math.max(0, 1 - minOrbitalDist / 8);
        r = Math.round(r * (1 - ringAlpha) + 56 * ringAlpha);
        g = Math.round(g * (1 - ringAlpha) + 189 * ringAlpha);
        b = Math.round(b * (1 - ringAlpha) + 248 * ringAlpha);
      }

      // Nucleus Outer Glow
      if (dist < 64) {
        const glowFactor = Math.max(0, 1 - dist / 64);
        r = Math.round(r * (1 - glowFactor * 0.7) + 6 * glowFactor * 0.7);
        g = Math.round(g * (1 - glowFactor * 0.7) + 182 * glowFactor * 0.7);
        b = Math.round(b * (1 - glowFactor * 0.7) + 212 * glowFactor * 0.7);
      }

      // Central Nucleus Core
      if (dist < 32) {
        const coreFactor = Math.max(0, 1 - dist / 32);
        r = Math.round(r * (1 - coreFactor) + 248 * coreFactor);
        g = Math.round(g * (1 - coreFactor) + 250 * coreFactor);
        b = Math.round(b * (1 - coreFactor) + 252 * coreFactor);
      }

      // Electrons on orbits
      const electronPos = [
        { x: 190, y: 0 },
        { x: 190 * Math.cos((60 * Math.PI) / 180), y: 190 * Math.sin((60 * Math.PI) / 180) },
        { x: -190 * Math.cos((60 * Math.PI) / 180), y: 190 * Math.sin((60 * Math.PI) / 180) },
      ];

      for (const ep of electronPos) {
        const edist = Math.sqrt((dx - ep.x) ** 2 + (dy - ep.y) ** 2);
        if (edist < 14) {
          const eFactor = Math.max(0, 1 - edist / 14);
          r = Math.round(r * (1 - eFactor) + 34 * eFactor);
          g = Math.round(g * (1 - eFactor) + 211 * eFactor);
          b = Math.round(b * (1 - eFactor) + 238 * eFactor);
        }
        if (edist < 6) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }

  return makePng(size, size, buf);
}

// Generate all standard PWA assets
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), renderAtomIcon(192, false));
console.log('✓ Generated pwa-192x192.png');

fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), renderAtomIcon(512, false));
console.log('✓ Generated pwa-512x512.png');

fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), renderAtomIcon(512, true));
console.log('✓ Generated pwa-maskable-512x512.png (with safe-zone)');

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderAtomIcon(180, false));
console.log('✓ Generated apple-touch-icon.png');

// Create favicon.ico using a 32x32 PNG structure
const icon32 = renderAtomIcon(32, false);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon32);
console.log('✓ Generated favicon.ico');

console.log('All PWA icons generated successfully!');
