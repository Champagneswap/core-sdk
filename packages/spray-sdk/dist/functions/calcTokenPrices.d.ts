import { Pair, Price, Token } from '@champagneswap/core-sdk';
import { Pool } from '../entities/Pool';
export declare function calcTokenPrices<T extends Token>(pools: (Pool | Pair)[], baseToken: T): Record<string, Price<Token, T>>;
