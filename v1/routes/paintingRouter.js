const express = require('express');
const router = express.Router();
const { uuid } = require('uuidv4');
const sha256 = require('sha256');
const path = require('path');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const imageThumbnail = require('image-thumbnail');

const logger = require('../../config/winston_config');
const db = require('../../models');
const { verifyToken } = require('../middlewares');
const { s3, BUCKETS, THUMBNAIL_PERCENTAGE } = require('../aws_defines');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const painting = await db.Painting.findOne({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes', 'ownerId'],
      where: { id: req.params.id }
    });
    if (painting === null) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_PAINTING });
    };
    const owner = await db.User.findOne({
      attributes:['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: painting.ownerId }
    })
    delete painting.ownerId;
    const images = await painting.getImages({ attributes: ['id', 'url'] });

    return res.status(HTTP_STATUS_CODE.OK).json({ painting, owner, images, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  }
})

router.post('/', verifyToken, upload.array('paintings', 10), async (req, res, next) => {
  const { painter, name, description, material, width, height, price, onSale } = req.body;
  // TODO: Input Validation
  try {
    const thumbnailName = sha256(uuid()) + '.jpg';
    const painting = await db.Painting.create({
      painter, name, description, material, width,
      height, price, onSale,
      ownerId: req.id,
      thumbnailUrl: thumbnailName,
      numImages: req.files.length
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
        await painting.destroy();
  
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
          await painting.destroy();

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
