// models/index.js
'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Koneksi ke database SQLite lokal
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../data/oilchain.db'),
  logging: false
});

const db = {};

// 1. Import dan register model ScanLog
const ScanLogFactory = require('./scanlog');
const ScanLog = ScanLogFactory(sequelize, DataTypes);
db[ScanLog.name] = ScanLog; // Ini akan menghasilkan db.ScanLog

// 2. Import dan register model Variant
const VariantFactory = require('./variant');
const Variant = VariantFactory(sequelize, DataTypes);
db[Variant.name] = Variant; // Ini akan menghasilkan db.Variant

// Menjalankan fungsi asosiasi (jika ada)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;