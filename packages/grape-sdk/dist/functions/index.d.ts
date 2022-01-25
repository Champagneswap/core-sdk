import { BigNumber } from '@ethersproject/bignumber';
import { KashiMediumRiskLendingPair } from '../entities';
import { JSBI } from '@champagneswap/core-sdk';
export declare function accrue(pair: KashiMediumRiskLendingPair, amount: JSBI, includePrincipal?: boolean): JSBI;
export declare function accrueTotalAssetWithFee(pair: KashiMediumRiskLendingPair): {
    elastic: JSBI;
    base: JSBI;
};
export declare function interestAccrue(pair: KashiMediumRiskLendingPair, interest: JSBI): JSBI;
export declare function takeFee(amount: JSBI): JSBI;
export declare function addBorrowFee(amount: BigNumber): BigNumber;
export { computePairAddress } from './computePairAddress';
