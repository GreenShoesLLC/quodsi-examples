// Shared tree logic for the example catalog. The folder path IS the
// classification: <section>/<group>/<slug>/. Every CLI in scripts/ goes
// through here so validate, build-manifest and publish can never disagree
// about what a valid tree looks like. Node built-ins only.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const META_FIELDS = ['title', 'summary', 'teaches', 'order']
// Top-level folders that are not sections. Dot-folders (.git, .github) are
// always ignored.
const NON_SECTION_DIRS = new Set(['scripts'])

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function entries(dir) {
  // Dotfiles (.DS_Store, .gitkeep, editor droppings) are invisible everywhere.
  return readdirSync(dir, { withFileTypes: true }).filter((d) => !d.name.startsWith('.'))
}

export function loadGroups(root) {
  const errors = []
  let raw
  try {
    raw = readJson(join(root, 'groups.json'))
  } catch (err) {
    return { groups: null, errors: [`groups.json: cannot read — ${err.message}`] }
  }
  if (!Array.isArray(raw?.sections) || raw.sections.length === 0) {
    return { groups: null, errors: ['groups.json: sections must be a non-empty array'] }
  }
  const sectionIds = new Set()
  for (const s of raw.sections) {
    if (!SLUG.test(String(s?.id))) errors.push(`groups.json: section id ${JSON.stringify(s?.id)} is not a valid slug`)
    if (sectionIds.has(s?.id)) errors.push(`groups.json: duplicate section id "${s.id}"`)
    sectionIds.add(s?.id)
    if (!isNonEmptyString(s?.title)) errors.push(`groups.json: section "${s?.id}" title must be a non-empty string`)
    if (!Array.isArray(s?.groups)) {
      errors.push(`groups.json: section "${s?.id}" groups must be an array`)
      continue
    }
    const groupIds = new Set()
    for (const g of s.groups) {
      if (!SLUG.test(String(g?.id))) errors.push(`groups.json: group id ${JSON.stringify(g?.id)} in "${s.id}" is not a valid slug`)
      if (groupIds.has(g?.id)) errors.push(`groups.json: duplicate group id "${g.id}" in section "${s.id}"`)
      groupIds.add(g?.id)
      if (!isNonEmptyString(g?.title)) errors.push(`groups.json: group "${s.id}/${g?.id}" title must be a non-empty string`)
      if (!isNonEmptyString(g?.summary)) errors.push(`groups.json: group "${s.id}/${g?.id}" summary must be a non-empty string`)
    }
  }
  return { groups: errors.length ? null : raw, errors }
}

function checkMeta(label, meta) {
  const errors = []
  if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
    return [`${label}: example.json must be an object`]
  }
  for (const k of Object.keys(meta)) {
    if (!META_FIELDS.includes(k)) errors.push(`${label}: unknown field "${k}" in example.json`)
  }
  if (!isNonEmptyString(meta.title)) errors.push(`${label}: title must be a non-empty string`)
  if (!isNonEmptyString(meta.summary)) errors.push(`${label}: summary must be a non-empty string`)
  if (!Array.isArray(meta.teaches) || meta.teaches.some((t) => typeof t !== 'string')) {
    errors.push(`${label}: teaches must be an array of strings`)
  }
  if (typeof meta.order !== 'number' || !Number.isFinite(meta.order)) {
    errors.push(`${label}: order must be a number`)
  }
  return errors
}

export function scanExamples(root, groups) {
  const errors = []
  const examples = []
  const sections = new Map(groups.sections.map((s) => [s.id, new Set(s.groups.map((g) => g.id))]))
  const seenSlugs = new Map()

  for (const top of entries(root)) {
    if (!top.isDirectory()) continue // root files (README.md, manifest.json, ...) are fine
    if (NON_SECTION_DIRS.has(top.name)) continue
    if (!sections.has(top.name)) errors.push(`${top.name}/: top-level folder is not a declared section (see groups.json)`)
  }

  for (const [sectionId, groupIds] of sections) {
    const sectionDir = join(root, sectionId)
    if (!existsSync(sectionDir)) continue // a declared section may have no examples yet
    for (const g of entries(sectionDir)) {
      const gRel = `${sectionId}/${g.name}`
      if (!g.isDirectory()) {
        errors.push(`${gRel}: files are not allowed at section level`)
        continue
      }
      if (!groupIds.has(g.name)) {
        errors.push(`${gRel}/: not a declared group of section "${sectionId}" (see groups.json)`)
        continue
      }
      for (const ex of entries(join(sectionDir, g.name))) {
        const dir = `${gRel}/${ex.name}`
        if (!ex.isDirectory()) {
          errors.push(`${dir}: files are not allowed at group level`)
          continue
        }
        if (!SLUG.test(ex.name)) {
          errors.push(`${dir}: "${ex.name}" is not a valid slug (lowercase letters, digits, single dashes)`)
          continue
        }
        if (seenSlugs.has(ex.name)) {
          errors.push(`${dir}: duplicate example slug "${ex.name}" (also at ${seenSlugs.get(ex.name)})`)
          continue
        }
        seenSlugs.set(ex.name, dir)

        const abs = join(root, dir)
        const label = dir
        let meta = null
        if (!existsSync(join(abs, 'example.json'))) {
          errors.push(`${label}: missing example.json`)
        } else {
          try {
            meta = readJson(join(abs, 'example.json'))
          } catch (err) {
            errors.push(`${label}: example.json is not valid JSON — ${err.message}`)
          }
          if (meta !== null) {
            const metaErrors = checkMeta(label, meta)
            errors.push(...metaErrors)
            if (metaErrors.length) meta = null
          }
        }
        if (!existsSync(join(abs, 'README.md'))) errors.push(`${label}: missing README.md`)
        const hasDrawio = existsSync(join(abs, 'model.drawio'))
        const hasJson = existsSync(join(abs, 'model.json'))
        if (!hasDrawio && !hasJson) errors.push(`${label}: needs model.drawio or model.json`)
        if (meta) {
          examples.push({ slug: ex.name, section: sectionId, group: g.name, dir, meta, hasDrawio, hasJson })
        }
      }
    }
  }
  return { examples, errors }
}

