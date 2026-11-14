"use strict";
/* =====================================================================
   SUPERHUMAN DAY
   Personal wellbeing app. Everything is stored on this device only
   (localStorage). No server, no database, no tracking.
   =====================================================================

   TUNABLE VALUES. Change these freely, then reload the app.
   --------------------------------------------------------------------- */

// XP and levels
const DEFAULT_XP_PER_REP = 1;        // XP per rep for new exercises (each exercise can override it in More > Exercises)
const LEVEL_1_TO_2_XP = 100;         // XP needed to reach level 2
const LEVEL_XP_INCREASE = 100;       // each later level needs this much more XP than the one before
                                     //   → level 2 at 100 XP, 3 at 300, 4 at 600, 5 at 1,000, 6 at 1,500 …
const TOP3_ITEM_XP = 10;             // per top-3 item ticked done
const SUPERHUMAN_DAY_BONUS_XP = 50;  // bonus when the whole top 3 is done
const SUPERHUMAN_DAY_TOP3_NEEDED = 3;// how many top-3 items must be written and done for a Superhuman Day
const EXTRA_DONE_XP = 5;             // per extra ticked done
const MOMENT_XP = 2;                 // per win, loss or appreciation logged
const BREATH_XP_PER_MINUTE = 5;
const STEPS_XP_PER_1000 = 10;         // XP for steps (the Steps exercise uses this unless you change it)
const WEIGH_IN_XP = 5;
const BEER_FREE_DAY_XP = 30;         // past logged days with no beers
const LOW_BEER_DAY_XP = 20;          // past logged days with LOW_BEER_LIMIT or fewer
const LOW_BEER_LIMIT = 2;

// Move page picker
const DEFAULT_FAVORITES = ["burpees", "steps"]; // big buttons at the top of Move; the rest sit behind "More" (change per exercise in its Edit sheet)
const MAX_FAVORITES = 4;

// Number entry
const MAX_ENTRY_NUMBER = 100000;      // largest number in one entry (reps, steps …)
const MAX_ENTRY_SECONDS = 36000;      // largest timed entry, in seconds (10 hours)

// Buttons and timers
const DEFAULT_QUICK_AMOUNTS = [5, 10]; // quick buttons next to the big button (changeable in Settings)
const MAX_QUICK_BUTTONS = 3;
const TIMED_QUICK_SECONDS = [10, 30];  // quick buttons for timed exercises such as a dead hang
const WEIGHT_STEP = { lb: 5, kg: 2.5 };// +/− step on the weight field
const DEFAULT_START_WEIGHT = { lb: 45, kg: 20 };
const DEFAULT_START_REPS = 8;
const REST_TIMER_PRESETS = [60, 90, 120]; // seconds

// Days and dates
const DEFAULT_DAY_END_HOUR = 3;      // your day ends at 3am: anything logged before then counts toward the previous day (changeable in Settings)
const MAX_DAY_END_HOUR = 6;          // latest day end offered in Settings (6 = 6am)
const BACKDATE_KEEP_MINUTES = 5;     // logging to a past day switches back to today if the app is away longer than this (or when you leave Move)

// Nudges and morning screen
const BACKUP_REMINDER_DAYS = 7;     // remind to export when the last backup is older than this
const OLD_WINS_SHOWN = 3;            // random older wins on the morning screen
const EVENING_HOUR = 18;             // after this hour, nudge to log a win if none yet

// Breathing
const BREATH_MINUTES = [1, 2, 3, 5];
const BREATH_MIN_LOG_SECONDS = 30;   // a stopped session shorter than this is not logged

const RANKS = ["Spark", "Starter", "Mover", "Builder", "Climber", "Steady", "Strong", "Relentless", "Unstoppable", "Superhuman"];

// Exercises you start with. Burpees first. Add, edit or hide them in the app.
// type: reps (tap counter) · weighted (sets of weight × reps) · timed (seconds) · workout (a whole session)
// xp: XP per rep, per second (timed) or per session (workout). goal: optional daily target.
const DEFAULT_EXERCISES = [
  { id: "burpees", name: "Burpees", type: "reps", xp: 2, goal: 50, nudge: true, medal: "Burpee Machine", tiers: [50, 250, 750, 2000] },
  // tap: false hides the big +1 button (you type the number from your phone instead). quick: its own quick buttons.
  { id: "steps", name: "Steps", type: "reps", xp: STEPS_XP_PER_1000 / 1000, goal: 8000, unit: "steps", tap: false, quick: [1000, 5000], medal: "Trailblazer", tiers: [50000, 250000, 1000000, 5000000] },
  { id: "pushups", name: "Push-ups", type: "reps", xp: 1, medal: "Push Power", tiers: [100, 500, 1500, 4000] },
  { id: "squats", name: "Squats", type: "reps", xp: 1, medal: "Squat Squad", tiers: [100, 500, 1500, 4000] },
  { id: "negatives", name: "Pull-up negatives", type: "reps", xp: 5, medal: "Slow Lowerer", tiers: [15, 60, 200, 500] },
  { id: "pullups", name: "Pull-ups", type: "reps", xp: 25, medal: "Pull-up Pro", tiers: [1, 10, 50, 200] },
  { id: "hang", name: "Dead hang", type: "timed", xp: 0.4, medal: "Iron Grip", tiers: [120, 600, 1800, 3600] },
  { id: "horse", name: "Horse stance", type: "timed", xp: 0.2, medal: "Rooted", tiers: [300, 1200, 3600, 7200] },
  { id: "bench", name: "Bench press", type: "weighted", xp: 2, medal: "Bench Builder", tiers: [100, 500, 1500, 4000] },
  { id: "tilt", name: "Tilt routine", type: "workout", xp: 30, medal: "Straight Spine", tiers: [5, 20, 50, 100] },
  { id: "lift", name: "Lifting session", type: "workout", xp: 60, medal: "Bar Lifter", tiers: [4, 12, 36, 100] },
];

// Daily habits carried over from Trailkin (More > Habits). kind: check (once a day) or count.
const DEFAULT_HABITS = [
  { id: "keto", area: "Health", name: "Keto day", kind: "check", xp: 15, medal: "Keto Keeper", tiers: [7, 30, 60, 120] },
  { id: "protein", area: "Health", name: "Hit 140 g protein", kind: "check", xp: 20, medal: "Protein Pro", tiers: [5, 20, 60, 150] },
  { id: "meals", area: "Health", name: "2 solid meals", kind: "check", xp: 15, medal: "Steady Fuel", tiers: [5, 20, 60, 150] },
  { id: "mealwalk", area: "Health", name: "Walk after a meal", kind: "count", step: 1, unit: "walks", xp: 8, medal: "Settle Stroller", tiers: [5, 25, 75, 200] },
  { id: "sleep", area: "Growth", name: "Slept 7+ hours", kind: "check", xp: 20, medal: "Well Rested", tiers: [5, 20, 60, 150] },
  { id: "reading", area: "Growth", name: "Reading", kind: "count", step: 10, unit: "min", xp: 1, medal: "Bookworm", tiers: [120, 600, 1800, 6000] },
  { id: "learning", area: "Growth", name: "Learning", kind: "count", step: 15, unit: "min", xp: 1, medal: "Lifelong Learner", tiers: [120, 600, 1800, 6000] },
  { id: "lowscreen", area: "Growth", name: "Low-screen day", kind: "check", xp: 15, medal: "Unplugged", tiers: [3, 15, 45, 120] },
  { id: "deepwork", area: "Work", name: "Focus block (45 min)", kind: "count", step: 1, unit: "blocks", xp: 20, medal: "Deep Diver", tiers: [10, 50, 150, 400] },
  { id: "outreach", area: "Work", name: "Calls & outreach", kind: "count", step: 1, unit: "contacts", xp: 10, medal: "Connector", tiers: [10, 50, 150, 400] },
  { id: "milestone", area: "Work", name: "Milestone hit", kind: "count", step: 1, unit: "milestones", xp: 50, medal: "Mover", tiers: [1, 5, 15, 40] },
];
const HABIT_AREAS = ["Health", "Growth", "Work"];

// Breathing patterns. "to" is the circle size the step breathes towards (1 = full, 0.5 = empty).
const BREATH_PATTERNS = [
  { id: "box", name: "Box breathing", desc: "4 in, 4 hold, 4 out, 4 hold. Steady and focusing.",
    steps: [{ l: "Breathe in", s: 4, to: 1 }, { l: "Hold", s: 4 }, { l: "Breathe out", s: 4, to: 0.5 }, { l: "Hold", s: 4 }] },
  { id: "even", name: "Even breathing", desc: "5 in, 5 out. Easy and balancing. A good place to start.",
    steps: [{ l: "Breathe in", s: 5, to: 1 }, { l: "Breathe out", s: 5, to: 0.5 }] },
  { id: "478", name: "4-7-8 wind-down", desc: "4 in, hold 7, 8 out. A long exhale to settle. Keep it short at first.",
    steps: [{ l: "Breathe in", s: 4, to: 1 }, { l: "Hold", s: 7 }, { l: "Breathe out", s: 8, to: 0.5 }] },
  { id: "sigh", name: "Double-inhale sigh", desc: "Two sips in through the nose, then one long sigh out.",
    steps: [{ l: "Breathe in", s: 2, to: 0.85 }, { l: "Top up", s: 1, to: 1 }, { l: "Long sigh out", s: 6, to: 0.5 }] },
];

// Trailkin's 12-week plan (More > My plan). Turn it off in Settings.
const PLAN_START = "2026-10-28", PLAN_START_KG = 86, PLAN_GOAL_KG = 75;

/* ---------------------------------------------------------------------
   End of tunable values
   --------------------------------------------------------------------- */

