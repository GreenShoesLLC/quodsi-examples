# The Action Tour — every wire-legal action, one station each

A raw Quodsi **model document** (`model.json`, `schemaVersion 2026.08.20`) —
not a `.drawio` diagram. It is run directly through the Quodsi agent
interface (CLI/MCP), no drawing tool involved.

## Provenance

Authored 2026-08-07 per
`docs/superpowers/specs/2026-08-07-action-tour-example-design.md` in the
`quodsim` repo, as the second dogfood of the `quodsi-modeling` team skill.
Unlike 01-coffee-shop (a realistic scenario), this model is deliberately
didactic: it is not trying to look like a real system — it exists to put
every wire-legal action side by side, one station each, so an engine change
to any action's wire handling has somewhere to show up. The document also
lives as a corpus fixture in `quodsim` (`tests/fixtures/lucid_json/model_def_action_tour.json`,
byte-identical to this copy), covered by a parse/validate sweep and a
behavioral engine test that runs it and asserts the observables below.

## The model

Items arrive on a fixed schedule (4 items, every 6 minutes, starting at
minute 1 — a `FREQUENCY` generator with `maxEntities: 4`) and walk through
ten stations in a straight line, each named for the action it demonstrates.
A `Label` side-entity is spawned partway through and lives out its entire
life off the main line. All durations are constants (no distributions
tour here — that's the anatomy doc's job) and the run window (120 minutes)
has slack built in, so every item finishes deterministically.

| # | Station | Action(s) | What to notice |
|---|---|---|---|
| 1 | `Station-Trio` | SEIZE → DELAY → RELEASE | The explicit three-action form against `req-operator` — seize, hold, release, spelled out as three separate wire actions in one `actions` list. |
| 2 | `Station-Fused` | DELAY_WITH_RESOURCE | Same resource requirement as #1, fused into a single action (`keepResource: false`). Contrast with `Station-Trio`: this is the shorthand for "seize, hold, release" when you don't need anything to happen *between* seize and release. **Engine gotcha:** if `Station-Trio`'s RELEASE is ever deleted or forgotten, the run does **not** deadlock — `Station-Fused`'s DELAY_WITH_RESOURCE silently reuses the entity's still-open capture from `Station-Trio` instead of re-seizing, and performs the implicit release itself at exit. The trio only behaves like a trio if you close it deliberately; don't rely on a downstream DELAY_WITH_RESOURCE to catch a missing RELEASE. |
| 3 | `Station-Assign` | ASSIGN | Sets `grade = 1` on the entity — the value `Station-Branch` reads later. |
| 4 | `Station-Loop` | LOOP ×3 | A nested `actions` list (one ASSIGN, `polish_count += 1`) run three times. The nesting — an action containing actions — is the lesson, not the increment itself. |
| 5 | `Station-Branch` | BRANCH | Condition on `grade >= 1`. Both lanes are populated on purpose (`ifTrue`: mark `branch_lane = 1` + short 0.5-min DELAY; `ifFalse`: mark `branch_lane = 2` + longer 5-min DELAY) — a BRANCH with an empty lane teaches nothing about branching. |
| 6 | `Station-Script` | SCRIPT | `source = "value = get_state(\"polish_count\")\nset_state(\"polish_count\", value * 2)"` — the exact sandboxed script, shown here rather than paraphrased. Reads and writes entity state through `get_state`/`set_state`, doubling whatever LOOP left behind. `languageVersion: 1`. |
| 7 | `Station-Create` | CREATE | Spawns a `Label` entity and routes it via `destinationId: "label-desk"` — an **action-level** destination, not a connector. This is a different routing mechanism from the connector chain that links stations 1-8; see the routing note below. |
| — | `Label-Desk` | DISPOSE | The label's entire life: arrive (via CREATE's `destinationId`), get disposed. Off the main line entirely — no connector points at it, and it has none outbound. |
| 8 | `Station-Split` | SPLIT | `count: 2`, `destinationId: "station-join"` — again action-level routing, not a connector. `inheritStates` carries `batch_id`, `polish_count`, `branch_lane` onto both pieces; `splitIndexState: "piece_index"` tags which half is which. |
| 9 | `Station-Join` | JOIN | `matchState: "batch_id"`, `joinCount: 2`, `destinationId: "station-pack"`. **`Station-Join.capacity` (2) must equal `joinCount` (2)** — the join holds arriving pieces until it has `joinCount` of them with matching `matchState`, so if capacity is set lower than `joinCount` the station can never hold enough pieces at once and the run deadlocks with items stuck waiting at the join. **Known caveat:** `batch_id` is a constant (`1`) on every item in this model, so JOIN fuses *any* two arriving pieces, not guaranteed siblings from the same SPLIT. With a capacity-1 upstream chain and constant durations, one item's two pieces happen to arrive adjacently, so pairing is effectively correct here — but a production model needs a genuinely unique `batch_id` per item (e.g. an ASSIGN or SCRIPT deriving it from an entity id or a counter) so JOIN can't accidentally fuse pieces from two different items. |
| 10 | `Station-Pack` | DELAY | A plain finish with no outbound connector — reaching here with nowhere else to go **is** the model exit. |

**RELEASE idiom not used here:** every RELEASE in this model targets a
specific `resourceRequirementId` (`req-operator`). There is also an
empty-array release-everything idiom (`RELEASE` with no target, releasing
every resource the entity currently holds) that this tour doesn't exercise
— worth knowing about, not needed when there's only one requirement in
play.

**Routing — two mechanisms, not one:** stations 1 through 8 are chained by
ordinary connectors (`edge-gen-trio`, `edge-trio-fused`, … `edge-create-split`).
But `Station-Create` (to `Label-Desk`) and `Station-Split` (to `Station-Join`)
route via an action-level `destinationId` field instead — no connector
exists for either hop. Both mechanisms are wire-legal and can coexist in
the same model; connectors express "what happens after this station's
actions finish," while an action's own `destinationId` expresses "this
specific action sends the entity/branch somewhere else, right now."

## What's deliberately missing

`PYTHON` is the one entry in the engine's action union not exercised here.
It is not wire-legal — the codec refuses to emit it — so it has no station.
If you're checking this tour against the full action vocabulary and count
only 12 stations' worth of actions, that's expected: `PYTHON` was never
going to have a thirteenth.

## Run it

From a quodsim checkout (engine must support `schemaVersion >= 2026.08.20`):

```
venv/Scripts/quodsi.exe model validate path/to/model.json --json
venv/Scripts/quodsi.exe run path/to/model.json --reps 2 --seed 42 --json
```

## Expected observables

- 4 items arrive; 8 split pieces at `Station-Split`; 4 fused finishers
  arrive at `Station-Pack` (2 in, 2 out per JOIN — net-neutral against the
  earlier SPLIT).
- Every finisher: `polish_count == 6` (LOOP ×3 → 3, then SCRIPT doubles →
  6) and `branch_lane == 1` (the ASSIGN at `Station-Assign` forces
  `Station-Branch`'s `ifTrue` lane).
- 4 `Label` entities created (one per item passing `Station-Create`) and
  all 4 disposed at `Label-Desk`.
- The last finisher completes at minute 24.0 (arrival-schedule floor plus
  the critical-path delays down the `ifTrue` branch lane).
- Deterministic across reps at `--seed 42` — every duration in this model
  is a constant distribution, so rep-to-rep state values are identical.
