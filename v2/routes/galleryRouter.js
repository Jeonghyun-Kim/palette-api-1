const express = require('express');
const sha256 = require('sha256');
const { uuid } = require('uuidv4');
const jsonParser = require('body-parser').json();
const path = require('path');
const multer = require('multer');

const { response, uploadS3 } = require('../utils/common');
// const userUtils = require('../utils/user');
const galleryUtils = require('../utils/gallery');
const { verifyToken, checkAdmin } = require('../middlewares');
const { BUCKETS } = require('../aws_defines');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1000,
  },
});

const router = express.Router();
router.use(jsonParser);

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const gallery = await galleryUtils.findOne(req.id, res);
    const paintings = await galleryUtils.getPaintings();
    const collections = await galleryUtils.getCollections();

    const { name, address, tel, mobile, profileUrl, profileMsg } = gallery;

    return res.status(HTTP_STATUS_CODE.OK)
      .json({
        gallery: { name, address, tel, mobile, profileUrl, profileMsg },
        paintings,
        collections,
      });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const gallery = await galleryUtils.findOne(req.params.id, res);
    const paintings = await galleryUtils.getPaintings();
    const collections = await galleryUtils.getCollections();

    const { name, address, tel, mobile, profileUrl, profileMsg } = gallery;

    return res.status(HTTP_STATUS_CODE.OK)
      .json({
        gallery: { name, address, tel, mobile, profileUrl, profileMsg },
        paintings,
        collections,
      });
  } catch (err) {
    return next(err);
  }
});

router.get('/all', verifyToken, async (_req, res, next) => {
  try {
    const galleries = await galleryUtils.findAll(res);

    return res.status(HTTP_STATUS_CODE.OK).json({ galleries });
  } catch (err) {
    return next(err);
  }
});

router.post('/', verifyToken, checkAdmin, upload.single('profile'), async (req, res, next) => {
  const { name, address = '', tel, mobile, profileMsg = '' } = req.body;
  if (!name && !tel && !mobile) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: DB_STATUS_CODE.GALLERY_BAD_REQUEST });
  }
  // TODO: Input Validation
  try {
    let profileUrl = null;
    if (req.file) {
      profileUrl = `${sha256(uuid())}${path.extname(req.file.originalname)}`;
      if (!await uploadS3(BUCKETS.PROFILE, profileUrl, req.file.buffer)) {
        return response.sendInternalError(res);
      }
    }
    const { id } = await galleryUtils.create({
      name, address, tel, mobile, profileMsg, profileUrl,
    }, res);

    return res.status(HTTP_STATUS_CODE.CREATED).json({ id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
