const sha256 = require('sha256');
const { uuid } = require('uuidv4');

const logger = require('../../config/winston_config');
const db = require('../../models');
const { mailer, token, response } = require('./common');

const userUtils = {};

userUtils.findById = async (id, res) => {
  try {
    return await db.User.findOne({ where: { id } });
  } catch (error) {
    logger.error(`[USER-findById] ${error}`);

    response.sendInternalError(res);
  };
};

userUtils.findByEmail = async (email, res) => {
  try {
    return await db.User.findOne({ where: { email } });
  } catch (error) {
    logger.error(`[USER-findByEmail] ${error}`);

    response.sendInternalError(res);
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
      logger.error(`[MAILER] ${error}`);
      await user.destroy();

      return response.sendInternalError(res);
    };    
  } catch (error) {
    logger.error(`[USER-create] ${error}`);

    return response.sendInternalError(res);
  };
};

module.exports = userUtils;