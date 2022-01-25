import { BigNumber } from '@ethersproject/bignumber';

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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function ASSERT(f, t) {
  if (!f() && t) console.error(t);
}
function closeValues(a, b, accuracy) {
  if (accuracy === 0) return a === b;
  if (a < 1 / accuracy) return Math.abs(a - b) <= 10;
  return Math.abs(a / b - 1) < accuracy;
}
function calcSquareEquation(a, b, c) {
  var D = b * b - 4 * a * c;
  console.assert(D >= 0, "Discriminant is negative! " + a + " " + b + " " + c);
  var sqrtD = Math.sqrt(D);
  return [(-b - sqrtD) / 2 / a, (-b + sqrtD) / 2 / a];
} // returns such x > 0 that f(x) = out or 0 if there is no such x or f defined not everywhere
// hint - approximation of x to spead up the algorithm
// f assumed to be continues monotone growth function defined everywhere

function revertPositive(f, out, hint) {
  if (hint === void 0) {
    hint = 1;
  }

  try {
    if (out <= f(0)) return 0;
    var min, max;

    if (f(hint) > out) {
      min = hint / 2;

      while (f(min) > out) {
        min /= 2;
      }

      max = min * 2;
    } else {
      max = hint * 2;

      while (f(max) < out) {
        max *= 2;
      }

      min = max / 2;
    }

    while (max / min - 1 > 1e-4) {
      var x0 = (min + max) / 2;
      var y0 = f(x0);
      if (out === y0) return x0;
      if (out < y0) max = x0;else min = x0;
    }

    return (min + max) / 2;
  } catch (e) {
    return 0;
  }
}
function getBigNumber(value) {
  var v = Math.abs(value);
  if (v < Number.MAX_SAFE_INTEGER) return BigNumber.from(Math.round(value));
  var exp = Math.floor(Math.log(v) / Math.LN2);
  console.assert(exp >= 51, "Internal Error 314");
  var shift = exp - 51;
  var mant = Math.round(v / Math.pow(2, shift));
  var res = BigNumber.from(mant).mul(BigNumber.from(2).pow(shift));
  return value > 0 ? res : res.mul(-1);
}

var TYPICAL_SWAP_GAS_COST = 40000;
var TYPICAL_MINIMAL_LIQUIDITY = 1000;
var RPool = /*#__PURE__*/function () {
  function RPool(address, token0, token1, fee, reserve0, reserve1, minLiquidity, swapGasCost) {
    if (minLiquidity === void 0) {
      minLiquidity = TYPICAL_MINIMAL_LIQUIDITY;
    }

    if (swapGasCost === void 0) {
      swapGasCost = TYPICAL_SWAP_GAS_COST;
    }

    this.address = address;
    this.token0 = token0, this.token1 = token1;
    this.fee = fee;
    this.minLiquidity = minLiquidity;
    this.swapGasCost = swapGasCost;
    this.reserve0 = reserve0;
    this.reserve1 = reserve1;
  }

  var _proto = RPool.prototype;

  _proto.updateReserves = function updateReserves(res0, res1) {
    this.reserve0 = res0;
    this.reserve1 = res1;
  };

  return RPool;
}();
var ConstantProductRPool = /*#__PURE__*/function (_RPool) {
  _inheritsLoose(ConstantProductRPool, _RPool);

  function ConstantProductRPool(address, token0, token1, fee, reserve0, reserve1) {
    var _this;

    _this = _RPool.call(this, address, token0, token1, fee, reserve0, reserve1) || this;
    _this.reserve0Number = parseInt(reserve0.toString());
    _this.reserve1Number = parseInt(reserve1.toString());
    return _this;
  }

  var _proto2 = ConstantProductRPool.prototype;

  _proto2.updateReserves = function updateReserves(res0, res1) {
    this.reserve0 = res0;
    this.reserve0Number = parseInt(res0.toString());
    this.reserve1 = res1;
    this.reserve1Number = parseInt(res1.toString());
  };

  _proto2.calcOutByIn = function calcOutByIn(amountIn, direction) {
    var x = direction ? this.reserve0Number : this.reserve1Number;
    var y = direction ? this.reserve1Number : this.reserve0Number;
    return {
      out: y * amountIn / (x / (1 - this.fee) + amountIn),
      gasSpent: this.swapGasCost
    };
  };

  _proto2.calcInByOut = function calcInByOut(amountOut, direction) {
    var x = direction ? this.reserve0Number : this.reserve1Number;
    var y = direction ? this.reserve1Number : this.reserve0Number;
    var input = x * amountOut / (1 - this.fee) / (y - amountOut); //if (input < 1) input = 1

    return {
      inp: input,
      gasSpent: this.swapGasCost
    };
  };

  _proto2.calcCurrentPriceWithoutFee = function calcCurrentPriceWithoutFee(direction) {
    return this.calcPrice(0, direction, false);
  };

  _proto2.calcPrice = function calcPrice(amountIn, direction, takeFeeIntoAccount) {
    var x = direction ? this.reserve0Number : this.reserve1Number;
    var y = direction ? this.reserve1Number : this.reserve0Number;
    var oneMinusFee = takeFeeIntoAccount ? 1 - this.fee : 1;
    var xf = x / oneMinusFee;
    return y * xf / (xf + amountIn) / (xf + amountIn);
  };

  _proto2.calcInputByPrice = function calcInputByPrice(price, direction, takeFeeIntoAccount) {
    var x = direction ? this.reserve0Number : this.reserve1Number;
    var y = direction ? this.reserve1Number : this.reserve0Number;
    var oneMinusFee = takeFeeIntoAccount ? 1 - this.fee : 1;
    var xf = x / oneMinusFee;
    return Math.sqrt(y * xf * price) - xf; // TODO: or y*xf/price ???
  };

  _proto2.getLiquidity = function getLiquidity() {
    return Math.sqrt(this.reserve0Number * this.reserve1Number);
  };

  return ConstantProductRPool;
}(RPool);
var HybridRPool = /*#__PURE__*/function (_RPool2) {
  _inheritsLoose(HybridRPool, _RPool2);

  function HybridRPool(address, token0, token1, fee, A, reserve0, reserve1) {
    var _this2;

    _this2 = _RPool2.call(this, address, token0, token1, fee, reserve0, reserve1) || this;
    _this2.A_PRECISION = 100;
    _this2.A = A;
    _this2.D = BigNumber.from(0);
    return _this2;
  }

  var _proto3 = HybridRPool.prototype;

  _proto3.updateReserves = function updateReserves(res0, res1) {
    this.D = BigNumber.from(0);
    this.reserve0 = res0;
    this.reserve1 = res1;
  };

  _proto3.computeLiquidity = function computeLiquidity() {
    if (!this.D.eq(0)) return this.D; // already calculated

    var r0 = this.reserve0;
    var r1 = this.reserve1;
    if (r0.isZero() && r1.isZero()) return BigNumber.from(0);
    var s = r0.add(r1);
    var nA = BigNumber.from(this.A * 2);
    var prevD;
    var D = s;

    for (var i = 0; i < 256; i++) {
      var dP = D.mul(D).div(r0).mul(D).div(r1).div(4);
      prevD = D;
      D = nA.mul(s).div(this.A_PRECISION).add(dP.mul(2)).mul(D).div(nA.div(this.A_PRECISION).sub(1).mul(D).add(dP.mul(3)));

      if (D.sub(prevD).abs().lte(1)) {
        break;
      }
    }

    this.D = D;
    return D;
  };

  _proto3.computeY = function computeY(x) {
    var D = this.computeLiquidity();
    var nA = this.A * 2;
    var c = D.mul(D).div(x.mul(2)).mul(D).div(nA * 2 / this.A_PRECISION);
    var b = D.mul(this.A_PRECISION).div(nA).add(x);
    var yPrev;
    var y = D;

    for (var i = 0; i < 256; i++) {
      yPrev = y;
      y = y.mul(y).add(c).div(y.mul(2).add(b).sub(D));

      if (y.sub(yPrev).abs().lte(1)) {
        break;
      }
    }

    return y;
  };

  _proto3.calcOutByIn = function calcOutByIn(amountIn, direction) {
    var xBN = direction ? this.reserve0 : this.reserve1;
    var yBN = direction ? this.reserve1 : this.reserve0;
    var xNewBN = xBN.add(getBigNumber(amountIn * (1 - this.fee)));
    var yNewBN = this.computeY(xNewBN);
    var dy = parseInt(yBN.sub(yNewBN).toString());
    return {
      out: dy,
      gasSpent: this.swapGasCost
    };
  };

  _proto3.calcInByOut = function calcInByOut(amountOut, direction) {
    var xBN = direction ? this.reserve0 : this.reserve1;
    var yBN = direction ? this.reserve1 : this.reserve0;
    var yNewBN = yBN.sub(getBigNumber(amountOut));
    if (yNewBN.lt(1)) // lack of precision
      yNewBN = BigNumber.from(1);
    var xNewBN = this.computeY(yNewBN);
    var input = Math.round(parseInt(xNewBN.sub(xBN).toString()) / (1 - this.fee)); //if (input < 1) input = 1

    return {
      inp: input,
      gasSpent: this.swapGasCost
    };
  };

  _proto3.calcCurrentPriceWithoutFee = function calcCurrentPriceWithoutFee(direction) {
    return this.calcPrice(0, direction, false);
  };

  _proto3.calcPrice = function calcPrice(amountIn, direction, takeFeeIntoAccount) {
    var xBN = direction ? this.reserve0 : this.reserve1;
    var x = parseInt(xBN.toString());
    var oneMinusFee = takeFeeIntoAccount ? 1 - this.fee : 1;
    var D = parseInt(this.computeLiquidity().toString());
    var A = this.A / this.A_PRECISION;
    var xI = x + amountIn;
    var b = 4 * A * xI + D - 4 * A * D;
    var ac4 = D * D * D / xI;
    var Ds = Math.sqrt(b * b + 4 * A * ac4);
    var res = (0.5 - (2 * b - ac4 / xI) / Ds / 4) * oneMinusFee;
    return res;
  };

  _proto3.calcInputByPrice = function calcInputByPrice(price, direction, takeFeeIntoAccount, hint) {
    var _this3 = this;

    if (hint === void 0) {
      hint = 1;
    }

    // TODO:  (x:number) => this.calcPrice(x, !direction, takeFeeIntoAccount)  ???
    return revertPositive(function (x) {
      return 1 / _this3.calcPrice(x, direction, takeFeeIntoAccount);
    }, price, hint);
  };

  return HybridRPool;
}(RPool);

