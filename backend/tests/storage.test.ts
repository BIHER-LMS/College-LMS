import { describe, it, expect, vi } from 'vitest';
import { storageService } from '../src/services/storage.service';
import { cloudinary } from '../src/config/cloudinary';

describe('Cloudinary Storage Service', () => {
  it('initializes Cloudinary configuration with correct credentials', () => {
    const config = cloudinary.config();
    expect(config.cloud_name).toBe('d7v6ykai');
    expect(config.api_key).toBe('673375372542419');
    expect(config.api_secret).toBe('6N1ry_7Q9xT6FPaPkIfBT2B0rac');
  });

  it('uploads buffer to Cloudinary successfully via upload_stream', async () => {
    const fakeBuffer = Buffer.from('test-image-content');
    const mockResult = {
      url: 'http://res.cloudinary.com/d7v6ykai/image/upload/v1/college_lms/test.png',
      secure_url: 'https://res.cloudinary.com/d7v6ykai/image/upload/v1/college_lms/test.png',
      public_id: 'college_lms/test',
      format: 'png',
      bytes: 18,
      resource_type: 'image',
    };

    const spy = vi.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((_opts: any, callback: any) => {
      const stream: any = {
        end: (_buf: Buffer) => {
          callback(null, mockResult);
        },
      };
      return stream;
    });

    const result = await storageService.uploadBuffer(fakeBuffer, {
      folder: 'college_lms/tests',
      resourceType: 'image',
    });

    expect(result.secureUrl).toBe(mockResult.secure_url);
    expect(result.publicId).toBe(mockResult.public_id);
    expect(result.bytes).toBe(mockResult.bytes);
    spy.mockRestore();
  });

  it('generates proper folder and tags for student assignment submissions', async () => {
    const fakeBuffer = Buffer.from('student-submission');
    let capturedOptions: any = null;

    const spy = vi.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((opts: any, callback: any) => {
      capturedOptions = opts;
      const stream: any = {
        end: (_buf: Buffer) => {
          callback(null, {
            url: 'http://res.cloudinary.com/d7v6ykai/image/upload/v1/assignment.png',
            secure_url: 'https://res.cloudinary.com/d7v6ykai/image/upload/v1/assignment.png',
            public_id: 'assignment_123',
            format: 'png',
            bytes: 18,
            resource_type: 'image',
          });
        },
      };
      return stream;
    });

    const result = await storageService.uploadAssignmentSubmission(
      fakeBuffer,
      'my_solution.png',
      'student_uid_456',
      'assignment_789'
    );

    expect(capturedOptions.folder).toBe('college_lms/assignments/assignment_789/submissions');
    expect(capturedOptions.tags).toContain('assignment_submission');
    expect(capturedOptions.tags).toContain('student_student_uid_456');
    expect(result.secureUrl).toContain('cloudinary.com');
    spy.mockRestore();
  });
});
