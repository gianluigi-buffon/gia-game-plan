// =============================================================
//  app.js — Firebase wiring + UI for Gia's Game Plan
// =============================================================
import { firebaseConfig, PEOPLE } from "./firebase-config.js";
import { buildDayPlan, WUSHU_DAYS } from "./planner.js?v=1";
import { initRevision, sessionsFor, upcomingTests, overdueSessions, paceSummary, revisionCount, progressHtml as revisionProgressHtml, subjectName, openSubject as openRevisionSubject, render as renderRevision } from "./revision/revision.js?v=2";
import { SUBJECTS, SUBJECT_GROUPS } from "./revision/syllabus.js?v=2";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, addDoc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc, onSnapshot, query, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const DEMO = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has("demo");
const CONFIGURED = DEMO || !!firebaseConfig.apiKey;
let auth = null, db = null;
if (CONFIGURED) {
  const fb = initializeApp(firebaseConfig);
  auth = getAuth(fb);
  db = getFirestore(fb);
}

// ---------- small helpers (defined before any load-time code uses them) ----------
const nameFor = (email) => PEOPLE[email] || (email ? email.split("@")[0] : "someone");
// Local calendar date (not UTC), so early-morning IST doesn't count as yesterday.
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayStr = () => ymd(new Date());
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return ymd(d); };
const esc = (s) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
function fmtT(hhmm) { if (!hhmm) return ""; const [h, m] = hhmm.split(":").map(Number); const ap = h >= 12 ? "pm" : "am"; let hh = h % 12; if (hh === 0) hh = 12; return m ? `${hh}:${String(m).padStart(2, "0")}${ap}` : `${hh}${ap}`; }
function fmtDate(s) { if (!s) return ""; const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function fmtDayMonth(s) { if (!s) return ""; const d = new Date(s + "T00:00:00"); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function mondayOf(d) { const x = new Date(d); const k = (x.getDay() + 6) % 7; x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - k); return x; }
const dayOfYear = () => Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
const rows = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let ME = null;
let MY_NAME = "";
let progressCache = null;
let progressTimer = null;
// Login emails come from PEOPLE in firebase-config.js (the one place they're listed).
const emailFor = (name) => Object.keys(PEOPLE).find(e => PEOPLE[e] === name) || "";
const MUM_EMAIL = emailFor("Christabel");
const isMum = () => !!ME && ME.email === MUM_EMAIL;
const cache = {
  homework: [], creations: [], wushu: new Map(), events: [], routines: [], dailylog: {},
  books: [], reading: new Map(), holidays: [],
};
const isHoliday = (dateStr) => cache.holidays.some(h => h.from && h.to && dateStr >= h.from && dateStr <= h.to);

// ---------- CREATIONS GOAL ----------
// Gia's commitment: 29 creations on the theme of feelings, 1 per week:
// 23 by Nov 13 (Guns N' Roses concert), 29 by Dec 31.
const CREATIONS = { goal: 29, m1: { n: 23, by: "2026-11-13" }, by: "2026-12-31" };
const MISSION = "Collection of Creations (Sketches, Mixed Media Art, Poems, Short Stories etc.) around the theme of feelings (Emotions) which I will compile into a physical art book and publish in my private Substack. I will create each of these in the best way I can, learning new skills and getting better at my art as well as my time management along the way.";
const isFinished = (c) => !!c.doneOn;
const finishedCreations = () => cache.creations.filter(isFinished);
// Expected finished count today: 1/week leading up to 23 by Nov 13, then a ramp to 29 by Dec 31.
function creationsExpected(dateStr = todayStr()) {
  const now = new Date(dateStr + "T12:00:00");
  const m1 = new Date(CREATIONS.m1.by + "T12:00:00"), end = new Date(CREATIONS.by + "T12:00:00");
  if (now <= m1) return Math.max(0, CREATIONS.m1.n - Math.ceil((m1 - now) / (7 * 864e5)));
  if (now >= end) return CREATIONS.goal;
  return Math.round(CREATIONS.m1.n + (CREATIONS.goal - CREATIONS.m1.n) * (now - m1) / (end - m1));
}

// ---------- WUSHU ----------
// wushulog/{YYYY-MM-DD}: {status: attended|missed|cancelled|rescheduled, reason, note, madeUp, madeUpOn, toDate, from, to}
const MISS_REASONS = ["Sick", "Homework or exams", "School event", "Travel", "Other"];
const wuLog = (date) => cache.wushu.get(date);
const isWushuDay = (dateStr) => WUSHU_DAYS.includes(new Date(dateStr + "T12:00:00").getDay());
// First day the app was used: unmarked classes before it aren't counted.
let APP_START = todayStr();
// Class dates in a range that actually ran (Mon/Wed/Fri, not cancelled, not a holiday).
// Past classes count (from APP_START, or earlier if marked); today counts once marked.
function classDates(from, to, { includeFuture = false } = {}) {
  const out = [], t = todayStr();
  for (let s = from; s <= to; s = addDays(s, 1)) {
    if (!isWushuDay(s) || isHoliday(s)) continue;
    const st = wuLog(s)?.status;
    if (st === "cancelled") continue;
    if (!includeFuture && s > t) continue;
    if (!includeFuture && s === t && !st) continue;
    if (s < APP_START && !st) continue;
    out.push(s);
  }
  return out;
}
const attendedOn = (s) => { const l = wuLog(s); return !l || l.status !== "missed" || !!l.madeUp; };
function wushuStats(from, to) {
  const held = classDates(from, to);
  const attended = held.filter(attendedOn).length;
  return { held: held.length, attended, missed: held.length - attended, pct: held.length ? Math.round(100 * attended / held.length) : null };
}
async function setWushu(date, data) {
  if (!data) return deleteDoc(doc(db, "wushulog", date));
  return setDoc(doc(db, "wushulog", date), { date, ...data, by: ME.email, at: serverTimestamp() });
}

// ---------- READING ----------
// readinglog/{YYYY-MM-DD}: {mins, by}
function readingStreak() {
  let s = todayStr(), n = 0;
  if (!cache.reading.has(s)) s = addDays(s, -1); // today not logged yet: count from yesterday
  while (cache.reading.has(s)) { n++; s = addDays(s, -1); }
  return n;
}
const readDaysBetween = (from, to) => [...cache.reading.keys()].filter(d => d >= from && d <= to).length;

// ---------- DAILY QUOTE ----------
// Art, writing, reading and martial-arts quotes, plus "Studio wisdom" mantras.
const QUOTES = [
  ["Creativity takes courage.", "Henri Matisse"],
  ["You can't use up creativity. The more you use, the more you have.", "Maya Angelou"],
  ["There is no greater agony than bearing an untold story inside you.", "Maya Angelou"],
  ["Art enables us to find ourselves and lose ourselves at the same time.", "Thomas Merton"],
  ["Inspiration exists, but it has to find you working.", "Pablo Picasso"],
  ["Every child is an artist. The problem is how to remain an artist once we grow up.", "Pablo Picasso"],
  ["Have no fear of perfection — you'll never reach it.", "Salvador Dalí"],
  ["I dream my painting and I paint my dream.", "Vincent van Gogh"],
  ["Great things are done by a series of small things brought together.", "Vincent van Gogh"],
  ["If you hear a voice within you say you cannot paint, then by all means paint, and that voice will be silenced.", "Vincent van Gogh"],
  ["Colour is my day-long obsession, joy and torment.", "Claude Monet"],
  ["Painting is poetry that is seen rather than felt, and poetry is painting that is felt rather than seen.", "Leonardo da Vinci"],
  ["Learning never exhausts the mind.", "Leonardo da Vinci"],
  ["Fill your paper with the breathings of your heart.", "William Wordsworth"],
  ["Hope is the thing with feathers that perches in the soul.", "Emily Dickinson"],
  ["Write hard and clear about what hurts.", "Ernest Hemingway"],
  ["Start writing, no matter what. The water does not flow until the faucet is turned on.", "Louis L'Amour"],
  ["Imagination is more important than knowledge.", "Albert Einstein"],
  ["I am not afraid of storms, for I am learning how to sail my ship.", "Louisa May Alcott"],
  ["It's no use going back to yesterday, because I was a different person then.", "Lewis Carroll"],
  ["Not all those who wander are lost.", "J.R.R. Tolkien"],
  ["All we have to decide is what to do with the time that is given us.", "J.R.R. Tolkien"],
  ["A reader lives a thousand lives before he dies.", "George R.R. Martin"],
  ["The more that you read, the more things you will know.", "Dr. Seuss"],
  ["Today you are You, that is truer than true. There is no one alive who is Youer than You.", "Dr. Seuss"],
  ["Some day you will be old enough to start reading fairy tales again.", "C.S. Lewis"],
  ["I fear not the man who has practised 10,000 kicks once, but the man who has practised one kick 10,000 times.", "Bruce Lee"],
  ["Absorb what is useful, discard what is useless, add what is specifically your own.", "Bruce Lee"],
  ["Knowing is not enough, we must apply. Willing is not enough, we must do.", "Bruce Lee"],
  ["Be water, my friend.", "Bruce Lee"],
  ["Mistakes are always forgivable, if one has the courage to admit them.", "Bruce Lee"],
  ["Fall seven times, stand up eight.", "Japanese proverb"],
  ["The journey of a thousand miles begins with one step.", "Lao Tzu"],
  ["One must still have chaos in oneself to be able to give birth to a dancing star.", "Friedrich Nietzsche"],
  ["Make one thing today, even if it's small.", "Studio wisdom"],
  ["Feelings are paint. Use all the colours.", "Studio wisdom"],
  ["Done is better than perfect — finished pieces teach you more.", "Studio wisdom"],
  ["Every sketch is practice for the next one.", "Studio wisdom"],
  ["Your style is hiding in your mistakes.", "Studio wisdom"],
  ["Ten minutes of drawing beats an hour of waiting to feel ready.", "Studio wisdom"],
  ["Write it messy first; make it beautiful later.", "Studio wisdom"],
  ["Notice how you feel — that's where the art starts.", "Studio wisdom"],
  ["A blank page is just a page that hasn't met you yet.", "Studio wisdom"],
  ["Small steps every week fill a whole book.", "Studio wisdom"],
  ["Try one new thing in every piece.", "Studio wisdom"],
  ["Be brave with the first line.", "Studio wisdom"],
  ["Discipline is choosing what you want most over what you want now.", "Dojo wisdom"],
  ["Stance first, then strength.", "Dojo wisdom"],
  ["Slow is smooth, smooth is fast.", "Dojo wisdom"],
  ["Show up — especially on the days you don't feel like it.", "Dojo wisdom"],
  ["Breathe, focus, begin.", "Dojo wisdom"],
  ["Repetition turns effort into ease.", "Dojo wisdom"],
  ["Your only competition is who you were yesterday.", "Dojo wisdom"],
  ["Consistency beats intensity.", "Dojo wisdom"],
  ["A calm mind makes a strong body.", "Dojo wisdom"],
  ["Bow in with focus, bow out with pride.", "Dojo wisdom"],
  ["Rest is part of training.", "Dojo wisdom"],
  ["Protect your sleep like a black belt protects her guard.", "Dojo wisdom"],
  ["One chapter a night adds up to a library.", "Reader's wisdom"],
  ["Read what you love until you love to read.", "Reader's wisdom"],
  ["Plan the week, then work the plan.", "Planner's wisdom"],
  ["Finish homework early; enjoy your evening twice.", "Planner's wisdom"],
  ["Hard things get easier when you start them sooner.", "Planner's wisdom"],
  ["Win the day, and the week takes care of itself.", "Planner's wisdom"],
];
// Inspirational Bible verses (shown on 3 days/week; quotes on the other 4)
const VERSES = [
  ["I can do all things through Christ who strengthens me.", "Philippians 4:13"],
  ["Be strong and courageous. Do not be afraid, for the Lord your God is with you wherever you go.", "Joshua 1:9"],
  ["Whatever you do, work at it with all your heart.", "Colossians 3:23"],
  ["Let us run with perseverance the race marked out for us.", "Hebrews 12:1"],
  ["Those who hope in the Lord will renew their strength; they will run and not grow weary.", "Isaiah 40:31"],
  ["Commit to the Lord whatever you do, and your plans will succeed.", "Proverbs 16:3"],
  ["The Lord is my strength and my shield; my heart trusts in him.", "Psalm 28:7"],
  ["For I know the plans I have for you — plans to give you hope and a future.", "Jeremiah 29:11"],
  ["Trust in the Lord with all your heart, and lean not on your own understanding.", "Proverbs 3:5"],
  ["Whoever is faithful in little will be faithful in much.", "Luke 16:10"],
  ["Let us not become weary in doing good, for in due time we will reap a harvest.", "Galatians 6:9"],
  ["He gives strength to the weary and increases the power of the weak.", "Isaiah 40:29"],
  ["Whatever your hand finds to do, do it with all your might.", "Ecclesiastes 9:10"],
  ["Be strong, and let your heart take courage.", "Psalm 31:24"],
  ["Cast all your anxiety on him, because he cares for you.", "1 Peter 5:7"],
  ["A cheerful heart is good medicine.", "Proverbs 17:22"],
  ["Encourage one another and build each other up.", "1 Thessalonians 5:11"],
  ["Whatever is true, whatever is noble, whatever is right — think about such things.", "Philippians 4:8"],
  ["I praise you because I am fearfully and wonderfully made.", "Psalm 139:14"],
  ["Do everything in love.", "1 Corinthians 16:14"],
  ["Let your light shine before others.", "Matthew 5:16"],
  ["Be joyful in hope, patient in affliction, faithful in prayer.", "Romans 12:12"],
  ["The Lord gives wisdom; from his mouth come knowledge and understanding.", "Proverbs 2:6"],
  ["She is clothed with strength and dignity; she can laugh at the days to come.", "Proverbs 31:25"],
];
// Tue/Thu/Sat = verse days (3/week); the other 4 days = quotes.
function quoteOfDay() {
  const day = dayOfYear();
  return [2, 4, 6].includes(new Date().getDay()) ? VERSES[day % VERSES.length] : QUOTES[day % QUOTES.length];
}

// date string of the n-th upcoming school day (Mon–Fri), today included
function workingHorizon(n = 2) {
  const d = new Date(); d.setHours(12, 0, 0, 0);
  let c = 0;
  for (let i = 0; i < 21; i++) {
    const wd = d.getDay();
    if (wd >= 1 && wd <= 5) { c++; if (c >= n) return ymd(d); }
    d.setDate(d.getDate() + 1);
  }
  return ymd(d);
}
// Homework must be finished in advance: by the school day before it's due,
// or at the latest the previous Saturday (if the day-before falls on Sunday).
function effectiveDue(dueStr) {
  if (!dueStr) return "";
  const d = new Date(dueStr + "T12:00:00");
  d.setDate(d.getDate() - 1);
  if (d.getDay() === 0) d.setDate(d.getDate() - 1); // Sunday → Saturday
  return ymd(d);
}

// ---------- AUTH ----------
if (!CONFIGURED) {
  $("loginScreen").classList.remove("hidden");
  $("setupNote").classList.remove("hidden");
} else {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      ME = user;
      MY_NAME = nameFor(user.email);
      $("loginScreen").classList.add("hidden");
      $("app").classList.remove("hidden");
      $("whoami").textContent = MY_NAME;
      await ensureSeed();
      subscribeAll();
      initRevision({
        db, me: () => ME, nameFor, isParent: isMum,
        fs: { collection, doc, addDoc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, serverTimestamp },
        onChange: () => { renderToday(); renderDashboard(); scheduleProgress(); },
      });
    } else {
      ME = null;
      $("app").classList.add("hidden");
      $("loginScreen").classList.remove("hidden");
    }
  });
}

