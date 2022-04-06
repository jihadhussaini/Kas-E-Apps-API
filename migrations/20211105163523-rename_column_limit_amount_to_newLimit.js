'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.renameColumn('Limits', 'amount', 'newLimit');
    }
};