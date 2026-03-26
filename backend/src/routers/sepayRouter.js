const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepayController');

// POST /api/sepay/webhook
router.post('/webhook', sepayController.sepayWebhook);

module.exports = router;
