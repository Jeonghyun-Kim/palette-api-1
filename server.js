'usestrict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const CUSTOM = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
const logger = require('./config/winston_config');
require('dotenv').config();

const { sequelize } = require('./models');

const indexRouter = require('./v2');

const app = express();

sequelize.sync();

app.set('port', process.env.PORT || 8081);

app.use(cors());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan(CUSTOM, { stream: { write: (message) => logger.info(message) } }));
} else {
  app.use(morgan('dev'));
}
app.use('/', indexRouter);

app.all('*', (_req, _res, next) => {
  const error = new Error('404 NOT FOUND');
  error.status = 404;

  return next(error);
});

app.use((err, _req, res) => {
  logger.error(`[UNCAUGHT ERROR] ${err}`);
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ error: 'Unknown Error Occured.' });
  } else {
    res.status(err.status || 500).json({ error: err.message, stack: err.stack });
  }
});

app.listen(app.get('port'), () => {
  logger.info(`SERVER LISTIENING ON PORT ${app.get('port')}`);
});
