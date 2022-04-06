'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Safes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Safes.belongsTo(models.Users, {foreignKey: 'user_id', as: 'user'})
      Safes.hasMany(models.Transactions, {foreignKey: 'safe_id', as: 'safe'})
    }
  };
  Safes.init({
  
    user_id: DataTypes.INTEGER,
    safeName: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    openingBalance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Safes'
    // hooks: { afterFind: (safes) => {
    //   if (safes.length > 0) {
    //     safes.forEach(el => {
    //       console.log("---", el.amount)
    //       el.amount = el.amount.toString();
    //     })
    //   }
      
    //    } }
  });
  return Safes;
};