'use strict';

const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');
const sha256 = require('sha256');

const logger = require('../config/winston_config');
const { User, Painting } = require('../models');
const { verifyToken } = require('./middlewares');
const { getMulterS3, BUCKETS } = require('./aws_defines');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const version = '0.0.1';

router.get('/', (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK });
});

router.post('/painting', verifyToken, async (req, res, next) => {
  const fileName = sha256(uuid());
  const upload = getMulterS3(fileName, BUCKETS.PAINTING);
  const { painter, name, description, material, width, height, price, onSale } = req.body;
  // TODO: Input Validation
  try {
    await Painting.create({
      painter, name, description, material, width, height, price, onSale,
      ownerId: req.id,
      src: fileName
    });
  } catch (error) {
    logger.error(`[POST /painting] ${error}`);
  };
  
  upload.single('painting')(req, res, next);
}, (req, res) => {
  res.status(HTTP_STATUS_CODE.CREATED).json({ error: DB_STATUS_CODE.OK });
});

module.exports = router;
