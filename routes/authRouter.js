'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid-v4');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const logger = require('../config/winston_config');
const { verifyToken } = require('./middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const { User, RefreshToken } = require('../models');

const tokenExpireTime = '1h';

router.use(jsonParser);

// TODO: INPUT VALIDATION
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { username } });
    if (exUser == null) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    };
    if (exUser.password === sha256(password)) {
      const token = jwt.sign({ username: exUser.username }, process.env.JWT_SECRET, {
        expiresIn: tokenExpireTime
      });
      const refresh_token = (await exUser.getRefreshToken()).value;

      return res.status(HTTP_STATUS_CODE.OK).json({ token, refresh_token, error: DB_STATUS_CODE.OK });
    } else {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    };
  } catch (error) {
    
  }
});

// TODO: INPUT VALIDATION
router.post('/join', async (req, res, next) => {
  const { username, name, email, password, gender } = req.body;
  try {
    if (await User.findOne({ where: { username } })) {
      return res.status(HTTP_STATUS_CODE.NO_CONTENT).json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    };
    if (await User.findOne({ where: { email } })) {
      return res.status(HTTP_STATUS_CODE.NO_CONTENT).json({ error: DB_STATUS_CODE.EMAIL_ALREADY_OCCUPIED });
    };
    const user = await User.create({
      username,
      name,
      email,
      password: sha256(password),
      gender
    });
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: tokenExpireTime
    });
    const refresh_token = sha256(uuidv4());
    await RefreshToken.create({ value: refresh_token, userId: user.id });

    return res.status(HTTP_STATUS_CODE.CREATED).json({ token, refresh_token, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`joinError: ${error}`);

    return next(error);
  };
});


router.get('/test', verifyToken, (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
});

module.exports = router;
