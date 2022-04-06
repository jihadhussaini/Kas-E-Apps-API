"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Categories extends Model {
        static associate(models) {
            Categories.hasMany(models.Limits, {
                foreignKey: "category_id",
                as: "Limit",
            })
            Categories.hasMany(models.Transactions, {
                foreignKey: "category_id",
                as: "Categories"
            })
        }
    };
    Categories.init({
        categoryName: DataTypes.STRING,
        image_url: DataTypes.STRING,
        caption: DataTypes.STRING
    }, {
        sequelize,
        modelName: "Categories",
    });
    return Categories;
};