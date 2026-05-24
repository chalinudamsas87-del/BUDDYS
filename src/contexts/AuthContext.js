import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ADMIN EMAIL — change this to YOUR email
export const ADMIN_EMAIL = 'chalinudamsas87@gmail.com';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  async function signup(email, password, displayName, username) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    const profileData = {
      uid: result.user.uid,
      email,
      displayName,
      username: username.toLowerCase(),
      bio: '',
      photoURL: '',
      coverURL: '',
      followers: [],
      following: [],
      createdAt: serverTimestamp(),
      isAdmin: email === ADMIN_EMAIL,
      isVerified: email === ADMIN_EMAIL,
      isBanned: false
    };
    await setDoc(doc(db, 'users', result.user.uid), profileData);
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        username: result.user.email.split('@')[0].toLowerCase(),
        bio: '',
        photoURL: result.user.photoURL || '',
        coverURL: '',
        followers: [],
        following: [],
        createdAt: serverTimestamp(),
        isAdmin: result.user.email === ADMIN_EMAIL,
        isVerified: false,
        isBanned: false
      });
    }
    return result;
  }

  async function logout() {
    return signOut(auth);
  }

  async function fetchUserProfile(uid) {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
