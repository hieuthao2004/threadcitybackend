const { initializeApp } = require('firebase/app');
const { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where 
} = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAW1TY-kXHibmQwbjf-ypl9mLGoBMcDbXI",
    authDomain: "thread-e5a38.firebaseapp.com",
    projectId: "thread-e5a38",
    storageBucket: "thread-e5a38.firebasestorage.app",
    messagingSenderId: "964318043900",
    appId: "1:964318043900:web:5a0d028b29176d35f18179"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class DatabaseService {
    async createUser(userData) {
        try {
            const usersRef = collection(db, 'users');
            const docRef = await addDoc(usersRef, userData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async authenticateUser(username, password) {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", username), where("password", "==", password));
            const snapshot = await getDocs(q);
            return snapshot.empty ? null : {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            };
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }
}

module.exports = new DatabaseService();