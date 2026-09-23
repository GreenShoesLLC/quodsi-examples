# Dispose: scrap a bad part at inspection

Three good parts and one bad part are inspected. The bad part is scrapped at
inspection — its life ends there — while the good parts carry on to
packing.

```
Good Parts (3) ─┐
                ├─► Inspect Part ─────────► Pack Part
Bad Parts (1) ──┘     1. inspect (1 min)
 (defective = 1)      2. dispose — only if defective = 1
```

## How Dispose works

The **Dispose** action ends the entity's life at that exact point. The
entity skips the rest of the activity's steps **and** its outgoing
connectors, and anything it still holds (such as a seized resource) is
released.

That is what makes *Inspect Part* two things at once: an exit for bad parts,
and a pass-through for good ones.

## "Only if defective": conditions on actions

Any action can carry a **condition**. Here the Dispose step only runs when
the part's `defective` state equals 1; for a good part the condition is
false, the step is skipped, and the part follows the connector to *Pack
Part*.

Which part is bad is decided when it is created: the *Bad Parts* generator
sets `defective = 1` as an **initial state** on every part it makes. Good
parts keep the state's starting value, 0.

## Dispose, or just no outgoing connector?

An activity with no outgoing connector is already an exit — every entity
that finishes there leaves the model. Use that when **every** entity ends
there. Use Dispose when only **some** entities should end there, or when
they should end part-way through an activity.

## What you'll see

Run it once: 4 parts are inspected and 3 are packed. The defective part
(it arrives at minute 7) is disposed after its inspection and never reaches
Pack Part.

## Things to try

1. **Scrap before inspecting.** Move the Dispose step above the inspect
   delay. The bad part now leaves instantly, and Inspect Part's average time
   per part drops from 1 minute to 0.75.
2. **More bad parts.** Make the Bad Parts generator produce 3: six parts are
   inspected, and Pack Part still receives exactly 3.
3. **Rework instead of scrap.** Replace the Dispose with a **Branch** on
   `defective == 1` whose true path is a 3-minute rework delay. The bad part
   is reworked and then carries on, so all four parts are packed.
