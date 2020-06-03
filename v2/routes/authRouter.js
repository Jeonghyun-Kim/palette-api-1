const express = require('express');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const { token, response, mailer } = require('../utils/common');
const userUtils = require('../utils/user');
const { verifyToken } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

const router = express.Router();
router.use(jsonParser);

router.post('/join', async (req, res, next) => {
  const { nick, name, email, password, gender } = req.body;
  // TODO: INPUT VALIDATION

  try {
    if (await userUtils.findByEmail(email, res)) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE)
        .json({ error: DB_STATUS_CODE.EMAIL_ALREADY_OCCUPIED });
    }

    if (await userUtils.findByNick(nick, res)) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE)
        .json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    }

    const { accessToken, refreshToken } = await userUtils.create({
      nick,
      name,
      email,
      password: sha256(password),
      gender: gender || 'secret',
    }, res);

    return res.status(HTTP_STATUS_CODE.CREATED).json({ accessToken, refreshToken });
  } catch (err) {
    return next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  // TODO: INPUT VALIDATION

  try {
    const exUser = await userUtils.findByEmail(email, res);

    if (!exUser) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    }

    if (exUser.password === sha256(password)) {
      const accessToken = token.create(exUser.id);
      const refreshToken = (await exUser.getToken()).value;

      return res.status(HTTP_STATUS_CODE.OK).json({ accessToken, refreshToken });
    }

    return res.status(HTTP_STATUS_CODE.FORBIDDEN).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
  } catch (err) {
    return next(err);
  }
});

router.get('/verify/:token', async (req, res, next) => {
  const { error, id } = token.verify(req.params.token, res);
  try {
    if (error) {
      return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).send('인증 기한이 만료되었습니다. 다시 시도해주세요!');
    }

    const user = await userUtils.findById(id);

    user.verified = true;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).send('성공적으로 인증되었습니다.');
  } catch (err) {
    return next(err);
  }
});

router.post('/token', async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  }

  token.verify(req.headers.authorization, res);
  const id = token.decodeId(req.headers.authorization);

  try {
    const user = await userUtils.findById(id, res);

    if (refreshToken !== (await user.getToken()).value) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
    }

    const accessToken = token.create(id);

    return res.status(HTTP_STATUS_CODE.OK).json({ accessToken });
  } catch (err) {
    return next(err);
  }
});

router.get('/test', verifyToken, (_req, res) => res.status(HTTP_STATUS_CODE.OK).json({ error: 0 }));

router.get('/resend', verifyToken, async (req, res, next) => {
  try {
    const user = await userUtils.findById(req.id);

    if (!mailer.sendVerificationEmail(user, res)) {
      return response.sendInternalError(res);
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ email: user.email });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
