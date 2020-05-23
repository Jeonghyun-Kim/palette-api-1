module.exports = (sequelize, DataTypes) => {
  return sequelize.define('refreshToken', {
    value: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};