'use strict';

const Sequelize = require('sequelize');

const config = require('../config/db_config')[process.env.NONE_ENV || 'development'];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* CONFIGURE DB ASSOCIATIONS HERE */

module.exports = db;