$("loginBtn").onclick = async () => {
  if (!CONFIGURED) return;
  try {
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
  } catch (e) { $("loginMsg").textContent = friendlyErr(e); }
};
$("forgotBtn").onclick = async () => {
  if (!CONFIGURED) return;
  const email = $("email").value.trim();
  $("loginMsg").textContent = ""; $("loginInfo").textContent = "";
  if (!email) { $("loginMsg").textContent = "Type your email above first, then tap Forgot password."; return; }
  try {
    await sendPasswordResetEmail(auth, email);
    $("loginInfo").textContent = `If ${email} has an account, a reset link is on its way. Check spam, and use only the newest email: each new request cancels the older links.`;
  } catch (e) { $("loginMsg").textContent = friendlyErr(e); }
};
$("logoutBtn").onclick = () => auth && signOut(auth);
function friendlyErr(e) {
  const m = (e.code || "").replace("auth/", "").replace(/-/g, " ");
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : "Something went wrong";
}

// ---------- TABS ----------
function activateTab(name) {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(x => x.classList.remove("active"));
  const panel = $("tab-" + name); if (panel) panel.classList.add("active");
  if (name === "progress") loadProgress();
  if (name === "home") renderDashboard();
  if (name === "revision") renderRevision();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tab").forEach(t => { t.onclick = () => activateTab(t.dataset.tab); });

// ---------- SEED defaults on first run ----------
async function ensureSeed() {
  const metaRef = doc(db, "meta", "seeded");
  try {
    const snap = await getDoc(metaRef);
    if (snap.exists()) { const at = snap.data().at; if (at && at.toDate) APP_START = ymd(at.toDate()); return; }
    await setDoc(metaRef, { at: serverTimestamp() }); // claim first so two devices don't both seed
    const practice = ["Stretching (10 min)", "Basic stances (horse, bow)", "Kicks and punches drill", "Practise my form (taolu)"];
    for (const p of practice) await addDoc(collection(db, "routines"), { title: p, kind: "practice" });
  } catch (e) { console.warn("seed skipped", e); }
}

// ---------- LIVE SUBSCRIPTIONS ----------
function scheduleProgress() { clearTimeout(progressTimer); progressTimer = setTimeout(loadProgress, 800); }
function subscribeAll() {
  onSnapshot(query(collection(db, "homework")), s => { cache.homework = rows(s); renderHomework(); renderToday(); renderDashboard(); scheduleProgress(); });
  onSnapshot(query(collection(db, "creations")), s => { cache.creations = rows(s); renderCreations(); renderDashboard(); scheduleProgress(); });
  onSnapshot(query(collection(db, "wushulog")), s => { cache.wushu = new Map(s.docs.map(d => [d.id, d.data()])); renderWushu(); renderToday(); renderDashboard(); scheduleProgress(); });
  onSnapshot(query(collection(db, "wushuevents")), s => { cache.events = rows(s); renderEvents(); renderToday(); renderDashboard(); });
  onSnapshot(query(collection(db, "routines")), s => { cache.routines = rows(s); renderPractice(); });
  onSnapshot(doc(db, "dailylog", todayStr()), s => { cache.dailylog = s.exists() ? s.data() : {}; renderPractice(); });
  onSnapshot(query(collection(db, "books")), s => { cache.books = rows(s); renderReading(); renderDashboard(); });
  onSnapshot(query(collection(db, "readinglog")), s => { cache.reading = new Map(s.docs.map(d => [d.id, d.data()])); renderReading(); renderDashboard(); });
  onSnapshot(query(collection(db, "holidays")), s => { cache.holidays = rows(s); renderToday(); renderWushu(); });
  loadProgress();
}

// ---------- TODAY / PLAN ----------
(function fillDaySelect() {
  const sel = $("planDay");
  for (let i = 0; i < 7; i++) {
    const ds = addDays(todayStr(), i);
    const o = document.createElement("option");
    o.value = ds;
    o.textContent = i === 0 ? `Today · ${fmtDate(ds)}` : fmtDate(ds);
    sel.appendChild(o);
  }
  sel.onchange = renderToday;
})();

function pendingHw() {
  return cache.homework
    .filter(h => h.status !== "done")
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
}

// Attended / Missed / Cancelled / Rescheduled controls for one class date.
function wushuControls(date) {
  const log = wuLog(date) || {};
  const st = log.status;
  const wrap = document.createElement("div");
  const row = document.createElement("div"); row.className = "stage-btns wu-btns";
  const mk = (label, cls, on, fn) => { const b = document.createElement("button"); b.textContent = label; b.className = cls + (on ? " on" : ""); b.onclick = fn; row.appendChild(b); return b; };
  const why = document.createElement("div"); why.className = "stage-btns"; why.style.display = "none";
  why.innerHTML = `<span class="muted small" style="align-self:center">Why?</span>` + MISS_REASONS.map(r => `<button data-r="${esc(r)}">${esc(r)}</button>`).join("");
  why.querySelectorAll("button").forEach(b => b.onclick = () => setWushu(date, { status: "missed", reason: b.dataset.r, note: "" }));
  const form = document.createElement("div");
  form.style.marginTop = "8px"; form.style.display = "none";
  form.innerHTML = `<div class="muted small">Moved to:</div>
    <input type="date" class="mininput" value="${log.toDate || date}" />
    <div class="grid2" style="margin-top:6px"><input type="time" class="mininput" value="${log.from || "17:00"}" /><input type="time" class="mininput" value="${log.to || "18:30"}" /></div>
    <button class="btn tiny primary" style="margin-top:8px">Save new time</button>`;
  form.querySelector("button").onclick = () => {
    const ins = form.querySelectorAll("input");
    if (!ins[0].value || !ins[1].value || !ins[2].value) return;
    setWushu(date, { status: "rescheduled", toDate: ins[0].value, from: ins[1].value, to: ins[2].value });
  };
  const future = date > todayStr();
  if (!future) mk("✅ Attended", "att", st === "attended", () => setWushu(date, st === "attended" ? null : { status: "attended" }));
  if (!future) mk("❌ Missed", "miss", st === "missed", () => { if (st === "missed") setWushu(date, null); else why.style.display = why.style.display === "none" ? "flex" : "none"; });
  mk("🚫 Cancelled", "canc", st === "cancelled", () => setWushu(date, st === "cancelled" ? null : { status: "cancelled" }));
  mk("🔁 Rescheduled", "canc", st === "rescheduled", () => { form.style.display = form.style.display === "none" ? "block" : "none"; });
  wrap.append(row, why, form);
  return wrap;
}
function wushuStatusText(date) {
  const l = wuLog(date);
  if (!l) return date > todayStr() ? "🥋 Wushu 5–6:30pm" : date === todayStr() ? "🥋 Wushu today 5–6:30pm" : "🥋 Not marked yet";
  if (l.status === "attended") return "✅ Attended Wushu";
  if (l.status === "missed") return `❌ Missed Wushu (${esc(l.reason)})${l.madeUp ? " · made up ✓" : ""}`;
  if (l.status === "cancelled") return "🚫 Class cancelled — extra study time";
  if (l.status === "rescheduled") return `🔁 Class moved to ${fmtDate(l.toDate)} · ${fmtT(l.from)}–${fmtT(l.to)}`;
  return "🥋 Wushu";
}

function renderToday() {
  if (!ME) return;
  const selDate = $("planDay").value || todayStr();
  const day = new Date(selDate + "T12:00:00").getDay();
  $("todayTitle").textContent = `${DAY_NAMES[day]} · ${fmtDayMonth(selDate)}`;
  const holiday = isHoliday(selDate);
  const wl = wuLog(selDate);
  const noWushu = !!wl && ["missed", "cancelled", "rescheduled"].includes(wl.status);
  renderHolidayBox(selDate);

  const alerts = $("dueAlerts"); alerts.innerHTML = "";
  const t = todayStr();
  const over = pendingHw().filter(h => h.due && effectiveDue(h.due) < t);
  const due = pendingHw().filter(h => h.due && effectiveDue(h.due) === t);
  if (over.length) addAlert(alerts, "red", `⚠️ ${over.length} overdue: ${over.map(h => h.subject).join(", ")}`);
  if (due.length) addAlert(alerts, "amber", `📌 Do today (due next school day): ${due.map(h => h.subject).join(", ")}`);
  if (!over.length && !due.length) addAlert(alerts, "green", "✅ Nothing overdue — nice work!");
  upcomingTests().filter(x => x.date >= selDate && x.date <= addDays(selDate, 7)).forEach(x => {
    const n = Math.round((new Date(x.date + "T12:00:00") - new Date(selDate + "T12:00:00")) / 864e5);
    addAlert(alerts, n <= 1 ? "red" : "amber", `📝 ${x.name} test ${n === 0 ? "today" : n === 1 ? "tomorrow" : "on " + fmtDate(x.date)}`);
  });
  const revToday = sessionsFor(selDate);
  if (revToday.length) addAlert(alerts, "blue", `📖 ${revToday.length} revision session${revToday.length > 1 ? "s" : ""} in the plan below. Tick them off in the Revision tab.`);
  const revMissed = overdueSessions();
  if (selDate === t && revMissed.length) addAlert(alerts, "amber", `📖 ${revMissed.length} missed revision session${revMissed.length > 1 ? "s" : ""}: catch up in the Revision tab.`);
  const ev = cache.events.filter(x => x.date >= selDate).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (ev && ev.date <= addDays(selDate, 14)) addAlert(alerts, "blue", `🏅 ${ev.name} on ${fmtDate(ev.date)}${ev.location ? " · " + ev.location : ""}`);
  if (selDate === t) {
    const behind = creationsExpected() - finishedCreations().length;
    if (behind > 0) addAlert(alerts, "amber", `🎨 ${behind} creation${behind > 1 ? "s" : ""} behind pace (${finishedCreations().length}/${CREATIONS.goal}). Use a free slot to make one.`);
  }
  for (const [orig, l] of cache.wushu) {
    if (l.status === "rescheduled" && l.toDate === selDate) addAlert(alerts, "blue", `🥋 Rescheduled Wushu today: ${fmtT(l.from)}–${fmtT(l.to)} (moved from ${fmtDate(orig)})`);
  }
  if (holiday) addAlert(alerts, "green", "🎉 Holiday — no school today!");

  if (WUSHU_DAYS.includes(day) && !holiday) {
    const box = document.createElement("div");
    box.className = "alert " + (noWushu ? "amber" : "green");
    box.innerHTML = `<div style="margin-bottom:4px">${wushuStatusText(selDate)}</div>`;
    box.appendChild(wushuControls(selDate));
    alerts.appendChild(box);
  }

  const [qt, qa] = quoteOfDay();
  $("dayQuote").innerHTML = `“${esc(qt)}”<span class="q-by">— ${esc(qa)}</span>`;

  const tl = $("timeline"); tl.innerHTML = "";
  const items = pendingHw().map(h => ({ subject: h.subject, task: h.task, mins: h.mins, due: h.due }))
    .concat(sessionsFor(selDate).map(s => ({ subject: "📖 " + subjectName(s.subject) + " revision", task: s.title, mins: s.mins || 45 })));
  const plan = buildDayPlan(day, items, { noWushu, holiday });
  if (plan.rest) {
    tl.innerHTML = `<div class="block rest"><div class="t">All day</div><div class="b">${plan.note}</div></div>`;
    return;
  }
  if (plan.note) tl.insertAdjacentHTML("beforeend", `<div class="block rest"><div class="t">Note</div><div class="b">${plan.note}</div></div>`);
  plan.blocks.forEach(b => {
    const el = document.createElement("div");
    el.className = "block " + (b.kind === "rest" ? "rest" : b.kind === "fixed" ? "fixed" : "");
    el.innerHTML = `<div class="t">${b.time}</div><div class="b">${esc(b.title)}${b.sub ? `<div class="b-sub">${esc(b.sub)}</div>` : ""}</div>`;
    tl.appendChild(el);
  });
  if (plan.overflow.length) {
    tl.insertAdjacentHTML("beforeend", `<div class="block"><div class="t">⚠️ Spillover</div><div class="b">Couldn't fit: ${plan.overflow.map(h => esc(h.subject) + " (" + h.mins + "m left)").join(", ")}<div class="b-sub">Move some to Saturday morning or start earlier.</div></div></div>`);
  }
}
function addAlert(parent, cls, txt) {
  const d = document.createElement("div"); d.className = "alert " + cls; d.textContent = txt; parent.appendChild(d);
}
function renderHolidayBox(selDate) {
  const box = $("holidayBox"); if (!box) return;
  const onHol = isHoliday(selDate);
  let html = `<div class="card add-card" style="margin-top:14px"><b>🎉 Holidays</b>
    <div class="muted small" style="margin:4px 0 8px">${onHol ? "This day is a holiday — no school 🎉" : "Mark school holidays (a single day or a longer break) so the plan gives a day off."}</div>
    <div class="grid2"><label class="mins">From<input type="date" id="holFrom" value="${selDate}" /></label><label class="mins">To<input type="date" id="holTo" value="${selDate}" /></label></div>
    <input type="text" id="holName" placeholder="Name (optional) e.g. Mid-term break" />
    <button class="btn primary" id="holAdd">Add holiday</button>`;
  if (cache.holidays.length) {
    html += `<div class="list" style="margin-top:10px">` +
      [...cache.holidays].sort((a, b) => (a.from || "").localeCompare(b.from || "")).map(h =>
        `<div class="item"><div class="item-main"><div class="item-title">${h.from === h.to ? fmtDate(h.from) : `${fmtDate(h.from)} → ${fmtDate(h.to)}`}</div>${h.name ? `<div class="item-sub">${esc(h.name)}</div>` : ""}</div><button class="del" data-id="${h.id}">✕</button></div>`).join("") +
      `</div>`;
  }
  box.innerHTML = html + `</div>`;
  $("holAdd").onclick = async () => {
    const from = $("holFrom").value; let to = $("holTo").value || from;
    if (!from) return;
    if (to < from) to = from;
    await addDoc(collection(db, "holidays"), { from, to, name: $("holName").value.trim(), by: ME.email, at: serverTimestamp() });
  };
  box.querySelectorAll(".del[data-id]").forEach(b => b.onclick = () => deleteDoc(doc(db, "holidays", b.dataset.id)));
}

// ---------- HOMEWORK ----------
const HW_SUBJECTS = SUBJECTS.map(s => s.key);
// Subject picker grouped like the Revision tab (main subjects, then languages and Art).
const subjectOptions = () => SUBJECT_GROUPS.map(g => `<optgroup label="${esc(g.label)}">${SUBJECTS.filter(s => (s.group || "main") === g.key).map(s => `<option value="${esc(s.key)}">${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
$("hwSubject").innerHTML = subjectOptions();
$("hwAdd").onclick = async () => {
  const task = $("hwTask").value.trim();
  if (!task) return;
  await addDoc(collection(db, "homework"), {
    subject: $("hwSubject").value, task, due: $("hwDue").value || "",
    mins: parseInt($("hwMins").value) || 45, status: "todo",
    addedBy: ME.email, createdAt: serverTimestamp(),
  });
  $("hwTask").value = "";
};
function buildHwEl(h) {
  const done = h.status === "done";
  const t = todayStr();
  let pill = "";
  if (!done && h.due) {
    const eff = effectiveDue(h.due);
    if (eff < t) pill = `<span class="pill over">overdue</span>`;
    else if (eff === t) pill = `<span class="pill today">do today</span>`;
    else pill = `<span class="pill soon">do by ${fmtDate(eff)}</span>`;
  }
  const sub = done
    ? `done${h.doneBy ? " by " + nameFor(h.doneBy) : ""}${h.doneAt && h.doneAt.toDate ? " · " + fmtDate(ymd(h.doneAt.toDate())) : ""}`
    : `${pill} ${h.due ? `· due ${fmtDate(h.due)}` : ""} · ${h.mins || 45} min`;
  const el = document.createElement("div");
  el.className = "item" + (done ? " done" : "");
  el.innerHTML = `
    <button class="check ${done ? "on" : ""}">${done ? "✓" : ""}</button>
    <div class="item-main">
      <div class="item-title"><span class="tag subj">${esc(subjectName(h.subject))}</span>${esc(h.task)}</div>
      <div class="item-sub">${sub}</div>
    </div>
    ${done ? "" : `<button class="edit" title="edit">✎</button>`}`;
  el.querySelector(".check").onclick = () => updateDoc(doc(db, "homework", h.id), {
    status: done ? "todo" : "done", doneBy: done ? "" : ME.email, doneAt: done ? null : serverTimestamp(),
  });
  const editBtn = el.querySelector(".edit");
  if (editBtn) editBtn.onclick = () => editHwForm(el, h);
  return el;
}
function editHwForm(el, h) {
  el.innerHTML = `<div class="item-main">
    <div class="grid2">
      <select class="select" data-f="subject">${subjectOptions()}</select>
      <input type="date" class="select" data-f="due" />
    </div>
    <input type="text" class="select" data-f="task" placeholder="Homework description" />
    <input type="number" class="select" data-f="mins" min="10" step="5" placeholder="Est. minutes" />
    <div class="stage-btns">
      <button class="btn tiny primary" data-act="save">Save</button>
      <button class="btn tiny ghost" data-act="cancel">Cancel</button>
    </div>
  </div>`;
  const f = (n) => el.querySelector(`[data-f="${n}"]`);
  f("subject").value = HW_SUBJECTS.includes(h.subject) ? h.subject : HW_SUBJECTS[0];
  f("due").value = h.due || "";
  f("task").value = h.task || "";
  f("mins").value = h.mins || 45;
  el.querySelector('[data-act="save"]').onclick = () => {
    const task = f("task").value.trim(); if (!task) return;
    updateDoc(doc(db, "homework", h.id), { subject: f("subject").value, task, due: f("due").value || "", mins: parseInt(f("mins").value) || 45 });
  };
  el.querySelector('[data-act="cancel"]').onclick = () => renderHomework();
}
function renderHomework() {
  const list = $("hwList"); list.innerHTML = "";
  const weekStart = mondayOf(new Date());
  const pending = pendingHw();
  const done = cache.homework.filter(h => h.status === "done");
  const doneThisWeek = done.filter(h => h.doneAt && h.doneAt.toDate && h.doneAt.toDate() >= weekStart).sort((a, b) => b.doneAt.toDate() - a.doneAt.toDate());
  const doneEarlier = done.filter(h => !(h.doneAt && h.doneAt.toDate && h.doneAt.toDate() >= weekStart));
  if (!pending.length) list.insertAdjacentHTML("beforeend", `<p class="muted small">${cache.homework.length ? "No homework to do right now 🎉" : "No homework yet. Add this week's tasks above 👆"}</p>`);
  pending.forEach(h => list.appendChild(buildHwEl(h)));
  list.insertAdjacentHTML("beforeend", `<h3 class="section-h">✅ Completed this week (${doneThisWeek.length})</h3>`);
  if (!doneThisWeek.length) list.insertAdjacentHTML("beforeend", `<p class="muted small">Nothing ticked off yet this week — let's change that! 💪</p>`);
  doneThisWeek.forEach(h => list.appendChild(buildHwEl(h)));
  if (doneEarlier.length) {
    list.insertAdjacentHTML("beforeend", `<h3 class="section-h">Earlier completed</h3>`);
    doneEarlier.forEach(h => list.appendChild(buildHwEl(h)));
  }
}

// ---------- CREATIONS ----------
$("crAdd").onclick = async () => {
  const title = $("crTitle").value.trim();
  if (!title) { $("crTitle").focus(); return; }
  await addDoc(collection(db, "creations"), {
    title, type: $("crType").value, emotion: $("crEmotion").value.trim(), doneOn: $("crDate").value || "",
    skill: $("crSkill").value.trim(), next: false, wins: false, substack: false,
    addedBy: ME.email, createdAt: serverTimestamp(),
  });
  ["crTitle", "crEmotion", "crDate", "crSkill"].forEach(id => $(id).value = "");
};
const DONE_STEPS = [["next", "Uploaded on Next"], ["wins", "Added to weekly wins"], ["substack", "Published on Substack"]];
function buildCreationEl(c) {
  const fin = isFinished(c);
  const allDone = fin && DONE_STEPS.every(([k]) => c[k]) && !!c.skill;
  const el = document.createElement("div");
  el.className = "item";
  const chk = (on, label, k) => `<button data-k="${k}" class="${on ? "on" : ""}">${on ? "☑" : "☐"} ${label}</button>`;
  el.innerHTML = `
    <div class="item-main">
      <div class="item-title">${allDone ? "🌟 " : ""}${esc(c.title)}</div>
      <div class="item-sub"><span class="tag cr-type">${esc(c.type || "Creation")}</span>${c.emotion ? `<span class="tag cr-emo">${esc(c.emotion)}</span>` : ""}${fin ? `finished ${fmtDate(c.doneOn)}` : `<span class="pill today">in progress</span>`}</div>
      ${c.skill ? `<div class="cr-skill">🌱 ${esc(c.skill)}</div>` : ""}
      <div class="stage-btns" style="margin-top:6px">
        ${fin ? "" : `<button data-act="finish" class="on">✓ Mark finished today</button>`}
        ${DONE_STEPS.map(([k, l]) => chk(!!c[k], l, k)).join("")}
        ${chk(!!c.skill, "Skill noted", "skill")}
      </div>
      <div class="cr-edit" style="display:none"></div>
    </div>
    <button class="edit" title="edit">✎</button>`;
  el.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (k === "skill") return openEdit();
    updateDoc(doc(db, "creations", c.id), { [k]: !c[k] });
  });
  const fb = el.querySelector('[data-act="finish"]');
  if (fb) fb.onclick = () => updateDoc(doc(db, "creations", c.id), { doneOn: todayStr() });
  const openEdit = () => {
    const box = el.querySelector(".cr-edit");
    box.style.display = "block";
    box.innerHTML = `<input class="mininput" data-f="title" placeholder="Title" />
      <div class="grid2" style="margin-top:6px">
        <select class="mininput" data-f="type">${["Sketch", "Mixed media", "Poem", "Short story", "Other"].map(x => `<option>${x}</option>`).join("")}</select>
        <input class="mininput" data-f="emotion" placeholder="Feeling" />
      </div>
      <label class="mins" style="margin-top:6px">Finished on<input type="date" class="mininput" data-f="doneOn" /></label>
      <input class="mininput" data-f="skill" placeholder="Skill learned or improved" />
      <div class="stage-btns"><button class="btn tiny primary" data-act="save">Save</button><button class="btn tiny ghost" data-act="cancel">Cancel</button><button class="btn tiny ghost" data-act="del">Delete</button></div>`;
    const f = (n) => box.querySelector(`[data-f="${n}"]`);
    f("title").value = c.title || ""; f("type").value = c.type || "Other"; f("emotion").value = c.emotion || "";
    f("doneOn").value = c.doneOn || ""; f("skill").value = c.skill || "";
    f("skill").focus();
    box.querySelector('[data-act="save"]').onclick = () => {
      const title = f("title").value.trim(); if (!title) return;
      updateDoc(doc(db, "creations", c.id), { title, type: f("type").value, emotion: f("emotion").value.trim(), doneOn: f("doneOn").value || "", skill: f("skill").value.trim() });
    };
    box.querySelector('[data-act="cancel"]').onclick = () => { box.style.display = "none"; };
    box.querySelector('[data-act="del"]').onclick = () => { if (confirm(`Delete “${c.title}”?`)) deleteDoc(doc(db, "creations", c.id)); };
  };
  el.querySelector(".edit").onclick = openEdit;
  return el;
}
function renderCreations() {
  $("missionBox").innerHTML = `“${esc(MISSION)}”<span class="q-by">— Gia</span>`;
  const fin = finishedCreations();
  const done = fin.length;
  const expected = creationsExpected();
  const t = todayStr();
  const m1Left = Math.ceil((new Date(CREATIONS.m1.by + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5);
  const endLeft = Math.ceil((new Date(CREATIONS.by + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5);
  const count = (k) => fin.filter(c => c[k]).length;
  $("crStats").innerHTML = `
    <div class="stat"><div class="n">${done}/${CREATIONS.goal}</div><div class="l">finished</div></div>
    <div class="stat"><div class="n">${Math.min(done, CREATIONS.m1.n)}/${CREATIONS.m1.n}</div><div class="l">by 13 Nov${m1Left >= 0 ? ` (${m1Left}d)` : ""}</div></div>
    <div class="stat"><div class="n">${count("next")}</div><div class="l">on Next</div></div>
    <div class="stat"><div class="n">${count("wins")}</div><div class="l">in weekly wins</div></div>
    <div class="stat"><div class="n">${count("substack")}</div><div class="l">on Substack</div></div>`;
  const pct = Math.round(100 * done / CREATIONS.goal), exp = Math.round(100 * expected / CREATIONS.goal);
  const behind = expected - done;
  $("crPace").innerHTML = `<div class="card">
    <div class="row-between"><b>🎯 ${CREATIONS.m1.n} by 13 Nov · ${CREATIONS.goal} by 31 Dec</b>${behind > 0 ? `<span class="pill over">behind by ${behind}</span>` : `<span class="pill" style="color:var(--good);background:var(--good-bg)">on pace ✓</span>`}</div>
    <div class="progress rv-pace"><div class="bar" style="width:${pct}%"></div><div class="rv-exp" style="left:${exp}%" title="where you should be today"></div></div>
    <div class="muted small">${done} finished · should be ~${expected} by today${endLeft > 0 ? ` · ${Math.max(0, CREATIONS.goal - done)} to go in ${endLeft} days` : ""}. Add the ones you've already made with their finish date so this is accurate.</div></div>`;

  const list = $("crList"); list.innerHTML = "";
  const wip = cache.creations.filter(c => !isFinished(c));
  if (!cache.creations.length) list.innerHTML = `<p class="muted small">No creations yet. Add your first one above 👆 (and any you've already finished, with the date).</p>`;
  if (wip.length) { list.insertAdjacentHTML("beforeend", `<h3 class="section-h">✏️ Working on</h3>`); wip.forEach(c => list.appendChild(buildCreationEl(c))); }
  // Finished, grouped by month (Substack publishes monthly)
  const byMonth = new Map();
  [...fin].sort((a, b) => b.doneOn.localeCompare(a.doneOn)).forEach(c => {
    const k = c.doneOn.slice(0, 7); if (!byMonth.has(k)) byMonth.set(k, []); byMonth.get(k).push(c);
  });
  if (fin.length) list.insertAdjacentHTML("beforeend", `<h3 class="section-h">✅ Finished (${done}/${CREATIONS.goal})</h3>`);
  for (const [k, items] of byMonth) {
    const label = new Date(k + "-01T12:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const pub = items.filter(c => c.substack).length;
    list.insertAdjacentHTML("beforeend", `<div class="month-h">${label} · ${items.length} made · ${pub}/${items.length} on Substack</div>`);
    items.forEach(c => list.appendChild(buildCreationEl(c)));
  }
  const skills = [...cache.creations].filter(c => c.skill).sort((a, b) => (b.doneOn || "9999").localeCompare(a.doneOn || "9999"));
  $("crSkills").innerHTML = skills.length
    ? `<div class="card"><ul class="pk-ul">${skills.map(c => `<li><b>${esc(c.skill)}</b> <span class="muted small">· ${esc(c.title)}${c.doneOn ? ", " + fmtDayMonth(c.doneOn) : ""}</span></li>`).join("")}</ul></div>`
    : `<p class="muted small">Each skill you note on a creation shows up here, so you can see how you've grown.</p>`;
}

// ---------- WUSHU TAB ----------
$("missReason").innerHTML = MISS_REASONS.map(r => `<option>${esc(r)}</option>`).join("");
$("missDate").value = todayStr();
$("missAdd").onclick = async () => {
  const date = $("missDate").value; if (!date) return;
  await setWushu(date, { status: "missed", reason: $("missReason").value, note: $("missNote").value.trim() });
  $("missNote").value = "";
};
function renderWushu() {
  if (!ME) return;
  const t = todayStr(), monthStart = t.slice(0, 8) + "01";
  const month = wushuStats(monthStart, t), q = wushuStats(addDays(t, -90), t);
  const monthName = new Date().toLocaleDateString("en-GB", { month: "long" });
  const missedAll = [...cache.wushu.values()].filter(l => l.status === "missed");
  $("wuStats").innerHTML = `
    <div class="stat"><div class="n">${month.held ? month.attended + "/" + month.held : "–"}</div><div class="l">classes in ${monthName}${month.pct !== null ? ` (${month.pct}%)` : ""}</div></div>
    <div class="stat"><div class="n" style="${month.missed ? "color:var(--amber)" : ""}">${month.missed}</div><div class="l">missed in ${monthName}</div></div>
    <div class="stat"><div class="n">${q.pct === null ? "–" : q.pct + "%"}</div><div class="l">attendance, last 3 months</div></div>
    <div class="stat"><div class="n">${missedAll.filter(l => l.madeUp).length}</div><div class="l">made up</div></div>`;

  // Recent + next classes, each with Attended / Missed / Cancelled / Rescheduled
  const box = $("wuRecent"); box.innerHTML = `<h3 class="section-h">🗓️ Recent classes</h3>`;
  const dates = [];
  for (let s = addDays(t, -14); s <= addDays(t, 6); s = addDays(s, 1)) if (isWushuDay(s) && !isHoliday(s)) dates.push(s);
  const past = dates.filter(s => s <= t).slice(-4), next = dates.find(s => s > t);
  const unmarkedNote = past.filter(s => !wuLog(s) && s < t && s >= APP_START).length;
  if (unmarkedNote) box.insertAdjacentHTML("beforeend", `<p class="muted small">${unmarkedNote} class${unmarkedNote > 1 ? "es" : ""} not marked yet: unmarked classes count as attended.</p>`);
  [...past.reverse(), next].filter(Boolean).forEach(s => {
    const c = document.createElement("div"); c.className = "item";
    c.innerHTML = `<div class="item-main"><div class="item-title">${fmtDate(s)}${s === t ? " · today" : s > t ? " · next class" : ""}</div><div class="item-sub">${wushuStatusText(s)}</div></div>`;
    c.querySelector(".item-main").appendChild(wushuControls(s));
    box.appendChild(c);
  });

  const list = $("missList"); list.innerHTML = "";
  if (!missedAll.length) { list.innerHTML = `<p class="muted small">No missed classes logged. 💪</p>`; return; }
  [...missedAll].sort((a, b) => b.date.localeCompare(a.date)).forEach(m => {
    const el = document.createElement("div"); el.className = "item" + (m.madeUp ? " done" : "");
    el.innerHTML = `<div class="item-main"><div class="item-title">${fmtDate(m.date)}</div>
      <div class="item-sub"><span class="tag">${esc(m.reason)}</span>${m.note ? esc(m.note) + " · " : ""}logged by ${esc(nameFor(m.by))}${m.madeUp ? ` · made up${m.madeUpOn ? " on " + fmtDate(m.madeUpOn) : ""} ✓` : ""}</div>
      <div class="stage-btns"><button data-act="mu" class="${m.madeUp ? "on" : ""}">${m.madeUp ? "↩︎ Not made up" : "🔁 Mark as made up"}</button></div>
      <div class="mu-form" style="display:none"><label class="mins" style="margin-top:6px">Made up on<input type="date" class="mininput" value="${t}" /></label><button class="btn tiny primary" style="margin-top:6px">Save</button></div></div>
      <button class="del" title="Remove">✕</button>`;
    const form = el.querySelector(".mu-form");
    el.querySelector('[data-act="mu"]').onclick = () => {
      if (m.madeUp) return updateDoc(doc(db, "wushulog", m.date), { madeUp: false, madeUpOn: "" });
      form.style.display = form.style.display === "none" ? "block" : "none";
    };
    form.querySelector("button").onclick = () => updateDoc(doc(db, "wushulog", m.date), { madeUp: true, madeUpOn: form.querySelector("input").value || t });
    el.querySelector(".del").onclick = () => { if (confirm(`Remove the missed class on ${fmtDate(m.date)}?`)) setWushu(m.date, null); };
    list.appendChild(el);
  });
}
$("evAdd").onclick = async () => {
  const name = $("evName").value.trim(); if (!name) return;
  await addDoc(collection(db, "wushuevents"), { name, date: $("evDate").value || "", location: $("evLoc").value.trim() });
  $("evName").value = ""; $("evLoc").value = "";
};
function renderEvents() {
  const list = $("evList"); list.innerHTML = "";
  if (!cache.events.length) { list.innerHTML = `<p class="muted small">No gradings or competitions yet. Add them when the dates are announced.</p>`; return; }
  [...cache.events].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")).forEach(x => {
    const el = document.createElement("div"); el.className = "item" + (x.date && x.date < todayStr() ? " done" : "");
    el.innerHTML = `<div class="item-main"><div class="item-title">🏅 ${esc(x.name)}</div><div class="item-sub">${x.date ? fmtDate(x.date) : "date TBD"}${x.location ? " · " + esc(x.location) : ""}</div></div><button class="del">✕</button>`;
    el.querySelector(".del").onclick = () => deleteDoc(doc(db, "wushuevents", x.id));
    list.appendChild(el);
  });
}
$("pracAdd").onclick = async () => {
  const title = $("pracNew").value.trim(); if (!title) return;
  await addDoc(collection(db, "routines"), { title, kind: "practice" });
  $("pracNew").value = "";
};
function renderPractice() {
  const list = $("pracList"); list.innerHTML = "";
  const items = cache.routines.filter(r => r.kind === "practice");
  if (!items.length) { list.innerHTML = `<p class="muted small">No practice items yet.</p>`; return; }
  items.forEach(r => {
    const log = cache.dailylog[r.id];
    const el = document.createElement("div");
    el.className = "item" + (log ? " done" : "");
    el.innerHTML = `<button class="check ${log ? "on" : ""}">${log ? "✓" : ""}</button>
      <div class="item-main"><div class="item-title">${esc(r.title)}</div>${log && log.by ? `<div class="item-sub">done by ${esc(nameFor(log.by))}</div>` : ""}</div>
      <button class="del">✕</button>`;
    el.querySelector(".check").onclick = async () => {
      const cur = { ...cache.dailylog };
      if (log) delete cur[r.id]; else cur[r.id] = { by: ME.email };
      await setDoc(doc(db, "dailylog", todayStr()), cur);
    };
    el.querySelector(".del").onclick = () => { if (confirm(`Remove “${r.title}” from the practice list?`)) deleteDoc(doc(db, "routines", r.id)); };
    list.appendChild(el);
  });
}

// ---------- READING ----------
$("bkAdd").onclick = async () => {
  const title = $("bkTitle").value.trim(); if (!title) return;
  const status = $("bkStatus").value;
  await addDoc(collection(db, "books"), {
    title, author: $("bkAuthor").value.trim(), status,
    startedOn: status === "reading" ? todayStr() : "", finishedOn: status === "finished" ? todayStr() : "",
    addedBy: ME.email, createdAt: serverTimestamp(),
  });
  $("bkTitle").value = ""; $("bkAuthor").value = "";
};
function setBook(b, status) {
  const patch = { status };
  if (status === "reading" && !b.startedOn) patch.startedOn = todayStr();
  if (status === "finished") patch.finishedOn = todayStr();
  return updateDoc(doc(db, "books", b.id), patch);
}
function buildBookEl(b) {
  const el = document.createElement("div"); el.className = "item";
  const sub = b.status === "finished" ? `finished ${fmtDate(b.finishedOn)}`
    : b.status === "reading" ? (b.startedOn ? `started ${fmtDate(b.startedOn)}` : "reading now") : "on the list";
  el.innerHTML = `<div class="item-main"><div class="item-title">${esc(b.title)}</div><div class="item-sub">${b.author ? esc(b.author) + " · " : ""}${sub}</div><div class="book-status"></div></div><button class="del" title="Remove">✕</button>`;
  const row = el.querySelector(".book-status"); row.className = "stage-btns";
  const btn = (label, fn) => { const x = document.createElement("button"); x.textContent = label; x.onclick = fn; row.appendChild(x); };
  if (b.status === "want") btn("📖 Start reading", () => setBook(b, "reading"));
  if (b.status === "reading") btn("✅ Finished it!", () => setBook(b, "finished"));
  if (b.status === "finished") [1, 2, 3, 4, 5].forEach(n => btn(n <= (b.rating || 0) ? "★" : "☆", () => updateDoc(doc(db, "books", b.id), { rating: n })));
  el.querySelector(".del").onclick = () => { if (confirm(`Remove “${b.title}”?`)) deleteDoc(doc(db, "books", b.id)); };
  return el;
}
function renderReading() {
  if (!ME) return;
  const t = todayStr(), weekStart = ymd(mondayOf(new Date())), year = t.slice(0, 4);
  const streak = readingStreak();
  const weekDays = readDaysBetween(weekStart, t);
  const finYear = cache.books.filter(b => b.status === "finished" && (b.finishedOn || "").startsWith(year));
  $("rdStats").innerHTML = `
    <div class="stat"><div class="n">${streak}🔥</div><div class="l">day reading streak</div></div>
    <div class="stat"><div class="n">${weekDays}/7</div><div class="l">days read this week</div></div>
    <div class="stat"><div class="n">${finYear.length}</div><div class="l">books finished in ${year}</div></div>`;
  const readToday = cache.reading.get(t);
  const days = []; for (let i = 0; i < 7; i++) days.push(addDays(weekStart, i));
  $("rdToday").innerHTML = `<div class="card"><div class="row-between"><b>${readToday ? `📚 Read today${readToday.mins ? ` · ${readToday.mins} min` : ""} ✓` : "📚 Did you read today?"}</b>
      <button id="rdBtn" class="btn tiny ${readToday ? "ghost" : "primary"}">${readToday ? "Undo" : "I read today"}</button></div>
      ${readToday ? "" : `<div class="stage-btns" id="rdMins"><span class="muted small" style="align-self:center">How long? (optional)</span>${[15, 20, 30, 45, 60].map(m => `<button data-m="${m}">${m} min</button>`).join("")}</div>`}
      <div class="dayrow">${days.map(d => `<span class="${cache.reading.has(d) ? "on" : ""}">${DAY_NAMES[new Date(d + "T12:00:00").getDay()].slice(0, 2)}</span>`).join("")}</div></div>`;
  const log = (mins) => setDoc(doc(db, "readinglog", t), { mins: mins || 0, by: ME.email, at: serverTimestamp() });
  $("rdBtn").onclick = () => readToday ? deleteDoc(doc(db, "readinglog", t)) : log(0);
  document.querySelectorAll("#rdMins button[data-m]").forEach(b => b.onclick = () => log(+b.dataset.m));

  const fill = (id, items, empty) => {
    const el = $(id); el.innerHTML = "";
    if (!items.length) el.innerHTML = `<p class="muted small">${empty}</p>`;
    items.forEach(b => el.appendChild(buildBookEl(b)));
  };
  fill("rdNow", cache.books.filter(b => b.status === "reading"), "Nothing on the go. Add the book you're reading below 👇");
  fill("rdWant", cache.books.filter(b => b.status === "want"), "Keep a list of books you want to read next.");
  fill("rdDone", cache.books.filter(b => b.status === "finished").sort((a, b) => (b.finishedOn || "").localeCompare(a.finishedOn || "")), "Finished books will appear here.");
}

// ---------- PROGRESS: weekly requirements, badges & belt ladder ----------
const REQ = { revision: 2, creations: 1 };
const SEASON = { creations: CREATIONS.goal, hw: 100, wushu: 60, revision: 30 };
const BADGE_DESC = {
  firstbow: "Complete one full week meeting all four requirements.",
  stance: "Stay on target 3 weeks in a row.",
  perfect: "A perfect 10/10 week — nothing missed.",
  dragon: "On target 6 weeks in a row — real consistency.",
  white: "Reach 20% of your overall goals.",
  yellow: "Reach 40% of your overall goals.",
  green: "Reach 60% of your overall goals.",
  blue: "Reach 80% of your overall goals.",
  black: "100% — every goal achieved. Black belt!",
};
const BADGE_ART = {
  firstbow: { ring: "#f2b544", face: "#3a2363", em: "🥋" },
  stance: { ring: "#ff9a5a", face: "#4a1f10", em: "🔥" },
  perfect: { ring: "#a9c1ff", face: "#1f2350", em: "💯" },
  dragon: { ring: "#c79bff", face: "#2a1052", em: "🐶" },
  white: { belt: "#f4f1ea" }, yellow: { belt: "#f5d33a" }, green: { belt: "#3fbf6a" }, blue: { belt: "#3a7bf0" }, black: { belt: "#111111" },
};
function badgeSVG(key, on) {
  const a = BADGE_ART[key];
  const op = on ? "" : ` opacity="0.45"`;
  const lock = on ? "" : `<rect x="45" y="49" width="11" height="8.5" rx="1.6" fill="#e7e0f2"/><path d="M46.8 49 V46.4 a2.7 2.7 0 0 1 5.4 0 V49" fill="none" stroke="#e7e0f2" stroke-width="1.7"/>`;
  let inner;
  if (a.belt) {
    inner = `<circle cx="32" cy="30" r="26" fill="#3b2d5a"${op}/><g${op}><rect x="8" y="25" width="48" height="9" rx="2" fill="${a.belt}" stroke="#00000055"/><path d="M28 34 L22 48 L27 48 L31 36 Z M36 34 L42 48 L37 48 L33 36 Z" fill="${a.belt}" stroke="#00000055"/><rect x="27" y="23" width="10" height="13" rx="2" fill="${a.belt}" stroke="#00000077"/></g>`;
  } else {
    inner = `<circle cx="32" cy="30" r="26" fill="${a.ring}"${op}/><circle cx="32" cy="30" r="21" fill="${a.face}"${op}/><text x="32" y="38" text-anchor="middle" font-size="22"${op}>${a.em}</text>`;
  }
  return `<svg viewBox="0 0 64 64" width="52" height="52" aria-hidden="true">${inner}${lock}</svg>`;
}
function hwOnTimeCount() {
  return cache.homework.filter(h => {
    if (h.status !== "done") return false;
    if (!h.due || !(h.doneAt && h.doneAt.toDate)) return true;
    return ymd(h.doneAt.toDate()) <= h.due;
  }).length;
}
function computeWeek(weekStart) {
  const ws = ymd(weekStart), we = addDays(ws, 6), t = todayStr();
  const overdue = cache.homework.filter(h => h.status !== "done" && h.due && h.due < t).length;
  const creations = finishedCreations().filter(c => c.doneOn >= ws && c.doneOn <= we).length;
  const revision = revisionCount(ws, t);
  // Wushu target = this week's classes that weren't cancelled (holidays excluded), max 3.
  const target = classDates(ws, we, { includeFuture: true }).length;
  const wushu = wushuStats(ws, t).attended;
  // Until revision topics are added there's nothing to tick, so that target counts as met.
  const revisionLive = paceSummary().total > 0;
  const pillars = { hw: overdue === 0, creation: creations >= REQ.creations, wushu: wushu >= target, revision: !revisionLive || revision >= REQ.revision };
  const pillarsMet = Object.values(pillars).filter(Boolean).length;
  const rating = Math.round((pillars.hw ? 2.5 : 0) + Math.min(1, creations / REQ.creations) * 2.5 + (target ? Math.min(1, wushu / target) : 1) * 2.5 + (revisionLive ? Math.min(1, revision / REQ.revision) : 1) * 2.5);
  return { pillars, pillarsMet, creations, revision, revisionLive, wushu, wushuTarget: target, overdue, rating, onTarget: pillarsMet === 4, readingDays: readDaysBetween(ws, t) };
}
async function loadProgress() {
  if (!ME) return;
  const weekStart = mondayOf(new Date());
  const week = computeWeek(weekStart);
  const weekKey = ymd(weekStart);
  try {
    await setDoc(doc(db, "weeklog", weekKey), { weekStart: weekKey, pillarsMet: week.pillarsMet, rating: week.rating, onTarget: week.onTarget, wushu: week.wushu, revision: week.revision, creations: week.creations, readingDays: week.readingDays, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) { console.warn("weeklog write failed", e); }

  const weekKeys = [];
  for (let i = 0; i < 8; i++) weekKeys.push(addDays(weekKey, -7 * i));
  let recentWeeks = [];
  try {
    const snaps = await Promise.all(weekKeys.map(k => getDoc(doc(db, "weeklog", k))));
    recentWeeks = snaps.map((s, i) => s.exists() ? s.data() : { weekStart: weekKeys[i], onTarget: false, rating: 0 });
  } catch (e) { recentWeeks = [{ ...week, weekStart: weekKey }]; }
  let streak = 0;
  for (let i = 0; i < recentWeeks.length; i++) {
    if (recentWeeks[i].onTarget) streak++;
    else if (i === 0) continue; // this week still in progress
    else break;
  }
  let seasonRevision = 0, seasonWushu = 0;
  try {
    const all = await getDocs(collection(db, "weeklog"));
    all.forEach(d => { const w = d.data(); seasonRevision += w.revision || 0; seasonWushu += w.wushu || 0; });
  } catch (e) { seasonRevision = week.revision; seasonWushu = week.wushu; }
  const creationsDone = finishedCreations().length;
  const hwOnTime = hwOnTimeCount();
  const fr = (a, b) => Math.min(1, a / b);
  const overallPct = Math.round(((fr(creationsDone, SEASON.creations) + fr(hwOnTime, SEASON.hw) + fr(seasonWushu, SEASON.wushu) + fr(seasonRevision, SEASON.revision)) / 4) * 100);

  const streakBadges = [
    { key: "firstbow", name: "First Bow", on: recentWeeks.some(w => w.onTarget) || week.onTarget, meta: "first on-target week" },
    { key: "stance", name: "Steady Stance", on: streak >= 3, meta: `${Math.min(streak, 3)}/3 weeks` },
    { key: "perfect", name: "Perfect Form", on: recentWeeks.some(w => (w.rating || 0) >= 10) || week.rating >= 10, meta: "a 10/10 week" },
    { key: "dragon", name: "Top Dog", on: streak >= 6, meta: `${Math.min(streak, 6)}/6 weeks` },
  ];
  const ladder = [
    { p: 20, key: "white", name: "White belt" }, { p: 40, key: "yellow", name: "Yellow belt" },
    { p: 60, key: "green", name: "Green belt" }, { p: 80, key: "blue", name: "Blue belt" },
    { p: 100, key: "black", name: "Black belt" },
  ].map(tr => ({ ...tr, on: overallPct >= tr.p }));
  progressCache = {
    week, streak, overallPct, streakBadges, ladder,
    ladderTier: ladder.filter(l => l.on).slice(-1)[0],
    season: { creationsDone, hwOnTime, seasonWushu, seasonRevision },
    streakUnlocked: streakBadges.filter(b => b.on).length,
  };
  renderProgress(); renderDashboard();
}
function renderProgress() {
  const statsEl = $("progStats"), detailEl = $("progDetail");
  if (!statsEl || !progressCache) return;
  const { week, streak, overallPct, streakBadges, ladder, season } = progressCache;
  const p = week.pillars;
  statsEl.innerHTML = `
    <div class="stat"><div class="n">${week.rating}/10</div><div class="l">this week's score</div></div>
    <div class="stat"><div class="n">${streak}🔥</div><div class="l">week streak</div></div>
    <div class="stat"><div class="n">${week.pillarsMet}/4</div><div class="l">targets met</div></div>
    <div class="stat"><div class="n">${overallPct}%</div><div class="l">overall goals</div></div>`;
  const chip = (ok, label) => `<span class="chip ${ok ? "on" : ""}">${ok ? "✓" : "✗"} ${label}</span>`;
  const cell = (b, sub) => `<div class="bcell ${b.on ? "" : "lock"}" data-desc="${esc(b.name)}: ${esc(BADGE_DESC[b.key])} ${b.on ? "— unlocked ✓" : "— locked 🔒"}" title="${esc(BADGE_DESC[b.key])}">${badgeSVG(b.key, b.on)}<div class="bname">${b.name}</div><div class="bmeta muted small">${sub}</div></div>`;
  const nextTier = ladder.find(l => !l.on);
  const ladderHeadline = overallPct >= 100 ? "🥋 Black belt: unlocked! 🐶"
    : overallPct === 0 ? "🥋 Your climb to black belt starts here!"
      : `🥋 Just ${nextTier.p - overallPct}% to your ${nextTier.name}!`;
  detailEl.innerHTML = `
    <div class="card"><b>🐶 How it works</b>
      <div class="muted small" style="margin-top:4px">Hit your <b>4 weekly targets</b> to push your score toward a perfect 10. Hit all four and the week is <b>on target</b>: stack those weeks for a <b>streak</b> and earn badges. Everything you finish also moves you up the belts, from white to black.</div>
    </div>
    <div class="card"><b>🎯 This week: ${week.pillarsMet}/4${week.pillarsMet === 4 ? " — on target! ✨" : ""}</b>
      <div class="chips" style="margin-top:8px">${chip(p.hw, week.overdue ? `${week.overdue} homework overdue` : "homework on time")} ${chip(p.creation, `creation ${week.creations}/${REQ.creations}`)} ${chip(p.wushu, `Wushu ${week.wushu}/${week.wushuTarget}`)} ${chip(p.revision, week.revisionLive ? `revision ${week.revision}/${REQ.revision}` : "revision (starts when topics are added)")}</div>
      <div class="muted small" style="margin-top:8px">✓ = done · ✗ = still to do. Wushu counts the classes that ran this week (cancelled ones don't count against you; made-up ones count). 📚 Read on ${week.readingDays} day${week.readingDays === 1 ? "" : "s"} this week.</div>
    </div>
    <h3 class="section-h">📖 Revision</h3>
    <div id="progRevision">${revisionProgressHtml()}</div>
    <div id="badgeInfo" class="badge-info">👆 Tap any badge to see how to unlock it.</div>
    <h3 class="section-h">🔥 Streak badges (${progressCache.streakUnlocked}/4)</h3>
    <div class="badgegrid">${streakBadges.map(b => cell(b, b.on ? "unlocked ✓" : b.meta)).join("")}</div>
    <h3 class="section-h">${ladderHeadline}</h3>
    <div class="progress"><div style="width:${overallPct}%"></div></div>
    <div class="muted small">Made from: creations ${season.creationsDone}/${SEASON.creations} · homework on time ${season.hwOnTime}/${SEASON.hw} · Wushu classes ${season.seasonWushu}/${SEASON.wushu} · revision ${season.seasonRevision}/${SEASON.revision}</div>
    <div class="badgegrid five">${ladder.map(b => cell(b, b.on ? "reached ✓" : `${b.p}%`)).join("")}</div>`;
  detailEl.querySelectorAll("[data-rvsub]").forEach(b => b.onclick = () => { activateTab("revision"); openRevisionSubject(b.dataset.rvsub); });
  const info = $("badgeInfo");
  detailEl.querySelectorAll(".bcell").forEach(c => c.onclick = () => {
    info.textContent = c.dataset.desc;
    info.classList.remove("flash"); void info.offsetWidth; info.classList.add("flash");
    detailEl.querySelectorAll(".bcell.sel").forEach(x => x.classList.remove("sel"));
    c.classList.add("sel");
  });
}

// ---------- DASHBOARD (one-glance home) ----------
function renderDashboard() {
  const el = $("dashboard"); if (!el || !ME) return;
  const t = todayStr();
  $("dashHi").textContent = MY_NAME ? `Hi ${MY_NAME} 👋` : "Dashboard";
  const pend = pendingHw();
  const over = pend.filter(h => h.due && effectiveDue(h.due) < t).length;
  const horizon = workingHorizon(2);
  const soon = pend.filter(h => h.due && effectiveDue(h.due) >= t && effectiveDue(h.due) <= horizon);
  const soonSubj = [...new Set(soon.map(h => subjectName(h.subject)))];
  const crDone = finishedCreations().length, crBehind = creationsExpected() - crDone;
  const month = wushuStats(t.slice(0, 8) + "01", t);
  const streak = readingStreak();
  const pg = progressCache;
  const card = (go, h, big, sm, sub, subCls) =>
    `<div class="dcard" data-go="${go}"><div class="dc-h">${h}</div><div class="dc-big ${sm ? "sm" : ""}">${big}</div><div class="dc-sub ${subCls || ""}">${sub}</div></div>`;

  const parts = [];
  parts.push(pend.length ? `${pend.length} homework${over ? ` (${over} overdue)` : soon.length ? ` (${soon.length} due in next 2 school days)` : ""}` : "homework all clear");
  parts.push(`${crDone}/${CREATIONS.goal} creations${crBehind > 0 ? ` (${crBehind} behind)` : ""}`);
  if (month.missed) parts.push(`${month.missed} Wushu class${month.missed > 1 ? "es" : ""} missed this month`);
  parts.push(`${streak}-day reading streak`);
  const tone = over ? "bad" : (soon.length || crBehind > 0) ? "warn" : "good";
  let html = `<div class="dash-summary ${tone}">📋 <b>Gia's ${DAY_NAMES[new Date().getDay()]} snapshot:</b> ${parts.join(" · ")}.${pg ? ` Score ${pg.week.rating}/10 · ${pg.overallPct}% overall.` : ""}</div>`;

  const hwSub = over ? `${over} overdue${soon.length ? ` · ${soon.length} due soon` : ""}`
    : soon.length ? `${soon.length} due in 2 school days: ${esc(soonSubj.join(", "))}`
      : pend.length ? `${pend.length} pending · nothing due in 2 school days` : "all clear ✅";
  html += card("homework", "📝 Homework", pend.length, false, hwSub, over ? "bad" : soon.length ? "warn" : pend.length ? "" : "good");
  html += card("creations", "🎨 Creations", `${crDone}/${CREATIONS.goal}`, true, crBehind > 0 ? `${crBehind} behind pace · 23 by 13 Nov` : "on pace ✅", crBehind > 0 ? "warn" : "good");
  const isWu = isWushuDay(t) && !isHoliday(t);
  html += card("wushu", "🥋 Wushu", month.held ? `${month.attended}/${month.held}` : "–", true,
    [isWu ? wushuStatusText(t) : "", month.missed ? `missed ${month.missed} this month` : "classes this month"].filter(Boolean).join(" · "), month.missed ? "warn" : "");
  html += card("reading", "📚 Reading", `${streak}🔥`, true, cache.reading.has(t) ? "read today ✅" : "not logged today yet", cache.reading.has(t) ? "good" : "");
  {
    const rp = paceSummary();
    const nt = upcomingTests()[0];
    const nDays = nt ? Math.round((new Date(nt.date + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5) : null;
    const sub = nt && nDays <= 7 ? `${esc(nt.name)} ${nDays === 0 ? "today" : nDays === 1 ? "tomorrow" : `in ${nDays} days`}`
      : !rp.total ? "topics coming soon" : rp.behind ? `behind pace by ${rp.behind}` : "on pace";
    html += card("revision", "📖 Revision", rp.total ? `${rp.done}/${rp.total}` : "–", true, sub, (nt && nDays <= 2) || rp.behind ? "warn" : "");
  }
  html += card("today", "📅 Today's plan", DAY_NAMES[new Date().getDay()].slice(0, 3), true, "tap for your schedule");
  if (pg) {
    const nextName = (pg.ladder.find(l => !l.on) || {}).name || "Black belt";
    const h2 = pg.overallPct >= 100 ? "🐶 Black belt unlocked — every goal achieved!"
      : pg.streak >= 1 ? `🔥 ${pg.streak}-week streak! Keep going for your ${nextName}!`
        : `Hit all 4 this week to start your streak — next up: ${nextName} 🥋`;
    html += `<div class="dash-h2">${esc(h2)}</div>`;
    const chips = pg.streakBadges.map(b => `<span class="chip ${b.on ? "on" : ""}" title="${esc(BADGE_DESC[b.key])}">${b.name}</span>`).join("");
    html += `<div class="dcard wide" data-go="progress"><div class="dc-h">⭐ Score ${pg.week.rating}/10 · ${pg.streak}-week streak 🔥 · ${pg.streakUnlocked}/4 badges · ${pg.overallPct}% (${pg.ladderTier ? pg.ladderTier.name : "no belt yet"})</div><div class="chips">${chips}</div></div>`;
  }
  el.innerHTML = html;
  el.querySelectorAll(".dcard").forEach(c => (c.onclick = () => activateTab(c.dataset.go)));
}