const STORAGE_KEY = "superhuman-day";
const PRE_IMPORT_KEY = "superhuman-day-before-import";
const PRE_MIGRATION_KEY = "superhuman-day-before-v2"; // untouched copy of version 1 data, kept on the device
const DATA_VERSION = 2; // 2: every exercise entry has an id and day totals are worked out from the entries
const KG_PER_LB = 0.45359237;
const DEFAULT_SETTINGS = {
  name: "", unit: "lb", bodyUnit: "kg", quick: DEFAULT_QUICK_AMOUNTS.slice(),
  sound: "click", buttonStyle: "round", buttonColor: "green", haptics: true, theme: "auto",
  breathing: true, breathCues: true, showPlan: true,
  lastExercise: "burpees", lastTab: "today", breathPattern: "even", breathMinutes: 2, restSeconds: 90,
  dayEndHour: DEFAULT_DAY_END_HOUR,
};
const MOVE_KINDS = ["reps", "set", "session"]; // log entries that are exercise entries
const TYPE_LABEL = { reps: "Reps", weighted: "Weight × reps", timed: "Timed", workout: "Workout" };
const XP_LABEL = { reps: "XP per rep", weighted: "XP per rep", timed: "XP per second", workout: "XP per workout" };
const MOMENT_TYPES = { win: { label: "Win", icon: "★" }, loss: { label: "Loss", icon: "↘" }, grateful: { label: "Appreciate", icon: "♥" } };

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad2 = n => String(n).padStart(2, "0");
const dkey = d => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
// The day ends at dayEndHour (3am by default), so 1am still belongs to the day before.
function dayEndHour() { try { const h = S.settings.dayEndHour; return Number.isInteger(h) ? h : DEFAULT_DAY_END_HOUR; } catch (e) { return DEFAULT_DAY_END_HOUR; } }
const afterMidnight = () => new Date().getHours() < dayEndHour();
const todayKey = () => { const d = new Date(); if (d.getHours() < dayEndHour()) d.setDate(d.getDate() - 1); return dkey(d); };
const hourLabel = h => h === 0 ? "midnight" : h + "am";
const kdate = k => new Date(k + "T12:00:00");
const addDays = (k, n) => { const d = kdate(k); d.setDate(d.getDate() + n); return dkey(d); };
const daysBetween = (a, b) => Math.round((kdate(b) - kdate(a)) / 864e5);
const fmtDate = (k, o) => kdate(k).toLocaleDateString(undefined, o || { weekday: "short", month: "short", day: "numeric" });
const nowTime = () => { const d = new Date(); return pad2(d.getHours()) + ":" + pad2(d.getMinutes()); };
let uidN = 0;
const uid = () => Date.now().toString(36) + (++uidN).toString(36) + Math.random().toString(36).slice(2, 6);
const clone = o => JSON.parse(JSON.stringify(o));
const nf = n => (Math.round(n * 10) / 10).toLocaleString();
const n1 = n => String(Math.round(n * 10) / 10); // plain number for input fields
const isDayKey = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
const fmtDur = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${pad2(m)}:${pad2(x)}` : `${m}:${pad2(x)}`; };
const plural = (n, one, many) => n === 1 ? one : (many || one + "s");

/* ---------- storage ---------- */
function blankDay() {
  return { reps: {}, sets: [], sessions: [], log: [], top3: [0, 1, 2].map(() => ({ text: "", done: false })), extras: [], moments: [], breath: [], rest: false, habits: {}, weight: null, waist: null, beers: 0 };
}
function normDay(d) {
  const b = blankDay();
  for (const k in b) if (d[k] === undefined || d[k] === null && b[k] !== null) d[k] = b[k];
  while (d.top3.length < 3) d.top3.push({ text: "", done: false });
  return d;
}
// Day totals (d.reps) are always worked out from the day's entries, so moving or editing an entry keeps them right.
function recalcReps(d) {
  d.reps = {};
  for (const x of d.log) if (x.k === "reps" && x.v > 0) d.reps[x.ex] = (d.reps[x.ex] || 0) + x.v;
}
/* Migration (safe to run any number of times; runs on load and on every import, so old backups still import).
   Version 1 kept a running total per exercise plus a log without ids. Now every exercise entry has an id so it
   can be edited, moved to another day or deleted. Totals are kept exactly: if an old total doesn't match its
   entries, an "earlier" entry makes up the difference. */
function migrateDay(d, stepsId) {
  if (!Array.isArray(d.log)) d.log = [];
  if (!Array.isArray(d.sets)) d.sets = [];
  if (!Array.isArray(d.sessions)) d.sessions = [];
  if (!d.reps || typeof d.reps !== "object") d.reps = {};
  d.log = d.log.filter(x => x && typeof x === "object");
  for (const s of d.sets.concat(d.sessions)) if (!s.id) s.id = uid();
  const setIds = new Set(d.sets.map(s => s.id)), sesIds = new Set(d.sessions.map(s => s.id));
  d.log = d.log.filter(x => x.k === "set" ? setIds.has(x.id) : x.k === "session" ? sesIds.has(x.id) : true);
  const logged = new Set(d.log.filter(x => x.k === "set" || x.k === "session").map(x => x.id));
  for (const s of d.sets) if (!logged.has(s.id)) d.log.push({ k: "set", ex: s.ex, id: s.id, t: s.t || "" });
  for (const s of d.sessions) if (!logged.has(s.id)) d.log.push({ k: "session", ex: s.ex, id: s.id, t: s.t || "" });
  const sums = {};
  for (const x of d.log) if (x.k === "reps") { if (!x.id) x.id = uid(); x.v = Number(x.v) || 0; sums[x.ex] = (sums[x.ex] || 0) + x.v; }
  for (const ex of new Set(Object.keys(d.reps).concat(Object.keys(sums)))) {
    const want = Math.max(0, Number(d.reps[ex]) || 0), have = sums[ex] || 0;
    if (want > have) d.log.unshift({ k: "reps", ex, v: want - have, t: "", id: uid(), note: "earlier" });
    else if (want < have) {
      let extra = have - want;
      for (let i = d.log.length - 1; i >= 0 && extra > 0; i--) { const x = d.log[i]; if (x.k !== "reps" || x.ex !== ex) continue; const cut = Math.min(x.v, extra); x.v -= cut; extra -= cut; }
    }
  }
  d.log = d.log.filter(x => x.k !== "reps" || x.v > 0);
  // Version 1 kept steps as one number under More > Habits. They become an entry on the Steps exercise.
  if (d.steps !== undefined) {
    const n = Math.round(Number(d.steps) || 0);
    if (n > 0 && stepsId) d.log.unshift({ k: "reps", ex: stepsId, v: n, t: "", id: uid(), note: "habits" });
    if (n <= 0 || stepsId) { delete d.steps; d.log = d.log.filter(x => !(x.k === "num" && x.id === "steps")); }
  }
  recalcReps(d);
  return d;
}
/* Make sure there's a Steps exercise. If you already made your own "Steps", that one is used on the Move page;
   a hidden built-in one only holds steps that were logged under Habits in version 1 (so their XP stays the same). */
function ensureSteps(s) {
  const own = s.exercises.find(e => e.id !== "steps" && !e.archived && /^\s*steps?\s*$/i.test(e.name || ""));
  if (own && own.tap === undefined) { own.tap = false; if (!own.quick) own.quick = [1000, 5000]; if (!own.unit) own.unit = "steps"; }
  if (s.exercises.some(e => e.id === "steps")) return "steps";
  const legacy = Object.values(s.days).some(d => d && Number(d.steps) > 0);
  if (own && !legacy) return null;
  const ex = clone(DEFAULT_EXERCISES.find(e => e.id === "steps"));
  if (own) ex.archived = true;
  const i = s.exercises.findIndex(e => e.id === "burpees");
  s.exercises.splice(i + 1, 0, ex);
  return "steps";
}
function dayHasData(d) {
  return Object.values(d.reps).some(v => v > 0) || d.sets.length || d.sessions.length || d.top3.some(t => t.text.trim()) ||
    d.extras.length || d.moments.length || d.breath.length || d.rest || Object.values(d.habits).some(v => v) ||
    d.weight || d.waist || d.beers;
}
function freshState() {
  return {
    app: "superhuman-day", version: DATA_VERSION, settings: clone(DEFAULT_SETTINGS),
    exercises: clone(DEFAULT_EXERCISES), habits: clone(DEFAULT_HABITS), days: {},
    meta: { created: new Date().toISOString(), lastBackup: null, lastOpenDay: null },
  };
}
function normalize(s) {
  const f = freshState();
  if (!s || typeof s !== "object") return f;
  s.app = "superhuman-day"; s.version = DATA_VERSION;
  s.settings = Object.assign(clone(DEFAULT_SETTINGS), s.settings || {});
  if (!Array.isArray(s.settings.quick) || !s.settings.quick.length) s.settings.quick = DEFAULT_QUICK_AMOUNTS.slice();
  if (s.settings.favorites !== undefined && !(Array.isArray(s.settings.favorites) && s.settings.favorites.every(x => typeof x === "string"))) delete s.settings.favorites;
  const deh = Number(s.settings.dayEndHour);
  s.settings.dayEndHour = Number.isInteger(deh) && deh >= 0 && deh <= MAX_DAY_END_HOUR ? deh : DEFAULT_DAY_END_HOUR;
  if (!Array.isArray(s.exercises) || !s.exercises.length) s.exercises = f.exercises;
  if (!Array.isArray(s.habits)) s.habits = f.habits;
  if (!s.days || typeof s.days !== "object") s.days = {};
  const stepsId = ensureSteps(s);
  for (const k of Object.keys(s.days)) { if (!isDayKey(k) || !s.days[k] || typeof s.days[k] !== "object") delete s.days[k]; else migrateDay(normDay(s.days[k]), stepsId); }
  s.meta = Object.assign(f.meta, s.meta || {});
  return s;
}
let storageOK = true, loadFailed = false;
function load() {
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { storageOK = false; return freshState(); }
  if (!raw) return freshState();
  try {
    const data = JSON.parse(raw);
    // Before upgrading stored data for the first time, keep an untouched copy of it.
    if (data && (data.version || 1) < DATA_VERSION) { try { if (!localStorage.getItem(PRE_MIGRATION_KEY)) localStorage.setItem(PRE_MIGRATION_KEY, raw); } catch (e) {} }
    return normalize(data);
  } catch (e) {
    loadFailed = true; // never overwrite data we couldn't read
    return freshState();
  }
}
let S = load();
let saveTimer = null;
function writeNow() {
  clearTimeout(saveTimer); saveTimer = null;
  if (loadFailed) return;
  for (const k of Object.keys(S.days)) if (!dayHasData(S.days[k])) delete S.days[k];
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); storageOK = true; }
  catch (e) { storageOK = false; toast("Couldn't save on this device. Export a backup now."); }
}
function save(now) { if (now) return writeNow(); clearTimeout(saveTimer); saveTimer = setTimeout(writeNow, 300); }
addEventListener("pagehide", writeNow);
document.addEventListener("visibilitychange", () => { if (document.hidden) { hiddenAt = Date.now(); writeNow(); } else onResume(); });

const day = k => S.days[k] ? normDay(S.days[k]) : blankDay();          // read-only view
const dayW = k => S.days[k] ? normDay(S.days[k]) : (S.days[k] = blankDay()); // for writing
const exById = id => S.exercises.find(e => e.id === id);
const activeExercises = () => S.exercises.filter(e => !e.archived);
const stepsEx = () => S.exercises.find(e => !e.archived && (e.id === "steps" || /^\s*steps?\s*$/i.test(e.name || "")));
function favExercises() {
  const ids = Array.isArray(S.settings.favorites) ? S.settings.favorites : DEFAULT_FAVORITES.map(id => id === "steps" ? (stepsEx() || {}).id : id);
  return ids.map(exById).filter(e => e && !e.archived).slice(0, MAX_FAVORITES);
}
const curEx = () => { const e = exById(S.settings.lastExercise); return e && !e.archived ? e : activeExercises()[0]; };

/* ---------- units ---------- */
const lu = () => S.settings.unit;
const toKg = (v, u = lu()) => u === "lb" ? v * KG_PER_LB : v;
const fromKg = (kg, u = lu()) => u === "lb" ? kg / KG_PER_LB : kg;
const wtxt = (kg, u = lu()) => nf(fromKg(kg, u));

/* ---------- scoring ---------- */
function isSuperhuman(d) {
  const set = d.top3.filter(t => t.text.trim());
  return set.length >= Math.min(3, SUPERHUMAN_DAY_TOP3_NEEDED) && set.every(t => t.done);
}
function top3Status(d) { const set = d.top3.filter(t => t.text.trim()); return { set: set.length, done: set.filter(t => t.done).length }; }
const exDone = (d, e) => e.type === "weighted" ? d.sets.filter(s => s.ex === e.id).reduce((a, s) => a + s.r, 0)
  : e.type === "workout" ? d.sessions.filter(s => s.ex === e.id).length : (d.reps[e.id] || 0);
const hasMoved = d => Object.values(d.reps).some(v => v > 0) || d.sets.length > 0 || d.sessions.length > 0;

function dayXP(d, k) {
  let x = 0;
  for (const id in d.reps) { const e = exById(id); if (e) x += d.reps[id] * e.xp; }
  for (const s of d.sets) { const e = exById(s.ex); if (e) x += s.r * e.xp; }
  for (const s of d.sessions) { const e = exById(s.ex); if (e) x += e.xp; }
  for (const h of S.habits) { const v = d.habits[h.id]; if (v) x += h.kind === "check" ? h.xp : v * h.xp; }
  if (d.weight) x += WEIGH_IN_XP;
  x += d.breath.reduce((a, b) => a + b.sec, 0) / 60 * BREATH_XP_PER_MINUTE;
  x += d.top3.filter(t => t.text.trim() && t.done).length * TOP3_ITEM_XP;
  if (isSuperhuman(d)) x += SUPERHUMAN_DAY_BONUS_XP;
  x += d.extras.filter(e => e.done).length * EXTRA_DONE_XP;
  x += d.moments.length * MOMENT_XP;
  if (k !== todayKey() && d.log.length) x += !d.beers ? BEER_FREE_DAY_XP : d.beers <= LOW_BEER_LIMIT ? LOW_BEER_DAY_XP : 0;
  return x;
}
const totalXP = () => Math.round(Object.keys(S.days).reduce((a, k) => a + dayXP(normDay(S.days[k]), k), 0));
function xpForLevel(l) { const n = l - 1; return n * LEVEL_1_TO_2_XP + LEVEL_XP_INCREASE * n * (n - 1) / 2; }
function levelInfo(xp) {
  let l = 1; while (xp >= xpForLevel(l + 1)) l++;
  const lo = xpForLevel(l), hi = xpForLevel(l + 1);
  return { level: l, xp, lo, hi, toNext: hi - xp, pct: Math.min(100, (xp - lo) / (hi - lo) * 100), rank: RANKS[Math.min(RANKS.length - 1, Math.floor((l - 1) / 2))] };
}

/* streaks: rest days are skipped (they never break a streak), today only counts once it's done */
function streak(test) {
  const keys = Object.keys(S.days).sort(); if (!keys.length) return 0;
  const first = keys[0]; let k = todayKey(), n = 0;
  if (!test(day(k))) k = addDays(k, -1);
  while (k >= first) {
    const d = day(k);
    if (test(d)) n++; else if (!d.rest) break;
    k = addDays(k, -1);
  }
  return n;
}
function bestStreak(test) {
  const keys = Object.keys(S.days).sort(); if (!keys.length) return 0;
  let k = keys[0], run = 0, best = 0; const t = todayKey();
  while (k <= t) { const d = day(k); if (test(d)) { run++; best = Math.max(best, run); } else if (!d.rest && k !== t) run = 0; k = addDays(k, 1); }
  return best;
}

/* ---------- medals ---------- */
function defaultTiers(type) { return { reps: [100, 500, 1500, 4000], weighted: [100, 500, 1500, 4000], timed: [300, 1200, 3600, 7200], workout: [4, 12, 36, 100] }[type] || [10, 50, 150, 400]; }
function computeTotals() {
  const tot = {}; const add = (id, v) => { tot[id] = (tot[id] || 0) + v; };
  const t = todayKey(); let sup = 0, br = 0, bf = 0;
  for (const k of Object.keys(S.days)) {
    const d = normDay(S.days[k]);
    for (const id in d.reps) add("ex:" + id, d.reps[id]);
    for (const s of d.sets) add("ex:" + s.ex, s.r);
    for (const s of d.sessions) add("ex:" + s.ex, 1);
    for (const h of S.habits) { const v = d.habits[h.id]; if (v) add("h:" + h.id, h.kind === "check" ? 1 : v); }
    if (isSuperhuman(d)) sup++;
    br += d.breath.reduce((a, b) => a + b.sec, 0);
    if (k !== t && d.log.length && !d.beers) bf++;
  }
  tot.super = sup; tot.breath = Math.floor(br / 60); tot.beerfree = bf; tot.best = bestStreak(isSuperhuman);
  return tot;
}
function medalDefs() {
  const out = [];
  for (const e of activeExercises()) out.push({ key: "ex:" + e.id, name: e.medal || e.name, tiers: e.tiers || defaultTiers(e.type), unit: e.unit || (e.type === "workout" ? "workouts" : e.type === "timed" ? "" : "reps"), dur: e.type === "timed", group: "Move" });
  out.push({ key: "super", name: "Superhuman", tiers: [1, 7, 30, 100], unit: "Superhuman Days", group: "Days" });
  out.push({ key: "best", name: "On Fire", tiers: [3, 7, 30, 100], unit: "day best streak", group: "Days" });
  out.push({ key: "breath", name: "Calm Breather", tiers: [10, 60, 300, 1000], unit: "min breathing", group: "Days" });
  for (const h of S.habits.filter(h => !h.archived)) out.push({ key: "h:" + h.id, name: h.medal || h.name, tiers: h.tiers || (h.kind === "check" ? [3, 15, 45, 120] : [10, 50, 150, 400].map(x => x * (h.step || 1))), unit: h.kind === "check" ? "days" : (h.unit || "times"), group: "Habits" });
  out.push({ key: "beerfree", name: "Clear Head", tiers: [3, 10, 30, 90], unit: "beer-free days", group: "Habits" });
  return out;
}
const TIERS = ["Bronze", "Silver", "Gold", "Platinum"];
const tierOf = (m, tot) => m.tiers.filter(x => (tot[m.key] || 0) >= x).length;
function medalSnapshot() { const tot = computeTotals(); return medalDefs().map(m => [m, tierOf(m, tot)]); }

/* ---------- sound and haptics ---------- */
let actx = null;
function audio() {
  if (S.settings.sound === "off") return null;
  try {
    if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); }
    if (actx.state === "suspended") actx.resume();
    return actx;
  } catch (e) { return null; }
}
function blip(c, { f = 600, f2 = null, d = 0.08, type = "sine", g = 0.25, at = 0 }) {
  const t0 = c.currentTime + at, o = c.createOscillator(), gn = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d);
  gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + 0.004); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(gn); gn.connect(c.destination); o.start(t0); o.stop(t0 + d + 0.03);
}
const SOUNDS = {
  click: { name: "Click", tap: c => { blip(c, { f: 2200, f2: 1200, d: 0.03, type: "square", g: 0.08 }); blip(c, { f: 520, f2: 300, d: 0.06, g: 0.3 }); } },
  pop: { name: "Pop", tap: c => blip(c, { f: 320, f2: 880, d: 0.09, g: 0.35 }) },
  wood: { name: "Wood block", tap: c => { blip(c, { f: 1000, f2: 760, d: 0.07, type: "triangle", g: 0.45 }); blip(c, { f: 2400, d: 0.015, g: 0.08 }); } },
  chime: { name: "Chime", tap: c => { blip(c, { f: 1318.5, d: 0.4, g: 0.16 }); blip(c, { f: 1975.5, d: 0.3, g: 0.05 }); } },
  coin: { name: "Coin", tap: c => { blip(c, { f: 988, d: 0.06, type: "square", g: 0.07 }); blip(c, { f: 1319, d: 0.2, type: "square", g: 0.07, at: 0.06 }); } },
  off: { name: "Off" },
};
function sfx(kind) {
  const c = audio(); if (!c) return;
  const set = SOUNDS[S.settings.sound] || SOUNDS.click;
  if (kind === "tap") set.tap && set.tap(c);
  else if (kind === "win") [523.25, 659.25, 783.99].forEach((f, i) => blip(c, { f, d: 0.22, g: 0.16, at: i * 0.08 }));
  else if (kind === "big") [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(c, { f, d: 0.3, type: "triangle", g: 0.2, at: i * 0.1 }));
  else if (kind === "cue") blip(c, { f: 528, d: 0.5, g: 0.1 });
  else if (kind === "alarm") [0, 0.22, 0.44].forEach(at => blip(c, { f: 880, d: 0.16, type: "triangle", g: 0.25, at }));
}
function buzz(ms = 12) {
  if (!S.settings.haptics) return;
  if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} return; }
  const l = document.getElementById("hapticLabel"); if (l) l.click(); // iPhone (iOS 18+) switch haptic
}

/* ---------- toast and celebration ---------- */
let toastT;
function toast(m) { const el = $("#toast"); el.textContent = m; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2800); }
function celebrate() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div"); box.className = "burst"; box.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 14; i++) { const s = document.createElement("i"); s.textContent = "✦"; s.style.setProperty("--a", (i / 14 * 360) + "deg"); s.style.setProperty("--d", (90 + Math.random() * 70) + "px"); box.appendChild(s); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 1100);
}

/* mutate: apply a change, save, and announce level-ups and medals */
function mutate(fn, { rerender = true } = {}) {
  const lv0 = levelInfo(totalXP()).level, m0 = medalSnapshot();
  const result = fn();
  save();
  const lv1 = levelInfo(totalXP()).level, m1 = medalSnapshot();
  if (rerender) render(); else renderHeader();
  if (lv1 > lv0) { sfx("big"); buzz(30); celebrate(); toast(`Level up! You're level ${lv1}. ${levelInfo(totalXP()).rank}.`); }
  else {
    const before = Object.fromEntries(m0.map(([m, t]) => [m.key, t]));
    const up = m1.find(([m, t]) => t > (before[m.key] || 0));
    if (up) { sfx("win"); toast(`${TIERS[up[1] - 1]} medal: ${up[0].name}!`); }
  }
  return result;
}

