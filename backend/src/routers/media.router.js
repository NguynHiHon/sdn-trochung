const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const middleware = require('../middlewares/authMiddleWare');

// Public routes - anyone can view media
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);

// Admin only routes - create, update, delete media
router.post('/', middleware.verifyAdmin, mediaController.createMedia);
router.put('/:id', middleware.verifyAdmin, mediaController.updateMedia);
router.delete('/:id', middleware.verifyAdmin, mediaController.deleteMedia);

module.exports = router;
