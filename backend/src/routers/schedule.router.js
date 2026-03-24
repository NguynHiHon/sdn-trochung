const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const middleware = require('../middlewares/authMiddleWare');

// Public routes - anyone can view schedules
router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);

// Admin only routes - create, update, delete schedules
router.post('/', middleware.verifyAdmin, scheduleController.createSchedule);
router.post('/bulk', middleware.verifyAdmin, scheduleController.bulkCreateSchedules);
router.put('/:id', middleware.verifyAdmin, scheduleController.updateSchedule);
router.delete('/:id', middleware.verifyAdmin, scheduleController.deleteSchedule);

module.exports = router;
