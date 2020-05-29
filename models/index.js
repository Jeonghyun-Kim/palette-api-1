const Sequelize = require('sequelize');

const config = require('../config/db_config')[process.env.NONE_ENV || 'development'];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.RefreshToken = require('./refreshToken')(sequelize, Sequelize);
db.Painting = require('./painting')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);

/* CONFIGURE DB ASSOCIATIONS HERE */
db.User.hasOne(db.RefreshToken, { onDelete: 'cascade' });

db.User.hasMany(db.Painting, { foreignKey: 'ownerId', onDelete: 'cascade' });

db.Painting.hasMany(db.Image, { onDelete: 'cascade' });

db.User.belongsToMany(db.Painting, { as: 'LikedPaintings', through: 'UserLikePainting', foreignKey: 'userId' });
db.Painting.belongsToMany(db.User, { as: 'LikedUsers', through: 'UserLikePainting', foreignKey: 'paintingId'});

module.exports = db;
