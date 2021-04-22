const database = require('mongoose');
const { setHealthUp, setHealthDown, MONGO_DB } = require('apx-health');

setHealthDown(MONGO_DB, 'Waiting for the client to connect.');
database.connection.on('connected', () => setHealthUp(MONGO_DB, 'Connected'));
database.connection.on('disconnected', () => setHealthDown(MONGO_DB, 'Disconnected'));

const options = {
  bufferCommands: true,
  poolSize: 2,
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

database.set('debug', process.env.NODE_ENV === 'Development');
database.set('useFindAndModify', false);
database.set('useCreateIndex', true);

module.exports = (connectionString) => {
  if (!connectionString) return database;
  return database
    .connect(connectionString, options)
    .catch(() => setHealthDown(MONGO_DB, 'Database connection failed'));
};