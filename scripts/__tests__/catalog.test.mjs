import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { loadGroups, scanExamples, checkModelFiles } from '../lib/catalog.mjs'

// Builds a throwaway repo from { 'relative/path': 'contents' }.
export function makeRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'qex-'))
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

export const GROUPS = {
  sections: [
    { id: 'learn', title: 'Learn', groups: [
      { id: 'getting-started', title: 'Getting Started', summary: 'Start here.' },
      { id: 'actions', title: 'Actions', summary: 'What activities do.' },
    ] },
    { id: 'industries', title: 'Industries', groups: [
      { id: 'healthcare', title: 'Healthcare', summary: 'Clinics.' },
    ] },
  ],
}

export const DRAWIO =
  '<mxfile><diagram><mxGraphModel><root><object quodsiType="Activity"/></root></mxGraphModel></diagram></mxfile>'

export function meta(over = {}) {
  return JSON.stringify({ title: 'T', summary: 'S', teaches: ['x'], order: 10, ...over })
}

// A minimal valid example folder at dir.
export function example(dir, over = {}) {
  return {
    [`${dir}/example.json`]: meta(over),
    [`${dir}/README.md`]: '# x\n',
    [`${dir}/model.drawio`]: DRAWIO,
  }
}

test('loadGroups reads a valid groups.json', () => {
  const root = makeRepo({ 'groups.json': JSON.stringify(GROUPS) })
  const { groups, errors } = loadGroups(root)
  assert.deepEqual(errors, [])
  assert.equal(groups.sections[0].groups[1].id, 'actions')
})

test('loadGroups reports missing file, bad slugs, duplicate ids and empty titles', () => {
  assert.match(loadGroups(makeRepo({})).errors[0], /groups\.json/)
  const bad = {
    sections: [
      { id: 'Learn', title: 'Learn', groups: [] },
      { id: 'x', title: '', groups: [
        { id: 'a', title: 'A', summary: 's' },
        { id: 'a', title: 'A2', summary: 's' },
      ] },
      { id: 'x', title: 'Dup', groups: [] },
    ],
  }
  const { errors } = loadGroups(makeRepo({ 'groups.json': JSON.stringify(bad) }))
  assert.ok(errors.some((e) => /"Learn"/.test(e)), 'bad section slug')
  assert.ok(errors.some((e) => /title/.test(e)), 'empty title')
  assert.ok(errors.some((e) => /duplicate group id "a"/.test(e)), 'dup group')
  assert.ok(errors.some((e) => /duplicate section id "x"/.test(e)), 'dup section')
})

test('scanExamples finds examples and derives section/group from the path', () => {
  const root = makeRepo({
    'groups.json': JSON.stringify(GROUPS),
    ...example('learn/actions/split', { order: 10 }),
    'industries/healthcare/urgent-care/example.json': meta(),
    'industries/healthcare/urgent-care/README.md': '# u\n',
    'industries/healthcare/urgent-care/model.json': '{}',
    'scripts/x.mjs': '',
  })
  const { groups } = loadGroups(root)
  const { examples, errors } = scanExamples(root, groups)
  assert.deepEqual(errors, [])
  const split = examples.find((e) => e.slug === 'split')
  assert.equal(split.section, 'learn')
  assert.equal(split.group, 'actions')
  assert.equal(split.dir, 'learn/actions/split')
  assert.equal(split.hasDrawio, true)
  assert.equal(split.hasJson, false)
  assert.equal(examples.find((e) => e.slug === 'urgent-care').hasJson, true)
})

test('scanExamples rejects undeclared top-level folders, sections and groups', () => {
  const root = makeRepo({
    'groups.json': JSON.stringify(GROUPS),
    ...example('models/01-old'),
    ...example('learn/resources/shared'),
  })
  const { errors } = scanExamples(root, loadGroups(root).groups)
  assert.ok(errors.some((e) => /models/.test(e) && /not a declared section/.test(e)))
  assert.ok(errors.some((e) => /learn\/resources/.test(e) && /not a declared group/.test(e)))
})

