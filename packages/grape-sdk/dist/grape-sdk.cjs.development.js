'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var JSBI = _interopDefault(require('jsbi'));
var coreSdk = require('@champagneswap/core-sdk');
var constants = require('@ethersproject/constants');
var contracts = require('@ethersproject/contracts');
var abi = require('@ethersproject/abi');
var cellarSdk = require('@champagneswap/cellar-sdk');
var bignumber = require('@ethersproject/bignumber');
var solidity = require('@ethersproject/solidity');
var address = require('@ethersproject/address');

var ACTION_ADD_ASSET = 1;
var ACTION_REPAY = 2;
var ACTION_REMOVE_ASSET = 3;
var ACTION_REMOVE_COLLATERAL = 4;
var ACTION_BORROW = 5;
var ACTION_GET_REPAY_SHARE = 6;
var ACTION_GET_REPAY_PART = 7;
var ACTION_ACCRUE = 8; // Functions that don't need accrue to be called

var ACTION_ADD_COLLATERAL = 10;
var ACTION_UPDATE_EXCHANGE_RATE = 11; // Function on BentoBox

var ACTION_BENTO_DEPOSIT = 20;
var ACTION_BENTO_WITHDRAW = 21;
var ACTION_BENTO_TRANSFER = 22;
var ACTION_BENTO_TRANSFER_MULTIPLE = 23;
var ACTION_BENTO_SETAPPROVAL = 24; // Any external call (except to BentoBox)

var ACTION_CALL = 30;
var MINIMUM_TARGET_UTILIZATION = /*#__PURE__*/JSBI.BigInt('700000000000000000'); // 70%

var MAXIMUM_TARGET_UTILIZATION = /*#__PURE__*/JSBI.BigInt('800000000000000000'); // 80%

var UTILIZATION_PRECISION = /*#__PURE__*/JSBI.BigInt('1000000000000000000');
var FULL_UTILIZATION = /*#__PURE__*/JSBI.BigInt('1000000000000000000');
var FULL_UTILIZATION_MINUS_MAX = /*#__PURE__*/JSBI.subtract(FULL_UTILIZATION, MAXIMUM_TARGET_UTILIZATION); // approx 1% APR

var STARTING_INTEREST_PER_YEAR = /*#__PURE__*/JSBI.multiply( /*#__PURE__*/JSBI.BigInt(317097920), /*#__PURE__*/JSBI.BigInt(60 * 60 * 24 * 365)); // approx 0.25% APR

var MINIMUM_INTEREST_PER_YEAR = /*#__PURE__*/JSBI.multiply( /*#__PURE__*/JSBI.BigInt(79274480), /*#__PURE__*/JSBI.BigInt(60 * 60 * 24 * 365)); // approx 1000% APR

var MAXIMUM_INTEREST_PER_YEAR = /*#__PURE__*/JSBI.multiply( /*#__PURE__*/JSBI.BigInt(317097920000), /*#__PURE__*/JSBI.BigInt(60 * 60 * 24 * 365));
var INTEREST_ELASTICITY = /*#__PURE__*/JSBI.BigInt('28800000000000000000000000000000000000000'); // Half or double in 28800 seconds (8 hours) if linear

var FACTOR_PRECISION = /*#__PURE__*/JSBI.BigInt('1000000000000000000');
var PROTOCOL_FEE = /*#__PURE__*/JSBI.BigInt('10000'); // 10%

var PROTOCOL_FEE_DIVISOR = /*#__PURE__*/JSBI.BigInt('100000');