/* =====================================================================
   VIEWS
   ===================================================================== */
let tab = "today", winsDate = todayKey(), momentType = "win", shuffleN = 0, openSection = null;
let renderedDay = todayKey();
let logDate = null, hiddenAt = 0, showAllLog = false, moreOpen = false; // logDate: past day the Move page logs to (null = today)
const moveDay = () => logDate && logDate < todayKey() ? logDate : todayKey();
const dayTitle = k => k === todayKey() ? "Today" : k === addDays(todayKey(), -1) ? "Yesterday" : fmtDate(k);
const dayWord = k => k === todayKey() ? "today" : k === addDays(todayKey(), -1) ? "yesterday" : "on " + fmtDate(k);
const drafts = {};
let hold = null;   // running timed-exercise hold {ex, start}
const timer = { mode: "stopwatch", running: false, start: 0, elapsed: 0, restEnd: 0 };
let breath = null; // running breathing session
let ticker = null;

const ICONS = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  move: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  wins: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  breathe: '<path d="M3 8.5h10.5a3 3 0 1 0-3-3M3 12.5h14.5a3 3 0 1 1-3 3M3 16.5h6"/>',
  more: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
};
const TABS = () => [["today", "Today"], ["move", "Move"], ["wins", "Wins"]].concat(S.settings.breathing ? [["breathe", "Breathe"]] : []).concat([["more", "More"]]);

function renderHeader() {
  const li = levelInfo(totalXP());
  $("#lvlChip").innerHTML = `<b>Lv ${li.level}</b><span class="chipbar"><i style="width:${li.pct}%"></i></span>`;
  $("#lvlChip").setAttribute("aria-label", `Level ${li.level}, ${li.toNext} XP to level ${li.level + 1}`);
}
function renderTabs() {
  $("#tabbar").innerHTML = TABS().map(([id, label]) => `<button class="tabbtn" data-act="tab" data-tab="${id}" aria-current="${id === tab ? "page" : "false"}"><svg viewBox="0 0 24 24" aria-hidden="true" class="${id === "more" ? "fill" : ""}">${ICONS[id]}</svg><span>${label}</span></button>`).join("");
}
function render() {
  if (tab === "breathe" && !S.settings.breathing) tab = "today";
  renderHeader(); renderTabs();
  const v = { today: viewToday, move: viewMove, wins: viewWins, breathe: viewBreathe, more: viewMore }[tab] || viewToday;
  $("#view").innerHTML = v();
  renderedDay = todayKey();
  afterRender();
}
function go(t, opts = {}) {
  tab = t; S.settings.lastTab = t; save();
  if (t === "wins") winsDate = opts.date || todayKey();
  // Leaving Move (or opening it fresh) goes back to logging to today, so nothing lands on the wrong day by accident.
  logDate = t === "move" && opts.date && opts.date < todayKey() ? opts.date : null; showAllLog = false; moreOpen = false;
  if (opts.ex) S.settings.lastExercise = opts.ex;
  if (opts.section) openSection = opts.section;
  render(); scrollTo(0, 0);
  if (opts.section) setTimeout(() => { const el = document.getElementById(opts.section); if (el) el.scrollIntoView({ block: "start" }); }, 30);
}

/* ---------- shared blocks ---------- */
function levelCard(nudgeLine) {
  const li = levelInfo(totalXP());
  return `<section class="card levelcard" aria-label="Level">
    <div class="lvlring"><small>LEVEL</small><b>${li.level}</b></div>
    <div class="lvlinfo"><div class="lvlrank">${esc(li.rank)}</div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(li.pct)}"><i style="width:${li.pct}%"></i></div>
      <div class="lvltext">${(li.xp - li.lo).toLocaleString()} / ${(li.hi - li.lo).toLocaleString()} XP · ${li.xp.toLocaleString()} total</div>
      ${nudgeLine ? `<div class="lvlnudge">${nudgeLine}</div>` : ""}</div></section>`;
}
function weekStrip() {
  const t = todayKey(); let h = "";
  for (let i = 6; i >= 0; i--) {
    const k = addDays(t, -i), d = day(k), sup = isSuperhuman(d), st = top3Status(d);
    const cls = sup ? "sup" : d.rest ? "rest" : st.done ? "part" : "";
    h += `<div class="wday ${cls}${k === t ? " now" : ""}" title="${fmtDate(k)}${sup ? ": Superhuman Day" : d.rest ? ": rest day" : ""}"><span>${"SMTWTFS"[kdate(k).getDay()]}</span><b>${sup ? "✦" : d.rest ? "R" : hasMoved(d) ? "•" : ""}</b></div>`;
  }
  return h;
}
function streakCard() {
  const ss = streak(isSuperhuman), ms = streak(hasMoved);
  return `<section class="panel"><div class="statrow">
    <div class="stat"><b>${ss}</b><span>Superhuman ${plural(ss, "day")} in a row</span></div>
    <div class="stat"><b>${ms}</b><span>${plural(ms, "day")} moving in a row</span></div></div>
    <div class="week" aria-label="Last 7 days">${weekStrip()}</div>
    <p class="note">✦ Superhuman Day · • moved · R rest day. Rest days never break a streak.</p></section>`;
}
function moveSummary(d) {
  const parts = [];
  for (const e of S.exercises) {
    const v = exDone(d, e); if (!v) continue;
    if (e.type === "timed") parts.push(`${fmtDur(v)} ${e.name.toLowerCase()}`);
    else if (e.type === "weighted") { const n = d.sets.filter(s => s.ex === e.id).length; parts.push(`${e.name}: ${n} ${plural(n, "set")}`); }
    else if (e.type === "workout") parts.push(e.name + (v > 1 ? ` ×${v}` : ""));
    else parts.push(`${v.toLocaleString()} ${e.name.toLowerCase()}`);
  }
  const b = d.breath.reduce((a, x) => a + x.sec, 0); if (b) parts.push(`${Math.max(1, Math.round(b / 60))} min breathing`);
  return parts;
}

