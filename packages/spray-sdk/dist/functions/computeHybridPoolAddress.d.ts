import { JSBI, Token } from '@champagneswap/core-sdk';
import { Fee } from '../enums/Fee';
export declare const computeHybridPoolAddress: ({ factoryAddress, tokenA, tokenB, fee, a, }: {
    factoryAddress: string;
    tokenA: Token;
    tokenB: Token;
    fee: Fee;
    a: JSBI;
}) => string;