(function (KashiAction) {
  KashiAction[KashiAction["ADD_ASSET"] = 1] = "ADD_ASSET";
  KashiAction[KashiAction["REPAY"] = 2] = "REPAY";
  KashiAction[KashiAction["REMOVE_ASSET"] = 3] = "REMOVE_ASSET";
  KashiAction[KashiAction["REMOVE_COLLATERAL"] = 4] = "REMOVE_COLLATERAL";
  KashiAction[KashiAction["BORROW"] = 5] = "BORROW";
  KashiAction[KashiAction["GET_REPAY_SHARE"] = 6] = "GET_REPAY_SHARE";
  KashiAction[KashiAction["GET_REPAY_PART"] = 7] = "GET_REPAY_PART";
  KashiAction[KashiAction["ACCRUE"] = 8] = "ACCRUE"; // Functions that don't need accrue to be called

  KashiAction[KashiAction["ADD_COLLATERAL"] = 10] = "ADD_COLLATERAL";
  KashiAction[KashiAction["UPDATE_EXCHANGE_RATE"] = 11] = "UPDATE_EXCHANGE_RATE"; // Function on BentoBox

  KashiAction[KashiAction["BENTO_DEPOSIT"] = 20] = "BENTO_DEPOSIT";
  KashiAction[KashiAction["BENTO_WITHDRAW"] = 21] = "BENTO_WITHDRAW";
  KashiAction[KashiAction["BENTO_TRANSFER"] = 22] = "BENTO_TRANSFER";
  KashiAction[KashiAction["BENTO_TRANSFER_MULTIPLE"] = 23] = "BENTO_TRANSFER_MULTIPLE";
  KashiAction[KashiAction["BENTO_SETAPPROVAL"] = 24] = "BENTO_SETAPPROVAL"; // Any external call (except to BentoBox)

  KashiAction[KashiAction["CALL"] = 30] = "CALL";
})(exports.KashiAction || (exports.KashiAction = {}));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = /*#__PURE__*/createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var runtime = function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.

    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }

    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function define(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.

      generator._invoke = makeInvokeMethod(innerFn, self, context);
      return generator;
    }

    exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.

    function tryCatch(fn, obj, arg) {
      try {
        return {
          type: "normal",
          arg: fn.call(obj, arg)
        };
      } catch (err) {
        return {
          type: "throw",
          arg: err
        };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.

    var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.

    function Generator() {}

    function GeneratorFunction() {}

    function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.


    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });
    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    define(Gp, "constructor", GeneratorFunctionPrototype);
    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
    GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.

    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        define(prototype, method, function (arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    exports.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }

      genFun.prototype = Object.create(Gp);
      return genFun;
    }; // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.


    exports.awrap = function (arg) {
      return {
        __await: arg
      };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);

        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;

          if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function (error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise = // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      } // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).


      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    });
    exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.

    exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
      return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;
      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          } // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;

          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);

            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;
          var record = tryCatch(innerFn, self, context);

          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };
          } else if (record.type === "throw") {
            state = GenStateCompleted; // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.

            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    } // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.


    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];

      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

        context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.

        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      } // The delegate iterator is finished, so forget it and continue with
      // the outer generator.


      context.delegate = null;
      return ContinueSentinel;
    } // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.


    defineIteratorMethods(Gp);
    define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.

    define(Gp, iteratorSymbol, function () {
      return this;
    });
    define(Gp, "toString", function () {
      return "[object Generator]";
    });

    function pushTryEntry(locs) {
      var entry = {
        tryLoc: locs[0]
      };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{
        tryLoc: "root"
      }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function (object) {
      var keys = [];

      for (var key in object) {
        keys.push(key);
      }

      keys.reverse(); // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.

      return function next() {
        while (keys.length) {
          var key = keys.pop();

          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        } // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.


        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];

        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;
            return next;
          };

          return next.next = next;
        }
      } // Return an iterator with no values.


      return {
        next: doneResult
      };
    }

    exports.values = values;

    function doneResult() {
      return {
        value: undefined$1,
        done: true
      };
    }

    Context.prototype = {
      constructor: Context,
      reset: function reset(skipTempReset) {
        this.prev = 0;
        this.next = 0; // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.

        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = undefined$1;
        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },
      stop: function stop() {
        this.done = true;
        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;

        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },
      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;

        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },
      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },
      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },
      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },
      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];

          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;

            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }

            return thrown;
          }
        } // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.


        throw new Error("illegal catch attempt");
      },
      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    }; // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.

    return exports;
  }( // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports );

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, in modern engines
    // we can explicitly access globalThis. In older engines we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }
});

