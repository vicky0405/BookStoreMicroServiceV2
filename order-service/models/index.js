const ShippingMethod = require("./ShippingMethodModel");
const { Order } = require("./OrderModel");
const { OrderDetail } = require("./OrderDetailModel");
const { OrderAssignment } = require("./OrderAssignmentModel");
const sequelize = require("../db");
// Order associations
Order.belongsTo(ShippingMethod, {
  foreignKey: "shipping_method_id",
  as: "shippingMethod",
  onDelete: "SET NULL",
});
// Note: Previous association via promotion_code removed due to schema change
Order.hasMany(OrderDetail, {
  foreignKey: "order_id",
  as: "details",
  onDelete: "CASCADE",
});
Order.hasOne(OrderAssignment, {
  foreignKey: "order_id",
  as: "assignment",
  onDelete: "CASCADE",
});

ShippingMethod.hasMany(Order, {
  foreignKey: "shipping_method_id",
  as: "orders",
});
// Note: Previous association via promotion_code removed due to schema change

// Order Detail associations
OrderDetail.belongsTo(Order, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderAssignment.belongsTo(Order, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
});
module.exports = {
  sequelize,
  Order,
  OrderDetail,
  OrderAssignment,
  ShippingMethod,
};
