import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

// Minimal dependency-free PNG writer + a hand-drawn Realness icon:
// dark field, green bloom disc, white checkmark.
const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(size) {
  const px = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2, R = size * 0.30;
  const set = (x, y, r, g, b, a = 255) => {
    const i = (y * size + x) * 4; px[i] = r; px[i+1] = g; px[i+2] = b; px[i+3] = a;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // dark field with a soft green glow toward lower-centre
      const dg = Math.hypot(x - cx, y - cy * 1.15) / (size * 0.6);
      const glow = Math.max(0, 1 - dg);
      set(x, y, Math.round(2 + 18 * glow), Math.round(6 + 90 * glow), Math.round(10 + 55 * glow));
    }
  }
  // green disc
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d < R) {
      const t = 1 - d / R;
      set(x, y, Math.round(20 + 73 * t), Math.round(200 + 50 * t), Math.round(136 + 40 * t));
    }
  }
  // checkmark (two thick segments), white-ish
  const seg = (x1, y1, x2, y2, w) => {
    const steps = Math.hypot(x2 - x1, y2 - y1) * 2;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps, px0 = x1 + (x2 - x1) * t, py0 = y1 + (y2 - y1) * t;
      for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) {
        if (dx*dx + dy*dy <= w*w) {
          const X = Math.round(px0 + dx), Y = Math.round(py0 + dy);
          if (X >= 0 && Y >= 0 && X < size && Y < size) set(X, Y, 4, 22, 12);
        }
      }
    }
  };
  const w = Math.max(2, Math.round(size * 0.028));
  seg(cx - R*0.42, cy + R*0.02, cx - R*0.08, cy + R*0.38, w);
  seg(cx - R*0.08, cy + R*0.38, cx + R*0.46, cy - R*0.36, w);

  // build PNG
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit, RGBA
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
writeFileSync('icon-192.png', png(192));
writeFileSync('icon-512.png', png(512));
console.log('icons written');
