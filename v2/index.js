const express = require('express');

const router = express.Router();

const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const userRouter = require('./routes/userRouter');
const galleryRouter = require('./routes/galleryRouter');

const version = '0.1.1';

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/user', userRouter);
router.use('/gallery', galleryRouter);

router.get('/', (_req, res) => res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK }));

module.exports = router;
