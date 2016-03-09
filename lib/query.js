'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const co = require('co');
const debug = require('debug')('mongolass-query');
const schema = require('./schema')._plugin;

exports.bindQuery = function bindQuery(ctx, NativeClass) {
  for (let propName in NativeClass.prototype) {
    if (propName[0] !== '_') _bindProperty(propName);
  }

  function _bindProperty(propName) {
    let fn;
    let desc = Object.getOwnPropertyDescriptor(NativeClass.prototype, propName);
    if (!desc) {
      try {
        fn = NativeClass.prototype[propName];
      } catch(e) {}
    } else {
      fn = desc.value;
    }
    if (typeof fn === 'function') {
      _bindMethod(propName);
    } else if (desc) {
      /* istanbul ignore else */
      if (desc.get) {
        _bindGetter(propName);
      }
      /* istanbul ignore else */
      if (desc.set) {
        _bindSetter(propName);
      }
    }
  }

  class Query {
    constructor(op, args) {
      this._name = ctx._name;
      this._op = op;
      this._args = args;
      this._plugins = [];
      this.model = ctx.model.bind(ctx);

      // only for Model
      if (ctx._schema) {
        this._plugins.push({
          name: 'schema',
          hooks: schema(ctx._schema),
          args: []
        });
      }

      _.forEach(ctx._plugins, plugin => {
        this[plugin.name] = (...args) => {
          this._plugins.push({
            name: plugin.name,
            hooks: plugin.hooks,
            args: args
          });
          return this;
        };
      });
    }

    exec(cb) {
      return Promise.resolve()
        .then(() => {
          return execBeforePlugins.call(this);
        })
        .then(ctx.connect.bind(ctx))
        .then(conn => {
          let res = conn[this._op].apply(conn, this._args);
          if (res.toArray && (typeof res.toArray === 'function')) {
            return res.toArray();
          }
          return res;
        })
        .then(result => {
          return execAfterPlugins.call(this, result);
        })
        .asCallback(cb);
    }

    cursor(cb) {
      return Promise.resolve()
        .then(() => {
          return execBeforePlugins.call(this);
        })
        .then(ctx.connect.bind(ctx))
        .then(conn => {
          return conn[this._op].apply(conn, this._args);
        })
        .then(result => {
          return execAfterPlugins.call(this, result);
        })
        .asCallback(cb);
    }

    then(resolve, reject) {
      return this.exec().then(resolve, reject);
    }
  }

  function _bindMethod(propName) {
    ctx[propName] = (...args) => {
      if (args.length && ('function' === typeof args[args.length - 1])) {
        throw new TypeError('Not support callback for method: ' + propName + ', please call .exec() or .cursor()');
      }
      if (['find', 'findOne'].indexOf(propName) !== -1) {
        if (args.length > 2) {
          throw new TypeError('Only support this usage: ' + propName + '(query, options)');
        }
      }
      return new Query(propName, args);
    };
  }

  function _bindGetter(propName) {
    ctx.__defineGetter__(propName, () => {
      return ctx.connect()
        .then(conn => {
          return conn[propName];
        });
    });
  }

  function _bindSetter(propName) {
    ctx.__defineSetter__(propName, value => {
      ctx.connect()
        .then(conn => {
          conn[propName] = value;
        });
    });
  }
};

function execBeforePlugins() {
  let self = this;
  let hookName = 'before' + _.upperFirst(this._op);
  let plugins = _.filter(this._plugins, plugin => {
    return plugin.hooks[hookName];
  });
  if (!plugins.length) {
    return;
  }
  return co(function* () {
    for (let plugin of plugins) {
      debug('%s %s before plugin %s: args -> %j', self._name, hookName, plugin.name, self._args);
      try {
        let value = plugin.hooks[hookName].apply(self, plugin.args);
        yield (isGenerator(value)
          ? value
          : Promise.resolve(value));
      } catch (e) {
        e.model = self._name;
        e.plugin = plugin.name;
        e.type = hookName;
        e.args = plugin.args;
        throw e;
      }
      debug('%s %s after plugin %s: args -> %j', self._name, hookName, plugin.name, self._args);
    }
  });
}

function execAfterPlugins(result) {
  let self = this;
  let hookName = 'after' + _.upperFirst(this._op);
  let plugins = _.filter(this._plugins, plugin => {
    return plugin.hooks[hookName];
  });
  if (!plugins.length) {
    return result;
  }
  return co(function* () {
    for (let plugin of plugins) {
      debug('%s %s before plugin %s: result -> %j', self._name, hookName, plugin.name, result);
      try {
        let value = plugin.hooks[hookName].apply(self, [result].concat(plugin.args));
        result = yield (isGenerator(value)
          ? value
          : Promise.resolve(value));
      } catch (e) {
        e.model = self._name;
        e.plugin = plugin.name;
        e.type = hookName;
        e.args = plugin.args;
        throw e;
      }
      debug('%s %s after plugin %s: result -> %j', self._name, hookName, plugin.name, result);
    }
    return result;
  });
}

function isGenerator(obj) {
  return obj
    && typeof obj.next === 'function'
    && typeof obj.throw === 'function';
}
