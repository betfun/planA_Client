const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  connectTimeout: 1000,
  dateStrings: 'date',
  maxIdle: 10,
  idleTimeout: 6000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

//pool.on('release', function (connection) { console.log('Connection %d released', connection.threadId); });

module.exports = pool