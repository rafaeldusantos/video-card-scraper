const http = require('http');
const { checkMW } = require('tpz-health');
const { makeLogger } = require('tpz-logger');

const logger = makeLogger();

const server = http.createServer(async (req, res) => {
  let response;
  const resFake = {
    status: () => ({
      json: (data) => { response = data; },
    }),
  };

  await checkMW(req, resFake);

  logger.info(`response ---> ${JSON.stringify(response)}`);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(response));
  res.end();

  req.on('error', e => console.log('error', e));
});

server.listen(process.env.NODE_ENV === 'Production' ? 80 : process.env.PORT);

logger.info('health up');
