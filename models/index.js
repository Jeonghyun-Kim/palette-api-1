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
db.User.hasOne(db.RefreshToken, { as: 'Token', onDelete: 'CASCADE', hooks: true, foreignKey: 'fkUserId' });
db.RefreshToken.belongsTo(db.User, { as: 'User', foreignKey: 'fkUserId' });

db.ArtFair.hasMany(db.Collection, { as: 'Collections', foreignKey: 'fkArtFair' });
db.Collection.belongsTo(db.ArtFair, { as: 'ArtFair', foreignKey: 'fkArtFair' });

db.Gallery.hasMany(db.Collection, { as: 'Collections', onDelete: 'CASCADE', hooks: true, foreignKey: 'fkGalleryId' });
db.Collection.belongsTo(db.Gallery, { as: 'Gallery', foreignKey: 'fkGalleryId' });

db.Gallery.hasMany(db.Painting, { as: 'Paintings', foreignKey: 'fkGalleryId' });
db.Painting.belongsTo(db.Gallery, { as: 'Gallery', foreignKey: 'fkGalleryId' });

db.Gallery.hasMany(db.User, { as: 'Managers', foreignKey: 'fkGalleryId' });
db.User.belongsTo(db.Gallery, { as: 'Gallery', foreignKey: 'fkGalleryId' });

db.Painting.hasMany(db.Image, { as: 'Images', onDelete: 'CASCADE', hooks: true, foreignKey: 'fkPaintingId' });
db.Image.belongsTo(db.Painting, { as: 'Painting', foreignKey: 'fkPaintingId' });

db.Collection.belongsToMany(db.Painting, { as: 'Paintings', through: 'collectionPaintings', foreignKey: 'fkCollectionId' });
db.Painting.belongsToMany(db.Collection, { as: 'Collections', through: 'collectionPaintings', foreignKey: 'fkPaintingId' });

db.User.belongsToMany(db.Collection, { as: 'LikedCollections', through: 'collectionLike', foreignKey: 'fkUserId' });
db.Collection.belongsToMany(db.User, { as: 'LikedUsers', through: 'collectionLike', foreignKey: 'fkCollectionId' });

db.User.belongsToMany(db.Collection, { as: 'AskedCollections', through: 'askBoard', foreignKey: 'fkUserId' });
db.Collection.belongsToMany(db.User, { as: 'AsKedUsers', through: 'askBoard', foreignKey: 'fkCollectionId' });

db.User.belongsToMany(db.Gallery, { as: 'Followings', through: 'galleryFollow', foreignKey: 'fkUserId' });
db.Gallery.belongsToMany(db.User, { as: 'Followers', through: 'galleryFollow', foreignKey: 'fkGalleryId' });

module.exports = db;
