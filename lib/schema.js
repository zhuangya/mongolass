'use strict';

const Schema = require('another-json-schema');

exports.Schema = Schema;
exports._plugin = function _plugin(schema) {
  // TODO: $inc, $addToSet, $push...
  return {
    beforeBulkWrite: function beforeBulkWrite() {
      let operations = this._args[0];
      operations.forEach(operation => {
        if (operation.insertOne) {
          validate(schema, operation.insertOne.document);
        }
        if (operation.updateOne) {
          validate(schema, operation.updateOne.update.$set || operation.updateOne.update);
        }
        if (operation.updateMany) {
          validate(schema, operation.updateMany.update.$set || operation.updateMany.update);
        }
        /* istanbul ignore else */
        if (operation.replaceOne) {
          validate(schema, operation.replaceOne.replacement);
        }
      });
    },
    beforeFindAndModify: function beforeFindAndModify() {
      let doc = this._args[2];
      doc = doc.$set || doc;
      validate(schema, doc);
    },
    beforeFindOneAndReplace: function beforeFindOneAndReplace() {
      let doc = this._args[1];
      validate(schema, doc);
    },
    beforeFindOneAndUpdate: function beforeFindOneAndUpdate() {
      let doc = this._args[1];
      doc = doc.$set || doc;
      validate(schema, doc);
    },
    beforeInsert: function beforeInsert() {
      let docs = this._args[0];
      /* istanbul ignore else */
      if (!Array.isArray(docs)) {
        docs = [docs];
      }
      docs.forEach(doc => {
        validate(schema, doc);
      });
    },
    beforeInsertOne: function beforeInsertOne() {
      let doc = this._args[0];
      validate(schema, doc);
    },
    beforeInsertMany: function beforeInsertMany() {
      let docs = this._args[0];
      docs.forEach(doc => {
        validate(schema, doc);
      });
    },
    beforeReplaceOne: function beforeReplaceOne() {
      let doc = this._args[1];
      validate(schema, doc);
    },
    beforeSave: function beforeSave() {
      let doc = this._args[0];
      validate(schema, doc);
    },
    beforeUpdate: function beforeUpdate() {
      let doc = this._args[1];
      doc = doc.$set || doc;
      validate(schema, doc);
    },
    beforeUpdateOne: function beforeUpdateOne() {
      let doc = this._args[1];
      doc = doc.$set || doc;
      validate(schema, doc);
    },
    beforeUpdateMany: function beforeUpdateMany() {
      let doc = this._args[1];
      doc = doc.$set || doc;
      validate(schema, doc);
    }
  };
};

function validate(schema, object) {
  let result = schema.validate(object);
  if (!result.valid) {
    throw result.error;
  }
}
