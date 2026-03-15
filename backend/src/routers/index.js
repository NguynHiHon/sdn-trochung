const express = require('express');
const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const bookingRouter = require('./bookingRouter');
const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/', bookingRouter);

module.exports = router;