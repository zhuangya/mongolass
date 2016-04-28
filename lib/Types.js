'use strict';

const validator = require('validator');
const mongodb = require('mongodb');

exports.ObjectId = function ObjectId(actual, expected, key, parentNode) {
  if (!validator.isMongoId(actual.toString())) {
    return false;
  }
  /* istanbul ignore else */
  if ('string' === typeof actual) {
    parentNode[key] = mongodb.ObjectId(actual);
  }
  return true;
};
