// One-off script: resize/compress the user's graded showcase stills into
// public/showcase/. Run once after new images are dropped in Downloads/fils.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC_DIR = 'C:\\Users\\Israel\\Downloads\\fils';
const OUT_DIR = path.resolve('public/showcase');

const files = [
  // 5 flagship presets: before + after (interactive showcase slider + playground base photos)
  ['city raw_1.1.1.jpg', 'cine-35-before.jpg'],
  ['city gate_1.1.2.jpg', 'cine-35-after.jpg'],
  ['wst raw_1.2.1.jpg', 'western-before.jpg'],
  ['wst gate_1.2.2.jpg', 'western-after.jpg'],
  ['romance raw_1.3.1.jpg', 'romance-before.jpg'],
  ['romance gate_1.3.2.jpg', 'romance-after.jpg'],
  ['vhs raw_1.4.1.jpg', 'vhs-before.jpg'],
  ['vhs gate_1.4.2.jpg', 'vhs-after.jpg'],
  ['terror raw_1.5.1.jpg', 'terror-before.jpg'],
  ['terror gate_1.5.2.jpg', 'terror-after.jpg'],
  // Remaining 8 presets: after only (gallery grid doesn't need a before pair)
  ['cine 65_1.6.1.jpg', 'cine-65-after.jpg'],
  ['editorial 43_1.7.1.jpg', 'editorial-4-3-after.jpg'],
  ['editorial urban_1.8.1.jpg', 'editorial-urbano-after.jpg'],
  ['social 916_1.9.1.jpg', 'social-9-16-after.jpg'],
  ['social11_1.9.2.jpg', 'social-1-1-after.jpg'],
  ['social 45_1.9.3.jpg', 'social-4-5-after.jpg'],
  ['vhs deteroriado_1.10.1.jpg', 'vhs-deteriorado-after.jpg'],
  ['terrror foun footage_1.11.1.jpg', 'terror-found-footage-after.jpg'],
];

await mkdir(OUT_DIR, { recursive: true });

for (const [src, out] of files) {
  const inPath = path.join(SRC_DIR, src);
  const outPath = path.join(OUT_DIR, out);
  const info = await sharp(inPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
  console.log(`${out}: ${(info.size / 1024).toFixed(0)}KB (${info.width}x${info.height})`);
}
