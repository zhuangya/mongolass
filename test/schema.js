'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

let assert = require('assert');
let Mongolass = require('..');
let Schema = Mongolass.Schema;
let mongolass = new Mongolass(MONGODB);

let UserSchema = new Schema('User', {
  name: { type: 'string' },
  age: { type: 'number', range: [0, 100] }
});
let User = mongolass.model('User', UserSchema);

describe('schema.js', function () {
  before(function* () {
    yield User.insertOne({ name: 'aaa', age: 2 });
    yield User.insertOne({ name: 'bbb', age: 1 });
  });

  after(function* () {
    yield User.remove();
    mongolass.disconnect();
  });

  it('beforeBulkWrite', function* () {
    try {
      yield User.bulkWrite([{ insertOne: { document: { name: 1, age: 1 } } }]);
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeBulkWrite',
        args: []
      });
    }
    try {
      yield User.bulkWrite([{ updateOne: { filter: { name: 'aaa' }, update: { age: 101 }, upsert: true } }]);
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: 101,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeBulkWrite',
        args: []
      });
    }
    try {
      yield User.bulkWrite([{ updateMany: { filter: { name: 'aaa' }, update: { name: 1 }, upsert: true } }]);
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeBulkWrite',
        args: []
      });
    }
    try {
      yield User.bulkWrite([{ replaceOne: { filter: { name: 'aaa' }, replacement: { name: 1, age: 1 }, upsert: true } }]);
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeBulkWrite',
        args: []
      });
    }
  });

  it('beforeFindAndModify', function* () {
    try {
      yield User.findAndModify({ name: 'aaa'}, { age: 1 }, { age: 101 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: 101,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeFindAndModify',
        args: []
      });
    }
  });

  it('beforeFindOneAndReplace', function* () {
    try {
      yield User.findOneAndReplace({ name: 'aaa'}, { name: 1, age: 1 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeFindOneAndReplace',
        args: []
      });
    }
  });

  it('beforeFindOneAndUpdate', function* () {
    try {
      yield User.findOneAndUpdate({ name: 'aaa'}, { age: 101 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: 101,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeFindOneAndUpdate',
        args: []
      });
    }
  });

  it('beforeInsert', function* () {
    try {
      yield User.insert({ name: 1, age: 101 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeInsert',
        args: []
      });
    }
  });

  it('beforeInsertOne', function* () {
    try {
      yield User.insertOne({ name: 1, age: 101 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeInsertOne',
        args: []
      });
    }
  });

  it('beforeInsertMany', function* () {
    try {
      yield User.insertMany([{ name: 'ccc', age: 3 }, { name: 'ddd', age: -1 }]);
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeInsertMany',
        args: []
      });
    }
  });

  it('beforeReplaceOne', function* () {
    try {
      yield User.replaceOne({ name: 'aaa' }, { name: 'ddd', age: -1 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeReplaceOne',
        args: []
      });
    }
  });

  it('beforeSave', function* () {
    try {
      yield User.save({ name: 1, age: 101 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'type',
        actual: 1,
        expected: { type: 'string' },
        path: '$.name',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeSave',
        args: []
      });
    }
  });

  it('beforeUpdate', function* () {
    try {
      yield User.update({ name: 'aaa' }, { age: -1 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeUpdate',
        args: []
      });
    }
  });

  it('beforeUpdateOne', function* () {
    try {
      yield User.updateOne({ name: 'aaa' }, { age: -1 });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeUpdateOne',
        args: []
      });
    }
  });

  it('beforeUpdateMany', function* () {
    try {
      yield User.updateMany({ name: 'aaa' }, { age: -1 }, { multi: true });
    } catch (e) {
      assert.deepEqual(e, {
        validator: 'range',
        actual: -1,
        expected: { type: 'number', range: [ 0, 100 ] },
        path: '$.age',
        schema: 'User',
        model: 'User',
        plugin: 'schema',
        type: 'beforeUpdateMany',
        args: []
      });
    }
  });
});
