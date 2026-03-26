const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');

router.get('/booking/:bookingId', participantController.getParticipantsByBookingId);
router.get('/:id', participantController.getParticipantById);
router.post('/', participantController.createParticipant);
router.patch('/:id/review-status', participantController.updateParticipantReviewStatus);
router.put('/:id', participantController.updateParticipant);
router.delete('/:id', participantController.deleteParticipant);

module.exports = router;
