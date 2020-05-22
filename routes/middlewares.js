"use strict";

const jwt = require('jsonwebtoken');
const logger = require('../winston_config');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const verifyToken = (req, res, next) => {
  try {
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).json({ error: DB_STATUS_CODE.TOKEN_EXPIRED });
    };
    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
  };
};


module.exports = {
  verifyToken
};
