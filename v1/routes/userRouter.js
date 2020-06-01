const express = require('express');
const router = express.Router();
const sha256 = require('sha256');

const logger = require('../../config/winston_config');
const db = require('../../models');
const { verifyToken, checkAdmin } = require('../middlewares');
const { HTTP_STATUS_CODE, DB_STATUS_CODE } = require('../../status_code');

router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      attributes: ['id', 'username', 'name', 'email', 'gender',
        'numFans', 'profileSrc', 'profileMsg'],
      where: { id: req.params.id }
    });
    if (user === null) {
      res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ error: DB_STATUS_CODE.NO_SUCH_USER });
    };
    const paintings = await user.getPaintings({
      attributes: ['id', 'painter', 'name', 'description', 'material',
        'width', 'height', 'price', 'onSale', 'numLikes', 'thumbnailUrl']
    });

    return res.status(HTTP_STATUS_CODE.OK).json({ user, paintings, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.put('/info', verifyToken, async (req, res, next) => {
  const { username, name, gender } = req.body;
  try {
    const exUser = await db.User.findOne({ where: { username } });
    if (exUser) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.USERNAME_ALREADY_OCCUPIED });
    };
    const user = await db.User.findOne({ where: { id: req.id } });
    await user.update({ username, name, gender });

    return res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.put('/password', verifyToken, async (req, res, next) => {
  const { password, newPassword } = req.body;
  try {
    const user = await db.User.findOne({ where: { id: req.id }});
    if (user.password !== sha256(password)) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    };
    await user.update({ password: sha256(password)});

    return res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.put('/level/username/:username', verifyToken, checkAdmin, async (req, res, next) => {
  const { level } = req.body;
  const { username } = req.params;
  try {
    const user = await db.User.findOne({ where: { username } });
    await user.update({ level });

    return res.status(HTTP_STATUS_CODE.OK).json({ level, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.put('/level/id/:id', verifyToken, checkAdmin, async (req, res, next) => {
  const { level } = req.body;
  const { id } = req.params;
  try {
    const user = await db.User.findOne({ where: { id } });
    await user.update({ level });

    return res.status(HTTP_STATUS_CODE.OK).json({ level, error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.delete('/', verifyToken, async (req, res, next) => {
  const { password } = req.body;
  try {
    const user = await db.User.findOne({ where: { id: req.id }});
    if (user.password !== sha256(password)) {
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({ error: DB_STATUS_CODE.PASSWORD_WRONG });
    };
    await user.destroy();

    return res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

router.delete('/username/:username', verifyToken, checkAdmin, async (req, res, next) => {
  const { username } = req.params;
  try {
    const user = await db.User.findOne({ where: { username } });
    await user.destroy();

    return res.status(HTTP_STATUS_CODE.OK).json({ error: DB_STATUS_CODE.OK });
  } catch (error) {
    logger.error(`[DB] ${error}`);

    return next(error);
  };
});

module.exports = router;
