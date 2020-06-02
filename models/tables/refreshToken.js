module.exports = (sequelize, DataTypes) => {
  return sequelize.define('refreshTokens', {
    value: {
      type: DataTypes.STRING(64),
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};