var KASHIPAIR_ABI = [
	{
		inputs: [
			{
				internalType: "contract IBentoBoxV1",
				name: "bentoBox_",
				type: "address"
			}
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "_owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "_spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "_value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "accruedAmount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "feeFraction",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint64",
				name: "rate",
				type: "uint64"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "utilization",
				type: "uint256"
			}
		],
		name: "LogAccrue",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "share",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "fraction",
				type: "uint256"
			}
		],
		name: "LogAddAsset",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		name: "LogAddCollateral",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "feeAmount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "part",
				type: "uint256"
			}
		],
		name: "LogBorrow",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "rate",
				type: "uint256"
			}
		],
		name: "LogExchangeRate",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "newFeeTo",
				type: "address"
			}
		],
		name: "LogFeeTo",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "share",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "fraction",
				type: "uint256"
			}
		],
		name: "LogRemoveAsset",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		name: "LogRemoveCollateral",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "part",
				type: "uint256"
			}
		],
		name: "LogRepay",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "feeTo",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "feesEarnedFraction",
				type: "uint256"
			}
		],
		name: "LogWithdrawFees",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address"
			}
		],
		name: "OwnershipTransferred",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "_from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "_to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "_value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
		],
		name: "DOMAIN_SEPARATOR",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "accrue",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "accrueInfo",
		outputs: [
			{
				internalType: "uint64",
				name: "interestPerSecond",
				type: "uint64"
			},
			{
				internalType: "uint64",
				name: "lastAccrued",
				type: "uint64"
			},
			{
				internalType: "uint128",
				name: "feesEarnedFraction",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bool",
				name: "skim",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		name: "addAsset",
		outputs: [
			{
				internalType: "uint256",
				name: "fraction",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bool",
				name: "skim",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		name: "addCollateral",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "asset",
		outputs: [
			{
				internalType: "contract IERC20",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "bentoBox",
		outputs: [
			{
				internalType: "contract IBentoBoxV1",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "borrow",
		outputs: [
			{
				internalType: "uint256",
				name: "part",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "claimOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "collateral",
		outputs: [
			{
				internalType: "contract IERC20",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint8[]",
				name: "actions",
				type: "uint8[]"
			},
			{
				internalType: "uint256[]",
				name: "values",
				type: "uint256[]"
			},
			{
				internalType: "bytes[]",
				name: "datas",
				type: "bytes[]"
			}
		],
		name: "cook",
		outputs: [
			{
				internalType: "uint256",
				name: "value1",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "value2",
				type: "uint256"
			}
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint8",
				name: "",
				type: "uint8"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "exchangeRate",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "feeTo",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "bytes",
				name: "data",
				type: "bytes"
			}
		],
		name: "init",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address[]",
				name: "users",
				type: "address[]"
			},
			{
				internalType: "uint256[]",
				name: "maxBorrowParts",
				type: "uint256[]"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "contract ISwapper",
				name: "swapper",
				type: "address"
			},
			{
				internalType: "bool",
				name: "open",
				type: "bool"
			}
		],
		name: "liquidate",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "masterContract",
		outputs: [
			{
				internalType: "contract KashiPairMediumRiskV1",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "oracle",
		outputs: [
			{
				internalType: "contract IOracle",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "oracleData",
		outputs: [
			{
				internalType: "bytes",
				name: "",
				type: "bytes"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "pendingOwner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "owner_",
				type: "address"
			},
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "uint256",
				name: "deadline",
				type: "uint256"
			},
			{
				internalType: "uint8",
				name: "v",
				type: "uint8"
			},
			{
				internalType: "bytes32",
				name: "r",
				type: "bytes32"
			},
			{
				internalType: "bytes32",
				name: "s",
				type: "bytes32"
			}
		],
		name: "permit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "fraction",
				type: "uint256"
			}
		],
		name: "removeAsset",
		outputs: [
			{
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "share",
				type: "uint256"
			}
		],
		name: "removeCollateral",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "bool",
				name: "skim",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "part",
				type: "uint256"
			}
		],
		name: "repay",
		outputs: [
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newFeeTo",
				type: "address"
			}
		],
		name: "setFeeTo",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "contract ISwapper",
				name: "swapper",
				type: "address"
			},
			{
				internalType: "bool",
				name: "enable",
				type: "bool"
			}
		],
		name: "setSwapper",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "contract ISwapper",
				name: "",
				type: "address"
			}
		],
		name: "swappers",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalAsset",
		outputs: [
			{
				internalType: "uint128",
				name: "elastic",
				type: "uint128"
			},
			{
				internalType: "uint128",
				name: "base",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalBorrow",
		outputs: [
			{
				internalType: "uint128",
				name: "elastic",
				type: "uint128"
			},
			{
				internalType: "uint128",
				name: "base",
				type: "uint128"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalCollateralShare",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address"
			},
			{
				internalType: "bool",
				name: "direct",
				type: "bool"
			},
			{
				internalType: "bool",
				name: "renounce",
				type: "bool"
			}
		],
		name: "transferOwnership",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "updateExchangeRate",
		outputs: [
			{
				internalType: "bool",
				name: "updated",
				type: "bool"
			},
			{
				internalType: "uint256",
				name: "rate",
				type: "uint256"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "userBorrowPart",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "userCollateralShare",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "withdrawFees",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var KashiCooker = /*#__PURE__*/function () {
  function KashiCooker(pair, account, library, chainId) {
    this.pair = pair;
    this.account = account || constants.AddressZero;
    this.library = library;
    this.chainId = chainId || 1;
    this.actions = [];
    this.values = [];
    this.datas = [];
  }

  var _proto = KashiCooker.prototype;

  _proto.add = function add(action, data, value) {
    if (value === void 0) {
      value = coreSdk.ZERO;
    }

    this.actions.push(action);
    this.datas.push(data);
    this.values.push(value);
  };

  _proto.approve = function approve(permit) {
    if (permit) {
      this.add(exports.KashiAction.BENTO_SETAPPROVAL, abi.defaultAbiCoder.encode(['address', 'address', 'bool', 'uint8', 'bytes32', 'bytes32'], [permit.account, permit.masterContract, true, permit.v, permit.r, permit.s]));
    }
  };

  _proto.updateExchangeRate = function updateExchangeRate(mustUpdate, minRate, maxRate) {
    if (mustUpdate === void 0) {
      mustUpdate = false;
    }

    if (minRate === void 0) {
      minRate = coreSdk.ZERO;
    }

    if (maxRate === void 0) {
      maxRate = coreSdk.ZERO;
    }

    this.add(exports.KashiAction.UPDATE_EXCHANGE_RATE, abi.defaultAbiCoder.encode(['bool', 'uint256', 'uint256'], [mustUpdate, minRate, maxRate]));
    return this;
  };

  _proto.bentoDepositCollateral = function bentoDepositCollateral(amount) {
    var useNative = this.pair.collateral.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
    this.add(exports.KashiAction.BENTO_DEPOSIT, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.collateral.address, this.account, amount, 0]), useNative ? amount : coreSdk.ZERO);
    return this;
  };

  _proto.bentoWithdrawCollateral = function bentoWithdrawCollateral(amount, share) {
    var useNative = this.pair.collateral.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
    this.add(exports.KashiAction.BENTO_WITHDRAW, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.collateral.address, this.account, amount, share]), useNative ? amount : coreSdk.ZERO);
    return this;
  };

  _proto.bentoTransferCollateral = function bentoTransferCollateral(share, toAddress) {
    this.add(exports.KashiAction.BENTO_TRANSFER, abi.defaultAbiCoder.encode(['address', 'address', 'int256'], [this.pair.collateral.address, toAddress, share]));
    return this;
  };

  _proto.repayShare = function repayShare(part) {
    this.add(exports.KashiAction.GET_REPAY_SHARE, abi.defaultAbiCoder.encode(['int256'], [part]));
    return this;
  };

  _proto.addCollateral = function addCollateral(amount, fromBento) {
    var share;

    if (fromBento) {
      share = JSBI.lessThan(amount, coreSdk.ZERO) ? amount : cellarSdk.toShare(this.pair.collateral, amount);
    } else {
      var useNative = this.pair.collateral.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_DEPOSIT, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.collateral.address, this.account, amount, 0]), useNative ? amount : coreSdk.ZERO);
      share = JSBI.BigInt(-2);
    }

    this.add(exports.KashiAction.ADD_COLLATERAL, abi.defaultAbiCoder.encode(['int256', 'address', 'bool'], [share, this.account, false]));
    return this;
  };

  _proto.addAsset = function addAsset(amount, fromBento) {
    var share;

    if (fromBento) {
      share = cellarSdk.toShare(this.pair.asset, amount);
    } else {
      var useNative = this.pair.asset.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_DEPOSIT, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.asset.address, this.account, amount, 0]), useNative ? amount : coreSdk.ZERO);
      share = JSBI.BigInt(-2);
    }

    this.add(exports.KashiAction.ADD_ASSET, abi.defaultAbiCoder.encode(['int256', 'address', 'bool'], [share, this.account, false]));
    return this;
  };

  _proto.removeAsset = function removeAsset(fraction, toBento) {
    this.add(exports.KashiAction.REMOVE_ASSET, abi.defaultAbiCoder.encode(['int256', 'address'], [fraction, this.account]));

    if (!toBento) {
      var useNative = this.pair.asset.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_WITHDRAW, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.asset.address, this.account, 0, -1]));
    }

    return this;
  };

  _proto.removeCollateral = function removeCollateral(share, toBento) {
    this.add(exports.KashiAction.REMOVE_COLLATERAL, abi.defaultAbiCoder.encode(['int256', 'address'], [share, this.account]));

    if (!toBento) {
      var useNative = this.pair.collateral.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_WITHDRAW, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.collateral.address, this.account, 0, share]));
    }

    return this;
  };

  _proto.removeCollateralFraction = function removeCollateralFraction(fraction, toBento) {
    this.add(exports.KashiAction.REMOVE_COLLATERAL, abi.defaultAbiCoder.encode(['int256', 'address'], [fraction, this.account]));

    if (!toBento) {
      var useNative = this.pair.collateral.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_WITHDRAW, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.collateral.address, this.account, 0, -1]));
    }

    return this;
  };

  _proto.borrow = function borrow(amount, toBento, toAddress) {
    if (toAddress === void 0) {
      toAddress = '';
    }

    this.add(exports.KashiAction.BORROW, abi.defaultAbiCoder.encode(['int256', 'address'], [amount, toAddress && toBento ? toAddress : this.account]));

    if (!toBento) {
      var useNative = this.pair.asset.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_WITHDRAW, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.asset.address, toAddress || this.account, amount, 0]));
    }

    return this;
  };

  _proto.repay = function repay(amount, fromBento) {
    if (!fromBento) {
      var useNative = this.pair.asset.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.BENTO_DEPOSIT, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.asset.address, this.account, amount, 0]), useNative ? amount : coreSdk.ZERO);
    }

    this.add(exports.KashiAction.GET_REPAY_PART, abi.defaultAbiCoder.encode(['int256'], [fromBento ? amount : -1]));
    this.add(exports.KashiAction.REPAY, abi.defaultAbiCoder.encode(['int256', 'address', 'bool'], [-1, this.account, false]));
    return this;
  };

  _proto.repayPart = function repayPart(part, fromBento) {
    if (!fromBento) {
      var useNative = this.pair.asset.address === coreSdk.WNATIVE_ADDRESS[this.chainId];
      this.add(exports.KashiAction.GET_REPAY_SHARE, abi.defaultAbiCoder.encode(['int256'], [part]));
      this.add(exports.KashiAction.BENTO_DEPOSIT, abi.defaultAbiCoder.encode(['address', 'address', 'int256', 'int256'], [useNative ? constants.AddressZero : this.pair.asset.address, this.account, 0, -1]), // TODO: Put some warning in the UI or not allow repaying ETH directly from wallet, because this can't be pre-calculated
      useNative ? JSBI.divide(JSBI.multiply(cellarSdk.toShare(this.pair.asset, coreSdk.toElastic(this.pair.totalBorrow, part, true)), JSBI.BigInt(1001)), JSBI.BigInt(1000)) : coreSdk.ZERO);
    }

    this.add(exports.KashiAction.REPAY, abi.defaultAbiCoder.encode(['int256', 'address', 'bool'], [part, this.account, false]));
    return this;
  };

  _proto.action = function action(address, value, data, useValue1, useValue2, returnValues) {
    this.add(exports.KashiAction.CALL, abi.defaultAbiCoder.encode(['address', 'bytes', 'bool', 'bool', 'uint8'], [address, data, useValue1, useValue2, returnValues]), value);
  };

  _proto.cook = /*#__PURE__*/function () {
    var _cook = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee() {
      var kashiPairCloneContract;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (this.library) {
                _context.next = 2;
                break;
              }

              return _context.abrupt("return", {
                success: false
              });

            case 2:
              kashiPairCloneContract = new contracts.Contract(this.pair.address, KASHIPAIR_ABI, coreSdk.getProviderOrSigner(this.library, this.account));
              _context.prev = 3;
              _context.next = 6;
              return kashiPairCloneContract.cook(this.actions, this.values, this.datas, {
                value: this.values.reduce(function (a, b) {
                  return JSBI.add(a, b);
                }, coreSdk.ZERO)
              });

            case 6:
              _context.t0 = _context.sent;
              return _context.abrupt("return", {
                success: true,
                tx: _context.t0
              });

            case 10:
              _context.prev = 10;
              _context.t1 = _context["catch"](3);
              console.error('KashiCooker Error: ', _context.t1);
              return _context.abrupt("return", {
                success: false,
                error: _context.t1
              });

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[3, 10]]);
    }));

    function cook() {
      return _cook.apply(this, arguments);
    }

    return cook;
  }();

  return KashiCooker;
}();

