# Connector routing: probability, entity type, state condition

## What this model shows

When an activity has more than one arrow leaving it, something has to
decide which arrow each entity takes. In Quodsi, that's the activity's
**routing type**.

This model shows the three routing types side by side, as three small,
separate flows on one page. Each row teaches one of them.

## Row 1: probability (random split)

*Gen Parts* sends parts to *Inspect*. From there, **70%** of parts go to
*Pass* and **30%** go to *Rework*.

Each part's path is chosen at random, like rolling dice, using the weights
on the two arrows (0.7 and 0.3). Over many parts, the split comes out close
to 70/30.

The weights only matter relative to each other: 70 and 30, 7 and 3, or 0.7
and 0.3 all behave the same way.

Use probability routing whenever the path is a matter of chance: defect
rates, the share of customers who choose one option, and so on.

## Row 2: entity type (sort by what it is)

Two generators feed the same flow: *Gen Widgets* makes widgets and *Gen
Gadgets* makes gadgets. Both go to *Sort by type*. Every widget then goes to
the *Widget line*, and every gadget to the *Gadget line*.

Nothing here is random. Each arrow out of *Sort by type* names the kind of
entity it accepts (Quodsi calls this the **entity type**), and each entity
takes the arrow that matches.

Use entity-type routing when different kinds of work share some steps and
then go their separate ways.

## Row 3: state condition (route on a value the entity carries)

This row routes on information an entity picked up earlier in its journey.

1. *Gen Orders* sends orders to *Receive*.
2. *Receive* sends 30% of orders to *Tag rush* and 70% to *Tag standard*, at
   random.
3. Every order carries a value called **rush**, which starts at 0. Quodsi
   calls a value like this a **state**; because it belongs to each order,
   it's an **entity state**. *Tag rush* sets rush to 1, and *Tag standard*
   sets it to 0. Each does this with an **Assign** step, which changes a
   state's value.
4. Both tagging steps lead to *Dispatch gate*. Each arrow out of the gate has
   a condition: `rush == 1` goes to *Expedite*, and `rush == 0` goes to
   *Standard ship*.

Use state-condition routing when an earlier step learns something about an
entity (it's urgent, it's high value, it failed a check) and a later step
needs to act on it.

## Things to try

1. **Shift the mix.** Change the Inspect weights to 0.5 and 0.5, or send 90%
   of orders to *Tag rush*. Watch how busy the stations further along
   become as the mix changes.
2. **Break the sort on purpose.** Add a third entity type in the
   **Entities** tab and send it into *Sort by type*, without adding an arrow
   for it. When you run the model, Quodsi stops with a routing error naming
   the entity and the activity. Entity-type routing has no "everything else"
   option, and that's deliberate: a silent default would hide modelling
   mistakes.
3. **Route on a threshold.** Change the gate's condition to `rush > 0` and
   make *Tag rush* set rush to 2 instead of 1. Conditions compare numbers,
   so you can use any of `==` (equals), `!=` (doesn't equal), `>`, `>=`,
   `<` and `<=`.
4. **Combine the ideas.** Give widgets and gadgets their own rush flags and
   send each type through its own gate. State-condition routing is set up
   separately for each entity type, so each arrow out of a gate names both
   the entity type it applies to and its condition.
