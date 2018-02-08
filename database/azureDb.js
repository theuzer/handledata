const sql = require('mssql');

const config1 = {
  server: process.env.DB_LOG_SERVER,
  database: process.env.DB_LOG_DATABASE,
  user: process.env.DB_LOG_USERNAME,
  password: process.env.DB_LOG_PASSWORD,
  port: 1433,
  options: { encrypt: true },
};

const config2 = {
  server: process.env.DB_DATA_SERVER,
  database: process.env.DB_DATA_DATABASE,
  user: process.env.DB_DATA_USERNAME,
  password: process.env.DB_DATA_PASSWORD,
  port: 1433,
  options: { encrypt: true },
};

const logConnection = new sql.ConnectionPool(config1);

const dataConnection = new sql.ConnectionPool(config2);

/*
connection1.connect()
  .then((response) => {
    console.log('connection1 good');
  })
  .catch((err) => {
    console.log('connection1 error');
  });

connection2.connect()
  .then((response) => {
    console.log('connection2 good');
  })
  .catch((err) => {
    console.log('connection2 error');
  });
*/

exports.logConnection = logConnection;

exports.dataConnection = dataConnection;
