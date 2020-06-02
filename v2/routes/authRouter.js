const express = require('express');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const logger = require('../../config/winston_config');
const { token } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.use(jsonParser);

router.post('/join', async (req, res, next) => {
  const { nick, name, email, password, gender } = req.body;

  try {
    if (await userUtils.findByEmail(email, res)) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.EMAIL_ALREADY_OCCUPIED });
    };
  
    const { accessToken, refreshToken } = await userUtils.create({
      nick,
      name,
      email,
      password: sha256(password),
      gender: gender || 'secret',
    }, res);
  
    return res.status(HTTP_STATUS_CODE.CREATED).json({ accessToken, refreshToken });
  } catch {
    next(error);
  };
});

module.exports = router;