test('scanExamples reports stray files at section and group level but ignores dotfiles', () => {
  const root = makeRepo({
    'groups.json': JSON.stringify(GROUPS),
    'learn/notes.md': 'x',
    'learn/actions/stray.txt': 'x',
    'learn/.DS_Store': 'x',
    'learn/actions/.DS_Store': 'x',
    ...example('learn/actions/split'),
  })
  const { errors } = scanExamples(root, loadGroups(root).groups)
  assert.ok(errors.some((e) => /learn\/notes\.md/.test(e)))
  assert.ok(errors.some((e) => /learn\/actions\/stray\.txt/.test(e)))
  assert.ok(!errors.some((e) => /DS_Store/.test(e)))
})

test('scanExamples enforces slug shape and repo-wide uniqueness', () => {
  const root = makeRepo({
    'groups.json': JSON.stringify(GROUPS),
    ...example('learn/actions/Split_Me'),
    ...example('learn/actions/dup'),
    ...example('industries/healthcare/dup'),
  })
  const { errors } = scanExamples(root, loadGroups(root).groups)
  assert.ok(errors.some((e) => /Split_Me/.test(e) && /slug/.test(e)))
  assert.ok(errors.some((e) => /duplicate example slug "dup"/.test(e)))
})

test('scanExamples validates example.json, README and model presence', () => {
  const root = makeRepo({
    'groups.json': JSON.stringify(GROUPS),
    'learn/actions/no-meta/README.md': '#',
    'learn/actions/no-meta/model.drawio': DRAWIO,
    'learn/actions/bad-meta/example.json': JSON.stringify({ title: '', summary: 'S', teaches: [1], order: '1', summery: 'typo' }),
    'learn/actions/bad-meta/README.md': '#',
    'learn/actions/bad-meta/model.drawio': DRAWIO,
    'learn/actions/no-readme/example.json': meta(),
    'learn/actions/no-readme/model.drawio': DRAWIO,
    'learn/actions/no-model/example.json': meta(),
    'learn/actions/no-model/README.md': '#',
  })
  const { errors } = scanExamples(root, loadGroups(root).groups)
  const has = (re) => errors.some((e) => re.test(e))
  assert.ok(has(/no-meta: missing example\.json/))
  assert.ok(has(/bad-meta: title must be a non-empty string/))
  assert.ok(has(/bad-meta: teaches must be an array of strings/))
  assert.ok(has(/bad-meta: order must be a number/))
  assert.ok(has(/bad-meta: unknown field "summery"/))
  assert.ok(has(/no-readme: missing README\.md/))
  assert.ok(has(/no-model: needs model\.drawio or model\.json/))
})

test('checkModelFiles applies the drawio publication rules', () => {
  const root = makeRepo({
    'a/model.drawio': '<mxfile><diagram>eJzLSM3JyQcABiwCFQ==</diagram></mxfile>',
    'b/model.drawio': DRAWIO.replace('<object', '<object quodsiDocumentId="abc"'),
    'c/model.drawio': '<mxfile><diagram><mxGraphModel><root/></mxGraphModel></diagram></mxfile>',
    'd/model.drawio': DRAWIO,
  })
  const run = (dir) => checkModelFiles(root, { dir, hasDrawio: true, hasJson: false })
  assert.ok(run('a').some((e) => /compressed/.test(e)))
  assert.ok(run('b').some((e) => /quodsiDocumentId/.test(e)))
  assert.ok(run('c').some((e) => /quodsiType/.test(e)))
  assert.deepEqual(run('d'), [])
})

test('checkModelFiles requires model.json to parse', () => {
  const root = makeRepo({ 'a/model.json': '{ nope', 'b/model.json': '{"name":"x"}' })
  const run = (dir) => checkModelFiles(root, { dir, hasDrawio: false, hasJson: true })
  assert.ok(run('a').some((e) => /model\.json is not valid JSON/.test(e)))
  assert.deepEqual(run('b'), [])
})
