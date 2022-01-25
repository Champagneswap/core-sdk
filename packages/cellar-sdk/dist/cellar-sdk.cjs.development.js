'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var coreSdk = require('@champagneswap/core-sdk');

function toAmount(token, shares) {
  return coreSdk.JSBI.GT(token.base, 0) ? coreSdk.JSBI.divide(coreSdk.JSBI.multiply(shares, token.elastic), token.base) : coreSdk.ZERO;
}
function toShare(token, amount) {
  return coreSdk.JSBI.GT(token.elastic, 0) ? coreSdk.JSBI.divide(coreSdk.JSBI.multiply(amount, token.base), token.elastic) : coreSdk.ZERO;
}

exports.toAmount = toAmount;
exports.toShare = toShare;
//# sourceMappingURL=cellar-sdk.cjs.development.js.map
