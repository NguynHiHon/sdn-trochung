const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY
});

/**
 * Generate a signature for frontend upload
 */
const generateSignature = (folder = 'oxalis_clone') => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  
  // The signature must include all parameters we intend to send
  // (timestamp and folder are common)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder
    },
    cloudinary.config().api_secret
  );

  return {
    timestamp,
    signature,
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key,
    folder // Optional, just to let the frontend know which folder to use
  };
};

module.exports = {
  generateSignature
};
