/* Superhuman Day smoke test (developer tool only; the app never loads this file).
   Runs the app on an emulated iPhone and checks the main flows end to end.

   1. Serve the repo:            python3 -m http.server 8000
   2. Run:                       node tests/smoke.js
   Options (environment variables):
     BASE   app URL                              default http://localhost:8000/
     OLD    URL of a copy of the previous version, to check that migrated data scores exactly the same (optional)
     SHOTS  folder for screenshots                default ./smoke-shots
   Needs Playwright (require("playwright")). */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:8000/";
const OLD = process.env.OLD || "";
const SHOTS = process.env.SHOTS || path.join(process.cwd(), "smoke-shots");
fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "  PASS " : "  FAIL ") + msg); if (!cond) failures++; };

// Version 1 data as it was stored before entry ids existed (also used as an "old export file").
const V1 = {
  app: "superhuman-day", version: 1,
  settings: { unit: "lb", bodyUnit: "kg", quick: [5, 10], lastExercise: "burpees", lastTab: "move" },
  exercises: null, // filled from the app's defaults at run time
  habits: null,
  meta: { created: "2026-11-01T10:00:00.000Z", lastBackup: "2026-11-12T10:00:00.000Z", lastOpenDay: "2026-11-14" },
  days: {
    "2026-11-12": { reps: { burpees: 50 }, sets: [], sessions: [], log: [{ k: "reps", ex: "burpees", v: 25, t: "08:00" }, { k: "reps", ex: "burpees", v: 25, t: "18:00" }],
      top3: [{ text: "Ship it", done: true }, { text: "Call mum", done: true }, { text: "Run", done: true }], extras: [], moments: [{ id: "m1", type: "win", text: "Old win", t: "09:00" }], breath: [], rest: false, habits: { keto: 1 }, steps: 8200, weight: 84, waist: null, beers: 0 },
    // totals that don't match the log: an old total bigger than its entries, and one smaller
    "2026-11-13": { reps: { burpees: 30, pushups: 5, hang: 45 }, sets: [{ id: "s1", ex: "bench", w: 61.2, r: 8, t: "09:00" }], sessions: [{ id: "w1", ex: "lift", min: 45, note: "legs", t: "07:00" }],
      log: [{ k: "reps", ex: "burpees", v: 10, t: "10:00" }, { k: "reps", ex: "burpees", v: 10, t: "11:00" }, { k: "reps", ex: "pushups", v: 8, t: "12:00" }, { k: "reps", ex: "hang", v: 45, t: "12:30" }, { k: "set", ex: "bench", id: "s1", t: "09:00" }],
      top3: [{ text: "A", done: true }, { text: "B", done: false }, { text: "", done: false }], extras: [], moments: [], breath: [], rest: false, habits: {}, steps: 0, weight: null, waist: null, beers: 2 },
    "2026-11-14": { reps: { burpees: 12 }, sets: [], sessions: [], log: [{ k: "reps", ex: "burpees", v: 1, t: "08:00" }, { k: "reps", ex: "burpees", v: 1, t: "08:00" }, { k: "reps", ex: "burpees", v: 10, t: "09:00" }],
      top3: [{ text: "", done: false }, { text: "", done: false }, { text: "", done: false }], extras: [], moments: [], breath: [], rest: false, habits: {}, steps: 0, weight: null, waist: null, beers: 0 },
  },
};

const NOON = new Date("2026-11-14T15:00:00Z"); // Sat Nov 14, 3pm (browser runs in UTC)
const LATE = new Date("2026-11-15T01:30:00Z"); // Sun Nov 15, 1:30am: still Sat Nov 14 with a 3am day end

