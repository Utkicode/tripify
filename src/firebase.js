// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Analytics optional

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdVXMyGL7v-nHZX72GyW8jvwfuu1xV6g0",
    authDomain: "tripify-c49b6.firebaseapp.com",
    projectId: "tripify-c49b6",
    storageBucket: "tripify-c49b6.firebasestorage.app",
    messagingSenderId: "81469704106",
    appId: "1:81469704106:web:59869a667c62b31b7f0dd3",
    measurementId: "G-X8Q4MB53P6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
