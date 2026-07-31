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
| `url` | absolute `raw.githubusercontent.com` URL of the model file |

The top-level `version` is the schema version the app checks. Bumping it makes
older Quodsi builds decline the catalog rather than half-render it.

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

1. Build it in Quodsi drawio and run **Convert Diagram to Model**.
2. Set parameters that make the model worth reading — an example with default
   values everywhere teaches nothing.
3. Add it under `models/NN-<slug>/` with a README covering what it shows and at
   least two things worth trying.
4. Add the manifest entry.
5. `node scripts/validate.mjs` must pass.

## Licence

These models are published for anyone to learn from, copy, and adapt.
