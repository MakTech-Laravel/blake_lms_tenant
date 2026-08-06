import fs from 'node:fs';
import path from 'node:path';

const svgPath = path.join('figma', 'Landing page.svg');
const outDir = path.join('public', 'images', 'marketing');
fs.mkdirSync(outDir, { recursive: true });

const svg = fs.readFileSync(svgPath, 'utf8');
const re =
    /<image id="([^"]+)"[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*xlink:href="data:image\/(png|jpeg);base64,([^"]+)"/g;

const nameMap = {
    image0_16_2: 'hero-bg',
    image1_16_2: 'dashboard-mockup',
    image2_16_2: 'testimonial-avatar',
    image3_16_2: 'analytics-bg',
};

let match;
let count = 0;

while ((match = re.exec(svg)) !== null) {
    const [, id, width, height, format, base64] = match;
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const baseName = nameMap[id] ?? id.replace(/_16_2$/, '');
    const file = path.join(outDir, `${baseName}.${ext}`);
    fs.writeFileSync(file, Buffer.from(base64, 'base64'));
    console.log({ id, width, height, file, size: fs.statSync(file).size });
    count += 1;
}

console.log(`extracted ${count} images`);