/* ---------- TODAY (morning wins screen) ---------- */
function seeded(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; }; }
function olderWins() {
  const cutoff = addDays(todayKey(), -2), pool = [];
  for (const k of Object.keys(S.days)) {
    if (k > cutoff) continue; const d = day(k);
    for (const m of d.moments) if (m.type === "win") pool.push({ k, text: m.text, tag: "Win" });
    for (const t of d.top3) if (t.text.trim() && t.done) pool.push({ k, text: t.text, tag: isSuperhuman(d) ? "Top 3 · Superhuman Day" : "Top 3" });
    for (const x of d.extras) if (x.done) pool.push({ k, text: x.text, tag: "Extra" });
  }
  const r = seeded(todayKey() + ":" + shuffleN);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return { list: pool.slice(0, OLD_WINS_SHOWN), total: pool.length };
}
function backupAgeDays() {
  if (!Object.keys(S.days).length) return null;
  const since = S.meta.lastBackup || S.meta.created;
  return Math.floor((Date.now() - new Date(since).getTime()) / 864e5);
}
function nudges() {
  const t = todayKey(), d = day(t), out = [], hr = new Date().getHours();
  const age = backupAgeDays();
  if (age !== null && age > BACKUP_REMINDER_DAYS) out.push({ ic: "💾", text: S.meta.lastBackup ? `Your last backup was ${age} days ago. Save a fresh copy to Files?` : "No backup yet. Save a copy of your data to Files?", act: "export", label: "Export" });
  const st = top3Status(d);
  if (!st.set) out.push({ ic: "✦", text: "What are today's top 3? Three things that would make today a win.", act: "gowins", label: "Set them" });
  else if (!isSuperhuman(d)) out.push({ ic: "✦", text: st.set < SUPERHUMAN_DAY_TOP3_NEEDED ? `${st.set} of 3 top-3 slots filled. Add ${SUPERHUMAN_DAY_TOP3_NEEDED - st.set} more?` : `${st.set - st.done} of your top 3 to go. You've got this.`, act: "gowins", label: "Open" });
  if (d.rest) out.push({ ic: "🌿", text: "Rest day. Recovery is part of the plan, and your streaks are safe." });
  else for (const e of activeExercises().filter(e => e.nudge)) {
    const v = exDone(d, e), n = e.name.toLowerCase();
    if (!v) out.push({ ic: "⚡", text: `No ${n} yet today. ${e.type === "reps" ? `A quick set of ${S.settings.quick[0]}?` : e.type === "timed" ? "Even 20 seconds counts." : e.type === "weighted" ? "One set gets it going." : "Ready when you are."}`, act: "goex", ex: e.id, label: "Let's go" });
    else if (e.goal && v < e.goal && e.type !== "workout") out.push({ ic: "⚡", text: `${e.type === "timed" ? fmtDur(e.goal - v) : e.goal - v} more ${n} to hit ${e.type === "timed" ? fmtDur(e.goal) : e.goal}. ${v} done already.`, act: "goex", ex: e.id, label: "Go" });
  }
  if (S.settings.breathing && !d.breath.length) out.push({ ic: "🫁", text: "No breathing yet today, two minutes?", act: "gobreathe", label: "Breathe" });
  if ((hr >= EVENING_HOUR || afterMidnight()) && !d.moments.some(m => m.type === "win")) out.push({ ic: "★", text: "Any wins today? Small ones count.", act: "gowins", label: "Add one" });
  return out;
}
function viewToday() {
  const t = todayKey(), y = addDays(t, -1), yd = day(y), td = day(t), hr = new Date().getHours();
  const greet = afterMidnight() ? "Still going" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  let h = `<section class="hello"><p class="eyebrow">${fmtDate(t, { weekday: "long", month: "long", day: "numeric" })}</p><h1>${greet}${S.settings.name ? ", " + esc(S.settings.name) : ""}</h1>${afterMidnight() ? `<p class="note">It's after midnight. Your day ends at ${hourLabel(dayEndHour())}, so anything you log now counts toward ${esc(fmtDate(t))}.</p>` : ""}</section>`;

  // Yesterday
  const ys = top3Status(yd), ysup = isSuperhuman(yd), ymoves = moveSummary(yd);
  const ywins = yd.moments.filter(m => m.type === "win"), ygrat = yd.moments.filter(m => m.type === "grateful"), yextras = yd.extras.filter(x => x.done);
  if (!S.days[y]) {
    h += `<section class="panel yesterday"><p class="label">Yesterday</p><h2>A blank page</h2><p class="muted">Nothing logged yesterday. That's fine. If you did something worth remembering, add it now.</p><div class="row2"><button class="btn ghostbtn" data-act="gowins" data-date="${y}">Add wins</button><button class="btn ghostbtn" data-act="goex" data-date="${y}">Log exercise</button></div></section>`;
  } else {
    const verdict = ysup ? `<div class="verdict sup"><span>✦</span><div><b>Superhuman Day</b><small>All of your top 3, done.</small></div></div>`
      : yd.rest ? `<div class="verdict rest"><span>🌿</span><div><b>Rest day</b><small>Recovery counts. Streak kept.</small></div></div>`
      : ys.set ? `<div class="verdict"><span>${ys.done}/${ys.set}</span><div><b>${ys.done ? `${ys.done} of your top 3 done` : "Top 3 not ticked off"}</b><small>${ys.done ? "Progress is progress." : "Today's a fresh start."}</small></div></div>`
      : `<div class="verdict"><span>·</span><div><b>No top 3 set</b><small>Here's what you did do.</small></div></div>`;
    h += `<section class="panel yesterday"><p class="label">Yesterday · ${fmtDate(y)}</p>${verdict}
      ${ys.set ? `<ul class="ticklist">${yd.top3.filter(x => x.text.trim()).map(x => `<li class="${x.done ? "done" : ""}"><span class="tk">${x.done ? "✓" : ""}</span>${esc(x.text)}</li>`).join("")}</ul>` : ""}
      ${yextras.length ? `<div><p class="sublabel">Extras · bonus</p><ul class="ticklist small">${yextras.map(x => `<li class="done"><span class="tk">+</span>${esc(x.text)}</li>`).join("")}</ul></div>` : ""}
      ${ywins.length ? `<div><p class="sublabel">Wins</p><ul class="plainlist">${ywins.map(m => `<li>★ ${esc(m.text)}</li>`).join("")}</ul></div>` : ""}
      ${ygrat.length ? `<div><p class="sublabel">Appreciated</p><ul class="plainlist">${ygrat.map(m => `<li>♥ ${esc(m.text)}</li>`).join("")}</ul></div>` : ""}
      ${ymoves.length ? `<p class="movesum">💪 ${esc(ymoves.join(" · "))}</p>` : ""}
      <div class="row2"><button class="btn ghostbtn" data-act="gowins" data-date="${y}">Edit wins</button><button class="btn ghostbtn" data-act="goex" data-date="${y}">Log exercise</button></div></section>`;
  }

  // Older wins, picked at random
  const ow = olderWins();
  h += `<section class="panel"><div class="rowsb"><p class="label">From your wins</p>${ow.total > OLD_WINS_SHOWN ? `<button class="linkbtn" data-act="shuffle">Show others</button>` : ""}</div>
    ${ow.list.length ? `<ul class="oldwins">${ow.list.map(w => `<li><b>${esc(w.text)}</b><small>${fmtDate(w.k, { month: "short", day: "numeric", year: kdate(w.k).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined })} · ${esc(w.tag)}</small></li>`).join("")}</ul>`
      : `<p class="muted">Every win you log ends up here. A few will be picked at random each morning, so you start the day remembering what you've already done.</p>`}</section>`;

  // Nudges
  const ns = nudges();
  h += `<section class="panel"><p class="label">Today</p><div class="nudges">${ns.map(n => `<div class="nudge"><span class="nic" aria-hidden="true">${n.ic}</span><p>${esc(n.text)}</p>${n.act ? `<button class="btn small" data-act="${n.act}"${n.ex ? ` data-ex="${esc(n.ex)}"` : ""}>${esc(n.label)}</button>` : ""}</div>`).join("") || `<div class="nudge"><span class="nic">✦</span><p>Everything's on track today. Superhuman.</p></div>`}</div>
    <label class="switchrow"><span><b>Rest day</b><small>Streaks stay safe and exercise nudges ease off.</small></span><input type="checkbox" class="sw" data-act="rest" data-date="${t}" ${td.rest ? "checked" : ""}></label></section>`;

  // Today's top 3 snapshot
  const ts = top3Status(td);
  if (ts.set) h += `<section class="panel"><div class="rowsb"><p class="label">Today's top 3</p><button class="linkbtn" data-act="gowins">Edit</button></div>
    <ul class="ticklist">${td.top3.map((x, i) => x.text.trim() ? `<li class="${x.done ? "done" : ""}"><button class="tk btnk" data-act="top3done" data-i="${i}" data-date="${t}" aria-label="${x.done ? "Mark not done" : "Mark done"}: ${esc(x.text)}">${x.done ? "✓" : ""}</button>${esc(x.text)}</li>` : "").join("")}</ul>
    ${isSuperhuman(td) ? `<p class="supline">✦ Today is a Superhuman Day. Extras are a bonus.</p>` : ""}</section>`;

  h += levelCard() + streakCard();
  return h;
}

/* ---------- MOVE (exercise counter) ---------- */
function liftStats(exId) {
  const t = moveDay(); let heavy = null, e1 = null, mostReps = null, vol = null, last = null;
  const keys = Object.keys(S.days).sort();
  for (const k of keys) {
    const sets = day(k).sets.filter(s => s.ex === exId); if (!sets.length) continue;
    let v = 0;
    for (const s of sets) {
      v += s.w * s.r;
      if (!heavy || s.w > heavy.w || s.w === heavy.w && s.r > heavy.r) heavy = { ...s, k };
      const est = s.r > 1 ? s.w * (1 + s.r / 30) : s.w;
      if (!e1 || est > e1.v) e1 = { v: est, s, k };
      if (!mostReps || s.r > mostReps.r) mostReps = { ...s, k };
    }
    if (!vol || v > vol.v) vol = { v, k };
    if (k < t) last = { k, sets };
  }
  return { heavy, e1, mostReps, vol, last, today: day(t).sets.filter(s => s.ex === exId) };
}
function repStats(e) {
  const t = moveDay(); let best = null, last = null, total = 0;
  for (const k of Object.keys(S.days).sort()) {
    const v = exDone(day(k), e); if (!v) continue; total += v;
    if (k !== t && (!best || v > best.v)) best = { v, k };
    if (k < t) last = { v, k };
  }
  return { best, last, total };
}
const xpText = e => e.xp > 0 && e.xp < 0.1 ? `+${nf(e.xp * 1000)} XP per 1,000 ${esc(e.unit || exUnit(e))}` : `+${nf(e.xp)} XP ${XP_LABEL[e.type].replace("XP ", "")}`;
const exUnit = (e, n = 2) => e.type === "workout" ? plural(n, "workout") : e.type === "timed" ? "" : e.type === "weighted" ? plural(n, "rep") : e.name.toLowerCase();
function levelNudge(e) {
  const li = levelInfo(totalXP());
  if (!e || !e.xp) return `${li.toNext.toLocaleString()} XP to level ${li.level + 1}`;
  const n = Math.ceil(li.toNext / e.xp), ns = n.toLocaleString();
  if (e.type === "timed") return `${fmtDur(n)} more ${e.name.toLowerCase()} to level ${li.level + 1}`;
  if (e.type === "workout") return `${ns} more ${plural(n, "workout")} to level ${li.level + 1}`;
  if (e.type === "weighted") return `${ns} more ${e.name.toLowerCase()} ${plural(n, "rep")} to level ${li.level + 1}`;
  return `${ns} more ${e.name.toLowerCase()} to level ${li.level + 1}`;
}
function setLine(s) { return `${s.r} × ${wtxt(s.w)} ${lu()}`; }
function exStatsHTML(e) {
  const k = moveDay(), d = day(k);
  if (e.type === "weighted") {
    const ls = liftStats(e.id);
    let beat = "";
    if (ls.last) {
      const top = ls.last.sets.reduce((a, s) => !a || s.w > a.w || s.w === a.w && s.r > a.r ? s : a, null);
      beat = `<div class="beat"><p class="sublabel">Last session · ${fmtDate(ls.last.k, { weekday: "short", month: "short", day: "numeric" })}</p>
        <p class="lastsets">${ls.last.sets.map(setLine).join(" · ")}</p>
        <p class="tobeat">To beat: <b>${top.r + 1} × ${wtxt(top.w)}</b> or <b>${top.r} × ${nf(fromKg(top.w) + WEIGHT_STEP[lu()])}</b> ${lu()}</p></div>`;
    }
    return `${beat}<div class="pbs">
      <div><b>${ls.heavy ? `${wtxt(ls.heavy.w)}` : "–"}</b><span>Heaviest${ls.heavy ? ` (${ls.heavy.r} ${plural(ls.heavy.r, "rep")})` : ""}</span></div>
      <div><b>${ls.e1 ? nf(fromKg(ls.e1.v)) : "–"}</b><span>Best est. 1-rep max</span></div>
      <div><b>${ls.vol ? Math.round(fromKg(ls.vol.v)).toLocaleString() : "–"}</b><span>Best session volume</span></div></div>
      <p class="note">Personal bests in ${lu()}. 1-rep max estimated from your sets (Epley).</p>
      ${ls.today.length ? `<div><p class="sublabel">Sets ${esc(dayWord(k))}</p><ol class="sets">${ls.today.map((s, i) => `<li><span>Set ${i + 1}</span><b>${setLine(s)}</b><button class="x" data-act="delset" data-id="${esc(s.id)}" aria-label="Delete set ${i + 1}">×</button></li>`).join("")}</ol></div>` : ""}`;
  }
  const rs = repStats(e), v = exDone(d, e);
  const show = n => e.type === "timed" ? fmtDur(n) : n.toLocaleString();
  return `<div class="pbs">
    <div><b>${rs.last ? show(rs.last.v) : "–"}</b><span>Last time${rs.last ? ` · ${fmtDate(rs.last.k, { month: "short", day: "numeric" })}` : ""}</span></div>
    <div><b>${rs.best ? show(rs.best.v) : "–"}</b><span>Best day${rs.best && v > rs.best.v ? ` · beaten ${esc(dayWord(k))}!` : ""}</span></div>
    <div><b>${show(rs.total)}</b><span>All time</span></div></div>`;
}
function todayCountHTML(e) {
  const k = moveDay(), dw = esc(dayWord(k)), v = exDone(day(k), e);
  if (e.type === "weighted") { const n = day(k).sets.filter(s => s.ex === e.id).length; return `<b>${n}</b><span>${plural(n, "set")} ${dw} · ${v} reps</span>`; }
  if (e.type === "workout") return `<b>${v}</b><span>${plural(v, "workout")} ${dw}</span>`;
  const goal = e.goal ? `<div class="goalbar" aria-label="Daily goal ${e.goal}"><i style="width:${Math.min(100, v / e.goal * 100)}%"></i></div><small>${v >= e.goal ? "Goal hit! Every extra one is a bonus." : `Goal ${e.type === "timed" ? fmtDur(e.goal) : e.goal.toLocaleString()} · ${e.type === "timed" ? fmtDur(e.goal - v) : (e.goal - v).toLocaleString()} to go`}</small>` : "";
  return `<b>${e.type === "timed" ? fmtDur(v) : v.toLocaleString()}</b><span>${e.type === "timed" ? dw : esc(e.name.toLowerCase()) + " " + dw}</span>${goal}`;
}
function entryText(d, x) {
  const e = exById(x.ex), n = e ? e.name : "Removed exercise";
  if (x.k === "reps") return (e && e.type === "timed" ? `${n} · ${fmtDur(x.v)}` : `${n} +${x.v.toLocaleString()}`) + (x.note === "earlier" ? " · earlier total" : "");
  if (x.k === "set") { const s = d.sets.find(s => s.id === x.id); return s ? `${n} · ${setLine(s)}` : `${n} · set`; }
  const s = d.sessions.find(s => s.id === x.id); return `${n} ✓${s && s.min ? ` · ${s.min} min` : ""}${s && s.note ? ` · ${s.note}` : ""}`;
}
const LOG_SHOWN = 30;
function moveLogHTML() {
  const k = moveDay(), d = day(k);
  const all = d.log.filter(x => MOVE_KINDS.includes(x.k)).slice().reverse(), items = showAllLog ? all : all.slice(0, LOG_SHOWN);
  if (!items.length) return `<p class="muted">Nothing logged ${esc(dayWord(k))} yet.${k === todayKey() ? " Your first tap starts the day's count." : ""}</p>`;
  return `<ul class="log">${items.map(x => `<li><button class="logitem" data-act="editentry" data-k="${k}" data-id="${esc(x.id)}" aria-label="Edit: ${esc(entryText(d, x))}"><span>${esc(entryText(d, x))}</span><time>${esc(x.t || "")}</time><span class="logedit" aria-hidden="true">Edit</span></button></li>`).join("")}</ul>
    ${all.length > items.length ? `<button class="linkbtn" data-act="showalllog">Show all ${all.length} entries</button>` : ""}
    <p class="note">Tap an entry to change its number or day, or delete it.</p>`;
}
/* Which day you're logging to: today by default, one tap for yesterday, a date picker for older days. */
function dayPickHTML(k, act, inputId) {
  const t = todayKey(), y = addDays(t, -1), other = k !== t && k !== y;
  return `<div class="seg dateseg" role="group" aria-label="Day">
    <button type="button" data-act="${act}" data-k="${t}" aria-pressed="${k === t}">Today</button>
    <button type="button" data-act="${act}" data-k="${y}" aria-pressed="${k === y}">Yesterday</button>
    <label class="datebtn${other ? " on" : ""}"><span>${other ? esc(fmtDate(k, { month: "short", day: "numeric" })) : "Older…"}</span><input type="date" id="${inputId}" max="${t}" value="${k}" aria-label="Pick a date"></label></div>`;
}
function logBannerHTML() {
  const t = todayKey(), k = moveDay();
  return k !== t ? `<div class="dbanner" role="status"><span>📅 Logging to <b>${esc(fmtDate(k))}</b></span><button class="btn small" data-act="logdate" data-k="${t}">Back to today</button></div>` : "";
}
function logDateHTML() {
  const t = todayKey(), k = moveDay(), long = `<b>${esc(fmtDate(k, { weekday: "long", month: "long", day: "numeric" }))}</b>`;
  const note = k !== t ? `New entries count toward ${long}.`
    : afterMidnight() ? `It's after midnight. Your day ends at ${hourLabel(dayEndHour())}, so entries still count toward ${long}.` : "";
  return `<div class="datepick" aria-label="Day to log to">${dayPickHTML(k, "logdate", "logDateIn")}${note ? `<p class="note">${note}</p>` : ""}</div>`;
}
function draft(e) {
  if (drafts[e.id]) return drafts[e.id];
  const all = Object.keys(S.days).sort().flatMap(k => day(k).sets.filter(s => s.ex === e.id));
  const last = all[all.length - 1];
  return drafts[e.id] = last ? { w: n1(fromKg(last.w)), r: last.r } : { w: DEFAULT_START_WEIGHT[lu()], r: DEFAULT_START_REPS };
}
function timerHTML() {
  const e = curEx(); const el = timerElapsed();
  const restLeft = timer.mode === "rest" ? Math.max(0, (timer.restEnd - Date.now()) / 1000) : 0;
  return `<details class="panel timer" ${timer.running || timer.elapsed || openSection === "timer" ? "open" : ""} data-sec="timer"><summary><span class="label">Set timer</span><span class="tsum" id="timerSum">${timer.running ? (timer.mode === "rest" ? "Rest " + fmtDur(restLeft) : fmtDur(el)) : "Optional"}</span></summary>
    <div class="seg" role="group" aria-label="Timer mode"><button data-act="tmode" data-m="stopwatch" aria-pressed="${timer.mode === "stopwatch"}">Stopwatch</button><button data-act="tmode" data-m="rest" aria-pressed="${timer.mode === "rest"}">Rest countdown</button></div>
    <div class="tdisplay" id="timerDisplay">${timer.mode === "rest" ? fmtDur(timer.running ? restLeft : S.settings.restSeconds) : fmtDur(el)}</div>
    ${timer.mode === "rest" ? `<div class="chips">${REST_TIMER_PRESETS.map(s => `<button class="chip" data-act="restpreset" data-s="${s}" aria-pressed="${S.settings.restSeconds === s}">${fmtDur(s)}</button>`).join("")}</div>` : ""}
    <div class="row2"><button class="btn primary" data-act="tstart">${timer.running ? "Stop" : timer.mode === "rest" ? "Start rest" : timer.elapsed ? "Resume" : "Start"}</button><button class="btn" data-act="treset">Reset</button></div>
    ${timer.mode === "stopwatch" && !timer.running && el >= 1 && e && (e.type === "timed" || e.type === "workout") ? `<button class="btn ghostbtn" data-act="tuse">${e.type === "timed" ? `Log ${fmtDur(el)} of ${esc(e.name.toLowerCase())}` : `Use ${Math.max(1, Math.round(el / 60))} min for this workout`}</button>` : ""}
  </details>`;
}
function viewMove() {
  const e = curEx();
  const favIds = favExercises().map(x => x.id), others = activeExercises().filter(x => !favIds.includes(x.id)), other = e && !favIds.includes(e.id);
  const chips = others.map(x => `<button class="chip ex" data-act="pickex" data-ex="${esc(x.id)}" aria-pressed="${e && x.id === e.id}">${esc(x.name)}</button>`).join("") + `<button class="chip add" data-act="newex">+ New</button>`;
  const picker = `<div class="picker" role="group" aria-label="Exercise"><div class="favs" id="favRow">${favTilesHTML(e)}</div>
    <button class="morebtn${other ? " on" : ""}" data-act="moreex" aria-expanded="${moreOpen}">${other ? `<b>${esc(e.name)}</b> · More` : "More exercises"}<span aria-hidden="true">${moreOpen ? "▴" : "▾"}</span></button>
    ${moreOpen ? `<div class="chips">${chips}</div>` : ""}</div>`;
  if (!e) return `${picker}<p class="muted">Add an exercise to start counting.</p>`;
  const st = S.settings, style = `style-${st.buttonStyle} color-${st.buttonColor}`, mk = moveDay();
  const toDay = mk !== todayKey() ? `<span class="bto">to ${esc(fmtDate(mk))}</span>` : "";
  let zone = "";
  if (e.type === "reps") {
    const quick = (Array.isArray(e.quick) && e.quick.length ? e.quick : st.quick).map(n => `<button class="btn qbtn" data-act="addn" data-n="${n}">+${n.toLocaleString()}</button>`).join("");
    const typein = `<form class="typein${e.tap === false ? " bigtype" : ""}" data-form="typein"><label for="typeN" class="vh">Number of ${esc(e.name.toLowerCase())}</label><input id="typeN" type="number" inputmode="numeric" min="1" max="${MAX_ENTRY_NUMBER}" placeholder="${e.tap === false ? `${esc(e.name)}, e.g. 8200` : "Type a number, e.g. 10"}"><button class="btn${e.tap === false ? " primary" : ""}" type="submit">Add${e.tap === false && toDay ? ` to ${esc(fmtDate(mk, { month: "short", day: "numeric" }))}` : ""}</button></form>`;
    zone = e.tap === false ? `${typein}<div class="quick">${quick}</div>`
      : `<div class="tapwrap"><button class="big ${style}" id="bigBtn" data-act="tap" aria-label="Add one ${esc(e.name.toLowerCase())}"><span class="bplus">+1</span><span class="bname">${esc(e.name)}</span>${toDay}</button></div>
      <div class="quick">${quick}</div>${typein}`;
  } else if (e.type === "timed") {
    const running = hold && hold.ex === e.id;
    zone = `<div class="tapwrap"><button class="big ${style}${running ? " running" : ""}" id="bigBtn" data-act="hold" aria-label="${running ? "Stop and log" : "Start"} ${esc(e.name.toLowerCase())}"><span class="bplus" id="holdTime">${running ? fmtDur((Date.now() - hold.start) / 1000) : "Start"}</span><span class="bname">${running ? "Tap to stop and log" : esc(e.name)}</span>${toDay}</button></div>
      <div class="quick">${TIMED_QUICK_SECONDS.map(n => `<button class="btn qbtn" data-act="addn" data-n="${n}">+${n}s</button>`).join("")}</div>
      <form class="typein" data-form="typein"><label for="typeN" class="vh">Seconds</label><input id="typeN" type="number" inputmode="numeric" min="1" max="${MAX_ENTRY_SECONDS}" placeholder="Type seconds, e.g. 45"><button class="btn" type="submit">Add</button></form>`;
  } else if (e.type === "weighted") {
    const dr = draft(e);
    zone = `<div class="steppers">
      <div class="stepper"><label for="wIn">Weight (${lu()})</label><div><button class="mini" data-act="wstep" data-d="-1" aria-label="Less weight">−</button><input id="wIn" type="number" inputmode="decimal" step="any" min="0" value="${esc(dr.w)}"><button class="mini" data-act="wstep" data-d="1" aria-label="More weight">+</button></div></div>
      <div class="stepper"><label for="rIn">Reps</label><div><button class="mini" data-act="rstep" data-d="-1" aria-label="One less rep">−</button><input id="rIn" type="number" inputmode="numeric" min="1" value="${esc(dr.r)}"><button class="mini" data-act="rstep" data-d="1" aria-label="One more rep">+</button></div></div></div>
      <div class="tapwrap"><button class="big ${style} wide-ok" id="bigBtn" data-act="logset"><span class="bplus">Log set</span><span class="bname" id="setPreview">${esc(dr.r)} × ${esc(dr.w)} ${lu()}</span>${toDay}</button></div>`;
  } else {
    zone = `<div class="steppers"><div class="stepper"><label for="wkMin">Minutes (optional)</label><div><input id="wkMin" type="number" inputmode="numeric" min="0" placeholder="45"></div></div>
      <div class="stepper"><label for="wkNote">Note (optional)</label><div><input id="wkNote" type="text" maxlength="80" placeholder="e.g. legs and core"></div></div></div>
      <div class="tapwrap"><button class="big ${style}" id="bigBtn" data-act="logworkout"><span class="bplus">Done ✓</span><span class="bname">${esc(e.name)}</span>${toDay}</button></div>`;
  }
  return `${picker}
    ${logBannerHTML()}
    <div id="levelBox">${levelCard(levelNudge(e))}</div>
    <section class="panel tapzone"><div class="rowsb"><h2>${esc(e.name)}</h2><button class="linkbtn" data-act="editex" data-ex="${esc(e.id)}">Edit</button></div>
      ${logDateHTML()}
      <div class="todaycount" id="todayCount">${todayCountHTML(e)}</div>${zone}
      <p class="note center">${xpText(e)}</p></section>
    <section class="panel"><p class="label">${e.type === "weighted" ? "What to beat" : "Your numbers"}</p><div id="exStats">${exStatsHTML(e)}</div></section>
    ${timerHTML()}
    <section class="panel"><div class="rowsb"><p class="label">Log · ${esc(dayTitle(mk))}</p><button class="linkbtn" data-act="undo">Undo last</button></div><div id="moveLog">${moveLogHTML()}</div></section>`;
}
function favTilesHTML(cur) {
  const k = moveDay(), d = day(k);
  return favExercises().map(x => {
    const v = exDone(d, x), show = x.type === "timed" ? fmtDur(v) : v.toLocaleString();
    const sub = x.type === "weighted" ? `${d.sets.filter(s => s.ex === x.id).length} sets` : x.type === "workout" ? `${v} done` : x.goal ? `${show} / ${x.type === "timed" ? fmtDur(x.goal) : x.goal.toLocaleString()}` : show;
    return `<button class="favbtn" data-act="fav" data-ex="${esc(x.id)}" aria-pressed="${!!cur && x.id === cur.id}"><b>${esc(x.name)}</b><small>${sub} ${esc(dayWord(k))}</small></button>`;
  }).join("");
}
function updateMoveLive() {
  const e = curEx(); if (tab !== "move" || !e) return;
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set("favRow", favTilesHTML(e)); set("todayCount", todayCountHTML(e)); set("levelBox", levelCard(levelNudge(e))); set("exStats", exStatsHTML(e)); set("moveLog", moveLogHTML());
}
function animateTap(label) {
  const b = $("#bigBtn"); if (!b) return;
  b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrap = b.parentElement;
  const f = document.createElement("span"); f.className = "floater"; f.textContent = label;
  f.style.left = (40 + Math.random() * 20) + "%"; wrap.appendChild(f); setTimeout(() => f.remove(), 900);
  const r = document.createElement("span"); r.className = "ring"; wrap.appendChild(r); setTimeout(() => r.remove(), 600);
}
function addReps(n, label) {
  const e = curEx(); if (!e || !(n > 0)) return;
  const k = moveDay(), before = exDone(day(k), e), rs = repStats(e);
  mutate(() => { const d = dayW(k); d.log.push({ k: "reps", ex: e.id, v: n, t: nowTime(), id: uid() }); recalcReps(d); }, { rerender: false });
  sfx("tap"); buzz(); animateTap(label || (e.type === "timed" ? "+" + fmtDur(n) : "+" + n));
  const after = before + n;
  if (e.goal && before < e.goal && after >= e.goal) { sfx("win"); celebrate(); toast(`${e.type === "timed" ? fmtDur(e.goal) : e.goal.toLocaleString()} ${e.name.toLowerCase()} ${dayWord(k)}. Goal hit!`); }
  else if (rs.best && before <= rs.best.v && after > rs.best.v) { sfx("win"); toast(`New best day: ${e.type === "timed" ? fmtDur(after) : after.toLocaleString()} ${e.name.toLowerCase()}!`); }
  else if (k !== todayKey() && n > 1) toast(`Added ${e.type === "timed" ? fmtDur(n) : n.toLocaleString()} to ${fmtDate(k)}`);
  updateMoveLive();
}
function logSet() {
  const e = curEx(), w = parseFloat($("#wIn").value), r = parseInt($("#rIn").value, 10);
  if (!(w >= 0) || !(r >= 1)) { toast("Enter a weight and at least 1 rep"); return; }
  drafts[e.id] = { w: String(w), r };
  const before = liftStats(e.id), s = { id: uid(), ex: e.id, w: toKg(w), r, t: nowTime() };
  mutate(() => { const d = dayW(moveDay()); d.sets.push(s); d.log.push({ k: "set", ex: e.id, id: s.id, t: s.t }); }, { rerender: false });
  sfx("tap"); buzz(); animateTap(`+${r}`);
  const est = r > 1 ? s.w * (1 + r / 30) : s.w;
  if (before.heavy && (s.w > before.heavy.w + 1e-6)) { sfx("big"); celebrate(); toast(`New PB! Heaviest ${e.name.toLowerCase()}: ${setLine(s)}`); }
  else if (before.e1 && est > before.e1.v + 1e-6) { sfx("big"); celebrate(); toast(`New PB! Best estimated max on ${e.name.toLowerCase()}`); }
  else if (before.mostReps && r > before.mostReps.r) { sfx("win"); toast(`Most reps in a set: ${r}!`); }
  updateMoveLive();
}
function logWorkout(minOverride) {
  const e = curEx(), min = minOverride || parseInt(($("#wkMin") || {}).value, 10) || 0, note = (($("#wkNote") || {}).value || "").trim();
  const s = { id: uid(), ex: e.id, min, note, t: nowTime() };
  const k = moveDay();
  mutate(() => { const d = dayW(k); d.sessions.push(s); d.log.push({ k: "session", ex: e.id, id: s.id, t: s.t }); }, { rerender: false });
  sfx("win"); buzz(25); animateTap("✓"); toast(`${e.name} done${k !== todayKey() ? " · " + fmtDate(k) : ""}. +${nf(e.xp)} XP`);
  if ($("#wkMin")) $("#wkMin").value = ""; if ($("#wkNote")) $("#wkNote").value = "";
  updateMoveLive();
}
/* Remove one exercise entry from a day (and its set or session). Totals are recalculated from what's left. */
function takeEntry(d, id) {
  const i = d.log.findIndex(x => x.id === id && MOVE_KINDS.includes(x.k)); if (i < 0) return null;
  const x = d.log.splice(i, 1)[0]; let obj = null;
  if (x.k === "set") { obj = d.sets.find(s => s.id === id); d.sets = d.sets.filter(s => s.id !== id); }
  else if (x.k === "session") { obj = d.sessions.find(s => s.id === id); d.sessions = d.sessions.filter(s => s.id !== id); }
  recalcReps(d);
  return { x, obj };
}
function putEntry(d, { x, obj }) {
  d.log.push(x);
  if (x.k === "set" && obj) d.sets.push(obj); else if (x.k === "session" && obj) d.sessions.push(obj);
  recalcReps(d);
}
function undoMove() {
  const k = moveDay(), last = day(k).log.filter(x => MOVE_KINDS.includes(x.k)).pop();
  if (!last) { toast(`Nothing to undo ${dayWord(k)}`); return; }
  mutate(() => { takeEntry(dayW(k), last.id); });
  toast("Undone");
}

