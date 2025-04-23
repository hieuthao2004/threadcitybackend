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
    
            return posts.filter(post => post.p_is_visible !== false && !hiddenPosts.includes(post.p_id));
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

    async getPostOwner(p_id) {
        try {
            const postRef = doc(db, 'posts', p_id);
            const docSnap = await getDoc(postRef);
            return docSnap.data().u_id;
        } catch (error) {
            console.error("Error getting post owner:", error);
            throw error;
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
    

    async softDeletePost(p_id, u_id) {
        try {
            const postRef = doc(db, 'posts', p_id);
            const docSnap = getDoc(postRef);
            const postInfo = (await docSnap).data();
            if (postInfo.u_id === u_id) {
                await updateDoc(postRef, {p_is_visible: false});
            } else {
                throw new Error("Unauthorized to delete the post")
            }
        } catch (error) {
            console.error("Error when removing post" + error);
        }
    }

    async isLiked(u_id, p_id) {
        try {            
            const q = query(collection(db, 'likes'), where('user_id', '==', u_id), where('post_id', '==', p_id));
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
                    user_id: u_id,
                    post_id: p_id,
                    likedAt: new Date()
                });  
                return true;
            } else {
                return false;
            } 
        } catch (error) {
            console.error(error);
        }
    }

    async unLikedPost(u_id, p_id) {
        try {
            const q = query(
                collection(db, 'likes'),
                where('user_id', '==', u_id),
                where('post_id', '==', p_id)
            );
            const docSnap = await getDocs(q);
    
            if (docSnap.empty) return false;
    
            for (const doc of docSnap.docs) {
                await deleteDoc(doc.ref); 
            }
    
            return true;
        } catch (error) {
            console.error("Error unliking the post:", error);
            return false;
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
        try {
            const q = query(
                collection(db, 'hidden_comments'),
                where('user_id', '==', u_id),
                where('post', '==', p_id)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return []
            } else {
                return snapshot.docs.map(doc => doc.data().comment_id);
            }
        } catch (error) {
            console.error("Error when getting hidden comments by user");
        }
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
    
            // Nếu là người tạo comment → được xoá
            if (commentData.user === userId) {
                await deleteDoc(commentRef);
                return true;
            }
    
            // Nếu là chủ post → cũng được xoá
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);
    
            if (postSnap.exists() && postSnap.data().u_id === userId) {
                await deleteDoc(commentRef);
                return true;
            }
    
            throw new Error("You are not authorized to delete this comment");
    
        } catch (error) {
            console.error("deleteComment error:", error);
            throw error;
        }
    }    

    async isSaved(username, p_id) {
        try {
            const q = query(
                collection(db, 'savedposts'),
                where('user_username', '==', username),
                where('post_id', '==', p_id)
            );
            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error("Error when checking saved post:", error);
            throw error;
        }
    }
    
    async savePost(username, p_id) {
        try {
            const isPostSaved = await this.isSaved(username, p_id);
            if (isPostSaved) {
                return { isPostSaved: true };
            }
    
            const content = {
                user_username: username,
                post_id: p_id,
                saveDate: new Date()
            };
    
            const snapdoc = await addDoc(collection(db, 'savedposts'), content);
            return { isPostSaved: false, id: snapdoc.id };
        } catch (error) {
            console.error("Error when saving post:", error);
            throw error;
        }
    }

    async getSavePost(username, p_id) {
        try {
            const q = query(
                collection(db, 'savedposts'),
                where('user_username', '==', username),
                where('post_id', '==', p_id)
            );
            const snapDoc = await getDocs(q);
            if (snapDoc.empty) return null;
    
            const docData = snapDoc.docs[0];
            return {
                savePostId: docData.id,
                ...docData.data()
            };
        } catch (error) {
            console.error("Error when getting saved post:", error); 
            throw error;
        }
    }
    
    async deleteSavePost(username, p_id) {
        try {
            const getSavePostId = await this.getSavePost(username, p_id);
            const savedPostRef = doc(db, 'savedposts', getSavePostId.savePostId);
            await deleteDoc(savedPostRef);
        } catch (error) {
            console.error("Error when deleting saved post");
        }
    }

    async isReposted(username, p_id) {
        try {
            const repostRef = collection(db, 'reposts');
            const q = query(
                repostRef,
                where("username", "==", username),
                where("post_id", "==", p_id)
            );
            const docSnap = await getDocs(q);
            return !docSnap.empty;
        } catch (error) {
            console.error("Error when checking repost:", error);
            throw error;
        }
    }

    async createRepost(content) {
        try {
            const repostRef = collection(db, 'reposts');
            const docSnap = await addDoc(repostRef, content);
            return docSnap.id;
        } catch (error) {
            console.error("Error when reposting a post");
        }
    }

    async getRepostedPost(p_id, u_id) {
        try {
            const repostRef = collection(db, 'reposts');
            const q = query(
                repostRef,
                where("post_id", "==", p_id),
                where("user_id", "==", u_id)
            );
            const docSnap = await getDocs(q);
    
            if (docSnap.empty) {
                return null;
            }
    
            return {
                id: docSnap.docs[0].id,
                ...docSnap.docs[0].data()
            };
        } catch (error) {
            console.error("Error when getting reposted post:", error);
            throw error;
        }
    }
    
    async deleteRepost(u_id, p_id) {
        try {
            const repost = await this.getRepostedPost(p_id, u_id);
            if (repost) {
                const repostRef = doc(db, 'reposts', repost.id);
                await deleteDoc(repostRef);
            }
        } catch (error) {
            console.error("Error when deleting repost:", error);
        }
    }
    
}

export default PostsModel;