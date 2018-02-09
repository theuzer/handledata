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
  const date = moment().add(-5, 'd');
  const firstMinute = date.minute();
  const lastMinute = firstMinute + 14;
  let query = "SELECT STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = ";
  query += date.year();
  query += " AND DATEPART(MONTH, LOGDATE) = ";
  query += date.month() + 1;
  query += " AND DATEPART(DAY, LOGDATE) = ";
  query += date.date();
  query += " AND DATEPART(HOUR, LOGDATE) = ";
  query += date.hour();
  query += " AND DATEPART(MINUTE, LOGDATE) >= ";
  query += firstMinute;
  query += " AND DATEPART(MINUTE, LOGDATE) <= ";
  query += lastMinute;
  console.log(query);
  return query;
};

ontime({
  cycle: ['00:00', '15:00', '30:00', '45:00'],
}, (ot) => {
  getTelemetries.executeQuery(getQuery());
  ot.done();
});
