'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Profiles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Profiles.belongsTo(models.Users, { foreignKey: 'user_id', targetKey: 'id' })
        }
    };
    Profiles.init({
        user_id: DataTypes.INTEGER,
        fullName: DataTypes.STRING,
        gender: DataTypes.ENUM('Male', 'Female'),
        age: DataTypes.INTEGER,
        profilePicture: {
            type: DataTypes.STRING,
            defaultValue: 'https://res.cloudinary.com/charactermovie/raw/upload/v1634025146/ProfileKasE/profilePictures/profile%20picture%20default%20-%202021-9-12%20-%2014-52-23-801.png'
        }
    }, {
        sequelize,
        modelName: 'Profiles',
    });
    return Profiles;
};