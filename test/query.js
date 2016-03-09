'use strict';

let assert = require('assert');
let Mongolass = require('..');
let mongolass = new Mongolass();

let User = mongolass.model('User');

describe('query.js', function () {
  before(function* () {
    yield mongolass.model('User').insertOne({ name: 'aaa', age: 2 });
    yield mongolass.model('User').insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('exec', function* () {
    let users = yield User.find().select({ _id: 0 }).exec();
    assert.deepEqual(users, [ { name: 'aaa', age: 2 }, { name: 'bbb', age: 1 } ]);
  });

  it('cursor', function* () {
    let usersCursor = yield User.find().select({ _id: 0 }).cursor();
    assert.deepEqual(typeof usersCursor.toArray, 'function');
    assert.deepEqual(typeof usersCursor.next, 'function');
    assert.deepEqual(typeof usersCursor.hasNext, 'function');
  });

  it('_bindMethod', function* () {
    let users;
    try {
      users = yield User.find({}, { sort: { age: -1 } }, console.log);
    } catch(e) {
      assert.deepEqual(e.message, 'Not support callback for method: find, please call .exec() or .cursor()');
    }
    try {
      users = yield User.find({}, { _id: 0 }, { sort: { age: -1 } });
    } catch(e) {
      assert.deepEqual(e.message, 'Only support this usage: find(query, options)');
    }
  });

  it('_bindGetter', function* () {
    let collName = yield User.collectionName;
    assert.deepEqual(collName, 'users');
  });

  it('_bindSetter', function* () {
    let users;
    User.hint = { name: 1, age: -1 };
    try {
      users = yield User.find();
    } catch(e) {
      assert.ok(e.message.match(/bad hint/));
    }
  });
});
