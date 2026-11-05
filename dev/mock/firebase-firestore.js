// Demo-mode stand-in for firebase-firestore: an in-memory database saved to
// localStorage, with live onSnapshot updates. Covers only what the app uses.
const KEY = "gia-demo-db";
const TS = "__ts";
const revive = (v) => v && typeof v === "object" && v[TS] ? stamp(v[TS]) : v;
const stamp = (ms) => ({ [TS]: ms, toDate: () => new Date(ms), toMillis: () => ms });
let data = {};
try { data = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { data = {}; }
for (const col of Object.values(data)) for (const d of Object.values(col)) for (const k in d) d[k] = revive(d[k]);
const save = () => localStorage.setItem(KEY, JSON.stringify(data, (k, v) => v && v[TS] ? { [TS]: v[TS] } : v));
const listeners = new Set();
const notify = () => { save(); for (const l of [...listeners]) l(); };
const clone = (o) => { const c = {}; for (const k in o) c[k] = o[k]; return c; };

export function getFirestore() { return {}; }
export function collection(db, name) { return { kind: "col", name }; }
export function doc(db, name, id) { return { kind: "doc", name, id }; }
export function query(ref) { return ref; }
export function serverTimestamp() { return stamp(Date.now()); }

const snapDoc = (name, id) => {
  const d = data[name]?.[id];
  return { id, exists: () => !!d, data: () => d ? clone(d) : undefined };
};
const snapCol = (name) => ({ docs: Object.keys(data[name] || {}).map(id => snapDoc(name, id)) });

export async function getDoc(ref) { return snapDoc(ref.name, ref.id); }
export async function getDocs(ref) { return snapCol(ref.name); }
export async function setDoc(ref, val, opts) {
  data[ref.name] ||= {};
  data[ref.name][ref.id] = opts?.merge ? { ...(data[ref.name][ref.id] || {}), ...val } : { ...val };
  notify();
}
export async function addDoc(ref, val) {
  const id = Math.random().toString(36).slice(2, 12);
  data[ref.name] ||= {};
  data[ref.name][id] = { ...val };
  notify();
  return { id };
}
export async function updateDoc(ref, patch) {
  if (!data[ref.name]?.[ref.id]) throw new Error("No document to update");
  Object.assign(data[ref.name][ref.id], patch);
  notify();
}
export async function deleteDoc(ref) { if (data[ref.name]) delete data[ref.name][ref.id]; notify(); }
export function onSnapshot(ref, cb) {
  const fire = () => cb(ref.kind === "col" ? snapCol(ref.name) : snapDoc(ref.name, ref.id));
  listeners.add(fire);
  setTimeout(fire, 0);
  return () => listeners.delete(fire);
}
