const sharp = require("sharp");

const input = process.argv[2];
const output = process.argv[3] || input.replace(/(\.\w+)$/, "-out.png");

async function run() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  const idx = (x, y) => (y * width + x) * channels;
  const isWhitish = (i) => buf[i] > 200 && buf[i + 1] > 200 && buf[i + 2] > 200;

  // Flood fill from all 4 edges to find the white background
  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    const i = pos * channels;
    if (!isWhitish(i)) return;
    visited[pos] = 1;
    queue.push([x, y]);
  };

  // Seed from all edges
  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  // BFS
  while (queue.length > 0) {
    const [x, y] = queue.shift();
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  // Make background transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (visited[pos]) {
        const i = pos * channels;
        buf[i + 3] = 0;
      }
    }
  }

  // Now make remaining dark/black pixels transparent too
  for (let i = 0; i < buf.length; i += channels) {
    if (buf[i + 3] === 0) continue; // already transparent
    const brightness = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
    if (brightness < 55) {
      buf[i + 3] = 0;
    } else if (brightness < 90) {
      buf[i + 3] = Math.round(((brightness - 55) / 35) * 255);
    }
  }

  await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log("Done:", output);
}

run().catch(console.error);
