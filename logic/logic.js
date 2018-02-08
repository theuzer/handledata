const sortByTimestamp = telemetry => telemetry.sort((a, b) => a.cursor - b.cursor);

exports.processTelemetry = (telemetry) => {
  const t = sortByTimestamp(telemetry);
  console.log(t);
};

exports.processTelemetries = (telemetries) => {
  console.log('logo no process', telemetries.length);
  setTimeout(() => {
    console.log(telemetries.length);
  }, 4000);
};

