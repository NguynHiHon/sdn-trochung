
const express = require('express');
const userController = require('../controllers/userController');
const middleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', middleware.verifyAccessToken, userController.getMe);

module.exports = router;