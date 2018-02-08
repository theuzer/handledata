const express = require('express');
const path = require('path');

const getTelemetries = require('./logic/getTelemetries');
const logConnection = require('./database/azureDb').logConnection;

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
  res.sendFile(path.join(__dirname, '/index.html'));
  console.log('a');
});

logConnection.connect()
  .then(() => {
    getTelemetries.executeQuery(getTelemetries.getYesterdayStatsQueryByDate(1));
  })
  .catch((err) => {
    console.log(err);
  });
