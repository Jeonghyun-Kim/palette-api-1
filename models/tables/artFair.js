module.exports = (sequelize, DataTypes) => {
  return sequelize.define('artFairs', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    opening: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closing: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};