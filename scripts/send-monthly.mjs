// =============================================================
//  send-monthly.mjs — monthly progress report to Gia + Christabel.
//  Runs on the 1st of each month (GitHub Actions) and reports the
//  month just finished: weekly scores, streaks, badges, belts, goals.
//  Uses the same secrets as the twice-weekly digest.
// =============================================================
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const CREATIONS_GOAL = 29;
const SEASON = { creations: 29, hw: 100, wushu: 60, revision: 30 };
const TZ = "Asia/Kolkata";

const QUOTES = [
  ["Creativity takes courage.", "Henri Matisse"],
  ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
  ["You can't use up creativity. The more you use, the more you have.", "Maya Angelou"],
  ["Fall seven times, stand up eight.", "Japanese proverb"],
];

function need(name) { const v = process.env[name]; if (!v) { console.error("Missing env var: " + name); process.exit(1); } return v; }

const svc = JSON.parse(need("FIREBASE_SERVICE_ACCOUNT"));
admin.initializeApp({ credential: admin.credential.cert(svc) });
const db = admin.firestore();

const ymd = (d) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const esc = (s) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
async function getAll(name) { const s = await db.collection(name).get(); return s.docs.map((d) => ({ id: d.id, ...d.data() })); }

async function build() {
  const now = new Date();
  const ref = new Date(now); ref.setDate(0); // last day of previous month
  const ms = ymd(new Date(ref.getFullYear(), ref.getMonth(), 1, 12));
  const me = ymd(new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 12));
  const monthName = new Date(ms + "T12:00:00Z").toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  const [creations, homework, weeklog, wushulog, readinglog, books] = await Promise.all([
    getAll("creations"), getAll("homework"), getAll("weeklog"), getAll("wushulog"), getAll("readinglog"), getAll("books"),
  ]);
  const inMonth = (s) => s && s >= ms && s <= me;

  const finished = creations.filter((c) => c.doneOn);
  const crMonth = finished.filter((c) => inMonth(c.doneOn));
  const skillsMonth = crMonth.filter((c) => c.skill);

  const hwOnTime = (h) => h.status === "done" && (!h.due || !(h.doneAt && h.doneAt.toDate) || ymd(h.doneAt.toDate()) <= h.due);
  const hwMonth = homework.filter((h) => hwOnTime(h) && h.doneAt && inMonth(ymd(h.doneAt.toDate()))).length;
  const hwTotal = homework.filter(hwOnTime).length;

  const weeksMonth = weeklog.filter((w) => inMonth(w.weekStart));
  const weeksOnTarget = weeksMonth.filter((w) => w.onTarget).length;
  const avgScore = weeksMonth.length ? (weeksMonth.reduce((s, w) => s + (w.rating || 0), 0) / weeksMonth.length).toFixed(1) : "—";
  const wushuMonth = weeksMonth.reduce((s, w) => s + (w.wushu || 0), 0);
  const missedMonth = wushulog.filter((l) => l.status === "missed" && inMonth(l.date));
  const readMonth = readinglog.filter((r) => inMonth(r.id)).length;
  const booksMonth = books.filter((b) => b.status === "finished" && inMonth(b.finishedOn));

  const seasonWushu = weeklog.reduce((s, w) => s + (w.wushu || 0), 0);
  const seasonRevision = weeklog.reduce((s, w) => s + (w.revision || 0), 0);
  const fr = (a, b) => Math.min(1, a / b);
  const overall = Math.round(((fr(finished.length, SEASON.creations) + fr(hwTotal, SEASON.hw) + fr(seasonWushu, SEASON.wushu) + fr(seasonRevision, SEASON.revision)) / 4) * 100);

  const sorted = [...weeklog].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  let streak = 0; for (const w of sorted) { if (w.onTarget) streak++; else break; }
  const streakBadges = [["🥋 First Bow", weeklog.some((w) => w.onTarget)], ["🔥 Steady Stance", streak >= 3], ["💯 Perfect Form", weeklog.some((w) => (w.rating || 0) >= 10)], ["🐶 Top Dog", streak >= 6]];
  const belts = [["White belt", 20], ["Yellow belt", 40], ["Green belt", 60], ["Blue belt", 80], ["Black belt", 100]];
  const belt = belts.filter(([, p]) => overall >= p).slice(-1)[0]?.[0] || "no belt yet";

  const [qt, qa] = QUOTES[new Date(ms + "T12:00:00Z").getUTCMonth() % QUOTES.length];
  const hr = `<hr style="border:none;border-top:1px solid #e4dcef;margin:20px 0 0" />`;
  const li = (s) => `<li>${s}</li>`;

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#221838">
    <div style="background:#2a1a4a;color:#f2b544;padding:16px 18px;border-radius:12px">
      <div style="font-size:20px;font-weight:800">🐶 Gia's monthly report — ${esc(monthName)}</div>
      <div style="font-size:13px;color:#e8defa">How the month went</div>
    </div>
    <div style="background:#f6f2fb;border:1px solid #e4dcef;border-radius:10px;padding:12px 14px;margin-top:14px;font-size:14px">
      <b>📋 Month at a glance</b>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:1.6">
        ${li(`⭐ Weekly score: average ${avgScore}/10 · ${weeksOnTarget}/${weeksMonth.length} weeks on target`)}
        ${li(`🎨 Creations: ${crMonth.length} made this month · ${finished.length}/${CREATIONS_GOAL} in total`)}
        ${li(`🥋 Wushu: ${wushuMonth} classes attended · ${missedMonth.length} missed`)}
        ${li(`📚 Read on ${readMonth} days · ${booksMonth.length} book(s) finished`)}
        ${li(`📝 Homework done on time: ${hwMonth} this month`)}
        ${li(`🏆 Overall: ${overall}% — ${esc(belt)}`)}
      </ul>
    </div>
    ${crMonth.length ? `${hr}<h3 style="margin:16px 0 6px;color:#5f33ad">🎨 This month's creations</h3><ul style="font-size:14px">${crMonth.map((c) => li(`${esc(c.title)} <em>(${esc(c.type || "")}${c.emotion ? ", " + esc(c.emotion) : ""})</em> ${c.substack ? "· on Substack ✅" : "· not on Substack yet"}`)).join("")}</ul>` : ""}
    ${skillsMonth.length ? `<p style="font-size:14px">🌱 Skills grown: ${skillsMonth.map((c) => esc(c.skill)).join("; ")}</p>` : ""}
    ${hr}<h3 style="margin:16px 0 6px;color:#5f33ad">🏅 Badges</h3>
    <p style="font-size:14px">${streakBadges.map(([n, on]) => `${on ? "✅" : "🔒"} ${n}`).join("&nbsp;&nbsp;")}</p>
    <p style="font-size:14px">Belt: <b>${esc(belt)}</b> (${overall}% of overall goals). Current streak: <b>${streak}</b> week(s) 🔥</p>
    ${hr}<p style="font-size:14px;font-style:italic;color:#4a3a66">“${esc(qt)}” — ${esc(qa)}</p>
    <p style="margin-top:18px;font-size:12px;color:#8a7aa6">Sent automatically from Gia's Game Plan.</p>
  </div>`;

  return { html, subject: `🐶 Gia's monthly report — ${monthName} (${overall}% of goals)` };
}

async function main() {
  const { html, subject } = await build();
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: need("GMAIL_USER"), pass: need("GMAIL_APP_PASSWORD") } });
  const info = await transporter.sendMail({ from: `"Gia's Game Plan" <${process.env.GMAIL_USER}>`, to: need("MAIL_TO"), subject, html });
  console.log("Sent:", info.messageId);
}
main().catch((e) => { console.error(e); process.exit(1); });