var CL_MIN_TICK = -887272;
var CL_MAX_TICK = -CL_MIN_TICK - 1;
var CLRPool = /*#__PURE__*/function (_RPool) {
  _inheritsLoose(CLRPool, _RPool);

  function CLRPool(address, token0, token1, fee, tickSpacing, reserve0, reserve1, liquidity, sqrtPrice, nearestTick, ticks) {
    var _this;

    _this = _RPool.call(this, address, token0, token1, fee, reserve0, reserve1, TYPICAL_MINIMAL_LIQUIDITY, TYPICAL_SWAP_GAS_COST) || this;
    _this.tickSpacing = tickSpacing;
    _this.liquidity = liquidity;
    _this.sqrtPrice = sqrtPrice;
    _this.nearestTick = nearestTick;
    _this.ticks = ticks;

    if (_this.ticks.length === 0) {
      _this.ticks.push({
        index: CL_MIN_TICK,
        DLiquidity: 0
      });

      _this.ticks.push({
        index: CL_MAX_TICK,
        DLiquidity: 0
      });
    }

    if (_this.ticks[0].index > CL_MIN_TICK) _this.ticks.unshift({
      index: CL_MIN_TICK,
      DLiquidity: 0
    });
    if (_this.ticks[_this.ticks.length - 1].index < CL_MAX_TICK) _this.ticks.push({
      index: CL_MAX_TICK,
      DLiquidity: 0
    });
    return _this;
  }

  var _proto = CLRPool.prototype;

  _proto.calcOutByIn = function calcOutByIn(amountIn, direction) {
    var nextTickToCross = direction ? this.nearestTick : this.nearestTick + 1;
    var currentPrice = this.sqrtPrice;
    var currentLiquidity = this.liquidity;
    var outAmount = 0;
    var input = amountIn;

    while (input > 0) {
      if (nextTickToCross < 0 || nextTickToCross >= this.ticks.length) return {
        out: outAmount,
        gasSpent: this.swapGasCost
      };
      var nextTickPrice = Math.sqrt(Math.pow(1.0001, this.ticks[nextTickToCross].index)); // console.log('L, P, tick, nextP', currentLiquidity,
      //     currentPrice, this.ticks[nextTickToCross].index, nextTickPrice);

      var output = 0;

      if (direction) {
        var maxDx = currentLiquidity * (currentPrice - nextTickPrice) / currentPrice / nextTickPrice; //console.log('input, maxDx', input, maxDx);

        if (input <= maxDx) {
          output = currentLiquidity * currentPrice * input / (input + currentLiquidity / currentPrice);
          input = 0;
        } else {
          output = currentLiquidity * (currentPrice - nextTickPrice);
          currentPrice = nextTickPrice;
          input -= maxDx;

          if (this.ticks[nextTickToCross].index / this.tickSpacing % 2 === 0) {
            currentLiquidity -= this.ticks[nextTickToCross].DLiquidity;
          } else {
            currentLiquidity += this.ticks[nextTickToCross].DLiquidity;
          }

          nextTickToCross--;
        }
      } else {
        var maxDy = currentLiquidity * (nextTickPrice - currentPrice); //console.log('input, maxDy', input, maxDy);

        if (input <= maxDy) {
          output = input / currentPrice / (currentPrice + input / currentLiquidity);
          input = 0;
        } else {
          output = currentLiquidity * (nextTickPrice - currentPrice) / currentPrice / nextTickPrice;
          currentPrice = nextTickPrice;
          input -= maxDy;

          if (this.ticks[nextTickToCross].index / this.tickSpacing % 2 === 0) {
            currentLiquidity += this.ticks[nextTickToCross].DLiquidity;
          } else {
            currentLiquidity -= this.ticks[nextTickToCross].DLiquidity;
          }

          nextTickToCross++;
        }
      }

      outAmount += output * (1 - this.fee); //console.log('out', outAmount);
    }

    return {
      out: outAmount,
      gasSpent: this.swapGasCost
    }; // TODO: more accurate gas prediction 
  };

  _proto.calcInByOut = function calcInByOut(amountOut, direction) {
    var nextTickToCross = direction ? this.nearestTick : this.nearestTick + 1;
    var currentPrice = this.sqrtPrice;
    var currentLiquidity = this.liquidity;
    var input = 0;
    var outBeforeFee = amountOut / (1 - this.fee);

    while (outBeforeFee > 0) {
      if (nextTickToCross < 0 || nextTickToCross >= this.ticks.length) return {
        inp: input,
        gasSpent: this.swapGasCost
      };
      var nextTickPrice = Math.sqrt(Math.pow(1.0001, this.ticks[nextTickToCross].index)); // console.log('L, P, tick, nextP', currentLiquidity,
      //     currentPrice, this.ticks[nextTickToCross].index, nextTickPrice);

      if (direction) {
        var maxDy = currentLiquidity * (currentPrice - nextTickPrice); //console.log('input, maxDy', input, maxDy);

        if (outBeforeFee <= maxDy) {
          input += outBeforeFee / currentPrice / (currentPrice - outBeforeFee / currentLiquidity);
          outBeforeFee = 0;
        } else {
          input += currentLiquidity * (currentPrice - nextTickPrice) / currentPrice / nextTickPrice;
          currentPrice = nextTickPrice;
          outBeforeFee -= maxDy;

          if (this.ticks[nextTickToCross].index / this.tickSpacing % 2 === 0) {
            currentLiquidity -= this.ticks[nextTickToCross].DLiquidity;
          } else {
            currentLiquidity += this.ticks[nextTickToCross].DLiquidity;
          }

          nextTickToCross--;
        }
      } else {
        var maxDx = currentLiquidity * (nextTickPrice - currentPrice) / currentPrice / nextTickPrice; //console.log('outBeforeFee, maxDx', outBeforeFee, maxDx);

        if (outBeforeFee <= maxDx) {
          input += currentLiquidity * currentPrice * outBeforeFee / (currentLiquidity / currentPrice - outBeforeFee);
          outBeforeFee = 0;
        } else {
          input += currentLiquidity * (nextTickPrice - currentPrice);
          currentPrice = nextTickPrice;
          outBeforeFee -= maxDx;

          if (this.ticks[nextTickToCross].index / this.tickSpacing % 2 === 0) {
            currentLiquidity += this.ticks[nextTickToCross].DLiquidity;
          } else {
            currentLiquidity -= this.ticks[nextTickToCross].DLiquidity;
          }

          nextTickToCross++;
        }
      }
    }

    return {
      inp: input,
      gasSpent: this.swapGasCost
    };
  };

  _proto.calcCurrentPriceWithoutFee = function calcCurrentPriceWithoutFee(direction) {
    var p = this.sqrtPrice * this.sqrtPrice;
    return direction ? p : 1 / p;
  };

  return CLRPool;
}(RPool);

var RouteStatus;

(function (RouteStatus) {
  RouteStatus["Success"] = "Success";
  RouteStatus["NoWay"] = "NoWay";
  RouteStatus["Partial"] = "Partial";
})(RouteStatus || (RouteStatus = {}));

