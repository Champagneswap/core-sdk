'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var coreSdk = require('@champagneswap/core-sdk');
var JSBI = _interopDefault(require('jsbi'));
var EXPORTS = _interopDefault(require('@sushiswap/trident/exports/all.json'));
var constantProductPoolArtifact = _interopDefault(require('@sushiswap/trident/artifacts/contracts/pool/ConstantProductPool.sol/ConstantProductPool.json'));
var solidity = require('@ethersproject/solidity');
var abi = require('@ethersproject/abi');
var address = require('@ethersproject/address');
var invariant = _interopDefault(require('tiny-invariant'));
var castle = require('@champagneswap/castle');
var bignumber = require('@ethersproject/bignumber');
var hybridPoolArtifact = _interopDefault(require('@sushiswap/trident/artifacts/contracts/pool/HybridPool.sol/HybridPool.json'));

var _ROUTER_ADDRESS;
var A_PRECISION = /*#__PURE__*/coreSdk.JSBI.BigInt(100);
var MAX_FEE = /*#__PURE__*/coreSdk.JSBI.BigInt(10000);
var ROUTER_ADDRESS = (_ROUTER_ADDRESS = {}, _ROUTER_ADDRESS[coreSdk.ChainId.KOVAN] = '0x473Ef9B3e01E34b242b13F875b123E53208C88FA', _ROUTER_ADDRESS[coreSdk.ChainId.RINKEBY] = '0x473Ef9B3e01E34b242b13F875b123E53208C88FA', _ROUTER_ADDRESS);

var Pool = function Pool() {};

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

// Fee - Tiers TBD

(function (Fee) {
  Fee[Fee["LOW"] = 1] = "LOW";
  Fee[Fee["MEDIUM"] = 5] = "MEDIUM";
  Fee[Fee["DEFAULT"] = 30] = "DEFAULT";
  Fee[Fee["HIGH"] = 100] = "HIGH";
})(exports.Fee || (exports.Fee = {}));

var computePoolInitCodeHash = function computePoolInitCodeHash(_ref) {
  var creationCode = _ref.creationCode,
      deployData = _ref.deployData,
      masterDeployerAddress = _ref.masterDeployerAddress;
  return solidity.keccak256(['bytes'], [solidity.pack(['bytes', 'bytes'], [creationCode, abi.defaultAbiCoder.encode(['bytes', 'address'], [deployData, masterDeployerAddress])])]);
};

var computeConstantProductPoolAddress = function computeConstantProductPoolAddress(_ref) {
  var factoryAddress = _ref.factoryAddress,
      tokenA = _ref.tokenA,
      tokenB = _ref.tokenB,
      fee = _ref.fee,
      twap = _ref.twap;

  // does safety checks
  var _ref2 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
      token0 = _ref2[0],
      token1 = _ref2[1];

  var deployData = abi.defaultAbiCoder.encode(['address', 'address', 'uint256', 'bool'], [].concat([token0.address, token1.address].sort(), [fee, twap])); // Compute init code hash based off the bytecode, deployData & masterDeployerAddress

  var CONSTANT_PRODUCT_POOL_INIT_CODE_HASH = computePoolInitCodeHash({
    creationCode: constantProductPoolArtifact.bytecode,
    deployData: deployData,
    masterDeployerAddress: EXPORTS[coreSdk.ChainId.KOVAN][coreSdk.ChainKey.KOVAN].contracts.MasterDeployer.address
  }); // Compute pool address

  return address.getCreate2Address(factoryAddress, solidity.keccak256(['bytes'], [deployData]), CONSTANT_PRODUCT_POOL_INIT_CODE_HASH);
};

