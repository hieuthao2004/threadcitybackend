import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../services/db.service.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';

class UsersModel {
    async createUser(userData) {
        try {
            const usersRef = collection(db, 'accounts');
            const docRef = await addDoc(usersRef, userData);
            
            return {
                id: docRef.id,
                ...userData
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findUser(username) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where("u_username", "==", username));
            const snapshot = await getDocs(q);
            return snapshot.empty ? null : {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            }
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async getUserData(u_username) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where('u_username', '==', u_username));
            const docSnap = await getDocs(q);
            const allData = docSnap.docs[0].data();
            const { u_password, ...safeData } = allData;
            return {
                doc: docSnap.docs[0].id,
                ...safeData,
            };
        } catch (error) {
            console.error(error);
        }
    }

    async getUserById(u_id) {
        try {
            const accountRef = doc(db, 'accounts', u_id);
            const snapDoc = await getDoc(accountRef);
    
            if (!snapDoc.exists()) {
                throw new Error('User not found');
            }
    
            const { u_password, ...safeUserData } = snapDoc.data();
            return safeUserData;
        } catch (error) {
            console.error("Error getting user:", error);
            throw error;
        }
    }

    async updateUserData(u_id, content) {
        try {
            const userRef = doc(db, 'accounts', u_id);
            
            const updateContent = {
                ...content,
                u_updatedAt: new Date()
            };
            
            await updateDoc(userRef, updateContent);
            
            const updatedDoc = await getDoc(userRef);
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            };
        } catch (error) {
            console.error("Update user error:", error);
            throw new Error("Failed to update user data");
        }
    }

    async getUserComments(u_id) {
        try {
            const cmtRef = collection(db, 'comments');
            const q = query(cmtRef, where('user', '==', u_id));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                return [];
            } else {
                const getAllComments = snapshot.docs.map(doc => ({
                    cmt_id: doc.id,
                    ...doc.data()
                }));
                return getAllComments;
            }
        } catch (error) {
            console.error("Error when getting all comments");
        }
    }

    async getUserPosts(username) {
        try {
            const userRef = collection(db, 'posts');
            const q = query(userRef, where('p_creater', '==', username), where('p_is_visible', '==', true));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const getAllPosts = snapshot.docs.map(doc => ({
                    post_id: doc.id,
                    ...doc.data()
                }))
                return getAllPosts;
            } else {
                console.log("No post is found");
                return null;
            }
        } catch (error) {
            console.error("Error when getting posts");
        }
    }

    async getAllUserSavePosts(u_id) {
        try {
            const savePostsRef = collection(db, 'savedposts');
            const q = query(savePostsRef, where('u_id', '==', u_id));
            const snapshot =  await getDocs(q);
            if (snapshot.empty) {
                return [];
            } else {
                const getAllSavedPosts = snapshot.docs.map(doc => ({
                    savePostId: doc.id,
                    ...doc.data()
                }));
                return getAllSavedPosts;
            }
        } catch (error) {
            console.error("Error when getting all saved posts");
        }
    }

    async checkUserExistByEmail(email) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where("u_email", "==", email));
            const snapshot = await getDocs(q);
            return snapshot.empty ? false : true;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async checkUserExistByUsername(username) {
        try {
            const userRef = collection(db, 'accounts');
            const q = query(userRef, where("u_username", "==", username));
            const snapshot = await getDocs(q);
            return snapshot.empty ? false : true
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    }

    async getUsername(u_id) {
        try {
            const userRef = doc(db, 'accounts', u_id);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                return docSnap.data().u_username;
            } else {
                return null
            }
        } catch (error) {
            console.error(error);
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

    async updateAvatar(userId, imageUrl) {
        try {
            const userRef = doc(db, 'accounts', userId);
            await updateDoc(userRef, {
                u_avatar: imageUrl
            });
            return true;
        } catch (error) {
            console.error("Error updating avatar:", error);
            throw error;
        }
    }

    /**
     * Find a user by their email address
     */
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
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Generate and store password reset token for a user
     */
    async createPasswordResetToken(userId) {
        try {
            // Generate a secure random token
            const resetToken = crypto.randomBytes(32).toString('hex');
            
            // Create token hash to store in the database
            const resetTokenHash = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            
            // Set expiration time (1 hour from now)
            const resetTokenExpires = new Date();
            resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
            
            // Update user with the reset token and expiry
            const userRef = doc(db, 'accounts', userId);
            await updateDoc(userRef, {
                passwordResetToken: resetTokenHash,
                passwordResetExpires: resetTokenExpires
            });
            
            // Return the unhashed token to be sent via email
            return resetToken;
        } catch (error) {
            console.error('Error creating password reset token:', error);
            throw error;
        }
    }

    /**
     * Verify if a reset token is valid and not expired
     */
    async verifyPasswordResetToken(resetToken) {
        try {
            // Create hash of the provided token to compare with stored hash
            const resetTokenHash = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');
            
            // Find user with this token
            const userRef = collection(db, 'accounts');
            const q = query(
                userRef, 
                where("passwordResetToken", "==", resetTokenHash),
                where("passwordResetExpires", ">", new Date())
            );
            const snapshot = await getDocs(q);
            
            if (snapshot.empty) {
                return null;
            }
            
            // Return the user if token is valid
            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            };
        } catch (error) {
            console.error('Error verifying reset token:', error);
            throw error;
        }
    }

    /**
     * Reset the user's password
     */
    async resetPassword(userId, newPassword) {
        try {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update user with new password and remove reset token fields
            const userRef = doc(db, 'accounts', userId);
            await updateDoc(userRef, {
                u_password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            });
            
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    }
}

export default UsersModel;