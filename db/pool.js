const { Pool } = require("pg");
require("dotenv").config();

module.exports = new Pool({
  host: "localhost",
  user: "mchow",
  database: "games_db",
  password: process.env.PASSWORD,
  port: "5432",
});