var ConstantProductPool = /*#__PURE__*/function () {
  function ConstantProductPool(currencyAmountA, currencyAmountB, fee, twap) {
    if (fee === void 0) {
      fee = exports.Fee.DEFAULT;
    }

    if (twap === void 0) {
      twap = true;
    }

    var currencyAmounts = currencyAmountA.currency.sortsBefore(currencyAmountB.currency) // does safety checks
    ? [currencyAmountA, currencyAmountB] : [currencyAmountB, currencyAmountA];
    this.liquidityToken = new coreSdk.Token(currencyAmounts[0].currency.chainId, ConstantProductPool.getAddress(currencyAmounts[0].currency, currencyAmounts[1].currency, fee, twap), 18, 'SLP', 'Sushi LP Token');
    this.fee = fee;
    this.twap = twap;
    this.tokenAmounts = currencyAmounts;
  }

  ConstantProductPool.getAddress = function getAddress(tokenA, tokenB, fee, twap) {
    if (fee === void 0) {
      fee = exports.Fee.DEFAULT;
    }

    if (twap === void 0) {
      twap = true;
    }

    return computeConstantProductPoolAddress({
      factoryAddress: EXPORTS[coreSdk.ChainId.KOVAN][coreSdk.ChainKey.KOVAN].contracts.ConstantProductPoolFactory.address,
      tokenA: tokenA,
      tokenB: tokenB,
      fee: fee,
      twap: twap
    });
  }
  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  ;

  var _proto = ConstantProductPool.prototype;

  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  ;

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  _proto.priceOf = function priceOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  /**
   * Returns the chain ID of the tokens in the pair.
   */
  ;

  _proto.reserveOf = function reserveOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getOutputAmount = function getOutputAmount(inputAmount) {
    !this.involvesToken(inputAmount.currency) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.quotient, coreSdk.ZERO) || JSBI.equal(this.reserve1.quotient, coreSdk.ZERO)) {
      throw new coreSdk.InsufficientReservesError();
    }

    var inputReserve = this.reserveOf(inputAmount.currency);
    var outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var inputAmountWithFee = JSBI.multiply(inputAmount.quotient, JSBI.subtract(MAX_FEE, JSBI.BigInt(this.fee)));
    var numerator = JSBI.multiply(inputAmountWithFee, outputReserve.quotient);
    var denominator = JSBI.add(JSBI.multiply(inputReserve.quotient, MAX_FEE), inputAmountWithFee);
    var outputAmount = coreSdk.CurrencyAmount.fromRawAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.divide(numerator, denominator));

    if (JSBI.equal(outputAmount.quotient, coreSdk.ZERO)) {
      throw new coreSdk.InsufficientInputAmountError();
    }

    return [outputAmount, new ConstantProductPool(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.fee, this.twap)];
  };

  _proto.getInputAmount = function getInputAmount(outputAmount) {
    !this.involvesToken(outputAmount.currency) ?  invariant(false, 'TOKEN')  : void 0;

    if (JSBI.equal(this.reserve0.quotient, coreSdk.ZERO) || JSBI.equal(this.reserve1.quotient, coreSdk.ZERO) || JSBI.greaterThanOrEqual(outputAmount.quotient, this.reserveOf(outputAmount.currency).quotient)) {
      throw new coreSdk.InsufficientReservesError();
    }

    var outputReserve = this.reserveOf(outputAmount.currency);
    var inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
    var numerator = JSBI.multiply(JSBI.multiply(inputReserve.quotient, outputAmount.quotient), MAX_FEE);
    var denominator = JSBI.multiply(JSBI.subtract(outputReserve.quotient, outputAmount.quotient), JSBI.subtract(MAX_FEE, JSBI.BigInt(this.fee)));
    var inputAmount = coreSdk.CurrencyAmount.fromRawAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, JSBI.add(JSBI.divide(numerator, denominator), coreSdk.ONE));
    return [inputAmount, new ConstantProductPool(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), this.fee, this.twap)];
  };

  _proto.getNonOptimalMintFee = function getNonOptimalMintFee(amount0, amount1, reserve0, reserve1) {
    if (JSBI.equal(reserve0, coreSdk.ZERO) || JSBI.equal(reserve1, coreSdk.ZERO)) {
      return [coreSdk.ZERO, coreSdk.ZERO];
    }

    var amount1Optimal = JSBI.divide(JSBI.multiply(amount0, reserve1), reserve0);

    if (JSBI.lessThanOrEqual(amount1Optimal, amount1)) {
      return [coreSdk.ZERO, JSBI.divide(JSBI.multiply(JSBI.BigInt(this.fee), JSBI.subtract(amount1, amount1Optimal)), JSBI.multiply(JSBI.BigInt(2), JSBI.BigInt(10000)))];
    } else {
      var amount0Optimal = JSBI.divide(JSBI.multiply(amount1, reserve0), reserve1);
      return [JSBI.divide(JSBI.multiply(JSBI.BigInt(this.fee), JSBI.subtract(amount0, amount0Optimal)), JSBI.multiply(JSBI.BigInt(2), JSBI.BigInt(10000))), coreSdk.ZERO];
    }
  };

  _proto.getMintFee = function getMintFee(reserve0, reserve1, totalSupply) {
    console.log('getMintFee', {
      kLast: this.kLast.toString(),
      computed: coreSdk.sqrt(JSBI.multiply(reserve0, reserve1)).toString(),
      totalSupply: totalSupply.toString()
    });

    if (JSBI.notEqual(this.kLast, coreSdk.ZERO)) {
      var computed = coreSdk.sqrt(JSBI.multiply(reserve0, reserve1));

      if (JSBI.greaterThan(computed, this.kLast)) {
        var liquidity = JSBI.divide(JSBI.divide(JSBI.multiply(JSBI.multiply(totalSupply, JSBI.subtract(computed, this.kLast)), JSBI.BigInt(5)), computed), JSBI.BigInt(10000));
        console.log({
          kLast: this.kLast.toString(),
          computed: computed.toString(),
          liquidity: liquidity.toString()
        });

        if (JSBI.notEqual(liquidity, coreSdk.ZERO)) {
          return liquidity;
        }
      }
    }

    return coreSdk.ZERO;
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0;
    var liquidity; // Expected balances after minting

    var balance0 = JSBI.add(tokenAmounts[0].quotient, this.reserve0.quotient);
    var balance1 = JSBI.add(tokenAmounts[1].quotient, this.reserve1.quotient);
    var computed = coreSdk.sqrt(JSBI.multiply(balance0, balance1));

    if (JSBI.equal(totalSupply.quotient, coreSdk.ZERO)) {
      liquidity = JSBI.subtract(computed, coreSdk.MINIMUM_LIQUIDITY);
    } else {
      var _this$getNonOptimalMi = this.getNonOptimalMintFee(tokenAmounts[0].quotient, tokenAmounts[1].quotient, this.reserve0.quotient, this.reserve1.quotient),
          fee0 = _this$getNonOptimalMi[0],
          fee1 = _this$getNonOptimalMi[1];

      var reserve0 = JSBI.add(this.reserve0.quotient, fee0);
      var reserve1 = JSBI.add(this.reserve1.quotient, fee1);
      var k = coreSdk.sqrt(JSBI.multiply(reserve0, reserve1));
      var mintFee = this.getMintFee(reserve0, reserve1, totalSupply.quotient);
      liquidity = JSBI.divide(JSBI.multiply(JSBI.subtract(computed, k), JSBI.add(totalSupply.quotient, mintFee)), k);
    }

    if (!JSBI.greaterThan(liquidity, coreSdk.ZERO)) {
      throw new coreSdk.InsufficientInputAmountError();
    }

    return coreSdk.CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  };

  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'TOTAL_SUPPLY')  : void 0;
    !liquidity.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ?  invariant(false, 'LIQUIDITY')  : void 0;
    return coreSdk.CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupply.quotient));
  };

  _proto.getAmountOut = function getAmountOut(amountIn, reserveAmountIn, reserveAmountOut) {
    var amountInWithFee = JSBI.multiply(amountIn, JSBI.subtract(MAX_FEE, JSBI.BigInt(this.fee)));
    return JSBI.divide(JSBI.multiply(amountInWithFee, reserveAmountOut), JSBI.add(JSBI.multiply(reserveAmountIn, MAX_FEE), amountInWithFee));
  };

  _proto.getLiquidityValueSingleToken = function getLiquidityValueSingleToken(token, totalSupply, liquidity) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'TOTAL_SUPPLY')  : void 0;
    !liquidity.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ?  invariant(false, 'LIQUIDITY')  : void 0;

    var _totalSupply = JSBI.add(totalSupply.quotient, this.getMintFee(this.reserve0.quotient, this.reserve1.quotient, totalSupply.quotient));

    var amount0 = JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserve0.quotient), _totalSupply);
    var amount1 = JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserve1.quotient), _totalSupply);

    if (token === this.token1) {
      return coreSdk.CurrencyAmount.fromRawAmount(token, JSBI.add(amount1, this.getAmountOut(amount0, JSBI.subtract(this.reserve0.quotient, amount0), JSBI.subtract(this.reserve1.quotient, amount1))));
    }

    return coreSdk.CurrencyAmount.fromRawAmount(token, JSBI.add(amount0, this.getAmountOut(amount1, JSBI.subtract(this.reserve1.quotient, amount1), JSBI.subtract(this.reserve0.quotient, amount0))));
  };

  _createClass(ConstantProductPool, [{
    key: "token0Price",
    get: function get() {
      var result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
      return new coreSdk.Price(this.token0, this.token1, result.denominator, result.numerator);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */

  }, {
    key: "token1Price",
    get: function get() {
      var result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
      return new coreSdk.Price(this.token1, this.token0, result.denominator, result.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].currency;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].currency;
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }, {
    key: "assets",
    get: function get() {
      return [this.tokenAmounts[0].currency, this.tokenAmounts[1].currency];
    }
  }, {
    key: "reserves",
    get: function get() {
      return [this.reserve0, this.reserve1];
    }
  }, {
    key: "kLast",
    get: function get() {
      return coreSdk.sqrt(this.reserve0.multiply(this.reserve1).quotient);
    }
  }]);

  return ConstantProductPool;
}();

