const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
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

// Admin: assign booking to staff
router.post(
  "/",
  middleware.verifyAdmin,
  runValidation([
    body('bookingId').isMongoId().withMessage('bookingId không hợp lệ'),
    body('staffId').isMongoId().withMessage('staffId không hợp lệ'),
    body('note').optional().isString().withMessage('note không hợp lệ'),
  ]),
  assignmentController.assignBooking,
);

// Admin + Staff: list assignments
router.get(
  "/",
  middleware.verifyAccessToken,
  assignmentController.getAssignments,
);

// Staff: update assignment status
router.put(
  "/:id/status",
  middleware.verifyAccessToken,
  runValidation([
    param('id').isMongoId().withMessage('ID phân công không hợp lệ'),
    body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Trạng thái phân công không hợp lệ'),
  ]),
  assignmentController.updateStatus,
);

module.exports = router;
