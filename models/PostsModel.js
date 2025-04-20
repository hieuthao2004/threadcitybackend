import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
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

    async getAllPosts(u_id) {
        try {
            const postRef = collection(db, 'posts');
            const snapshot = await getDocs(postRef); 
    
            if (snapshot.empty) {
                return [];
            }
    
            const posts = snapshot.docs.map(doc => ({
                p_id: doc.id,
                ...doc.data(),
            }));
    
            const hiddenPosts = await this.getHiddenPostsByUser(u_id);
    
            return posts.filter(post => !hiddenPosts.includes(post.p_id));
        } catch (error) {
            console.error("Error in getAllPosts:", error);
            throw error;
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

    async updatePost(user_id, p_id, content) {
        try {
            const postRef = doc(db, 'posts', p_id);
            const snapDoc = await getDoc(postRef);
            if (snapDoc.exists()) {
                if (user_id === snapDoc.data().u_id) {
                    return await updateDoc(postRef,
                        {
                            p_content: content,
                            p_updateAt: new Date()
                        });
                } else {
                    throw new Error("Not the same user to update the post");
                }
            } else {
                throw new Error("No post found!")
            }
        } catch (error) {
            console.error(error);
        }
    }

    async hidePost(content) {
        try {
            const postRef = collection(db, 'hidden_posts');
            await addDoc(postRef, content);
        } catch (error) {
            console.error(error);
        }
    }

    async getHiddenPostsByUser(u_id) {
        try {            
            const hiddenPostsRef = collection(db, 'hidden_posts');
            const q = query(hiddenPostsRef, where('user_id', '==', u_id));
            const snapshot = await getDocs(q);
    
            if (snapshot.empty) {
                console.log(`No hidden posts found for user: ${u_id}`);
                return [];
            }
    
            const postIDs = snapshot.docs.map(doc => doc.data().post);
            console.log(postIDs);
            
            return postIDs;
        } catch (error) {
            console.error("Error fetching hidden posts:", error);
            throw new Error("Could not fetch hidden posts");
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

    async createComment(content) {
        try {
            const commentRef = collection(db, 'comments');
            const docRef = addDoc(commentRef, content);
            return (await docRef).id;
        } catch (error) {
            console.error(error);
        }
    }

    async getCommentByUserID(u_id) {

    }

    async getAllComments(p_id, u_id) {
        try {
            const q = query(collection(db, 'comments'), where('post', '==', p_id));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return [];
            } else {
                const comments = snapshot.docs.map(doc => ({
                    cmt_id: doc.id,
                    ...doc.data()
                }));
                const hiddenComments = await this.getHiddenCommentsByUser(u_id, p_id);
                return comments.filter(comment => !hiddenComments.includes(comment.cmt_id));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async getHiddenCommentsByUser(u_id, p_id) {
        const q = query(collection(db, 'hidden_comments'), where('user_id', '==', u_id), where('post', '==', p_id));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => doc.data().comment_id);
    }

    async updateComment(u_id, p_id, c_id, newContent) {
        try {
            const docRef = doc(db, "comments", c_id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.user === u_id && data.post === p_id) {
                    await updateDoc(docRef, {content: newContent, c_updateAt: new Date()})
                } else {
                    throw new Error("Unauthorized")
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async hideComment(content) {
        try {
            const hiddenRef = collection(db, 'hidden_comments');
            await addDoc(hiddenRef, content);
        } catch (error) {
            console.error(error);
        }
    }

    // only own commenters and post owner can delete the comment
    async deleteComment(userId, postId, commentId) {
        try {
            const commentRef = doc(db, "comments", commentId);
            const commentSnap = await getDoc(commentRef);
    
            if (!commentSnap.exists()) throw new Error("Comment not found");
    
            const commentData = commentSnap.data();
    
            if (commentData.user === userId) {
                await deleteDoc(commentRef);
            }
    
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);
    
            if (postSnap.exists() && postSnap.data().creator === userId) {
                await deleteDoc(commentRef);
            }
    
            throw new Error("You are not authorized to delete this comment");
    
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
}

export default PostsModel;