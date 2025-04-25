import { addDoc, collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/db.service.js";

class NotificationsModel {
    async createNotification( receiver_id, sender_id, type, post_id, message) {
        const notificationRef = collection(db, 'notifications');
        const content = {
            receiver_id: receiver_id,
            sender_id: sender_id,
            noti_type: type,
            post_id: post_id,
            message: message,
            createAt: new Date()
        }
        try {
            const createNoti = await addDoc(notificationRef, content);
            return createNoti.id
        } catch (error) {
            console.error("Error in creating notification");
        }
    }

    async getAllNotifications(receiver_id) {
        try {
            const notiRef = collection(db, 'notifications');
            const q = query(notiRef, where("receiver_id", "==", receiver_id));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return [];
            }

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting notifications:", error);
            throw error;
        }
    }

    async deleteNotification(sender_id, receiver_id, post_id = null, noti_type = null) {
        try {
            const notiRef = collection(db, 'notifications');
            const conditions = [
                where("sender_id", "==", sender_id),
                where("receiver_id", "==", receiver_id)
            ];

            if (post_id) {
                conditions.push(where("post_id", "==", post_id));
            }

            if (noti_type) {
                conditions.push(where("noti_type", "==", noti_type));
            }

            const q = query(notiRef, ...conditions);
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("No matching notifications to delete.");
                return;
            }

            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

        } catch (error) {
            console.error("Error deleting notification:", error);
            throw error;
        }
    }
}

export default NotificationsModel;