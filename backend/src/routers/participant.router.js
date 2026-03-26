const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participant.controller');
const middleware = require('../middlewares/authMiddleWare');
const { body, param, validationResult } = require('express-validator');

const runValidation = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
        }
        next();
    };
};

router.get('/booking/:bookingId', runValidation([param('bookingId').isMongoId().withMessage('bookingId không hợp lệ')]), participantController.getParticipantsByBookingId);
router.get('/:id', runValidation([param('id').isMongoId().withMessage('ID hành khách không hợp lệ')]), participantController.getParticipantById);
router.post('/', participantController.createParticipant);
router.put('/:id', runValidation([param('id').isMongoId().withMessage('ID hành khách không hợp lệ')]), participantController.updateParticipant);
router.patch(
    '/:id/admin-status',
    middleware.verifyAdmin,
    runValidation([
        param('id').isMongoId().withMessage('ID hành khách không hợp lệ'),
        body('reviewStatus').optional().isIn(['pending_review', 'approved', 'rejected', 'completed', 'service_suspended']).withMessage('reviewStatus không hợp lệ'),
        body('reviewNote').optional().isString().withMessage('reviewNote không hợp lệ'),
        body('certificateIssued').optional().isBoolean().withMessage('certificateIssued không hợp lệ'),
    ]),
    participantController.updateParticipantAdminStatus,
);
router.delete('/:id', runValidation([param('id').isMongoId().withMessage('ID hành khách không hợp lệ')]), participantController.deleteParticipant);

module.exports = router;
