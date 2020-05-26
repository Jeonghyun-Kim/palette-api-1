module.exports = (sequelize, DataTypes) => {
  return sequelize.define('painting', {
    painter: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    width: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    price: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    onSale: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    numLikes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    thumbnailUrl: {
      type: DataTypes.STRING(70),
      allowNull: false
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci'
  });
};