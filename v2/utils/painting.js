const logger = require('../../config/winston_config');
const db = require('../../models');
const { response } = require('./common');

const paintingUtils = {};

paintingUtils.findOne = async (id, res) => {
  try {
    return await db.Painting.findOne({ where: { id } });
  } catch (err) {
    logger.error(`[PAINTING-findOne] ${err}`);

    return response.sendInternalError(res);
  }
};

paintingUtils.create = async ({
  painter, name, description, material, width, height,
  price, onSale, numImages, thumbnailUrl,
}, res) => {
  try {
    const painting = await db.Painting.create({
      painter,
      name,
      description,
      material,
      width,
      height,
      price,
      onSale,
      numImages,
      thumbnailUrl,
    });

    return { id: painting.id };
  } catch (err) {
    logger.error(`[PAINTING-create] ${err}`);

    return response.sendInternalError(res);
  }
};

paintingUtils.updateInfo = async (id, {
  painter, name, description, material, width, height, price, onSale,
}, res) => {
  try {
    const painting = await paintingUtils.findById(id, res);

    if (!painting) {
      return null;
    }

    await painting.update({ painter, name, description, material, width, height, price, onSale });

    return painting;
  } catch (err) {
    logger.error(`[PAINTING-updateInfo] ${err}`);

    return response.sendInternalError(res);
  }
};

paintingUtils.delete = async (id, res) => {
  try {
    const painting = await paintingUtils.findOne(id, res);

    if (!painting) {
      return false;
    }

    await painting.destroy();

    return true;
  } catch (err) {
    logger.error(`[PAINTING-delete] ${err}`);

    return response.sendInternalError(res);
  }
};

module.expurts = paintingUtils;