async function newPage(browser, device = "iPhone 13", time = NOON) {
  const ctx = await browser.newContext({ ...devices[device], timezoneId: "UTC", serviceWorkers: "block", acceptDownloads: true });
  const page = await ctx.newPage();
  page.on("pageerror", e => { console.log("  PAGE ERROR " + e.message); failures++; });
  page.on("dialog", d => d.accept());
  await page.clock.setFixedTime(time);
  return { ctx, page };
}
async function seed(page, url, data) {
  await page.goto(url);
  // stop the open page saving over the seed when it unloads
  await page.evaluate(d => { localStorage.clear(); localStorage.setItem("superhuman-day", JSON.stringify(d)); Storage.prototype.setItem = () => {}; }, data);
  await page.reload();
}
const snapshot = page => page.evaluate(() => ({
  xp: totalXP(), level: levelInfo(totalXP()).level, totals: computeTotals(),
  sup: streak(isSuperhuman), moving: streak(hasMoved),
  reps: Object.fromEntries(Object.keys(S.days).sort().map(k => [k, S.days[k].reps])),
}));
const reps = (page, k, ex) => page.evaluate(([k, ex]) => (S.days[k] && S.days[k].reps[ex]) || 0, [k, ex]);
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: false });
const tab = (page, name) => page.click(`.tabbtn[data-tab="${name}"]`);

