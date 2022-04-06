'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.renameColumn('Transactions', 'limit_id', 'category_id');
    }
};