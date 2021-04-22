const {
  SerchResults
} = require('../config/db');

const insert = data => SerchResults
  .create({
    ...data,
    createdAt: Date()
  });

module.exports = {
  insert
};
