import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAou-nMvj4Awjf6L-SXPwE9bAdJJniu5VE",
  authDomain: "lostandfound-d124f.firebaseapp.com",
  projectId: "lostandfound-d124f",
  storageBucket: "lostandfound-d124f.appspot.com",
  messagingSenderId: "1076821259668",
  appId: "1:1076821259668:web:2aed719e07f248cdd74b81"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);