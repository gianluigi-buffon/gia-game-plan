// =============================================================
//  STEP 1 OF SETUP — paste Gia's Firebase project keys below.
//  (Full instructions are in README.md → Part A.)
//
//  You get these from the Firebase Console:
//  Project settings ▸ General ▸ "Your apps" ▸ SDK setup & config.
//  Copy the values into the quotes below. Nothing else to change.
//  (These web keys are safe to be public; the security rules protect the data.)
// =============================================================

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Who is who: the two login emails and their display names.
// The app works out who is the parent from this ("Christabel").
export const PEOPLE = {
  "giasamuel2013@gmail.com": "Gia",
  "christabelsingh@gmail.com": "Christabel",
};
