// Repo-side guards for published examples. Run from the repo root:
//   node scripts/validate.mjs
// Structural only: whether a model still passes the Quodsi validation gate is
// checked in the Quodsi repos, not here.
import { loadGroups, scanExamples, checkModelFiles } from './lib/catalog.mjs'

const root = process.cwd()
const { groups, errors: groupErrors } = loadGroups(root)
if (!groups) {
  console.error('Validation failed:\n' + groupErrors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
const { examples, errors } = scanExamples(root, groups)
for (const ex of examples) errors.push(...checkModelFiles(root, ex))

if (errors.length) {
  console.error('Validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
const inPicker = examples.filter((e) => e.hasDrawio).length
console.log(`OK: ${examples.length} example(s), ${inPicker} in the drawio picker`)
