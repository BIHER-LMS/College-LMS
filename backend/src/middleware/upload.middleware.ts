import multer from 'multer';

// Use in-memory storage for streaming directly to Cloudinary
const storage = multer.memoryStorage();

export const uploadMemory = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum file size
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and common document formats
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload an image or PDF.`));
    }
  },
});

export const uploadImageOnly = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum image size
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .jpeg, .png, .webp, .gif) are allowed.'));
    }
  },
});
