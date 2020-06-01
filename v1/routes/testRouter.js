const express = require('express');
const jwt = require('jsonwebtoken');
// const { uuid } = require('uuidv4');
// const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const logger = require('../../config/winston_config');
const { verifyToken } = require('../middlewares');
const { transporter, mailConfing } = require('../mailer');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

// const { User, RefreshToken } = require('../models');

router.use(jsonParser);

router.get('/mail', (req, res, next) => {
  const mailOptions = {
    from: mailConfig.mailer.user,
    to: 'kim.kay@kakao.com',
    subject: 'Test Email',
    text: 'Success!!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(`[Mailer] ${error}`);
  
      return next(error);
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
      logger.info('Mail Sent');
    };
  })
});

router.get('/:token', (req, res, next) => {
  logger.info(jwt.decode(req.params.token));
  res.status(200).json({error: 0});
});

module.exports = router;