var Edge = /*#__PURE__*/function () {
  function Edge(p, v0, v1) {
    this.pool = p;
    this.vert0 = v0;
    this.vert1 = v1;
    this.amountInPrevious = 0;
    this.amountOutPrevious = 0;
    this.canBeUsed = true;
    this.direction = true;
    this.spentGas = 0;
    this.spentGasNew = 0;
    this.bestEdgeIncome = 0;
  }

  var _proto = Edge.prototype;

  _proto.cleanTmpData = function cleanTmpData() {
    this.amountInPrevious = 0;
    this.amountOutPrevious = 0;
    this.canBeUsed = true;
    this.direction = true;
    this.spentGas = 0;
    this.spentGasNew = 0;
    this.bestEdgeIncome = 0;
  };

  _proto.reserve = function reserve(v) {
    return v === this.vert0 ? this.pool.reserve0 : this.pool.reserve1;
  };

  _proto.calcOutput = function calcOutput(v, amountIn) {
    var res, gas;

    if (v === this.vert1) {
      if (this.direction) {
        if (amountIn < this.amountOutPrevious) {
          var _this$pool$calcInByOu = this.pool.calcInByOut(this.amountOutPrevious - amountIn, true),
              inp = _this$pool$calcInByOu.inp,
              gasSpent = _this$pool$calcInByOu.gasSpent;

          res = this.amountInPrevious - inp;
          gas = gasSpent;
        } else {
          var _this$pool$calcOutByI = this.pool.calcOutByIn(amountIn - this.amountOutPrevious, false),
              out = _this$pool$calcOutByI.out,
              _gasSpent = _this$pool$calcOutByI.gasSpent;

          res = out + this.amountInPrevious;
          gas = _gasSpent;
        }
      } else {
        var _this$pool$calcOutByI2 = this.pool.calcOutByIn(this.amountOutPrevious + amountIn, false),
            _out = _this$pool$calcOutByI2.out,
            _gasSpent2 = _this$pool$calcOutByI2.gasSpent;

        res = _out - this.amountInPrevious;
        gas = _gasSpent2;
      }
    } else {
      if (this.direction) {
        var _this$pool$calcOutByI3 = this.pool.calcOutByIn(this.amountInPrevious + amountIn, true),
            _out2 = _this$pool$calcOutByI3.out,
            _gasSpent3 = _this$pool$calcOutByI3.gasSpent;

        res = _out2 - this.amountOutPrevious;
        gas = _gasSpent3;
      } else {
        if (amountIn < this.amountInPrevious) {
          var _this$pool$calcInByOu2 = this.pool.calcInByOut(this.amountInPrevious - amountIn, false),
              _inp = _this$pool$calcInByOu2.inp,
              _gasSpent4 = _this$pool$calcInByOu2.gasSpent;

          res = this.amountOutPrevious - _inp;
          gas = _gasSpent4;
        } else {
          var _this$pool$calcOutByI4 = this.pool.calcOutByIn(amountIn - this.amountInPrevious, true),
              _out3 = _this$pool$calcOutByI4.out,
              _gasSpent5 = _this$pool$calcOutByI4.gasSpent;

          res = _out3 + this.amountOutPrevious;
          gas = _gasSpent5;
        }
      }
    } // this.testApply(v, amountIn, out);


    return {
      out: res,
      gasSpent: gas - this.spentGas
    };
  };

  _proto.calcInput = function calcInput(v, amountOut) {
    var res, gas;

    if (v === this.vert1) {
      if (!this.direction) {
        if (amountOut < this.amountOutPrevious) {
          var _this$pool$calcOutByI5 = this.pool.calcOutByIn(this.amountOutPrevious - amountOut, false),
              out = _this$pool$calcOutByI5.out,
              gasSpent = _this$pool$calcOutByI5.gasSpent;

          res = this.amountInPrevious - out;
          gas = gasSpent;
        } else {
          var _this$pool$calcInByOu3 = this.pool.calcInByOut(amountOut - this.amountOutPrevious, true),
              inp = _this$pool$calcInByOu3.inp,
              _gasSpent6 = _this$pool$calcInByOu3.gasSpent;

          res = inp + this.amountInPrevious;
          gas = _gasSpent6;
        }
      } else {
        var _this$pool$calcInByOu4 = this.pool.calcInByOut(this.amountOutPrevious + amountOut, true),
            _inp2 = _this$pool$calcInByOu4.inp,
            _gasSpent7 = _this$pool$calcInByOu4.gasSpent;

        res = _inp2 - this.amountInPrevious;
        gas = _gasSpent7;
      }
    } else {
      if (!this.direction) {
        var _this$pool$calcInByOu5 = this.pool.calcInByOut(this.amountInPrevious + amountOut, false),
            _inp3 = _this$pool$calcInByOu5.inp,
            _gasSpent8 = _this$pool$calcInByOu5.gasSpent;

        res = _inp3 - this.amountOutPrevious;
        gas = _gasSpent8;
      } else {
        if (amountOut < this.amountInPrevious) {
          var _this$pool$calcOutByI6 = this.pool.calcOutByIn(this.amountInPrevious - amountOut, true),
              _out4 = _this$pool$calcOutByI6.out,
              _gasSpent9 = _this$pool$calcOutByI6.gasSpent;

          res = this.amountOutPrevious - _out4;
          gas = _gasSpent9;
        } else {
          var _this$pool$calcInByOu6 = this.pool.calcInByOut(amountOut - this.amountInPrevious, false),
              _inp4 = _this$pool$calcInByOu6.inp,
              _gasSpent10 = _this$pool$calcInByOu6.gasSpent;

          res = _inp4 + this.amountOutPrevious;
          gas = _gasSpent10;
        }
      }
    } // this.testApply(v, amountIn, out);


    return {
      inp: res,
      gasSpent: gas - this.spentGas
    };
  };

  _proto.checkMinimalLiquidityExceededAfterSwap = function checkMinimalLiquidityExceededAfterSwap(from, amountOut) {
    if (from === this.vert0) {
      var r1 = parseInt(this.pool.reserve1.toString());

      if (this.direction) {
        return r1 - amountOut - this.amountOutPrevious < this.pool.minLiquidity;
      } else {
        return r1 - amountOut + this.amountOutPrevious < this.pool.minLiquidity;
      }
    } else {
      var r0 = parseInt(this.pool.reserve0.toString());

      if (this.direction) {
        return r0 - amountOut + this.amountInPrevious < this.pool.minLiquidity;
      } else {
        return r0 - amountOut - this.amountInPrevious < this.pool.minLiquidity;
      }
    }
  } // doesn't used in production - just for testing
  ;

  _proto.testApply = function testApply(from, amountIn, amountOut) {
    console.assert(this.amountInPrevious * this.amountOutPrevious >= 0);
    var inPrev = this.direction ? this.amountInPrevious : -this.amountInPrevious;
    var outPrev = this.direction ? this.amountOutPrevious : -this.amountOutPrevious;
    var to = from.getNeibour(this);
    var directionNew,
        amountInNew = 0,
        amountOutNew = 0;

    if (to) {
      var inInc = from === this.vert0 ? amountIn : -amountOut;
      var outInc = from === this.vert0 ? amountOut : -amountIn;
      var inNew = inPrev + inInc;
      var outNew = outPrev + outInc;
      if (inNew * outNew < 0) console.log('333');
      console.assert(inNew * outNew >= 0);

      if (inNew >= 0) {
        directionNew = true;
        amountInNew = inNew;
        amountOutNew = outNew;
      } else {
        directionNew = false;
        amountInNew = -inNew;
        amountOutNew = -outNew;
      }
    } else console.error('Error 221');

    if (directionNew) {
      var calc = this.pool.calcOutByIn(amountInNew, true).out;
      var res = closeValues(amountOutNew, calc, 1e-6);
      if (!res) console.log("Err 225-1 !!", amountOutNew, calc, Math.abs(calc / amountOutNew - 1));
      return res;
    } else {
      var _calc = this.pool.calcOutByIn(amountOutNew, false).out;

      var _res = closeValues(amountInNew, _calc, 1e-6);

      if (!_res) console.log("Err 225-2!!", amountInNew, _calc, Math.abs(_calc / amountInNew - 1));
      return _res;
    }
  };

  _proto.applySwap = function applySwap(from) {
    var _this = this;

    console.assert(this.amountInPrevious * this.amountOutPrevious >= 0);
    var inPrev = this.direction ? this.amountInPrevious : -this.amountInPrevious;
    var outPrev = this.direction ? this.amountOutPrevious : -this.amountOutPrevious;
    var to = from.getNeibour(this);

    if (to) {
      var inInc = from === this.vert0 ? from.bestIncome : -to.bestIncome;
      var outInc = from === this.vert0 ? to.bestIncome : -from.bestIncome;
      var inNew = inPrev + inInc;
      var outNew = outPrev + outInc;
      console.assert(inNew * outNew >= 0);

      if (inNew >= 0) {
        this.direction = true;
        this.amountInPrevious = inNew;
        this.amountOutPrevious = outNew;
      } else {
        this.direction = false;
        this.amountInPrevious = -inNew;
        this.amountOutPrevious = -outNew;
      }
    } else console.error("Error 221");

    this.spentGas = this.spentGasNew;
    ASSERT(function () {
      if (_this.direction) return closeValues(_this.amountOutPrevious, _this.pool.calcOutByIn(_this.amountInPrevious, _this.direction).out, 1e-6);else {
        return closeValues(_this.amountInPrevious, _this.pool.calcOutByIn(_this.amountOutPrevious, _this.direction).out, 1e-6);
      }
    }, "Error 225");
  };

  return Edge;
}();
var Vertice = /*#__PURE__*/function () {
  function Vertice(t) {
    this.token = t;
    this.edges = [];
    this.price = 0;
    this.gasPrice = 0;
    this.bestIncome = 0;
    this.gasSpent = 0;
    this.bestTotal = 0;
    this.bestSource = undefined;
    this.checkLine = -1;
  }

  var _proto2 = Vertice.prototype;

  _proto2.cleanTmpData = function cleanTmpData() {
    this.bestIncome = 0;
    this.gasSpent = 0;
    this.bestTotal = 0;
    this.bestSource = undefined;
    this.checkLine = -1;
  };

  _proto2.getNeibour = function getNeibour(e) {
    if (!e) return;
    return e.vert0 === this ? e.vert1 : e.vert0;
  };

  _proto2.getOutputEdges = function getOutputEdges() {
    var _this2 = this;

    return this.edges.filter(function (e) {
      if (!e.canBeUsed) return false;
      if (e.amountInPrevious === 0) return false;
      if (e.direction !== (e.vert0 === _this2)) return false;
      return true;
    });
  };

  _proto2.getInputEdges = function getInputEdges() {
    var _this3 = this;

    return this.edges.filter(function (e) {
      if (!e.canBeUsed) return false;
      if (e.amountInPrevious === 0) return false;
      if (e.direction === (e.vert0 === _this3)) return false;
      return true;
    });
  };

  return Vertice;
}();
var Graph = /*#__PURE__*/function () {
  function Graph(pools, baseToken, gasPrice) {
    var _this4 = this;

    this.vertices = [];
    this.edges = [];
    this.tokens = new Map();
    pools.forEach(function (p) {
      var v0 = _this4.getOrCreateVertice(p.token0);

      var v1 = _this4.getOrCreateVertice(p.token1);

      var edge = new Edge(p, v0, v1);
      v0.edges.push(edge);
      v1.edges.push(edge);

      _this4.edges.push(edge);
    });
    var baseVert = this.tokens.get(baseToken.address);

    if (baseVert) {
      this.setPricesStable(baseVert, 1, gasPrice);
    }
  }

  var _proto3 = Graph.prototype;

  _proto3.cleanTmpData = function cleanTmpData() {
    this.edges.forEach(function (e) {
      return e.cleanTmpData();
    });
    this.vertices.forEach(function (v) {
      return v.cleanTmpData();
    });
  } // Set prices by greedy algorithm
  ;

  _proto3.setPricesStable = function setPricesStable(from, price, gasPrice) {
    this.vertices.forEach(function (v) {
      return v.price = 0;
    }); // initialization

    from.price = price;
    from.gasPrice = gasPrice;
    var edgeValues = new Map();

    var value = function value(e) {
      return edgeValues.get(e);
    };

    function addVertice(v) {
      var newEdges = v.edges.filter(function (e) {
        var _v$getNeibour;

        return ((_v$getNeibour = v.getNeibour(e)) == null ? void 0 : _v$getNeibour.price) == 0;
      });
      newEdges.forEach(function (e) {
        return edgeValues.set(e, v.price * parseInt(e.reserve(from).toString()));
      });
      newEdges.sort(function (e1, e2) {
        return value(e1) - value(e2);
      });
      var res = [];

      while (nextEdges.length && newEdges.length) {
        if (value(nextEdges[0]) < value(newEdges[0])) res.push(nextEdges.shift());else res.push(newEdges.shift());
      }

      nextEdges = [].concat(res, nextEdges, newEdges);
    }

    var nextEdges = [];
    addVertice(from);

    while (nextEdges.length > 0) {
      var bestEdge = nextEdges.pop();

      var _ref = bestEdge.vert1.price !== 0 ? [bestEdge.vert1, bestEdge.vert0] : [bestEdge.vert0, bestEdge.vert1],
          vFrom = _ref[0],
          vTo = _ref[1];

      if (vTo.price !== 0) continue;
      var p = bestEdge.pool.calcCurrentPriceWithoutFee(vFrom === bestEdge.vert1);
      vTo.price = vFrom.price * p;
      vTo.gasPrice = vFrom.gasPrice / p;
      addVertice(vTo);
    }
  } // Set prices by search in depth
  ;

  _proto3.setPrices = function setPrices(from, price, gasPrice) {
    var _this5 = this;

    if (from.price !== 0) return;
    from.price = price;
    from.gasPrice = gasPrice;
    var edges = from.edges.map(function (e) {
      return [e, parseInt(e.reserve(from).toString())];
    }).sort(function (_ref2, _ref3) {
      var r1 = _ref2[1];
      var r2 = _ref3[1];
      return r2 - r1;
    });
    edges.forEach(function (_ref4) {
      var e = _ref4[0];
      var v = e.vert0 === from ? e.vert1 : e.vert0;
      if (v.price !== 0) return;
      var p = e.pool.calcCurrentPriceWithoutFee(from === e.vert1);

      _this5.setPrices(v, price * p, gasPrice / p);
    });
  };

  _proto3.getOrCreateVertice = function getOrCreateVertice(token) {
    var vert = this.tokens.get(token.address);
    if (vert) return vert;
    vert = new Vertice(token);
    this.vertices.push(vert);
    this.tokens.set(token.address, vert);
    return vert;
  }
  /*exportPath(from: RToken, to: RToken) {
       const fromVert = this.tokens.get(from) as Vertice
    const toVert = this.tokens.get(to) as Vertice
    const initValue = (fromVert.bestIncome * fromVert.price) / toVert.price
       const route = new Set<Edge>()
    for (let v = toVert; v !== fromVert; v = v.getNeibour(v.bestSource) as Vertice) {
      if (v.bestSource) route.add(v.bestSource)
    }
       function edgeStyle(e: Edge) {
      const finish = e.vert1.bestSource === e
      const start = e.vert0.bestSource === e
      let label
      if (e.bestEdgeIncome === -1) label = 'label: "low_liq"'
      if (e.bestEdgeIncome !== 0) label = `label: "${print((e.bestEdgeIncome / initValue - 1) * 100, 3)}%"`
      const edgeValue = route.has(e) ? 'value: 2' : undefined
      let arrow
      if (finish && start) arrow = 'arrows: "from,to"'
      if (finish) arrow = 'arrows: "to"'
      if (start) arrow = 'arrows: "from"'
      return ['', label, edgeValue, arrow].filter((a) => a !== undefined).join(', ')
    }
       function print(n: number, digits: number) {
      let out
      if (n === 0) out = '0'
      else {
        const n0 = n > 0 ? n : -n
        const shift = digits - Math.ceil(Math.log(n0) / Math.LN10)
        if (shift <= 0) out = `${Math.round(n0)}`
        else {
          const mult = Math.pow(10, shift)
          out = `${Math.round(n0 * mult) / mult}`
        }
        if (n < 0) out = -out
      }
      return out
    }
       function nodeLabel(v: Vertice) {
      const value = (v.bestIncome * v.price) / toVert.price
      const income = `${print(value, 3)}`
      const total = `${print(v.bestTotal, 3)}`
      // const income = `${print((value/initValue-1)*100, 3)}%`
      // const total = `${print((v.bestTotal/initValue-1)*100, 3)}%`
      const checkLine = v.checkLine === -1 ? undefined : `${v.checkLine}`
      return [checkLine, income, total].filter((a) => a !== undefined).join(':')
    }
       const nodes = `var nodes = new vis.DataSet([
      ${this.vertices.map((t) => `{ id: ${t.token.name}, label: "${nodeLabel(t)}"}`).join(',\n\t\t')}
    ]);\n`
    const edges = `var edges = new vis.DataSet([
      ${this.edges
        .map((p) => `{ from: ${p.vert0.token.name}, to: ${p.vert1.token.name}${edgeStyle(p)}}`)
        .join(',\n\t\t')}
    ]);\n`
    const data = `var data = {
        nodes: nodes,
        edges: edges,
    };\n`
       // TODO: This should be removed, this pacakge will not be installable on a client while this remains.
    const fs = require("fs");
    fs.writeFileSync(
      "D:/Info/Notes/GraphVisualization/data.js",
      nodes + edges + data
    );
  }*/
  ;

  _proto3.findBestPathExactIn = function findBestPathExactIn(from, to, amountIn, _gasPrice) {
    var start = this.tokens.get(from.address);
    var finish = this.tokens.get(to.address);
    if (!start || !finish) return;
    var gasPrice = _gasPrice !== undefined ? _gasPrice : finish.gasPrice;
    this.edges.forEach(function (e) {
      e.bestEdgeIncome = 0;
      e.spentGasNew = 0;
    });
    this.vertices.forEach(function (v) {
      v.bestIncome = 0;
      v.gasSpent = 0;
      v.bestTotal = 0;
      v.bestSource = undefined;
      v.checkLine = -1;
    });
    start.bestIncome = amountIn;
    start.bestTotal = amountIn;
    var processedVert = new Set();
    var nextVertList = [start]; // TODO: Use sorted Set!

    var checkLine = 0;

    var _loop = function _loop() {
      var closestVert = void 0;
      var closestTotal = void 0;
      var closestPosition = 0;
      nextVertList.forEach(function (v, i) {
        if (closestTotal === undefined || v.bestTotal > closestTotal) {
          closestTotal = v.bestTotal;
          closestVert = v;
          closestPosition = i;
        }
      });
      if (!closestVert) return {
        v: void 0
      };
      closestVert.checkLine = checkLine++;

      if (closestVert === finish) {
        var bestPath = [];

        for (var v = finish; (_v = v) != null && _v.bestSource; v = v.getNeibour(v.bestSource)) {
          var _v;

          bestPath.unshift(v.bestSource);
        }

        return {
          v: {
            path: bestPath,
            output: finish.bestIncome,
            gasSpent: finish.gasSpent,
            totalOutput: finish.bestTotal
          }
        };
      }

      nextVertList.splice(closestPosition, 1);
      closestVert.edges.forEach(function (e) {
        var v2 = closestVert === e.vert0 ? e.vert1 : e.vert0;
        if (processedVert.has(v2)) return;
        var newIncome, gas;

        try {
          var _e$calcOutput = e.calcOutput(closestVert, closestVert.bestIncome),
              out = _e$calcOutput.out,
              gasSpent = _e$calcOutput.gasSpent;

          if (!isFinite(out) || !isFinite(gasSpent)) // Math errors protection
            return;
          newIncome = out;
          gas = gasSpent;
        } catch (e) {
          // Any arithmetic error or out-of-liquidity
          return;
        }

        if (e.checkMinimalLiquidityExceededAfterSwap(closestVert, newIncome)) {
          e.bestEdgeIncome = -1;
          return;
        }

        var newGasSpent = closestVert.gasSpent + gas;
        var price = v2.price / finish.price;
        var newTotal = newIncome * price - newGasSpent * gasPrice;
        console.assert(e.bestEdgeIncome === 0, "Error 373");
        e.bestEdgeIncome = newIncome * price;
        e.spentGasNew = e.spentGas + gas;
        if (!v2.bestSource) nextVertList.push(v2);

        if (!v2.bestSource || newTotal > v2.bestTotal) {
          v2.bestIncome = newIncome;
          v2.gasSpent = newGasSpent;
          v2.bestTotal = newTotal;
          v2.bestSource = e;
        }
      });
      processedVert.add(closestVert);
    };

    for (;;) {
      var _ret = _loop();

      if (typeof _ret === "object") return _ret.v;
    }
  };

  _proto3.findBestPathExactOut = function findBestPathExactOut(from, to, amountOut, _gasPrice) {
    var start = this.tokens.get(to.address);
    var finish = this.tokens.get(from.address);
    if (!start || !finish) return;
    var gasPrice = _gasPrice !== undefined ? _gasPrice : finish.gasPrice;
    this.edges.forEach(function (e) {
      e.bestEdgeIncome = 0;
      e.spentGasNew = 0;
    });
    this.vertices.forEach(function (v) {
      v.bestIncome = 0;
      v.gasSpent = 0;
      v.bestTotal = 0;
      v.bestSource = undefined;
      v.checkLine = -1;
    });
    start.bestIncome = amountOut;
    start.bestTotal = amountOut;
    var processedVert = new Set();
    var nextVertList = [start]; // TODO: Use sorted Set!

    var checkLine = 0;

    var _loop2 = function _loop2() {
      var closestVert = void 0;
      var closestTotal = void 0;
      var closestPosition = 0;
      nextVertList.forEach(function (v, i) {
        if (closestTotal === undefined || v.bestTotal < closestTotal) {
          closestTotal = v.bestTotal;
          closestVert = v;
          closestPosition = i;
        }
      });
      if (!closestVert) return {
        v: void 0
      };
      closestVert.checkLine = checkLine++;

      if (closestVert === finish) {
        var bestPath = [];

        for (var v = finish; (_v2 = v) != null && _v2.bestSource; v = v.getNeibour(v.bestSource)) {
          var _v2;

          bestPath.push(v.bestSource);
        }

        return {
          v: {
            path: bestPath,
            input: finish.bestIncome,
            gasSpent: finish.gasSpent,
            totalInput: finish.bestTotal
          }
        };
      }

      nextVertList.splice(closestPosition, 1);
      closestVert.edges.forEach(function (e) {
        var v2 = closestVert === e.vert0 ? e.vert1 : e.vert0;
        if (processedVert.has(v2)) return;
        var newIncome, gas;

        try {
          var _e$calcInput = e.calcInput(closestVert, closestVert.bestIncome),
              inp = _e$calcInput.inp,
              gasSpent = _e$calcInput.gasSpent;

          if (!isFinite(inp) || !isFinite(gasSpent)) // Math errors protection
            return;
          if (inp < 0) return; // No enouph liquidity in the pool

          newIncome = inp;
          gas = gasSpent;
        } catch (e) {
          // Any arithmetic error or out-of-liquidity
          return;
        }

        var newGasSpent = closestVert.gasSpent + gas;
        var price = v2.price / finish.price;
        var newTotal = newIncome * price + newGasSpent * gasPrice;
        console.assert(e.bestEdgeIncome === 0, "Error 373");
        e.bestEdgeIncome = newIncome * price;
        e.spentGasNew = e.spentGas + gas;
        if (!v2.bestSource) nextVertList.push(v2);

        if (!v2.bestSource || newTotal < v2.bestTotal) {
          v2.bestIncome = newIncome;
          v2.gasSpent = newGasSpent;
          v2.bestTotal = newTotal;
          v2.bestSource = e;
        }
      });
      processedVert.add(closestVert);
    };

    for (;;) {
      var _ret2 = _loop2();

      if (typeof _ret2 === "object") return _ret2.v;
    }
  };

  _proto3.addPath = function addPath(from, to, path) {
    var _this6 = this;

    var _from = from;
    path.forEach(function (e) {
      if (_from) {
        e.applySwap(_from);
        _from = _from.getNeibour(e);
      } else {
        console.error('Unexpected 315');
      }
    });
    ASSERT(function () {
      var res = _this6.vertices.every(function (v) {
        var total = 0;
        var totalModule = 0;
        v.edges.forEach(function (e) {
          if (e.vert0 === v) {
            if (e.direction) {
              total -= e.amountInPrevious;
            } else {
              total += e.amountInPrevious;
            }

            totalModule += e.amountInPrevious;
          } else {
            if (e.direction) {
              total += e.amountOutPrevious;
            } else {
              total -= e.amountOutPrevious;
            }

            totalModule += e.amountOutPrevious;
          }
        });
        if (v === from) return total <= 0;
        if (v === to) return total >= 0;
        if (totalModule === 0) return total === 0;
        return Math.abs(total / totalModule) < 1e10;
      });

      return res;
    }, 'Error 290');
  };

  _proto3.getPrimaryPriceForPath = function getPrimaryPriceForPath(from, path) {
    var p = 1;
    var prevToken = from;
    path.forEach(function (edge) {
      var direction = edge.vert0 === prevToken;
      var edgePrice = edge.pool.calcCurrentPriceWithoutFee(direction);
      p *= edgePrice;
      prevToken = prevToken.getNeibour(edge);
    });
    return p;
  };

  _proto3.findBestRouteExactIn = function findBestRouteExactIn(from, to, amountIn, mode) {
    var routeValues = [];

    if (Array.isArray(mode)) {
      var sum = mode.reduce(function (a, b) {
        return a + b;
      }, 0);
      routeValues = mode.map(function (e) {
        return e / sum;
      });
    } else {
      for (var i = 0; i < mode; ++i) {
        routeValues.push(1 / mode);
      }
    }

    this.edges.forEach(function (e) {
      e.amountInPrevious = 0;
      e.amountOutPrevious = 0;
      e.direction = true;
    });
    var output = 0;
    var gasSpentInit = 0; //let totalOutput = 0

    var totalrouted = 0;
    var primaryPrice;
    var step;

    for (step = 0; step < routeValues.length; ++step) {
      var p = this.findBestPathExactIn(from, to, amountIn * routeValues[step]);

      if (!p) {
        break;
      } else {
        output += p.output;
        gasSpentInit += p.gasSpent; //totalOutput += p.totalOutput

        this.addPath(this.tokens.get(from.address), this.tokens.get(to.address), p.path);
        totalrouted += routeValues[step];

        if (step === 0) {
          primaryPrice = this.getPrimaryPriceForPath(this.tokens.get(from.address), p.path);
        }
      }
    }

    if (step == 0) return {
      status: RouteStatus.NoWay,
      fromToken: from,
      toToken: to,
      amountIn: 0,
      amountInBN: BigNumber.from(0),
      amountOut: 0,
      amountOutBN: BigNumber.from(0),
      legs: [],
      gasSpent: 0,
      totalAmountOut: 0,
      totalAmountOutBN: BigNumber.from(0)
    };
    var status;
    if (step < routeValues.length) status = RouteStatus.Partial;else status = RouteStatus.Success;
    var fromVert = this.tokens.get(from.address);
    var toVert = this.tokens.get(to.address);

    var _this$getRouteLegs = this.getRouteLegs(fromVert, toVert),
        legs = _this$getRouteLegs.legs,
        gasSpent = _this$getRouteLegs.gasSpent,
        topologyWasChanged = _this$getRouteLegs.topologyWasChanged;

    console.assert(gasSpent <= gasSpentInit, 'Internal Error 491');

    if (topologyWasChanged) {
      output = this.calcLegsAmountOut(legs, amountIn);
    }

    var swapPrice, priceImpact;

    try {
      swapPrice = output / amountIn;
      priceImpact = primaryPrice !== undefined ? 1 - swapPrice / primaryPrice : undefined;
    } catch (e) {
      /* skip division by 0 errors*/
    }

    return {
      status: status,
      fromToken: from,
      toToken: to,
      primaryPrice: primaryPrice,
      swapPrice: swapPrice,
      priceImpact: priceImpact,
      amountIn: amountIn * totalrouted,
      amountInBN: getBigNumber(amountIn * totalrouted),
      amountOut: output,
      amountOutBN: getBigNumber(output),
      legs: legs,
      gasSpent: gasSpent,
      totalAmountOut: output - gasSpent * toVert.gasPrice,
      totalAmountOutBN: getBigNumber(output - gasSpent * toVert.gasPrice)
    };
  };

  _proto3.findBestRouteExactOut = function findBestRouteExactOut(from, to, amountOut, mode) {
    var routeValues = [];

    if (Array.isArray(mode)) {
      var sum = mode.reduce(function (a, b) {
        return a + b;
      }, 0);
      routeValues = mode.map(function (e) {
        return e / sum;
      });
    } else {
      for (var i = 0; i < mode; ++i) {
        routeValues.push(1 / mode);
      }
    }

    this.edges.forEach(function (e) {
      e.amountInPrevious = 0;
      e.amountOutPrevious = 0;
      e.direction = true;
    });
    var input = 0;
    var gasSpentInit = 0; //let totalOutput = 0

    var totalrouted = 0;
    var primaryPrice;
    var step;

    for (step = 0; step < routeValues.length; ++step) {
      var p = this.findBestPathExactOut(from, to, amountOut * routeValues[step]);

      if (!p) {
        break;
      } else {
        input += p.input;
        gasSpentInit += p.gasSpent; //totalOutput += p.totalOutput

        this.addPath(this.tokens.get(from.address), this.tokens.get(to.address), p.path);
        totalrouted += routeValues[step];

        if (step === 0) {
          primaryPrice = this.getPrimaryPriceForPath(this.tokens.get(from.address), p.path);
        }
      }
    }

    if (step == 0) return {
      status: RouteStatus.NoWay,
      fromToken: from,
      toToken: to,
      amountIn: 0,
      amountInBN: BigNumber.from(0),
      amountOut: 0,
      amountOutBN: BigNumber.from(0),
      legs: [],
      gasSpent: 0,
      totalAmountOut: 0,
      totalAmountOutBN: BigNumber.from(0)
    };
    var status;
    if (step < routeValues.length) status = RouteStatus.Partial;else status = RouteStatus.Success;
    var fromVert = this.tokens.get(from.address);
    var toVert = this.tokens.get(to.address);

    var _this$getRouteLegs2 = this.getRouteLegs(fromVert, toVert),
        legs = _this$getRouteLegs2.legs,
        gasSpent = _this$getRouteLegs2.gasSpent,
        topologyWasChanged = _this$getRouteLegs2.topologyWasChanged;

    console.assert(gasSpent <= gasSpentInit, 'Internal Error 491');

    if (topologyWasChanged) {
      input = this.calcLegsAmountIn(legs, amountOut); ///
    }

    var swapPrice, priceImpact;

    try {
      swapPrice = amountOut / input;
      priceImpact = primaryPrice !== undefined ? 1 - swapPrice / primaryPrice : undefined;
    } catch (e) {
      /* skip division by 0 errors*/
    }

    return {
      status: status,
      fromToken: from,
      toToken: to,
      primaryPrice: primaryPrice,
      swapPrice: swapPrice,
      priceImpact: priceImpact,
      amountIn: input,
      amountInBN: getBigNumber(input),
      amountOut: amountOut * totalrouted,
      amountOutBN: getBigNumber(amountOut * totalrouted),
      legs: legs,
      gasSpent: gasSpent,
      totalAmountOut: amountOut - gasSpent * toVert.gasPrice,
      totalAmountOutBN: getBigNumber(amountOut - gasSpent * toVert.gasPrice)
    };
  };

  _proto3.getRouteLegs = function getRouteLegs(from, to) {
    var _this7 = this;

    var _this$cleanTopology = this.cleanTopology(from, to),
        vertices = _this$cleanTopology.vertices,
        topologyWasChanged = _this$cleanTopology.topologyWasChanged;

    var legs = [];
    var gasSpent = 0;
    vertices.forEach(function (n) {
      var outEdges = n.getOutputEdges().map(function (e) {
        var from = _this7.edgeFrom(e);

        return from ? [e, from.vert, from.amount] : [e];
      });
      var outAmount = outEdges.reduce(function (a, b) {
        return a + b[2];
      }, 0);
      if (outAmount <= 0) return;
      var total = outAmount;
      outEdges.forEach(function (e, i) {
        var p = e[2];
        var quantity = i + 1 === outEdges.length ? 1 : p / outAmount;
        var edge = e[0];
        legs.push({
          poolAddress: edge.pool.address,
          poolFee: edge.pool.fee,
          tokenFrom: n.token,
          tokenTo: n.getNeibour(edge).token,
          assumedAmountIn: edge.direction ? edge.amountInPrevious : edge.amountOutPrevious,
          assumedAmountOut: edge.direction ? edge.amountOutPrevious : edge.amountInPrevious,
          swapPortion: quantity,
          absolutePortion: p / total
        });
        gasSpent += e[0].pool.swapGasCost;
        outAmount -= p;
      });
      console.assert(outAmount / total < 1e-12, 'Error 281');
    });
    return {
      legs: legs,
      gasSpent: gasSpent,
      topologyWasChanged: topologyWasChanged
    };
  };

  _proto3.edgeFrom = function edgeFrom(e) {
    if (e.amountInPrevious === 0) return undefined;
    return e.direction ? {
      vert: e.vert0,
      amount: e.amountInPrevious
    } : {
      vert: e.vert1,
      amount: e.amountOutPrevious
    };
  } // TODO: make full test coverage!
  ;

  _proto3.calcLegsAmountOut = function calcLegsAmountOut(legs, amountIn) {
    var _this8 = this;

    var amounts = new Map();
    amounts.set(legs[0].tokenFrom.address, amountIn);
    legs.forEach(function (l) {
      var vert = _this8.tokens.get(l.tokenFrom.address);

      console.assert(vert !== undefined, "Internal Error 570");
      var edge = vert.edges.find(function (e) {
        return e.pool.address === l.poolAddress;
      });
      console.assert(edge !== undefined, "Internel Error 569");
      var pool = edge.pool;
      var direction = vert === edge.vert0;
      var inputTotal = amounts.get(l.tokenFrom.address);
      console.assert(inputTotal !== undefined, "Internal Error 564");
      var input = inputTotal * l.swapPortion;
      amounts.set(l.tokenFrom.address, inputTotal - input);
      var output = pool.calcOutByIn(input, direction).out;
      var vertNext = vert.getNeibour(edge);
      var prevAmount = amounts.get(vertNext.token.address);
      amounts.set(vertNext.token.address, (prevAmount || 0) + output);
    });
    return amounts.get(legs[legs.length - 1].tokenTo.address) || 0;
  } // TODO: make full test coverage!
  ;

  _proto3.calcLegsAmountIn = function calcLegsAmountIn(legs, amountOut) {
    var _this9 = this;

    var totalOutputAssumed = new Map();
    legs.forEach(function (l) {
      var prevValue = totalOutputAssumed.get(l.tokenFrom.address) || 0;
      totalOutputAssumed.set(l.tokenFrom.address, prevValue + l.assumedAmountOut);
    });
    var amounts = new Map();
    amounts.set(legs[legs.length - 1].tokenTo.address, amountOut);

    var _loop3 = function _loop3(i) {
      var l = legs[i];

      var vert = _this9.tokens.get(l.tokenTo.address);

      console.assert(vert !== undefined, "Internal Error 884");
      var edge = vert.edges.find(function (e) {
        return e.pool.address === l.poolAddress;
      });
      console.assert(edge !== undefined, "Internel Error 888");
      var pool = edge.pool;
      var direction = vert === edge.vert1;
      var outputTotal = amounts.get(l.tokenTo.address);
      console.assert(outputTotal !== undefined, "Internal Error 893");
      var totalAssumed = totalOutputAssumed.get(l.tokenFrom.address);
      console.assert(totalAssumed !== undefined, "Internal Error 903");
      var output = outputTotal * l.assumedAmountOut / totalAssumed;
      var input = pool.calcInByOut(output, direction).inp;
      var vertNext = vert.getNeibour(edge);
      var prevAmount = amounts.get(vertNext.token.address);
      amounts.set(vertNext.token.address, (prevAmount || 0) + input);
    };

    for (var i = legs.length - 1; i >= 0; --i) {
      _loop3(i);
    }
    return amounts.get(legs[0].tokenFrom.address) || 0;
  } // removes all cycles if there are any, then removes all dead end could appear after cycle removing
  // Returns clean result topologically sorted
  ;

  _proto3.cleanTopology = function cleanTopology(from, to) {
    var topologyWasChanged = false;
    var result = this.topologySort(from, to);

    if (result.status !== 2) {
      topologyWasChanged = true;
      console.assert(result.status === 0, 'Internal Error 554');

      while (result.status === 0) {
        this.removeWeakestEdge(result.vertices);
        result = this.topologySort(from, to);
      }

      if (result.status === 3) {
        this.removeDeadEnds(result.vertices);
        result = this.topologySort(from, to);
      }

      console.assert(result.status === 2, 'Internal Error 563');
      if (result.status !== 2) return {
        vertices: [],
        topologyWasChanged: topologyWasChanged
      };
    }

    return {
      vertices: result.vertices,
      topologyWasChanged: topologyWasChanged
    };
  };

  _proto3.removeDeadEnds = function removeDeadEnds(verts) {
    verts.forEach(function (v) {
      v.getInputEdges().forEach(function (e) {
        e.canBeUsed = false;
      });
    });
  };

  _proto3.removeWeakestEdge = function removeWeakestEdge(verts) {
    var minVert, minVertNext;
    var minOutput = Number.MAX_VALUE;
    verts.forEach(function (v1, i) {
      var v2 = i === 0 ? verts[verts.length - 1] : verts[i - 1];
      var out = 0;
      v1.getOutputEdges().forEach(function (e) {
        if (v1.getNeibour(e) !== v2) return;
        out += e.direction ? e.amountOutPrevious : e.amountInPrevious;
      });

      if (out < minOutput) {
        minVert = v1;
        minVertNext = v2;
        minOutput = out;
      }
    }); // @ts-ignore

    minVert.getOutputEdges().forEach(function (e) {
      if (minVert.getNeibour(e) !== minVertNext) return;
      e.canBeUsed = false;
    });
  } // topological sort
  // if there is a cycle - returns [0, <List of envolved vertices in the cycle>]
  // if there are no cycles but deadends- returns [3, <List of all envolved deadend vertices>]
  // if there are no cycles or deadends- returns [2, <List of all envolved vertices topologically sorted>]
  ;

  _proto3.topologySort = function topologySort(from, to) {
    // undefined or 0 - not processed, 1 - in process, 2 - finished, 3 - dedend
    var vertState = new Map();
    var vertsFinished = [];
    var foundCycle = [];
    var foundDeadEndVerts = []; // 0 - cycle was found and created, return
    // 1 - during cycle creating
    // 2 - vertex is processed ok
    // 3 - dead end vertex

    function topSortRecursive(current) {
      var state = vertState.get(current);
      if (state === 2 || state === 3) return state;

      if (state === 1) {
        console.assert(foundCycle.length == 0, 'Internal Error 566');
        foundCycle.push(current);
        return 1;
      }

      vertState.set(current, 1);
      var successors2Exist = false;
      var outEdges = current.getOutputEdges();

      for (var i = 0; i < outEdges.length; ++i) {
        var e = outEdges[i];

        var _res2 = topSortRecursive(current.getNeibour(e));

        if (_res2 === 0) return 0;

        if (_res2 === 1) {
          if (foundCycle[0] === current) return 0;else {
            foundCycle.push(current);
            return 1;
          }
        }

        if (_res2 === 2) successors2Exist = true; // Ok successors
      }

      if (successors2Exist) {
        console.assert(current !== to, 'Internal Error 589');
        vertsFinished.push(current);
        vertState.set(current, 2);
        return 2;
      } else {
        if (current !== to) {
          foundDeadEndVerts.push(current);
          vertState.set(current, 3);
          return 3;
        }

        vertsFinished.push(current);
        vertState.set(current, 2);
        return 2;
      }
    }

    var res = topSortRecursive(from);
    if (res === 0) return {
      status: 0,
      vertices: foundCycle
    };
    if (foundDeadEndVerts.length) return {
      status: 3,
      vertices: foundDeadEndVerts
    };
    ASSERT(function () {
      if (vertsFinished[0] !== to) return false;
      if (vertsFinished[vertsFinished.length - 1] !== from) return false;
      return true;
    }, 'Internal Error 614');
    if (res === 2) return {
      status: 2,
      vertices: vertsFinished.reverse()
    };
    console.assert(true, 'Internal Error 612');
    return {
      status: 1,
      vertices: []
    };
  };

  return Graph;
}();

