const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', scheduleController.createSchedule);
router.post('/bulk', scheduleController.bulkCreateSchedules);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
