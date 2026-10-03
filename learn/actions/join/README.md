# Join: three pieces become one order again

## What this model shows

A packing operation that puts orders back together. One order arrives, is
given an order number, and is split into three items. Each item is packed
at its own station, at its own speed. *Assemble Order* then waits until all
three items from that order have arrived, and sends one complete order on
to shipping.

The first half of this model is the [Split example](../split/). This model
adds the way back: the **Join** step, which combines several entities into
one.

## How the model works

1. *Order Arrives* sends in one order.
2. *Split Order* gives the order a number, then splits it into 3 pieces.
3. *Dispatch* sends each piece to its own station.
4. *Pack Item A*, *B* and *C* pack the pieces, taking 2, 4 and 6 minutes.
5. *Assemble Order* holds the pieces until all three from the same order
   are there, then combines them into one order.
6. The combined order goes to *Ship Order* and leaves the model.

## How Join works

The Join step at *Assemble Order* collects arriving entities into groups.
Entities belong to the same group when they carry the same value for one
chosen state (a **state** is a value an entity carries). That chosen state
is called the **match state**; here it's `order_no`.

When a group reaches the **join count** (here, 3), Join removes those
entities and creates **one** combined entity, which it sends on to the
**destination**, *Ship Order*. Pieces that arrive early wait at Assemble
Order until the rest of their group turns up.

## Why each order needs its own number

Join groups pieces by their order number. If every piece carried the same
number, Join would combine *any* three pieces that happened to arrive, and
pieces from two different orders could be shipped together.

So *Split Order* numbers each order before splitting it:

1. A counter for the whole model, `orders_started`, goes up by 1 for each
   order. Because it belongs to the whole model rather than to one order,
   Quodsi calls it a **model state**.
2. The order's own `order_no` is then set to the current value of that
   counter.
3. The Split step lists `order_no` under its **inherited states**, so all
   three pieces carry their order's number with them to Assemble Order.

## Why Assemble Order has room for 100

Pieces waiting for the rest of their order take up space at Assemble Order.
Its capacity is set to 100, so waiting pieces never fill it up.

If the capacity is too small, the model can get stuck. Pieces from several
different orders fill every space while they wait, and the one piece each
order still needs can never get in. Nothing moves again. This is called a
**deadlock**, and it happens in real operations too, for example when a
staging area fills with partial orders.

## What to expect when you run it

- 1 order is split into 3 pieces, and 1 complete order is shipped.
- *Pack Item A*, *B* and *C* take 2, 4 and 6 minutes, so Assemble Order has
  to wait for the slowest piece.
- The first two pieces wait 4 and 2 minutes for the third, an average of
  2 minutes each.

## Things to try

1. **More orders.** Raise the generator's maximum number of entities to 5.
   15 pieces are packed, and exactly 5 orders ship, each with its own three
   pieces.
2. **Watch it get stuck.** With 5 orders, set Assemble Order's capacity to
   3. Nothing ships: pieces from different orders fill the three spaces and
   wait for partners that can no longer get in.
3. **Record the group size.** Add an entity state such as `pieces_joined`
   and choose it as the Join's **join-count state**. Each shipped order then
   carries how many pieces went into it.
