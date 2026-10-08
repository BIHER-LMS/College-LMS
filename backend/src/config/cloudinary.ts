import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'd7v6ykai';
const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY || '673375372542419';
const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET || '6N1ry_7Q9xT6FPaPkIfBT2B0rac';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
export { cloudinary };
