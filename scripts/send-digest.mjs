// =============================================================
//  send-digest.mjs
//  Runs on a schedule (GitHub Actions) twice a week (Wed + Sun, ~7pm IST).
//  Reads the Firestore data and emails a summary to Gia + Christabel.
//
//  Needs these environment variables (set as GitHub Secrets):
//    FIREBASE_SERVICE_ACCOUNT  - the full service-account JSON (one line)
//    GMAIL_USER                - the Gmail address it sends FROM
//    GMAIL_APP_PASSWORD        - a Gmail "app password" (not your normal password)
//    MAIL_TO                   - recipients, comma-separated
// =============================================================
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const CREATIONS = { goal: 29, m1: { n: 23, by: "2026-11-13" }, by: "2026-12-31" };
const WUSHU_DAYS = [1, 3, 5];
const TZ = "Asia/Kolkata";

function need(name) {
  const v = process.env[name];
  if (!v) { console.error(`Missing env var: ${name}`); process.exit(1); }
  return v;
}

const svc = JSON.parse(need("FIREBASE_SERVICE_ACCOUNT"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

// Dates as YYYY-MM-DD in India time (the app stores local dates).
const ymd = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const addDays = (s, n) => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekday = (s) => new Date(s + "T12:00:00Z").getUTCDay();
const today = new Date();
const todayStr = ymd(today);
const esc = (s) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
const fmt = (s) => s ? new Date(s + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "";

async function getAll(name) {
  const snap = await db.collection(name).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function creationsExpected() {
  const now = new Date(todayStr + "T12:00:00Z"), m1 = new Date(CREATIONS.m1.by + "T12:00:00Z"), end = new Date(CREATIONS.by + "T12:00:00Z");
  if (now <= m1) return Math.max(0, CREATIONS.m1.n - Math.ceil((m1 - now) / (7 * 864e5)));
  if (now >= end) return CREATIONS.goal;
  return Math.round(CREATIONS.m1.n + (CREATIONS.goal - CREATIONS.m1.n) * (now - m1) / (end - m1));
}

async function build() {
  const [homework, creations, wushulog, events, books, readinglog, holidays, revsessions, revtests, revprogress] = await Promise.all([
    getAll("homework"), getAll("creations"), getAll("wushulog"), getAll("wushuevents"),
    getAll("books"), getAll("readinglog"), getAll("holidays"),
    getAll("revsessions"), getAll("revtests"), getAll("revprogress"),
  ]);
  const weekAgo = addDays(todayStr, -6);
  const isHoliday = (s) => holidays.some((h) => h.from && h.to && s >= h.from && s <= h.to);

  // ---- Homework ----
  const pending = homework.filter((h) => h.status !== "done");
  const overdue = pending.filter((h) => h.due && h.due < todayStr);
  const dueSoon = pending.filter((h) => h.due && h.due >= todayStr).sort((a, b) => a.due.localeCompare(b.due));
  const doneRecently = homework.filter((h) => h.status === "done" && h.doneAt && ymd(h.doneAt.toDate()) >= weekAgo);

  // ---- Creations ----
  const finished = creations.filter((c) => c.doneOn);
  const finishedWeek = finished.filter((c) => c.doneOn >= weekAgo && c.doneOn <= todayStr);
  const behind = creationsExpected() - finished.length;
  const count = (k) => finished.filter((c) => c[k]).length;

  // ---- Wushu (last 7 days) ----
  const log = new Map(wushulog.map((l) => [l.id, l]));
  const classes = [];
  for (let s = weekAgo; s <= todayStr; s = addDays(s, 1)) {
    if (!WUSHU_DAYS.includes(weekday(s)) || isHoliday(s)) continue;
    const st = log.get(s)?.status;
    if (st === "cancelled" || (s === todayStr && !st)) continue;
    classes.push(s);
  }
  const missedWeek = classes.filter((s) => log.get(s)?.status === "missed" && !log.get(s)?.madeUp);
  const monthStart = todayStr.slice(0, 8) + "01";
  const missedMonth = wushulog.filter((l) => l.status === "missed" && l.date >= monthStart && l.date <= todayStr);
  const nextEvent = events.filter((e) => e.date && e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date))[0];

  // ---- Reading ----
  const readDays = new Set(readinglog.map((r) => r.id));
  const readWeek = [...readDays].filter((d) => d >= weekAgo && d <= todayStr).length;
  let streak = 0, s = readDays.has(todayStr) ? todayStr : addDays(todayStr, -1);
  while (readDays.has(s)) { streak++; s = addDays(s, -1); }
  const readingNow = books.filter((b) => b.status === "reading");
  const finishedBooksWeek = books.filter((b) => b.status === "finished" && b.finishedOn >= weekAgo);

  // ---- Revision ----
  let roundsWeek = 0;
  for (const p of revprogress) for (const r of ["r1", "r2"]) if (p[r]?.done && p[r].at >= weekAgo && p[r].at <= todayStr) roundsWeek++;
  const sessDoneWeek = revsessions.filter((x) => x.done && x.doneAt >= weekAgo && x.doneAt <= todayStr);
  const sessMissed = revsessions.filter((x) => !x.done && x.date < todayStr);
  const testsNext = revtests.filter((t) => t.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date));

  // ---- Build HTML ----
  const li = (x) => `<li>${x}</li>`;
  const section = (title, body) =>
    `<hr style="border:none;border-top:1px solid #e4dcef;margin:20px 0 0" />
     <h3 style="margin:16px 0 6px;color:#5f33ad">${title}</h3>${body}`;

  const sumItems = [
    overdue.length ? `⚠️ ${overdue.length} homework overdue` : pending.length ? `📝 ${pending.length} homework pending` : "📝 Homework all clear ✅",
    `🎨 ${finished.length}/${CREATIONS.goal} creations${behind > 0 ? ` · ${behind} behind pace` : " · on pace ✅"} (${finishedWeek.length} this week)`,
    classes.length ? `🥋 Wushu: ${classes.length - missedWeek.length}/${classes.length} classes attended this week${missedWeek.length ? ` · ❌ ${missedWeek.length} missed` : ""}` : null,
    `📚 Read on ${readWeek}/7 days · ${streak}-day streak`,
    `📖 ${roundsWeek} revision round(s) and ${sessDoneWeek.length} session(s) this week${sessMissed.length ? ` · ⚠️ ${sessMissed.length} missed` : ""}`,
    testsNext.length ? `📝 Next test: ${esc(testsNext[0].name)} (${fmt(testsNext[0].date)})` : null,
    nextEvent ? `🏅 ${esc(nextEvent.name)} on ${fmt(nextEvent.date)}` : null,
  ].filter(Boolean);

  let html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#221838">
    <div style="background:#2a1a4a;color:#f2b544;padding:16px 18px;border-radius:12px">
      <div style="font-size:20px;font-weight:800">🐶 Gia's Game Plan — twice-weekly update</div>
      <div style="opacity:.85;font-size:13px;color:#e8defa">${fmt(todayStr)}</div>
    </div>
    <div style="background:#f6f2fb;border:1px solid #e4dcef;border-radius:10px;padding:12px 14px;margin-top:14px;font-size:14px">
      <b>📋 Gia's snapshot</b>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:1.6">${sumItems.map(li).join("")}</ul>
    </div>`;

  let hwBody = "";
  if (overdue.length) hwBody += `<p style="color:#c0392b;font-weight:700">⚠️ Overdue (${overdue.length}):</p><ul>${overdue.map((h) => li(`${esc(h.subject)}: ${esc(h.task)} <em>(due ${fmt(h.due)})</em>`)).join("")}</ul>`;
  if (dueSoon.length) hwBody += `<p style="font-weight:700">📌 Coming up:</p><ul>${dueSoon.slice(0, 8).map((h) => li(`${esc(h.subject)}: ${esc(h.task)} <em>(due ${fmt(h.due)})</em>`)).join("")}</ul>`;
  hwBody += `<p>✅ ${doneRecently.length} homework task(s) completed in the last 7 days.</p>`;
  html += section("📝 Homework", hwBody);

  html += section("🎨 Creations: feelings collection", `
    <p><b>${finished.length}/${CREATIONS.goal}</b> finished (goal: ${CREATIONS.m1.n} by 13 Nov, ${CREATIONS.goal} by 31 Dec) · ${behind > 0 ? `<b style="color:#c0392b">${behind} behind pace</b>` : "on pace ✅"}</p>
    <p>On Next: ${count("next")} · In weekly wins: ${count("wins")} · On Substack: ${count("substack")}</p>
    ${finishedWeek.length ? `<ul>${finishedWeek.map((c) => li(`${esc(c.title)} <em>(${esc(c.type || "")}${c.emotion ? ", " + esc(c.emotion) : ""})</em>${c.skill ? ` · 🌱 ${esc(c.skill)}` : ""}`)).join("")}</ul>` : "<p>No new creations finished this week.</p>"}`);

  html += section("🥋 Wushu", `
    <p>${classes.length ? `Attended <b>${classes.length - missedWeek.length}/${classes.length}</b> classes in the last 7 days.` : "No classes in the last 7 days."}</p>
    ${missedMonth.length ? `<p>❌ Missed this month: <b>${missedMonth.length}</b> (${missedMonth.map((m) => `${fmt(m.date)} – ${esc(m.reason)}${m.madeUp ? ", made up" : ""}`).join("; ")})</p>` : "<p>✅ No classes missed this month.</p>"}
    ${nextEvent ? `<p>🏅 Next: ${esc(nextEvent.name)} on ${fmt(nextEvent.date)}</p>` : ""}`);

  html += section("📚 Reading", `
    <p>Read on <b>${readWeek}/7</b> days · ${streak}-day streak.</p>
    ${readingNow.length ? `<p>Reading now: ${readingNow.map((b) => `<i>${esc(b.title)}</i>`).join(", ")}</p>` : ""}
    ${finishedBooksWeek.length ? `<p>🎉 Finished: ${finishedBooksWeek.map((b) => `<i>${esc(b.title)}</i>`).join(", ")}</p>` : ""}`);

  let rBody = `<p>This week: <b>${roundsWeek}</b> topic round(s), <b>${sessDoneWeek.length}</b> planned session(s) done.</p>`;
  if (sessMissed.length) rBody += `<p style="color:#c0392b;font-weight:700">⚠️ Missed: ${sessMissed.map((x) => `${esc(x.title)} (${fmt(x.date)})`).join("; ")}</p>`;
  if (testsNext.length) rBody += `<p>📝 Tests: ${testsNext.slice(0, 4).map((t) => `${esc(t.name)} (${fmt(t.date)})`).join("; ")}</p>`;
  html += section("📖 Revision", rBody);

  html += `<p style="margin-top:20px;font-size:12px;color:#8a7aa6">Sent automatically from Gia's Game Plan. Open the app to update anything.</p></div>`;
  return { html, summary: `${pending.length} HW pending, ${finished.length}/${CREATIONS.goal} creations, read ${readWeek}/7 days` };
}

async function main() {
  const { html, summary } = await build();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: need("GMAIL_USER"), pass: need("GMAIL_APP_PASSWORD") },
  });
  const info = await transporter.sendMail({
    from: `"Gia's Game Plan" <${process.env.GMAIL_USER}>`,
    to: need("MAIL_TO"),
    subject: `🐶 Game Plan update — ${summary}`,
    html,
  });
  console.log("Sent:", info.messageId);
}

main().catch((e) => { console.error(e); process.exit(1); });
