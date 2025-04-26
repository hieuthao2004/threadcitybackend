import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_default_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_default_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_default_api_secret',
  secure: true,
});

export const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image', 
        public_id: filename, 
        overwrite: true,
        folder: 'threadcity', // Organize uploads in a folder
        transformation: [
          { width: 1000, crop: "limit" }, // Resize large images to save bandwidth
          { quality: 'auto' } // Automatically optimize quality
        ]
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// For direct URL uploads (e.g., from external URLs)
export const uploadUrlToCloudinary = (url, filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      url,
      { 
        public_id: filename,
        folder: 'threadcity',
        transformation: [
          { width: 1000, crop: "limit" },
          { quality: 'auto' }
        ]
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};
