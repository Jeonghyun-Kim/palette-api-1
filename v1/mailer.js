const nodemailer = require('nodemailer');

const config = require('../config/mailer_config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.mailer.user,
    pass: config.mailer.password,
  },
});

module.exports = { transporter, mailConfig: config };
