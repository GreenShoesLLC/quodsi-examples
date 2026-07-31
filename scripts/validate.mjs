// Repo-side guards for published example models.
//
// These are the cheap structural checks. The "does this model still pass the
// Quodsi validation gate" check lives in the quodsi monorepo, because that is
// where the gate lives — see quodsi_drawio's examples fixture test.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const MANIFEST = 'manifest.json'
const RAW_PREFIX = 'https://raw.githubusercontent.com/GreenShoesLLC/quodsi-examples/main/'

const errors = []

let manifest
try {
  manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
} catch (err) {
  console.error(`Validation failed: could not read ${MANIFEST} — ${err.message}`)
  process.exit(1)
}

if (manifest.version !== 1) {
  errors.push(`manifest.version must be 1, got ${JSON.stringify(manifest.version)}`)
}
if (!Array.isArray(manifest.examples)) {
  console.error('Validation failed: manifest.examples must be an array')
  process.exit(1)
}

const folders = readdirSync('models', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

for (const folder of folders) {
  const file = join('models', folder, 'model.drawio')
  if (!existsSync(file)) {
    errors.push(`${folder}: missing model.drawio`)
    continue
  }
  const xml = readFileSync(file, 'utf8')

  if (!xml.includes('<mxfile') && !xml.includes('<mxGraphModel')) {
    errors.push(`${folder}: model.drawio is not drawio XML`)
  }
  // Must be stored UNCOMPRESSED. drawio compresses diagram content by default,
  // which leaves a base64+deflate blob that neither review nor the monorepo
  // fixture test can read.
  if (!xml.includes('<mxGraphModel')) {
    errors.push(`${folder}: model.drawio looks compressed — store it uncompressed`)
  }
  // A published example must carry NO documentId: it binds a diagram to one
  // Quodsi model record, so every user opening this file would collide onto the
  // same record and overwrite each other.
  if (xml.includes('quodsiDocumentId')) {
    errors.push(`${folder}: model.drawio contains quodsiDocumentId — strip it`)
  }
  // An unconverted diagram is just a picture; it carries no Quodsi model.
  if (!xml.includes('quodsiType')) {
    errors.push(`${folder}: model.drawio has no quodsiType — was it Converted?`)
  }
}

const seenIds = new Set()
const referenced = new Set()

for (const e of manifest.examples) {
  const label = e?.id ?? '(entry with no id)'
  for (const field of ['id', 'title', 'summary', 'url']) {
    if (typeof e?.[field] !== 'string' || !e[field]) {
      errors.push(`${label}: ${field} must be a non-empty string`)
    }
  }
  if (typeof e?.order !== 'number') errors.push(`${label}: order must be a number`)
  if (!Array.isArray(e?.teaches) || e.teaches.some((t) => typeof t !== 'string')) {
    errors.push(`${label}: teaches must be an array of strings`)
  }
  if (seenIds.has(e?.id)) errors.push(`${label}: duplicate id`)
  seenIds.add(e?.id)

  // The app pins entry urls to this host prefix, so a url that doesn't match
  // is silently dropped by the picker rather than erroring — catch it here.
  if (typeof e?.url === 'string' && !e.url.startsWith(RAW_PREFIX)) {
    errors.push(`${label}: url must start with ${RAW_PREFIX}`)
  }
  const rel = typeof e?.url === 'string' ? e.url.slice(RAW_PREFIX.length) : ''
  if (!/^models\/[^/]+\/model\.drawio$/.test(rel)) {
    errors.push(`${label}: url must end models/<folder>/model.drawio`)
  } else {
    referenced.add(rel)
    if (!existsSync(rel)) errors.push(`${label}: url points at ${rel}, which does not exist`)
  }
}

for (const folder of folders) {
  const rel = `models/${folder}/model.drawio`
  if (!referenced.has(rel)) errors.push(`${folder}: no manifest entry points at it`)
}

if (errors.length) {
  console.error('Validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log(`OK: ${manifest.examples.length} example(s), ${folders.length} folder(s)`)
