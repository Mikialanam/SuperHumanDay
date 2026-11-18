# Progress

## Run: Trends & stepped goals (started 2026-11-18)
Scope: trend chart + stepped goals for any count exercise (burpees first), all in `Index.html`, data kept on the device (localStorage).

| # | Step | Estimate | Status |
|---|------|----------|--------|
| 1 | Goal data model: localStorage store, burpee seed (50 → 100 by Mar 30, stretch Dec 25), even checkpoint maths, target-for-date | 25 min | done |
| 2 | Goal card: today's target + progress bar, next checkpoint + date, pace for main and stretch, checkpoint ladder | 25 min | done |
| 3 | Goal form: set / edit / remove (start, final, step, start date, end date, optional stretch date) with live checkpoint preview | 25 min | done |
| 4 | Trend chart (SVG): W / M / Y views, prev/next paging, dashed average, solid stepped target, stars on new bests, tap a bar for its value | 30 min | todo |
| 5 | Wiring: exercise picker, logging re-renders chart and target instantly, +50 XP when daily target is hit (toast) | 20 min | todo |
| 6 | Phone tests at 360x640 and 412x915 with Playwright, review screenshots, fix layout | 30 min | todo |
| 7 | Publish to the Trailkin artifact link, final commit/push, handover notes | 15 min | todo |

## Done
- Step 1: goal model in localStorage (`trailkin-targets`), burpee goal seeded, even checkpoints verified (60 Dec 14, 70 Jan 10, 80 Feb 5, 90 Mar 4, 100 Mar 30; stretch every ~7 days to Dec 25), +50 XP per day the target is hit.

- Step 2: goal card (today's target + bar, next checkpoint, main/stretch pace pills, checkpoint table). Pace = last 7 finished days' average vs what the plan asked for; first day uses today so far.
- Step 3: goal form (set/edit/remove, validation, live checkpoint preview, two-tap remove).

## Next
- Step 4: trend chart.

## Blocked

## Later
- Custom set size when logging (e.g. +7) instead of the fixed +5 button.
- Optional quest tied to the daily target instead of "at least 5 burpees".
