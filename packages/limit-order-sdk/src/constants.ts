import { AddressMap, ChainId } from '@sushiswap/core-sdk'

export const LAMBDA_URL = 'https://9epjsvomc4.execute-api.us-east-1.amazonaws.com/dev'

export const SOCKET_URL = 'wss://hfimt374ge.execute-api.us-east-1.amazonaws.com/dev'

export const STOP_LIMIT_ORDER_ADDRESS: AddressMap = {
  [ChainId.KOVAN]: '0xce9365dB1C99897f04B3923C03ba9a5f80E8DB87',
  [ChainId.MATIC]: '0x1aDb3Bd86bb01797667eC382a0BC6A9854b4005f',
  [ChainId.AVALANCHE]: '0xf6f9c9DB78AF5791A296c4bF34d59E0236E990E0',
}

export const DEFAULT_RECEIVER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x8C6b2e5B8028825d371E1264f57C5CcaE0fa4D65',
  [ChainId.AVALANCHE]: '0x042c99C84b00f11A08a07AA9752E083261083A57',
}

export const ADVANCED_RECEIVER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xAA6370CD78A61D4e72911268D84bF1Ea6a976b77',
  [ChainId.AVALANCHE]: '0x50995361A1104B2E34d81771B2cf19BA55051C7c',
}
