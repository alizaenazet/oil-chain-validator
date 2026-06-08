'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScanLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scanLocation: {
        type: Sequelize.STRING,
        allowNull: false
      },
      txHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scannedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScanLogs');
  }
};