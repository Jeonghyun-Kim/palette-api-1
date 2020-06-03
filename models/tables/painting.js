module.exports = (sequelize, DataTypes) => {
  const painting = sequelize.define('Painting', {
    painter: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    onSale: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    numLikes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    numImages: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    thumbnailUrl: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'painting',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    hooks: {
      afterDestroy: (instance) => {
        instance.getImages()
          .then((images) => images.forEach((image) => image.destrory()));
      },
      afterRestore: (instance) => {
        instance.getImages({ paranoid: false })
          .then((images) => images.forEach((image) => image.restore()));
      },
    },
  });

  return painting;
};
