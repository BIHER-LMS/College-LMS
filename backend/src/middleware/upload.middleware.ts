import multer from 'multer';

// Use in-memory storage for streaming directly to Cloudinary
const storage = multer.memoryStorage();

export const uploadMemory = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB maximum file size
  },
  fileFilter: (_req, file, cb) => {
    // Allow images, presentations, office documents, PDFs, and archives
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
    ];

    const isAllowedExt = /\.(pdf|ppt|pptx|doc|docx|md|markdown|txt|zip|jpg|jpeg|png|webp|gif|svg)$/i.test(file.originalname);
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: Images, PDFs, Office Documents (.ppt, .pptx, .doc, .docx), Zip, Markdown.`));
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

export const uploadContentMemory = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size for learning materials & videos
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];

    const isAllowedExt = /\.(pdf|ppt|pptx|doc|docx|md|markdown|txt|mp4|webm|mov|ogg|jpg|jpeg|png)$/i.test(file.originalname);
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || isAllowedExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, PPT/PPTX, DOC/DOCX, Markdown, Video, Image.`));
    }
  },
});
