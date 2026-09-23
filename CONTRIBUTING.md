# How to add an example model

This repo holds the example models that appear in Quodsi drawio under
**Quodsi → Open Example Model…**. Adding one means adding a folder and a few
lines of text here.

There is no deploy step. When you push a change to the `dev` branch of this
repo, it is live at **dev-drawio.quodsi.com** within about five minutes.

**Part 1** below walks you through one small change, start to finish, so you
can see that happen. It takes about fifteen minutes and you undo it at the end.
**Part 2** is how you publish a real model. Do Part 1 first — everything in
Part 2 assumes you have done it.

---

# Before you start

## You need access

Ask Daniel to give your GitHub account push access to
`GreenShoesLLC/quodsi-examples`. Without it, the push in Part 1 Step 5 fails.

## You need three programs installed

If you do not already have these, install them before going further. Take the
default options in each installer.

| Program | Where to get it | What it is for |
|---|---|---|
| **Git** | https://git-scm.com/downloads | Copies this repo to your computer and sends your changes back |
| **Node.js** (LTS version) | https://nodejs.org | Runs the two helper scripts in Part 2 |
| **VS Code** | https://code.visualstudio.com | The editor you will change files in |

## Check they are working

Open **PowerShell** — click Start, type `powershell`, press Enter. Then paste
this and press Enter:

```
git --version; node --version; code --version
```

You should get three version numbers, something like:

```
git version 2.55.0.windows.1
v24.19.0
1.130.0
```

The exact numbers do not matter — three numbers means three working programs.

**If any line says "not recognized"**, and you installed that program while this
PowerShell window was already open, close the window and open a new one. A
window that was open before an install cannot see it. If it still says
"not recognized" in a fresh window, that program did not install — run its
installer again.

---

# Part 1 — Your first change

You are going to change one sentence of text, push it, watch it appear in the
live dev app, and then put it back.

## Step 1 — Copy the repo onto your computer

Copy both lines below, paste them into your PowerShell window, and press Enter:

```
cd C:\
git clone https://github.com/GreenShoesLLC/quodsi-examples.git
```

You now have a folder at **`C:\quodsi-examples`**. Every instruction in this
document assumes that exact location.

## Step 2 — Open it in VS Code

Copy the line below, paste it into PowerShell, and press Enter:

```
code C:\quodsi-examples
```

VS Code opens with the repo's files listed down the left side. Leave it open —
you will edit a file there in Step 4.

## Step 3 — Switch to the `dev` branch

Go back to your PowerShell window. Copy all three lines below, paste them in,
and press Enter:

```
cd C:\quodsi-examples
git checkout dev
git pull
```