function calcPriceImactWithoutFee(route) {
  if (route.primaryPrice === undefined || route.swapPrice === undefined) {
    return undefined;
  } else {
    var oneMinusCombinedFee = 1;
    route.legs.forEach(function (l) {
      return oneMinusCombinedFee *= 1 - l.poolFee;
    }); //const combinedFee = 1-oneMinusCombinedFee

    return Math.max(0, 1 - route.swapPrice / route.primaryPrice / oneMinusCombinedFee);
  }
}

var defaultFlowNumber = 12;
var maxFlowNumber = 100;

function calcBestFlowNumber(bestSingleRoute, amountIn, gasPriceIn) {
  var priceImpact = calcPriceImactWithoutFee(bestSingleRoute);
  if (!priceImpact) return defaultFlowNumber;
  var bestFlowAmount = Math.sqrt(bestSingleRoute.gasSpent * (gasPriceIn || 0) * amountIn / priceImpact);
  var bestFlowNumber = Math.round(amountIn / bestFlowAmount);
  if (!isFinite(bestFlowNumber)) return defaultFlowNumber;
  var realFlowNumber = Math.max(1, Math.min(bestFlowNumber, maxFlowNumber));
  return realFlowNumber;
}

function getBetterRouteExactIn(route1, route2) {
  if (route1.status == RouteStatus.NoWay) return route2;
  if (route2.status == RouteStatus.NoWay) return route1;
  if (route1.status == RouteStatus.Partial && route2.status == RouteStatus.Success) return route2;
  if (route2.status == RouteStatus.Partial && route1.status == RouteStatus.Success) return route1;
  return route1.totalAmountOut > route2.totalAmountOut ? route1 : route2;
}

