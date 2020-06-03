module.exports = (sequelize, DataTypes) => {
  const askBoard = sequelize.define('AskBoard', {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'askBoard',
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  });

  return askBoard;
};