function convertPoolOrPairtoRPool(pool) {
  if (pool instanceof ConstantProductPool) {
    return new castle.ConstantProductRPool(pool.liquidityToken.address, pool.assets[0].wrapped, pool.assets[1].wrapped, pool.fee / 10000, bignumber.BigNumber.from(pool.reserves[0].quotient.toString()), bignumber.BigNumber.from(pool.reserves[1].quotient.toString()));
  } else if (pool instanceof coreSdk.Pair) {
    return new castle.ConstantProductRPool(pool.liquidityToken.address, pool.token0, pool.token1, exports.Fee.DEFAULT / 10000, bignumber.BigNumber.from(pool.reserve0.quotient.toString()), bignumber.BigNumber.from(pool.reserve1.quotient.toString()));
  } else {
    throw new Error('Unsupported type of pool !!!');
  }
}

function calcTokenPrices(pools, baseToken) {
  var map = castle.calcTokenPrices(pools.map(convertPoolOrPairtoRPool), baseToken);
  var res = {};
  Array.from(map.entries()).forEach(function (_ref) {
    var token = _ref[0],
        price = _ref[1];
    return res[token.address] = new coreSdk.Price(token, baseToken, 1e18, Math.round(price * 1e18));
  });
  return res;
}

function computeHybridLiquidity(reserve0, reserve1, a) {
  if (coreSdk.JSBI.equal(reserve0, coreSdk.ZERO) && coreSdk.JSBI.equal(reserve1, coreSdk.ZERO)) {
    return coreSdk.ZERO;
  }

  var s = coreSdk.JSBI.add(reserve0, reserve1);
  var N_A = coreSdk.JSBI.multiply(a, coreSdk.JSBI.BigInt(2));
  var prevD;
  var D = s;

  for (var i = 0; i < 256; i++) {
    var dP = coreSdk.JSBI.divide(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(D, D), reserve0), D), reserve1), coreSdk.JSBI.BigInt(4));
    prevD = D;
    D = coreSdk.JSBI.divide(coreSdk.JSBI.multiply(coreSdk.JSBI.add(coreSdk.JSBI.divide(coreSdk.JSBI.multiply(N_A, s), A_PRECISION), coreSdk.JSBI.multiply(dP, coreSdk.JSBI.BigInt(2))), D), coreSdk.JSBI.add(coreSdk.JSBI.multiply(coreSdk.JSBI.subtract(coreSdk.JSBI.divide(N_A, A_PRECISION), coreSdk.JSBI.BigInt(1)), D), coreSdk.JSBI.multiply(dP, coreSdk.JSBI.BigInt(3))));

    if (coreSdk.JSBI.lessThanOrEqual(coreSdk.difference(D, prevD), coreSdk.ONE)) {
      break;
    }
  }

  return D;
}

