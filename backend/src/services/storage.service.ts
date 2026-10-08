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
  resourceType?: 'image' | 'raw' | 'auto';
  tags?: string[];
}

export class StorageService {
  /**
   * Upload an in-memory buffer to Cloudinary using upload_stream
   */
  async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'college_lms/uploads',
          public_id: options.publicId,
          resource_type: options.resourceType || 'auto',
          tags: options.tags || ['college_lms'],
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
    const safeBaseName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const publicId = `${studentUid}_${Date.now()}_${safeBaseName}`;

    return this.uploadBuffer(buffer, {
      folder: `college_lms/assignments/${assignmentId}/submissions`,
      publicId,
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
    customPublicId?: string
  ): Promise<UploadResult> {
    return this.uploadBuffer(buffer, {
      folder,
      publicId: customPublicId,
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
