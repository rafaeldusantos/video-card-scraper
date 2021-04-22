const express = require('express');
const { makeLogger } = require('apx-logger');
const { connect } = require('./src/config/db');
const browserObject = require('./src/services/browser');
const scraperController = require('./src/pageController');

const logger = makeLogger(process.pid, process.env.LOG_LEVEL);
const app = express();

connect(process.env.DB_HOST);
logger.info('Running a scraper now');
const browserInstance = browserObject.startBrowser();
scraperController(browserInstance);

app.listen(process.env.PORT || 3000);
logger.info(`server started with success PORT ${process.env.PORT || 3000}`);

module.exports = { app };