var computePairAddress = function computePairAddress(_ref) {
  var collateral = _ref.collateral,
      asset = _ref.asset,
      oracle = _ref.oracle,
      oracleData = _ref.oracleData;
  return address.getCreate2Address(coreSdk.BENTOBOX_ADDRESS[collateral.chainId], solidity.keccak256(['bytes'], [abi.defaultAbiCoder.encode(['address', 'address', 'address', 'bytes'], [collateral.address, asset.address, oracle, oracleData])]), solidity.keccak256(['bytes'], ['0x3d602d80600a3d3981f3363d3d373d3d3d363d73' + coreSdk.KASHI_ADDRESS[collateral.chainId].substring(2) + '5af43d82803e903d91602b57fd5bf3']));
};

function accrue(pair, amount, includePrincipal) {
  if (includePrincipal === void 0) {
    includePrincipal = false;
  }

  return coreSdk.JSBI.add(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.multiply(amount, pair.accrueInfo.interestPerSecond), pair.elapsedSeconds), coreSdk.JSBI.BigInt(1e18)), includePrincipal ? amount : coreSdk.ZERO);
}
function accrueTotalAssetWithFee(pair) {
  var extraAmount = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.multiply(pair.totalBorrow.elastic, pair.accrueInfo.interestPerSecond), coreSdk.JSBI.add(pair.elapsedSeconds, coreSdk.JSBI.BigInt(3600)) // For some transactions, to succeed in the next hour (and not only this block), some margin has to be added
  ), coreSdk.JSBI.BigInt(1e18));
  var feeAmount = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(extraAmount, PROTOCOL_FEE), PROTOCOL_FEE_DIVISOR); // % of interest paid goes to fee

  var feeFraction = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(feeAmount, pair.totalAsset.base), pair.currentAllAssets);
  return {
    elastic: pair.totalAsset.elastic,
    base: coreSdk.JSBI.add(pair.totalAsset.base, feeFraction)
  };
}
function interestAccrue(pair, interest) {
  if (coreSdk.JSBI.equal(pair.totalBorrow.base, coreSdk.ZERO)) {
    return STARTING_INTEREST_PER_YEAR;
  }

  if (coreSdk.JSBI.lessThanOrEqual(pair.elapsedSeconds, coreSdk.ZERO)) {
    return interest;
  }

  var currentInterest = interest;

  if (coreSdk.JSBI.lessThan(pair.utilization, MINIMUM_TARGET_UTILIZATION)) {
    var underFactor = coreSdk.JSBI.greaterThan(MINIMUM_TARGET_UTILIZATION, coreSdk.ZERO) ? coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.subtract(MINIMUM_TARGET_UTILIZATION, pair.utilization), FACTOR_PRECISION), MINIMUM_TARGET_UTILIZATION) : coreSdk.ZERO;
    var scale = coreSdk.JSBI.add(INTEREST_ELASTICITY, coreSdk.JSBI.multiply(coreSdk.JSBI.multiply(underFactor, underFactor), pair.elapsedSeconds));
    currentInterest = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(currentInterest, INTEREST_ELASTICITY), scale);

    if (coreSdk.JSBI.lessThan(currentInterest, MINIMUM_INTEREST_PER_YEAR)) {
      currentInterest = MINIMUM_INTEREST_PER_YEAR; // 0.25% APR minimum
    }
  } else if (coreSdk.JSBI.greaterThan(pair.utilization, MAXIMUM_TARGET_UTILIZATION)) {
    var overFactor = coreSdk.JSBI.multiply(coreSdk.JSBI.subtract(pair.utilization, MAXIMUM_TARGET_UTILIZATION), coreSdk.JSBI.divide(FACTOR_PRECISION, FULL_UTILIZATION_MINUS_MAX));

    var _scale = coreSdk.JSBI.add(INTEREST_ELASTICITY, coreSdk.JSBI.multiply(coreSdk.JSBI.multiply(overFactor, overFactor), pair.elapsedSeconds));

    currentInterest = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(currentInterest, _scale), INTEREST_ELASTICITY);

    if (coreSdk.JSBI.greaterThan(currentInterest, MAXIMUM_INTEREST_PER_YEAR)) {
      currentInterest = MAXIMUM_INTEREST_PER_YEAR; // 1000% APR maximum
    }
  }

  return currentInterest;
} // Subtract protocol fee

