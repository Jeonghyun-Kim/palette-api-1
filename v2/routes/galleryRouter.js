const express = require('express');
const sha256 = require('sha256');
const { uuid } = require('uuidv4');
const jsonParser = require('body-parser').json();
const path = require('path');
const multer = require('multer');

const { response, uploadS3 } = require('../utils/common');
const userUtils = require('../utils/user');
const galleryUtils = require('../utils/gallery');
const { verifyToken } = require('../middlewares');
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
    const user = await userUtils.findById(req.id, res);

    const id = user.fkGalleryId;
    if (!id) {
      return res.status(HTTP_STATUS_CODE.FORBIDDEN)
        .json({ error: DB_STATUS_CODE.NOT_GALLERY_MANAGER });
    }
    const gallery = await galleryUtils.findOne(id, res);
    const paintings = await gallery.getPaintings();
    const collections = await gallery.getCollections();

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

router.put('/profile', verifyToken, upload.single('profile'), async (req, res, next) => {
  try {
    const manager = await userUtils.findById(req.id, res);

    if (!manager.fkGalleryId) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.UNAUTHORIZED });
    }

    const profileUrl = `${sha256(uuid())}${path.extname(req.file.originalname)}`;
    if (!await uploadS3(BUCKETS.PROFILE, profileUrl, req.file.buffer)) {
      return response.sendInternalError(res);
    }

    if (await galleryUtils.uploadProfilePic(manager.fkGalleryId, { profileUrl }, res)) {
      return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
    }

    return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE)
      .json({ error: DB_STATUS_CODE.GALLERY_DESTROYED });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const gallery = await galleryUtils.findOne(req.params.id, res);

    if (!gallery) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ error: DB_STATUS_CODE.NO_SUCH_GALLERY });
    }
    const paintings = await gallery.getPaintings();
    const collections = await gallery.getCollections();

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

module.exports = router;
