/* Superhuman Day: Trends & goal test (developer tool only; the app never loads this file).
   Seeds three weeks of burpees, then checks the stepped goal, pace, chart and XP on two phone sizes.

   1. Serve the repo:            python3 -m http.server 8000
   2. Run:                       node tests/trends.js
   Options: BASE (default http://localhost:8000/), SHOTS (default ./trend-shots), ONLY (a check name to screenshot only). */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:8000/";
const SHOTS = process.env.SHOTS || path.join(process.cwd(), "trend-shots");
fs.mkdirSync(SHOTS, { recursive: true });
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "  PASS " : "  FAIL ") + msg); if (!cond) failures++; };

const SIZES = [{ name: "360x640", width: 360, height: 640 }, { name: "412x915", width: 412, height: 915 }];
const NOW = new Date("2026-11-18T17:30:00Z"); // Wed Nov 18, 5:30pm (browser runs in UTC)

// Oct 28 … Nov 17 burpees, plus 30 so far today
const HIST = [10, 15, 5, 20, 0, 25, 30, 20, 35, 15, 40, 25, 30, 0, 45, 40, 35, 50, 30, 45, 55];
function seedData() {
  const days = {}; let d = new Date("2026-10-28T12:00:00Z"), n = 0;
  const put = (k, v) => { days[k] = { reps: { burpees: v }, sets: [], sessions: [], log: [{ k: "reps", ex: "burpees", v, t: "09:00", id: "e" + (++n) }], top3: [], extras: [], moments: [], breath: [], rest: false, habits: {}, weight: null, waist: null, beers: 0 }; };
  for (const v of HIST) { const k = d.toISOString().slice(0, 10); if (v) put(k, v); d.setUTCDate(d.getUTCDate() + 1); }
  put("2026-11-18", 30);
  return { app: "superhuman-day", version: 2, settings: { lastExercise: "burpees", lastTab: "move" }, days,
    meta: { created: "2026-10-28T10:00:00.000Z", lastBackup: "2026-11-17T10:00:00.000Z", lastOpenDay: "2026-11-18" } };
}

async function open(browser, size, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, timezoneId: "UTC", serviceWorkers: "block", colorScheme: opts.dark ? "dark" : "light" });
  const page = await ctx.newPage();
  page.on("pageerror", e => { console.log("  PAGE ERROR " + e.message); failures++; });
  page.on("dialog", d => d.accept());
  await page.clock.setFixedTime(opts.time || NOW);
  // seed before the app starts (once per tab), so the app never saves over it
  await page.addInitScript(d => { if (sessionStorage.getItem("seeded")) return; sessionStorage.setItem("seeded", "1"); localStorage.clear(); localStorage.setItem("superhuman-day", d); }, JSON.stringify(opts.data || seedData()));
  await page.goto(BASE);
  await page.click('.tabbtn[data-tab="move"]');
  return { ctx, page };
}
const scrollTo = (page, sel) => page.evaluate(s => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 64); }, sel);
const shot = async (page, name) => { try { await page.clock.runFor(4000); } catch (e) {} await page.waitForTimeout(50); return page.screenshot({ path: path.join(SHOTS, name + ".png"), animations: "disabled" }); };
const noHScroll = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

