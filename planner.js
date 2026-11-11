// =============================================================
//  planner.js — pure schedule logic (no Firebase, fully testable)
//  Builds Gia's day around: school 6:30am–4:15pm,
//  Wushu Mon/Wed/Fri 5:00–6:30pm, wake 6am, lights out 9:30pm on school nights,
//  weekdays + Saturday morning for work, Sat afternoon + Sunday free.
//  Every evening ends with a reading + wind-down slot before lights out.
// =============================================================

// day: 0=Sun, 1=Mon ... 6=Sat  (matches JS Date.getDay())
const WUSHU_DAYS = [1, 3, 5];

// Returns the ordered blocks for a day. Study windows are where
// homework gets slotted; everything else is fixed/rest/free.
// Each block: {start, end, type, label}  (times = minutes from midnight)
function dayTemplate(day, opts = {}) {
  const T = (h, m = 0) => h * 60 + m;
  if (opts.holiday) { // marked holiday
    if (day === 0) // Sunday holiday — fully free
      return { rest: true, windows: [], note: "🎉 Holiday — enjoy your day off! A good day for a creation or a long read 📚" };
    // weekday OR Saturday holiday — use the morning to clear any pending homework, then free
    const study = { start: T(9), end: T(13), type: "study", label: "Catch up on homework" };
    return {
      windows: [study],
      fixed: [
        { start: T(8), end: T(8, 30), type: "fixed", label: "🍳 Breakfast" },
        study,
        { start: T(13), end: T(13, 30), type: "free", label: "Done! Rest of the holiday is FREE 🎉 (creation time? 🎨)" },
      ],
      note: "🎉 Holiday! Clear any pending homework this morning, then the day's all yours.",
    };
  }
  if (day === 0) { // Sunday — free
    return { rest: true, windows: [], note: "Rest & recharge — fully free day 🎉 Perfect for reading or working on a creation." };
  }
  if (day === 6) { // Saturday — morning work only
    const study = { start: T(9), end: T(13), type: "study", label: "Study / catch-up" };
    return {
      windows: [study],
      fixed: [
        { start: T(8), end: T(8, 30), type: "fixed", label: "🍳 Breakfast" },
        study,
        { start: T(13), end: T(13, 30), type: "free", label: "Done! Lunch — afternoon is FREE 🎉" },
      ],
      note: "Finish everything this morning. Saturday afternoon + all Sunday are free.",
    };
  }
  // Weekday
  const blocks = [
    { start: T(6), end: T(6, 30), type: "fixed", label: "⏰ Wake up 6am · breakfast + get ready" },
    { start: T(6, 30), end: T(16, 15), type: "fixed", label: "🎒 School" },
    { start: T(16, 15), end: T(16, 45), type: "rest", label: "Snack & rest" },
  ];
  const wushuDay = WUSHU_DAYS.includes(day);
  const classOn = wushuDay && !opts.noWushu;
  let note = "";
  if (classOn) {
    blocks.push({ start: T(17), end: T(18, 30), type: "fixed", label: "🥋 Wushu class" });
    blocks.push({ start: T(18, 30), end: T(19), type: "rest", label: "Shower & dinner" });
    blocks.push({ start: T(19), end: T(21, 15), type: "study", label: "Study" });
  } else {
    // No-Wushu evening (normal Tue/Thu, or a cancelled/missed Mon/Wed/Fri class):
    // the 5–6:30 slot becomes study time so it isn't wasted.
    if (wushuDay && opts.noWushu)
      note = "🥋 No Wushu today — the 5–6:30 slot is now study time. Get ahead, then relax.";
    blocks.push({ start: T(16, 45), end: T(18, 30), type: "study", label: wushuDay ? "Study (no Wushu today)" : "Study" });
    blocks.push({ start: T(18, 30), end: T(19, 15), type: "rest", label: "Dinner" });
    blocks.push({ start: T(19, 15), end: T(21, 15), type: "study", label: "Study (or a creation if you're caught up 🎨)" });
  }
  blocks.push({ start: T(21, 15), end: T(21, 30), type: "fixed", label: "📚 Reading + wind down" });
  blocks.push({ start: T(21, 30), end: T(21, 31), type: "fixed", label: "😴 Lights out (wake 6am = 8½ hours' sleep)" });
  return { windows: blocks.filter(b => b.type === "study"), fixed: blocks, note };
}

function fmt(min) {
  let h = Math.floor(min / 60), m = min % 60;
  const ap = h >= 12 ? "pm" : "am";
  let hh = h % 12; if (hh === 0) hh = 12;
  return m === 0 ? `${hh}${ap}` : `${hh}:${String(m).padStart(2, "0")}${ap}`;
}

// Greedily slot pending homework (sorted earliest-due first) into study windows.
// hwItems: [{subject, task, mins, due}]  -> returns {blocks, overflow}
function buildDayPlan(day, hwItems, opts = {}) {
  const tpl = dayTemplate(day, opts);
  const queue = hwItems.map(h => ({ ...h, mins: Math.max(10, h.mins || 45) }));
  const out = [];

  if (tpl.rest) {
    return { rest: true, note: tpl.note, blocks: [], overflow: [] };
  }

  const filled = {}; // index in study windows -> array of assigned task strings
  const studyWindows = (tpl.windows || []);
  studyWindows.forEach((w, idx) => { filled[idx] = []; });

  studyWindows.forEach((w, idx) => {
    let remaining = w.end - w.start;
    // insert a short break for long windows (>110 min)
    const breakBudget = remaining > 110 ? 10 : 0;
    remaining -= breakBudget;
    while (queue.length && remaining >= 20) {
      const item = queue[0];
      if (item.mins <= remaining) {
        filled[idx].push(`${item.subject}: ${item.task} (${item.mins}m)`);
        remaining -= item.mins;
        queue.shift();
      } else {
        filled[idx].push(`${item.subject}: ${item.task} — start (${remaining}m of ${item.mins}m)`);
        item.mins -= remaining;
        remaining = 0;
      }
    }
    if (breakBudget && filled[idx].length) filled[idx].push("☕ 10-min break");
  });

  (tpl.fixed || []).forEach(b => {
    if (b.type === "study") {
      const idx = studyWindows.findIndex(w => w.start === b.start);
      const tasks = idx >= 0 ? filled[idx] : [];
      out.push({
        time: `${fmt(b.start)}–${fmt(b.end)}`,
        title: b.label,
        sub: tasks.length ? tasks.join(" · ") : "Nothing pending — read, draw, or work on a creation 🎨📚",
        kind: tasks.length ? "study" : "free",
      });
    } else {
      out.push({
        time: b.end - b.start <= 1 ? fmt(b.start) : `${fmt(b.start)}–${fmt(b.end)}`,
        title: b.label,
        sub: "",
        kind: b.type,
      });
    }
  });

  return { rest: false, note: tpl.note, blocks: out, overflow: queue };
}

// Export for both browser (ES module) and Node (test)
export { buildDayPlan, dayTemplate, WUSHU_DAYS };
