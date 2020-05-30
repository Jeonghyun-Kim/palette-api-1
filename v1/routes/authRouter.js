const express = require('express');
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const router = express.Router();

const logger = require('../../config/winston_config');
const { verifyToken } = require('../middlewares');
const { transporter, mailConfig } = require('../mailer');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

const { User, RefreshToken } = require('../../models');

const tokenExpireTime = '5m';

router.use(jsonParser);

/*  UTIL - RETURN AN ACCESS_TOKEN WHEN REFRESH_TOKEN IS VALID
    input: user - sequelize 'User' object, refresh_token
    output: SWITCH (valid)
              case true: return access_token;
              case false: return null;

*/
const checkRefreshToken = async (user, refresh_token) => {
  const _refresh_token = (await user.getRefreshToken()).value;
  if (refresh_token != _refresh_token) {
    return null;
  };
  const token = jwt.sign({
    id: user.id
  }, process.env.JWT_SECRET, {
    expiresIn: tokenExpireTime
  });

  return token;
};

// TODO: INPUT VALIDATION // PUBLIC KEY HASHING
/*  SIGN IN
    req.body: { username, password }
    res.json: { token: access_token, refresh_token, error: 0 }
*/
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { username } });
    if (exUser == null) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    };
    if (exUser.password === sha256(password)) {
      const token = jwt.sign({ id: exUser.id }, process.env.JWT_SECRET, {
        expiresIn: tokenExpireTime
      });
      const refresh_token = (await exUser.getRefreshToken()).value;

      return res.status(HTTP_STATUS_CODE.OK).json({ token, refresh_token, error: DB_STATUS_CODE.OK });
    } else {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    };
  } catch (error) {
    logger.error(`[/login] ${error}`);

    return next(error);
  }
});

// TODO: INPUT VALIDATION // PUBLIC KEY HASHING
/*  SIGN UP
    req.body: { username, name, email, password, gender }
    res.json: { token: access_token, refresh_token, error: 0 }
*/
router.post('/join', async (req, res, next) => {
  const { username, name, email, password, gender } = req.body;
  try {
    if (await User.findOne({ where: { username } })) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    };
    if (await User.findOne({ where: { email } })) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE).json({ error: DB_STATUS_CODE.EMAIL_ALREADY_OCCUPIED });
    };
    const user = await User.create({
      username,
      name,
      email,
      password: sha256(password),
      gender: gender ? gender : 'secret'
    });

    const emailToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: mailConfig.mailer.expiresIn,
    });

    const mailOptions = {
      from: mailConfig.mailer.user,
      to: email,
      subject: 'Verification Email',
      html: `
      <a href="http://localhost:8081/auth/verify/${emailToken}" target="_blank")">
        Click Me
      </a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.error(`[Mailer] ${error}`);
    
        return next(error);
      } else {
        logger.info(`[Mailer] ${info.response}`);
      };
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: tokenExpireTime
    });
    const refresh_token = sha256(uuid());
    await RefreshToken.create({ value: refresh_token, userId: user.id });

    return res.status(HTTP_STATUS_CODE.CREATED).json({ token, refresh_token, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[/join] ${error}`);

    return next(error);
  };
});

router.get('/verify/:token', async (req, res, next) => {
  try {
    req.id = jwt.verify(req.params.token, process.env.JWT_SECRET).id;
    const user = await User.findOne({ where: { id: req.id } });
    user.verified = true;
    await user.save();

    return res.status(HTTP_STATUS_CODE.OK).send(`성공적으로 인증되었습니다.`);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS_CODE.TOKEN_EXPIRED).json({ error: DB_STATUS_CODE.TOKEN_EXPIRED });
    };

    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
  };
});

/*  CHECK WHETHER ACCESS_TOKEN IS VALID
    req.headers.authorization: 'access_token'
    res.json: { error: 0 }
*/
router.get('/test', verifyToken, (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
});

// TODO: move refresh_token to header --> use GET method instead
/*  RESPONSE WITH NEW TOKEN 
    req.headers.authorization: 'access_token'
    req.body: { refresh_token }
    res.json: { token: access_token, error: 0 }
*/
router.post('/token', async (req, res, next) => {
  const { refresh_token } = req.body;
  if (refresh_token == undefined) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };
  try {
    const { id } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    const user = await User.findOne({ attributes: ['id'], where: { id } });
    const token = await checkRefreshToken(user, refresh_token);
    if (!token) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ token, error: DB_STATUS_CODE.OK });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const user = await User.findOne({ attributes: ['id'], where: { id: jwt.decode(req.headers.authorization).id } });
      const token = await checkRefreshToken(user, refresh_token);
      if (token === null) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
      }

      return res.status(HTTP_STATUS_CODE.OK).json({ token, error: DB_STATUS_CODE.OK });
    };

    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
  };
});

module.exports = router;
