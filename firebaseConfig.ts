import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth'; // 
import { getFirestore } from 'firebase/firestore'; // 
const firebaseConfig = {
  apiKey: "AIzaSyDqpQ5E-rwSfNvJ0DOG_OFP4QQYtpV2jAI",
  authDomain: "fitnessapp-23913.firebaseapp.com",
  projectId: "fitnessapp-23913",
  storageBucket: "fitnessapp-23913.appspot.com",
  messagingSenderId: "1003052186228",
  appId: "1:1003052186228:web:a82cee279a4f4671d3af21"
};
console.time("🔧 Firebase Init");

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
console.timeEnd("🔧 Firebase Init");
