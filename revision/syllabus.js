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
      { id: "hist7-ch01", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 1: Tracing Changes Through a Thousand Years",
        points: ["Compare the two maps: al-Idrisi (1154, Arabic, south India at the top) and the French map of the 1720s. Why do they differ?", "How 'Hindustan' changed meaning: Minhaj-i Siraj (13th century: Punjab, Haryana, Ganga–Yamuna lands) vs Babur (the whole subcontinent); what 'foreigner' meant then", "Historians' sources: coins, inscriptions, buildings, manuscripts; why paper mattered; archives; how scribes' copying changed texts (Ziyauddin Barani's two versions)", "New technologies and crops (Persian wheel, spinning wheel; potatoes, corn, chillies, tea, coffee) and new groups: Rajputs, Kayasthas, jatis and jati panchayats", "Amir Khusrau's list of regional languages (1318) and what he said about Sanskrit; region vs empire", "Religion (bhakti, Islam) and why historians reject the British 'Hindu, Muslim, British' periods"] },
      { id: "hist7-ch02", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 2: New Kings and Kingdoms",
        points: ["How new dynasties rose: samantas becoming kings; Dantidurga (Rashtrakuta) and the hiranya-garbha ritual; Kadamba Mayurasharman and Gurjara-Pratihara Harichandra", "How kings ruled: grand titles, sharing power, taxes (Chola inscriptions list 400+, e.g. vetti and kadamai), prashastis (Nagabhata) and copper-plate land grants; Kalhana's history of Kashmir", "The 'tripartite struggle' for Kanauj: Gurjara-Pratiharas, Rashtrakutas, Palas", "Mahmud of Ghazni (997–1030): raids on temples like Somnath; al-Biruni's Kitab al-Hind. Prithviraja III (Chahamana) beat Muhammad Ghori in 1191 but lost in 1192", "The Cholas: Vijayalaya took the Kaveri delta and built Thanjavur; Rajaraja I (985) and Rajendra I (navy, raids); Thanjavur and Gangaikondacholapuram temples; Chola bronzes", "Chola farming and government: Kaveri channels, wells, tanks, sluices; ur, nadu, Vellalas, brahmadeya and the sabha; Uttaramerur rules and lottery; nagarams"] },
      { id: "hist7-ch03", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 3: The Delhi Sultans (in her book: Delhi, 12th to 15th Century)",
        points: ["Delhi before the Sultans: the Tomara Rajputs, then the Chauhans of Ajmer", "The order of rulers: Rajput dynasties, early Turkish rulers (Qutbuddin Aybak 1206), Khaljis, Tughluqs, Sayyids, Lodis", "Sources: tawarikh written in Persian; the 'circle of justice' (Fakhr-i Mudabbir)", "Raziyya Sultan (1236–1240) and why Minhaj-us-Siraj disapproved; other women rulers: Rudramadevi, Didda", "How the Sultanate was run: special slaves (bandagan) and clients as governors; Barani's criticism of Muhammad Tughluq; iqtas and muqtis; Alauddin's taxes (kharaj about 50%, cattle, houses), plus khums, zakat and jizyah", "Mongol attacks and the big standing army; Ibn Battuta (from Morocco) on chieftains; 15th-century kingdoms; Sher Shah Sur (1540–1555), whose system Akbar followed"] },
      { id: "hist7-ch04", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 4: The Mughal Empire",
        points: ["Who the Mughals were: descended from Genghis Khan and Timur, and why they preferred their Timurid link", "Babur: Panipat 1526 (Ibrahim Lodi), Khanua 1527 (Rana Sanga); Humayun lost to Sher Khan and fled to Iran; the main campaigns of Akbar, Jahangir, Shah Jahan and Aurangzeb", "Succession by coparcenary (shared among sons), not primogeniture; Mughal marriages and relations with the Rajputs; Aurangzeb's insult to Shivaji", "Mansabdars and jagirdars: zat (rank and salary) and sawar (cavalry); why jagirs ran short under Aurangzeb", "Zabt and zamindars: Todar Mal's revenue survey; Abul Fazl's Akbar Nama and Ain-i Akbari", "Akbar's government (subas, subadars, bakhshi, sadr, faujdar, kotwal), the ibadat khana and sulh-i kul; Nur Jahan; wealth and poverty in the 17th century"] },
      { id: "hist7-ch05", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 5: Rulers and Buildings",
        points: ["Building techniques: trabeate (beams) vs arcuate (arches)", "Temples, mosques and tanks (e.g. Hauz-i Sultani) as signs of royal power", "Why temples were sometimes attacked", "Gardens, tombs and forts: chahar bagh, Humayun's tomb, Taj Mahal, Red Fort", "How regional styles mixed together"] },
      { id: "hist7-ch06", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 6: Towns, Traders and Craftspersons",
        points: ["Kinds of towns: administrative centres (Thanjavur and its Rajarajeshvara temple), temple towns and pilgrimage centres (Somnath, Madurai, Tirupati, Vrindavan, Ajmer)", "The 'lost wax' technique for bronze images", "Small towns: mandapika and hatta; taxes on markets", "Traders big and small: Banjaras, guilds (Manigramam, Nanadesi), Chettiars, Marwari Oswals, Gujarati Baniyas and Bohras; Kabul's trade", "Crafts: Bidri work, the Panchalas or Vishwakarma community, Saliyar weavers; why some towns grew and others shrank", "A closer look: Hampi (Vijayanagara, fell 1565), Surat ('gate to Mecca', hundis), Masulipatnam; European companies, the advance system and 'Black Towns'"] },
      { id: "hist7-ch07", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 7: Tribes, Nomads and Settled Communities",
        points: ["How tribal societies differed from varna-based society (kinship, shared land, oral traditions)", "Tribes in different regions: Gaddis, Nagas, Ahoms, Cheros, Mundas, Santals, Kolis, Bhils, Gonds and others", "Nomads and mobile people: the Banjaras and their tandas (used by Alauddin Khalji and the Mughals)", "Changing society: new jatis within varnas; tribes becoming Rajput clans or lower jatis", "The Gonds: Gondwana, garh, chaurasi (84 villages), barhot (12 villages); Rani Durgawati of Garha Katanga vs the Mughals (1565)", "The Ahoms: came from Myanmar, defeated the bhuiyans, used firearms; Mir Jumla's attack (1662); paiks, khels, buranjis"] },
      { id: "hist7-ch08", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 8: Devotional Paths to the Divine",
        points: ["The idea of a Supreme God and the Puranas; bhakti open to all castes", "Nayanars (63, devotees of Shiva: Tevaram, Tiruvacakam) and Alvars (12, devotees of Vishnu: Divya Prabandham)", "Philosophers: Shankara (Advaita, 8th century) and Ramanuja (Vishishtadvaita, 11th century); Basavanna's Virashaivism", "Saints of Maharashtra (Janeshwar, Namdev, Eknath, Tukaram, Chokhamela; Vitthala at Pandharpur); Nathpanthis, Siddhas and Yogis", "Sufism: zikr, sama, pirs, silsilas, khanqahs, dargahs; the Chishti saints (Muinuddin Chishti of Ajmer, Nizamuddin Auliya)", "North India: Tulsidas, Surdas, Shankaradeva (namghars), Mirabai and Ravidas; Kabir's ideas; Guru Nanak (Kartarpur, langar, nam-dan-isnan) and the Guru Granth Sahib"] },
      { id: "hist7-ch09", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 9: The Making of Regional Cultures",
        points: ["The Cheras and Malayalam: Mahodayapuram, Manipravalam, the Lilatilakam", "The Jagannatha cult at Puri: Anantavarman's temple, and why conquerors wanted to control it", "The Rajputs and traditions of heroism: minstrels' stories, and how women appear in them", "Kathak: from story-tellers and rasa lila to the Mughal court and two gharanas; the other 'classical' dances", "Miniature painting: Jaina, Mughal, Rajput, Basohli and Kangra styles", "Bengal: how Bengali grew, pirs, temple styles (dochala, chauchala; terracotta at Vishnupur), fish as food"] },
      { id: "hist7-ch10", unit: "History: NCERT Our Pasts II (Class 7)", name: "Ch 10: Eighteenth-Century Political Formations",
        points: ["Why the Mughal empire weakened after Aurangzeb (1707): the Deccan war, powerful subadars, revolts, rival nobles", "Nadir Shah sacked Delhi in 1739; Ahmad Shah Abdali raided 1748–1761", "Three kinds of new states: old Mughal provinces, Rajput watan jagirs, and states won by fighting (Marathas, Sikhs, Jats)", "Hyderabad (Asaf Jah), Awadh (Burhan-ul-Mulk Sa'adat Khan) and Bengal (Murshid Quli Khan, Alivardi Khan, Jagat Seth); revenue farming (ijaradari)", "The Rajputs (Sawai Jai Singh, Jaipur) and the Sikhs: Khalsa (1699), Banda Bahadur, misls, dal khalsa, gurmatas, rakhi; Ranjit Singh at Lahore (1799)", "The Marathas (Shivaji, the Peshwas, chauth and sardeshmukhi, expansion 1720–1761) and the Jats (Churaman, Suraj Mal, Bharatpur)"] },
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