function takeFee(amount) {
  return coreSdk.JSBI.subtract(amount, coreSdk.JSBI.divide(coreSdk.JSBI.multiply(amount, PROTOCOL_FEE), PROTOCOL_FEE_DIVISOR));
}
function addBorrowFee(amount) {
  return amount.mul(bignumber.BigNumber.from(10005)).div(bignumber.BigNumber.from(10000));
}

var KashiMediumRiskLendingPair = /*#__PURE__*/function () {
  function KashiMediumRiskLendingPair(accrueInfo, collateral, asset, totalCollateralShare, totalAsset, totalBorrow, exchangeRate, oracleExchangeRate, spotExchangeRate, userCollateralShare, userAssetFraction, userBorrowPart) {
    this.accrueInfo = accrueInfo;
    this.collateral = collateral;
    this.asset = asset;
    this.totalCollateralShare = totalCollateralShare;
    this.totalAsset = totalAsset;
    this.totalBorrow = totalBorrow;
    this.exchangeRate = exchangeRate;
    this.oracleExchangeRate = oracleExchangeRate;
    this.spotExchangeRate = spotExchangeRate;
    this.userCollateralShare = userCollateralShare;
    this.userAssetFraction = userAssetFraction;
    this.userBorrowPart = userBorrowPart;
  }

  KashiMediumRiskLendingPair.getAddress = function getAddress(collateral, asset, oracle, oracleData) {
    return computePairAddress({
      collateral: collateral,
      asset: asset,
      oracle: oracle,
      oracleData: oracleData
    });
  }
  /**
   * Returns the number of elapsed seconds since the last accrue
   */
  ;

  _createClass(KashiMediumRiskLendingPair, [{
    key: "elapsedSeconds",
    get: function get() {
      var currentDate = coreSdk.JSBI.divide(coreSdk.JSBI.BigInt(Date.now()), coreSdk.JSBI.BigInt(1000));
      return coreSdk.JSBI.subtract(currentDate, this.accrueInfo.lastAccrued);
    }
    /**
     * Interest per year for borrowers at last accrue, this will apply during the next accrue
     */

  }, {
    key: "interestPerYear",
    get: function get() {
      return coreSdk.JSBI.multiply(this.accrueInfo.interestPerSecond, coreSdk.JSBI.BigInt(60 * 60 * 24 * 365));
    }
    /**
     * Interest per year for borrowers if accrued was called
     */

  }, {
    key: "currentInterestPerYear",
    get: function get() {
      return interestAccrue(this, this.interestPerYear);
    }
    /**
     * The total collateral in the market (collateral is stable, it doesn't accrue)
     */

  }, {
    key: "totalCollateralAmount",
    get: function get() {
      return cellarSdk.toAmount(this.collateral, this.totalCollateralShare);
    }
    /**
     * The total assets unborrowed in the market (stable, doesn't accrue)
     */

  }, {
    key: "totalAssetAmount",
    get: function get() {
      return cellarSdk.toAmount(this.asset, this.totalAsset.elastic);
    }
    /**
     * The total assets borrowed in the market right now
     */

  }, {
    key: "currentBorrowAmount",
    get: function get() {
      return accrue(this, this.totalBorrow.elastic, true);
    }
    /**
     * The total amount of assets, both borrowed and still available right now
     */

  }, {
    key: "currentAllAssets",
    get: function get() {
      return coreSdk.JSBI.add(this.totalAssetAmount, this.currentBorrowAmount);
    }
    /**
     * Current total amount of asset shares
     */

  }, {
    key: "currentAllAssetShares",
    get: function get() {
      return cellarSdk.toShare(this.asset, this.currentAllAssets);
    }
    /**
     * Current totalAsset with the protocol fee accrued
     */

  }, {
    key: "currentTotalAsset",
    get: function get() {
      return accrueTotalAssetWithFee(this);
    }
    /**
     * The maximum amount of assets available for withdrawal or borrow
     */

  }, {
    key: "maxAssetAvailable",
    get: function get() {
      return coreSdk.minimum(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.totalAsset.elastic, this.currentAllAssets), this.currentAllAssetShares), cellarSdk.toAmount(this.asset, coreSdk.toElastic(this.currentTotalAsset, coreSdk.JSBI.subtract(this.totalAsset.base, coreSdk.JSBI.BigInt(1000)), false)));
    }
    /**
     * The maximum amount of assets available for withdrawal or borrow in shares
     */

  }, {
    key: "maxAssetAvailableFraction",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.maxAssetAvailable, this.currentTotalAsset.base), this.currentAllAssets);
    }
    /**
     * The overall health of the lending pair
     */

  }, {
    key: "marketHealth",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.totalCollateralAmount, coreSdk.JSBI.BigInt(1e18)), coreSdk.maximum(this.exchangeRate, this.spotExchangeRate, this.oracleExchangeRate)), coreSdk.JSBI.BigInt(1e18)), this.currentBorrowAmount);
    }
    /**
     * The current utilization in %
     */

  }, {
    key: "utilization",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.BigInt(1e18), this.currentBorrowAmount), this.currentAllAssets);
    }
    /**
     * Interest per year received by lenders as of now
     */

  }, {
    key: "supplyAPR",
    get: function get() {
      return takeFee(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.interestPerYear, this.utilization), coreSdk.JSBI.BigInt(1e18)));
    }
    /**
     * Interest per year received by lenders if accrue was called
     */

  }, {
    key: "currentSupplyAPR",
    get: function get() {
      return takeFee(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.currentInterestPerYear, this.utilization), coreSdk.JSBI.BigInt(1e18)));
    }
    /**
     * The user's amount of collateral (stable, doesn't accrue)
     */

  }, {
    key: "userCollateralAmount",
    get: function get() {
      return cellarSdk.toAmount(this.collateral, this.userCollateralShare);
    }
    /**
     * The user's amount of assets (stable, doesn't accrue)
     */

  }, {
    key: "currentUserAssetAmount",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userAssetFraction, this.currentAllAssets), this.totalAsset.base);
    }
    /**
     * The user's amount borrowed right now
     */

  }, {
    key: "currentUserBorrowAmount",
    get: function get() {
      if (coreSdk.JSBI.equal(this.userBorrowPart, coreSdk.ZERO)) return coreSdk.ZERO;
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userBorrowPart, this.currentBorrowAmount), this.totalBorrow.base);
    }
    /**
     * The user's amount of assets that are currently lent
     */

  }, {
    key: "currentUserLentAmount",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userAssetFraction, this.currentBorrowAmount), this.totalAsset.base);
    }
    /**
     * Value of protocol fees
     */

  }, {
    key: "feesEarned",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.accrueInfo.feesEarnedFraction, this.currentAllAssets), this.totalAsset.base);
    }
    /**
     * The user's maximum borrowable amount based on the collateral provided, using all three oracle values
     */

  }, {
    key: "maxBorrowable",
    get: function get() {
      var max = {
        oracle: coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userCollateralAmount, coreSdk.JSBI.multiply(coreSdk.JSBI.BigInt(1e16), coreSdk.JSBI.BigInt(75))), this.oracleExchangeRate),
        spot: coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userCollateralAmount, coreSdk.JSBI.multiply(coreSdk.JSBI.BigInt(1e16), coreSdk.JSBI.BigInt(75))), this.spotExchangeRate),
        stored: coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.userCollateralAmount, coreSdk.JSBI.multiply(coreSdk.JSBI.BigInt(1e16), coreSdk.JSBI.BigInt(75))), this.exchangeRate)
      };
      var min = coreSdk.minimum.apply(void 0, Object.values(max));
      var safe = coreSdk.JSBI.subtract(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(min, coreSdk.JSBI.BigInt(95)), coreSdk.JSBI.BigInt(100)), this.currentUserBorrowAmount);
      var possible = coreSdk.minimum(safe, this.maxAssetAvailable);
      return _extends({}, max, {
        minimum: min,
        safe: safe,
        possible: possible
      });
    }
    /**
     * The user's position's health
     */

  }, {
    key: "health",
    get: function get() {
      return coreSdk.JSBI.divide(coreSdk.JSBI.multiply(this.currentUserBorrowAmount, coreSdk.JSBI.BigInt(1e18)), this.maxBorrowable.minimum);
    }
  }]);

  return KashiMediumRiskLendingPair;
}();

