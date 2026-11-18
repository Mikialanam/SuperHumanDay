# Run log

One entry per update: what changed, how it was checked, and anything to decide.

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
