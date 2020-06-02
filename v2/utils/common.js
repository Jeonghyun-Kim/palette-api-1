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
mailer.sendVerificationEmail = (user, res) => {
  const emailToken = token.create(user.id);

  const mailOptions = {
    from: mailConfig.mailer.user,
    to: user.email,
    subject: 'Verification Email',
    html: `
    <a href="http://api.airygall.com:8081/auth/verify/${emailToken}" target="_blank")">
      Click Me
    </a>
    `,
  };

  mailer.transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(`[MAILER] ${error}`);

      response.sendInternalError(res);
    } else {
      logger.info(`[MAILER] ${info.response}`);
    };
  });
};

module.exports = {
  response,
  token,
  mailer,
};