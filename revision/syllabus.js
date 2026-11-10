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
// group "main": Maths, Science, Humanities, English. Gia is in Grade 7; these build
//   towards Cambridge IGCSE at CORE tier (sat in Grade 10), so each has the IGCSE paper format and a
//   set of IGCSE skills to practise now. Topic content gets added as school covers it.
// group "other": Hindi and Kannada get a simple, steady language-practice plan.
//   Art needs no revision help: it's in Homework only (revise: false).
const IGCSE_NOTE = "Gia is in Grade 7 and will take IGCSE at Core level in Grade 10. These are the papers she'll sit. Build the skills below now; Grade 9–10 adds full past-paper practice.";
const LANG_TIPS = [
  "Little and often: 15–20 minutes, 2–3 times a week beats one long session before a test.",
  "Read aloud for 5 minutes each session: it helps spelling, fluency and pronunciation.",
  "Keep a word notebook: new words with meaning and one example sentence. Self-test every week.",
  "Before a test, practise writing in the exact formats taught in class (letter, essay, story, comprehension answers).",
];
const lang = (p, label) => [
  { id: `${p}-vocab`, unit: "Language practice", name: "Vocabulary and spelling",
    points: ["Learn about 10 new words a week from the textbook", "Spell them correctly from memory", "Know opposites and similar words for common words"] },
  { id: `${p}-grammar`, unit: "Language practice", name: "Grammar",
    points: ["Revise the grammar rules covered in class this term", "Do 5 practice sentences for each rule", "Spot and correct mistakes in sample sentences"] },
  { id: `${p}-reading`, unit: "Language practice", name: "Reading and comprehension",
    points: [`Read a ${label} passage aloud fluently`, "Answer comprehension questions in full sentences", "Explain the meaning of a poem or passage in your own words"] },
  { id: `${p}-writing`, unit: "Language practice", name: "Writing",
    points: ["Formal and informal letter formats", "A short essay with introduction, body and conclusion", "Neat handwriting and correct spelling; check your work at the end"] },
];

