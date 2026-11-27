/**
 * One-off generator for public/og-image.jpg, public/icons/* and public/favicon.ico.
 * Not part of `npm run build` (sharp is not a project dependency). To re-run:
 *   npm i --no-save sharp   (or point SHARP_DIR at a folder whose node_modules contains sharp)
 *   node scripts/generate-brand-assets.mjs
 */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const { createRequire } = await import('node:module')
const sharp = createRequire(join(process.env.SHARP_DIR || root, 'noop.js'))('sharp')

const mark = join(root, 'public/apple-touch-icon.png') // white sprout-and-figure on brand green, 180x180

// App icons. The artwork already sits inside the central 60%, so the same image is safe as a maskable icon.
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512]]) {
  await sharp(mark).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(join(root, 'public/icons', name))
}

// favicon.ico (a 32x32 PNG wrapped in an ICO container; every current browser accepts this).
const png32 = await sharp(mark).resize(32, 32).png().toBuffer()
const head = Buffer.alloc(22)
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4)
head[6] = 32; head[7] = 32; head.writeUInt16LE(1, 12); head.writeUInt16LE(32, 14)
head.writeUInt32LE(png32.length, 14 + 4); head.writeUInt32LE(22, 18)
writeFileSync(join(root, 'public/favicon.ico'), Buffer.concat([head, png32]))

// Open Graph / Twitter card: hero photo + readable brand panel, 1200x630.
const W = 1200, H = 630
const photo = await sharp(process.env.OG_PHOTO || join(root, 'src/assets/home/hero-720.webp')).resize(W, H, { fit: 'cover', position: 'attention' }).toBuffer()
const logo = await sharp(mark).resize(84, 84).composite([{ input: Buffer.from('<svg width="84" height="84"><rect width="84" height="84" rx="20"/></svg>'), blend: 'dest-in' }]).png().toBuffer()
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17120D" stop-opacity=".94"/><stop offset=".55" stop-color="#17120D" stop-opacity=".78"/><stop offset="1" stop-color="#17120D" stop-opacity=".1"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="140" y="97" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700" fill="#F7F1E3">Agro<tspan fill="#E3A21A">Sense</tspan></text>
  <text x="72" y="300" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="700" fill="#F7F1E3">Sell your harvest.</text>
  <text x="72" y="395" font-family="Georgia, 'Times New Roman', serif" font-size="82" font-weight="700" font-style="italic" fill="#E3A21A">Keep the price.</text>
  <text x="72" y="470" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#EFE6D2">Farmers sell directly to buyers across India.</text>
  <text x="72" y="560" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#C4B393">Plant ID  |  Government schemes  |  AI chatbot  |  agrosence.vercel.app</text>
</svg>`)
await sharp(photo).composite([{ input: overlay }, { input: logo, left: 40, top: 40 }]).jpeg({ quality: 82, mozjpeg: true }).toFile(join(root, 'public/og-image.jpg'))
console.log('brand assets written')
