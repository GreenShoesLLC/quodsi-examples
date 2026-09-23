# Create: one order spawns three documents

One order arrives. While it is taken, it creates three paperwork entities —
an invoice, a shipping label and a packing slip — and each goes straight to
its own printer. The order itself carries on to packing. Everything leaves
the model when its station is done.

```
Order Arrives ─► Take Order ─────────────────────► Pack Order     (the order carries on)
                     │ create Invoice        ─► Print Invoice
                     │ create Shipping Label ─► Print Label
                     └ create Packing Slip   ─► Print Slip
```

## How Create works

Each **Create** action on *Take Order* makes **one** new entity. Two settings
matter:

- **Entity** — what kind of entity to make. It can be a different type from
  the one doing the creating: an Order creates an Invoice.
- **Destination** — the activity the new entity starts at. Each Create action
  has its own, which is why this model needs no routing step.

The entity that runs the action — the Order — is **not** used up. When Take
Order finishes, it follows its normal outgoing connector to Pack Order.

## Create or Split?

| | Create | Split |
|---|---|---|
| The original entity | carries on | is replaced |
| New entities per action | one | as many as `count` |
| Type of the new entity | any entity type | same as the original |
| Where they go | each action has its own destination | all pieces go to one destination |

Use Create when a piece of work *produces* something new alongside itself —
a document, a sample, a notification. Use Split when the work itself breaks
into parts. Compare with the [Split example](../split/), which needs a
Dispatch step to send its pieces to different places.

## What you'll see

Run it once: 1 order is generated and 3 documents are created, 4 entities in
all. Take Order runs once; Print Invoice, Print Label and Print Slip each
print one document, taking 2, 3 and 4 minutes; Pack Order packs the order in
5 minutes.

## Things to try

1. **More orders.** Raise the generator's maximum entities to 5: 5 orders
   in, 15 documents printed, 5 through each station.
2. **Carry data onto the documents.** Add a state such as `order_number`,
   set it on the order, and list it under a Create action's inherited
   states. The new document then carries its order's value.
3. **Create only when needed.** Add a condition to the *create Shipping
   Label* action — say, only for orders marked as shipped — and watch Print
   Label's count drop.
