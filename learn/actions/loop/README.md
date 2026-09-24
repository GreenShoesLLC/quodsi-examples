# Loop: three coats of paint

Three parts arrive ten minutes apart. At *Paint Part* each one gets three
coats of paint — the same two steps, repeated three times — then goes on to a
quick inspection.

```
Parts Arrive (3) ─► Paint Part ──────────────────────► Inspect Finish (1 min)
                    Repeat 3 times:
                      1. apply a coat (2 min)
                      2. coats_applied + 1   (this part's count)
                         total_coats   + 1   (the whole run's count)
```

## How Loop works

A **Loop** step has a **count** and a list of **steps to repeat**. When an
entity reaches it, the steps run top to bottom, then again, until they have
run *count* times; then the entity carries on with whatever comes after the
Loop.

Here the repeated steps are a 2-minute delay (one coat) and an assign that
adds 1 to two counters.

## Where to see the repeated steps

Select *Paint Part*, open its **Actions** tab and switch to the **Recipe**
view. It reads *Repeat 3 times* with the two repeated steps listed inside,
and you can edit the count and the steps there. (The Classic view does not
show a Loop's inner steps.)

## Why use a Loop instead of writing the steps out?

Writing *coat, count, coat, count, coat, count* as six separate steps gives
exactly the same results. The Loop keeps the repeated steps in one place:
change the coat time once, or the number of coats in one field, instead of
editing three copies and hoping they stay in step.

## Two counters

- `coats_applied` is an **entity** state — each part keeps its own count, and
  every part ends with 3.
- `total_coats` is a **model** state — one count for the whole run, which
  ends at 9 (3 parts × 3 coats).

## What you'll see

Run it once: all 3 parts are painted and inspected. Paint Part takes **6
minutes** per part (3 coats × 2 minutes) and `total_coats` ends at **9**.
Each part spends 7 minutes in the model — nothing waits, because parts arrive
ten minutes apart.

## Things to try

1. **Four coats.** Change the Loop's count to 4. Paint Part now takes 8
   minutes per part and `total_coats` ends at 12.
2. **Sand between coats.** Add a 1-minute delay as the first step inside the
   Loop. Each round is now sand + coat, so Paint Part takes 9 minutes per
   part — and `total_coats` is still 9, because the counting step still runs
   once per round.
3. **Write it out.** Replace the Loop with the six steps it stands for
   (coat, count, coat, count, coat, count). The results are identical —
   then try changing the coat time and count how many places you had to
   edit.
