'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      limit_id: {
        type: Sequelize.INTEGER
      },
      safe_id: {
        type: Sequelize.INTEGER
      },
      detailExpense: {
        type: Sequelize.STRING
      },
      expense: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('expense', 'addIncome')
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Transactions');
  }
};