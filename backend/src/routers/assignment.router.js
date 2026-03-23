const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
const middleware = require('../middlewares/authMiddleWare');

// Admin: assign booking to staff
router.post("/", middleware.verifyAdmin, assignmentController.assignBooking);

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
  assignmentController.updateStatus,
);

module.exports = router;
