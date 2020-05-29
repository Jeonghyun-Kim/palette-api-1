const express = require('express');
const morgan = require('morgan');
const CUSTOM = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
const path = require('path');
const logger = require('./config/winston_config');
require('dotenv').config();

const { sequelize } = require('./models');

const indexRouter = require('./v1');
const authRouter = require('./v1/authRouter');
const testRouter = require('./v1/testRouter');

const app = express();

sequelize.sync();

app.set('port', process.env.PORT || 8081);

if (process.env.NODE_ENV === 'production') {
  app.use(morgan(CUSTOM, { stream: { write: (message) => logger.info(message) } } ));
} else {
  app.use(morgan('dev'));
};

app.use('/test', testRouter);
app.use('/auth', authRouter);
app.use('/', indexRouter);

app.all('*', (req, res, next) => {
  const error = new Error('404 NOT FOUND');
  error.status = 404;

  return next(error);
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ error: `An Error Occured.`})
  } else {
    // logger.error(`[FINAL] ${err}`);
    res.status(err.status || 500).json({ error: err.message, stack: err.stack });
  };
});

app.listen(app.get('port'), () => {
  logger.info(`SERVER LISTIENING ON PORT ${app.get('port')}`);
})
