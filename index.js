const express = require('express');
const path = require('path');
const ontime = require('ontime');
const https = require('https');
const moment = require('moment');

const getTelemetries = require('./logic/getTelemetries');
const logConnection = require('./database/azureDb').logConnection;
const dataConnection = require('./database/azureDb').dataConnection;

const port = process.env.PORT || 3000;

const app = express();

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on port ${port}`);
  }
});

// Keep app awake in Heroku
if (process.env.HEROKU_TIMER_CREATE === 'TRUE') {
  setInterval(() => {
    https.get(process.env.HEROKU_APP_URL);
    console.log('Pinged application');
  }, parseInt(process.env.HEROKU_APP_TIMER, 10));
}

const getQuery1 = gameId => `SELECT STATS FROM GAME WHERE GameId = '${gameId}'`;
// const getQuery2 = "SELECT TOP(100) STATS FROM GAME";
const getQuery3 = "SELECT STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = 2018 AND DATEPART(MONTH, LOGDATE) = 2 AND DATEPART(DAY, LOGDATE) = 4 AND DATEPART(HOUR, LOGDATE) = 14 AND DATEPART(MINUTE, LOGDATE) = 40";

logConnection.connect()
  .then(() => {
    console.log('log connection');
  })
  .catch((err) => {
    console.log(err);
  });

dataConnection.connect()
  .then(() => {
    console.log('data connection');
  })
  .catch((err) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
  console.log('a');
});

const getQuery = () => {
  const date = moment().add(-6, 'd');
  let query = "SELECT STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = ";
  query += date.year();
  query += " AND DATEPART(MONTH, LOGDATE) = ";
  query += date.month() + 1;
  query += " AND DATEPART(DAY, LOGDATE) = ";
  query += date.date();
  query += " AND DATEPART(HOUR, LOGDATE) = ";
  query += date.hour();
  query += " AND DATEPART(MINUTE, LOGDATE) = ";
  query += date.minute();
  console.log(query);
  return query;
};

ontime({
  cycle: ['45'],
}, (ot) => {
  getTelemetries.executeQuery(getQuery());
  ot.done();
});