`dev` is the branch that dev-drawio.quodsi.com reads. Anything you push here
goes live there. (There are two other branches — see
[Which app reads which branch](#which-app-reads-which-branch) at the end.)

## Step 4 — Edit `manifest.json`

`manifest.json` is the list of examples the app shows. In VS Code, press
`Ctrl+P`, type `manifest`, and press Enter. You will see this:

```json
{
  "version": 1,
  "examples": [
    {
      "id": "generator-activity",
      "title": "Generator and activity",
      "summary": "Entities arrive on an exponential schedule and pass through one activity, one at a time. The smallest model that runs.",
      "teaches": ["generators", "activities", "connectors"],
      "order": 1,
      "url": "models/01-generator-activity/model.drawio"
    }
  ]
}
```

Find the `"summary"` line and add your name to the end of the sentence, inside
the quotes, so you will recognise it when it shows up. For example:

```json
      "summary": "Entities arrive on an exponential schedule and pass through one activity, one at a time. The smallest model that runs. Edited by YOUR NAME.",
```

Two things to be careful about, because they are the only ways this goes wrong:

- Keep the two `"` quote marks around the whole sentence.
- Keep the `,` comma at the very end of the line.

Save with `Ctrl+S`.

## Step 5 — Send your change to GitHub

Go back to your PowerShell window. Copy all three lines below, paste them in,
and press Enter:

```
git add manifest.json
git commit -m "Tweak the summary"
git push
```

The **first** time you push, a browser window opens asking you to sign in to
GitHub. That is expected — sign in, and it will not ask again on this computer.

When it finishes, the last line printed ends in something like `dev -> dev`.
That means it worked.

## Step 6 — Check the automatic test passed

Every push runs an automatic check that the file is still valid. Open:

**https://github.com/GreenShoesLLC/quodsi-examples/actions**

Your commit is at the top of the list. Wait about thirty seconds for it to
finish, then look at the icon next to it:

- ✅ **Green check** — you are good, go to Step 7.
- ❌ **Red X** — you broke the file, almost always a missing quote or comma from
  Step 4. Go back to VS Code, compare your line against the example above, fix
  it, save, and repeat Step 5.

## Step 7 — See it live

Open **https://dev-drawio.quodsi.com** in your browser, then in the menu bar
choose **Quodsi → Open Example Model…**.

Your edited sentence appears under **Generator and activity**.

**If you still see the old sentence**, you were just too fast. GitHub keeps a
copy of the file for about five minutes before serving the new one. Close the
dialog, wait, and open **Quodsi → Open Example Model…** again. Reopening that
dialog is what fetches the fresh list — reloading the page does nothing extra.

## Step 8 — Put it back

In VS Code, replace your whole `"summary"` line with this original one — paste
it rather than retyping, so it goes back exactly as it was:

```json
      "summary": "Entities arrive on an exponential schedule and pass through one activity, one at a time. The smallest model that runs.",
```

Save with `Ctrl+S`. Then go back to PowerShell, copy all three lines below,
paste them in, and press Enter:

```
git add manifest.json
git commit -m "Put the summary back"
git push
```

Wait a few minutes and check the picker again — the original sentence is back.

That is the whole loop. You published a change to a live application and then
unpublished it. Nothing about it was special to text — adding a whole new
example is the same commands with more files.

---

# Part 2 — Publishing a real example

Same loop as Part 1, with more to prepare before the push.

Start every session by making sure you are in `C:\quodsi-examples` and on an
up-to-date `dev`. Copy all three lines below, paste them into PowerShell, and
press Enter:

```
cd C:\quodsi-examples
git checkout dev
git pull
```

## Step 1 — Build the model in Quodsi drawio

1. Open **https://dev-drawio.quodsi.com** and draw the model.
2. Run **Quodsi → Convert Diagram to Model**. This is required. An unconverted
   diagram is only a picture, and the script in Step 3 refuses it.
3. Set parameters that make the model worth reading. An example where every
   value is still the default teaches nothing — the numbers should tell the
   story. See how
   [the first example](models/01-generator-activity/README.md) sets a 5-minute
   arrival rate against a 1-minute activity.
4. **Run it.** Open Studies and run the model once. Never publish a model you
   have not watched simulate.
5. Save it to your computer: **File → Save As**, choose **Device**, any name
   you like, e.g. `shared-resource.drawio`. Save normally — the script in
   Step 3 handles drawio's compression and the embedded id for you.

Note where it saved. If you did not change anything, it is in your Downloads
folder: `C:\Users\<your-name>\Downloads\shared-resource.drawio`.

## Step 2 — Pick a folder name

Published models live in numbered folders inside
**`C:\quodsi-examples\models\`** — one folder per example, named
`NN-short-slug`. Look in that folder now (it is the `models` folder in the VS
Code file list on the left) and see what is already there. For example:

```
C:\quodsi-examples\models\01-generator-activity\
C:\quodsi-examples\models\03-connector-routing\
```

Take **the next unused number**. There are gaps — in the list above, `02` is
free and the next new one after `03` would be `04` — so do not assume the next
number is one more than the count of folders.

The slug is short, lowercase, with dashes instead of spaces. Put together, your
new folder will be something like
**`C:\quodsi-examples\models\02-shared-resource\`**. You do not create it
yourself — the script in Step 3 creates it for you.

The examples form a teaching ladder, each building on the one before it, so the
number is also a difficulty order. Pick a number that puts your model where it
belongs in that sequence.

## Step 3 — Run the publish script

This one you cannot paste unchanged — you have to substitute two things first.
Copy the line below into a blank VS Code tab or Notepad, replace
`C:\Users\your-name\Downloads\shared-resource.drawio` with the real path to the
file you saved in Step 1, replace `02-shared-resource` with the folder name you
chose in Step 2, then paste the finished line into PowerShell and press Enter:

```
node scripts/publish.mjs "C:\Users\your-name\Downloads\shared-resource.drawio" 02-shared-resource
```

Keep the `"` quote marks around the file path — without them the command breaks
on any space in the path. PowerShell must be in `C:\quodsi-examples` for this to
work; if you are not sure, run `cd C:\quodsi-examples` first.

This creates `models/02-shared-resource/model.drawio`, doing two things a raw
save from the app needs:

- **Decompresses the XML.** drawio saves compressed by default; published files
  must be plain text so changes can be read and checked.
- **Strips the `quodsiDocumentId`.** That id ties a file to one Quodsi model
  record. If a published example kept it, everyone who opened the example would
  land on the same record and overwrite each other's work. Removed, each person
  gets their own copy the first time they open it.

The script prints what it did and what is left to do. If it says the diagram was
never Converted, go back to Step 1 and run **Convert Diagram to Model**.

## Step 4 — Write the folder README

In VS Code, create a file called `README.md` inside the folder the script just
made — **`C:\quodsi-examples\models\02-shared-resource\README.md`**. Copy the
structure of the one in the first example
([`models/01-generator-activity/README.md`](models/01-generator-activity/README.md),
i.e. `C:\quodsi-examples\models\01-generator-activity\README.md`):

- a one-line summary and a small sketch of the flow,
- **What it shows** — each shape, the parameter values, and *why* those numbers,
- **Things to try** — at least two concrete edits, each with what the reader
  should expect to happen.

"Things to try" is the actual teaching. Spend your effort there.

## Step 5 — Add your row to the manifest

Open `C:\quodsi-examples\manifest.json` in VS Code (press `Ctrl+P`, type
`manifest`, press Enter) and add an object to the `examples` list. Do not touch
the top-level `version`. Copy this and change every value:

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

Put a `,` after the `}` of the entry above yours. What each field means is in
[The manifest fields](#the-manifest-fields) at the end.

## Step 6 — Check your work

Copy the line below, paste it into PowerShell, and press Enter:

```
node scripts/validate.mjs
```

You want a line like `OK: 2 example(s), 2 folder(s)`. It checks everything
above: the model file is uncompressed and Converted, carries no
`quodsiDocumentId`, your `url` points at a file that really exists, and no
folder is missing its manifest row.

Then one check the script cannot do. In Quodsi drawio, use
**File → Open From → Device** and open the *processed* file —
`C:\quodsi-examples\models\02-shared-resource\model.drawio`, not the one you
saved in Step 1. The Quodsi panel should show your model, not the
"convert this diagram" prompt.

## Step 7 — Push it

Copy all three lines below into a blank VS Code tab or Notepad, replace
`02-shared-resource` with your folder name and the commit message with something
describing your example, then paste the finished lines into PowerShell and press
Enter:

```
git add models/02-shared-resource manifest.json
git commit -m "Add shared-resource example"
git push
```

## Step 8 — Confirm it is live

Same as Part 1: check
[the Actions page](https://github.com/GreenShoesLLC/quodsi-examples/actions) is
green, then open dev-drawio.quodsi.com → **Quodsi → Open Example Model…** and
find your entry. Allow the five-minute wait.

Open your example from the picker and confirm it lands as a working, converted
model — not just that the title appears in the list.

---

# Reference

## The manifest fields

| Field | What to put there |
|---|---|
| `id` | A stable identifier. Never reuse an old one, and never change it after publishing. |
| `title` | Shown in the picker list. Short. |
| `summary` | One sentence shown under the title. Sell what the model teaches. |
| `teaches` | 2–4 short concept tags, shown as chips in the picker. Must be text in quotes. |
| `order` | Position in the ladder, ascending. A plain number, no quotes. Usually matches the folder number. |
| `url` | Exactly `models/<your-folder>/model.drawio` — relative, no web address, no branch name. An absolute URL is rejected. |

## Which app reads which branch

| Branch | Read by |
|---|---|
| `dev` | dev-drawio.quodsi.com |
| `test` | test-drawio.quodsi.com |
| `main` | local builds, and production when it exists |

Each environment may run an older simulation engine than the one before it, so
an example that relies on something new can go live on `dev` without breaking
the others. That is why new work lands on `dev` first.

The `url` in each manifest row is relative for the same reason: the app resolves
it against whichever branch it read the manifest from, so the file is identical
on every branch and promoting is a plain merge.

**This repo is public.** Anyone can read any branch — `dev` is staging, not
privacy. Model names, labels, and README text should all be things we are happy
to show the world.

## Promoting an example to test and main

Once an example has proven itself on `dev`, move it forward. Copy all four lines
below, paste them into PowerShell, and press Enter:

```
git checkout test
git pull
git merge origin/dev
git push
```

Then open **test-drawio.quodsi.com** and confirm the example still opens and
runs there. That check is the entire point of the branch. Later, `main` gets it
from `test` the same way.

If you are not sure whether your model depends on something that has not reached
`test` yet, ask Daniel — matching examples to engine versions is why the
branches exist.

## Rules that are easy to trip over

- **Never rename or delete a published folder.** Its address is public; people
  may have shared links to it, and anyone with an older copy of the list will
  still ask for the old path. Fix models in place.
- **Never reuse an `id`**, even after removing an entry.
- **The model file is always named `model.drawio`.** The app enforces it.
- **Updating an existing example** is the same flow: re-run the publish script
  with the same folder name (it overwrites), update the README if the behaviour
  changed, push. No manifest change needed unless the title or summary should
  change too.

## If something goes wrong

| What you see | What it means |
|---|---|
| `git` / `node` / `code` "is not recognized" | Either that program is not installed, or you are in a PowerShell window that was open before you installed it. Close the window, open a new one, and try again. |
| Red X on the Actions page | Usually a typo in `manifest.json` — a missing comma or quote. Compare your row against the example in Part 2 Step 5. |
| Push rejected / asks for a password repeatedly | You do not have push access yet. Ask Daniel. |
| Picker says "Examples aren't available right now" | `manifest.json` could not be read at all. Check the Actions page. |
| Your example is missing from the picker, but Actions is green | Either you are still inside the five-minute wait, or your row has the wrong type somewhere — `order` must be a number with no quotes, and every `teaches` tag must be in quotes. Rows the app cannot read are skipped silently. |
| Your example opens with the "convert this diagram" prompt | You published an unconverted diagram. Redo Part 2 Step 1, running **Convert Diagram to Model**, then Step 3. |
| Changed something and nothing happened at all | Check you are on the right branch: run `git branch --show-current` — it should print `dev`. |

## Model documents written by an agent

`agent-models/` holds Quodsi model documents (`model.json`) authored through the
CLI rather than drawn in drawio. They are not part of `manifest.json` and never
appear in the picker, so nothing in this document applies to them. See the
README inside each folder for how to run one.