var computeHybridPoolAddress = function computeHybridPoolAddress(_ref) {
  var factoryAddress = _ref.factoryAddress,
      tokenA = _ref.tokenA,
      tokenB = _ref.tokenB,
      fee = _ref.fee,
      a = _ref.a;

  // does safety checks
  var _ref2 = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA],
      token0 = _ref2[0],
      token1 = _ref2[1];

  var deployData = abi.defaultAbiCoder.encode(['address', 'address', 'uint256', 'uint256'], [].concat([token0.address, token1.address].sort(), [fee, a])); // Compute init code hash based off the bytecode, deployData & masterDeployerAddress

  var HYBRID_POOL_INIT_CODE_HASH = computePoolInitCodeHash({
    creationCode: hybridPoolArtifact.bytecode,
    deployData: deployData,
    masterDeployerAddress: EXPORTS[coreSdk.ChainId.KOVAN][coreSdk.ChainKey.KOVAN].contracts.MasterDeployer.address
  }); // Compute pool address

  return address.getCreate2Address(factoryAddress, solidity.keccak256(['bytes'], [deployData]), HYBRID_POOL_INIT_CODE_HASH);
};

function convertTinesSingleRouteToLegacyRoute(route, allPairs, input, output) {
  var pairHash = new Map();
  allPairs.forEach(function (p) {
    return pairHash.set(p.liquidityToken.address, p);
  });
  var pairs = route.legs.map(function (l) {
    var pair = pairHash.get(l.poolAddress);

    if (pair === undefined) {
      throw new Error('Internal Error 119');
    }

    return pair;
  });
  return new coreSdk.Route(pairs, input, output);
}