// The per-file publication rules. Carried over verbatim from the pre-2026-09
// validate.mjs: a published drawio must be uncompressed (reviewable, and
// readable by this check), must not carry a quodsiDocumentId (it binds the
// diagram to ONE model record, so every user would collide onto it), and must
// have been Converted (an unconverted diagram is just a picture).
export function checkModelFiles(root, example) {
  const errors = []
  const label = example.dir
  if (example.hasDrawio) {
    const xml = readFileSync(join(root, example.dir, 'model.drawio'), 'utf8')
    if (!xml.includes('<mxfile') && !xml.includes('<mxGraphModel')) {
      errors.push(`${label}: model.drawio is not drawio XML`)
    } else if (!xml.includes('<mxGraphModel')) {
      errors.push(`${label}: model.drawio looks compressed — store it uncompressed (node scripts/publish.mjs does this)`)
    }
    if (xml.includes('quodsiDocumentId')) errors.push(`${label}: model.drawio contains quodsiDocumentId — strip it`)
    if (!xml.includes('quodsiType')) errors.push(`${label}: model.drawio has no quodsiType — was it Converted?`)
  }
  if (example.hasJson) {
    try {
      JSON.parse(readFileSync(join(root, example.dir, 'model.json'), 'utf8'))
    } catch (err) {
      errors.push(`${label}: model.json is not valid JSON — ${err.message}`)
    }
  }
  return errors
}

export const GENERATED_NOTE = 'Do not edit. Run: node scripts/build-manifest.mjs'
export const MARK_START = '<!-- examples:start -->'
export const MARK_END = '<!-- examples:end -->'

export const normalizeEol = (text) => text.replace(/\r\n/g, '\n')

// Full display order: section, then group (both in groups.json order), then
// the example's own order, then slug as a stable tiebreak.
function displaySort(groups, examples) {
  const sIdx = new Map(groups.sections.map((s, i) => [s.id, i]))
  const gIdx = new Map(groups.sections.flatMap((s) => s.groups.map((g, i) => [`${s.id}/${g.id}`, i])))
  return [...examples].sort(
    (a, b) =>
      sIdx.get(a.section) - sIdx.get(b.section) ||
      gIdx.get(`${a.section}/${a.group}`) - gIdx.get(`${b.section}/${b.group}`) ||
      a.meta.order - b.meta.order ||
      a.slug.localeCompare(b.slug),
  )
}

// Only examples with a model.drawio go in: deployed builds open whatever url
// they are given. `order` is a GLOBAL rank so an old build's flat sort by
// order reproduces the grouped display order.
export function buildManifest(groups, examples) {
  const picker = displaySort(groups, examples.filter((e) => e.hasDrawio))
  return {
    version: 1,
    generated: GENERATED_NOTE,
    sections: groups.sections,
    examples: picker.map((e, i) => ({
      id: e.slug,
      title: e.meta.title,
      summary: e.meta.summary,
      teaches: e.meta.teaches,
      order: (i + 1) * 10,
      section: e.section,
      group: e.group,
      url: `${e.dir}/model.drawio`,
    })),
  }
}

export const serializeManifest = (manifest) => JSON.stringify(manifest, null, 2) + '\n'

const cell = (s) => String(s).replace(/\|/g, '\\|')

export function renderExamplesTable(groups, examples) {
  const sorted = displaySort(groups, examples)
  const out = []
  for (const s of groups.sections) {
    const rows = sorted.filter((e) => e.section === s.id)
    if (rows.length === 0) continue
    const groupTitle = new Map(s.groups.map((g) => [g.id, g.title]))
    out.push(`### ${s.title}`, '', '| Group | Example | Teaches | Opens in drawio |', '|---|---|---|---|')
    for (const e of rows) {
      const opens = e.hasDrawio ? 'yes' : 'no — model.json'
      out.push(`| ${cell(groupTitle.get(e.group))} | [${cell(e.meta.title)}](${e.dir}/) | ${cell(e.meta.teaches.join(', '))} | ${opens} |`)
    }
    out.push('')
  }
  return out.join('\n')
}

export function replaceBetweenMarkers(text, body) {
  const start = text.indexOf(MARK_START)
  const end = text.indexOf(MARK_END)
  if (start < 0 || end < start) {
    throw new Error(`README.md must contain ${MARK_START} followed by ${MARK_END}`)
  }
  return text.slice(0, start + MARK_START.length) + '\n' + body + text.slice(end)
}
