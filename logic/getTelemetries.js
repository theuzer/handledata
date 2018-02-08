const axios = require('axios');
const sql = require('mssql');
const moment = require('moment');

const logConnection = require('../database/azureDb').logConnection;

const responseQueue = [];
const maxWorkers = 50;
let runningWorkers = 0;

// CAN BE DELETED
let numberOfProcessed = 0;

const getStatsQueryByDate = (year, month, day, numberOfResults) => `SELECT TOP(${numberOfResults}) STATS FROM GAME WHERE DATEPART(YEAR, LOGDATE) = ${year} AND DATEPART(MONTH, LOGDATE) = ${month} AND DATEPART(DAY, LOGDATE) = ${day};`;

const doWork = (workerNum) => {
  if (responseQueue.length) {
    const url = responseQueue.shift();
    axios.get(url)
      .then((response) => {
        numberOfProcessed += 1;
        console.log(response);
        console.log(`processed ${numberOfProcessed} running ${runningWorkers}`);
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
    console.log(runningWorkers);
    doWork(i);
  }
};

exports.getYesterdayStatsQueryByDate = (numberOfResults) => {
  const date = moment().add(-1, 'd');
  return getStatsQueryByDate(date.year(), date.month() + 1, date.date(), numberOfResults);
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
