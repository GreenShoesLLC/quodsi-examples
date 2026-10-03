# Urgent care clinic

## What this model shows

A walk-in urgent care clinic, followed from the moment a patient walks in
to the moment they leave. Patients register at the front desk, have their
vitals taken at triage, and see a provider. Then they either go straight to
checkout, or have a lab test or an X-ray first.

The model brings several ideas together in one realistic setting: staff
shared between stations, service times that vary from patient to patient,
and a random split in the patient path. It's a good model for asking
staffing questions, such as "what happens if we add a provider?"

## How the model works

1. Patients arrive about every **8 minutes** on average. The gaps between
   arrivals vary at random, the way walk-in arrivals do in real life.
2. **Check-In / Registration** at the front desk takes 2 to 7 minutes, usually
   about 4.
3. **Triage & Vitals** with a triage nurse takes 5 to 12 minutes, usually
   about 8.
4. **Provider Exam** takes 10 to 25 minutes, usually about 15.
5. At **Lab / Imaging / Direct?**, the patient's next step is decided at
   random:
   - **30%** go to **Lab Draw** (5 to 15 minutes, usually about 10);
   - **15%** go to **Imaging / X-ray** (10 to 20 minutes, usually about 15);
   - **55%** go straight to checkout.
6. **Checkout** at the front desk takes 3 to 8 minutes, usually about 5.
7. The patient leaves the clinic.

The decision step takes no time at all; it only chooses where the patient
goes next.

## The clinic's staff

In Quodsi, the people and equipment that work needs are called
**resources**. Each station needs one member of staff for each patient it's
seeing:

- **Front Desk Staff**: 2 people, handling both check-in and checkout.
- **Triage Nurse**: 2 nurses.
- **Provider**: 2 providers.
- **Lab Tech**: 1.
- **Imaging Tech**: 1.

Each resource also has an hourly cost: $20 for front desk staff, $38 for a
triage nurse, $110 for a provider, $25 for a lab tech and $30 for an imaging
tech. The cost is the same whether the person is busy or idle, so the model
can show what the clinic's staffing costs over a day.

## Ideas this model teaches

- **Service times that vary.** Each station's time is described by three
  numbers: the fastest it's likely to be, the most common, and the slowest.
  Quodsi picks a time for each patient within that range, most often near
  the middle number. This is called a **triangular distribution**, and it's
  a practical choice when you know "usually about 15 minutes, sometimes as
  quick as 10, occasionally 25" but don't have detailed data.
- **A random split in the path.** After the exam, the arrows out of the
  decision step carry the 30%, 15% and 55% shares. Quodsi calls this
  **probability routing**.
- **One team covering two jobs.** The same two front desk staff handle
  check-in *and* checkout. When checkout gets busy, new arrivals wait longer
  to register, just as in a real clinic.
- **Staff and space are separate.** Each station also has a **capacity**:
  how many patients can be there at once, like the number of exam rooms.
  A patient needs both a free space *and* a free member of staff before
  their service can start.

## What to expect when you run it

The model simulates a **12-hour day**, and runs that day **10 times**. Each
run gets different random arrivals and service times, the way no two real
days are the same. Quodsi then reports results averaged across the runs,
which is far more reliable than looking at a single day.

## Things to try

1. **Add a provider.** The model includes a **lever** on the provider count,
   set up to try anywhere from 2 to 5 providers. Try 3, and compare the time
   patients spend in the clinic, and the cost of the extra provider. This is
   the classic staffing trade-off: shorter waits against higher cost.
2. **More imaging.** Raise the imaging share from 15% to 30%, taking the
   difference from the "direct" share (55% down to 40%). Watch the queue at
   *Imaging / X-ray* and the overall time patients spend in the clinic.
3. **A busier day.** Change the average time between arrivals from 8
   minutes to 6. Which station's queue grows first? That station is your
   **bottleneck**, the step that limits how many patients the whole clinic
   can handle.
4. **Split the front desk.** Give checkout its own staff resource, instead
   of sharing the front desk staff, and compare how long new patients wait
   to check in.
