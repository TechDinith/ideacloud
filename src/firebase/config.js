import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDO2SCMFSi76FUUDg36qYDnJDC3oeyy5jQ",
  authDomain: "prods-b865e.firebaseapp.com",
  projectId: "prods-b865e",
  storageBucket: "prods-b865e.firebasestorage.app",
  messagingSenderId: "903997226342",
  appId: "1:903997226342:web:cdd1de254add012e4d9ca7",
  measurementId: "G-4HMPHRKXFJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
