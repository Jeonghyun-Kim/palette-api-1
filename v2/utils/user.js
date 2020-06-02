const sha256 = require('sha256');
const { uuid } = require('uuidv4');

const logger = require('../../config/winston_config');
const db = require('../../models');
const { mailer, token, response } = require('./common');

const userUtils = {};

userUtils.findById = async (id, res) => {
  try {
    const user = await db.User.findOne({ where: { id } });

    if (user) {
      delete user.password;
    };

    return user;
  } catch (err) {
    logger.error(`[USER-findById] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.findByEmail = async (email, res) => {
  try {
    const user = await db.User.findOne({ where: { email } });

    if (user) {
      delete user.password;
    };

    return user;
  } catch (err) {
    logger.error(`[USER-findByEmail] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.findByNick = async (nick, res) => {
  try {
    const user = await db.User.findOne({ where: { nick } });

    if (user) {
      delete user.password;
    };

    return user;
  } catch (err) {
    logger.error(`[USER-findByNick] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.create = async ({ nick, name, email, password, gender }, res) => {
  try {
    const user = await db.User.create({ nick, name, email, password, gender });

    if (mailer.sendVerificationEmail(user, res)) {
      const accessToken = token.create(user.id);
      const refreshToken = sha256(uuid());

      logger.info(`refreshToken: ${refreshToken}, user: ${JSON.stringify(user)}`);

      await db.RefreshToken.create({ value: refreshToken, userId: user.id });

      return { accessToken, refreshToken };
    } else {
      await user.destroy();

      return response.sendInternalError(res);
    };    
  } catch (err) {
    logger.error(`[USER-create] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.isAdmin = async (id, res) => {
  try {
    const user = await this.findById(id);

    if (!user || user.level < 90) {
      return null;
    } else {
      return { level: user.level };
    };
  } catch (err) {
    logger.error(`[USER-isAdmin] ${err}`);

    return response.sendInternalError(res);
  }
};

userUtils.deleteById = async (id, res) => {
  try {
    const user = await this.findById(id);

    if (!user) {
      return null;
    } else {
      await user.destroy();
  
      return true;
    };
  } catch (err) {
    logger.error(`[USER-delete] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.setLevelByNick = async ({ nick, level }, res) => {
  try {
    const user = await this.findByNick(nick, res);

    if (!user) {
      return null;
    } else {
      await user.update({ level }); 

      return { level };
    };
  } catch (err) {
    logger.error(`[USER-setLevelByNick] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.setLevelById = async ({ id, level }, res) => {
  try {
    const user = await this.findById(id, res);

    if (!user) {
      return null;
    } else {
      await user.update({ level }); 

      return { level };
    };
  } catch (err) {
    logger.error(`[USER-setLevelById] ${err}`);

    return response.sendInternalError(res);
  };
};

userUtils.setLevelByEmail = async ({ email, level }, res) => {
  try {
    const user = await this.findByEmail(email, res);

    if (!user) {
      return null;
    } else {
      await user.update({ level }); 

      return { level };
    };
  } catch (err) {
    logger.error(`[USER-setLevelByEmail] ${err}`);

    return response.sendInternalError(res);
  };
};

module.exports = userUtils;