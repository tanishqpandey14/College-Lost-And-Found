const cloudinary = require('cloudinary').v2;

// Function to dynamically ensure Cloudinary is configured
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

/**
 * Uploads a file buffer directly to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folder = 'college_lost_found') => {
  return new Promise((resolve, reject) => {
    configureCloudinary(); // Ensure config is applied right before upload

    // Fallback if keys are still empty
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('[Cloudinary Warning] API Key missing. Returning default placeholder image.');
      return resolve({
        url: 'https://via.placeholder.com/600x400?text=No+Image+Uploaded',
        publicId: ''
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes an image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary Deletion Error]:', error.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };