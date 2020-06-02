const Sequelize = require('sequelize');

const config = require('../config/db_config')[process.env.NONE_ENV || 'development'];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./tables/user')(sequelize, Sequelize);
db.ArtFair = require('./tables/artFair')(sequelize, Sequelize);
db.Gallery = require('./tables/gallery')(sequelize, Sequelize);
db.Collection = require('./tables/collection')(sequelize, Sequelize);
db.AskBoard = require('./tables/askBoard')(sequelize, Sequelize);
db.RefreshToken = require('./tables/refreshToken')(sequelize, Sequelize);
db.Painting = require('./tables/painting')(sequelize, Sequelize);
db.Image = require('./tables/image')(sequelize, Sequelize);

/* CONFIGURE DB ASSOCIATIONS HERE */
db.User.hasOne(db.RefreshToken, { onDelete: 'cascade' });

db.ArtFair.hasMany(db.Collection);
db.Gallery.hasMany(db.Collection, { onDelete: 'cascade' });
db.Gallery.hasMany(db.Painting);
db.Gallery.hasMany(db.User, { as: 'Managers' })
db.Painting.hasMany(db.Image, { onDelete: 'cascade' });

db.Collection.belongsToMany(db.Painting, { through: 'CollectionPaintings' });

db.User.belongsToMany(db.Collection, { as: 'LikedCollections', through: 'collectionLikes', foreignKey: 'userId' });
db.Collection.belongsToMany(db.User, { as: 'LikedUsers', through: 'collectionLikes', foreignKey: 'collectionId'});

db.User.belongsToMany(db.Collection, { as: 'LikedCollections', through: 'askBoards', foreignKey: 'userId' });
db.Collection.belongsToMany(db.User, { as: 'LikedUsers', through: 'askBoards', foreignKey: 'collectionId'});

db.User.belongsToMany(db.Gallery, { as: 'Followings', through: 'galleryFollows', foreignKey: 'userId' });
db.Gallery.belongsToMany(db.User, { as: 'Followers', through: 'galleryFollows', foreignKey: 'galleryId'});

module.exports = db;