const ALL_SUBJECTS = [
  {
    key: "Maths", name: "Maths", emoji: "📐", group: "main",
    guide: {
      papers: [
        ["IGCSE Mathematics (Core), Paper 1", "Non-calculator, 1h 30, 80 marks (50%)"],
        ["IGCSE Mathematics (Core), Paper 3", "Calculator, 1h 30, 80 marks (50%)"],
      ],
      tips: [
        "About a minute per mark: if a question takes much longer, move on and come back.",
        "Always show working. Method marks count even when the final answer is wrong.",
        "Half the exam is non-calculator, so keep mental and written methods sharp.",
        "Follow rounding instructions (e.g. 3 significant figures) and give units.",
      ],
      note: IGCSE_NOTE,
    },
    topics: [
      { id: "math-number", unit: "IGCSE skills to build", name: "Number without a calculator",
        points: ["Fractions, decimals and percentages by hand", "Negative numbers and order of operations", "Estimating answers before calculating", "Powers, roots and standard form basics"] },
      { id: "math-algebra", unit: "IGCSE skills to build", name: "Algebra foundations",
        points: ["Simplify expressions and expand brackets", "Solve linear equations, showing each step", "Substitute numbers into formulas", "Find the nth term of a sequence"] },
      { id: "math-geometry", unit: "IGCSE skills to build", name: "Geometry and measures",
        points: ["Angle rules, giving a reason for each step", "Area, perimeter and volume of common shapes", "Convert units (cm, m, km; g, kg)", "Use a ruler, protractor and compasses accurately"] },
      { id: "math-data", unit: "IGCSE skills to build", name: "Statistics and probability",
        points: ["Mean, median, mode and range", "Read and draw bar charts, pie charts and line graphs", "Simple probability as a fraction or decimal"] },
      { id: "math-exam", unit: "IGCSE skills to build", name: "Exam habits",
        points: ["Show working on every multi-step question", "Check answers make sense (size and units)", "Round correctly when asked", "Work at about a minute per mark"] },
    ],
  },
  {
    key: "Science", name: "Science", emoji: "🔬", group: "main",
    guide: {
      papers: [
        ["Paper 1 (Core): multiple choice", "45 min, 40 questions, 40 marks (30%)"],
        ["Paper 3 (Core): theory", "1h 15, short-answer and structured questions, 80 marks (50%)"],
        ["Paper 6: practical skills (written)", "1 hour, 40 marks (20%): the same paper for Core and Extended"],
      ],
      tips: [
        "Marks go to exact keywords: learn the textbook definitions word for word.",
        "The number of marks tells you how many points to make.",
        "Calculations: write the formula, substitute the numbers, then give the answer with units.",
        "The practical paper repeats every year: tables, graphs, variables and improvements.",
        "This format applies to each of IGCSE Biology, Chemistry and Physics (and Combined Science) at Core level.",
      ],
      note: IGCSE_NOTE,
    },
    topics: [
      { id: "sci-keywords", unit: "IGCSE skills to build", name: "Scientific words and definitions",
        points: ["Learn key definitions exactly as the textbook gives them", "Use the right units (m, s, kg, °C, N)", "Make flashcards for each chapter's keywords"] },
      { id: "sci-practical", unit: "IGCSE skills to build", name: "Planning experiments",
        points: ["Name the independent, dependent and control variables", "Explain how to make it a fair test", "Results table with units in the column headings", "Why we repeat readings and take an average"] },
      { id: "sci-graphs", unit: "IGCSE skills to build", name: "Graphs and data",
        points: ["Label both axes with units", "Choose a sensible scale and plot accurately", "Draw a line or curve of best fit", "Describe a trend using numbers from the graph"] },
      { id: "sci-explain", unit: "IGCSE skills to build", name: "Explaining and calculating",
        points: ["Answer 'explain' questions with 'because…'", "Formula → substitute → answer → unit", "Match the number of points to the marks"] },
      { id: "sci-mcq", unit: "IGCSE skills to build", name: "Multiple-choice technique",
        points: ["Rule out the wrong options first", "Read every option before choosing", "Never leave a question blank"] },
    ],
  },
  {
    key: "Humanities", name: "Humanities", emoji: "🏛️", group: "main",
    guide: {
      papers: [
        ["IGCSE History", "Paper 1: structured questions, 2 hours · Paper 2: source-based questions, 1h 45 · Paper 4 or coursework: depth study"],
        ["IGCSE Geography", "Paper 1: geographical themes, 1h 45 · Paper 2: geographical skills (maps, graphs), 1h 30 · Paper 4 or coursework"],
      ],
      tips: [
        "Short questions want specific facts: names, dates, places, numbers.",
        "Explain questions: make a point, back it with evidence, then explain how it links (PEEL).",
        "'How far' questions: argue both sides, then give a clear judgement with a reason.",
        "Sources: ask who made it, when and why before deciding how reliable it is.",
      ],
      note: IGCSE_NOTE + " Humanities may become History, Geography or Global Perspectives at IGCSE.",
    },
    topics: [
      { id: "hum-facts", unit: "IGCSE skills to build", name: "Key facts and case studies",
        points: ["Make a timeline or fact sheet for each chapter", "Learn one detailed example (case study) per topic", "Use specific details: names, dates, places, numbers"] },
      { id: "hum-explain", unit: "IGCSE skills to build", name: "Explaining causes and effects",
        points: ["Write a PEEL paragraph: Point, Evidence, Explain, Link", "Give two or three different reasons, each explained", "Use linking words: because, therefore, as a result"] },
      { id: "hum-judge", unit: "IGCSE skills to build", name: "Making a judgement",
        points: ["Argue both sides of a 'how far' or 'do you agree' question", "End with a clear conclusion and the reason for it"] },
      { id: "hum-sources", unit: "IGCSE skills to build", name: "Using sources",
        points: ["Who made it, when and why (provenance)", "What the source shows, with a short quotation", "How reliable or useful it is, and why"] },
      { id: "hum-skills", unit: "IGCSE skills to build", name: "Maps, graphs and data",
        points: ["Grid references and map scale", "Describe a pattern on a map or graph using figures", "Draw and label simple diagrams and sketches"] },
    ],
  },
  {
    key: "English", name: "English", emoji: "✍️", group: "main",
    guide: {
      papers: [
        ["IGCSE English (First Language), Paper 1: Reading", "2 hours, 80 marks: comprehension, summary and writer's effects on three texts"],
        ["Paper 2: Writing", "2 hours, 80 marks: directed writing (letter, speech or article from a text) and a composition (descriptive or narrative)"],
      ],
      tips: [
        "Read the questions before the texts, then underline what each one asks.",
        "Writer's effects: pick specific words and explain their effect. Naming a technique alone scores little.",
        "Summaries: use your own words and stay within the word limit.",
        "Plan for 5–10 minutes before writing, and leave 5 minutes to proofread.",
      ],
      note: IGCSE_NOTE,
    },
    topics: [
      { id: "eng-reading", unit: "IGCSE skills to build", name: "Reading for meaning",
        points: ["Find explicit information quickly", "Work out implied meaning (what the writer suggests)", "Answer in your own words, backed by short quotations"] },
      { id: "eng-effects", unit: "IGCSE skills to build", name: "Writer's language and effects",
        points: ["Pick out powerful words and phrases", "Explain the connotations and the effect on the reader", "Comment on how imagery builds atmosphere or character"] },
      { id: "eng-summary", unit: "IGCSE skills to build", name: "Summary writing",
        points: ["Select only the points that answer the question", "Rewrite them in your own words", "Keep to the word limit"] },
      { id: "eng-directed", unit: "IGCSE skills to build", name: "Directed writing",
        points: ["Formats: letter, speech, article, report", "Write for the right audience and purpose", "Use and develop ideas from the reading text"] },
      { id: "eng-composition", unit: "IGCSE skills to build", name: "Descriptive and narrative writing",
        points: ["Plan a clear structure before writing", "Vary sentence length and openings", "Use precise, ambitious vocabulary", "Paragraph properly and proofread"] },
    ],
  },
  {
    key: "Hindi", name: "Hindi", emoji: "📙", group: "other",
    guide: { title: "📋 How to revise", papers: [], tips: LANG_TIPS },
    topics: lang("hin", "Hindi"),
  },
  {
    key: "Kannada", name: "Kannada", emoji: "📗", group: "other",
    guide: { title: "📋 How to revise", papers: [], tips: LANG_TIPS },
    topics: lang("kan", "Kannada"),
  },
  { key: "Art", name: "Art", emoji: "🎨", group: "other", revise: false, topics: [] },
];

// Display order (by key): the four IGCSE subjects first, then the languages, then Art.
const ORDER = ["Maths", "Science", "Humanities", "English", "Hindi", "Kannada", "Art"];
const EVERY_SUBJECT = ORDER.map(k => ALL_SUBJECTS.find(s => s.key === k));
// Homework uses every subject; the Revision tab only those with revise !== false.
export const HW_SUBJECTS = EVERY_SUBJECT;
export const SUBJECTS = EVERY_SUBJECT.filter(s => s.revise !== false);
export const SUBJECT_GROUPS = [
  { key: "main", label: "Main subjects (building towards IGCSE)", hwLabel: "Main subjects" },
  { key: "other", label: "Languages", hwLabel: "Languages and Art" },
];

export const allTopics = () => SUBJECTS.flatMap(s => s.topics.map(t => ({ ...t, subject: s.key })));
export const topicById = (id) => allTopics().find(t => t.id === id);
export const subjectByKey = (k) => EVERY_SUBJECT.find(s => s.key === k);

// One-time seed (meta/revision_v1): tests and planned sessions to load on first login.
// Empty for now — add Gia's when her revision plan arrives.
export const SEED_TESTS = [];
export const SEED_SESSIONS = [];
