'use strict';

let assert = require('assert');
let Mongolass = require('..');
let Db = Mongolass.Db;
let Schema = Mongolass.Schema;
let Model = Mongolass.Model;
let mongolass = new Mongolass();

describe('index.js', function () {
  before(function* () {
    yield mongolass.model('User').insertOne({ name: 'aaa', age: 2 });
    yield mongolass.model('User').insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield mongolass.model('User').remove();
    mongolass.disconnect();
  });

  it('connect', function* () {
    let db = yield mongolass.connect();
    assert.ok(db instanceof Db);

    let db2 = yield mongolass.connect();
    assert.ok(db instanceof Db);
    assert.ok(db === db2);
  });

  it('disconnect', function* () {
    let mongolass2 = new Mongolass();
    mongolass2.disconnect();
    assert.deepEqual(mongolass2._db, null);
    assert.deepEqual(mongolass2._conn, null);

    let mongolass3 = new Mongolass();
    yield mongolass3.connect();
    mongolass3.disconnect();
    assert.deepEqual(mongolass3._db, null);
    assert.deepEqual(mongolass3._conn, null);
  });

  it('schema', function* () {
    let UserSchema;
    try {
      UserSchema = mongolass.schema('User', 'aaa');
    } catch(e) {
      assert.deepEqual(e.message, 'Wrong schemaJSON for schema: User');
    }
    UserSchema = mongolass.schema('User', {
      name: { type: 'string' },
      age: { type: 'number', range: [0, 100] }
    });
    assert.ok(UserSchema instanceof Schema);
    assert.ok(UserSchema === mongolass.schema('User'));
    try {
      UserSchema = mongolass.schema('User2');
    } catch(e) {
      assert.deepEqual(e.message, 'No schema: User2');
    }
  });

  it('model', function* () {
    let User;
    let UserSchema = mongolass.schema('User', {
      name: { type: 'string' },
      age: { type: 'number', range: [0, 100] }
    });
    try {
      User = mongolass.model('User', 'aaa');
    } catch(e) {
      assert.deepEqual(e.message, 'Wrong schema for model: User');
    }

    User = mongolass.model('User', UserSchema);
    assert.ok(User instanceof Model);
    assert.ok(User === mongolass.model('User'));
  });

  it('plugin', function* () {
    let User = mongolass.model('User');
    try {
      mongolass.plugin('filter', function (result, key) {
        return result.map(function (item) {
          return item[key];
        });
      });
    } catch(e) {
      assert.deepEqual(e.message, 'Wrong plugin name or hooks');
    }

    mongolass.plugin('filter', {
      afterFind: function (result, key) {
        return result.map(function (item) {
          return item[key];
        });
      }
    });
    mongolass.plugin('idToString', {
      afterFind: function (ids) {
        return ids.map(function (id) {
          return id.toString();
        });
      }
    });
    let usernames = yield User.find().filter('_id').idToString();
    assert.deepEqual(usernames[0].length, 24);
    assert.deepEqual(usernames[1].length, 24);
    assert.deepEqual(typeof usernames[0], 'string');
    assert.deepEqual(typeof usernames[1], 'string');
  });
});
