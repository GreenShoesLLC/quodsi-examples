// Generates manifest.json and the README examples table from the folder tree.
// Run from the repo root after adding or editing an example:
//   node scripts/build-manifest.mjs           write both files
//   node scripts/build-manifest.mjs --check   CI: fail if either is stale
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import {
  loadGroups, scanExamples, buildManifest, serializeManifest,
  renderExamplesTable, replaceBetweenMarkers, normalizeEol,
} from './lib/catalog.mjs'

const root = process.cwd()
const check = process.argv.includes('--check')
const fail = (lines) => {
  console.error(lines.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

if (!existsSync('groups.json')) fail(['Run this from the repository root (where groups.json lives).'])
const { groups, errors: groupErrors } = loadGroups(root)
if (!groups) fail(groupErrors)
const { examples, errors } = scanExamples(root, groups)
if (errors.length) fail([...errors, 'Fix these first (node scripts/validate.mjs shows everything).'])

const manifest = serializeManifest(buildManifest(groups, examples))
const readmeNow = existsSync('README.md') ? normalizeEol(readFileSync('README.md', 'utf8')) : ''
const readme = replaceBetweenMarkers(readmeNow, renderExamplesTable(groups, examples))
const manifestNow = existsSync('manifest.json') ? normalizeEol(readFileSync('manifest.json', 'utf8')) : ''

if (check) {
  const stale = []
  if (manifestNow !== manifest) stale.push('manifest.json')
  if (readmeNow !== readme) stale.push('README.md (examples table)')
  if (stale.length) {
    fail([`Out of date: ${stale.join(', ')}.`, 'Run: node scripts/build-manifest.mjs — then commit the result.'])
  }
  console.log('OK: manifest.json and README table are up to date')
} else {
  writeFileSync('manifest.json', manifest)
  writeFileSync('README.md', readme)
  console.log(`Wrote manifest.json (${JSON.parse(manifest).examples.length} in the picker) and the README table`)
}
