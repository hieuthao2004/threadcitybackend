import { addDoc, collection, deleteDoc, getDocs, query, where } from "firebase/firestore";

class FollowsModel {
    async isFollowed(follower, following) {
        try {
            const followRef = collection(db, 'follows');
            const q = query(
                followRef,
                where('follower_id', '==', follower),
                where('following_id', '==', following)
            );
            const docSnap = await getDocs(q);
            return !docSnap.empty;
        } catch (error) {
            console.error("Error checking follow status:", error);
            throw error;
        }
    }

    async followPeople(user_id, following_user) {
        try {
            const alreadyFollowed = await this.isFollowed(user_id, following_user);
            if (alreadyFollowed) {
                console.log("Already following");
                return { followed: true };
            }
    
            const content = {
                follower_id: user_id,
                following_id: following_user,
                follow_at: new Date()
            };
    
            const followRef = collection(db, 'follows');
            const docRef = await addDoc(followRef, content);
            return { followed: false, id: docRef.id, ...docRef.data() };
        } catch (error) {
            console.error("Error while following:", error);
            throw error;
        }
    }    

    async unfollowPeople(user_id, following_user) {
        try {
            const followRef = collection(db, 'follows');
            const q = query(
                followRef,
                where("follower_id", "==", user_id),
                where("following_id", "==", following_user)
            );
            const docSnap = await getDocs(q);
            
            if (!docSnap.empty) {
                const docToDelete = docSnap.docs[0];
                await deleteDoc(docToDelete.ref);
                return { unfollowed: true, id: docToDelete.id };
            }
    
            return { unfollowed: false };
        } catch (error) {
            console.error("Error while unfollowing:", error);
            throw error;
        }
    }

    async getFollowers(user_id) {
        try {
            const q = query(
                collection(db, 'follows'),
                where('following_id', '==', user_id)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data().follower_id);
        } catch (error) {
            console.error("Error getting followers:", error);
            throw error;
        }
    }
    
    async getFollowing(user_id) {
        try {
            const q = query(
                collection(db, 'follows'),
                where('follower_id', '==', user_id)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data().following_id);
        } catch (error) {
            console.error("Error getting following:", error);
            throw error;
        }
    } 
}

export default FollowsModel;