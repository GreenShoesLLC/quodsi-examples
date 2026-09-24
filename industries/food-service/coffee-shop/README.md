# Coffee Shop — shared resource pool + probability routing

A raw Quodsi **model document** (`model.json`, `schemaVersion 2026.11.01`) —
not a `.drawio` diagram. It is run directly through the Quodsi agent
interface (CLI/MCP), no drawing tool involved.

## Provenance

Authored 2026-08-07 by a fresh AI agent with no prior Quodsi context, as the
first dogfood of the `quodsi-modeling` team skill
(`quodsim/.claude/skills/quodsi-modeling/`). The document validated clean
and ran on the agent's **first** `model put` — zero fix iterations.

## The model

- Customers arrive ~every 2 min (exponential), 8-hour day (480 min, MINUTES clock).
- **Order** station: 1 cashier, ~1 min service.
- 80/20 probability split: **Espresso Bar** (~3 min) / **Pastry Counter** (~1.5 min).
- Both downstream stations **share one `Barista` pool (capacity 2)** through a
  single `resourceRequirement` — the shared-resource contention pattern.

Teaching point: at 5 reps the barista pool is the binding constraint —
~67% utilization but a persistent queue of 2 in every replication
(Espresso Bar drives ~562 of the 960 available barista-minutes). Mean
utilization alone understates contention; read the queue stats with it.

## Run it

From a quodsim checkout (engine must support `schemaVersion >= 2026.11.01`, the clean wire era):

```
venv/Scripts/quodsi.exe model validate path/to/model.json --json
venv/Scripts/quodsi.exe run path/to/model.json --reps 5 --seed 20260807 --json
```

What-if without editing the document (dry-run by default):

```
venv/Scripts/quodsi.exe model apply-changes path/to/model.json --changes changes.json
```

with `changes.json` containing a `RESOURCE`/`Barista`/`CAPACITY` → 3 request.
