# Assign: price each order, then route the big ones for approval

## What this model shows

An order desk with an approval rule. Four orders arrive, five minutes
apart. Each order is given a number, a size and a total price. Orders worth
60 or more need a manager's approval; smaller ones ship straight away.
Every shipped order adds its total to the day's revenue.

The point of this model is the **Assign** step: a way to set or change the
values your model keeps track of, such as prices, counts and totals.

## How the model works

1. *Orders* sends in four orders, five minutes apart.
2. At *Take Order*, taking the order takes 1 minute. Then an Assign step
   works out the order's details:
   - it adds 1 to the count of orders taken (*orders_taken*);
   - it gives the order its number (*order_no*), using that count;
   - it works out the number of items (*items*) as the order number × 2;
   - it works out the price (*total*) as the number of items × 12.
3. *Check Total* sends orders of 60 or more to *Manager Approval*, which
   takes 3 minutes, and the rest straight to *Ship Order*.
4. At *Ship Order*, shipping takes 1 minute, and then the order's total is
   added to *revenue*.

## How Assign works

Each value the model keeps track of is called a **state**. An Assign step
changes one or more states, working down its list from top to bottom. Each
line names a state, what to do to it (the **operation**), and a value to use.

The operations are:

- **set**: replace the value. Used here for *order_no*, *items* and *total*.
- **add**, **subtract**, **multiply**, **divide**: change the current value.
  Used here to add 1 to *orders_taken*, and to add *total* to *revenue*.
- **sample**: pick a random value from a distribution. See *Things to try*.

The value on each line is either a plain number (`1`) or an
**expression**: a small formula that can use other states and do
arithmetic, such as `items * 12`.

Because the lines run in order, a later line can use a value an earlier
line has just worked out. Here, *items* uses *order_no*, and *total* uses
*items*.

## Two kinds of state

- **Entity states** (*order_no*, *items*, *total*) belong to each order.
  Every order carries its own values, like the details on an order form.
- **Model states** (*orders_taken*, *revenue*) exist once for the whole
  run, like a tally on a whiteboard. *orders_taken* counts orders, and
  *revenue* keeps a running total.

Copying a model state into an entity state (setting *order_no* from
*orders_taken*) is how each order gets its own number.

## Why there is a Check Total step

*Check Total* takes no time; it only decides where each order goes next.
Giving the approval rule its own step keeps it visible in the diagram, and
easy to find and change. Its arrows send orders of 60 or more to *Manager
Approval*, and the rest to *Ship Order*.

There's also a second reason. Older versions of Quodsi decided where an
order would go when it *arrived* at an activity, before that activity's
steps had run. On those versions, *Take Order* couldn't route on the total
it had only just worked out, so the separate step is what makes the rule
work. Newer versions decide when the order *leaves*, so *Take Order* could
do the routing itself. The example keeps *Check Total* so it works on both.
The [Split example](../split/) uses its *Dispatch* step the same way.

## What to expect when you run it

- The four orders have 2, 4, 6 and 8 items, so their totals are 24, 48, 72
  and 96.
- The last two orders (72 and 96) go through *Manager Approval*. The first
  two ship straight away.
- At the end of the run, *revenue* is **240** and *orders_taken* is **4**.

## Things to try

1. **Move the threshold.** Change both of Check Total's conditions from 60
   to 40. Now three orders need approval.
2. **Add a flat fee.** Change the *total* expression to `items * 12 + 5`.
   The totals become 29, 53, 77 and 101, and revenue finishes at 260.
3. **Random order sizes.** Replace the *items* line with two lines: a
   **sample** from a uniform distribution between 1 and 8, then a line
   setting *items* to `round(items)` to make it a whole number. Each order
   now gets a random size, so which orders need approval, and the final
   revenue, depend on the random draw.
