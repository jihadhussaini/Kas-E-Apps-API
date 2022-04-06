'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn(
            'Limits', 'amount', { type: DataTypes.INTEGER }
        )
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn(
            'Limits', 'amount', { type: DataTypes.INTEGER }
        )
    }
};