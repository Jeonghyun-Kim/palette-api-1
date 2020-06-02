module.exports = (sequelize, DataTypes) => {
  return sequelize.define('gallery', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    tel: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    profileUrl: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profileMsg: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};