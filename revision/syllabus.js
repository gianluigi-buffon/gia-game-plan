// =============================================================
//  revision/syllabus.js — Gia's subjects and what she revises (pure data)
//
//  SUBJECTS → topics → must-know checklist points (+ optional practice pack).
//  The same subject list drives the Homework subject picker.
//  Progress (rounds, confidence, ticked points) lives in Firestore keyed by
//  topic id, so NEVER rename a topic id once it's in use — add new ones instead.
//  Subject keys are stored on homework and tests too: add new keys, don't rename.
//
//  To add a subject's topics: append to its `topics` array, e.g.
//    { id: "sci-cells", unit: "Biology", name: "Cells", points: ["Plant vs animal cells", "…"] }
//  To add a practice pack: drop a JSON file in revision/packs/ and set `pack`
//  on the topics it covers (format: see packview.js).
//  Optional `guide: { papers: [[title, detail]], tips: [..], note }` shows a
//  "How it's marked" card on the subject page.
// =============================================================

// PLACEHOLDER goal until Christabel confirms Gia's revision deadline.
export const REVISION_GOAL = { start: "2026-11-09", by: "2027-02-28", rounds: 2 };

// Bump when a pack JSON changes so browsers fetch the new copy.
export const PACK_VERSION = 1;

export const PACKS = {};

// Gia's subjects (confirmed by Christabel, Nov 2026).
// group "main": revised for exams and shown first. group "other": languages and Art,
// kept in their own section (still available for homework, tests and topics).
const ALL_SUBJECTS = [
  { key: "Humanities", name: "Humanities", emoji: "🏛️", group: "main", topics: [] },
  { key: "English", name: "English", emoji: "✍️", group: "main", topics: [] },
  { key: "Maths", name: "Maths", emoji: "📐", group: "main", topics: [] },
  { key: "Science", name: "Science", emoji: "🔬", group: "main", topics: [] },
  { key: "Kannada", name: "Kannada", emoji: "📗", group: "other", topics: [] },
  { key: "Hindi", name: "Hindi", emoji: "📙", group: "other", topics: [] },
  { key: "Art", name: "Art", emoji: "🎨", group: "other", topics: [] },
];

// Display order on the Revision tab (by key) — put what's coming up first.
const ORDER = ["Humanities", "English", "Maths", "Science", "Kannada", "Hindi", "Art"];
export const SUBJECTS = ORDER.map(k => ALL_SUBJECTS.find(s => s.key === k));
export const SUBJECT_GROUPS = [
  { key: "main", label: "Main subjects" },
  { key: "other", label: "Languages and Art" },
];

export const allTopics = () => SUBJECTS.flatMap(s => s.topics.map(t => ({ ...t, subject: s.key })));
export const topicById = (id) => allTopics().find(t => t.id === id);
export const subjectByKey = (k) => SUBJECTS.find(s => s.key === k);

// One-time seed (meta/revision_v1): tests and planned sessions to load on first login.
// Empty for now — add Gia's when her revision plan arrives.
export const SEED_TESTS = [];
export const SEED_SESSIONS = [];
