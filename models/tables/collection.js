module.exports = (sequelize, DataTypes) => {
  const collection = sequelize.define('Collection', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    backgroudColor: {
      type: DataTypes.STRING(9),
      allowNull: false,
      defaultValue: '#ffedf7f7',
    },
    numLike: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'collection',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return collection;
};