function findMultiRouteExactIn(from, to, amountIn, pools, baseToken, gasPrice) {
  return castle.findMultiRouteExactIn(from, to, amountIn, pools.map(convertPoolOrPairtoRPool), baseToken, gasPrice);
}

function findMultiRouteExactOut(from, to, amountIn, pools, baseToken, gasPrice) {
  return castle.findMultiRouteExactOut(from, to, amountIn, pools.map(convertPoolOrPairtoRPool), baseToken, gasPrice);
}

function findSingleRouteExactIn(from, to, amountIn, pools, baseToken, gasPrice) {
  return castle.findSingleRouteExactIn(from, to, amountIn, pools.map(convertPoolOrPairtoRPool), baseToken, gasPrice);
}

function findSingleRouteExactOut(from, to, amountIn, pools, baseToken, gasPrice) {
  return castle.findSingleRouteExactOut(from, to, amountIn, pools.map(convertPoolOrPairtoRPool), baseToken, gasPrice);
}

(function (PoolState) {
  PoolState[PoolState["LOADING"] = 0] = "LOADING";
  PoolState[PoolState["NOT_EXISTS"] = 1] = "NOT_EXISTS";
  PoolState[PoolState["EXISTS"] = 2] = "EXISTS";
  PoolState[PoolState["INVALID"] = 3] = "INVALID";
})(exports.PoolState || (exports.PoolState = {}));

(function (RouteType) {
  RouteType["SinglePool"] = "SinglePool";
  RouteType["SinglePath"] = "SinglePath";
  RouteType["ComplexPath"] = "ComplexPath";
  RouteType["Unknown"] = "Unknown";
})(exports.RouteType || (exports.RouteType = {}));