exports.ACTION_ACCRUE = ACTION_ACCRUE;
exports.ACTION_ADD_ASSET = ACTION_ADD_ASSET;
exports.ACTION_ADD_COLLATERAL = ACTION_ADD_COLLATERAL;
exports.ACTION_BENTO_DEPOSIT = ACTION_BENTO_DEPOSIT;
exports.ACTION_BENTO_SETAPPROVAL = ACTION_BENTO_SETAPPROVAL;
exports.ACTION_BENTO_TRANSFER = ACTION_BENTO_TRANSFER;
exports.ACTION_BENTO_TRANSFER_MULTIPLE = ACTION_BENTO_TRANSFER_MULTIPLE;
exports.ACTION_BENTO_WITHDRAW = ACTION_BENTO_WITHDRAW;
exports.ACTION_BORROW = ACTION_BORROW;
exports.ACTION_CALL = ACTION_CALL;
exports.ACTION_GET_REPAY_PART = ACTION_GET_REPAY_PART;
exports.ACTION_GET_REPAY_SHARE = ACTION_GET_REPAY_SHARE;
exports.ACTION_REMOVE_ASSET = ACTION_REMOVE_ASSET;
exports.ACTION_REMOVE_COLLATERAL = ACTION_REMOVE_COLLATERAL;
exports.ACTION_REPAY = ACTION_REPAY;
exports.ACTION_UPDATE_EXCHANGE_RATE = ACTION_UPDATE_EXCHANGE_RATE;
exports.FACTOR_PRECISION = FACTOR_PRECISION;
exports.FULL_UTILIZATION = FULL_UTILIZATION;
exports.FULL_UTILIZATION_MINUS_MAX = FULL_UTILIZATION_MINUS_MAX;
exports.INTEREST_ELASTICITY = INTEREST_ELASTICITY;
exports.KashiCooker = KashiCooker;
exports.KashiMediumRiskLendingPair = KashiMediumRiskLendingPair;
exports.MAXIMUM_INTEREST_PER_YEAR = MAXIMUM_INTEREST_PER_YEAR;
exports.MAXIMUM_TARGET_UTILIZATION = MAXIMUM_TARGET_UTILIZATION;
exports.MINIMUM_INTEREST_PER_YEAR = MINIMUM_INTEREST_PER_YEAR;
exports.MINIMUM_TARGET_UTILIZATION = MINIMUM_TARGET_UTILIZATION;
exports.PROTOCOL_FEE = PROTOCOL_FEE;
exports.PROTOCOL_FEE_DIVISOR = PROTOCOL_FEE_DIVISOR;
exports.STARTING_INTEREST_PER_YEAR = STARTING_INTEREST_PER_YEAR;
exports.UTILIZATION_PRECISION = UTILIZATION_PRECISION;
exports.accrue = accrue;
exports.accrueTotalAssetWithFee = accrueTotalAssetWithFee;
exports.addBorrowFee = addBorrowFee;
exports.computePairAddress = computePairAddress;
exports.interestAccrue = interestAccrue;
exports.takeFee = takeFee;
//# sourceMappingURL=grape-sdk.cjs.development.js.map
