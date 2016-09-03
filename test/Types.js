'use strict';

const MONGODB = process.env.MONGODB || 'mongodb://localhost:27017/test';

let assert = require('assert');
let Mongolass = require('..');
let Schema = Mongolass.Schema;
let Types = Mongolass.Types;
let mongolass = new Mongolass(MONGODB);

let UserSchema = new Schema('User', {
  uid: { type: Types.ObjectId },
});
let User = mongolass.model('User', UserSchema);

describe('Types.js', function () {
  before(function* () {
    yield User.insertOne({ uid: '5721bb5abec50ab84b8eb109' });
  });

  after(function* () {
    yield User.remove();
    mongolass.disconnect();
  });

  it('ObjectId wrong', function* () {
    let error;
    try {
      yield User.insertOne({ uid: 'haha' });
    } catch(e) {
      error = e;
    }
    assert.deepEqual(error.message, '($.uid: "haha") ✖ (type: ObjectId)');
  });

  it('ObjectId', function* () {
    let user = yield User.findOne();
    assert.ok('object'  === typeof user._id);
    assert.deepEqual(user.uid.toString(), '5721bb5abec50ab84b8eb109');
  });
});
