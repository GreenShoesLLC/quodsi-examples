# Join: three pieces become one order again

One order arrives, is numbered, and splits into three pieces. Each piece is
packed at its own station, at its own speed. *Assemble Order* holds the
pieces until all three pieces of that order have arrived, then sends one
combined order on to shipping.

```
Order Arrives ─► Split Order ─(split 3)─► Dispatch ─┬─► Pack Item A (2 min) ─┐
 (numbers the order)                                ├─► Pack Item B (4 min) ─┼─► Assemble Order ─(join 3)─► Ship Order
                                                    └─► Pack Item C (6 min) ─┘
```

The first half is the [Split example](../split/); this model adds the way
back.

## How Join works

The **Join** action on *Assemble Order* collects arriving entities into
groups that share the same value of one state — the **match state**, here
`order_no`. When a group reaches the **join count** (3), Join removes those
entities and creates **one** combined entity, which it sends to the
**destination** (*Ship Order*). Pieces that arrive early wait at Assemble
Order until the rest of their group turns up.

## Why each order needs a unique number

Join groups pieces by their match-state value. If every piece carried the
same value, Join would fuse *any* three pieces that happen to arrive — pieces
from two different orders could be shipped together.

So *Split Order* numbers each order before splitting it:

1. A **model-level** state, `orders_started`, counts orders: the assign step
   adds 1 to it.
2. The order's own `order_no` is set from that counter with the expression
   `orders_started`.
3. The Split lists `order_no` under its **inherited states**, so all three
   pieces carry their order's number to Assemble Order.

## Why Assemble Order has a large capacity

Pieces waiting for the rest of their order take up room at Assemble Order.
Its capacity is 100 so that waiting pieces never fill it. Set it too small
and the model can freeze: pieces from several orders fill every slot, and
the piece each order still needs can never get in.

## What you'll see

Run it once: 1 order is split into 3 pieces, and 1 combined order is
shipped. Pack Item A, B and C take 2, 4 and 6 minutes, so Assemble Order
waits for the slowest piece — the first two pieces wait 4 and 2 minutes, an
average of 2 minutes each.

## Things to try

1. **More orders.** Raise the generator's maximum entities to 5: 15 pieces
   are packed and exactly 5 orders ship, each with its own three pieces.
2. **Watch it freeze.** With 5 orders, set Assemble Order's capacity to 3.
   Nothing ships: pieces from different orders fill the three slots and wait
   for partners that can no longer get in.
3. **Record the group size.** Add an entity state such as `pieces_joined`
   and name it as the Join's join-count state; each shipped order then
   carries how many pieces went into it.
