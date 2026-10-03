# Split: one entity becomes three

## What this model shows

A packing operation. One order arrives and is split into three separate
items. Each item goes to its own packing station and leaves the model when
it's packed.

The point of this model is the **Split** step: a way to turn one entity
into several, for example one order into the individual items in it.

## How the model works

1. *Order Arrives* sends in one order.
2. At *Split Order*, a Split step replaces the order with **3 pieces**.
3. All three pieces go to *Dispatch*, which sends each one to a different
   packing station.
4. *Pack Item A*, *Pack Item B* and *Pack Item C* each pack one piece, taking
   2, 4 and 6 minutes. Then the pieces leave the model.

## How Split works

The Split step removes the order that arrives and creates new entities in
its place. Three settings matter:

- **Count**: how many pieces to make. Here, 3.
- **Destination**: where the pieces go next. **Every piece goes to the same
  place**, and it has to be a different activity from the one doing the
  splitting.
- **Split index state**: a value Quodsi writes onto each piece to number it.
  Numbering starts at **0**, so the pieces carry `piece_index` 0, 1 and 2.
  (A value an entity carries is called a **state**.)

## Why there is a Dispatch step

Split sends all of its pieces to one place. To get each piece to a
*different* station, the model needs one more stop, and that's *Dispatch*.
It takes no time; it only decides where each piece goes next.

Each arrow out of Dispatch has a condition on the piece's number:
`piece_index == 0` goes to Pack Item A, `== 1` to Pack Item B, and `== 2` to
Pack Item C. Each piece takes the one arrow that matches it. Quodsi calls
this **state-condition routing**.

**A tip that's easy to miss:** each arrow out of Dispatch also names the
entity type it applies to (here, Order). State-condition routing only looks
at arrows for the arriving entity's type, and quietly ignores an arrow that
doesn't name one.

## What to expect when you run it

- 1 order arrives, and *Split Order* runs once.
- *Dispatch* handles 3 pieces.
- *Pack Item A*, *B* and *C* each pack one piece, taking 2, 4 and 6 minutes.

## Things to try

1. **More orders.** Raise the generator's maximum number of entities to 5.
   Now 5 orders come in, 15 pieces come out, and each station packs 5.
2. **A fourth piece.** Set the split count to 4, add a *Pack Item D*
   activity, and add an arrow from Dispatch to it with the condition
   `piece_index == 3`. If you leave that arrow out, the run stops with a
   routing error, because the fourth piece has nowhere to go.
3. **Pass information on to the pieces.** Add a state such as
   `order_number`, set it before the split, and list it under the split's
   **inherited states**. Every piece then carries its parent order's number.
