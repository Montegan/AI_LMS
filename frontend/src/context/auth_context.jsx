import React, { useState, useEffect, useContext, createContext } from 'react';
import { app, auth, db, provider } from "../firebase_config";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import Loading from '../components/Loading';
// --- 2. Authentication Context ---
const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Will hold user profile data from Firestore
  const [loading, setLoading] = useState(true); // To show a loading state during auth check

  useEffect(() => {
    // This listener runs on component mount and whenever auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, now fetch their profile from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userDocRef);
        console.log(docSnap.data());
        if (docSnap.exists()) {
          // User profile exists, set it in our state
          setUser(docSnap.data());
        } else {
          // User authenticated, but no profile in Firestore. 
          // This could happen if the setDoc call failed after sign-in.
          // We log them out to force a retry.
          console.log("User authenticated but no Firestore profile. Logging out.");
          await signOut(auth);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // --- DIAGNOSTIC LOG ---
      console.log("Authenticated user email:", firebaseUser.email);
      // --------------------

      // After successful sign-in, check if a user document already exists.
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // If the document does not exist, this is a first-time sign-in.
        // We create the user profile document in Firestore.
        // The Firestore Security Rules will ALLOW or DENY this write operation.
        
        const email = firebaseUser.email;
        let userRole = null;

        // --- FIX: Use the correct SFBU domains for the client-side check ---
        if (email.endsWith('@student.sfbu.edu')) {
          userRole = 'student';
        } else if (email.endsWith('@sfbu.edu')) {
          userRole = 'faculty';
        } else {
          // This is a client-side check for immediate feedback.
          // The security rules are the real enforcement.
          console.error("Invalid email domain detected on client.");
          await signOut(auth); // Sign the user out
          // --- FIX: Update the alert message to be specific ---
          alert("Sign-in failed. Please use a valid SFBU school account (@sfbu.edu or @student.sfbu.edu).");
          return; // Stop the function here
        }

        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'N/A',
          photoURL: firebaseUser.photoURL || null,
          role: userRole,
          createdAt: new Date(), // Use JS Date object for simplicity here
        });
      }
      // If the doc exists, onAuthStateChanged will handle setting the user state.
      // If we just created it, onAuthStateChanged will also pick it up.
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // This will catch general sign-in errors AND permission errors from Firestore rules.
      // --- FIX: Update the alert message to be specific ---
      alert("Sign-in failed. Please use a valid SFBU school account (@sfbu.edu or @student.sfbu.edu).");
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
  };

  if (loading) {
    return (
        <>
        <Loading/>
        </>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
