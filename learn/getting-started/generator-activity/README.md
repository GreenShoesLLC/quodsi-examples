# Generator and activity

The smallest Quodsi model that runs: something arrives, something happens to it.

```
Generator 1  ──▶  Activity 1
```

## What it shows

- **Generator 1** creates one entity at a time, with the gap between arrivals
  drawn from an exponential distribution averaging **5 minutes**. Exponential
  inter-arrival times are the standard way to model arrivals that are
  independent of each other — customers walking in, jobs landing in a queue.
- **Activity 1** holds **one entity at a time** (capacity 1) and takes a
  constant **1 minute** to process it.
- The **connector** carries every entity from the generator to the activity.

Work arrives every 5 minutes on average and takes 1 minute to handle, so the
activity is busy roughly 20% of the time and a queue rarely forms. That idle
system is the baseline the other examples move away from.

## Things to try

1. **Create a queue.** Open Generator 1 and change the mean inter-arrival time
   from 5 minutes to 1. Arrivals now come in at about the rate the activity can
   clear them, and the queue in front of Activity 1 starts to grow. This is the
   single most important intuition in queueing: as utilisation approaches 100%,
   waiting time climbs steeply rather than smoothly.
2. **Make it worse, then explain it.** Try 0.9 minutes. The activity cannot keep
   up at all and the queue grows without bound for as long as the run lasts.
3. **Add capacity.** Put the arrival rate back to 1 minute and set Activity 1's
   capacity to 2. Two entities are now processed at once and the queue collapses.
4. **Change the shape of the work.** Switch Activity 1's duration from constant
   to a distribution with the same mean. Nothing about the average changes, but
   the queue behaves differently — variability alone creates waiting.

## Notes

The activity's action is `DELAY_WITH_RESOURCE` with no resource attached, which
the engine treats as a plain delay. Resources — and what happens when several
activities compete for the same ones — are the subject of the next example.