var HybridPool = /*#__PURE__*/function () {
  function HybridPool(currencyAmountA, currencyAmountB, fee, a) {
    if (fee === void 0) {
      fee = exports.Fee.DEFAULT;
    }

    if (a === void 0) {
      a = A_PRECISION;
    }

    var currencyAmounts = currencyAmountA.currency.sortsBefore(currencyAmountB.currency) // does safety checks
    ? [currencyAmountA, currencyAmountB] : [currencyAmountB, currencyAmountA];
    this.liquidityToken = new coreSdk.Token(currencyAmounts[0].currency.chainId, HybridPool.getAddress(currencyAmounts[0].currency, currencyAmounts[1].currency, fee, a), 18, 'SLP', 'Sushi LP Token');
    this.fee = fee;
    this.a = a;
    this.tokenAmounts = currencyAmounts;
  }

  HybridPool.getAddress = function getAddress(tokenA, tokenB, fee, a) {
    if (fee === void 0) {
      fee = exports.Fee.DEFAULT;
    }

    if (a === void 0) {
      a = A_PRECISION;
    }

    return computeHybridPoolAddress({
      factoryAddress: EXPORTS[coreSdk.ChainId.KOVAN][coreSdk.ChainKey.KOVAN].contracts.HybridPoolFactory.address,
      tokenA: tokenA,
      tokenB: tokenB,
      fee: fee,
      a: a
    });
  }
  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  ;

  var _proto = HybridPool.prototype;

  _proto.involvesToken = function involvesToken(token) {
    return token.equals(this.token0) || token.equals(this.token1);
  }
  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  ;

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  _proto.priceOf = function priceOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.token0Price : this.token1Price;
  }
  /**
   * Returns the chain ID of the tokens in the pair.
   */
  ;

  _proto.reserveOf = function reserveOf(token) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    return token.equals(this.token0) ? this.reserve0 : this.reserve1;
  };

  _proto.getNonOptimalMintFee = function getNonOptimalMintFee(amount0, amount1, reserve0, reserve1) {
    if (JSBI.equal(reserve0, coreSdk.ZERO) || JSBI.equal(reserve1, coreSdk.ZERO)) {
      return [coreSdk.ZERO, coreSdk.ZERO];
    }

    var amount1Optimal = JSBI.divide(JSBI.multiply(amount0, reserve1), reserve0);

    if (JSBI.lessThanOrEqual(amount1Optimal, amount1)) {
      return [coreSdk.ZERO, JSBI.divide(JSBI.multiply(JSBI.BigInt(this.fee), JSBI.subtract(amount1, amount1Optimal)), JSBI.multiply(JSBI.BigInt(2), JSBI.BigInt(10000)))];
    } else {
      var amount0Optimal = JSBI.divide(JSBI.multiply(amount1, reserve0), reserve1);
      return [JSBI.divide(JSBI.multiply(JSBI.BigInt(this.fee), JSBI.subtract(amount0, amount0Optimal)), JSBI.multiply(JSBI.BigInt(2), JSBI.BigInt(10000))), coreSdk.ZERO];
    }
  };

  _proto.getLiquidityMinted = function getLiquidityMinted(totalSupply, tokenAmountA, tokenAmountB) {
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    var tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
    ? [tokenAmountA, tokenAmountB] : [tokenAmountB, tokenAmountA];
    !(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1)) ?  invariant(false, 'TOKEN')  : void 0; // Expected balances after minting

    var balance0 = JSBI.add(tokenAmounts[0].quotient, this.reserve0.quotient);
    var balance1 = JSBI.add(tokenAmounts[1].quotient, this.reserve1.quotient);

    var _this$getNonOptimalMi = this.getNonOptimalMintFee(tokenAmounts[0].quotient, tokenAmounts[1].quotient, this.reserve0.quotient, this.reserve1.quotient),
        fee0 = _this$getNonOptimalMi[0],
        fee1 = _this$getNonOptimalMi[1];

    var liquidity;
    var newLiquidity = computeHybridLiquidity(JSBI.subtract(balance0, fee0), JSBI.subtract(balance1, fee1), this.a);

    if (JSBI.equal(totalSupply.quotient, coreSdk.ZERO)) {
      liquidity = JSBI.subtract(newLiquidity, JSBI.BigInt(1000));
    } else {
      var oldLiquidity = computeHybridLiquidity(this.reserve0.quotient, this.reserve1.quotient, this.a);
      liquidity = JSBI.divide(JSBI.multiply(JSBI.subtract(newLiquidity, oldLiquidity), totalSupply.quotient), oldLiquidity); // console.log({
      //   oldLiquidity: oldLiquidity.toString(),
      // })
    } // console.log({
    //   tokenAmountA: tokenAmountA.quotient.toString(),
    //   tokenAmountB: tokenAmountB.quotient.toString(),
    //   totalSupply: totalSupply.quotient.toString(),
    //   newLiquidity: newLiquidity.toString(),
    //   liquidity: liquidity.toString(),
    // })


    if (!JSBI.greaterThan(liquidity, coreSdk.ZERO)) {
      throw new coreSdk.InsufficientInputAmountError();
    }

    return coreSdk.CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity);
  };

  _proto.getLiquidityValue = function getLiquidityValue(token, totalSupply, liquidity) {
    !this.involvesToken(token) ?  invariant(false, 'TOKEN')  : void 0;
    !totalSupply.currency.equals(this.liquidityToken) ?  invariant(false, 'TOTAL_SUPPLY')  : void 0;
    !liquidity.currency.equals(this.liquidityToken) ?  invariant(false, 'LIQUIDITY')  : void 0;
    !JSBI.lessThanOrEqual(liquidity.quotient, totalSupply.quotient) ?  invariant(false, 'LIQUIDITY')  : void 0;
    return coreSdk.CurrencyAmount.fromRawAmount(token, JSBI.divide(JSBI.multiply(liquidity.quotient, this.reserveOf(token).quotient), totalSupply.quotient));
  };

  _createClass(HybridPool, [{
    key: "token0Price",
    get: function get() {
      var result = this.tokenAmounts[1].divide(this.tokenAmounts[0]);
      return new coreSdk.Price(this.token0, this.token1, result.denominator, result.numerator);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */

  }, {
    key: "token1Price",
    get: function get() {
      var result = this.tokenAmounts[0].divide(this.tokenAmounts[1]);
      return new coreSdk.Price(this.token1, this.token0, result.denominator, result.numerator);
    }
  }, {
    key: "chainId",
    get: function get() {
      return this.token0.chainId;
    }
  }, {
    key: "token0",
    get: function get() {
      return this.tokenAmounts[0].currency;
    }
  }, {
    key: "token1",
    get: function get() {
      return this.tokenAmounts[1].currency;
    }
  }, {
    key: "assets",
    get: function get() {
      return [this.tokenAmounts[0].currency, this.tokenAmounts[1].currency];
    }
  }, {
    key: "reserves",
    get: function get() {
      return [this.reserve0, this.reserve1];
    }
  }, {
    key: "reserve0",
    get: function get() {
      return this.tokenAmounts[0];
    }
  }, {
    key: "reserve1",
    get: function get() {
      return this.tokenAmounts[1];
    }
  }]);

  return HybridPool;
}();

