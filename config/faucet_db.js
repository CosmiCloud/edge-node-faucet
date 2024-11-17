const fs = require("fs");
const path = require("path");
const configPath = path.resolve(__dirname, "./faucet_config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const mysql = require('mysql')

const pool = mysql.createPool({
    host: config.db_host,
    user: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    waitForConnections: true,
    connectionLimit: 1000, // Adjust this based on your requirements
    queueLimit: 0
})

module.exports = pool;