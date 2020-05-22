'use strict';

const express = require('express');
const router = express.Router();

const logger = require('../config/winston_config');
const { verifyToken } = require('./middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const version = '0.0.1';

router.get('/', (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK });
});

module.exports = router;
