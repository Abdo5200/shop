const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("node-course", "root", "AmdRyzen32200g", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
