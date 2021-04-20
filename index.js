const cron = require('node-cron');
const express = require('express');
const { makeLogger } = require('apx-logger');

const logger = makeLogger(process.pid, process.env.LOG_LEVEL);
app = express();

//connect(process.env.DB_HOST);
cron.schedule('5/* * * * *', () => {
  logger.info(`Running a scraper now`);
});

app.listen(process.env.PORT || 3000);
logger.info(`server started with success PORT ${process.env.PORT || 3000}`);

module.exports = app;