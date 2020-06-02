const express = require('express');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const { token, response, mailer } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.use(jsonParser);

router.post('/join', async (req, res) => {
  const { nick, name, email, password, gender } = req.body;
  // TODO: INPUT VALIDATION

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
    return response.sendInternalError(res);
  };
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: INPUT VALIDATION

  try {
    const exUser = await userUtils.findByEmail(email, res);

    if (!exUser) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    };

    if (exUser.password === sha256(password)) {
      const accessToken = token.create(exUser.id);
      const refreshToken = (await exUser.getRefreshToken()).value;

      return res.status(HTTP_STATUS_CODE.OK).json({ accessToken, refreshToken });
    };

    return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
  } catch {
    return response.sendInternalError(res);
  };
});

router.get('/verify/:token', async (req, res) => {
  const { error, id } = token.verify(req.params.token, res);
  try {
    if (error) {
      return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).send(`인증 기한이 만료되었습니다. 다시 시도해주세요!`);
    };

    const user = await userUtils.findById(id);

    user.verified = true;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).send(`성공적으로 인증되었습니다.`);
  } catch {
    return response.sendInternalError(res);
  };
});

router.post('/token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };

  const { id } = token.verify(req.headers.authorization, res);

  try {
    const user = await userUtils.findById(id, res);
  
    if (refreshToken !== (await user.getRefreshToken()).value) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
    };
  
    const accessToken = token.create(id);
  
    return res.status(HTTP_STATUS_CODE.OK).json({ accessToken });
  } catch {
    return response.sendInternalError(res);
  };
});

router.get('/test', verifyToken, (_req, res) => {
  return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
});

router.get('/resend', verifyToken, async (req, res) => {
  try {
    const user = await userUtils.findById(req.id);

    if (!mailer.sendVerificationEmail(user, res)) {
      return response.sendInternalError(res);
    };

    return res.status(HTTP_STATUS_CODE.OK).json({ email: user.email });
  } catch {
    return response.sendInternalError(res);
  };
});

module.exports = router;
