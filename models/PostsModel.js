import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
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

    async findPostById(p_id) {
        try {
            const postRef = doc(db, 'posts', p_id);
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

    async updatePost(p_id, content) {
        try {
            const postRef = doc(db, 'posts', p_id);
            const snapDoc = await getDoc(postRef);
            if (snapDoc.exists()) {
                return await updateDoc(postRef, {p_content: content, p_updateAt: new Date()});
            }
        } catch (error) {
            console.error(error);
        }
    }

    async deletePost(p_id) {

    }

    async isLiked(u_id, p_id) {
        try {            
            const q = query(collection(db, 'likes'), where('user_id', '==', u_id), where('post', '==', p_id));
            const docSnap = await getDocs(q);
            if (docSnap.empty) {
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async likePost(u_id, p_id) {
        try {    
            const isLiked = await this.isLiked(u_id, p_id);
            if (!isLiked) {
                await addDoc(collection(db, 'likes'), {
                    user: u_id,
                    post: p_id,
                    likedAt: new Date()
                });  
            }                
        } catch (error) {
            console.error(error);
        }
    }

    async unLikedPost(u_id, p_id) {
        try {
            const q = query(
                collection(db, 'likes'),
                where('user', '==', u_id),
                where('post', '==', p_id)
            );
            const docSnap = await getDocs(q);
    
            for (const doc of docSnap.docs) {
                await deleteDoc(doc.ref); 
            }
        } catch (error) {
            console.error("Error unliking the post:", error);
        }
    }
    
}

export default PostsModel;