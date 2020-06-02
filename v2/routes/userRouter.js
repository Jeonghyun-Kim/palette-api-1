const express = require('express');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const { response } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.use(jsonParser);

router.get('/my', verifyToken, async (req, res) => {
  try {
    const user = await userUtils.findById(req.id, res);
    
    const { nick, name, level, email, gender, profileUrl, verified } = user;

    return res.status(HTTP_STATUS_CODE.OK).json({ user: { nick, name, level, email, gender, profileUrl, verified } });
  } catch {
    return response.sendInternalError(res);
  };
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await userUtils.findById(req.params.id, res);

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    };

    const { nick, name, level, profileUrl } = user;

    return res.status(HTTP_STATUS_CODE.OK).json({ user: { nick, name, level, profileUrl } });
  } catch {
    return response.sendInternalError(res);
  };
});

router.put('/my', verifyToken, async (req, res) => {
  const  { nick, name, gender } = req.body;
  // TODO: INPUT VALIDATION

  try {
    const exuser = await userUtils.findByNick(nick, res);

    if (exuser.id !== req.id) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    };

    await userUtils.updateInfo(req.id, { nick, name, gender: gender || 'secret' }, res);

    return res.status(HTTP_STATUS_CODE.OK).json({ user: { nick, name, gender: gender || 'secret' } });
  } catch {
    return response.sendInternalError(res);
  };
});

router.put('/password', verifyToken, async (req, res) => {
  const { password, newPassword } = req.body;
  try {
    const user = await userUtils.findById(req.id, res);

    if (user.password !== sha256(password)) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    };

    await user.update({ password: sha256(newPassword) });

    return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
  } catch {
    return response.sendInternalError(res);
  };
});

module.exports = router;
