# Dispose: scrap a bad part at inspection

## What this model shows

A quality check. Four parts are inspected: three good ones and one bad one.
The bad part is scrapped at inspection, while the good parts carry on to
packing. Two counters record how many parts went each way.

The point of this model is the **Dispose** step: a way to remove an entity
from the model at a chosen point, partway through its journey.

## How the model works

1. Two generators send in parts: *Good Parts* makes 3, and *Bad Parts* makes
   1. Every part made by *Bad Parts* is marked as defective.
2. Every part goes to *Inspect Part*, where inspection takes 1 minute.
3. If the part is defective, *Inspect Part* adds 1 to the *parts_scrapped*
   counter and then disposes of the part. Its journey ends there.
4. Good parts go on to *Pack Part*, where packing takes 2 minutes and adds 1
   to the *parts_packed* counter. Then they leave the model.

## How Dispose works

The Dispose step ends an entity's journey at that exact point. The entity
skips any remaining steps in the activity **and** the arrows leading out of
it. Anything it was still holding, such as a worker or machine it had
claimed, is let go.

That's what lets *Inspect Part* do two jobs at once: it's the exit for bad
parts, and a pass-through for good ones.

## Dispose doesn't record anything, so count first

A disposed part simply disappears, and nothing in the results says *why* it
left. If you want to know how many parts were scrapped, count them yourself,
**before** the Dispose step.

Here, two counters keep the tally. Both belong to the whole model rather
than to one part, so Quodsi calls them **model states**.

- *parts_scrapped* goes up by 1 in the step just before the Dispose, and only
  for defective parts, so it counts only scrapped parts.
- *parts_packed* goes up by 1 at the end of *Pack Part*, so it counts only
  parts that were actually packed.

## "Only if defective": conditions on steps

Any step can have a **condition**, which means it only runs when the
condition is true. Here, both the scrap counter and the Dispose step only
run when the part's *defective* value equals 1. For a good part, the
condition is false, so both steps are skipped and the part follows the
arrow to *Pack Part*.

Whether a part is bad is decided when it's created. The *Bad Parts*
generator sets `defective = 1` on every part it makes, as an **initial
state** (a starting value). Good parts keep the default starting value, 0.

## Dispose, or just no arrow out?

An activity with no arrow leading out of it is already an exit: every
entity that finishes there leaves the model.

- Use **no arrow out** when **every** entity ends at that activity.
- Use **Dispose** when only **some** entities should end there, or when they
  should end partway through an activity.

## What to expect when you run it

- *parts_packed* finishes at **3** and *parts_scrapped* finishes at **1**.
- Four parts go through *Inspect Part* (1 minute each), and three go through
  *Pack Part* (2 minutes each).
- The defective part arrives at minute 7. It's inspected, counted and
  disposed of at minute 8, and never reaches *Pack Part*.

In the entity results, all four parts show as *completed*, because a
disposed part did leave the model. The counters are what tell the two
outcomes apart.

## Things to try

1. **Scrap before inspecting.** Move the scrap counter and the Dispose step
   above the inspection step. The bad part now leaves instantly, so the
   average time per part at *Inspect Part* drops from 1 minute to 0.75. The
   counts stay at 3 and 1.
2. **More bad parts.** Make the *Bad Parts* generator produce 3. Now six
   parts are inspected; *parts_packed* is still 3, and *parts_scrapped*
   becomes 3.
3. **Random defects.** This one is more advanced:
   - Delete the *Bad Parts* generator and set *Good Parts* to produce 20.
   - Add an Assign step at the top of *Inspect Part* with two lines. The
     first gives each part a random number between 0 and 1, stored in a new
     entity state called `defect_roll` (use **sample** with a uniform
     distribution). The second sets *defective* with the expression
     `1 if defect_roll < 0.2 else 0`.
   - Lengthen the run to 240 minutes so all 20 parts can finish.

   About one part in five is now scrapped. The exact split depends on the
   random numbers drawn, but *parts_packed* plus *parts_scrapped* always
   adds up to 20.
