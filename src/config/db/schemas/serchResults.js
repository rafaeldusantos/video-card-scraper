const database = require('mongoose');
const {
  manufacturerEnum,
  modelEnum,
  memoryCapacityEnum
} = require('../../../utils/enums');

const stringRequired = { type: String, require: true };

const schema = new database.Schema({
  site: stringRequired,
  title: stringRequired,
  price: Number,
  promoPrice: Number,
  available: Boolean,
  urlPage: stringRequired,
  model: {
    type: String,
    enum: [
      ...Object.values(modelEnum),
      null
    ]
  },
  manufacturer: {
    type: String,
    enum: [
      ...Object.values(manufacturerEnum),
      null
    ]
  },
  memory: {
    type: String,
    enum: [
      ...Object.values(memoryCapacityEnum),
      null
    ]
  },
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
});

module.exports = database.model('SerchResults', schema);
