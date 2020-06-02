module.exports = (sequelize, DataTypes) => {
  const refreshToken = sequelize.define('RefreshToken', {
    value: {
      type: DataTypes.STRING(64),
      allowNull: false
    }
  }, {
    tableName: 'refreshToken',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return refreshToken;
};