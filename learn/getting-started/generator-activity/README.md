# Generator and activity

## What this model shows

The smallest Quodsi model that runs: something arrives, and something
happens to it. Every other example builds on these two pieces, so this is
the place to start.

## How the model works

1. **Generator 1** brings work into the model, one item at a time. Quodsi
   calls each item an **entity**: it could be a customer, a job or an order.
   On average a new one arrives every **5 minutes**.
2. A **connector** (the arrow) carries every entity from the generator to
   the activity.
3. **Activity 1** is where the work happens. It handles **one entity at a
   time** (its *capacity* is 1), and each one takes exactly **1 minute**.
   When it's done, the entity leaves the model.

## Why arrivals are "about" every 5 minutes

Real arrivals don't come like clockwork. Customers walk in on their own
schedule, and jobs land in a queue whenever they're ready. Sometimes two
come close together, and sometimes there's a long gap.

The generator copies this by picking a random gap before each arrival. The
gaps average 5 minutes, but each one is different. The pattern it uses is
called an **exponential distribution**, which is the standard way to model
arrivals that don't depend on each other.

## What to expect when you run it

Work arrives about every 5 minutes and takes 1 minute to handle, so the
activity is busy only about **20% of the time**. Entities rarely have to
wait, because the activity is almost always free when one turns up.

This quiet, mostly idle system is the starting point. The other examples
show what happens as you move away from it.

## Things to try

1. **Create a queue.** Open Generator 1 and change the average time between
   arrivals from 5 minutes to 1. Work now arrives about as fast as the
   activity can handle it, and a queue starts to build up in front of
   Activity 1. This is one of the most important lessons in simulation: as
   a station gets close to 100% busy, waiting times don't creep up gently,
   they shoot up.
2. **Push it past the limit.** Try 0.9 minutes. Work now arrives faster than
   the activity can finish it, so it can never catch up, and the queue keeps
   growing for as long as the model runs.
3. **Add capacity.** Put the arrival time back to 1 minute and set Activity
   1's capacity to 2. Two entities are now handled at once, and the queue
   disappears. This is the simulation version of opening a second till.
4. **Make the work less predictable.** Change Activity 1's time from a
   fixed 1 minute to a random time that still averages 1 minute. The
   average workload is exactly the same, but the queue behaves differently.
   Unpredictability on its own creates waiting.

## A note on the activity's step

Activity 1 uses a **delay with resource** step without naming a resource,
so Quodsi treats it as a plain delay: the entity simply spends 1 minute
there. **Resources** (the people or equipment an activity needs) and what
happens when several activities need the same ones are covered in later
examples, such as *Seize and release* and *Urgent care clinic*.
