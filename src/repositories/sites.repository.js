const {
  Sites
} = require('../config/db');

const findAll = () => Sites.find({ active: 1 });

module.exports = {
  findAll
};
