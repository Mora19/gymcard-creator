// Render the final SVG for visual QA; this preview is not the logo source.
// Requires sharp (e.g. bundled runtime NODE_PATH); no source raster is read.
const path = require('node:path');
const sharp = require('sharp');

const brand = path.resolve(__dirname, '..');
(async () => {
  for (const [filename, background] of [
    ['recardnize-logo', '#101114'],
    ['recardnize-logo-dark', '#F7F7F7'],
    ['recardnize-logo-mono', '#FFFFFF'],
  ]) {
    const logo = await sharp(path.join(brand, `${filename}.svg`))
      .resize({ width: 1400 })
      .png()
      .toBuffer();
    const metadata = await sharp(logo).metadata();
    await sharp({ create: { width: 1520, height: metadata.height + 120, channels: 4, background } })
      .composite([{ input: logo, left: 60, top: 60 }])
      .png()
      .toFile(path.join(brand, `${filename}-preview.png`));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
