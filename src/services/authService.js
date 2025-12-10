import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Email/Password Registration
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email/Password Login
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Apple Sign In
export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    const result = await signInWithPopup(auth, provider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get Current User
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Auth State Observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user profile is complete
export const checkUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        exists: true,
        verified: userData.verified || false,
        profileComplete: !!(userData.name && userData.age && userData.gender && userData.contactNumber)
      };
    }
    return { exists: false, verified: false, profileComplete: false };
  } catch (error) {
    console.error('Error checking user profile:', error);
    return { exists: false, verified: false, profileComplete: false };
  }
};