/**
 * Represents a trade executed against a list of pools.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */

var Trade = /*#__PURE__*/function () {
  function Trade(route, // amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>,
  tradeType) {
    this.route = route;
    this.tradeType = tradeType;
    var amountIn = coreSdk.CurrencyAmount.fromRawAmount(route.fromToken, route.amountIn.toFixed(0));
    var amountOut = coreSdk.CurrencyAmount.fromRawAmount(route.toToken, route.amountOut.toFixed(0));

    if (tradeType === coreSdk.TradeType.EXACT_INPUT) {
      this.inputAmount = coreSdk.CurrencyAmount.fromFractionalAmount(amountIn.currency, amountIn.numerator, amountIn.denominator);
      this.outputAmount = coreSdk.CurrencyAmount.fromFractionalAmount(amountOut.currency, amountOut.numerator, amountOut.denominator);
    } else {
      this.inputAmount = coreSdk.CurrencyAmount.fromFractionalAmount(amountIn.currency, amountOut.numerator, amountOut.denominator);
      this.outputAmount = coreSdk.CurrencyAmount.fromFractionalAmount(amountOut.currency, amountIn.numerator, amountIn.denominator);
    }

    this.executionPrice = new coreSdk.Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient); // this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount)

    this.priceImpact = new coreSdk.Percent(coreSdk.JSBI.BigInt(0), coreSdk.JSBI.BigInt(10000));
  }
  /**
   * Constructs an exact in trade with the given amount in and route
   * @param route route of the exact in trade
   * @param amountIn the amount being passed in
   */


  Trade.exactIn = function exactIn(route) {
    return new Trade(route, coreSdk.TradeType.EXACT_INPUT);
  }
  /**
   * Constructs an exact out trade with the given amount out and route
   * @param route route of the exact out trade
   * @param amountOut the amount returned by the trade
   */
  ;

  Trade.exactOut = function exactOut(route) {
    return new Trade(route, coreSdk.TradeType.EXACT_OUTPUT);
  }
  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  var _proto = Trade.prototype;

  _proto.minimumAmountOut = function minimumAmountOut(slippageTolerance) {
    !!slippageTolerance.lessThan(coreSdk.ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === coreSdk.TradeType.EXACT_OUTPUT) {
      return this.outputAmount;
    } else {
      var slippageAdjustedAmountOut = new coreSdk.Fraction(coreSdk.ONE).add(slippageTolerance).invert().multiply(this.outputAmount.quotient).quotient;
      return coreSdk.CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
    }
  }
  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  ;

  _proto.maximumAmountIn = function maximumAmountIn(slippageTolerance) {
    !!slippageTolerance.lessThan(coreSdk.ZERO) ?  invariant(false, 'SLIPPAGE_TOLERANCE')  : void 0;

    if (this.tradeType === coreSdk.TradeType.EXACT_INPUT) {
      return this.inputAmount;
    } else {
      var slippageAdjustedAmountIn = new coreSdk.Fraction(coreSdk.ONE).add(slippageTolerance).multiply(this.inputAmount.quotient).quotient;
      return coreSdk.CurrencyAmount.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
    }
  };

  Trade.bestTradeExactIn = function bestTradeExactIn(route, currencyAmountIn, currencyOut) {
    return new Trade(_extends({}, route, {
      fromToken: currencyAmountIn.currency,
      toToken: currencyOut
    }), coreSdk.TradeType.EXACT_INPUT);
  };

  Trade.bestTradeExactOut = function bestTradeExactOut(route, currencyIn, currencyAmountOut) {
    return new Trade(_extends({}, route, {
      fromToken: currencyIn,
      toToken: currencyAmountOut.currency
    }), coreSdk.TradeType.EXACT_OUTPUT);
  };

  return Trade;
}();

exports.A_PRECISION = A_PRECISION;
exports.ConstantProductPool = ConstantProductPool;
exports.HybridPool = HybridPool;
exports.MAX_FEE = MAX_FEE;
exports.Pool = Pool;
exports.ROUTER_ADDRESS = ROUTER_ADDRESS;
exports.Trade = Trade;
exports.calcTokenPrices = calcTokenPrices;
exports.computeConstantProductPoolAddress = computeConstantProductPoolAddress;
exports.computeHybridLiquidity = computeHybridLiquidity;
exports.computeHybridPoolAddress = computeHybridPoolAddress;
exports.computePoolInitCodeHash = computePoolInitCodeHash;
exports.convertPoolOrPairtoRPool = convertPoolOrPairtoRPool;
exports.convertTinesSingleRouteToLegacyRoute = convertTinesSingleRouteToLegacyRoute;
exports.findMultiRouteExactIn = findMultiRouteExactIn;
exports.findMultiRouteExactOut = findMultiRouteExactOut;
exports.findSingleRouteExactIn = findSingleRouteExactIn;
exports.findSingleRouteExactOut = findSingleRouteExactOut;
//# sourceMappingURL=spray-sdk.cjs.development.js.map
