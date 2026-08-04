# Adding an example model

This is the full walkthrough for publishing a new example so it shows up under
**Quodsi → Open Example Model…** in Quodsi drawio. It assumes you can build a
model in the app; everything else is spelled out.

## How the feature works (30 seconds)

The app does not ship with a list of examples. Every time someone opens the
picker, it fetches [`manifest.json`](manifest.json) from this repo and shows
whatever is in it. Each entry points at a `.drawio` file in this repo, which
the app opens directly.

Which *branch* it fetches depends on the environment: the **dev** app
(dev-drawio.quodsi.com) reads the `dev` branch, the **test** app
(test-drawio.quodsi.com) reads `test`, and local builds read `main` (as will
production, when it exists). This mirrors how Quodsi itself is promoted — new
engine capability reaches dev first, then test — so an example that relies on
something new can be published to `dev` without breaking on the older engines
the other environments still run.

Three consequences worth knowing before you start:

- **New examples land on `dev`.** Your pull request targets the `dev` branch,
  and merging it makes the example live in the dev app. It reaches the other
  environments later, as the branch is promoted `dev` → `test` → `main` (see
  "Promoting an example" at the end).
- **Merging is publishing.** There is no deploy step — once your change is on
  a branch, it is live for every user of the environments reading that branch.
  That's why the steps below go through a pull request: the automatic checks
  run on the PR *before* anything goes live.
- **The repo is public.** Anyone can read these files, on any branch — `dev`
  is staging, not privacy. Model names, labels, and README text should all be
  things we're happy to show the world.

## One-time setup

You need:

- A GitHub account with push access to `GreenShoesLLC/quodsi-examples`
  (Daniel can add you).
- [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org)
  (version 18 or newer) installed.

Then clone the repo somewhere convenient and start from the `dev` branch:

```
git clone https://github.com/GreenShoesLLC/quodsi-examples.git
cd quodsi-examples
git checkout dev
```

## Step 1 — Build the model in Quodsi drawio

1. Open Quodsi drawio and draw the model.
2. Run **Quodsi → Convert Diagram to Model**. This is required — an
   unconverted diagram is just a picture, and the tooling below will refuse it.
3. Set parameters that make the model worth reading. An example where every
   value is still the default teaches nothing; the numbers should tell the
   story (see how the [first example](models/01-generator-activity/README.md)
   uses a 5-minute arrival rate against a 1-minute activity).
4. **Run it.** Open Studies and run the model once. Never publish a model you
   haven't seen simulate.
5. Save the file to your computer: **File → Save As**, choose **Device**, and
   pick any name (e.g. `shared-resource.drawio`). Save normally — don't worry
   about drawio's compression or any embedded ids; the publish script in Step 3
   takes care of both.

## Step 2 — Pick the folder name

Models live in numbered folders: `models/NN-short-slug/`. Look at what already
exists and take the next number. If `01-generator-activity` is the highest,
yours is `02-` plus a short lowercase dashed slug, e.g. `02-shared-resource`.

The examples form a teaching ladder — each one should build on the ideas of
the one before it, so the number is also a difficulty ordering.

## Step 3 — Run the publish script

From the repo root:

```
node scripts/publish.mjs "C:\path\to\your-saved-file.drawio" 02-shared-resource
```

This creates `models/02-shared-resource/model.drawio` from your saved file,
after doing two things a raw save from the app needs:

- **Decompresses the XML.** drawio saves compressed by default; published
  files must be plain XML so changes can be reviewed and validated.
- **Strips the `quodsiDocumentId` attribute.** This id ties a file to one
  Quodsi model record. If a published example kept it, everyone who opened the
  example would share a single record and overwrite each other's work. With it
  removed, each user gets their own copy on first use — which is what we want.

The script prints what it did and what's left to do. If it says the diagram
was never Converted, go back to Step 1.

## Step 4 — Write the folder README

Create `models/02-shared-resource/README.md`. Copy the structure of
[`models/01-generator-activity/README.md`](models/01-generator-activity/README.md):

