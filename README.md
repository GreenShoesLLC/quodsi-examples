# Quodsi example models

Worked discrete-event simulation models you can open directly in Quodsi's
drawio editor — no download, no account, no setup.

Each model is a real `.drawio` file with the Quodsi model data embedded in it.
Open one, look at how it's put together, change a number, run it.

## Opening an example

In Quodsi drawio: **Quodsi → Open Example Model…**, then pick one.

Every example is also a plain link, so you can share one directly:

```
https://dev-drawio.quodsi.com/#U<url-encoded-raw-url-of-the-model>
```

Opening a model this way loads it as an unsaved file. Edit freely — you are
working on your own copy and cannot affect what's published here.

## The examples

| # | Model | Teaches |
|---|-------|---------|
| 1 | [Generator and activity](models/01-generator-activity/) | Arrivals, a single activity, connectors |

More rungs are being added: sharing a resource between activities, then routing
and multiple entity types.

## Repository layout

```
manifest.json                    the catalog the picker reads
models/
  NN-<slug>/
    model.drawio                 the model
    README.md                    what it shows and what to try
```

`manifest.json` is the contract with the app. Each entry:

| Field | Meaning |
|---|---|
| `id` | stable identifier, never reused |
| `title` | shown in the picker |
| `summary` | one line, shown under the title |
| `teaches` | short concept tags |
| `order` | position in the ladder, ascending |
| `url` | path of the model file relative to the repo root: `models/NN-<slug>/model.drawio` |

The top-level `version` is the schema version the app checks. Bumping it makes
older Quodsi builds decline the catalog rather than half-render it.

Urls are relative on purpose: the app resolves them against the branch it
fetched the manifest from, so this file stays identical across branches and
promoting a branch is a plain merge. Never put an absolute URL in an entry —
it would bake a branch in, and validation rejects it.

## Branches

Each Quodsi environment reads its own branch of this repo, so examples can be
staged against the engine version that environment actually runs:

| Branch | Read by |
|---|---|
| `dev` | the dev environment (dev-drawio.quodsi.com) |
| `test` | the test environment (test-drawio.quodsi.com) |
| `main` | local builds, and production when it exists |

New examples land on `dev` first and promote `dev` → `test` → `main`,
mirroring how the Quodsi engine itself is promoted: each merge happens once
the engine capability the example relies on has reached that environment.

## Rules for a published model

`scripts/validate.mjs` enforces these on every push:

- **No `quodsiDocumentId` attribute.** That attribute binds a diagram to one
  Quodsi model record. If a published example carried one, every user who opened
  it would collide onto the same record and overwrite each other's work. Files
  here must have none, so each user mints their own on first use.
- **Stored uncompressed.** drawio compresses diagram XML by default. Compressed
  files can't be diffed in review and can't be read by the validator, so every
  model here keeps its literal `<mxGraphModel>`.
- **`model.drawio` is the filename**, inside a numbered folder.
- **The manifest and the folders agree** — every entry points at a file that
  exists, and every folder has an entry.

## Contributing a model

The full walkthrough is in [CONTRIBUTING.md](CONTRIBUTING.md). The short
version:

1. Build it in Quodsi drawio, run **Convert Diagram to Model**, run it, and
   save it to your device.
2. Set parameters that make the model worth reading — an example with default
   values everywhere teaches nothing.
3. `node scripts/publish.mjs <saved-file> NN-<slug>` — decompresses the file,
   strips `quodsiDocumentId`, and places it at `models/NN-<slug>/model.drawio`.
4. Write the folder README (what it shows, at least two things worth trying)
   and add the manifest entry.
5. `node scripts/validate.mjs` must pass; open a PR into the `dev` branch.

## Agent-authored model documents (`agent-models/`)

Alongside the `.drawio` diagrams above, `agent-models/` holds raw Quodsi
**model documents** (`model.json`) authored through the agent interface
(CLI/MCP) rather than a drawing tool. They are not listed in
`manifest.json` and the drawio picker never sees them — run them directly
with the `quodsi` CLI (see each folder's README). Entries so far:
`agent-models/01-coffee-shop/` (the inaugural dogfood of the
`quodsi-modeling` skill) and `agent-models/02-action-tour/` (every
wire-legal action, one station each).

## Licence

These models are published for anyone to learn from, copy, and adapt.
