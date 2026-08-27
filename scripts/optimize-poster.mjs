import sharp from 'sharp';

const info = await sharp('C:\\Users\\Israel\\Downloads\\fils\\Still 2026-08-25 194313_1.12.1.jpg')
  .resize({ width: 1920, withoutEnlargement: true })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/screencast-poster.jpg');

console.log(`screencast-poster.jpg: ${(info.size / 1024).toFixed(0)}KB (${info.width}x${info.height})`);
