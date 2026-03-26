const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

router.get('/participant/:participantId', certificateController.getCertificateByParticipant);
router.get('/code/:certificateCode', certificateController.getCertificateByCode);

module.exports = router;
