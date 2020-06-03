const sha256 = require('sha256');
const { uuid } = require('uuidv4');

const logger = require('../../config/winston_config');
const db = require('../../models');
const { mailer, token, response } = require('./common');

const userUtils = {};

userUtils.findById = async (id, res, attr = {}) => {
  try {
    const attributes = attr;
    attributes.exclude = ['password'];
    const user = await db.User.findOne({ where: { id }, attributes });

    return user;
  } catch (err) {
    logger.error(`[USER-findById] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.findByEmail = async (email, res, attr = {}) => {
  try {
    const attributes = attr;
    attributes.exclude = ['password'];
    const user = await db.User.findOne({ where: { email }, attributes });

    return user;
  } catch (err) {
    logger.error(`[USER-findByEmail] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.findByNick = async (nick, res, attr = {}) => {
  try {
    const attributes = attr;
    attributes.exclude = ['password'];
    const user = await db.User.findOne({ where: { nick }, attributes });

    return user;
  } catch (err) {
    logger.error(`[USER-findByNick] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.create = async ({ nick, name, email, password, gender }, res) => {
  try {
    const user = await db.User.create({ nick, name, email, password, gender });

    mailer.sendVerificationEmail(user);

    const accessToken = token.create(user.id);
    const refreshToken = sha256(uuid());

    await user.setToken(await db.RefreshToken.create({ value: refreshToken }));

    return { accessToken, refreshToken };
  } catch (err) {
    logger.error(`[USER-create] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.updateInfo = async (id, { nick, name, gender }, res) => {
  try {
    const user = await userUtils.findById(id, res);

    if (!user) {
      return null;
    }

    await user.update({ nick, name, gender });

    return { nick, name, gender };
  } catch (err) {
    logger.error(`[USER-updateInfo] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.isAdmin = async (id, res) => {
  try {
    const user = await userUtils.findById(id, res);

    if (!user || user.level < 90) {
      return null;
    }

    return { level: user.level };
  } catch (err) {
    logger.error(`[USER-isAdmin] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.deleteById = async (id, res) => {
  try {
    const user = await userUtils.findById(id, res);

    if (!user) {
      return false;
    }

    await user.destroy();

    return true;
  } catch (err) {
    logger.error(`[USER-delete] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.setLevelByNick = async ({ nick, level }, res) => {
  try {
    const user = await userUtils.findByNick(nick, res);

    if (!user) {
      return null;
    }

    await user.update({ level });

    return level;
  } catch (err) {
    logger.error(`[USER-setLevelByNick] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.setLevelById = async ({ id, level }, res) => {
  try {
    const user = await userUtils.findById(id, res);

    if (!user) {
      return null;
    }

    await user.update({ level });

    return level;
  } catch (err) {
    logger.error(`[USER-setLevelById] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.setLevelByEmail = async ({ email, level }, res) => {
  try {
    const user = await userUtils.findByEmail(email, res);

    if (!user) {
      return null;
    }

    await user.update({ level });

    return level;
  } catch (err) {
    logger.error(`[USER-setLevelByEmail] ${err}`);

    return response.sendInternalError(res);
  }
};

module.exports = userUtils;
