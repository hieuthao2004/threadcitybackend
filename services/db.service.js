const { initializeApp } = require('firebase/app');
const { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    doc,
    updateDoc,
    arrayUnion
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
            const usersRef = collection(db, 'accounts');
            const docRef = await addDoc(usersRef, userData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async authenticateUser(username, password) {
        try {
            const usersRef = collection(db, 'accounts');
            const q = query(usersRef, where("u_username", "==", username), where("u_password", "==", password));
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

    async findUserByEmail(email) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where("u_email", "==", email));
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

    async findUserByUsername(username) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where("u_username", "==", username));
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
            const usersRef = collection(db, 'accounts');
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


    async createPost(postData) {
        try {
            const postRef = collection(db, 'posts');
            const docRef = await addDoc(postRef, postData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating post', error);
            throw error;
        }
    }

    async getAllPosts() {
        try {
            const postsRef = collection(db, 'posts');
            const snapshot = getDocs(postsRef);
            return (await snapshot).docs.map(doc => ({
                doc: doc.id,
                ...doc.data()
            }))
        } catch (error) {
            console.log(error);
        }
    }

    async updateUsersPostList(userId, postId) {
        try {
            const userRef = doc(db, "accounts", userId);
            await updateDoc(userRef, {posts: arrayUnion(postId)})
        } catch (error) {
            console.error(error);
            
        }
    }
}

module.exports = new DatabaseService();