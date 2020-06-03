const logger = require('../../config/winston_config');
const db = require('../../models');
const { response } = require('./common');

const galleryUtils = {};

galleryUtils.findOne = async (id, res) => {
  try {
    return await db.Gallery.findOne({ where: { id } });
  } catch (err) {
    logger.error(`[GALLERY-findOne] ${err}`);

    return response.sendInternalError(res);
  }
};

galleryUtils.findAll = async (res) => {
  try {
    return await db.Gallery.findAll({
      attributes: ['id', 'name', 'address', 'tel', 'mobile', 'profileUrl', 'profileMsg'],
    });
  } catch (err) {
    logger.error(`[GALLERY-findALL] ${err}`);

    return response.sendInternalError(res);
  }
};

galleryUtils.create = async ({ name, address, tel, mobile, profileMsg, profileUrl }, res) => {
  try {
    const gallery = await db.Gallery.create({ name, address, tel, mobile, profileMsg, profileUrl });

    return { id: gallery.id };
  } catch (err) {
    logger.error(`[GALLERY-create] ${err}`);

    return response.sendInternalError(res);
  }
};

galleryUtils.uploadProfilePic = async (id, { profileUrl }, res) => {
  try {
    const gallery = await galleryUtils.findOne(id, res);

    if (!gallery) {
      return null;
    }

    await gallery.update({ profileUrl });

    return true;
  } catch (err) {
    logger.error(`[GALLERY-uploadProfilePic] ${err}`);

    return response.sendInternalError(res);
  }
};

module.exports = galleryUtils;
