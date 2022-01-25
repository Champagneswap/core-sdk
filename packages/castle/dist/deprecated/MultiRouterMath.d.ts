import { Pool, RHybridPool } from './MultiRouterTypes';
import { BigNumber } from "@ethersproject/bignumber";
export declare function HybridComputeLiquidity(pool: RHybridPool): BigNumber;
export declare function HybridgetY(pool: RHybridPool, x: BigNumber): BigNumber;
export declare function calcOutByIn(pool: Pool, amountIn: number, direction?: boolean): number;
export declare class OutOfLiquidity extends Error {
}
export declare function calcInByOut(pool: Pool, amountOut: number, direction: boolean): number;
export declare function calcPrice(pool: Pool, amountIn: number, takeFeeIntoAccount?: boolean): number;
export declare function calcInputByPrice(pool: Pool, priceEffective: number, hint?: number): number;