/* Edit an entry: change its number, move it to another day, or delete it. Both days are recalculated. */
function entrySheet(k, id) {
  const d = day(k), x = d.log.find(x => x.id === id && MOVE_KINDS.includes(x.k));
  if (!x) { toast("That entry is gone"); render(); return; }
  const e = exById(x.ex), name = e ? e.name : "Removed exercise";
  let fields;
  if (x.k === "reps") {
    const timed = e && e.type === "timed";
    fields = `<div class="field"><label for="entN">${timed ? "Seconds" : "Number"}</label><input id="entN" type="number" inputmode="numeric" min="1" max="${timed ? MAX_ENTRY_SECONDS : MAX_ENTRY_NUMBER}" value="${x.v}" required></div>`;
  } else if (x.k === "set") {
    const s = d.sets.find(s => s.id === id) || { w: 0, r: 1 };
    fields = `<div class="two"><div class="field"><label for="entW">Weight (${lu()})</label><input id="entW" type="number" inputmode="decimal" step="any" min="0" value="${n1(fromKg(s.w))}" required></div>
      <div class="field"><label for="entR">Reps</label><input id="entR" type="number" inputmode="numeric" min="1" value="${s.r}" required></div></div>`;
  } else {
    const s = d.sessions.find(s => s.id === id) || {};
    fields = `<div class="two"><div class="field"><label for="entMin">Minutes</label><input id="entMin" type="number" inputmode="numeric" min="0" value="${s.min || ""}" placeholder="Optional"></div>
      <div class="field"><label for="entNote">Note</label><input id="entNote" type="text" maxlength="80" value="${esc(s.note || "")}" placeholder="Optional"></div></div>`;
  }
  openSheet(`<form data-form="entry" data-k="${k}" data-id="${esc(id)}"><h2>Edit entry · ${esc(name)}</h2>
    <p class="note">${x.t ? `Logged at ${esc(x.t)}` : "Logged before entry times were kept"}. Counts toward ${esc(fmtDate(k, { weekday: "long", month: "long", day: "numeric" }))}.</p>
    ${fields}
    <div class="field"><span class="flabel">Day</span><div id="entDays">${dayPickHTML(k, "entdate", "entDate")}</div>
      <p class="note" id="entDayNote">Counts toward <b>${esc(fmtDate(k, { weekday: "long", month: "long", day: "numeric" }))}</b>.</p></div>
    <div class="row2"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-act="closesheet">Cancel</button></div>
    <button class="btn danger" type="button" data-act="delentry" data-k="${k}" data-id="${esc(id)}">Delete entry</button></form>`);
}
function setEntryDay(nk) {
  const t = todayKey(), f = $('form[data-form="entry"]'); if (!f) return;
  if (!nk || nk > t) { toast("You can't log to a future day"); nk = f.dataset.nk || f.dataset.k; }
  f.dataset.nk = nk;
  $("#entDays").innerHTML = dayPickHTML(nk, "entdate", "entDate");
  $("#entDayNote").innerHTML = `${nk !== f.dataset.k ? "Moves to" : "Counts toward"} <b>${esc(fmtDate(nk, { weekday: "long", month: "long", day: "numeric" }))}</b>.`;
}
function saveEntry(f) {
  const k = f.dataset.k, id = f.dataset.id, nk = f.dataset.nk || k;
  if (nk > todayKey()) { toast("You can't log to a future day"); return; }
  const src = day(k), x = src.log.find(x => x.id === id && MOVE_KINDS.includes(x.k));
  if (!x) { closeSheet(); toast("That entry is gone"); render(); return; }
  const e = exById(x.ex);
  let upd;
  if (x.k === "reps") {
    const n = parseInt($("#entN").value, 10), max = e && e.type === "timed" ? MAX_ENTRY_SECONDS : MAX_ENTRY_NUMBER;
    if (!(n >= 1) || n > max) { toast(`Enter a number from 1 to ${max.toLocaleString()}`); return; }
    upd = (ent) => { ent.x.v = n; };
  } else if (x.k === "set") {
    const w = parseFloat($("#entW").value), r = parseInt($("#entR").value, 10);
    if (!(w >= 0) || !(r >= 1)) { toast("Enter a weight and at least 1 rep"); return; }
    upd = (ent) => { if (ent.obj) { ent.obj.w = toKg(w); ent.obj.r = r; } };
  } else {
    const min = Math.max(0, parseInt($("#entMin").value, 10) || 0), note = $("#entNote").value.trim();
    upd = (ent) => { if (ent.obj) { ent.obj.min = min; ent.obj.note = note; } };
  }
  closeSheet();
  mutate(() => {
    const d = dayW(k);
    if (nk === k) { // same day: edit in place
      const lx = d.log.find(y => y.id === id && MOVE_KINDS.includes(y.k)); if (!lx) return;
      upd({ x: lx, obj: lx.k === "set" ? d.sets.find(s => s.id === id) : lx.k === "session" ? d.sessions.find(s => s.id === id) : null });
      recalcReps(d);
    } else { const ent = takeEntry(d, id); if (!ent) return; upd(ent); putEntry(dayW(nk), ent); }
  });
  toast(nk !== k ? `Moved to ${fmtDate(nk)}` : "Saved");
}
function deleteEntry(k, id) {
  if (!confirm("Delete this entry? This can't be undone.")) return;
  closeSheet();
  mutate(() => { takeEntry(dayW(k), id); });
  toast("Entry deleted");
}

/* timers */
const timerElapsed = () => timer.elapsed + (timer.running && timer.mode === "stopwatch" ? (Date.now() - timer.start) / 1000 : 0);
function tick() {
  if (hold) { const el = document.getElementById("holdTime"); if (el) el.textContent = fmtDur((Date.now() - hold.start) / 1000); }
  if (timer.running) {
    let txt;
    if (timer.mode === "rest") {
      const left = (timer.restEnd - Date.now()) / 1000;
      if (left <= 0) { timer.running = false; ensureTicker(); sfx("alarm"); buzz(200); toast("Rest done. Next set!"); if (tab === "move") render(); return; }
      txt = fmtDur(left);
    } else txt = fmtDur(timerElapsed());
    const d = document.getElementById("timerDisplay"); if (d) d.textContent = txt;
    const s = document.getElementById("timerSum"); if (s) s.textContent = (timer.mode === "rest" ? "Rest " : "") + txt;
  }
  if (breath) breathTick();
}
function ensureTicker() {
  const need = hold || timer.running || breath;
  if (need && !ticker) ticker = setInterval(tick, 200);
  if (!need && ticker) { clearInterval(ticker); ticker = null; }
}

