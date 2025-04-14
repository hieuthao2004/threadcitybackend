import { addDoc, collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/db.service.js";

class PostsModel {
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

    async findPostById(id) {
        try {
            const postRef = collection(db, 'posts', id);
            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
        }
    }
}

export default PostsModel;