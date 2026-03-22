const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');

// Đăng ký các endpoints
// Có thể thêm middleware auth ở đây nếu cần cho admin
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.post('/', mediaController.createMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
