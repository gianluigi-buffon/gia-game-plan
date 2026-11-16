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

// Gia's revision goal, confirmed by Christabel (Nov 2026): 2 rounds of every topic by 31 Jan.
export const REVISION_GOAL = { start: "2026-11-09", by: "2027-01-31", rounds: 2 };

// Bump when a pack JSON changes so browsers fetch the new copy.
export const PACK_VERSION = 6;

export const PACKS = {
  "geo7-ncert": "Geography: Our Environment",
  "sci7-cup": "Science: Learner's Book 7",
  "math8-cup": "Maths: Learner's Book 8",
  "history7-our-pasts-2": "History: Our Pasts II",
  "chi-history": "A Children's History of India",
};

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
      { id: "math8-u01", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u01", name: "Unit 1: Integers",
        points: ["1.1 Factors, multiples and primes (prime factors, HCF, LCM)", "1.2 Multiplying and dividing integers (negative numbers)", "1.3 Square roots and cube roots", "1.4 Indices"] },
      { id: "math8-u02", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u02", name: "Unit 2: Expressions, formulae and equations",
        points: ["2.1 Constructing expressions", "2.2 Using expressions and formulae (substitution)", "2.3 Expanding brackets", "2.4 Factorising", "2.5 Constructing and solving equations", "2.6 Inequalities"] },
      { id: "math8-u03", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u03", name: "Unit 3: Place value and rounding",
        points: ["3.1 Multiplying and dividing by 0.1 and 0.01", "3.2 Rounding (decimal places, significant figures, estimating)"] },
      { id: "math8-u04", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u04", name: "Unit 4: Decimals",
        points: ["4.1 Ordering decimals", "4.2 Multiplying decimals", "4.3 Dividing by decimals", "4.4 Making decimal calculations easier"] },
      { id: "math8-u05", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u05", name: "Unit 5: Angles and constructions",
        points: ["5.1 Parallel lines (corresponding, alternate, co-interior angles)", "5.2 The exterior angle of a triangle", "5.3 Constructions"] },
      { id: "math8-u06", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u06", name: "Unit 6: Collecting data",
        points: ["6.1 Data collection (types of data, good questions)", "6.2 Sampling (sample size, avoiding bias)"] },
      { id: "math8-u07", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u07", name: "Unit 7: Fractions",
        points: ["7.1 Fractions and recurring decimals", "7.2 Ordering fractions", "7.3 Subtracting mixed numbers", "7.4 Multiplying an integer by a mixed number", "7.5 Dividing an integer by a fraction", "7.6 Making fraction calculations easier"] },
      { id: "math8-u08", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u08", name: "Unit 8: Shapes and symmetry",
        points: ["8.1 Quadrilaterals and polygons", "8.2 The circumference of a circle", "8.3 3D shapes"] },
      { id: "math8-u09", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u09", name: "Unit 9: Sequences and functions",
        points: ["9.1 Generating sequences", "9.2 Finding rules for sequences", "9.3 Using the nth term", "9.4 Representing simple functions"] },
      { id: "math8-u10", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u10", name: "Unit 10: Percentages",
        points: ["10.1 Percentage increases and decreases", "10.2 Using a multiplier"] },
      { id: "math8-u11", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u11", name: "Unit 11: Graphs",
        points: ["11.1 Functions", "11.2 Plotting graphs", "11.3 Gradient and intercept", "11.4 Interpreting graphs"] },
      { id: "math8-u12", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u12", name: "Unit 12: Ratio and proportion",
        points: ["12.1 Simplifying ratios", "12.2 Sharing in a ratio", "12.3 Ratio and direct proportion"] },
      { id: "math8-u13", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u13", name: "Unit 13: Probability",
        points: ["13.1 Calculating probabilities", "13.2 Experimental and theoretical probabilities"] },
      { id: "math8-u14", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u14", name: "Unit 14: Position and transformation",
        points: ["14.1 Bearings", "14.2 The midpoint of a line segment", "14.3 Translating 2D shapes", "14.4 Reflecting shapes", "14.5 Rotating shapes", "14.6 Enlarging shapes"] },
      { id: "math8-u15", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u15", name: "Unit 15: Distance, area and volume",
        points: ["15.1 Converting between miles and kilometres", "15.2 The area of a parallelogram and a trapezium", "15.3 Calculating the volume of triangular prisms", "15.4 Calculating the surface area of triangular prisms and pyramids"] },
      { id: "math8-u16", unit: "Maths: Cambridge Learner's Book 8", pack: "math8-cup", packUnit: "u16", name: "Unit 16: Interpreting and discussing results",
        points: ["16.1 Interpreting and drawing frequency diagrams", "16.2 Time series graphs", "16.3 Stem-and-leaf diagrams", "16.4 Pie charts", "16.5 Representing data", "16.6 Using statistics"] },
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
      { id: "sci7-u1", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u1", name: "Unit 1: Cells",
        points: ["1.1 Plant cells", "1.2 Animal cells", "1.3 Specialised cells", "1.4 Cells, tissues and organs"] },
      { id: "sci7-u2", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u2", name: "Unit 2: Materials and their structure",
        points: ["2.1 Solids, liquids and gases", "2.2 Changes of state", "2.3 Explaining changes of state", "2.4 The water cycle", "2.5 Atoms, elements and the Periodic Table", "2.6 Compounds and formulae", "2.7 Compounds and mixtures"] },
      { id: "sci7-u3", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u3", name: "Unit 3: Forces and energy",
        points: ["3.1 Gravity, weight and mass", "3.2 Formation of the Solar System", "3.3 Movement in space", "3.4 Tides", "3.5 Energy", "3.6 Changes in energy", "3.7 Where does energy go?"] },
      { id: "sci7-u4", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u4", name: "Unit 4: Grouping and identifying organisms",
        points: ["4.1 Characteristics of living organisms", "4.2 Viruses", "4.3 What is a species?", "4.4 Using keys", "4.5 Constructing keys"] },
      { id: "sci7-u5", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u5", name: "Unit 5: Properties of materials",
        points: ["5.1 Metals and non-metals", "5.2 Comparing metals and non-metals", "5.3 Metal mixtures (alloys)", "5.4 Using the properties of materials to separate mixtures", "5.5 Acids and alkalis", "5.6 Indicators and the pH scale"] },
      { id: "sci7-u6", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u6", name: "Unit 6: Earth physics",
        points: ["6.1 Sound waves", "6.2 Reflections of sound (echoes)", "6.3 Structure of the Earth", "6.4 Changes in the Earth", "6.5 Solar and lunar eclipses"] },
      { id: "sci7-u7", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u7", name: "Unit 7: Microorganisms in the environment",
        points: ["7.1 Microorganisms", "7.2 Food chains and webs", "7.3 Microorganisms and decay", "7.4 Microorganisms in food webs"] },
      { id: "sci7-u8", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u8", name: "Unit 8: Changes to materials",
        points: ["8.1 Simple chemical reactions", "8.2 Neutralisation", "8.3 Investigating acids and alkalis", "8.4 Detecting chemical reactions"] },
      { id: "sci7-u9", unit: "Science: Cambridge Learner's Book 7", pack: "sci7-cup", packUnit: "u9", name: "Unit 9: Electricity",
        points: ["9.1 Flow of electricity", "9.2 Electrical circuits", "9.3 Measuring the flow of current", "9.4 Conductors and insulators", "9.5 Adding or removing components"] },
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
      { id: "hist7-ch01", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch01", name: "Ch 1: Tracing Changes Through a Thousand Years",
        points: ["Compare the two maps: al-Idrisi (1154, Arabic, south India at the top) and the French map of the 1720s. Why do they differ?", "How 'Hindustan' changed meaning: Minhaj-i Siraj (13th century: Punjab, Haryana, Ganga–Yamuna lands) vs Babur (the whole subcontinent); what 'foreigner' meant then", "Historians' sources: coins, inscriptions, buildings, manuscripts; why paper mattered; archives; how scribes' copying changed texts (Ziyauddin Barani's two versions)", "New technologies and crops (Persian wheel, spinning wheel; potatoes, corn, chillies, tea, coffee) and new groups: Rajputs, Kayasthas, jatis and jati panchayats", "Amir Khusrau's list of regional languages (1318) and what he said about Sanskrit; region vs empire", "Religion (bhakti, Islam) and why historians reject the British 'Hindu, Muslim, British' periods"] },
      { id: "hist7-ch02", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch02", name: "Ch 2: New Kings and Kingdoms",
        points: ["How new dynasties rose: samantas becoming kings; Dantidurga (Rashtrakuta) and the hiranya-garbha ritual; Kadamba Mayurasharman and Gurjara-Pratihara Harichandra", "How kings ruled: grand titles, sharing power, taxes (Chola inscriptions list 400+, e.g. vetti and kadamai), prashastis (Nagabhata) and copper-plate land grants; Kalhana's history of Kashmir", "The 'tripartite struggle' for Kanauj: Gurjara-Pratiharas, Rashtrakutas, Palas", "Mahmud of Ghazni (997–1030): raids on temples like Somnath; al-Biruni's Kitab al-Hind. Prithviraja III (Chahamana) beat Muhammad Ghori in 1191 but lost in 1192", "The Cholas: Vijayalaya took the Kaveri delta and built Thanjavur; Rajaraja I (985) and Rajendra I (navy, raids); Thanjavur and Gangaikondacholapuram temples; Chola bronzes", "Chola farming and government: Kaveri channels, wells, tanks, sluices; ur, nadu, Vellalas, brahmadeya and the sabha; Uttaramerur rules and lottery; nagarams"] },
      { id: "hist7-ch03", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch03", name: "Ch 3: The Delhi Sultans",
        points: ["Delhi before the Sultans: the Tomara Rajputs, then the Chauhans of Ajmer", "The order of rulers: Rajput dynasties, early Turkish rulers (Qutbuddin Aybak 1206, Iltutmish), Khaljis, Tughluqs, Sayyids, Lodis", "Sources: tawarikh written in Persian; the 'circle of justice' (Fakhr-i Mudabbir)", "Raziyya Sultan (1236–1240) and why Minhaj-us-Siraj disapproved; other women rulers: Rudramadevi, Didda", "Expanding the Sultanate: garrison towns, the 'internal' and 'external' frontiers; mosques built by the Sultans", "How it was run: special slaves (bandagan) and clients as governors; Barani's criticism of Muhammad Tughluq; iqtas and muqtis; taxes (kharaj about 50%, cattle, houses)", "Facing the Mongols: Alauddin Khalji (new garrison town Siri, paying soldiers in cash, controlling market prices) vs Muhammad Tughluq (moving the capital to Daulatabad, token currency)", "Ibn Battuta (from Morocco) on chieftains; the 15th–16th centuries: Sayyids, Lodis, regional kingdoms, and Sher Shah Sur, whose system Akbar followed"] },
      { id: "hist7-ch04", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch04", name: "Ch 4: The Mughal Empire",
        points: ["Who the Mughals were: descended from Genghis Khan and Timur, and why they preferred their Timurid link", "Babur: Panipat 1526 (Ibrahim Lodi), Khanua 1527 (Rana Sanga); Humayun lost to Sher Khan and fled to Iran; the main campaigns of Akbar, Jahangir, Shah Jahan and Aurangzeb", "Succession by coparcenary (shared among sons), not primogeniture; Mughal marriages and relations with the Rajputs; Aurangzeb's insult to Shivaji", "Mansabdars and jagirdars: zat (rank and salary) and sawar (cavalry); why jagirs ran short under Aurangzeb", "Zabt and zamindars: Todar Mal's revenue survey; Abul Fazl's Akbar Nama and Ain-i Akbari", "Akbar's government (subas, subadars, bakhshi, sadr, faujdar, kotwal), the ibadat khana and sulh-i kul; Nur Jahan; wealth and poverty in the 17th century"] },
      { id: "hist7-ch05", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch05", name: "Ch 5: Rulers and Buildings",
        points: ["The Qutb Minar; two kinds of royal buildings (private and public)", "Engineering skills: trabeate vs arcuate (the keystone), limestone cement; Kandariya Mahadeva and the Thanjavur temple (shikhara, garbhagriha)", "Building temples, mosques and tanks: the king as god-like or the 'Shadow of God'; Iltutmish's Hauz-i Sultani", "Why temples were targeted: the Pandyas in Sri Lanka, Rajendra I, Mahmud of Ghazni at Somnath", "Gardens, tombs and forts: chahar bagh, Humayun's tomb (pishtaq, hasht bihisht), Shah Jahan's audience halls (qibla, pietra dura, Orpheus), the Taj Mahal and river-front gardens, Shahjahanabad", "Region and empire: styles shared across regions (Bangla dome, Fatehpur Sikri, Vrindavan); Elsewhere: Gothic churches"] },
      { id: "hist7-ch06", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch06", name: "Ch 6: Towns, Traders and Craftspersons",
        points: ["Kinds of towns: administrative centres (Thanjavur and its Rajarajeshvara temple), temple towns and pilgrimage centres (Somnath, Madurai, Tirupati, Vrindavan, Ajmer)", "The 'lost wax' technique for bronze images", "Small towns: mandapika and hatta; taxes on markets", "Traders big and small: Banjaras, guilds (Manigramam, Nanadesi), Chettiars, Marwari Oswals, Gujarati Baniyas and Bohras; Kabul's trade", "Crafts: Bidri work, the Panchalas or Vishwakarma community, Saliyar weavers; why some towns grew and others shrank", "A closer look: Hampi (Vijayanagara, fell 1565), Surat ('gate to Mecca', hundis), Masulipatnam; European companies, the advance system and 'Black Towns'"] },
      { id: "hist7-ch07", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch07", name: "Ch 7: Tribes, Nomads and Settled Communities",
        points: ["How tribal societies differed from varna-based society (kinship, shared land, oral traditions)", "Tribes in different regions: Gaddis, Nagas, Ahoms, Cheros, Mundas, Santals, Kolis, Bhils, Gonds and others", "Nomads and mobile people: the Banjaras and their tandas (used by Alauddin Khalji and the Mughals)", "Changing society: new jatis within varnas; tribes becoming Rajput clans or lower jatis", "The Gonds: Gondwana, garh, chaurasi (84 villages), barhot (12 villages); Rani Durgawati of Garha Katanga vs the Mughals (1565)", "The Ahoms: came from Myanmar, defeated the bhuiyans, used firearms; Mir Jumla's attack (1662); paiks, khels, buranjis"] },
      { id: "hist7-ch08", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch08", name: "Ch 8: Devotional Paths to the Divine",
        points: ["The idea of a Supreme God and the Puranas; bhakti open to all castes", "Nayanars (63, devotees of Shiva: Tevaram, Tiruvacakam) and Alvars (12, devotees of Vishnu: Divya Prabandham)", "Philosophers: Shankara (Advaita, 8th century) and Ramanuja (Vishishtadvaita, 11th century); Basavanna's Virashaivism", "Saints of Maharashtra (Janeshwar, Namdev, Eknath, Tukaram, Chokhamela; Vitthala at Pandharpur); Nathpanthis, Siddhas and Yogis", "Sufism: zikr, sama, pirs, silsilas, khanqahs, dargahs; the Chishti saints (Muinuddin Chishti of Ajmer, Nizamuddin Auliya)", "North India: Tulsidas, Surdas, Shankaradeva (namghars), Mirabai and Ravidas; Kabir's ideas; Guru Nanak (Kartarpur, langar, nam-dan-isnan) and the Guru Granth Sahib"] },
      { id: "hist7-ch09", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch09", name: "Ch 9: The Making of Regional Cultures",
        points: ["The Cheras and Malayalam: Mahodayapuram, Manipravalam, the Lilatilakam", "The Jagannatha cult at Puri: Anantavarman's temple, and why conquerors wanted to control it", "The Rajputs and traditions of heroism: minstrels' stories, and how women appear in them", "Kathak: from story-tellers and rasa lila to the Mughal court and two gharanas; the other 'classical' dances", "Miniature painting: Jaina, Mughal, Rajput, Basohli and Kangra styles", "Bengal: how Bengali grew, pirs, temple styles (dochala, chauchala; terracotta at Vishnupur), fish as food"] },
      { id: "hist7-ch10", unit: "History: NCERT Our Pasts II (Class 7)", pack: "history7-our-pasts-2", packUnit: "ch10", name: "Ch 10: Eighteenth-Century Political Formations",
        points: ["Why the Mughal empire weakened after Aurangzeb (1707): the Deccan war, powerful subadars, revolts, rival nobles", "Nadir Shah sacked Delhi in 1739; Ahmad Shah Abdali raided 1748–1761", "Three kinds of new states: old Mughal provinces, Rajput watan jagirs, and states won by fighting (Marathas, Sikhs, Jats)", "Hyderabad (Asaf Jah), Awadh (Burhan-ul-Mulk Sa'adat Khan) and Bengal (Murshid Quli Khan, Alivardi Khan, Jagat Seth); revenue farming (ijaradari)", "The Rajputs (Sawai Jai Singh, Jaipur) and the Sikhs: Khalsa (1699), Banda Bahadur, misls, dal khalsa, gurmatas, rakhi; Ranjit Singh at Lahore (1799)", "The Marathas (Shivaji, the Peshwas, chauth and sardeshmukhi, expansion 1720–1761) and the Jats (Churaman, Suraj Mal, Bharatpur)"] },
      { id: "geo7-ch01", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch01", name: "Ch 1: Environment",
        points: ["Environment = everything around us; natural (biotic and abiotic) and human-made", "The four domains: lithosphere, hydrosphere, atmosphere, biosphere", "What an ecosystem is (e.g. a pond, a forest, a desert)", "The human environment: how people changed it (farming, the wheel, trade, industry, the information revolution)", "Why a balance between natural and human environments matters"] },
      { id: "geo7-ch02", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch02", name: "Ch 2: Inside Our Earth",
        points: ["Layers of the Earth: crust (sial on continents ~35 km, sima on ocean floors ~5 km), mantle (to 2900 km), core (nife)", "Crust 1%, mantle 84%, core 15% of the Earth's volume", "Igneous rocks: extrusive (basalt, the Deccan plateau) and intrusive (granite)", "Sedimentary rocks (from sediments; may contain fossils) and metamorphic rocks (clay→slate, limestone→marble)", "The rock cycle; minerals and their uses"] },
      { id: "geo7-ch03", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch03", name: "Ch 3: Our Changing Earth",
        points: ["Lithospheric plates move a few mm a year because of moving magma", "Endogenic (inside) vs exogenic (surface) forces", "Volcanoes; earthquakes: focus, epicentre, seismograph, Richter scale (Bhuj 2001)", "Weathering vs erosion. Rivers: waterfalls, meanders, ox-bow lakes, floodplains, levees, distributaries, deltas", "Sea waves (caves, arches, stacks, cliffs, beaches), glaciers (moraines), wind (mushroom rocks, sand dunes, loess)"] },
      { id: "geo7-ch04", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch04", name: "Ch 4: Air",
        points: ["Composition of air: nitrogen 78%, oxygen 21%; carbon dioxide, the greenhouse effect and global warming", "Five layers: troposphere (~13 km, weather), stratosphere (to 50 km, ozone, planes), mesosphere (meteors burn), thermosphere (ionosphere, radio), exosphere", "Weather vs climate; temperature, insolation, why cities are hotter", "Air pressure (highest at sea level); permanent, seasonal and local winds (e.g. loo)", "Humidity, clouds and precipitation; convectional, orographic (relief) and cyclonic rainfall"] },
      { id: "geo7-ch05", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch05", name: "Ch 5: Water",
        points: ["The water cycle: evaporation, condensation, precipitation, run-off", "Distribution: oceans 97.3%, ice caps 2%, very little fresh water", "Salinity: average 35 parts per thousand; the Dead Sea", "Waves and tsunamis (Indian Ocean tsunami, 26 December 2004)", "Tides (spring and neap) and their uses; warm and cold ocean currents"] },
      { id: "geo7-ch06", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch06", name: "Ch 6: Natural Vegetation and Wildlife",
        points: ["Vegetation depends on temperature and moisture (also slope and soil); forests, grasslands, shrubs", "Tropical evergreen (rainforests) and tropical deciduous (monsoon) forests", "Temperate evergreen, temperate deciduous, Mediterranean ('orchards of the world') and coniferous (taiga) forests", "Grasslands: tropical (savanna, campos, llanos) and temperate (prairie, pampas, veld, steppe, downs)", "Thorny bushes and tundra; animals of each region"] },
      { id: "geo7-ch07", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch07", name: "Ch 7: Human Environment: Settlement, Transport and Communication",
        points: ["Settlements: site, permanent vs temporary, compact vs scattered; transhumance", "Rural and urban settlements; house types suited to the climate", "Four means of transport: roadways, railways, waterways, airways (pros and cons of each)", "Examples: Golden Quadrilateral, Manali–Leh highway, Trans-Siberian Railway, major ports and airports", "Communication and mass media; satellites and the internet"] },
      { id: "geo7-ch08", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch08", name: "Ch 8: Human Environment Interactions: The Tropical and the Subtropical Region",
        points: ["The Amazon basin: equatorial (10°N–10°S), largest river basin, hot and wet all year", "Amazon rainforest plants and animals (toucans, sloths, anaconda, piranha)", "People of the Amazon: manioc, slash-and-burn farming, malocas; the Trans-Amazon highway (1970) and deforestation", "The Ganga–Brahmaputra basin: sub-tropical (10°N–30°N), monsoon, paddy and jute, dense population", "Wildlife (one-horned rhino, Bengal tiger, susu dolphin), cities, pollution and tourism"] },
      { id: "geo7-ch09", unit: "Geography: NCERT Our Environment (Class 7)", pack: "geo7-ncert", packUnit: "ch09", name: "Ch 9: Life in the Deserts",
        points: ["Hot desert: the Sahara (largest desert, 11 countries); climate (up to 57.7°C at Al Azizia), oases", "Sahara plants and animals; Bedouins and Tuaregs; oil and how life is changing", "Cold desert: Ladakh ('La' = pass, 'Dak' = country), Drass; rain shadow, less than 10 cm of rain", "Ladakh plants and animals; people, gompas (Hemis, Thiksey, Shey, Lamayuru)", "Farming, tourism and the Manali–Leh highway; living in balance with nature"] },
      { id: "chi-a01", unit: "A Children's History of India: Ancient India", name: "1. A Land Called Jambudvipa", pack: "chi-history", packUnit: "a01",
        points: ["The landscape: Himalayas, rivers, passes (Khyber, Bolan)", "The monsoons and their place in history", "Discovering the past: archaeologists, inscriptions, coins, manuscripts", "Time before history: the Stone Age, Bhimbetka cave paintings"] },
      { id: "chi-a02", unit: "A Children's History of India: Ancient India", name: "2. A City Named Harappa (2600–1500 BCE)", pack: "chi-history", packUnit: "a02",
        points: ["What a civilization is; discovering the first cities (Mohenjo-daro, 1920s)", "City planning: grid streets, citadel, the Great Bath, drains", "Daily life, religion (mother goddess, 'Pashupati' seal)", "Crafts and trade (Lothal, Mesopotamia); the mysterious seals and script", "Why the cities declined"] },
      { id: "chi-a03", unit: "A Children's History of India: Ancient India", name: "3. The Poets of the Vedas (1500–500 BCE)", pack: "chi-history", packUnit: "a03",
        points: ["Where the Aryans came from; Sapta Sindhu", "The four Vedas and the oral tradition", "Vedic gods (Indra, Agni, Varuna, Surya) and yajnas", "The Ramayana and the Mahabharata; the sutas", "Daily life (janas, sabha and samiti) and the beginnings of varna"] },
      { id: "chi-a04", unit: "A Children's History of India: Ancient India", name: "4. The Rise of Magadha (500–321 BCE)", pack: "chi-history", packUnit: "a04",
        points: ["Rise of kingdoms: janapadas and the sixteen mahajanapadas", "New ideas: the Buddha and Mahavira", "Bimbisara and Ajatasatru of Magadha; Pataliputra", "Trading by land and sea; Alexander's invasion"] },
      { id: "chi-a05", unit: "A Children's History of India: Ancient India", name: "5. The Magnificent Mauryas (321–185 BCE)", pack: "chi-history", packUnit: "a05",
        points: ["Chandragupta Maurya and Chanakya", "Running the empire; Megasthenes", "Bindusara; Ashoka the Great and the Kalinga war", "Ashoka's dhamma; pillars and stupas", "City life and trade"] },
      { id: "chi-a06", unit: "A Children's History of India: Ancient India", name: "6. Kingdoms, Culture and Trade (200 BCE–300 CE)", pack: "chi-history", packUnit: "a06",
        points: ["Indo-Greeks, Sakas, Pahlavas and Kushans", "The Satavahanas", "The Cholas, Pandyas and Cheras; Sangam literature", "Trade, culture, religion and art"] },
      { id: "chi-a07", unit: "A Children's History of India: Ancient India", name: "7. The Golden Guptas (300–500 CE)", pack: "chi-history", packUnit: "a07",
        points: ["Chandragupta I, Samudragupta, Chandragupta II Vikramaditya", "How the Guptas ruled; life and trade", "Gods and temples; building in stone", "Kalidasa; astronomy and maths (Aryabhata)", "Decline of the Guptas"] },
      { id: "chi-a08", unit: "A Children's History of India: Ancient India", name: "8. Southern Sunrise (500–1200 CE)", pack: "chi-history", packUnit: "a08",
        points: ["Chalukyas of Vatapi and Pallavas of Kanchipuram", "Pandyas of Madurai and Cholas of Thanjavur", "Temple towns, sculpture and architecture", "Songs of the saints; trade winds"] },
      { id: "chi-a09", unit: "A Children's History of India: Ancient India", name: "9. A King and a Pilgrim (600–700 CE)", pack: "chi-history", packUnit: "a09",
        points: ["Thaneshwar and Gaur; Harshavardhana becomes king", "Harsha's administration, religion and patronage of the arts", "Hsuan Tsang (Xuanzang) in India", "Embassies to China"] },
      { id: "chi-m01", unit: "A Children's History of India: Medieval India", name: "1. The Arrival of the Muslims (1200–1300 CE)", pack: "chi-history", packUnit: "m01",
        points: ["The age of the three empires; many kingdoms", "Mahmud of Ghazni; the Rajputs", "Muhammad of Ghur", "The Delhi Sultanate and the Slave (Mamluk) dynasty"] },
      { id: "chi-m02", unit: "A Children's History of India: Medieval India", name: "2. The Delhi Sultanates (1300–1526 CE)", pack: "chi-history", packUnit: "m02",
        points: ["The Khalji dynasty", "The Tughlaq dynasty; Timur's invasion", "The Sayyid and Lodi dynasties", "The Sultan and his nobles; administration and land grants"] },
      { id: "chi-m03", unit: "A Children's History of India: Medieval India", name: "3. New Kingdoms Rise (1336–1565 CE)", pack: "chi-history", packUnit: "m03",
        points: ["The rise of Vijayanagar; Krishnadeva Raya", "The Bahmani dynasty and the Deccan Sultanates", "Other regional powers", "Arrival of the Portuguese"] },
      { id: "chi-m04", unit: "A Children's History of India: Medieval India", name: "4. Life under the Sultans", pack: "chi-history", packUnit: "m04",
        points: ["Changes in society", "New thoughts in religion (bhakti and Sufi)", "Language and literature", "Architecture"] },
      { id: "chi-m05", unit: "A Children's History of India: Medieval India", name: "5. Enter the Mughals (1526–1556 CE)", pack: "chi-history", packUnit: "m05",
        points: ["Babur: battles at Panipat and Khanwa", "Humayun", "Sher Shah Sur", "Humayun's return"] },
      { id: "chi-m06", unit: "A Children's History of India: Medieval India", name: "6. Akbar Builds an Empire (1556–1605 CE)", pack: "chi-history", packUnit: "m06",
        points: ["Bairam Khan and the second battle of Panipat", "Building the empire; Jodh Bai", "Akbar's religion", "Running the empire; the flowering of culture"] },
      { id: "chi-m07", unit: "A Children's History of India: Medieval India", name: "7. The Magnificent Mughals (1605–1658 CE)", pack: "chi-history", packUnit: "m07",
        points: ["Jahangir and Empress Nur Jahan", "Arrival of the Europeans", "Shah Jahan, the builder", "Brothers at war"] },
      { id: "chi-m08", unit: "A Children's History of India: Medieval India", name: "8. An Emperor and His Enemies (1658–1707 CE)", pack: "chi-history", packUnit: "m08",
        points: ["Aurangzeb: ruling in the north, his religion", "Battles in the Deccan; revolts", "Rise of the Sikhs and the Marathas", "Later Mughals and why the empire declined"] },
      { id: "chi-m09", unit: "A Children's History of India: Medieval India", name: "9. Living in Mughal Times", pack: "chi-history", packUnit: "m09",
        points: ["City and village; rich and poor", "Women; tribal people", "Trade, education and technology", "Architecture, painting and music"] },
      { id: "chi-b01", unit: "A Children's History of India: British Period", name: "1. The East India Company (1700–1820 CE)", pack: "chi-history", packUnit: "b01",
        points: ["Arrival of European trading companies; Anglo-French rivalry", "The English in Bengal: Plassey (1757) and Buxar (1764)", "Wars with Mysore; the Maratha challenge; taking over Punjab", "Why the Company succeeded"] },
      { id: "chi-b02", unit: "A Children's History of India: British Period", name: "2. The Company Bahadur (1770–1857 CE)", pack: "chi-history", packUnit: "b02",
        points: ["Company administration: civil service, army, police, judiciary", "Exploiting the villages; ruining industry and trade", "Wellesley and the Subsidiary Alliance"] },
      { id: "chi-b03", unit: "A Children's History of India: British Period", name: "3. A Time of Change (1800–1900 CE)", pack: "chi-history", packUnit: "b03",
        points: ["Life in India; the Orientalists", "The spread of modern education", "Rammohun Roy, Henry Derozio, Ishwarchandra Vidyasagar"] },
      { id: "chi-b04", unit: "A Children's History of India: British Period", name: "4. The Great Uprising (1857–1858 CE)", pack: "chi-history", packUnit: "b04",
        points: ["Many revolts: tribal rebellions, princely states, rural resentment", "A sepoy's life; the immediate cause", "How the uprising spread; why it failed", "Changes after 1858"] },
      { id: "chi-b05", unit: "A Children's History of India: British Period", name: "5. A Sleeping Giant Awakens (1885–1909 CE)", pack: "chi-history", packUnit: "b05",
        points: ["Rise of nationalism; Naoroji and the drain of wealth", "Birth of the Indian National Congress (1885); moderates and radicals", "Partition of Bengal; swaraj, swadeshi and boycott", "The Surat split, the Home Rule League, the Muslim League"] },
      { id: "chi-b06", unit: "A Children's History of India: British Period", name: "6. Talking of Satyagraha (1915–1930 CE)", pack: "chi-history", packUnit: "b06",
        points: ["Gandhiji in South Africa; Sabarmati Ashram", "Beginnings of satyagraha in India; Montagu-Chelmsford reforms", "Jallianwala Bagh; the Khilafat and Non-Cooperation movements", "Chauri Chaura and after; the Simon Commission"] },
      { id: "chi-b07", unit: "A Children's History of India: British Period", name: "7. A Long March to Dandi (1930–1942 CE)", pack: "chi-history", packUnit: "b07",
        points: ["Civil Disobedience: why salt? The Dandi March; Dharasana", "The Gandhi-Irwin Pact; Round Table Conferences; Gandhiji in London", "The Government of India Act 1935"] },
      { id: "chi-b08", unit: "A Children's History of India: British Period", name: "8. The Final March to Freedom (1942–1947 CE)", pack: "chi-history", packUnit: "b08",
        points: ["The idea of Pakistan; the princely states", "World War II and the Cripps Mission", "Quit India; the Azad Hind Fauj", "The Cabinet Mission; independence and partition"] },
      { id: "chi-b09", unit: "A Children's History of India: British Period", name: "9. Living in British Times", pack: "chi-history", packUnit: "b09",
        points: ["Changing Indian society", "Life of the sahibs", "Maharajas, nawabs and a nizam", "Stepping out into the world"] },
      { id: "chi-i01", unit: "A Children's History of India: Independent India", name: "1. Building a Nation", pack: "chi-history", packUnit: "i01",
        points: ["India in 1947; the death of the Mahatma", "Writing the Constitution; the first elections", "Making the princely states join India", "Settling the refugees"] },
      { id: "chi-i02", unit: "A Children's History of India: Independent India", name: "2. The Constitution of India", pack: "chi-history", packUnit: "i02",
        points: ["The voice of the people; fundamental rights", "The legislature, the executive and the judiciary", "Symbols of our republic"] },
      { id: "chi-i03", unit: "A Children's History of India: Independent India", name: "3. Making a Difference", pack: "chi-history", packUnit: "i03",
        points: ["The Green Revolution", "Operation Flood", "Bhoodan"] },
      { id: "chi-i04", unit: "A Children's History of India: Independent India", name: "4. Growing up in a Free India", pack: "chi-history", packUnit: "i04",
        points: ["Join the queue!", "Going to school"] },
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
      { id: "eng7-u1", unit: "English: Cambridge Learner's Book 7", name: "Unit 1: Adventure",
        points: ["Read: 'Beware Low-Flying Girls', Around India in 80 Trains, 'Hard is the Journey', Silverfin", "Text types: adventure fiction, travel writing, thematic poetry, a spy story", "Write: summarise genre features; a monologue; a poem's meaning; a story", "Language: sentence types; alliteration and sibilance; powerful verbs", "Speak: pair discussion and prediction; present group views; recount an anecdote"] },
      { id: "eng7-u2", unit: "English: Cambridge Learner's Book 7", name: "Unit 2: 'Hey, You Down There'",
        points: ["Read: 'Hey, You Down There' (science fiction short story)", "Write: a spoken drama; informally about theme; a story with an unusual ending", "Language: sentence openings; compound-complex sentences; formal and informal language", "Speak: pair and group discussion"] },
      { id: "eng7-u3", unit: "English: Cambridge Learner's Book 7", name: "Unit 3: Film and fame",
        points: ["Read: Film Boy; 'Hrithik Roshan says he practises every day to overcome stammering'; The Incredibles film review; 'Thai cave rescue boys meet hero'", "Text types: informative article, film review", "Write: a section of a story; an article; a film review; a speech", "Language: direct speech; types of noun/adjective-noun combinations", "Speak: pair discussion; individual speaking"] },
      { id: "eng7-u4", unit: "English: Cambridge Learner's Book 7", name: "Unit 4: Small but perfect",
        points: ["Read: 'One in Twenty-Three'; haiku and imagist poems; 'The tiny world of Willard Wigan'; explanation of shabtis; 'Micro-artist Willard Wigan'", "Text types: flash fiction, haiku, imagist poetry, explanatory text, magazine article and interview", "Write: flash fiction; analyse a poem; poems; an interview", "Language: time connectives; prefixes", "Speak: pair and group discussion"] },
      { id: "eng7-u5", unit: "English: Cambridge Learner's Book 7", name: "Unit 5: Unusual education",
        points: ["Read: two accounts of different schools; blogs about school uniform; homeschooling article and account; Wonder; The Last Class", "Text types: descriptive accounts, blogs, discussion article, contemporary drama", "Write: an account about school; a letter; a script", "Language: connectives; colons", "Speak: pair and group discussion"] },
      { id: "eng7-u6", unit: "English: Cambridge Learner's Book 7", name: "Unit 6: Life stories",
        points: ["Read: 'Lullaby'; 'The Song of the Old Mother'; biography of Malala Yousafzai; As I Walked Out One Midsummer Morning; Letter to Daniel; Captain Robert Scott's diary; speech by Nelson Mandela", "Text types: thematic poetry, autobiography, diary, persuasive speech", "Write: justify poetry choices; an account of family life; a monologue; analyse language; a letter; a poem; a speech", "Language: rhythm and rhyme; voice; embedded clauses", "Speak: pair and group discussion"] },
      { id: "eng7-u7", unit: "English: Cambridge Learner's Book 7", name: "Unit 7: 'The Travel Agency'",
        points: ["Read: 'The Travel Agency' (fantasy short story)", "Write: about characters, events and settings; a narrative piece; a brochure introduction; analyse character; a diary entry; about theme", "Language: word choice and order; voice and excitement", "Speak: pair and group discussion"] },
      { id: "eng7-u8", unit: "English: Cambridge Learner's Book 7", name: "Unit 8: In the city",
        points: ["Read: The White Tiger; Doha article; Neverwhere; A Christmas Carol; The Sign of Four; 'City Jungle'; 'Last Night, I Saw the City Breathing'; 'Urban Threats'; 'What would the ultimate child-friendly city look like?'", "Text types: informative article, classic fiction, thematic poetry, argument articles", "Write: a travel article; continue a story; a poem about a city", "Language: punctuation; personification; related word forms; perspective", "Speak: pair and group discussion; individual speaking"] },
      { id: "eng7-u9", unit: "English: Cambridge Learner's Book 7", name: "Unit 9: Dangers of the sea",
        points: ["Read: Jaws; 'Why Are We Afraid of Sharks?'; Moby-Dick; And The Ocean Was Our Sky; The Rime of the Ancient Mariner", "Text types: informative article, classic fiction, classic poetry", "Write: describe a sea snake; analyse characters; continue a story; analyse poetic language", "Language: choosing words and phrases; poetic language", "Speak: pair and group discussion; individual speaking"] },
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
