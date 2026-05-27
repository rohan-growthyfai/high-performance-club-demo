const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const width = 1800;
const height = 1200;
const data = Buffer.alloc((width * 4 + 1) * height);

const palette = {
  paper: [250, 248, 241, 255],
  sage: [209, 228, 206, 255],
  mint: [178, 238, 203, 255],
  coral: [229, 111, 81, 255],
  gold: [216, 166, 62, 255],
  green: [35, 108, 74, 255],
  ink: [23, 33, 27, 255],
  blue: [60, 122, 150, 255],
  white: [255, 255, 255, 255],
  line: [204, 216, 199, 255]
};

function putPixel(x, y, color) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const row = y * (width * 4 + 1);
  const i = row + 1 + x * 4;
  data[i] = color[0];
  data[i + 1] = color[1];
  data[i + 2] = color[2];
  data[i + 3] = color[3];
}

function blend(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    255
  ];
}

function rect(x, y, w, h, color) {
  for (let yy = Math.max(0, y); yy < Math.min(height, y + h); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(width, x + w); xx += 1) {
      putPixel(xx, yy, color);
    }
  }
}

function circle(cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) putPixel(x, y, color);
    }
  }
}

function line(x0, y0, x1, y1, color, thickness = 4) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    circle(x, y, thickness, color);
  }
}

function roundedRect(x, y, w, h, radius, color) {
  rect(x + radius, y, w - radius * 2, h, color);
  rect(x, y + radius, w, h - radius * 2, color);
  circle(x + radius, y + radius, radius, color);
  circle(x + w - radius, y + radius, radius, color);
  circle(x + radius, y + h - radius, radius, color);
  circle(x + w - radius, y + h - radius, radius, color);
}

function drawCard(x, y, w, h, accent) {
  roundedRect(x + 18, y + 20, w, h, 22, [28, 42, 34, 32]);
  roundedRect(x, y, w, h, 22, palette.white);
  rect(x + 34, y + 34, w - 68, 4, palette.line);
  circle(x + 46, y + 72, 14, accent);
  rect(x + 76, y + 61, w - 132, 12, palette.line);
  rect(x + 76, y + 84, Math.floor((w - 132) * 0.68), 10, [226, 232, 220, 255]);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, payload) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);
  length.writeUInt32BE(payload.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, payload])), 0);
  return Buffer.concat([length, typeBuffer, payload, crc]);
}

for (let y = 0; y < height; y += 1) {
  data[y * (width * 4 + 1)] = 0;
  for (let x = 0; x < width; x += 1) {
    const t = x / width * 0.6 + y / height * 0.4;
    putPixel(x, y, blend(palette.paper, palette.sage, t * 0.62));
  }
}

for (let x = -200; x < width + 280; x += 88) {
  line(x, height - 40, x + 520, 150, [255, 255, 255, 58], 2);
}

circle(1450, 210, 180, [183, 240, 207, 150]);
circle(1550, 760, 260, [255, 209, 196, 122]);
circle(1070, 920, 210, [255, 227, 161, 120]);

roundedRect(1000, 255, 470, 560, 32, [255, 255, 255, 190]);
drawCard(1045, 310, 380, 130, palette.mint);
drawCard(1090, 485, 380, 130, palette.coral);
drawCard(1135, 660, 380, 130, palette.gold);

line(860, 895, 1050, 760, palette.ink, 5);
line(1050, 760, 1230, 590, palette.ink, 5);
line(1230, 590, 1415, 410, palette.ink, 5);
circle(860, 895, 16, palette.blue);
circle(1050, 760, 16, palette.green);
circle(1230, 590, 16, palette.coral);
circle(1415, 410, 16, palette.gold);

for (let i = 0; i < 7; i += 1) {
  const x = 760 + i * 92;
  const h = 70 + i * 38;
  roundedRect(x, 960 - h, 48, h, 12, i % 2 === 0 ? palette.blue : palette.green);
}

for (let row = 0; row < 5; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const filled = (row + col) % 3 !== 0;
    circle(1250 + col * 32, 180 + row * 32, 8, filled ? palette.ink : [255, 255, 255, 220]);
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(data, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
]);

const out = path.join(__dirname, "..", "assets", "habit-hero.png");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log(`Generated ${out}`);
