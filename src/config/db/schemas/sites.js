const database = require('mongoose');

const stringRequired = { type: String, require: true };

const schema = new database.Schema({
  name: stringRequired,
  url: stringRequired,
  active: {
    type: Boolean,
    default: true
  },
  selectors: {
    selectorProducts: stringRequired,
    listProducts: stringRequired,
    filterUnavaliableProducts: String,
    parameterUnavaliableProducts: String,
    methodFilterUnavaliableProducts: String,
    link: String,
    availableNextLink: String,
    nextLink: String,
    infos: {
      title: stringRequired,
      price: String,
      promoPrice: String,
      available: String,
      parameterAvaliable: String,
      imageUrl: String
    }
  }
});

module.exports = database.model('Sites', schema);
