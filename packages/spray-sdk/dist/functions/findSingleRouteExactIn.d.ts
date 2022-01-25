import { BigNumber } from '@ethersproject/bignumber';
import { Pair, Token } from '@champagneswap/core-sdk';
import { MultiRoute } from '@champagneswap/castle';
import { Pool } from '../entities/Pool';
export declare function findSingleRouteExactIn(from: Token, to: Token, amountIn: BigNumber | number, pools: (Pool | Pair)[], baseToken: Token, gasPrice: number): MultiRoute;
