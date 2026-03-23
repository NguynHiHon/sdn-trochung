const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');

router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', authMiddleWare.verifyAdmin, scheduleController.createSchedule);
router.post('/bulk', authMiddleWare.verifyAdmin, scheduleController.bulkCreateSchedules);
router.put('/:id', authMiddleWare.verifyAdmin, scheduleController.updateSchedule);
router.delete('/:id', authMiddleWare.verifyAdmin, scheduleController.deleteSchedule);

module.exports = router;
