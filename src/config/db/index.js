const connect = require('./connect');
const models = require('./schemas');

module.exports = {
  connect,
  ...models
};
