import { Router, Request, Response } from 'express';
import { authenticateFirebaseUser } from '../../middleware/auth.middleware';
import { uploadMemory } from '../../middleware/upload.middleware';
import { storageService } from '../../services/storage.service';
import { sendSuccess, sendError, ErrorCodes } from '../../utils/response';

const router = Router();

// Universal image and document upload to Cloudinary
router.post(
  '/',
  authenticateFirebaseUser,
  uploadMemory.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'No file was uploaded. Please include a file in the "file" field.');
      }

      const folder = (req.body.folder as string) || 'college_lms/uploads';
      const result = await storageService.uploadBuffer(req.file.buffer, {
        folder,
        resourceType: req.file.mimetype.startsWith('image/') ? 'image' : 'auto',
      });

      return sendSuccess(
        res,
        {
          url: result.secureUrl,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
        },
        201
      );
    } catch (err: any) {
      console.error('Upload endpoint error:', err);
      return sendError(res, 500, ErrorCodes.INTERNAL_ERROR, err.message || 'Failed to upload file to Cloudinary');
    }
  }
);

// Image-specific upload
router.post(
  '/image',
  authenticateFirebaseUser,
  uploadMemory.single('file'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'No image file was uploaded.');
      }

      const folder = (req.body.folder as string) || 'college_lms/images';
      const result = await storageService.uploadImage(req.file.buffer, folder);

      return sendSuccess(
        res,
        {
          url: result.secureUrl,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          bytes: result.bytes,
        },
        201
      );
    } catch (err: any) {
      console.error('Image upload endpoint error:', err);
      return sendError(res, 500, ErrorCodes.INTERNAL_ERROR, err.message || 'Failed to upload image to Cloudinary');
    }
  }
);

export default router;
