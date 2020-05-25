'use strict';

const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');
const sha256 = require('sha256');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const streamifier = require('streamifier');
const upload = multer({ storage: multer.memoryStorage() });

const logger = require('../config/winston_config');
const { User, Painting } = require('../models');
const { verifyToken } = require('./middlewares');
const { s3, BUCKETS } = require('./aws_defines');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const version = '0.0.1';

router.get('/', (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK });
});

router.get('/user/my', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({
      attributes:['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.id }
    });
    const paintings = await user.getPaintings({
      attributes: ['painter', 'name', 'description', 'material', 'width',
        'height', 'price', 'onSale', 'numLikes', 'src']
    });

    delete user.id;

    return res.status(HTTP_STATUS_CODE.OK).json({ user, paintings, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[/user/my] ${error}`);

    return next(error);
  };
});

router.post('/painting', verifyToken, upload.single('painting'), async (req, res, next) => {
  const fileName = sha256(uuid());
  const { painter, name, description, material, width, height, price, onSale } = req.body;
  // TODO: Input Validation
  const extension = path.extname(req.file.originalname);
  logger.info(`FILENAME: ${fileName}${extension}`);
  try {
    const painting = await Painting.create({
      painter, name, description, material, width, height, price, onSale,
      ownerId: req.id,
      src: fileName + extension
    });
    const fileStream = streamifier.createReadStream(req.file.buffer);
    s3.upload({
      Bucket: BUCKETS.PAINTING,
      Key: fileName + extension,
      Body: fileStream,
      ACL: 'public-read'
    }, async (err, data) => {
      if (err) {
        logger.error(`[AWS UPLOAD PAINTING] ${err}`);
        await Painting.destroy({ where: { id: painting.id } });

        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: DB_STATUS_CODE.AWS_S3_ERROR });
      } if (data) {
        logger.info(`[PAINTING UPLOADED SUCCESSFULLY]`);

        return res.status(HTTP_STATUS_CODE.CREATED).json({ error: DB_STATUS_CODE.OK });
      }
    })
  } catch (error) {
    logger.error(`[POST /painting] ${error}`);

    return next(error);
  };
});

module.exports = router;
