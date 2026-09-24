# Branch: urgent patients get a quick check-in

> **Not in the drawio picker yet.** The Quodsi action editor cannot show or
> edit a Branch's two step lists, so this model is published as a model
> document only (`model.json`, runnable with the `quodsi` CLI). It returns to
> the picker when the editor supports Branch.

Three walk-in patients and one urgent patient arrive at a clinic. At *Check
In*, the urgent patient gets a one-minute triage; walk-ins get a five-minute
registration. Then everyone goes on to see the doctor.

```
Walk-in Patients (3) ─┐
                      ├─► Check In ─────────────────────► See Doctor (10 min)
Urgent Patients (1) ──┘   Branch: urgent = 1 ?
 (urgent = 1)               yes → quick triage (1 min)
                            no  → full registration (5 min)
```

## How Branch works

A **Branch** action has a **condition** and two lists of steps. When an
entity reaches the Branch, the condition is checked against that entity: if
it is true, the *if true* steps run; otherwise the *if false* steps run.
Either list can hold any actions — delays, assigns, even another Branch —
or be empty.

Here the condition is `urgent == 1`. The *Urgent Patients* generator sets
`urgent = 1` as an **initial state** on the patient it creates; walk-ins keep
the state's starting value, 0.

When the chosen steps finish, the patient carries on as normal: it follows
Check In's connector to See Doctor, whichever path it took.

## Branch or routing?

| | Branch | Connector routing |
|---|---|---|
| Chooses | which **steps** run inside this activity | which **activity** comes next |
| Lives on | an action in the activity | the activity's outgoing connectors |
| Example | quick triage or full registration, both at Check In | send the patient to Lab or to Imaging |

The [Connector routing example](../../routing/connector-routing/) shows the
other side. Many models use both.

## What you'll see

Run it once: all 4 patients check in and see the doctor. Check In takes 5
minutes for each walk-in and 1 minute for the urgent patient, an average of
4 minutes.

Notice what Branch does **not** change: the urgent patient arrives at minute
14 and is through check-in by minute 15, but still waits behind the walk-ins
at See Doctor — they see the doctor fourth, from minute 35 to 45. Branch only
affected the steps at Check In.

## Things to try

1. **A branch inside a branch.** Add an entity state `first_visit` (starting
   value 1) and, in the *if false* list after the registration, add a second
   Branch on `first_visit == 1` whose *if true* step is a 3-minute medical
   history. Walk-ins now take 8 minutes at Check In, and the average rises
   to 6.25.
2. **Let urgent patients jump the queue.** Give See Doctor a **queue
   ranking** on the `urgent` state, highest first. The urgent patient moves
   up from fourth to third and is seen at minute 25 instead of 35.
3. **Make it a routing choice instead.** Add a *Fast Track* activity and
   route urgent patients to it from Check In with a state condition on the
   connector, as in the Connector routing example. Compare the two models.
