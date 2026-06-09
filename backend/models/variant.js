'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Variant extends Model {
    static associate(models) {
      // Definisi asosiasi jika diperlukan di masa depan
    }
  }
  Variant.init({
    brand: { type: DataTypes.STRING, allowNull: false },
    oilType: { type: DataTypes.STRING, allowNull: false },
    txHash: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'Variant',
    tableName: 'Variants'
  });
  return Variant;
};