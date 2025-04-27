import { EVENTS } from '../events.js';
import { uploadBufferToCloudinary } from '../../middleware/uploadImage.js';
import socketService from '../../services/socket.service.js';

const imageHandler = (io, socket) => {
  // Handle profile image upload
  socket.on(EVENTS.UPLOAD_AVATAR, async (data) => {
    try {
      if (!socket.userId) {
        // Use socketService instead of direct socket emit
        return socketService.emitToUser(socket.id, EVENTS.ERROR, { 
          message: 'Authentication required' 
        });
      }

      const { image, filename } = data;
      // The image should be a base64 encoded string from the client
      const buffer = Buffer.from(image.split(',')[1], 'base64');
      
      // Generate a unique filename
      const uniqueFilename = `${socket.userId}_avatar_${Date.now()}`;
      
      // Upload to Cloudinary
      const result = await uploadBufferToCloudinary(buffer, uniqueFilename);
      
      // Return success with image URL using socketService
      socketService.emitToUser(socket.id, EVENTS.AVATAR_UPLOADED, { 
        success: true, 
        imageUrl: result.secure_url,
        publicId: result.public_id
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      socketService.emitToUser(socket.id, EVENTS.ERROR, { 
        message: 'Failed to upload avatar' 
      });
    }
  });

  // Handle post image upload
  socket.on(EVENTS.UPLOAD_POST_IMAGE, async (data) => {
    try {
      if (!socket.userId) {
        // Use socketService instead of direct socket emit
        return socketService.emitToUser(socket.id, EVENTS.ERROR, { 
          message: 'Authentication required' 
        });
      }

      const { image, postId } = data;
      // The image should be a base64 encoded string from the client
      const buffer = Buffer.from(image.split(',')[1], 'base64');
      
      // Generate a unique filename
      const uniqueFilename = `${socket.userId}_post_${postId || Date.now()}`;
      
      // Upload to Cloudinary
      const result = await uploadBufferToCloudinary(buffer, uniqueFilename);
      
      // Return success with image URL using socketService
      socketService.emitToUser(socket.id, EVENTS.POST_IMAGE_UPLOADED, { 
        success: true, 
        imageUrl: result.secure_url,
        publicId: result.public_id,
        postId: postId
      });
      
    } catch (error) {
      console.error('Error uploading post image:', error);
      socketService.emitToUser(socket.id, EVENTS.ERROR, { 
        message: 'Failed to upload post image' 
      });
    }
  });
};

export default imageHandler;