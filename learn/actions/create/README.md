# Create: one order spawns three documents

## What this model shows

An order desk. When an order is taken, three pieces of paperwork are
produced: an invoice, a shipping label and a packing slip. Each document
goes to its own printer, while the order itself carries on to packing.

The point of this model is the **Create** step: a way for one entity to
produce new ones, while carrying on with its own journey.

## How the model works

1. *Order Arrives* sends in one order.
2. At *Take Order*, three Create steps each make one new document: an
   Invoice, a Shipping Label and a Packing Slip.
3. Each document goes straight to its own station: *Print Invoice*, *Print
   Label* or *Print Slip*.
4. Meanwhile the order itself follows its arrow to *Pack Order*.
5. Everything leaves the model when its station is done.

## How Create works

Each Create step makes **one** new entity. Two settings matter:

- **Entity**: what kind of entity to make. It can be a different kind from
  the one doing the creating. Here, an Order creates an Invoice.
- **Destination**: the activity where the new entity starts. Each Create
  step has its own destination, which is why this model doesn't need a
  routing step to send the documents to different printers.

The entity that runs the Create step, here the Order, is **not** used up.
When *Take Order* finishes, the order follows its normal arrow to *Pack
Order*.

## Create or Split?

Both make new entities, but they behave differently:

- **The original entity**: with Create it carries on; with Split it's
  replaced by the pieces.
- **How many new entities**: each Create step makes one; a Split step makes
  as many as its count.
- **What kind**: Create can make any entity type; Split's pieces are the
  same type as the original.
- **Where they go**: each Create step has its own destination; all of a
  Split's pieces go to one destination.

Use Create when a piece of work *produces* something new alongside itself:
a document, a sample, a notification. Use Split when the work itself breaks
into parts. Compare this with the [Split example](../split/), which needs an
extra Dispatch step to send its pieces to different places.

## What to expect when you run it

- 1 order arrives and 3 documents are created: 4 entities in all.
- *Take Order* runs once.
- *Print Invoice*, *Print Label* and *Print Slip* each print one document,
  taking 2, 3 and 4 minutes.
- *Pack Order* packs the order in 5 minutes.

## Things to try

1. **More orders.** Raise the generator's maximum number of entities to 5.
   Now 5 orders come in, 15 documents are printed, and each printer handles
   5.
2. **Pass information on to the documents.** Add a state (a value an entity
   carries) such as `order_number`, set it on the order, and list it under a
   Create step's **inherited states**. The new document then carries its
   order's number.
3. **Create only when needed.** Add a condition to the *create Shipping
   Label* step, for example so it only runs for orders marked as shipped.
   Watch the number of labels printed at *Print Label* drop.
