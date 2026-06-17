// ============================================================
// Wahh Kids — Firebase configuration
// ------------------------------------------------------------
// HOW TO CONNECT YOUR STORE TO A REAL DATABASE (free):
//
// 1. Go to https://console.firebase.google.com and create a project.
// 2. Add a "Web app" (</> icon) — Firebase gives you a config object.
// 3. Paste the values from that object below (replace the empty "" parts).
// 4. In the console: build → Firestore Database → Create database (production mode).
// 5. build → Authentication → Sign-in method → enable "Email/Password".
// 6. Authentication → Users → "Add user": create your admin email + password.
// 7. Firestore → Rules tab → paste the rules shown in the setup guide → Publish.
// 8. Save this file (commit on GitHub) — your store is now LIVE-connected!
//
// Note: these web config values are NOT secret — they're safe to be public.
// Security is enforced by the Firestore Rules, not by hiding these.
// Until you fill this in, the store runs in local "demo" mode automatically.
// ============================================================

export const FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Firebase SDK version loaded from the CDN (no install needed)
export const FIREBASE_VERSION = "10.12.0";
