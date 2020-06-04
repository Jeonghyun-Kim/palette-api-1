const express = require('express');
const sha256 = require('sha256');
const jsonParser = require('body-parser').json();
const userUtils = require('../utils/user');
const { verifyToken } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

const router = express.Router();
router.use(jsonParser);

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const user = await userUtils.findById(req.id, res);

    const { createdAt, updatedAt, fkGalleryId, ...rest } = user.dataValues;

    if (!user.fkGalleryId) {
      return res.status(HTTP_STATUS_CODE.OK).json({ user: rest });
    }

    const gallery = await user.getGallery();
    const paintings = await gallery.getPaintings();
    const collections = await gallery.getCollections();

    return res.status(HTTP_STATUS_CODE.OK).json({ user: rest, gallery, paintings, collections });
  } catch (err) {
    return next(err);
  }
});

router.put('/', verifyToken, async (req, res, next) => {
  const { nick, name, gender } = req.body;
  // TODO: INPUT VALIDATION

  try {
    const exUser = await userUtils.findByNick(nick, res);

    if (exUser && exUser.id !== req.id) {
      return res.status(HTTP_STATUS_CODE.NOT_ACCEPTABLE)
        .json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    }

    await userUtils.updateInfo(req.id, { nick, name, gender: gender || 'secret' }, res);

    return res.status(HTTP_STATUS_CODE.OK).json({ user: { nick, name, gender: gender || 'secret' } });
  } catch (err) {
    return next(err);
  }
});

router.delete('/', verifyToken, async (req, res, next) => {
  try {
    if (await userUtils.deleteById(req.id, res)) {
      return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
    }

    return res.status(HTTP_STATUS_CODE.EXPECTATION_FAILED)
      .json({ error: DB_STATUS_CODE.COMMON_ERROR });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await userUtils.findById(req.params.id, res);

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    }

    const { nick, name, level, profileUrl } = user;

    return res.status(HTTP_STATUS_CODE.OK).json({ user: { nick, name, level, profileUrl } });
  } catch (err) {
    return next(err);
  }
});

router.put('/password', verifyToken, async (req, res, next) => {
  const { password, newPassword } = req.body;
  if (!password || !newPassword) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.BAD_REQUEST });
  }

  try {
    const user = await userUtils.findById(req.id, res, 1);

    if (user.password !== sha256(password)) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED)
        .json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    }

    await user.update({ password: sha256(newPassword) });

    return res.status(HTTP_STATUS_CODE.OK).json({ error: 0 });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
