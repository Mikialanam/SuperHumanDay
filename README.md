# Superhuman Day

A personal wellbeing app for your phone. Count your reps, set your top 3, log your wins, and start each morning by remembering what you've already done.

Superhuman Day grew out of an earlier prototype called Trailkin. Trailkin's exercises, habits, medals, levels and 12-week plan all carry over.

**Open it:** https://mikialanam.github.io/SuperHumanDay/

## Private by design

- No account, no server, no database, no analytics.
- Everything you log stays on your device, in the app's own storage (`localStorage`).
- The only way data leaves the phone is when **you** export a backup.

## What it does

### Today: the morning wins screen
The first time you open the app each day, it starts here:
- **Yesterday:** whether your top 3 got done (a *Superhuman Day*), your extras, wins, what you appreciated, and what you moved.
- **From your wins:** a few older wins picked at random, so the day starts by recognising what you've achieved. Tap *Show others* for a different set.
- **Nudges** for anything not done yet: "No breathing yet today, two minutes?", "No burpees yet today", "What are today's top 3?". There's also a backup reminder once your last backup is more than a week old.
- **Rest day** switch. Rest days never break a streak, and exercise nudges ease off.
- Your level, Superhuman Day streak, moving streak and the last 7 days.

### Move: the exercise counter
- **Burpees** and **Steps** sit at the top as big buttons, each showing the day's count, so they're one tap away. Everything else (push-ups, squats, pull-ups, dead hang, bench press, Trailkin's routines) is behind **More exercises**, and **+ New** adds your own. Any exercise can be a big button: open it, tap **Edit**, and turn on *Big button on Move* (up to 4).
- **Steps**: type the number from your phone (or tap +1,000 / +5,000). One entry can be up to 100,000, so 22,000 steps is a single entry.
- Four kinds of exercise:
  - **Reps** (burpees, push-ups): a big button where each tap adds one, with a click sound and a bounce. Quick buttons (+5 and +10 by default), or type a number after a set.
  - **Weighted** (bench press 3 × 8 at 135 lb): log each set's weight and reps. You see your last session, the numbers to beat, and your personal bests (heaviest set, estimated 1-rep max, best session volume). New PBs get a celebration.
  - **Timed** (dead hang, plank): tap to start and tap to stop, or add seconds.
  - **Workout** (a run, a class, a lifting day): log the whole session, with optional minutes and a note.
- Optional **set timer**: a stopwatch, or a rest countdown (1:00, 1:30, 2:00) that beeps when it ends.
- Every rep earns XP. XP per rep can be set per exercise. The level bar always tells you what's next, for example "12 more burpees to level 6".
- Optional daily goal per exercise (burpees start at 50, steps at 8,000), plus a daily nudge.

### Trends & goal (on the Move page, under the big button)
- **Stepped goal** for any reps or timed exercise. Set a starting daily target, a final target, a date to reach it by, how much to raise it at each step, and an optional earlier **stretch date**. The app spreads even checkpoints in between and raises the daily target at each one. Burpees start with: 50 a day from Nov 18, 2026, rising by 10 to 100 a day by Mar 30, 2027 (60 Dec 14, 70 Jan 10, 80 Feb 5, 90 Mar 4), stretch 100 by Dec 25, 2026.
- The card shows **today's target** with a progress bar, the **next checkpoint** and its date, and whether you're **on pace** for the main goal and the stretch goal: your average over the last 7 finished days against what the plan asked for on those days (85% or more is "Close"). On a goal's first day it compares today so far. *All checkpoints* lists both schedules.
- Hitting the day's target earns **+50 XP** and a celebration. The stepped target also drives the goal bar under the big button, the big-button tiles and the Today nudges.
- **Trend chart** like the iPhone Health app: **Week** (a bar per day, Monday to Sunday), **Month** (weekly totals, each week labelled by its Monday) and **Year** (monthly totals). Arrows go back in time. A dashed line shows the average of the periods so far, a solid line the target (it steps up at each checkpoint), and a ★ marks any bar that beats every earlier day, week or month. Tap a bar for its total and target.
- Everything updates the moment you log, undo or edit an entry.

### Logging to a past day, and late nights
- Under the exercise name: **Today**, **Yesterday**, or **Older…** to pick any earlier date. Future dates aren't allowed.
- When you're logging to another day, a yellow banner says so ("Logging to Fri, Nov 13") and the big button shows the date. The app goes back to today when you leave the Move page, or after 5 minutes away from the app, so nothing lands on the wrong day by accident.
- **Your day ends at 3am** (change it under More > Settings > *My day ends at*). Anything logged before then counts toward the day before, without picking a date. After midnight, the Today and Move screens say which day your entries count toward.
- **Edit any entry**: tap it in the log on the Move page to change its number, move it to another day, or delete it. Totals, daily goals, XP, levels, streaks and Superhuman Days are recalculated for both days.
- To fix an older day, open it on the Wins page and tap *See or edit exercise*, or use *Log exercise* in the Yesterday card on Today.

### Wins: the daily log
- **Top 3**, each with a done tick. Get all three done and the day counts as a **Superhuman Day** (bonus XP and a celebration).
- **Extras** are listed separately and count as a bonus.
- Quick entry for **wins, losses and moments to appreciate**.
- Use the arrows to go back and fill in or edit earlier days, including marking a past day as a rest day.

### Breathe (optional)
- Four timed patterns with an on-screen pacing circle: box breathing, even breathing, 4-7-8 and the double-inhale sigh. Sessions run 1, 2, 3 or 5 minutes.
- **Safety:** sit or lie down. Never do breathing exercises in or near water, or while driving. Stop if you feel dizzy or unwell.
- To hide it completely, turn off *Breathing* under More > Settings.

### More
Habits (Trailkin's daily check-offs, plus weigh-in, waist and beers; steps now live on the Move page), Medals, My plan, Exercises, Settings and Backup.

Settings cover when your day ends (default 3am), lb or kg, the quick-button amounts, the tap sound (click, pop, wood block, chime, coin, off), the big button's shape (round, square, wide) and colour, theme, vibration, and breathing on or off.

## Install it on your iPhone home screen
1. Open the link above in **Safari**.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. From then on, open it from the home screen icon. It runs full screen and works offline.

> **Important:** on iPhone, the home screen app keeps its own storage, separate from Safari. Log everything from the home screen icon, and restore a backup there if you used Safari first.

## Back up your data (do this weekly)
Your data lives only on the phone. If the phone is lost, or the app is deleted from the home screen, the data goes with it. A backup is one JSON file.

**Export to iCloud Files**
1. Go to **More > Backup** and tap **Export backup**.
2. In the share sheet, choose **Save to Files**.
3. Pick **iCloud Drive** (for example a folder called *Superhuman Day*) and tap **Save**.

The file is named `superhuman-day-backup-YYYY-MM-DD.json`. The Today screen reminds you when your last backup is more than 7 days old.

**Restore (Import)**
1. Go to **More > Backup** and tap **Import backup**.
2. Pick the backup file from Files.
3. Confirm. The backup **replaces** what's on this device. If you change your mind, **Undo the last import** brings back what you had before.

Backups from any earlier version still import. They're upgraded on the way in (see *Data versions* below).

The same steps move your data to a new phone, or from Safari to the home screen app.

## Tuning
All tunable values are named constants at the top of [`js/app.js`](js/app.js):

| Constant | What it controls | Default |
|---|---|---|
| `DEFAULT_XP_PER_REP` | XP per rep for new exercises (each exercise can override it) | 1 |
| `LEVEL_1_TO_2_XP`, `LEVEL_XP_INCREASE` | Level thresholds: level 2 at 100 XP, 3 at 300, 4 at 600, 5 at 1,000 … | 100, 100 |
| `DEFAULT_QUICK_AMOUNTS` | Quick buttons (also changeable in Settings). Steps has its own: +1,000, +5,000 | +5, +10 |
| `DEFAULT_DAY_END_HOUR` | When your day ends; earlier entries count toward the day before (also in Settings) | 3 (3am) |
| `MAX_DAY_END_HOUR` | Latest day end offered in Settings | 6 (6am) |
| `BACKDATE_KEEP_MINUTES` | How long the app can be in the background before Move switches back to today | 5 |
| `MAX_ENTRY_NUMBER`, `MAX_ENTRY_SECONDS` | Largest single entry (reps, steps …) and largest timed entry | 100,000 and 36,000 s |
| `DEFAULT_FAVORITES`, `MAX_FAVORITES` | Big buttons at the top of Move (change per exercise in its Edit sheet) | Burpees, Steps; up to 4 |
| `STEPS_XP_PER_1000` | XP for steps | 10 |
| `TOP3_ITEM_XP`, `SUPERHUMAN_DAY_BONUS_XP` | XP for top-3 items and the Superhuman Day bonus | 10, 50 |
| `SUPERHUMAN_DAY_TOP3_NEEDED` | How many top-3 items must be done | 3 |
| `DEFAULT_PLANS` | Stepped goals you start with (only used when there are none saved) | Burpees 50 → 100 |
| `STEPPED_GOAL_XP` | Bonus XP each day a stepped goal's target is hit | 50 |
| `PACE_DAYS`, `PACE_CLOSE` | Days the pace check averages, and the share of the plan that counts as "Close" | 7, 0.85 |
| `MAX_GOAL_STEPS` | Most checkpoints one goal can have | 60 |
| `BACKUP_REMINDER_DAYS` | When the backup nudge appears | 7 |
| `DEFAULT_EXERCISES`, `DEFAULT_HABITS`, `BREATH_PATTERNS` | Starting exercises, habits and breathing patterns | |

After changing any file, bump `CACHE` in [`sw.js`](sw.js) so installed copies pick up the new version. The app may need to be opened twice to update.

## Data versions
Everything is stored as one JSON object in `localStorage`. The same object is the backup file.

- **Version 1** kept a running total per exercise per day.
- **Version 2** (this version) gives every exercise entry its own id, so it can be edited, moved or deleted, and day totals are worked out from the entries. Steps saved under Habits become entries on the Steps exercise.

Stepped goals live in the same object under `plans` (one entry per exercise), so they're in every backup. Data or backups from before stepped goals existed get the starting burpee goal; if you remove every goal, that stays removed.

The upgrade runs automatically when the app opens and whenever a backup is imported, so old backups keep working. It keeps every total exactly: if an old day total doesn't match its entries, an "earlier total" entry makes up the difference. Before upgrading for the first time, the app keeps an untouched copy of your version 1 data on the device (`superhuman-day-before-v2`). If you had already made your own "Steps" exercise, that one becomes the Steps big button, and any old Habits steps go into a hidden built-in Steps exercise so your XP doesn't change.

## How it's built
Plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
index.html             app shell
css/app.css            styles (light and dark)
js/app.js              the whole app; tunable constants at the top
manifest.webmanifest   home screen install
sw.js                  offline support (caches app files only, never your data)
icons/                 app icons
tests/smoke.js         developer smoke test (not part of the app)
tests/trends.js        developer test for Trends & goal at 360×640 and 412×915
RUNLOG.md              what changed in each update, and how it was checked
```

To run it locally, serve the folder and open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## Smoke test (for developers)
`tests/smoke.js` drives the app on an emulated iPhone 13 and iPhone SE with Playwright: logging to yesterday, moving and editing entries, the 3am day end, 22,000 steps in one entry, the Move picker, export and importing an old backup, and no sideways scrolling. It saves screenshots to `smoke-shots/`.

```bash
python3 -m http.server 8000 &
node tests/smoke.js
```

Set `OLD=<url of the previous version>` to also check that upgraded data scores exactly the same XP, levels and streaks as before.

`tests/trends.js` checks the stepped goal, pace, chart, XP bonus, undo, dark mode and a date after the stretch date, on 360×640 and 412×915 screens, and saves screenshots to `trend-shots/`:

```bash
node tests/trends.js
```

## Publish with GitHub Pages
`main` holds the live version. Settings → Pages → *Build and deployment* → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
