const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const bookingRouter = require('./bookingRouter');
const mediaRouter = require('./media.router');
const cloudinaryRouter = require('./cloudinary.router');
const caveRouter = require('./cave.router');
const tourRouter = require('./tour.router');
const scheduleRouter = require('./schedule.router');
const participantRouter = require('./participant.router');
const notificationRouter = require('./notification.router');
const assignmentRouter = require('./assignment.router');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/media', mediaRouter);
router.use('/cloudinary', cloudinaryRouter);
router.use('/caves', caveRouter);
router.use('/tours', tourRouter);
router.use('/schedules', scheduleRouter);
router.use('/participants', participantRouter);
router.use('/notifications', notificationRouter);
router.use('/assignments', assignmentRouter);
router.use('/', bookingRouter);

module.exports = router;