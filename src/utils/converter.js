const filterEnum = (value, objFilter, removeSpace = false) => {
  let result = null;
  const regex = removeSpace ? /[^a-zA-Z0-9]/g : /[^a-zA-Z0-9 ]/g;

  Object.values(objFilter).forEach((obj) => {
    if (value.toUpperCase().replace(regex, '').includes(obj)) {
      result = obj;
    }
  });
  return result;
};

const toNumber = (value) => Number(value.replace(/[^0-9,]+/g, '')
  .replace(',', '.')
  .trim());

module.exports = {
  filterEnum,
  toNumber
};
