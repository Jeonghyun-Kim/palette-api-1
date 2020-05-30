const express = require('express');
const router = express.Router();

const logger = require('../config/winston_config');
const db = require('../models');
const { verifyToken } = require('./middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const paintingRouter = require('./routes/paintingRouter');
const testRouter = require('./routes/testRouter');

const version = '0.0.1';

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/painting', paintingRouter);
router.use('/test', testRouter);

router.get('/', (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK });
});

router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      attributes: ['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.id }
    });
    const paintings = await user.getPaintings({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes', 'thumbnailUrl']
    });

    delete user.id;

    return res.status(HTTP_STATUS_CODE.OK).json({ user, paintings, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

module.exports = router;
