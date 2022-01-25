import { ZERO, JSBI, Rebase } from '@champagneswap/core-sdk'

export function toAmount(token: Rebase, shares: JSBI): JSBI {
  return JSBI.GT(token.base, 0) ? JSBI.divide(JSBI.multiply(shares, token.elastic), token.base) : ZERO
}

export function toShare(token: Rebase, amount: JSBI): JSBI {
  return JSBI.GT(token.elastic, 0) ? JSBI.divide(JSBI.multiply(amount, token.base), token.elastic) : ZERO
}
