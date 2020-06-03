module.exports = (sequelize, DataTypes) => {
  const gallery = sequelize.define('Gallery', {
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
    tableName: 'gallery',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    hooks: {
      afterDestroy: (instance, _options) => {
        instance.getCollections().then(collections => collections.forEach(collection => collection.destrory()));
      },
      afterRestore: (instance, _options) => {
        instance.getCollections({ paranoid: false }).then(collections => collections.forEach(collection => collection.restore()));
      },
    },
  });

  return gallery;
};