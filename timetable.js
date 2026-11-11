// =============================================================
//  timetable.js — Gia's school timetable (Grade 7), pure data.
//  Subjects and times only: no school or teacher names, because this repo is public.
//  `hw` links a lesson to a Homework/Revision subject key (revision/syllabus.js),
//  so Homework can offer "due next lesson". Lessons without `hw` have no homework.
//  Update this file when the timetable changes, and bump its ?v= in app.js.
// =============================================================

export const SCHOOL_DAY = { start: "07:50", end: "14:50" };

// Day keys match JS Date.getDay(): 1 = Monday … 5 = Friday.
export const TIMETABLE = {
  1: [
    { from: "07:50", to: "09:10", subject: "Humanities", hw: "Humanities" },
    { from: "09:10", to: "10:00", subject: "Breakfast & circle time", brk: true },
    { from: "10:00", to: "11:20", subject: "Science", hw: "Science" },
    { from: "11:20", to: "12:00", subject: "Library" },
    { from: "12:00", to: "12:30", subject: "Lunch", brk: true },
    { from: "12:30", to: "13:10", subject: "English", hw: "English" },
    { from: "13:10", to: "14:25", subject: "Vaayu sessions" },
    { from: "14:25", to: "14:50", subject: "School windup", brk: true },
  ],
  2: [
    { from: "07:50", to: "09:10", subject: "Workshop" },
    { from: "09:10", to: "10:00", subject: "Breakfast & circle time", brk: true },
    { from: "10:00", to: "10:40", subject: "Workshop" },
    { from: "10:40", to: "12:00", subject: "Science", hw: "Science" },
    { from: "12:00", to: "12:30", subject: "Lunch", brk: true },
    { from: "12:30", to: "13:10", subject: "Kannada", hw: "Kannada" },
    { from: "13:10", to: "13:50", subject: "Mathematics", hw: "Maths" },
    { from: "13:50", to: "14:25", subject: "Coordinator time" },
    { from: "14:25", to: "14:50", subject: "School windup", brk: true },
  ],
  3: [
    { from: "07:50", to: "08:30", subject: "Arts", hw: "Art" },
    { from: "08:30", to: "09:10", subject: "Games & fitness" },
    { from: "09:10", to: "10:00", subject: "Breakfast & circle time", brk: true },
    { from: "10:00", to: "10:40", subject: "Coordinator time" },
    { from: "10:40", to: "11:20", subject: "Humanities", hw: "Humanities" },
    { from: "11:20", to: "12:00", subject: "Comprehensive Sexuality Education" },
    { from: "12:00", to: "12:30", subject: "Lunch", brk: true },
    { from: "12:30", to: "13:10", subject: "Kannada", hw: "Kannada" },
    { from: "13:10", to: "13:50", subject: "English", hw: "English" },
    { from: "13:50", to: "14:25", subject: "Hindi", hw: "Hindi" },
    { from: "14:25", to: "14:50", subject: "School windup", brk: true },
  ],
  4: [
    { from: "07:50", to: "09:10", subject: "Mathematics", hw: "Maths" },
    { from: "09:10", to: "10:00", subject: "Breakfast & circle time", brk: true },
    { from: "10:00", to: "11:20", subject: "Humanities", hw: "Humanities" },
    { from: "11:20", to: "12:00", subject: "Science", hw: "Science" },
    { from: "12:00", to: "12:30", subject: "Lunch", brk: true },
    { from: "12:30", to: "13:50", subject: "English", hw: "English" },
    { from: "13:50", to: "14:25", subject: "Hindi", hw: "Hindi" },
    { from: "14:25", to: "14:50", subject: "School windup", brk: true },
  ],
  5: [
    { from: "07:50", to: "09:10", subject: "Games & fitness" },
    { from: "09:10", to: "10:00", subject: "Breakfast & circle time", brk: true },
    { from: "10:00", to: "10:40", subject: "Yoga" },
    { from: "10:40", to: "12:00", subject: "Mathematics", hw: "Maths" },
    { from: "12:00", to: "12:30", subject: "Lunch", brk: true },
    { from: "12:30", to: "13:10", subject: "Arts", hw: "Art" },
    { from: "13:10", to: "13:50", subject: "Dance" },
    { from: "13:50", to: "14:25", subject: "Kannada", hw: "Kannada" },
    { from: "14:25", to: "14:50", subject: "School windup", brk: true },
  ],
};

// Lessons only (no breaks) for a weekday 0–6.
export const lessonsOn = (day) => (TIMETABLE[day] || []).filter(l => !l.brk);

// Next date (YYYY-MM-DD, strictly after `fromDate`) that has a lesson in `hwKey`,
// skipping dates for which `skip(dateStr)` is true (e.g. holidays). Null if none in 6 weeks.
export function nextLessonDate(hwKey, fromDate, skip = () => false) {
  const d = new Date(fromDate + "T12:00:00");
  for (let i = 0; i < 42; i++) {
    d.setDate(d.getDate() + 1);
    const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!skip(s) && lessonsOn(d.getDay()).some(l => l.hw === hwKey)) return s;
  }
  return null;
}