/* ---------- WINS (daily log) ---------- */
function viewWins() {
  const k = winsDate, t = todayKey(), d = day(k), st = top3Status(d), sup = isSuperhuman(d);
  const title = k === t ? "Today" : k === addDays(t, -1) ? "Yesterday" : fmtDate(k, { weekday: "long" });
  const mt = MOMENT_TYPES;
  const byType = type => d.moments.filter(m => m.type === type);
  return `<div class="datenav"><button class="mini" data-act="wday" data-d="-1" aria-label="Previous day">‹</button>
      <div><b>${title}</b><small>${fmtDate(k, { month: "long", day: "numeric", year: "numeric" })}</small></div>
      <button class="mini" data-act="wday" data-d="1" aria-label="Next day" ${k >= t ? "disabled" : ""}>›</button></div>
    <section class="panel ${sup ? "supglow" : ""}"><div class="rowsb"><h2>Top 3</h2><span class="label">${st.done}/${Math.max(st.set, 3)} done</span></div>
      <p class="note">The three things that make ${k === t ? "today" : "this day"} a win. Get all three done and it's a Superhuman Day.</p>
      <div class="top3">${d.top3.map((x, i) => `<div class="t3row ${x.done ? "done" : ""}"><button class="tick" data-act="top3done" data-i="${i}" data-date="${k}" aria-pressed="${x.done}" aria-label="Mark top ${i + 1} ${x.done ? "not done" : "done"}">${x.done ? "✓" : i + 1}</button><input type="text" data-top3="${i}" maxlength="120" value="${esc(x.text)}" placeholder="${["Most important thing", "Second thing", "Third thing"][i]}" aria-label="Top 3, item ${i + 1}" enterkeyhint="next"></div>`).join("")}</div>
      ${sup ? `<div class="verdict sup"><span>✦</span><div><b>Superhuman Day</b><small>Top 3 done. Anything else is a bonus.</small></div></div>` : ""}</section>
    <section class="panel"><div class="rowsb"><h2>Extras</h2><span class="label">bonus</span></div>
      ${d.extras.length ? `<ul class="extras">${d.extras.map(x => `<li class="${x.done ? "done" : ""}"><button class="tick small" data-act="extradone" data-id="${esc(x.id)}" aria-pressed="${x.done}" aria-label="Mark ${x.done ? "not done" : "done"}: ${esc(x.text)}">${x.done ? "✓" : ""}</button><span>${esc(x.text)}</span><button class="x" data-act="delextra" data-id="${esc(x.id)}" aria-label="Delete ${esc(x.text)}">×</button></li>`).join("")}</ul>` : ""}
      <form class="typein" data-form="extra"><label for="extraIn" class="vh">Add an extra</label><input id="extraIn" type="text" maxlength="120" placeholder="Anything beyond the top 3" enterkeyhint="done"><button class="btn" type="submit">Add</button></form></section>
    <section class="panel"><h2>Wins, losses and moments</h2>
      <div class="seg" role="group" aria-label="Type">${Object.entries(mt).map(([id, m]) => `<button data-act="mtype" data-t="${id}" aria-pressed="${momentType === id}">${m.icon} ${m.label}</button>`).join("")}</div>
      <form class="typein" data-form="moment"><label for="momentIn" class="vh">Add a ${mt[momentType].label.toLowerCase()}</label><input id="momentIn" type="text" maxlength="200" placeholder="${momentType === "win" ? "Something you did. Big or small." : momentType === "loss" ? "What didn't go well? What did it teach you?" : "Someone or something you appreciate"}" enterkeyhint="done"><button class="btn" type="submit">Add</button></form>
      ${Object.entries(mt).map(([id, m]) => byType(id).length ? `<div><p class="sublabel">${m.label === "Appreciate" ? "Appreciated" : m.label + (byType(id).length > 1 ? (id === "loss" ? "es" : "s") : "")}</p><ul class="moments">${byType(id).map(x => `<li><span class="mic ${id}">${m.icon}</span><span>${esc(x.text)}</span><button class="x" data-act="delmoment" data-id="${esc(x.id)}" aria-label="Delete">×</button></li>`).join("")}</ul></div>` : "").join("")}
    </section>
    <section class="panel"><label class="switchrow"><span><b>Rest day</b><small>Doesn't break streaks. Nudges ease off.</small></span><input type="checkbox" class="sw" data-act="rest" data-date="${k}" ${d.rest ? "checked" : ""}></label>
      ${moveSummary(d).length ? `<p class="movesum">💪 ${esc(moveSummary(d).join(" · "))}</p>` : ""}
      <button class="btn ghostbtn" data-act="goex" data-date="${k}">${moveSummary(d).length ? "See or edit exercise" : "Log exercise"}${k !== t ? " for " + esc(fmtDate(k)) : ""}</button></section>`;
}
function toggleTop3(k, i) {
  const d0 = day(k); if (!d0.top3[i].text.trim()) { toast("Write it in first"); const el = document.querySelector(`[data-top3="${i}"]`); if (el) el.focus(); return; }
  const wasSup = isSuperhuman(d0);
  mutate(() => { const d = dayW(k); d.top3[i].done = !d.top3[i].done; });
  const d = day(k);
  if (!wasSup && isSuperhuman(d)) { sfx("big"); buzz(40); celebrate(); toast(`Superhuman Day! +${SUPERHUMAN_DAY_BONUS_XP} XP bonus`); }
  else if (d.top3[i].done) { sfx("tap"); buzz(); }
}

/* ---------- BREATHE ---------- */
function viewBreathe() {
  const p = BREATH_PATTERNS.find(x => x.id === S.settings.breathPattern) || BREATH_PATTERNS[0];
  const d = day(todayKey()), secs = d.breath.reduce((a, b) => a + b.sec, 0);
  return `<section class="hello"><p class="eyebrow">Optional</p><h1>Breathe</h1></section>
    <section class="safety" role="note"><b>Safety first</b><p>Sit or lie down somewhere safe. <strong>Never do breathing exercises in or near water, or while driving.</strong> Breathe gently, and stop if you feel dizzy, tingly or unwell.</p></section>
    <section class="panel"><p class="label">Pattern</p><div class="patterns">${BREATH_PATTERNS.map(x => `<button class="pattern" data-act="bpat" data-p="${x.id}" aria-pressed="${x.id === p.id}"><b>${esc(x.name)}</b><small>${esc(x.desc)}</small></button>`).join("")}</div>
      <p class="label">Length</p><div class="chips">${BREATH_MINUTES.map(m => `<button class="chip" data-act="bmin" data-m="${m}" aria-pressed="${S.settings.breathMinutes === m}">${m} min</button>`).join("")}</div>
      <button class="btn primary bigcta" data-act="bstart">Start ${S.settings.breathMinutes} min · ${esc(p.name)}</button></section>
    <section class="panel"><div class="statrow"><div class="stat"><b>${Math.round(secs / 60)}</b><span>min today</span></div><div class="stat"><b>${computeTotals().breath}</b><span>min all time</span></div></div></section>`;
}
function startBreath() {
  const p = BREATH_PATTERNS.find(x => x.id === S.settings.breathPattern) || BREATH_PATTERNS[0];
  const cycle = p.steps.reduce((a, s) => a + s.s, 0), cycles = Math.max(1, Math.round(S.settings.breathMinutes * 60 / cycle));
  breath = { p, cycles, cycle: 0, step: -1, stepEnd: 0, start: Date.now(), end: Date.now() + cycles * cycle * 1000, scale: 0.5 };
  const o = $("#breathOverlay");
  o.innerHTML = `<div class="bwrap"><p class="bname">${esc(p.name)}</p><div class="bstage"><div class="bcircle" id="bCircle"></div><div class="btext" aria-live="polite"><b id="bLabel">Get ready</b><span id="bCount"></span></div></div>
    <p class="bleft" id="bLeft"></p><button class="btn" data-act="bstop">Stop</button><p class="note">Sitting or lying down. Stop if you feel dizzy.</p></div>`;
  o.hidden = false; document.body.classList.add("noscroll");
  wakeLock(true); audio();
  breathStep(); ensureTicker();
}
function breathStep() {
  const b = breath; b.step++;
  if (b.step >= b.p.steps.length) { b.step = 0; b.cycle++; if (b.cycle >= b.cycles) return finishBreath(true); }
  const s = b.p.steps[b.step]; b.stepEnd = Date.now() + s.s * 1000;
  if (s.to) b.scale = s.to;
  const c = $("#bCircle"); if (c) { void c.offsetWidth; c.style.transitionDuration = s.s + "s"; c.style.transform = `scale(${b.scale})`; c.dataset.phase = s.to ? (s.to >= 0.85 ? "in" : "out") : "hold"; }
  const l = $("#bLabel"); if (l) l.textContent = s.l;
  if (S.settings.breathCues) sfx("cue");
}
function breathTick() {
  const b = breath; if (!b) return;
  if (Date.now() >= b.stepEnd) { breathStep(); if (!breath) return; }
  const c = $("#bCount"); if (c) c.textContent = Math.max(1, Math.ceil((b.stepEnd - Date.now()) / 1000));
  const l = $("#bLeft"); if (l) l.textContent = fmtDur((b.end - Date.now()) / 1000) + " left";
}
function finishBreath(complete) {
  const b = breath; if (!b) return; breath = null; ensureTicker(); wakeLock(false);
  const o = $("#breathOverlay"); o.hidden = true; o.innerHTML = ""; document.body.classList.remove("noscroll");
  const sec = Math.round(Math.min(Date.now(), b.end) - b.start) / 1000;
  if (complete || sec >= BREATH_MIN_LOG_SECONDS) {
    mutate(() => { dayW(todayKey()).breath.push({ p: b.p.id, sec: Math.round(sec), t: nowTime() }); });
    sfx("win"); toast(`${complete ? "Nice." : "Stopped."} ${fmtDur(sec)} of breathing logged.`);
  } else toast("Stopped. Sessions under 30 seconds aren't logged.");
}
let wl = null;
async function wakeLock(on) {
  try { if (on && navigator.wakeLock) wl = await navigator.wakeLock.request("screen"); else if (!on && wl) { await wl.release(); wl = null; } } catch (e) {}
}

