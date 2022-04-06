'use strict';
const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Safes', 'openingBalance', {type: DataTypes.INTEGER}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'Safes', 'openingBalance', {type: DataTypes.INTEGER}
    )
  }
};
