module.exports = (sequelize, DataTypes) => {
  const artFair = sequelize.define('ArtFair', {
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
    tableName: 'artFair',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return artFair;
};
