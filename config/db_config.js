require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'test_db_dev',
    host: process.env.DB_HOST_DEV,
    dialect: 'mariadb',
    timezone: '+09:00',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'test_db_dev',
    host: process.env.DB_HOST_PRO,
    dialect: 'mariadb',
    timezone: '+09:00',
    logging: false,
  },
};
