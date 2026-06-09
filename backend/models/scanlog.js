'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ScanLog extends Model {
    static associate(models) {
      // Definisi asosiasi jika diperlukan di masa depan
    }
  }
  ScanLog.init({
    productId: { type: DataTypes.STRING, allowNull: false },
    serialNumber: { type: DataTypes.STRING, allowNull: false },
    scanLocation: { type: DataTypes.STRING, allowNull: false },
    txHash: { type: DataTypes.STRING, allowNull: false },
    scannedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: 'ScanLog',
    tableName: 'ScanLogs' // Memastikan nama tabel sinkron dengan database
  });
  return ScanLog;
};