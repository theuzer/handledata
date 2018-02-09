const axios = require('axios');
const sql = require('mssql');
const moment = require('moment');

const logConnection = require('../database/azureDb').logConnection;
const logic = require('./logic');

const responseQueue = [];
const maxWorkers = 50;
let runningWorkers = 0;

const getStatsQueryByDateAndNumberOfResults = (year, month, day, numberOfResults) => `SELECT TOP(${numberOfResults}) STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = ${year} AND DATEPART(MONTH, LOGDATE) = ${month} AND DATEPART(DAY, LOGDATE) = ${day};`;

const getStatsQueryByDate = (year, month, day) => `SELECT STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = ${year} AND DATEPART(MONTH, LOGDATE) = ${month} AND DATEPART(DAY, LOGDATE) = ${day};`;

const doWork = (workerNum) => {
  if (responseQueue.length) {
    const url = responseQueue.shift();
    axios.get(url)
      .then((response) => {
        //telemetriesList.push(response.data);
        logic.mapTelemetry(response.data);
        //processTelemetries();
        doWork(workerNum);
      })
      .catch((err) => {
        console.log(err.message);
      });
  } else {
    runningWorkers -= 1;
  }
};

const wakeWorkers = (totalWorkers) => {
  const workersToWake = totalWorkers - runningWorkers;
  for (let i = 0; i < workersToWake; i++) {
    runningWorkers += 1;
    doWork(i);
  }
};

exports.getYesterdayStatsQueryByDate = (numberOfResults) => {
  const date = moment().add(-5, 'd');
  if (numberOfResults === null) {
    return getStatsQueryByDate(date.year(), date.month() + 1, date.date());
  }
  return getStatsQueryByDateAndNumberOfResults(date.year(), date.month() + 1, date.date(), numberOfResults);
};

exports.getSpecificMatch = (matchId) => {
  return `SELECT STATS FROM GAME WHERE GAMEID = '${matchId}'`;
};

exports.executeQuery = (query) => {
  new sql.Request(logConnection).query(query)
    .then((response) => {
      response.recordset.forEach((record) => {
        responseQueue.push(record.STATS);
      });
      wakeWorkers(maxWorkers);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getStatsQueryByDate = getStatsQueryByDate;
