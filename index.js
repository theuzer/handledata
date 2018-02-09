const express = require('express');
const path = require('path');
const ontime = require('ontime');
const https = require('https');

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
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

dataConnection.connect()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
  console.log('a');
});

ontime({
  cycle: ['01:00:00'],
}, (ot) => {
  getTelemetries.executeQuery(getTelemetries.getYesterdayStatsQueryByDate(null));
  ot.done();
});
