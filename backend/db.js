require("dotenv").config();
const { Sequelize } = require("sequelize");

console.log("BACKEND: " + process.env.DB_NAME);
console.log("BACKEND: " + process.env.DB_USER);
console.log("BACKEND: " + process.env.DB_PASSWORD);
console.log("BACKEND: " + process.env.process.env.DB_HOST);
console.log("BACKEND: " + process.env.DB_PORT);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to MySQL successfully.");
  })
  .catch((err) => {
    console.error("❌ MySQL connection error:", err);
  });

module.exports = sequelize;
