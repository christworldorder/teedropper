import sharp from 'sharp';

const input = 'C:/Users/XSilv/Downloads/aa172b08-6a5b-44a2-840d-72938b23074a.png';
const output = 'C:/Users/XSilv/Downloads/igbbmn-belts-shirt.png';

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const ch = 4;

// Step 1: Flood fill background removal from edges
function getPixel(x, y) {
  const i = (y * width + x) * ch;
  return [data[i], data[i+1], data[i+2]];
}
const corners = [getPixel(0,0), getPixel(width-1,0), getPixel(0,height-1), getPixel(width-1,height-1)];
const bgR = corners.reduce((s,c)=>s+c[0],0)/4;
const bgG = corners.reduce((s,c)=>s+c[1],0)/4;
const bgB = corners.reduce((s,c)=>s+c[2],0)/4;
console.log(`Background: rgb(${Math.round(bgR)}, ${Math.round(bgG)}, ${Math.round(bgB)})`);

const colorDist = (r,g,b) => Math.sqrt((r-bgR)**2+(g-bgG)**2+(b-bgB)**2);
const visited = new Uint8Array(width * height);
const queue = [];
for (let x = 0; x < width; x++) { queue.push(x); queue.push((height-1)*width+x); }
for (let y = 1; y < height-1; y++) { queue.push(y*width); queue.push(y*width+width-1); }

let head = 0;
while (head < queue.length) {
  const idx = queue[head++];
  if (visited[idx]) continue;
  visited[idx] = 1;
  const pi = idx * ch;
  const r = data[pi], g = data[pi+1], b = data[pi+2];
  if (colorDist(r,g,b) < 80) {
    data[pi+3] = 0;
    const x = idx % width, y = Math.floor(idx / width);
    if (x > 0) queue.push(idx-1);
    if (x < width-1) queue.push(idx+1);
    if (y > 0) queue.push(idx-width);
    if (y < height-1) queue.push(idx+width);
  }
}

// Step 2: Remove black pixels so shirt IS the black
for (let i = 0; i < data.length; i += ch) {
  const r = data[i], g = data[i+1], b = data[i+2];
  if (r < 60 && g < 60 && b < 60) data[i+3] = 0;
}

console.log('Done. Saving...');
await sharp(data, { raw: { width, height, channels: ch } }).png().toFile(output);
console.log('Saved:', output);
