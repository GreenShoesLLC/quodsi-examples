# Assign: price each order, then route the big ones for approval

Four orders arrive, five minutes apart. *Take Order* numbers each one and
works out its size and total price. Orders of 60 or more go to a manager for
approval; smaller ones ship straight away. Every shipped order adds its
total to the run's revenue.

```
Orders (4) ─► Take Order ─► Check Total ─┬─ total ≥ 60 ─► Manager Approval (3 min) ─┐
               delay 1 min               └─ total < 60 ─────────────────────────────┴─► Ship Order
               ASSIGN                                                                     delay 1 min
                 orders_taken + 1                                                         ASSIGN
                 order_no = orders_taken                                                    revenue + total
                 items    = order_no * 2
                 total    = items * 12
```

## How Assign works

An **Assign** step changes one or more **states**, top to bottom. Each line
names a state, an **operation** and an operand:

| Operation | Meaning | Used here |
|---|---|---|
| set | replace the value | `order_no`, `items`, `total` |
| add / subtract / multiply / divide | change the current value | `orders_taken + 1`, `revenue + total` |
| sample | draw a random value from a distribution | see *Things to try* |

The operand is either a plain **value** (`1`) or an **expression** that can
read other states and do arithmetic (`items * 12`). Lines run in order, so a
later line can use a value an earlier line has just set: `order_no`, then
`items` from `order_no`, then `total` from `items`.

## Entity states and model states

- **Entity states** — `order_no`, `items`, `total` — belong to each order.
  Every order carries its own values.
- **Model states** — `orders_taken`, `revenue` — exist once for the whole
  run. `orders_taken` counts orders; `revenue` keeps a running total.

Reading a model state into an entity state (`order_no = orders_taken`) is how
each order gets its own number.

## Why there is a Check Total step

*Check Total* is a zero-time decision step: it keeps the approval rule in its
own place in the diagram, where it is easy to see and change. Its connectors
send orders of 60 or more to *Manager Approval* and the rest to *Ship Order*.

It also matters for older engines. Quodsi engines released before the
departure-time routing change decide an activity's routing when an order
*arrives* there, before its steps run — on those, *Take Order* could not route
on the `total` it has just set, and the separate step is what makes the rule
work. Newer engines decide when the order *leaves*, so *Take Order* could
route directly; the example keeps *Check Total* so it works on both. The
[Split example](../split/) uses its *Dispatch* step the same way.

## What you'll see

Run it once: the orders have 2, 4, 6 and 8 items, so totals of 24, 48, 72
and 96. The last two (72 and 96) go through Manager Approval; the first two
ship straight away. At the end of the run, `revenue` is **240** and
`orders_taken` is 4.

## Things to try

1. **Move the threshold.** Change both Check Total conditions from 60 to 40.
   Now three orders need approval.
2. **Add a flat fee.** Change the `total` expression to `items * 12 + 5`.
   Totals become 29, 53, 77 and 101, and revenue ends at 260.
3. **Random order sizes.** Replace the `items` line with a **sample** from a
   uniform distribution between 1 and 8, followed by a second line setting
   `items = round(items)` to make it a whole number. Each order now gets a
   random size, and the approvals and revenue depend on the draw.
