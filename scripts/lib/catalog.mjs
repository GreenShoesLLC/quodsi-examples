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
