const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const logger = require('../../config/winston_config');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

const expiresIn = '10m';

const response = {};
const token = {};
const mailer = {};

response.sendInternalError = (res) => {
  return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: DB_STATUS_CODE.INTERNAL_SERVER_ERROR });
};

token.create = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

token.decodeId = (accessToken) => {
  const { id } = jwt.decode(accessToken);
  if (id) {
    return id;
  } else {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  };
};

token.verify = (accessToken, res) => {
  try {
    const { id } = jwt.verify(accessToken, process.env.JWT_SECRET);

    return { id };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { error: DB_STATUS_CODE.TOKEN_EXPIRED };
    };
    
    return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
  };
};

mailer.config = require('../../config/mailer_config');
mailer.transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: mailer.config.mailer.user,
    clientId: mailer.config.mailer.clientId,
    clientSecret: mailer.config.mailer.clientSecret,
    refreshToken: mailer.config.mailer.refresshToken,
    accessToken: mailer.config.mailer.accessToken,
    expires: mailer.config.mailer.expires,
  },
});
mailer.sendVerificationEmail = (user, res, cb) => {
  const emailToken = token.create(user.id);

  const mailOptions = {
    from: mailer.config.mailer.user,
    to: user.email,
    subject: 'Verification Email',
    html: `
    <a href="http://api.airygall.com:8081/auth/verify/${emailToken}" target="_blank")">
      Click Me
    </a>
    `,
  };

  return mailer.transporter.sendMail(mailOptions, async (error) => {
    if (!error) {
      return await cb();
    } else {
      logger.error(`[MAILER] ${error}`);

      await user.destroy();
      
      return response.sendInternalError(res);
    };
  });
};

module.exports = {
  response,
  token,
  mailer,
};