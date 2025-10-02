// --- 1. Firebase SDK Imports & Initialization ---
// Make sure to install firebase: npm install firebase
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


// Initialize Firebase
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
  };
let app,auth,db,provider;
try{
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    console.log("Firebase initialized successfully");
}
catch(error){
    console.warn("Firebase initialization error:", error.message);
    console.warn("Firebase features will be disabled. Please configure your Firebase credentials.");
}
//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   const auth = getAuth(app);
//   const db = getFirestore(app);
  
export { app, auth, db, provider };
