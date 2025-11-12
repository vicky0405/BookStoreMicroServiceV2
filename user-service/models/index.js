const User = require("./UserModel");
const Role = require("./RoleModel");

module.exports = {
  User,
  Role,
};

User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
