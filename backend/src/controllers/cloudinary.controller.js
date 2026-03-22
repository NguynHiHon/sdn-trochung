const CloudinaryService = require('../services/cloudinary.service');

const getSignature = (req, res) => {
  try {
    const folder = req.query.folder || 'oxalis_clone';
    const authParams = CloudinaryService.generateSignature(folder);
    
    // AuthParams include: signature, timestamp, cloud_name, api_key
    res.status(200).json({
      success: true,
      data: authParams
    });
  } catch (error) {
    console.error('Error generating cloudinary signature:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo signature: ' + error.message
    });
  }
};

module.exports = {
  getSignature
};
