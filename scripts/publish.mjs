// Prepares an authored .drawio file for publication in this repo.
//
//   node scripts/publish.mjs <path-to-saved.drawio> <NN-slug>
//
// Does the two transformations a file saved from the app needs before it can
// be published (see "Rules for a published model" in the README):
//
//   1. Decompresses the diagram XML. drawio stores it deflate-raw + base64 over
//      URI-encoded text by default; published files must be literal
//      <mxGraphModel> so they can be reviewed, diffed, and validated.
//   2. Strips the quodsiDocumentId attribute. A published file carrying one
//      would collide every user who opens it onto the same Quodsi model record.
//
// Then writes the result to models/<NN-slug>/model.drawio. Run from the repo
// root. The manifest entry and the folder README are still on you — run
// scripts/validate.mjs afterwards to check everything agrees.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import { join } from 'node:path'

const [src, folder] = process.argv.slice(2)
if (!src || !folder) {
  console.error('Usage: node scripts/publish.mjs <path-to-saved.drawio> <NN-slug>')
  console.error('Example: node scripts/publish.mjs "C:\\Users\\me\\Downloads\\clinic.drawio" 02-shared-resource')
  process.exit(1)
}
if (!/^\d{2}-[a-z0-9][a-z0-9-]*$/.test(folder)) {
  console.error(`Folder must look like NN-slug (two digits, dash, lowercase slug), got "${folder}"`)
  process.exit(1)
}
if (!existsSync('manifest.json')) {
  console.error('Run this from the repository root (where manifest.json lives).')
  process.exit(1)
}

let xml
try {
  xml = readFileSync(src, 'utf8')
} catch (err) {
  console.error(`Could not read ${src} — ${err.message}`)
  process.exit(1)
}

// A compressed <diagram> body is one base64 blob with no markup in it, so the
// [^<] body below can only ever match compressed content — an already
// uncompressed file passes through untouched.
let decompressed = false
xml = xml.replace(/(<diagram\b[^>]*>)\s*([^<\s][^<]*?)\s*(<\/diagram>)/g, (whole, open, body, close) => {
  let inner
  try {
    inner = decodeURIComponent(inflateRawSync(Buffer.from(body, 'base64')).toString('utf8'))
  } catch {
    console.error('Found a <diagram> body that is neither XML nor drawio-compressed content — is this a .drawio file saved by the app?')
    process.exit(1)
  }
  decompressed = true
  return open + inner + close
})

if (!xml.includes('<mxGraphModel')) {
  console.error('No <mxGraphModel> found after processing — this does not look like a drawio diagram.')
  process.exit(1)
}
if (!xml.includes('quodsiType')) {
  console.error('No quodsiType attributes found — the diagram was never Converted.')
  console.error('Open it in Quodsi drawio, run Quodsi → Convert Diagram to Model, save, and re-run this.')
  process.exit(1)
}

const hadDocumentId = /\squodsiDocumentId="[^"]*"/.test(xml)
xml = xml.replace(/\squodsiDocumentId="[^"]*"/g, '')

const dir = join('models', folder)
const dest = join(dir, 'model.drawio')
const updating = existsSync(dest)
mkdirSync(dir, { recursive: true })
writeFileSync(dest, xml)

console.log(`${updating ? 'Updated' : 'Wrote'} ${dest}`)
console.log(`  decompressed: ${decompressed ? 'yes' : 'no (was already uncompressed)'}`)
console.log(`  quodsiDocumentId stripped: ${hadDocumentId ? 'yes' : 'none present'}`)
console.log('')
console.log('Still to do:')
if (!existsSync(join(dir, 'README.md'))) {
  console.log(`  - write ${join(dir, 'README.md')} (what it shows + things to try)`)
}
console.log(`  - add/confirm the manifest.json entry pointing at models/${folder}/model.drawio`)
console.log('  - node scripts/validate.mjs')
