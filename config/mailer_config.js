module.exports = {
  mailer: {
    user: process.env.MAILER_EMAIL,
    password: process.env.MAILER_PASSWORD,
    expiresIn: '3h',
  }
}