- a one-line summary and a tiny ASCII sketch of the flow,
- **What it shows** — each shape and the parameter choices, and *why* those
  numbers,
- **Things to try** — at least two concrete edits with what the reader should
  expect to happen. This section is the actual teaching; spend your effort here.

## Step 5 — Add the manifest entry

Open `manifest.json` and add an object to the `examples` array (don't touch
the top-level `version`):

```json
{
  "id": "shared-resource",
  "title": "Sharing a resource",
  "summary": "Two activities compete for one operator. Utilisation looks fine; waiting says otherwise.",
  "teaches": ["resources", "resource requirements", "contention"],
  "order": 2,
  "url": "models/02-shared-resource/model.drawio"
}
```

Field by field:

| Field | What to put there |
|---|---|
| `id` | A stable identifier. Never reuse an old one, and never change it after publishing. |
| `title` | Shown in the picker list. Short. |
| `summary` | One sentence shown under the title. Sell what the model teaches. |
| `teaches` | 2–4 short concept tags, shown as chips in the picker. |
| `order` | Position in the ladder, ascending. Usually matches the folder number. |
| `url` | Exactly `models/<your-folder>/model.drawio` — relative, no host, no branch. The app resolves it against the branch it fetched the manifest from, which is what lets `dev` and `main` share identical files. An absolute URL is rejected by validation. |

## Step 6 — Validate

```
node scripts/validate.mjs
```

You want to see something like `OK: 2 example(s), 2 folder(s)`. This checks
everything above: the file is uncompressed and Converted, carries no
`quodsiDocumentId`, the manifest entry's url points at a file that exists, and
no folder is missing its entry. The same check runs automatically on your pull
request, so nothing broken can be merged.

While you're at it, do one manual sanity check: in Quodsi drawio, use
**File → Open From → Device** to open the *processed* file
(`models/02-shared-resource/model.drawio`) and confirm the Quodsi panel shows
your model, not the "convert this diagram" prompt.

## Step 7 — Open a pull request into `dev`

```
git checkout -b add-shared-resource
git add models/02-shared-resource manifest.json
git commit -m "Add shared-resource example (rung 2)"
git push -u origin add-shared-resource
```

Then open the pull request on GitHub (the push prints a link) and set its
**base branch to `dev`**, not `main`. The validate check runs on the PR; once
it's green and the PR is merged, the example is live in the dev app.

## Step 8 — See it live

Open the **dev** app (dev-drawio.quodsi.com) → **Quodsi → Open Example
Model…** and your entry should be in the list. The picker fetches the manifest
fresh each time it opens, though GitHub's raw file host caches for a few
minutes — if you don't see it immediately after merging, wait five minutes and
reopen the dialog.

Open the example itself and confirm it lands as a working, converted model.

## Promoting an example

Examples promote the same way the engine does: `dev` → `test` → `main`. Each
environment may run an older engine than the one before it, so an example
moves forward only once everything it relies on works in the destination
environment.

Promotion is a plain merge — the files are identical across branches by
design:

```
git checkout test && git pull
git merge origin/dev
git push
```

…and later, `main` from `test` the same way. After merging into `test`, open
the test app and confirm the example still opens and runs there — that check
is the entire point of the branch.

If you're not sure whether an example's behaviour depends on something that
hasn't been promoted yet, ask Daniel — matching examples to engine versions is
the whole reason the branches exist.

## Rules that are easy to trip over

- **Never rename or delete a published folder.** The raw URL is the published
  address — people may have shared links to it, and users with a cached
  manifest will still request the old path. Fix models in place; the URL keeps
  working.
- **Never reuse an `id`**, even after removing an entry.
- **The model file is always named `model.drawio`** — the picker's url check
  enforces it.
- **Updating an existing example** is the same flow: re-run the publish script
  with the same folder name (it overwrites), update the README if behaviour
  changed, PR it. No manifest change needed unless the title/summary should
  change too.
