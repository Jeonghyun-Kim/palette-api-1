"use strict";

// TODO: add middleware that decrypt req's body (with client_secret) or not?

const jwt = require('jsonwebtoken');
const logger = require('../config/winston_config');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const { User } = require('../models');

/*  VERIFY ACCESS_TOKEN
    return error when the request's access_token is invalid
    return next() when the request's access_token is valid
*/
const verifyToken = (req, res, next) => {
  try {
    req.username = jwt.verify(req.headers.authorization, process.env.JWT_SECRET).username;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).json({ error: DB_STATUS_CODE.TOKEN_EXPIRED });
    };
    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
  };
};

/*  CHECK ADMIN
    return next(error) when db connection failed
    return error when the user is not an admin
    return next() when the user is an admin
*/
const checkAdmin = async (req, res, next) => {
  try {
    const adminUser = await User.findOne({ where: { username: req.username } });
    if (adminUser.level < 99) {
      res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
    } else {
      return next();
    }
  } catch (error) {
    logger.error(`[CHECK ADMIN] ${error}`);

    return next(error);
  }
};

module.exports = {
  verifyToken,
  checkAdmin
};
