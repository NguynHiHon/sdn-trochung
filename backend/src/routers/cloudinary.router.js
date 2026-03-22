const express = require('express');
const router = express.Router();
const cloudinaryController = require('../controllers/cloudinary.controller');

// Bất cứ ai có quyền admin hoặc user có thể lấy signature
// Tạm thời để public, nhưng nếu có middleware auth có thể gắn vào
router.get('/signature', cloudinaryController.getSignature);

module.exports = router;
