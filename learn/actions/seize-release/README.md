# Seize and release: one nurse stays with each patient

Three patients arrive five minutes apart. Each registers with a clerk, then
is taken in hand by a nurse who **stays with that patient** — through
admission, treatment and every walk in between — until discharge. With one
nurse, the next patient waits until the nurse is free again.

```
Patients (3) ─► Register ─► Admit ────────► Treatment ────► Discharge ─► exit
                clerk:      SEIZE nurse     (nurse held)    delay 2 min
                delay with  delay 2 min                     RELEASE nurse
                resource
                1 min       └──────── the nurse stays with the patient ────────┘

Every connector is a 0.5-minute walk.
```

## The three resource actions

| Action | What it does | Used at |
|---|---|---|
| **Delay with resource** | Take the resource, use it for a time, give it back — all in one step | Register (the clerk) |
| **Seize** | Take the resource and **keep it** | Admit (the nurse) |
| **Release** | Give back a resource the entity is holding | Discharge (the nurse) |

## A held resource belongs to the entity

After *Admit* seizes the nurse, the nurse goes wherever the patient goes.
*Treatment* has no resource step at all, yet the nurse is busy there — the
patient is still holding them. The walks between activities count too: the
nurse walks with the patient.

The nurse comes back only when something releases them:

- a **Release** naming the **same resource requirement** (here, *A nurse*),
  as at Discharge;
- or the entity ending — **Dispose**, being merged by **Join**, or replaced
  by **Split**.

Always seize and release through the **same** requirement. If the release
named a different requirement that also asks for a nurse, the patient would
wait for a nurse it is already holding and never move again.

## Move time on every connector

Each connector carries a 0.5-minute **move time** (a delay step on the
connector). A patient who has just been admitted walks to Treatment, then to
Discharge, still holding the nurse, so each patient keeps the nurse for 11
minutes: 2 + 6 + 2 minutes of work plus two 0.5-minute walks.

## What you'll see

Run it once: all 3 patients are discharged. The nurse is busy 33 of the 120
minutes — 11 per patient. Patient 1 never waits; patients 2 and 3 wait at
Admit for the nurse to come back — 5 minutes on average across all three
patients. The clerk, used
with *delay with resource*, is busy only 1 minute per patient and nobody
waits for them.

## Things to try

1. **Release too early.** Move the Release step from Discharge to the end of
   Admit. The nurse now leaves after admission, nobody waits, and the
   nurse's busy time falls to 2 minutes per patient — but the patient goes
   through Treatment alone. Holding is what models "the same nurse all the
   way through".
2. **Add a second nurse.** Set the Nurse's capacity to 2. The wait at Admit
   almost disappears (0.33 minutes on average across the three patients).
3. **Keep the resource the other way.** Replace Admit's Seize + Delay with a
   single *delay with resource* step (2 minutes) that has **keep resource**
   switched on. The results are identical: *keep resource* starts the hold
   just as Seize does, and Discharge's Release still ends it.
