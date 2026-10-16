import path from 'path';
import { cloudinary } from '../config/cloudinary';

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  resourceType: string;
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  originalFilename?: string;
  resourceType?: 'image' | 'raw' | 'auto' | 'video';
  tags?: string[];
}

export class StorageService {
  /**
   * Upload an in-memory buffer to Cloudinary using upload_stream
   */
  async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      let publicId = options.publicId;
      const ext = options.originalFilename ? path.extname(options.originalFilename).toLowerCase() : '';

      // For Cloudinary, raw and office document files (PPT, DOC, PDF, ZIP, TXT) REQUIRE the extension
      // to be embedded in the public_id, otherwise Cloudinary strips extensions and Google/MS viewers return 400.
      if (!publicId && options.originalFilename) {
        const rawBase = path.basename(options.originalFilename, ext);
        const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'file';
        publicId = `${safeBase}_${Date.now()}${ext}`;
      } else if (publicId && ext && !publicId.toLowerCase().endsWith(ext)) {
        publicId = `${publicId}${ext}`;
      }

      // Determine resource_type
      let resourceType = options.resourceType || 'auto';
      if (
        ext === '.ppt' ||
        ext === '.pptx' ||
        ext === '.doc' ||
        ext === '.docx' ||
        ext === '.xls' ||
        ext === '.xlsx' ||
        ext === '.zip'
      ) {
        resourceType = 'raw';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'college_lms/uploads',
          public_id: publicId,
          resource_type: resourceType,
          tags: options.tags || ['college_lms'],
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload stream error:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary upload failed: empty result'));
          }

          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            resourceType: result.resource_type,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload an assignment submission file from a student
   */
  async uploadAssignmentSubmission(
    buffer: Buffer,
    originalName: string,
    studentUid: string,
    assignmentId: string
  ): Promise<UploadResult> {
    const ext = path.extname(originalName).toLowerCase();
    const rawBase = path.basename(originalName, ext);
    const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'submission';
    const publicId = `${studentUid}_${Date.now()}_${safeBase}${ext}`;

    return this.uploadBuffer(buffer, {
      folder: `college_lms/assignments/${assignmentId}/submissions`,
      publicId,
      originalFilename: originalName,
      resourceType: 'auto',
      tags: ['assignment_submission', `assignment_${assignmentId}`, `student_${studentUid}`],
    });
  }

  /**
   * Upload a general image (avatars, attachments, media)
   */
  async uploadImage(
    buffer: Buffer,
    folder: string = 'college_lms/images',
    customPublicId?: string,
    originalFilename?: string
  ): Promise<UploadResult> {
    return this.uploadBuffer(buffer, {
      folder,
      publicId: customPublicId,
      originalFilename,
      resourceType: 'image',
      tags: ['college_lms_image'],
    });
  }

  /**
   * Delete a resource from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image'): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return res?.result === 'ok';
    } catch (err) {
      console.error('Failed to delete file from Cloudinary:', err);
      return false;
    }
  }
}

export const storageService = new StorageService();
