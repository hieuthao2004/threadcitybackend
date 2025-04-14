import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../services/db.service.js";

class UsersModel {
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

    async loginStatus(userId) {
        try {
            const userRef = doc(db, 'accounts', userId);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const status = docSnap.data().u_status;
                if (!status) {
                    await updateDoc(userRef, { u_status: true });
                }
            } else {
                console.log("User not found");
            }
        } catch (error) {
            console.error("Error updating login status:", error);
        }

    }    

    async logoutStatus(userId) {
        try {
            const userRef = doc(db, 'accounts', userId);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                await updateDoc(userRef, { u_status: false });
            } else {
                console.log("User not found");
            }
        } catch (error) {
            console.error("Error updating logout status:", error);
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
}

export default UsersModel;