# 🐉 Gia's Game Plan

A personal planner web app for Gia: a daily plan, homework, revision, her Collection of Creations, Wushu classes and reading. Gia and Christabel both log in and see the **same data live**: when one of you ticks something, the other's screen updates straight away.

Works on any device (phone, tablet, laptop) through a free web link.

---

## What it does

- **Today**: an auto-built daily plan that fits homework and revision sessions around school, Wushu (Mon/Wed/Fri 5–6:30pm) and sleep (lights out 10pm), with a reading slot every evening and a daily quote.
- **Homework**: homework per subject with a due date and estimated time. It shows "do today" the school day before it's due.
- **Revision**: subjects → topics with two revision rounds and confidence ratings, must-know checklists, tests and planned sessions.
- **Creations**: Gia's 29 creations on the theme of feelings (23 by 13 Nov, 29 by 31 Dec), with a pace bar, her four "done" checks (Next, weekly wins, Substack, skill), creations grouped by month, and a list of skills she's grown.
- **Wushu**: mark each class attended, missed, cancelled or rescheduled; monthly attendance; a missed-classes log with reasons and make-ups; gradings and competitions; a home practice checklist.
- **Reading**: "I read today" with a streak, books reading now / want to read / finished, and star ratings.
- **Progress**: a weekly score out of 10 from 4 targets (homework on time · 1 creation · Wushu classes · 2 revision rounds), streak badges, and a belt ladder from white to black.
- **Emails**: a summary every Wednesday and Sunday at about 7pm IST, and a monthly report on the 1st (Part C).

---

## Try it without logging in (demo mode)

From this folder run `python3 -m http.server 8765`, then open:

- http://localhost:8765/?demo=gia (as Gia)
- http://localhost:8765/?demo=mum (as Christabel)

Demo mode uses a pretend database kept in that browser only. "Log out" in demo mode wipes the demo data. It only works on localhost, never on the live site.

---

## Setup (once, about 20 minutes)

### Part A: Firebase (the database and logins) — Christabel

1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. **Add project** → name it e.g. `gia-plan-2026` → Google Analytics can be off → **Create project**. (Use a new project, not Jake's.)
3. **Build ▸ Authentication ▸ Get started** → **Email/Password** → **Enable** → Save.
4. Authentication ▸ **Users** ▸ **Add user**, twice: Gia's email and Christabel's email, each with a password.
5. **Build ▸ Firestore Database ▸ Create database** → **production mode** → a location near you → Enable.
6. **Rules** tab: paste the contents of `firestore.rules`, replace the two placeholder emails with Gia's and Christabel's real login emails, and **Publish**.
7. ⚙️ **Project settings** ▸ **Your apps** ▸ the **`</>`** (Web) icon → nickname → **Register app**. Copy the `firebaseConfig` values into `firebase-config.js` (or send them to Claude to paste in). These keys are safe to be public.
8. In **Google Cloud Console** (same project) ▸ APIs & Services ▸ Credentials, restrict the browser API key to the GitHub Pages address and `localhost`.

### Part B: GitHub Pages (the web link)

Repo: `gianluigi-buffon/gia-game-plan`. In the repo go to **Settings ▸ Pages**, choose branch `main` and `/ (root)`, Save. After a minute the app is live at **https://gianluigi-buffon.github.io/gia-game-plan/**.

> Tip: on a phone, open the link and choose "Add to Home Screen" so it works like an app.

### Part C: Emails (twice-weekly summary + monthly report)

1. **Firebase service account key:** ⚙️ Project settings ▸ **Service accounts** ▸ **Generate new private key**. Copy all of the downloaded file's text.
2. **Gmail app password:** https://myaccount.google.com/apppasswords (2-Step Verification must be on). Create one called `gia-game-plan`.
3. In the repo: **Settings ▸ Secrets and variables ▸ Actions ▸ New repository secret**, add:
   - `FIREBASE_SERVICE_ACCOUNT`: the whole JSON from step 1
   - `GMAIL_USER`: the Gmail address the app password belongs to
   - `GMAIL_APP_PASSWORD`: the 16-character app password
   - `MAIL_TO`: both emails, comma-separated
4. Test: **Actions** tab ▸ **Twice-weekly email digest** ▸ **Run workflow**.

> GitHub pauses scheduled jobs after ~60 days without repo activity. If emails stop, press **Run workflow** once to wake them.

---

## Keeping it private

Only the two logins in the security rules can read or write the data. Don't share the passwords. A forgotten password can be reset from the login screen's "Forgot password?" button.
