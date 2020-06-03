module.exports = (sequelize, DataTypes) => {
  const image = sequelize.define('Image', {
    url: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'image',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return image;
};