function findMultiRouteExactIn(from, to, amountIn, pools, baseToken, gasPrice, flows) {
  if (amountIn instanceof BigNumber) {
    amountIn = parseInt(amountIn.toString());
  }

  var g = new Graph(pools, baseToken, gasPrice);
  var fromV = g.tokens.get(from.address);

  if ((fromV == null ? void 0 : fromV.price) === 0) {
    g.setPricesStable(fromV, 1, 0);
  }

  if (flows !== undefined) return g.findBestRouteExactIn(from, to, amountIn, flows);
  var outSingle = g.findBestRouteExactIn(from, to, amountIn, 1); // Possible optimization of timing
  // if (g.findBestPathExactIn(from, to, amountIn/100 + 10_000, 0)?.gasSpent === 0) return outSingle

  g.cleanTmpData();
  var bestFlowNumber = calcBestFlowNumber(outSingle, amountIn, fromV == null ? void 0 : fromV.gasPrice);
  if (bestFlowNumber === 1) return outSingle;
  var outMulti = g.findBestRouteExactIn(from, to, amountIn, bestFlowNumber);
  return getBetterRouteExactIn(outSingle, outMulti);
}

function getBetterRouteExactOut(route1, route2, gasPrice) {
  if (route1.status == RouteStatus.NoWay) return route2;
  if (route2.status == RouteStatus.NoWay) return route1;
  if (route1.status == RouteStatus.Partial && route2.status == RouteStatus.Success) return route2;
  if (route2.status == RouteStatus.Partial && route1.status == RouteStatus.Success) return route1;
  var totalAmountIn1 = route1.amountIn + route1.gasSpent * gasPrice;
  var totalAmountIn2 = route2.amountIn + route2.gasSpent * gasPrice;
  return totalAmountIn1 < totalAmountIn2 ? route1 : route2;
}

