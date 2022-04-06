'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Transactions extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Transactions.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'id' })
            Transactions.belongsTo(models.Categories, {
                foreignKey: "category_id",
                as: "Categories"
            })
            Transactions.belongsTo(models.Safes, { foreignKey: 'safe_id', targetKey: 'id' })
        }
    };
    Transactions.init({
        user_id: DataTypes.INTEGER,
        category_id: DataTypes.INTEGER,
        safe_id: DataTypes.INTEGER,
        detailExpense: DataTypes.STRING,
        expense: DataTypes.INTEGER,
        type: DataTypes.STRING,
        amount: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Transactions',
    });
    return Transactions;
};