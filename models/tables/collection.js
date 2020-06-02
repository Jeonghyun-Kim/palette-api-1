module.exports = (sequelize, DataTypes) => {
  return sequelize.define('collection', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    numLike: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};