require("dotenv").config();
const { Sequelize } = require("sequelize");

// Use service-specific env vars when available, otherwise fall back to generic DB_* vars.
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    // Only enable SSL options if the user explicitly requests it
    // by setting USER_DB_SSL=true or DB_SSL=true in env.
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ user-service: Connected to MySQL successfully.");
  })
  .catch((err) => {
    console.error("❌ user-service: MySQL connection error:", err);
  });

module.exports = sequelize;
