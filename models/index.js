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
db.User.hasOne(db.RefreshToken, { onDelete: 'CASCADE', foreignKey: 'fkUserId' });
// db.RefreshToken.belongsTo(db.User, { onDelete: 'CASCADE', foreignKey: 'fkUserId' });

db.ArtFair.hasMany(db.Collection, { foreignKey: 'fkArtFair' });
// db.Collection.belongsTo(db.ArtFair, { foreignKey: 'fkArtFair' });

db.Gallery.hasMany(db.Collection, { onDelete: 'CASCADE', foreignKey: 'fkGalleryId' });
// db.Collection.belongsTo(db.Gallery, { onDelete: 'CASCADE', foreignKey: 'fkGalleryId' });

db.Gallery.hasMany(db.Painting, { foreignKey: 'fkGalleryId' });
// db.Painting.belongsTo(db.Gallery, { foreignKey: 'fkGalleryId' });

db.Gallery.hasMany(db.User, { as: 'Managers', foreignKey: 'fkGalleryId' });
// db.User.belongsTo(db.Gallery, { as: 'Managers', foreignKey: 'fkGalleryId' });

db.Painting.hasMany(db.Image, { onDelete: 'CASCADE', foreignKey: 'fkPaintingId' });
// db.Image.belongsTo(db.Painting, { onDelete: 'CASCADE', foreignKey: 'fkPaintingId' });

db.Collection.belongsToMany(db.Painting, { through: 'collectionPaintings', foreignKey: 'fkCollectionId' });
db.Painting.belongsToMany(db.Collection, { through: 'collectionPaintings', foreignKey: 'fkPaintingId' });

db.User.belongsToMany(db.Collection, { as: 'LikedCollections', through: 'collectionLike', foreignKey: 'fkUserId' });
db.Collection.belongsToMany(db.User, { as: 'LikedUsers', through: 'collectionLike', foreignKey: 'fkCollectionId'});

db.User.belongsToMany(db.Collection, { as: 'AskedCollections', through: 'askBoard', foreignKey: 'fkUserId' });
db.Collection.belongsToMany(db.User, { as: 'AsKedUsers', through: 'askBoard', foreignKey: 'fkCollectionId'});

db.User.belongsToMany(db.Gallery, { as: 'Followings', through: 'galleryFollow', foreignKey: 'fkUserId' });
db.Gallery.belongsToMany(db.User, { as: 'Followers', through: 'galleryFollow', foreignKey: 'fkGalleryId'});

// db.User.associate = (db) => {
//   db.User.hasOne(db.RefreshToken, { onDelete: 'CASCADE', foreignKey: 'fkUserId' });
//   db.User.belongsTo(db.Gallery, { as: 'Managers', foreignKey: 'fkGalleryId' });
//   db.User.belongsToMany(db.Collection, { as: 'LikedCollections', through: 'collectionLike', foreignKey: 'fkUserId' });
//   db.User.belongsToMany(db.Collection, { as: 'AskedCollections', through: 'askBoard', foreignKey: 'fkUserId' });
//   db.User.belongsToMany(db.Gallery, { as: 'Followings', through: 'galleryFollow', foreignKey: 'fkUserId' });
// };

// db.Collection.associate = (db) => {
//   db.Collection.belongsTo(db.ArtFair, { foreignKey: 'fkArtFair' });
//   db.Collection.belongsTo(db.Gallery, { onDelete: 'CASCADE', foreignKey: 'fkGalleryId' });
//   db.Collection.belongsToMany(db.User, { as: 'LikedUsers', through: 'collectionLike', foreignKey: 'fkCollectionId'});
//   db.Collection.belongsToMany(db.User, { as: 'AsKedUsers', through: 'askBoard', foreignKey: 'fkCollectionId'});
// };

// db.Gallery.associate = (db) => {
//   db.Gallery.hasMany(db.Collection, { onDelete: 'CASCADE', foreignKey: 'fkGalleryId' });
//   db.Gallery.hasMany(db.Painting, { foreignKey: 'fkGalleryId' });
//   db.Gallery.hasMany(db.User, { as: 'Managers', foreignKey: 'fkGalleryId' });
//   db.Gallery.belongsToMany(db.User, { as: 'Followers', through: 'galleryFollow', foreignKey: 'fkGalleryId'});
// };

// db.Painting.associate = (db) => {
//   db.Painting.belongsTo(db.Gallery, { foreignKey: 'fkGalleryId' });
//   db.Painting.hasMany(db.Image, { onDelete: 'CASCADE', foreignKey: 'fkPaintingId' });
//   db.Painting.belongsToMany(db.Collection, { through: 'collectionPaintings', foreignKey: 'fkPaintingId' });
// };

// db.ArtFair.associate = (db) => {
//   db.ArtFair.hasMany(db.Collection, { foreignKey: 'fkArtFair' });
// };

// db.RefreshToken.associate = (db) => {
//   db.RefreshToken.belongsTo(db.User, { onDelete: 'CASCADE', foreignKey: 'fkUserId' });
// };

// db.Image.associate = (db) => {
//   db.Image.belongsTo(db.Painting, { onDelete: 'CASCADE', foreignKey: 'fkPaintingId' });
// };

module.exports = db;
