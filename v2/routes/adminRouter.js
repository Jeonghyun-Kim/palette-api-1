const express = require('express');
const jsonParser = require('body-parser').json();
const router = express.Router();

const { response } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken, checkAdmin } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.use(jsonParser);

router.put('/level/id', verifyToken, checkAdmin, async (req, res) => {
  const { id } = req.body;
  try {
    const { level } = await userUtils.setLevelById(id, res);

    if (!level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level });
    };
  } catch {
    return response.sendInternalError(res);
  };
});

router.put('/level/email', verifyToken, checkAdmin, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };

  try {
    const { level } = await userUtils.setLevelByEmail(email, res);

    if (!level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level });
    };
  } catch {
    response.sendInternalError(res);
  };
});

router.put('/level/nick', verifyToken, checkAdmin, async (req, res) => {
  const { nick } = req.body;

  if (!nick) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };

  try {
    const { level } = await userUtils.setLevelByNick(nick, res);

    if (!level) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    } else {
      return res.status(HTTP_STATUS_CODE.OK).json({ level });
    };
  } catch {
    response.sendInternalError(res);
  };
});

module.exports = router;
