const express = require('express');
const router = express.Router();

const logger = require('../../config/winston_config');
const db = require('../../models');
const { verifyToken } = require('../middlewares');
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

module.exports = router;
