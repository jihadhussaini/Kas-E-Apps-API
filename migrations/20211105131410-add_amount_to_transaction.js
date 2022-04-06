'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            'Transactions', 'amount', { type: DataTypes.INTEGER }
        )
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            'Transactions', 'amount', { type: DataTypes.INTEGER }
        )
    }
};