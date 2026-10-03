# Seize and release: one nurse stays with each patient

## What this model shows

A small clinic. Three patients arrive, five minutes apart. Each one
registers with a clerk and is then taken in hand by a nurse, who **stays
with that patient** all the way from admission, through treatment and
every walk in between, until discharge. There's only one nurse, so the next
patient has to wait until the nurse is free again.

The point of this model is **Seize** and **Release**: a way to let an
entity claim a person or piece of equipment and keep it across several
steps, instead of using it for just one.

## How the model works

1. *Patients* sends in three patients, five minutes apart.
2. At *Register*, a clerk registers the patient. This takes 1 minute.
3. At *Admit*, the patient **seizes** (claims) the nurse, and admission
   takes 2 minutes.
4. At *Treatment*, the patient is treated for 6 minutes. The nurse is still
   with them.
5. At *Discharge*, discharge takes 2 minutes, and then the patient
   **releases** the nurse, who is free for the next patient.
6. Every walk between activities takes half a minute.

## People and equipment: resources

In Quodsi, the people and equipment that work needs (a nurse, a clerk, a
forklift, a machine) are called **resources**. This model has two: the
clerk and the nurse.

There are three kinds of step for working with resources:

- **Delay with resource** takes a resource, uses it for a set time and gives
  it back, all in one step. Used at *Register* for the clerk.
- **Seize** takes a resource and **keeps it**. Used at *Admit* for the
  nurse.
- **Release** gives back a resource the entity is holding. Used at
  *Discharge* for the nurse.

## A seized resource goes where the entity goes

Once *Admit* has seized the nurse, the nurse goes wherever the patient
goes. *Treatment* has no resource step at all, yet the nurse is busy there,
because the patient is still holding them. The walks between activities
count too: the nurse walks with the patient.

The nurse only becomes free when one of these happens:

- A **Release** step gives the nurse back, as at *Discharge*. It has to
  name the **same resource requirement** that was used to seize them (here,
  *A nurse*). A **resource requirement** is a named request for resources,
  such as "one nurse".
- The entity's journey ends in some other way: it's **disposed of**,
  **combined** with others by a Join, or **replaced** by a Split.

**Always seize and release using the same requirement.** If the release
named a different requirement that also asks for a nurse, the patient would
wait for a nurse it's already holding, and would never move again.

## Walking time on every arrow

Each arrow in this model has a **move time** of half a minute, which
represents the walk from one place to the next.

So each patient keeps the nurse for **11 minutes**: 2 minutes of admission,
6 of treatment and 2 of discharge, plus two half-minute walks in between.

## What to expect when you run it

- All 3 patients are discharged.
- The nurse is busy for 33 of the 120 minutes in the run: 11 minutes per
  patient.
- Patient 1 never waits. Patients 2 and 3 wait at *Admit* for the nurse to
  come back. Averaged across all three patients, the wait is 5 minutes.
- The clerk is busy for only 1 minute per patient, and nobody waits for
  them.

## Things to try

1. **Release too early.** Move the Release step from *Discharge* to the end
   of *Admit*. The nurse now leaves after admission, nobody waits, and the
   nurse is busy for only 2 minutes per patient. But the patient now goes
   through treatment alone. Holding on to the nurse is what models "the same
   nurse all the way through".
2. **Add a second nurse.** Set the nurse's capacity to 2. The wait at
   *Admit* almost disappears: 0.33 minutes on average across the three
   patients.
3. **Keep the nurse another way.** Replace Admit's Seize and delay steps with
   a single *delay with resource* step (2 minutes) that has **keep
   resource** switched on. The results are identical: *keep resource* starts
   holding the nurse just as Seize does, and Discharge's Release still ends
   it.
