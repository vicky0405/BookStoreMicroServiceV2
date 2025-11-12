const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Rule = sequelize.define('Rule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  min_import_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  min_stock_before_import: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  max_promotion_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'rules',
  timestamps: false,
});

module.exports = Rule;