function findMultiRouteExactOut(from, to, amountOut, pools, baseToken, gasPrice, flows) {
  if (amountOut instanceof BigNumber) {
    amountOut = parseInt(amountOut.toString());
  }

  var g = new Graph(pools, baseToken, gasPrice);
  var fromV = g.tokens.get(from.address);

  if ((fromV == null ? void 0 : fromV.price) === 0) {
    g.setPricesStable(fromV, 1, 0);
  }

  if (flows !== undefined) return g.findBestRouteExactOut(from, to, amountOut, flows);
  var inSingle = g.findBestRouteExactOut(from, to, amountOut, 1); // Possible optimization of timing
  // if (g.findBestPathExactOut(from, to, amountOut/100 + 10_000, 0)?.gasSpent === 0) return inSingle

  g.cleanTmpData();
  var bestFlowNumber = calcBestFlowNumber(inSingle, inSingle.amountIn, fromV == null ? void 0 : fromV.gasPrice);
  if (bestFlowNumber === 1) return inSingle;
  var inMulti = g.findBestRouteExactOut(from, to, amountOut, bestFlowNumber);
  return getBetterRouteExactOut(inSingle, inMulti, gasPrice);
}
function findSingleRouteExactIn(from, to, amountIn, pools, baseToken, gasPrice) {
  var g = new Graph(pools, baseToken, gasPrice);
  var fromV = g.tokens.get(from.address);

  if ((fromV == null ? void 0 : fromV.price) === 0) {
    g.setPricesStable(fromV, 1, 0);
  }

  if (amountIn instanceof BigNumber) {
    amountIn = parseInt(amountIn.toString());
  }

  var out = g.findBestRouteExactIn(from, to, amountIn, 1);
  return out;
}
function findSingleRouteExactOut(from, to, amountOut, pools, baseToken, gasPrice) {
  var g = new Graph(pools, baseToken, gasPrice);
  var fromV = g.tokens.get(from.address);

  if ((fromV == null ? void 0 : fromV.price) === 0) {
    g.setPricesStable(fromV, 1, 0);
  }

  if (amountOut instanceof BigNumber) {
    amountOut = parseInt(amountOut.toString());
  }

  var out = g.findBestRouteExactOut(from, to, amountOut, 1);
  return out;
}
function calcTokenPrices(pools, baseToken) {
  var g = new Graph(pools, baseToken, 0);
  var res = new Map();
  g.vertices.forEach(function (v) {
    return res.set(v.token, v.price);
  });
  return res;
}

