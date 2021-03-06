'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vehicles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.vehicles.belongsTo(models.user)
      models.vehicles.hasMany(models.comment)
    }
  }
  vehicles.init({
    make: DataTypes.STRING,
    model: DataTypes.STRING,
    url: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'vehicles',
  });
  return vehicles;
};