import { JSBI, ZERO } from '@champagneswap/core-sdk';

function toAmount(token, shares) {
  return JSBI.GT(token.base, 0) ? JSBI.divide(JSBI.multiply(shares, token.elastic), token.base) : ZERO;
}
function toShare(token, amount) {
  return JSBI.GT(token.elastic, 0) ? JSBI.divide(JSBI.multiply(amount, token.base), token.elastic) : ZERO;
}

export { toAmount, toShare };
//# sourceMappingURL=cellar-sdk.esm.js.map
