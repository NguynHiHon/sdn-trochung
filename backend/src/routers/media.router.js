const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');
const runValidation = require('../middlewares/runValidation');
const { validateMediaCreate, validateMediaUpdate } = require('../validators/adminCrud.validator');

// Đăng ký các endpoints
// Có thể thêm middleware auth ở đây nếu cần cho admin
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.post('/', authMiddleWare.verifyAdmin, runValidation(validateMediaCreate), mediaController.createMedia);
router.put('/:id', authMiddleWare.verifyAdmin, runValidation(validateMediaUpdate), mediaController.updateMedia);
router.delete('/:id', authMiddleWare.verifyAdmin, mediaController.deleteMedia);

module.exports = router;
