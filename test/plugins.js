'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

let assert = require('assert');
let Mongolass = require('..');
let mongolass = new Mongolass(MONGODB);

let User = mongolass.model('User');

describe('index.js', function () {
  before(function* () {
    yield mongolass.model('User').insertOne({ name: 'aaa', age: 2 });
    yield mongolass.model('User').insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('limit', function* () {
    let users = yield User.find({ age: { $gte: 0 } }).select({ _id: 0 }).limit(1);
    assert.deepEqual(users, [ { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().select({ _id: 0 }).limit(1);
    assert.deepEqual(users, { name: 'aaa', age: 2 });
  });

  it('sort', function* () {
    let users = yield User.find().select({ _id: 0 }).sort({ age: -1 });
    assert.deepEqual(users, [ { name: 'aaa', age: 2 }, { name: 'bbb', age: 1 } ]);
    users = yield User.findOne().select({ _id: 0 }).sort({ age: -1 });
    assert.deepEqual(users, { name: 'aaa', age: 2 });
  });

  it('fields', function* () {
    let users = yield User.find().fields({ _id: 0 }).sort({ age: 1 });
    assert.deepEqual(users, [ { name: 'bbb', age: 1 }, { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().fields({ _id: 0 }).sort({ age: 1 });
    assert.deepEqual(users, { name: 'bbb', age: 1 });
  });

  it('skip', function* () {
    let users = yield User.find().select({ _id: 0 }).skip(1);
    assert.deepEqual(users, [ { name: 'bbb', age: 1 } ]);
    users = yield User.findOne().select({ _id: 0 }).skip(1);
    assert.deepEqual(users, { name: 'bbb', age: 1 });
  });

  it('hint', function* () {
    yield User.ensureIndex({ name: -1 });
    let users = yield User.find().select({ _id: 0 }).hint({ name: -1 });
    assert.deepEqual(users, [ { name: 'bbb', age: 1 }, { name: 'aaa', age: 2 } ]);
    users = yield User.findOne().select({ _id: 0 }).hint({ name: -1 });
    assert.deepEqual(users, { name: 'bbb', age: 1 });
    yield User.dropIndex('name_-1');
  });

  it('populate', function* () {
    let users;
    try {
      users = yield User.find().populate({ path: '_id' });
    } catch(e) {
      assert.deepEqual(e.message, 'No .pouplate path or model');
    }

    users = yield User.find().populate({ path: '_id', select: { _id: 0 }, model: 'User' });
    assert.deepEqual(users, [
      { _id: { name: 'aaa', age: 2 }, name: 'aaa', age: 2 },
      { _id: { name: 'bbb', age: 1 }, name: 'bbb', age: 1 }
    ]);
    users = yield User.findOne().populate({ path: '_id', select: { _id: 0 }, model: 'User' });
    assert.deepEqual(users, { _id: { name: 'aaa', age: 2 }, name: 'aaa', age: 2 });

    users = yield User.find().select({ name: 1 }).populate({ path: '_id', match: { name: 'bbb' }, select: { _id: 0, age: 1 }, model: 'User' });
    assert.deepEqual(users, [
      { _id: { age: 1 }, name: 'bbb' }
    ]);
    users = yield User.findOne().select({ name: 1 }).populate({ path: '_id', select: { _id: 0, age: 1 }, model: 'User' });
    assert.deepEqual(users, { _id: { age: 2 }, name: 'aaa' });

    try {
      users = yield User.find().populate({ path: '_id', model: 'User2' });
    } catch(e) {
      assert.ok(e.message.match(/^Not found _id: [0-9a-z]{24} in User2$/));
    }
  });
});