/* ---------- MORE (habits, medals, plan, exercises, settings, backup) ---------- */
function habitsHTML() {
  const t = todayKey(), d = day(t), bu = S.settings.bodyUnit;
  const lastW = Object.keys(S.days).sort().reverse().map(k => day(k).weight).find(Boolean);
  const groups = HABIT_AREAS.map(a => {
    const hs = S.habits.filter(h => h.area === a && !h.archived); if (!hs.length) return "";
    return `<p class="sublabel">${a}</p><div class="hgrid">${hs.map(h => {
      const v = d.habits[h.id] || 0;
      return h.kind === "check" ? `<button class="hbtn ${v ? "on" : ""}" data-act="habit" data-id="${esc(h.id)}" aria-pressed="${!!v}">${esc(h.name)}${v ? " ✓" : ""}<small>${v ? "Done" : "+" + h.xp + " XP"}</small></button>`
        : `<button class="hbtn" data-act="habit" data-id="${esc(h.id)}">+${h.step} ${esc(h.unit)}<small>${esc(h.name)}${v ? ` · ${v} today` : ""}</small></button>`;
    }).join("")}</div>`;
  }).join("");
  return `${groups}
    <p class="sublabel">Body and daily numbers</p>
    <div class="numgrid">
      ${stepsEx() ? `<div><span class="flabel">Steps today</span><div class="counter stepsbox"><b>${exDone(d, stepsEx()).toLocaleString()}</b><button class="btn small" data-act="goex" data-ex="${esc(stepsEx().id)}" aria-label="Log steps on the Move page">Log</button></div></div>` : ""}
      <form data-form="num" data-k="weight"><label for="n-weight">Weigh-in (${bu})</label><div><input id="n-weight" type="number" inputmode="decimal" step="0.1" min="20" placeholder="${lastW ? nf(fromKg(lastW, bu)) : ""}" value="${d.weight ? n1(fromKg(d.weight, bu)) : ""}"><button class="btn small" type="submit">Save</button></div></form>
      <form data-form="num" data-k="waist"><label for="n-waist">Waist (cm)</label><div><input id="n-waist" type="number" inputmode="decimal" step="0.5" min="30" value="${d.waist || ""}"><button class="btn small" type="submit">Save</button></div></form>
      <div><span class="flabel">Beers today</span><div class="counter"><button class="mini" data-act="beer" data-d="-1" aria-label="One less beer">−</button><b>${d.beers || 0}</b><button class="mini" data-act="beer" data-d="1" aria-label="One more beer">+</button></div></div>
    </div>
    <div class="rowsb"><button class="linkbtn" data-act="newhabit">+ New habit</button><button class="linkbtn" data-act="undohabit">Undo last</button></div>`;
}
function medalsHTML() {
  const tot = computeTotals(), defs = medalDefs();
  const earned = defs.reduce((a, m) => a + tierOf(m, tot), 0);
  const fmt = (m, v) => m.dur ? fmtDur(v) : v.toLocaleString();
  return `<p class="note">${earned} of ${defs.length * 4} medal tiers earned: bronze, silver, gold, platinum.</p>` + ["Move", "Days", "Habits"].map(g => `<p class="sublabel">${g}</p><div class="medals">${defs.filter(m => m.group === g).map(m => {
    const ti = tierOf(m, tot), v = tot[m.key] || 0, next = m.tiers[ti], prev = ti ? m.tiers[ti - 1] : 0;
    const pct = next ? Math.max(0, Math.min(100, (v - prev) / (next - prev) * 100)) : 100;
    return `<div class="medal t${ti}"><div class="disc" aria-hidden="true">${ti ? TIERS[ti - 1][0] : "–"}</div><div class="mtext"><b>${esc(m.name)}</b><small>${ti ? TIERS[ti - 1] : "Not yet earned"}</small><div class="mbar"><i style="width:${pct}%"></i></div><span>${next ? `${fmt(m, v)} / ${fmt(m, next)} ${esc(m.unit)} to ${TIERS[ti]}` : `Maxed · ${fmt(m, v)} ${esc(m.unit)}`}</span></div></div>`;
  }).join("")}</div>`).join("");
}
function planHTML() {
  const st = new Date(PLAN_START + "T00:00"), nd = kdate(todayKey()); nd.setHours(0, 0, 0, 0);
  const dd = Math.floor((nd - st) / 864e5), wk = dd < 0 ? 0 : Math.floor(dd / 7) + 1;
  const ws = dkey(new Date(st.getTime() + Math.max(0, wk - 1) * 7 * 864e5));
  let lift = 0, tilt = 0, keto = 0, burp = 0, dry = 0, logged = 0;
  for (let i = 0; i < 7; i++) {
    const k = addDays(ws, i); if (!S.days[k]) continue; const d = day(k);
    lift += d.sessions.some(s => s.ex === "lift") ? 1 : 0; tilt += d.sessions.some(s => s.ex === "tilt") ? 1 : 0;
    keto += d.habits.keto ? 1 : 0; burp += d.reps.burpees || 0; if (d.log.length) { logged++; if (!d.beers) dry++; }
  }
  const lastW = Object.keys(S.days).sort().reverse().map(k => day(k).weight).find(Boolean);
  const now = lastW ? Math.round(lastW * 10) / 10 : PLAN_START_KG, lost = Math.max(0, PLAN_START_KG - now), pct = Math.min(100, lost / (PLAN_START_KG - PLAN_GOAL_KG) * 100);
  const phase = wk === 0 ? { n: "Starts soon", t: "Break the fast gently tonight", r: ["Small protein starter at 8 pm: eggs", "Sardines and cucumbers an hour later", "No alcohol tonight"] }
    : wk === 9 ? { n: "Week 9 · Maintenance week", t: "Eat a bit more, keep protein high", r: ["Calories around maintenance for 7 days", "Keep training as normal", "Back to the deficit next week"] }
    : wk >= 5 ? { n: `Week ${wk} · Phase 2`, t: "Keto with carbs after lifting", r: ["Rest days: strict keto", "Lifting days: rice, potatoes or fruit in the meal after training", "Protein still 140–160 g"] }
    : { n: `Week ${wk} of 4 · Phase 1`, t: "Strict keto", r: ["Carbs from vegetables only", "Protein first at both meals", "Salt your food, broth often"] };
  const row = (l, v, ok) => `<div class="trow"><span>${l}</span><b class="${ok ? "ok" : ""}">${v}</b></div>`;
  return `<div class="plan">
    <div class="pbs"><div><b>${PLAN_START_KG}</b><span>start kg</span></div><div><b>${now}</b><span>now kg</span></div><div><b>74–76</b><span>target · ~early Mar</span></div></div>
    <div><div class="goalbar"><i style="width:${pct}%"></i></div><p class="note">${lost.toFixed(1)} of ${PLAN_START_KG - PLAN_GOAL_KG} kg lost. Aim for 0.5–0.75 kg a week. Watch the weekly average, not single days.</p></div>
    <div class="phase"><span class="label">${phase.n}</span><b>${phase.t}</b><ul>${phase.r.map(x => `<li>${x}</li>`).join("")}</ul></div>
    <div><p class="sublabel">Every day</p>${row("Protein", "140–160 g")}${row("Calories", "~1,900–2,100")}${row("Meals", "2, protein first")}${row("Steps", "8,000+")}${row("Burpees", "5-rep sets through the day")}${row("Electrolytes", "Salt food, broth")}</div>
    <div><p class="sublabel">This week so far</p>${row("Lifting sessions", `${lift} / 3`, lift >= 3)}${row("Tilt routines", `${tilt} / 4`, tilt >= 4)}${row("Keto days", `${keto} / 7`, keto >= 5)}${row("Burpees", burp, burp >= 150)}${row("Beer-free logged days", `${dry} / ${logged}`, logged && dry === logged)}</div>
    <div><p class="sublabel">Checkpoints</p><div class="ckpt">
      <time>Every 2 wks</time><span>Waist at the belly button (log it under Habits)</span>
      <time>28th monthly</time><span>Progress photo, front and side</span>
      <time>Nov 25</time><span>Phase 2: carbs after lifting</span>
      <time>Dec 23</time><span>Maintenance week</span>
      <time>Late Jan</time><span>Bloodwork (cholesterol) after 3 months of keto</span></div></div>
    <div><p class="sublabel">Watch-outs</p><ul class="note">
      <li>No more multi-day fasts while building muscle. A 16–18 hour daily window is plenty.</li>
      <li>Cramps or headaches usually mean you need more salt or magnesium.</li>
      <li>Constipation: more vegetables, water to thirst, magnesium.</li></ul></div></div>`;
}
function exercisesHTML() {
  return `<ul class="exlist">${activeExercises().map(e => `<li><div><b>${esc(e.name)}</b><small>${TYPE_LABEL[e.type]} · ${xpText(e)}${e.goal ? ` · goal ${e.type === "timed" ? fmtDur(e.goal) : e.goal}/day` : ""}${e.nudge ? " · daily nudge" : ""}${favExercises().some(x => x.id === e.id) ? " · big button" : ""}</small></div><button class="btn small" data-act="editex" data-ex="${esc(e.id)}">Edit</button></li>`).join("")}</ul>
    <button class="btn ghostbtn" data-act="newex">+ Add an exercise or workout</button>
    ${S.exercises.some(e => e.archived) ? `<p class="note">Hidden: ${S.exercises.filter(e => e.archived).map(e => `<button class="linkbtn" data-act="unhide" data-ex="${esc(e.id)}">${esc(e.name)} (show)</button>`).join(" ")}</p>` : ""}`;
}
function settingsHTML() {
  const s = S.settings;
  const seg = (key, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-act="set" data-k="${key}" data-v="${v}" aria-pressed="${s[key] === v}">${l}</button>`).join("")}</div>`;
  const tog = (key, label, hint) => `<label class="switchrow"><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ""}</span><input type="checkbox" class="sw" data-act="settog" data-k="${key}" ${s[key] ? "checked" : ""}></label>`;
  return `<div class="field"><label for="setName">Your name (for the greeting)</label><input id="setName" type="text" maxlength="30" value="${esc(s.name)}" placeholder="Optional"></div>
    <div class="field"><label for="setDayEnd">My day ends at</label><select id="setDayEnd">${Array.from({ length: MAX_DAY_END_HOUR + 1 }, (_, h) => `<option value="${h}" ${s.dayEndHour === h ? "selected" : ""}>${h === 0 ? "Midnight" : h + ":00 am"}</option>`).join("")}</select><small class="note">Anything you log before this time counts toward the day before, so late nights stay on the right day.</small></div>
    <div class="field"><span class="flabel">Lifting weights in</span>${seg("unit", [["lb", "lb"], ["kg", "kg"]])}</div>
    <div class="field"><span class="flabel">Body weight in</span>${seg("bodyUnit", [["kg", "kg"], ["lb", "lb"]])}</div>
    <div class="field"><label for="setQuick">Quick buttons (up to ${MAX_QUICK_BUTTONS}, separated by commas)</label><input id="setQuick" type="text" inputmode="numeric" value="${esc(s.quick.join(", "))}"></div>
    <div class="field"><span class="flabel">Tap sound</span><div class="chips">${Object.entries(SOUNDS).map(([id, x]) => `<button class="chip" data-act="sound" data-v="${id}" aria-pressed="${s.sound === id}">${x.name}</button>`).join("")}</div><small class="note">Tap a sound to hear it. No sound on iPhone? Check the silent switch.</small></div>
    <div class="field"><span class="flabel">Big button shape</span>${seg("buttonStyle", [["round", "Round"], ["square", "Square"], ["wide", "Wide"]])}</div>
    <div class="field"><span class="flabel">Big button colour</span><div class="chips">${["green", "coral", "blue", "gold", "ink"].map(c => `<button class="chip swatch color-${c}" data-act="set" data-k="buttonColor" data-v="${c}" aria-pressed="${s.buttonColor === c}">${c[0].toUpperCase() + c.slice(1)}</button>`).join("")}</div></div>
    <div class="field"><span class="flabel">Theme</span>${seg("theme", [["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]])}</div>
    ${tog("haptics", "Vibration", "Short buzz on each tap, where the phone supports it")}
    ${tog("breathing", "Breathing", "Show the Breathe tab and the daily breathing nudge")}
    ${tog("breathCues", "Breathing sound cues", "Soft tone at each in, hold and out")}
    ${tog("showPlan", "My plan", "Show the 12-week plan from Trailkin")}`;
}
function backupHTML() {
  const lb = S.meta.lastBackup, age = lb ? Math.floor((Date.now() - new Date(lb)) / 864e5) : null;
  const n = Object.keys(S.days).length;
  let hasUndo = false; try { hasUndo = !!localStorage.getItem(PRE_IMPORT_KEY); } catch (e) {}
  return `<p class="${age === null || age > BACKUP_REMINDER_DAYS ? "warn" : "muted"}">${lb ? `Last backup: ${age === 0 ? "today" : age === 1 ? "yesterday" : age + " days ago"} (${new Date(lb).toLocaleDateString(undefined, { month: "short", day: "numeric" })}).` : "No backup yet."} ${n} ${plural(n, "day")} of data on this device.</p>
    <div class="row2"><button class="btn primary" data-act="export">Export backup</button><button class="btn" data-act="import">Import backup</button></div>
    <p class="note">Export saves everything as one JSON file. On iPhone, choose <b>Save to Files</b> and pick iCloud Drive. Import replaces the data on this device with the file you choose.</p>
    ${hasUndo ? `<button class="linkbtn" data-act="undoimport">Undo the last import</button>` : ""}
    ${storageOK ? "" : `<p class="warn">This browser is blocking storage, so data may not be kept. Export often.</p>`}
    ${loadFailed ? `<p class="warn">The data saved on this device couldn't be read, so nothing is being saved over it. Import a backup to carry on.</p>` : ""}`;
}
function viewMore() {
  const sec = (id, title, body, open) => `<details class="panel sect" id="${id}" data-sec="${id}" ${openSection === id || open ? "open" : ""}><summary><h2>${title}</h2></summary><div class="sectbody">${body}</div></details>`;
  return `<section class="hello"><p class="eyebrow">Superhuman Day</p><h1>More</h1></section>
    ${levelCard()}
    ${sec("s-habits", "Habits", habitsHTML())}
    ${sec("s-medals", "Medals", medalsHTML())}
    ${S.settings.showPlan ? sec("s-plan", "My plan", planHTML()) : ""}
    ${sec("s-exercises", "Exercises", exercisesHTML())}
    ${sec("s-settings", "Settings", settingsHTML())}
    ${sec("s-backup", "Backup", backupHTML())}
    <section class="panel privacy"><b>Private by design</b><p class="note">No account, no server, no database. Everything you log stays on this device, in this app's storage. Export a backup now and then so you never lose it.</p></section>`;
}
function habitTap(id) {
  const h = S.habits.find(x => x.id === id); if (!h) return;
  mutate(() => {
    const d = dayW(todayKey()), prev = d.habits[id] || 0;
    d.habits[id] = h.kind === "check" ? (prev ? 0 : 1) : prev + (h.step || 1);
    if (!d.habits[id]) delete d.habits[id];
    d.log.push({ k: "habit", id, prev, t: nowTime() });
  });
  const v = day(todayKey()).habits[id];
  if (v) { sfx("tap"); buzz(); toast(h.kind === "check" ? `${h.name} ✓ +${h.xp} XP` : `+${h.step} ${h.unit} · ${h.name}`); }
}
function undoHabit() {
  const d = dayW(todayKey());
  for (let i = d.log.length - 1; i >= 0; i--) {
    const x = d.log[i]; if (!["habit", "num", "beer"].includes(x.k)) continue;
    mutate(() => {
      if (x.k === "habit") { if (x.prev) d.habits[x.id] = x.prev; else delete d.habits[x.id]; }
      else if (x.k === "num") d[x.id] = x.prev;
      else d.beers = Math.max(0, d.beers - x.v);
      d.log.splice(i, 1);
    });
    toast("Undone"); return;
  }
  toast("Nothing to undo today");
}

/* ---------- sheets (add/edit exercise, add habit) ---------- */
function openSheet(html) {
  const s = $("#sheet"); s.innerHTML = `<div class="sheetbox" role="dialog" aria-modal="true">${html}</div>`; s.hidden = false; document.body.classList.add("noscroll");
  const f = s.querySelector("input"); if (f) setTimeout(() => f.focus(), 50);
}
function closeSheet() { const s = $("#sheet"); s.hidden = true; s.innerHTML = ""; document.body.classList.remove("noscroll"); }
function exerciseSheet(id) {
  const e = id ? exById(id) : null;
  const used = e && Object.values(S.days).some(d => exDone(normDay(d), e));
  const type = e ? e.type : "reps";
  openSheet(`<form data-form="ex" data-id="${e ? esc(e.id) : ""}"><h2>${e ? "Edit " + esc(e.name) : "New exercise or workout"}</h2>
    <div class="field"><label for="exName">Name</label><input id="exName" required maxlength="40" value="${e ? esc(e.name) : ""}" placeholder="e.g. Push-ups, Deadlift, Morning run"></div>
    <div class="field"><label for="exType">Type</label><select id="exType" ${used ? "disabled" : ""}>
      <option value="reps" ${type === "reps" ? "selected" : ""}>Reps: tap to count (burpees, push-ups)</option>
      <option value="weighted" ${type === "weighted" ? "selected" : ""}>Weighted: sets of weight × reps (bench press)</option>
      <option value="timed" ${type === "timed" ? "selected" : ""}>Timed: seconds (dead hang, plank)</option>
      <option value="workout" ${type === "workout" ? "selected" : ""}>Workout: a whole session (run, class, lifting day)</option></select>
      ${used ? `<small class="note">Type is locked because this exercise has history.</small>` : ""}</div>
    <div class="two"><div class="field"><label for="exXP" id="exXPl">${XP_LABEL[type]}</label><input id="exXP" type="number" inputmode="decimal" step="any" min="0" value="${e ? e.xp : type === "workout" ? 30 : DEFAULT_XP_PER_REP}"></div>
      <div class="field" id="exGoalF" ${type === "workout" || type === "weighted" ? "hidden" : ""}><label for="exGoal">Daily goal${type === "timed" ? " (seconds)" : ""}</label><input id="exGoal" type="number" inputmode="numeric" min="0" value="${e && e.goal ? e.goal : ""}" placeholder="Optional"></div></div>
    <label class="switchrow" id="exTapF" ${type === "reps" ? "" : "hidden"}><span><b>Big +1 button</b><small>Turn off for things you type in, like steps</small></span><input type="checkbox" class="sw" id="exTap" ${!e || e.tap !== false ? "checked" : ""}></label>
    <label class="switchrow"><span><b>Big button on Move</b><small>Up to ${MAX_FAVORITES}. The rest sit behind More.</small></span><input type="checkbox" class="sw" id="exFav" ${e && favExercises().some(x => x.id === e.id) ? "checked" : ""}></label>
    <label class="switchrow"><span><b>Daily nudge</b><small>Remind me on the Today screen if I haven't done it</small></span><input type="checkbox" class="sw" id="exNudge" ${e && e.nudge ? "checked" : ""}></label>
    <div class="row2"><button class="btn primary" type="submit">${e ? "Save" : "Add"}</button><button class="btn" type="button" data-act="closesheet">Cancel</button></div>
    ${e ? `<button class="btn danger" type="button" data-act="hideex" data-ex="${esc(e.id)}">Hide this exercise</button><p class="note">Hiding keeps its history and XP. You can show it again from More > Exercises.</p>` : ""}</form>`);
}
function habitSheet() {
  openSheet(`<form data-form="habit"><h2>New habit</h2>
    <div class="field"><label for="hName">Name</label><input id="hName" required maxlength="40" placeholder="e.g. Glass of water, Meditation"></div>
    <div class="two"><div class="field"><label for="hArea">Area</label><select id="hArea">${HABIT_AREAS.map(a => `<option>${a}</option>`).join("")}</select></div>
      <div class="field"><label for="hKind">Type</label><select id="hKind"><option value="check">Once a day</option><option value="count">Count it up</option></select></div></div>
    <div class="two"><div class="field"><label for="hStep">Per tap (counts)</label><input id="hStep" type="number" min="1" value="1" inputmode="numeric"></div>
      <div class="field"><label for="hUnit">Unit (counts)</label><input id="hUnit" maxlength="16" placeholder="min, glasses"></div></div>
    <div class="row2"><button class="btn primary" type="submit">Add habit</button><button class="btn" type="button" data-act="closesheet">Cancel</button></div></form>`);
}

/* ---------- backup ---------- */
async function exportData() {
  writeNow();
  const name = `superhuman-day-backup-${todayKey()}.json`;
  const json = JSON.stringify(Object.assign({}, S, { exportedAt: new Date().toISOString() }), null, 1);
  const file = new File([json], name, { type: "application/json" });
  let done = false;
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch && navigator.canShare && navigator.share) {
    try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Superhuman Day backup" }); done = true; } }
    catch (e) { if (e && e.name === "AbortError") { toast("Backup cancelled"); return; } }
  }
  if (!done) {
    const url = URL.createObjectURL(file), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  S.meta.lastBackup = new Date().toISOString(); save(true);
  toast("Backup exported"); render();
}
function importData(file) {
  const r = new FileReader();
  r.onload = () => {
    let data;
    try { data = JSON.parse(r.result); } catch (e) { toast("That file isn't a Superhuman Day backup"); return; }
    if (!data || data.app !== "superhuman-day" || typeof data.days !== "object") { toast("That file isn't a Superhuman Day backup"); return; }
    const n = Object.keys(data.days).length, when = data.exportedAt ? new Date(data.exportedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "an unknown date";
    if (!confirm(`Restore the backup from ${when}?\n\nIt has ${n} ${plural(n, "day")} of data and will replace what's on this device now. You can undo this once from More > Backup.`)) return;
    try { localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify(S)); } catch (e) {}
    delete data.exportedAt;
    S = normalize(data); loadFailed = false; S.meta.lastOpenDay = todayKey(); if (!S.meta.lastBackup) S.meta.lastBackup = new Date().toISOString();
    save(true); applyTheme(); toast("Backup restored"); render();
  };
  r.readAsText(file);
}
function undoImport() {
  let raw = null; try { raw = localStorage.getItem(PRE_IMPORT_KEY); } catch (e) {}
  if (!raw || !confirm("Go back to the data you had before the last import?")) return;
  S = normalize(JSON.parse(raw)); save(true);
  try { localStorage.removeItem(PRE_IMPORT_KEY); } catch (e) {}
  applyTheme(); toast("Import undone"); render();
}

/* ---------- theme ---------- */
function applyTheme() {
  const t = S.settings.theme, root = document.documentElement;
  if (t === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
}

/* =====================================================================
   EVENTS
   ===================================================================== */
document.addEventListener("click", ev => {
  // Desktop browsers only open the calendar from its icon; open it from anywhere on the field.
  if (ev.target.type === "date" && ev.target.showPicker && matchMedia("(pointer: fine)").matches) { try { ev.target.showPicker(); } catch (e) {} }
  const b = ev.target.closest("[data-act]"); if (!b || b.tagName === "INPUT") return;
  if (b.closest("#sheet") && ev.target === $("#sheet")) return;
  const a = b.dataset.act, ds = b.dataset;
  switch (a) {
    case "tab": go(ds.tab); break;
    case "gowins": go("wins", { date: ds.date }); break;
    case "goex": go("move", { ex: ds.ex, date: ds.date }); break;
    case "logdate": logDate = ds.k < todayKey() ? ds.k : null; showAllLog = false; render(); break;
    case "showalllog": showAllLog = true; updateMoveLive(); break;
    case "editentry": entrySheet(ds.k, ds.id); break;
    case "entdate": setEntryDay(ds.k); break;
    case "delentry": deleteEntry(ds.k, ds.id); break;
    case "gobreathe": go("breathe"); break;
    case "export": exportData(); break;
    case "import": $("#importFile").value = ""; $("#importFile").click(); break;
    case "undoimport": undoImport(); break;
    case "shuffle": shuffleN++; render(); break;
    case "pickex": case "fav": S.settings.lastExercise = ds.ex; moreOpen = false; save(); if (hold && hold.ex !== ds.ex) stopHold(false); render(); break;
    case "moreex": moreOpen = !moreOpen; render(); break;
    case "tap": addReps(1); break;
    case "addn": addReps(+ds.n); break;
    case "hold": if (hold) stopHold(true); else { hold = { ex: curEx().id, start: Date.now() }; sfx("tap"); buzz(); ensureTicker(); render(); } break;
    case "wstep": { const i = $("#wIn"), st = WEIGHT_STEP[lu()]; i.value = Math.max(0, Math.round(((parseFloat(i.value) || 0) + st * +ds.d) * 100) / 100); syncSetPreview(); break; }
    case "rstep": { const i = $("#rIn"); i.value = Math.max(1, (parseInt(i.value, 10) || 0) + +ds.d); syncSetPreview(); break; }
    case "logset": logSet(); break;
    case "logworkout": logWorkout(); break;
    case "delset": mutate(() => { takeEntry(dayW(moveDay()), ds.id); }); break;
    case "undo": undoMove(); break;
    case "editex": exerciseSheet(ds.ex); break;
    case "newex": exerciseSheet(null); break;
    case "closesheet": closeSheet(); break;
    case "hideex": { const e = exById(ds.ex); if (!e || !confirm(`Hide ${e.name}? Its history and XP are kept.`)) break; e.archived = true; if (S.settings.lastExercise === e.id) S.settings.lastExercise = (activeExercises()[0] || {}).id; save(); closeSheet(); render(); toast(`${e.name} hidden`); break; }
    case "unhide": { const e = exById(ds.ex); if (e) { e.archived = false; save(); render(); } break; }
    case "tmode": timer.mode = ds.m; timer.running = false; timer.elapsed = 0; ensureTicker(); openSection = "timer"; render(); break;
    case "restpreset": S.settings.restSeconds = +ds.s; save(); openSection = "timer"; render(); break;
    case "tstart":
      if (timer.running) { if (timer.mode === "stopwatch") timer.elapsed = timerElapsed(); timer.running = false; }
      else { timer.running = true; audio(); if (timer.mode === "rest") timer.restEnd = Date.now() + S.settings.restSeconds * 1000; else timer.start = Date.now(); }
      ensureTicker(); openSection = "timer"; render(); break;
    case "treset": timer.running = false; timer.elapsed = 0; ensureTicker(); openSection = "timer"; render(); break;
    case "tuse": { const e = curEx(), el = timerElapsed(); timer.elapsed = 0; if (e.type === "timed") addReps(Math.round(el)); else logWorkout(Math.max(1, Math.round(el / 60))); render(); break; }
    case "wday": winsDate = addDays(winsDate, +ds.d); if (winsDate > todayKey()) winsDate = todayKey(); render(); break;
    case "top3done": toggleTop3(ds.date || winsDate, +ds.i); break;
    case "extradone": mutate(() => { const x = dayW(winsDate).extras.find(x => x.id === ds.id); if (x) x.done = !x.done; if (x && x.done) { sfx("tap"); buzz(); } }); break;
    case "delextra": mutate(() => { const d = dayW(winsDate); d.extras = d.extras.filter(x => x.id !== ds.id); }); break;
    case "mtype": momentType = ds.t; render(); setTimeout(() => $("#momentIn") && $("#momentIn").focus(), 30); break;
    case "delmoment": mutate(() => { const d = dayW(winsDate); d.moments = d.moments.filter(x => x.id !== ds.id); }); break;
    case "bpat": S.settings.breathPattern = ds.p; save(); render(); break;
    case "bmin": S.settings.breathMinutes = +ds.m; save(); render(); break;
    case "bstart": startBreath(); break;
    case "bstop": finishBreath(false); break;
    case "habit": habitTap(ds.id); break;
    case "undohabit": undoHabit(); break;
    case "newhabit": habitSheet(); break;
    case "beer": mutate(() => { const d = dayW(todayKey()), v = +ds.d; if (v < 0 && !d.beers) return; d.beers = (d.beers || 0) + v; d.log.push({ k: "beer", v, t: nowTime() }); }); break;
    case "set": S.settings[ds.k] = ds.v; save(); if (ds.k === "theme") applyTheme(); openSection = "s-settings"; render(); break;
    case "sound": S.settings.sound = ds.v; save(); sfx("tap"); openSection = "s-settings"; render(); break;
  }
});
document.addEventListener("change", ev => {
  const t = ev.target, ds = t.dataset;
  if (t.id === "importFile" && t.files && t.files[0]) return importData(t.files[0]);
  if (ds.act === "rest") { const k = ds.date, on = t.checked; mutate(() => { dayW(k).rest = on; }); toast(on ? "Rest day. Streaks are safe." : "Rest day off"); return; }
  if (ds.act === "settog") { S.settings[ds.k] = t.checked; save(); openSection = "s-settings"; render(); return; }
  if (t.id === "setName") { S.settings.name = t.value.trim(); save(); return; }
  if (t.id === "logDateIn") {
    const v = t.value; if (!v) return;
    if (v > todayKey()) { toast("You can't log to a future day"); render(); return; }
    logDate = v < todayKey() ? v : null; showAllLog = false; render(); return;
  }
  if (t.id === "entDate") { if (t.value) setEntryDay(t.value); return; }
  if (t.id === "setDayEnd") { S.settings.dayEndHour = +t.value; save(); openSection = "s-settings"; render(); toast(`Your day now ends at ${hourLabel(S.settings.dayEndHour)}`); return; }
  if (t.id === "setQuick") {
    const q = t.value.split(/[^0-9]+/).map(Number).filter(n => n > 0 && n <= 1000).slice(0, MAX_QUICK_BUTTONS);
    S.settings.quick = q.length ? q : DEFAULT_QUICK_AMOUNTS.slice(); save(); t.value = S.settings.quick.join(", "); toast("Quick buttons: " + S.settings.quick.map(n => "+" + n).join(" ")); return;
  }
  if (t.id === "exType") { const l = $("#exXPl"); if (l) l.textContent = XP_LABEL[t.value]; const g = $("#exGoalF"); if (g) g.hidden = t.value === "workout" || t.value === "weighted"; const tp = $("#exTapF"); if (tp) tp.hidden = t.value !== "reps"; }
});
document.addEventListener("input", ev => {
  const t = ev.target;
  if (t.dataset.top3 !== undefined) { const d = dayW(winsDate), i = +t.dataset.top3; d.top3[i].text = t.value; if (!t.value.trim()) d.top3[i].done = false; save(); return; }
  if (t.id === "wIn" || t.id === "rIn") syncSetPreview();
});
document.addEventListener("keydown", ev => {
  if (ev.key === "Enter" && ev.target.dataset && ev.target.dataset.top3 !== undefined) {
    ev.preventDefault(); const n = document.querySelector(`[data-top3="${+ev.target.dataset.top3 + 1}"]`); if (n) n.focus(); else ev.target.blur();
  }
  if (ev.key === "Escape" && !$("#sheet").hidden) closeSheet();
});
document.addEventListener("submit", ev => {
  const f = ev.target, kind = f.dataset.form; if (!kind) return; ev.preventDefault();
  if (kind === "entry") { saveEntry(f); return; }
  if (kind === "typein") {
    const i = $("#typeN"), n = parseInt(i.value, 10), e = curEx(), max = e && e.type === "timed" ? MAX_ENTRY_SECONDS : MAX_ENTRY_NUMBER;
    if (!(n > 0)) { toast("Type a number first"); return; }
    if (n > max) { toast(`That's more than ${max.toLocaleString()} in one go. Check the number?`); return; }
    addReps(n); i.value = ""; i.blur(); return;
  }
  if (kind === "extra") { const i = $("#extraIn"), v = i.value.trim(); if (!v) return; mutate(() => { dayW(winsDate).extras.push({ id: uid(), text: v, done: false }); }); setTimeout(() => $("#extraIn") && $("#extraIn").focus(), 20); return; }
  if (kind === "moment") { const i = $("#momentIn"), v = i.value.trim(); if (!v) return; mutate(() => { dayW(winsDate).moments.push({ id: uid(), type: momentType, text: v, t: nowTime() }); }); if (momentType === "win") sfx("win"); toast(momentType === "win" ? "Win logged. Nice." : momentType === "loss" ? "Logged. Every loss teaches something." : "Logged with gratitude."); setTimeout(() => $("#momentIn") && $("#momentIn").focus(), 20); return; }
  if (kind === "num") {
    const k = f.dataset.k, raw = parseFloat($("#n-" + k).value);
    if (!(raw > 0)) { toast("Enter a number first"); return; }
    const v = k === "steps" ? Math.round(raw) : k === "weight" ? toKg(raw, S.settings.bodyUnit) : Math.round(raw * 10) / 10;
    mutate(() => { const d = dayW(todayKey()); d.log.push({ k: "num", id: k, prev: d[k], t: nowTime() }); d[k] = v; });
    toast(k === "steps" ? `Steps saved: ${Math.round(raw).toLocaleString()}` : k === "weight" ? `Weighed in: ${nf(raw)} ${S.settings.bodyUnit}` : `Waist saved: ${nf(raw)} cm`); return;
  }
  if (kind === "ex") {
    const id = f.dataset.id, name = $("#exName").value.trim(); if (!name) return;
    const e = id ? exById(id) : { id: "x" + uid() };
    const type = id && $("#exType").disabled ? e.type : $("#exType").value;
    Object.assign(e, { name, type, xp: Math.max(0, parseFloat($("#exXP").value) || 0), goal: (type === "reps" || type === "timed") ? (parseInt($("#exGoal").value, 10) || 0) : 0, nudge: $("#exNudge").checked, tap: type === "reps" ? $("#exTap").checked : undefined });
    if (!id) { e.medal = name; e.tiers = defaultTiers(type); S.exercises.push(e); }
    const favs = favExercises().map(x => x.id), wantFav = $("#exFav").checked; let favMsg = "";
    if (wantFav !== favs.includes(e.id)) {
      if (wantFav && favs.length >= MAX_FAVORITES) favMsg = `Saved. Up to ${MAX_FAVORITES} big buttons, so turn one off first.`;
      else S.settings.favorites = wantFav ? favs.concat(e.id) : favs.filter(x => x !== e.id);
    }
    S.settings.lastExercise = e.id; save(); closeSheet(); render(); toast(favMsg || (id ? "Saved" : `Added ${name}`)); return;
  }
  if (kind === "habit") {
    const name = $("#hName").value.trim(); if (!name) return;
    const kindv = $("#hKind").value, step = Math.max(1, parseInt($("#hStep").value, 10) || 1), unit = $("#hUnit").value.trim() || "times";
    const h = { id: "h" + uid(), area: $("#hArea").value, name, kind: kindv, xp: kindv === "check" ? 20 : Math.max(0.2, Math.round(10 / step * 10) / 10), medal: name };
    if (kindv === "count") { h.step = step; h.unit = unit; }
    S.habits.push(h); save(); closeSheet(); openSection = "s-habits"; render(); toast(`Added: ${name}`); return;
  }
});
$("#sheet").addEventListener("click", ev => { if (ev.target.id === "sheet") closeSheet(); });
document.addEventListener("toggle", ev => { const d = ev.target; if (d.tagName === "DETAILS" && d.dataset.sec) { if (d.open) openSection = d.dataset.sec; else if (openSection === d.dataset.sec) openSection = null; } }, true);

function syncSetPreview() { const p = $("#setPreview"); if (p) p.textContent = `${$("#rIn").value || 0} × ${$("#wIn").value || 0} ${lu()}`; const e = curEx(); if (e) drafts[e.id] = { w: $("#wIn").value, r: $("#rIn").value }; }
function stopHold(log) {
  const h = hold; hold = null; ensureTicker(); if (!h) return;
  const sec = Math.round((Date.now() - h.start) / 1000);
  if (log && sec >= 1) { const keep = S.settings.lastExercise; S.settings.lastExercise = h.ex; addReps(sec, "+" + fmtDur(sec)); S.settings.lastExercise = keep; }
  render();
}
function afterRender() {
  // nothing heavy: keep focus behaviour simple
}

/* ---------- resume and morning logic ---------- */
function onResume() {
  const t = todayKey();
  if (logDate && Date.now() - hiddenAt > BACKDATE_KEEP_MINUTES * 60000) { logDate = null; if (tab === "move") render(); }
  if (t !== renderedDay && !breath) {
    if (S.meta.lastOpenDay !== t) { S.meta.lastOpenDay = t; tab = "today"; shuffleN = 0; save(); }
    winsDate = t; render();
  } else if (tab === "today") render();
}
function init() {
  applyTheme();
  if (navigator.audioSession) { try { navigator.audioSession.type = "ambient"; } catch (e) {} }
  const t = todayKey();
  if (S.meta.lastOpenDay !== t) { S.meta.lastOpenDay = t; tab = "today"; } // first open of the day: morning wins screen
  else tab = S.settings.lastTab || "today";
  save(true);
  render();
  if (loadFailed) toast("Couldn't read your saved data. Nothing has been changed. See More > Backup.");
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
}
init();
