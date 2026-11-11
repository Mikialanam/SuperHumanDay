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
- Pick any exercise. Burpees come first. Push-ups, squats, pull-ups, dead hang, bench press and Trailkin's routines are ready to use, and **+ New** adds your own.
- Four kinds of exercise:
  - **Reps** (burpees, push-ups): a big button where each tap adds one, with a click sound and a bounce. Quick buttons (+5 and +10 by default), or type a number after a set.
  - **Weighted** (bench press 3 × 8 at 135 lb): log each set's weight and reps. You see your last session, the numbers to beat, and your personal bests (heaviest set, estimated 1-rep max, best session volume). New PBs get a celebration.
  - **Timed** (dead hang, plank): tap to start and tap to stop, or add seconds.
  - **Workout** (a run, a class, a lifting day): log the whole session, with optional minutes and a note.
- Optional **set timer**: a stopwatch, or a rest countdown (1:00, 1:30, 2:00) that beeps when it ends.
- Every rep earns XP. XP per rep can be set per exercise. The level bar always tells you what's next, for example "12 more burpees to level 6".
- Optional daily goal per exercise (burpees start at 50), plus a daily nudge.

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
Habits (Trailkin's daily check-offs, plus steps, weigh-in, waist and beers), Medals, My plan, Exercises, Settings and Backup.

Settings cover lb or kg, the quick-button amounts, the tap sound (click, pop, wood block, chime, coin, off), the big button's shape (round, square, wide) and colour, theme, vibration, and breathing on or off.

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

The same steps move your data to a new phone, or from Safari to the home screen app.

## Tuning
All tunable values are named constants at the top of [`js/app.js`](js/app.js):

| Constant | What it controls | Default |
|---|---|---|
| `DEFAULT_XP_PER_REP` | XP per rep for new exercises (each exercise can override it) | 1 |
| `LEVEL_1_TO_2_XP`, `LEVEL_XP_INCREASE` | Level thresholds: level 2 at 100 XP, 3 at 300, 4 at 600, 5 at 1,000 … | 100, 100 |
| `DEFAULT_QUICK_AMOUNTS` | Quick buttons (also changeable in Settings) | +5, +10 |
| `TOP3_ITEM_XP`, `SUPERHUMAN_DAY_BONUS_XP` | XP for top-3 items and the Superhuman Day bonus | 10, 50 |
| `SUPERHUMAN_DAY_TOP3_NEEDED` | How many top-3 items must be done | 3 |
| `BACKUP_REMINDER_DAYS` | When the backup nudge appears | 7 |
| `DEFAULT_EXERCISES`, `DEFAULT_HABITS`, `BREATH_PATTERNS` | Starting exercises, habits and breathing patterns | |

After changing any file, bump `CACHE` in [`sw.js`](sw.js) so installed copies pick up the new version. The app may need to be opened twice to update.

## How it's built
Plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
index.html             app shell
css/app.css            styles (light and dark)
js/app.js              the whole app; tunable constants at the top
manifest.webmanifest   home screen install
sw.js                  offline support (caches app files only, never your data)
icons/                 app icons
```

To run it locally, serve the folder and open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## Publish with GitHub Pages
Settings → Pages → *Deploy from a branch* → choose the branch and `/ (root)` → Save.
