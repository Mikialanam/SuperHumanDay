# Progress

> **Live app: GitHub Pages is the live app from now on** — https://mikialanam.github.io/SuperHumanDay/ (the home-screen app). The Claude artifact link is not what's on the phone.
> Pages deploys from branch `claude/superhuman-day-v1-v9axex` (every "pages build and deployment" run so far is from that branch, not `main`).

## Run 2: Trends & stepped goals in the v1 app (started 2026-11-18)
Scope: rebuild the trends + stepped-goals feature inside the v1 app (`js/app.js`, `css/app.css`) on top of `claude/superhuman-day-v1-v9axex`, merge into that branch (GitHub Pages), confirm it's live, then fast-forward `main` to it. Data stays in the app's own localStorage object (and in backups). Leave the Trailkin artifact as it is.

| # | Step | Estimate | Status |
|---|------|----------|--------|
| 0 | Merge the v1 branch into this branch (drop old `Index.html`) | 5 min | done |
| 1 | Data + maths: `S.plans` in state (seeded burpee plan, survives backup/import), even checkpoints, target for a date, pace; stepped target drives the Move goal bar, big-button tiles, nudges and goal toast; +50 XP when hit | 30 min | done |
| 2 | "Trends & goal" panel on Move: today's target, next checkpoint + date, main/stretch pace, checkpoint table, empty state | 25 min | done |
| 3 | Goal sheet: set / edit / remove with validation and live checkpoint preview | 25 min | done |
| 4 | Chart: Week / Month / Year, paging, dashed average, stepped target line, stars on new bests, tap a bar for its value | 30 min | done |
| 5 | Live updates on every log/undo/edit, styles (light + dark), bump service-worker cache | 20 min | todo |
| 6 | Phone tests at 360x640 and 412x915 (`tests/trends.js`), fix layout, re-run `tests/smoke.js` | 30 min | todo |
| 7 | README + RUNLOG | 15 min | todo |
| 8 | Merge into `claude/superhuman-day-v1-v9axex`, push, wait for Pages, check the live page shows "Trends & goal" | 20 min | todo |
| 9 | Fast-forward `main` to the deployed version, push, write the Pages-from-main steps, handover | 15 min | todo |

### Run 2 log
- Step 1: `S.plans` (seeded with the burpee goal when missing, `{}` kept if all removed, invalid plans dropped on load/import). `ladder`, `targetOn`, `goalFor`, `pace` in js/app.js. Checked: 60 Dec 14, 70 Jan 10, 80 Feb 5, 90 Mar 4, 100 Mar 30; stretch 60 Nov 25 … 100 Dec 25; 50 burpees on Nov 18 = 150 XP (100 + 50 bonus). Next: step 2.
- Step 2: Trends & goal panel under the big button on Move (goal card only for reps/timed exercises; chart slot for all). `tests/trends.js` started (seeds before the app loads). Next: step 3.
- Step 3: goal sheet (prefilled from the last 7 days for a new goal; checkpoint chips preview; same validation as on load; remove asks to confirm). Fixed date fields overflowing at 360px. Next: step 4 (chart).
- Step 4: SVG chart drawn after render (sized to its box) and on resize; view remembered in settings (`trendView`). Target line uses the day's goal (stepped or plain) from the first logged day or goal start. Checked W/M/Y at both sizes. Next: step 5.

## Run 1 (superseded): Trends & stepped goals in the old Trailkin `Index.html` (started 2026-11-18)
Scope: trend chart + stepped goals for any count exercise (burpees first), all in `Index.html`, data kept on the device (localStorage).

| # | Step | Estimate | Status |
|---|------|----------|--------|
| 1 | Goal data model: localStorage store, burpee seed (50 → 100 by Mar 30, stretch Dec 25), even checkpoint maths, target-for-date | 25 min | done |
| 2 | Goal card: today's target + progress bar, next checkpoint + date, pace for main and stretch, checkpoint ladder | 25 min | done |
| 3 | Goal form: set / edit / remove (start, final, step, start date, end date, optional stretch date) with live checkpoint preview | 25 min | done |
| 4 | Trend chart (SVG): W / M / Y views, prev/next paging, dashed average, solid stepped target, stars on new bests, tap a bar for its value | 30 min | done |
| 5 | Wiring: exercise picker, logging re-renders chart and target instantly, +50 XP when daily target is hit (toast) | 20 min | done |
| 6 | Phone tests at 360x640 and 412x915 with Playwright, review screenshots, fix layout | 30 min | done |
| 7 | Publish to the Trailkin artifact link, final commit/push, handover notes | 15 min | done |

## Done
- Step 1: goal model in localStorage (`trailkin-targets`), burpee goal seeded, even checkpoints verified (60 Dec 14, 70 Jan 10, 80 Feb 5, 90 Mar 4, 100 Mar 30; stretch every ~7 days to Dec 25), +50 XP per day the target is hit.

- Step 2: goal card (today's target + bar, next checkpoint, main/stretch pace pills, checkpoint table). Pace = last 7 finished days' average vs what the plan asked for; first day uses today so far.
- Step 3: goal form (set/edit/remove, validation, live checkpoint preview, two-tap remove).
- Step 4: SVG trend chart (Week/Month/Year, paging, dashed average, stepped target line, stars on all-time bests at that grain, tap a bar for value vs target). Average counts only periods since the exercise was first logged.
- Step 5: logging re-renders goal card + chart on every tap (verified with Playwright), toast 'Daily target of N hit! +XP' when crossing the target; level-up message no longer overwritten.
- Step 6: checked 360x640 and 412x915 (light + dark), Body/Health/Plan tabs, before/after stretch date. Fixed: duplicate y-ticks on small counts, legend showing unused items, wrapping goal subtitles, checkpoint table squeezed beside Edit goal, small nav arrows. No horizontal scroll, no console errors.
- Step 7: published as version 5 of the Trailkin artifact (https://claude.ai/artifact/6dW15DDXN2U58c2bNs4bHY), same db/user capabilities as before.

## Handover
- Goal settings live only in this browser's localStorage (`trailkin-targets`); day logs still also sync to the account when the artifact runtime offers it (unchanged from before).
- Tunables in Index.html: `TARGET_XP` (50), `SEED` (burpee goal), pace thresholds in `paceRow` (>=100% on pace, >=85% close), Monday week start in `monOf`.

## Next
- Run complete. Pick from Later if wanted.

## Blocked
- 2026-11-18: Merge to the Pages branch stopped. This run's work changed the old single-file Trailkin `Index.html` (from `main`). The Pages branch is the rewritten Superhuman Day v1 (`index.html`, `js/app.js`, `css/app.css`, service worker, data version 2) and has deleted `Index.html`, so the merge gives a modify/delete conflict, and even a forced merge would not put the panel in the live app. The feature needs porting into `js/app.js` on top of `claude/superhuman-day-v1-v9axex`. Waiting on Miki's go-ahead.

## Later
- Choose Sunday vs Monday week start.
- Optional extra XP for hitting the stretch target.
- Custom set size when logging (e.g. +7) instead of the fixed +5 button.
- Optional quest tied to the daily target instead of "at least 5 burpees".
