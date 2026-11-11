# Gia's Game Plan — Project Handoff

A personal planner web app for Gia, shared live with her mum Christabel. Pure static web app (HTML/CSS/vanilla JS) on **free GitHub Pages**, backed by **Firebase** (Auth + Firestore). No build step, no server. Modelled on Jake's Game Plan (`jakesamuel2011-a11y/game-plan`); don't change Jake's repo or Firebase project from here.

---

## 🔗 Key links

- **Code:** https://github.com/gianluigi-buffon/gia-game-plan (Christabel's account `Christabelsingh` has write access; Claude pushes with `gh` as that account)
- **Live app (once Pages is on):** https://gianluigi-buffon.github.io/gia-game-plan/
- **Firebase:** its own project (not Jake's `jake-challenge-2026`), set up per README Part A.

## 👤 Logins

Two Firebase Auth (Email/Password) users: Gia and Christabel. Emails live in **one place in code**, the `PEOPLE` map in `firebase-config.js`, plus the live security rules in the Firebase console. Christabel sees the parent-only Revision "parent check". Passwords are never stored in this repo.

> The repo is **public** (free GitHub Pages needs that), so keep personal details out of these notes. App data lives in Firebase, readable only by the two logins.

---

## 🚀 Making changes & deploying

1. Work on a **branch**, test in demo mode (below), then ask Christabel before merging to `main` (main is live).
2. **Bump the cache-busters** whenever a file changes, or browsers keep the old copy:
   - `index.html`: `styles.css?v=NN`, `app.js?v=NN`
   - `app.js`: imports of `planner.js?v=NN`, `revision/revision.js?v=NN`, `revision/syllabus.js?v=NN`
   - `revision/revision.js`: imports of `syllabus.js?v=NN` (must match app.js's) and `packview.js?v=NN`
   - pack JSON changes: `PACK_VERSION` in `revision/syllabus.js`
3. After deploying, check the live `index.html` serves the new version numbers.

### Current cache-buster versions
- `styles.css?v=4`, `app.js?v=12`, `timetable.js?v=1`, `planner.js?v=1`, `revision.js?v=9`, `syllabus.js?v=9`, `packview.js?v=2`

## 🧪 Testing without logging in (demo mode)

`python3 -m http.server 8765` from the repo root (or the `gia-game-plan` entry in `.claude/launch.json`), then `http://localhost:8765/?demo=gia` or `?demo=mum`. An import map in `index.html` swaps the three Firebase modules for `dev/mock/*.js`: an in-browser database saved to localStorage (`gia-demo-db`) with live updates. Only on localhost with `?demo`. "Log out" in demo wipes the demo data. There is no Node on this Mac: the email scripts were checked by running them in the browser against the demo data with stubbed `firebase-admin`/`nodemailer`; test for real with **Run workflow** on GitHub.

---

## 🗂️ File map

- `index.html`: markup, tabs, login screen, demo-mode import map, cache-busters.
- `styles.css`: plum and gold (puppy 🐶 logo) theme (CSS variables at the top), mobile-first.
- `app.js`: Firebase wiring, auth, live subscriptions, all tabs, dashboard, progress/badges, quotes.
- `timetable.js`: Gia's Grade 7 school timetable (subjects and times only, no school or teacher names: public repo). Shown in the Today tab (lessons inside the School block + a weekly card) and used by Homework's 'Due: next lesson' buttons. `hw` links a lesson to a subject key.
- `planner.js`: **pure** daily-plan builder (`dayTemplate()` = Gia's week). No Firebase.
- `firebase-config.js`: Firebase web keys (empty until Part A is done; the login screen then shows a "not connected" note) + `PEOPLE`.
- `firestore.rules`: rules template with placeholder emails.
- `revision/syllabus.js`: **edit this to add subjects and topics**. The subject list also feeds the Homework subject picker. Subjects (Nov 2026): main group Maths, Science, Humanities, English, planned around Cambridge IGCSE at Core tier (she is in Grade 7 and sits IGCSE in Grade 10): each has an IGCSE paper-format guide and an "IGCSE skills to build" unit of skill topics. Hindi and Kannada: a simple "Language practice" plan (vocabulary, grammar, reading, writing) with revision tips. Art: Homework only (`revise: false`), no revision. `HW_SUBJECTS` = all seven; `SUBJECTS` = revision subjects. Revision goal is still a PLACEHOLDER (2 rounds by 28 Feb). Add chapter topics to each subject as school covers them. Humanities History = NCERT Our Pasts II, older 10-chapter edition (ids hist7-ch01…ch10); Ch 5 checklist not yet checked against her book. Practice pack `revision/packs/history7-our-pasts-2.json` (units ch01–ch10: flashcards, MCQ quiz, 4- and 6-mark exam questions with model answers, timeline), written from her chapter PDFs except Ch 5. Bump `PACK_VERSION` when it changes. Maths = Cambridge Lower Secondary Mathematics Learner's Book 8 (CUP 2nd ed., Byrd/Byrd/Pearce): topics math8-u01…u16 + pack `math8-cup.json`. Science = Cambridge Lower Secondary Science Learner's Book 7 (CUP 2nd ed., Jones/Fellowes-Freeman/Smyth): topics sci7-u1…u9 + pack `sci7-cup.json`. Unit titles and checklists were written from knowledge of these books and the Stage 7/8 curriculum, not from her copies: check against the contents pages. In every subject the textbook topics come first, then 'IGCSE skills to build'.
- `revision/revision.js`, `revision/packview.js`: the Revision tab and practice-pack renderer, copied from Jake's app (local dates, "Gia" in the parent check, optional subject `guide`, a "no topics yet" pace card).
- `scripts/send-digest.mjs`, `scripts/send-monthly.mjs` + `.github/workflows/digest.yml` (Wed & Sun 13:30 UTC = 7pm IST), `monthly.yml` (1st of month).
- `dev/mock/`: demo-mode stand-ins for Firebase.

---

## 🔥 Firestore data model

- `homework` {subject (a syllabus subject key), task, due, mins, status (todo|done), addedBy, doneBy, doneAt}
- `creations` {title, type (Sketch|Mixed media|Poem|Short story|Other), emotion, doneOn (YYYY-MM-DD, "" = in progress), next, wins, substack (bools), skill, addedBy, createdAt}
- `wushulog/{YYYY-MM-DD}` {date, status (attended|missed|cancelled|rescheduled), reason, note, madeUp, madeUpOn, toDate, from, to, by}
- `wushuevents` {name, date, location}: gradings and competitions
- `routines` {title, kind:"practice"} + `dailylog/{YYYY-MM-DD}` {routineId: {by}}: home practice ticks
- `books` {title, author, status (reading|want|finished), startedOn, finishedOn, rating}
- `readinglog/{YYYY-MM-DD}` {mins, by}
- `holidays` {from, to, name}
- `weeklog/{weekMonday}` {pillarsMet, rating, onTarget, wushu, revision, creations, readingDays}: drives streaks, badges, belts, emails
- Revision: `revprogress/{topicId}`, `revsessions`, `revtests`, `revpractice/{packId}`, `meta/revision_v1`
- `meta/seeded`: first-run flag; its timestamp is the app start date (Wushu classes before it only count if marked)

## ⏰ Gia's schedule rules (planner.js)
School 6:30am–4:15pm. Wushu Mon/Wed/Fri 5–6:30pm (a missed/cancelled/rescheduled class frees that slot for study). Reading + wind-down 9:15–9:45pm, lights out 10pm. Weekdays + Saturday morning for work; Saturday afternoon + Sunday free.

## ⭐ Progress rules
Weekly targets: homework on time · 1 creation finished · Wushu = attended ≥ classes held that week (cancelled ones don't count; made-up ones do) · 2 revision rounds (counts as met until revision topics exist). Score /10 = 2.5 per target (partial credit for creations, Wushu, revision). Streak badges: First Bow, Steady Stance (3 wks), Perfect Form (10/10), Top Dog (6 wks). Belts at 20/40/60/80/100% of overall goals: creations 29, homework on time 100, Wushu classes 60, revision 30.

## ⏳ Waiting on Christabel
- Gia's revision goal and topic lists for each subject → `revision/syllabus.js`
- Firebase project keys → `firebase-config.js`; real emails into the console rules
- Optional links: Next, weekly wins document, Substack

## ⚠️ Gotchas (from Jake's app)
- Always bump cache-busters.
- Every `$("id").onclick = …` at load needs its element in `index.html`, or the whole script stops.
- Define top-level helper `const`s before load-time code uses them.
- Topic ids and subject keys are permanent (progress is stored by them).
- One-time data changes use a `meta/<name>_v1` flag doc.
