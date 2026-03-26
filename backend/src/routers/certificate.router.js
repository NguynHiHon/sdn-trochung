const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

router.get('/participant/:participantId', certificateController.getCertificateByParticipant);

module.exports = router;
