import { JSBI, Rebase, Token } from '@champagneswap/core-sdk';
import { AccrueInfo } from '../interfaces';
export declare class KashiMediumRiskLendingPair {
    readonly accrueInfo: AccrueInfo;
    readonly collateral: Rebase;
    readonly asset: Rebase;
    readonly totalCollateralShare: JSBI;
    readonly totalAsset: Rebase;
    readonly totalBorrow: Rebase;
    readonly exchangeRate: JSBI;
    readonly oracleExchangeRate: JSBI;
    readonly spotExchangeRate: JSBI;
    readonly userCollateralShare: JSBI;
    readonly userAssetFraction: JSBI;
    readonly userBorrowPart: JSBI;
    static getAddress(collateral: Token, asset: Token, oracle: string, oracleData: string): string;
    constructor(accrueInfo: AccrueInfo, collateral: Rebase, asset: Rebase, totalCollateralShare: JSBI, totalAsset: Rebase, totalBorrow: Rebase, exchangeRate: JSBI, oracleExchangeRate: JSBI, spotExchangeRate: JSBI, userCollateralShare: JSBI, userAssetFraction: JSBI, userBorrowPart: JSBI);
    /**
     * Returns the number of elapsed seconds since the last accrue
     */
    get elapsedSeconds(): JSBI;
    /**
     * Interest per year for borrowers at last accrue, this will apply during the next accrue
     */
    get interestPerYear(): JSBI;
    /**
     * Interest per year for borrowers if accrued was called
     */
    get currentInterestPerYear(): JSBI;
    /**
     * The total collateral in the market (collateral is stable, it doesn't accrue)
     */
    get totalCollateralAmount(): JSBI;
    /**
     * The total assets unborrowed in the market (stable, doesn't accrue)
     */
    get totalAssetAmount(): JSBI;
    /**
     * The total assets borrowed in the market right now
     */
    get currentBorrowAmount(): JSBI;
    /**
     * The total amount of assets, both borrowed and still available right now
     */
    get currentAllAssets(): JSBI;
    /**
     * Current total amount of asset shares
     */
    get currentAllAssetShares(): JSBI;
    /**
     * Current totalAsset with the protocol fee accrued
     */
    get currentTotalAsset(): {
        elastic: JSBI;
        base: JSBI;
    };
    /**
     * The maximum amount of assets available for withdrawal or borrow
     */
    get maxAssetAvailable(): JSBI;
    /**
     * The maximum amount of assets available for withdrawal or borrow in shares
     */
    get maxAssetAvailableFraction(): JSBI;
    /**
     * The overall health of the lending pair
     */
    get marketHealth(): JSBI;
    /**
     * The current utilization in %
     */
    get utilization(): JSBI;
    /**
     * Interest per year received by lenders as of now
     */
    get supplyAPR(): JSBI;
    /**
     * Interest per year received by lenders if accrue was called
     */
    get currentSupplyAPR(): JSBI;
    /**
     * The user's amount of collateral (stable, doesn't accrue)
     */
    get userCollateralAmount(): JSBI;
    /**
     * The user's amount of assets (stable, doesn't accrue)
     */
    get currentUserAssetAmount(): JSBI;
    /**
     * The user's amount borrowed right now
     */
    get currentUserBorrowAmount(): JSBI;
    /**
     * The user's amount of assets that are currently lent
     */
    get currentUserLentAmount(): JSBI;
    /**
     * Value of protocol fees
     */
    get feesEarned(): JSBI;
    /**
     * The user's maximum borrowable amount based on the collateral provided, using all three oracle values
     */
    get maxBorrowable(): {
        minimum: JSBI;
        safe: JSBI;
        possible: JSBI;
        oracle: JSBI;
        spot: JSBI;
        stored: JSBI;
    };
    /**
     * The user's position's health
     */
    get health(): JSBI;
}
