import { JSBI, ChainId, AddressMap } from '@champagneswap/core-sdk'

export const A_PRECISION = JSBI.BigInt(100)
export const MAX_FEE = JSBI.BigInt(10000)

export const ROUTER_ADDRESS: AddressMap = {
  [ChainId.KOVAN]: '0x473Ef9B3e01E34b242b13F875b123E53208C88FA',
  [ChainId.RINKEBY]: '0x473Ef9B3e01E34b242b13F875b123E53208C88FA',
}
