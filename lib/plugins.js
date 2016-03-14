'use strict';

const _ = require('lodash');

// built-in plugins
const options = ['limit', 'sort', 'fields', 'skip', 'hint', 'explain', 'snapshot', 'timeout', 'tailable', 'tailableRetryInterval', 'numberOfRetries', 'awaitdata', 'oplogReplay', 'exhaust', 'batchSize', 'returnKey', 'maxScan', 'min', 'max', 'showDiskLoc', 'comment', 'raw', 'readPreference', 'partial', 'maxTimeMS'];

options.forEach(function (key) {
  exports[key] = {
    beforeFind: function beforeFind(value) {
      bindOption.call(this, key, value);
    },
    beforeFindOne: function beforeFindOne(value) {
      bindOption.call(this, key, value);
    }
  };
});

exports.select = exports.fields;

// .populate({ path: 'xxx', match: { ... }, select: { xx: 1 }, model: 'User', options: {} })
exports.populate = {
  afterFind: function (results, opt) {
    return bindPopulate.call(this, results, opt);
  },
  afterFindOne: function (result, opt) {
    return bindPopulate.call(this, [result], opt).then(result => result[0]);
  }
};

function bindOption(key, value) {
  if (this._args.length === 0) {
    this._args.push({}, {});
  } else if (this._args.length === 1) {
    this._args.push({});
  }
  this._args[1][key] = value;
}

function bindPopulate(results, opt) {
  if (!opt.path || !opt.model) {
    throw new TypeError('No .pouplate path or model');
  }
  let keys = _.map(results, opt.path);
  let query = opt.match || {};
  let options = {};
  let omitId = false;
  query._id = { $in: keys };
  if (opt.select) {
    options.fields = opt.select;
    /* istanbul ignore else */
    if (options.fields._id === 0) {
      omitId = true;
      if (Object.keys(options.fields).length > 1) {
        options.fields._id = 1;
      } else {
        delete options.fields._id;
      }
    }
  }
  return this.model(opt.model, null, opt.options)
    .find(query, options)
    .exec()
    .then(populates => {
      return _.reduce(populates, function(obj, value) {
        obj[value._id.toString()] = value;
        return obj;
      }, {});
    })
    .then(obj => {
      return _.filter(results, result => {
        let refe = result[opt.path].toString();
        if (!obj[refe]) {
          return false;
        }
        /* istanbul ignore else */
        if (omitId) delete obj[refe]._id;
        result[opt.path] = obj[refe];
        return true;
      });
    });
}