(async () => {
  const browser = await chromium.launch();
  const { page } = await newPage(browser);
  await page.goto(BASE);
  const defaults = await page.evaluate(() => ({ ex: clone(DEFAULT_EXERCISES), h: clone(DEFAULT_HABITS) }));
  V1.exercises = defaults.ex.filter(e => e.id !== "steps"); V1.habits = defaults.h;

  console.log("Migration of version 1 data");
  await seed(page, BASE, V1);
  const after = await snapshot(page);
  ok(after.reps["2026-11-13"].burpees === 30, "old total bigger than its entries is kept (30 burpees)");
  ok(after.reps["2026-11-13"].pushups === 5, "old total smaller than its entries is kept (5 push-ups)");
  ok(after.reps["2026-11-14"].burpees === 12, "today's 12 burpees kept");
  ok(await page.evaluate(() => Object.values(S.days).every(d => d.log.every(x => !["reps", "set", "session"].includes(x.k) || x.id))), "every exercise entry has an id");
  ok(await page.evaluate(() => S.days["2026-11-13"].log.some(x => x.k === "session" && x.id === "w1")), "a session missing from the log gets an entry");
  ok(await page.evaluate(() => !!localStorage.getItem("superhuman-day-before-v2")), "untouched copy of version 1 data kept on the device");
  // Someone who already made their own "Steps" exercise in version 1
  const own = await page.evaluate(v1 => {
    const mk = (legacy) => { const d = clone(v1); d.exercises.push({ id: "xmine", name: "Steps", type: "reps", xp: 1 });
      d.days["2026-11-13"].reps.xmine = 22000; d.days["2026-11-13"].log.push({ k: "reps", ex: "xmine", v: 10000, t: "10:00" }, { k: "reps", ex: "xmine", v: 10000, t: "10:01" }, { k: "reps", ex: "xmine", v: 2000, t: "10:02" });
      if (!legacy) for (const k in d.days) d.days[k].steps = 0; return normalize(d); };
    const a = mk(true), b = mk(false), mine = a.exercises.find(e => e.id === "xmine"), built = a.exercises.find(e => e.id === "steps");
    return { mineTap: mine.tap, builtHidden: !!(built && built.archived), legacyTo: a.days["2026-11-12"].reps.steps, mineKept: a.days["2026-11-13"].reps.xmine,
      noBuiltWithoutLegacy: !b.exercises.some(e => e.id === "steps") };
  }, V1);
  ok(own.mineKept === 22000, "your own Steps exercise keeps its 22,000");
  ok(own.mineTap === false, "your own Steps exercise switches to typing the number");
  ok(own.builtHidden && own.legacyTo === 8200, "old Habits steps go to a hidden built-in Steps (same XP as before)");
  ok(own.noBuiltWithoutLegacy, "no extra Steps exercise when there are no old Habits steps");
  if (OLD) {
    const { page: op } = await newPage(browser);
    await seed(op, OLD, V1);
    const before = await snapshot(op);
    await op.context().close();
    console.log(`  v1: ${before.xp} XP, level ${before.level}, streaks ${before.sup}/${before.moving} · v2: ${after.xp} XP, level ${after.level}, streaks ${after.sup}/${after.moving}`);
    ok(after.level === before.level, "same level as before");
    ok(Math.abs(after.xp - before.xp) <= 1 + 8200 / 1000 * 10 * 0.05, "same XP as before (within rounding of steps)");
    ok(after.sup === before.sup && after.moving === before.moving, "same streaks as before");
    for (const k of ["ex:burpees", "ex:pushups", "ex:bench", "ex:lift", "ex:hang", "super"]) ok(after.totals[k] === before.totals[k], `same all-time total for ${k} (${before.totals[k]})`);
  }

  console.log("Log 20 burpees to yesterday");
  await tab(page, "move");
  await page.click('[data-ex="burpees"]:visible');
  await page.click('.datepick [data-act="logdate"]:has-text("Yesterday")');
  ok(await page.isVisible(".dbanner"), "banner shows when logging to another day");
  ok((await page.textContent(".dbanner")).includes("Fri, Nov 13") || (await page.textContent(".dbanner")).includes("Fri Nov 13"), "banner names the day: " + (await page.textContent(".dbanner")).trim());
  await shot(page, "move-yesterday");
  await page.fill("#typeN", "20"); await page.press("#typeN", "Enter");
  ok(await reps(page, "2026-11-13", "burpees") === 50, "yesterday now has 30 + 20 = 50 burpees");
  ok(await reps(page, "2026-11-14", "burpees") === 12, "today unchanged at 12");
  ok(await noHScroll(page), "no sideways scrolling on Move");
  await tab(page, "today"); await tab(page, "move");
  ok(!(await page.isVisible(".dbanner")), "leaving Move goes back to today");

  console.log("Older date with the date picker, and no future dates");
  await page.evaluate(() => { const i = document.getElementById("logDateIn"); i.value = "2026-11-10"; i.dispatchEvent(new Event("change", { bubbles: true })); });
  ok((await page.textContent(".dbanner")).includes("Nov 10"), "picked Nov 10");
  await page.evaluate(() => { const i = document.getElementById("logDateIn"); i.value = "2026-11-20"; i.dispatchEvent(new Event("change", { bubbles: true })); });
  ok(await page.evaluate(() => moveDay()) === "2026-11-10", "a future date is refused");
  await page.click('.dbanner [data-act="logdate"]');
  ok(!(await page.isVisible(".dbanner")), "Back to today works");

  console.log("Move an entry from today to yesterday");
  await page.fill("#typeN", "15"); await page.press("#typeN", "Enter");
  ok(await reps(page, "2026-11-14", "burpees") === 27, "today 12 + 15 = 27");
  await page.click(".logitem >> nth=0");
  ok(await page.isVisible('form[data-form="entry"]'), "tapping an entry opens the editor");
  await page.click('#entDays [data-act="entdate"]:has-text("Yesterday")');
  ok((await page.textContent("#entDayNote")).includes("Moves to"), "editor says where it will move");
  await shot(page, "edit-entry");
  await page.click('form[data-form="entry"] button[type="submit"]');
  ok(await reps(page, "2026-11-14", "burpees") === 12, "today back to 12");
  ok(await reps(page, "2026-11-13", "burpees") === 65, "yesterday 50 + 15 = 65");

  console.log("Edit a number and delete an entry");
  await page.click(".logitem >> nth=0");
  await page.fill("#entN", "11"); await page.click('form[data-form="entry"] button[type="submit"]');
  ok(await reps(page, "2026-11-14", "burpees") === 13, "changed the 9:00 entry from 10 to 11: today 1 + 1 + 11 = 13");
  await page.click(".logitem >> nth=0");
  await page.click('[data-act="delentry"]');
  ok(await reps(page, "2026-11-14", "burpees") === 2, "deleted the 11: today 2");

  console.log("+1 button still works");
  const b0 = await reps(page, "2026-11-14", "burpees");
  await page.click("#bigBtn"); await page.click("#bigBtn");
  ok(await reps(page, "2026-11-14", "burpees") === b0 + 2, "two taps add 2");

  console.log("Big numbers");
  const maxN = await page.evaluate(() => typeof MAX_ENTRY_NUMBER === "number" ? MAX_ENTRY_NUMBER : 10000);
  ok(maxN >= 100000, "maximum entry is at least 100,000 (" + maxN + ")");
  const hasSteps = await page.evaluate(() => !!exById("steps"));
  if (hasSteps) {
    await page.click('[data-ex="steps"]:visible');
    await page.fill("#typeN", "22000"); await page.press("#typeN", "Enter");
    ok(await reps(page, "2026-11-14", "steps") === 22000, "22,000 steps saved as one entry");
    ok(await page.evaluate(() => S.days["2026-11-14"].log.filter(x => x.ex === "steps").length) === 1, "it is a single entry");
    ok(await reps(page, "2026-11-12", "steps") === 8200, "old Habits steps (8,200) moved into the Steps exercise");
    await shot(page, "move-steps");
  }

  console.log("Move page picker");
  const favs = await page.$$eval('[data-act="fav"]', els => els.map(e => e.dataset.ex));
  if (favs.length) {
    ok(favs[0] === "burpees" && favs[1] === "steps", "Burpees and Steps are the first big buttons: " + favs.join(", "));
    ok(await page.isVisible('[data-act="moreex"]'), "a More button holds the rest");
    await page.click('[data-act="moreex"]');
    await page.click('[data-act="pickex"][data-ex="pushups"]');
    ok(await page.evaluate(() => curEx().id) === "pushups", "picked push-ups from More");
    await shot(page, "move-more");
    await page.click('[data-act="fav"][data-ex="burpees"]');
    ok(await page.evaluate(() => curEx().id) === "burpees", "burpees one tap away");
  }
  await page.evaluate(() => scrollTo(0, 0));
  await shot(page, "move-top");

  console.log("Screens fit an iPhone");
  for (const t of ["today", "wins", "more"]) {
    await tab(page, t);
    ok(await noHScroll(page), `no sideways scrolling on ${t}`);
    await shot(page, t);
  }
  await page.click("#s-habits summary");
  await page.locator(".numgrid").scrollIntoViewIfNeeded();
  ok((await page.textContent(".numgrid")).includes("22,000"), "Habits shows today's steps from the Steps exercise");
  await shot(page, "habits-numbers");
  await page.click("#s-habits summary");
  await page.click("#s-settings summary");
  await page.locator("#setDayEnd").scrollIntoViewIfNeeded();
  await shot(page, "settings");

  console.log("Export, then import an older backup file");
  await page.click("#s-backup summary");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-act="export"]')]);
  const exported = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  ok(exported.app === "superhuman-day" && exported.version >= 2 && exported.days["2026-11-13"], "export file written");
  const oldFile = path.join(SHOTS, "v1-backup.json");
  fs.writeFileSync(oldFile, JSON.stringify(Object.assign({}, V1, { exportedAt: "2026-11-12T10:00:00.000Z" })));
  await page.setInputFiles("#importFile", oldFile);
  await page.waitForTimeout(300);
  ok(await reps(page, "2026-11-13", "burpees") === 30, "older backup imports and keeps its totals");
  ok(await page.evaluate(() => S.version) >= 2, "imported data is upgraded");
  await page.setInputFiles("#importFile", await dl.path());
  await page.waitForTimeout(300);
  ok(await reps(page, "2026-11-13", "burpees") === 65, "new backup imports back exactly");
  await page.context().close();

  console.log("Day end: 1:30am counts toward the day before");
  const { page: lp } = await newPage(browser, "iPhone 13", LATE);
  await seed(lp, BASE, V1);
  ok(await lp.evaluate(() => todayKey()) === "2026-11-14", "at 1:30am today is still Sat Nov 14");
  await tab(lp, "move");
  ok((await lp.textContent(".datepick")).includes("after midnight"), "Move says it's after midnight and which day counts");
  await lp.click("#bigBtn");
  ok(await reps(lp, "2026-11-14", "burpees") === 13, "a tap at 1:30am counts toward Nov 14");
  await shot(lp, "late-night-move");
  await lp.evaluate(() => { S.settings.dayEndHour = 0; });
  ok(await lp.evaluate(() => todayKey()) === "2026-11-15", "with day end at midnight it's Nov 15");
  await lp.context().close();

  console.log("Small iPhone (SE) layout");
  const { page: se } = await newPage(browser, "iPhone SE");
  await seed(se, BASE, V1);
  for (const t of ["today", "move", "wins", "more"]) { await tab(se, t); ok(await noHScroll(se), `no sideways scrolling on ${t} (SE)`); }
  await tab(se, "move");
  await se.click('.datepick [data-act="logdate"]:has-text("Yesterday")');
  await shot(se, "se-move-yesterday");
  await se.context().close();

  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed. Screenshots in ${SHOTS}` : `\nAll checks passed. Screenshots in ${SHOTS}`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
