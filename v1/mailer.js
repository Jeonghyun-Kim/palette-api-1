const nodemailer = require('nodemailer');

const config = require('../config/mailer_config');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: config.mailer.user,
    clientId: config.mailer.clientId,
    clientSecret: config.mailer.clientSecret,
    refreshToken: config.mailer.refresshToken,
    accessToken: config.mailer.accessToken,
    expires: config.mailer.expires,
  },
});

module.exports = { transporter, mailConfig: config };