var PoolType;

(function (PoolType) {
  PoolType["ConstantProduct"] = "ConstantProduct";
  PoolType["Weighted"] = "Weighted";
  PoolType["Hybrid"] = "Hybrid";
  PoolType["ConcentratedLiquidity"] = "ConcentratedLiquidity";
})(PoolType || (PoolType = {}));

var Pool = function Pool(_info) {
  var info = _extends({
    minLiquidity: 1000,
    swapGasCost: 40000
  }, _info);

  this.address = info.address;
  this.token0 = info.token0;
  this.token1 = info.token1;
  this.type = info.type;
  this.reserve0 = info.reserve0;
  this.reserve1 = info.reserve1;
  this.fee = info.fee;
  this.minLiquidity = info.minLiquidity;
  this.swapGasCost = info.swapGasCost;
};
var RConstantProductPool = /*#__PURE__*/function (_Pool) {
  _inheritsLoose(RConstantProductPool, _Pool);

  function RConstantProductPool(info) {
    return _Pool.call(this, _extends({
      type: PoolType.ConstantProduct
    }, info)) || this;
  }

  return RConstantProductPool;
}(Pool);
var RHybridPool = /*#__PURE__*/function (_Pool2) {
  _inheritsLoose(RHybridPool, _Pool2);

  function RHybridPool(info) {
    var _this;

    _this = _Pool2.call(this, _extends({
      type: PoolType.Hybrid
    }, info)) || this;
    _this.A = info.A;
    return _this;
  }

  return RHybridPool;
}(Pool);
var RWeightedPool = /*#__PURE__*/function (_Pool3) {
  _inheritsLoose(RWeightedPool, _Pool3);

  function RWeightedPool(info) {
    var _this2;

    _this2 = _Pool3.call(this, _extends({
      type: PoolType.Weighted
    }, info)) || this;
    _this2.weight0 = info.weight0;
    _this2.weight1 = info.weight1;
    return _this2;
  }

  return RWeightedPool;
}(Pool);
var RConcentratedLiquidityPool = /*#__PURE__*/function (_Pool4) {
  _inheritsLoose(RConcentratedLiquidityPool, _Pool4);

  function RConcentratedLiquidityPool(info) {
    var _this3;

    _this3 = _Pool4.call(this, _extends({
      type: PoolType.ConcentratedLiquidity,
      reserve0: BigNumber.from(0),
      reserve1: BigNumber.from(0)
    }, info)) || this;
    _this3.liquidity = info.liquidity;
    _this3.sqrtPrice = info.sqrtPrice;
    _this3.nearestTick = info.nearestTick;
    _this3.ticks = info.ticks;
    return _this3;
  }

  return RConcentratedLiquidityPool;
}(Pool);

