// TODO: add middleware that decrypt req's body (with client_secret) or not?

const { token } = require('./utils/common');
const userUtils = require('./utils/user');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

/*  VERIFY ACCESS_TOKEN
    return error when the request's access_token is invalid
    return next() when the request's access_token is valid
*/
const verifyToken = (req, res, next) => {
  const { error, id } = token.verify(req.headers.authorization.replace(`${process.env.JWT_PREFIX} `, ''), res);

  if (error) {
    return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).json({ error });
  }
  req.id = id;

  return next();
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
    }

    return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.FORBIDDEN });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  verifyToken,
  checkAdmin,
};
