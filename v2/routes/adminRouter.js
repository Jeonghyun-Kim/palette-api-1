const express = require('express');
const jsonParser = require('body-parser').json();
const router = express.Router();

const { response } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken, checkAdmin } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.use(jsonParser);

router.put('/level/id', verifyToken, checkAdmin, async (req, res) => {
  const { id, level } = req.body;
  try {
    const { _level } = await userUtils.setLevelById({ id, level }, res);

    if (!_level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level: _level });
    };
  } catch {
    return response.sendInternalError(res);
  };
});

router.put('/level/email', verifyToken, checkAdmin, async (req, res) => {
  const { email, level } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };

  try {
    const { _level } = await userUtils.setLevelByEmail({ email, level }, res);

    if (!_level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level: _level });
    };
  } catch {
    response.sendInternalError(res);
  };
});

router.put('/level/nick', verifyToken, checkAdmin, async (req, res) => {
  const { nick, level } = req.body;

  if (!nick) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };

  try {
    const { _level } = await userUtils.setLevelByNick({ nick, level }, res);

    if (!_level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level: _level });
    };
  } catch {
    response.sendInternalError(res);
  };
});

module.exports = router;
