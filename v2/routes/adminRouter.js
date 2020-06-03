const express = require('express');
const sha256 = require('sha256');
const { uuid } = require('uuidv4');
const jsonParser = require('body-parser').json();
const path = require('path');
const multer = require('multer');

const { response, uploadS3 } = require('../utils/common');
const userUtils = require('../utils/user');
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

router.put('/level/id', verifyToken, checkAdmin, async (req, res, next) => {
  const { id, level } = req.body;
  // TODO: INPUT VALIDATION

  if (!id || !level) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  }

  try {
    const newLevel = await userUtils.setLevelById({ id, level }, res);

    if (!newLevel) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ level: newLevel });
  } catch (err) {
    return next(err);
  }
});

router.put('/level/email', verifyToken, checkAdmin, async (req, res, next) => {
  const { email, level } = req.body;
  // TODO: INPUT VALIDATION

  if (!email || !level) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  }

  try {
    const newLevel = await userUtils.setLevelByEmail({ email, level }, res);

    if (!newLevel) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ level: newLevel });
  } catch (err) {
    return next(err);
  }
});

router.put('/level/nick', verifyToken, checkAdmin, async (req, res, next) => {
  const { nick, level } = req.body;
  // TODO: INPUT VALIDATION

  if (!nick || !level) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  }

  try {
    const newLevel = await userUtils.setLevelByNick({ nick, level }, res);

    if (!newLevel) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    }

    return res.status(HTTP_STATUS_CODE.OK).json({ level: newLevel });
  } catch (err) {
    return next(err);
  }
});

router.delete('/user/:id', verifyToken, checkAdmin, async (req, res, next) => {
  try {
    if (await userUtils.deleteById(req.params.id, res)) {
      return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
    }

    return res.status(HTTP_STATUS_CODE.BAD_REQUEST.json({ erorr: DB_STATUS_CODE.NO_SUCH_USER }));
  } catch (err) {
    return next(err);
  }
});

router.post('/gallery', verifyToken, checkAdmin, upload.single('profile'), async (req, res, next) => {
  const { name, address = '', tel, mobile, profileMsg = '' } = req.body;
  if (!name && !tel && !mobile) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({ error: DB_STATUS_CODE.GALLERY_FAIL_VALIDATION });
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
