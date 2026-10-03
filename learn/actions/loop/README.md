# Loop: three coats of paint

## What this model shows

A small paint shop. Three parts arrive, ten minutes apart. Each part gets
three coats of paint, then a quick inspection, and then it leaves.

The point of this model is the **Loop**: a way to tell Quodsi "do these steps
several times in a row" without having to write the same steps out again and
again.

## How the model works

1. *Parts Arrive* sends in one part every 10 minutes, three parts in total.
2. Each part goes to *Paint Part*. There, a Loop repeats two steps three
   times: apply a coat of paint (2 minutes), then add 1 to two counters.
3. After the third coat, the part moves to *Inspect Finish*, which takes
   1 minute, and then leaves the model.

## How a Loop works

Think of a Loop as a repeat instruction: "do these steps 3 times". You give
it two things:

- **How many times** to repeat (the *count*).
- **Which steps** to repeat.

When a part reaches the Loop, Quodsi runs the steps from top to bottom, then
goes back to the top and runs them again, until it has done them as many
times as you asked. Then the part moves on to whatever comes next.

## Seeing the Loop in the model

1. Click *Paint Part* to select it.
2. Open its **Actions** tab.
3. Switch to the **Recipe** view.

You'll see *Repeat 3 times*, with the two repeated steps listed underneath.
You can change the count, or the steps themselves, right there.

Use the Recipe view for this. The Classic view doesn't show the steps inside
a Loop.

## Why use a Loop?

You could get exactly the same results by listing six separate steps: coat,
count, coat, count, coat, count. The Loop is simply easier to look after:

- If a coat starts taking 3 minutes instead of 2, you change **one** number
  instead of three.
- If customers start asking for four coats, you change the count from 3 to 4
  instead of adding two more steps.

Fewer places to edit means fewer chances to miss one.

In your own models, a Loop is worth using wherever work repeats: several
coats or passes, rework cycles, or repeated checks.

## The two counters

The model keeps two counts, and they work differently:

- **coats_applied** belongs to **each part**. Every part carries its own
  count, starting at 0, and every part finishes with 3. Quodsi calls this an
  **entity state**: a value that travels with each entity. In a business
  model, an order's value or a patient's priority would work the same way.
- **total_coats** belongs to **the whole model**. There is one shared count
  for the entire run, and it finishes at 9 (3 parts × 3 coats). Quodsi calls
  this a **model state**. In a business model, a running total such as
  "orders shipped today" would work the same way.

## What to expect when you run it

- All 3 parts are painted and inspected.
- Painting takes **6 minutes** per part (3 coats × 2 minutes).
- *total_coats* finishes at **9**.
- Each part spends **7 minutes** in the model: 6 painting plus 1 inspecting.
- No part ever waits. A new part arrives only every 10 minutes, and the
  previous part is finished long before then.

## Things to try

1. **Ask for four coats.** In the Recipe view, change the Loop's count from
   3 to 4. Painting now takes 8 minutes per part, and *total_coats* finishes
   at 12.
2. **Sand before each coat.** Add a 1-minute delay as the first step inside
   the Loop. Each round is now "sand, then coat", so painting takes 9 minutes
   per part. *total_coats* still finishes at 9, because the counting step
   still runs once per round.
3. **Do it without the Loop.** Replace the Loop with the six steps it stands
   for (coat, count, coat, count, coat, count). The results are identical.
   Now try changing the coat time, and count how many places you had to edit.
   That is the work the Loop saves you.
4. **Make the paint shop too slow.** Change the coat time from 2 minutes to
   4. Painting now takes 12 minutes per part, but a new part still arrives
   every 10 minutes, so parts start to queue up in front of *Paint Part*.
   This is how a bottleneck shows up in a simulation: work arriving faster
   than one station can finish it.
