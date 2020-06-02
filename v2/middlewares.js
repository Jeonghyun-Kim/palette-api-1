// TODO: add middleware that decrypt req's body (with client_secret) or not?

const jwt = require('jsonwebtoken');
const logger = require('../config/winston_config');
const { token, response } = require('./utils/common');
const userUtils = require('./utils/user');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const { User } = require('../models');

/*  VERIFY ACCESS_TOKEN
    return error when the request's access_token is invalid
    return next() when the request's access_token is valid
*/
const verifyToken = (req, res, next) => {
  const { error, id } = token.verify(req.headers.authorization, res);

  if (error) {
    return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).json({ error });
  } else {
    req.id = id;

    return next();
  };
};

/*  CHECK ADMIN
    return next(error) when db connection failed
    return error when the user is not an admin
    return next() when the user is an admin
*/
const checkAdmin = async (req, res, next) => {
  try {
    if (await userUtils.isAdmin(req.id, res)) {
      return next();
    } else {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.FORBIDDEN });
    };
  } catch {
    return response.sendInternalError(res);
  };
};

module.exports = {
  verifyToken,
  checkAdmin
};
