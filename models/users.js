'use strict';
const { v4 } = require('uuid')
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Users.hasMany(models.Profiles, { foreignKey: 'user_id', sourceKey: 'id' })
            Users.hasMany(models.Safes, { foreignKey: 'user_id', sourceKey: 'id' })
            Users.hasMany(models.Transactions, { foreignKey: 'user_id', sourceKey: 'id' })
            Users.hasMany(models.Limits, { foreignKey: 'user_id', sourceKey: 'id' })
        }
    };
    Users.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        confirmPassword: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verifCode: {
            type: DataTypes.UUID,
            defaultValue: v4
        }
    }, {
        sequelize,
        modelName: 'Users',
    });
    return Users;
};