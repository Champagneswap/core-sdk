import { Token } from '@champagneswap/core-sdk';
export declare const computePairAddress: ({ collateral, asset, oracle, oracleData, }: {
    collateral: Token;
    asset: Token;
    oracle: string;
    oracleData: string;
}) => string;
