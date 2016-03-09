## Mongolass

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

Elegant MongoDB driver for Node.js.

## Installation

```
$ npm i mongolass --save
```

## Introduction

Just like mongoose:

```
'use strict';

let Mongolass = require('mongolass');
let mongolass = new Mongolass();// let mongolass = new Mongolass('mongodb://localhost:27017/test');
mongolass.connect('mongodb://localhost:27017/test');

let User = mongolass.model('User');

User
  .find()
  .select({ name: 1, age: 1 })
  .sort({ name: -1 })
  .exec()
  .then(console.log)
  .catch(console.error);
```

or use optional schema:

```
'use strict';

let Mongolass = require('mongolass');
let Schema = Mongolass.Schema;
let mongolass = new Mongolass();
mongolass.connect('mongodb://localhost:27017/test');

let UserSchema = new Schema('UserSchema', {
  name: { type: 'string' },
  age: { type: 'number' }
});
let User = mongolass.model('User', UserSchema);

User
  .insertOne({ name: 'nswbmw', age: 'wrong age' })
  .exec()
  .then(console.log)
  .catch(console.error);
```

<!-- ## Why i hate Mongoose -->
<!-- ## Why i don't like node-mongodb-native -->
## What about Mongolass

Mongolass retains the api of [node-mongodb-native](https://github.com/mongodb/node-mongodb-native), and draws useful features of mongoose. Compared with node-mongodb-native, Mongolass has following three features:

1. Elegant connection. eg:

** mongodb **

```
MongoClient.connect(..., function(err, db) {
  db.listCollections()
})
```
** Mongolass **

```
mongolass.connect(...)
mongolass.listCollections()
```

2. Optional schema, only used for parameter validation before insert document to mongodb.
3. Awesome plugin system. eg: `beforeInsert`, `afterFind` and so on.


## Schema

see [another-json-schema](https://github.com/nswbmw/another-json-schema).

## Plugins

Mongolass has some built-in plugins, only for `find` and `findOne`.

- [limit](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [sort](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [fields(alias: select)](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [skip](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [hint](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [populate]()
- [explain](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [snapshot](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [timeout](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [tailable](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [tailableRetryInterval](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [numberOfRetries](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [awaitdata](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [oplogReplay](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [exhaust](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [batchSize](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [returnKey](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [maxScan](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [min](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [max](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [showDiskLoc](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [comment](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [raw](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [readPreference](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [partial](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)
- [maxTimeMS](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#findOne)

#### Register plugin

```
mongolass.plugin(pluginName, hooks);// register global plugin
User.plugin(pluginName, hooks);// register model plugin
```

examples:

```
User.plugin('mw2', {
  beforeInsert: function (...args) {
  },
  afterFind: function* (result, ...args) {
    console.log(result, args);
    ...
  }
});

mongolass.plugin('mw1', {
  beforeFind: function (...args) {
    console.log(ctx._op);
    console.log(ctx._args);
    console.log(args);
    ...
  }
});

yield User.find().mw1().mw2().exec()// equal: yield User.find().mw1().mw2()
User.find().mw2().mw1().exec().then(...).catch(...)
User.find().mw1().mw2().exec(function (err, res) {
  console.log(err, res)
})
```

** NOTE**: Different order of calling plugins will output different results.

## Test

```
$ npm test (coverage 100%)
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/mongolass.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mongolass
[travis-image]: https://img.shields.io/travis/mongolass/mongolass.svg?style=flat-square
[travis-url]: https://travis-ci.org/mongolass/mongolass
[david-image]: http://img.shields.io/david/mongolass/mongolass.svg?style=flat-square
[david-url]: https://david-dm.org/mongolass/mongolass
[license-image]: http://img.shields.io/npm/l/mongolass.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/mongolass.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/mongolass
