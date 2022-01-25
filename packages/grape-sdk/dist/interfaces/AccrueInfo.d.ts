import { JSBI } from '@champagneswap/core-sdk';
export interface AccrueInfo {
    interestPerSecond: JSBI;
    lastAccrued: JSBI;
    feesEarnedFraction: JSBI;
}
