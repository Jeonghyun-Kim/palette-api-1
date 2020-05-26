'use strict';

const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');
const sha256 = require('sha256');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const imageThumbnail = require('image-thumbnail');

const logger = require('../config/winston_config');
const { User, Painting, Image } = require('../models');
const { verifyToken } = require('./middlewares');
const { s3, BUCKETS, THUMBNAIL_PERCENTAGE } = require('./aws_defines');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../status_code');

const version = '0.0.1';

router.get('/', (req, res) => {
  res.status(HTTP_STATUS_CODE.OK).json({ version, error: DB_STATUS_CODE.OK });
});

router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({
      attributes: ['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.id }
    });
    const paintings = await user.getPaintings({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes']
    });

    delete user.id;

    return res.status(HTTP_STATUS_CODE.OK).json({ user, paintings, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.get('/user/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findOne({
      attributes: ['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.params.id }
    });
    const paintings = await user.getPaintings({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes']
    });

    return res.status(HTTP_STATUS_CODE.OK).json({ user, paintings, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
})

router.get('/painting/:id', verifyToken, async (req, res, next) => {
  try {
    const painting = await Painting.findOne({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes', 'ownerId'],
      where: { id: req.params.id }
    });
    const owner = await User.findOne({
      attributes:['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.id }
    })
    delete painting.ownerId;
    const images = await painting.getImages({ attributes: ['id', 'url'] });

    return res.status(HTTP_STATUS_CODE.OK).json({ painting, owner, images, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  }
})

router.post('/painting', verifyToken, upload.array('paintings', 10), async (req, res, next) => {
  const { painter, name, description, material, width, height, price, onSale } = req.body;
  // TODO: Input Validation
  try {
    const thumbnailName = sha256(uuid()) + '.jpg';
    const painting = await Painting.create({
      painter, name, description, material, width,
      height, price, onSale,
      ownerId: req.id,
      thumbnailUrl: thumbnailName
    });

    const thumbnail = await imageThumbnail(req.files[0].buffer, { percentage: THUMBNAIL_PERCENTAGE });

    s3.upload({
      Bucket: BUCKETS.THUMBNAIL,
      Key: thumbnailName,
      Body: thumbnail,
      ACL: 'public-read'
    }, async (err, data) => {
      if (err) {
        logger.error(`[AWS] ${err}`);
        await Painting.destroy({ where: { id: painting.id } });
  
        return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: DB_STATUS_CODE.AWS_S3_ERROR });
      };
    });
  
    req.files.forEach(async (element) => {
      const fileName = sha256(uuid()) + path.extname(element.originalname);

      await Image.create({
        url: fileName,
        paintingId: painting.id
      });

      s3.upload({
        Bucket: BUCKETS.PAINTING,
        Key: fileName,
        Body: element.buffer,
        ACL: 'public-read'
      }, async (err, data) => {
        if (err) {
          logger.error(`[AWS] ${err}`);
          await Painting.destroy({ where: { id: painting.id } });

          return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: DB_STATUS_CODE.AWS_S3_ERROR });
        };
      });
    });

    return res.status(HTTP_STATUS_CODE.CREATED).json({ error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

module.exports = router;
