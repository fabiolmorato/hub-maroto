const Sequelize = require('sequelize');
const { Model } = Sequelize;

const sequelize = require('../database');

class User extends Model {}

User.init({
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: Sequelize.STRING,
    allowNull: false
  },

  username: {
    type: Sequelize.STRING,
    allowNull: false
  },

  email: {
    type: Sequelize.STRING,
    allowNull: false
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  sequelize,
  timestamps: false
});

module.exports = User;
