// Demo-mode stand-in for firebase-auth: signs in straight away as ?demo=gia (default) or ?demo=mum.
import { PEOPLE } from "../../firebase-config.js";
const who = new URLSearchParams(location.search).get("demo") === "mum" ? "Christabel" : "Gia";
const email = Object.keys(PEOPLE).find(e => PEOPLE[e] === who) || `${who.toLowerCase()}@example.com`;
export function getAuth() { return { currentUser: { email } }; }
export function onAuthStateChanged(auth, cb) { setTimeout(() => cb(auth.currentUser), 0); return () => {}; }
export async function signInWithEmailAndPassword() {}
export async function sendPasswordResetEmail() {}
export async function signOut() { localStorage.removeItem("gia-demo-db"); location.reload(); } // "Log out" in demo = reset the demo data
