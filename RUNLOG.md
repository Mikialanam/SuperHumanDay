# Run log

One entry per update: what changed, how it was checked, and anything to decide.

## 2026-11-18 · v2.5: Trends & goal

Live: https://mikialanam.github.io/SuperHumanDay/

### What changed
1. **Stepped goals** (Move > Trends & goal), stored in the app's data under `plans`, so they're in backups.
   - Start target, final target, date, step size and an optional stretch date. Even checkpoints, previewed as you type.
   - Burpees start with 50/day from Nov 18, 2026 → 100/day by Mar 30, 2027 (60 Dec 14, 70 Jan 10, 80 Feb 5, 90 Mar 4); stretch 100 by Dec 25, 2026 (60 Nov 25, 70 Dec 3, 80 Dec 10, 90 Dec 18).
   - Today's target, next checkpoint and date, on pace / close / behind for the main and stretch goals, and a checkpoint table.
   - +50 XP (`STEPPED_GOAL_XP`) on each day the target is hit, with a toast. The stepped target also drives the goal bar, big-button tiles and nudges.
2. **Trend chart** for every exercise: Week (days), Month (weekly totals), Year (monthly totals), paging back, dashed average, solid stepped target line, ★ on new bests, tap a bar for its numbers.
3. Service worker cache `superhuman-day-v2.5`.

### How it was checked
- `node tests/trends.js`: 23 checks at 360×640 and 412×915, all pass (checkpoints, validation, chart bars and stars, +10 updating the card and chart at once, +50 XP bonus on reaching 50, undo, dark mode, Dec 28 after the stretch date, push-ups without a goal, bench press chart only, a removed goal staying removed).
- `node tests/smoke.js` with `OLD=` the previous live version: all pass, same XP (527), level, streaks and totals.
- Layout fixes from screenshots: date fields overflowing the goal sheet at 360 px, unit wrapping in the target tile, target line drawn back before the first log.

### Choices you may want to change
- **Pace** compares the last 7 finished days with what the plan asked for (`PACE_DAYS`, `PACE_CLOSE`); the first day says "In progress" instead of "Behind".
- **+50 XP** only for stepped goals, not the plain daily goals (so past XP doesn't change).
- **Weeks start on Monday**; Month view counts each week in full, labelled by its Monday.
- **The target line** uses the plain daily goal before a stepped goal starts, from the first day you logged that exercise.
- **The stretch goal** shows "Reached" if you did the final target on the stretch date itself, otherwise "Date passed".

## 2026-11-14 · v2: past dates, bigger numbers, easier picker

Live: https://mikialanam.github.io/SuperHumanDay/ (published from `claude/superhuman-day-v1-v9axex`; also pushed to `claude/confident-fermat-r8it33`).

### What changed
1. **Log to a past day** (commit `43be788`)
   - Move page: Today / Yesterday / Older… date picker. No future dates.
   - Yellow "Logging to Fri, Nov 13" banner, and the date shows on the big button. Goes back to today when you leave Move or after 5 minutes away.
   - Tap any entry in the log to change its number, move it to another day, or delete it. Both days are recalculated (totals, goals, XP, levels, streaks, Superhuman Day).
   - Day end setting, default 3am (`DEFAULT_DAY_END_HOUR`). Before then, entries count toward the previous day, and the app says so on Today and Move.
   - "Log exercise" shortcuts on Today's Yesterday card and on any day in Wins.
   - Data version 2: every exercise entry has an id; day totals come from entries. Migration runs on load and on import, keeps all totals, and keeps an untouched copy of v1 data on the device.
2. **Bigger numbers** (commit `b8db6ef`)
   - `MAX_ENTRY_NUMBER = 100000`, `MAX_ENTRY_SECONDS = 36000`.
   - New built-in Steps exercise (type the number, +1,000 / +5,000, goal 8,000, same XP as before). Old Habits steps move into it.
3. **Easier picker** (commit `d7f902b`)
   - Burpees and Steps as big buttons at the top of Move, with the day's count; the rest behind "More exercises".
   - Per-exercise "Big button on Move" switch (up to 4).

Unchanged on purpose: the +1 button, quick buttons, and the set timer.

### How it was checked
`node tests/smoke.js` with Playwright on an emulated iPhone 13 (390 × 844) and iPhone SE (dark mode), browser clock fixed to Sat Nov 14 2026. All checks passed:
- Version 1 data migrates with the same level, XP (525 → 527, the 2 is steps no longer rounded down to the nearest 1,000), streaks and all-time totals as the old app, compared side by side.
- 20 burpees logged to yesterday; banner shown; leaving Move goes back to today; future dates refused.
- An entry moved from today to yesterday: today 27 → 12, yesterday 50 → 65. Number edit and delete recalculate.
- At 1:30am a tap counts toward the previous day; with day end set to midnight it doesn't.
- 22,000 steps saved as one entry.
- Burpees and Steps are the first big buttons; push-ups reachable through More.
- Export works; a version 1 backup file imports and upgrades; the new export imports back exactly.
- No sideways scrolling on any tab at either size.

Layout fixes made from the screenshots: the day picker moved inside the exercise card so the +1 button stays high on the screen; the Habits steps tile overflowed its column; the header wrapped on the iPhone SE; the late-night note repeated itself.

### Choices you may want to change
- **Back-date reset**: goes back to today when you leave Move, or after 5 minutes in the background (`BACKDATE_KEEP_MINUTES`). Set it to 0 to reset every time the app is hidden.
- **Steps moved out of Habits**: More > Habits now shows today's steps with a "Log" button that opens Move. Steps XP is now exact (0.01 XP per step) instead of rounded down to whole thousands, so totals can be a few XP higher.
- **Day end options** go from midnight to 6am (`MAX_DAY_END_HOUR`).
- **Delete asks to confirm** and can't be undone; moving and number edits don't ask.
- **The log shows the latest 30 entries**, with "Show all" below. Each +1 tap is its own entry.
