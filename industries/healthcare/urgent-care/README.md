# Urgent care clinic

> Authored by Renee. This README was written from the model file on
> 2026-09-23; Renee, please correct anything that doesn't match your intent.

A walk-in clinic from arrival to departure. Patients arrive about every
8 minutes on average (exponential), register at the front desk, have vitals
taken at triage, see a provider, and then either go straight to checkout or
detour through the lab or imaging first.

## What it shows

- **A realistic patient path** of six stations, each with a staff
  resource and a triangular service time (fastest, most likely, slowest).
- **Probability routing at a decision point.** After the exam, the
  "Lab / Imaging / Direct?" step sends 30% of patients to a lab draw, 15% to
  imaging and 55% straight to checkout. It takes no time; it only routes.
- **One resource serving two stations.** Front Desk Staff handle both
  check-in and checkout, so a checkout rush slows new registrations.

## Things to try

1. Raise the imaging share from 15% to 30% (take it from "direct") and watch
   the Imaging / X-ray queue and overall time in system.
2. Change the arrival scale from 8 to 6 minutes, a busier day. Which
   station's queue grows first? That is your bottleneck.
3. Give checkout its own staff resource and compare check-in waiting times.
