import multer from 'multer';
import { uploadBufferToCloudinary } from '../middleware/uploadImage.js';

const upload = multer({ storage: multer.memoryStorage() });

const uploadImageMiddleware = [
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) return next();

      const fileName = `${req.userId || "anon"}_${Date.now()}`;
      const result = await uploadBufferToCloudinary(req.file.buffer, fileName);

      req.imageUrl = result.secure_url;
      req.cloudinaryId = result.public_id;
      next();
    } catch (err) {
      console.error("Upload image error:", err);
      res.status(500).json({ msg: "Upload image failed" });
    }
  }
];

export default uploadImageMiddleware;
