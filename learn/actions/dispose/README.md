# Dispose: scrap a bad part at inspection

Three good parts and one bad part are inspected. The bad part is scrapped at
inspection — its life ends there — while the good parts carry on to
packing. Two counters record how many parts went each way.

```
Good Parts (3) ─┐
                ├─► Inspect Part ─────────────────────────► Pack Part
Bad Parts (1) ──┘     1. inspect (1 min)                      1. pack (2 min)
 (defective = 1)      2. parts_scrapped + 1  — if defective    2. parts_packed + 1
                      3. dispose             — if defective
```

## How Dispose works

The **Dispose** action ends the entity's life at that exact point. The
entity skips the rest of the activity's steps **and** its outgoing
connectors, and anything it still holds (such as a seized resource) is
released.

That is what makes *Inspect Part* two things at once: an exit for bad parts,
and a pass-through for good ones.

## Dispose records nothing — count first

A disposed part simply disappears; nothing in the results says *why* it left.
If you want to know how many parts were scrapped, count them yourself,
**before** the Dispose step. Here two **model states** keep the tally:

- `parts_scrapped` goes up by 1 in the step just before the Dispose, under
  the same condition, so only bad parts are counted.
- `parts_packed` goes up by 1 at the end of *Pack Part*, so only parts that
  were actually packed are counted.

## "Only if defective": conditions on actions

Any action can carry a **condition**. Here the scrap counter and the Dispose
step both run only when the part's `defective` state equals 1; for a good
part the conditions are false, both steps are skipped, and the part follows
the connector to *Pack Part*.

Which part is bad is decided when it is created: the *Bad Parts* generator
sets `defective = 1` as an **initial state** on every part it makes. Good
parts keep the state's starting value, 0.

## Dispose, or just no outgoing connector?

An activity with no outgoing connector is already an exit — every entity
that finishes there leaves the model. Use that when **every** entity ends
there. Use Dispose when only **some** entities should end there, or when
they should end part-way through an activity.

## What you'll see

Run it once: **`parts_packed` = 3** and **`parts_scrapped` = 1**. Four parts
go through Inspect Part (1 minute each) and three through Pack Part (2
minutes each). The defective part arrives at minute 7, is inspected, counted
and disposed at minute 8, and never reaches Pack Part.

In the entity results all four parts show as *completed* — a disposed part
did leave the model. The counters are what tell the two outcomes apart.

## Things to try

1. **Scrap before inspecting.** Move the scrap counter and the Dispose step
   above the inspect delay. The bad part now leaves instantly: Inspect
   Part's average time per part drops from 1 minute to 0.75, and the counts
   stay 3 and 1.
2. **More bad parts.** Make the Bad Parts generator produce 3: six parts are
   inspected, `parts_packed` is still 3 and `parts_scrapped` becomes 3.
3. **Random defects.** Delete the Bad Parts generator, set Good Parts to
   produce 20, and add an assign step at the top of Inspect Part with two
   lines: sample a new entity state `defect_roll` from a uniform
   distribution between 0 and 1, then set `defective` with the expression
   `1 if defect_roll < 0.2 else 0`. About one part in five is now scrapped —
   the exact split depends on the random draws — and `parts_packed` plus
   `parts_scrapped` always adds up to 20. Lengthen the run to 240 minutes
   so all 20 parts finish.
