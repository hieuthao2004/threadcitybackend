import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FB_KEY,
    authDomain: "thread-e5a38.firebaseapp.com",
    projectId: "thread-e5a38",
    storageBucket: "thread-e5a38.firebasestorage.app",
    messagingSenderId: "964318043900",
    appId: "1:964318043900:web:5a0d028b29176d35f18179"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
