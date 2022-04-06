'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Transactions', 'type', {type: DataTypes.ENUM('expense', 'addIncome')}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Transactions', 'type', {type: DataTypes.ENUM('expense', 'addIncome')}
    )
  }
};