var A_PRECISION = 100;
var DCacheBN = /*#__PURE__*/new Map();
function HybridComputeLiquidity(pool) {
  var res = DCacheBN.get(pool);
  if (res !== undefined) return res;
  var r0 = pool.reserve0;
  var r1 = pool.reserve1;

  if (r0.isZero() && r1.isZero()) {
    DCacheBN.set(pool, BigNumber.from(0));
    return BigNumber.from(0);
  }

  var s = r0.add(r1);
  var nA = BigNumber.from(pool.A * 2);
  var prevD;
  var D = s;

  for (var i = 0; i < 256; i++) {
    var dP = D.mul(D).div(r0).mul(D).div(r1).div(4);
    prevD = D;
    D = nA.mul(s).div(A_PRECISION).add(dP.mul(2)).mul(D).div(nA.div(A_PRECISION).sub(1).mul(D).add(dP.mul(3)));

    if (D.sub(prevD).abs().lte(1)) {
      break;
    }
  }

  DCacheBN.set(pool, D);
  return D;
}
function HybridgetY(pool, x) {
  var D = HybridComputeLiquidity(pool);
  var nA = pool.A * 2;
  var c = D.mul(D).div(x.mul(2)).mul(D).div(nA * 2 / A_PRECISION);
  var b = D.mul(A_PRECISION).div(nA).add(x);
  var yPrev;
  var y = D;

  for (var i = 0; i < 256; i++) {
    yPrev = y;
    y = y.mul(y).add(c).div(y.mul(2).add(b).sub(D));

    if (y.sub(yPrev).abs().lte(1)) {
      break;
    }
  }

  return y;
}
function calcOutByIn(pool, amountIn, direction) {
  if (direction === void 0) {
    direction = true;
  }

  var xBN = direction ? pool.reserve0 : pool.reserve1;
  var yBN = direction ? pool.reserve1 : pool.reserve0;

  switch (pool.type) {
    case PoolType.ConstantProduct:
      {
        var x = parseInt(xBN.toString());
        var y = parseInt(yBN.toString());
        return y * amountIn / (x / (1 - pool.fee) + amountIn);
      }

    case PoolType.Weighted:
      {
        var _x = parseInt(xBN.toString());

        var _y = parseInt(yBN.toString());

        var wPool = pool;
        var weightRatio = direction ? wPool.weight0 / wPool.weight1 : wPool.weight1 / wPool.weight0;
        var actualIn = amountIn * (1 - pool.fee);

        var out = _y * (1 - Math.pow(_x / (_x + actualIn), weightRatio));

        return out;
      }

    case PoolType.Hybrid:
      {
        // const xNew = x + amountIn*(1-pool.fee);
        // const yNew = HybridgetY(pool, xNew);
        // const dy = y - yNew;
        var xNewBN = xBN.add(getBigNumber(amountIn * (1 - pool.fee)));
        var yNewBN = HybridgetY(pool, xNewBN);
        var dy = parseInt(yBN.sub(yNewBN).toString());
        return dy;
      }
  }

  return -1;
}
var OutOfLiquidity = /*#__PURE__*/function (_Error) {
  _inheritsLoose(OutOfLiquidity, _Error);

  function OutOfLiquidity() {
    return _Error.apply(this, arguments) || this;
  }

  return OutOfLiquidity;
}( /*#__PURE__*/_wrapNativeSuper(Error));
function calcInByOut(pool, amountOut, direction) {
  var input = 0;
  var xBN = direction ? pool.reserve0 : pool.reserve1;
  var yBN = direction ? pool.reserve1 : pool.reserve0;

  switch (pool.type) {
    case PoolType.ConstantProduct:
      {
        var x = parseInt(xBN.toString());
        var y = parseInt(yBN.toString());
        input = x * amountOut / (1 - pool.fee) / (y - amountOut);
        break;
      }

    case PoolType.Weighted:
      {
        var _x2 = parseInt(xBN.toString());

        var _y2 = parseInt(yBN.toString());

        var wPool = pool;
        var weightRatio = direction ? wPool.weight0 / wPool.weight1 : wPool.weight1 / wPool.weight0;
        input = _x2 * (1 - pool.fee) * (Math.pow(1 - amountOut / _y2, -weightRatio) - 1);
        break;
      }

    case PoolType.Hybrid:
      {
        var yNewBN = yBN.sub(getBigNumber(amountOut));
        if (yNewBN.lt(1)) // lack of precision
          yNewBN = BigNumber.from(1);
        var xNewBN = HybridgetY(pool, yNewBN);
        input = Math.round(parseInt(xNewBN.sub(xBN).toString()) / (1 - pool.fee)); // const yNew = y - amountOut;
        // const xNew = HybridgetY(pool, yNew);
        // input = (xNew - x)/(1-pool.fee);

        break;
      }

    default:
      console.error('Unknown pool type');
  } // ASSERT(() => {
  //   const amount2 = calcOutByIn(pool, input, direction);
  //   const res = closeValues(amountOut, amount2, 1e-6);
  //   if (!res) console.log("Error 138:", amountOut, amount2, Math.abs(amountOut/amount2 - 1));
  //   return res;
  // });


  if (input < 1) input = 1;
  return input;
}
function calcPrice(pool, amountIn, takeFeeIntoAccount) {
  if (takeFeeIntoAccount === void 0) {
    takeFeeIntoAccount = true;
  }

  var r0 = parseInt(pool.reserve0.toString());
  var r1 = parseInt(pool.reserve1.toString());
  var oneMinusFee = takeFeeIntoAccount ? 1 - pool.fee : 1;

  switch (pool.type) {
    case PoolType.ConstantProduct:
      {
        var x = r0 / oneMinusFee;
        return r1 * x / (x + amountIn) / (x + amountIn);
      }

    case PoolType.Weighted:
      {
        var wPool = pool;
        var weightRatio = wPool.weight0 / wPool.weight1;

        var _x3 = r0 + amountIn * oneMinusFee;

        return r1 * weightRatio * oneMinusFee * Math.pow(r0 / _x3, weightRatio) / _x3;
      }

    case PoolType.Hybrid:
      {
        var hPool = pool;
        var D = parseInt(HybridComputeLiquidity(hPool).toString());
        var A = hPool.A / A_PRECISION;

        var _x4 = r0 + amountIn;

        var b = 4 * A * _x4 + D - 4 * A * D;
        var ac4 = D * D * D / _x4;
        var Ds = Math.sqrt(b * b + 4 * A * ac4);
        var res = (0.5 - (2 * b - ac4 / _x4) / Ds / 4) * oneMinusFee;
        return res;
      }
  }

  return 0;
}

function calcInputByPriceConstantMean(pool, price) {
  var r0 = parseInt(pool.reserve0.toString());
  var r1 = parseInt(pool.reserve1.toString());
  var weightRatio = pool.weight0 / pool.weight1;
  var t = r1 * price * weightRatio * (1 - pool.fee) * Math.pow(r0, weightRatio);
  return (Math.pow(t, 1 / (weightRatio + 1)) - r0) / (1 - pool.fee);
}

function calcInputByPrice(pool, priceEffective, hint) {
  if (hint === void 0) {
    hint = 1;
  }

  switch (pool.type) {
    case PoolType.ConstantProduct:
      {
        var r0 = parseInt(pool.reserve0.toString());
        var r1 = parseInt(pool.reserve1.toString());
        var x = r0 / (1 - pool.fee);
        var res = Math.sqrt(r1 * x * priceEffective) - x;
        return res;
      }

    case PoolType.Weighted:
      {
        var _res = calcInputByPriceConstantMean(pool, priceEffective);

        return _res;
      }

    case PoolType.Hybrid:
      {
        return revertPositive(function (x) {
          return 1 / calcPrice(pool, x);
        }, priceEffective, hint);
      }
  }

  return 0;
}

export { ASSERT, CLRPool, CL_MAX_TICK, CL_MIN_TICK, ConstantProductRPool, Edge, Graph, HybridComputeLiquidity, HybridRPool, HybridgetY, OutOfLiquidity, Pool, PoolType, RConcentratedLiquidityPool, RConstantProductPool, RHybridPool, RPool, RWeightedPool, RouteStatus, TYPICAL_MINIMAL_LIQUIDITY, TYPICAL_SWAP_GAS_COST, Vertice, calcInByOut, calcInputByPrice, calcOutByIn, calcPrice, calcSquareEquation, calcTokenPrices, closeValues, findMultiRouteExactIn, findMultiRouteExactOut, findSingleRouteExactIn, findSingleRouteExactOut, getBigNumber, revertPositive };
//# sourceMappingURL=castle.esm.js.map
