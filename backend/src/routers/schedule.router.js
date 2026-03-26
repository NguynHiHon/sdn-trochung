const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');
const runValidation = require('../middlewares/runValidation');
const {
    validateScheduleCreate,
    validateScheduleUpdate,
    validateScheduleBulkCreate,
    validateScheduleListQuery,
} = require('../validators/adminCrud.validator');

router.get('/', runValidation(validateScheduleListQuery), scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getScheduleById);
router.post('/', authMiddleWare.verifyAdmin, runValidation(validateScheduleCreate), scheduleController.createSchedule);
router.post('/bulk', authMiddleWare.verifyAdmin, runValidation(validateScheduleBulkCreate), scheduleController.bulkCreateSchedules);
router.put('/:id', authMiddleWare.verifyAdmin, runValidation(validateScheduleUpdate), scheduleController.updateSchedule);
router.delete('/:id', authMiddleWare.verifyAdmin, scheduleController.deleteSchedule);

module.exports = router;