(async () => {
  const browser = await chromium.launch();
  for (const size of SIZES) {
    console.log(`\n${size.name}`);
    const { ctx, page } = await open(browser, size);
    ok(await page.isVisible("#tgTitle"), "Trends & goal panel is on the Move page");
    ok((await page.textContent("#tgTitle")).trim() === "Trends & goal", 'title reads "Trends & goal"');
    await scrollTo(page, ".tgpanel"); await shot(page, `${size.name}-goal`);
    ok(await noHScroll(page), "no sideways scrolling");

    // goal sheet: preview, validation, save
    await page.click('[data-act="planedit"]');
    ok((await page.textContent("#plPrev")).includes("60") && (await page.textContent("#plPrev")).includes("Dec 14"), "sheet previews the checkpoints (60 on Dec 14)");
    await shot(page, `${size.name}-sheet`);
    await page.fill("#plStretch", "2027-05-01");
    ok((await page.textContent("#plPrev")).includes("stretch date should fall between"), "a stretch date after the final date is refused");
    await page.fill("#plStretch", "2026-12-25");
    await page.click('[data-act="closesheet"]');

    // chart: week, month, year
    await scrollTo(page, "#trendChart");
    const bars = () => page.locator("#trendChart .barm").count();
    ok(await bars() === 3, "week view: bars for Mon, Tue and today (Wed)");
    ok(await page.locator("#trendChart .star").count() === 1, "week view: one star (Tue's 55 beat the earlier best of 50)");
    ok(await page.locator("#trendChart .tline").count() === 1 && await page.locator("#trendChart .aline").count() === 1, "week view: solid target line and dashed average line");
    await shot(page, `${size.name}-week`);
    await page.click('[data-act="tview"][data-v="M"]'); await shot(page, `${size.name}-month`);
    ok((await page.textContent(".tgread")).includes("Weekly average"), "month view shows weekly totals");
    await page.click('[data-act="tview"][data-v="Y"]'); await page.click('[data-act="tbar"][data-i="10"]'); await shot(page, `${size.name}-year`);
    ok((await page.textContent(".tgread")).includes("November 2026"), "tapping a bar shows its month");
    await page.click('[data-act="tview"][data-v="W"]');

    // logging updates the goal card, chart and XP straight away; hitting the target adds the bonus
    const state = () => page.evaluate(() => ({ xp: totalXP(), today: exDone(day(todayKey()), exById("burpees")), tile: document.querySelector(".tgtile b").textContent, read: document.querySelector(".tgread b").textContent, fav: document.querySelector('.favbtn[data-ex="burpees"] small').textContent }));
    const s0 = await state();
    ok(s0.fav.includes("30 / 50"), "big button tile shows today's target (30 / 50)");
    await page.click('[data-act="addn"][data-n="10"]');
    const s1 = await state();
    ok(s1.tile.startsWith("40") && s1.read !== s0.read && s1.xp - s0.xp === 20, "+10 updates the goal card and the chart average at once (+20 XP)");
    await page.click('[data-act="addn"][data-n="10"]');
    const s2 = await state(), toastTxt = await page.textContent("#toast");
    ok(s2.today === 50 && s2.xp - s1.xp === 20 + 50, "reaching 50 adds the +50 XP target bonus");
    ok(/Daily target hit! \+50 XP/.test(toastTxt), "toast says the daily target was hit");
    ok((await page.textContent(".tgtile .note")).includes("Hit!"), "goal card says Hit!");
    await scrollTo(page, ".tgpanel"); await shot(page, `${size.name}-hit`);
    await page.click('[data-act="undo"]');
    const s3 = await state();
    ok(s3.today === 40 && s3.xp === s1.xp, "undo takes the set and the bonus back");
    await ctx.close();

    // dark mode, and a date after the stretch date
    { const { ctx, page } = await open(browser, size, { dark: true });
      await scrollTo(page, ".tgpanel"); await shot(page, `${size.name}-dark`); await ctx.close(); }
    { const { ctx, page } = await open(browser, size, { time: new Date("2026-12-28T15:00:00Z") });
      await page.click("summary"); await scrollTo(page, ".tgpanel");
      ok((await page.textContent(".tggoal")).includes("Date passed"), "after Dec 25 the stretch goal says Date passed");
      ok((await page.textContent(".tgtile b")).includes("/ 60"), "Dec 28 target is 60 (stepped up on Dec 14)");
      await shot(page, `${size.name}-late`); ok(await noHScroll(page), "no sideways scrolling (late)"); await ctx.close(); }
    { const { ctx, page } = await open(browser, size);
      // other exercises: no goal yet (push-ups), and a weighted one gets the chart only
      await page.click('[data-act="moreex"]'); await page.click('[data-act="pickex"][data-ex="pushups"]');
      ok(await page.isVisible('[data-act="plannew"]'), "push-ups offers Set a stepped goal");
      await scrollTo(page, ".tgpanel"); await shot(page, `${size.name}-pushups`);
      await page.click('[data-act="moreex"]'); await page.click('[data-act="pickex"][data-ex="bench"]');
      ok(await page.isVisible("#trendChart svg") && !(await page.isVisible("#tgGoal")), "bench press shows the chart without a goal card");
      ok(await noHScroll(page), "no sideways scrolling (other exercises)");
      // remove the burpee goal; it stays removed after a reload
      await page.click('[data-act="fav"][data-ex="burpees"]'); await page.click('[data-act="planedit"]'); await page.click('[data-act="plandel"]');
      await page.reload(); await page.click('.tabbtn[data-tab="move"]');
      ok(await page.isVisible('[data-act="plannew"]') && await page.evaluate(() => JSON.parse(localStorage.getItem("superhuman-day")).plans.burpees === undefined), "a removed goal stays removed after reopening");
      await ctx.close(); }
    continue;
  }
  await browser.close();
  console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
  process.exit(failures ? 1 : 0);
})();
