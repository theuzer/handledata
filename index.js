const express = require('express');
const sql = require('mssql');

const port = process.env.PORT || 3000;

const app = express();

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});

app.get('/', (req, res) => {
  res.send('working');
});

var config = {
  server: "testserver-logdata.database.windows.net",
  database: "MyDatabase",
  user: "david",
  password: "Admin123",
  port: 1433,
  options: {
        encrypt: true
    }
 };

 sql.connect(config).then(() => {
   console.log('1');
   /*
   new sql.Request().query(query)
   .then((result) => {
     console.log(result);
   })
   .catch((err) => {
     console.log(err);
   });
   */
   new sql.Request().query(query2)
   .then((result) => {
     console.log('good');
   })
   .catch((err) => {
     console.log(err);
   });

});

var query = 'SELECT * FROM Game';
const gameId = '3DE86D0B6846433099D4FF51582E7F4B';
const date = '2012-06-18 10:34:09';
const mode = '1733162751';
const variable = 'asd';
var query2 = "INSERT INTO Game (GameId, DateCreated, Mode, Patch, MapId, Type, ServerType, RankedType, Stats) VALUES ('" + gameId + "','" + date + "','" + mode + "','" + variable + "','" + variable + "','" + variable + "','" + variable + "','" + variable + "','" + variable + "');";
