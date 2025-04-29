import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCln-LOhLxDzvebRlWvVMCxyOBrQmAB7yw",
  authDomain: "petsolutionsinventory.firebaseapp.com",
  projectId: "petsolutionsinventory",
  storageBucket: "petsolutionsinventory.appspot.com",
  messagingSenderId: "234344734401",
  appId: "1:234344734401:android:e5cd8e9f2bfec87c3ebe40",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;

