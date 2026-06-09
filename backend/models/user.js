// models/user.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Definisi asosiasi jika diperlukan di masa depan
    }
  }
  User.init({
    username: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true // Username tidak boleh kembar
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.STRING, 
      defaultValue: 'admin' 
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users'
  });
  return User;
};