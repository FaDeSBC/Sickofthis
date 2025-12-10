import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Create or Update User Profile
export const createUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      uid: userId,
      verified: false,
      createdAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get User Profile
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update User Profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload Profile Photo
export const uploadProfilePhoto = async (userId, imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile/${userId}/profile.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with photo URL
    await updateUserProfile(userId, { profilePhoto: downloadURL });
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload ID Document
export const uploadIDDocument = async (userId, imageUri, side) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `ids/${userId}/${side}.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update user profile with ID URL
    const updateField = side === 'front' ? 'idFront' : 'idBack';
    await updateUserProfile(userId, { [updateField]: downloadURL });
    
    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify User (Admin function - would typically be done through admin panel)
export const verifyUser = async (userId) => {
  try {
    await updateUserProfile(userId, { verified: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};