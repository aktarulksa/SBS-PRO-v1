import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to calculate CRC32
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, isMaskable = false) {
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines: width * 4 + 1 filter byte per line
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.48 : 0.46);

  // Fill pixels
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      if (isMaskable) {
        // Full bleed background for maskable
        // Deep purple #5B2384 gradient to #3b1459
        const factor = (y / height);
        const r = Math.round(91 - factor * 30);
        const g = Math.round(35 - factor * 15);
        const b = Math.round(132 - factor * 40);

        // Draw inner circular badge or icon
        if (dist < radius * 0.72) {
          // Inner circle badge
          if (dist > radius * 0.65) {
            // Gold/Orange trim
            rawData[pxOffset] = 255;
            rawData[pxOffset + 1] = 122;
            rawData[pxOffset + 2] = 0;
            rawData[pxOffset + 3] = 255;
            continue;
          }
          // Center symbol
          if (Math.abs(dx) < radius * 0.35 && Math.abs(dy) < radius * 0.35) {
            // Draw S curve representation
            const inTopS = (dy < 0 && dx > -radius*0.25 && (dy < -radius*0.1 || dx > 0));
            const inBotS = (dy >= 0 && dx < radius*0.25 && (dy > radius*0.1 || dx < 0));
            if (inTopS) {
              rawData[pxOffset] = 255;
              rawData[pxOffset + 1] = 255;
              rawData[pxOffset + 2] = 255;
              rawData[pxOffset + 3] = 255;
              continue;
            } else if (inBotS) {
              rawData[pxOffset] = 255;
              rawData[pxOffset + 1] = 150;
              rawData[pxOffset + 2] = 0;
              rawData[pxOffset + 3] = 255;
              continue;
            }
          }
        }

        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      } else {
        // Non-maskable: Circular icon with rounded corners or transparent outside
        if (dist <= radius) {
          // Circular background: purple gradient #5B2384
          const grad = y / height;
          let r = Math.round(91 + grad * 15);
          let g = Math.round(35 + grad * 10);
          let b = Math.round(132 + grad * 20);

          // Golden border
          if (dist > radius - 6) {
            r = 255;
            g = 140;
            b = 0;
          }

          // Center 'S' icon
          if (Math.abs(dx) < radius * 0.45 && Math.abs(dy) < radius * 0.45) {
            const inTopS = (dy < 0 && dx > -radius*0.35 && (dy < -radius*0.12 || dx > -radius*0.05));
            const inBotS = (dy >= 0 && dx < radius*0.35 && (dy > radius*0.12 || dx < radius*0.05));
            if (inTopS) {
              r = 255; g = 255; b = 255;
            } else if (inBotS) {
              r = 255; g = 140; b = 0;
            }
          }

          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        } else {
          // Transparent
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
const icon192 = createPng(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

// 512x512
const icon512 = createPng(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

// 512x512 maskable
const iconMaskable = createPng(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

// apple-touch-icon 180x180
const appleIcon = createPng(180, 180, true);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

console.log('Successfully generated all PWA icons!');
