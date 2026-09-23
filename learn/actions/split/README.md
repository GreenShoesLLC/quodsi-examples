# Split: one entity becomes three

One order arrives and is split into three pieces. Each piece goes to its own
packing station and leaves the model when it's done.

```
Order Arrives ─► Split Order ──(split into 3)──► Dispatch ─┬─ piece_index = 0 ─► Pack Item A
                                                           ├─ piece_index = 1 ─► Pack Item B
                                                           └─ piece_index = 2 ─► Pack Item C
```

## How Split works

The **Split** action on *Split Order* removes the arriving order and creates
3 new entities in its place. Three settings matter:

- **Count** is how many pieces to create (3).
- **Destination** is where the pieces go. **Every piece goes to the same
  destination**, which must be a different activity.
- **Split index state** stamps each piece with its position, starting at
  **0**: the pieces carry `piece_index` 0, 1 and 2.

## Why there is a Dispatch step

Because all pieces go to one destination, sending each to a *different*
activity takes one more hop. *Dispatch* takes no time. It uses **state
condition** routing: each outgoing connector has a condition on
`piece_index` (`== 0`, `== 1`, `== 2`), so each piece takes the one
connector that matches it.

Each Dispatch connector also names the entity type (Order). State-condition
routing only considers connectors for the arriving entity's type, and a
connector without one is silently ignored.

## What you'll see

Run it once: 1 order is generated, Split Order runs once, Dispatch handles 3
pieces, and Pack Item A, B and C each finish one piece, taking 2, 4 and 6
minutes.

## Things to try

1. **More orders.** Raise the generator's maximum entities to 5: 5 orders in,
   15 pieces out, 5 through each station.
2. **A fourth piece.** Set the split count to 4, add a *Pack Item D* activity,
   and a Dispatch connector with `piece_index == 3`. Leave that connector out
   and the run stops with a routing error: the fourth piece has nowhere to go.
3. **Carry data onto the pieces.** Add a state such as `order_number`, set it
   before the split, and list it under the split's inherited states. Every
   piece then carries its parent's value.
