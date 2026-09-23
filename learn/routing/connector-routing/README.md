# Connector routing: three ways to choose a path

When an activity has more than one outgoing connector, its **routing type** decides
which one each entity takes. This model shows all three routing types side by side,
as three small independent flows on one page.

```
Row 1 — Probability
Gen Parts ──▶ Inspect ──70%──▶ Pass
                      └─30%──▶ Rework

Row 2 — Entity type
Gen Widgets ─┐
             ├─▶ Sort by type ──Widget──▶ Widget line
Gen Gadgets ─┘                └─Gadget──▶ Gadget line

Row 3 — State condition
Gen Orders ──▶ Receive ──30%──▶ Tag rush     (sets rush = 1) ─┐
                       └─70%──▶ Tag standard (sets rush = 0) ─┤
                                                              ▼
                                    Dispatch gate ──rush == 1──▶ Expedite
                                                  └─rush == 0──▶ Standard ship
```

## What it shows

- **Probability routing** (`Inspect`): each entity rolls the dice. The two outgoing
  connectors carry weights 0.7 and 0.3 — weights are normalized automatically, so
  70/7/0.07 would all behave the same. Use this for defect rates, market splits,
  anything where the path is random.
- **Entity-type routing** (`Sort by type`): the entity's *type* decides. Widgets and
  Gadgets share the upstream flow, then each outgoing connector names the entity
  type it accepts. Nothing is random — every Widget goes to the Widget line, every
  Gadget to the Gadget line.
- **State-condition routing** (`Dispatch gate`): a *value carried by the entity*
  decides. Each Order picks up a `rush` state (an entity state, number, initial
  value 0). `Tag rush` sets it to 1 with an **Assign** action; `Tag standard` sets
  it to 0. The gate's connectors each carry a condition — `rush == 1` routes to
  Expedite, `rush == 0` to Standard ship. Use this when an earlier step learns
  something about the entity that a later step must act on.

## Things to try

1. **Shift the mix.** Change the Inspect weights to 0.5/0.5, or the Receive split
   to 0.9 rush — watch the downstream utilisations follow.
2. **Break the sort on purpose.** Add a third entity type in the Entities tab and
   generate it into `Sort by type` without adding a matching connector. The run
   reports a routing error naming the entity and activity — entity-type routing has
   no "else" branch, which is a feature: a silent default hides modelling mistakes.
3. **Route on a threshold.** Change the gate condition to `rush > 0` and make
   `Tag rush` assign 2 instead of 1. Conditions compare numbers, so any of
   `==`, `!=`, `>`, `>=`, `<`, `<=` work.
4. **Combine the ideas.** Give Widgets and Gadgets their own rush flags and route
   each type through its own gate — condition routing is scoped per entity type, so
   each gate connector names both the entity type it applies to and the condition.
